import jwt from 'jsonwebtoken';
import { supabase } from '../lib/supabase.js';
import dotenv from 'dotenv';

dotenv.config();

// Session-based authentication middleware
export const requireAuth = async (req, res, next) => {
  try {
    // Check if user is logged in via session
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Get user from Supabase
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.session.userId)
      .single();
    
    if (error) throw error;
    if (!user) {
      req.session.destroy();
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Authentication error' });
  }
};

// Optional authentication (doesn't require login)
export const optionalAuth = async (req, res, next) => {
  try {
    if (req.session.userId) {
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', req.session.userId)
        .single();
      
      if (user && !error) {
        req.user = user;
      }
    }
    next();
  } catch (error) {
    console.error('Optional auth error:', error);
    next();
  }
};

// Middleware to check if user is guest (not authenticated)
export const requireGuest = (req, res, next) => {
  if (req.user || (req.session && req.session.userId)) {
    return res.status(400).json({ error: 'Already authenticated' });
  }
  next();
};

// Middleware to check remember me token
export const checkRememberToken = async (req, res, next) => {
  // If already authenticated via session or JWT
  if (req.user || (req.session && req.session.userId)) {
    return next();
  }

  const { remember_token: rememberToken, remember_user: rememberUser } = req.cookies || {};
  
  if (rememberToken && rememberUser) {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', rememberUser)
        .eq('remember_token', rememberToken)
        .single();

      if (user && !error) {
        // Set session
        req.session.userId = user.id;
        req.session.role = user.role;
        req.user = user;
        
        // Generate new remember token
        const newToken = crypto.randomBytes(32).toString('hex');
        
        // Update user with new token in Supabase
        await supabase
          .from('users')
          .update({ remember_token: newToken })
          .eq('id', user.id);
        
        // Update the cookie
        const thirtyDays = 30 * 24 * 60 * 60 * 1000;
        res.cookie('remember_token', newToken, { 
          maxAge: thirtyDays, 
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict'
        });
      }
    } catch (error) {
      console.error('Remember me error:', error);
      // Clear invalid cookies
      res.clearCookie('remember_token');
      res.clearCookie('remember_user');
    }
  }
  
  next();
};

// Middleware to load user from JWT or session
export const loadUser = async (req, res, next) => {
  try {
    // If user is already loaded, skip
    if (req.user) return next();
    
    // Check for JWT in Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        // Verify JWT using Supabase
        const { data: { user }, error } = await supabase.auth.getUser(token);
        
        if (user && !error) {
          req.user = user;
          // Update session for backward compatibility
          req.session.userId = user.id;
          req.session.role = user.role;
          return next();
        }
      } catch (err) {
        console.error('JWT verification error in loadUser:', err);
        // Continue to check session if JWT is invalid
      }
    }
    
    // Try to load from session if no valid JWT
    if (req.session.userId) {
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', req.session.userId)
        .single();
      
      if (user && !error) {
        req.user = user;
      } else {
        // Clear invalid session
        req.session.destroy();
      }
    }
    
    next();
  } catch (error) {
    console.error('Error loading user:', error);
    next(error);
  }
};

// Middleware to check user roles
export const authorizeRoles = (...roles) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    // Get fresh user data to ensure roles are up to date
    const { data: user, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', req.user.id)
      .single();

    if (error || !user) {
      return res.status(401).json({
        success: false,
        error: 'User not found'
      });
    }

    if (!roles.includes(user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      });
    }

    // Update the user role in the request
    req.user.role = user.role;
    next();
  };
};

// JWT Authentication Middleware
export const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
      if (err) {
        return res.status(403).json({ message: 'Invalid or expired token' });
      }

      req.user = user;
      next();
    });
  } else {
    res.status(401).json({ message: 'Authorization header is required' });
  }
};

// Admin role check middleware
export const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  if (req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied: Admin privileges required' });
  }
};
