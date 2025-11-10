import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { PageLoadingSkeleton } from './ui/PageLoadingSkeleton';

interface PublicRouteProps {
  children: React.ReactNode;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <PageLoadingSkeleton />;
  }

  // If user is logged in, redirect to their dashboard
  if (user) {
    // Allow payment signup flow
    try {
      const url = new URL(window.location.href);
      const isPaymentSignup = url.pathname === '/signup/student' && 
                             url.searchParams.get('payment_success') === 'true';
      if (isPaymentSignup) return <>{children}</>;
    } catch {}
    
    // Redirect authenticated users to dashboard
    const redirectMap = {
      instructor: '/coach',
      student: '/student',
      admin: '/admin'
    };
    return <Navigate to={redirectMap[user.role] || '/'} replace />;
  }

  // If not logged in, show the auth page
  return <>{children}</>;
};

export default PublicRoute;