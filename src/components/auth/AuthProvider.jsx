import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser, isAuthenticated, clearUserSession } from '../../lib/googleAuth';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on app load
    const checkAuth = () => {
      try {
        console.log('AuthProvider checking authentication...');
        
        // Check localStorage directly for session
        const session = localStorage.getItem('google_user_session');
        if (session) {
          try {
            const sessionData = JSON.parse(session);
            console.log('Session data found:', sessionData);
            
            if (sessionData.user) {
              setUser(sessionData.user);
              console.log('User set from session:', sessionData.user);
            }
          } catch (parseError) {
            console.error('Error parsing session data:', parseError);
            localStorage.removeItem('google_user_session');
          }
        } else {
          console.log('No session found in localStorage');
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const logout = () => {
    clearUserSession();
    setUser(null);
  };

  const value = {
    user,
    loading,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
