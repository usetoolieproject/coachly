import express from 'express';
import multer from 'multer';
import rateLimit from 'express-rate-limit';
import { 
  studentSignup, 
  instructorSignup, 
  login, 
  getCurrentUser, 
  checkSubdirectory,
  checkSubdomain, 
  getInstructors,
  logout,
  completeSignup
} from './controllers/authController.js';
import {
  getSocialPosts,
  createSocialPost,
  updateSocialPost,
  deleteSocialPost
} from './controllers/socialCalendarController.js';
import {
  getCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  toggleCoursePublication,
  getCourseContent,
  createModule,
  updateModule,
  deleteModule,
  createLesson,
  updateLesson,
  deleteLesson,
  updateCourseOrder,  // NEW
  duplicateCourse,     // NEW
} from './controllers/courseController.js';
import {
  getAboutPage,
  updateAboutPage,
  createIntroContent,
  updateIntroContent,
  deleteIntroContent,
  getPublicAboutPage,
  joinCommunity,
  uploadBanner
} from './controllers/aboutPageController.js';
import { 
  getStudentCommunity,
  joinCommunity as joinCommunityStudent,
  getAvailableCourses,
  getEnrolledCourses,
  enrollInCourse,
  getStudentCourseContent,
  updateLessonProgress,
  getAllCoursesWithProgress, 
  getStudentCourseContentOpen,
  updateLessonProgressOpen,
  markCourseCompleted
} from './controllers/studentCourseController.js';
import { getDashboardAnalytics, getRevenueTimeseries as getDashboardRevenueTimeseries } from './controllers/dashboardController.js';
import { getStudentDashboardStats } from './controllers/dashboardController.js';
import { getAdminCustomerStats, getAdminRevenueTimeseries, getAdminEducatorsTimeseries, getAdminStudentsTimeseries, listEducators } from './controllers/adminDashboardController.js';
import {
  getCommunityPosts,
  createPost,
  updatePost,
  deletePost,
  togglePinPost,
  toggleLikePost,
  createComment,
  updateComment,
  deleteComment,
  toggleLikeComment,
  uploadMedia,
  getCommunityStats
} from './controllers/communityController.js';
import {
  getInstructorStudents,
  getStudentDetails,
  createStudent,
  deleteStudent
} from './controllers/instructorStudentController.js';
import { 
  getProfile,
  updateProfile,
  uploadProfilePicture,
  changePassword,
  changeEmail,
  updateInstructorSubdomain,
  getSidebarPreferences,
  updateSidebarPreferences
} from './controllers/profileController.js';
import {
  getAdminProfile,
  updateAdminProfile,
  updateAdminPassword,
  uploadAdminProfilePicture
} from './controllers/adminProfileController.js';
import {
  getInstructorCalls,
  createCall,
  updateCall,
  deleteCall,
  getStudentCalls,
} from './controllers/liveCallsController.js';
import { createClient } from '@supabase/supabase-js';
import { authenticateToken, requireRole, checkInstructorPremium } from './middleware/auth.js';
import { requirePlanFeature } from './middleware/planLimits.js';
import { requestPasswordReset, resetPassword } from './controllers/passwordResetController.js';
import { createCheckoutSession, createCommunityCheckoutSession, stripeWebhook, platformSubscriptionWebhook, backfillPayments, confirmCheckoutSession } from './controllers/billingController.js';
import { 
  createSubscriptionCheckout, 
  getSubscriptionStatus, 
  createSubscriptionPortal,
  backfillLockedPrices,
  createUpgradeCheckout
} from './controllers/subscriptionController.js';
import { createPublicCheckout } from './controllers/subscriptionControllerPublic.js';
import { 
  getSubscriptionPlans,
  getActivePlans,
  createSubscriptionPlan,
  updateSubscriptionPlan,
  togglePromo,
  toggleVisibility
} from './controllers/subscriptionPlansController.js';
import { 
  saveWebsiteConfiguration, 
  loadWebsiteConfiguration, 
  deleteWebsiteConfiguration,
  getPublicWebsiteConfiguration,
  loadThemeById,
  loadThemeDefault
} from './controllers/websiteController.js';
import {
  listPromoCodes,
  generatePromoCodes,
  deactivatePromoCode,
  togglePromoCode,
  updatePromoCode,
  deletePromoCode,
  validatePromoCode,
  redeemPromoCode,
  getMyPromo,
  removeMyPromo,
} from './controllers/promoCodesController.js';
import { getConnectStatus, startOnboarding, resumeOnboarding, disconnectPayouts, getConnectedBalance, getRevenueTimeseries as getConnectRevenueTimeseries } from './controllers/connectController.js';
import {
  uploadVideo,
  getVideos,
  getStorageStats,
  deleteVideo,
  bulkDeleteVideos
} from './controllers/videoLibraryController.js';

// Configure multer for memory storage - supports multiple files
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit per file
    files: 5 // Maximum 5 files at once
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Configure multer for video uploads (larger file size limit)
const videoUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 2 * 1024 * 1024 * 1024, // 2GB limit per video
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed'));
    }
  }
});

import meetingRoutes from './routes/meetings.js';

const router = express.Router();

const getSupabaseClient = () => {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://sguavpabcxeppkgwdssl.supabase.co';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNndWF2cGFiY3hlcHBrZ3dkc3NsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDAxMDkxMCwiZXhwIjoyMDc1NTg2OTEwfQ.o2C2QJYOd-fo74f_qbH3y6omr1xahziI0ongCMF84Zc';
  return createClient(supabaseUrl, supabaseKey);
};

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 auth requests per windowMs
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
})

// --- ROUTES TEMPORARILY COMMENTED OUT FOR DEBUGGING ---
router.post('/auth/signup/student', authLimiter, studentSignup);
router.post('/auth/signup/instructor', authLimiter, instructorSignup);
router.post('/auth/complete-signup', completeSignup);
router.post('/auth/login', authLimiter, login);
router.get('/auth/me', authenticateToken, getCurrentUser);
router.post('/auth/logout', logout);
router.get('/auth/check-subdomain/:subdomain', checkSubdomain);
router.get('/auth/check-subdirectory/:subdirectory', checkSubdirectory); // Legacy route
router.get('/auth/instructors', getInstructors);

// Password Reset routes
router.post('/auth/forgot-password', authLimiter, requestPasswordReset);
router.post('/auth/reset-password', authLimiter, resetPassword);
console.log('✅ Password reset routes registered');

router.get('/courses', authenticateToken, requireRole(['instructor']), checkInstructorPremium, getCourses);
router.post('/courses', authenticateToken, requireRole(['instructor']), checkInstructorPremium, createCourse);
router.get('/courses/:courseId', authenticateToken, requireRole(['instructor']), checkInstructorPremium, getCourseContent);
router.put('/courses/:courseId', authenticateToken, requireRole(['instructor']), checkInstructorPremium, updateCourse);
router.delete('/courses/:courseId', authenticateToken, requireRole(['instructor']), checkInstructorPremium, deleteCourse);
router.patch('/courses/:courseId/toggle-publication', authenticateToken, requireRole(['instructor']), checkInstructorPremium, toggleCoursePublication);

router.put('/courses/:courseId/order', authenticateToken, requireRole(['instructor']), checkInstructorPremium, updateCourseOrder);
router.post('/courses/:courseId/duplicate', authenticateToken, requireRole(['instructor']), checkInstructorPremium, duplicateCourse);

router.post('/courses/:courseId/modules', authenticateToken, requireRole(['instructor']), checkInstructorPremium, createModule);
router.put('/modules/:moduleId', authenticateToken, requireRole(['instructor']), checkInstructorPremium, updateModule);
router.delete('/modules/:moduleId', authenticateToken, requireRole(['instructor']), checkInstructorPremium, deleteModule);

router.post('/modules/:moduleId/lessons', authenticateToken, requireRole(['instructor']), checkInstructorPremium, createLesson);
router.put('/lessons/:lessonId', authenticateToken, requireRole(['instructor']), checkInstructorPremium, updateLesson);
router.delete('/lessons/:lessonId', authenticateToken, requireRole(['instructor']), checkInstructorPremium, deleteLesson);

// backend/router.js - ADD these new routes after your existing lesson routes:

router.post('/modules/:moduleId/duplicate', authenticateToken, requireRole(['instructor']), checkInstructorPremium, async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    const { moduleId } = req.params;

    // Get the original module with lessons
    const { data: originalModule, error: moduleError } = await supabase
      .from('modules')
      .select(`
        *,
        courses!inner(instructor_id),
        lessons (*)
      `)
      .eq('id', moduleId)
      .single();

    if (moduleError || !originalModule || originalModule.courses.instructor_id !== req.user.instructors[0].id) {
      return res.status(404).json({ error: 'Module not found or unauthorized' });
    }

    // Get next order index
    const { count } = await supabase
      .from('modules')
      .select('*', { count: 'exact', head: true })
      .eq('course_id', originalModule.course_id);

    // Create duplicate module
    const { data: duplicatedModule, error: duplicateError } = await supabase
      .from('modules')
      .insert({
        course_id: originalModule.course_id,
        title: `${originalModule.title} (Copy)`,
        description: originalModule.description,
        order_index: count || 0
      })
      .select()
      .single();

    if (duplicateError) {
      return res.status(400).json({ error: duplicateError.message });
    }

    // Duplicate lessons
    if (originalModule.lessons && originalModule.lessons.length > 0) {
      for (const lesson of originalModule.lessons) {
        await supabase
          .from('lessons')
          .insert({
            module_id: duplicatedModule.id,
            title: lesson.title,
            description: lesson.description,
            video_url: lesson.video_url,
            resource_files: lesson.resource_files,
            additional_content: lesson.additional_content,
            allow_preview: lesson.allow_preview,
            order_index: lesson.order_index
          });
      }
    }

    res.status(201).json(duplicatedModule);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/lessons/:lessonId/duplicate', authenticateToken, requireRole(['instructor']), checkInstructorPremium, async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    const { lessonId } = req.params;

    const { data: originalLesson, error: lessonError } = await supabase
      .from('lessons')
      .select(`
        *,
        modules!inner(
          courses!inner(instructor_id)
        )
      `)
      .eq('id', lessonId)
      .single();

    if (lessonError || !originalLesson || originalLesson.modules.courses.instructor_id !== req.user.instructors[0].id) {
      return res.status(404).json({ error: 'Lesson not found or unauthorized' });
    }

    const { count } = await supabase
      .from('lessons')
      .select('*', { count: 'exact', head: true })
      .eq('module_id', originalLesson.module_id);

    const { data: duplicatedLesson, error: duplicateError } = await supabase
      .from('lessons')
      .insert({
        module_id: originalLesson.module_id,
        title: `${originalLesson.title} (Copy)`,
        description: originalLesson.description,
        video_url: originalLesson.video_url,
        resource_files: originalLesson.resource_files,
        additional_content: originalLesson.additional_content,
        allow_preview: originalLesson.allow_preview,
        order_index: count || 0
      })
      .select()
      .single();

    if (duplicateError) {
      return res.status(400).json({ error: duplicateError.message });
    }

    res.status(201).json(duplicatedLesson);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/lessons/:lessonId/move', authenticateToken, requireRole(['instructor']), checkInstructorPremium, async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    const { lessonId } = req.params;
    const { newModuleId } = req.body;

    // Verify lesson belongs to instructor
    const { data: lesson, error: lessonError } = await supabase
      .from('lessons')
      .select(`
        id,
        modules!inner(
          courses!inner(instructor_id)
        )
      `)
      .eq('id', lessonId)
      .single();

    if (lessonError || !lesson || lesson.modules.courses.instructor_id !== req.user.instructors[0].id) {
      return res.status(404).json({ error: 'Lesson not found or unauthorized' });
    }

    // Verify new module belongs to same instructor
    const { data: newModule, error: moduleError } = await supabase
      .from('modules')
      .select(`
        id,
        courses!inner(instructor_id)
      `)
      .eq('id', newModuleId)
      .single();

    if (moduleError || !newModule || newModule.courses.instructor_id !== req.user.instructors[0].id) {
      return res.status(404).json({ error: 'Target module not found or unauthorized' });
    }

    const { count } = await supabase
      .from('lessons')
      .select('*', { count: 'exact', head: true })
      .eq('module_id', newModuleId);

    const { data: updatedLesson, error: updateError } = await supabase
      .from('lessons')
      .update({
        module_id: newModuleId,
        order_index: count || 0,
        updated_at: new Date().toISOString()
      })
      .eq('id', lessonId)
      .select()
      .single();

    if (updateError) {
      return res.status(400).json({ error: updateError.message });
    }

    res.json(updatedLesson);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Community routes (instructor and students) - UPDATE THIS SECTION
router.get('/community/posts', authenticateToken, getCommunityPosts);
router.post('/community/posts', authenticateToken, createPost);
router.post('/community/upload', authenticateToken, upload.array('files', 5), uploadMedia);
router.put('/community/posts/:postId', authenticateToken, updatePost);
router.delete('/community/posts/:postId', authenticateToken, deletePost);
router.patch('/community/posts/:postId/pin', authenticateToken, requireRole(['instructor']), checkInstructorPremium, togglePinPost);
router.post('/community/posts/:postId/like', authenticateToken, toggleLikePost);
router.post('/community/posts/:postId/comments', authenticateToken, createComment);
router.put('/community/comments/:commentId', authenticateToken, updateComment);
router.delete('/community/comments/:commentId', authenticateToken, deleteComment);
router.post('/community/comments/:commentId/like', authenticateToken, toggleLikeComment);
router.get('/community/stats', authenticateToken, requireRole(['instructor']), checkInstructorPremium, getCommunityStats);
router.get('/instructor/community-stats', authenticateToken, requireRole(['instructor']), checkInstructorPremium, getCommunityStats);

// Student Community routes (simplified to single community)
router.get('/student/community', authenticateToken, requireRole(['student']), getStudentCommunity);
router.post('/student/community/join/:subdirectory', authenticateToken, requireRole(['student']), joinCommunityStudent);

// Student Course routes - UPDATE THESE
router.get('/student/courses/all-with-progress', authenticateToken, requireRole(['student']), getAllCoursesWithProgress);
router.get('/student/courses/available', authenticateToken, requireRole(['student']), getAvailableCourses);
router.get('/student/courses/enrolled', authenticateToken, requireRole(['student']), getEnrolledCourses);
router.post('/student/courses/:courseId/enroll', authenticateToken, requireRole(['student']), enrollInCourse);
router.get('/student/courses/:courseId/content-open', authenticateToken, requireRole(['student']), getStudentCourseContentOpen);
router.get('/student/courses/:courseId/content', authenticateToken, requireRole(['student']), getStudentCourseContent);
router.put('/student/lessons/:lessonId/progress-open', authenticateToken, requireRole(['student']), updateLessonProgressOpen);
router.put('/student/lessons/:lessonId/progress', authenticateToken, requireRole(['student']), updateLessonProgress);
router.post('/student/courses/:courseId/complete', authenticateToken, requireRole(['student']), markCourseCompleted);

// Billing routes (Stripe)
router.post('/billing/checkout', authenticateToken, requireRole(['student']), createCheckoutSession);
router.get('/billing/confirm-session', authenticateToken, requireRole(['student']), confirmCheckoutSession);
router.post('/billing/community-checkout', createCommunityCheckoutSession);
router.post('/billing/webhook', stripeWebhook);
// Alias path used by some preconfigured dashboards: route to same handler
router.post('/webhooks/stripe', stripeWebhook);
// Platform subscription webhook (separate from Connect webhook)
router.post('/subscription/webhook', platformSubscriptionWebhook);
router.post('/billing/backfill', authenticateToken, requireRole(['instructor']), checkInstructorPremium, backfillPayments);

// Subscription routes (Platform billing)
router.post('/subscription/create-checkout', authenticateToken, requireRole(['instructor']), createSubscriptionCheckout);
router.post('/subscriptions/checkout/public', createPublicCheckout); // Public endpoint for signup flow
router.get('/subscription/status', authenticateToken, requireRole(['instructor']), getSubscriptionStatus);
router.post('/subscription/portal', authenticateToken, requireRole(['instructor']), createSubscriptionPortal);
router.post('/subscription/upgrade', authenticateToken, requireRole(['instructor']), createUpgradeCheckout);
router.post('/subscription/backfill-locked-prices', authenticateToken, requireRole(['instructor']), backfillLockedPrices);

// Subscription Plans routes (Admin)
router.get('/admin/subscription-plans', authenticateToken, requireRole(['admin']), getSubscriptionPlans);
router.post('/admin/subscription-plans', authenticateToken, requireRole(['admin']), createSubscriptionPlan);
router.put('/admin/subscription-plans/:id', authenticateToken, requireRole(['admin']), updateSubscriptionPlan);
router.post('/admin/subscription-plans/:id/toggle-promo', authenticateToken, requireRole(['admin']), togglePromo);
router.post('/admin/subscription-plans/:id/toggle-visibility', authenticateToken, requireRole(['admin']), toggleVisibility);

// Promo Codes routes (Admin)
router.get('/admin/promo-codes', authenticateToken, requireRole(['admin']), listPromoCodes);
router.post('/admin/promo-codes/generate', authenticateToken, requireRole(['admin']), generatePromoCodes);
router.post('/admin/promo-codes/:id/deactivate', authenticateToken, requireRole(['admin']), deactivatePromoCode);
router.post('/admin/promo-codes/:id/toggle', authenticateToken, requireRole(['admin']), togglePromoCode);
router.put('/admin/promo-codes/:id', authenticateToken, requireRole(['admin']), updatePromoCode);
router.delete('/admin/promo-codes/:id', authenticateToken, requireRole(['admin']), deletePromoCode);

// Promo Codes routes (Instructor – for later wiring)
router.post('/promo-codes/validate', authenticateToken, validatePromoCode);
router.post('/promo-codes/redeem', authenticateToken, redeemPromoCode);
router.get('/promo-codes/me', authenticateToken, requireRole(['instructor']), getMyPromo);
router.delete('/promo-codes/me', authenticateToken, requireRole(['instructor']), removeMyPromo);

// Subscription Plans routes (Public - for signup page)
router.get('/subscription-plans/active', getActivePlans);

// Public admin stats (for initial integration; secure later)
router.get('/public/admin/customer-stats', getAdminCustomerStats);
router.get('/public/admin/overview/revenue-timeseries', getAdminRevenueTimeseries);
router.get('/public/admin/overview/educators-timeseries', getAdminEducatorsTimeseries);
router.get('/public/admin/overview/students-timeseries', getAdminStudentsTimeseries);
router.get('/public/admin/overview/educators', listEducators);

// Stripe Connect (Instructor payouts)
router.get('/connect/status', authenticateToken, requireRole(['instructor']), checkInstructorPremium, getConnectStatus);
router.post('/connect/onboard', authenticateToken, requireRole(['instructor']), checkInstructorPremium, startOnboarding);
router.post('/connect/relink', authenticateToken, requireRole(['instructor']), checkInstructorPremium, resumeOnboarding);
router.post('/connect/disconnect', authenticateToken, requireRole(['instructor']), checkInstructorPremium, disconnectPayouts);
router.get('/connect/balance', authenticateToken, requireRole(['instructor']), checkInstructorPremium, getConnectedBalance);
router.get('/connect/revenue-timeseries', authenticateToken, requireRole(['instructor']), checkInstructorPremium, getConnectRevenueTimeseries);

// Instructor about page routes (protected, premium required)
router.get('/instructor/about-page', authenticateToken, requireRole(['instructor']), checkInstructorPremium, getAboutPage);
router.put('/instructor/about-page', authenticateToken, requireRole(['instructor']), checkInstructorPremium, updateAboutPage);
router.post('/instructor/about-page/intro-content', authenticateToken, requireRole(['instructor']), checkInstructorPremium, createIntroContent);
router.put('/instructor/about-page/intro-content/:contentId', authenticateToken, requireRole(['instructor']), checkInstructorPremium, updateIntroContent);
router.delete('/instructor/about-page/intro-content/:contentId', authenticateToken, requireRole(['instructor']), checkInstructorPremium, deleteIntroContent);
router.post('/instructor/about-page/upload-banner', authenticateToken, requireRole(['instructor']), checkInstructorPremium, uploadBanner);

router.get('/instructor/students', authenticateToken, requireRole(['instructor']), checkInstructorPremium, getInstructorStudents);
router.post('/instructor/students', authenticateToken, requireRole(['instructor']), checkInstructorPremium, createStudent);
router.get('/instructor/students/:studentId', authenticateToken, requireRole(['instructor']), checkInstructorPremium, getStudentDetails);
router.delete('/instructor/students/:studentId', authenticateToken, requireRole(['instructor']), checkInstructorPremium, deleteStudent);

router.get('/instructor/dashboard-analytics', authenticateToken, requireRole(['instructor']), checkInstructorPremium, getDashboardAnalytics);
router.get('/instructor/revenue-timeseries', authenticateToken, requireRole(['instructor']), checkInstructorPremium, getDashboardRevenueTimeseries);
router.get('/student/dashboard/stats', authenticateToken, requireRole(['student']), getStudentDashboardStats);

// Instructor Live Calls routes (premium required)
router.get('/instructor/live-calls', authenticateToken, requireRole(['instructor']), checkInstructorPremium, getInstructorCalls);
router.post('/instructor/live-calls', authenticateToken, requireRole(['instructor']), checkInstructorPremium, createCall);
router.put('/instructor/live-calls/:callId', authenticateToken, requireRole(['instructor']), checkInstructorPremium, updateCall);
router.delete('/instructor/live-calls/:callId', authenticateToken, requireRole(['instructor']), checkInstructorPremium, deleteCall);

// NEW: Student Live Calls routes
router.get('/student/live-calls', authenticateToken, requireRole(['student']), getStudentCalls);

// Public about page routes
router.get('/public/:subdomain', getPublicAboutPage);
router.post('/public/:subdomain/join', authenticateToken, requireRole(['student']), joinCommunity);

// Profile routes (for both instructors and students)
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfile);
router.post('/profile/picture', authenticateToken, upload.single('profilePicture'), uploadProfilePicture);
router.put('/profile/password', authenticateToken, changePassword);
router.put('/profile/email', authenticateToken, changeEmail);
router.patch('/instructor/subdomain', authenticateToken, requireRole(['instructor']), requirePlanFeature('customDomain'), updateInstructorSubdomain);

// Sidebar preference routes
router.get('/profile/sidebar-preferences', authenticateToken, getSidebarPreferences);
router.put('/profile/sidebar-preferences', authenticateToken, updateSidebarPreferences);

// Admin Profile routes
router.get('/admin/profile', authenticateToken, requireRole(['admin']), getAdminProfile);
router.put('/admin/profile', authenticateToken, requireRole(['admin']), updateAdminProfile);
router.put('/admin/profile/password', authenticateToken, requireRole(['admin']), updateAdminPassword);
router.post('/admin/profile/picture', authenticateToken, requireRole(['admin']), upload.single('profilePicture'), uploadAdminProfilePicture);

// Instructor Social Calendar routes (premium required)
router.get('/instructor/social-posts', authenticateToken, requireRole(['instructor']), checkInstructorPremium, getSocialPosts);
router.post('/instructor/social-posts', authenticateToken, requireRole(['instructor']), checkInstructorPremium, createSocialPost);
router.put('/instructor/social-posts/:postId', authenticateToken, requireRole(['instructor']), checkInstructorPremium, updateSocialPost);
router.delete('/instructor/social-posts/:postId', authenticateToken, requireRole(['instructor']), checkInstructorPremium, deleteSocialPost);

// Error handling middleware for multer errors
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File size too large. Maximum 10MB per file.' });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ error: 'Too many files. Maximum 5 files allowed.' });
    }
  }
  if (error.message === 'Only image files are allowed') {
    return res.status(400).json({ error: 'Only image files are allowed.' });
  }
  next(error);
});

// Premium status endpoint for instructors to check their premium status
router.get('/instructor/premium-status', authenticateToken, requireRole(['instructor']), async (req, res) => {
  try {
    console.log('📊 Premium status check for user:', req.user.email);
    const instructor = req.user.instructors?.[0];
    if (!instructor) {
      console.error('❌ No instructor profile found for user:', req.user.id);
      return res.status(404).json({ error: 'Instructor not found' });
    }

    console.log('✅ Instructor found:', instructor.id);
    const supabase = getSupabaseClient();
    
    // First check subscriptions table for active subscription
    const { data: subscriptions, error: subscriptionError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('instructor_id', instructor.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (subscriptionError) {
      console.error('⚠️ Subscription query error:', subscriptionError.message);
    }
    
    const subscription = subscriptions?.[0] || null;
    console.log('💳 Subscription status:', subscription ? 'Active' : 'None');
    
    if (subscription) {
      // Has active subscription
      if (subscription.cancel_at_period_end) {
        // Subscription is cancelled - show notification
        res.json({
          premium_starts: subscription.current_period_start,
          premium_ends: subscription.current_period_end,
          isActive: true,
          isTrial: false,
          isCancelled: true
        });
      } else {
        // Subscription is active and auto-renewing - no notification
        res.json({
          premium_starts: subscription.current_period_start,
          premium_ends: null, // No notification for active subscriptions
          isActive: true,
          isTrial: false,
          isCancelled: false
        });
      }
    } else {
      // No subscription - fall back to instructors table (one-time payment/lifetime access)
      const isActive = instructor.premium_ends ? new Date() <= new Date(instructor.premium_ends) : false;
      console.log('📅 Fallback to premium_ends:', instructor.premium_ends, '| Active:', isActive);
      
      res.json({
        premium_starts: instructor.premium_starts,
        premium_ends: instructor.premium_ends,
        isActive: isActive,
        isTrial: false, // One-time payment, not a trial
        isCancelled: false
      });
    }
  } catch (error) {
    console.error('❌ Premium status error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Website Configuration routes (Instructor)
router.post('/website/save', authenticateToken, requireRole(['instructor']), checkInstructorPremium, saveWebsiteConfiguration);
router.get('/website/load', authenticateToken, requireRole(['instructor']), checkInstructorPremium, loadWebsiteConfiguration);
router.delete('/website/delete', authenticateToken, requireRole(['instructor']), checkInstructorPremium, deleteWebsiteConfiguration);
router.get('/website/loadthemeid/:id', authenticateToken, loadThemeById);
router.get('/website/loadthemedefault/:type', authenticateToken, loadThemeDefault);

// Public Website Configuration route (no authentication required)
router.get('/website/public/:subdomain', getPublicWebsiteConfiguration);

// Video Meeting routes (protected)
router.use('/meetings', authenticateToken, requirePlanFeature('meet'), meetingRoutes);

// Contact Form route (public - no authentication required)
import { sendContactFormEmail } from './controllers/contactController.js';

// Rate limit for contact form to prevent spam (5 submissions per hour per IP)
const contactFormLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: { error: 'Too many contact form submissions. Please try again later.' }
});

router.post('/contact', contactFormLimiter, sendContactFormEmail);

// Video Library routes (Instructor only - requires Pro plan)
router.post('/videos/upload', authenticateToken, requireRole(['instructor']), checkInstructorPremium, requirePlanFeature('videoHosting'), videoUpload.single('video'), uploadVideo);
router.get('/videos', authenticateToken, requireRole(['instructor']), checkInstructorPremium, requirePlanFeature('videoHosting'), getVideos);
router.get('/videos/storage-stats', authenticateToken, requireRole(['instructor']), checkInstructorPremium, requirePlanFeature('videoHosting'), getStorageStats);
router.delete('/videos/:videoId', authenticateToken, requireRole(['instructor']), checkInstructorPremium, requirePlanFeature('videoHosting'), deleteVideo);
router.post('/videos/bulk-delete', authenticateToken, requireRole(['instructor']), checkInstructorPremium, requirePlanFeature('videoHosting'), bulkDeleteVideos);

// Health check
router.get('/health', (req, res) => {
  res.json({ 
    message: 'API is healthy!',
    timestamp: new Date().toISOString()
  });
});




export default router;