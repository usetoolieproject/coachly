export interface AdminProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  profilePicture?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminProfileUpdateData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  profilePicture?: string;
}

export interface AdminPasswordUpdateData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
