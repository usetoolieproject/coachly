export interface DashboardStats {
  coursesEnrolled: number;
  coursesCompleted: number;
  totalHours: number;
  currentStreak: number;
}

export interface DashboardCourseSummary {
  id: string;
  title: string;
  thumbnail_url?: string | null;
  progressPercentage?: number;
  completedLessons?: number;
  totalLessons?: number;
  isPaid?: boolean;
  instructor?: {
    firstName: string;
    lastName: string;
    businessName?: string;
  };
}

export type CommunityActivityType = 'post' | 'comment' | 'badge';

export interface CommunityActivityItem {
  id: string;
  type: CommunityActivityType;
  actor: string;
  text: string;
  time: string;
  category?: string;
  likeCount?: number;
  commentCount?: number;
}

export interface LiveSessionItem {
  id: string;
  title: string;
  when: string;
  host: string;
  duration_minutes: number;
  is_registered: boolean;
}

