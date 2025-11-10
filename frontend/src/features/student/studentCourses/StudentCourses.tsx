import React, { useState } from 'react';
import { useStudentCourse } from './hooks/useStudentCourse';
import { useCourseContent } from './hooks/useCourseContent';
import { CourseLearningView, StudentLearningView } from './components';

interface StudentCoursesProps {
  courseId: string;
  onBack: () => void;
  viewMode?: 'student' | 'course';
}

const StudentCourses: React.FC<StudentCoursesProps> = ({ 
  courseId, 
  onBack, 
  viewMode = 'student' 
}) => {
  const [currentView] = useState<'student' | 'course'>(viewMode);

  const studentCourseHook = useStudentCourse(courseId);
  const courseContentHook = useCourseContent(courseId);

  const handleBack = () => {
    onBack();
  };


  if (currentView === 'student') {
    return (
      <StudentLearningView 
        courseId={courseId}
        onBack={handleBack}
        course={studentCourseHook.course}
        loading={studentCourseHook.loading}
        markLessonComplete={studentCourseHook.markLessonComplete}
      />
    );
  }

  return (
    <CourseLearningView 
      courseId={courseId}
      onBack={handleBack}
      course={courseContentHook.course}
      loading={courseContentHook.loading}
    />
  );
};

export default StudentCourses;
