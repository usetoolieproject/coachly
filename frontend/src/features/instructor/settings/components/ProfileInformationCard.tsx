import React from 'react';
import { Camera, Loader2 } from 'lucide-react';
import { ProfilePicture } from '../../../../components/shared';
import { useTheme } from '../../../../contexts/ThemeContext';

 type Props = {
  profile: any;
  uploading: boolean;
  onPhotoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;

  firstName: string;
  setFirstName: (v: string) => void;
  lastName: string;
  setLastName: (v: string) => void;
  company: string;
  setCompany: (v: string) => void;
  email: string;
  setEmail: (v: string) => void;
  phone: string;
  setPhone: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;

  saving: boolean;
   isEditing: boolean;
   onStartEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
};

const ProfileInformationCard: React.FC<Props> = ({
  profile,
  uploading,
  onPhotoChange,
  firstName,
  setFirstName,
  lastName,
  setLastName,
  company,
  setCompany,
  email,
  setEmail,
  phone,
  setPhone,
  password,
  setPassword,
  saving,
  isEditing,
  onStartEdit,
  onSave,
  onCancel,
}) => {
  const { isDarkMode } = useTheme();
  const cardClasses = `rounded-xl shadow-sm mb-4 sm:mb-6 lg:mb-8 border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`;
  const headingClasses = isDarkMode ? 'text-white' : 'text-slate-800';
  const labelClasses = isDarkMode ? 'text-gray-300' : 'text-gray-800';
  const inputClasses = `w-full p-2 sm:p-3 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent disabled:opacity-60 text-sm sm:text-base ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' : 'border-gray-200 bg-white text-gray-900 placeholder-gray-500'}`;
  if (!profile) {
    return (
      <div className={cardClasses}>
        <div className="p-6 pb-2">
          <div className="flex items-center gap-3">
            <div>
              <h3 className={`text-base font-semibold ${headingClasses}`}>Profile Information</h3>
            </div>
          </div>
        </div>
        <div className="px-6 pt-2 animate-pulse">
          {/* Picture skeleton */}
          <div className="flex items-center gap-4 mb-6">
            <div className={`h-16 w-16 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
            <div className="space-y-2">
              <div className={`h-9 w-36 rounded-2xl ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
              <div className={`h-4 w-40 rounded ${isDarkMode ? 'bg-gray-600' : 'bg-gray-100'}`} />
            </div>
          </div>
          {/* Fields skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="space-y-2">
                <div className={`h-4 w-24 rounded ${isDarkMode ? 'bg-gray-600' : 'bg-gray-100'}`} />
                <div className={`h-12 w-full rounded-2xl ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
              </div>
            ))}
          </div>
        </div>
        <div className="px-6 py-4 flex justify-start gap-2">
          <div className={`h-12 w-28 rounded-2xl animate-pulse ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
          <div className={`h-12 w-28 rounded-2xl animate-pulse ${isDarkMode ? 'bg-gray-600' : 'bg-gray-100'}`} />
        </div>
      </div>
    );
  }
  return (
    <div className={cardClasses}>
      <div className="p-4 sm:p-6 pb-2">
        <div className="flex items-center gap-3">
          <div>
            <h3 className={`text-sm sm:text-base font-semibold ${headingClasses}`}>Profile Information</h3>
          </div>
        </div>
      </div>
      <div className="px-4 sm:px-6 pt-2">
        {/* Profile Picture */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
          {uploading ? (
            <div className={`h-12 w-12 sm:h-16 sm:w-16 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
              <Loader2 className={`w-4 h-4 sm:w-6 sm:h-6 animate-spin ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
            </div>
          ) : (
            <ProfilePicture
              src={profile?.profilePictureUrl}
              firstName={profile?.firstName || ''}
              lastName={profile?.lastName || ''}
              size="xl"
            />
          )}
          <div className="flex-1 min-w-0">
            <input id="photo" type="file" accept="image/png,image/jpeg,image/gif" className="hidden" onChange={onPhotoChange} disabled={uploading || !isEditing} />
            <label htmlFor="photo" className={`flex items-center px-3 sm:px-4 py-2 rounded-2xl transition-colors cursor-pointer text-sm sm:text-base ${isEditing ? (isDarkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200') : (isDarkMode ? 'bg-gray-700/60 text-gray-500 cursor-not-allowed' : 'bg-gray-100/60 text-gray-400 cursor-not-allowed')}`}>
              <Camera className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              {uploading ? 'Uploading...' : 'Change Photo'}
            </label>
            <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>JPG, GIF or PNG. 10MB max.</p>
          </div>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="space-y-1 sm:space-y-2">
            <label className={`text-xs sm:text-sm font-medium ${labelClasses}`}>First name</label>
            <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} disabled={!isEditing} className={inputClasses} />
          </div>
          <div className="space-y-1 sm:space-y-2">
            <label className={`text-xs sm:text-sm font-medium ${labelClasses}`}>Last name</label>
            <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} disabled={!isEditing} className={inputClasses} />
          </div>
          <div className="space-y-1 sm:space-y-2">
            <label className={`text-xs sm:text-sm font-medium ${labelClasses}`}>Company</label>
            <input type="text" value={company} onChange={(e) => setCompany(e.target.value)} disabled={!isEditing} className={inputClasses} />
          </div>
          <div className="space-y-1 sm:space-y-2">
            <label className={`text-xs sm:text-sm font-medium ${labelClasses}`}>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={!isEditing} className={inputClasses} />
          </div>
          <div className="space-y-1 sm:space-y-2">
            <label className={`text-xs sm:text-sm font-medium ${labelClasses}`}>Phone number</label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} disabled={!isEditing} placeholder="e.g. +1 555 123 4567" className={inputClasses} />
          </div>
          <div className="space-y-1 sm:space-y-2">
            <label className={`text-xs sm:text-sm font-medium ${labelClasses}`}>Change password</label>
            <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} disabled={!isEditing} className={inputClasses} />
            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Leave blank to keep your current password. Minimum 6 characters.</p>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row justify-start gap-2 sm:gap-3">
        {!isEditing ? (
          <button onClick={onStartEdit} className="bg-violet-500 hover:bg-violet-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-2xl font-medium transition-colors text-sm sm:text-base">Update</button>
        ) : (
          <>
            <button onClick={onSave} disabled={saving} className="bg-violet-500 hover:bg-violet-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-2xl font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm sm:text-base">
              {saving && <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />}
              {saving ? 'Saving...' : 'Save changes'}
            </button>
            <button onClick={onCancel} className={`px-4 sm:px-6 py-2 sm:py-3 rounded-2xl transition-colors font-medium text-sm sm:text-base ${isDarkMode ? 'border border-gray-600 hover:bg-gray-700 text-gray-300' : 'border border-gray-300 hover:bg-gray-50 text-gray-700'}`}>Cancel</button>
          </>
        )}
      </div>
    </div>
  );
};

export default ProfileInformationCard;


