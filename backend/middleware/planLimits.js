import { createClient } from '@supabase/supabase-js';

const getSupabaseClient = () => {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://sguavpabcxeppkgwdssl.supabase.co';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNndWF2cGFiY3hlcHBrZ3dkc3NsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDAxMDkxMCwiZXhwIjoyMDc1NTg2OTEwfQ.o2C2QJYOd-fo74f_qbH3y6omr1xahziI0ongCMF84Zc';
  return createClient(supabaseUrl, supabaseKey);
};

// Plan IDs from the database
const PLAN_IDS = {
  BASIC: '3425044c-2a58-423f-a498-6bf5309c366c',
  PRO: '6e20a522-992f-449a-a6da-102ed32a552d',
};

// Feature restrictions by plan
const PLAN_FEATURES = {
  BASIC: {
    screenRecording: false,
    videoHosting: false,
    meet: false,
    customDomain: false,
    unlimitedMembers: true,
    unlimitedCourses: true,
    communityChat: true,
    contentCalendar: true,
    liveCallsSchedule: true,
    salesFunnel: true,
  },
  PRO: {
    screenRecording: true,
    videoHosting: true,
    meet: true,
    customDomain: true,
    unlimitedMembers: true,
    unlimitedCourses: true,
    communityChat: true,
    contentCalendar: true,
    liveCallsSchedule: true,
    salesFunnel: true,
  }
};

/**
 * Get user's subscription plan
 * @param {string} instructorId - Instructor ID
 * @returns {Promise<Object>} Plan details
 */
async function getUserPlan(instructorId) {
  const supabase = getSupabaseClient();
  
  // Check for active subscription
  const { data: subscriptions, error: subscriptionError } = await supabase
    .from('subscriptions')
    .select('*, subscription_plans(*)')
    .eq('instructor_id', instructorId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1);

  if (subscriptionError) {
    console.error('Error fetching subscription:', subscriptionError);
    return { planId: PLAN_IDS.BASIC, planName: 'Basic', features: PLAN_FEATURES.BASIC };
  }

  const subscription = subscriptions?.[0];
  
  if (subscription?.plan_id) {
    const planId = subscription.plan_id;
    const planName = subscription.subscription_plans?.name || 'Unknown';
    
    // Determine if it's Pro or Basic based on plan_id
    const isPro = planId === PLAN_IDS.PRO;
    
    return {
      planId,
      planName,
      features: isPro ? PLAN_FEATURES.PRO : PLAN_FEATURES.BASIC
    };
  }

  // Default to Basic if no subscription found
  return { planId: PLAN_IDS.BASIC, planName: 'Basic', features: PLAN_FEATURES.BASIC };
}

/**
 * Middleware to check if user has access to a specific feature
 * @param {string} featureName - Feature to check (e.g., 'screenRecording', 'meet')
 */
export const requirePlanFeature = (featureName) => {
  return async (req, res, next) => {
    try {
      // Only apply to instructors
      if (req.user?.role !== 'instructor') {
        return next();
      }

      const instructor = req.user.instructors?.[0];
      
      if (!instructor) {
        return res.status(403).json({ error: 'Instructor not found' });
      }

      // Get user's plan
      const userPlan = await getUserPlan(instructor.id);
      
      // Attach plan info to request for use in controllers
      req.userPlan = userPlan;

      // Check if feature is available in user's plan
      if (!userPlan.features[featureName]) {
        return res.status(403).json({
          error: `This feature requires the Pro plan`,
          feature: featureName,
          currentPlan: userPlan.planName,
          requiredPlan: 'Pro',
          upgradeRequired: true
        });
      }

      next();
    } catch (error) {
      console.error('Error checking plan feature:', error);
      return res.status(500).json({ error: 'Failed to verify plan access' });
    }
  };
};

/**
 * Middleware to attach user's plan information to the request
 * Doesn't block access, just adds plan info
 */
export const attachPlanInfo = async (req, res, next) => {
  try {
    // Only apply to instructors
    if (req.user?.role !== 'instructor') {
      return next();
    }

    const instructor = req.user.instructors?.[0];
    
    if (instructor) {
      const userPlan = await getUserPlan(instructor.id);
      req.userPlan = userPlan;
    }

    next();
  } catch (error) {
    console.error('Error attaching plan info:', error);
    // Don't block request if plan info fails to load
    next();
  }
};

export { PLAN_IDS, PLAN_FEATURES };
