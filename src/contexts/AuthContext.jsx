import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import authService from '../services/authService';
import { supabase } from '../lib/supabase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Handle auth state changes
  const handleAuthChange = useCallback(async (event, session) => {
    try {
      if (session?.user) {
        const user = await authService.getCurrentUser();
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
      }
    } catch (error) {
      console.error('Auth state change error:', error);
      setError(error.message);
    } finally {
      if (loading) setLoading(false);
    }
  }, [loading]);

  // Set up auth state listener
  useEffect(() => {
    // Check initial auth state
    const checkAuth = async () => {
      try {
        const user = await authService.getCurrentUser();
        if (user) {
          setCurrentUser(user);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Set up auth state change listener
    const { data: { subscription } = supabase.auth.onAuthStateChange(handleAuthChange);

    // Clean up subscription on unmount
    return () => {
      if (subscription?.unsubscribe) {
        subscription.unsubscribe();
      }
    };
  }, [handleAuthChange]);

  // Handle OAuth callback
  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        if (data?.session) {
          const user = await authService.getCurrentUser();
          setCurrentUser(user);
          
          // Redirect to intended URL or home
          const from = location.state?.from?.pathname || '/';
          navigate(from, { replace: true });
        }
      } catch (error) {
        console.error('OAuth callback error:', error);
        setError(error.message);
        navigate('/login', { state: { error: error.message } });
      }
    };

    // Check if this is an OAuth callback
    if (window.location.pathname === '/auth/callback') {
      handleOAuthCallback();
    }
  }, [navigate, location]);

  // Login function
  const login = async (credentials) => {
    try {
      setLoading(true);
      setError(null);
      const user = await authService.login(credentials);
      setCurrentUser(user);
      return user;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      const user = await authService.register(userData);
      return user;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setLoading(true);
      await authService.logout();
      setCurrentUser(null);
      // Clear any cached data
      localStorage.removeItem('supabase.auth.token');
      return true;
    } catch (error) {
      console.error('Logout failed:', error);
      setError(error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Update user function
  const updateUser = async (userData) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.updateUser({
        data: {
          ...currentUser,
          ...userData
        }
      });

      if (error) throw error;
      
      const updatedUser = {
        ...currentUser,
        ...userData,
        ...data.user.user_metadata
      };
      
      setCurrentUser(updatedUser);
      return updatedUser;
    } catch (error) {
      console.error('Update user failed:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Reset password
  const resetPassword = async (email) => {
    try {
      setLoading(true);
      setError(null);
      await authService.resetPassword(email);
      return true;
    } catch (error) {
      console.error('Password reset failed:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Update password
  const updatePassword = async (newPassword) => {
    try {
      setLoading(true);
      setError(null);
      await authService.updatePassword(newPassword);
      return true;
    } catch (error) {
      console.error('Password update failed:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      setError(null);
      await authService.signInWithGoogle();
    } catch (error) {
      console.error('Google sign in failed:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    currentUser,
    isAuthenticated: !!currentUser,
    loading,
    error,
    login,
    register,
    logout,
    updateUser,
    resetPassword,
    updatePassword,
    signInWithGoogle,
    setError
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
