import { apiFetch, getAuthHeaders, getAuthHeadersForFormData } from '../../../../services/api';
import { AdminProfile, AdminProfileUpdateData, AdminPasswordUpdateData } from '../types';

export const adminProfileService = {
  // Get admin profile
  getProfile: async (): Promise<AdminProfile> => {
    return await apiFetch('/admin/profile', {
      method: 'GET',
      headers: getAuthHeaders(),
    });
  },

  // Update admin profile
  updateProfile: async (data: AdminProfileUpdateData): Promise<AdminProfile> => {
    return await apiFetch('/admin/profile', {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
  },

  // Update admin password
  updatePassword: async (data: AdminPasswordUpdateData): Promise<void> => {
    await apiFetch('/admin/profile/password', {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
  },

  // Upload profile picture
  uploadProfilePicture: async (file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('profilePicture', file);
    
    return await apiFetch('/admin/profile/picture', {
      method: 'POST',
      headers: getAuthHeadersForFormData(),
      body: formData,
    });
  },
};
