import React from 'react';
import { useTheme } from '../../../../components/../contexts/ThemeContext';
import { UpdatingIndicator, RefreshButton, ExportButton, TimeRangeSelect } from '../../../../components/shared';

interface Props {
  timeRange: '7days' | '30days' | '90days';
  onTimeRangeChange: (range: '7days' | '30days' | '90days') => void;
  onRefresh: () => void;
  onExport: () => void;
  isUpdating?: boolean;
}

const DashboardHeader: React.FC<Props> = ({ timeRange, onTimeRangeChange, onRefresh, onExport, isUpdating }) => {
  const { isDarkMode } = useTheme();
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
      {/* Header Content */}
      <div className="flex-1 min-w-0">
        <h1 className={`text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
          Dashboard
        </h1>
        <p className={`text-sm sm:text-base mt-1 sm:mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Welcome back! Here's what's happening with your business.
        </p>
      </div>
      
      {/* Controls - Responsive Layout */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-2">
        {/* Mobile: Full width controls, Desktop: Compact */}
        <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-3">
          {/* Updating Indicator */}
          <div className="w-6 sm:w-24 flex items-center justify-start">
            <UpdatingIndicator isUpdating={isUpdating} />
          </div>
          
        </div>
        
        {/* Action Buttons - Touch friendly */}
        <div className="flex items-center gap-2 sm:gap-2">
          <RefreshButton onClick={onRefresh} />
          <ExportButton onClick={onExport} />
          <TimeRangeSelect 
            value={timeRange}
            onChange={onTimeRangeChange}
            options={[
              { value: '7days' as const, label: '7 days' },
              { value: '30days' as const, label: '30 days' },
              { value: '90days' as const, label: '90 days' },
            ]}
          />
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;


