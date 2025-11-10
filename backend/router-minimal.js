import express from 'express';
import rateLimit from 'express-rate-limit';

// Import auth controller functions
import { 
  studentSignup, 
  instructorSignup, 
  login, 
  getCurrentUser, 
  checkSubdomain, 
  getInstructors,
  logout,
  completeSignup
} from './controllers/authController.js';

// Import auth middleware
import { authenticateToken, requireRole } from './middleware/auth.js';

// Import subscription plans controller
import { getActivePlans } from './controllers/subscriptionPlansController.js';

const router = express.Router();

// Rate limiter for auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Auth routes
router.post('/auth/signup/student', authLimiter, studentSignup);
router.post('/auth/signup/instructor', authLimiter, instructorSignup);
router.post('/auth/complete-signup', completeSignup);
router.post('/auth/login', authLimiter, login);
router.get('/auth/me', authenticateToken, getCurrentUser);
router.post('/auth/logout', logout);
router.get('/auth/check-subdomain/:subdomain', checkSubdomain);
router.get('/auth/instructors', getInstructors);

// Subscription plans routes (public - needed for signup)
router.get('/subscription-plans/active', getActivePlans);

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'API is working - server is running!' });
});

export default router;
