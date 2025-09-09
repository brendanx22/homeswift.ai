import jwt from 'jsonwebtoken';
import models from '../models/index.js';

const jwtAuth = async (req, res, next) => {
  try {
    // Get token from header, cookies, or query parameter
    let token;
    const authHeader = req.headers.authorization;
    
    // Check Authorization header first
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } 
    // Then check cookies
    else if (req.cookies?.token) {
      token = req.cookies.token;
    }
    // Finally check query parameter (for testing only, not recommended for production)
    else if (req.query?.token) {
      token = req.query.token;
    }

    // If no token found, return 401
    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'Authentication required: No token provided' 
      });
    }

    // Verify token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Find user in database
      const user = await models.User.findByPk(decoded.userId || decoded.id);
      
      if (!user) {
        return res.status(401).json({ 
          success: false,
          message: 'User not found' 
        });
      }

      // Check if user is active
      if (user.status !== 'active') {
        return res.status(403).json({ 
          success: false,
          message: 'Account is not active' 
        });
      }

      // Attach user to request
      req.user = user.get({ plain: true });
      req.token = token;
      
      // Update session if session is enabled
      if (req.session) {
        req.session.userId = user.id;
        req.session.role = user.role;
      }
      
      return next();
    } catch (err) {
      console.error('JWT verification error:', err);
      
      // Clear invalid token from cookies
      res.clearCookie('token');
      
      // Handle different JWT errors
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          success: false,
          message: 'Session expired. Please log in again.' 
        });
      }
      
      if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ 
          success: false,
          message: 'Invalid token. Please log in again.' 
        });
      }
      
      // For other errors
      return res.status(500).json({ 
        success: false,
        message: 'Authentication failed',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
  } catch (error) {
    console.error('Authentication middleware error:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Internal server error during authentication' 
    });
  }
};

// Middleware to require authentication
export const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false,
      message: 'Authentication required' 
    });
  }
  next();
};

// Middleware to require specific role
export const requireRole = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        message: 'Authentication required' 
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false,
        message: 'Insufficient permissions' 
      });
    }
    
    next();
  };
};

export default jwtAuth;
