import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { PremiumService } from '../../../services/premiumService';
import { SubscriptionService } from '../../../services/subscriptionService';
import PremiumExpiredScreen from './PremiumExpiredScreen';

interface PremiumGuardProps {
  children: React.ReactNode;
  allowSettings?: boolean;
}

const PremiumGuard: React.FC<PremiumGuardProps> = ({ children, allowSettings = false }) => {
  const { user } = useAuth();
  const [hasActiveSubscription, setHasActiveSubscription] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  // If not an instructor, render children normally
  if (user?.role !== 'instructor' || !user?.instructor) {
    return <>{children}</>;
  }

  // Check for active subscription
  useEffect(() => {
    const checkSubscription = async () => {
      try {
        setLoading(true);
        const subscriptionStatus = await SubscriptionService.getSubscriptionStatus();
        setHasActiveSubscription(subscriptionStatus.hasActiveSubscription);
      } catch (error) {
        console.error('Error checking subscription status:', error);
        setHasActiveSubscription(false);
      } finally {
        setLoading(false);
      }
    };

    checkSubscription();
  }, []);

  // Show loading state while checking subscription
  if (loading) {
    return <>{children}</>; // Allow access while loading
  }

  // If has active subscription, allow access
  if (hasActiveSubscription) {
    return <>{children}</>;
  }

  // If no active subscription, check old premium_ends field (backwards compatibility)
  if (!user.instructor.premium_ends) {
    return <>{children}</>;
  }

  // Check if premium has expired
  const isExpired = PremiumService.isPremiumExpired(user.instructor.premium_ends);

  // If premium expired and not allowing settings, show expired screen
  if (isExpired && !allowSettings) {
    return <PremiumExpiredScreen />;
  }

  // Otherwise, render children normally
  return <>{children}</>;
};

export default PremiumGuard;
