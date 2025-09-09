import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import models from '../models/index.js';
import { sendWelcomeEmail, sendEmailVerification } from '../utils/email.mjs';

const authController = {
  // Register a new user
  async register(req, res) {
    const t = await models.sequelize.transaction();
    
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          error: errors.array()[0].msg,
          field: errors.array()[0].path 
        });
      }
      
      // Auto-verify emails in non-production environments
      const isProduction = process.env.NODE_ENV === 'production';

      const { firstName, lastName, email, password, remember } = req.body;

      // Check if user exists
      const existingUser = await models.User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ error: 'Email already registered' });
      }

      // Hash password before creating user
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Prepare user data with hashed password
      const userData = {
        firstName,
        lastName,
        email: email.toLowerCase(),
        password_hash: hashedPassword,
        password, // Keep plain password for beforeSave hook
        // Auto-verify in non-production environments
        is_email_verified: !isProduction,
        email_verified_at: !isProduction ? new Date() : null
      };

      // Create user within transaction
      const user = await models.User.create(userData, { transaction: t });

      // Generate and send verification email only in production
      if (isProduction) {
        const verificationToken = user.generateEmailVerificationToken();
        await user.save({ transaction: t });
        await sendEmailVerification(user.email, verificationToken);
      }
      
      // Generate JWT token for immediate login
      const token = jwt.sign(
        { 
          id: user.id, 
          email: user.email,
          role: user.role 
        }, 
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '1d' }
      );
      
      // Auto-login after registration in non-production environments
      if (!isProduction) {
        req.session.userId = user.id;
        req.session.role = user.role;
      }

      // Commit transaction
      await t.commit();

      // Send welcome email
      await sendWelcomeEmail(user.email, user.firstName);

      // Handle remember me
      let rememberToken;
      if (remember) {
        rememberToken = user.generateRememberToken();
        await user.save();
      }

      // Prepare user data for response (exclude sensitive info)
      const userResponse = user.toJSON();
      delete userResponse.password_hash;
      
      const response = {
        success: true,
        message: !isProduction 
          ? 'Registration successful! You have been automatically logged in.'
          : 'Registration successful! Please check your email to verify your account.',
        user: userResponse,
        requiresVerification: isProduction
      };
      
      // Only include token in development or if email is verified
      if (!isProduction || user.is_email_verified) {
        response.token = token;
        
        // Set remember me cookies if needed
        if (remember && rememberToken) {
          const thirtyDays = 30 * 24 * 60 * 60 * 1000;
          const cookieOptions = {
            maxAge: thirtyDays,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
          };
          
          res.cookie('remember_token', rememberToken, cookieOptions);
          res.cookie('remember_user', user.id.toString(), cookieOptions);
        }
      }

      res.status(201).json(response);
    } catch (error) {
      // Rollback transaction on error
      await t.rollback();
      
      console.error('Registration error:', error);
      
      // Handle duplicate email error
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({ 
          error: 'Email already registered',
          field: 'email'
        });
      }
      
      // Handle validation errors
      if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({ 
          error: error.errors[0].message,
          field: error.errors[0].path
        });
      }
      
      // Generic error response
      res.status(500).json({ 
        error: 'Registration failed. Please try again.',
        ...(process.env.NODE_ENV !== 'production' && { details: error.message })
      });
    }
  },

  // Login user
  async login(req, res) {
    try {
      const { email, password, remember } = req.body;

      // Find user by email
      const user = await models.User.findOne({ where: { email: email.toLowerCase() } });
      if (!user) {
        console.log(`Login attempt failed: No user found with email ${email}`);
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Check if password is correct
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        console.log(`Login attempt failed: Incorrect password for user ${user.id}`);
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Skip email verification check in development
      if (process.env.NODE_ENV !== 'development' && !user.is_email_verified) {
        console.log(`Login attempt failed: Email not verified for user ${user.id}`);
        return res.status(403).json({ 
          error: 'Please verify your email before logging in',
          needsVerification: true,
          email: user.email
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: remember ? '30d' : '1d' }
      );

      // Generate session
      req.session.userId = user.id;
      req.session.role = user.role;

      // Handle remember me
      let rememberToken;
      if (remember) {
        rememberToken = user.generateRememberToken();
        await user.save();
      }

      const response = {
        success: true,
        user: user.toJSON(),
        token: token
      };

      // Set remember me cookies if needed
      if (remember && rememberToken) {
        const thirtyDays = 30 * 24 * 60 * 60 * 1000;
        const cookieOptions = {
          maxAge: thirtyDays,
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict'
        };
        
        res.cookie('remember_token', rememberToken, cookieOptions);
        res.cookie('remember_user', user.id.toString(), cookieOptions);
      }

      res.json(response);
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed. Please try again.' });
    }
  },

  // Logout user
  async logout(req, res) {
    try {
      // Clear session
      req.session.destroy();
      
      // Clear remember me cookies
      res.clearCookie('connect.sid');
      res.clearCookie('remember_token');
      res.clearCookie('remember_user');
      
      res.json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ error: 'Logout failed' });
    }
  },

  // Get current user
  async getCurrentUser(req, res) {
    try {
      // First check JWT token
      const authHeader = req.headers.authorization;
      let token;
      
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      } else if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
      }
      
      if (!token && !req.session.userId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }
      
      let user;
      
      // Verify JWT token if present
      if (token) {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
          user = await models.User.findByPk(decoded.id);
        } catch (err) {
          console.error('JWT verification error:', err);
          // Continue to check session if JWT is invalid
        }
      }
      
      // Fall back to session if no user from JWT
      if (!user && req.session.userId) {
        user = await models.User.findByPk(req.session.userId);
      }
      
      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }
      
      // Update session
      req.session.userId = user.id;
      req.session.role = user.role;
      
      // Generate a new token with updated expiration
      const newToken = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '1d' }
      );
      
      // Return user data (exclude sensitive info)
      const userData = user.toJSON();
      delete userData.password_hash;
      delete userData.resetPasswordToken;
      delete userData.resetPasswordExpires;
      
      // Ensure we have the name fields properly set
      const responseData = {
        id: userData.id,
        email: userData.email,
        firstName: userData.firstName || userData.first_name || '',
        lastName: userData.lastName || userData.last_name || '',
        name: userData.firstName ? 
          `${userData.firstName} ${userData.lastName || ''}`.trim() : 
          (userData.first_name ? 
            `${userData.first_name} ${userData.last_name || ''}`.trim() : 
            userData.email.split('@')[0]
          ),
        role: userData.role,
        isEmailVerified: userData.is_email_verified || userData.isEmailVerified || false,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt
      };
      
      return res.json({ 
        success: true, 
        user: responseData,
        token: newToken  // Return a fresh token
      });
    } catch (error) {
      console.error('Get current user error:', error);
      return res.status(500).json({ error: 'Failed to get current user' });
    }
  },
  // Verify email
  async verifyEmail(req, res) {
    try {
      const { token, redirect = '/main' } = req.query;
      
      // In development, auto-verify any email
      if (process.env.NODE_ENV !== 'production') {
        const user = await models.User.findOne();
        if (user) {
          user.is_email_verified = true;
          user.emailVerificationToken = null;
          await user.save();
          return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/login?verified=true&redirect=${encodeURIComponent(redirect)}`);
        }
      }
      
      if (!token) {
        return res.status(400).send('Invalid verification link');
      }

      const user = await models.User.findOne({ 
        where: { emailVerificationToken: token } 
      });

      if (!user) {
        return res.status(400).send('Invalid or expired verification link');
      }

      user.is_email_verified = true;
      user.emailVerificationToken = null;
      await user.save();

      // If user is already logged in, redirect to the specified page
      if (req.session?.user?.id) {
        return res.redirect(redirect);
      }
      
      // Otherwise, redirect to login with success message and redirect path
      res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/login?verified=true&redirect=${encodeURIComponent(redirect)}`);
    } catch (error) {
      console.error('Email verification error:', error);
      res.status(500).send('Email verification failed');
    }
  },

  // Resend verification email
  async resendVerification(req, res) {
    try {
      const { email } = req.body;
      const user = await models.User.findOne({ where: { email } });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // In development, auto-verify the user
      if (process.env.NODE_ENV !== 'production') {
        user.is_email_verified = true;
        user.emailVerificationToken = null;
        await user.save();
        return res.json({ message: 'Email verified successfully (development mode)' });
      }

      // In production, send verification email
      const verificationToken = crypto.randomBytes(32).toString('hex');
      user.emailVerificationToken = verificationToken;
      await user.save();

      // Send verification email
      await sendEmailVerification(user.email, verificationToken);
      
      res.json({ message: 'Verification email sent' });
    } catch (error) {
      console.error('Resend verification error:', error);
      res.status(500).json({ error: 'Failed to resend verification email' });
    }
  }
};

export default authController;
