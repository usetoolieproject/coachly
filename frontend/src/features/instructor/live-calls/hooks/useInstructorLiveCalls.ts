import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Call } from '../types';
import { fetchInstructorCalls, saveInstructorCall, deleteInstructorCall } from '../services/liveCallsService';

export function useInstructorLiveCalls(user?: any) {
  const [calls, setCalls] = useState<Call[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const result = await fetchInstructorCalls();
      setCalls(result);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const result = await fetchInstructorCalls();
      setCalls(result);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  const upsert = useCallback(async (payload: Partial<Call>) => {
    const saved = await saveInstructorCall(payload);
    await refresh();
    return saved;
  }, [refresh]);

  const remove = useCallback(async (id: string) => {
    await deleteInstructorCall(id);
    await refresh();
  }, [refresh]);

  useEffect(() => { if (user) { load(); } }, [user, load]);

  // Derived
  const visibleCalls = useMemo(() => {
    const now = Date.now();
    const graceMs = 5 * 60 * 1000;
    return calls.filter((c) => {
      const start = new Date(c.scheduled_at).getTime();
      const end = start + (Math.max(1, c.duration_minutes || 60) * 60 * 1000);
      return end >= now - graceMs;
    });
  }, [calls]);

  return { calls: visibleCalls, isLoading, isRefreshing, refresh, upsert, remove };
}


