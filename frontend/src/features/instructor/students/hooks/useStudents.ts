import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { Student } from '../types';
import { studentsService } from '../services/studentsService';

export function useStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<keyof Student>('joinedDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const query = useQuery({
    queryKey: ['instructor-students'],
    queryFn: studentsService.list,
    staleTime: 2 * 60_000,
    gcTime: 10 * 60_000,
  });

  const isLoading = query.isLoading;
  const isRefreshing = query.isFetching && !query.isLoading;
  if (query.data && students !== query.data) {
    // sync local state for filtering/sorting without re-querying
    // minimal setState to avoid loops
    setStudents(query.data as Student[]);
  }
  const refresh = () => query.refetch();

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const temp = !q ? students : students.filter(s => `${s.firstName} ${s.lastName}`.toLowerCase().includes(q) || s.email.toLowerCase().includes(q));
    const sorted = [...temp].sort((a, b) => {
      const aVal = (a as any)[sortField];
      const bVal = (b as any)[sortField];
      if (sortDirection === 'asc') return aVal > bVal ? 1 : -1;
      return aVal < bVal ? 1 : -1;
    });
    return sorted;
  }, [students, search, sortField, sortDirection]);

  const handleSort = (field: keyof Student) => {
    if (sortField === field) setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDirection('desc'); }
  };

  return { students, isLoading, isRefreshing, refresh, filtered, search, setSearch, sortField, sortDirection, handleSort };
}


