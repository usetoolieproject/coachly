import { apiFetch } from './api';

export interface SubscriptionPlan {
  id: string;
  name: string;
  description?: string;
  base_price_cents?: number;
  billing_interval?: string;
  billing_interval_count?: number;
  features?: string[];
}

export interface SubscriptionStatus {
  hasActiveSubscription: boolean;
  isProcessing?: boolean;
  subscription: {
    id: string;
    status: 'active' | 'canceled' | 'past_due' | 'unpaid';
    current_period_start: string;
    current_period_end: string;
    cancel_at_period_end: boolean;
    subscription_plans?: SubscriptionPlan;
  } | null;
}

export class SubscriptionService {
  static async createCheckoutSession(planId?: string): Promise<{ url: string }> {
    try {
      return await apiFetch('/subscription/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      });
    } catch (error) {
      throw error;
    }
  }

  static async getSubscriptionStatus(): Promise<SubscriptionStatus> {
    try {
      return await apiFetch('/subscription/status');
    } catch (error) {
      // Fail-open to avoid blocking instructor views
      return { hasActiveSubscription: false, subscription: null } as any;
    }
  }


  static async openBillingPortal(): Promise<{ url: string }> {
    try {
      return await apiFetch('/subscription/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      throw error;
    }
  }

  static async upgradeToProPlan(): Promise<{ url: string }> {
    try {
      return await apiFetch('/subscription/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      throw error;
    }
  }

  static formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  static getDaysUntilRenewal(currentPeriodEnd: string): number {
    const now = new Date();
    const endDate = new Date(currentPeriodEnd);
    const diffTime = endDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}
