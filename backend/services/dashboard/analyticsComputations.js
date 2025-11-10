export function computeTotalRevenue(courses) {
  return (courses || []).reduce((sum, course) => sum + (course.type === 'paid' ? (course.price || 0) : 0), 0);
}

export function computeEngagement(totalLessons, totalStudents, totalCompletions) {
  const totalProgressEntries = (totalLessons || 0) * Math.max(totalStudents || 0, 1);
  return totalProgressEntries > 0 ? (totalCompletions / totalProgressEntries) * 5 : 0;
}

export function computeGrowth(current, previous) {
  if (previous > 0) return ((current - previous) / previous) * 100;
  return current > 0 ? 100 : 0;
}


