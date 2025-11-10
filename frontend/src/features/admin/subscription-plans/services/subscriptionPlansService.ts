import { SubscriptionPlan, CreatePlanData, UpdatePlanData } from '../types';

function safeParseJsonArray(value: any): string[] {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function getApiBaseUrl(): string {
  if (typeof window !== 'undefined' && /usecoachly\.com$/.test(window.location.hostname.toLowerCase())) return '';
  return import.meta.env.VITE_API_URL || 'http://localhost:8000';
}

export const subscriptionPlansService = {
  // Get all subscription plans (Admin)
  async getAllPlans(): Promise<SubscriptionPlan[]> {
    const response = await fetch(`${getApiBaseUrl()}/api/admin/subscription-plans`, {
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch subscription plans');
    }

    const raw = await response.json();
    // Normalize snake_case -> camelCase and coerce data types
    return raw.map((p: any) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      basePriceCents: Number(p.base_price_cents ?? 0),
      billingInterval: p.billing_interval,
      billingIntervalCount: Number(p.billing_interval_count ?? 1),
      isActive: Boolean(p.is_active),
      isVisible: p.is_visible !== false,
      promoEnabled: Boolean(p.promo_enabled),
      promoDiscountPercent: Number(p.promo_discount_percent ?? 0),
      promoDurationMonths: Number(p.promo_duration_months ?? 0),
      promoLabel: p.promo_label,
      promoDescription: p.promo_description,
      displayOrder: Number(p.display_order ?? 0),
      features: typeof p.features === 'string' ? (safeParseJsonArray(p.features)) : (Array.isArray(p.features) ? p.features : []),
      stripePriceId: p.stripe_price_id,
      stripeProductId: p.stripe_product_id,
      createdAt: p.created_at,
      updatedAt: p.updated_at,
    })) as SubscriptionPlan[];
  },

  // Get all active subscription plans (Instructor)
  async getActivePlans(): Promise<SubscriptionPlan[]> {
    const response = await fetch(`${getApiBaseUrl()}/api/subscription-plans/active`, {
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch active plans');
    }

    const raw = await response.json();
    return raw.map((p: any) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      basePriceCents: Number(p.base_price_cents ?? 0),
      billingInterval: p.billing_interval,
      billingIntervalCount: Number(p.billing_interval_count ?? 1),
      isActive: Boolean(p.is_active),
      isVisible: p.is_visible !== false,
      promoEnabled: Boolean(p.promo_enabled),
      promoDiscountPercent: Number(p.promo_discount_percent ?? 0),
      promoDurationMonths: Number(p.promo_duration_months ?? 0),
      promoLabel: p.promo_label,
      promoDescription: p.promo_description,
      displayOrder: Number(p.display_order ?? 0),
      features: typeof p.features === 'string' ? (safeParseJsonArray(p.features)) : (Array.isArray(p.features) ? p.features : []),
      stripePriceId: p.stripe_price_id,
      stripeProductId: p.stripe_product_id,
      createdAt: p.created_at,
      updatedAt: p.updated_at,
    })) as SubscriptionPlan[];
  },

  // Create new subscription plan (Admin)
  async createPlan(planData: CreatePlanData): Promise<SubscriptionPlan> {
    const response = await fetch(`${getApiBaseUrl()}/api/admin/subscription-plans`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        name: planData.name,
        description: planData.description,
        base_price_cents: planData.basePriceCents,
        billing_interval: planData.billingInterval,
        billing_interval_count: planData.billingIntervalCount ?? 1,
        is_visible: planData.isVisible ?? true,
        promo_enabled: planData.promoEnabled ?? false,
        promo_discount_percent: planData.promoDiscountPercent ?? 0,
        promo_duration_months: planData.promoDurationMonths ?? 0,
        promo_label: planData.promoLabel,
        promo_description: planData.promoDescription,
        display_order: planData.displayOrder ?? 0,
        features: planData.features ?? [],
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create subscription plan');
    }

    const p = await response.json();
    return {
      id: p.id,
      name: p.name,
      description: p.description,
      basePriceCents: Number(p.base_price_cents ?? 0),
      billingInterval: p.billing_interval,
      billingIntervalCount: Number(p.billing_interval_count ?? 1),
      isActive: Boolean(p.is_active),
      promoEnabled: Boolean(p.promo_enabled),
      promoDiscountPercent: Number(p.promo_discount_percent ?? 0),
      promoDurationMonths: Number(p.promo_duration_months ?? 0),
      promoLabel: p.promo_label,
      promoDescription: p.promo_description,
      displayOrder: Number(p.display_order ?? 0),
      features: Array.isArray(p.features) ? p.features : [],
      stripePriceId: p.stripe_price_id,
      stripeProductId: p.stripe_product_id,
      createdAt: p.created_at,
      updatedAt: p.updated_at,
    } as SubscriptionPlan;
  },

  // Update subscription plan (Admin)
  async updatePlan(id: string, planData: UpdatePlanData): Promise<SubscriptionPlan> {
    const response = await fetch(`${getApiBaseUrl()}/api/admin/subscription-plans/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(planData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update subscription plan');
    }

    return response.json();
  },

  // Deactivate subscription plan (Admin)
  async toggleVisibility(id: string, isVisible: boolean): Promise<SubscriptionPlan> {
    const response = await fetch(`${getApiBaseUrl()}/api/admin/subscription-plans/${id}/toggle-visibility`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ isVisible }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to toggle visibility');
    }

    const p = await response.json();
    return {
      id: p.id,
      name: p.name,
      description: p.description,
      basePriceCents: Number(p.base_price_cents ?? 0),
      billingInterval: p.billing_interval,
      billingIntervalCount: Number(p.billing_interval_count ?? 1),
      isActive: Boolean(p.is_active),
      isVisible: p.is_visible !== false,
      promoEnabled: Boolean(p.promo_enabled),
      promoDiscountPercent: Number(p.promo_discount_percent ?? 0),
      promoDurationMonths: Number(p.promo_duration_months ?? 0),
      promoLabel: p.promo_label,
      promoDescription: p.promo_description,
      displayOrder: Number(p.display_order ?? 0),
      features: Array.isArray(p.features) ? p.features : [],
      stripePriceId: p.stripe_price_id,
      stripeProductId: p.stripe_product_id,
      createdAt: p.created_at,
      updatedAt: p.updated_at,
    } as SubscriptionPlan;
  },

  // Toggle promo for a plan (Admin)
  async togglePromo(id: string, promoEnabled: boolean): Promise<SubscriptionPlan> {
    const response = await fetch(`${getApiBaseUrl()}/api/admin/subscription-plans/${id}/toggle-promo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ promoEnabled }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to toggle promo');
    }

    return response.json();
  },
};
