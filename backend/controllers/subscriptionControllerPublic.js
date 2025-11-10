import Stripe from 'stripe';
import { getSupabaseClient } from '../repositories/supabaseClient.js';
import { subscriptionPlansRepo } from '../repositories/subscriptionPlansRepo.js';
import jwt from 'jsonwebtoken';

const generateToken = (userId, role) => {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Initialize Stripe instance
let stripe = null;
const getStripe = () => {
  if (!stripe && process.env.STRIPE_SECRET_KEY) {
    try {
      stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: '2024-06-20',
      });
    } catch (error) {
    }
  }
  return stripe;
};

// Create public checkout session (for signup flow)
export const createPublicCheckout = async (req, res) => {
  try {
    const stripeInstance = getStripe();
    if (!stripeInstance) {
      return res.status(500).json({ error: 'Payment system not configured' });
    }

    const { planId, email, signupData } = req.body;

    if (!planId || !email || !signupData) {
      return res.status(400).json({ error: 'Plan ID, email, and signup data are required' });
    }

    // Get the selected plan
    const plan = await subscriptionPlansRepo.getById(planId);
    if (!plan || !plan.is_active) {
      return res.status(404).json({ error: 'Subscription plan not found or inactive' });
    }

    // Parse signup data
    const parsedSignupData = JSON.parse(signupData);

    // Use environment variable for frontend URL or construct from request
    let frontendBaseUrl = process.env.FRONTEND_BASE_URL || 'https://usecoachly.com';
    
    // If FRONTEND_BASE_URL not set, try to derive from request
    if (!process.env.FRONTEND_BASE_URL) {
      const host = String(req.headers['x-forwarded-host'] || req.headers.host || '').toLowerCase();
      const proto = String(req.headers['x-forwarded-proto'] || 'http');
      const hostname = host.split(':')[0];
      const labels = hostname.split('.');
      if (labels[0] === 'www') labels.shift();
      const apex = labels.slice(-2).join('.');
      frontendBaseUrl = `${proto}://${apex}`;
    }
    
    // Force usecoachly.com for redirects
    const apex = 'usecoachly.com';
    const instructorUrl = `https://${parsedSignupData.subdomain}.${apex}`;

    // Create checkout session with signup data in metadata
    const checkoutData = {
      mode: 'payment', // One-time payment
      payment_method_types: ['card'],
      customer_email: email,
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: plan.name,
            description: plan.description,
          },
          unit_amount: plan.base_price_cents,
        },
        quantity: 1,
      }],
      metadata: {
        plan_id: plan.id,
        original_price_cents: plan.base_price_cents,
        signup_data: JSON.stringify({
          firstName: parsedSignupData.firstName,
          lastName: parsedSignupData.lastName,
          email: parsedSignupData.email,
          password: parsedSignupData.password, // Will be hashed in webhook
          businessName: parsedSignupData.businessName,
          subdomain: parsedSignupData.subdomain,
          planId: parsedSignupData.planId
        }),
        type: 'platform_signup_payment',
        subdomain: parsedSignupData.subdomain // Store subdomain separately for easier access
      },
      success_url: `https://${apex}/signup/complete?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `https://${apex}/signup?payment=cancelled`,
    };

    const session = await stripeInstance.checkout.sessions.create(checkoutData);
    return res.json({ url: session.url });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to create checkout session' });
  }
};

