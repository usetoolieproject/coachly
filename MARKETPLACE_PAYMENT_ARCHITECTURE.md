# Marketplace Payment Architecture Guide

## 🎯 Business Model

**Coachly's Revenue:**
- Instructors pay monthly/yearly subscription fees to use the platform

**Student Payments:**
1. Students pay Coachly for courses/services
2. Funds are held in Coachly's Stripe account
3. Instructors receive payouts to their connected Stripe/PayPal account
4. Coachly can take a commission/fee from each transaction

---

## 🏗️ Technical Architecture

### Current Setup (Direct Transfer - Not What You Want)
```
Student → Stripe → Instructor's Connected Account (minus platform fee)
                    ↓
              Platform Fee → Coachly
```
**Problem:** Money goes directly to instructor. Coachly only gets platform fee.

### New Setup (Marketplace Model - What You Want)
```
Student → Stripe → Coachly's Account (full amount)
                    ↓
              (Funds held by Coachly)
                    ↓
              (Manual/Scheduled Payout)
                    ↓
              Instructor's Connected Account (minus commission)
```
**Benefit:** Coachly controls funds, can hold for refunds, pay on schedule, take commission.

---

## 🔧 Implementation Changes

### 1. Database Schema Updates

Add new tables to track payouts:

```sql
-- Track pending payouts to instructors
CREATE TABLE instructor_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instructor_id UUID REFERENCES instructors(id),
  amount_cents INTEGER NOT NULL,
  currency TEXT DEFAULT 'usd',
  status TEXT CHECK (status IN ('pending', 'processing', 'completed', 'failed')) DEFAULT 'pending',
  stripe_transfer_id TEXT, -- If using Stripe Connect
  paypal_payout_id TEXT,   -- If using PayPal
  payout_method TEXT CHECK (payout_method IN ('stripe', 'paypal')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  notes TEXT
);

-- Track individual earnings from each transaction
CREATE TABLE instructor_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instructor_id UUID REFERENCES instructors(id),
  course_id UUID REFERENCES courses(id),
  student_id UUID REFERENCES students(id),
  enrollment_id UUID REFERENCES enrollments(id),
  gross_amount_cents INTEGER NOT NULL, -- What student paid
  platform_fee_cents INTEGER NOT NULL, -- Coachly's commission
  net_amount_cents INTEGER NOT NULL,   -- What instructor gets
  currency TEXT DEFAULT 'usd',
  stripe_payment_intent_id TEXT,
  status TEXT CHECK (status IN ('pending', 'paid_out', 'refunded')) DEFAULT 'pending',
  payout_id UUID REFERENCES instructor_payouts(id), -- Links to payout batch
  created_at TIMESTAMPTZ DEFAULT NOW(),
  paid_out_at TIMESTAMPTZ
);

-- Update instructors table
ALTER TABLE instructors ADD COLUMN IF NOT EXISTS stripe_account_id TEXT;
ALTER TABLE instructors ADD COLUMN IF NOT EXISTS paypal_email TEXT;
ALTER TABLE instructors ADD COLUMN IF NOT EXISTS preferred_payout_method TEXT CHECK (preferred_payout_method IN ('stripe', 'paypal'));
ALTER TABLE instructors ADD COLUMN IF NOT EXISTS minimum_payout_cents INTEGER DEFAULT 5000; -- Min $50 for payout
```

### 2. Backend Code Changes

#### A. Update Course Checkout (billingController.js)

**REMOVE** the direct transfer setup:

```javascript
// ❌ OLD CODE - REMOVE THIS:
payment_intent_data: {
  transfer_data: { destination: destinationAccountId },
  application_fee_amount: platformFeeCents,
  on_behalf_of: destinationAccountId,
},
```

**REPLACE WITH** standard payment to your account:

```javascript
// ✅ NEW CODE - Money stays with Coachly:
export const createCheckoutSession = async (req, res) => {
  try {
    if (!stripe) {
      return res.status(500).json({ 
        error: 'Payment system not configured.' 
      });
    }

    const supabase = getSupabaseClient();
    const student = req.user.students?.[0];
    if (!student) {
      return res.status(403).json({ error: 'Student access required' });
    }

    const { courseId } = req.body || {};
    if (!courseId) {
      return res.status(400).json({ error: 'courseId is required' });
    }

    // Fetch course
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('id, title, price, type, instructor_id')
      .eq('id', courseId)
      .single();

    if (courseError || !course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    if (course.type !== 'paid') {
      return res.status(400).json({ error: 'Course is not paid' });
    }

    const userEmail = req.user.email;
    const frontendBaseUrl = getFrontendBaseUrl(req);
    
    // Calculate platform commission (e.g., 15% of course price)
    const platformCommissionRate = Number(process.env.PLATFORM_COMMISSION_RATE || 0.15);
    const coursePriceCents = Math.round((course.price || 0) * 100);
    const platformFeeCents = Math.round(coursePriceCents * platformCommissionRate);
    const instructorEarningsCents = coursePriceCents - platformFeeCents;

    // Create standard Checkout Session - money goes to YOUR account
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: userEmail,
      metadata: {
        course_id: course.id,
        student_id: student.id,
        instructor_id: course.instructor_id,
        gross_amount_cents: coursePriceCents.toString(),
        platform_fee_cents: platformFeeCents.toString(),
        instructor_earnings_cents: instructorEarningsCents.toString(),
      },
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: { 
              name: course.title,
              description: `Taught by instructor ID: ${course.instructor_id}`
            },
            unit_amount: coursePriceCents,
          },
          quantity: 1,
        },
      ],
      success_url: `${frontendBaseUrl}/student/courses?paid=1&courseId=${course.id}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendBaseUrl}/student/courses?canceled=1&courseId=${course.id}`,
    });

    return res.json({ url: session.url });
  } catch (error) {
    console.error('Checkout session error:', error);
    return res.status(500).json({ error: 'Failed to create checkout session' });
  }
};
```

#### B. Update Webhook to Track Earnings (billingController.js)

```javascript
export const stripeWebhook = async (req, res) => {
  try {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    const supabase = getSupabaseClient();

    // Handle successful payment
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      
      const courseId = session.metadata?.course_id;
      const studentId = session.metadata?.student_id;
      const instructorId = session.metadata?.instructor_id;
      const grossAmountCents = parseInt(session.metadata?.gross_amount_cents || '0');
      const platformFeeCents = parseInt(session.metadata?.platform_fee_cents || '0');
      const instructorEarningsCents = parseInt(session.metadata?.instructor_earnings_cents || '0');

      // Create enrollment
      const { data: enrollment, error: enrollError } = await supabase
        .from('enrollments')
        .insert({ 
          student_id: studentId, 
          course_id: courseId,
          paid_at: new Date().toISOString(),
          price_paid_cents: grossAmountCents
        })
        .select()
        .single();

      if (enrollError) {
        console.error('Enrollment error:', enrollError);
      }

      // Record instructor earnings (money you owe them)
      if (enrollment && instructorId) {
        await supabase.from('instructor_earnings').insert({
          instructor_id: instructorId,
          course_id: courseId,
          student_id: studentId,
          enrollment_id: enrollment.id,
          gross_amount_cents: grossAmountCents,
          platform_fee_cents: platformFeeCents,
          net_amount_cents: instructorEarningsCents,
          stripe_payment_intent_id: session.payment_intent,
          status: 'pending',
        });
      }
    }

    return res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ error: 'Webhook processing failed' });
  }
};
```

#### C. Create Payout System (New controller: payoutController.js)

```javascript
import Stripe from 'stripe';
import { getSupabaseClient } from '../repositories/supabaseClient.js';

let stripe = null;

export const initializeStripe = () => {
  if (process.env.STRIPE_SECRET_KEY) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
};

// Get instructor's pending earnings
export const getInstructorEarnings = async (req, res) => {
  try {
    const instructorId = req.user.instructors?.[0]?.id;
    if (!instructorId) {
      return res.status(403).json({ error: 'Instructor access required' });
    }

    const supabase = getSupabaseClient();
    
    // Get pending (unpaid) earnings
    const { data: pendingEarnings, error: pendingError } = await supabase
      .from('instructor_earnings')
      .select('*')
      .eq('instructor_id', instructorId)
      .eq('status', 'pending');

    if (pendingError) {
      return res.status(500).json({ error: 'Failed to fetch earnings' });
    }

    const totalPendingCents = pendingEarnings.reduce(
      (sum, earning) => sum + earning.net_amount_cents, 
      0
    );

    // Get past payouts
    const { data: payouts, error: payoutsError } = await supabase
      .from('instructor_payouts')
      .select('*')
      .eq('instructor_id', instructorId)
      .order('created_at', { ascending: false })
      .limit(10);

    return res.json({
      pending_earnings_cents: totalPendingCents,
      pending_earnings: (totalPendingCents / 100).toFixed(2),
      pending_transactions: pendingEarnings.length,
      recent_payouts: payouts || [],
    });
  } catch (error) {
    console.error('Get earnings error:', error);
    return res.status(500).json({ error: 'Failed to fetch earnings' });
  }
};

// Connect Stripe account for payouts
export const connectStripeAccount = async (req, res) => {
  try {
    if (!stripe) {
      return res.status(500).json({ error: 'Stripe not configured' });
    }

    const instructorId = req.user.instructors?.[0]?.id;
    if (!instructorId) {
      return res.status(403).json({ error: 'Instructor access required' });
    }

    const supabase = getSupabaseClient();
    const { data: instructor } = await supabase
      .from('instructors')
      .select('stripe_account_id, user_id')
      .eq('id', instructorId)
      .single();

    let accountId = instructor?.stripe_account_id;

    // Create new Connect account if needed
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        country: 'US',
        email: req.user.email,
        capabilities: {
          transfers: { requested: true },
        },
      });
      accountId = account.id;

      // Save to database
      await supabase
        .from('instructors')
        .update({ stripe_account_id: accountId })
        .eq('id', instructorId);
    }

    // Create account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${process.env.FRONTEND_BASE_URL}/coach/settings/payouts?refresh=1`,
      return_url: `${process.env.FRONTEND_BASE_URL}/coach/settings/payouts?connected=1`,
      type: 'account_onboarding',
    });

    return res.json({ url: accountLink.url });
  } catch (error) {
    console.error('Connect account error:', error);
    return res.status(500).json({ error: 'Failed to connect account' });
  }
};

// Admin/Automated: Process payouts to instructors
export const processInstructorPayouts = async (req, res) => {
  try {
    if (!stripe) {
      return res.status(500).json({ error: 'Stripe not configured' });
    }

    // Check admin permissions or run via cron job
    const supabase = getSupabaseClient();

    // Get all instructors with pending earnings above minimum
    const { data: instructors, error: instructorsError } = await supabase
      .from('instructors')
      .select('id, stripe_account_id, minimum_payout_cents, preferred_payout_method')
      .not('stripe_account_id', 'is', null);

    if (instructorsError || !instructors) {
      return res.status(500).json({ error: 'Failed to fetch instructors' });
    }

    const payoutResults = [];

    for (const instructor of instructors) {
      // Get pending earnings
      const { data: earnings, error: earningsError } = await supabase
        .from('instructor_earnings')
        .select('*')
        .eq('instructor_id', instructor.id)
        .eq('status', 'pending');

      if (earningsError || !earnings || earnings.length === 0) {
        continue;
      }

      const totalEarningsCents = earnings.reduce(
        (sum, e) => sum + e.net_amount_cents, 
        0
      );

      // Check minimum payout threshold
      const minimumCents = instructor.minimum_payout_cents || 5000; // Default $50
      if (totalEarningsCents < minimumCents) {
        continue; // Skip if below threshold
      }

      try {
        // Create Stripe transfer to instructor's connected account
        const transfer = await stripe.transfers.create({
          amount: totalEarningsCents,
          currency: 'usd',
          destination: instructor.stripe_account_id,
          description: `Payout for ${earnings.length} transactions`,
        });

        // Record payout in database
        const { data: payout } = await supabase
          .from('instructor_payouts')
          .insert({
            instructor_id: instructor.id,
            amount_cents: totalEarningsCents,
            status: 'completed',
            stripe_transfer_id: transfer.id,
            payout_method: 'stripe',
            processed_at: new Date().toISOString(),
          })
          .select()
          .single();

        // Update earnings status
        const earningIds = earnings.map(e => e.id);
        await supabase
          .from('instructor_earnings')
          .update({ 
            status: 'paid_out', 
            payout_id: payout.id,
            paid_out_at: new Date().toISOString()
          })
          .in('id', earningIds);

        payoutResults.push({
          instructor_id: instructor.id,
          amount: (totalEarningsCents / 100).toFixed(2),
          status: 'success',
          transfer_id: transfer.id,
        });
      } catch (payoutError) {
        console.error('Payout error for instructor:', instructor.id, payoutError);
        payoutResults.push({
          instructor_id: instructor.id,
          status: 'failed',
          error: payoutError.message,
        });
      }
    }

    return res.json({ 
      processed: payoutResults.length,
      results: payoutResults 
    });
  } catch (error) {
    console.error('Process payouts error:', error);
    return res.status(500).json({ error: 'Failed to process payouts' });
  }
};
```

### 3. Frontend Changes

#### A. Instructor Earnings Dashboard (New component)

Create: `frontend/src/features/instructor/earnings/InstructorEarnings.tsx`

```tsx
import React, { useEffect, useState } from 'react';
import { apiFetch } from '../../../services/api';

export const InstructorEarnings = () => {
  const [earnings, setEarnings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEarnings();
  }, []);

  const fetchEarnings = async () => {
    try {
      const data = await apiFetch('/payouts/earnings');
      setEarnings(data);
    } catch (error) {
      console.error('Failed to fetch earnings:', error);
    } finally {
      setLoading(false);
    }
  };

  const connectStripe = async () => {
    try {
      const { url } = await apiFetch('/payouts/connect-stripe', {
        method: 'POST',
      });
      window.location.href = url;
    } catch (error) {
      alert('Failed to connect Stripe account');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Your Earnings</h1>

      {/* Pending Earnings Card */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-2">Pending Earnings</h2>
        <p className="text-4xl font-bold text-green-600">
          ${earnings?.pending_earnings || '0.00'}
        </p>
        <p className="text-gray-600 mt-2">
          From {earnings?.pending_transactions || 0} transactions
        </p>
        <p className="text-sm text-gray-500 mt-4">
          Payouts are processed weekly when balance exceeds $50
        </p>
      </div>

      {/* Connect Payout Method */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold mb-2">Payout Method</h2>
        <p className="text-gray-700 mb-4">
          Connect your Stripe account to receive payouts
        </p>
        <button
          onClick={connectStripe}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Connect Stripe Account
        </button>
      </div>

      {/* Recent Payouts */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Recent Payouts</h2>
        {earnings?.recent_payouts?.length > 0 ? (
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Date</th>
                <th className="text-left py-2">Amount</th>
                <th className="text-left py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {earnings.recent_payouts.map((payout: any) => (
                <tr key={payout.id} className="border-b">
                  <td className="py-2">
                    {new Date(payout.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-2">
                    ${(payout.amount_cents / 100).toFixed(2)}
                  </td>
                  <td className="py-2">
                    <span className={`px-2 py-1 rounded text-sm ${
                      payout.status === 'completed' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {payout.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-500">No payouts yet</p>
        )}
      </div>
    </div>
  );
};
```

### 4. Environment Variables

Add to `.env`:

```bash
# Platform commission rate (0.15 = 15%)
PLATFORM_COMMISSION_RATE=0.15

# Stripe Connect
STRIPE_CONNECT_CLIENT_ID=your_stripe_connect_client_id
```

### 5. Cron Job for Automated Payouts

Set up a cron job (e.g., using Render Cron Jobs or GitHub Actions) to run weekly:

```bash
# Every Monday at 9 AM UTC
0 9 * * 1 curl -X POST https://coachly-backend.onrender.com/api/admin/process-payouts \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

## 💰 Revenue Breakdown Example

**Student buys $100 course:**
- Student pays: $100
- Platform commission (15%): $15 → Goes to Coachly
- Instructor earnings (85%): $85 → Held by Coachly, paid out weekly

**Coachly's total revenue:**
- Subscription fees: $X/month from instructors
- Transaction commissions: 15% of all course sales

---

## 🎯 Advantages of This Model

✅ **Control**: You hold funds until ready to pay out  
✅ **Refund Protection**: Can issue refunds without clawing back from instructors  
✅ **Flexible Payouts**: Pay weekly, monthly, or when threshold is met  
✅ **Commission Control**: Easy to adjust commission rates  
✅ **Multiple Payout Methods**: Support Stripe, PayPal, bank transfer  
✅ **Analytics**: Track all transactions, earnings, and payouts  
✅ **Fraud Protection**: Review suspicious activity before paying out  

---

## 📋 Next Steps

1. ✅ Run the SQL migrations to create tables
2. ✅ Update `billingController.js` - remove direct transfers
3. ✅ Create `payoutController.js` with earnings tracking
4. ✅ Update webhook to record earnings
5. ✅ Build instructor earnings dashboard
6. ✅ Set up automated payout cron job
7. ✅ Add Stripe Connect onboarding flow
8. ✅ Test with test mode payments
9. ✅ Configure commission rate in env vars

**Want me to implement these changes for you?** I can update the code right now!
