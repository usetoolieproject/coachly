import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { Lock, Settings, LogOut, Crown } from 'lucide-react';

const PremiumExpiredScreen: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleSettings = () => {
    navigate('/coach/settings');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Icon */}
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mb-6">
            <Lock className="w-8 h-8 text-white" />
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Premium Access Expired
          </h1>

          {/* Description */}
          <p className="text-gray-600 mb-8 leading-relaxed">
            Your Trainr premium access has expired. To continue using all features, 
            please upgrade your account or contact support.
          </p>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleSettings}
              className="w-full flex items-center justify-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors"
            >
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </button>

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-2 bg-red-500 hover:bg-red-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>

          {/* Upgrade Notice */}
          <div className="mt-8 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
            <div className="flex items-center justify-center space-x-2 text-purple-700 mb-2">
              <Crown className="w-5 h-5" />
              <span className="font-medium">Upgrade Available</span>
            </div>
            <p className="text-sm text-purple-600">
              Contact support to restore full access to your instructor dashboard.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumExpiredScreen;
