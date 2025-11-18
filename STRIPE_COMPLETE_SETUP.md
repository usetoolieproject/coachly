# Complete Stripe Setup Guide - Step by Step

## ⚠️ IMPORTANT: PRODUCTION/LIVE MODE SETUP

**This guide sets up Stripe in LIVE/PRODUCTION mode - NOT test mode.**

- ✅ All payments will be REAL
- ✅ All transactions will charge REAL money
- ✅ All API keys will be LIVE keys (sk_live_...)
- ✅ Your platform will accept real customer payments immediately after setup

**If you want to test first**: You can set up in test mode (use sk_test_... keys), test everything, then switch to live mode later. However, this guide assumes you're going straight to production.

---

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

### Step 3: Use Live Mode (Production)
1. Look at the top left corner - there's a toggle that says "Test mode"
2. Make sure it's **OFF** (should show "Viewing live data")
3. You'll be working in **LIVE MODE** - real payments, real money
4. ⚠️ **Important**: All actions in this guide will affect real transactions

---

## Part 2: Get Your API Keys (5 minutes)

### Step 1: Navigate to API Keys
1. In Stripe Dashboard, click "Developers" (top right)
2. Click "API keys" from the left menu
3. You'll see two keys displayed:
   - **Publishable key** (starts with `pk_test_...`)
   - **Secret key** (starts with `sk_test_...` - click "Reveal test key")

### Step 2: Copy Your LIVE Keys
1. **Make sure "Test mode" toggle is OFF** (you should see "Viewing live data")
2. Click "Reveal live key" next to the Secret key
3. Click the copy icon to copy it (starts with `sk_live_...`)
4. Save it somewhere safe (you'll need it in Part 6)
5. Copy the Publishable key too (starts with `pk_live_...`)
6. Save both keys in a secure text file temporarily

**⚠️ CRITICAL SECURITY**: 
- NEVER share your live secret key publicly
- NEVER commit it to GitHub or any code repository
- NEVER send it via email or messaging apps
- Only use it in environment variables on your server
- These are REAL keys that can charge REAL money

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
STRIPE_SECRET_KEY=sk_live_YOUR_LIVE_SECRET_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_LIVE_WEBHOOK_SECRET_HERE
PLATFORM_FEE_CENTS=0
```

Replace:
- `sk_live_YOUR_LIVE_SECRET_KEY_HERE` with your **LIVE** secret key from Part 2 (starts with `sk_live_`)
- `whsec_YOUR_LIVE_WEBHOOK_SECRET_HERE` with your webhook secret from Part 5

⚠️ **IMPORTANT**: 
- Use `sk_live_...` NOT `sk_test_...`
- Double-check you copied the LIVE keys, not test keys
- These will process REAL payments

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

⚠️ **IMPORTANT**: You're in LIVE MODE - these will be real payments. Use small amounts or your own card for testing.

### Test 1: Instructor Stripe Connect (REAL DATA REQUIRED)

1. **Log in as an instructor** at https://usecoachly.com
2. Go to **Settings** (gear icon in sidebar)
3. Scroll to **Payouts** section
4. Click **"Set up payouts"**
5. You'll be redirected to Stripe Connect onboarding
6. **Use REAL information** (required in live mode):
   - **Phone**: Your real phone number
   - **Verification code**: Real code sent to your phone
   - **Business name**: Your actual business name
   - **SSN/EIN**: Your real tax ID
   - **Bank account**: Real routing/account numbers for payouts
   - **Address**: Real business address
   - **ID verification**: Upload real ID (driver's license, passport)
7. Complete the form and submit
8. You should be redirected back to settings
9. **Verify**: Payouts section shows "Charges enabled" and "Payouts enabled"
   - Note: Some features may require additional verification

### Test 2: Platform Subscription (REAL PAYMENT)

⚠️ **This will charge a real card $49**

**Option A - Use Your Own Card (Recommended for testing):**
1. **Open an incognito window**
2. Go to https://usecoachly.com
3. Click "Get Started" on the **Basic Plan** ($49)
4. Complete signup form
5. You'll be redirected to Stripe Checkout
6. **Enter your real credit/debit card**
7. Click "Subscribe"
8. ✅ **You will be charged $49** - This is a real payment
9. You should be redirected to instructor dashboard
10. **Verify in Stripe Dashboard**:
    - Go to "Payments" → You'll see $49.00 payment
    - Go to "Customers" → New customer created
    - Go to "Subscriptions" → Active subscription
11. **To cancel/refund**: Go to Stripe Dashboard → Subscriptions → Cancel (and refund if needed)

**Option B - Skip Test Payment (Not Recommended):**
If you want to skip the real payment test, you can proceed, but you won't know if payments work until a real customer tries.

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

## Part 10: Final Checklist Before Launch

### Pre-Launch Verification

- [ ] Stripe account fully verified (business info, tax ID, bank account)
- [ ] Privacy policy URL added to Stripe settings
- [ ] Terms of Service URL added to Stripe settings
- [ ] Customer support email/phone confirmed and active
- [ ] Refund policy documented
- [ ] Tax settings configured (if applicable for your location)
- [ ] Payout schedule set (automatic daily/weekly/monthly)
- [ ] Email templates customized (receipts, invoices)
- [ ] Test payment completed successfully
- [ ] Webhook events delivering correctly
- [ ] Instructor can connect Stripe successfully

### Post-Launch Monitoring (First Week)

1. **Monitor Stripe Dashboard Daily**:
   - Check "Payments" for any failures
   - Review "Disputes" (hopefully none!)
   - Check "Events" for webhook delivery

2. **Watch for Issues**:
   - Failed payments (check webhook logs)
   - Customer complaints about charges
   - Instructor payout issues

3. **Customer Support Ready**:
   - Have process for refunds
   - Know how to cancel subscriptions
   - Can help instructors with Connect issues

### Important Live Mode Notes

✅ **You're already live** - following this guide sets up production
✅ All payments are real from the start
✅ Money goes to your Stripe balance immediately
✅ Instructors receive real payouts
✅ No "test mode" to graduate from

### If You Need to Rollback

If something goes wrong and you need to disable payments temporarily:

1. Go to Render dashboard
2. Set `STRIPE_SECRET_KEY` to an empty value or invalid key
3. This will show "Payment system not configured" to users
4. Fix the issue, then restore the real key

---

## Summary: What You Created

✅ **LIVE** Stripe account with Connect enabled
✅ Two subscription products (Basic $49, Pro $89) - **LIVE**
✅ Webhook endpoint for automated updates - **LIVE**
✅ Backend configured with **LIVE** API keys
✅ Database updated with **LIVE** Price IDs
✅ Ready to accept **REAL** payments immediately

## Timeline
- **Part 1-3**: 30 minutes (account setup + verification)
- **Part 4-7**: 35 minutes (products + configuration)
- **Part 8**: 20 minutes (testing with real card)
- **Total**: ~90 minutes for complete LIVE setup

## ⚠️ Important Reminders

- **You're in PRODUCTION** - All payments are real
- **Test with caution** - Use your own card or small amounts
- **Monitor closely** - Check Stripe Dashboard daily first week
- **Customer support ready** - Have refund/cancellation process
- **Compliance** - Privacy policy, Terms of Service, Tax settings required

## Support Resources

- **Stripe Dashboard**: https://dashboard.stripe.com
- **Stripe Documentation**: https://stripe.com/docs
- **Test Cards**: https://stripe.com/docs/testing#cards
- **Connect Guide**: https://stripe.com/docs/connect/quickstart

## Your Setup Status

- [ ] Part 1: LIVE Stripe account created & verified
- [ ] Part 2: LIVE API keys obtained (sk_live_...)
- [ ] Part 3: LIVE mode confirmed (toggle OFF)
- [ ] Part 4: LIVE products created (Basic $49 & Pro $89)
- [ ] Part 5: LIVE webhook configured
- [ ] Part 6: Backend environment variables set with LIVE keys
- [ ] Part 7: Database updated with LIVE Price IDs
- [ ] Part 8: Real payment test completed successfully
- [ ] Part 9: Troubleshooting guide reviewed
- [ ] Part 10: Pre-launch checklist completed
- [ ] **LAUNCH**: Platform accepting real payments! 🚀

---

**Next Step**: Start with Part 1 and work through each section. Check off items as you complete them. 

⚠️ **Remember**: You're setting up PRODUCTION immediately - all payments will be real from the start!
