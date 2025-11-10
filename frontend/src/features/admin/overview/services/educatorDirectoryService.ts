import { getApiBase } from '../../../../services/api';

export interface EducatorListItem {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  status: 'paid' | 'trial';
  country?: string;
  lastLogin?: string; // ISO string if available
  students?: number;
  createdAt: string;
}

export interface EducatorListResponse {
  items: EducatorListItem[];
  totalCount: number;
  page: number;
  limit: number;
}

export const educatorDirectoryService = {
  async list(params: { page?: number; limit?: number; search?: string; status?: string; sort?: string } = {}): Promise<EducatorListResponse> {
    const query = new URLSearchParams();
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    if (params.search) query.set('search', params.search);
    if (params.status) query.set('status', params.status);
    if (params.sort) query.set('sort', params.sort);
    const url = `${getApiBase()}/public/admin/overview/educators${query.toString() ? `?${query.toString()}` : ''}`;
    const res = await fetch(url, { credentials: 'omit' });
    if (!res.ok) throw new Error('Failed to load educators');
    return await res.json();
  },
};
