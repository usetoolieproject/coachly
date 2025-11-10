import { apiFetch } from '../../../../services/api';

export const instructorCommunityService = {
  async upload(files: FileList | File[]) {
    const formData = new FormData();
    (Array.isArray(files) ? files : Array.from(files)).forEach(file => formData.append('files', file));
    const data = await apiFetch('/community/upload', { method: 'POST', body: formData });
    return (data.files || []).map((f: any) => f.url as string);
  },
  async list(category?: string) {
    const url = category && category !== 'all'
      ? `/community/posts?category=${encodeURIComponent(category)}`
      : '/community/posts';
    return await apiFetch(url);
  },
  async create(content: string, category: string, mediaUrls: string[]) {
    return await apiFetch('/community/posts', { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ content, category, mediaUrls }) 
    });
  },
  async like(postId: string) {
    return await apiFetch(`/community/posts/${postId}/like`, { method: 'POST' });
  },
  async pin(postId: string) {
    return await apiFetch(`/community/posts/${postId}/pin`, { method: 'PATCH' });
  },
  async comment(postId: string, content: string) {
    return await apiFetch(`/community/posts/${postId}/comments`, { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ content }) 
    });
  },
  async likeComment(commentId: string) {
    return await apiFetch(`/community/comments/${commentId}/like`, { method: 'POST' });
  },
  async editComment(commentId: string, content: string) {
    return await apiFetch(`/community/comments/${commentId}`, { 
      method: 'PUT', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ content }) 
    });
  },
  async deleteComment(commentId: string) {
    await apiFetch(`/community/comments/${commentId}`, { method: 'DELETE' });
    return true;
  }
};


