import { useMemo, useState } from 'react';
import type React from 'react';
import { dashboardService, DashboardData } from '../../../../services/dashboardService';
import { connectBalanceService, connectRevenueService } from '../services';
import { MessageCircle, PlayCircle, UserPlus, Activity } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

type TimeRange = '7days' | '30days' | '90days';

export function useInstructorDashboard() {
  const [timeRange, setTimeRange] = useState<TimeRange>('30days');
  const daysMap = { '7days': 7, '30days': 30, '90days': 90 } as const;

  const analyticsQuery = useQuery({
    queryKey: ['dashboard-analytics', timeRange],
    queryFn: () => dashboardService.getDashboardAnalytics(daysMap[timeRange]),
    placeholderData: (prev) => prev,
  });

  const balanceQuery = useQuery({
    queryKey: ['connect-balance'],
    queryFn: () => connectBalanceService.getBalance(),
    retry: false, // Don't retry on 400 errors
  });

  // Try Stripe Connect first, fallback to database
  const stripeSeriesQuery = useQuery({
    queryKey: ['stripe-revenue-series', timeRange],
    queryFn: () => connectRevenueService.getTimeseries(daysMap[timeRange]),
    placeholderData: (prev) => prev,
    retry: false,
  });

  const databaseSeriesQuery = useQuery({
    queryKey: ['database-revenue-series', timeRange],
    queryFn: () => dashboardService.getRevenueTimeseries(daysMap[timeRange]),
    placeholderData: (prev) => prev,
  });

  // Use Stripe data if available, otherwise use database data
  const revenueSeries = stripeSeriesQuery.data?.series && stripeSeriesQuery.data.series.length > 0 && stripeSeriesQuery.data.series.some((s: { value: number }) => s.value > 0)
    ? stripeSeriesQuery.data.series
    : (databaseSeriesQuery.data?.series || null);

  const analytics = useMemo(() => {
    const data = analyticsQuery.data as DashboardData | undefined;
    const toUsd = (arr: { amount: number; currency: string }[]) =>
      Math.round((arr.filter(x => x.currency === 'usd').reduce((s, x) => s + (x.amount || 0), 0) / 100) * 100) / 100;
    const liveTotal = balanceQuery.data ? (toUsd(balanceQuery.data.available) + toUsd(balanceQuery.data.pending)) : null;
    
    const databaseRevenue = Number(data?.analytics.totalRevenue) || 0;
    
    // Use live Stripe balance in USD if available and > 0, otherwise fall back to database revenue
    // This handles cases where:
    // 1. Stripe balance is in non-USD currency (liveTotal will be 0)
    // 2. Stripe balance API fails (liveTotal will be null)
    // 3. Stripe balance is 0 (use database revenue as more accurate)
    const totalRevenue = (liveTotal !== null && liveTotal > 0) 
      ? Number(liveTotal) 
      : databaseRevenue;
    
    return {
      totalRevenue,
      totalStudents: Number(data?.analytics.totalStudents) || 0,
      totalCourses: Number(data?.analytics.totalCourses) || 0,
      avgRating: Number(data?.analytics.avgRating) || 0,
      communityPosts: Number(data?.analytics.communityPosts) || 0,
      totalLessons: Number(data?.analytics.totalLessons) || 0,
      totalCompletions: Number(data?.analytics.totalCompletions) || 0,
      totalWatchTime: Number(data?.analytics.totalWatchTime) || 0,
      activeStudents: Number(data?.analytics.activeStudents) || 0,
      totalComments: Number(data?.analytics.totalComments) || 0,
      totalLikes: Number(data?.analytics.totalLikes) || 0,
      studentsGrowth: Number(data?.analytics.studentsGrowth) || 0,
      postsGrowth: Number(data?.analytics.postsGrowth) || 0,
    };
  }, [analyticsQuery.data, balanceQuery.data]);

  const recentActivity = (analyticsQuery.data as DashboardData | undefined)?.recentActivity || [];

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
  };

  const activity = useMemo(() => recentActivity.slice(0, 10).map((act, index) => {
    let icon: React.ReactElement = <Activity className="h-5 w-5 text-gray-600" />;
    let bg = 'from-gray-100 to-gray-50';
    if (act.type === 'student') { icon = <UserPlus className="h-5 w-5 text-sky-600" />; bg = 'from-sky-100 to-sky-50'; }
    else if (act.type === 'content') { icon = <MessageCircle className="h-5 w-5 text-indigo-600" />; bg = 'from-indigo-100 to-indigo-50'; }
    else if (act.type === 'milestone') { icon = <PlayCircle className="h-5 w-5 text-purple-600" />; bg = 'from-purple-100 to-purple-50'; }
    else { icon = <Activity className="h-5 w-5 text-gray-600" />; bg = 'from-gray-100 to-gray-50'; }
    return {
      id: index + 1,
      title: act.message,
      who: act.course ? `${act.user} • ${act.course}` : (act.user || ''),
      when: typeof act.time === 'string' && act.time.includes('T') ? formatTimeAgo(act.time) : (act.time || 'Recently'),
      icon,
      bg,
    };
  }), [recentActivity]);

  // Show skeletons only on first mount when no data exists yet
  const initialLoading = (
    (!analyticsQuery.data && analyticsQuery.isLoading) ||
    (!balanceQuery.data && balanceQuery.isLoading) ||
    (!stripeSeriesQuery.data && !databaseSeriesQuery.data && (stripeSeriesQuery.isLoading || databaseSeriesQuery.isLoading))
  );

  return {
    timeRange,
    setTimeRange,
    analytics,
    revenueSeries,
    topCourses: (analyticsQuery.data as DashboardData | undefined)?.topCourses || [
      { id: '1', title: 'No courses yet', course_analytics: { total_students: 0, avg_rating: 0, revenue: 0 } },
    ],
    activity,
    // Skeletons only on first load; keep previous data during refetch
    loading: initialLoading,
    isUpdating: analyticsQuery.isFetching || balanceQuery.isFetching || stripeSeriesQuery.isFetching || databaseSeriesQuery.isFetching,
    error: analyticsQuery.error ? (analyticsQuery.error as any).message : null,
    refetch: () => Promise.all([
      analyticsQuery.refetch(),
      balanceQuery.refetch(),
      stripeSeriesQuery.refetch(),
      databaseSeriesQuery.refetch(),
    ]),
  } as const;
}


