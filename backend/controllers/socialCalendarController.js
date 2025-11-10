import { getSupabaseClient } from '../repositories/supabaseClient.js';

// Get all social posts for instructor
export const getSocialPosts = async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    const instructorId = req.user.instructors[0].id;

    const { data: posts, error } = await supabase
      .from('social_posts')
      .select('*')
      .eq('instructor_id', instructorId)
      .order('date', { ascending: true })
      .order('time', { ascending: true });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create a new social post
export const createSocialPost = async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    const instructorId = req.user.instructors[0].id;
    const { date, time, platform, title, status, mediaLink, copy } = req.body;

    if (!date || !time || !platform) {
      return res.status(400).json({ error: 'Date, time, and platform are required' });
    }

    const { data: post, error } = await supabase
      .from('social_posts')
      .insert({
        instructor_id: instructorId,
        date,
        time,
        platform,
        title: title || '',
        status: status || 'Draft',
        media_link: mediaLink || '',
        copy: copy || ''
      })
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update a social post
export const updateSocialPost = async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    const instructorId = req.user.instructors[0].id;
    const { postId } = req.params;
    const { date, time, platform, title, status, mediaLink, copy } = req.body;

    // Verify post belongs to instructor
    const { data: existingPost, error: checkError } = await supabase
      .from('social_posts')
      .select('id')
      .eq('id', postId)
      .eq('instructor_id', instructorId)
      .single();

    if (checkError || !existingPost) {
      return res.status(404).json({ error: 'Post not found or unauthorized' });
    }

    const { data: post, error } = await supabase
      .from('social_posts')
      .update({
        date,
        time,
        platform,
        title: title || '',
        status: status || 'Draft',
        media_link: mediaLink || '',
        copy: copy || '',
        updated_at: new Date().toISOString()
      })
      .eq('id', postId)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(post);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete a social post
export const deleteSocialPost = async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    const instructorId = req.user.instructors[0].id;
    const { postId } = req.params;

    // Verify post belongs to instructor
    const { data: existingPost, error: checkError } = await supabase
      .from('social_posts')
      .select('id')
      .eq('id', postId)
      .eq('instructor_id', instructorId)
      .single();

    if (checkError || !existingPost) {
      return res.status(404).json({ error: 'Post not found or unauthorized' });
    }

    const { error } = await supabase
      .from('social_posts')
      .delete()
      .eq('id', postId);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};