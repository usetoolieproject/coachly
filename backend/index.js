console.log('Starting backend...')

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
});

import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { createServer } from 'http'
import router from './router.js'  // Changed from router-minimal.js to router.js for full API routes
import tenantMiddleware from './middleware/tenant.js'
import validateTenant from './middleware/validateTenant.js'
import canonicalHost from './middleware/canonicalHost.js'
import { initializeStripe } from './controllers/billingController.js'
import rateLimit from 'express-rate-limit'
import { initializeVideoMeetingSocket } from './services/videoMeetingService.js'

// Load environment variables
dotenv.config()
console.log('Loaded environment variables')
 

// Initialize Stripe after environment variables are loaded
try {
  initializeStripe();
  console.log('Initialized Stripe')
} catch (e) {
  console.error('Stripe initialization failed:', e)
}

const app = express()

// Trust proxy for correct client IP detection behind reverse proxy (Render, etc.)
app.set('trust proxy', 1)

// Database setup - Auto-detect MongoDB or Supabase
const dbType = process.env.DB_TYPE || 'supabase';
console.log(`[Database] Using database type: ${dbType}`);

// MongoDB setup
let mongooseConnection = null;
if (dbType === 'mongodb') {
  const mongoUrl = process.env.MONGODB_URI || 'mongodb://localhost:27017/trainr';
  try {
    const mongoose = await import('mongoose');
    await mongoose.default.connect(mongoUrl);
    mongooseConnection = mongoose.default.connection;
    console.log(`[MongoDB] Connected to ${mongoUrl}`);
  } catch (e) {
    console.error('[MongoDB] Connection failed:', e);
    console.log('[Database] Falling back to Supabase...');
    process.env.DB_TYPE = 'supabase'; // Fallback to Supabase
  }
}

// Supabase setup
let supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
let supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

// Fallbacks (requested) if env vars are missing in local dev
if (!supabaseUrl) {
  supabaseUrl = 'https://sguavpabcxeppkgwdssl.supabase.co'
}
if (!supabaseKey) {
  supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNndWF2cGFiY3hlcHBrZ3dkc3NsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwMTA5MTAsImV4cCI6MjA3NTU4NjkxMH0.KVn4_DIFyrtINKmir4t_XEqScV1op9G0hSQdH6D0D28'
}

let supabase = null
if ((dbType === 'supabase' || !mongooseConnection) && supabaseUrl && supabaseKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey)
    console.log('[Supabase] Initialized Supabase client')
  } catch (e) {
    console.error('[Supabase] Client initialization failed:', e)
  }
} else if (dbType === 'supabase') {
  console.error('[Supabase] URL or Key missing')
}

// Enhanced CORS configuration
// Support multiple frontend origins via comma-separated env var FRONTEND_URLS
// Examples:
//   FRONTEND_URLS="https://trainrtest.netlify.app,https://trytrainr1.netlify.app"
const configuredOrigins = (process.env.FRONTEND_URLS || process.env.FRONTEND_URL || '')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean)
  .map(o => o.replace(/\/$/, '')) // ensure no trailing slash

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://localhost:3000',
  'https://localhost:3001',
  // Support vite default port and lvh.me subdomains for local testing
  'http://localhost:5173',
  'https://localhost:5173',
  'http://ins.lvh.me:5173',
  'http://lvh.me:5173',
  'https://trainr-new-k.vercel.app',
  ...configuredOrigins,
].filter(Boolean)

const corsOptions = { 
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, some browsers, etc.)
    if (!origin) {
      return callback(null, true);
    }

    // Allow specific static origins
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }

    // Allow dynamic subdomains of usecoachly.com and vercel.app
    const dynamicAllowed = [
      /^https:\/\/([a-zA-Z0-9-]+\.)*usecoachly\.com$/i,  // Only HTTPS, alphanumeric subdomains
      /^https:\/\/([a-zA-Z0-9-]+\.)*vercel\.app$/i,      // Only HTTPS, alphanumeric subdomains
      /^https?:\/\/([a-zA-Z0-9-]+\.)*lvh\.me(?::\d+)?$/i // Local development only
    ];
    

    if (dynamicAllowed.some(r => r.test(origin))) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant'],
  exposedHeaders: ['Set-Cookie']
}

app.use(cors(corsOptions))
// Ensure preflight requests always succeed for defined origins
app.options('*', cors(corsOptions))

// Rate limiting for security
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
})

// Stricter rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 auth requests per windowMs
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
})

// app.use(limiter) // Commented out for development

// Stripe webhook must receive the raw body to verify the signature
app.use('/api/billing/webhook', express.raw({ type: '*/*' }))
// Backward compatibility alias: some dashboards/tools might still send here
app.use('/api/webhooks/stripe', express.raw({ type: '*/*' }))
// Platform subscription webhook must also receive raw body
app.use('/api/subscription/webhook', express.raw({ type: '*/*' }))
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))

// Canonicalize host and protocol early
app.use((req, _res, next) => {
  next()
})
app.use(canonicalHost)

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'TRAINR-PAT Backend running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    allowedOrigins: allowedOrigins,
    tenant: req.tenant || null
  })
})

// Health check endpoint with database info
app.get('/api/health', (req, res) => {
  const healthData = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: process.env.DB_TYPE || 'supabase',
    mongodb: mongooseConnection ? 'connected' : 'not connected',
    supabase: supabase ? 'initialized' : 'not initialized'
  };
  
  res.json(healthData);
})

// Tenant resolution
app.use(tenantMiddleware)
// Validate tenant subdomain exists for all requests (API and pages)
// app.use(validateTenant) // TEMPORARILY DISABLED FOR DEBUGGING

// Use your router for all /api routes
app.use('/api', router)

// Test database connection
app.get('/api/test-db', async (req, res) => {
  if (!supabase) {
    return res.status(500).json({ error: 'Database not configured' })
  }

  try {
    const { data, error } = await supabase.auth.getSession()
    
    if (error) {
      return res.status(500).json({ error: 'Database connection failed', details: error.message })
    }

    res.json({ 
      message: 'Database connection successful!',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return res.status(500).json({ error: 'Database connection failed', details: error.message })
  }
})

// Handle 404
app.use('/*', (req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error)
  res.status(500).json({ error: 'Internal server error' })
})

// Create HTTP server for Socket.IO
const httpServer = createServer(app)

// Initialize Socket.IO for video meetings
const io = initializeVideoMeetingSocket(httpServer)

const PORT = process.env.PORT || 8000
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`🎥 Socket.IO ready for video meetings`)
  console.log('Server is ready to accept connections')
})

httpServer.on('error', (err) => {
  console.error('Server error:', err)
})

console.log('App.listen called, waiting for requests...')

// Keep the event loop alive (Windows fix)
const keepAlive = setInterval(() => {
  // This prevents the process from exiting
}, 1000000)

// Prevent process from exiting
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server...')
  clearInterval(keepAlive)
  httpServer.close(() => {
    console.log('Server closed')
    process.exit(0)
  })
})
