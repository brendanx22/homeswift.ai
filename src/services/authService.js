import { supabase, authHelpers } from '../lib/supabase';

const authService = {
  // Register a new user
  register: async (userData) => {
    try {
      const { email, password, firstName, lastName } = userData;
      const { data, error } = await authHelpers.signUp(email, password, {
        first_name: firstName,
        last_name: lastName,
        role: 'user'
      });

      if (error) {
        throw new Error(error.message || 'Registration failed');
      }

      // Return the user data
      return {
        id: data.user.id,
        email: data.user.email,
        firstName: data.user.user_metadata?.first_name,
        lastName: data.user.user_metadata?.last_name,
        role: data.user.user_metadata?.role || 'user'
      };
    } catch (error) {
      console.error('Registration error:', error);
      throw new Error(error.message || 'Registration failed');
    }
  },

  // Login user
  login: async (credentials) => {
    try {
      const { data, error } = await authHelpers.signIn(credentials.email, credentials.password);
      
      if (error) {
        // Handle email verification required
        if (error.message.includes('Email not confirmed')) {
          const verificationError = new Error('Email verification required');
          verificationError.needsVerification = true;
          verificationError.email = credentials.email;
          throw verificationError;
        }
        throw new Error(error.message || 'Login failed');
      }
      
      // Get the full user profile
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error(userError?.message || 'Failed to load user profile');
      }
      
      // Return the user data in the expected format
      return {
        id: user.id,
        email: user.email,
        firstName: user.user_metadata?.first_name,
        lastName: user.user_metadata?.last_name,
        role: user.user_metadata?.role || 'user',
        emailVerified: user.email_confirmed_at != null,
        avatar: user.user_metadata?.avatar_url
      };
      
    } catch (error) {
      console.error('Login error:', error);
      
      // If it's already our custom error, just rethrow it
      if (error.needsVerification) {
        throw error;
      }
      
      throw new Error(error.message || 'Login failed');
    }
  },

  // Logout user
  logout: async () => {
    try {
      const { error } = await authHelpers.signOut();
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      return false;
    }
  },

  // Get current user profile
  getCurrentUser: async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        return null;
      }
      
      // Return the user data in the expected format
      return {
        id: user.id,
        email: user.email,
        firstName: user.user_metadata?.first_name,
        lastName: user.user_metadata?.last_name,
        role: user.user_metadata?.role || 'user',
        emailVerified: user.email_confirmed_at != null,
        avatar: user.user_metadata?.avatar_url
      };
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  },

  // Check if user is authenticated
  isAuthenticated: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return !!user;
    } catch (error) {
      console.error('Auth check error:', error);
      return false;
    }
  },

  // Get auth token
  getToken: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return session?.access_token || null;
    } catch (error) {
      console.error('Get token error:', error);
      return null;
    }
  },
  
  // Reset password
  resetPassword: async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  },
  
  // Update user password
  updatePassword: async (newPassword) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Update password error:', error);
      throw error;
    }
  },
  
  // Sign in with Google
  signInWithGoogle: async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Google sign in error:', error);
      throw error;
    }
  },
  
  // Handle OAuth callback
  handleAuthCallback: async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        throw error;
      }
      
      if (!data.session) {
        throw new Error('No active session');
      }
      
      return data.session.user;
    } catch (error) {
      console.error('Auth callback error:', error);
      throw error;
    }
  }
};

export default authService;
