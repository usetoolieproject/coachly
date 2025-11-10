import { useEffect, useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { instructorCommunityService } from '../services/communityService';
import type { CommunityPost } from '../../../../components/shared/community';

export function useInstructorCommunity() {
  const qc = useQueryClient();
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);
  const [postModalOpen, setPostModalOpen] = useState(false);

  const listQuery = useQuery({
    queryKey: ['instructor-community', activeCategory],
    queryFn: () => instructorCommunityService.list(activeCategory),
    staleTime: 60_000,
    gcTime: 5 * 60_000,
  });

  const filteredPosts = useMemo(() => {
    const posts: CommunityPost[] = listQuery.data || [];
    if (!search) return posts;
    const s = search.toLowerCase();
    return posts.filter(p => p.content.toLowerCase().includes(s) || p.users.first_name.toLowerCase().includes(s) || p.users.last_name.toLowerCase().includes(s));
  }, [listQuery.data, search]);

  const likePost = useMutation({
    mutationFn: (postId: string) => instructorCommunityService.like(postId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['instructor-community'] })
  });

  const createPost = useMutation({
    mutationFn: async ({ content, category, images }: { content: string; category: string; images: File[] | FileList | null }) => {
      let mediaUrls: string[] = [];
      if (images && (images as any).length > 0) {
        mediaUrls = await instructorCommunityService.upload(images as any);
      }
      return instructorCommunityService.create(content, category, mediaUrls);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['instructor-community'] })
  });

  const pinPost = useMutation({
    mutationFn: (postId: string) => instructorCommunityService.pin(postId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['instructor-community'] })
  });

  const commentPost = useMutation({
    mutationFn: ({ postId, content }: { postId: string; content: string }) => instructorCommunityService.comment(postId, content),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['instructor-community'] })
  });

  const likeComment = useMutation({
    mutationFn: (commentId: string) => instructorCommunityService.likeComment(commentId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['instructor-community'] })
  });

  const editComment = useMutation({
    mutationFn: ({ commentId, content }: { commentId: string; content: string }) => instructorCommunityService.editComment(commentId, content),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['instructor-community'] })
  });

  const deleteComment = useMutation({
    mutationFn: (commentId: string) => instructorCommunityService.deleteComment(commentId),
    onMutate: async (commentId: string) => {
      await qc.cancelQueries({ queryKey: ['instructor-community'] });
      // Optimistically update list cache
      const previousList = qc.getQueryData<CommunityPost[]>(['instructor-community', activeCategory]);
      if (previousList) {
        const nextList = previousList.map(p => ({
          ...p,
          comments: (p.comments || []).filter(c => c.id !== commentId)
        } as CommunityPost));
        qc.setQueryData(['instructor-community', activeCategory], nextList);
      }

      // Optimistically update selectedPost
      if (selectedPost) {
        const next = {
          ...selectedPost,
          comments: (selectedPost.comments || []).filter(c => c.id !== commentId)
        } as CommunityPost;
        setSelectedPost(next);
      }

      return { previousList, previousSelected: selectedPost };
    },
    // Do not rollback; rely on refetch to reconcile. Prevents flicker/pop-back.
    onError: () => {},
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['instructor-community'] });
    }
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const postId = params.get('postId');
    if (postId && listQuery.data?.length) {
      const target = (listQuery.data as CommunityPost[]).find(p => p.id === postId);
      if (target) {
        setSelectedPost(target);
        setPostModalOpen(true);
      }
    }
  }, [listQuery.data]);

  // Keep selectedPost in sync with refreshed list data
  useEffect(() => {
    if (!selectedPost) return;
    const current = (listQuery.data as CommunityPost[] | undefined)?.find(p => p.id === selectedPost.id);
    if (current) setSelectedPost(current);
  }, [listQuery.data, selectedPost?.id]);

  return {
    // state
    activeCategory, setActiveCategory,
    search, setSearch,
    posts: filteredPosts,
    isLoading: listQuery.isLoading,
    isFetching: listQuery.isFetching,
    refetch: listQuery.refetch,

    // modal
    selectedPost, setSelectedPost,
    postModalOpen, setPostModalOpen,

    // actions
    likePost: (postId: string) => likePost.mutate(postId),
    createPost: (content: string, category: string, images: File[] | FileList | null) => createPost.mutate({ content, category, images }),
    togglePin: (postId: string) => pinPost.mutate(postId),
    addComment: (postId: string, content: string) => commentPost.mutateAsync({ postId, content }),
    likeComment: (commentId: string) => likeComment.mutate(commentId),
    editComment: (commentId: string, content: string) => editComment.mutate({ commentId, content }),
    deleteComment: (commentId: string) => deleteComment.mutate(commentId),
  };
}


