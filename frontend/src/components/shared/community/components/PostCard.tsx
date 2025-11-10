import React from 'react';
import { Heart, MessageCircle, MoreHorizontal, Pin, PinOff, Share2 } from 'lucide-react';
import type { CommunityPost } from '../types';
import { ProfilePicture } from '../../..';

type PostCardProps = {
  post: CommunityPost;
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

const PostCard: React.FC<PostCardProps> = ({ post, onOpenModal, onLike, onShare, canPin, onTogglePin, canEdit, onEdit, canDelete, onDelete, categoryLabel }) => {
  const shouldTruncate = (content: string) => content.length > 200;
  const [expanded, setExpanded] = React.useState(false);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
      <div className="mb-3 sm:mb-4">
        {/* Row 1: Author info and actions */}
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
            <ProfilePicture src={post.users.profile_picture_url} firstName={post.users.first_name} lastName={post.users.last_name} size="md" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-1 sm:space-x-2">
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{post.users.first_name} {post.users.last_name}</h3>
                {post.users.role === 'instructor' && (
                  <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs bg-purple-100 text-purple-700 rounded-full flex-shrink-0">Admin</span>
                )}
              </div>
            </div>
          </div>
          {(canPin || canEdit?.(post) || canDelete?.(post)) && (
            <div className="relative flex-shrink-0">
              {/* Consumers can implement dropdown; we expose callbacks here */}
              <div className="flex items-center gap-1 sm:gap-2">
                {canPin && onTogglePin && (
                  <button onClick={() => onTogglePin(post.id)} className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                    {post.is_pinned ? <PinOff className="w-3 h-3 sm:w-4 sm:h-4" /> : <Pin className="w-3 h-3 sm:w-4 sm:h-4" />}
                  </button>
                )}
                {canEdit?.(post) && onEdit && (
                  <button onClick={() => onEdit(post)} className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                    <MoreHorizontal className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                )}
                {canDelete?.(post) && onDelete && (
                  <button onClick={() => onDelete(post)} className="p-1.5 sm:p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <MoreHorizontal className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Row 2: Category tag and pin status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1 sm:space-x-2">
            <span className="text-xs sm:text-sm px-2 py-1 rounded-full bg-gray-100 text-gray-600">{categoryLabel?.(post.category) || post.category}</span>
            {post.is_pinned && <Pin className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600" />}
          </div>
        </div>
      </div>

      {/* Content + optional thumbnail */}
      <div className="flex space-x-3 sm:space-x-4">
        <div className="flex-1 min-w-0">
          <div>
            {shouldTruncate(post.content) && !expanded ? (
              <div>
                <p className="text-gray-900 whitespace-pre-wrap text-sm sm:text-base">{post.content.substring(0, 200)}...</p>
                <button onClick={() => setExpanded(true)} className="text-blue-600 hover:text-blue-700 text-xs sm:text-sm font-medium mt-1">Read more</button>
              </div>
            ) : (
              <p className="text-gray-900 whitespace-pre-wrap text-sm sm:text-base">{post.content}</p>
            )}
          </div>
        </div>
        {post.community_post_media && post.community_post_media.length > 0 && (
          <div className="flex-shrink-0">
            <button onClick={() => onOpenModal(post)} className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden hover:opacity-90 transition-opacity">
              <img src={post.community_post_media[0].media_url} alt="Post thumbnail" className="w-full h-full object-cover" />
              {post.community_post_media.length > 1 && (
                <div className="absolute bottom-0 right-0 bg-black bg-opacity-70 text-white text-xs px-1 py-0.5 rounded-tl">
                  +{post.community_post_media.length - 1}
                </div>
              )}
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200">
        <div className="flex items-center space-x-4 sm:space-x-6">
          <button onClick={() => onLike(post.id)} className={`flex items-center space-x-1 transition-colors ${post.user_has_liked ? 'text-red-600 hover:text-red-700' : 'text-gray-500 hover:text-red-600'}`}>
            <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${post.user_has_liked ? 'fill-current' : ''}`} />
            <span className="text-xs sm:text-sm font-medium">{post.like_count}</span>
          </button>
          <button onClick={() => onOpenModal(post)} className="flex items-center space-x-1 text-gray-500 hover:text-purple-600 transition-colors">
            <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-xs sm:text-sm font-medium">{post.comments.length}</span>
          </button>
          {onShare && (
            <button onClick={() => onShare(post.id)} className="flex items-center space-x-1 text-gray-500 hover:text-blue-600 transition-colors">
              <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-xs sm:text-sm font-medium">Share</span>
            </button>
          )}
        </div>
        <button onClick={() => onOpenModal(post)} className="text-gray-500 hover:text-purple-600 text-xs sm:text-sm">New comment</button>
      </div>
    </div>
  );
};

export default PostCard;


