import { Theme } from '../types';

// Stub service functions for future API integration
export const websiteV2Service = {
  async getThemes(): Promise<Theme[]> {
    // TODO: Replace with actual API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([]);
      }, 100);
    });
  },

  async saveWebsiteV2(websiteData: any): Promise<boolean> {
    // TODO: Replace with actual API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, 500);
    });
  },

  async publishWebsiteV2(websiteData: any): Promise<boolean> {
    // TODO: Replace with actual API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, 1000);
    });
  }
};
