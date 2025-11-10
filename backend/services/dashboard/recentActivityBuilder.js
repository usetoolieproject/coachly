export function buildRecentActivity({ recentStudents = [], recentPosts = [], recentCompletions = [] }) {
  const items = [];

  for (const s of recentStudents) {
    items.push({ type: 'student', message: 'New student joined', user: `${s.users.first_name} ${s.users.last_name}`, time: s.created_at });
  }
  for (const p of recentPosts) {
    items.push({ type: 'content', message: 'New community post', user: `${p.users.first_name} ${p.users.last_name}`, course: p.category, time: p.created_at });
  }
  for (const c of recentCompletions) {
    items.push({ type: 'milestone', message: 'Lesson completed', user: `${c.students.users.first_name} ${c.students.users.last_name}`, course: c.lessons.modules.courses.title, time: c.completed_at });
  }

  items.sort((a, b) => new Date(b.time) - new Date(a.time));
  return items;
}


