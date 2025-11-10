import React from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { LogOut, AlertTriangle } from 'lucide-react';

const StudentPremiumExpiredScreen: React.FC = () => {
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-red-100 p-8 text-center">
        {/* Icon */}
        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
          <AlertTriangle className="w-8 h-8 text-red-600" />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Access Temporarily Unavailable
        </h1>

        {/* Message */}
        <div className="text-gray-600 mb-8 space-y-3">
          <p>
            Your instructor's premium access has expired, which means access to course content is temporarily restricted.
          </p>
          <p className="text-sm">
            Please contact your instructor to renew their subscription, or check back later.
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={handleLogout}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-xl transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
          
          <p className="text-xs text-gray-500">
            You can still access your account settings and logout
          </p>
        </div>
      </div>
    </div>
  );
};

export default StudentPremiumExpiredScreen;
