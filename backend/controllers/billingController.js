import Stripe from 'stripe';
import bcrypt from 'bcryptjs';
import { getSupabaseClient } from '../repositories/supabaseClient.js';

// Initialize Stripe - will be called after dotenv loads
let stripe = null;

const initializeStripe = () => {
  

  if (process.env.STRIPE_SECRET_KEY) {
    try {
      stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: '2024-06-20',
      });
      
    } catch (error) {
      // Error initializing Stripe
    }
  } else {
    
  }
};

export const createCheckoutSession = async (req, res) => {
  try {
    
    
    // Check if Stripe is configured
    if (!stripe) {
      
      return res.status(500).json({ 
        error: 'Payment system not configured. Please contact support.' 
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

    // Fetch course with instructor stripe account id
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('id, title, price, type, instructor_id, instructors!inner(stripe_account_id)')
      .eq('id', courseId)
      .single();

    if (courseError || !course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    if (course.type !== 'paid') {
      return res.status(400).json({ error: 'Course is not paid' });
    }

    const userEmail = req.user.email;
    
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
    const destinationAccountId = course?.instructors?.stripe_account_id || null;
    if (!destinationAccountId) {
      return res.status(400).json({ error: 'Instructor is not connected to Stripe for payouts.' });
    }

    // Optional platform fee in cents via env var (e.g., 100 = $1.00)
    const platformFeeCents = Number(process.env.PLATFORM_FEE_CENTS || 0);

    // Create one-time Checkout Session with Connect transfer to instructor
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: userEmail,
      payment_intent_data: {
        transfer_data: { destination: destinationAccountId },
        ...(platformFeeCents > 0 ? { application_fee_amount: platformFeeCents } : {}),
        on_behalf_of: destinationAccountId,
      },
      metadata: {
        course_id: course.id,
        student_id: student.id,
        instructor_id: course.instructor_id,
      },
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: { name: course.title },
            unit_amount: Math.max(0, Math.round((course.price || 0) * 100)),
          },
          quantity: 1,
        },
      ],
      success_url: `${frontendBaseUrl}/student/courses?paid=1&courseId=${course.id}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendBaseUrl}/student/courses?canceled=1&courseId=${course.id}`,
    });

    return res.json({ url: session.url });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to create checkout session' });
  }
};

// Confirm a checkout session after redirect (idempotent with webhook)
export const confirmCheckoutSession = async (req, res) => {
  try {
    if (!stripe) {
      return res.status(500).json({ error: 'Payment system not configured' });
    }

    const sessionId = req.query.session_id;
    if (!sessionId) {
      return res.status(400).json({ error: 'session_id is required' });
    }

    const supabase = getSupabaseClient();
    const student = req.user.students?.[0];
    if (!student) {
      return res.status(403).json({ error: 'Student access required' });
    }

    // Removed noisy logs in production
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    

    // Only proceed for paid sessions related to a course
    if (session.payment_status !== 'paid') {
      return res.json({ paid: false });
    }

    const meta = session.metadata || {};
    const courseId = meta.course_id || req.query.courseId || null;
    const instructorId = meta.instructor_id || null;

    // Security: ensure the session was for this logged-in student if metadata present
    if (meta.student_id && meta.student_id !== student.id) {
      return res.status(403).json({ error: 'Session does not belong to this student' });
    }

    // Persist payment (idempotent on stripe_session_id)
    const paymentRow = {
      stripe_session_id: session.id,
      stripe_payment_intent_id: session.payment_intent || null,
      instructor_id: instructorId,
      course_id: courseId,
      student_id: student.id,
      amount_total: session.amount_total || 0,
      currency: session.currency || 'usd',
      status: 'paid',
      purchased_at: session.created ? new Date(session.created * 1000).toISOString() : new Date().toISOString(),
      customer_email: session.customer_details?.email || session.customer_email || req.user.email || null,
      type: 'course_payment',
    };

    try {
      const { error: upsertError } = await supabase.from('payments').upsert(paymentRow, { onConflict: 'stripe_session_id' });
      if (upsertError) {
        // Payment upsert error
      }
    } catch (err) {
      // Continue on error
    }

    // Ensure enrollment exists and is marked paid for this course
    if (courseId) {
      const { data: existing, error: existErr } = await supabase
        .from('enrollments')
        .select('id, paid_at')
        .eq('student_id', student.id)
        .eq('course_id', courseId)
        .maybeSingle();

      if (existErr && existErr.code && existErr.code !== 'PGRST116') {
        // Enrollment lookup error
      }

      const paidAt = new Date().toISOString();
      const pricePaidCents = session.amount_total || 0;

      if (!existing) {
        const { error: enrollError } = await supabase
          .from('enrollments')
          .insert({ 
            student_id: student.id, 
            course_id: courseId,
            paid_at: paidAt,
            price_paid_cents: pricePaidCents
          });
        if (enrollError) {
          // Enrollment insert error
        }
      } else if (!existing.paid_at) {
        const { error: enrollUpdateError } = await supabase
          .from('enrollments')
          .update({ paid_at: paidAt, price_paid_cents: pricePaidCents, updated_at: new Date().toISOString() })
          .eq('id', existing.id);
        if (enrollUpdateError) {
          // Enrollment update error
        }
      }
    }

    return res.json({ paid: true, courseId: courseId });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to confirm session' });
  }
};

export const createCommunityCheckoutSession = async (req, res) => {
  try {
    
    
    // Check if Stripe is configured
    if (!stripe) {
      
      return res.status(500).json({ 
        error: 'Payment system not configured. Please contact support.' 
      });
    }
    
    

    const { communityId, instructorId, amount, currency, description, subdomain } = req.body || {};
    
    if (!communityId || !instructorId || !amount || !description) {
      return res.status(400).json({ 
        error: 'Missing required fields: communityId, instructorId, amount, description' 
      });
    }
    
    // Construct the success URL with subdomain
    // If subdomain is provided, use it to construct the full URL
    const subdomainToUse = subdomain || (req.body && req.body.subdomain);
    
    let frontendBaseUrl;
    if (subdomainToUse) {
      frontendBaseUrl = `https://${subdomainToUse}.usecoachly.com`;
    } else {
      // Fallback: check for environment variable
      if (process.env.FRONTEND_BASE_URL) {
        frontendBaseUrl = process.env.FRONTEND_BASE_URL;
      } else {
        // Final fallback
        frontendBaseUrl = 'https://usecoachly.com';
      }
    }
    
    // Fetch instructor to get connected account id
    const supabase = getSupabaseClient();
    const { data: instructor, error: instructorError } = await supabase
      .from('instructors')
      .select('id, stripe_account_id')
      .eq('id', instructorId)
      .single();
    if (instructorError || !instructor) {
      return res.status(404).json({ error: 'Instructor not found' });
    }
    if (!instructor.stripe_account_id) {
      return res.status(400).json({ error: 'Instructor is not connected to Stripe for payouts.' });
    }
    const destinationAccountId = instructor.stripe_account_id;
    const platformFeeCents = Number(process.env.PLATFORM_FEE_CENTS || 0);
    

    // Create one-time Checkout Session for community subscription
    
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      payment_intent_data: {
        transfer_data: { destination: destinationAccountId },
        ...(platformFeeCents > 0 ? { application_fee_amount: platformFeeCents } : {}),
        on_behalf_of: destinationAccountId,
      },
      metadata: {
        community_id: communityId,
        instructor_id: instructorId,
        type: 'community_subscription',
      },
      line_items: [
        {
          price_data: {
            currency: currency || 'usd',
            product_data: { 
              name: description,
              description: 'Monthly community subscription'
            },
            unit_amount: Math.max(0, Math.round((amount || 0) * 100)),
          },
          quantity: 1,
        },
      ],
      success_url: `${frontendBaseUrl}/signup/student?payment_success=true&session_id={CHECKOUT_SESSION_ID}&community_id=${communityId}`,
      cancel_url: `${frontendBaseUrl}/?payment_cancelled=true`,
    });
    

    return res.json({ url: session.url, sessionId: session.id });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to create checkout session' });
  }
};

export const stripeWebhook = async (req, res) => {
  try {
    // Check if Stripe is configured
    if (!stripe) {
      return res.status(500).json({ error: 'Payment system not configured' });
    }

    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    let event;

    if (!webhookSecret) {
      return res.status(500).json({ error: 'Webhook secret not configured' });
    }

    try {
      event = stripe.webhooks.constructEvent(req.rawBody || req.body, sig, webhookSecret);
    } catch (err) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle events
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      
      if (session.payment_status === 'paid') {
        const { course_id, student_id, community_id, instructor_id, type, plan_id, original_price_cents } = session.metadata || {};
        const amountTotal = session.amount_total || 0; // in cents
        const currency = session.currency || 'usd';
        const sessionId = session.id;
        const paymentIntentId = session.payment_intent || null;
        const customerEmail = session.customer_details?.email || session.customer_email || null;
        const purchasedAt = session.created ? new Date(session.created * 1000).toISOString() : new Date().toISOString();

        const supabase = getSupabaseClient();

        // Handle new instructor signup with payment
        if (type === 'platform_signup_payment') {
          
          try {
            // Get signup data from metadata (it's stored as JSON string)
            const signup_data = session.metadata.signup_data;
            if (!signup_data) {
              return;
            }

            const signupData = JSON.parse(signup_data);
            
            // Hash password
            const passwordHash = await bcrypt.hash(signupData.password, 10);

            // Create user
            const { data: user, error: userError } = await supabase
              .from('users')
              .insert({
                email: signupData.email,
                password_hash: passwordHash,
                role: 'instructor',
                first_name: signupData.firstName,
                last_name: signupData.lastName
              })
              .select()
              .single();

            if (userError) {
              return;
            }

            // Create instructor profile
            const { data: instructor, error: instructorError } = await supabase
              .from('instructors')
              .insert({
                user_id: user.id,
                business_name: signupData.businessName,
                subdomain: signupData.subdomain,
                premium_starts: new Date().toISOString(),
                premium_ends: new Date('2099-12-31').toISOString() // Lifetime access
              })
              .select()
              .single();

            if (instructorError) {
              return;
            }

            // Record payment
            await supabase.from('payments').upsert({
              stripe_session_id: sessionId,
              stripe_payment_intent_id: paymentIntentId,
              instructor_id: instructor.id,
              amount_total: amountTotal,
              currency,
              status: 'paid',
              purchased_at: purchasedAt,
              customer_email: customerEmail,
              type: 'platform_signup_payment'
            }, { onConflict: 'stripe_session_id' });

            // Create subscription record with lifetime access
            const now = new Date();
            const farFuture = new Date('2099-12-31');
            
            await supabase.from('subscriptions').insert({
              instructor_id: instructor.id,
              stripe_subscription_id: `ONE_TIME_${sessionId}`,
              stripe_customer_id: session.customer || null,
              status: 'active',
              current_period_start: now.toISOString(),
              current_period_end: farFuture.toISOString(),
              cancel_at_period_end: false,
              plan_id: plan_id || null,
              original_price_cents: original_price_cents || amountTotal,
              has_promo: false,
              promo_end_date: null
            });

          } catch (error) {
            // Error('🎁 SIGNUP PAYMENT: Error:', error);
          }
        }

        // Handle plan upgrades
        if (type === 'plan_upgrade') {
          
          try {
            const { original_subscription_id, current_plan_id, new_plan_id } = session.metadata;
            
            // Record upgrade payment
            await supabase.from('payments').upsert({
              stripe_session_id: sessionId,
              stripe_payment_intent_id: paymentIntentId,
              instructor_id: instructor_id,
              amount_total: amountTotal,
              currency,
              status: 'paid',
              purchased_at: purchasedAt,
              customer_email: customerEmail,
              type: 'plan_upgrade'
            }, { onConflict: 'stripe_session_id' });

            // Update subscription record to Pro plan
            await supabase
              .from('subscriptions')
              .update({
                plan_id: new_plan_id,
                original_price_cents: amountTotal,
                updated_at: new Date().toISOString()
              })
              .eq('id', original_subscription_id);

          } catch (error) {
            // Error('⬆️ PLAN UPGRADE: Error processing upgrade:', error);
          }
        }

        // Handle one-time platform subscription payments (existing instructors)
        if (type === 'platform_one_time' && instructor_id) {
          
          try {
            // Record payment
            const paymentRow = {
              stripe_session_id: sessionId,
              stripe_payment_intent_id: paymentIntentId,
              instructor_id: instructor_id,
              amount_total: amountTotal,
              currency,
              status: 'paid',
              purchased_at: purchasedAt,
              customer_email: customerEmail,
              type: 'platform_one_time'
            };

            await supabase.from('payments').upsert(paymentRow, { onConflict: 'stripe_session_id' });

            // Create subscription record with lifetime access (no end date)
            const now = new Date();
            const farFuture = new Date('2099-12-31');
            
            const subscriptionData = {
              instructor_id,
              stripe_subscription_id: `ONE_TIME_${sessionId}`,
              stripe_customer_id: session.customer || null,
              status: 'active',
              current_period_start: now.toISOString(),
              current_period_end: farFuture.toISOString(), // Lifetime access
              cancel_at_period_end: false,
              plan_id: plan_id || null,
              original_price_cents: original_price_cents || amountTotal,
              has_promo: false,
              promo_end_date: null
            };

            await supabase.from('subscriptions').insert(subscriptionData);

            // Grant premium access (lifetime)
            await supabase
              .from('instructors')
              .update({
                premium_starts: now.toISOString(),
                premium_ends: farFuture.toISOString()
              })
              .eq('id', instructor_id);

          } catch (error) {
            // Error('🎁 ONE-TIME PAYMENT: Error processing one-time payment:', error);
          }
        }

        // Persist payment (idempotent by stripe_session_id)
        const paymentRow = {
          stripe_session_id: sessionId,
          stripe_payment_intent_id: paymentIntentId,
          instructor_id: instructor_id || null,
          course_id: course_id || null,
          community_id: community_id || null,
          student_id: student_id || null,
          amount_total: amountTotal,
          currency,
          status: 'paid',
          purchased_at: purchasedAt,
          customer_email: customerEmail,
          type: type || (course_id ? 'course_payment' : 'community_subscription'),
        };

        try {
          const { data, error } = await supabase
            .from('payments')
            .upsert(paymentRow, { onConflict: 'stripe_session_id' });
          
          if (error) {
            // Error('❌ Payment recording error:', error);
          } else {
            // Error('✅ Payment recorded successfully:', data);
          }
        } catch (persistErr) {
          // Error('❌ Payment recording exception:', persistErr);
        }

        // Existing enrollment logic for course payments
        if (course_id && student_id) {
          const { data: existing } = await supabase
            .from('enrollments')
            .select('id, paid_at')
            .eq('student_id', student_id)
            .eq('course_id', course_id)
            .maybeSingle();

          const paidAt = new Date().toISOString();
          const pricePaidCents = amountTotal || 0;

          if (!existing) {
            const { error: enrollError } = await supabase
              .from('enrollments')
              .insert({ student_id, course_id, paid_at: paidAt, price_paid_cents: pricePaidCents });
            if (enrollError) {
              // Enrollment creation error
            }
          } else if (!existing.paid_at) {
            const { error: enrollUpdateError } = await supabase
              .from('enrollments')
              .update({ paid_at: paidAt, price_paid_cents: pricePaidCents, updated_at: new Date().toISOString() })
              .eq('id', existing.id);
            if (enrollUpdateError) {
              // Enrollment update error
            }
          }
        }

        // Handle community subscription payments
        if (type === 'community_subscription' && instructor_id && customerEmail) {
          
          try {
            // Find or create user by email
            let user = null;
            const { data: existingUser } = await supabase
              .from('users')
              .select('id')
              .eq('email', customerEmail)
              .single();

            if (existingUser) {
              user = existingUser;
            } else {
              // User will be created during the signup flow
              // Store pending link in a temporary table or use metadata
              return;
            }

            // Find student record for this user
            const { data: student } = await supabase
              .from('students')
              .select('id, instructor_id')
              .eq('user_id', user.id)
              .single();

            if (student) {
              // Update student to link to this instructor (or confirm existing link)
              if (student.instructor_id !== instructor_id) {
                await supabase
                  .from('students')
                  .update({ instructor_id: instructor_id })
                  .eq('id', student.id);
              }

              // Auto-enroll student ONLY in free courses
              const { data: freeCourses } = await supabase
                .from('courses')
                .select('id')
                .eq('instructor_id', instructor_id)
                .eq('is_published', true)
                .or('type.eq.free,price.eq.0');

              if (freeCourses && freeCourses.length > 0) {
                for (const course of freeCourses) {
                  // Check if already enrolled
                  const { data: existingEnrollment } = await supabase
                    .from('enrollments')
                    .select('id')
                    .eq('student_id', student.id)
                    .eq('course_id', course.id)
                    .maybeSingle();

                  if (!existingEnrollment) {
                    // Enroll in free course (no paid_at timestamp)
                    await supabase
                      .from('enrollments')
                      .insert({
                        student_id: student.id,
                        course_id: course.id,
                        // No paid_at since it's included in community subscription
                      });
                  }
                }
              }

            } else {
              // Error('🎓 COMMUNITY SUBSCRIPTION: No student record found, will be created during signup');
            }
          } catch (error) {
            // Error('🎓 COMMUNITY SUBSCRIPTION: Error processing:', error);
          }
        }
      }
    }

    // Handle subscription events
    if (event.type === 'customer.subscription.created') {
      
      const subscription = event.data.object;
      const { instructor_id, type, plan_id, original_price_cents, has_promo, promo_coupon_id, promo_end_date } = subscription.metadata || {};
      
      
      if (type === 'platform_subscription' && instructor_id) {
        
        try {
          // Determine locked unit amount from subscription items if not in metadata
          const firstItem = Array.isArray(subscription.items?.data) ? subscription.items.data[0] : null;
          const lockedUnitAmount = (original_price_cents && parseInt(original_price_cents) > 0)
            ? parseInt(original_price_cents)
            : (firstItem?.price?.unit_amount ?? null);

          
          // Insert subscription record
          const subscriptionData = {
            instructor_id,
            stripe_subscription_id: subscription.id,
            stripe_customer_id: subscription.customer,
            status: subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
            plan_id: plan_id || null,
            original_price_cents: lockedUnitAmount,
            has_promo: has_promo === 'true' || !!subscription.discount,
            promo_end_date: promo_end_date || null
          };
          
          
          const { error: insertError } = await supabase
            .from('subscriptions')
            .insert(subscriptionData);
            
          if (insertError) {
            // Error('📝 WEBHOOK: Error inserting subscription:', insertError);
          } else {
            // Error('📝 WEBHOOK: Subscription inserted successfully');
          }

          // Extend premium access
          const premiumEndsDate = new Date(subscription.current_period_end * 1000).toISOString();
          
          const { error: updateError } = await supabase
            .from('instructors')
            .update({
              premium_ends: premiumEndsDate
            })
            .eq('id', instructor_id);
            
          if (updateError) {
            // Error('📝 WEBHOOK: Error updating premium_ends:', updateError);
          } else {
            // Error('📝 WEBHOOK: Premium access updated successfully');
          }
        } catch (error) {
          // Error('📝 WEBHOOK: Error handling subscription.created:', error);
        }
      } else {
        // Error('📝 WEBHOOK: Skipping subscription - not a platform subscription or missing instructor_id');
      }
    }

    if (event.type === 'customer.subscription.updated') {
      
      const subscription = event.data.object;
      const { instructor_id, type } = subscription.metadata || {};
      
      
      if (type === 'platform_subscription' && instructor_id) {
        
        try {
          // Update subscription record
          
          const { error: updateError } = await supabase
            .from('subscriptions')
            .update({
              status: subscription.status,
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              cancel_at_period_end: subscription.cancel_at_period_end,
              updated_at: new Date().toISOString()
            })
            .eq('stripe_subscription_id', subscription.id);

          if (updateError) {
            // Error('📝 WEBHOOK: Error updating subscription:', updateError);
          } else {
            // Error('📝 WEBHOOK: Subscription updated successfully');
          }

          // Update premium access if subscription is active
          if (subscription.status === 'active') {
            
            const { error: premiumError } = await supabase
              .from('instructors')
              .update({
                premium_ends: new Date(subscription.current_period_end * 1000).toISOString()
              })
              .eq('id', instructor_id);
              
            if (premiumError) {
              // Error('📝 WEBHOOK: Error updating premium_ends:', premiumError);
            } else {
              // Error('📝 WEBHOOK: Premium access updated successfully');
            }
          } else {
            // Error('📝 WEBHOOK: Subscription is not active, skipping premium_ends update');
          }

        } catch (error) {
          // Error('📝 WEBHOOK: Error handling subscription.updated:', error);
        }
      } else {
        // Error('📝 WEBHOOK: Skipping subscription update - not a platform subscription or missing instructor_id');
      }
    }

    if (event.type === 'customer.subscription.deleted') {
      
      const subscription = event.data.object;
      const { instructor_id, type } = subscription.metadata || {};
      
      
      if (type === 'platform_subscription' && instructor_id) {
        
        try {
          // Mark subscription as canceled
          
          const { error: cancelError } = await supabase
            .from('subscriptions')
            .update({
              status: 'canceled',
              updated_at: new Date().toISOString()
            })
            .eq('stripe_subscription_id', subscription.id);

          if (cancelError) {
            // Error('📝 WEBHOOK: Error marking subscription as canceled:', cancelError);
          } else {
            // Error('📝 WEBHOOK: Subscription marked as canceled successfully');
          }

          // Set premium_ends to current period end (user keeps access until period end)
          
          const { error: premiumError } = await supabase
            .from('instructors')
            .update({
              premium_ends: new Date(subscription.current_period_end * 1000).toISOString()
            })
            .eq('id', instructor_id);

          if (premiumError) {
            // Error('📝 WEBHOOK: Error updating premium_ends:', premiumError);
          } else {
            // Error('📝 WEBHOOK: Premium access updated to period end successfully');
          }

        } catch (error) {
          // Error('📝 WEBHOOK: Error handling subscription.deleted:', error);
        }
      } else {
        // Error('📝 WEBHOOK: Skipping subscription deletion - not a platform subscription or missing instructor_id');
      }
    }

    if (event.type === 'invoice.payment_succeeded') {
      const invoice = event.data.object;
      const subscriptionId = invoice.subscription;
      
      if (subscriptionId) {
        const supabase = getSupabaseClient();
        
        try {
          // Get subscription to find instructor
          const { data: subscription } = await supabase
            .from('subscriptions')
            .select('instructor_id, current_period_end')
            .eq('stripe_subscription_id', subscriptionId)
            .single();

          if (subscription) {
            // Record payment
            await supabase
              .from('payments')
              .insert({
                stripe_session_id: `invoice_${invoice.id}`,
                stripe_payment_intent_id: invoice.payment_intent,
                instructor_id: subscription.instructor_id,
                amount_total: invoice.amount_paid,
                currency: invoice.currency,
                status: 'paid',
                purchased_at: new Date(invoice.created * 1000).toISOString(),
                customer_email: invoice.customer_email,
                type: 'platform_subscription'
              });

            // Extend premium access
            await supabase
              .from('instructors')
              .update({
                premium_ends: subscription.current_period_end
              })
              .eq('id', subscription.instructor_id);

          }
        } catch (error) {
          // Error('Error handling invoice.payment_succeeded:', error);
        }
      }
    }

    if (event.type === 'invoice.payment_failed') {
      const invoice = event.data.object;
      const subscriptionId = invoice.subscription;
      
      if (subscriptionId) {
        const supabase = getSupabaseClient();
        
        try {
          // Update subscription status to past_due
          await supabase
            .from('subscriptions')
            .update({
              status: 'past_due',
              updated_at: new Date().toISOString()
            })
            .eq('stripe_subscription_id', subscriptionId);

        } catch (error) {
          // Error('Error handling invoice.payment_failed:', error);
        }
      }
    }

    res.json({ received: true });
  } catch (error) {
    // Error('Stripe webhook handler error:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
};

// Platform subscription webhook handler (separate from Connect webhook)
export const platformSubscriptionWebhook = async (req, res) => {
  try {
    // Check if Stripe is configured
    if (!stripe) {
      return res.status(500).json({ error: 'Payment system not configured' });
    }

    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_PLATFORM_WEBHOOK_SECRET; // Different secret for platform webhooks
    let event;

    if (!webhookSecret) {
      return res.status(500).json({ error: 'Platform webhook secret not configured' });
    }

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
      // Error('Platform webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle platform subscription events only
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      
      if (session.payment_status === 'paid' && session.metadata?.type === 'platform_subscription') {
        const { instructor_id } = session.metadata;
        
        const supabase = getSupabaseClient();
        const amountTotal = session.amount_total || 0;
        const currency = session.currency || 'usd';
        const sessionId = session.id;
        const paymentIntentId = session.payment_intent || null;
        const customerEmail = session.customer_details?.email || session.customer_email || null;
        const purchasedAt = session.created ? new Date(session.created * 1000).toISOString() : new Date().toISOString();

        // Record payment
        const paymentRow = {
          stripe_session_id: sessionId,
          stripe_payment_intent_id: paymentIntentId,
          instructor_id,
          amount_total: amountTotal,
          currency,
          status: 'paid',
          purchased_at: purchasedAt,
          customer_email: customerEmail,
          type: 'platform_subscription'
        };

        const { error: paymentError } = await supabase
          .from('payments')
          .insert(paymentRow);

        if (paymentError) {
          // Error('Error recording platform payment:', paymentError);
        }
      }
    }

    // Handle subscription events
    if (event.type === 'customer.subscription.created') {
      const subscription = event.data.object;
      const { instructor_id, type, plan_id, original_price_cents, has_promo, promo_coupon_id, promo_end_date } = subscription.metadata || {};
      
      if (type === 'platform_subscription' && instructor_id) {
        const supabase = getSupabaseClient();
        
        try {
          // Insert subscription record
          const subscriptionData = {
            instructor_id,
            stripe_subscription_id: subscription.id,
            stripe_customer_id: subscription.customer,
            status: subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
            plan_id: plan_id || null,
            original_price_cents: original_price_cents ? parseInt(original_price_cents) : null,
            has_promo: has_promo === 'true',
            promo_end_date: promo_end_date || null
          };
          
          const { error: insertError } = await supabase
            .from('subscriptions')
            .insert(subscriptionData);
            
          if (insertError) {
            // Error('Error inserting platform subscription:', insertError);
          }

          // Extend premium access
          const premiumEndsDate = new Date(subscription.current_period_end * 1000).toISOString();
          
          const { error: updateError } = await supabase
            .from('instructors')
            .update({
              premium_ends: premiumEndsDate
            })
            .eq('id', instructor_id);
            
          if (updateError) {
            // Error('Error updating premium_ends:', updateError);
          }
        } catch (error) {
          // Error('Error handling platform subscription.created:', error);
        }
      }
    }

    if (event.type === 'customer.subscription.updated') {
      const subscription = event.data.object;
      const { instructor_id, type } = subscription.metadata || {};
      
      if (type === 'platform_subscription' && instructor_id) {
        const supabase = getSupabaseClient();
        
        try {
          await supabase
            .from('subscriptions')
            .update({
              status: subscription.status,
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              cancel_at_period_end: subscription.cancel_at_period_end,
              updated_at: new Date().toISOString()
            })
            .eq('stripe_subscription_id', subscription.id);

          // Update premium_ends if subscription is still active
          if (subscription.status === 'active') {
            await supabase
              .from('instructors')
              .update({
                premium_ends: new Date(subscription.current_period_end * 1000).toISOString()
              })
              .eq('id', instructor_id);
          }
        } catch (error) {
          // Error('Error handling platform subscription.updated:', error);
        }
      }
    }

    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object;
      const { instructor_id, type } = subscription.metadata || {};
      
      if (type === 'platform_subscription' && instructor_id) {
        const supabase = getSupabaseClient();
        
        try {
          // Mark subscription as canceled
          await supabase
            .from('subscriptions')
            .update({
              status: 'canceled',
              updated_at: new Date().toISOString()
            })
            .eq('stripe_subscription_id', subscription.id);

          // Set premium_ends to current period end (user keeps access until period ends)
          await supabase
            .from('instructors')
            .update({
              premium_ends: new Date(subscription.current_period_end * 1000).toISOString()
            })
            .eq('id', instructor_id);
        } catch (error) {
          // Error('Error handling platform subscription.deleted:', error);
        }
      }
    }

    if (event.type === 'invoice.payment_succeeded' || event.type === 'invoice_payment.paid') {
      let invoice, subscriptionId;
      
      if (event.type === 'invoice_payment.paid') {
        // For invoice_payment.paid, we need to fetch the invoice details
        const invoicePayment = event.data.object;
        
        try {
          const invoiceDetails = await stripe.invoices.retrieve(invoicePayment.invoice);
          invoice = invoiceDetails;
          subscriptionId = invoiceDetails.subscription;
        } catch (error) {
          // Error('Error retrieving invoice details:', error);
          return res.json({ received: true }); // Still return success to Stripe
        }
      } else {
        // For invoice.payment_succeeded, use the invoice directly
        invoice = event.data.object;
        subscriptionId = invoice.subscription;
      }
      
      if (subscriptionId) {
        const supabase = getSupabaseClient();
        
        try {
          // Get subscription details
          const { data: subscription, error: subscriptionError } = await supabase
            .from('subscriptions')
            .select('instructor_id')
            .eq('stripe_subscription_id', subscriptionId)
            .single();

          if (subscription) {
            // Record payment
            await supabase
              .from('payments')
              .insert({
                stripe_payment_intent_id: invoice.payment_intent,
                instructor_id: subscription.instructor_id,
                amount_total: invoice.amount_paid,
                currency: invoice.currency,
                status: 'paid',
                purchased_at: new Date(invoice.created * 1000).toISOString(),
                customer_email: invoice.customer_email,
                type: 'platform_subscription'
              });

            // Extend premium access
            await supabase
              .from('instructors')
              .update({
                premium_ends: new Date(invoice.period_end * 1000).toISOString()
              })
              .eq('id', subscription.instructor_id);
          } else {
            // Try to create the subscription record from the invoice data
            try {
              // Get the subscription details from Stripe
              const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);
              const { instructor_id, type } = stripeSubscription.metadata || {};
              
              if (type === 'platform_subscription' && instructor_id) {
                // Create subscription record
                const subscriptionData = {
                  instructor_id,
                  stripe_subscription_id: stripeSubscription.id,
                  stripe_customer_id: stripeSubscription.customer,
                  status: stripeSubscription.status,
                  current_period_start: new Date(stripeSubscription.current_period_start * 1000).toISOString(),
                  current_period_end: new Date(stripeSubscription.current_period_end * 1000).toISOString(),
                  cancel_at_period_end: stripeSubscription.cancel_at_period_end
                };
                
                const { error: insertError } = await supabase
                  .from('subscriptions')
                  .insert(subscriptionData);
                  
                if (!insertError) {
                  // Now process the payment
                  await supabase
                    .from('payments')
                    .insert({
                      stripe_payment_intent_id: invoice.payment_intent,
                      instructor_id: instructor_id,
                      amount_total: invoice.amount_paid,
                      currency: invoice.currency,
                      status: 'paid',
                      purchased_at: new Date(invoice.created * 1000).toISOString(),
                      customer_email: invoice.customer_email,
                      type: 'platform_subscription'
                    });

                  // Extend premium access
                  await supabase
                    .from('instructors')
                    .update({
                      premium_ends: new Date(invoice.period_end * 1000).toISOString()
                    })
                    .eq('id', instructor_id);
                }
              }
            } catch (error) {
              // Error('Error creating subscription from payment:', error);
            }
          }
        } catch (error) {
          // Error('Error handling platform invoice.payment_succeeded:', error);
        }
      }
    }

    if (event.type === 'invoice.payment_failed') {
      const invoice = event.data.object;
      const subscriptionId = invoice.subscription;
      
      if (subscriptionId) {
        const supabase = getSupabaseClient();
        
        try {
          await supabase
            .from('subscriptions')
            .update({
              status: 'past_due',
              updated_at: new Date().toISOString()
            })
            .eq('stripe_subscription_id', subscriptionId);
        } catch (error) {
          // Error('Error handling platform invoice.payment_failed:', error);
        }
      }
    }

    res.json({ received: true });
  } catch (error) {
    // Error('Platform webhook error:', error);
    res.status(500).json({ error: 'Platform webhook processing failed' });
  }
};

// Export the initialization function
export { initializeStripe };

// Utility: backfill payments from Stripe sessions for current instructor
export const backfillPayments = async (req, res) => {
  try {
    if (!stripe) {
      return res.status(500).json({ error: 'Payment system not configured' });
    }
    const instructor = req.user?.instructors?.[0];
    if (!instructor) {
      return res.status(403).json({ error: 'Instructor access required' });
    }

    const supabase = getSupabaseClient();
    const sinceUnix = Math.floor(Date.now() / 1000) - (30 * 24 * 60 * 60); // last 30 days
    const sessions = await stripe.checkout.sessions.list({
      limit: 100,
      created: { gte: sinceUnix },
    });

    let imported = 0;
    for (const session of sessions.data) {
      if (session.payment_status !== 'paid') continue;
      const meta = session.metadata || {};
      if (!meta.instructor_id || meta.instructor_id !== instructor.id) continue;

      const paymentRow = {
        stripe_session_id: session.id,
        stripe_payment_intent_id: session.payment_intent || null,
        instructor_id: meta.instructor_id || null,
        course_id: meta.course_id || null,
        community_id: meta.community_id || null,
        student_id: meta.student_id || null,
        amount_total: session.amount_total || 0,
        currency: session.currency || 'usd',
        status: 'paid',
        purchased_at: session.created ? new Date(session.created * 1000).toISOString() : new Date().toISOString(),
        customer_email: session.customer_details?.email || session.customer_email || null,
        type: meta.type || (meta.course_id ? 'course_payment' : 'community_subscription'),
      };

      try {
        await supabase.from('payments').upsert(paymentRow, { onConflict: 'stripe_session_id' });
        imported += 1;
      } catch (err) {
        // Error('Backfill upsert failed for session', session.id, err);
      }
    }

    return res.json({ imported });
  } catch (error) {
    // Error('Backfill payments error:', error);
    return res.status(500).json({ error: 'Failed to backfill payments' });
  }
};

