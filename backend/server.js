const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');
const { sequelize } = require('./models');
const { initSocket } = require('./socket/socketManager');

dotenv.config();

// ─── 1. ENV VALIDATION — Refuse to start if critical vars are missing ──────────
const REQUIRED_ENV_VARS = [
  'DB_HOST',
  'DB_USER',
  'DB_PASSWORD',
  'DB_NAME',
  'JWT_SECRET',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'EMAIL_USER',
  'EMAIL_PASS',
  'GOOGLE_CLIENT_ID',
  'DEVELOPER_EMAIL',
];

const missingVars = REQUIRED_ENV_VARS.filter((v) => !process.env[v]);
if (missingVars.length > 0) {
  console.error('❌ FATAL: Missing required environment variables:');
  missingVars.forEach((v) => console.error(`   - ${v}`));
  console.error('Server will NOT start until all required variables are set in .env');
  process.exit(1);
}

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const couponRoutes = require('./routes/couponRoutes');
const settingRoutes = require('./routes/settingRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const extraChargeRoutes = require('./routes/extraChargeRoutes');
const adminNoteRoutes = require('./routes/adminNoteRoutes');
const supportRoutes = require('./routes/supportRoutes');
const { seedSettings } = require('./controllers/settingController');

const app = express();
const httpServer = http.createServer(app);
// Trust Render's proxy to get the real client IP for rate limiting
app.set('trust proxy', 1);

const PORT = process.env.PORT || 5000;


// ─── 2. SECURITY HEADERS (Helmet) ─────────────────────────────────────────────
app.use(
  helmet({
    crossOriginEmbedderPolicy: false, // Allow product images from Cloudinary
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https://res.cloudinary.com', 'https://api.dicebear.com'],
        connectSrc: ["'self'"],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: IS_PRODUCTION ? [] : null,
      },
    },
    hsts: IS_PRODUCTION
      ? { maxAge: 31536000, includeSubDomains: true, preload: true }
      : false,
  })
);

// ─── 3. CORS — Restrict to frontend domain ────────────────────────────────────
const ALLOWED_ORIGINS = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'http://localhost:5173',
  'http://localhost:3000',
  'https://wifo-mart-ecom.vercel.app'
];

// ─── Socket.IO ─────────────────────────────────────────────────────────────────
const io = new Server(httpServer, {
  cors: {
    origin: ALLOWED_ORIGINS,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
});

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, mobile apps, server-to-server)
      if (!origin) return callback(null, true);
      if (ALLOWED_ORIGINS.includes(origin)) {
        return callback(null, true);
      }
      callback(new Error(`CORS: Origin ${origin} not allowed`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ─── 4. RATE LIMITING ─────────────────────────────────────────────────────────
// General API rate limit
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later.' },
});

// Auth endpoints: 5 attempts per minute
const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many login attempts. Please wait 1 minute and try again.' },
  skipSuccessfulRequests: true,
});

// OTP / password reset: 3 attempts per 10 minutes
const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many OTP requests. Please wait before requesting again.' },
});

// Support / contact form: 3 tickets per 30 minutes per IP (prevents inbox spam)
const supportLimiter = rateLimit({
  windowMs: 30 * 60 * 1000, // 30 minutes
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many support requests. Please wait 30 minutes before submitting again.' },
});

app.use('/api', generalLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/google', authLimiter);
app.use('/api/auth/send-otp', otpLimiter);
app.use('/api/auth/forgot-password', otpLimiter);
app.use('/api/users/send-password-otp', otpLimiter);
// Only rate-limit the public ticket creation POST — not the admin GET endpoints
app.post('/api/support', supportLimiter);

// ─── 5. BODY PARSING ─────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── 6. BLOCK SENSITIVE INTERNAL PATHS ───────────────────────────────────────
// Defence-in-depth: explicitly deny any request targeting .git, .env, or
// internal config files — even if a future static-file middleware is added.
app.use((req, res, next) => {
  const blockedPatterns = /\.(git|env|htaccess|htpasswd|DS_Store|npmrc|yarnrc)|\/\.well-known\/.*secret/i;
  if (blockedPatterns.test(req.path)) {
    return res.status(404).json({ message: 'Not found' });
  }
  next();
});

// ─── 7. STATIC FILES ─────────────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// ─── 7. ROUTES ───────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ message: 'W!FO MART API is running', version: '1.0.0' });
});

app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/pincodes', require('./routes/pincodeRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/wishlist', require('./routes/wishlistRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/extracharges', extraChargeRoutes);
app.use('/api/admin-notes', adminNoteRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/geocode', require('./routes/geocodeRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

// ─── 8. GLOBAL ERROR HANDLER — Never expose stack traces ─────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  // Generate a short correlation ID so logs can be cross-referenced
  const correlationId = Date.now().toString(36).toUpperCase();

  // Full details go to server log only
  console.error(`[${correlationId}] Unhandled error: ${err.message}`);
  if (!IS_PRODUCTION) {
    console.error(err.stack);
  }

  // CORS errors
  if (err.message && err.message.startsWith('CORS')) {
    return res.status(403).json({ message: 'Access denied.', correlationId });
  }

  // Generic safe response to client — no stack, no internals
  res.status(err.status || 500).json({
    message: err.status ? err.message : 'An unexpected error occurred.',
    correlationId,
  });
});

// ─── 9. DATABASE + SERVER START ──────────────────────────────────────────────
const startServer = async () => {
  try {
    await connectDB();
    await sequelize.sync();
    console.log('Database connected');

    // Check Cloudinary connection
    const cloudinary = require('./config/cloudinary');
    try {
      await cloudinary.api.ping();
      console.log('Cloudinary connected successfully.');
    } catch (err) {
      console.warn('Cloudinary connection check failed:', err.message);
    }

    await seedSettings();

    // Initialize Socket.IO before starting server
    initSocket(io);

    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT} [${IS_PRODUCTION ? 'PRODUCTION' : 'DEVELOPMENT'}]`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
