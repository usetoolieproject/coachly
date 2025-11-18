# Stripe Integration Setup Guide

## Overview
Your Coachly platform has full Stripe integration with:
1. **Platform Subscriptions** - Instructors pay for Basic/Pro plans
2. **Stripe Connect** - Student payments go directly to instructors
3. **Promo Codes** - Support for discounts and free trials

## Architecture

### Payment Flow
```
Students → Stripe Checkout → Instructor's Stripe Account (via Connect)
                           ↓
                    Platform Fee (optional)
                           ↓
                   Instructor receives 100% (or minus platform fee)
```

### Platform Subscriptions
- **Basic Plan**: $29/month
- **Pro Plan**: $49/month
- Managed via `subscription_plans` table in Supabase
- Promo codes can provide 100% discount or free months

## What's Already Implemented

### Backend (✅ Complete)

1. **Stripe Initialization** (`backend/controllers/billingController.js`)
   - Auto-initializes on server start
   - Creates platform products/prices if missing

2. **Stripe Connect** (`backend/controllers/connectController.js`)
   - `POST /api/connect/onboard` - Start instructor onboarding
   - `POST /api/connect/relink` - Resume incomplete onboarding
   - `GET /api/connect/status` - Check connection status
   - `POST /api/connect/disconnect` - Disconnect account
   - `GET /api/connect/balance` - Get instructor balance
   - `GET /api/connect/revenue-timeseries` - Revenue analytics

3. **Platform Subscriptions** (`backend/controllers/subscriptionController.js`)
   - `POST /api/subscriptions/checkout` - Create subscription checkout
   - Handles promo codes (100% discount = skip payment)
   - Creates Stripe subscription or free subscription

4. **Student Payments** (`backend/controllers/billingController.js`)
   - `POST /api/billing/checkout` - Student pays for course
   - Uses Stripe Connect to transfer money to instructor
   - Platform fee configurable via `PLATFORM_FEE_CENTS` env var

5. **Webhooks** (`backend/controllers/billingController.js`)
   - `POST /api/webhooks/stripe` - Handles Stripe events
   - Updates subscription status on payment success/failure
   - Handles subscription cancellations

### Frontend (✅ Complete)

1. **Settings Page** (`frontend/src/features/instructor/settings/`)
   - PayoutsCard component shows Stripe Connect status
   - "Set up payouts" button for onboarding
   - Shows verification status and requirements
   - Disconnect option

2. **Dashboard** (`frontend/src/features/instructor/instructorDashboard/`)
   - Shows revenue from Stripe Connect API
   - Revenue chart from Stripe transactions
   - Balance display

3. **Pricing Page** (Landing page)
   - Shows Basic/Pro plans
   - Stripe Checkout for subscriptions

## Required Environment Variables

Add these to your backend `.env` file:

```env
# Stripe Keys (Get from https://dashboard.stripe.com/apikeys)
STRIPE_SECRET_KEY=sk_test_...  # or sk_live_... for production
STRIPE_PUBLISHABLE_KEY=pk_test_...  # or pk_live_... for production

# Webhook Secret (Get from https://dashboard.stripe.com/webhooks)
STRIPE_WEBHOOK_SECRET=whsec_...

# Optional Platform Fee (in cents, e.g., 100 = $1.00)
PLATFORM_FEE_CENTS=100

# Frontend/Backend URLs
FRONTEND_BASE_URL=https://usecoachly.com
BACKEND_BASE_URL=https://coachly-backend.onrender.com
```

## Setup Steps

### 1. Stripe Dashboard Setup

1. **Create Stripe Account**
   - Go to https://stripe.com
   - Sign up for a new account
   - Complete business verification

2. **Get API Keys**
   - Go to Developers → API Keys
   - Copy "Secret key" (starts with `sk_test_` or `sk_live_`)
   - Copy "Publishable key" (starts with `pk_test_` or `pk_live_`)
   - Add to backend `.env` file

3. **Enable Stripe Connect**
   - Go to Connect → Settings
   - Enable "Express accounts" (recommended for ease of use)
   - Set your platform name: "Coachly" or "Trainr"
   - Add branding (logo, colors)

4. **Configure Webhooks**
   - Go to Developers → Webhooks
   - Click "Add endpoint"
   - Endpoint URL: `https://coachly-backend.onrender.com/api/webhooks/stripe`
   - Select events to listen for:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
   - Copy the "Signing secret" (starts with `whsec_`)
   - Add to backend `.env` as `STRIPE_WEBHOOK_SECRET`

### 2. Platform Fee Configuration (Optional)

If you want to take a platform fee from student payments:

```env
# Example: Take $1.00 from each transaction
PLATFORM_FEE_CENTS=100

# Example: Take $5.00 from each transaction
PLATFORM_FEE_CENTS=500

# Example: No platform fee (instructors keep 100%)
PLATFORM_FEE_CENTS=0
```

**Note**: Stripe Connect also charges fees:
- 0.25% + $0.25 per transaction for Express accounts
- This is separate from your platform fee

### 3. Subscription Plans Configuration

Plans are stored in Supabase `subscription_plans` table:

```sql
-- Example plans
INSERT INTO subscription_plans (name, price, currency, billing_cycle, features, stripe_price_id, is_active)
VALUES 
  ('Basic', 29.00, 'USD', 'monthly', '{"maxCourses": 10, "videoHosting": false}', 'price_...', true),
  ('Pro', 49.00, 'USD', 'monthly', '{"maxCourses": "unlimited", "videoHosting": true}', 'price_...', true);
```

The system will auto-create Stripe products/prices on first use if `stripe_price_id` is null.

### 4. Testing the Integration

#### Test Stripe Connect (Instructor Onboarding)

1. Log in as an instructor at `usecoachly.com`
2. Go to Settings → Payouts section
3. Click "Set up payouts"
4. Complete the Stripe Connect onboarding
5. Use test information:
   - **Verification code**: 000000
   - **Phone**: +1 (800) 555-0100
   - **SSN**: 000-00-0000 (test mode only)

#### Test Platform Subscription

1. As an instructor, go to pricing page
2. Click "Get Started" on Basic or Pro plan
3. Use test card: `4242 4242 4242 4242`
4. Any future date and any CVC
5. Complete checkout
6. Verify subscription is active in dashboard

#### Test Student Payment

1. Create a student account on a subdomain (e.g., `einstein.usecoachly.com`)
2. Enroll in a paid course
3. Use test card: `4242 4242 4242 4242`
4. Complete payment
5. Verify money appears in instructor's Stripe Connect balance

### 5. Go Live Checklist

Before switching to live mode:

- [ ] Complete Stripe account verification
- [ ] Switch from test keys to live keys in `.env`
- [ ] Update webhook endpoint to use live mode
- [ ] Test with real (small amount) payment
- [ ] Verify payouts work to real bank account
- [ ] Set up payout schedule in Stripe Dashboard
- [ ] Configure tax settings if needed
- [ ] Add terms of service and privacy policy URLs

## How Instructors Connect Stripe

### For Instructors (User Flow)

1. Log in to `usecoachly.com`
2. Navigate to **Settings** (gear icon in sidebar)
3. Scroll to **Payouts** section
4. Click **"Set up payouts"** button
5. Complete Stripe Connect onboarding form:
   - Business information
   - Bank account details
   - Identity verification
6. Return to platform when complete
7. Status will show "Charges enabled" and "Payouts enabled"

### What Instructors Need

- Business tax ID (EIN) or SSN
- Bank account for payouts (routing + account number)
- Business address
- Personal identification (driver's license or passport)

## Troubleshooting

### "Payment system not configured" Error

**Cause**: `STRIPE_SECRET_KEY` is missing or invalid

**Solution**:
1. Check `.env` file has `STRIPE_SECRET_KEY=sk_...`
2. Restart backend server
3. Verify key is valid in Stripe Dashboard

### Instructor Can't Connect Stripe

**Cause**: Stripe Connect not enabled or misconfigured

**Solution**:
1. Go to Stripe Dashboard → Connect → Settings
2. Enable "Express accounts"
3. Verify platform name and branding are set
4. Check redirect URLs are whitelisted

### Webhook Events Not Working

**Cause**: Webhook secret is wrong or endpoint URL incorrect

**Solution**:
1. Verify `STRIPE_WEBHOOK_SECRET=whsec_...` in `.env`
2. Check endpoint URL matches: `https://your-backend.com/api/webhooks/stripe`
3. Test webhook in Stripe Dashboard → Webhooks → Send test webhook
4. Check backend logs for errors

### Platform Fee Not Being Collected

**Cause**: `PLATFORM_FEE_CENTS` not set or Connect transfer misconfigured

**Solution**:
1. Set `PLATFORM_FEE_CENTS=100` (or desired amount) in `.env`
2. Restart backend
3. Verify `application_fee_amount` is in checkout session creation code

## Support Resources

- **Stripe Documentation**: https://stripe.com/docs
- **Stripe Connect Guide**: https://stripe.com/docs/connect
- **Test Cards**: https://stripe.com/docs/testing
- **Webhook Events**: https://stripe.com/docs/webhooks

## Current Status

✅ Backend fully implemented
✅ Frontend UI complete
✅ Promo codes working
✅ Stripe Connect integration ready
⚠️ **Needs**: Stripe API keys in environment variables

## Next Steps

1. **Immediate**: Add Stripe API keys to backend `.env`
2. **Before Launch**: Complete Stripe account verification
3. **Testing**: Test full payment flow with test cards
4. **Production**: Switch to live keys when ready to accept real payments
