import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import crypto from 'crypto';
import { supabase } from '../lib/supabaseClient.js';

dotenv.config();

/**
 * Middleware: Require user authentication (session-based)
 */
export const requireAuth = async (req, res, next) => {
  try {
    if (!req.session?.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.session.user.id)
      .single();

    if (error || !user) {
      req.session.destroy?.();
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Authentication error' });
  }
};

/**
 * Middleware: Optional authentication
 */
export const optionalAuth = async (req, res, next) => {
  try {
    if (req.session?.user) {
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', req.session.user.id)
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

/**
 * Middleware: Require guest (not logged in)
 */
export const requireGuest = (req, res, next) => {
  if (req.session?.user) {
    return res.status(403).json({ error: 'Already authenticated' });
  }
  next();
};

/**
 * Middleware: Handle "Remember Me" functionality
 */
export const rememberMe = async (req, res, next) => {
  try {
    // Skip if already authenticated
    if (req.user || req.session?.userId) return next();

    const { remember_token: rememberToken, remember_user: rememberUser } = req.cookies || {};

    if (rememberToken && rememberUser) {
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', rememberUser)
        .eq('remember_token', rememberToken)
        .single();

      if (error || !user) {
        res.clearCookie('remember_token');
        res.clearCookie('remember_user');
        return next();
      }

      // Set new session
      req.session.userId = user.id;
      req.session.role = user.role;
      req.user = user;

      // Generate and update a new remember token
      const newToken = crypto.randomBytes(32).toString('hex');
      await supabase
        .from('users')
        .update({ remember_token: newToken })
        .eq('id', user.id);

      // Set new cookies
      const thirtyDays = 30 * 24 * 60 * 60 * 1000;
      res.cookie('remember_token', newToken, {
        maxAge: thirtyDays,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      });

      res.cookie('remember_user', user.id, {
        maxAge: thirtyDays,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      });
    }

    next();
  } catch (error) {
    console.error('Remember Me error:', error);
    res.clearCookie('remember_token');
    res.clearCookie('remember_user');
    next();
  }
};

/**
 * Middleware: Load user from JWT or session
 */
export const loadUser = async (req, res, next) => {
  try {
    if (req.user) return next();

    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (user && !error) {
          req.user = user;
          req.session.userId = user.id;
          req.session.role = user.role;
          return next();
        }
      } catch (err) {
        console.error('JWT verification error:', err);
      }
    }

    if (req.session?.userId) {
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', req.session.userId)
        .single();

      if (user && !error) {
        req.user = user;
      } else {
        req.session.destroy?.();
      }
    }

    next();
  } catch (error) {
    console.error('Error loading user:', error);
    next();
  }
};

/**
 * Middleware: Role-based authorization
 */
export const authorizeRoles = (...roles) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', req.user.id)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: 'User not found' });
    }

    if (!roles.includes(user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    req.user.role = user.role;
    next();
  };
};

/**
 * Middleware: Authenticate using JWT token directly
 */
export const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization header is required' });
  }

  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid or expired token' });
    req.user = user;
    next();
  });
};

/**
 * Middleware: Admin check
 */
export const isAdmin = (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: 'Authentication required' });
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin privileges required' });
  next();
};

export default {
  requireAuth,
  optionalAuth,
  requireGuest,
  rememberMe,
  loadUser,
  authorizeRoles,
  authenticateJWT,
  isAdmin
};
