import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import supabase, { testConnection, dbUtils } from './config/supabase-db.js';

// Import routes
import authRoutes from './routes/auth.js';
// import propertiesRoutes from './routes/properties.js';
// import propertyRoutes from './routes/propertyRoutes.js';
// import searchRoutes from './routes/search.js';
// import usersRoutes from './routes/users.js';
// import testRoutes from './routes/test.js';

// ES Modules fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5001;

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

// Trust proxy in production (needed for Vercel, Heroku, etc.)
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

const isProduction = process.env.NODE_ENV === 'production';

// ------------------ Middleware ------------------
app.use(helmet({ crossOriginEmbedderPolicy: false }));
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS Configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow all origins in development
    if (!isProduction) {
      return callback(null, true);
    }
    
    // Production whitelist
    const allowedOrigins = [
      'https://homeswift.co',
      'https://www.homeswift.co',
      'https://chat.homeswift.co',
      'https://homeswift-ai.vercel.app',
      'https://homeswift-ai-backend.vercel.app',
      /^https?:\/\/homeswift-.*\.vercel\.app$/,
      /^https?:\/\/homeswift-ai-[a-z0-9]+\-brendanx22s-projects\.vercel\.app$/
    ];
    
    if (!origin || allowedOrigins.includes(origin) || 
        allowedOrigins.some(o => o instanceof RegExp && o.test(origin))) {
      callback(null, true);
    } else {
      console.warn(`Blocked request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Content-Range', 'X-Total-Count', 'X-Access-Token', 'X-Refresh-Token'],
  maxAge: 86400,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: { error: 'Too many requests, try again later.' }
});
app.use(limiter);

// Logging
if (!isProduction) {
  app.use(morgan('dev'));
}

// Register API routes
app.use('/api/auth', authRoutes);
// app.use('/api', propertiesRoutes);
// app.use('/api', propertyRoutes);
// app.use('/api', searchRoutes);
// app.use('/api', usersRoutes);
// app.use('/api', testRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'HomeSwift API Server',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      properties: '/api/properties',
      search: '/api/properties/search'
    },
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(1);
    
    if (error) throw error;
    
    res.status(200).json({
      status: 'ok',
      database: 'connected',
      users: data ? data.length : 0,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({
      status: 'error',
      message: 'Database connection failed',
      error: isProduction ? 'Internal Server Error' : error.message
    });
  }
});

// Favicon handling - return 204 No Content
app.get('/favicon.ico', (req, res) => {
  res.status(204).end();
});

app.get('/favicon.png', (req, res) => {
  res.status(204).end();
});

// API Routes
app.get('/api/properties', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const filters = {
      listing_type: req.query.listing_type,
      property_type: req.query.property_type,
      min_price: req.query.min_price,
      max_price: req.query.max_price,
      bedrooms: req.query.bedrooms,
      bathrooms: req.query.bathrooms,
      city: req.query.city,
      state: req.query.state
    };

    const result = await dbUtils.getProperties(page, limit, filters);
    
    res.json({
      success: true,
      data: result.properties,
      pagination: {
        currentPage: result.currentPage,
        totalPages: result.totalPages,
        totalCount: result.totalCount,
        limit: limit
      }
    });
  } catch (error) {
    console.error('Error fetching properties:', error);
    res.status(500).json({
      success: false,
      error: isProduction ? 'Internal Server Error' : error.message
    });
  }
});

// Get property by ID
app.get('/api/properties/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const property = await dbUtils.getPropertyById(id);
    
    res.json({
      success: true,
      data: property
    });
  } catch (error) {
    console.error('Error fetching property:', error);
    res.status(500).json({
      success: false,
      error: isProduction ? 'Internal Server Error' : error.message
    });
  }
});

// Search properties
app.get('/api/properties/search', async (req, res) => {
  try {
    const { q, ...filters } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    if (!q) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required'
      });
    }

    const properties = await dbUtils.searchProperties(q, filters, page, limit);
    
    res.json({
      success: true,
      data: properties,
      query: q
    });
  } catch (error) {
    console.error('Error searching properties:', error);
    res.status(500).json({
      success: false,
      error: isProduction ? 'Internal Server Error' : error.message
    });
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: isProduction ? 'Internal Server Error' : err.message,
    ...(!isProduction && { stack: err.stack })
  });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ 
    error: 'API endpoint not found',
    path: req.path,
    method: req.method,
    availableEndpoints: [
      'GET /',
      'GET /health',
      'GET /api/properties',
      'GET /api/properties/:id',
      'GET /api/properties/search',
      'POST /api/auth/*'
    ]
  });
});

// 404 handler for non-API routes
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    message: 'This is an API server. Please use the frontend application.',
    frontend: 'https://homeswift.co'
  });
});

// Start server
async function startServer() {
  try {
    // Test database connection
    await testConnection();
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export default app;
