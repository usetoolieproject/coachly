export async function countStudents(supabase, instructorId, { since } = {}) {
  let query = supabase
    .from('students')
    .select('*', { count: 'exact', head: true })
    .eq('instructor_id', instructorId);
  if (since) query = query.gte('created_at', since);
  const { count } = await query;
  return count || 0;
}

export async function getRecentStudents(supabase, instructorId, { since, limit = 10 } = {}) {
  const { data } = await supabase
    .from('students')
    .select(`
      created_at,
      users!inner(first_name, last_name)
    `)
    .eq('instructor_id', instructorId)
    .gte('created_at', since)
    .order('created_at', { ascending: false })
    .limit(limit);
  return data || [];
}


