import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSidebar } from '../../contexts/SidebarContext';
import { DarkModeToggle, ProBadge } from '../shared';
import { useSubscriptionPlan } from '../../hooks/useSubscriptionPlan';
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  Globe, 
  Settings, 
  LogOut,
  ChevronDown,
  MessageCircle,
  Video,
  Calendar,
  Menu,
  Disc,
  Library
} from 'lucide-react';

interface InstructorSidebarProps {
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
  sidebarRef?: React.RefObject<HTMLDivElement>;
}

const InstructorSidebar: React.FC<InstructorSidebarProps> = ({ 
  isMobileOpen = false, 
  onMobileClose,
  sidebarRef
}) => {
  const { user, logout } = useAuth();
  const { isDarkMode } = useTheme();
  const { isCollapsed, sidebarMode, setSidebarMode, setIsHovering, isHovering } = useSidebar();
  const { hasFeature } = useSubscriptionPlan();
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState<{ [key: string]: boolean }>({});
  const [showControlMenu, setShowControlMenu] = useState(false);
  const controlMenuRef = useRef<HTMLDivElement>(null);

  const toggleMenu = (menuKey: string) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuKey]: !prev[menuKey]
    }));
  };

  const menuItems = [
    {
      key: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      path: '/coach/dashboard',
      hasSubmenu: false,
      requiresPro: false
    },
    {
      key: 'courses',
      label: 'Courses',
      icon: BookOpen,
      path: '/coach/courses',
      hasSubmenu: false,
      requiresPro: false
    },
    {
      key: 'community',
      label: 'Community',
      icon: MessageCircle,
      path: '/coach/community',
      hasSubmenu: false,
      requiresPro: false
    },
    {
      key: 'record',
      label: 'Record & Library',
      icon: Library,
      path: '/coach/library',
      hasSubmenu: false,
      requiresPro: true,
      proFeature: 'videoHosting' as const
    },
    {
      key: 'social-calendar',
      label: 'Social Calendar',
      icon: Calendar,
      path: '/coach/social-calendar',
      hasSubmenu: false,
      requiresPro: false
    },
    {
      key: 'website',
      label: 'Website',
      icon: Globe,
      path: '/coach/websitev2',
      hasSubmenu: false,
      requiresPro: false
    },
    {
      key: 'students',
      label: 'Students',
      icon: Users,
      path: '/coach/students',
      hasSubmenu: false,
      requiresPro: false
    },
    {
      key: 'live-calls',
      label: 'Live Calls',
      icon: Video,
      path: '/coach/live-calls',
      hasSubmenu: false,
      requiresPro: false
    },
    {
      key: 'meetings',
      label: 'Video Meetings',
      icon: Video,
      path: '/coach/meetings',
      hasSubmenu: false,
      requiresPro: true,
      proFeature: 'meet' as const
    }
  ];

  const isActive = (path: string) => {
    // Special handling for website - also check websitev2 route
    if (path === '/coach/websitev2') {
      return location.pathname === '/coach/websitev2' || location.pathname === '/coach/website';
    }
    return location.pathname === path;
  };

  const handleNavigation = (path: string, hasSubmenu: boolean = false, requiresPro: boolean = false, proFeature?: 'screenRecording' | 'videoHosting' | 'meet' | 'customDomain') => {
    if (hasSubmenu) {
      toggleMenu(path);
    } else {
      // Check if feature requires Pro and user doesn't have it
      if (requiresPro && proFeature && !hasFeature(proFeature)) {
        // Don't navigate, just show an alert or do nothing
        alert(`This feature requires a Pro subscription. Please upgrade to access ${proFeature}.`);
        return;
      }
      
      navigate(path);
      // Close mobile menu after navigation
      if (onMobileClose) {
        onMobileClose();
      }
    }
  };

  // Close control menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (controlMenuRef.current && !controlMenuRef.current.contains(event.target as Node)) {
        setShowControlMenu(false);
      }
    };

    if (showControlMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showControlMenu]);

  return (
    <>
      {/* Sidebar */}
      <div 
        ref={sidebarRef}
        onMouseEnter={() => sidebarMode === 'hover' && !showControlMenu && setIsHovering(true)}
        onMouseLeave={() => sidebarMode === 'hover' && !showControlMenu && setIsHovering(false)}
        className={`
        fixed left-0 top-0 h-full border-r z-30 flex flex-col transition-all duration-300 ease-in-out shadow-lg
        ${isCollapsed ? 'w-20' : 'w-64'}
        ${isDarkMode ? 'bg-surface border-default' : 'bg-white border-gray-200'}
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:z-20 md:shadow-none
        overflow-hidden
      `}>
      {/* Header */}
      <div 
        className={`border-b ${isDarkMode ? 'border-default' : 'border-gray-200'} p-6 transition-opacity duration-300 ${
          isCollapsed ? 'opacity-0 overflow-hidden h-0 p-0 border-0' : 'opacity-100 h-auto'
        }`}
      >
        <div className="flex items-center space-x-3 mb-4">
          <div className="h-10 w-36 shrink-0 overflow-hidden flex items-center">
            <img
              src="/Coachly official.png"
              alt="Coachly"
              className={`h-18 w-auto object-contain select-none pointer-events-none scale-[1.1] -ml-2 ${isDarkMode ? 'invert brightness-200' : ''}`}
              draggable="false"
            />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <p className={`text-sm truncate ${isDarkMode ? 'text-muted' : 'text-gray-600'}`}>Welcome back,</p>
            <p className={`font-semibold truncate ${isDarkMode ? 'text-primary' : 'text-gray-900'}`}>{user?.firstName}!</p>
          </div>
          <DarkModeToggle size="sm" className="flex-shrink-0 ml-2" />
        </div>
      </div>

      {/* Minimized state: Logo, Dark Mode, Menu Button */}
      <div 
        className={`space-y-2 ${isDarkMode ? 'border-default' : 'border-gray-200'} transition-opacity duration-300 ${
          !isCollapsed ? 'opacity-0 overflow-hidden h-0 p-0' : 'opacity-100 h-auto pb-4'
        }`}
      >
          {/* Logo */}
          <div className="flex justify-center px-2 -mt-6">
            <div className="h-10 w-10 overflow-hidden flex items-center justify-center">
              <img
                src="/Coachly official.png"
                alt="Coachly"
                className={`h-8 w-auto object-contain select-none pointer-events-none ${isDarkMode ? 'invert brightness-200' : ''}`}
                draggable="false"
              />
            </div>
          </div>
          
          {/* Dark Mode Toggle */}
          <div className="px-2">
            <div className="flex justify-center">
              <DarkModeToggle size="sm" />
            </div>
          </div>

          {/* Menu Toggle Button - Temporarily expands sidebar */}
          <div className="px-2 mt-4">
            <button
              onClick={() => {
                console.log('🔥 Menu button clicked - isCollapsed:', isCollapsed);
                console.log('🔥 Current showControlMenu:', showControlMenu);
                // Temporarily expand to show control menu
                setIsHovering(true);
                setShowControlMenu(true);
                console.log('🔥 After setting - showControlMenu should be: true');
              }}
              className={`w-full flex items-center justify-center py-2 rounded-lg transition-colors ${
                isDarkMode
                  ? 'bg-gray-700 hover:bg-gray-600 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
              title="Sidebar Control"
            >
              <Menu size={16} />
            </button>
          </div>
        </div>

      {/* Control Menu - Portal outside sidebar container */}
      {showControlMenu && createPortal(
        <div
          ref={controlMenuRef}
          style={{ 
            position: 'fixed', 
            top: '120px', 
            left: isCollapsed || (sidebarMode === 'hover' && !isHovering) ? '90px' : '280px', 
            zIndex: 99999,
            backgroundColor: isDarkMode ? 'rgb(30, 41, 59)' : 'white',
            border: '1px solid',
            borderColor: isDarkMode ? 'rgb(51, 65, 85)' : 'rgb(229, 231, 235)',
            padding: '8px',
            minHeight: '120px',
            borderRadius: '8px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            width: '160px'
          }}
        >
          <div className="py-1">
            <button
              onClick={() => {
                setSidebarMode('expanded');
                setShowControlMenu(false);
                setIsHovering(false);
              }}
              className={`w-full text-left px-4 py-2 text-sm ${
                sidebarMode === 'expanded'
                  ? (isDarkMode ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-50 text-purple-700')
                  : (isDarkMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-100')
              }`}
            >
              Expanded
            </button>
            <button
              onClick={() => {
                setSidebarMode('collapsed');
                setShowControlMenu(false);
                setIsHovering(false);
              }}
              className={`w-full text-left px-4 py-2 text-sm ${
                sidebarMode === 'collapsed'
                  ? (isDarkMode ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-50 text-purple-700')
                  : (isDarkMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-100')
              }`}
            >
              Collapsed
            </button>
            <button
              onClick={() => {
                setSidebarMode('hover');
                setShowControlMenu(false);
                setIsHovering(false);
                setShowControlMenu(false); // Ensure menu closes
              }}
              className={`w-full text-left px-4 py-2 text-sm ${
                sidebarMode === 'hover'
                  ? (isDarkMode ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-50 text-purple-700')
                  : (isDarkMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-100')
              }`}
            >
              Expand on hover
            </button>
          </div>
        </div>,
        document.body
      )}

      {/* Expanded state: Toggle Button below header */}
      <div 
        className={`px-3 py-2 border-b ${isDarkMode ? 'border-default' : 'border-gray-200'} transition-opacity duration-300 ${
          isCollapsed ? 'opacity-0 overflow-hidden h-0 p-0 border-0' : 'opacity-100 h-auto'
        }`}
      >
        <button
          onClick={() => setShowControlMenu(!showControlMenu)}
          className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${
            isDarkMode
              ? 'bg-gray-700 hover:bg-gray-600 text-white'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          }`}
          title="Sidebar Control"
        >
          <Menu size={16} />
          <span className="text-sm font-medium">Sidebar Options</span>
        </button>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 overflow-y-auto py-4">
        <div className={`space-y-1 ${isCollapsed ? 'px-2' : 'px-3'}`}>
          {menuItems.map((item) => {
            const isProFeature = item.requiresPro && item.proFeature;
            const hasAccess = !isProFeature || hasFeature(item.proFeature!);
            
            return (
              <div key={item.key}>
                <button
                  onClick={() => handleNavigation(item.path, item.hasSubmenu, item.requiresPro, item.proFeature)}
                  disabled={isProFeature && !hasAccess}
                  className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0 py-2' : 'px-3 py-2'} text-sm font-medium rounded-lg transition-colors ${
                    isProFeature && !hasAccess
                      ? (isDarkMode ? 'text-gray-600 cursor-not-allowed opacity-50' : 'text-gray-400 cursor-not-allowed opacity-50')
                      : isActive(item.path) || (item.hasSubmenu && expandedMenus[item.key])
                        ? (isDarkMode ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-50 text-purple-700')
                        : (isDarkMode ? 'text-gray-300 hover:bg-gray-800 hover:text-white' : 'text-gray-700 hover:bg-gray-50')
                  }`}
                  title={isCollapsed ? item.label : undefined}
                >
                  <item.icon size={20} className="flex-shrink-0" />
                  {!isCollapsed && (
                    <>
                      <span className="ml-3 flex-1 text-left">{item.label}</span>
                      {isProFeature && !hasAccess && (
                        <ProBadge size="sm" showText={true} inline={true} />
                      )}
                      {item.hasSubmenu && (
                        <ChevronDown 
                          size={16} 
                          className={`transition-transform ${
                            expandedMenus[item.key] ? 'rotate-180' : ''
                          }`}
                        />
                      )}
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </nav>
      
      {/* Bottom Menu Items */}
      <div className={`border-t ${isDarkMode ? 'border-default' : 'border-gray-200'} ${isCollapsed ? 'px-2 py-4' : 'px-3 py-4'}`}>
        <div className="space-y-1">
          <button
            onClick={() => handleNavigation('/coach/settings')}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0 py-2' : 'px-3 py-2'} text-sm font-medium rounded-lg transition-colors ${
              isActive('/coach/settings')
                ? (isDarkMode ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-50 text-purple-700')
                : (isDarkMode ? 'text-gray-300 hover:bg-gray-800 hover:text-white' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100')
            }`}
            title={isCollapsed ? 'Settings' : undefined}
          >
            <Settings size={20} className="flex-shrink-0" />
            {!isCollapsed && <span className="ml-3 flex-1 text-left">Settings</span>}
          </button>

          <button
            onClick={() => {
              logout();
              if (onMobileClose) {
                onMobileClose();
              }
            }}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0 py-2' : 'px-3 py-2'} text-sm font-medium rounded-lg transition-colors ${
              isDarkMode
                ? 'text-red-400 hover:text-red-300 hover:bg-red-900/20'
                : 'text-red-600 hover:text-red-700 hover:bg-red-50'
            }`}
            title={isCollapsed ? 'Logout' : undefined}
          >
            <LogOut size={20} className="flex-shrink-0" />
            {!isCollapsed && <span className="ml-3 flex-1 text-left">Logout</span>}
          </button>
        </div>
      </div>
      </div>
    </>
  );
};

export default InstructorSidebar;