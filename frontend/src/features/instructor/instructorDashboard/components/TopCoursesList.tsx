import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TopCourse {
  id: string;
  title: string;
  course_analytics: { total_students: number; avg_rating: number; revenue: number };
}

const TopCoursesList: React.FC<{ topCourses: TopCourse[] }> = ({ topCourses }) => {
  const navigate = useNavigate();
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="p-4 sm:p-6 pb-2">
        <h3 className="text-base sm:text-lg text-slate-800 font-semibold">Top Performing Courses</h3>
      </div>
      <div className="p-4 sm:p-6 pt-0 space-y-3">
        {topCourses.map((course, index) => (
          <div key={course.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-gray-200 p-3 sm:p-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <span className="rounded-full px-2 py-1 bg-indigo-500 text-white text-xs sm:text-sm font-medium flex-shrink-0">#{index + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-800 text-sm sm:text-base truncate">{course.title}</p>
                <div className="text-xs text-slate-500 mt-1 flex flex-wrap gap-2">
                  <span>{course.course_analytics.total_students} students</span>
                  <span>•</span>
                  <span>★ {course.course_analytics.avg_rating.toFixed(1)}</span>
                  <span>•</span>
                  <span>${course.course_analytics.revenue}</span>
                </div>
              </div>
            </div>
            <button 
              onClick={() => navigate('/coach/courses', { state: { courseId: course.id } })}
              className="gap-1 sm:gap-2 text-indigo-600 hover:bg-gray-50 p-2 rounded flex items-center justify-center text-sm font-medium self-start sm:self-auto"
            >
              <span className="hidden sm:inline">View</span>
              <span className="sm:hidden">View Course</span>
              <ArrowUpRight className="h-3 w-3 sm:h-4 sm:w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopCoursesList;


