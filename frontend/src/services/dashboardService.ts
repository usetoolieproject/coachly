import { apiFetch } from './api';

export interface DashboardData {
  analytics: {
    totalRevenue: number; // REAL - 0 for free courses
    totalStudents: number; // REAL
    totalCourses: number; // REAL
    avgRating: number; // REAL - based on completion rates
    communityPosts: number; // REAL
    totalLessons: number; // REAL
    totalCompletions: number; // REAL
    totalWatchTime: number; // REAL (in minutes)
    activeStudents: number; // REAL
    totalComments: number; // REAL
    totalLikes: number; // REAL
    studentsGrowth: number; // REAL
    postsGrowth: number; // REAL
  };
  topCourses: Array<{
    id: string;
    title: string;
    course_analytics: {
      total_students: number; // REAL
      avg_rating: number; // REAL
      revenue: number; // REAL
    };
  }>;
  recentActivity: Array<{
    type: string;
    message: string;
    course?: string;
    time: string;
    user?: string;
  }>;
}

export const dashboardService = {
  async getDashboardAnalytics(days: number = 30): Promise<DashboardData> {
    return await apiFetch(`/instructor/dashboard-analytics?days=${days}`);
  },
  async getRevenueTimeseries(days: number = 30): Promise<{ series: Array<{ date: string; value: number }> }> {
    return await apiFetch(`/instructor/revenue-timeseries?days=${days}`);
  },
};