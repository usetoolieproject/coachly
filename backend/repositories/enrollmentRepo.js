export async function getPaidEnrollmentsForInstructor(supabase, instructorId, { since } = {}) {
  let q = supabase
    .from('enrollments')
    .select(`
      id,
      enrolled_at,
      courses!inner(id, type, price, instructor_id)
    `)
    .eq('courses.instructor_id', instructorId);
  if (since) q = q.gte('enrolled_at', since);
  const { data } = await q;
  return (data || []).filter(e => e.courses?.type === 'paid');
}

export async function getAllEnrollmentsForInstructorCourses(supabase, instructorId, { since } = {}) {
  let q = supabase
    .from('enrollments')
    .select(`
      id,
      enrolled_at,
      course_id,
      courses!inner(id, instructor_id)
    `)
    .eq('courses.instructor_id', instructorId);
  if (since) q = q.gte('enrolled_at', since);
  const { data } = await q;
  return data || [];
}


