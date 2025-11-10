// Main orchestrator component
export { default as StudentCourses } from './StudentCourses';

// Individual components
export { CourseLearningView, StudentLearningView } from './components';

// Hooks
export { useStudentCourse, useCourseContent } from './hooks';

// Services
export { courseService, studentCourseService } from './services';

// Types
export type { 
  Course, 
  Module, 
  Lesson, 
  StudentCourse,
  CourseLearningViewProps,
  StudentLearningViewProps,
  UseStudentCourseReturn,
  UseCourseContentReturn
} from './types';
