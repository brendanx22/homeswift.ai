import jwt from 'jsonwebtoken';
import models from '../models/index.js';

// Session-based authentication middleware
export const requireAuth = async (req, res, next) => {
  try {
    // Check if user is logged in via session
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Get user from database
    const user = await models.User.findByPk(req.session.userId, {
      attributes: { exclude: ['password'] }
    });
    
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
      const user = await models.User.findByPk(req.session.userId, {
        attributes: { exclude: ['password'] }
      });
      
      if (user) {
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
      const user = await models.User.findOne({
        where: {
          id: rememberUser,
          rememberToken: rememberToken
        }
      });

      if (user) {
        // Set session
        req.session.userId = user.id;
        req.session.role = user.role;
        req.user = user;
        
        // Refresh the remember token
        const newToken = user.generateRememberToken();
        await user.save();
        
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
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const user = await models.User.findByPk(decoded.id, {
          attributes: { exclude: ['password_hash'] }
        });
        
        if (user) {
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
      const user = await models.User.findByPk(req.session.userId, {
        attributes: { exclude: ['password_hash'] }
      });
      
      if (user) {
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
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      });
    }

    next();
  };
};
