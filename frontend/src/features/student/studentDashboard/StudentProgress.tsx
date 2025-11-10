import React from 'react';
import { RefreshButton, ExportButton, UpdatingIndicator, TimeRangeSelect } from '../../../components/shared';
import { useTheme } from '../../../contexts/ThemeContext';
import { useStudentDashboardData } from './hooks/useStudentDashboardData';
import TopStats from './components/TopStats';
import CoursesPanel from './components/CoursesPanel';
import CommunityPanel from './components/CommunityPanel';
import UpcomingSessionsPanel from './components/UpcomingSessionsPanel';
import { TopStatsSkeleton, CoursesPanelSkeleton, CommunityPanelSkeleton, UpcomingSessionsPanelSkeleton } from './components/Skeletons';

const StudentProgress: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { 
    loading, 
    isUpdating, 
    error, 
    stats, 
    courses, 
    activities: communityActivity, 
    sessions: liveSessions, 
    timeRange, 
    setTimeRange, 
    refetch 
  } = useStudentDashboardData();

  // No spinner UX: we keep the page shell and show an updating indicator instead

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Error Loading Dashboard</h2>
          <p className="text-gray-600 mt-2">{error}</p>
          <button 
            onClick={refetch}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen w-full ${isDarkMode ? 'bg-gray-950 text-gray-100' : 'bg-slate-50 text-slate-900'}`}>
      <div className="mx-auto max-w-7xl px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header - Mobile First Responsive */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">Dashboard</h1>
            <p className={`mt-1 sm:mt-2 text-sm sm:text-base ${isDarkMode ? 'text-gray-400' : 'text-slate-600'}`}>Track your achievements and learning progress</p>
          </div>

          {/* Controls - Responsive Layout */}
          <div className="flex flex-col gap-3 sm:gap-2">
            {/* Larger screens: Updating indicator → Refresh → Export → Time Range */}
            <div className="hidden lg:flex items-center gap-2">
              <UpdatingIndicator isUpdating={isUpdating} />
              <RefreshButton onClick={refetch} isRefreshing={isUpdating} />
              <ExportButton />
              <TimeRangeSelect 
                value={timeRange}
                onChange={setTimeRange}
              />
            </div>
            
            {/* Smaller screens: Original layout (Updating indicator on row 1, others on row 2) */}
            <div className="flex lg:hidden flex-col gap-3 sm:gap-2">
              {/* Row 1: Updating indicator only */}
              <div className="flex items-center justify-start">
                <UpdatingIndicator isUpdating={isUpdating} />
              </div>
              
              {/* Row 2: Refresh, Export CSV, and Time Range - all 3 fit on iPhone SE */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                <RefreshButton onClick={refetch} isRefreshing={isUpdating} />
                <ExportButton />
                <TimeRangeSelect 
                  value={timeRange}
                  onChange={setTimeRange}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Top Stats - Mobile First Grid */}
        <div className="mt-4 sm:mt-6">
          {(loading || isUpdating) ? (
            <TopStatsSkeleton />
          ) : (
            <TopStats isDarkMode={isDarkMode} stats={stats} />
          )}
        </div>

        {/* Main Content Grid - Mobile First */}
        <div className="mt-4 sm:mt-6 space-y-4 sm:space-y-6">
          {/* Mobile: Stack all panels, Desktop: 3-column grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {(loading || isUpdating) ? (
              <CoursesPanelSkeleton />
            ) : (
              <CoursesPanel isDarkMode={isDarkMode} courses={courses} />
            )}
            
            {(loading || isUpdating) ? (
              <CommunityPanelSkeleton />
            ) : (
              <CommunityPanel isDarkMode={isDarkMode} activities={communityActivity} />
            )}
            
            {(loading || isUpdating) ? (
              <UpcomingSessionsPanelSkeleton />
            ) : (
              <UpcomingSessionsPanel isDarkMode={isDarkMode} sessions={liveSessions} />
            )}
          </div>
        </div> 
      </div>
    </div>
  );
};

export default StudentProgress;