import { apiFetch } from './api';

export interface Student {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePictureUrl?: string; // Make sure this is here
  joinedDate: string;
  accountCreated: string;
  amountPaid: number;
  paymentMethod: string;
  status: string;
  progress: {
    totalCourses: number;
    totalLessons: number;
    completedLessons: number;
    completionPercentage: number;
  };
  activity: {
    totalPosts: number;
    totalComments: number;
  };
}

export interface StudentDetails {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePictureUrl?: string; // Make sure this is here too
  phone?: string;        // Add this
  location?: string;     // Add this
  bio?: string;
  joinedDate: string;
  accountCreated: string;
  courses: Array<{
    id: string;
    title: string;
    totalLessons: number;
    completedLessons: number;
    progressPercentage: number;
    modules: Array<{
      id: string;
      title: string;
      lessons: Array<{
        id: string;
        title: string;
        progress: {
          completed: boolean;
          watchTime: number;
          completedAt?: string;
        };
      }>;
    }>;
  }>;
  posts: Array<{
    id: string;
    content: string;
    category: string;
    created_at: string;
    likeCount: number;
    commentCount: number;
  }>;
  comments: Array<{
    id: string;
    content: string;
    created_at: string;
    likeCount: number;
    postContent: string;
  }>;
}

export const instructorStudentService = {
  async getStudents(): Promise<Student[]> {
    return await apiFetch('/instructor/students');
  },

  async getStudentDetails(studentId: string): Promise<StudentDetails> {
    return await apiFetch(`/instructor/students/${studentId}`);
  },
};