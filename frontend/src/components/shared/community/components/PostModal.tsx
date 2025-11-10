import React, { useState } from 'react';
import { X, Pin, ThumbsUp, Edit, Trash2, Send } from 'lucide-react';
import type { CommunityPost } from '../types';
import { ProfilePicture } from '../../..';
import { useTheme } from '../../../../contexts/ThemeContext';

type PostModalProps = {
  post: CommunityPost;
  isOpen: boolean;
  onClose: () => void;
  onLike: () => void;
  onComment: (content: string) => void;
  onLikeComment: (commentId: string) => void;
  onEditComment: (commentId: string, content: string) => void;
  onDeleteComment: (commentId: string) => void;
  onImageClick: (images: CommunityPost['community_post_media'], index: number) => void;
  user: any;
  submittingComment?: boolean;
};

const PostModal: React.FC<PostModalProps> = ({ post, isOpen, onClose, onLike, onComment, onLikeComment, onEditComment, onDeleteComment, onImageClick, user, submittingComment }) => {
  const [commentContent, setCommentContent] = useState('');
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editCommentContent, setEditCommentContent] = useState('');
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);

  if (!isOpen) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const canDeleteComment = (comment: any) => comment.users.id === user?.id || user?.role === 'instructor';
  const canEditComment = (comment: any) => comment.users.id === user?.id && user?.role === 'instructor';

  const { isDarkMode } = useTheme();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className={`${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl max-w-2xl w-full max-h-[90vh] m-4 flex flex-col shadow-2xl border`}>
        <div className={`flex items-center justify-between p-4 sm:p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h2 className={`text-lg sm:text-xl font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Post Details</h2>
          <button onClick={onClose} className={`${isDarkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}>
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="flex items-center space-x-3 mb-3 sm:mb-4">
            <ProfilePicture src={post.users.profile_picture_url} firstName={post.users.first_name} lastName={post.users.last_name} size="md" />
            <div>
              <div className="flex items-center space-x-2">
                <h3 className={`font-semibold text-sm sm:text-base ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{post.users.first_name} {post.users.last_name}</h3>
                {post.users.role === 'instructor' && <span className={`px-2 py-1 text-xs rounded-full ${isDarkMode ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-100 text-purple-700'}`}>Admin</span>}
                {post.is_pinned && <Pin className={`w-3 h-3 sm:w-4 sm:h-4 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />}
              </div>
              <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{formatDate(post.created_at)}</p>
            </div>
          </div>
          <div className="mb-3 sm:mb-4"><p className={`text-sm sm:text-base ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} whitespace-pre-wrap`}>{post.content}</p></div>
          {post.community_post_media && post.community_post_media.length > 0 && (
            <div className="mb-4">
              {post.community_post_media.length === 1 ? (
                <button onClick={() => onImageClick(post.community_post_media, 0)} className="w-full">
                  <img src={post.community_post_media[0].media_url} alt="Post media" className="rounded-lg w-full max-h-96 object-cover hover:opacity-95 transition-opacity" />
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {post.community_post_media.map((media, index) => (
                    <button key={media.id} onClick={() => onImageClick(post.community_post_media, index)} className="relative">
                      <img src={media.media_url} alt={`Post media ${index + 1}`} className="rounded-lg w-full h-48 object-cover hover:opacity-95 transition-opacity" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          <div className={`flex items-center space-x-6 mb-6 pb-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <button onClick={onLike} className={`flex items-center space-x-2 transition-colors ${post.user_has_liked ? 'text-red-600 hover:text-red-700' : isDarkMode ? 'text-gray-400 hover:text-red-500' : 'text-gray-500 hover:text-red-600'}`}>
              <ThumbsUp className={`w-5 h-5 ${post.user_has_liked ? 'fill-current' : ''}`} />
              <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{post.like_count}</span>
            </button>
          </div>
          <div className="space-y-4">
            <h4 className={`font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Comments</h4>
            {post.comments.map(comment => (
              <div key={comment.id} className="flex space-x-3">
                <ProfilePicture src={comment.users.profile_picture_url} firstName={comment.users.first_name} lastName={comment.users.last_name} size="sm" />
                <div className="flex-1">
                  {editingComment === comment.id ? (
                    <div className="space-y-2">
                      <textarea value={editCommentContent} onChange={(e) => setEditCommentContent(e.target.value)} className={`w-full p-3 border rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${isDarkMode ? 'border-gray-700 bg-gray-900 text-gray-100' : 'border-gray-300'}`} rows={2} />
                      <div className="flex space-x-2">
                        <button onClick={() => { onEditComment(comment.id, editCommentContent); setEditingComment(null); setEditCommentContent(''); }} className="px-3 py-1 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors">Save</button>
                        <button onClick={() => { setEditingComment(null); setEditCommentContent(''); }} className={`px-3 py-1 text-sm transition-colors ${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-transparent'} rounded-lg px-4 py-3 border`}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center space-x-2">
                          <h4 className={`font-medium text-sm ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{comment.users.first_name} {comment.users.last_name}</h4>
                          {comment.users.role === 'instructor' && <span className={`px-2 py-0.5 text-xs rounded-full ${isDarkMode ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-100 text-purple-700'}`}>Admin</span>}
                        </div>
                        <div className="flex items-center space-x-1">
                          {canEditComment(comment) && (
                            <button onClick={() => { setEditingComment(comment.id); setEditCommentContent(comment.content); }} className={`${isDarkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}><Edit className="w-3 h-3" /></button>
                          )}
                          {canDeleteComment(comment) && (
                            <button onClick={() => { setCommentToDelete(comment.id); setDeleteOpen(true); }} className={`${isDarkMode ? 'text-gray-500 hover:text-red-500' : 'text-gray-400 hover:text-red-600'}`}><Trash2 className="w-3 h-3" /></button>
                          )}
                        </div>
                      </div>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{comment.content}</p>
                    </div>
                  )}
                  <div className="flex items-center space-x-4 mt-2">
                    <button onClick={() => onLikeComment(comment.id)} className={`text-xs flex items-center space-x-1 transition-colors ${comment.user_has_liked ? 'text-purple-600 hover:text-purple-700' : isDarkMode ? 'text-gray-400 hover:text-purple-600' : 'text-gray-500 hover:text-purple-600'}`}>
                      <ThumbsUp className={`w-3 h-3 ${comment.user_has_liked ? 'fill-current' : ''}`} />
                      <span>{comment.like_count}</span>
                    </button>
                    <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{formatDate(comment.created_at)}</span>
                  </div>
                </div>
              </div>
            ))}
            <div className="flex space-x-2 sm:space-x-3 mt-4 sm:mt-6">
              <ProfilePicture src={user?.profilePictureUrl} firstName={user?.firstName || ''} lastName={user?.lastName || ''} size="sm" />
              <div className="flex-1 flex space-x-2 sm:space-x-3">
                <input type="text" value={commentContent} onChange={(e) => setCommentContent(e.target.value)} placeholder="Write a comment..." className={`flex-1 px-3 sm:px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-400 text-sm sm:text-base ${isDarkMode ? 'border-gray-700 bg-gray-900 text-gray-100' : 'border-gray-300'}`} disabled={!!submittingComment} onKeyDown={(e) => { if (e.key === 'Enter' && commentContent.trim() && !submittingComment) { onComment(commentContent); setCommentContent(''); } }} />
                <button onClick={() => { if (commentContent.trim()) { onComment(commentContent); setCommentContent(''); } }} disabled={!commentContent.trim() || !!submittingComment} className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0">
                  {submittingComment ? <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Send className="w-3 h-3 sm:w-4 sm:h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {deleteOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-opacity-50" onClick={() => setDeleteOpen(false)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-xl max-w-md w-full shadow-2xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Delete Comment</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">This action cannot be undone</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button onClick={() => setDeleteOpen(false)} className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Cancel</button>
              <button onClick={() => { if (commentToDelete) onDeleteComment(commentToDelete); setDeleteOpen(false); }} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostModal;


