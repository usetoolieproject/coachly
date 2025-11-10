import Stripe from 'stripe';
import { subscriptionPlansRepo } from '../repositories/subscriptionPlansRepo.js';

let stripe = null;
const getStripe = () => {
  if (!stripe && process.env.STRIPE_SECRET_KEY) {
    try {
      stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: '2024-06-20',
      });
    } catch (error) {
      return null;
    }
  } else if (!process.env.STRIPE_SECRET_KEY) {
    return null;
  }
  return stripe;
};

const ensureStripeProductAndPrice = async (plan) => {
  const stripeInstance = getStripe();
  if (!stripeInstance) {
    throw new Error('Stripe not configured');
  }

  let stripeProductId = plan.stripe_product_id;
  let stripePriceId = plan.stripe_price_id;

  if (!stripeProductId) {
    const product = await stripeInstance.products.create({
      name: plan.name,
      description: plan.description,
      active: plan.is_active,
      metadata: { plan_id: plan.id },
    });
    stripeProductId = product.id;
  } else {
    await stripeInstance.products.update(stripeProductId, {
      name: plan.name,
      description: plan.description,
      active: plan.is_active,
    });
  }

  // Map custom intervals to Stripe-compatible interval + count
  let stripeInterval = 'month';
  let stripeIntervalCount = Number(plan.billing_interval_count || 1);
  switch (plan.billing_interval) {
    case 'month':
      stripeInterval = 'month';
      stripeIntervalCount = 1;
      break;
    case '3months':
      stripeInterval = 'month';
      stripeIntervalCount = 3;
      break;
    case '6months':
      stripeInterval = 'month';
      stripeIntervalCount = 6;
      break;
    case 'year':
      stripeInterval = 'year';
      stripeIntervalCount = 1;
      break;
    default:
      stripeInterval = 'month';
      stripeIntervalCount = stripeIntervalCount > 0 ? stripeIntervalCount : 1;
  }

  const price = await stripeInstance.prices.create({
    product: stripeProductId,
    unit_amount: plan.base_price_cents,
    currency: 'usd',
    recurring: {
      interval: stripeInterval,
      interval_count: stripeIntervalCount,
    },
    active: plan.is_active,
    metadata: {
      plan_id: plan.id,
      billing_interval: plan.billing_interval,
      billing_interval_count: stripeIntervalCount,
    },
  });
  stripePriceId = price.id;

  return { stripeProductId, stripePriceId };
};

const normalizePlanInput = (input) => {
  const normalized = {
    name: input.name,
    description: input.description,
    base_price_cents: input.base_price_cents ?? input.basePriceCents,
    billing_interval: input.billing_interval ?? input.billingInterval,
    billing_interval_count: input.billing_interval_count ?? input.billingIntervalCount ?? 1,
    is_active: input.is_active ?? input.isActive ?? true,
    promo_enabled: input.promo_enabled ?? input.promoEnabled ?? false,
    promo_discount_percent: input.promo_discount_percent ?? input.promoDiscountPercent ?? 0,
    promo_duration_months: input.promo_duration_months ?? input.promoDurationMonths ?? 0,
    promo_label: input.promo_label ?? input.promoLabel,
    promo_description: input.promo_description ?? input.promoDescription,
    display_order: input.display_order ?? input.displayOrder ?? 0,
    features: input.features ?? [],
  };

  // Ensure numeric fields are numbers (avoid NaN downstream)
  if (normalized.base_price_cents != null) {
    normalized.base_price_cents = Number(normalized.base_price_cents);
  }
  normalized.billing_interval_count = Number(normalized.billing_interval_count || 1);
  normalized.promo_discount_percent = Number(normalized.promo_discount_percent || 0);
  normalized.promo_duration_months = Number(normalized.promo_duration_months || 0);
  normalized.display_order = Number(normalized.display_order || 0);

  return normalized;
};

export const createSubscriptionPlan = async (req, res) => {
  try {
    const planData = normalizePlanInput(req.body);

    // Basic validation
    if (!planData.name || !planData.base_price_cents || !planData.billing_interval) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const newPlan = await subscriptionPlansRepo.createPlan({
      ...planData,
      is_visible: planData.is_visible ?? true
    });

    // If Stripe is configured, ensure product/price; else return created plan as-is
    const stripeInstance = getStripe();
    if (!stripeInstance) {
      return res.status(201).json(newPlan);
    }

    const { stripeProductId, stripePriceId } = await ensureStripeProductAndPrice(newPlan);

    const updatedPlan = await subscriptionPlansRepo.updatePlan(newPlan.id, {
      stripe_product_id: stripeProductId,
      stripe_price_id: stripePriceId,
    });
    return res.status(201).json(updatedPlan);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to create subscription plan' });
  }
};

export const getSubscriptionPlans = async (req, res) => {
  try {
    const plans = await subscriptionPlansRepo.getAllPlans();
    return res.json(plans);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch subscription plans' });
  }
};

export const getActivePlans = async (req, res) => {
  try {
    const plans = await subscriptionPlansRepo.getActivePlans();
    return res.json(plans);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch active subscription plans' });
  }
};

export const updateSubscriptionPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const planData = normalizePlanInput(req.body);

    const existingPlan = await subscriptionPlansRepo.getById(id);
    if (!existingPlan) {
      return res.status(404).json({ error: 'Subscription plan not found' });
    }

    const updatedPlan = await subscriptionPlansRepo.updatePlan(id, planData);

    const stripeInstance = getStripe();
    if (!stripeInstance) {
      return res.json(updatedPlan);
    }

    const { stripeProductId, stripePriceId } = await ensureStripeProductAndPrice({
      ...updatedPlan,
      stripe_product_id: existingPlan.stripe_product_id
    });

    const finalPlan = await subscriptionPlansRepo.updatePlan(id, {
      stripe_product_id: stripeProductId,
      stripe_price_id: stripePriceId,
    });

    return res.json(finalPlan);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update subscription plan' });
  }
};

export const deactivateSubscriptionPlan = async (req, res) => {
  try {
    const { id } = req.params;
    return res.status(410).json({ error: 'Delete operation removed. Use visibility toggle instead.' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to deactivate subscription plan' });
  }
};

export const togglePromo = async (req, res) => {
  try {
    const { id } = req.params;
    const promo_enabled = req.body.promo_enabled ?? req.body.promoEnabled;

    const updatedPlan = await subscriptionPlansRepo.togglePromo(id, promo_enabled);
    return res.json(updatedPlan);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to toggle promo status' });
  }
};

export const toggleVisibility = async (req, res) => {
  try {
    const { id } = req.params;
    const is_visible = req.body.is_visible ?? req.body.isVisible;
    const updatedPlan = await subscriptionPlansRepo.toggleVisibility(id, !!is_visible);
    return res.json(updatedPlan);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to toggle plan visibility' });
  }
};


