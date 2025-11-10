import { apiFetch } from '../../../../services/api';

export const communityService = {
  async getCommunity() {
    return await apiFetch('/student/community');
  },

  async listPosts(params: { category?: string; search?: string } = {}) {
    const query = new URLSearchParams();
    if (params.category && params.category !== 'all') query.set('category', params.category);
    if (params.search) query.set('q', params.search);
    const queryString = query.toString() ? `?${query}` : '';
    return await apiFetch(`/community/posts${queryString}`);
  },

  async createPost(data: { content: string; category: string; mediaUrls: string[] }) {
    return await apiFetch('/community/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  },

  async updatePost(postId: string, data: { content: string; category: string; mediaUrls: string[] }) {
    return await apiFetch(`/community/posts/${postId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  },

  async deletePost(postId: string) {
    return await apiFetch(`/community/posts/${postId}`, { method: 'DELETE' });
  },

  async likePost(postId: string) {
    return await apiFetch(`/community/posts/${postId}/like`, { method: 'POST' });
  },

  async createComment(postId: string, content: string) {
    return await apiFetch(`/community/posts/${postId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content })
    });
  },

  async likeComment(commentId: string) {
    return await apiFetch(`/community/comments/${commentId}/like`, { method: 'POST' });
  },
};


