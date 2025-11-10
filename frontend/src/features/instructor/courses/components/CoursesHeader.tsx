import React from 'react';
import { UpdatingIndicator, RefreshButton, FilterPills } from '../../../../components/shared';
import { useTheme } from '../../../../contexts/ThemeContext';

interface Props {
  isUpdating: boolean;
  onRefresh: () => void;
  filter: 'all' | 'free' | 'paid';
  onFilterChange: (value: 'all' | 'free' | 'paid') => void;
}

const CoursesHeader: React.FC<Props> = ({ isUpdating, onRefresh, filter, onFilterChange }) => {
  const { isDarkMode } = useTheme();
  return (
    <div className="mb-4 sm:mb-6 lg:mb-8">
      {/* Title Section */}
      <div className="mb-4 sm:mb-6">
        <h1 className={`text-xl sm:text-2xl lg:text-3xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
          Manage Courses
        </h1>
        <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-1 sm:mt-2 text-sm sm:text-base`}>
          Create and manage your course content
        </p>
      </div>
      
      {/* Larger screens: Single row with all controls on the right */}
      <div className="hidden sm:flex items-center justify-end gap-3 mb-3 sm:mb-4">
        <UpdatingIndicator isUpdating={isUpdating} />
        <RefreshButton onClick={onRefresh} />
        <FilterPills value={filter} onChange={onFilterChange} dark={isDarkMode} />
      </div>
      
      {/* Smaller screens: Two rows layout */}
      <div className="flex sm:hidden flex-col gap-3 mb-3 sm:mb-4">
        {/* Row 1: Updating indicator (left) + Refresh button (right) */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <UpdatingIndicator isUpdating={isUpdating} />
          </div>
          <div className="flex items-center">
            <RefreshButton onClick={onRefresh} />
          </div>
        </div>
        
        {/* Row 2: Filter pills (right side) */}
        <div className="flex items-center justify-end">
          <FilterPills value={filter} onChange={onFilterChange} dark={isDarkMode} />
        </div>
      </div>
    </div>
  );
};

export default CoursesHeader;


