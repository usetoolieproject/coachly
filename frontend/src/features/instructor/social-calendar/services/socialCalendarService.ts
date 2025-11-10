import type { SocialPost } from '../types';
import { apiFetch } from '../../../../services/api';

export const socialCalendarService = {
  async list(): Promise<SocialPost[]> {
    try {
      const data = await apiFetch('/instructor/social-posts');
      return Array.isArray(data) ? data : [];
    } catch (e) {
      console.error('Network error fetching posts:', e);
      return [];
    }
  },
  async upsert(post: Partial<SocialPost>): Promise<SocialPost> {
    const isUpdate = !!post.id;
    const url = isUpdate ? `/instructor/social-posts/${post.id}` : '/instructor/social-posts';
    const method = isUpdate ? 'PUT' : 'POST';
    const payload = {
      date: post.date,
      time: post.time,
      platform: post.platform,
      title: post.title || '',
      status: post.status,
      mediaLink: post.media_link || '',
      copy: post.copy || ''
    };
    try {
      return await apiFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (e: any) {
      // Network/offline or server refused
      throw new Error('Server unavailable. Please try again after the backend is running.');
    }
  },
  async remove(id: string): Promise<void> {
    await apiFetch(`/instructor/social-posts/${id}`, { method: 'DELETE' });
  }
};


