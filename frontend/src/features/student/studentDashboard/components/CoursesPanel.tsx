import React, { useState } from 'react';
import { ArrowUpRight, BookOpen, Crown, User } from 'lucide-react';
import { ProgressBar } from './ui';
import { DashboardCourseSummary } from '../types';
import { useNavigate } from 'react-router-dom';
import { Pagination } from '../../../../components/shared';

interface Props {
  isDarkMode: boolean;
  courses: DashboardCourseSummary[];
}

const CoursesPanel: React.FC<Props> = ({ isDarkMode, courses }) => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const coursesPerPage = 1;


  const handleViewAll = () => {
    navigate('/student/courses');
  };

  const handleCourseClick = (courseId: string) => {
    // Navigate to the courses page and pass the courseId via route state to avoid flicker
    navigate('/student/courses', { state: { courseId } });
  };

  const totalPages = Math.ceil(courses.length / coursesPerPage);
  const startIndex = (currentPage - 1) * coursesPerPage;
  const endIndex = startIndex + coursesPerPage;
  const currentCourses = courses.slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  return (
    <section className={`rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-sm border min-h-[400px] max-h-[500px] flex flex-col ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
      <header className="mb-4 sm:mb-6 flex items-center justify-between">
        <h2 className="text-lg sm:text-xl font-bold">Courses</h2>
        <button 
          onClick={handleViewAll}
          className={`text-xs sm:text-sm font-medium inline-flex items-center gap-1 sm:gap-1.5 hover:underline transition-colors p-1 sm:p-2 ${isDarkMode ? 'text-purple-300 hover:text-purple-200' : 'text-indigo-600 hover:text-indigo-700'}`}
        >
          <span className="hidden sm:inline">View all</span>
          <span className="sm:hidden">View</span>
          <ArrowUpRight size={12} className="sm:w-3.5 sm:h-3.5" />
        </button>
      </header>
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="space-y-4">
          {currentCourses.map((course) => {
            const progressPercentage = course.progressPercentage || 0;
            const isCompleted = progressPercentage === 100;
            const hasProgress = progressPercentage > 0;
            
            return (
              <div key={course.id} className={`group relative overflow-hidden rounded-lg sm:rounded-xl border transition-all duration-200 ${isDarkMode ? 'border-gray-700 bg-gray-800/50 hover:bg-gray-800 hover:border-gray-600' : 'border-gray-200 bg-gray-50/50 hover:bg-white hover:border-gray-300 hover:shadow-sm'}`}>
                <div className="p-3 sm:p-4">
                  {/* Course Thumbnail at top - Responsive */}
                  <div className="relative mb-3 sm:mb-4">
                    <img 
                      src={course.thumbnail_url || 'https://picsum.photos/seed/course/300/180'} 
                      alt={course.title}
                      className="w-full h-24 sm:h-32 rounded-lg object-cover shadow-sm" 
                    />
                    {course.isPaid && (
                      <div className="absolute top-1.5 sm:top-2 right-1.5 sm:right-2">
                        <Crown className={`h-3 w-3 sm:h-4 sm:w-4 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-500'}`} />
                      </div>
                    )}
                  </div>

                  {/* Course Content below image - More compact */}
                  <div className="space-y-1.5 sm:space-y-2">
                    <h3 className={`font-semibold text-sm sm:text-base leading-tight line-clamp-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                      {course.title}
                    </h3>
                    
                    {course.instructor && (
                      <div className={`flex items-center gap-1 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        <User className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">
                          {course.instructor.firstName} {course.instructor.lastName}
                        </span>
                      </div>
                    )}
                    
                    {/* Progress Section - More compact */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Progress
                        </span>
                        <span className={`text-xs font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                          {progressPercentage}%
                        </span>
                      </div>
                      <ProgressBar 
                        value={progressPercentage} 
                        color={isCompleted ? 'bg-green-500' : (isDarkMode ? 'bg-purple-500' : 'bg-indigo-500')} 
                        dark={isDarkMode} 
                      />
                      <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                        {course.completedLessons || 0} of {course.totalLessons || 0} lessons
                      </div>
                    </div>

                    {/* Button - More compact */}
                    <div className="pt-1">
                      <button 
                        onClick={() => handleCourseClick(course.id)}
                        className={`w-full px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 shadow-sm ${
                          isCompleted 
                            ? (isDarkMode ? 'bg-green-600 hover:bg-green-500 text-white shadow-green-500/25' : 'bg-green-600 hover:bg-green-700 text-white shadow-green-500/25')
                            : (isDarkMode ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-500/25' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/25')
                        }`}
                      >
                        {isCompleted ? 'Review Course' : hasProgress ? 'Continue Learning' : 'Start Learning'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          
          {/* Show empty state if no courses */}
          {courses.length === 0 && (
            <div className={`text-center py-12 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                <BookOpen className={`h-8 w-8 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
              </div>
              <h3 className={`text-lg font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                No courses enrolled yet
              </h3>
              <p className="text-sm">
                Start your learning journey by enrolling in a course
              </p>
            </div>
          )}
        </div>
        
        {/* Pagination Controls - At the bottom of the panel */}
        <div className="mt-auto ">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPrevious={handlePreviousPage}
            onNext={handleNextPage}
          />
        </div>
      </div>
    </section>
  );
};

export default CoursesPanel;


