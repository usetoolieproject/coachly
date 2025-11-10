import React from 'react';
import { useTheme } from '../../../../contexts/ThemeContext';

const CourseSkeletonCard: React.FC = () => {
  const { isDarkMode } = useTheme();
  return (
    <div className={`${isDarkMode ? 'bg-gray-800/80 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl shadow-sm border overflow-hidden`}>
      <div className={`relative h-32 ${isDarkMode ? 'bg-gray-700/60' : 'bg-gray-100'} animate-pulse`} />
      <div className="p-5">
        <div className={`h-5 w-2/3 rounded animate-pulse ${isDarkMode ? 'bg-gray-600/70' : 'bg-gray-200'}`} />
        <div className={`mt-3 h-4 w-full rounded animate-pulse ${isDarkMode ? 'bg-gray-700/60' : 'bg-gray-100'}`} />
        <div className={`mt-2 h-4 w-5/6 rounded animate-pulse ${isDarkMode ? 'bg-gray-700/60' : 'bg-gray-100'}`} />
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className={`h-4 rounded animate-pulse ${isDarkMode ? 'bg-gray-700/60' : 'bg-gray-100'}`} />
          <div className={`h-4 rounded animate-pulse ${isDarkMode ? 'bg-gray-700/60' : 'bg-gray-100'}`} />
        </div>
        <div className={`mt-4 h-9 rounded animate-pulse ${isDarkMode ? 'bg-gray-600/70' : 'bg-gray-200'}`} />
      </div>
    </div>
  );
};

export default CourseSkeletonCard;


