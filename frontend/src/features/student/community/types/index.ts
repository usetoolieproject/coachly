export interface Community {
  name: string;
  instructor: { firstName: string; lastName: string };
  stats: { totalCourses: number; totalStudents: number };
}

export interface PostUser {
  id: string;
  first_name: string;
  last_name: string;
  role: string;
  profile_picture_url?: string;
}

export interface PostMedia {
  id: string;
  media_url: string;
  media_type: string;
}

export interface CommentItem {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
  users: PostUser;
  like_count: number;
  user_has_liked: boolean;
}

export interface Post {
  id: string;
  content: string;
  category: string;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
  users: PostUser;
  community_post_media: PostMedia[];
  comments: CommentItem[];
  like_count: number;
  user_has_liked: boolean;
}


