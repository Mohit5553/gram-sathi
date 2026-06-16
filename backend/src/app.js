const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const sanitizeMiddleware = require('./middleware/sanitize');
const xssSanitize = require('./middleware/xssSanitize');
const hppSanitize = require('./middleware/hppSanitize');
const compression = require('compression');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.set('trust proxy', 1); // Allow rate limiting behind reverse proxy/load balancer

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"], // Allow inline for some client frameworks
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https://res.cloudinary.com", "http://maps.google.com"],
      connectSrc: ["'self'", "https://maps.googleapis.com"]
    }
  },
  crossOriginEmbedderPolicy: false // Allows Cloudinary/Google maps images
}));
app.use(compression());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Strict CORS to prevent CSRF
const allowedOrigins = ['http://localhost:5173', 'http://localhost:5174'];
if (process.env.FRONTEND_URL) {
  const cleanUrl = process.env.FRONTEND_URL.replace(/\/$/, '');
  allowedOrigins.push(cleanUrl);
  allowedOrigins.push(`${cleanUrl}/`);
}

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
}));

app.use(express.json({ limit: '10kb' })); // Limit body size to prevent DoS
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Data Sanitization against NoSQL query injection
// Custom middleware recursively removes $ and . from keys
app.use(sanitizeMiddleware);

// Data Sanitization against XSS (Express 5 safe)
app.use(xssSanitize);

// Protect against HTTP Parameter Pollution (Express 5 safe)
app.use(hppSanitize);

// Global Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  message: { message: 'Too many requests from this IP, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req, res) => process.env.NODE_ENV !== 'production',
});
app.use('/api', limiter);
app.use(express.urlencoded({ extended: true }));

const logger = require('./utils/logger');

// Basic route
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'GramSathi API is running',
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage(),
    timestamp: new Date()
  });
});

// Import Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/tractor', require('./routes/tractorRoutes'));
app.use('/api/jcb', require('./routes/jcbRoutes'));
app.use('/api/labour', require('./routes/labourRoutes'));
app.use('/api/electrician', require('./routes/electricianRoutes'));
app.use('/api/plumber', require('./routes/plumberRoutes'));
app.use('/api/schemes', require('./routes/schemeRoutes'));
app.use('/api/emergency', require('./routes/emergencyRoutes'));
app.use('/api/booking', require('./routes/bookingRoutes'));
app.use('/api', require('./routes/reviewRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/lost-found', require('./routes/lostFoundRoutes'));
app.use('/api/fcm', require('./routes/fcmRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/provider', require('./routes/providerRoutes'));
app.use('/api/search', require('./routes/searchRoutes'));
app.use('/api/locations', require('./routes/locationRoutes'));
app.use('/api/cms', require('./routes/cmsRoutes'));
app.use('/api/jobs', require('./routes/jobRoutes'));
app.use('/api/marketplace', require('./routes/marketplaceRoutes'));
app.use('/api/admin/backups', require('./routes/backupRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));

// Initialize Automated Backup Scheduler
const { initBackupScheduler } = require('./utils/backupManager');
initBackupScheduler();

// Initialize Automated Dashboard Schedulers
const { initDashboardSchedulers } = require('./utils/dashboardScheduler');
initDashboardSchedulers();

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
  logger.error(err.stack);

  res.status(err.status || 500).json({
    message: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

module.exports = app;
