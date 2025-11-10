import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { Post } from '../types';
import { communityService } from '../services/communityService';

export const useCommunityPosts = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const postsQuery = useQuery({
    queryKey: ['communityPosts', activeCategory],
    queryFn: () => communityService.listPosts({ category: activeCategory }),
    staleTime: 30_000,
  });

  useEffect(() => {
    if (postsQuery.data) setPosts(postsQuery.data as Post[]);
    setLoadingPosts(postsQuery.isLoading || postsQuery.isFetching);
  }, [postsQuery.data, postsQuery.isLoading, postsQuery.isFetching]);

  useEffect(() => {
    setPage(1);
  }, [activeCategory, searchQuery, posts.length]);

  const filteredPosts = useMemo(() => {
    return posts.filter(post =>
      searchQuery === '' ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.users.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.users.last_name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [posts, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / pageSize));
  const start = (page - 1) * pageSize;
  const pagedPosts = filteredPosts.slice(start, start + pageSize);

  return {
    posts,
    setPosts,
    loadingPosts,
    fetchPosts: () => postsQuery.refetch(),
    activeCategory,
    setActiveCategory,
    searchQuery,
    setSearchQuery,
    page,
    setPage,
    pageSize,
    totalPages,
    pagedPosts,
    filteredPosts,
    isFetchingPosts: postsQuery.isFetching,
  };
};

export default useCommunityPosts;


