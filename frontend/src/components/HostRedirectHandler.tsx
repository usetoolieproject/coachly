import React from 'react';
import { useHostRedirect } from '../hooks/useHostRedirect';
import { PageLoadingSkeleton } from './shared/ui/PageLoadingSkeleton';

/**
 * Component that handles host canonicalization and redirects
 * Uses a one-time query pattern to prevent redirect loops
 */
export const HostRedirectHandler: React.FC = () => {
  const { shouldRedirect, targetUrl, isLoading } = useHostRedirect();

  // Show loading state while analyzing host
  if (isLoading) {
    return <PageLoadingSkeleton />;
  }

  // Execute redirect if needed
  if (shouldRedirect && targetUrl) {
    window.location.replace(targetUrl);
    return null;
  }

  // No redirect needed, render nothing
  return null;
};
