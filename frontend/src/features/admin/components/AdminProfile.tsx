import React from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useTheme } from '../../../contexts/ThemeContext';
import { ProfilePicture } from '../../../components/shared';
import { ArrowRight, LogOut } from 'lucide-react';

const AdminProfile: React.FC = () => {
  const { user, logout } = useAuth();
  const { isDarkMode } = useTheme();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className={`text-2xl sm:text-3xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
          Profile
        </h1>
        <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-2 text-sm sm:text-base`}>
          Manage your account information and preferences
        </p>
      </div>

      {/* Account Section */}
      <div className={`rounded-2xl shadow-sm border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
              Account
            </h2>
          </div>

          {/* Profile Information Card */}
          <div className={`rounded-xl p-6 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <div className="flex items-center space-x-4">
              {/* Profile Picture */}
              <div className="flex-shrink-0">
                <ProfilePicture 
                  src={user?.profilePictureUrl} 
                  firstName={user?.firstName || ''} 
                  lastName={user?.lastName || ''} 
                  size="xl" 
                />
              </div>

              {/* User Information */}
              <div className="flex-1 min-w-0">
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                  {user?.firstName} {user?.lastName}
                </h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                  {user?.email}
                </p>
                <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'} mt-1`}>
                  Administrator
                </p>
              </div>

              {/* Manage Button */}
              <div className="flex-shrink-0">
                <button className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isDarkMode 
                    ? 'bg-gray-600 text-gray-100 hover:bg-gray-500' 
                    : 'bg-gray-900 text-white hover:bg-gray-800'
                }`}>
                  Manage
                </button>
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <div className="mt-6">
            <button
              onClick={logout}
              className={`w-full flex items-center justify-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isDarkMode 
                  ? 'text-red-400 hover:text-red-300 hover:bg-red-900/20' 
                  : 'text-red-600 hover:text-red-700 hover:bg-red-50'
              }`}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
