import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { PageLoadingSkeleton } from './ui/PageLoadingSkeleton';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles = [], 
  redirectTo = '/' 
}) => {
  const { user, loading } = useAuth();

  function baseDomain(hostname: string) {
    const parts = hostname.toLowerCase().split('.');
    if (parts[0] === 'www') parts.shift();
    if (parts.length <= 2) return parts.join('.');
    return parts.slice(-2).join('.');
  }

  if (loading) {
    return <PageLoadingSkeleton />;
  }

  // SCENARIO 1: Unauthenticated user on subdomain - ALLOW ACCESS (no redirection)
  // Users can visit any subdomain even if not authenticated

  if (!user) {
    return <Navigate to={redirectTo} replace />;
  }

  // SCENARIO 2: Authenticated instructor on wrong subdomain - redirect to apex
  if (typeof window !== 'undefined' && user.role === 'instructor') {
    const host = window.location.hostname.toLowerCase();
    const parts = host.split('.');
    if (parts[0] === 'www') parts.shift();
    if (parts.length > 2) {
      const currentSlug = parts[0];
      const expectedSlug = user.instructor?.subdomain;
      if (expectedSlug && currentSlug !== expectedSlug) {
        const apex = baseDomain(host);
        window.location.replace(`https://${apex}/`);
        return null;
      }
    }
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Redirect based on user role - FIXED PATHS
    const redirectMap: { [key: string]: string } = {
      instructor: '/coach',
      student: '/student',
      admin: '/admin'
    };
    return <Navigate to={redirectMap[user.role] || '/'} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;