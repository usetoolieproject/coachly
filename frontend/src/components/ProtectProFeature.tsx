import React from 'react';
import { ProFeatureBlocker } from '../components/shared';
import { useSubscriptionPlan } from '../hooks/useSubscriptionPlan';

interface ProtectProFeatureProps {
  featureName: string;
  featureKey: 'screenRecording' | 'videoHosting' | 'meet' | 'customDomain';
  description?: string;
  children: React.ReactNode;
}

/**
 * ProtectProFeature Component
 * Wraps Pro-only features and blocks Basic users from accessing them
 */
export const ProtectProFeature: React.FC<ProtectProFeatureProps> = ({
  featureName,
  featureKey,
  description,
  children
}) => {
  const { hasFeature, isLoading, error } = useSubscriptionPlan();
  const [timedOut, setTimedOut] = React.useState(false);

  // Set a timeout to fail open after 3 seconds
  React.useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        console.warn('Subscription check timed out, allowing access');
        setTimedOut(true);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  // If timed out, allow access
  if (timedOut) {
    return <>{children}</>;
  }

  // Show loading state while checking subscription (but only briefly)
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If there's an error loading subscription, allow access (fail open)
  // This prevents the site from breaking if the subscription API is down
  if (error) {
    console.warn('Failed to load subscription status, allowing access:', error);
    return <>{children}</>;
  }

  // Block access if user doesn't have the feature
  if (!hasFeature(featureKey)) {
    return <ProFeatureBlocker featureName={featureName} description={description} />;
  }

  // Allow access if user has Pro
  return <>{children}</>;
};
