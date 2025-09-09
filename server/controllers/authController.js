import { validationResult } from 'express-validator';
import {
  signUpWithEmail,
  signInWithEmail,
  signOut as supabaseSignOut,
  getCurrentUser as getSupabaseUser,
  resetPassword,
  updatePassword
} from '../utils/auth.js';
import supabase from '../utils/supabase.js';
import jwt from 'jsonwebtoken';

// Helper: create JWT token
const createToken = (user) => {
  return jwt.sign(
    { 
      userId: user.id, 
      email: user.email,
      role: user.role || 'user'
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Helper: set cookie
const setAuthCookie = (res, token) => {
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
};

const authController = {
  // Register
  async register(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password, fullName } = req.body;
      const { user, error } = await signUpWithEmail(email, password, { fullName });

      if (error) throw error;

      return res.status(201).json({
        success: true,
        message: 'Registration successful. Please check your email to verify your account.',
        user
      });
    } catch (error) {
      console.error('Register error:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Registration failed'
      });
    }
  },

  // Login
  async login(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;
      const { user, error } = await signInWithEmail(email, password);

      if (error) throw error;

      const token = createToken(user);
      setAuthCookie(res, token);

      return res.json({
        success: true,
        user,
        token
      });
    } catch (error) {
      console.error('Login error:', error);
      return res.status(401).json({
        success: false,
        error: error.message || 'Invalid login credentials'
      });
    }
  },

  // Logout
  async logout(req, res) {
    try {
      await supabaseSignOut();
      res.clearCookie('token');
      return res.json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      console.error('Logout error:', error);
      return res.status(500).json({
        success: false,
        error: 'Logout failed'
      });
    }
  },

  // Get current user
  async getCurrentUser(req, res) {
    try {
      const token = req.cookies.token;
      if (!token) {
        return res.status(401).json({
          success: false,
          error: 'No authentication token found'
        });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const { user, error } = await getSupabaseUser(decoded.userId);

      if (error) throw error;

      return res.json({
        success: true,
        user
      });
    } catch (error) {
      console.error('Get user error:', error);
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }
  },

  // Request password reset
  async requestPasswordReset(req, res) {
    try {
      const { email } = req.body;
      const { error } = await resetPassword(email);

      if (error) throw error;

      return res.json({
        success: true,
        message: 'Password reset email sent successfully'
      });
    } catch (error) {
      console.error('Password reset request error:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Password reset request failed'
      });
    }
  },

  // Update password
  async updatePassword(req, res) {
    try {
      const { newPassword } = req.body;
      const { error } = await updatePassword(newPassword);

      if (error) throw error;

      return res.json({
        success: true,
        message: 'Password updated successfully'
      });
    } catch (error) {
      console.error('Update password error:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Password update failed'
      });
    }
  },

  // Resend verification email
  async resendVerification(req, res) {
    try {
      const { email } = req.body;
      const { data: { user }, error: userError } = await supabase.auth.admin.getUserByEmail(email);

      if (userError || !user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      if (user.email_confirmed_at) {
        return res.status(400).json({
          success: false,
          error: 'Email already verified'
        });
      }

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email
      });

      if (error) throw error;

      return res.json({
        success: true,
        message: 'Verification email sent successfully'
      });
    } catch (error) {
      console.error('Resend verification error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to resend verification email'
      });
    }
  },

  // Verify email
  async verifyEmail(req, res) {
    try {
      const { token, redirect = '/main', email } = req.query;

      if (process.env.NODE_ENV !== 'production' && !token) {
        return res.redirect(`${process.env.FRONTEND_URL}/email-verified?success=true`);
      }

      const { data: { user }, error } = await supabase.auth.verifyOtp({
        token,
        type: 'email',
        email
      });

      if (error) {
        console.error('Email verification error:', error);
        return res.redirect(`${process.env.FRONTEND_URL}/email-verified?success=false&error=${encodeURIComponent(error.message)}`);
      }

      return res.redirect(`${process.env.FRONTEND_URL}/email-verified?success=true`);
    } catch (error) {
      console.error('Email verification error:', error);
      return res.redirect(`${process.env.FRONTEND_URL}/email-verified?success=false&error=${encodeURIComponent('Unexpected error')}`);
    }
  }
};

export default authController;
