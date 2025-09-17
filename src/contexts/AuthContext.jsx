import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Check if user is logged in on initial load
  useEffect(() => {
    // Check active sessions and set the user
    const checkSession = async () => {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setCurrentUser({
            id: session.user.id,
            email: session.user.email,
            ...session.user.user_metadata
          });
        }
      } catch (error) {
        console.error('Error checking session:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Listen for authentication state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setCurrentUser({
            id: session.user.id,
            email: session.user.email,
            ...session.user.user_metadata
          });
          
          // Store the session in localStorage
          localStorage.setItem('supabase.auth.token', session.access_token);
          localStorage.setItem('supabase.auth.refresh', session.refresh_token);
          
          // Redirect to main page after successful login
          if (event === 'SIGNED_IN') {
            navigate('/main');
          }
        } else {
          setCurrentUser(null);
          localStorage.removeItem('supabase.auth.token');
          localStorage.removeItem('supabase.auth.refresh');
          
          // Redirect to login page if user signs out
          if (event === 'SIGNED_OUT') {
            navigate('/login');
          }
        }
      }
    );

    // Cleanup subscription on unmount
    return () => {
      if (subscription?.unsubscribe) {
        subscription.unsubscribe();
      }
    };
  }, [navigate]);

  // Login function
  const login = useCallback(async (credentials) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });
      
      if (error) throw error;
      
      return data.user;
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Register function
  const register = useCallback(async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            first_name: userData.firstName,
            last_name: userData.lastName,
          },
        },
      });
      
      if (error) throw error;
      
      // Auto-login after registration
      if (data.user) {
        await login({ email: userData.email, password: userData.password });
      }
      
      return data.user;
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [login]);

  // Logout function
  const logout = useCallback(async () => {
    try {
      setLoading(true);
      // Clear local state first
      setCurrentUser(null);
      localStorage.removeItem('supabase.auth.token');
      localStorage.removeItem('supabase.auth.refresh');
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Force a full page reload to ensure all state is cleared
      window.location.href = '/login';
      
    } catch (error) {
      console.error('Logout error:', error);
      setError(error.message);
      // Still redirect to login on error
      window.location.href = '/login';
      throw error;
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const value = {
    currentUser,
    isAuthenticated: !!currentUser,
    loading,
    error,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
