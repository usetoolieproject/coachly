import { useState, useEffect } from 'react';
import { studentCourseService, StudentCourse } from '../services';
import { apiFetch } from '../../../../services/api';

export interface UseStudentCourseReturn {
  course: StudentCourse | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  markLessonComplete: (lessonId: string) => Promise<void>;
  markLessonIncomplete: (lessonId: string) => Promise<void>;
  handleSubscribeToCourse?: (courseId: string) => Promise<void>;
  isSubscribing?: boolean;
  isUpdating?: boolean;
}

export function useStudentCourse(courseId: string): UseStudentCourseReturn {
  const [course, setCourse] = useState<StudentCourse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubscribing, setIsSubscribing] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  const fetchCourse = async () => {
    try {
      // If we have initial load, show loading; subsequent refetches mark as updating
      if (course === null) setLoading(true); else setIsUpdating(true);
      setError(null);
      // Prefer enrolled content (gates paid access via backend); fallback to open if needed
      let courseData: StudentCourse | null = null;
      try {
        courseData = await apiFetch(`/student/courses/${courseId}/content`);
      } catch {}
      if (!courseData) {
        courseData = await studentCourseService.getStudentCourseContentOpen(courseId);
      }
      setCourse(courseData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load course');
    } finally {
      setLoading(false);
      setIsUpdating(false);
    }
  };

  const markLessonComplete = async (lessonId: string) => {
    try {
      await studentCourseService.updateLessonProgressOpen(lessonId, true);
      // Update local state
      if (course) {
        const updatedCourse = { ...course };
        // Find and update the lesson
        updatedCourse.modules?.forEach(module => {
          module.lessons?.forEach((lesson: any) => {
            if (lesson.id === lessonId) {
              lesson.is_completed = true;
            }
          });
        });
        setCourse(updatedCourse);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark lesson as complete');
    }
  };

  const markLessonIncomplete = async (lessonId: string) => {
    try {
      await studentCourseService.updateLessonProgressOpen(lessonId, false);
      // Update local state
      if (course) {
        const updatedCourse = { ...course };
        // Find and update the lesson
        updatedCourse.modules?.forEach(module => {
          module.lessons?.forEach((lesson: any) => {
            if (lesson.id === lessonId) {
              lesson.is_completed = false;
            }
          });
        });
        setCourse(updatedCourse);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark lesson as incomplete');
    }
  };

  const handleSubscribeToCourse = async (courseIdParam: string) => {
    if (isSubscribing) return;
    setIsSubscribing(true);
    try {
      const { url } = await studentCourseService.createCourseCheckoutSession(courseIdParam);
      if (url) {
        window.location.href = url;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start checkout');
    } finally {
      setIsSubscribing(false);
    }
  };


  useEffect(() => {
    if (courseId) {
      const params = new URLSearchParams(window.location.search);
      const sessionId = params.get('session_id');
      const hasPaidFlag = params.has('paid');

      const run = async () => {
        await fetchCourse();
        if (sessionId) {
          try {
            await studentCourseService.confirmCheckoutSession(sessionId, courseId);
            await fetchCourse(); // single explicit refetch after confirm
          } catch {}
        }
        if (sessionId || hasPaidFlag) {
          const url = window.location.pathname + window.location.hash;
          window.history.replaceState({}, '', url);
        }
      };
      run();
    }
  }, [courseId]);

  return {
    course,
    loading,
    error,
    refetch: fetchCourse,
    markLessonComplete,
    markLessonIncomplete,
    handleSubscribeToCourse,
    isSubscribing,
    isUpdating,
  };
}
