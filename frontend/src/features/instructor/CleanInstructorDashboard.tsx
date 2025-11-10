import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardService, DashboardData } from '../../services/dashboardService';
import { StatsCardsSkeleton, RevenueOverviewSkeleton, TopCoursesSkeleton, RecentActivitySkeleton, QuickActionsSkeleton } from './instructorDashboard/components/Skeletons';
import { PromoCodeHandler } from '../../components/PromoCodeHandler';
import {
  CalendarClock,
  RefreshCw,
  Download,
  DollarSign,
  Users,
  BookOpen,
  Activity,
  Sparkles,
  TrendingUp,
  PlusCircle,
  BarChart3,
  ArrowUpRight,
  MessageCircle,
  PlayCircle,
  UserPlus,
} from "lucide-react";

const CleanInstructorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'7days' | '30days' | '90days'>('30days'); 

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const daysMap = { '7days': 7, '30days': 30, '90days': 90 };
      const data = await dashboardService.getDashboardAnalytics(daysMap[timeRange]);
      setDashboardData(data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Use real data if available, fallback to zeros
  const analytics = dashboardData?.analytics || {
    totalRevenue: 0,
    totalStudents: 0,
    totalCourses: 0,
    avgRating: 0,
    communityPosts: 0,
    totalLessons: 0,
    totalCompletions: 0,
    totalWatchTime: 0,
    activeStudents: 0,
    totalComments: 0,
    totalLikes: 0,
    studentsGrowth: 0,
    postsGrowth: 0
  };

  const topCourses = dashboardData?.topCourses || [
    {
      id: "1",
      title: "No courses yet",
      course_analytics: { total_students: 0, avg_rating: 0, revenue: 0 }
    }
  ];

  const recentActivity = dashboardData?.recentActivity || [];

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} min ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)} hours ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)} days ago`;
    }
  };

  const exportDashboardData = () => {
    if (!dashboardData) return;

    // Prepare CSV content
    const csvRows = [];
    
    // Header
    csvRows.push('Dashboard Analytics Export');
    csvRows.push(`Generated: ${new Date().toLocaleString()}`);
    csvRows.push('');
    
    // Analytics section
    csvRows.push('ANALYTICS');
    csvRows.push('Metric,Value');
    csvRows.push(`Total Revenue,$${analytics.totalRevenue}`);
    csvRows.push(`Total Students,${analytics.totalStudents}`);
    csvRows.push(`Active Courses,${analytics.totalCourses}`);
    csvRows.push(`Engagement Rate,${analytics.avgRating.toFixed(1)}/5`);
    csvRows.push(`Community Posts,${analytics.communityPosts}`);
    csvRows.push(`Total Lessons,${analytics.totalLessons}`);
    csvRows.push(`Total Completions,${analytics.totalCompletions}`);
    csvRows.push(`Total Watch Time,${analytics.totalWatchTime} minutes`);
    csvRows.push(`Active Students,${analytics.activeStudents}`);
    csvRows.push(`Total Comments,${analytics.totalComments}`);
    csvRows.push(`Total Likes,${analytics.totalLikes}`);
    csvRows.push(`Students Growth,${analytics.studentsGrowth}%`);
    csvRows.push(`Posts Growth,${analytics.postsGrowth}%`);
    csvRows.push('');
    
    // Top Courses section
    csvRows.push('TOP PERFORMING COURSES');
    csvRows.push('Rank,Course Title,Students,Rating,Revenue');
    topCourses.forEach((course, index) => {
      csvRows.push(
        `${index + 1},"${course.title}",${course.course_analytics.total_students},${course.course_analytics.avg_rating.toFixed(1)},$${course.course_analytics.revenue}`
      );
    });
    csvRows.push('');
    
    // Recent Activity section
    csvRows.push('RECENT ACTIVITY');
    csvRows.push('Type,Message,User,Course,Time');
    recentActivity.forEach(activity => {
      const time = typeof activity.time === 'string' && activity.time.includes('T') 
        ? new Date(activity.time).toLocaleString() 
        : activity.time;
      csvRows.push(
        `${activity.type},"${activity.message}","${activity.user}","${activity.course || 'N/A'}","${time}"`
      );
    });

    // Create CSV content
    const csvContent = csvRows.join('\n');
    
    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `dashboard-analytics-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Create activity array with real data
  const activity = recentActivity.slice(0, 10).map((act, index) => {
    let icon, bg;
    
    if (act.type === 'student') {
      icon = <UserPlus className="h-5 w-5 text-sky-600" />;
      bg = "from-sky-100 to-sky-50";
    } else if (act.type === 'content') {
      icon = <MessageCircle className="h-5 w-5 text-indigo-600" />;
      bg = "from-indigo-100 to-indigo-50";
    } else if (act.type === 'milestone') {
      icon = <PlayCircle className="h-5 w-5 text-purple-600" />;
      bg = "from-purple-100 to-purple-50";
    } else {
      icon = <Activity className="h-5 w-5 text-gray-600" />;
      bg = "from-gray-100 to-gray-50";
    }

    return {
      id: index + 1,
      title: act.message,
      who: act.course ? `${act.user} • ${act.course}` : act.user,
      when: typeof act.time === 'string' && act.time.includes('T') ? formatTimeAgo(act.time) : act.time || 'Recently',
      icon,
      bg
    };
  });

  if (loading) {
    return (
      <div className="relative min-h-screen w-full overflow-hidden">
        {/* Background blobs */}
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-36 -left-40 h-[28rem] w-[28rem] rounded-full bg-gradient-to-br from-indigo-200 to-cyan-100 blur-3xl opacity-60" />
          <div className="absolute -right-40 top-24 h-[26rem] w-[26rem] rounded-full bg-gradient-to-br from-fuchsia-200 to-indigo-100 blur-3xl opacity-50" />
          <div className="absolute left-1/4 bottom-[-6rem] h-[20rem] w-[20rem] rounded-full bg-gradient-to-br from-rose-100 to-amber-100 blur-3xl opacity-50" />
        </div>

        {/* Top Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-96 bg-gray-200 rounded animate-pulse mt-2" />
            </div>
            <div className="flex items-center gap-2">
              <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
              <div className="h-10 w-24 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>

          {/* Stats Row */}
          <StatsCardsSkeleton />

          {/* Middle Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
            <RevenueOverviewSkeleton />
            <TopCoursesSkeleton />
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
            <RecentActivitySkeleton />
            <QuickActionsSkeleton />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Error Loading Dashboard</h2>
          <p className="text-gray-600 mt-2">{error}</p>
          <button 
            onClick={fetchDashboardData}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <PromoCodeHandler />
      {/* Background blobs */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-36 -left-40 h-[28rem] w-[28rem] rounded-full bg-gradient-to-br from-indigo-200 to-cyan-100 blur-3xl opacity-60" />
        <div className="absolute -right-40 top-24 h-[26rem] w-[26rem] rounded-full bg-gradient-to-br from-fuchsia-200 to-indigo-100 blur-3xl opacity-50" />
        <div className="absolute left-1/4 bottom-[-6rem] h-[20rem] w-[20rem] rounded-full bg-gradient-to-br from-rose-100 to-amber-100 blur-3xl opacity-50" />
      </div>

      {/* Top Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-2">Welcome back! Here's what's happening with your business.</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as '7days' | '30days' | '90days')}
                className="border border-gray-200 bg-white rounded-md px-3 py-2 text-sm text-slate-600 hover:bg-gray-50 appearance-none pr-8 cursor-pointer"
              >
                <option value="7days">Last 7 days</option>
                <option value="30days">Last 30 days</option>
                <option value="90days">Last 90 days</option>
              </select>
              <CalendarClock className="h-4 w-4 text-indigo-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            <button 
              onClick={fetchDashboardData}
              className="border border-gray-200 bg-white rounded-md px-3 py-2 text-sm gap-2 text-slate-600 hover:bg-gray-50 flex items-center"
            >
              <RefreshCw className="h-4 w-4 text-teal-500" /> Refresh
            </button>
            <button 
              onClick={exportDashboardData}
              className="border border-gray-200 bg-white rounded-md px-3 py-2 text-sm gap-2 text-slate-600 hover:bg-gray-50 flex items-center"
            >
              <Download className="h-4 w-4 text-rose-500" /> Export
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mt-6">
          <div className="shadow-sm border-l-4 border-emerald-500 bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-gray-500">Total Revenue</p>
                <div className="flex items-center gap-2 mt-2">
                  <h3 className="text-2xl font-semibold leading-none">${analytics.totalRevenue}</h3>
                </div>
              </div>
              <div className="p-2 rounded-2xl bg-gray-100"><DollarSign className="h-5 w-5 text-emerald-500" /></div>
            </div>
          </div>

          <div className="shadow-sm border-l-4 border-indigo-500 bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-gray-500">Total Students</p>
                <div className="flex items-center gap-2 mt-2">
                  <h3 className="text-2xl font-semibold leading-none">{analytics.totalStudents}</h3>
                </div>
              </div>
              <div className="p-2 rounded-2xl bg-gray-100"><Users className="h-5 w-5 text-indigo-500" /></div>
            </div>
          </div>

          <div className="shadow-sm border-l-4 border-purple-500 bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-gray-500">Active Courses</p>
                <div className="flex items-center gap-2 mt-2">
                  <h3 className="text-2xl font-semibold leading-none">
                    <span className="inline-flex items-center gap-1">{analytics.totalCourses} <span className="text-xs text-gray-500">courses</span></span>
                  </h3>
                </div>
              </div>
              <div className="p-2 rounded-2xl bg-gray-100"><BookOpen className="h-5 w-5 text-purple-500" /></div>
            </div>
          </div>

          <div className="shadow-sm border-l-4 border-orange-500 bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-gray-500">Engagement Rate</p>
                <div className="flex items-center gap-2 mt-2">
                  <h3 className="text-2xl font-semibold leading-none">
                    {analytics.avgRating.toFixed(1)}<span className="text-gray-500">/5</span>
                  </h3>
                </div>
              </div>
              <div className="p-2 rounded-2xl bg-gray-100"><Activity className="h-5 w-5 text-orange-500" /></div>
            </div>
          </div>

          <div className="shadow-sm border-l-4 border-pink-500 bg-white rounded-lg border border-gray-200 p-4">
            <div className="h-full flex items-center justify-center">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Sparkles className="h-4 w-4 text-pink-500" />
                <span>{analytics.totalCompletions} completed lessons</span>
              </div>
            </div>
          </div>
        </div>

        {/* Middle Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
          {/* Revenue Overview */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="flex flex-row items-start justify-between space-y-0 p-6 pb-2">
              <div>
                <h3 className="text-slate-800 font-semibold">Revenue Overview</h3>
                <p className="text-slate-500">Interactive chart with your revenue trends</p>
              </div>
              <button className="text-indigo-600 p-0 hover:underline text-sm">View Details</button>
            </div>
            <div className="p-6 pt-0">
              <div className="h-56">
                <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 text-indigo-600 mx-auto mb-2" />
                    <p className="text-gray-600">Revenue chart visualization</p>
                    <p className="text-sm text-gray-500">Interactive chart would be rendered here</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-6 text-center">
                <div className="flex flex-col items-center justify-center">
                  <p className="text-sm text-slate-500">This Month</p>
                  <p className="text-xl font-semibold text-slate-800">${analytics.totalRevenue}</p>
                </div>
                <div className="flex flex-col items-center justify-center">
                  <p className="text-sm text-slate-500">Last Month</p>
                  <p className="text-xl font-semibold text-slate-800">${Math.floor(analytics.totalRevenue * 0.85)}</p>
                </div>
                <div className="flex flex-col items-center justify-center">
                  <p className="text-sm text-slate-500">Growth</p>
                  <div className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                    <TrendingUp className="h-4 w-4" /> +17.6%
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Top Performing Courses */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-6 pb-2">
              <h3 className="text-base text-slate-800 font-semibold">Top Performing Courses</h3>
            </div>
            <div className="p-6 pt-0 space-y-3">
              {topCourses.map((course, index) => (
                <div key={course.id} className="flex items-center justify-between rounded-2xl border border-gray-200 p-4">
                  <div className="flex items-center gap-3">
                    <span className="rounded-full px-2 bg-indigo-500 text-white text-sm font-medium">#{index + 1}</span>
                    <div>
                      <p className="font-medium text-slate-800">{course.title}</p>
                      <div className="text-xs text-slate-500 mt-1">
                        {course.course_analytics.total_students} students • ★ {course.course_analytics.avg_rating.toFixed(1)} • ${course.course_analytics.revenue}
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => navigate('/coach/courses', { state: { courseId: course.id } })}
                    className="gap-2 text-indigo-600 hover:bg-gray-50 p-2 rounded flex items-center"
                  >
                    View <ArrowUpRight className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
          <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-6 pb-2">
              <h3 className="text-base text-slate-800 font-semibold">Recent Activity</h3>
            </div>
            <div className="p-6 pt-0 space-y-4">
              {activity.map((item) => (
                <div key={item.id} className="flex items-start gap-3 rounded-2xl border border-gray-200 p-3">
                  <div className={`p-2 rounded-xl bg-gradient-to-br ${item.bg} flex items-center justify-center`}>
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-slate-800">{item.title}</p>
                      <span className="text-xs text-slate-500">{item.when}</span>
                    </div>
                    <p className="text-sm text-slate-500 mt-0.5">{item.who}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-6 pb-2">
              <h3 className="text-base text-slate-800 font-semibold">Quick Actions</h3>
              <p className="text-slate-500 text-sm">Start building and manage faster</p>
            </div>
            <div className="p-6 pt-0">
              <div className="grid grid-cols-1 gap-3">
                <button
                  type="button"
                  onClick={() => navigate('/coach/courses')}
                  className="flex items-center justify-between w-full rounded-xl p-4 shadow-sm transition bg-indigo-50 hover:bg-indigo-100 text-indigo-700"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white/70">
                      <PlusCircle className="h-5 w-5 text-indigo-600" />
                    </div>
                    <span className="font-medium">Create Course</span>
                  </div>
                  <ArrowUpRight className="h-4 w-4 opacity-70" />
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/coach/live-calls')}
                  className="flex items-center justify-between w-full rounded-xl p-4 shadow-sm transition bg-purple-50 hover:bg-purple-100 text-purple-700"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white/70">
                      <CalendarClock className="h-5 w-5 text-purple-600" />
                    </div>
                    <span className="font-medium">Schedule Live Session</span>
                  </div>
                  <ArrowUpRight className="h-4 w-4 opacity-70" />
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/coach/students')}
                  className="flex items-center justify-between w-full rounded-xl p-4 shadow-sm transition bg-teal-50 hover:bg-teal-100 text-teal-700"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white/70">
                      <Users className="h-5 w-5 text-teal-600" />
                    </div>
                    <span className="font-medium">Manage Students</span>
                  </div>
                  <ArrowUpRight className="h-4 w-4 opacity-70" />
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/coach/dashboard')}
                  className="flex items-center justify-between w-full rounded-xl p-4 shadow-sm transition bg-rose-50 hover:bg-rose-100 text-rose-700"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white/70">
                      <BarChart3 className="h-5 w-5 text-rose-600" />
                    </div>
                    <span className="font-medium">Analytics & Reports</span>
                  </div>
                  <ArrowUpRight className="h-4 w-4 opacity-70" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CleanInstructorDashboard;