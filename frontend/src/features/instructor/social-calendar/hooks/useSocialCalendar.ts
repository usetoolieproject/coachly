import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { SocialPost } from '../types';
import { socialCalendarService } from '../services/socialCalendarService';

export function useSocialCalendar() {
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ['instructor-social-posts'], queryFn: socialCalendarService.list, staleTime: 2*60_000 });

  const upsert = useMutation({
    mutationFn: (p: Partial<SocialPost>) => socialCalendarService.upsert(p),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['instructor-social-posts'] }); }
  });

  const remove = useMutation({
    mutationFn: (id: string) => socialCalendarService.remove(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['instructor-social-posts'] }); }
  });

  const isLoading = query.isLoading;
  const isRefreshing = query.isFetching && !query.isLoading;
  const posts = query.data || [];

  const byDate = useMemo(() => {
    const map: Record<string, SocialPost[]> = {};
    for (const p of posts) {
      if (!map[p.date]) map[p.date] = [];
      map[p.date].push(p);
    }
    return map;
  }, [posts]);

  return { posts, byDate, isLoading, isRefreshing, refresh: () => query.refetch(), upsert, remove };
}


