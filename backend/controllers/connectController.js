import Stripe from 'stripe';
import { getSupabaseClient } from '../repositories/supabaseClient.js';

// Local Stripe instance for Connect flows
let stripe = null;
const initStripeIfNeeded = () => {
  if (!stripe) {
    const keyPresent = Boolean(process.env.STRIPE_SECRET_KEY);
    if (!keyPresent) {
      throw new Error('Stripe is not configured');
    }
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' });
  }
  return stripe;
};

const getFrontendBaseUrl = (req) => {
  // Use the request to determine the correct subdomain URL
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
const getBackendBaseUrl = () => process.env.BACKEND_BASE_URL || 'http://localhost:5000';

// Prefer using the instructor already loaded by auth middleware on req.user
// and fall back to a direct lookup by user_id if needed.
const getInstructorFromRequest = async (supabase, reqUser) => {
  if (reqUser && Array.isArray(reqUser.instructors) && reqUser.instructors.length > 0) {
    const instructor = reqUser.instructors[0];
    return { data: {
      id: instructor.id,
      user_id: instructor.user_id,
      business_name: instructor.business_name,
      subdomain: instructor.subdomain,
      stripe_account_id: instructor.stripe_account_id,
    }};
  }

  const { data, error } = await supabase
    .from('instructors')
    .select('id, user_id, business_name, subdomain, stripe_account_id')
    .eq('user_id', reqUser?.id)
    .single();
  if (error) return { error };
  return { data };
};

export const getConnectStatus = async (req, res) => {
  try {
    
    
    const supabase = getSupabaseClient();
    const { data: instructor, error } = await getInstructorFromRequest(supabase, req.user);
    
    
    
    if (error || !instructor) {
      return res.status(404).json({ error: 'Instructor not found' });
    }

    const accountId = instructor.stripe_account_id || null;
    if (!accountId) {
      return res.json({
        stripeAccountId: null,
        chargesEnabled: false,
        payoutsEnabled: false,
        needsVerification: false,
        requirementsCurrentlyDue: [],
      });
    }

    const stripeClient = initStripeIfNeeded();
    const account = await stripeClient.accounts.retrieve(accountId);

    const requirements = account.requirements || {};
    const currentlyDue = requirements.currently_due || [];

    return res.json({
      stripeAccountId: account.id,
      chargesEnabled: !!account.charges_enabled,
      payoutsEnabled: !!account.payouts_enabled,
      needsVerification: currentlyDue.length > 0,
      requirementsCurrentlyDue: currentlyDue,
    });
  } catch (err) {
    
    const message = process.env.NODE_ENV === 'production' ? 'Failed to fetch connect status' : (err?.message || 'Failed to fetch connect status');
    return res.status(500).json({ error: message });
  }
};

export const startOnboarding = async (req, res) => {
  try {
    
    
    const supabase = getSupabaseClient();
    const stripeClient = initStripeIfNeeded();
    const { data: instructor, error } = await getInstructorFromRequest(supabase, req.user);
    
    
    
    if (error || !instructor) {
      return res.status(404).json({ error: 'Instructor not found' });
    }

    let accountId = instructor.stripe_account_id || null;
    
    
    if (!accountId) {
      
      try {
        const account = await stripeClient.accounts.create({
          type: 'express',
          email: req.user.email,
          capabilities: {
            card_payments: { requested: true },
            transfers: { requested: true },
          },
          business_profile: {
            product_description: 'Online courses and digital content',
          },
        });

        accountId = account.id;
        
        
        const { error: updateError } = await supabase
          .from('instructors')
          .update({ stripe_account_id: accountId })
          .eq('id', instructor.id);
        if (updateError) {
          
        } else {
          
        }
      } catch (createErr) {
        
        throw createErr;
      }
    }

    const refreshUrl = `${getFrontendBaseUrl(req)}/coach/settings?onboarding=refresh`;
    const returnUrl = `${getFrontendBaseUrl(req)}/coach/settings?onboarding=return`;

    
    const link = await stripeClient.accountLinks.create({
      account: accountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: 'account_onboarding',
    });
    
    return res.json({ url: link.url });
  } catch (err) {
    
    const message = process.env.NODE_ENV === 'production' ? 'Failed to start onboarding' : (err?.message || 'Failed to start onboarding');
    return res.status(500).json({ error: message });
  }
};

export const resumeOnboarding = async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    const stripeClient = initStripeIfNeeded();
    const { data: instructor, error } = await getInstructorFromRequest(supabase, req.user);
    if (error || !instructor) {
      return res.status(404).json({ error: 'Instructor not found' });
    }
    if (!instructor.stripe_account_id) {
      return res.status(400).json({ error: 'No Stripe account to resume onboarding' });
    }

    const refreshUrl = `${getFrontendBaseUrl(req)}/coach/settings?onboarding=refresh`;
    const returnUrl = `${getFrontendBaseUrl(req)}/coach/settings?onboarding=return`;

    const link = await stripeClient.accountLinks.create({
      account: instructor.stripe_account_id,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: 'account_onboarding',
    });
    return res.json({ url: link.url });
  } catch (err) {
    
    const message = process.env.NODE_ENV === 'production' ? 'Failed to resume onboarding' : (err?.message || 'Failed to resume onboarding');
    return res.status(500).json({ error: message });
  }
};

export const disconnectPayouts = async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    const stripeClient = initStripeIfNeeded();
    const { data: instructor, error } = await getInstructorFromRequest(supabase, req.user);
    if (error || !instructor) {
      return res.status(404).json({ error: 'Instructor not found' });
    }

    const accountId = instructor.stripe_account_id || null;

    // Best-effort: attempt to delete the connected account; ignore errors
    if (accountId) {
      try {
        await stripeClient.accounts.del(accountId);
      } catch (delErr) {
      }
    }

    // Clear local reference so onboarding can be re-run
    const { error: updateError } = await supabase
      .from('instructors')
      .update({ stripe_account_id: null })
      .eq('id', instructor.id);
    if (updateError) {
    
      return res.status(500).json({ error: 'Failed to disconnect payouts' });
    }

    return res.json({ success: true });
  } catch (err) {
    
    const message = process.env.NODE_ENV === 'production' ? 'Failed to disconnect payouts' : (err?.message || 'Failed to disconnect payouts');
    return res.status(500).json({ error: message });
  }
};


export const getConnectedBalance = async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    const stripeClient = initStripeIfNeeded();
    const { data: instructor, error } = await getInstructorFromRequest(supabase, req.user);
    
    if (error || !instructor) {
      return res.status(404).json({ error: 'Instructor not found' });
    }

    const accountId = instructor.stripe_account_id || null;
    if (!accountId) {
      return res.status(400).json({ error: 'Instructor is not connected to Stripe for payouts' });
    }

    const balance = await stripeClient.balance.retrieve({}, { stripeAccount: accountId });

    // Shape a concise response for the dashboard
    const normalize = (arr = []) => arr.map(b => ({
      amount: b.amount,
      currency: b.currency,
      sourceTypes: b.source_types || undefined,
    }));

    return res.json({
      stripeAccountId: accountId,
      available: normalize(balance.available),
      pending: normalize(balance.pending),
      instantAvailable: normalize(balance.instant_available || []),
      livemode: !!balance.livemode,
    });
  } catch (err) {
    
    const message = process.env.NODE_ENV === 'production' ? 'Failed to fetch balance' : (err?.message || 'Failed to fetch balance');
    return res.status(500).json({ error: message });
  }
};

export const getRevenueTimeseries = async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    const stripeClient = initStripeIfNeeded();
    const { data: instructor, error } = await getInstructorFromRequest(supabase, req.user);
    
    if (error || !instructor) {
      return res.status(404).json({ error: 'Instructor not found' });
    }

    const accountId = instructor.stripe_account_id || null;
    if (!accountId) {
      return res.status(400).json({ error: 'Instructor is not connected to Stripe for payouts' });
    }

    const days = Math.max(1, Math.min(180, parseInt(req.query.days || '30', 10)));
    const nowUnix = Math.floor(Date.now() / 1000);
    const sinceUnix = nowUnix - days * 24 * 60 * 60;

    // Collect charges for the connected account within range
    // We aggregate by charge.created date in UTC day buckets
    const charges = [];
    let startingAfter = undefined;
    for (let page = 0; page < 10; page++) { // safety page cap
      const resp = await stripeClient.charges.list({
        limit: 100,
        created: { gte: sinceUnix, lte: nowUnix },
        starting_after: startingAfter,
      }, { stripeAccount: accountId });
      charges.push(...resp.data);
      if (!resp.has_more) break;
      startingAfter = resp.data[resp.data.length - 1].id;
    }

    const byDay = new Map();
    for (const c of charges) {
      if (!c.paid || c.currency !== 'usd') continue;
      const created = new Date((c.created || nowUnix) * 1000);
      const isoDay = new Date(Date.UTC(created.getUTCFullYear(), created.getUTCMonth(), created.getUTCDate())).toISOString().slice(0, 10);
      const amount = (c.amount_captured ?? c.amount ?? 0) - (c.amount_refunded ?? 0);
      byDay.set(isoDay, (byDay.get(isoDay) || 0) + amount);
    }

    // Fill missing days with 0 and convert to dollars
    const series = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const iso = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())).toISOString().slice(0, 10);
      const cents = byDay.get(iso) || 0;
      series.push({ date: iso, value: Math.round((cents / 100) * 100) / 100 });
    }

    return res.json({ days, series });
  } catch (err) {
    
    const message = process.env.NODE_ENV === 'production' ? 'Failed to fetch revenue timeseries' : (err?.message || 'Failed to fetch revenue timeseries');
    return res.status(500).json({ error: message });
  }
};


