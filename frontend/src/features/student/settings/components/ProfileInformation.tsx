import React, { useState, useEffect } from 'react';
import { Loader2, Camera, Mail, MapPin, Phone } from 'lucide-react';
import { ProfilePicture } from '../../../../components/shared';
import { useTheme } from '../../../../contexts/ThemeContext';
import type { ProfileData } from '../../../../services/profileService';

type Props = {
  profile: ProfileData | null;
  uploading: boolean;
  saving: boolean;
  firstName: string;
  lastName: string;
  phone: string;
  location: string;
  bio: string;
  setFirstName: (v: string) => void;
  setLastName: (v: string) => void;
  setPhone: (v: string) => void;
  setLocation: (v: string) => void;
  setBio: (v: string) => void;
  onChangePhoto: (file: File) => void;
  onSave: () => Promise<void> | void;
};

export const ProfileInformation: React.FC<Props> = ({ profile, uploading, saving, firstName, lastName, phone, location, bio, setFirstName, setLastName, setPhone, setLocation, setBio, onChangePhoto, onSave }) => {
  const { isDarkMode } = useTheme();
  const [isEditing, setIsEditing] = useState(false);

  // Reset form to profile values on cancel
  const resetToProfile = () => {
    if (!profile) return;
    setFirstName(profile.firstName || '');
    setLastName(profile.lastName || '');
    setPhone(profile.phone || '');
    setLocation(profile.location || '');
    setBio(profile.bio || '');
  };

  useEffect(() => {
    // Keep in sync if profile changes while not editing
    if (!isEditing && profile) {
      setFirstName(profile.firstName || '');
      setLastName(profile.lastName || '');
      setPhone(profile.phone || '');
      setLocation(profile.location || '');
      setBio(profile.bio || '');
    }
  }, [profile]);

  const disabled = !isEditing;

  const handleSave = async () => {
    await onSave();
    setIsEditing(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
      <div className="p-4 sm:p-6 pb-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900">Profile Information</h2>
        {!isEditing ? (
          <button type="button" onClick={() => setIsEditing(true)} className="px-3 sm:px-4 py-2 rounded-xl border border-gray-300 hover:bg-gray-50 text-xs sm:text-sm font-medium w-full sm:w-auto">Edit</button>
        ) : (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <button type="button" onClick={() => { resetToProfile(); setIsEditing(false); }} className="px-3 sm:px-4 py-2 rounded-xl border border-gray-300 hover:bg-gray-50 text-xs sm:text-sm font-medium w-full sm:w-auto">Cancel</button>
            <button type="button" onClick={handleSave} disabled={saving} className="bg-blue-600 text-white px-4 sm:px-5 py-2 rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-xs sm:text-sm w-full sm:w-auto">
              {saving && <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />}
              Save
            </button>
          </div>
        )}
      </div>

      <div className="px-4 sm:px-6 py-4 sm:py-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          {uploading ? (
            <div className="h-16 w-16 sm:h-18 sm:w-18 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
              <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin text-gray-600" />
            </div>
          ) : (
            <div className="flex-shrink-0">
              <ProfilePicture src={profile?.profilePictureUrl} firstName={profile?.firstName || ''} lastName={profile?.lastName || ''} size="xl" />
            </div>
          )}
          <div className="flex-1 min-w-0 sm:max-w-48 lg:max-w-40 xl:max-w-36">
            <input id="photo" type="file" accept="image/png,image/jpeg,image/gif" className="hidden" onChange={(e) => e.target.files?.[0] && onChangePhoto(e.target.files[0])} disabled={uploading || disabled} />
            <label htmlFor="photo" className={`flex items-center px-3 sm:px-4 py-2 rounded-2xl transition-colors cursor-pointer text-xs sm:text-sm w-full sm:w-auto ${disabled ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
              <Camera className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
              {uploading ? 'Uploading...' : 'Change Photo'}
            </label>
            <p className="text-xs text-gray-500 mt-1">JPG, GIF or PNG. 10MB max.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-4 sm:mt-6">
          <div className="space-y-2">
            <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">First Name</label>
            <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} disabled={disabled} className={`w-full p-2.5 sm:p-3 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base ${isDarkMode ? 'border-gray-600 bg-gray-800 text-gray-100' : 'border-gray-200 bg-white text-gray-900'} ${disabled ? (isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-50 text-gray-500') : ''}`} />
          </div>
          <div className="space-y-2">
            <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Last Name</label>
            <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} disabled={disabled} className={`w-full p-2.5 sm:p-3 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base ${isDarkMode ? 'border-gray-600 bg-gray-800 text-gray-100' : 'border-gray-200 bg-white text-gray-900'} ${disabled ? (isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-50 text-gray-500') : ''}`} />
          </div>
          <div className="space-y-2">
            <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
            <div className="relative">
              <Mail className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400 dark:text-gray-500" />
              <input type="email" value={profile?.email || ''} disabled className={`w-full pl-8 sm:pl-9 pr-2.5 sm:pr-3 py-2.5 sm:py-3 border rounded-2xl text-sm sm:text-base ${isDarkMode ? 'border-gray-600 bg-gray-700 text-gray-300' : 'border-gray-200 bg-gray-50 text-gray-600'}`} />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Phone</label>
            <div className="relative">
              <Phone className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400 dark:text-gray-500" />
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (555) 123-4567" disabled={disabled} className={`w-full pl-8 sm:pl-9 pr-2.5 sm:pr-3 py-2.5 sm:py-3 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base ${isDarkMode ? 'border-gray-600 bg-gray-800 text-gray-100' : 'border-gray-200 bg-white text-gray-900'} ${disabled ? (isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-50 text-gray-500') : ''}`} />
            </div>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Location</label>
            <div className="relative">
              <MapPin className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400 dark:text-gray-500" />
              <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City, Country" disabled={disabled} className={`w-full pl-8 sm:pl-9 pr-2.5 sm:pr-3 py-2.5 sm:py-3 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base ${isDarkMode ? 'border-gray-600 bg-gray-800 text-gray-100' : 'border-gray-200 bg-white text-gray-900'} ${disabled ? (isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-50 text-gray-500') : ''}`} />
            </div>
          </div>
        </div>

        <div className="space-y-2 mt-3 sm:mt-4">
          <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Bio</label>
          <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell us about yourself…" disabled={disabled} className={`w-full p-2.5 sm:p-3 border rounded-2xl resize-none h-24 sm:h-32 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base ${isDarkMode ? 'border-gray-600 bg-gray-800 text-gray-100' : 'border-gray-200 bg-white text-gray-900'} ${disabled ? (isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-50 text-gray-500') : ''}`} />
        </div>
      </div>
    </div>
  );
};


