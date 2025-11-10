import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Shield, 
  TrendingUp, 
  Settings, 
  LogOut,
  Tag
} from 'lucide-react';

const AdminSidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: 'overview',
      label: 'Customers',
      icon: TrendingUp,
      path: '/admin/overview',
      hasSubmenu: false
    },
    {
      key: 'subscription-plans',
      label: 'Subscription Plans',
      icon: Settings,
      path: '/admin/payments',
      hasSubmenu: false
    },
    {
      key: 'promo-codes',
      label: 'Promo Codes',
      icon: Tag,
      path: '/admin/promo-codes',
      hasSubmenu: false
    }
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 z-20 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3 mb-4">
          <img 
            src="/Coachly official.png" 
            alt="Coachly Logo" 
            className="w-8 h-8 object-contain"
          />
          <span className="text-xl font-bold text-gray-900">Coachly Admin</span>
        </div>
        <div>
          <p className="text-sm text-gray-600">Welcome back,</p>
          <p className="font-semibold text-gray-900">{user?.firstName}!</p>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 overflow-y-auto py-4">
        <div className="space-y-1 px-3">
          {menuItems.map((item) => (
            <div key={item.key}>
              <button
                onClick={() => handleNavigation(item.path)}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'bg-purple-50 text-purple-700'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <item.icon size={20} className="flex-shrink-0" />
                <span className="ml-3 flex-1 text-left">{item.label}</span>
              </button>
            </div>
          ))}
        </div>
      </nav>
      
      {/* Bottom Menu Items */}
      <div className="space-y-1 px-3 py-4 border-t border-gray-200">
        <button
          onClick={() => navigate('/admin/profile')}
          className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
            isActive('/admin/profile')
              ? 'bg-purple-50 text-purple-700'
              : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <Settings size={20} className="flex-shrink-0" />
          <span className="ml-3 flex-1 text-left">Profile</span>
        </button>

        <button
          onClick={logout}
          className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
        >
          <LogOut size={20} className="flex-shrink-0" />
          <span className="ml-3 flex-1 text-left">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
