import React, { useState, useEffect, useRef } from 'react';
import { Outlet } from 'react-router-dom';
import StudentSidebar from './StudentSidebar';
import MobileMenuToggle from '../shared/MobileMenuToggle';
import { useAuth } from '../../contexts/AuthContext';
import { PremiumStatus } from '../../services/premiumService';
import { useTheme } from '../../contexts/ThemeContext';

const StudentLayout: React.FC = () => {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const [instructorPremiumStatus, setInstructorPremiumStatus] = useState<PremiumStatus | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const toggleButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Get instructor's premium status from student data
    if (user?.student?.instructor_premium_ends) {
      const isActive = new Date() <= new Date(user.student.instructor_premium_ends);
      setInstructorPremiumStatus({
        premium_starts: user.student.instructor_premium_starts,
        premium_ends: user.student.instructor_premium_ends,
        isActive: isActive
      });
    } else {
      setInstructorPremiumStatus(null);
    }
  }, [user?.student?.instructor_premium_starts, user?.student?.instructor_premium_ends]);

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
      <StudentSidebar 
        isMobileOpen={isMobileMenuOpen}
        onMobileClose={closeMobileMenu}
        sidebarRef={sidebarRef}
      />

      {/* Main Content */}
      <div className="md:ml-64 pt-16 md:pt-0">
        <Outlet />
      </div>
    </div>
  );
};

export default StudentLayout;