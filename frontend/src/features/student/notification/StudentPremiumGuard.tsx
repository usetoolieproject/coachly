import React from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { PremiumService } from '../../../services/premiumService';
import StudentPremiumExpiredScreen from './StudentPremiumExpiredScreen';

interface StudentPremiumGuardProps {
  children: React.ReactNode;
  allowSettings?: boolean;
}

const StudentPremiumGuard: React.FC<StudentPremiumGuardProps> = ({ children, allowSettings = false }) => {
  const { user } = useAuth();

  // If not a student, render children normally
  if (user?.role !== 'student' || !user?.student) {
    return <>{children}</>;
  }

  // If student has no instructor premium data, allow access (backwards compatibility)
  if (!user.student.instructor_premium_ends) {
    return <>{children}</>;
  }

  // Check if instructor's premium has expired
  const isInstructorPremiumExpired = PremiumService.isPremiumExpired(user.student.instructor_premium_ends);

  // If instructor's premium expired and not allowing settings, show expired screen
  if (isInstructorPremiumExpired && !allowSettings) {
    return <StudentPremiumExpiredScreen />;
  }

  // Otherwise, render children normally
  return <>{children}</>;
};

export default StudentPremiumGuard;
