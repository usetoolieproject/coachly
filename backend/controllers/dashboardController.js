import { getSupabaseClient } from '../repositories/supabaseClient.js';
import { getDashboardAnalyticsService } from '../services/dashboard/getDashboardAnalytics.service.js';
import { getInstructorIdFromRequest } from '../repositories/instructorRepo.js';

// GET /api/student/dashboard/stats
export const getStudentDashboardStats = async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    const userId = req.user.id;
    const studentId = req.user.students?.[0]?.id;
    if (!studentId) {
      return res.json({ coursesEnrolled: 0, coursesCompleted: 0, currentStreak: 0 });
    }

    // Count enrollments (now includes auto-enrolled free courses)
    const { data: enrollments, error: enrollmentsError } = await supabase
      .from('enrollments')
      .select('id, course_id, completed_at, enrolled_at')
      .eq('student_id', studentId);
    if (enrollmentsError) {
      return res.status(400).json({ error: enrollmentsError.message });
    }

    let coursesEnrolled = enrollments?.length || 0;
    let coursesCompleted = (enrollments || []).filter(e => !!e.completed_at).length;

    // Removed month-over-month deltas as requested

    // Build activity date set for streak across learning/community/live sessions
    const activityDates = new Set();

    // 1) Learning activity: student_lesson_progress.updated_at
    const { data: lessonActs } = await supabase
      .from('student_lesson_progress')
      .select('updated_at')
      .eq('student_id', studentId)
      .order('updated_at', { ascending: false })
      .limit(500);
    (lessonActs || []).forEach(r => activityDates.add(new Date(r.updated_at).toDateString()));

    // 2) Community posts/comments by this user
    const [{ data: posts }, { data: comments }] = await Promise.all([
      supabase.from('community_posts').select('created_at').eq('user_id', userId).order('created_at', { ascending: false }).limit(300),
      supabase.from('community_comments').select('created_at').eq('user_id', userId).order('created_at', { ascending: false }).limit(300),
    ]);
    (posts || []).forEach(p => activityDates.add(new Date(p.created_at).toDateString()));
    (comments || []).forEach(c => activityDates.add(new Date(c.created_at).toDateString()));

    // 3) Live sessions attendance or registration by this user
    const { data: callActs } = await supabase
      .from('call_attendees')
      .select('registered_at')
      .eq('user_id', userId)
      .order('registered_at', { ascending: false })
      .limit(300);
    (callActs || []).forEach(a => activityDates.add(new Date(a.registered_at).toDateString()));

    // Completed by progress (100%) even without enrollment
    try {
      // need instructor_id to scope courses
      const { data: studentRow } = await supabase.from('students').select('instructor_id').eq('id', studentId).single();
      const instructorId = studentRow?.instructor_id;
      if (instructorId) {
        const { data: courses } = await supabase
          .from('courses')
          .select('id, modules ( lessons ( id ) )')
          .eq('instructor_id', instructorId)
          .eq('is_published', true);
        const allLessonIds = [];
        (courses || []).forEach(c => c.modules?.forEach(m => m.lessons?.forEach(l => allLessonIds.push({ courseId: c.id, lessonId: l.id }))));
        if (allLessonIds.length > 0) {
          const lessonIds = allLessonIds.map(x => x.lessonId);
          const { data: progressRows } = await supabase
            .from('student_lesson_progress')
            .select('lesson_id, completed, completed_at')
            .eq('student_id', studentId)
            .in('lesson_id', lessonIds);
          const completedSet = new Set((progressRows || []).filter(r => r.completed).map(r => r.lesson_id));
          const completionDatesByCourse = new Map();
          const completedByProgress = (courses || []).filter(c => {
            const total = c.modules?.reduce((s, m) => s + (m.lessons?.length || 0), 0) || 0;
            if (total === 0) return false;
            let done = 0;
            let latestCompletedAt = null;
            c.modules?.forEach(m => m.lessons?.forEach(l => { 
              if (completedSet.has(l.id)) {
                done++; 
                const pr = (progressRows || []).find(r => r.lesson_id === l.id);
                if (pr?.completed_at) {
                  const dt = new Date(pr.completed_at);
                  if (!latestCompletedAt || dt > latestCompletedAt) latestCompletedAt = dt;
                }
              }
            }));
            const isComplete = total > 0 && done === total;
            if (isComplete && latestCompletedAt) {
              completionDatesByCourse.set(c.id, latestCompletedAt);
            }
            return isComplete;
          }).length;
          coursesCompleted = Math.max(coursesCompleted, completedByProgress + 0); // union without double counting is complex; using max as safe lower-bound

          // Also count as "enrolled" any FREE course where the student has any progress but no enrollment row yet
          // Get free course ids
          const { data: freeCourses } = await supabase
            .from('courses')
            .select('id, price, type')
            .eq('instructor_id', instructorId)
            .eq('is_published', true);
          const freeCourseIds = (freeCourses || [])
            .filter(c => (c.type === 'free') || Number(c.price || 0) === 0)
            .map(c => c.id);
          if (freeCourseIds.length > 0) {
            // progress presence per course
            const lessonIdToCourseId = new Map(allLessonIds.map(x => [x.lessonId, x.courseId]));
            const progressedCourseIds = new Set();
            (progressRows || []).forEach(r => {
              const cid = lessonIdToCourseId.get(r.lesson_id);
              if (cid) progressedCourseIds.add(cid);
            });
            const candidateIds = freeCourseIds.filter(cid => progressedCourseIds.has(cid));
            if (candidateIds.length > 0) {
              const { data: existingEnrolls } = await supabase
                .from('enrollments')
                .select('course_id')
                .eq('student_id', studentId)
                .in('course_id', candidateIds);
              const enrolledCourseIdSet = new Set((existingEnrolls || []).map(e => e.course_id));
              const additional = candidateIds.filter(cid => !enrolledCourseIdSet.has(cid)).length;
              coursesEnrolled += additional;
            }
          }

          // No monthly completion delta; we only keep totals
        }
      }
    } catch (e) {
      // ignore
    }

    const currentStreak = computeConsecutiveDayStreak(activityDates);

    res.json({ 
      coursesEnrolled, 
      coursesCompleted, 
      currentStreak
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

function computeConsecutiveDayStreak(dateStringSet) {
  if (!dateStringSet || dateStringSet.size === 0) return 0;
  // Normalize to set of YYYY-MM-DD strings
  const norm = new Set();
  dateStringSet.forEach(ds => {
    const d = new Date(ds);
    norm.add(d.toDateString());
  });

  const today = new Date();
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toDateString();
    if (norm.has(key)) streak += 1; else break;
  }
  return streak;
}

export const getDashboardAnalytics = async (req, res) => {
  try {
    const instructorId = getInstructorIdFromRequest(req);
    if (!instructorId) {
      return res.status(403).json({ error: 'Instructor access required' });
    }

    const supabase = getSupabaseClient();
    const days = Number(req.query.days ?? 30);

    const result = await getDashboardAnalyticsService({ supabase, instructorId, days });
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getRevenueTimeseries = async (req, res) => {
  try {
    const instructorId = getInstructorIdFromRequest(req);
    if (!instructorId) {
      return res.status(403).json({ error: 'Instructor access required' });
    }

    const supabase = getSupabaseClient();
    const days = Number(req.query.days ?? 30);
    
    // Get all payments for this instructor
    const since = new Date(Date.now() - parseInt(days) * 24 * 60 * 60 * 1000).toISOString();
    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select('amount_total, purchased_at, status')
      .eq('instructor_id', instructorId)
      .eq('status', 'paid')
      .gte('purchased_at', since)
      .order('purchased_at', { ascending: true });

    if (paymentsError) {
      return res.status(500).json({ error: 'Failed to fetch payments' });
    }

    // Build day buckets
    const now = new Date();
    const buckets = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      buckets.push({ key, start: new Date(d), end: new Date(d.getTime() + 24 * 60 * 60 * 1000), totalCents: 0 });
    }

    // Aggregate payments into buckets
    for (const p of (payments || [])) {
      const purchaseDate = new Date(p.purchased_at);
      for (const b of buckets) {
        if (purchaseDate >= b.start && purchaseDate < b.end) {
          b.totalCents += (p.amount_total || 0);
          break;
        }
      }
    }

    // Convert to series format
    const series = buckets.map(b => ({
      date: b.key,
      value: Math.round((b.totalCents / 100) * 100) / 100
    }));

    return res.json({ series });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};