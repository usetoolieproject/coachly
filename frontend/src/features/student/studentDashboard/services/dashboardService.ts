import { CommunityActivityItem,  DashboardCourseSummary } from '../types';

function getApiBaseUrl(): string {
  if (typeof window !== 'undefined' && /usecoachly\.com$/.test(window.location.hostname.toLowerCase())) return '/api';
  return import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'http://localhost:8000/api';
}

const withCreds = (init: RequestInit = {}): RequestInit => ({ credentials: 'include', ...init });

export async function fetchCoursesWithProgress(): Promise<DashboardCourseSummary[]> {
  const res = await fetch(`${getApiBaseUrl()}/student/courses/enrolled`, withCreds());
  if (!res.ok) return [];
  return res.json();
}

export async function fetchStudentStats(): Promise<{ coursesEnrolled: number; coursesCompleted: number; currentStreak: number }> {
  const res = await fetch(`${getApiBaseUrl()}/student/dashboard/stats`, withCreds());
  if (!res.ok) return { coursesEnrolled: 0, coursesCompleted: 0, currentStreak: 0 };
  return res.json();
}

export async function fetchCommunityActivityForUser(userId: string): Promise<any[]> {
  if (!userId) return [];
  const res = await fetch(`${getApiBaseUrl()}/community/posts`, withCreds());
  if (!res.ok) return [];
  return res.json();
}

export async function fetchLiveCalls(): Promise<any[]> {
  const res = await fetch(`${getApiBaseUrl()}/student/live-calls`, withCreds());
  if (!res.ok) return [];
  return res.json();
}

export function toActivityList(posts: any[], userId: string): CommunityActivityItem[] {
  const activities: CommunityActivityItem[] = [];
  const userPosts = posts.filter((p: any) => p.users?.id === userId);
  userPosts.slice(0, 2).forEach((post: any) =>
    activities.push({
      id: `post-${post.id}`,
      type: 'post',
      actor: 'You',
      text: `posted "${post.content.slice(0, 50)}${post.content.length > 50 ? '...' : ''}" in ${post.category}`,
      time: post.created_at,
      category: post.category,
      likeCount: post.like_count,
      commentCount: post.comments?.length || 0,
    })
  );
  posts.forEach((post: any) => {
    if (post.comments) {
      const userComments = post.comments.filter((c: any) => c.users?.id === userId);
      userComments.slice(0, 1).forEach((comment: any) =>
        activities.push({ id: `comment-${comment.id}`, type: 'comment', actor: 'You', text: 'commented on a post', time: comment.created_at, likeCount: comment.like_count || 0 })
      );
    }
  });
  return activities;
}

// Build a generic community feed from ALL posts (not only the current user's)
export function toCommunityFeed(posts: any[]): CommunityActivityItem[] {
  const activities: CommunityActivityItem[] = [];
  (posts || []).forEach((post: any) => {
    const actorName = post.users?.first_name || post.user?.first_name || 'Member';
    const category = post.category || 'general';
    const preview = typeof post.content === 'string' ? post.content.slice(0, 50) + (post.content.length > 50 ? '...' : '') : '';
    activities.push({
      id: post.id,
      type: 'post',
      actor: actorName,
      text: `posted "${preview}" in ${category}`,
      time: post.created_at,
      category,
      likeCount: post.like_count,
      commentCount: post.comments?.length || 0,
    });
  });
  // newest first
  return activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
}

export function formatSessionTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  let dayPart = '';
  if (date.toDateString() === now.toDateString()) dayPart = 'Today';
  else if (date.toDateString() === tomorrow.toDateString()) dayPart = 'Tomorrow';
  else dayPart = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  const timePart = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  return `${dayPart}, ${timePart}`;
}

