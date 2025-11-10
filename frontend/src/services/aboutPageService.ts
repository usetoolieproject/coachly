import { apiFetch, getApiBase, getAuthHeaders } from './api';

export interface AboutPageData {
  id: string;
  title: string;
  description: string;
  primary_color: string;
  secondary_color: string;
  subdomain: string;
  custom_domain?: string;
  is_published: boolean;
  banner_url?: string;
  custom_bullets: string[];
  is_paid_community: boolean;
  monthly_price: number;
  included_features: string[];
  testimonials: Array<{
    name: string;
    quote: string;
  }>;
  instructor_intro_content?: IntroContent[];
}

export interface IntroContent {
  id: string;
  description: string;
  instructor_intro_media_items: MediaItem[];
}

export interface MediaItem {
  id: string;
  type: 'video' | 'image';
  url: string;
  order_index: number;
}

export const aboutPageService = {
  async getAboutPage(): Promise<AboutPageData> {
    return await apiFetch('/instructor/about-page');
  },

  async updateAboutPage(data: Partial<AboutPageData>): Promise<AboutPageData> {
    return await apiFetch('/instructor/about-page', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  },

  async uploadBanner(file: File): Promise<{ banner_url: string }> {
    const formData = new FormData();
    formData.append('bannerFile', file);
    return await apiFetch('/instructor/about-page/upload-banner', {
      method: 'POST',
      body: formData,
    });
  },

  async createIntroContent(data: {
    description: string;
    videoUrls?: string[];
    files?: File[];
  }): Promise<IntroContent> {
    const formData = new FormData();
    formData.append('description', data.description);
    
    if (data.videoUrls) {
      data.videoUrls.forEach(url => {
        if (url) formData.append('videoUrls', url);
      });
    }
    
    if (data.files) {
      data.files.forEach(file => {
        formData.append('mediaFiles', file);
      });
    }

    const response = await fetch(`${getApiBase()}/api/instructor/about-page/intro-content`, {
      method: 'POST',
      body: formData,
      ...getAuthHeaders()
    });
    
    if (!response.ok) {
      const error = await response.json();
      console.error('Create intro content error response:', error);
      throw new Error(error.error || 'Failed to create intro content');
    }
    
    return response.json();
  },

  async updateIntroContent(contentId: string, data: {
    description?: string;
    videoUrls?: string[];
    files?: File[];
    removeMediaIds?: string[];
  }): Promise<IntroContent> {
    const formData = new FormData();
    
    if (data.description) formData.append('description', data.description);
    
    if (data.videoUrls) {
      data.videoUrls.forEach(url => {
        if (url) formData.append('videoUrls', url);
      });
    }
    
    if (data.files) {
      data.files.forEach(file => {
        formData.append('mediaFiles', file);
      });
    }

    if (data.removeMediaIds) {
      data.removeMediaIds.forEach(id => {
        formData.append('removeMediaIds', id);
      });
    }

    const response = await fetch(`${getApiBase()}/api/instructor/about-page/intro-content/${contentId}`, {
      method: 'PUT',
      body: formData,
      ...getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to update intro content');
    return response.json();
  },

  async deleteIntroContent(contentId: string): Promise<void> {
    const response = await fetch(`${getApiBase()}/api/instructor/about-page/intro-content/${contentId}`, {
      method: 'DELETE',
      ...getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to delete intro content');
  },

  async getPublicAboutPage(subdomain: string): Promise<AboutPageData & { 
    stats: any; 
    instructor: any; 
    availableCourses: any[] 
  }> {
    return await apiFetch(`/public/${subdomain}`, { omitCredentials: true });
  },
};