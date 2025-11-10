export async function countCommunityPosts(supabase, instructorId, { since, lt } = {}) {
  let q = supabase.from('community_posts').select('*', { count: 'exact', head: true }).eq('instructor_id', instructorId);
  if (since) q = q.gte('created_at', since);
  if (lt) q = q.lt('created_at', lt);
  const { count } = await q;
  return count || 0;
}

export async function countCommunityComments(supabase, instructorId) {
  const { count } = await supabase
    .from('community_comments')
    .select('*, community_posts!inner(*)', { count: 'exact', head: true })
    .eq('community_posts.instructor_id', instructorId);
  return count || 0;
}

export async function countCommunityLikes(supabase, instructorId) {
  const { count } = await supabase
    .from('community_likes')
    .select('*, community_posts!inner(*)', { count: 'exact', head: true })
    .eq('community_posts.instructor_id', instructorId);
  return count || 0;
}

export async function getRecentPosts(supabase, instructorId, { since, limit = 10 } = {}) {
  const { data } = await supabase
    .from('community_posts')
    .select(`
      created_at,
      content,
      category,
      users!inner(first_name, last_name)
    `)
    .eq('instructor_id', instructorId)
    .gte('created_at', since)
    .order('created_at', { ascending: false })
    .limit(limit);
  return data || [];
}


