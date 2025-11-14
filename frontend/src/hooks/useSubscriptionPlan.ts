import { useQuery } from '@tanstack/react-query';
import { SubscriptionService } from '../services/subscriptionService';

export interface SubscriptionPlan {
  id: string;
  name: string;
  description?: string;
  base_price_cents?: number;
  billing_interval?: string;
  billing_interval_count?: number;
  features?: string[];
}

export interface SubscriptionWithPlan {
  id: string;
  status: 'active' | 'canceled' | 'past_due' | 'unpaid';
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  subscription_plans?: SubscriptionPlan;
}

export interface SubscriptionStatusWithPlan {
  hasActiveSubscription: boolean;
  subscription: SubscriptionWithPlan | null;
}

/**
 * Hook to fetch and manage user's subscription plan information
 * Uses TanStack Query for caching and automatic refetching
 * 
 * @returns Object containing plan name, loading state, and error state
 */
export const useSubscriptionPlan = () => {
  const { data, isLoading, error } = useQuery<SubscriptionStatusWithPlan>({
    queryKey: ['subscription-plan'],
    queryFn: async () => {
      const status = await SubscriptionService.getSubscriptionStatus();
      // The backend returns subscription with subscription_plans nested
      return status as SubscriptionStatusWithPlan;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    retry: 0, // Don't retry on failure
    retryDelay: 0,
  });

  const planName = data?.subscription?.subscription_plans?.name || null;
  const isPro = planName === 'Pro';
  const isBasic = planName === 'Basic';
  const hasActiveSubscription = data?.hasActiveSubscription || false;

  // Feature availability based on plan
  const hasFeature = (feature: 'screenRecording' | 'videoHosting' | 'meet' | 'customDomain') => {
    // If there's an error or no data, fail open (allow access)
    if (error || !data) return true;
    
    // If no active subscription, no Pro features
    if (!hasActiveSubscription) return false;
    
    // Pro plan has all features, Basic doesn't have these specific features
    return isPro;
  };

  return {
    planName,
    isPro,
    isBasic,
    hasActiveSubscription,
    subscription: data?.subscription || null,
    hasFeature,
    isLoading,
    error,
  };
};

