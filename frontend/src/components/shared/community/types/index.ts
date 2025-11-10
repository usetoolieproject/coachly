export type CommunityUser = {
  id: string;
  first_name: string;
  last_name: string;
  role: string;
  profile_picture_url?: string;
};

export type CommunityMedia = {
  id: string;
  media_url: string;
  media_type: string;
};

export type CommunityComment = {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
  users: CommunityUser;
  like_count: number;
  user_has_liked: boolean;
};

export type CommunityPost = {
  id: string;
  content: string;
  category: string;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
  users: CommunityUser;
  community_post_media: CommunityMedia[];
  comments: CommunityComment[];
  like_count: number;
  user_has_liked: boolean;
};


