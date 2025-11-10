import type React from 'react';
export type { DashboardData } from '../../../../services/dashboardService';

export interface ActivityViewItem {
  id: number;
  title: string;
  who: string;
  when: string;
  icon: React.ReactElement;
  bg: string;
}

export interface TopCourseViewItem {
  id: string;
  title: string;
  course_analytics: {
    total_students: number;
    avg_rating: number;
    revenue: number;
  };
}


