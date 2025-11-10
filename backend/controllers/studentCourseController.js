import { getSupabaseClient } from '../repositories/supabaseClient.js';


// Get student's single community
export const getStudentCommunity = async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    const studentId = req.user.students[0].id;

    const { data: student, error } = await supabase
      .from('students')
      .select(`
        instructor_id,
        instructors (
          id,
          business_name,
          subdomain,
          users (
            first_name,
            last_name,
            email,
            phone
          )
        )
      `)
      .eq('id', studentId)
      .single();

    if (error || !student.instructor_id) {
      return res.status(404).json({ error: 'No community joined' });
    }

    // Get course stats
    const { data: courses } = await supabase
      .from('courses')
      .select('id, is_published')
      .eq('instructor_id', student.instructor_id);

    const publishedCourses = courses?.filter(c => c.is_published) || [];

    const { data: enrollments } = await supabase
      .from('enrollments')
      .select('student_id')
      .in('course_id', publishedCourses.map(c => c.id));

    const uniqueStudents = new Set(enrollments?.map(e => e.student_id) || []).size;

    const communityData = {
      id: student.instructors.id,
      instructorId: student.instructors.id,
      name: student.instructors.business_name,
      subdomain: student.instructors.subdomain,
      instructor: {
        firstName: student.instructors.users.first_name,
        lastName: student.instructors.users.last_name,
        email: student.instructors.users.email,
        phone: student.instructors.users.phone || null
      },
      stats: {
        totalCourses: publishedCourses.length,
        totalStudents: uniqueStudents
      }
    };

    res.json(communityData);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Join a community (replaces any existing community)
export const joinCommunity = async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    const { subdirectory } = req.params;
    const studentId = req.user.students[0].id;

    // Get instructor by subdomain
    const { data: instructor, error: instructorError } = await supabase
      .from('instructors')
      .select('id, business_name, subdomain')
      .eq('subdomain', subdirectory)
      .single();

    if (instructorError || !instructor) {
      return res.status(404).json({ error: 'Community not found' });
    }

    const instructorId = instructor.id;

    // Update student's instructor_id (this replaces any existing community)
    const { error: updateError } = await supabase
      .from('students')
      .update({ instructor_id: instructorId })
      .eq('id', studentId);

    if (updateError) {
      return res.status(400).json({ error: updateError.message });
    }

    res.json({ message: 'Successfully joined the community!' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// NEW: Get all courses from community with progress (no enrollment needed)
export const getAllCoursesWithProgress = async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    const studentId = req.user.students[0].id;
    
    // Get student's instructor
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('instructor_id')
      .eq('id', studentId)
      .single();

    if (studentError || !student.instructor_id) {
      return res.json([]); // No community joined yet
    }

    // Get published courses from the instructor
    const { data: courses, error } = await supabase
      .from('courses')
      .select(`
        *,
        modules (
          id,
          title,
          lessons (id)
        )
      `)
      .eq('instructor_id', student.instructor_id)
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Get student's progress for all lessons across all courses
    const allLessonIds = [];
    courses.forEach(course => {
      course.modules?.forEach(module => {
        module.lessons?.forEach(lesson => {
          allLessonIds.push(lesson.id);
        });
      });
    });

    let progressData = {};
    if (allLessonIds.length > 0) {
      const { data: progressRows } = await supabase
        .from('student_lesson_progress')
        .select('lesson_id, completed, watch_time')
        .eq('student_id', studentId)
        .in('lesson_id', allLessonIds);

      progressData = {};
      progressRows?.forEach(progress => {
        progressData[progress.lesson_id] = {
          completed: progress.completed,
          watchTime: progress.watch_time
        };
      });
    }

    // Add progress statistics to each course
    const coursesWithProgress = courses.map(course => {
      const totalLessons = course.modules?.reduce((sum, module) => sum + (module.lessons?.length || 0), 0) || 0;
      
      let completedLessons = 0;
      course.modules?.forEach(module => {
        module.lessons?.forEach(lesson => {
          if (progressData[lesson.id]?.completed) {
            completedLessons++;
          }
        });
      });

      const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

      return {
        ...course,
        totalLessons,
        completedLessons,
        progressPercentage,
        totalStudents: 0, // We can calculate this if needed
        isEnrolled: true, // All courses are accessible
        lessonProgress: progressData
      };
    });

    res.json(coursesWithProgress);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get available courses from student's community
export const getAvailableCourses = async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    const studentId = req.user.students[0].id;
    
    // Get student's instructor
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('instructor_id')
      .eq('id', studentId)
      .single();

    if (studentError || !student.instructor_id) {
      return res.json([]); // No community joined yet
    }

    // Get published courses from the instructor
    const { data: courses, error } = await supabase
      .from('courses')
      .select(`
        *,
        modules (
          id,
          title,
          lessons (id)
        ),
        enrollments!enrollments_course_id_fkey (
          id,
          student_id,
          completed_at
        )
      `)
      .eq('instructor_id', student.instructor_id)
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Get lesson progress for all courses
    const allLessonIds = courses.flatMap(course => 
      course.modules?.flatMap(module => module.lessons?.map(lesson => lesson.id) || []) || []
    );

    let progressData = {};
    if (allLessonIds.length > 0) {
      const { data: progress } = await supabase
        .from('student_lesson_progress')
        .select('lesson_id, completed, watch_time')
        .eq('student_id', studentId)
        .in('lesson_id', allLessonIds);

      progressData = progress?.reduce((acc, progress) => {
        acc[progress.lesson_id] = {
          completed: progress.completed,
          watchTime: progress.watch_time
        };
        return acc;
      }, {}) || {};
    }

    // Determine paid status from enrollments.paid_at (single source of truth)
    let paidCourseIds = new Set();
    try {
      const courseIds = (courses || []).map(c => c.id);
      if (courseIds.length > 0) {
        const { data: paidEnrollments } = await supabase
          .from('enrollments')
          .select('course_id')
          .eq('student_id', studentId)
          .not('paid_at', 'is', null)
          .in('course_id', courseIds);
        if (Array.isArray(paidEnrollments)) {
          paidCourseIds = new Set(paidEnrollments.filter(r => r.course_id).map(r => r.course_id));
        }
      }
    } catch (e) {
      // ignore paid check errors; default is unpaid
    }

    // Add enrollment status, statistics, and progress
    const coursesWithStats = courses.map(course => {
      const totalLessons = course.modules?.reduce((sum, module) => sum + (module.lessons?.length || 0), 0) || 0;
      const totalStudents = course.enrollments?.length || 0;
      const myEnrollment = course.enrollments?.find(enrollment => enrollment.student_id === studentId) || null;
      const isEnrolled = !!myEnrollment;
      const isLocked = false; // All courses are now accessible
      const isPaid = isEnrolled ? paidCourseIds.has(course.id) : false;

      // Calculate progress for this student across all lessons (even if not enrolled)
      let completedLessons = 0;
      course.modules?.forEach(module => {
        module.lessons?.forEach(lesson => {
          if (progressData[lesson.id]?.completed) {
            completedLessons++;
          }
        });
      });
      const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

      return {
        ...course,
        totalLessons,
        completedLessons,
        progressPercentage,
        totalStudents,
        isEnrolled,
        isLocked,
        isPaid,
        lessonProgress: progressData,
        completedAt: myEnrollment?.completed_at || null,
        enrollments: undefined
      };
    });

    res.json(coursesWithStats);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get student's enrolled courses
export const getEnrolledCourses = async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    const studentId = req.user.students[0].id;

    const { data: enrollments, error } = await supabase
      .from('enrollments')
      .select(`
        *,
        courses (
          *,
          instructors (
            users (first_name, last_name),
            business_name
          ),
          modules (
            id,
            title,
            lessons (id)
          )
        )
      `)
      .eq('student_id', studentId)
      .order('enrolled_at', { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Get all lesson IDs for enrolled courses
    const allLessonIds = [];
    enrollments.forEach(enrollment => {
      enrollment.courses.modules?.forEach(module => {
        module.lessons?.forEach(lesson => {
          allLessonIds.push(lesson.id);
        });
      });
    });

    // Get student's progress for all lessons
    let progressData = {};
    if (allLessonIds.length > 0) {
      const { data: progressRows } = await supabase
        .from('student_lesson_progress')
        .select('lesson_id, completed')
        .eq('student_id', studentId)
        .in('lesson_id', allLessonIds);

      progressData = {};
      progressRows?.forEach(progress => {
        progressData[progress.lesson_id] = {
          completed: progress.completed
        };
      });
    }

    // Build a map of paid courses for this student
    let paidCourseIds = new Set();
    try {
      const { data: paidRows } = await supabase
        .from('payments')
        .select('course_id')
        .eq('student_id', studentId)
        .eq('status', 'paid');
      if (Array.isArray(paidRows)) {
        paidCourseIds = new Set(paidRows.filter(r => r.course_id).map(r => r.course_id));
      }
    } catch (e) {
      // non-fatal
    }

    const coursesWithProgress = enrollments.map(enrollment => {
      const course = enrollment.courses;
      const totalLessons = course.modules?.reduce((sum, module) => sum + (module.lessons?.length || 0), 0) || 0;
      
      // Calculate completed lessons from student_lesson_progress
      let completedLessons = 0;
      course.modules?.forEach(module => {
        module.lessons?.forEach(lesson => {
          if (progressData[lesson.id]?.completed) {
            completedLessons++;
          }
        });
      });
      
      const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

      return {
        ...course,
        enrollmentId: enrollment.id,
        enrolledAt: enrollment.enrolled_at,
        totalLessons,
        completedLessons,
        progressPercentage,
        isPaid: paidCourseIds.has(course.id),
        instructor: course.instructors?.users ? {
          firstName: course.instructors.users.first_name,
          lastName: course.instructors.users.last_name,
          businessName: course.instructors.business_name
        } : null
      };
    });

    res.json(coursesWithProgress);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Enroll in course (must be from student's community)
export const enrollInCourse = async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    const { courseId } = req.params;
    const studentId = req.user.students[0].id;

    // Get student's instructor
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('instructor_id')
      .eq('id', studentId)
      .single();

    if (studentError || !student.instructor_id) {
      return res.status(403).json({ error: 'You must join a community first' });
    }

    // Check if course exists and belongs to student's instructor
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('id, is_published, instructor_id')
      .eq('id', courseId)
      .single();

    if (courseError || !course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    if (!course.is_published) {
      return res.status(400).json({ error: 'Course is not published' });
    }

    if (course.instructor_id !== student.instructor_id) {
      return res.status(403).json({ error: 'You can only enroll in courses from your community' });
    }

    // Check if already enrolled
    const { data: existingEnrollment } = await supabase
      .from('enrollments')
      .select('id')
      .eq('student_id', studentId)
      .eq('course_id', courseId)
      .single();

    if (existingEnrollment) {
      return res.status(400).json({ error: 'Already enrolled in this course' });
    }

    // Create enrollment
    const { data: enrollment, error: enrollmentError } = await supabase
      .from('enrollments')
      .insert({
        student_id: studentId,
        course_id: courseId
      })
      .select()
      .single();

    if (enrollmentError) {
      return res.status(400).json({ error: enrollmentError.message });
    }

    res.status(201).json({
      message: 'Successfully enrolled in course',
      enrollment
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// NEW: Get course content for any student in the community (no enrollment needed) - WITH PROPER ORDERING
export const getStudentCourseContentOpen = async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    const { courseId } = req.params;
    const studentId = req.user.students[0].id;

    // Get student's instructor
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('instructor_id')
      .eq('id', studentId)
      .single();

    if (studentError || !student.instructor_id) {
      return res.status(403).json({ error: 'You must join a community first' });
    }

    // First get the course
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .eq('instructor_id', student.instructor_id)
      .eq('is_published', true)
      .single();

    if (courseError || !course) {
      return res.status(403).json({ error: 'Course not found or not accessible' });
    }

    // All courses are now accessible to students in the community (no payment restrictions)

    // Then get modules with proper ordering (SAME AS INSTRUCTOR)
    const { data: modules, error: modulesError } = await supabase
      .from('modules')
      .select('*')
      .eq('course_id', courseId)
      .order('order_index', { ascending: true });

    if (modulesError) {
      return res.status(400).json({ error: modulesError.message });
    }

    // Then get lessons for each module with proper ordering (SAME AS INSTRUCTOR)
    for (let module of modules) {
      const { data: lessons, error: lessonsError } = await supabase
        .from('lessons')
        .select('*')
        .eq('module_id', module.id)
        .order('order_index', { ascending: true });

      if (lessonsError) {
        module.lessons = [];
      } else {
        module.lessons = lessons;
      }
    }

    // Attach modules to course
    course.modules = modules;

    // Get lesson progress from the new table
    const allLessonIds = [];
    course.modules?.forEach(module => {
      module.lessons?.forEach(lesson => {
        allLessonIds.push(lesson.id);
      });
    });

    let progressMap = {};
    if (allLessonIds.length > 0) {
      const { data: lessonProgress } = await supabase
        .from('student_lesson_progress')
        .select('lesson_id, completed, watch_time')
        .eq('student_id', studentId)
        .in('lesson_id', allLessonIds);

      progressMap = {};
      lessonProgress?.forEach(progress => {
        progressMap[progress.lesson_id] = {
          completed: progress.completed,
          watchTime: progress.watch_time
        };
      });
    }

    // Compute paid status from enrollments.paid_at for immediate unlock
    let isPaid = false;
    try {
      const { data: paidEnrollment } = await supabase
        .from('enrollments')
        .select('id, paid_at')
        .eq('student_id', studentId)
        .eq('course_id', courseId)
        .maybeSingle();
      isPaid = !!paidEnrollment?.paid_at;
    } catch (e) {
      isPaid = false;
    }

    // Add progress to course data
    const courseWithProgress = {
      ...course,
      isPaid,
      lessonProgress: progressMap,
      instructor: course.instructors ? {
        firstName: course.instructors.users.first_name,
        lastName: course.instructors.users.last_name,
        businessName: course.instructors.business_name
      } : null
    };

    res.json(courseWithProgress);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get course content for enrolled student
export const getStudentCourseContent = async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    const { courseId } = req.params;
    const studentId = req.user.students[0].id;
    

    // Verify student is enrolled in this course
    const { data: enrollment, error: enrollmentError } = await supabase
      .from('enrollments')
      .select('id')
      .eq('student_id', studentId)
      .eq('course_id', courseId)
      .single();

    if (enrollmentError || !enrollment) {
      return res.status(403).json({ error: 'Not enrolled in this course' });
    }

    // Get course content with progress
    const { data: course, error } = await supabase
      .from('courses')
      .select(`
        *,
        instructors (
          users (first_name, last_name),
          business_name
        ),
        modules (
          *,
          lessons (*)
        )
      `)
      .eq('id', courseId)
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Get lesson progress
    const { data: lessonProgress } = await supabase
      .from('student_lesson_progress')
      .select('lesson_id, completed, watch_time')
      .eq('student_id', studentId)
      .in('lesson_id', course.modules.flatMap(m => m.lessons?.map(l => l.id) || []));

    // Create progress map
    const progressMap = {};
    lessonProgress?.forEach(progress => {
      progressMap[progress.lesson_id] = {
        completed: progress.completed,
        watchTime: progress.watch_time
      };
    });

    // Determine paid status for this enrollment/course from enrollments.paid_at
    let isPaid = false;
    try {
      const { data: paidEnrollment } = await supabase
        .from('enrollments')
        .select('id, paid_at')
        .eq('student_id', studentId)
        .eq('course_id', courseId)
        .maybeSingle();
      isPaid = !!paidEnrollment?.paid_at;
    } catch (e) {
      isPaid = false;
    }
    

    // Add progress to course data
    const courseWithProgress = {
      ...course,
      enrollmentId: enrollment.id,
      isPaid,
      lessonProgress: progressMap,
      instructor: course.instructors ? {
        firstName: course.instructors.users.first_name,
        lastName: course.instructors.users.last_name,
        businessName: course.instructors.business_name
      } : null
    };

    res.json(courseWithProgress);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// NEW: Update lesson progress without enrollment
export const updateLessonProgressOpen = async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    const { lessonId } = req.params;
    const { completed, watchTime } = req.body;
    const studentId = req.user.students[0].id;

    // Get student's instructor
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('instructor_id')
      .eq('id', studentId)
      .single();

    if (studentError || !student.instructor_id) {
      return res.status(403).json({ error: 'You must join a community first' });
    }

    // Verify lesson belongs to student's instructor's course
    const { data: lesson, error: lessonError } = await supabase
      .from('lessons')
      .select(`
        id,
        module_id,
        modules (
          course_id,
          courses (
            instructor_id,
            is_published,
            type,
            price
          )
        )
      `)
      .eq('id', lessonId)
      .single();

    if (lessonError || !lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    if (lesson.modules.courses.instructor_id !== student.instructor_id || !lesson.modules.courses.is_published) {
      return res.status(403).json({ error: 'Access denied to this lesson' });
    }

    // Auto-enroll student in FREE courses on first progress update
    try {
      const courseId = lesson.modules.course_id;
      const isFreeCourse = !lesson.modules.courses || lesson.modules.courses.type === 'free' || Number(lesson.modules.courses.price || 0) === 0;
      if (isFreeCourse) {
        const { data: existingEnrollmentCheck, error: findEnrollErr } = await supabase
          .from('enrollments')
          .select('id')
          .eq('student_id', studentId)
          .eq('course_id', courseId)
          .maybeSingle();
        if (!findEnrollErr && !existingEnrollmentCheck) {
          await supabase
            .from('enrollments')
            .insert({ student_id: studentId, course_id: courseId })
            .select('id')
            .single();
        }
      }
    } catch (e) {
      // non-fatal
    }

    // Perform safe two-step upsert (handles missing unique index constraints)
    const { data: existingProgress, error: findError } = await supabase
      .from('student_lesson_progress')
      .select('id')
      .eq('student_id', studentId)
      .eq('lesson_id', lessonId)
      .single();

    if (findError && findError.code !== 'PGRST116') {
      return res.status(400).json({ error: findError.message });
    }

    const updateFields = {
      completed: completed || false,
      watch_time: watchTime || 0,
      completed_at: completed ? new Date().toISOString() : null,
      updated_at: new Date().toISOString()
    };

    let progress;
    if (existingProgress) {
      const { data: updated, error: updateError } = await supabase
        .from('student_lesson_progress')
        .update(updateFields)
        .eq('id', existingProgress.id)
        .select()
        .single();
      if (updateError) {
        return res.status(400).json({ error: updateError.message });
      }
      progress = updated;
    } else {
      const { data: inserted, error: insertError } = await supabase
        .from('student_lesson_progress')
        .insert({
          student_id: studentId,
          lesson_id: lessonId,
          ...updateFields
        })
        .select()
        .single();
      if (insertError) {
        return res.status(400).json({ error: insertError.message });
      }
      progress = inserted;
    }

  // If course is fully completed by progress, set enrollments.completed_at (for free courses we may have auto-enrolled above)
  try {
    const courseId = lesson.modules.course_id;
    // get all lessons for this course
    const { data: courseLessons } = await supabase
      .from('lessons')
      .select('id')
      .eq('module_id', lesson.module_id)
      .limit(1);
    // fetch all modules->lessons for course
    const { data: modulesWithLessons } = await supabase
      .from('modules')
      .select('id, lessons(id)')
      .eq('course_id', courseId);
    const allIds = [];
    (modulesWithLessons || []).forEach(m => (m.lessons || []).forEach(l => allIds.push(l.id)));
    if (allIds.length > 0) {
      const { data: completedRows } = await supabase
        .from('student_lesson_progress')
        .select('lesson_id, completed')
        .eq('student_id', studentId)
        .in('lesson_id', allIds);
      const total = allIds.length;
      const done = (completedRows || []).filter(r => r.completed).length;
      if (total > 0 && done === total) {
        // ensure enrollment exists (for free we might have created it earlier)
        const { data: enr } = await supabase
          .from('enrollments')
          .select('id')
          .eq('student_id', studentId)
          .eq('course_id', courseId)
          .maybeSingle();
        if (enr?.id) {
          await supabase
            .from('enrollments')
            .update({ completed_at: new Date().toISOString() })
            .eq('id', enr.id);
        }
      }
    }
  } catch (e) {
    // non-fatal
  }

  res.json({ message: 'Lesson progress updated', progress });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update lesson progress
export const updateLessonProgress = async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    const { lessonId } = req.params;
    const { completed, watchTime } = req.body;
    const studentId = req.user.students[0].id;

    // Get lesson and verify student access
    const { data: lesson, error: lessonError } = await supabase
      .from('lessons')
      .select(`
        id,
        module_id,
        modules (
          course_id,
          courses (
            enrollments!enrollments_course_id_fkey (
              id,
              student_id
            )
          )
        )
      `)
      .eq('id', lessonId)
      .single();

    if (lessonError || !lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    const enrollment = lesson.modules.courses.enrollments.find(e => e.student_id === studentId);
    if (!enrollment) {
      return res.status(403).json({ error: 'Not enrolled in this course' });
    }

    // Upsert lesson progress
    const { data: progress, error } = await supabase
      .from('lesson_progress')
      .upsert({
        enrollment_id: enrollment.id,
        lesson_id: lessonId,
        completed: completed || false,
        watch_time: watchTime || 0,
        completed_at: completed ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'enrollment_id,lesson_id'
      })
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({
      message: 'Lesson progress updated',
      progress
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Mark a course as completed for the enrolled student
export const markCourseCompleted = async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    const { courseId } = req.params;
    const studentId = req.user.students[0].id;

    // verify enrollment exists
    const { data: enrollment, error: enrollmentError } = await supabase
      .from('enrollments')
      .select('id, completed_at')
      .eq('student_id', studentId)
      .eq('course_id', courseId)
      .single();

    if (enrollmentError || !enrollment) {
      return res.status(403).json({ error: 'Not enrolled in this course' });
    }

    if (enrollment.completed_at) {
      return res.json({ completedAt: enrollment.completed_at });
    }

    const completedAt = new Date().toISOString();

    const { data: updated, error: updateError } = await supabase
      .from('enrollments')
      .update({ completed_at: completedAt, updated_at: completedAt })
      .eq('id', enrollment.id)
      .select('completed_at')
      .single();

    if (updateError) {
      return res.status(400).json({ error: updateError.message });
    }

    return res.json({ completedAt: updated.completed_at });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};