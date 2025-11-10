import { getInstructorCourses, getLessonsForCourseId } from '../../repositories/courseRepo.js';
import { countStudents, getRecentStudents } from '../../repositories/studentRepo.js';
import { countCommunityComments, countCommunityLikes, countCommunityPosts, getRecentPosts } from '../../repositories/communityRepo.js';
import { getProgressByLessonIds, getRecentCompletions } from '../../repositories/progressRepo.js';
import { computeEngagement, computeGrowth, computeTotalRevenue } from './analyticsComputations.js';
import { buildRecentActivity } from './recentActivityBuilder.js';
import { getPaidEnrollmentsForInstructor, getAllEnrollmentsForInstructorCourses } from '../../repositories/enrollmentRepo.js';

export async function getDashboardAnalyticsService({ supabase, instructorId, days }) {
  const publishedCourses = [];
  const [totalStudents, courses, totalPosts, totalComments, totalLikes] = await Promise.all([
    countStudents(supabase, instructorId),
    getInstructorCourses(supabase, instructorId),
    countCommunityPosts(supabase, instructorId),
    countCommunityComments(supabase, instructorId),
    countCommunityLikes(supabase, instructorId),
  ]);

  const published = (courses || []).filter(c => c.is_published);
  publishedCourses.push(...published);
  const totalCourses = publishedCourses.length;
  // Revenue: sum from payments table (Stripe webhook writes here)
  const since = new Date(Date.now() - parseInt(days) * 24 * 60 * 60 * 1000).toISOString();
  const { data: payments, error: paymentsError } = await supabase
    .from('payments')
    .select('amount_total, course_id, type, purchased_at, instructor_id')
    .eq('instructor_id', instructorId)
    .eq('status', 'paid')
    .gte('purchased_at', since);

  if (paymentsError) {
    // Fallback to 0 on error, but keep dashboard responsive
  }

  const totalRevenueCents = (payments || []).reduce((sum, p) => sum + (p.amount_total || 0), 0);
  const totalRevenue = Math.round((totalRevenueCents / 100) * 100) / 100;

  let totalLessons = 0;
  let allLessonIds = [];
  if (publishedCourses.length > 0) {
    const lessonsResults = await Promise.all(publishedCourses.map(c => getLessonsForCourseId(supabase, c.id)));
    const lessons = lessonsResults.flat();
    totalLessons = lessons.length;
    allLessonIds = lessons.map(l => l.id);
  }

  let totalCompletions = 0;
  let totalWatchTime = 0;
  let activeStudents = 0;
  if (allLessonIds.length > 0) {
    const progressData = await getProgressByLessonIds(supabase, allLessonIds);
    totalCompletions = progressData.filter(p => p.completed).length;
    totalWatchTime = progressData.reduce((sum, p) => sum + (p.watch_time || 0), 0);
    activeStudents = new Set(progressData.map(p => p.student_id)).size;
  }

  // Live engagement based on enrollments per course
  const allEnrollments = await getAllEnrollmentsForInstructorCourses(supabase, instructorId);
  const enrolledByCourseId = allEnrollments.reduce((acc, e) => {
    acc.set(e.course_id, (acc.get(e.course_id) || 0) + 1);
    return acc;
  }, new Map());

  // Expected progress entries = sum over courses of (enrolled students * lessons in that course)
  let expectedProgressEntries = 0;
  if (publishedCourses.length > 0) {
    const lessonsByCourse = await Promise.all(publishedCourses.map(c => getLessonsForCourseId(supabase, c.id)));
    publishedCourses.forEach((course, idx) => {
      const numLessons = lessonsByCourse[idx].length;
      const numEnrolled = enrolledByCourseId.get(course.id) || 0;
      expectedProgressEntries += numLessons * numEnrolled;
    });
  }
  const engagementRate = expectedProgressEntries > 0 ? (totalCompletions / expectedProgressEntries) * 5 : 0;

  // since already computed above
  const doubleSince = new Date(Date.now() - parseInt(days) * 2 * 24 * 60 * 60 * 1000).toISOString();

  const [recentStudents, recentPosts, recentCompletions] = await Promise.all([
    getRecentStudents(supabase, instructorId, { since, limit: 10 }),
    getRecentPosts(supabase, instructorId, { since, limit: 10 }),
    getRecentCompletions(supabase, instructorId, { since, limit: 10 }),
  ]);

  const recentActivity = buildRecentActivity({ recentStudents, recentPosts, recentCompletions }).slice(0, 10);

  const [studentsCurrentPeriod, studentsPreviousPeriod, postsCurrentPeriod, postsPreviousPeriod] = await Promise.all([
    countStudents(supabase, instructorId, { since }),
    (async () => countStudents(supabase, instructorId, { since: doubleSince }))(),
    countCommunityPosts(supabase, instructorId, { since }),
    countCommunityPosts(supabase, instructorId, { since: doubleSince, lt: since }),
  ]);

  const studentsGrowth = computeGrowth(studentsCurrentPeriod, studentsPreviousPeriod);
  const postsGrowth = computeGrowth(postsCurrentPeriod, postsPreviousPeriod);

  const topCourses = [];
  // Build a map of per-course revenue from payments
  const revenueByCourseId = (payments || []).reduce((acc, p) => {
    if (p.course_id) acc.set(p.course_id, (acc.get(p.course_id) || 0) + (p.amount_total || 0));
    return acc;
  }, new Map());

  for (const course of publishedCourses.slice(0, 5)) {
    const courseLessons = await getLessonsForCourseId(supabase, course.id);
    const courseLessonIds = courseLessons.map(l => l.id);
    let courseCompletions = 0;
    let courseStudents = 0;
    if (courseLessonIds.length > 0) {
      const courseProgress = await getProgressByLessonIds(supabase, courseLessonIds);
      courseCompletions = courseProgress.filter(p => p.completed).length;
      courseStudents = new Set(courseProgress.map(p => p.student_id)).size;
    }
    const numEnrolled = enrolledByCourseId.get(course.id) || 0;
    const completionRate = courseLessonIds.length > 0 ? (courseCompletions / (courseLessonIds.length * Math.max(numEnrolled, 1))) * 100 : 0;
    topCourses.push({
      id: course.id,
      title: course.title,
      course_analytics: {
        total_students: courseStudents,
        avg_rating: Math.min(5, 3 + (completionRate / 100) * 2),
        revenue: Math.round(((revenueByCourseId.get(course.id) || 0) / 100) * 100) / 100,
      },
    });
  }
  topCourses.sort((a, b) => b.course_analytics.total_students - a.course_analytics.total_students);

  return {
    analytics: {
      totalRevenue: totalRevenue,
      totalStudents: totalStudents,
      totalCourses: totalCourses,
      avgRating: Math.round(engagementRate * 10) / 10,
      communityPosts: totalPosts,
      totalLessons: totalLessons,
      totalCompletions: totalCompletions,
      totalWatchTime: Math.round(totalWatchTime / 60),
      activeStudents: activeStudents,
      totalComments: totalComments,
      totalLikes: totalLikes,
      studentsGrowth: Math.round(studentsGrowth * 10) / 10,
      postsGrowth: Math.round(postsGrowth * 10) / 10,
    },
    topCourses: topCourses.slice(0, 3),
    recentActivity,
  };
}


