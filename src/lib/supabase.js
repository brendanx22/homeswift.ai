import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with explicit URL and key
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://tproaiqvkohrlxjmkgxt.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwcm9haXF2a29ocmx4am1rZ3h0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0MjUwNDksImV4cCI6MjA3MzAwMTA0OX0.RoOBMaKyPXi0BXfWOhLpAAj89sKYxWEE-Zz5iu3kTEI';

// Debug logging
console.log('Environment Variables:', {
  VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL ? 'Set' : 'Not set',
  VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Set' : 'Not set'
});

console.log('Using Supabase URL:', supabaseUrl);

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  const error = new Error('Missing Supabase environment variables');
  console.error('Error:', error.message, {
    VITE_SUPABASE_URL: !!supabaseUrl,
    VITE_SUPABASE_ANON_KEY: !!supabaseAnonKey
  });
  throw error;
}

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    storage: window.localStorage,
    // Explicitly set the auth endpoint
    auth: {
      autoRefreshToken: true,
      detectSessionInUrl: true,
      persistSession: true,
      storage: window.localStorage,
      storageKey: 'sb-auth-token',
      // This ensures all auth requests go to the correct URL
      url: supabaseUrl
    },
    storageKey: 'homeswift-auth-token',
    redirectTo: window.location.hostname.startsWith('chat.') 
      ? 'https://chat.homeswift.co/'
      : 'https://homeswift.co/'
  },
});

// Auth helper functions
export const authHelpers = {
  // Sign up with email and password
  signUp: async (email, password, userData = {}) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    })
    return { data, error }
  },

  // Sign in with email and password
  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  },

  // Sign out
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      // Redirect to main domain after sign out
      window.location.href = 'https://homeswift.co';
    } else {
      throw error;
    }
  },

  // Get current user
  getCurrentUser: () => {
    return supabase.auth.getUser()
  },

  // Listen to auth changes
  onAuthStateChange: (callback) => {
    return supabase.auth.onAuthStateChange(callback)
  },

  // Reset password
  resetPassword: async (email) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    })
    return { data, error }
  }
}

// Sign in with Google OAuth
export const signInWithGoogle = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: 'https://chat.homeswift.co/dashboard',
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });
  if (error) {
    console.error('Error signing in with Google:', error.message);
    throw error;
  }
};
