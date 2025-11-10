import React from 'react';
import { Calendar, Mail } from 'lucide-react';
import { ProfilePicture } from '../../../../components/shared';
import { useTheme } from '../../../../contexts/ThemeContext';
import type { StudentDetails } from '../../../../services/instructorStudentService';

export function StudentQuickStats({ student }: { student: StudentDetails }) {
  const { isDarkMode } = useTheme();
  
  const heading = isDarkMode ? 'text-white' : 'text-gray-900';
  const subheading = isDarkMode ? 'text-gray-400' : 'text-gray-600';
  const borderColor = isDarkMode ? 'border-gray-800' : 'border-gray-200';

  return (
    <div className={`rounded-xl shadow-sm border p-4 sm:p-6 ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
      {/* Desktop Layout - Original (lg and above) */}
      <div className="hidden lg:flex lg:items-center lg:gap-6">
        <ProfilePicture src={student.profilePictureUrl} firstName={student.firstName} lastName={student.lastName} size="xl" className="h-20 w-20" />
        <div className="flex-1">
          <h1 className={`text-3xl font-bold ${heading}`}>{student.firstName} {student.lastName}</h1>
          <div className={`flex items-center gap-6 mt-2 ${subheading}`}>
            <div className="flex items-center gap-2"><Mail className="h-4 w-4" />{student.email}</div>
            <div className="flex items-center gap-2"><Calendar className="h-4 w-4" />Joined {new Date(student.joinedDate).toLocaleDateString()}</div>
          </div>
        </div>
      </div>

      {/* Mobile/Tablet Layout - Stacked Design (below lg) */}
      <div className="lg:hidden">
        {/* Row 1: Profile and Basic Info */}
        <div className="flex items-center gap-4 mb-4 sm:mb-6">
          <ProfilePicture src={student.profilePictureUrl} firstName={student.firstName} lastName={student.lastName} size="lg" className="h-16 w-16 sm:h-20 sm:w-20" />
          <div className="flex-1 min-w-0">
            <h1 className={`text-xl sm:text-2xl font-bold ${heading} truncate`}>{student.firstName} {student.lastName}</h1>
            <div className={`text-sm ${subheading} mt-1`}>{student.email}</div>
          </div>
        </div>

        {/* Row 2: Join Date */}
        <div className="mb-4 sm:mb-6">
          <div className={`flex items-center gap-2 ${subheading}`}>
            <Calendar className="h-4 w-4" />
            <span className="text-sm sm:text-base">Joined {new Date(student.joinedDate).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Stats Grid - Responsive */}
      <div className={`grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t ${borderColor}`}>
        <div className="text-center">
          <div className="text-xl sm:text-2xl font-bold text-indigo-500">{student.courses.length}</div>
          <div className={`text-xs sm:text-sm ${subheading}`}>Available Courses</div>
        </div>
        <div className="text-center">
          <div className="text-xl sm:text-2xl font-bold text-green-500">{
            Math.round(((student.courses.reduce((a,c)=>a+c.completedLessons,0)) / (student.courses.reduce((a,c)=>a+c.totalLessons,0) || 1)) * 100)
          }%</div>
          <div className={`text-xs sm:text-sm ${subheading}`}>Overall Progress</div>
        </div>
        <div className="text-center">
          <div className="text-xl sm:text-2xl font-bold text-blue-500">{student.posts.length}</div>
          <div className={`text-xs sm:text-sm ${subheading}`}>Posts Created</div>
        </div>
        <div className="text-center">
          <div className="text-xl sm:text-2xl font-bold text-purple-500">{student.comments.length}</div>
          <div className={`text-xs sm:text-sm ${subheading}`}>Comments Made</div>
        </div>
      </div>
    </div>
  );
}


