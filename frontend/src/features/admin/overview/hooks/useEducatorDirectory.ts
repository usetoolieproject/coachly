import { useEffect,  useState } from 'react';
import { educatorDirectoryService, EducatorListItem } from '../services/educatorDirectoryService';

export function useEducatorDirectory(filters?: { query?: string; status?: string; sort?: string }) {
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(5);
  const [loading, setLoading] = useState<boolean>(false);
  const [items, setItems] = useState<EducatorListItem[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);

  const totalPages = Math.max(1, Math.ceil(totalCount / limit));

  const refresh = async () => {
    setLoading(true);
    try {
      const res = await educatorDirectoryService.list({ page, limit, search: filters?.query || '', status: filters?.status || 'any', sort: filters?.sort || 'signup' });
      setItems(res.items);
      setTotalCount(res.totalCount);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, [page, limit, filters?.status, filters?.query, filters?.sort]);

  return {
    page,
    setPage,
    limit,
    setLimit,
    loading,
    items,
    totalCount,
    totalPages,
    refresh,
  };
}
