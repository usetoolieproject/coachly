import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchStudentCalls } from '../services/liveCallsService';
import type { Call } from '../types';

export function useStudentLiveCalls(user?: any) {
  const [calls, setCalls] = useState<Call[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const result = await fetchStudentCalls();
      setCalls(result);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const result = await fetchStudentCalls();
      setCalls(result);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      load();
    }
  }, [user, load]);

  // Compute upcoming based on local time: show if end time is in the future
  const visibleCalls = useMemo(() => {
    const now = Date.now();
    const graceMs = 5 * 60 * 1000; // 5 minutes grace period
    return calls.filter((c) => {
      const start = new Date(c.scheduled_at).getTime();
      const end = start + (Math.max(1, c.duration_minutes || 60) * 60 * 1000);
      return end >= now - graceMs;
    });
  }, [calls]);

  const upcomingCount = useMemo(() => visibleCalls.length, [visibleCalls]);
  const totalHours = useMemo(() => visibleCalls.reduce((sum, c) => sum + c.duration_minutes, 0) / 60, [visibleCalls]);

  return { calls: visibleCalls, isLoading, isRefreshing, refresh, upcomingCount, totalHours };
}


