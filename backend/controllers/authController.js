import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Stripe from 'stripe';
import { getSupabaseClient } from '../repositories/supabaseClient.js';

const JWT_SECRET = process.env.JWT_SECRET || '1/rlgbM/WyzO6ZBJtU0SXIPdhfkgz1cFGL6YBmuZ5OnFOnNQk/tmtpGf06vyfeSji2QPH1vhSAk/YjNRWNWP5w==';

// Uses shared Supabase client

// Helper function to generate JWT
const generateToken = (userId, role) => {
  return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: '7d' });
};

// Student Signup
// Remove instructor selection from student signup
export const studentSignup = async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    
    const { firstName, lastName, email, password, instructorSubdomain } = req.body; // Add instructorSubdomain for auto-assignment

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        email,
        password_hash: passwordHash,
        role: 'student',
        first_name: firstName,
        last_name: lastName
      })
      .select()
      .single();

    if (userError) {
      return res.status(400).json({ error: userError.message });
    }

    // Get instructor ID if subdomain is provided
    let instructorId = null;
    if (instructorSubdomain) {
      const { data: instructor } = await supabase
        .from('instructors')
        .select('id')
        .eq('subdomain', instructorSubdomain)
        .single();
      
      if (instructor) {
        instructorId = instructor.id;
      }
    }

    // Create student profile with instructor_id if provided
    const { error: studentError } = await supabase
        .from('students')
        .insert({
            user_id: user.id,
            instructor_id: instructorId // Assign to instructor if subdomain provided
        });

    if (studentError) {
      return res.status(400).json({ error: studentError.message });
    }

    const token = generateToken(user.id, user.role);
    // Also set session cookie for cookie-based auth (dual-mode during migration)
    try {
      const host = String(req.headers['x-forwarded-host'] || req.headers.host || '').toLowerCase();
      const proto = String(req.headers['x-forwarded-proto'] || 'http');
      const hostname = host.split(':')[0];
      const labels = hostname.split('.');
      if (labels[0] === 'www') labels.shift();
      const apex = labels.slice(-2).join('.');
      const isUsecoachly = apex === 'usecoachly.com';
      const isProd = process.env.NODE_ENV === 'production' || proto === 'https';
      const cookieParts = [
        `session=${token}`,
        'Path=/',
        `Max-Age=${7 * 24 * 60 * 60}`,
        'HttpOnly',
      ];
      if (isProd) cookieParts.push('Secure');
      // cross-subdomain cookie only on primary domain
      if (isUsecoachly) cookieParts.push('Domain=.usecoachly.com', 'SameSite=None');
      res.setHeader('Set-Cookie', cookieParts.join('; '));
    } catch {}
    
    res.status(201).json({
      message: 'Student account created successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.first_name,
        lastName: user.last_name
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Instructor Signup - Now just validates and returns signup data for checkout
export const instructorSignup = async (req, res) => {
  try {
    const supabase = getSupabaseClient(); // Create client here
    
    const { firstName, lastName, email, password, businessName } = req.body;
    let { subdomain } = req.body;

    if (!firstName || !lastName || !email || !password || !businessName) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // If subdomain not provided, generate from businessName
    if (!subdomain || typeof subdomain !== 'string' || !subdomain.trim()) {
      const generated = String(businessName)
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      subdomain = generated.slice(0, 30);
    }

    // Validate subdomain format
    if (!/^[a-z0-9-]{3,30}$/.test(subdomain) || /^-|-$/.test(subdomain)) {
      return res.status(400).json({ error: 'Invalid subdomain format' });
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Check if subdomain is available
    const { data: existingSubdomain } = await supabase
      .from('instructors')
      .select('id')
      .eq('subdomain', subdomain)
      .single();

    if (existingSubdomain) {
      return res.status(400).json({ error: 'Subdomain already taken' });
    }

    // Just return the signup data - account will be created after payment
    res.status(200).json({
      message: 'Signup data validated',
      signupData: {
        firstName,
        lastName,
        email,
        password,
        businessName,
        subdomain
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Complete signup after payment (create account and login)
export const completeSignup = async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID required' });
    }

    // Verify payment session with Stripe and get signup data
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session || session.payment_status !== 'paid') {
      return res.status(400).json({ error: 'Payment not completed' });
    }

    // Get signup data from session metadata
    const { signup_data } = session.metadata;
    
    if (!signup_data) {
      return res.status(400).json({ error: 'No pending signup data found' });
    }

    const signupData = JSON.parse(signup_data);

    // Check if account was already created (webhook may have already created it)
    const { data: existingUser } = await supabase
      .from('users')
      .select('id, email, role')
      .eq('email', signupData.email)
      .single();

    let user;
    if (!existingUser) {
      // Create user (should have been created by webhook, but backup in case)
      const passwordHash = await bcrypt.hash(signupData.password, 10);
      
      const { data: newUser, error: userError } = await supabase
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
        return res.status(400).json({ error: userError.message });
      }
      user = newUser;
    } else {
      user = existingUser;
    }

    // Get instructor profile
    const { data: instructor } = await supabase
      .from('instructors')
      .select('id, subdomain, user_id')
      .eq('user_id', user.id)
      .single();

    if (!instructor) {
      return res.status(400).json({ error: 'Instructor profile not found' });
    }

    // Generate JWT token
    const token = generateToken(user.id, user.role);

    // Set HTTP-only cookie for cross-subdomain auth
    const isProd = process.env.NODE_ENV === 'production' || req.headers['x-forwarded-proto'] === 'https';
    const cookieParts = [
      `session=${token}`,
      'Path=/',
      `Max-Age=${7 * 24 * 60 * 60}`,
      'HttpOnly',
    ];
    if (isProd) cookieParts.push('Secure');
    // Cross-subdomain cookie on usecoachly.com
    cookieParts.push('Domain=.usecoachly.com', 'SameSite=None');
    
    res.setHeader('Set-Cookie', cookieParts.join('; '));

    // Return success with token and user data
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.first_name,
        lastName: user.last_name,
        instructor: {
          subdomain: instructor.subdomain
        }
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Login
export const login = async (req, res) => {
  try {
    const supabase = getSupabaseClient(); // Create client here
    
    const { email, password, role } = req.body;
    const tenantSlug = req.tenant?.slug || null;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Get user with associated data
    let query = supabase
      .from('users')
      .select('*, instructors(*), students(*)')
      .eq('email', email);

    if (role) {
      query = query.eq('role', role);
    }

    const { data: user, error } = await query.single();

    if (error || !user) {
      console.error('Login error - user lookup failed:', error);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Enforce tenant match for instructors when a tenant slug (subdomain) is present
    if (tenantSlug && user.role === 'instructor') {
      const userInstructor = (user.instructors && user.instructors[0]) || null;
      const userSubdomain = userInstructor?.subdomain || null;
      if (userSubdomain && userSubdomain !== tenantSlug) {
        // Set cookie for the correct subdomain before returning WRONG_TENANT
        const token = generateToken(user.id, user.role);
        const host = String(req.headers['x-forwarded-host'] || req.headers.host || '').toLowerCase();
        const proto = String(req.headers['x-forwarded-proto'] || 'http');
        const hostname = host.split(':')[0];
        const labels = hostname.split('.');
        if (labels[0] === 'www') labels.shift();
        const apex = labels.slice(-2).join('.');
        const isUsecoachly = apex === 'usecoachly.com';
        const isProd = process.env.NODE_ENV === 'production' || proto === 'https';
        
        // Set cookie for the correct subdomain
        if (isUsecoachly) {
          const correctDomain = `.${apex}`;
          const cookieOptions = [
            `session=${token}`,
            'Path=/',
            `Max-Age=${7 * 24 * 60 * 60}`,
            'HttpOnly',
          ];
          if (isProd) cookieOptions.push('Secure');
          cookieOptions.push('SameSite=None');
          cookieOptions.push(`Domain=${correctDomain}`);
          
          res.setHeader('Set-Cookie', cookieOptions.join('; '));
        }
        
        return res.status(403).json({ error: 'WRONG_TENANT', correctSubdomain: userSubdomain });
      }
    }

    // Add student tenant matching
    if (user.role === 'student') {
      const userStudent = (user.students && user.students[0]) || null;
      const studentInstructorId = userStudent?.instructor_id;
      
      if (studentInstructorId) {
        // Get instructor's subdomain
        const { data: instructorData } = await supabase
          .from('instructors')
          .select('subdomain')
          .eq('id', studentInstructorId)
          .single();
        
        const correctSubdomain = instructorData?.subdomain;
        
        // If student is on wrong instructor's subdomain or apex
        if (correctSubdomain && (!tenantSlug || tenantSlug !== correctSubdomain)) {
          // Set cookie for correct subdomain
          const token = generateToken(user.id, user.role);
          const host = String(req.headers['x-forwarded-host'] || req.headers.host || '').toLowerCase();
          const proto = String(req.headers['x-forwarded-proto'] || 'http');
          const hostname = host.split(':')[0];
          const labels = hostname.split('.');
          if (labels[0] === 'www') labels.shift();
          const apex = labels.slice(-2).join('.');
          const isUsecoachly = apex === 'usecoachly.com';
          const isProd = process.env.NODE_ENV === 'production' || proto === 'https';

          // Set cookie for the correct subdomain
          if (isUsecoachly) {
            const correctDomain = `.${apex}`;
            const cookieOptions = [
              `session=${token}`,
              'Path=/',
              `Max-Age=${7 * 24 * 60 * 60}`,
              'HttpOnly',
            ];
            if (isProd) cookieOptions.push('Secure');
            cookieOptions.push('SameSite=None');
            cookieOptions.push(`Domain=${correctDomain}`);

            res.setHeader('Set-Cookie', cookieOptions.join('; '));
          }

          return res.status(200).json({ 
            message: 'Login successful', 
            user: user,
            redirectTo: correctSubdomain // Signal frontend to redirect
          });
        }
      }
    }

    const token = generateToken(user.id, user.role);
    // Also set session cookie for cookie-based auth (dual-mode during migration)
    try {
      const host = String(req.headers['x-forwarded-host'] || req.headers.host || '').toLowerCase();
      const proto = String(req.headers['x-forwarded-proto'] || 'http');
      const hostname = host.split(':')[0];
      const labels = hostname.split('.');
      if (labels[0] === 'www') labels.shift();
      const apex = labels.slice(-2).join('.');
      const isUsecoachly = apex === 'usecoachly.com';
      const isProd = process.env.NODE_ENV === 'production' || proto === 'https';
      
      // Set cookies for both domains
      const cookies = [];
      
      // Cookie for usecoachly.com domain (for frontend)
      if (isUsecoachly) {
        const usecoachlyCookie = [
          `session=${token}`,
          'Path=/',
          `Max-Age=${7 * 24 * 60 * 60}`,
          'HttpOnly',
        ];
        if (isProd) usecoachlyCookie.push('Secure');
        usecoachlyCookie.push('Domain=.usecoachly.com', 'SameSite=None');
        cookies.push(usecoachlyCookie.join('; '));
      }
      
      // Cookie for backend domain (for API requests)
      const backendCookie = [
        `session=${token}`,
        'Path=/',
        `Max-Age=${7 * 24 * 60 * 60}`,
        'HttpOnly',
      ];
      if (isProd) backendCookie.push('Secure');
      backendCookie.push('SameSite=None');
      cookies.push(backendCookie.join('; '));
      
      res.setHeader('Set-Cookie', cookies);
    } catch {}
    
    // If user is a student, get their instructor's premium data
    let studentData = user.students?.[0] || null;
    if (studentData && studentData.instructor_id) {
      // First check for active subscription
      const { data: subscriptions } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('instructor_id', studentData.instructor_id)
        .eq('status', 'active')
        .order('cancel_at_period_end', { ascending: true }) // Non-cancelled first
        .order('created_at', { ascending: false })
        .limit(1);

      const subscription = subscriptions?.[0] || null;

      if (subscription) {
        // Use subscription data
        studentData = {
          ...studentData,
          instructor_premium_starts: subscription.current_period_start,
          instructor_premium_ends: subscription.current_period_end,
          instructor_has_active_subscription: true,
          instructor_cancel_at_period_end: subscription.cancel_at_period_end
        };
      } else {
        // Fallback to old premium_ends field
        const { data: instructorData } = await supabase
          .from('instructors')
          .select('premium_starts, premium_ends')
          .eq('id', studentData.instructor_id)
          .single();
        
        if (instructorData) {
          studentData = {
            ...studentData,
            instructor_premium_starts: instructorData.premium_starts,
            instructor_premium_ends: instructorData.premium_ends,
            instructor_has_active_subscription: false,
            instructor_cancel_at_period_end: false
          };
        }
      }
    }
    
    res.json({
    message: 'Login successful',
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.first_name,
      lastName: user.last_name,
      profilePictureUrl: user.profile_picture_url,
      phone: user.phone,
      location: user.location,
      bio: user.bio,
    instructor: user.instructors?.[0] ? {
      ...user.instructors[0],
      premium_starts: user.instructors[0].premium_starts,
      premium_ends: user.instructors[0].premium_ends
    } : null,
    student: studentData
    }
  });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Logout: clear session cookie (both apex-wide and host cookie for dev)
export const logout = async (req, res) => {
  try {
    const host = String(req.headers['x-forwarded-host'] || req.headers.host || '').toLowerCase();
    const proto = String(req.headers['x-forwarded-proto'] || 'http');
    const hostname = host.split(':')[0];
    const labels = hostname.split('.');
    if (labels[0] === 'www') labels.shift();
    const apex = labels.slice(-2).join('.');
    const isUsecoachly = apex === 'usecoachly.com';
    const isProd = process.env.NODE_ENV === 'production' || proto === 'https';

    const expiredBase = ['session=; Path=/; Max-Age=0; HttpOnly'];
    if (isProd) expiredBase.push('Secure');

    const cookies = [];
    
    // Clear ALL possible cookies to ensure complete logout
    // 1. Clear host-specific cookie (no Domain)
    cookies.push(expiredBase.join('; '));
    
    // 2. Clear .usecoachly.com domain cookie (for all subdomains)
    if (isUsecoachly) {
      cookies.push(expiredBase.concat(['Domain=.usecoachly.com', 'SameSite=None']).join('; '));
    }
    
    // 3. Clear any potential backend domain cookies
    cookies.push(expiredBase.concat(['Domain=.onrender.com', 'SameSite=None']).join('; '));
    
    // 4. Clear any potential vercel domain cookies
    cookies.push(expiredBase.concat(['Domain=.vercel.app', 'SameSite=None']).join('; '));
    
    res.setHeader('Set-Cookie', cookies);

    return res.json({ success: true, apex: isUsecoachly ? 'usecoachly.com' : apex });
  } catch (e) {
    return res.json({ success: true });
  }
};

// Get current user
export const getCurrentUser = async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    
    // If user is a student, get their instructor's premium data
    let studentData = req.user.students?.[0] || null;
    if (studentData && studentData.instructor_id) {
      // First check for active subscription
      const { data: subscriptions } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('instructor_id', studentData.instructor_id)
        .eq('status', 'active')
        .order('cancel_at_period_end', { ascending: true }) // Non-cancelled first
        .order('created_at', { ascending: false })
        .limit(1);

      const subscription = subscriptions?.[0] || null;

      if (subscription) {
        // Use subscription data
        studentData = {
          ...studentData,
          instructor_premium_starts: subscription.current_period_start,
          instructor_premium_ends: subscription.current_period_end,
          instructor_has_active_subscription: true,
          instructor_cancel_at_period_end: subscription.cancel_at_period_end
        };
      } else {
        // Fallback to old premium_ends field
        const { data: instructorData } = await supabase
          .from('instructors')
          .select('premium_starts, premium_ends')
          .eq('id', studentData.instructor_id)
          .single();
        
        if (instructorData) {
          studentData = {
            ...studentData,
            instructor_premium_starts: instructorData.premium_starts,
            instructor_premium_ends: instructorData.premium_ends,
            instructor_has_active_subscription: false,
            instructor_cancel_at_period_end: false
          };
        }
      }
    }
    
    res.json({
      user: {
        id: req.user.id,
        email: req.user.email,
        role: req.user.role,
        firstName: req.user.first_name,
        lastName: req.user.last_name,
        profilePictureUrl: req.user.profile_picture_url,
        phone: req.user.phone,
        location: req.user.location,
        bio: req.user.bio,
        instructor: req.user.instructors?.[0] ? {
          ...req.user.instructors[0],
          premium_starts: req.user.instructors[0].premium_starts,
          premium_ends: req.user.instructors[0].premium_ends
        } : null,
        student: studentData
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Check subdomain availability
export const checkSubdomain = async (req, res) => {
  try {
    const supabase = getSupabaseClient(); // Create client here
    const { subdomain } = req.params;
    
    const { data } = await supabase
      .from('instructors')
      .select('id')
      .eq('subdomain', subdomain)
      .single();

    res.json({ available: !data });
  } catch (error) {
    res.status(500).json({ error: 'Error checking subdomain' });
  }
};

// Legacy route for backward compatibility
export const checkSubdirectory = async (req, res) => {
  try {
    const supabase = getSupabaseClient(); // Create client here
    const { subdirectory } = req.params;
    
    const { data } = await supabase
      .from('instructors')
      .select('id')
      .eq('subdomain', subdirectory)
      .single();

    res.json({ available: !data });
  } catch (error) {
    res.status(500).json({ error: 'Error checking subdomain' });
  }
};

// Get instructors list for student signup
export const getInstructors = async (req, res) => {
  try {
    const supabase = getSupabaseClient(); // Create client here
    
    const { data: instructors, error } = await supabase
      .from('instructors')
      .select('id, business_name')
      .order('business_name');

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json(instructors);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching instructors' });
  }
};