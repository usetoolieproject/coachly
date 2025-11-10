// Course-related types
export interface Course {
  id: string;
  title: string;
  description?: string;
  category: string;
  level: string;
  type: string;
  price?: number;
  thumbnail_url?: string;
  is_published: boolean;
  created_at: string;
  order_index: number;
  modules?: Module[];
}

export interface Module {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  order_index: number;
  lessons?: Lesson[];
}

export interface Lesson {
  id: string;
  module_id: string;
  title: string;
  description?: string;
  video_url?: string;
  resource_files?: any[];
  additional_content?: string;
  allow_preview: boolean;
  order_index: number;
  is_completed?: boolean;
}

export interface StudentCourse {
  id: string;
  title: string;
  description?: string;
  category: string;
  level: string;
  type: string;
  price?: number;
  thumbnail_url?: string;
  totalLessons: number;
  completedLessons?: number;
  progressPercentage?: number;
  totalStudents: number;
  isEnrolled: boolean;
  enrollmentId?: string;
  enrolledAt?: string;
  isPaid?: boolean;
  instructor?: {
    firstName: string;
    lastName: string;
    businessName?: string;
  };
  modules?: Module[];
  lessonProgress?: { [lessonId: string]: { completed: boolean; watchTime: number } };
  is_enrolled?: boolean;
  is_locked?: boolean;
}

// Component prop types
export interface CourseLearningViewProps {
  courseId: string;
  onBack: () => void;
}

export interface StudentLearningViewProps {
  courseId: string;
  onBack: () => void;
}

// Hook return types
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

export interface UseCourseContentReturn {
  course: Course | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}
