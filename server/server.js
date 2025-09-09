import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import connectSessionSequelize from 'connect-session-sequelize';

// ES Modules fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize express app
const app = express();

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

// Trust proxy in production (needed for Vercel, Heroku, etc.)
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

const isProduction = process.env.NODE_ENV === 'production';

// ------------------ CORS ------------------
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) {
      console.log('CORS: No origin (non-browser request)');
      return callback(null, true);
    }

    const allowedOrigins = isProduction
      ? [
          'https://homeswift.ai',
          'https://www.homeswift.ai',
          'https://homeswift-ai.vercel.app',
          'https://homeswift-ai-brendanx22s-projects.vercel.app',
          /^https?:\/\/homeswift-.*\.vercel\.app$/
        ]
      : [
          /^https?:\/\/localhost(:\d+)?$/,
          'http://localhost:3000',
          'http://localhost:3001',
          /^https?:\/\/homeswift-.*\.vercel\.app$/
        ];

    console.log(`CORS: Checking origin ${origin}`);

    const isAllowed = allowedOrigins.some((allowedOrigin) => {
      if (typeof allowedOrigin === 'string') return origin === allowedOrigin;
      if (allowedOrigin instanceof RegExp) return allowedOrigin.test(origin);
      return false;
    });

    if (isAllowed) {
      console.log(`CORS: Allowed ${origin}`);
      return callback(null, true);
    }

    const msg = `CORS policy: ${origin} not allowed`;
    console.warn(msg);
    return callback(new Error(msg), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'X-Access-Token',
    'X-Refresh-Token',
    'X-XSRF-TOKEN'
  ],
  exposedHeaders: [
    'Content-Range',
    'X-Total-Count',
    'X-Access-Token',
    'X-Refresh-Token',
    'Set-Cookie'
  ],
  maxAge: 86400,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Always send credentials header
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});

// ------------------ Models ------------------
import models from './models/index.js';
import { checkRememberToken, loadUser } from './middleware/auth.js';
import jwtAuth from './middleware/jwtAuth.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import searchRoutes from './routes/search.js';
import testRoutes from './routes/test.js';
import { propertyRouter } from './routes/propertyRoutes.js';

const PORT = process.env.PORT || 5000;

// Initialize DB
console.log('Initializing database connection...');
try {
  await models.initialize();
  console.log('✅ Database connected');
} catch (err) {
  console.error('❌ Database connection failed:', err);
  process.exit(1);
}

// ------------------ Middleware ------------------
app.use(helmet({ crossOriginEmbedderPolicy: false }));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: { error: 'Too many requests, try again later.' }
});
app.use(limiter);

app.get('/', (req, res) => {
  res.send('HomeSwift API is running 🚀');
});
app.get('/favicon.ico', (req, res) => res.status(204).end());

app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ------------------ Session Store (Sequelize) ------------------
const SequelizeStore = connectSessionSequelize(session.Store);
const sequelize = models.getSequelize();

const sessionStore = new SequelizeStore({
  db: sequelize,
  tableName: 'Sessions',
  checkExpirationInterval: 15 * 60 * 1000,
  expiration: 1000 * 60 * 60 * 2 // 2 hours
});

const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET || 'dev-secret-key',
  resave: false,
  saveUninitialized: false,
  proxy: isProduction,
  store: sessionStore,
  cookie: {
    secure: isProduction, // must be true in prod
    httpOnly: true,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 1000 * 60 * 60 * 2
  }
});

app.use(sessionMiddleware);
sessionStore.sync(); // ensure sessions table exists

if (!isProduction) {
  app.use(morgan('dev'));
}

// ------------------ Public Routes ------------------
app.get('/api/session-test', (req, res) => {
  req.session.views = (req.session.views || 0) + 1;
  res.json({
    message: 'Session test successful',
    views: req.session.views,
    sessionId: req.sessionID
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: sequelize ? 'connected' : 'disconnected'
  });
});

// ------------------ Public API Routes ------------------
app.use('/api/auth', authRoutes);

// ------------------ Protected Routes ------------------
// Apply auth middleware to all routes below this point
app.use(jwtAuth);
app.use(checkRememberToken);
app.use(loadUser);

app.use('/api/users', userRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/test', testRoutes);
app.use('/api/properties', propertyRouter);

// ------------------ Error Handling ------------------
app.use('*', (req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error('Global error handler:', err.stack || err);
  res.status(err.status || 500).json({
    success: false,
    error: isProduction ? 'Something went wrong!' : err.message
  });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await sequelize.close();
  process.exit(0);
});
process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await sequelize.close();
  process.exit(0);
});

// ------------------ Start Server ------------------
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 CORS enabled`);
  console.log(`🗄️  Database: ${sequelize ? 'Connected' : 'Disconnected'}`);
});

export default app;
