import { useCallback } from 'react';

interface Analytics {
  totalRevenue: number;
  totalStudents: number;
  totalCourses: number;
  avgRating: number;
  communityPosts: number;
  totalLessons: number;
  totalCompletions: number;
  totalWatchTime: number;
  activeStudents: number;
  totalComments: number;
  totalLikes: number;
  studentsGrowth: number;
  postsGrowth: number;
}

interface TopCourse {
  id: string;
  title: string;
  course_analytics: { total_students: number; avg_rating: number; revenue: number };
}

interface ActivityItem {
  id: number;
  title: string;
  who: string;
  when: string;
}

export function useExportDashboardCsv({ analytics, topCourses, activity }: {
  analytics: Analytics;
  topCourses: TopCourse[];
  activity: ActivityItem[];
}) {
  const exportCsv = useCallback(() => {
    const rows: string[] = [];
    rows.push('Dashboard Analytics Export');
    rows.push(`Generated: ${new Date().toLocaleString()}`);
    rows.push('');
    rows.push('ANALYTICS');
    rows.push('Metric,Value');
    rows.push(`Total Revenue,$${analytics.totalRevenue}`);
    rows.push(`Total Students,${analytics.totalStudents}`);
    rows.push(`Active Courses,${analytics.totalCourses}`);
    rows.push(`Engagement Rate,${analytics.avgRating.toFixed(1)}/5`);
    rows.push(`Community Posts,${analytics.communityPosts}`);
    rows.push(`Total Lessons,${analytics.totalLessons}`);
    rows.push(`Total Completions,${analytics.totalCompletions}`);
    rows.push(`Total Watch Time,${analytics.totalWatchTime} minutes`);
    rows.push(`Active Students,${analytics.activeStudents}`);
    rows.push(`Total Comments,${analytics.totalComments}`);
    rows.push(`Total Likes,${analytics.totalLikes}`);
    rows.push(`Students Growth,${analytics.studentsGrowth}%`);
    rows.push(`Posts Growth,${analytics.postsGrowth}%`);
    rows.push('');
    rows.push('TOP PERFORMING COURSES');
    rows.push('Rank,Course Title,Students,Rating,Revenue');
    topCourses.forEach((course, index) => {
      rows.push(`${index + 1},"${course.title}",${course.course_analytics.total_students},${course.course_analytics.avg_rating.toFixed(1)},$${course.course_analytics.revenue}`);
    });
    rows.push('');
    rows.push('RECENT ACTIVITY');
    rows.push('Title,Who,When');
    activity.forEach(item => {
      rows.push(`"${item.title}","${item.who}","${item.when}"`);
    });
    const csv = rows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `dashboard-analytics-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [analytics, topCourses, activity]);

  return { exportCsv } as const;
}


