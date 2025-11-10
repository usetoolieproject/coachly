import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { DarkModeToggle } from '../shared';
import { 
  BookOpen, 
  MessageCircle, 
  Video, 
  Settings, 
  LogOut,
  BarChart3,
  Calendar
} from 'lucide-react';

interface StudentSidebarProps {
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
  sidebarRef?: React.RefObject<HTMLDivElement>;
}

const StudentSidebar: React.FC<StudentSidebarProps> = ({ 
  isMobileOpen = false, 
  onMobileClose,
  sidebarRef
}) => {
  const { user, logout } = useAuth();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: 'dashboard',
      label: 'Dashboard',
      icon: BarChart3,
      path: '/student/dashboard',
      hasSubmenu: false
    },
    {
      key: 'courses',
      label: 'My Courses',
      icon: BookOpen,
      path: '/student/courses',
      hasSubmenu: false
    },
    {
      key: 'community',
      label: 'Community',
      icon: MessageCircle,
      path: '/student/community',
      hasSubmenu: false
    },
    {
      key: 'live-calls',
      label: 'Live Sessions',
      icon: Video,
      path: '/student/live-calls',
      hasSubmenu: false
    },
    {
      key: 'meetings',
      label: 'Meetings',
      icon: Calendar,
      path: '/student/meetings',
      hasSubmenu: false
    }
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    // Close mobile menu after navigation
    if (onMobileClose) {
      onMobileClose();
    }
  };

  return (
    <>
      {/* Sidebar */}
      <div 
        ref={sidebarRef}
        className={`
        fixed left-0 top-0 h-full w-64 border-r z-30 flex flex-col transition-transform duration-300 ease-in-out shadow-lg
        ${isDarkMode ? 'bg-surface border-default' : 'bg-white border-gray-200'}
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:z-20 md:shadow-none
      `}>
      {/* Header */}
      <div className={`p-6 border-b ${isDarkMode ? 'border-default' : 'border-gray-200'}`}>
        <div className="flex items-center space-x-3 mb-4">
          <div className={`h-10 w-36 shrink-0 overflow-hidden flex items-center`}>
            <img src="/Coachly official.png" alt="Coachly" className={`h-18 w-auto object-contain select-none pointer-events-none scale-[1.1] -ml-2 ${isDarkMode ? 'invert brightness-200' : ''}`} draggable="false" />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-sm ${isDarkMode ? 'text-muted' : 'text-gray-600'}`}>Welcome back,</p>
            <p className={`font-semibold ${isDarkMode ? 'text-primary' : 'text-gray-900'}`}>{user?.firstName}!</p>
          </div>
          <DarkModeToggle size="sm" />
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
                    ? (isDarkMode ? 'bg-purple-900/30 text-purple-300' : 'bg-blue-50 text-blue-700')
                    : (isDarkMode ? 'text-gray-300 hover:bg-gray-800 hover:text-white' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100')
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
      <div className={`space-y-1 px-3 py-4 border-t ${isDarkMode ? 'border-default' : 'border-gray-200'}`}>
        <button
          onClick={() => handleNavigation('/student/settings')}
          className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
            isActive('/student/settings')
              ? (isDarkMode ? 'bg-purple-900/30 text-purple-300' : 'bg-blue-50 text-blue-700')
              : (isDarkMode ? 'text-gray-300 hover:bg-gray-800 hover:text-white' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100')
          }`}
        >
          <Settings size={20} className="flex-shrink-0" />
          <span className="ml-3 flex-1 text-left">Settings</span>
        </button>

        <button
          onClick={() => {
            logout();
            if (onMobileClose) {
              onMobileClose();
            }
          }}
          className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${isDarkMode ? 'text-red-400 hover:text-red-300 hover:bg-red-900/20' : 'text-red-600 hover:text-red-700 hover:bg-red-50'}`}
        >
          <LogOut size={20} className="flex-shrink-0" />
          <span className="ml-3 flex-1 text-left">Logout</span>
        </button>
      </div>
      </div>
    </>
  );
};

export default StudentSidebar;