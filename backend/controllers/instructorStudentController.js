import { getSupabaseClient } from '../repositories/supabaseClient.js';

// Get all students for an instructor - OPTIMIZED
export const getInstructorStudents = async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    const instructorId = req.user.instructors[0]?.id;

    if (!instructorId) {
      return res.status(403).json({ error: 'Instructor access required' });
    }

    // Get students with their user details including profile picture
    const { data: students, error } = await supabase
      .from('students')
      .select(`
        id,
        created_at,
        users!inner (
          id,
          first_name,
          last_name,
          email,
          profile_picture_url,
          created_at
        )
      `)
      .eq('instructor_id', instructorId)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Get ALL lessons from instructor's published courses (to calculate total lessons)
    const { data: allLessons } = await supabase
      .from('lessons')
      .select(`
        id,
        modules!inner(
          courses!inner(id, instructor_id)
        )
      `)
      .eq('modules.courses.instructor_id', instructorId)
      .eq('modules.courses.is_published', true);

    const totalLessonsCount = allLessons?.length || 0;

    // Get ALL progress data for all students at once
    const studentIds = students.map(s => s.id);
    let allProgressData = {};
    let allPostsData = {};
    let allCommentsData = {};
    let paymentsByStudentId = {};

    if (studentIds.length > 0) {
      // Get all progress data
      const { data: allProgress } = await supabase
        .from('student_lesson_progress')
        .select(`
          student_id,
          lesson_id,
          completed,
          lessons!inner(
            modules!inner(
              courses!inner(id, instructor_id)
            )
          )
        `)
        .in('student_id', studentIds)
        .eq('lessons.modules.courses.instructor_id', instructorId);

      // Group progress by student
      allProgressData = {};
      allProgress?.forEach(progress => {
        if (!allProgressData[progress.student_id]) {
          allProgressData[progress.student_id] = [];
        }
        allProgressData[progress.student_id].push(progress);
      });

      // Get all posts data
      const { data: allPosts } = await supabase
        .from('community_posts')
        .select('user_id')
        .eq('instructor_id', instructorId)
        .in('user_id', students.map(s => s.users.id));

      // Count posts per user
      allPostsData = {};
      allPosts?.forEach(post => {
        allPostsData[post.user_id] = (allPostsData[post.user_id] || 0) + 1;
      });

      // Get all comments data  
      const { data: allComments } = await supabase
        .from('community_comments')
        .select(`
          user_id,
          community_posts!inner(instructor_id)
        `)
        .eq('community_posts.instructor_id', instructorId)
        .in('user_id', students.map(s => s.users.id));

      // Count comments per user
      allCommentsData = {};
      allComments?.forEach(comment => {
        allCommentsData[comment.user_id] = (allCommentsData[comment.user_id] || 0) + 1;
      });

      // Get payments per student in a single query (sum by student)
      const { data: payments } = await supabase
        .from('payments')
        .select('student_id, amount_total, status')
        .eq('instructor_id', instructorId)
        .in('student_id', studentIds)
        .eq('status', 'paid');

      paymentsByStudentId = {};
      payments?.forEach(p => {
        paymentsByStudentId[p.student_id] = (paymentsByStudentId[p.student_id] || 0) + (p.amount_total || 0);
      });
    }

    // Process each student with cached data
    const studentsWithProgress = students.map(student => {
      const studentProgress = allProgressData[student.id] || [];
      const completedLessons = studentProgress.filter(p => p.completed).length;
      
      // Calculate progress percentage based on ALL lessons, not just attempted ones
      const progressPercentage = totalLessonsCount > 0 ? Math.round((completedLessons / totalLessonsCount) * 100) : 0;

      const paidCents = paymentsByStudentId[student.id] || 0;
      const amountPaid = Math.round((paidCents / 100) * 100) / 100; // cents -> dollars rounded to 2 decimals
      const paymentMethod = amountPaid > 0 ? 'Paid' : 'Free';

      return {
        id: student.id,
        userId: student.users.id,
        firstName: student.users.first_name,
        lastName: student.users.last_name,
        email: student.users.email,
        profilePictureUrl: student.users.profile_picture_url, // Make sure this is mapped
        joinedDate: student.created_at,
        accountCreated: student.users.created_at,
        amountPaid,
        paymentMethod,
        status: 'Active',
        progress: {
          totalCourses: 0, // We can calculate this if needed
          totalLessons: totalLessonsCount,
          completedLessons,
          completionPercentage: progressPercentage
        },
        activity: {
          totalPosts: allPostsData[student.users.id] || 0,
          totalComments: allCommentsData[student.users.id] || 0
        }
      };
    });

    res.json(studentsWithProgress);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get detailed student information - OPTIMIZED
export const getStudentDetails = async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    const { studentId } = req.params;
    const instructorId = req.user.instructors[0]?.id;

    if (!instructorId) {
      return res.status(403).json({ error: 'Instructor access required' });
    }

    // Verify student belongs to this instructor
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select(`
        id,
        created_at,
        users!inner (
          id,
          first_name,
          last_name,
          email,
          profile_picture_url,
          phone,
          location,
          bio,
          created_at
        )
      `)
      .eq('id', studentId)
      .eq('instructor_id', instructorId)
      .single();

    if (studentError || !student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Get courses with modules and lessons in a single query
    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select(`
        id,
        title,
        modules (
          id,
          title,
          order_index,
          lessons (
            id,
            title,
            order_index
          )
        )
      `)
      .eq('instructor_id', instructorId)
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    if (coursesError) {
      return res.status(400).json({ error: coursesError.message });
    }

    // Get ALL lesson IDs for this instructor
    const allLessonIds = [];
    courses?.forEach(course => {
      course.modules?.forEach(module => {
        // Sort lessons by order_index
        module.lessons = module.lessons?.sort((a, b) => a.order_index - b.order_index) || [];
        module.lessons?.forEach(lesson => {
          allLessonIds.push(lesson.id);
        });
      });
      // Sort modules by order_index  
      course.modules = course.modules?.sort((a, b) => a.order_index - b.order_index) || [];
    });

    // Get student's progress for all lessons in one query
    let progressData = {};
    if (allLessonIds.length > 0) {
      const { data: progress } = await supabase
        .from('student_lesson_progress')
        .select('lesson_id, completed, watch_time, completed_at')
        .eq('student_id', studentId)
        .in('lesson_id', allLessonIds);

      progressData = {};
      progress?.forEach(p => {
        progressData[p.lesson_id] = {
          completed: p.completed,
          watchTime: p.watch_time,
          completedAt: p.completed_at
        };
      });
    }

    // Get student's posts and comments in parallel
    const [postsResult, commentsResult] = await Promise.all([
      supabase
        .from('community_posts')
        .select(`
          id,
          content,
          category,
          created_at,
          community_likes (id),
          community_comments (id)
        `)
        .eq('user_id', student.users.id)
        .eq('instructor_id', instructorId)
        .order('created_at', { ascending: false })
        .limit(20), // Limit to recent posts for performance

      supabase
        .from('community_comments')
        .select(`
          id,
          content,
          created_at,
          community_posts!inner (
            id,
            content
          ),
          community_comment_likes (id)
        `)
        .eq('user_id', student.users.id)
        .eq('community_posts.instructor_id', instructorId)
        .order('created_at', { ascending: false })
        .limit(20) // Limit to recent comments for performance
    ]);

    const posts = postsResult.data || [];
    const comments = commentsResult.data || [];

    // Process courses with progress
    const coursesWithProgress = courses?.map(course => {
      const totalLessons = course.modules?.reduce((sum, module) => sum + (module.lessons?.length || 0), 0) || 0;
      let completedLessons = 0;
      
      course.modules?.forEach(module => {
        module.lessons?.forEach(lesson => {
          if (progressData[lesson.id]?.completed) {
            completedLessons++;
          }
        });
      });

      return {
        ...course,
        totalLessons,
        completedLessons,
        progressPercentage: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0,
        modules: course.modules?.map(module => ({
          ...module,
          lessons: module.lessons?.map(lesson => ({
            ...lesson,
            progress: progressData[lesson.id] || { completed: false, watchTime: 0 }
          }))
        }))
      };
    });

    const studentDetails = {
      id: student.id,
      userId: student.users.id,
      firstName: student.users.first_name,
      lastName: student.users.last_name,
      email: student.users.email,
      profilePictureUrl: student.users.profile_picture_url, // Make sure this is mapped
      phone: student.users.phone,              // Add this
      location: student.users.location,        // Add this
      bio: student.users.bio,
      joinedDate: student.created_at,
      accountCreated: student.users.created_at,
      courses: coursesWithProgress || [],
      posts: posts?.map(post => ({
        ...post,
        likeCount: post.community_likes?.length || 0,
        commentCount: post.community_comments?.length || 0
      })) || [],
      comments: comments?.map(comment => ({
        ...comment,
        likeCount: comment.community_comment_likes?.length || 0,
        postContent: comment.community_posts.content,
        postId: comment.community_posts.id
      })) || []
    };

    res.json(studentDetails);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};