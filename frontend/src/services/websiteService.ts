import { apiFetch } from './api';

export interface WebsiteConfiguration {
  themeId: string;
  addedSections: string[];
  sectionData: { [key: string]: any };
  selectedPageType: string;
  isMobileView: boolean;
  isPublished?: boolean;
  instructorId?: string;
  communityId?: string;
}

export interface SaveWebsiteResponse {
  success: boolean;
  message: string;
  websiteId?: string;
}

export const websiteService = {
  /**
   * Save website configuration to user account
   */
  async saveWebsiteConfiguration(config: WebsiteConfiguration): Promise<SaveWebsiteResponse> {
    try {
      const data = await apiFetch<SaveWebsiteResponse>('/website/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      return data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Load saved website configuration from user account
   * @param themeId - Optional theme ID to load specific theme
   */
  async loadWebsiteConfiguration(themeId?: string): Promise<WebsiteConfiguration | null> {
    try {
      const url = themeId 
        ? `/website/load?themeId=${themeId}` 
        : '/website/load';
      
      const data = await apiFetch<WebsiteConfiguration>(url, {
        method: 'GET',
      });
      return data;
    } catch (error) {
      // Check if it's a 404 error (no saved configuration)
      if (error && typeof error === 'object' && 'status' in error && error.status === 404) {
        return null;
      }
      return null;
    }
  },

  /**
   * Delete saved website configuration
   */
  async deleteWebsiteConfiguration(): Promise<boolean> {
    try {
      await apiFetch('/website/delete', {
        method: 'DELETE',
      });
      return true;
    } catch (error) {
      return false;
    }
  },

  /**
   * Load public website configuration by subdomain (for public visitors)
   */
  async loadPublicWebsiteConfiguration(subdomain: string): Promise<WebsiteConfiguration | null> {
    try {
      
      const data = await apiFetch<WebsiteConfiguration>(`/website/public/${subdomain}`, {
        method: 'GET',
        omitCredentials: true, // Don't send auth cookies for public access
      });
      
      return data;
    } catch (error) {
      // Check if it's a 404 error (no published website)
      if (error && typeof error === 'object' && 'status' in error && error.status === 404) {
        return null;
      }
      return null;
    }
  }
};
