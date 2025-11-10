import React from 'react';
import { useTenant } from '../contexts/TenantContext';
import { CleanInstructorLogin, CleanStudentLogin } from './auth';

/**
 * Smart login route handler that determines which login form to show
 * based on domain type
 */
export const LoginRouteHandler: React.FC = () => {
  const { slug } = useTenant();

  // Determine if we're on apex domain or subdomain
  const isApex = !slug;
  
  if (isApex) {
    // APEX DOMAIN - Show instructor login
    return <CleanInstructorLogin />;
  } else {
    // SUBDOMAIN - Show student login
    return <CleanStudentLogin />;
  }
};
