import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import session from 'express-session';
import SequelizeStore from 'connect-session-sequelize';
import cookieParser from 'cookie-parser';
import models from './models/index.js';

// Import middleware
import { checkRememberToken, loadUser } from './middleware/auth.js';
import jwtAuth from './middleware/jwtAuth.js';

// Import routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import searchRoutes from './routes/search.js';
import { propertyRouter } from './routes/propertyRoutes.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize models and database connection
await models.initialize();

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later.' }
});
app.use(limiter);

// Development CORS configuration - permissive for local development
const corsOptions = {
  origin: function (origin, callback) {
    // Allow all origins in development
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    
    // In production, only allow specific origins
    const allowedOrigins = [
      'https://homeswift-ai.vercel.app',
      'https://www.homeswift.ai'
    ];
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Allow-Headers',
    'X-Requested-With'
  ],
  exposedHeaders: [
    'Content-Length',
    'X-Foo',
    'X-Bar'
  ],
  optionsSuccessStatus: 200, // Some legacy browsers choke on 204
  preflightContinue: false,
  maxAge: 86400 // 24 hours
};

// Apply CORS middleware
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Enable preflight for all routes

// Handle preflight requests
app.options('*', cors(corsOptions));

// CORS middleware is already configured above with corsOptions
// The following middleware is redundant and can be removed since we're already using cors(corsOptions)
// The cors middleware will handle all the necessary CORS headers

// Cookie parser middleware
app.use(cookieParser());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Session configuration
const SessionStore = SequelizeStore(session.Store);
const sessionStore = new SessionStore({
  db: models.getSequelize()
});

// Determine if we're in production
const isProduction = process.env.NODE_ENV === 'production';

app.use(session({
  secret: process.env.SESSION_SECRET || 'your-super-secret-session-key',
  resave: false,
  saveUninitialized: false,
  store: sessionStore,
  proxy: isProduction, // Trust the reverse proxy in production
  cookie: {
    secure: isProduction ? true : 'auto', // 'auto' allows http in development
    httpOnly: true,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    domain: isProduction ? '.homeswift-ai.vercel.app' : 'localhost'
  }
}));

// Sync session store
sessionStore.sync();

// Logging middleware
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: models.getSequelize() ? 'connected' : 'disconnected'
  });
});

// Apply authentication middleware
app.use(jwtAuth);
app.use(checkRememberToken);
app.use(loadUser);

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRouter);
app.use('/api/users', userRoutes);
app.use('/api/search', searchRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err.stack);
  
  res.status(err.status || 500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' ? 'Something went wrong!' : err.message
  });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await models.getSequelize().close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await models.getSequelize().close();
  process.exit(0);
});

// Error handling middleware (must be last)
app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack || err);
  res.status(err.status || 500).json({ 
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 CORS enabled for multiple origins`);
  console.log(`🗄️  Database: ${models.getSequelize() ? 'Connected' : 'Disconnected'}`);
});

export default app;
