# Stripe Test Mode Setup Guide

Your payment system is already configured to accept test payments! You just need to use Stripe's **test mode API keys**.

## 🔑 How to Get Test API Keys

1. **Go to Stripe Dashboard**: https://dashboard.stripe.com
2. **Toggle to Test Mode**: Look for the "Test mode" toggle in the top right corner - make sure it's ON
3. **Get Your Test Keys**:
   - Go to: Developers → API Keys
   - Copy your **Test Secret Key** (starts with `sk_test_...`)
   - Copy your **Test Publishable Key** (starts with `pk_test_...`)

## ⚙️ Update Your Environment Variables

### On Render (Backend):
1. Go to your Render dashboard
2. Select your backend service: `coachly-backend`
3. Go to Environment tab
4. Update these variables:
   - `STRIPE_SECRET_KEY` = `sk_test_...` (your test secret key)
   - `STRIPE_PUBLISHABLE_KEY` = `pk_test_...` (your test publishable key)
5. Click "Save Changes" - Render will automatically redeploy

### On Vercel (Frontend) - If needed:
1. Go to your Vercel dashboard
2. Select your project: `usecoachly`
3. Go to Settings → Environment Variables
4. Add/Update:
   - `VITE_STRIPE_PUBLISHABLE_KEY` = `pk_test_...`
5. Redeploy your frontend

## 💳 Test Card Numbers

Once you're using test API keys, use these card numbers:

### ✅ Successful Payment:
- **Card Number**: `4242 4242 4242 4242`
- **Expiry**: Any future date (e.g., `12/25`)
- **CVC**: Any 3 digits (e.g., `123`)
- **ZIP**: Any 5 digits (e.g., `12345`)

### Other Test Cards:
- **Visa (Debit)**: `4000 0566 5566 5556`
- **Mastercard**: `5555 5555 5555 4444`
- **Amex**: `3782 822463 10005`
- **Discover**: `6011 1111 1111 1117`

### Declined Payment:
- **Card Number**: `4000 0000 0000 0002` (card declined)
- **Card Number**: `4000 0000 0000 9995` (insufficient funds)

### Payment Requires Authentication (3D Secure):
- **Card Number**: `4000 0025 0000 3155`

## 🧪 How to Test

1. **Sign up as an instructor** on https://usecoachly.com
2. When prompted for payment, use the test card: `4242 4242 4242 4242`
3. Enter any future expiry date and any CVC
4. Complete the payment
5. You'll be automatically redirected and signed up!

## 📊 Verify Test Payments

1. Go to Stripe Dashboard (Test Mode): https://dashboard.stripe.com/test/payments
2. You'll see all test payments listed
3. Click on any payment to see full details

## 🔄 Webhooks in Test Mode

For testing webhooks locally, you can use Stripe CLI:
```bash
stripe listen --forward-to https://coachly-backend.onrender.com/api/webhooks/stripe
```

But for production testing on Render, webhooks should work automatically with test mode.

## ✅ What Works in Test Mode

- ✅ Instructor signup with payment
- ✅ Course payments (if you have paid courses)
- ✅ Subscription payments
- ✅ All test cards work
- ✅ No real money is charged
- ✅ All Stripe features available

## 🚀 Switching to Live Mode Later

When you're ready to accept real payments:
1. Complete Stripe account verification
2. Replace `sk_test_...` with `sk_live_...` (live secret key)
3. Replace `pk_test_...` with `pk_live_...` (live publishable key)
4. Update environment variables on Render and Vercel
5. Test with a small real payment first!

## 📝 Current Setup

Your system already:
- ✅ Uses Stripe Checkout for payments
- ✅ Handles instructor signup with one-time payment
- ✅ Supports course purchases with instructor payouts
- ✅ Validates payment status before account creation
- ✅ Stores payment info in database

**No code changes needed** - just use test API keys and test card numbers!

## 💡 Quick Reference

**Test Card**: `4242 4242 4242 4242`  
**Expiry**: `12/30`  
**CVC**: `123`  
**ZIP**: `12345`

That's it! Your payment system is ready for testing. 🎉
