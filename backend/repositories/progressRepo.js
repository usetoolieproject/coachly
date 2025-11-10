export async function getProgressByLessonIds(supabase, lessonIds) {
  if (!lessonIds?.length) return [];
  const { data } = await supabase
    .from('student_lesson_progress')
    .select('student_id, lesson_id, completed, watch_time, updated_at, completed_at')
    .in('lesson_id', lessonIds);
  return data || [];
}

export async function getRecentCompletions(supabase, instructorId, { since, limit = 10 } = {}) {
  const { data } = await supabase
    .from('student_lesson_progress')
    .select(`
      updated_at,
      completed_at,
      students!inner(
        users!inner(first_name, last_name)
      ),
      lessons!inner(
        title,
        modules!inner(
          courses!inner(title, instructor_id)
        )
      )
    `)
    .eq('lessons.modules.courses.instructor_id', instructorId)
    .eq('completed', true)
    .not('completed_at', 'is', null)
    .gte('completed_at', since)
    .order('completed_at', { ascending: false })
    .limit(limit);
  return data || [];
}


