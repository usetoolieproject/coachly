# Complete Stripe Setup Guide - Step by Step

## Your Pricing Structure
- **Basic Plan**: $49/month
- **Pro Plan**: $89/month
- **Platform Fee**: $0 (instructors keep 100% of student payments)

---

## Part 1: Stripe Account Setup (15 minutes)

### Step 1: Create Stripe Account
1. Go to https://stripe.com
2. Click "Sign up" 
3. Enter your email and create a password
4. Complete the registration form:
   - Business name: "Coachly" or "Trainr" or your platform name
   - Business type: Select "Platform or marketplace"
   - Country: Your country
   - Website: usecoachly.com
5. Click "Create account"

### Step 2: Complete Business Profile
1. After logging in, click your profile icon (top right)
2. Go to "Settings" → "Business settings"
3. Complete all required fields:
   - **Business details**: Legal business name, address
   - **Public business information**: What customers see
   - **Support contact**: Support email and phone
   - **Branding**: Upload your logo (optional but recommended)

### Step 3: Enable Test Mode (Important!)
1. Look at the top left corner - there's a toggle that says "Test mode"
2. Make sure it's **ON** (should show "Viewing test data")
3. You'll use test mode until everything is working perfectly
4. Later you'll switch to "Live mode" when ready for real payments

---

## Part 2: Get Your API Keys (5 minutes)

### Step 1: Navigate to API Keys
1. In Stripe Dashboard, click "Developers" (top right)
2. Click "API keys" from the left menu
3. You'll see two keys displayed:
   - **Publishable key** (starts with `pk_test_...`)
   - **Secret key** (starts with `sk_test_...` - click "Reveal test key")

### Step 2: Copy Your Keys
1. Click the copy icon next to the Secret key
2. Save it somewhere safe (you'll need it in Part 4)
3. Copy the Publishable key too
4. Save both keys in a text file temporarily

**IMPORTANT**: 
- NEVER share your secret key publicly
- NEVER commit it to GitHub
- Only use it in environment variables

---

## Part 3: Enable Stripe Connect (10 minutes)

Stripe Connect allows instructors to receive payments directly to their own Stripe accounts.

### Step 1: Enable Connect
1. In Stripe Dashboard, click "Connect" in the left sidebar
2. If you don't see it, go to: https://dashboard.stripe.com/connect/accounts/overview
3. Click "Get started" if it's your first time

### Step 2: Choose Account Type
1. Select **"Express accounts"** (recommended)
   - Easier for instructors
   - Stripe handles onboarding
   - Faster setup
2. Click "Continue"

### Step 3: Configure Connect Settings
1. Go to "Connect" → "Settings"
2. Under "Account types", click "Express"
3. Configure the following:

   **Platform Profile:**
   - Platform name: `Coachly` (or your platform name)
   - Icon: Upload your logo
   - Brand color: Your brand color (e.g., #7C3AED for purple)
   - Support email: Your support email
   - Support URL: https://usecoachly.com/support (or your support page)

   **Redirect URIs** (IMPORTANT):
   - Add: `https://usecoachly.com/coach/settings`
   - Add: `https://www.usecoachly.com/coach/settings`
   - These are where instructors return after Stripe onboarding

   **OAuth Settings:**
   - Leave default settings
   - Stripe manages the OAuth flow automatically

4. Click "Save changes"

---

## Part 4: Create Subscription Products (15 minutes)

You need to create two subscription products in Stripe for your Basic and Pro plans.

### Create Basic Plan ($49/month)

1. Go to "Products" in the left sidebar
2. Click "+ Add product" (top right)
3. Fill in the product details:
   - **Name**: `Basic Plan`
   - **Description**: `Coachly Basic subscription - Up to 10 courses`
   - **Pricing**:
     - Click "Add pricing"
     - Model: Select "Standard pricing"
     - Price: `49.00`
     - Currency: `USD`
     - Billing period: `Monthly`
   - **Additional options**:
     - Keep "Recurring" selected (not one-time)
4. Click "Save product"
5. **IMPORTANT**: Copy the **Price ID** (starts with `price_...`)
   - It's shown under the price you just created
   - Save it - you'll need it in Part 6

### Create Pro Plan ($89/month)

1. Click "+ Add product" again
2. Fill in the product details:
   - **Name**: `Pro Plan`
   - **Description**: `Coachly Pro subscription - Unlimited courses + advanced features`
   - **Pricing**:
     - Click "Add pricing"
     - Model: Select "Standard pricing"
     - Price: `89.00`
     - Currency: `USD`
     - Billing period: `Monthly`
3. Click "Save product"
4. **IMPORTANT**: Copy the **Price ID** (starts with `price_...`)
   - Save it - you'll need it in Part 6

### Result
You should now have:
- ✅ Basic Plan product with Price ID
- ✅ Pro Plan product with Price ID

---

## Part 5: Set Up Webhooks (10 minutes)

Webhooks notify your backend when payments succeed, subscriptions renew, etc.

### Step 1: Add Webhook Endpoint
1. Go to "Developers" → "Webhooks"
2. Click "+ Add endpoint" (or "Add an endpoint")
3. Enter endpoint details:
   - **Endpoint URL**: `https://coachly-backend.onrender.com/api/webhooks/stripe`
     (Replace with your actual backend URL)
   - **Description**: `Coachly platform webhook`

### Step 2: Select Events to Listen For
Click "Select events" and add these:

**Checkout Events:**
- [x] `checkout.session.completed`
- [x] `checkout.session.expired`

**Subscription Events:**
- [x] `customer.subscription.created`
- [x] `customer.subscription.updated`
- [x] `customer.subscription.deleted`
- [x] `customer.subscription.trial_will_end`

**Invoice Events:**
- [x] `invoice.paid`
- [x] `invoice.payment_succeeded`
- [x] `invoice.payment_failed`
- [x] `invoice.payment_action_required`

**Account Events (for Connect):**
- [x] `account.updated`
- [x] `account.application.authorized`
- [x] `account.application.deauthorized`

### Step 3: Get Webhook Signing Secret
1. Click "Add endpoint" to create it
2. You'll see the endpoint details page
3. Under "Signing secret", click "Reveal"
4. Copy the secret (starts with `whsec_...`)
5. Save it - you'll need it in Part 6

---

## Part 6: Configure Backend Environment Variables (5 minutes)

### On Render (Your Backend)

1. Go to your Render dashboard: https://dashboard.render.com
2. Click on your backend service: `coachly-backend`
3. Go to "Environment" tab
4. Add/Update these environment variables:

```
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE
PLATFORM_FEE_CENTS=0
```

Replace:
- `sk_test_YOUR_SECRET_KEY_HERE` with your actual secret key from Part 2
- `whsec_YOUR_WEBHOOK_SECRET_HERE` with your webhook secret from Part 5

5. Click "Save Changes"
6. Your backend will automatically redeploy (takes ~2 minutes)

---

## Part 7: Update Database with Stripe Price IDs (5 minutes)

You need to add the Stripe Price IDs to your Supabase database.

### Step 1: Open Supabase
1. Go to https://supabase.com/dashboard
2. Select your Coachly project
3. Click "SQL Editor" in the left sidebar

### Step 2: Find Your Plan IDs
First, check what plans exist:

```sql
SELECT id, name, price, stripe_price_id FROM subscription_plans;
```

You should see your Basic and Pro plans with their UUIDs.

### Step 3: Update Plans with Stripe Price IDs

Replace `YOUR_BASIC_PRICE_ID` and `YOUR_PRO_PRICE_ID` with the actual Price IDs you copied in Part 4:

```sql
-- Update Basic Plan ($49/month)
UPDATE subscription_plans
SET 
  stripe_price_id = 'price_YOUR_BASIC_PRICE_ID_HERE',
  price = 49.00,
  base_price_cents = 4900
WHERE name = 'Basic' OR name ILIKE '%basic%';

-- Update Pro Plan ($89/month)
UPDATE subscription_plans
SET 
  stripe_price_id = 'price_YOUR_PRO_PRICE_ID_HERE',
  price = 89.00,
  base_price_cents = 8900
WHERE name = 'Pro' OR name ILIKE '%pro%';
```

### Step 4: Verify the Update

```sql
SELECT id, name, price, base_price_cents, stripe_price_id FROM subscription_plans;
```

You should see:
- Basic Plan: price=49.00, base_price_cents=4900, stripe_price_id starts with `price_`
- Pro Plan: price=89.00, base_price_cents=8900, stripe_price_id starts with `price_`

---

## Part 8: Testing Your Setup (20 minutes)

### Test 1: Instructor Stripe Connect

1. **Log in as an instructor** at https://usecoachly.com
2. Go to **Settings** (gear icon in sidebar)
3. Scroll to **Payouts** section
4. Click **"Set up payouts"**
5. You'll be redirected to Stripe Connect onboarding
6. Use **test data**:
   - Phone: `+1 (800) 555-0100`
   - Verification code: `000000`
   - Business name: `Test Instructor Business`
   - SSN: `000-00-0000` (only in test mode!)
   - Bank account: Any routing/account numbers
7. Complete the form and submit
8. You should be redirected back to settings
9. **Verify**: Payouts section shows "Charges enabled" and "Payouts enabled"

### Test 2: Platform Subscription (Instructor Signs Up)

1. **Open an incognito window**
2. Go to https://usecoachly.com
3. Click "Get Started" on the **Basic Plan** ($49)
4. Complete signup form if not logged in
5. You'll be redirected to Stripe Checkout
6. Use test card:
   - **Card**: `4242 4242 4242 4242`
   - **Expiry**: Any future date (e.g., `12/34`)
   - **CVC**: Any 3 digits (e.g., `123`)
   - **ZIP**: Any 5 digits (e.g., `12345`)
7. Click "Subscribe"
8. You should be redirected to instructor dashboard
9. **Verify in Stripe Dashboard**:
   - Go to "Payments" → You'll see $49.00 payment
   - Go to "Customers" → New customer created
   - Go to "Subscriptions" → Active subscription

### Test 3: Student Payment to Instructor

This will be tested once you have course payment flow. For now, the infrastructure is ready.

### Test 4: Webhook Delivery

1. Go to Stripe Dashboard → "Developers" → "Webhooks"
2. Click on your webhook endpoint
3. Scroll down to "Attempted events"
4. You should see events from your test subscription:
   - `checkout.session.completed` ✓
   - `customer.subscription.created` ✓
   - `invoice.paid` ✓
5. All should show "Succeeded"
6. If any show "Failed", click to see error details

---

## Part 9: Troubleshooting Common Issues

### Issue: "Payment system not configured"

**Solution:**
1. Check Render environment variables are set correctly
2. Restart backend service in Render
3. Wait 2 minutes for deployment
4. Try again

### Issue: Webhook events show "Failed"

**Solution:**
1. Check webhook URL is correct: `https://your-backend/api/webhooks/stripe`
2. Verify `STRIPE_WEBHOOK_SECRET` in Render matches Stripe
3. Check backend logs in Render for errors
4. Click "Send test webhook" in Stripe to debug

### Issue: Stripe Connect onboarding fails

**Solution:**
1. Check redirect URIs in Connect settings include your domain
2. Verify you're using test mode data (verification code: 000000)
3. Try different browser or clear cache

### Issue: Price doesn't match ($49 or $89)

**Solution:**
1. Verify Stripe Product prices are correct (49.00 and 89.00)
2. Check database `subscription_plans` table has correct `price` values
3. Update with SQL from Part 7

---

## Part 10: Going Live (When Ready)

### Before Going Live Checklist

- [ ] All tests pass successfully
- [ ] Stripe account fully verified (business info, bank account)
- [ ] Privacy policy and Terms of Service URLs added to Stripe
- [ ] Customer support email/phone confirmed
- [ ] Tax settings configured (if applicable)

### Switch to Live Mode

1. **Get Live API Keys**:
   - In Stripe Dashboard, toggle "Test mode" to **OFF**
   - Go to "Developers" → "API keys"
   - Copy your **Live** secret key (starts with `sk_live_...`)

2. **Create Live Products**:
   - Products don't automatically copy from test to live
   - Go to "Products" (in live mode)
   - Create Basic Plan ($49/month) again
   - Create Pro Plan ($89/month) again
   - Copy the new **live** Price IDs

3. **Create Live Webhook**:
   - Go to "Developers" → "Webhooks" (in live mode)
   - Add endpoint with same URL and events
   - Copy the new **live** webhook secret

4. **Update Backend Environment**:
   ```
   STRIPE_SECRET_KEY=sk_live_YOUR_LIVE_KEY
   STRIPE_WEBHOOK_SECRET=whsec_YOUR_LIVE_WEBHOOK_SECRET
   ```

5. **Update Database**:
   ```sql
   -- Update with LIVE price IDs
   UPDATE subscription_plans SET stripe_price_id = 'price_LIVE_BASIC_ID' WHERE name ILIKE '%basic%';
   UPDATE subscription_plans SET stripe_price_id = 'price_LIVE_PRO_ID' WHERE name ILIKE '%pro%';
   ```

6. **Test with Small Real Payment**:
   - Use your own real card
   - Subscribe to Basic plan ($49)
   - Verify money arrives in your Stripe balance
   - Cancel subscription immediately if this is just a test

7. **Announce Launch**: You're live! 🎉

---

## Summary: What You Created

✅ Stripe account with Connect enabled
✅ Two subscription products (Basic $49, Pro $89)
✅ Webhook endpoint for automated updates
✅ Backend configured with API keys
✅ Database updated with Price IDs
✅ Tested full payment flow

## Timeline
- **Part 1-3**: 30 minutes (one-time setup)
- **Part 4-7**: 35 minutes (configuration)
- **Part 8**: 20 minutes (testing)
- **Total**: ~90 minutes for complete setup

## Support Resources

- **Stripe Dashboard**: https://dashboard.stripe.com
- **Stripe Documentation**: https://stripe.com/docs
- **Test Cards**: https://stripe.com/docs/testing#cards
- **Connect Guide**: https://stripe.com/docs/connect/quickstart

## Your Setup Status

- [ ] Part 1: Stripe account created
- [ ] Part 2: API keys obtained
- [ ] Part 3: Connect enabled
- [ ] Part 4: Products created (Basic & Pro)
- [ ] Part 5: Webhook configured
- [ ] Part 6: Backend environment variables set
- [ ] Part 7: Database updated with Price IDs
- [ ] Part 8: All tests passing
- [ ] Part 9: Ready for production
- [ ] Part 10: Live mode (when ready)

---

**Next Step**: Start with Part 1 and work through each section. Check off items as you complete them. If you get stuck, refer to Part 9 (Troubleshooting).
