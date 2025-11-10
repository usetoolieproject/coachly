import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useCommunityDetails } from './useCommunityDetails';
import { useCommunityPosts } from './useCommunityPosts';
import { useModalStore } from '../store/modalStore';
import { apiFetch } from '../../../../services/api';

export const useStudentCommunity = () => {
  const location = useLocation();
  
  // Community states
  const { community, isLoadingCommunity, loadCommunity, isFetchingCommunity } = useCommunityDetails();
  
  // Community posts states
  const {
    posts,
    setPosts,
    fetchPosts,
    activeCategory,
    setActiveCategory,
    searchQuery,
    setSearchQuery,
    page,
    setPage,
    pageSize,
    isFetchingPosts,
  } = useCommunityPosts();

  // Modal states
  const { isOpen: postModalOpen, selectedPost, openModal, closeModal, updateSelectedPost } = useModalStore();
  
  const hasProcessedUrlParams = useRef(false);
  const pendingPostId = useRef<string | null>(null);

  useEffect(() => {
    if (community) {
      fetchPosts();
    }
  }, [community, activeCategory]);

  // Handle route state for opening post modal
  useEffect(() => {
    const state: any = location.state || {};
    const shouldOpen = state.open === true;
    const postId = state.postId;
    
    if (shouldOpen && postId && !hasProcessedUrlParams.current) {
      pendingPostId.current = postId;
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [location.state]);

  // Handle opening modal when posts are available
  useEffect(() => {
    if (pendingPostId.current && posts && posts.length > 0 && !hasProcessedUrlParams.current) {
      const post = posts.find((p) => p.id === pendingPostId.current);
      if (post) {
        hasProcessedUrlParams.current = true;
        openModal(post);
        pendingPostId.current = null;
      }
    }
  }, [posts, openModal]);

  // Reset processing flag when modal is closed
  useEffect(() => {
    if (!postModalOpen) {
      hasProcessedUrlParams.current = false;
    }
  }, [postModalOpen]);

  const likePost = async (postId: string) => {
    try {
      const result = await apiFetch(`/community/posts/${postId}/like`, {
        method: 'POST',
      });
        
      setPosts(posts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            user_has_liked: result.liked,
            like_count: result.count
          };
        }
        return post;
      }));

      if (selectedPost && selectedPost.id === postId) {
        updateSelectedPost({
          ...selectedPost,
          user_has_liked: result.liked,
          like_count: result.count
        });
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const addComment = async (postId: string, content: string) => {
    try {
      const newComment = await apiFetch(`/community/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
        
      setPosts(posts.map(post => 
        post.id === postId 
          ? { ...post, comments: [...post.comments, newComment] }
          : post
      ));

      if (selectedPost && selectedPost.id === postId) {
        updateSelectedPost({
          ...selectedPost,
          comments: [...selectedPost.comments, newComment]
        });
      }
    } catch (error) {
      console.error('Error creating comment:', error);
    }
  };

  const likeComment = async (commentId: string, postId: string) => {
    try {
      const result = await apiFetch(`/community/comments/${commentId}/like`, {
        method: 'POST',
      });
      
      const updateComments = (comments: any[]) =>
        comments.map(comment =>
          comment.id === commentId 
            ? { ...comment, user_has_liked: result.liked, like_count: result.count }
            : comment
        );

      setPosts(posts.map(post => 
        post.id === postId 
          ? { ...post, comments: updateComments(post.comments) }
          : post
      ));

      if (selectedPost && selectedPost.id === postId) {
        updateSelectedPost({
          ...selectedPost,
          comments: updateComments(selectedPost.comments)
        });
      }
    } catch (error) {
      console.error('Error toggling comment like:', error);
    }
  };

  const editComment = async (commentId: string, content: string, postId?: string) => {
    try {
      const updated = await apiFetch(`/community/comments/${commentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      
      const pid = postId || selectedPost?.id;
      if (!pid) return;
      const updateComments = (comments: any[]) => comments.map(c => c.id === commentId ? updated : c);
      setPosts(posts.map(post => post.id === pid ? { ...post, comments: updateComments(post.comments) } : post));
      if (selectedPost && selectedPost.id === pid) {
        updateSelectedPost({ ...selectedPost, comments: updateComments(selectedPost.comments) });
      }
    } catch (error) {
      console.error('Error updating comment:', error);
    }
  };

  const deleteComment = async (commentId: string, postId?: string) => {
    try {
      await apiFetch(`/community/comments/${commentId}`, {
        method: 'DELETE',
      });
      
      const pid = postId || selectedPost?.id;
      if (!pid) return;
      const removeComment = (comments: any[]) => comments.filter(c => c.id !== commentId);
      setPosts(posts.map(post => post.id === pid ? { ...post, comments: removeComment(post.comments) } : post));
      if (selectedPost && selectedPost.id === pid) {
        updateSelectedPost({ ...selectedPost, comments: removeComment(selectedPost.comments) });
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const createPost = async (content: string, category: string, mediaUrls: string[] = []) => {
    try {
      await apiFetch('/community/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          category,
          mediaUrls,
        }),
      });

      fetchPosts(); // Refresh posts to get the new post
      return true;
    } catch (error) {
      console.error('Error creating post:', error);
      return false;
    }
  };

  const refetch = () => {
    loadCommunity();
    fetchPosts();
  };

  return {
    // Community data
    community,
    isLoadingCommunity,
    isFetchingCommunity,
    loadCommunity,
    
    // Posts data
    posts,
    setPosts,
    fetchPosts,
    isFetchingPosts,
    
    // Filters
    activeCategory,
    setActiveCategory,
    searchQuery,
    setSearchQuery,
    
    // Pagination
    page,
    setPage,
    pageSize,
    
    // Modal
    selectedPost,
    postModalOpen,
    openModal,
    closeModal,
    
    // Actions
    likePost,
    addComment,
    likeComment,
    editComment,
    deleteComment,
    createPost,
    refetch,
  };
};
