import React, { useState } from 'react';
import { useStudentSettings } from './hooks/useStudentSettings';
import { RefreshButton } from '../../../components/shared';
import { UpdatingIndicator } from '../../../components/shared/ui/UpdatingIndicator';
import { ContactSupportModal } from './components/ContactSupportModal';
import { ProfileInformation } from './components/ProfileInformation';
import { SupportPanel } from './components/SupportPanel';
import { AccountPanel } from './components/AccountPanel';

const StudentSettingsPage: React.FC = () => {
  const { state, form, actions } = useStudentSettings();
  const { profile, loading, saving, uploading, message, community, isUpdating } = state as any;
  const { firstName, lastName, phone, location, bio, setFirstName, setLastName, setPhone, setLocation, setBio } = form;
  const { handleSaveProfile, handleProfilePictureChange, setMessage, refetch } = actions as any;

  const [showSupport, setShowSupport] = useState(false);

  if (loading) {
    return (
      <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="animate-pulse space-y-4 sm:space-y-6">
          <div className="h-6 sm:h-8 w-1/3 sm:w-1/4 bg-gray-200 rounded" />
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] xl:grid-cols-[1fr_380px] gap-4 sm:gap-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6">
              <div className="h-5 sm:h-6 w-1/3 bg-gray-200 rounded mb-4 sm:mb-6" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="h-10 sm:h-12 bg-gray-200 rounded" />
                <div className="h-10 sm:h-12 bg-gray-200 rounded" />
                <div className="h-10 sm:h-12 bg-gray-200 rounded" />
                <div className="h-10 sm:h-12 bg-gray-200 rounded" />
                <div className="h-10 sm:h-12 sm:col-span-2 bg-gray-200 rounded" />
              </div>
              <div className="h-20 sm:h-28 bg-gray-200 rounded mt-3 sm:mt-4" />
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6 h-[180px] sm:h-[220px]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 sm:gap-6">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-gray-900">Settings</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Manage your account and preferences</p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {/* Larger screens: Updating indicator first, then refresh button */}
          <div className="hidden sm:flex items-center gap-2 sm:gap-3">
            <UpdatingIndicator isUpdating={isUpdating} />
            <RefreshButton onClick={() => refetch()} isRefreshing={isUpdating} />
          </div>
          {/* Smaller screens: Refresh button first, then updating indicator */}
          <div className="flex sm:hidden items-center gap-2">
            <RefreshButton onClick={() => refetch()} isRefreshing={isUpdating} />
            <UpdatingIndicator isUpdating={isUpdating} />
          </div>
        </div>
      </div>

      {message && (
        <div className={`mt-3 sm:mt-4 p-3 sm:p-4 rounded-lg flex items-start justify-between gap-3 sm:gap-4 ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          <div className="pr-2 text-sm sm:text-base">{message.text}</div>
          <button type="button" onClick={() => setMessage(null)} className={`shrink-0 px-2 py-1 rounded-md border text-xs sm:text-sm ${message.type === 'success' ? 'border-green-300 hover:bg-green-200/60' : 'border-red-300 hover:bg-red-200/60'}`} aria-label="Dismiss notification">✕</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] xl:grid-cols-[1fr_380px] gap-4 sm:gap-6 mt-4 sm:mt-6">
        <ProfileInformation
          profile={profile}
          uploading={uploading}
          saving={saving}
          firstName={firstName}
          lastName={lastName}
          phone={phone}
          location={location}
          bio={bio}
          setFirstName={setFirstName}
          setLastName={setLastName}
          setPhone={setPhone}
          setLocation={setLocation}
          setBio={setBio}
          onChangePhoto={(file) => handleProfilePictureChange(file)}
          onSave={handleSaveProfile}
        />

        <SupportPanel onContact={() => setShowSupport(true)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] xl:grid-cols-[1fr_380px] gap-4 sm:gap-6 mt-4 sm:mt-6">
        <AccountPanel email={profile?.email} onMessage={setMessage} />
        <div className="hidden lg:block" />
      </div>

      <ContactSupportModal
        open={showSupport}
        onClose={() => setShowSupport(false)}
        contact={community ? { firstName: community.instructor.firstName, lastName: community.instructor.lastName, email: community.instructor.email, phone: community.instructor.phone || null } : null}
      />
    </div>
  );
};

export default StudentSettingsPage;

export { StudentSettingsPage as StudentSettings };


