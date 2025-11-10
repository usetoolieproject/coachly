import { useState } from 'react';
import { BookOpen, ChevronDown } from 'lucide-react';
import { useTheme } from '../../../../contexts/ThemeContext';
import type { StudentDetails } from '../../../../services/instructorStudentService';

export function StudentCourseProgress({ student }: { student: StudentDetails }) {
  const { isDarkMode } = useTheme();
  const [openByCourseId, setOpenByCourseId] = useState<Record<string, boolean>>({});

  const toggleCourse = (courseId: string) => {
    setOpenByCourseId(prev => ({ ...prev, [courseId]: !prev[courseId] }));
  };
  return (
    <div>
      <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Course Progress</h2>
      <div className="space-y-4">
        {student.courses.map(course => {
          const isOpen = !!openByCourseId[course.id];
          return (
            <div key={course.id} className={`rounded-xl border transition-colors ${isDarkMode ? 'border-gray-800 bg-gray-900 hover:bg-gray-900/80' : 'border-gray-200 bg-white hover:bg-gray-50'}`}>
              <button
                onClick={() => toggleCourse(course.id)}
                className="w-full flex items-center justify-between gap-4 p-5"
                aria-expanded={isOpen}
                aria-controls={`course-panel-${course.id}`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className={`truncate text-base sm:text-lg font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{course.title}</h3>
                    <ChevronDown className={`h-5 w-5 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''} ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className={`w-full rounded-full h-2 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}>
                      <div className={`h-2 rounded-full transition-all duration-300 ${isDarkMode ? 'bg-indigo-500' : 'bg-indigo-600'}`} style={{ width: `${course.progressPercentage}%` }} />
                    </div>
                    <div className="ml-4 text-right">
                      <div className={`text-sm font-semibold ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>{course.progressPercentage}%</div>
                      <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{course.completedLessons}/{course.totalLessons}</div>
                    </div>
                  </div>
                </div>
              </button>
              <div
                id={`course-panel-${course.id}`}
                className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'} overflow-hidden`}
              >
                <div className="min-h-0">
                  <div className="px-5 pb-5 pt-0 space-y-4">
                    {course.modules.map(module => (
                      <div key={module.id} className={`rounded-lg p-4 ${isDarkMode ? 'bg-gray-800/60' : 'bg-gray-50'}`}>
                        <h4 className={`font-medium mb-3 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{module.title}</h4>
                        <div className="space-y-2">
                          {module.lessons.map(lesson => (
                            <div key={lesson.id} className="flex items-center justify-between py-2">
                              <div className="flex items-center gap-3">
                                <div className={`w-2.5 h-2.5 rounded-full ${lesson.progress.completed ? 'bg-green-500' : (isDarkMode ? 'bg-gray-600' : 'bg-gray-300')}`} />
                                <span className={`text-sm ${lesson.progress.completed ? (isDarkMode ? 'text-green-400' : 'text-green-700') : (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>{lesson.title}</span>
                              </div>
                              {lesson.progress.completed && lesson.progress.completedAt && (
                                <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Completed {new Date(lesson.progress.completedAt).toLocaleDateString()}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {student.courses.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className={`text-lg font-medium mb-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>No courses available</h3>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>This student doesn't have access to any courses yet.</p>
        </div>
      )}
    </div>
  );
}


