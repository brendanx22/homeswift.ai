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
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          role: 'user' // Default role
        },
        emailRedirectTo: `${process.env.FRONTEND_URL}/auth/confirm`
      }
    });

    if (error) throw error;

    res.status(201).json({
      success: true,
      message: 'Registration successful! Please check your email to confirm your account.',
      user: data.user
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
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    // Get the session
    const { data: { session } } = await supabase.auth.getSession();
    
    // Set the auth cookie
    res.cookie('sb-access-token', session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: session.expires_in * 1000
    });
    
    res.cookie('sb-refresh-token', session.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 * 1000 // 7 days
    });

    res.json({
      success: true,
      message: 'Login successful',
      user: data.user,
      session
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
