import Stripe from 'stripe';
import { getSupabaseClient } from '../repositories/supabaseClient.js';
import { subscriptionPlansRepo } from '../repositories/subscriptionPlansRepo.js';

// Initialize Stripe instance
let stripe = null;

// Function to get or initialize Stripe
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

// Platform subscription configuration
const SUBSCRIPTION_CONFIG = {
  PRODUCT_NAME: 'Trainr Platform Subscription',
  MONTHLY_PRICE_CENTS: 2900, // $29.00
  CURRENCY: 'usd'
};

let platformProductId = null;
let platformPriceId = null;

// Ensure platform product and price exist in Stripe
const ensurePlatformProduct = async () => {
  const stripeInstance = getStripe();
  if (!stripeInstance) {
    throw new Error('Stripe not configured');
  }

  try {
    // Check if product already exists
    const products = await stripeInstance.products.list({ 
      active: true,
      limit: 100 
    });
    
    const existingProduct = products.data.find(p => p.name === SUBSCRIPTION_CONFIG.PRODUCT_NAME);
    
    if (existingProduct) {
      platformProductId = existingProduct.id;
      
      // Check if price exists for this product
      const prices = await stripeInstance.prices.list({ 
        product: platformProductId,
        active: true 
      });
      
      const existingPrice = prices.data.find(p => 
        p.unit_amount === SUBSCRIPTION_CONFIG.MONTHLY_PRICE_CENTS &&
        p.currency === SUBSCRIPTION_CONFIG.CURRENCY &&
        p.recurring?.interval === 'month'
      );
      
      if (existingPrice) {
        platformPriceId = existingPrice.id;
        return;
      }
    }
    
    // Create product if it doesn't exist
    if (!platformProductId) {
      const product = await stripeInstance.products.create({
        name: SUBSCRIPTION_CONFIG.PRODUCT_NAME,
        description: 'Monthly subscription for Trainr platform premium access',
        active: true
      });
      platformProductId = product.id;
    }
    
    // Create price if it doesn't exist
    if (!platformPriceId) {
      const price = await stripeInstance.prices.create({
        product: platformProductId,
        unit_amount: SUBSCRIPTION_CONFIG.MONTHLY_PRICE_CENTS,
        currency: SUBSCRIPTION_CONFIG.CURRENCY,
        recurring: {
          interval: 'month'
        },
        active: true
      });
      platformPriceId = price.id;
    }
    
  } catch (error) {
    throw error;
  }
};

// Backfill locked prices for current instructor subscriptions
export const backfillLockedPrices = async (req, res) => {
  try {
    const stripeInstance = getStripe();
    if (!stripeInstance) {
      return res.status(500).json({ error: 'Payment system not configured. Please contact support.' });
    }

    const instructor = req.user.instructors?.[0];
    if (!instructor) {
      return res.status(403).json({ error: 'Instructor access required' });
    }

    const supabase = getSupabaseClient();

    const { data: subs, error } = await supabase
      .from('subscriptions')
      .select('id, stripe_subscription_id, original_price_cents')
      .eq('instructor_id', instructor.id);

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch subscriptions' });
    }

    let updated = 0;
    for (const row of subs || []) {
      try {
        const s = await stripeInstance.subscriptions.retrieve(row.stripe_subscription_id);
        const item = Array.isArray(s.items?.data) ? s.items.data[0] : null;
        const unit = item?.price?.unit_amount ?? null;
        const hasDiscount = !!s.discount;
        if (unit != null && (row.original_price_cents === null || row.original_price_cents === 0)) {
          await supabase
            .from('subscriptions')
            .update({ original_price_cents: unit, has_promo: hasDiscount, updated_at: new Date().toISOString() })
            .eq('id', row.id);
          updated += 1;
        }
      } catch (e) {
        // continue
      }
    }

    return res.json({ updated });
  } catch (e) {
    return res.status(500).json({ error: 'Backfill failed' });
  }
};

// Create subscription checkout session
export const createSubscriptionCheckout = async (req, res) => {
  try {
    const instructor = req.user.instructors?.[0];
    if (!instructor) {
      return res.status(403).json({ error: 'Instructor access required' });
    }

    const { planId, promoCode } = req.body;
    
    // Check if there's a 100% discount promo code
    if (promoCode) {
      const supabase = getSupabaseClient();
      const { data: promo } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('code', String(promoCode).trim().toUpperCase())
        .eq('is_active', true)
        .single();
      
      if (promo && promo.type === 'discount' && promo.discount_percent === 100) {
        // Create free subscription directly without Stripe
        const now = new Date();
        const end = new Date(now);
        end.setMonth(end.getMonth() + 1); // 1 month free
        
        const { error: subError } = await supabase
          .from('subscriptions')
          .insert({
            instructor_id: instructor.id,
            stripe_subscription_id: `FREE-PROMO-${promo.id}-${Date.now()}`,
            stripe_customer_id: null,
            status: 'active',
            current_period_start: now.toISOString(),
            current_period_end: end.toISOString(),
            cancel_at_period_end: false,
            plan_id: planId || null,
            original_price_cents: 0,
            has_promo: true,
            promo_end_date: end.toISOString(),
          });
        
        if (subError) {
          console.error('Error creating free subscription:', subError);
          return res.status(500).json({ error: 'Failed to activate free subscription' });
        }
        
        // Return success with no checkout URL (skip payment)
        return res.json({ 
          success: true,
          skipPayment: true,
          message: '100% discount applied - subscription activated'
        });
      } else if (promo && promo.type === 'duration') {
        // Handle free duration promos
        const months = Number(promo.free_months || 1);
        const now = new Date();
        const end = new Date(now);
        end.setMonth(end.getMonth() + months);
        
        const { error: subError } = await supabase
          .from('subscriptions')
          .insert({
            instructor_id: instructor.id,
            stripe_subscription_id: `FREE-DURATION-${promo.id}-${Date.now()}`,
            stripe_customer_id: null,
            status: 'active',
            current_period_start: now.toISOString(),
            current_period_end: end.toISOString(),
            cancel_at_period_end: false,
            plan_id: planId || null,
            original_price_cents: 0,
            has_promo: true,
            promo_end_date: end.toISOString(),
          });
        
        if (subError) {
          console.error('Error creating free duration subscription:', subError);
          return res.status(500).json({ error: 'Failed to activate free subscription' });
        }
        
        return res.json({ 
          success: true,
          skipPayment: true,
          message: `${months} month${months > 1 ? 's' : ''} free access activated`
        });
      }
    }
    
    const stripeInstance = getStripe();
    if (!stripeInstance) {
      return res.status(500).json({ 
        error: 'Payment system not configured. Please contact support.' 
      });
    }

    const { planId: planIdFromBody } = req.body;
    const planId = planIdFromBody;
    
    if (!planId) {
      return res.status(400).json({ error: 'Plan ID is required' });
    }

    // Get the selected plan
    const plan = await subscriptionPlansRepo.getById(planId);
    
    if (!plan || !plan.is_active) {
      return res.status(404).json({ error: 'Subscription plan not found or inactive' });
    }

    // Check for existing active subscriptions to prevent duplicates
    const supabase = getSupabaseClient();
    const { data: existingSubscriptions, error: existingError } = await supabase
      .from('subscriptions')
      .select('id, stripe_subscription_id, cancel_at_period_end, status')
      .eq('instructor_id', instructor.id)
      .eq('status', 'active')
      .order('cancel_at_period_end', { ascending: true })
      .order('created_at', { ascending: false });

    
    if (existingSubscriptions && existingSubscriptions.length > 0) {
      const hasNonCancelled = existingSubscriptions.some(sub => !sub.cancel_at_period_end);
      if (hasNonCancelled) {
        return res.status(400).json({ 
          error: 'You already have an active subscription. Please cancel your current subscription before creating a new one.' 
        });
      }
    }

    // Dynamically determine the frontend base URL based on the request
    const getFrontendBaseUrl = (req) => {
      if (req) {
        const host = String(req.headers['x-forwarded-host'] || req.headers.host || '').toLowerCase();
        const proto = String(req.headers['x-forwarded-proto'] || 'http');
        const hostname = host.split(':')[0];
        const labels = hostname.split('.');
        if (labels[0] === 'www') labels.shift();
        const apex = labels.slice(-2).join('.');
        const isUsecoachly = apex === 'usecoachly.com';
        
        if (isUsecoachly) {
          return `${proto}://${hostname}`;
        } else {
          // For subdomains, use the same protocol and host
          return `${proto}://${hostname}`;
        }
      }
      
      // Fallback to environment variable or localhost
      return process.env.FRONTEND_BASE_URL || 'http://localhost:3000';
    };

    const frontendBaseUrl = getFrontendBaseUrl(req);
    const userEmail = req.user.email;

    // Get instructor subdomain for redirect
    const instructorSubdomain = instructor.subdomain || '';
    const apex = frontendBaseUrl.includes('usecoachly.com') ? 'usecoachly.com' : 'usecoachly.com';
    const instructorUrl = instructorSubdomain ? `https://${instructorSubdomain}.${apex}` : frontendBaseUrl;

    // Determine if this is a one-time payment plan
    const isOneTimePayment = plan.billing_interval === 'one_time';

    // Prepare checkout session data
    const checkoutData = {
      mode: isOneTimePayment ? 'payment' : 'subscription',
      payment_method_types: ['card'],
      customer_email: userEmail,
      metadata: {
        instructor_id: instructor.id,
        type: isOneTimePayment ? 'platform_one_time' : 'platform_subscription',
        plan_id: plan.id,
        original_price_cents: plan.base_price_cents,
        has_promo: plan.promo_enabled
      },
      success_url: `${instructorUrl}/coach/dashboard?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendBaseUrl}/signup?payment=cancelled`,
    };

    // Add appropriate line items based on payment type
    if (isOneTimePayment) {
      // One-time payment - use price_data instead of Stripe price ID
      checkoutData.line_items = [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: plan.name,
              description: plan.description,
            },
            unit_amount: plan.base_price_cents,
          },
          quantity: 1,
        },
      ];
    } else {
      // Recurring subscription - use Stripe price ID
      checkoutData.line_items = [
        {
          price: plan.stripe_price_id,
          quantity: 1,
        },
      ];
      checkoutData.subscription_data = {
        metadata: {
          instructor_id: instructor.id,
          type: 'platform_subscription',
          plan_id: plan.id,
          original_price_cents: plan.base_price_cents.toString(),
          has_promo: plan.promo_enabled.toString()
        }
      };
    }


    // Handle plan built-in promotional pricing
    if (plan.promo_enabled && plan.promo_discount_percent > 0) {
      try {
        // Create Stripe coupon for the promo
        const coupon = await stripeInstance.coupons.create({
          percent_off: plan.promo_discount_percent,
          duration: 'repeating',
          duration_in_months: plan.promo_duration_months,
          name: plan.promo_label || `${plan.promo_discount_percent}% off`,
          metadata: {
            plan_id: plan.id,
            promo_duration_months: plan.promo_duration_months.toString()
          }
        });

        // Apply coupon to checkout session
        checkoutData.discounts = [{
          coupon: coupon.id
        }];

        // Update metadata to include promo details
        checkoutData.metadata.promo_coupon_id = coupon.id;
        checkoutData.metadata.promo_end_date = new Date(
          Date.now() + (plan.promo_duration_months * 30 * 24 * 60 * 60 * 1000)
        ).toISOString();

        checkoutData.subscription_data.metadata.promo_coupon_id = coupon.id;
        checkoutData.subscription_data.metadata.promo_end_date = checkoutData.metadata.promo_end_date;

      } catch (couponError) {
        // Continue without promo if coupon creation fails
      }
    }

    // Handle instructor promo code (discount type) if redeemed previously
    try {
      const supabase = getSupabaseClient();
      const { data: redemption } = await supabase
        .from('promo_redemptions')
        .select('promo_codes:promo_code_id(*)')
        .eq('instructor_id', instructor.id)
        .order('redeemed_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      const pc = redemption?.promo_codes || null;
      const now = new Date();
      const notExpired = pc && (!pc.expires_at || new Date(pc.expires_at) >= now);
      const matchesPlan = pc && (pc.plan_id == null || pc.plan_id === plan.id);
      if (pc && pc.type === 'discount' && notExpired && matchesPlan) {
        const coupon = await stripeInstance.coupons.create({
          percent_off: Number(pc.discount_percent || 0),
          duration: 'once', // only first invoice
          name: `${pc.discount_percent}% off via promo`,
          metadata: { promo_code_id: pc.id, instructor_id: instructor.id }
        });
        checkoutData.discounts = checkoutData.discounts || [];
        checkoutData.discounts.push({ coupon: coupon.id });
      }
    } catch (e) {
      // ignore promo errors; proceed without discount
    }

    

    // Create subscription checkout session
    const session = await stripeInstance.checkout.sessions.create(checkoutData);

    return res.json({ url: session.url });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to create subscription checkout session' });
  }
};

// Get subscription status for instructor
export const getSubscriptionStatus = async (req, res) => {
  try {
    
    const instructor = req.user.instructors?.[0];
    if (!instructor) {
      return res.status(403).json({ error: 'Instructor access required' });
    }
    
    
    const supabase = getSupabaseClient();
    
    
    const { data: subscriptions, error } = await supabase
      .from('subscriptions')
      .select(`
        *,
        subscription_plans (
          id,
          name,
          description,
          base_price_cents,
          billing_interval,
          billing_interval_count,
          promo_enabled,
          promo_discount_percent,
          promo_duration_months,
          promo_label,
          promo_description,
          features
        )
      `)
      .eq('instructor_id', instructor.id)
      .eq('status', 'active')
      .order('cancel_at_period_end', { ascending: true }) // Non-cancelled first
      .order('created_at', { ascending: false }); // Then by creation date

    
    let subscription = subscriptions?.[0] || null;

    // If multiple active rows exist, prioritize non-cancelled subscriptions
    if (Array.isArray(subscriptions) && subscriptions.length > 1) {
      
      const pickBestSubscription = (rows) => {
        // First, try to find a non-cancelled subscription
        const nonCancelled = rows.filter(row => !row.cancel_at_period_end);
        if (nonCancelled.length > 0) {
          // Among non-cancelled, pick the most recent
          return nonCancelled.reduce((latest, row) => {
            const start = row?.current_period_start || row?.created_at || '1970-01-01T00:00:00Z';
            const latestStart = latest?.current_period_start || latest?.created_at || '1970-01-01T00:00:00Z';
            return new Date(start) > new Date(latestStart) ? row : latest;
          }, nonCancelled[0]);
        }
        
        // If all are cancelled, pick the most recent one
        return rows.reduce((latest, row) => {
          const start = row?.current_period_start || row?.created_at || '1970-01-01T00:00:00Z';
          const latestStart = latest?.current_period_start || latest?.created_at || '1970-01-01T00:00:00Z';
          return new Date(start) > new Date(latestStart) ? row : latest;
        }, rows[0]);
      };
      subscription = pickBestSubscription(subscriptions);
    }

    // If this is a FREE promo subscription, synthesize a $0 plan for display
    if (subscription && String(subscription.stripe_subscription_id || '').startsWith('FREE-')) {
      subscription = {
        ...subscription,
        original_price_cents: 0,
        subscription_plans: subscription.subscription_plans || {
          id: subscription.plan_id || null,
          name: 'Promo Access',
          description: 'Free access via promo code',
          base_price_cents: 0,
          billing_interval: 'month',
          billing_interval_count: 1,
          promo_enabled: true,
          promo_discount_percent: 100,
          promo_duration_months: null,
          promo_label: 'Free access',
          promo_description: 'Promo code applied',
          features: []
        }
      };
    }

    // Fallback: if DB missing plan/locked price, pull from Stripe for display
    if (subscription && (!subscription.plan_id || !subscription.original_price_cents)) {
      try {
        const stripeInstance = getStripe();
        if (stripeInstance && !String(subscription.stripe_subscription_id || '').startsWith('FREE-')) {
          const s = await stripeInstance.subscriptions.retrieve(subscription.stripe_subscription_id);
          const item = Array.isArray(s.items?.data) ? s.items.data[0] : null;
          const unit = item?.price?.unit_amount ?? null;
          const interval = item?.price?.recurring?.interval || 'month';
          const intervalCount = item?.price?.recurring?.interval_count || 1;
          subscription = {
            ...subscription,
            // Only inject for response; do not mutate DB here
            original_price_cents: subscription.original_price_cents || unit || 0,
            subscription_plans: subscription.subscription_plans || {
              id: subscription.plan_id || null,
              name: undefined,
              description: undefined,
              base_price_cents: unit || 0,
              billing_interval: interval,
              billing_interval_count: intervalCount,
              promo_enabled: !!s.discount,
              promo_discount_percent: undefined,
              promo_duration_months: undefined,
              promo_label: undefined,
              promo_description: undefined,
              features: []
            }
          };
        }
      } catch (e) {}
    }

    const result = {
      hasActiveSubscription: !!subscription,
      subscription: subscription || null
    };
    
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};


// Create customer portal session for billing management
export const createSubscriptionPortal = async (req, res) => {
  try {
    const stripeInstance = getStripe();
    if (!stripeInstance) {
      return res.status(500).json({ 
        error: 'Payment system not configured. Please contact support.' 
      });
    }

    const instructor = req.user.instructors?.[0];
    if (!instructor) {
      return res.status(403).json({ error: 'Instructor access required' });
    }

    const supabase = getSupabaseClient();
    
    // Get most recent active subscription (avoid .single() errors if duplicates exist)
    const { data: subscriptions, error } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id, stripe_subscription_id')
      .eq('instructor_id', instructor.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1);
    
    const subscription = Array.isArray(subscriptions) ? subscriptions[0] : null;

    if (error || !subscription) {
      return res.status(404).json({ error: 'No active subscription found' });
    }

    // Check if this is a one-time payment subscription
    const isOneTimePayment = subscription.stripe_subscription_id && 
                              subscription.stripe_subscription_id.startsWith('ONE_TIME_');

    if (isOneTimePayment || !subscription.stripe_customer_id) {
      // One-time payments don't have a Stripe customer portal
      return res.status(400).json({ 
        error: 'Billing portal is not available for one-time payments. Please contact support for assistance.' 
      });
    }

    // Dynamically determine the frontend base URL based on the request
    const getFrontendBaseUrl = (req) => {
      if (req) {
        const host = String(req.headers['x-forwarded-host'] || req.headers.host || '').toLowerCase();
        const proto = String(req.headers['x-forwarded-proto'] || 'http');
        const hostname = host.split(':')[0];
        const labels = hostname.split('.');
        if (labels[0] === 'www') labels.shift();
        const apex = labels.slice(-2).join('.');
        const isUsecoachly = apex === 'usecoachly.com';
        
        if (isUsecoachly) {
          return `${proto}://${hostname}`;
        } else {
          // For subdomains, use the same protocol and host
          return `${proto}://${hostname}`;
        }
      }
      
      // Fallback to environment variable or localhost
      return process.env.FRONTEND_BASE_URL || 'http://localhost:3000';
    };

    const frontendBaseUrl = getFrontendBaseUrl(req);

    // Create portal session
    const portalSession = await stripeInstance.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: `${frontendBaseUrl}/coach/settings`,
    });

    return res.json({ url: portalSession.url });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to create billing portal session' });
  }
};

// Create upgrade checkout for Basic to Pro upgrade
export const createUpgradeCheckout = async (req, res) => {
  try {
    const stripeInstance = getStripe();
    if (!stripeInstance) {
      return res.status(500).json({ error: 'Payment system not configured' });
    }

    const instructor = req.user.instructors?.[0];
    if (!instructor) {
      return res.status(403).json({ error: 'Instructor access required' });
    }

    const supabase = getSupabaseClient();

    // Get current subscription
    const { data: subscriptions, error: subError } = await supabase
      .from('subscriptions')
      .select('id, stripe_subscription_id, plan_id, instructor_id')
      .eq('instructor_id', instructor.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1);

    const subscription = Array.isArray(subscriptions) ? subscriptions[0] : null;

    if (subError || !subscription) {
      return res.status(404).json({ error: 'No active subscription found' });
    }

    // Verify it's a one-time payment (Basic plan)
    const isOneTimePayment = subscription.stripe_subscription_id?.startsWith('ONE_TIME_');
    if (!isOneTimePayment) {
      return res.status(400).json({ error: 'Upgrades are only available for one-time payment plans' });
    }

    // Get plan details
    const currentPlan = await subscriptionPlansRepo.getById(subscription.plan_id);
    let proPlan;
    try {
      const result = await subscriptionPlansRepo.findByCondition({ name: 'Pro' });
      proPlan = result.data;
    } catch (error) {
      return res.status(404).json({ error: 'Pro plan not found. Please contact support.' });
    }

    if (!currentPlan) {
      return res.status(404).json({ error: 'Current plan not found' });
    }
    
    if (!proPlan) {
      return res.status(404).json({ error: 'Pro plan not found' });
    }

    // Check if already on Pro
    if (currentPlan.name === 'Pro') {
      return res.status(400).json({ error: 'You are already on the Pro plan' });
    }

    if (currentPlan.name !== 'Basic') {
      return res.status(400).json({ error: 'Can only upgrade from Basic to Pro' });
    }

    // Calculate upgrade price (difference)
    const upgradePrice = proPlan.base_price_cents - currentPlan.base_price_cents; // 8900 - 4900 = 4000 cents ($40)

    // Get frontend base URL
    const getFrontendBaseUrl = (req) => {
      if (req) {
        const host = String(req.headers['x-forwarded-host'] || req.headers.host || '').toLowerCase();
        const proto = String(req.headers['x-forwarded-proto'] || 'http');
        const hostname = host.split(':')[0];
        const labels = hostname.split('.');
        if (labels[0] === 'www') labels.shift();
        const apex = labels.slice(-2).join('.');
        const isUsecoachly = apex === 'usecoachly.com';
        
        if (isUsecoachly) {
          return `${proto}://${hostname}`;
        } else {
          return `${proto}://${hostname}`;
        }
      }
      return process.env.FRONTEND_BASE_URL || 'http://localhost:3000';
    };

    const frontendBaseUrl = getFrontendBaseUrl(req);
    const instructorSubdomain = instructor.subdomain || '';
    const apex = 'usecoachly.com';
    const instructorUrl = instructorSubdomain ? `https://${instructorSubdomain}.${apex}` : frontendBaseUrl;

    // Create checkout session for upgrade
    const checkoutData = {
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: req.user.email,
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { 
            name: 'Upgrade to Pro Plan', 
            description: 'Upgrade from Basic to Pro plan - Lifetime access' 
          },
          unit_amount: upgradePrice,
        },
        quantity: 1,
      }],
      metadata: {
        instructor_id: instructor.id,
        original_subscription_id: subscription.id,
        current_plan_id: currentPlan.id,
        new_plan_id: proPlan.id,
        type: 'plan_upgrade',
      },
      success_url: `${instructorUrl}/coach/settings?upgrade=success`,
      cancel_url: `${instructorUrl}/coach/settings?upgrade=cancelled`,
    };

    const session = await stripeInstance.checkout.sessions.create(checkoutData);

    return res.json({ url: session.url });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to create upgrade checkout session' });
  }
};
