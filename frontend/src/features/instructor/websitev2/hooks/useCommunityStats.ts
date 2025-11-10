import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../../../../services/api';

export interface CommunityStats {
  totalMembers: number;
  totalCourses: number;
  supportLevel: string;
  activeMembers: number;
  totalPosts: number;
  totalComments: number;
  totalLikes: number;
  membersGrowth: number;
  postsGrowth: number;
}

export interface CommunityStatsResponse {
  stats: CommunityStats;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useCommunityStats(): CommunityStatsResponse {
  const query = useQuery({
    queryKey: ['community-stats', 'dashboard-analytics'],
    queryFn: async (): Promise<CommunityStats> => {
      try {
        // Use the same endpoint as the dashboard to get consistent data
        console.log('useCommunityStats: Fetching dashboard analytics...');
        const dashboardData = await apiFetch('/instructor/dashboard-analytics?days=30');
        console.log('useCommunityStats: Dashboard data:', dashboardData);
        console.log('useCommunityStats: Analytics object:', dashboardData.analytics);
        console.log('useCommunityStats: Total courses from analytics:', dashboardData.analytics?.totalCourses);
        
        return {
          totalMembers: 1000, // Hardcoded to 1k
          totalCourses: dashboardData.analytics?.totalCourses || 1, // Use real data from dashboard
          supportLevel: '24/7',
          activeMembers: dashboardData.analytics?.activeStudents || 0,
          totalPosts: dashboardData.analytics?.communityPosts || 0,
          totalComments: dashboardData.analytics?.totalComments || 0,
          totalLikes: dashboardData.analytics?.totalLikes || 0,
          membersGrowth: dashboardData.analytics?.studentsGrowth || 0,
          postsGrowth: dashboardData.analytics?.postsGrowth || 0,
        };
      } catch (error) {
        console.log('useCommunityStats: Dashboard analytics failed, using fallback:', error);
        // Fallback data if API fails
        return {
          totalMembers: 1000, // Hardcoded to 1k
          totalCourses: 1, // Default to 1 course
          supportLevel: '24/7',
          activeMembers: 0,
          totalPosts: 0,
          totalComments: 0,
          totalLikes: 0,
          membersGrowth: 0,
          postsGrowth: 0,
        };
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    retry: 1,
    placeholderData: (prev) => prev,
  });

  const finalStats = query.data || {
    totalMembers: 1000, // Hardcoded to 1k
    totalCourses: 1, // Default to 1 course
    supportLevel: '24/7',
    activeMembers: 0,
    totalPosts: 0,
    totalComments: 0,
    totalLikes: 0,
    membersGrowth: 0,
    postsGrowth: 0,
  };
  
  console.log('useCommunityStats: Final stats being returned:', finalStats);
  
  return {
    stats: finalStats,
    isLoading: query.isLoading,
    error: query.error ? (query.error as any).message : null,
    refetch: query.refetch,
  };
}
