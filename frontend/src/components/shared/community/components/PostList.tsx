import React from 'react';
import type { CommunityPost } from '../types';
import PostCard from './PostCard';

type PostListProps = {
  posts: CommunityPost[];
  onOpenModal: (post: CommunityPost) => void;
  onLike: (postId: string) => void;
  onShare?: (postId: string) => void;
  canPin?: boolean;
  onTogglePin?: (postId: string) => void;
  canEdit?: (post: CommunityPost) => boolean;
  onEdit?: (post: CommunityPost) => void;
  canDelete?: (post: CommunityPost) => boolean;
  onDelete?: (post: CommunityPost) => void;
  categoryLabel?: (id: string) => string | undefined;
};

const PostList: React.FC<PostListProps> = (props) => {
  const { posts } = props;
  return (
    <div className="space-y-6">
      {posts.map(post => (
        <PostCard key={post.id} {...props} post={post} />
      ))}
    </div>
  );
};

export default PostList;


