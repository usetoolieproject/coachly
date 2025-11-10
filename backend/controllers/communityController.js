import { getSupabaseClient } from '../repositories/supabaseClient.js';
import { v4 as uuidv4 } from 'uuid';


// Get all posts for community (works for both instructors and students)
export const getCommunityPosts = async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    const { category } = req.query;
    let instructorId;

    // If user is instructor, use their instructor ID
    if (req.user.role === 'instructor') {
      instructorId = req.user.instructors[0]?.id;
      if (!instructorId) {
        return res.status(403).json({ error: 'Instructor access required' });
      }
    } 
    // If user is student, find their instructor's community
    else if (req.user.role === 'student') {
      const { data: student, error: studentError } = await supabase
        .from('students')
        .select('instructor_id')
        .eq('user_id', req.user.id)
        .single();

      if (studentError || !student) {
        return res.status(403).json({ error: 'Student must be enrolled in a community' });
      }
      
      instructorId = student.instructor_id;
    } else {
      return res.status(403).json({ error: 'Invalid user role' });
    }

    let query = supabase
      .from('community_posts')
      .select(`
        *,
        users (id, first_name, last_name, role, profile_picture_url),
        community_post_media (*),
        community_comments (
          *,
          users (id, first_name, last_name, role, profile_picture_url),
          community_comment_likes (*)
        ),
        community_likes (*)
      `)
      .eq('instructor_id', instructorId);

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    const { data: posts, error } = await query
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    // Add like counts and user's like status
    const postsWithStats = posts.map(post => ({
      ...post,
      like_count: Math.max(0, post.community_likes?.length || 0),
      user_has_liked: post.community_likes?.some(like => like.user_id === req.user.id) || false,
      comments: post.community_comments?.map(comment => ({
        ...comment,
        like_count: Math.max(0, comment.community_comment_likes?.length || 0),
        user_has_liked: comment.community_comment_likes?.some(like => like.user_id === req.user.id) || false
      })) || []
    }));

    res.json(postsWithStats);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create a new post (works for both instructors and students)
export const createPost = async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    const { content, category = 'general', mediaUrls = [] } = req.body;
    let instructorId;

    // Get instructor ID based on user role
    if (req.user.role === 'instructor') {
      instructorId = req.user.instructors[0]?.id;
      if (!instructorId) {
        return res.status(403).json({ error: 'Instructor access required' });
      }
    } else if (req.user.role === 'student') {
      const { data: student, error: studentError } = await supabase
        .from('students')
        .select('instructor_id')
        .eq('user_id', req.user.id)
        .single();

      if (studentError || !student) {
        return res.status(403).json({ error: 'Student must be enrolled in a community' });
      }
      
      instructorId = student.instructor_id;
    } else {
      return res.status(403).json({ error: 'Invalid user role' });
    }

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Content is required' });
    }

    // Create the post
    const { data: post, error: postError } = await supabase
      .from('community_posts')
      .insert({
        instructor_id: instructorId,
        user_id: req.user.id,
        content: content.trim(),
        category: category
      })
      .select()
      .single();

    if (postError) {
      return res.status(400).json({ error: postError.message });
    }

    // Handle media uploads if any
    if (Array.isArray(mediaUrls) && mediaUrls.length > 0) {
      const mediaInserts = mediaUrls.map(url => ({
        post_id: post.id,
        media_url: url,
        media_type: 'image'
      }));

      const { error: mediaError } = await supabase
        .from('community_post_media')
        .insert(mediaInserts);

      if (mediaError) {
      }
    }

    // Fetch the complete post with relations
    const { data: completePost, error: fetchError } = await supabase
      .from('community_posts')
      .select(`
        *,
        users (id, first_name, last_name, role, profile_picture_url),
        community_post_media (*),
        community_comments (*),
        community_likes (*)
      `)
      .eq('id', post.id)
      .single();

    if (fetchError) {
      return res.status(500).json({ error: fetchError.message });
    }

    res.status(201).json({
      ...completePost,
      like_count: 0,
      user_has_liked: false,
      comments: []
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update post (user can only edit their own posts)
export const updatePost = async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    const { postId } = req.params;
    const { content, category, mediaUrls = [] } = req.body;

    // Check if user owns the post
    const { data: post, error: fetchError } = await supabase
      .from('community_posts')
      .select('user_id')
      .eq('id', postId)
      .single();

    if (fetchError || !post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (post.user_id !== req.user.id) {
      return res.status(403).json({ error: 'You can only edit your own posts' });
    }

    const updateData = { 
      content: content.trim(),
      updated_at: new Date().toISOString()
    };

    if (category) {
      updateData.category = category;
    }

    const { data: updatedPost, error: updateError } = await supabase
      .from('community_posts')
      .update(updateData)
      .eq('id', postId)
      .select()
      .single();

    if (updateError) {
      return res.status(400).json({ error: updateError.message });
    }

    // Handle media updates
    if (mediaUrls !== undefined) {
      // Delete existing media
      const { error: deleteMediaError } = await supabase
        .from('community_post_media')
        .delete()
        .eq('post_id', postId);

      if (deleteMediaError) {
      }

      // Insert new media if any
      if (mediaUrls.length > 0) {
        const mediaInserts = mediaUrls.map(url => ({
          post_id: postId,
          media_url: url,
          media_type: 'image'
        }));

        const { error: insertMediaError } = await supabase
          .from('community_post_media')
          .insert(mediaInserts);

        if (insertMediaError) {
        }
      }
    }

    // Fetch the complete updated post with relations
    const { data: completePost, error: fetchCompleteError } = await supabase
      .from('community_posts')
      .select(`
        *,
        users (id, first_name, last_name, role, profile_picture_url),
        community_post_media (*),
        community_comments (
          *,
          users (id, first_name, last_name, role, profile_picture_url),
          community_comment_likes (*)
        ),
        community_likes (*)
      `)
      .eq('id', postId)
      .single();

    if (fetchCompleteError) {
      return res.status(500).json({ error: fetchCompleteError.message });
    }

    res.json({
      ...completePost,
      like_count: Math.max(0, completePost.community_likes?.length || 0),
      user_has_liked: completePost.community_likes?.some(like => like.user_id === req.user.id) || false,
      comments: completePost.community_comments?.map(comment => ({
        ...comment,
        like_count: Math.max(0, comment.community_comment_likes?.length || 0),
        user_has_liked: comment.community_comment_likes?.some(like => like.user_id === req.user.id) || false
      })) || []
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete post (user can delete their own posts, instructors can delete student posts in their community)
export const deletePost = async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    const { postId } = req.params;

    // Get post details with instructor info
    const { data: post, error: fetchError } = await supabase
      .from('community_posts')
      .select('user_id, instructor_id')
      .eq('id', postId)
      .single();

    if (fetchError || !post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    let canDelete = false;

    // User can delete their own post
    if (post.user_id === req.user.id) {
      canDelete = true;
    }
    // Instructor can delete posts in their community
    else if (req.user.role === 'instructor') {
      const instructorId = req.user.instructors[0]?.id;
      if (instructorId && post.instructor_id === instructorId) {
        canDelete = true;
      }
    }

    if (!canDelete) {
      return res.status(403).json({ error: 'You can only delete your own posts or posts in your community' });
    }

    // Remove related media rows (and attempt to remove storage files) before deleting the post
    const { data: mediaRows, error: mediaFetchError } = await supabase
      .from('community_post_media')
      .select('id, media_url')
      .eq('post_id', postId);

    if (mediaFetchError) {
      return res.status(400).json({ error: mediaFetchError.message });
    }

    if (mediaRows && mediaRows.length > 0) {
      try {
        const bucket = 'community-media';
        const paths = mediaRows
          .map(m => {
            try {
              const parts = (m.media_url || '').split('/community-media/');
              return parts[1] || null;
            } catch {
              return null;
            }
          })
          .filter(Boolean);
        if (paths.length > 0) {
          await supabase.storage.from(bucket).remove(paths);
        }
      } catch (e) {
        // Ignore storage delete errors; continue with DB cleanup
      }

      const { error: mediaDeleteError } = await supabase
        .from('community_post_media')
        .delete()
        .eq('post_id', postId);

      if (mediaDeleteError) {
        return res.status(400).json({ error: mediaDeleteError.message });
      }
    }

    const { error: deleteError } = await supabase
      .from('community_posts')
      .delete()
      .eq('id', postId);

    if (deleteError) {
      return res.status(400).json({ error: deleteError.message });
    }

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create comment (any user can comment)
export const createComment = async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    const { postId } = req.params;
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const { data: comment, error: commentError } = await supabase
      .from('community_comments')
      .insert({
        post_id: postId,
        user_id: req.user.id,
        content: content.trim()
      })
      .select(`
        *,
        users (id, first_name, last_name, role, profile_picture_url),
        community_comment_likes (*)
      `)
      .single();

    if (commentError) {
      return res.status(400).json({ error: commentError.message });
    }

    res.status(201).json({
      ...comment,
      like_count: 0,
      user_has_liked: false
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update comment (only instructors can edit comments, students cannot)
export const updateComment = async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    const { commentId } = req.params;
    const { content } = req.body;

    // Check if user owns the comment
    const { data: comment, error: fetchError } = await supabase
      .from('community_comments')
      .select('user_id')
      .eq('id', commentId)
      .single();

    if (fetchError || !comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (comment.user_id !== req.user.id) {
      return res.status(403).json({ error: 'You can only edit your own comments' });
    }

    const { data: updatedComment, error: updateError } = await supabase
      .from('community_comments')
      .update({ 
        content: content.trim(),
        updated_at: new Date().toISOString()
      })
      .eq('id', commentId)
      .select(`
        *,
        users (id, first_name, last_name, role, profile_picture_url),
        community_comment_likes (*)
      `)
      .single();

    if (updateError) {
      return res.status(400).json({ error: updateError.message });
    }

    res.json({
      ...updatedComment,
      like_count: Math.max(0, updatedComment.community_comment_likes?.length || 0),
      user_has_liked: updatedComment.community_comment_likes?.some(like => like.user_id === req.user.id) || false
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete comment (user can delete their own comments, instructors can delete student comments in their community)
export const deleteComment = async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    const { commentId } = req.params;

    // Get comment details with post and instructor info
    const { data: comment, error: fetchError } = await supabase
      .from('community_comments')
      .select(`
        user_id,
        community_posts!inner(instructor_id)
      `)
      .eq('id', commentId)
      .single();

    if (fetchError || !comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    let canDelete = false;

    // User can delete their own comment
    if (comment.user_id === req.user.id) {
      canDelete = true;
    }
    // Instructor can delete comments in their community
    else if (req.user.role === 'instructor') {
      const instructorId = req.user.instructors[0]?.id;
      if (instructorId && comment.community_posts.instructor_id === instructorId) {
        canDelete = true;
      }
    }

    if (!canDelete) {
      return res.status(403).json({ error: 'You can only delete your own comments or comments in your community' });
    }

    // First remove dependent likes to satisfy FK constraints
    const { error: deleteLikesError } = await supabase
      .from('community_comment_likes')
      .delete()
      .eq('comment_id', commentId);

    if (deleteLikesError) {
      return res.status(400).json({ error: deleteLikesError.message });
    }

    const { error: deleteError } = await supabase
      .from('community_comments')
      .delete()
      .eq('id', commentId);

    if (deleteError) {
      return res.status(400).json({ error: deleteError.message });
    }

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Upload multiple media files (same as before)
export const uploadMedia = async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    const bucket = 'community-media';

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    // Helper to ensure bucket exists (create if missing)
    const ensureBucketExists = async () => {
      try {
        const { data: listData, error: listError } = await supabase.storage.listBuckets();
        if (listError) return; // If listing fails, we'll let upload surface the error
        const exists = (listData || []).some(b => b.name === bucket);
        if (!exists) {
          await supabase.storage.createBucket(bucket, { public: true, fileSizeLimit: 10 * 1024 * 1024 });
        }
      } catch {}
    };

    // Try to create bucket proactively (no-op if exists)
    await ensureBucketExists();

    const uploadFile = async (file) => {
      const fileName = `${uuidv4()}-${file.originalname}`;
      const path = fileName; // flat structure; could be prefixed by user/instructor if needed

      const attemptUpload = async () => {
        return await supabase.storage
          .from(bucket)
          .upload(path, file.buffer, {
            contentType: file.mimetype,
            upsert: false
          });
      };

      let { data, error } = await attemptUpload();
      // If bucket missing, create and retry once
      if (error && (error.status === 400 || error.status === 404 || (error.message || '').toLowerCase().includes('bucket'))) {
        await ensureBucketExists();
        ({ data, error } = await attemptUpload());
      }

      if (error) {
        throw error;
      }

      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(path);

      return { url: urlData.publicUrl, fileName: path };
    };

    const uploadPromises = req.files.map(uploadFile);
    const uploadResults = await Promise.all(uploadPromises);
    res.json({ files: uploadResults });
  } catch (error) {
    res.status(500).json({ error: error?.message || 'Internal server error' });
  }
};

// Like/Unlike a post (same as before)
export const toggleLikePost = async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    const { postId } = req.params;

    // Check if user already liked the post
    const { data: existingLike, error: checkError } = await supabase
      .from('community_likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', req.user.id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      return res.status(500).json({ error: checkError.message });
    }

    if (existingLike) {
      // Unlike the post
      const { error: deleteError } = await supabase
        .from('community_likes')
        .delete()
        .eq('id', existingLike.id);

      if (deleteError) {
        return res.status(400).json({ error: deleteError.message });
      }

      // Get updated count
      const { count } = await supabase
        .from('community_likes')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', postId);

      res.json({ message: 'Post unliked', liked: false, count: Math.max(0, count || 0) });
    } else {
      // Like the post
      const { error: insertError } = await supabase
        .from('community_likes')
        .insert({
          post_id: postId,
          user_id: req.user.id
        });

      if (insertError) {
        return res.status(400).json({ error: insertError.message });
      }

      // Get updated count
      const { count } = await supabase
        .from('community_likes')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', postId);

      res.json({ message: 'Post liked', liked: true, count: count || 1 });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Like/Unlike a comment (same as before)
export const toggleLikeComment = async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    const { commentId } = req.params;

    // Check if user already liked the comment
    const { data: existingLike, error: checkError } = await supabase
      .from('community_comment_likes')
      .select('id')
      .eq('comment_id', commentId)
      .eq('user_id', req.user.id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      return res.status(500).json({ error: checkError.message });
    }

    if (existingLike) {
      // Unlike the comment
      const { error: deleteError } = await supabase
        .from('community_comment_likes')
        .delete()
        .eq('id', existingLike.id);

      if (deleteError) {
        return res.status(400).json({ error: deleteError.message });
      }

      // Get updated count
      const { count } = await supabase
        .from('community_comment_likes')
        .select('*', { count: 'exact', head: true })
        .eq('comment_id', commentId);

      res.json({ message: 'Comment unliked', liked: false, count: Math.max(0, count || 0) });
    } else {
      // Like the comment
      const { error: insertError } = await supabase
        .from('community_comment_likes')
        .insert({
          comment_id: commentId,
          user_id: req.user.id
        });

      if (insertError) {
        return res.status(400).json({ error: insertError.message });
      }

      // Get updated count
      const { count } = await supabase
        .from('community_comment_likes')
        .select('*', { count: 'exact', head: true })
        .eq('comment_id', commentId);

      res.json({ message: 'Comment liked', liked: true, count: count || 1 });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Pin/Unpin post (only instructors can pin posts)
export const togglePinPost = async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    const { postId } = req.params;
    const instructorId = req.user.instructors[0]?.id;

    if (!instructorId) {
      return res.status(403).json({ error: 'Instructor access required' });
    }

    // Check if post belongs to instructor's community
    const { data: post, error: fetchError } = await supabase
      .from('community_posts')
      .select('instructor_id, is_pinned')
      .eq('id', postId)
      .single();

    if (fetchError || !post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (post.instructor_id !== instructorId) {
      return res.status(403).json({ error: 'You can only pin posts in your community' });
    }

    const { data: updatedPost, error: updateError } = await supabase
      .from('community_posts')
      .update({ is_pinned: !post.is_pinned })
      .eq('id', postId)
      .select()
      .single();

    if (updateError) {
      return res.status(400).json({ error: updateError.message });
    }

    res.json({ message: `Post ${updatedPost.is_pinned ? 'pinned' : 'unpinned'} successfully`, post: updatedPost });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get community stats (same as before)
export const getCommunityStats = async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    const instructorId = req.user.instructors[0]?.id;

    if (!instructorId) {
      return res.status(403).json({ error: 'Instructor access required' });
    }

    // Get total posts
    const { count: totalPosts } = await supabase
      .from('community_posts')
      .select('*', { count: 'exact', head: true })
      .eq('instructor_id', instructorId);

    // Get total comments
    const { count: totalComments } = await supabase
      .from('community_comments')
      .select('*, community_posts!inner(*)', { count: 'exact', head: true })
      .eq('community_posts.instructor_id', instructorId);

    // Get total likes
    const { count: totalLikes } = await supabase
      .from('community_likes')
      .select('*, community_posts!inner(*)', { count: 'exact', head: true })
      .eq('community_posts.instructor_id', instructorId);

    // Get active members (students in this instructor's community who posted/commented in last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    
    // Get students who belong to this instructor
    const { data: communityStudents } = await supabase
      .from('students')
      .select('user_id')
      .eq('instructor_id', instructorId);

    const studentUserIds = communityStudents?.map(s => s.user_id) || [];

    if (studentUserIds.length === 0) {
      return res.json({
        totalPosts: totalPosts || 0,
        totalComments: totalComments || 0,
        totalLikes: totalLikes || 0,
        activeMembers: 0
      });
    }

    const { data: activePostUsers } = await supabase
      .from('community_posts')
      .select('user_id')
      .eq('instructor_id', instructorId)
      .in('user_id', studentUserIds)
      .gte('created_at', thirtyDaysAgo);

    const { data: activeCommentUsers } = await supabase
      .from('community_comments')
      .select('user_id, community_posts!inner(*)')
      .eq('community_posts.instructor_id', instructorId)
      .in('community_comments.user_id', studentUserIds)
      .gte('community_comments.created_at', thirtyDaysAgo);

    const activeUserIds = new Set([
      ...(activePostUsers?.map(p => p.user_id) || []),
      ...(activeCommentUsers?.map(c => c.user_id) || [])
    ]);

    res.json({
      totalPosts: totalPosts || 0,
      totalComments: totalComments || 0,
      totalLikes: totalLikes || 0,
      activeMembers: activeUserIds.size
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};