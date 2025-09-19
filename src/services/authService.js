import { supabase } from '../lib/supabase';

// Login with email and password
export const login = async (credentials) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });
    
    if (error) throw error;
    return data.user;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

// Register a new user (deprecated - use AuthContext.signUp instead)
export const register = async (userData) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          first_name: userData.firstName,
          last_name: userData.lastName,
        },
        emailRedirectTo: `http://localhost:3000/verify-email`,
      },
    });
    
    if (error) throw error;
    return data.user;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

// Logout the current user
export const logout = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

// Get the current user
export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
};

// Check if user is authenticated
export const isAuthenticated = async () => {
  try {
    // First try to get the session
    const { data: { session } } = await supabase.auth.getSession();
    
    // If no session, user is not authenticated
    if (!session) return false;
    
    // Then get the user to verify the session is still valid
    const { data: { user }, error } = await supabase.auth.getUser();
    
    // If there's an error or no user, return false
    if (error || !user) {
      // If the error is specifically about a missing auth session, clear the session
      if (error?.message?.includes('Auth session missing')) {
        await supabase.auth.signOut();
      }
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Auth check error:', error);
    // If there's an error, sign out to ensure clean state
    try {
      await supabase.auth.signOut();
    } catch (signOutError) {
      console.error('Error during sign out:', signOutError);
    }
    return false;
  }
};

// Get the current session
export const getSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  } catch (error) {
    console.error('Get session error:', error);
    return null;
  }
};

// Refresh the session
export const refreshSession = async () => {
  try {
    const { data, error } = await supabase.auth.refreshSession();
    if (error) throw error;
    return data.session;
  } catch (error) {
    console.error('Refresh session error:', error);
    throw error;
  }
};