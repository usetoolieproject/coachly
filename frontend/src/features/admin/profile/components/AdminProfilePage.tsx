import React, { useState, useEffect } from 'react';
import { useAdminProfile } from '../hooks/useAdminProfile';
import { AdminProfileUpdateData, AdminPasswordUpdateData } from '../types';
import { RefreshButton } from '../../../../components/shared/ui/RefreshButton';
import { UpdatingIndicator } from '../../../../components/shared/ui/UpdatingIndicator';
import AdminProfileSkeleton from './AdminProfileSkeleton';
import { useTheme } from '../../../../contexts/ThemeContext';
import { User, Mail, Phone, Lock, Camera, Save, Eye, EyeOff, Check, X } from 'lucide-react';

const AdminProfilePage: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { 
    profile, 
    loading, 
    error, 
    isUpdating,
    isSaving,
    isPasswordSaving,
    isUploading,
    updateProfile, 
    updatePassword, 
    uploadProfilePicture,
    refetchProfile
  } = useAdminProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Notification state
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  
  // Password validation state
  const [passwordValidation, setPasswordValidation] = useState({
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecialChar: false,
    hasMinLength: false,
  });

  // Profile form state
  const [profileForm, setProfileForm] = useState<AdminProfileUpdateData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    profilePicture: '',
  });

  // Password form state
  const [passwordForm, setPasswordForm] = useState<AdminPasswordUpdateData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Initialize form when profile loads
  React.useEffect(() => {
    if (profile) {
      setProfileForm({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        email: profile.email || '',
        phone: profile.phone || '',
        profilePicture: profile.profilePicture || '',
      });
    }
  }, [profile]);

  // Auto-hide notification after 5 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Password validation function
  const validatePassword = (password: string) => {
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    const hasMinLength = password.length >= 8;

    setPasswordValidation({
      hasUppercase,
      hasLowercase,
      hasNumber,
      hasSpecialChar,
      hasMinLength,
    });
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile(profileForm);
      setIsEditing(false);
      setNotification({ type: 'success', message: 'Profile updated successfully!' });
    } catch (err) {
      setNotification({ type: 'error', message: 'Failed to update profile. Please try again.' });
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updatePassword(passwordForm);
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setNotification({ type: 'success', message: 'Password updated successfully!' });
    } catch (err) {
      setNotification({ type: 'error', message: 'Failed to update password. Please check your current password and try again.' });
    }
  };

  const handleProfilePictureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        await uploadProfilePicture(file);
        setNotification({ type: 'success', message: 'Profile picture updated successfully!' });
      } catch (err) {
        setNotification({ type: 'error', message: 'Failed to upload profile picture. Please try again.' });
      }
    }
  };

  if (loading) {
    return <AdminProfileSkeleton />;
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Profile Settings</h1>
          <UpdatingIndicator isUpdating={isUpdating} />
        </div>
        <div className="flex items-center gap-3">
          <RefreshButton 
            onClick={() => refetchProfile()} 
            isRefreshing={isUpdating}
          />
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <User size={16} />
              Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* Notification Banner */}
      {notification && (
        <div className={`p-4 rounded-lg flex items-center ${
          notification.type === 'success' 
            ? isDarkMode 
              ? 'bg-green-900/20 border border-green-800 text-green-200' 
              : 'bg-green-50 border border-green-200 text-green-800'
            : isDarkMode 
              ? 'bg-red-900/20 border border-red-800 text-red-200' 
              : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {notification.type === 'success' ? (
            <Check className={`w-5 h-5 mr-3 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
          ) : (
            <X className={`w-5 h-5 mr-3 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`} />
          )}
          <span className="font-medium">{notification.message}</span>
          <button
            onClick={() => setNotification(null)}
            className={`ml-auto p-1 rounded-full transition-colors ${
              isDarkMode ? 'hover:bg-white/10' : 'hover:bg-black/10'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Information */}
        <div className={`rounded-lg shadow-sm border p-6 ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <h2 className={`text-lg font-semibold mb-4 ${
            isDarkMode ? 'text-gray-100' : 'text-gray-900'
          }`}>Profile Information</h2>
          
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            {/* Profile Picture */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                  {profile?.profilePicture ? (
                    <img
                      src={profile.profilePicture}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User size={32} className="text-gray-400" />
                  )}
                </div>
                {isEditing && (
                  <label className="absolute bottom-0 right-0 bg-purple-600 text-white rounded-full p-1 cursor-pointer hover:bg-purple-700">
                    {isUploading ? (
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white" />
                    ) : (
                      <Camera size={12} />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePictureChange}
                      className="hidden"
                      disabled={isUploading}
                    />
                  </label>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-600">Profile Picture</p>
                {isEditing && (
                  <p className="text-xs text-gray-500">Click camera icon to upload</p>
                )}
              </div>
            </div>

            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  value={profileForm.firstName}
                  onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                  disabled={!isEditing}
                  placeholder="First name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  value={profileForm.lastName}
                  onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                  disabled={!isEditing}
                  placeholder="Last name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  disabled={!isEditing}
                  placeholder="Email address"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <div className="relative">
                <Phone size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="tel"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  disabled={!isEditing}
                  placeholder="Phone number"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Save size={16} />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    // Reset form to original values
                    if (profile) {
                      setProfileForm({
                        firstName: profile.firstName || '',
                        lastName: profile.lastName || '',
                        email: profile.email || '',
                        phone: profile.phone || '',
                        profilePicture: profile.profilePicture || '',
                      });
                    }
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Password Settings */}
        <div className={`rounded-lg shadow-sm border p-6 ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <h2 className={`text-lg font-semibold mb-4 ${
            isDarkMode ? 'text-gray-100' : 'text-gray-900'
          }`}>Password Settings</h2>
          
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            {/* Current Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  placeholder="Current password"
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={passwordForm.newPassword}
                  onChange={(e) => {
                    setPasswordForm({ ...passwordForm, newPassword: e.target.value });
                    validatePassword(e.target.value);
                  }}
                  placeholder="New password"
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  placeholder="Confirm new password"
                  className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword
                      ? 'border-red-300 focus:ring-red-500'
                      : passwordForm.confirmPassword && passwordForm.newPassword === passwordForm.confirmPassword
                      ? 'border-green-300 focus:ring-green-500'
                      : 'border-gray-300'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword && (
                <p className="text-xs text-red-600 mt-1">Passwords do not match</p>
              )}
              {passwordForm.confirmPassword && passwordForm.newPassword === passwordForm.confirmPassword && (
                <p className="text-xs text-green-600 mt-1">Passwords match</p>
              )}
            </div>

            {/* Password Requirements */}
            <div className="text-xs">
              <p className={`mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Password must be at least 8 characters long and contain:
              </p>
              <ul className="space-y-1">
                <li className={`flex items-center gap-2 ${
                  passwordValidation.hasMinLength 
                    ? isDarkMode ? 'text-green-400' : 'text-green-600' 
                    : isDarkMode ? 'text-red-400' : 'text-red-600'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${
                    passwordValidation.hasMinLength 
                      ? 'bg-green-500' 
                      : 'bg-red-500'
                  }`}></span>
                  At least 8 characters
                </li>
                <li className={`flex items-center gap-2 ${
                  passwordValidation.hasUppercase 
                    ? isDarkMode ? 'text-green-400' : 'text-green-600' 
                    : isDarkMode ? 'text-red-400' : 'text-red-600'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${
                    passwordValidation.hasUppercase 
                      ? 'bg-green-500' 
                      : 'bg-red-500'
                  }`}></span>
                  At least one uppercase letter (A-Z)
                </li>
                <li className={`flex items-center gap-2 ${
                  passwordValidation.hasLowercase 
                    ? isDarkMode ? 'text-green-400' : 'text-green-600' 
                    : isDarkMode ? 'text-red-400' : 'text-red-600'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${
                    passwordValidation.hasLowercase 
                      ? 'bg-green-500' 
                      : 'bg-red-500'
                  }`}></span>
                  At least one lowercase letter (a-z)
                </li>
                <li className={`flex items-center gap-2 ${
                  passwordValidation.hasNumber 
                    ? isDarkMode ? 'text-green-400' : 'text-green-600' 
                    : isDarkMode ? 'text-red-400' : 'text-red-600'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${
                    passwordValidation.hasNumber 
                      ? 'bg-green-500' 
                      : 'bg-red-500'
                  }`}></span>
                  At least one number (0-9)
                </li>
                <li className={`flex items-center gap-2 ${
                  passwordValidation.hasSpecialChar 
                    ? isDarkMode ? 'text-green-400' : 'text-green-600' 
                    : isDarkMode ? 'text-red-400' : 'text-red-600'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${
                    passwordValidation.hasSpecialChar 
                      ? 'bg-green-500' 
                      : 'bg-red-500'
                  }`}></span>
                  At least one special character (!@#$%^&*)
                </li>
              </ul>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={
                isPasswordSaving || 
                !passwordForm.currentPassword || 
                !passwordForm.newPassword || 
                !passwordForm.confirmPassword ||
                !Object.values(passwordValidation).every(Boolean) ||
                passwordForm.newPassword !== passwordForm.confirmPassword
              }
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Lock size={16} />
              {isPasswordSaving ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminProfilePage;
