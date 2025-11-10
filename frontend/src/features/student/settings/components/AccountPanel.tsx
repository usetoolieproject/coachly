import React, { useState } from 'react';
import { useTheme } from '../../../../contexts/ThemeContext';
import { profileService } from '../../../../services/profileService';

export const AccountPanel: React.FC<{ email?: string; onMessage?: (m: { type: 'success' | 'error'; text: string } | null) => void; }> = ({ email, onMessage }) => {
  const { isDarkMode } = useTheme();
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [emailPassword, setEmailPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pending, setPending] = useState(false);

  const note = (msg: string, type: 'success' | 'error') => onMessage && onMessage({ type, text: msg });

  const handleChangeEmail = async () => {
    setPending(true);
    try {
      const res = await profileService.changeEmail(newEmail, emailPassword);
      note(res.message || 'Email updated', 'success');
      setShowEmailModal(false);
      setNewEmail('');
      setEmailPassword('');
    } catch (e: any) {
      note(e.message || 'Failed to update email', 'error');
    } finally {
      setPending(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      note('New passwords do not match', 'error');
      return;
    }
    if (newPassword.length < 6) {
      note('New password must be at least 6 characters', 'error');
      return;
    }
    setPending(true);
    try {
      const res = await profileService.changePassword(currentPassword, newPassword);
      note(res.message || 'Password updated', 'success');
      setShowPasswordModal(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (e: any) {
      note(e.message || 'Failed to update password', 'error');
    } finally {
      setPending(false);
    }
  };

  return (
    <div className={`rounded-2xl shadow-sm border mt-4 sm:mt-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <div className="p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <h2 className={`text-sm sm:text-base font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Account</h2>
        </div>
        <hr className={`my-3 sm:my-4 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`} />
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] items-start sm:items-center gap-3 py-2">
          <div className="min-w-0">
            <div className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Email</div>
            <div className={`text-xs sm:text-sm font-medium truncate ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{email}</div>
          </div>
          <button type="button" onClick={() => setShowEmailModal(true)} className={`px-3 py-1.5 rounded-xl border text-xs sm:text-sm w-full sm:w-auto ${isDarkMode ? 'border-gray-600 hover:bg-gray-700 text-gray-300' : 'border-gray-300 hover:bg-gray-50 text-gray-700'}`}>Change Email</button>
        </div>
        <hr className={`my-2 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`} />
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] items-start sm:items-center gap-3 py-2">
          <div className="min-w-0">
            <div className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Password</div>
            <div className={`text-xs sm:text-sm font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Change your password</div>
          </div>
          <button type="button" onClick={() => setShowPasswordModal(true)} className={`px-3 py-1.5 rounded-xl border text-xs sm:text-sm w-full sm:w-auto ${isDarkMode ? 'border-gray-600 hover:bg-gray-700 text-gray-300' : 'border-gray-300 hover:bg-gray-50 text-gray-700'}`}>Change Password</button>
        </div>
      </div>

      {/* Change Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40">
          <div className={`rounded-2xl max-w-md w-full p-4 sm:p-6 max-h-[90vh] overflow-y-auto ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h3 className={`text-base sm:text-lg font-semibold mb-3 sm:mb-4 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Change Email</h3>
            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className={`block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>New Email</label>
                <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className={`w-full p-2.5 sm:p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base ${isDarkMode ? 'border-gray-600 bg-gray-700 text-gray-100' : 'border-gray-200 bg-white text-gray-900'}`} />
              </div>
              <div>
                <label className={`block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Current Password</label>
                <input type="password" value={emailPassword} onChange={(e) => setEmailPassword(e.target.value)} className={`w-full p-2.5 sm:p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base ${isDarkMode ? 'border-gray-600 bg-gray-700 text-gray-100' : 'border-gray-200 bg-white text-gray-900'}`} />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4 sm:mt-6">
              <button type="button" onClick={() => setShowEmailModal(false)} className={`flex-1 px-3 sm:px-4 py-2 border rounded-lg text-sm sm:text-base ${isDarkMode ? 'border-gray-600 hover:bg-gray-700 text-gray-300' : 'border-gray-300 hover:bg-gray-50 text-gray-700'}`}>Cancel</button>
              <button type="button" onClick={handleChangeEmail} disabled={pending} className="flex-1 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm sm:text-base">{pending ? 'Saving...' : 'Change Email'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40">
          <div className={`rounded-2xl max-w-md w-full p-4 sm:p-6 max-h-[90vh] overflow-y-auto ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h3 className={`text-base sm:text-lg font-semibold mb-3 sm:mb-4 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Change Password</h3>
            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className={`block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Current Password</label>
                <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className={`w-full p-2.5 sm:p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base ${isDarkMode ? 'border-gray-600 bg-gray-700 text-gray-100' : 'border-gray-200 bg-white text-gray-900'}`} />
              </div>
              <div>
                <label className={`block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>New Password</label>
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={`w-full p-2.5 sm:p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base ${isDarkMode ? 'border-gray-600 bg-gray-700 text-gray-100' : 'border-gray-200 bg-white text-gray-900'}`} />
              </div>
              <div>
                <label className={`block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Confirm New Password</label>
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={`w-full p-2.5 sm:p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base ${isDarkMode ? 'border-gray-600 bg-gray-700 text-gray-100' : 'border-gray-200 bg-white text-gray-900'}`} />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4 sm:mt-6">
              <button type="button" onClick={() => setShowPasswordModal(false)} className={`flex-1 px-3 sm:px-4 py-2 border rounded-lg text-sm sm:text-base ${isDarkMode ? 'border-gray-600 hover:bg-gray-700 text-gray-300' : 'border-gray-300 hover:bg-gray-50 text-gray-700'}`}>Cancel</button>
              <button type="button" onClick={handleChangePassword} disabled={pending} className="flex-1 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm sm:text-base">{pending ? 'Saving...' : 'Change Password'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


