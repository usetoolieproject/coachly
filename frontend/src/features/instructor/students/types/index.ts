export type ProgressSummary = {
  totalCourses: number;
  totalLessons: number;
  completedLessons: number;
  completionPercentage: number;
};

export type ActivitySummary = {
  totalPosts: number;
  totalComments: number;
};

export type Student = {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePictureUrl?: string;
  joinedDate: string;
  accountCreated: string;
  amountPaid: number;
  paymentMethod: string;
  status: string;
  progress: ProgressSummary;
  activity: ActivitySummary;
};

export type StudentDetails = {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePictureUrl?: string;
  phone?: string;
  location?: string;
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
        progress: { completed: boolean; watchTime: number; completedAt?: string };
      }>;
    }>;
  }>;
  posts: Array<{ id: string; content: string; category: string; created_at: string; likeCount: number; commentCount: number }>;
  comments: Array<{ id: string; content: string; created_at: string; likeCount: number; postContent: string; postId: string }>;
};


