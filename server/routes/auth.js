import express from 'express';
import rateLimit from 'express-rate-limit';
import { body } from 'express-validator';
import * as authController from '../controllers/supabaseAuthController.js';
import { requireAuth } from '../middleware/supabaseAuth.js';

const router = express.Router();

// Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: { error: 'Too many authentication attempts, please try again later.' }
});

// Register
router.post('/register', 
  authLimiter,
  [
    body('firstName').trim().isLength({ min: 2 }).withMessage('First name is required'),
    body('lastName').trim().isLength({ min: 2 }).withMessage('Last name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email address'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
  ],
  authController.register
);

// Login
router.post('/login', 
  authLimiter,
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  authController.login
);

// Logout
router.post('/logout', authController.logout);

// Get current user
router.get('/me', requireAuth, authController.getCurrentUser);

// Email verification
router.get('/verify-email', async (req, res) => {
  try {
    const { token, redirect = '/main' } = req.query;
    
    if (!token) {
      return res.status(400).json({ error: 'Verification token is required' });
    }

    // Verify the email using the token with Supabase
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: 'signup'
    });

    if (error) {
      console.error('Email verification error:', error);
      return res.redirect(`${process.env.FRONTEND_URL}/auth/verify?error=invalid_token`);
    }

    // Success - redirect to the frontend with success status
    const redirectUrl = new URL(redirect, process.env.FRONTEND_URL);
    redirectUrl.searchParams.set('verified', 'true');
    return res.redirect(redirectUrl.toString());
    
  } catch (error) {
    console.error('Email verification error:', error);
    return res.redirect(`${process.env.FRONTEND_URL}/auth/verify?error=verification_failed`);
  }
});

// Resend verification email
router.post('/resend-verification', requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabase.auth.resend({
      type: 'signup',
      email: req.user.email
    });

    if (error) throw error;

    res.json({
      success: true,
      message: 'Verification email resent successfully'
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resend verification email',
      error: error.message
    });
  }
});

export default router;
