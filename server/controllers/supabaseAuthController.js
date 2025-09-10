import supabase from '../config/supabase.js';
import { createClient } from '@supabase/supabase-js';

// Client-side Supabase client
export const getClient = (req, res) => {
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY,
    {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      },
      global: {
        headers: {
          'Authorization': req.headers.authorization || ''
        }
      }
    }
  );
};

export const register = async (req, res) => {
  const { email, password, firstName, lastName } = req.body;
  
  try {
    // First, check if user already exists
    const { data: existingUser, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();

    if (existingUser && !userError) {
      return res.status(400).json({
        success: false,
        error: 'User with this email already exists',
        code: 'auth/email-already-in-use'
      });
    }

    // Create the user with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email: email.toLowerCase(),
      password,
      options: {
        emailRedirectTo: `${process.env.FRONTEND_URL}/auth/callback`,
        data: {
          first_name: firstName,
          last_name: lastName,
          full_name: `${firstName} ${lastName}`.trim(),
          avatar_url: '',
          role: 'user' // Default role
        }
      }
    });

    if (error) throw error;

    // If email confirmation is enabled in Supabase, the user will receive a confirmation email
    res.status(201).json({
      success: true,
      message: 'Registration successful! Please check your email to confirm your account.',
      user: data.user,
      session: data.session
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Registration failed',
      code: error.code || 'REGISTRATION_ERROR'
    });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // First try to sign in
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase(),
      password,
    });

    if (error) {
      // Check if the error is due to email not verified
      if (error.message === 'Email not confirmed') {
        // Resend verification email
        const { error: resendError } = await supabase.auth.resend({
          type: 'signup',
          email: email.toLowerCase(),
        });

        if (resendError) {
          console.error('Error resending verification email:', resendError);
          throw new Error('Email not verified. Failed to resend verification email.');
        }

        return res.status(401).json({
          success: false,
          message: 'Please verify your email address. A new verification email has been sent.',
          code: 'auth/email-not-verified',
          requiresVerification: true
        });
      }
      throw error;
    }

    // Check if email is verified
    if (!data.user?.email_confirmed_at) {
      return res.status(401).json({
        success: false,
        message: 'Please verify your email address before logging in.',
        code: 'auth/email-not-verified',
        requiresVerification: true
      });
    }

    // Get the user's role from the database
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('role, email_verified')
      .eq('id', data.user.id)
      .single();

    if (userError) throw userError;

    // Create a JWT token with user info and role
    const token = jwt.sign(
      {
        id: data.user.id,
        email: data.user.email,
        role: userData?.role || 'user',
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Set the JWT in an HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
        role: userData?.role || 'user',
        email_verified: userData?.email_verified || false,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({
      success: false,
      message: error.message || 'Invalid credentials',
      code: error.code || 'LOGIN_FAILED'
    });
  }
};

export const logout = async (req, res) => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;

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
      error: error.message
    });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser(
      req.headers.authorization?.split(' ')[1]
    );

    if (error || !user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated',
        code: 'UNAUTHORIZED'
      });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.user_metadata?.first_name,
        lastName: user.user_metadata?.last_name,
        role: user.user_metadata?.role || 'user'
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user',
      error: error.message
    });
  }
};
