import React, { createContext, useState, useEffect, useContext } from 'react';
import propertyService from '../services/propertyService';
import authService from '../services/authService';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [properties, setProperties] = useState([]);
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Load properties
  const loadProperties = async () => {
    try {
      setIsLoading(true);
      const response = await propertyService.getProperties();
      const data = response.data || response; // Handle both wrapped and unwrapped responses
      setProperties(Array.isArray(data) ? data : []);
      setFeaturedProperties(Array.isArray(data) ? data.slice(0, Math.min(3, data.length)) : []);
      setError(null);
    } catch (err) {
      console.error('Failed to load properties:', err);
      setError('Failed to load properties. Please try again later.');
      setProperties([]);
      setFeaturedProperties([]);
    } finally {
      setIsLoading(false);
    }
  };

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
    loadProperties();
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

  // Search properties
  const searchProperties = async (query) => {
    try {
      const results = await propertyService.searchProperties(query);
      return results;
    } catch (error) {
      console.error('Search failed:', error);
      throw error;
    }
  };

  return (
    <AppContext.Provider
      value={{
        properties,
        featuredProperties,
        isLoading,
        error,
        user,
        isAuthenticated,
        login,
        logout,
        register,
        searchProperties,
        refreshProperties: loadProperties,
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
