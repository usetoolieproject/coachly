import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';

const JWT_SECRET = process.env.JWT_SECRET || '1/rlgbM/WyzO6ZBJtU0SXIPdhfkgz1cFGL6YBmuZ5OnFOnNQk/tmtpGf06vyfeSji2QPH1vhSAk/YjNRWNWP5w==';

// Helper function to create supabase client - FIXED TO MATCH CONTROLLERS
const getSupabaseClient = () => {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://sguavpabcxeppkgwdssl.supabase.co';
  // Use SERVICE_ROLE_KEY like the controllers do
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNndWF2cGFiY3hlcHBrZ3dkc3NsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDAxMDkxMCwiZXhwIjoyMDc1NTg2OTEwfQ.o2C2QJYOd-fo74f_qbH3y6omr1xahziI0ongCMF84Zc';
  return createClient(supabaseUrl, supabaseKey);
};

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    let token = authHeader && authHeader.split(' ')[1];
    // Allow cookie-based session
    if (!token && req.headers.cookie) {
      try {
        const raw = String(req.headers.cookie);
        const parts = raw.split(';').map(s => s.trim());
        for (const p of parts) {
          if (p.startsWith('session=')) {
            token = p.substring('session='.length);
            break;
          }
        }
      } catch (e) {
        console.error('[auth] Error parsing cookie:', e);
      }
    }

    if (!token) {
      console.error('[auth] No token found. Headers:', {
        authorization: req.headers['authorization'],
        cookie: req.headers.cookie,
        path: req.path
      });
      return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Get user from database
    const supabase = getSupabaseClient();
    const { data: user, error } = await supabase
      .from('users')
      .select('*, instructors(*), students(*)')
      .eq('id', decoded.userId)
      .single();

    if (error || !user) {
      return res.status(403).json({ error: 'Invalid token or user not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};

// Check if instructor's premium access is still valid
export const checkInstructorPremium = async (req, res, next) => {
  // Only apply to instructors
  if (req.user.role !== 'instructor') {
    return next();
  }

  const instructor = req.user.instructors?.[0];
  
  // If no instructor found, block access
  if (!instructor) {
    return res.status(403).json({ error: 'Instructor not found' });
  }

  // Check if instructor has an active subscription
  const supabase = getSupabaseClient();
  const { data: subscriptions, error: subscriptionError } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('instructor_id', instructor.id)
    .eq('status', 'active')
    .order('cancel_at_period_end', { ascending: true }) // Non-cancelled first
    .order('created_at', { ascending: false })
    .limit(1);

  const subscription = subscriptions?.[0] || null;

  // If there's an active subscription, allow access regardless of premium_ends
  if (subscription) {
    req.premiumStatus = {
      isActive: true,
      premiumEnds: subscription.current_period_end,
      daysRemaining: Math.ceil((new Date(subscription.current_period_end) - new Date()) / (1000 * 60 * 60 * 24)),
      hasActiveSubscription: true
    };
    return next();
  }
  
  // For Connect endpoints, allow access even without premium (payouts setup)
  const isConnectEndpoint = req.path.includes('/connect/');
  
  if (isConnectEndpoint) {
    req.premiumStatus = {
      isActive: false,
      premiumEnds: null,
      daysRemaining: 0,
      hasActiveSubscription: false
    };
    return next();
  }

  // If no active subscription, check premium_ends field (for lifetime/one-time payment users)
  if (!instructor.premium_ends) {
    return res.status(403).json({ 
      error: 'Premium access required',
      premiumExpired: true
    });
  }

  const now = new Date();
  const premiumEnds = new Date(instructor.premium_ends);
  
  // If premium has expired, block access
  if (now > premiumEnds) {
    return res.status(403).json({ 
      error: 'Premium access expired',
      premiumExpired: true,
      premiumEnds: instructor.premium_ends
    });
  }

  // Add premium status to request for frontend use
  req.premiumStatus = {
    isActive: true,
    premiumEnds: instructor.premium_ends,
    daysRemaining: Math.ceil((premiumEnds - now) / (1000 * 60 * 60 * 24)),
    hasActiveSubscription: false
  };

  next();
};