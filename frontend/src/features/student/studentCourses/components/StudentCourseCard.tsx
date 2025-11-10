import React from 'react';
import { BookOpen, Play, Tag } from 'lucide-react';
import { StudentCourse } from '../services';

export interface StudentCourseCardProps {
  course: StudentCourse & { progressPercentage?: number; totalLessons?: number; completedAt?: string | null };
  dark?: boolean;
  isProcessing?: boolean;
  onActionClick: (course: StudentCourse) => void;
}

const formatPrice = (price?: number) =>
  typeof price === 'number'
    ? new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
      }).format(price)
    : '';

export const StudentCourseCard: React.FC<StudentCourseCardProps> = ({ course, dark, isProcessing, onActionClick }) => {
  const totalLessons = course.totalLessons || 0;
  const progressPercentage = course.progressPercentage || 0;
  const isPaidCourse = course.type === 'paid';
  const hasPaid = (course as any).isPaid === true;
  const showSubscribe = isPaidCourse && !hasPaid;
  const isCompleted = (course as any).completedAt || progressPercentage === 100;

  return (
    <div
      className={`${dark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl sm:rounded-2xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md border`}
    >
      {/* Thumbnail - Responsive height */}
      <div className={`relative h-24 sm:h-32 ${dark ? 'bg-gradient-to-br from-purple-800 to-blue-800' : 'bg-gradient-to-br from-purple-400 to-blue-500'}`}>
        {course.thumbnail_url ? (
          <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen className="w-12 h-12 text-white opacity-80" />
          </div>
        )}
        <div className="absolute top-1.5 sm:top-2 left-1.5 sm:left-2">
          <div
            className={`inline-flex items-center gap-1 text-xs font-semibold px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-full backdrop-blur-sm ring-1 shadow-md ${
              isPaidCourse
                ? dark
                  ? 'bg-purple-600/95 text-white ring-white/10'
                  : 'bg-white/95 text-purple-700 ring-black/10'
                : dark
                  ? 'bg-emerald-600/95 text-white ring-white/10'
                  : 'bg-white/95 text-emerald-700 ring-black/10'
            }`}
          >
            <Tag className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span className="hidden sm:inline">{isPaidCourse ? (typeof course.price === 'number' ? formatPrice(course.price) : 'Paid') : 'Free'}</span>
            <span className="sm:hidden">{isPaidCourse ? (typeof course.price === 'number' ? formatPrice(course.price) : '$') : 'Free'}</span>
          </div>
        </div>
        {isCompleted && (
          <div className="absolute top-1.5 sm:top-2 right-1.5 sm:right-2">
            <div className={`inline-flex items-center gap-1 text-xs font-semibold px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-full backdrop-blur-sm ring-1 shadow-md ${dark ? 'bg-emerald-600/95 text-white ring-white/10' : 'bg-white/95 text-emerald-700 ring-black/10'}`}>
              <span className="hidden sm:inline">Completed</span>
              <span className="sm:hidden">✓</span>
            </div>
          </div>
        )}
      </div>

      {/* Content - Responsive padding */}
      <div className="p-3 sm:p-4 lg:p-5">
        <div className="mb-2 sm:mb-3">
          <h3 className={`text-base sm:text-lg font-bold line-clamp-2 ${dark ? 'text-gray-100' : 'text-gray-900'}`}>{course.title}</h3>
        </div>

        {course.description && (
          <p className={`${dark ? 'text-gray-400' : 'text-gray-600'} text-xs sm:text-sm line-clamp-2 mb-2 sm:mb-3`}>{course.description}</p>
        )}

        <div className="mb-3 sm:mb-4">
          <div className="flex justify-between items-center mb-1.5 sm:mb-2">
            <span className={`text-xs sm:text-sm font-medium ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Progress</span>
            <span className={`text-xs sm:text-sm font-bold ${dark ? 'text-gray-100' : 'text-gray-900'}`}>{progressPercentage}%</span>
          </div>
          <div className={`w-full ${dark ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-1.5 sm:h-2`}>
            <div
              className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${dark ? 'bg-gradient-to-r from-emerald-500 to-sky-500' : 'bg-gradient-to-r from-green-400 to-blue-500'}`}
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          {course.completedLessons !== undefined && (
            <p className={`text-xs ${dark ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
              {course.completedLessons} of {totalLessons} lessons
            </p>
          )}
        </div>

        <button
          className={`w-full py-2 sm:py-3 px-3 sm:px-5 rounded-lg sm:rounded-xl flex items-center justify-center gap-1.5 sm:gap-2 text-sm sm:text-base font-semibold transition-all duration-200 border shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            showSubscribe
              ? dark
                ? 'bg-gradient-to-r from-fuchsia-600 to-violet-600 hover:from-fuchsia-500 hover:to-violet-500 text-white border-fuchsia-500/40 ring-fuchsia-400/40 focus:ring-fuchsia-400/60'
                : 'bg-gradient-to-r from-fuchsia-500 to-violet-600 hover:from-fuchsia-600 hover:to-violet-700 text-white border-fuchsia-400 ring-fuchsia-300/50 focus:ring-fuchsia-300/70'
              : dark
                ? 'bg-blue-600 hover:bg-blue-500 text-white border-blue-500/40 ring-blue-400/40 focus:ring-blue-400/60'
                : 'bg-blue-600 hover:bg-blue-700 text-white border-blue-400 ring-blue-300/50 focus:ring-blue-300/70'
          } disabled:opacity-60 disabled:cursor-not-allowed`}
          disabled={isProcessing}
          onClick={(e) => {
            e.stopPropagation();
            onActionClick(course);
          }}
          aria-label={showSubscribe ? 'Subscribe to course' : isCompleted ? 'Review course' : progressPercentage > 0 ? 'Continue learning' : 'Start learning'}
        >
          <Play className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="truncate">
            {showSubscribe
              ? isProcessing
                ? 'Redirecting…'
                : `Subscribe${typeof course.price === 'number' ? ` · ${formatPrice(course.price)}` : ''}`
              : isCompleted
                ? 'Review Course'
                : progressPercentage > 0
                  ? 'Continue Learning'
                  : 'Start Learning'}
          </span>
        </button>
      </div>
    </div>
  );
};

export default StudentCourseCard;


