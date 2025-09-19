import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

// Initialize Supabase client with service role key for server-side operations
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false
    }
  }
);

export const checkEmailExists = async (req, res) => {
  const { email } = req.body;
  
  try {
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
        code: 'MISSING_EMAIL'
      });
    }

    console.log('Checking email:', email.toLowerCase());

    // First try to get user by email from auth.users
    const { data: authUser, error: authError } = await supabase
      .from('users')
      .select('email')
      .eq('email', email.toLowerCase())
      .maybeSingle();

    if (authError) {
      console.error('Error checking auth.users:', authError);
      // If there's an error, try checking the public.users table as fallback
      const { data: publicUser, error: publicError } = await supabase
        .from('user_profiles')
        .select('email')
        .eq('email', email.toLowerCase())
        .maybeSingle();

      if (publicError) {
        console.error('Error checking user_profiles:', publicError);
        // If both checks fail, assume email is available
        return res.json({
          success: true,
          exists: false,
          message: 'Email is available'
        });
      }

      // If we found the email in the public.users table
      return res.json({
        success: true,
        exists: !!publicUser,
        message: publicUser ? 'Email is already registered' : 'Email is available'
      });
    }

    // If we found the email in auth.users
    res.json({
      success: true,
      exists: !!authUser,
      message: authUser ? 'Email is already registered' : 'Email is available'
    });

  } catch (error) {
    console.error('Check email exists error:', error);
    // On error, assume email is available to not block signup
    res.json({
      success: true,
      exists: false,
      message: 'Email is available'
    });
  }
};

export const register = async (req, res) => {
  const { email, password, firstName, lastName } = req.body;
  
  try {
    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
        code: 'MISSING_FIELDS'
      });
    }

    // Determine redirect URL based on environment
    const isProduction = process.env.NODE_ENV === 'production';
    const baseUrl = isProduction 
      ? process.env.FRONTEND_URL || 'https://homeswift-ai.vercel.app'
      : 'http://localhost:3000';
    
    // Create user in Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email: email.toLowerCase(),
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          full_name: `${firstName} ${lastName}`,
        },
        emailRedirectTo: `${baseUrl}/verify-email`
      }
    });

    if (error) {
      console.error('Registration error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Registration failed',
        code: error.code || 'REGISTRATION_ERROR'
      });
    }

    // Supabase automatically sends verification email
    res.status(201).json({
      success: true,
      message: 'Registration successful! Please check your email to verify your account.',
      user: {
        id: data.user?.id,
        email: data.user?.email,
        email_confirmed_at: data.user?.email_confirmed_at
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again.',
      code: 'SERVER_ERROR'
    });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  
  try {
    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
        code: 'MISSING_CREDENTIALS'
      });
    }

    // Sign in with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase(),
      password
    });

    if (error) {
      console.error('Login error:', error);
      return res.status(401).json({
        success: false,
        message: error.message || 'Invalid credentials',
        code: error.code || 'LOGIN_FAILED'
      });
    }

    // Check if email is verified
    if (!data.user?.email_confirmed_at) {
      return res.status(400).json({
        success: false,
        message: 'Please verify your email address before logging in',
        code: 'EMAIL_NOT_VERIFIED'
      });
    }

    // Generate JWT token for API authentication
    const token = jwt.sign(
      {
        userId: data.user.id,
        email: data.user.email,
        role: data.user.role || 'user'
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    // Set session cookie
    res.cookie('sb-access-token', data.session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: data.session.expires_in * 1000
    });

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: data.user.id,
        email: data.user.email,
        first_name: data.user.user_metadata?.first_name,
        last_name: data.user.user_metadata?.last_name,
        email_confirmed_at: data.user.email_confirmed_at
      },
      token,
      session: data.session
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed. Please try again.',
      code: 'SERVER_ERROR'
    });
  }
};

export const logout = async (req, res) => {
  try {
    // Get the access token from cookies
    const accessToken = req.cookies['sb-access-token'];
    
    if (accessToken) {
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Supabase sign out error:', error);
      }
    }

    // Clear cookies
    res.clearCookie('sb-access-token');
    res.clearCookie('sb-refresh-token');
    
    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed',
      code: 'SERVER_ERROR'
    });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    // Get the access token from cookies or Authorization header
    const accessToken = req.cookies['sb-access-token'] || 
                       req.headers.authorization?.split(' ')[1];

    if (!accessToken) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated',
        code: 'UNAUTHORIZED'
      });
    }

    // Verify the token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
        code: 'INVALID_TOKEN'
      });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.user_metadata?.first_name,
        last_name: user.user_metadata?.last_name,
        email_confirmed_at: user.email_confirmed_at,
        created_at: user.created_at,
        updated_at: user.updated_at
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user',
      code: 'SERVER_ERROR'
    });
  }
};

export const resendVerification = async (req, res) => {
  const { email } = req.body;
  
  try {
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
        code: 'MISSING_EMAIL'
      });
    }

    // Determine redirect URL based on environment
    const isProduction = process.env.NODE_ENV === 'production';
    const baseUrl = isProduction 
      ? process.env.FRONTEND_URL || 'https://homeswift-ai.vercel.app'
      : 'http://localhost:3000';

    // Resend verification email using Supabase
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email.toLowerCase(),
      options: {
        emailRedirectTo: `${baseUrl}/verify-email`
      }
    });

    if (error) {
      console.error('Resend verification error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to resend verification email',
        code: error.code || 'RESEND_FAILED'
      });
    }

    res.json({
      success: true,
      message: 'Verification email sent successfully'
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resend verification email',
      code: 'SERVER_ERROR'
    });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    // Supabase handles email verification automatically when users click the link
    // This endpoint is mainly for handling the redirect after verification
    const { token, type, redirect_to } = req.query;
    
    if (type === 'signup' && token) {
      // Redirect directly to the main app after email verification
      const redirectUrl = `http://localhost:3000/app`;
      return res.redirect(redirectUrl);
    }
    
    // Default redirect to main app
    res.redirect(`http://localhost:3000/app`);
  } catch (error) {
    console.error('Email verification error:', error);
    res.redirect(`http://localhost:3000/verify-email?error=verification_failed`);
  }
};