import { useState, useEffect } from 'react';
import { courseService, Course } from '../services';

export interface UseCourseContentReturn {
  course: Course | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useCourseContent(courseId: string): UseCourseContentReturn {
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      setError(null);
      const courseData = await courseService.getCourseContentOpen(courseId);
      setCourse(courseData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load course content');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);

  return {
    course,
    loading,
    error,
    refetch: fetchCourse,
  };
}
