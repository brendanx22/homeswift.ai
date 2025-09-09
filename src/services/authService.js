import api from '../lib/api';

const authService = {
  // Register a new user
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      // Backend uses session-based auth, no token needed
      return response.data.user;
    } catch (error) {
      console.error('Registration error:', error);
      const message = error.response?.data?.error || error.message || 'Registration failed';
      throw new Error(message);
    }
  },

  // Login user
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials, {
        validateStatus: status => status === 200 || status === 403
      });
      
      // In development, bypass email verification
      if (process.env.NODE_ENV === 'development' && response.status === 403) {
        // If we get a 403 in development, try to get the user data anyway
        const userResponse = await api.get('/auth/me');
        if (userResponse.data?.user) {
          console.log('Bypassing email verification in development mode');
          return userResponse.data.user;
        }
      }
      
      // Handle successful login
      if (response.status === 200 && response.data?.success) {
        return response.data.user;
      }
      
      // Handle email verification required (only in production)
      if (process.env.NODE_ENV === 'production' && response.status === 403) {
        const errorData = response.data || {};
        const verificationError = new Error(errorData.error || 'Email verification required');
        verificationError.needsVerification = true;
        verificationError.email = errorData.email || credentials.email;
        throw verificationError;
      }
      
      // Handle other errors
      throw new Error(response.data?.error || 'Login failed');
      
    } catch (error) {
      console.error('Login error:', error);
      
      // In development, try to bypass verification errors
      if (process.env.NODE_ENV === 'development' && error.response?.status === 403) {
        try {
          const userResponse = await api.get('/auth/me');
          if (userResponse.data?.user) {
            console.log('Bypassing email verification in development mode (fallback)');
            return userResponse.data.user;
          }
        } catch (fallbackError) {
          console.error('Fallback authentication failed:', fallbackError);
        }
      }
      
      // If it's already our custom error, just rethrow it
      if (error.needsVerification) {
        throw error;
      }
      
      // Handle other errors
      const message = error.response?.data?.error || error.message || 'Login failed';
      throw new Error(message);
    }
  },

  // Logout user
  logout: async () => {
    try {
      await api.post('/auth/logout');
      // Clear any local storage
      localStorage.removeItem('google_user_session');
    } catch (error) {
      console.error('Logout error:', error);
    }
    // Don't redirect here - let the component handle it
  },

  // Get current user profile
  getCurrentUser: async () => {
    try {
      const response = await api.get('/auth/me', {
        // Don't throw on 401 status as it's an expected response for unauthenticated users
        validateStatus: status => status === 200 || status === 401
      });
      
      if (response.status === 200 && response.data?.success) {
        return response.data.user;
      }
      // If we get here, the user is not authenticated
      return null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  },

  // Check if user is authenticated
  isAuthenticated: async () => {
    try {
      const response = await api.get('/auth/me', {
        // Don't throw on 401 status as it's an expected response for unauthenticated users
        validateStatus: status => status === 200 || status === 401
      });
      return response.status === 200 && response.data?.success === true;
    } catch (error) {
      console.error('Authentication check failed:', error);
      return false;
    }
  },

  // Get auth token (not used with session-based auth)
  getToken: () => {
    return null; // Session-based auth doesn't use tokens
  },
};

export default authService;
