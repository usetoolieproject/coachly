export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  basePriceCents: number;
  billingInterval: 'month' | 'year' | '6months' | '3months';
  billingIntervalCount: number;
  isActive: boolean;
  isVisible: boolean;
  promoEnabled: boolean;
  promoDiscountPercent: number;
  promoDurationMonths: number;
  promoLabel: string;
  promoDescription: string;
  displayOrder: number;
  features: string[];
  stripePriceId?: string;
  stripeProductId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionWithPlan {
  id: string;
  instructorId: string;
  stripeSubscriptionId: string;
  stripeCustomerId: string;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  planId?: string;
  originalPriceCents?: number;
  hasPromo?: boolean;
  promoEndDate?: string;
  subscriptionPlans?: SubscriptionPlan;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePlanData {
  name: string;
  description?: string;
  basePriceCents: number;
  billingInterval: 'month' | 'year' | '6months' | '3months';
  billingIntervalCount?: number;
  isVisible?: boolean;
  promoEnabled?: boolean;
  promoDiscountPercent?: number;
  promoDurationMonths?: number;
  promoLabel?: string;
  promoDescription?: string;
  displayOrder?: number;
  features?: string[];
}

export interface UpdatePlanData extends Partial<CreatePlanData> {
  isActive?: boolean;
}
