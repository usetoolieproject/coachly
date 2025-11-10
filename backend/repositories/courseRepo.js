export async function getInstructorCourses(supabase, instructorId) {
  const { data } = await supabase
    .from('courses')
    .select('id, title, is_published, type, price, created_at')
    .eq('instructor_id', instructorId);
  return data || [];
}

export async function getLessonsForCourseIds(supabase, courseIds) {
  if (!courseIds?.length) return [];
  const { data } = await supabase
    .from('lessons')
    .select(`
      id,
      modules!inner(
        course_id,
        courses!inner(id)
      )
    `)
    .in('modules.courses.id', courseIds);
  return data || [];
}

export async function getLessonsForCourseId(supabase, courseId) {
  const { data } = await supabase
    .from('lessons')
    .select(`
      id,
      modules!inner(course_id)
    `)
    .eq('modules.course_id', courseId);
  return data || [];
}


