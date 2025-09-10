import React, { createContext, useState, useEffect, useContext } from 'react';
import authService from '../services/authService';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Get user data first
        const userData = await authService.getCurrentUser();
        if (userData) {
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          // If no user data, explicitly set unauthenticated
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (credentials) => {
    try {
      const userData = await authService.login(credentials);
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
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout failed:', error);
      // Still clear local state even if server logout fails
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      const newUser = await authService.register(userData);
      // Don't set authenticated state - user needs to verify email first
      return newUser;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  return (
    <AppContext.Provider
      value={{
        isLoading,
        error,
        user,
        isAuthenticated,
        login,
        logout,
        register,
        setError // Allow child components to set error state
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
