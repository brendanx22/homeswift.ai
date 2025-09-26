import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getCurrentUser, 
  login as authLogin, 
  logout as authLogout, 
  register as authRegister,
  isAuthenticated as checkAuthStatus
} from '../services/authService';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication status on mount
  useEffect(() => {
    let isMounted = true;
    
    const checkAuth = async () => {
      try {
        const isAuth = await checkAuthStatus();
        if (!isMounted) return;
        
        if (isAuth) {
          const userData = await getCurrentUser();
          if (!isMounted) return;
          
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          // If not authenticated, ensure we clear any existing user data
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        if (!isMounted) return;
        
        // On any error, clear auth state
        setUser(null);
        setIsAuthenticated(false);
        
        // If we're not on the login page, redirect there
        if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/signup')) {
          window.location.href = '/login';
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    // Add a small delay to prevent race conditions with Supabase initialization
    const timer = setTimeout(() => {
      checkAuth();
    }, 100);

    // Cleanup function
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, []);

  // Login function
  const login = useCallback(async (credentials) => {
    try {
      setIsLoading(true);
      const userData = await authLogin(credentials);
      setUser(userData);
      setIsAuthenticated(true);
      setError(null); // Clear any previous errors
      return userData;
    } catch (error) {
      console.error('Login failed:', error);
      
      // Handle email verification required case
      if (error.needsVerification) {
        // Store the email for resending verification
        setError({
          message: error.message || 'Please verify your email before logging in.',
          needsVerification: true,
          email: error.email
        });
      } else {
        // Handle other login errors
        setError({
          message: error.message || 'Login failed. Please check your credentials and try again.',
          needsVerification: false
        });
      }
      
      // Re-throw the error so the login form can handle it
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);


  // Register function
  const register = useCallback(async (userData) => {
    try {
      setIsLoading(true);
      const newUser = await authRegister(userData);
      // Don't set authenticated state - user needs to verify email first
      return newUser;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <AppContext.Provider
      value={{
        isLoading,
        error,
        user,
        isAuthenticated,
        login,
        register,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export { AppContext };
export default AppContext;
