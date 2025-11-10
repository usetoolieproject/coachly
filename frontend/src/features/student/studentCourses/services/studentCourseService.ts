import { apiFetch } from '../../../../services/api';

export interface StudentCourse {
  id: string;
  title: string;
  description?: string;
  category: string;
  level: string;
  type: string;
  price?: number;
  thumbnail_url?: string;
  totalLessons: number;
  completedLessons?: number;
  progressPercentage?: number;
  totalStudents: number;
  isEnrolled: boolean;
  enrollmentId?: string;
  enrolledAt?: string;
  completedAt?: string | null;
  instructor?: {
    firstName: string;
    lastName: string;
    businessName?: string;
  };
  modules?: any[];
  lessonProgress?: { [lessonId: string]: { completed: boolean; watchTime: number } };
}

export interface Community {
  id: string;
  instructorId: string;
  name: string;
  subdirectory: string;
  instructor: {
    firstName: string;
    lastName: string;
    email: string;
  };
  stats: {
    totalCourses: number;
    totalStudents: number;
  };
}

export const studentCourseService = {
  // Get student's single community
  async getCommunity(): Promise<Community> {
    return await apiFetch('/student/community');
  },

  // Join a community (replaces existing one if any)
  async joinCommunity(subdirectory: string): Promise<void> {
    await apiFetch(`/student/community/join/${subdirectory}`, { method: 'POST' });
  },

  // NEW: Get all courses from community with progress (no enrollment needed)
  async getAllCoursesWithProgress(): Promise<StudentCourse[]> {
    return await apiFetch('/student/courses/all-with-progress');
  },

  // Get available courses from student's community
  async getAvailableCourses(): Promise<StudentCourse[]> {
    return await apiFetch('/student/courses/available');
  },

  // Get student's enrolled courses
  async getEnrolledCourses(): Promise<StudentCourse[]> {
    return await apiFetch('/student/courses/enrolled');
  },

  // Enroll in a course (now requires community membership)
  async enrollInCourse(courseId: string): Promise<void> {
    await apiFetch(`/student/courses/${courseId}/enroll`, { method: 'POST' });
  },

  // UPDATED: Get course content for any student in the community (no enrollment needed)
  async getCourseContent(courseId: string): Promise<StudentCourse> {
    return await apiFetch(`/student/courses/${courseId}/content-open`);
  },

  // Alias for getCourseContent to match hook usage
  async getStudentCourseContentOpen(courseId: string): Promise<StudentCourse> {
    return this.getCourseContent(courseId);
  },

  // UPDATED: Update lesson progress (no enrollment needed)
  async updateLessonProgress(lessonId: string, completed: boolean, watchTime?: number): Promise<void> {
    await apiFetch(`/student/lessons/${lessonId}/progress-open`, { 
      method: 'PUT', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ completed, watchTime }) 
    });
  },

  // Alias for updateLessonProgress to match hook usage
  async updateLessonProgressOpen(lessonId: string, completed: boolean, watchTime?: number): Promise<void> {
    return this.updateLessonProgress(lessonId, completed, watchTime);
  },

  // Join community through public about page
  async joinCommunityPublic(subdirectory: string, forceJoin: boolean = false): Promise<any> {
    return await apiFetch(`/public/${subdirectory}/join`, { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ forceJoin }) 
    });
  },

  // Payments: create checkout session for a paid course
  async createCourseCheckoutSession(courseId: string): Promise<{ url: string }> {
    return await apiFetch('/billing/checkout', { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ courseId }) 
    });
  }
  ,
  // Confirm checkout session after redirect (ensures unlock without waiting for webhook)
  async confirmCheckoutSession(sessionId: string, courseId?: string): Promise<{ paid: boolean; courseId?: string }> {
    const url = new URL('/billing/confirm-session', window.location.origin);
    url.searchParams.set('session_id', sessionId);
    if (courseId) url.searchParams.set('courseId', courseId);
    return await apiFetch(url.pathname + url.search);
  }
  ,
  // Mark a course as completed
  async markCourseComplete(courseId: string): Promise<{ completedAt: string }> {
    return await apiFetch(`/student/courses/${courseId}/complete`, { method: 'POST' });
  }
};
