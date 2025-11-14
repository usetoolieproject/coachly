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
    const { planId, email, signupData, promoCode } = req.body;

    if (!planId || !email || !signupData) {
      return res.status(400).json({ error: 'Plan ID, email, and signup data are required' });
    }

    // Parse signup data
    const parsedSignupData = JSON.parse(signupData);
    const supabase = getSupabaseClient();

    // Check if there's a 100% discount or free duration promo code
    if (promoCode) {
      const { data: promo } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('code', String(promoCode).trim().toUpperCase())
        .eq('is_active', true)
        .single();
      
      if (promo && (promo.type === 'discount' && promo.discount_percent === 100 || promo.type === 'duration')) {
        // Create account immediately without payment
        const bcrypt = await import('bcryptjs');
        const passwordHash = await bcrypt.default.hash(parsedSignupData.password, 10);
        
        // Create user
        const { data: user, error: userError } = await supabase
          .from('users')
          .insert({
            email: parsedSignupData.email,
            password_hash: passwordHash,
            role: 'instructor',
            first_name: parsedSignupData.firstName,
            last_name: parsedSignupData.lastName
          })
          .select()
          .single();

        if (userError) {
          return res.status(400).json({ error: userError.message || 'Failed to create account' });
        }

        // Create instructor profile
        const { data: instructor, error: instructorError } = await supabase
          .from('instructors')
          .insert({
            user_id: user.id,
            business_name: parsedSignupData.businessName,
            subdomain: parsedSignupData.subdomain
          })
          .select()
          .single();

        if (instructorError) {
          return res.status(400).json({ error: instructorError.message || 'Failed to create instructor profile' });
        }

        // Create free subscription
        const months = promo.type === 'duration' ? Number(promo.free_months || 1) : 1;
        const now = new Date();
        const end = new Date(now);
        end.setMonth(end.getMonth() + months);
        
        await supabase
          .from('subscriptions')
          .insert({
            instructor_id: instructor.id,
            stripe_subscription_id: `FREE-${promo.type.toUpperCase()}-${promo.id}-${Date.now()}`,
            stripe_customer_id: null,
            status: 'active',
            current_period_start: now.toISOString(),
            current_period_end: end.toISOString(),
            cancel_at_period_end: false,
            plan_id: planId,
            original_price_cents: 0,
            has_promo: true,
            promo_end_date: end.toISOString(),
          });

        // Generate JWT token
        const token = generateToken(user.id, user.role);
        
        return res.json({ 
          success: true,
          skipPayment: true,
          token,
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
            firstName: user.first_name,
            lastName: user.last_name
          },
          instructor: {
            subdomain: parsedSignupData.subdomain
          },
          message: promo.type === 'duration' 
            ? `${months} month${months > 1 ? 's' : ''} free access activated`
            : '100% discount applied - account created'
        });
      }
    }

    const stripeInstance = getStripe();
    if (!stripeInstance) {
      return res.status(500).json({ error: 'Payment system not configured' });
    }

    // Get the selected plan
    const plan = await subscriptionPlansRepo.getById(planId);
    if (!plan || !plan.is_active) {
      return res.status(404).json({ error: 'Subscription plan not found or inactive' });
    }

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

