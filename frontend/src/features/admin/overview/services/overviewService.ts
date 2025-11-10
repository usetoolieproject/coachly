export type AdminCustomerStats = {
  totalEducators: number;
  totalStudents: number;
  totalRevenue: number;
  trials: number;
};

import { getApiBase } from '../../../../services/api';

export async function fetchAdminCustomerStats(): Promise<AdminCustomerStats> {
  const url = `${getApiBase()}/public/admin/customer-stats`;
  const res = await fetch(url, { credentials: 'omit' });
  if (!res.ok) {
    let body: any = null;
    try { body = await res.text(); } catch {}
    throw new Error('Failed to load admin stats');
  }
  const json = await res.json();
  return json;
}

// Overview Services
import { Educator, OverviewStats, OverviewChartSeries, OverviewMetric, OverviewTimeframe } from '../types';

export const overviewService = {
  // Get all educators
  getEducators: async (): Promise<Educator[]> => {
    return [];
  },

  // Get overview statistics
  getOverviewStats: async (): Promise<OverviewStats> => {
    return {
      trials: 0,
      educatorsCount: 0,
      studentsTotal: 0,
      totalRevenue: 0
    };
  },

  // Timeseries (live)
  getOverviewChart: async (metric: OverviewMetric, timeframe: OverviewTimeframe): Promise<OverviewChartSeries> => {
    if (metric === 'revenue') {
      const url = `${getApiBase()}/public/admin/overview/revenue-timeseries?timeframe=${encodeURIComponent(timeframe)}`;
      const res = await fetch(url, { credentials: 'omit' });
      if (!res.ok) throw new Error('Failed to load revenue timeseries');
      return await res.json();
    }
    if (metric === 'educators') {
      const url = `${getApiBase()}/public/admin/overview/educators-timeseries?timeframe=${encodeURIComponent(timeframe)}`;
      const res = await fetch(url, { credentials: 'omit' });
      if (!res.ok) throw new Error('Failed to load educators timeseries');
      return await res.json();
    }
    if (metric === 'students') {
      const url = `${getApiBase()}/public/admin/overview/students-timeseries?timeframe=${encodeURIComponent(timeframe)}`;
      const res = await fetch(url, { credentials: 'omit' });
      if (!res.ok) throw new Error('Failed to load students timeseries');
      return await res.json();
    }
    return { metric, points: [] } as any;
  },

  // Update educator status
  updateEducatorStatus: async (educatorId: string, status: string): Promise<void> => {
  },

  // Send message to educators
  sendMessageToEducators: async (message: string, educatorIds?: string[]): Promise<void> => {
  },

  // Export educators data
  
  exportEducatorsData: async (): Promise<void> => {
  }
};
