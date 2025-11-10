import React, { useState, useEffect, useRef } from 'react';
import { Outlet } from 'react-router-dom';
import InstructorSidebar from './InstructorSidebar';
import PromoBanner from '../shared/PromoBanner';
import MobileMenuToggle from '../shared/MobileMenuToggle';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useSidebar } from '../../contexts/SidebarContext';
import { SidebarProvider } from '../../contexts/SidebarContext';
import { PremiumService, PremiumStatus } from '../../services/premiumService';

const InstructorLayoutContent: React.FC = () => {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const { isCollapsed } = useSidebar();
  const [instructorPremiumStatus, setInstructorPremiumStatus] = useState<PremiumStatus | null>(null);
  const [premiumLoaded, setPremiumLoaded] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const toggleButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const fetchPremiumStatus = async () => {
      if (user?.instructor?.id) {
        try {
          const status = await PremiumService.getInstructorPremiumStatus(user.instructor.id);
          setInstructorPremiumStatus(status);
        } catch (error) {
          // Fallback to old premium_ends field
          setInstructorPremiumStatus({
            premium_starts: user.instructor.premium_starts,
            premium_ends: user.instructor.premium_ends,
            isActive: user.instructor.premium_ends ? new Date() <= new Date(user.instructor.premium_ends) : false
          });
        } finally { 
          setPremiumLoaded(true);
        }
      } else { 
        setPremiumLoaded(true); 
      }
    };

    fetchPremiumStatus();
  }, [user?.instructor?.id]);

  // Show promo for instructors who are not subscribed OR are on trial (marketing),
  // but hide for subscribed instructors.
  const showPromo = premiumLoaded && user?.role === 'instructor' && (
    (instructorPremiumStatus?.isTrial === true) || (instructorPremiumStatus?.isActive === false)
  );
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Click outside to close sidebar
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        isMobileMenuOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node) &&
        toggleButtonRef.current &&
        !toggleButtonRef.current.contains(event.target as Node)
      ) {
        closeMobileMenu();
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isMobileMenuOpen, closeMobileMenu]);

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-surface' : 'bg-white'}`}>
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 flex items-center justify-between p-4 border-b bg-white dark:bg-surface border-gray-200 dark:border-default shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-32 shrink-0 overflow-hidden flex items-center">
            <img
              src="/Coachly official.png"
              alt="Coachly"
              className={`h-16 w-auto object-contain select-none pointer-events-none scale-[1.1] -ml-2 ${isDarkMode ? 'invert brightness-200' : ''}`}
              draggable="false"
            />
          </div>
        </div>
        <MobileMenuToggle 
          ref={toggleButtonRef}
          isOpen={isMobileMenuOpen} 
          onToggle={toggleMobileMenu}
        />
      </div>

      {/* Sidebar */}
      <InstructorSidebar 
        isMobileOpen={isMobileMenuOpen}
        onMobileClose={closeMobileMenu}
        sidebarRef={sidebarRef}
      />

      {/* Main Content */}
      <div className={`pt-16 md:pt-0 transition-all duration-300 ${isCollapsed ? 'md:ml-20' : 'md:ml-64'}`}>
        {showPromo && (
          <PromoBanner userId={user?.id} />
        )}
        <Outlet />
      </div>
    </div>
  );
};

const InstructorLayout: React.FC = () => {
  return (
    <SidebarProvider>
      <InstructorLayoutContent />
    </SidebarProvider>
  );
};

export default InstructorLayout;