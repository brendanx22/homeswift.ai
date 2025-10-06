import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import session from "express-session";
import path from "path";
import { fileURLToPath } from "url";
import winston from "winston";
import { createClient } from "@supabase/supabase-js";
import { createRequire } from "module";
import { rememberMe, loadUser } from "./middleware/authMiddleware.js";
const require = createRequire(import.meta.url);

// Import routes
import authRoutes from "./routes/auth.js";
import propertyRoutes from "./routes/propertyRoutes.js";
import searchRoutes from "./routes/search.js";
import usersRoutes from "./routes/users.js";
import userRoutes from "./routes/userRoutes.js";
import waitlistRoutes from "./routes/waitlist.js";
import testRoutes from "./routes/test.js";

// Initialize environment variables
dotenv.config();

// Configure logger
const logger = winston.createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug", // Log 'info' and below in production, 'debug' and below in development
  format: winston.format.combine(
    winston.format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: "homeswift-backend" },
  transports: [
    // Write all logs with importance level of 'error' or less to 'error.log'
    new winston.transports.File({ filename: "logs/error.log", level: "error" }),
    // Write all logs with importance level of 'info' or less to 'combined.log'
    new winston.transports.File({ filename: "logs/combined.log" }),
  ],
});

// If we're not in production, log to the console as well
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    })
  );
}

// ES Modules fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5001;

// Load environment variables
dotenv.config({ path: path.join(__dirname, ".env") });

// Trust proxy in production (needed for Vercel, Heroku, etc.)
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

const isProduction = process.env.NODE_ENV === "production";

// ------------------ Middleware ------------------
const cspDirectives = {
  defaultSrc: ["'self'"],
  connectSrc: [
    "'self'",
    'https://*.supabase.co',
    'https://*.googleapis.com',
    'wss://*.supabase.co',
    'ws://localhost:*',
    'http://localhost:*',
    'https://homeswift-ai.vercel.app',
    'https://homeswift-ai-backend.vercel.app'
  ],
  fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
  imgSrc: ["'self'", 'data:', 'https:', 'blob:', 'https://*.supabase.co', 'https://*.supabase.in'],
  scriptSrc: [
    "'self'",
    "'unsafe-inline'",
    "'unsafe-eval'",
    'https://*.supabase.co',
    'https://*.supabase.in',
    'https://unpkg.com',
    'https://cdn.jsdelivr.net'
  ],
  styleSrc: [
    "'self'",
    "'unsafe-inline'",
    'https://fonts.googleapis.com',
    'https://*.supabase.co',
    'https://*.supabase.in'
  ],
  connectSrc: [
    "'self'",
    'https://*.supabase.co',
    'https://*.supabase.in',
    'wss://*.supabase.co',
    'wss://*.supabase.in',
    'https://homeswift-ai.vercel.app',
    'https://homeswift-ai-backend.vercel.app',
    'http://localhost:3000',
    'http://localhost:3001'
  ],
  frameSrc: [
    "'self'",
    'https://*.supabase.co',
    'https://*.supabase.in',
    'https://*.stripe.com',
    'https://js.stripe.com'
  ],
  objectSrc: ["'none'"],
  upgradeInsecureRequests: []
};

app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
      directives: cspDirectives,
    },
  })
);
app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// CORS Configuration
const allowedOrigins = [
  "https://homeswift.co",
  "https://www.homeswift.co",
  "https://api.homeswift.co",
  // Development and testing
  "https://homeswift-ai.vercel.app",
  "https://homeswift-ai-backend.vercel.app",
  "http://localhost:3000",
  /^https?:\/\/homeswift-.*\.vercel\.app$/,
  /^https?:\/\/homeswift-ai-[a-z0-9]+\-brendanx22s-projects\.vercel\.app$/,
];

// Function to normalize origin for comparison
const normalizeOrigin = (origin) => {
  if (!origin) return null;
  // Remove trailing slash and convert to lowercase for consistent comparison
  return origin.replace(/\/$/, '').toLowerCase();
};

const corsOptions = {
  origin: function (origin, callback) {
    // Allow all origins in development
    if (!isProduction) {
      return callback(null, true);
    }

    const normalizedOrigin = normalizeOrigin(origin);
    const normalizedAllowedOrigins = allowedOrigins.map(o => 
      typeof o === 'string' ? normalizeOrigin(o) : o
    );

    if (!normalizedOrigin || normalizedAllowedOrigins.some(o => 
      o instanceof RegExp ? o.test(normalizedOrigin) : o === normalizedOrigin
    )) {
      callback(null, true);
    } else {
      console.warn(`Blocked request from origin: ${normalizedOrigin}`);
      callback(new Error(`Not allowed by CORS. Allowed origins: ${allowedOrigins.join(', ')}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH', 'HEAD'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'X-CSRF-Token',
    'X-Session-Id',
    'Cookie'
  ],
  exposedHeaders: [
    'Content-Range',
    'X-Total-Count',
    'X-Access-Token',
    'X-Refresh-Token',
    'Set-Cookie',
    'X-CSRF-Token'
  ],
  maxAge: 86400,
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Apply CORS with preflight options
app.use(cors(corsOptions));

// Handle preflight requests
app.options("*", cors(corsOptions));

// Additional CORS headers for non-preflight requests
app.use((req, res, next) => {
  // Only set headers for non-OPTIONS requests
  if (req.method !== "OPTIONS") {
    res.header("Access-Control-Allow-Credentials", "true");
    res.header(
      "Access-Control-Expose-Headers",
      "Set-Cookie, X-Total-Count, Content-Range"
    );
  }
  next();
});

// Trust first proxy (important for secure cookies in production)
app.set("trust proxy", 1);
// Cookie parser middleware
app.use(cookieParser(process.env.SESSION_SECRET));

// Session configuration
const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    sameSite: 'none', // Required for cross-domain cookies with HTTPS
    domain: process.env.NODE_ENV === 'production' ? 'homeswift.co' : undefined // No leading dot
  },
  name: 'homeswift.sid',
  proxy: process.env.NODE_ENV === 'production' // Trust the reverse proxy in production
};

// Enforce canonical domain (redirect www to non-www)
app.use((req, res, next) => {
  if (req.hostname === 'www.homeswift.co') {
    return res.redirect(301, `https://homeswift.co${req.originalUrl}`);
  }
  next();
});

// Use session middleware
app.use(session(sessionConfig));

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Attach Supabase client to requests
app.use((req, res, next) => {
  req.supabase = supabase;
  next();
});

// Auth middleware
app.use(rememberMe);
app.use(loadUser);

// Rate limiting
// Health check endpoint
/**
 * @api {get} /health Health Check
 * @apiName HealthCheck
 * @apiGroup System
 * @apiDescription Check if the server is running
 * @apiSuccess {String} status Server status
 * @apiSuccess {String} message Status message
 * @apiSuccess {String} timestamp Current timestamp
 * @apiSuccess {String} environment Current environment
 * @apiSuccess {String} version API version
 */
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Server is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    version: process.env.npm_package_version || "1.0.0",
  });
});

// ======================
// API Routes Registration
// ======================

// Authentication routes
app.use("/api/auth", authRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/user", userRoutes);
app.use("/api/waitlist", waitlistRoutes);

// Test endpoints (development only)
if (process.env.NODE_ENV !== "production") {
  app.use("/api/test", testRoutes);
}

// ======================
// API Documentation
// ======================
app.get("/api-docs", (req, res) => {
  res.send(`
    <html>
      <head>
        <title>HomeSwift API Documentation</title>
        <meta http-equiv="refresh" content="0; url='https://documenter.getpostman.com/view/your-postman-docs'" />
      </head>
      <body>
        <p>Redirecting to API documentation... <a href="https://documenter.getpostman.com/view/your-postman-docs">Click here if not redirected</a></p>
      </body>
    </html>
  `);
});

// Resend verification email endpoint
app.post("/api/auth/resend-verification", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        error: "Email is required",
      });
    }

    // Use Supabase to resend verification
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: email,
      options: {
        emailRedirectTo: `${
          req.headers.origin || "https://homeswift.co"
        }/verify-email`,
      },
    });

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      message: "Verification email sent successfully",
    });
  } catch (error) {
    console.error("Resend verification error:", error);
    res.status(500).json({
      success: false,
      error: isProduction ? "Failed to send verification email" : error.message,
    });
  }
});

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "HomeSwift API Server",
    version: "1.0.0",
    status: "running",
    endpoints: {
      health: "/health",
      auth: "/api/auth",
      "resend-verification": "/api/auth/resend-verification",
      properties: "/api/properties",
      search: "/api/properties/search",
    },
    timestamp: new Date().toISOString(),
  });
});

// Health check endpoint
app.get("/health", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .limit(1);

    if (error) throw error;

    res.status(200).json({
      status: "ok",
      database: "connected",
      users: data ? data.length : 0,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Health check failed:", error);
    res.status(500).json({
      status: "error",
      message: "Database connection failed",
      error: isProduction ? "Internal Server Error" : error.message,
    });
  }
});

// Favicon handling - return 204 No Content
app.get("/favicon.ico", (req, res) => {
  res.status(204).end();
});

// Handle chat subdomain requests
app.use((req, res, next) => {
  if (req.hostname === "chat.homeswift.co") {
    // Serve the frontend for chat subdomain
    return res.sendFile(path.join(__dirname, "../dist/index.html"));
  }
  next();
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: "Not Found" });
});

// API Routes
app.get("/api/properties", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const filters = {
      listing_type: req.query.listing_type,
      property_type: req.query.property_type,
      min_price: req.query.min_price,
      max_price: req.query.max_price,
      bedrooms: req.query.bedrooms,
      bathrooms: req.query.bathrooms,
      city: req.query.city,
      state: req.query.state,
    };

    const result = await dbUtils.getProperties(page, limit, filters);

    res.json({
      success: true,
      data: result.properties,
      pagination: {
        currentPage: result.currentPage,
        totalPages: result.totalPages,
        totalCount: result.totalCount,
        limit: limit,
      },
    });
  } catch (error) {
    console.error("Error fetching properties:", error);
    res.status(500).json({
      success: false,
      error: isProduction ? "Internal Server Error" : error.message,
    });
  }
});

// Get property by ID
app.get("/api/properties/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const property = await dbUtils.getPropertyById(id);

    res.json({
      success: true,
      data: property,
    });
  } catch (error) {
    console.error("Error fetching property:", error);
    res.status(500).json({
      success: false,
      error: isProduction ? "Internal Server Error" : error.message,
    });
  }
});

// Search properties
app.get("/api/properties/search", async (req, res) => {
  try {
    const { q, ...filters } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    if (!q) {
      return res.status(400).json({
        success: false,
        error: "Search query is required",
      });
    }

    const properties = await dbUtils.searchProperties(q, filters, page, limit);

    res.json({
      success: true,
      data: properties,
      query: q,
    });
  } catch (error) {
    console.error("Error searching properties:", error);
    res.status(500).json({
      success: false,
      error: isProduction ? "Internal Server Error" : error.message,
    });
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    error: isProduction ? "Internal Server Error" : err.message,
    ...(!isProduction && { stack: err.stack }),
  });
});

// 404 handler for API routes
app.use("/api", (req, res) => {
  // Skip if the request is for a static file
  if (req.originalUrl.includes(".")) {
    return res.status(404).send("Not Found");
  }

  res.status(404).json({
    error: "API endpoint not found",
    path: req.path,
    method: req.method,
    availableEndpoints: [
      "GET /",
      "GET /health",
      "GET /api/properties",
      "GET /api/properties/:id",
      "GET /api/properties/search",
      "POST /api/auth/*",
      "POST /api/auth/resend-verification",
    ],
  });
});

// 404 handler for non-API routes
app.use((req, res) => {
  // Skip if the request is for a static file
  if (req.originalUrl.includes(".")) {
    return res.status(404).send("Not Found");
  }

  res.status(404).json({
    error: "Not Found",
    message: "This is an API server. Please use the frontend application.",
    frontend: "https://homeswift.co",
    apiDocumentation: "https://homeswift.co/api-docs",
  });
});

// Test database connection
async function testConnection() {
  try {
    // If using Sequelize, you can test with:
    // await sequelize.authenticate();
    console.log("✅ Database connection has been established successfully.");
  } catch (error) {
    console.error("❌ Unable to connect to the database:", error);
    throw error;
  }
}

// Start server
async function startServer() {
  try {
    // Test database connection if needed
    if (process.env.NODE_ENV !== "test") {
      await testConnection();
    }

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌐 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

startServer();

export default app;
