import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTenant } from '../contexts/TenantContext';
import { Navigate } from 'react-router-dom';
import LandingPage from '../features/landing-page/index';
import { PublicWebsiteViewer } from '../features/instructor/websitev2/components/PublicWebsiteViewer';

/**
 * Smart root route handler that determines what to show at the root path (/)
 * based on domain type and authentication status
 */
export const RootRouteHandler: React.FC = () => {
  const { user, loading } = useAuth();
  const { slug } = useTenant();

  // Show loading while auth is being checked
  if (loading) {
    return <div>Loading...</div>;
  }

  // Determine if we're on apex domain or subdomain
  const isApex = !slug;
  
  if (isApex) {
    // APEX DOMAIN LOGIC
    if (user) {
      // User is authenticated on apex
      if (user.role === 'instructor' && user.instructor?.subdomain) {
        // Redirect instructor to their subdomain
        const subdomain = user.instructor.subdomain;
        const currentHost = window.location.hostname.toLowerCase();
        const parts = currentHost.split('.');
        if (parts[0] === 'www') parts.shift();
        const apex = parts.slice(-2).join('.');
        const targetUrl = `https://${subdomain}.${apex}/coach/dashboard`;
        window.location.replace(targetUrl);
        return null;
      } else if (user.role === 'student') {
        // Student on apex - redirect to student dashboard
        return <Navigate to="/student/dashboard" replace />;
      } else if (user.role === 'admin') {
        // Admin on apex - redirect to admin dashboard
        return <Navigate to="/admin/overview" replace />;
      }
    }
    
    // Unauthenticated on apex - show landing page
    return <LandingPage />;
  } else {
    // SUBDOMAIN LOGIC
    if (user) {
      if (user.role === 'student') {
        // Student on subdomain - show student dashboard
        return <Navigate to="/student/dashboard" replace />;
      } else if (user.role === 'instructor') {
        // Check if this instructor owns this subdomain
        if (user.instructor?.subdomain === slug) {
          // This instructor owns this subdomain - redirect to coach dashboard
          return <Navigate to="/coach/dashboard" replace />;
        } else {
          // This instructor doesn't own this subdomain - redirect to their own subdomain
          const subdomain = user.instructor?.subdomain;
          if (subdomain) {
            const currentHost = window.location.hostname.toLowerCase();
            const parts = currentHost.split('.');
            if (parts[0] === 'www') parts.shift();
            const apex = parts.slice(-2).join('.');
            const targetUrl = `https://${subdomain}.${apex}/coach/dashboard`;
            window.location.replace(targetUrl);
            return null;
          } else {
            // No subdomain - redirect to apex
            const currentHost = window.location.hostname.toLowerCase();
            const parts = currentHost.split('.');
            if (parts[0] === 'www') parts.shift();
            const apex = parts.slice(-2).join('.');
            window.location.replace(`https://${apex}`);
            return null;
          }
        }
      } else if (user.role === 'admin') {
        // Admin on subdomain - redirect to admin dashboard
        return <Navigate to="/admin/overview" replace />;
      }
    }
    
    // Unauthenticated on subdomain - check for new website first, fallback to old invite page
    return <PublicWebsiteViewer />;
  }
};
