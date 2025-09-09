import { validationResult } from 'express-validator';
import supabase from '../utils/supabase.js';
import jwt from 'jsonwebtoken';
import models from '../models/index.js';

const authController = {
  // Register a new user with Supabase
  async register(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          error: errors.array()[0].msg,
          field: errors.array()[0].path 
        });
      }

      const { firstName, lastName, email, password } = req.body;

      // Check if user exists in Supabase Auth
      const { data: existingUser, error: userCheckError } = await supabase
        .from('users')
        .select('id')
        .eq('email', email.toLowerCase())
        .single();

      if (existingUser) {
        return res.status(400).json({ error: 'Email already registered' });
      }

      // Create user in Supabase Auth
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: email.toLowerCase(),
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            email_verified: false
          }
        }
      });

      if (signUpError) {
        console.error('Supabase signup error:', signUpError);
        return res.status(400).json({ error: signUpError.message });
      }

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

  // Login user with Supabase
  async login(req, res) {
    try {
      const { email, password, remember } = req.body;

      // Sign in with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase(),
        password,
      });

      if (error) {
        console.error('Login error:', error);
        return res.status(400).json({ 
          error: error.message.includes('Invalid login credentials') 
            ? 'Invalid credentials' 
            : error.message 
        });
      }

      // Get user details from Supabase
      const { data: { user } } = await supabase.auth.getUser(data.session.access_token);

      // Check if email is verified
      if (!user.email_confirmed_at) {
        return res.status(400).json({ 
          error: 'Please verify your email address before logging in',
          code: 'EMAIL_NOT_VERIFIED'
        });
      }

      // Create JWT payload
      const payload = {
        user: {
          id: user.id,
          email: user.email,
          role: user.role || 'user' // Default role if not set
        }
      };

      // Sign JWT
      const token = jwt.sign(
        payload,
        process.env.JWT_SECRET || 'your-secret-key', // Fallback for development
        { expiresIn: remember ? '30d' : '1d' }
      );

      // Set session
      req.session.userId = user.id;
      req.session.role = user.role || 'user';

      res.json({ 
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role || 'user',
          isAuthenticated: true
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Server error during login' });
    }
  },

  // Logout user
  async logout(req, res) {
    try {
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Supabase sign out error:', error);
        // Continue with session destruction even if Supabase sign out fails
      }

      // Clear session
      req.session.destroy(err => {
        if (err) {
          console.error('Error destroying session:', err);
          return res.status(500).json({ error: 'Error logging out' });
        }
        
        // Clear session cookie
        res.clearCookie('connect.sid');
        res.json({ message: 'Logged out successfully' });
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ error: 'Server error during logout' });
    }
  },

  // Get current user
  async getCurrentUser(req, res) {
    try {
      // Check if user is authenticated via session
      if (!req.session.userId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      // Get user from Supabase
      const { data: { user }, error } = await supabase.auth.getUser(req.session.userId);

      if (error || !user) {
        console.error('Error fetching user from Supabase:', error);
        return res.status(404).json({ error: 'User not found' });
      }

      // Get additional user data from your database if needed
      const userProfile = await models.UserProfile.findOne({
        where: { userId: user.id },
        attributes: ['id', 'bio', 'phone', 'avatar', 'location']
      });

      // If user is authenticated but not via session (e.g., JWT), check token
      if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        try {
          const token = req.headers.authorization.split(' ')[1];
          const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
          
          // Verify the token matches the session user
          if (decoded.user.id !== req.session.userId) {
            return res.status(401).json({ error: 'Token does not match session' });
          }
        } catch (error) {
          console.error('Token verification error:', error);
          return res.status(401).json({ error: 'Invalid or expired token' });
        }
      }

      // Generate a fresh JWT token
      const newToken = jwt.sign(
        { id: user.id, email: user.email, role: user.role || 'user' },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '1d' }
      );

      const responseData = {
        id: user.id,
        email: user.email,
        firstName: user.user_metadata?.first_name || '',
        lastName: user.user_metadata?.last_name || '',
        name: user.user_metadata?.first_name || user.email.split('@')[0],
        role: user.role || 'user',
        isEmailVerified: !!user.email_confirmed_at,
        profile: userProfile || {},
        createdAt: user.created_at,
        updatedAt: user.updated_at
      };
      
      return res.json({ 
        success: true, 
        user: responseData,
        token: newToken
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
