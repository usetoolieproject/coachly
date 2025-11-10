import { useMemo, useState } from 'react';
import { useAuth } from '../../../../contexts/AuthContext';
import { fetchCoursesWithProgress, fetchCommunityActivityForUser, fetchLiveCalls, toCommunityFeed, formatSessionTime, fetchStudentStats } from '../services/dashboardService';
import { useQuery } from '@tanstack/react-query';

export function useStudentDashboardData() {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  // React Query hooks for data fetching
  const coursesQuery = useQuery({
    queryKey: ['student-courses'],
    queryFn: fetchCoursesWithProgress,
    enabled: !!user,
    placeholderData: (prev) => prev,
  });

  const communityQuery = useQuery({
    queryKey: ['student-community', user?.id],
    queryFn: () => fetchCommunityActivityForUser(user!.id),
    enabled: !!user,
    placeholderData: (prev) => prev,
  });

  const liveCallsQuery = useQuery({
    queryKey: ['student-live-calls'],
    queryFn: fetchLiveCalls,
    enabled: !!user,
    placeholderData: (prev) => prev,
  });

  const statsQuery = useQuery({
    queryKey: ['student-stats'],
    queryFn: fetchStudentStats,
    enabled: !!user,
    placeholderData: (prev) => prev,
  });

  // Memoized computed values
  const stats = useMemo(() => {
    const statsData: any = statsQuery.data;
    // Deltas removed per request
    return {
      coursesEnrolled: statsData?.coursesEnrolled ?? 0,
      coursesCompleted: statsData?.coursesCompleted ?? 0,
      totalHours: 0,
      currentStreak: statsData?.currentStreak ?? 0
    } as const;
  }, [statsQuery.data]);

  // Build feed from ALL community posts (not just the user's)
  const activities = useMemo(() => {
    const posts = communityQuery.data;
    if (!posts) return [];
    return toCommunityFeed(posts).slice(0, 6);
  }, [communityQuery.data]);

  const sessions = useMemo(() => {
    const calls = liveCallsQuery.data as any[] | undefined;
    if (!calls) return [];
    // Align with live-calls page visibility and ordering
    const now = Date.now();
    const graceMs = 5 * 60 * 1000;
    const upcoming = calls.filter((c: any) => {
      const start = new Date(c.scheduled_at).getTime();
      const end = start + (Math.max(1, c.duration_minutes || 60) * 60 * 1000);
      return end >= now - graceMs;
    }).sort((a: any, b: any) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());

    return upcoming.slice(0, 2).map((call: any) => ({
      id: call.id,
      title: call.title,
      when: formatSessionTime(call.scheduled_at),
      host: 'Instructor',
      duration_minutes: call.duration_minutes,
      is_registered: call.is_registered,
    }));
  }, [liveCallsQuery.data]);

  // Show skeletons only on first mount when no data exists yet
  const initialLoading = (
    (!coursesQuery.data && coursesQuery.isLoading) ||
    (!communityQuery.data && communityQuery.isLoading) ||
    (!liveCallsQuery.data && liveCallsQuery.isLoading) ||
    (!statsQuery.data && statsQuery.isLoading)
  );

  return {
    timeRange,
    setTimeRange,
    stats,
    courses: coursesQuery.data || [],
    activities,
    sessions,
    // Skeletons only on first load; keep previous data during refetch
    loading: initialLoading,
    isUpdating: coursesQuery.isFetching || communityQuery.isFetching || liveCallsQuery.isFetching || statsQuery.isFetching,
    error: coursesQuery.error || communityQuery.error || liveCallsQuery.error || statsQuery.error ? 'Failed to load dashboard data' : null,
    refetch: () => Promise.all([
      coursesQuery.refetch(),
      communityQuery.refetch(),
      liveCallsQuery.refetch(),
      statsQuery.refetch(),
    ]),
  } as const;
}


