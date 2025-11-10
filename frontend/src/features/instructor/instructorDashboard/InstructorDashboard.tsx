import React from 'react';
import { useInstructorDashboard } from './hooks/useInstructorDashboard';
import { useExportDashboardCsv } from './hooks/useExportDashboardCsv';
import BackgroundBlobs from './components/BackgroundBlobs';
import DashboardHeader from './components/DashboardHeader';
import StatsCards from './components/StatsCards';
import RevenueOverview from './components/RevenueOverview';
import TopCoursesList from './components/TopCoursesList';
import RecentActivity from './components/RecentActivity';
import QuickActions from './components/QuickActions';
import { StatsCardsSkeleton, RevenueOverviewSkeleton, TopCoursesSkeleton, RecentActivitySkeleton, QuickActionsSkeleton } from './components/Skeletons';
import { PromoCodeHandler } from '../../../components/PromoCodeHandler';

const InstructorDashboard: React.FC = () => {
  const {
    timeRange,
    setTimeRange,
    analytics,
    revenueSeries,
    topCourses,
    activity,
    loading,
    isUpdating,
    error,
    refetch,
  } = useInstructorDashboard();

  const { exportCsv } = useExportDashboardCsv({ analytics, topCourses, activity });

  // No page-level spinner; content always renders, with a tiny updating indicator managed below

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
    <div className="relative min-h-screen w-full overflow-hidden">
      <PromoCodeHandler />
      <BackgroundBlobs />

      {/* Mobile-first responsive container */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header Section */}
        <DashboardHeader 
          timeRange={timeRange} 
          onTimeRangeChange={setTimeRange}
          onRefresh={refetch}
          onExport={exportCsv}
          isUpdating={isUpdating}
        />

        {/* Stats Cards - Responsive Grid */}
        <div className="mt-4 sm:mt-6">
          {(loading || isUpdating) ? (
            <StatsCardsSkeleton />
          ) : (
            <StatsCards analytics={analytics} />
          )}
        </div>

        {/* Main Content Grid - Mobile First */}
        <div className="mt-4 sm:mt-6 space-y-4 sm:space-y-6">
          {/* Revenue & Courses Row */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
            {(loading || isUpdating) ? (
              <RevenueOverviewSkeleton />
            ) : (
              <RevenueOverview 
                analytics={analytics} 
                series={revenueSeries || undefined} 
                timeRange={timeRange} 
                onTimeRangeChange={setTimeRange} 
              />
            )}
            {(loading || isUpdating) ? <TopCoursesSkeleton /> : <TopCoursesList topCourses={topCourses} />}
          </div>

          {/* Activity & Actions Row - Responsive Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="lg:col-span-2">
              {(loading || isUpdating) ? <RecentActivitySkeleton /> : <RecentActivity activity={activity} />}
            </div>
            <div className="lg:col-span-1">
              {(loading || isUpdating) ? <QuickActionsSkeleton /> : <QuickActions />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructorDashboard;


