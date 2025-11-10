import { getApiBase, getAuthHeaders, getAuthHeadersForFormData, apiFetch } from './api';

export interface ProfileData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profilePictureUrl?: string;
  phone?: string;
  location?: string;
  bio?: string;
  createdAt: string;
  role?: string;
  instructor?: {
    business_name: string;
    subdirectory: string;
  };
}

export const profileService = {
  async getProfile(): Promise<ProfileData> {
    return await apiFetch(`/profile`, { headers: getAuthHeaders() });
  },

  async updateProfile(data: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    location?: string;
    bio?: string;
    email?: string;
    password?: string;
    company?: string;
  }): Promise<{ message: string; user: ProfileData }> {
    return await apiFetch(`/profile`, { method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(data) });
  },

  async uploadProfilePicture(file: File): Promise<{ message: string; profilePictureUrl: string; user: ProfileData }> {
    const formData = new FormData();
    formData.append('profilePicture', file);
    return await apiFetch(`/profile/picture`, { method: 'POST', headers: getAuthHeadersForFormData(), body: formData });
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    return await apiFetch(`/profile/password`, { method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify({ currentPassword, newPassword }) });
  },

  async changeEmail(newEmail: string, password: string): Promise<{ message: string }> {
    return await apiFetch(`/profile/email`, { method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify({ newEmail, password }) });
  },
};