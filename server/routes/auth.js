import express from 'express';
import rateLimit from 'express-rate-limit';
import { body } from 'express-validator';
import { requireGuest, checkRememberToken, loadUser } from '../middleware/auth.js';
import authController from '../controllers/authController.js';

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

// POST /api/auth/login - User login
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

// Get current user - requires authentication (handled by jwtAuth middleware in server.js)
router.get('/me', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  // Return user data without sensitive information
  const userData = req.user.toJSON();
  delete userData.password_hash;
  res.json({ success: true, user: userData });
});

// Email verification endpoint
router.get('/verify-email', authController.verifyEmail);

// Resend verification email
router.post('/resend-verification', authController.resendVerification);

export default router;
