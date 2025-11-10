console.log('Starting local development backend...');

import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { createServer } from 'http';
import { initializeVideoMeetingSocket } from './services/videoMeetingService.js';
import {
  createMeeting,
  listMeetings,
  getMeeting,
  updateMeeting,
  cancelMeeting,
  addParticipant,
  getMeetingStats
} from './controllers/meetingControllerMongo.js';

// ES module dirname workaround
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/trainr';
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'],
  credentials: true
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads', 'videos');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve uploaded videos statically
app.use('/uploads/videos', express.static(uploadsDir));

// Configure multer for video uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    cb(null, `recording-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 500 * 1024 * 1024 // 500MB max file size
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['video/webm', 'video/mp4', 'video/x-matroska'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only video files are allowed.'));
    }
  }
});

// MongoDB Connection (delayed, non-blocking)
setTimeout(() => {
  mongoose.connect(MONGODB_URI)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => {
      console.error('❌ MongoDB connection error:', err.message);
      console.log('⚠️  MongoDB not running - auth will not work');
      console.log('💡 Start MongoDB with: mongod or use MongoDB Compass');
    });
}, 1000);

// Mongoose Models
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  role: { type: String, enum: ['student', 'instructor', 'admin'], default: 'student' },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Auth Middleware - supports both Bearer token and cookie-based auth
const authenticateToken = (req, res, next) => {
  // Try Authorization header first
  const authHeader = req.headers['authorization'];
  let token = authHeader && authHeader.split(' ')[1];
  
  // If no Bearer token, try session cookie (cookie-parser makes this easy)
  if (!token && req.cookies && req.cookies.session) {
    token = req.cookies.session;
  }

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'TRAINR Local Dev Backend',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

// Signup
app.post('/api/auth/signup/student', async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role: 'student'
    });

    await user.save();

    // Generate token
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Set cookie
    res.cookie('session', token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    });

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Server error during signup' });
  }
});

app.post('/api/auth/signup/instructor', async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role: 'instructor'
    });

    await user.save();

    // Generate token
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Set cookie
    res.cookie('session', token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    });

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Server error during signup' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Set cookie for browser-based auth
    res.cookie('session', token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    });

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Get current user
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Logout (client-side token removal, but here for compatibility)
app.post('/api/auth/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

// ========== SUBSCRIPTION PLANS ==========
app.get('/api/subscription-plans/active', (req, res) => {
  res.json([
    {
      id: '1',
      name: 'Basic',
      description: 'Perfect for getting started',
      base_price_cents: 2900,
      features: ['Up to 10 students', 'Basic analytics', 'Email support']
    },
    {
      id: '2',
      name: 'Pro',
      description: 'For growing businesses',
      base_price_cents: 9900,
      features: ['Unlimited students', 'Advanced analytics', 'Priority support', 'Custom branding']
    }
  ]);
});

// ========== PROFILE ==========
app.get('/api/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/profile', authenticateToken, async (req, res) => {
  try {
    const { firstName, lastName } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { firstName, lastName },
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/admin/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/admin/profile', authenticateToken, async (req, res) => {
  try {
    const { firstName, lastName } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { firstName, lastName },
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ========== INSTRUCTOR ROUTES ==========
app.get('/api/instructor/students', authenticateToken, (req, res) => {
  res.json([]);
});

app.get('/api/instructor/premium-status', authenticateToken, (req, res) => {
  res.json({ isPremium: true, tier: 'pro' });
});

app.get('/api/instructor/about-page', authenticateToken, (req, res) => {
  res.json({ 
    bannerUrl: null,
    introVideo: null,
    bio: 'Welcome to my training platform!'
  });
});

app.put('/api/instructor/about-page', authenticateToken, (req, res) => {
  res.json({ success: true });
});

app.get('/api/instructor/dashboard-analytics', authenticateToken, (req, res) => {
  res.json({
    analytics: {
      totalStudents: 0,
      activeStudents: 0,
      totalRevenue: 0,
      coursesCompleted: 0
    },
    recentActivity: []
  });
});

app.get('/api/instructor/social-posts', authenticateToken, (req, res) => {
  res.json([]);
});

app.get('/api/instructor/live-calls', authenticateToken, (req, res) => {
  res.json([]);
});

// ========== STUDENT ROUTES ==========
app.get('/api/student/community', authenticateToken, (req, res) => {
  res.json({ name: 'My Community', members: 0 });
});

app.get('/api/student/courses/all-with-progress', authenticateToken, (req, res) => {
  res.json([]);
});

app.get('/api/student/courses/available', authenticateToken, (req, res) => {
  res.json([]);
});

app.get('/api/student/courses/enrolled', authenticateToken, (req, res) => {
  res.json([]);
});

// ========== COURSES ==========
app.get('/api/courses', authenticateToken, (req, res) => {
  res.json([]);
});

app.post('/api/courses', authenticateToken, (req, res) => {
  res.json({ id: '1', ...req.body, createdAt: new Date() });
});

// ========== COMMUNITY ==========
app.get('/api/community/posts', authenticateToken, (req, res) => {
  res.json([]);
});

app.post('/api/community/posts', authenticateToken, (req, res) => {
  res.json({ id: '1', ...req.body, createdAt: new Date() });
});

// ========== WEBSITE ==========
app.get('/api/website/public/:subdomain', (req, res) => {
  res.json({
    subdomain: req.params.subdomain,
    theme: 'default',
    config: {}
  });
});

app.post('/api/website/save', authenticateToken, (req, res) => {
  res.json({ success: true });
});

app.delete('/api/website/delete', authenticateToken, (req, res) => {
  res.json({ success: true });
});

// ========== SUBSCRIPTION ==========
app.get('/api/subscription/status', authenticateToken, (req, res) => {
  res.json({
    active: true,
    plan: 'pro',
    status: 'active'
  });
});

app.post('/api/subscription/create-checkout', authenticateToken, (req, res) => {
  res.json({ url: 'https://checkout.stripe.com/mock' });
});

app.post('/api/subscription/portal', authenticateToken, (req, res) => {
  res.json({ url: 'https://billing.stripe.com/mock' });
});

// ========== BILLING ==========
app.post('/api/billing/checkout', authenticateToken, (req, res) => {
  res.json({ url: 'https://checkout.stripe.com/mock' });
});

app.post('/api/billing/community-checkout', authenticateToken, (req, res) => {
  res.json({ url: 'https://checkout.stripe.com/mock' });
});

// ========== PROMO CODES ==========
app.get('/api/promo-codes/me', authenticateToken, (req, res) => {
  res.json([]);
});

app.post('/api/promo-codes/validate', authenticateToken, (req, res) => {
  res.json({ valid: false, message: 'Promo code not found' });
});

// ========== CONNECT (STRIPE) ==========
app.get('/api/connect/balance', authenticateToken, (req, res) => {
  res.json({ 
    available: [{ amount: 0, currency: 'usd' }], 
    pending: [{ amount: 0, currency: 'usd' }] 
  });
});

app.get('/api/connect/revenue-timeseries', authenticateToken, (req, res) => {
  res.json([]);
});

app.get('/api/instructor/revenue-timeseries', authenticateToken, (req, res) => {
  res.json([]);
});

// ========== PROFILE PREFERENCES ==========
app.get('/api/profile/sidebar-preferences', authenticateToken, (req, res) => {
  res.json({ mode: 'expanded' });
});

app.put('/api/profile/sidebar-preferences', authenticateToken, (req, res) => {
  res.json({ success: true });
});

// ========== VIDEO UPLOAD ==========
/**
 * Upload recorded video
 * POST /api/upload-video
 * 
 * Accepts multipart/form-data with field name "video"
 * Saves to local filesystem in uploads/videos/
 * Returns: { success: true, url: '/uploads/videos/filename.webm', filename: 'filename.webm' }
 */
app.post('/api/upload-video', authenticateToken, upload.single('video'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        error: 'No video file provided' 
      });
    }

    // Construct the URL for accessing the video
    const videoUrl = `/uploads/videos/${req.file.filename}`;
    const fullUrl = `${req.protocol}://${req.get('host')}${videoUrl}`;

    console.log(`Video uploaded successfully: ${req.file.filename} (${(req.file.size / 1024 / 1024).toFixed(2)} MB)`);

    res.json({
      success: true,
      url: fullUrl,
      path: videoUrl,
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype
    });

  } catch (error) {
    console.error('Video upload error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to upload video' 
    });
  }
});

// Get uploaded videos list (optional - for admin)
app.get('/api/videos', authenticateToken, (req, res) => {
  try {
    const files = fs.readdirSync(uploadsDir);
    const videos = files.map(filename => {
      const stats = fs.statSync(path.join(uploadsDir, filename));
      return {
        filename,
        url: `/uploads/videos/${filename}`,
        size: stats.size,
        createdAt: stats.birthtime
      };
    });
    res.json({ videos });
  } catch (error) {
    console.error('Error listing videos:', error);
    res.status(500).json({ error: 'Failed to list videos' });
  }
});

// Delete uploaded video (optional - for cleanup)
app.delete('/api/videos/:filename', authenticateToken, (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(uploadsDir, filename);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.json({ success: true, message: 'Video deleted successfully' });
    } else {
      res.status(404).json({ success: false, error: 'Video not found' });
    }
  } catch (error) {
    console.error('Error deleting video:', error);
    res.status(500).json({ success: false, error: 'Failed to delete video' });
  }
});

// =============================================
// VIDEO MEETING ROUTES
// =============================================

// Create a new meeting
app.post('/api/meetings', authenticateToken, createMeeting);

// List meetings for current user
app.get('/api/meetings', authenticateToken, listMeetings);

// Get meeting statistics
app.get('/api/meetings/stats', authenticateToken, getMeetingStats);

// Get single meeting details
app.get('/api/meetings/:id', authenticateToken, getMeeting);

// Update meeting
app.patch('/api/meetings/:id', authenticateToken, updateMeeting);

// Cancel meeting
app.delete('/api/meetings/:id', authenticateToken, cancelMeeting);

// Add participant to meeting
app.post('/api/meetings/:id/participants', authenticateToken, addParticipant);

// Keep-alive for Windows
setInterval(() => {}, 1000000);

// Global error handler middleware
app.use((err, req, res, next) => {
  console.error('Express Error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// Create HTTP server for Socket.IO
const httpServer = createServer(app);

// Initialize Socket.IO for video meetings
const io = initializeVideoMeetingSocket(httpServer);

// Start server
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 MongoDB: ${MONGODB_URI}`);
  console.log(`🎥 Socket.IO ready for video meetings`);
  console.log(`✅ Ready for development!`);
});

httpServer.on('error', (err) => {
  console.error('Server error:', err);
});

// Error handlers
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  console.error('Stack:', err.stack);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
});
