import axios from 'axios';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://api.homeswift.co',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
  timeout: 10000, // 10 seconds
});

// Request interceptor for logging and auth
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('sb-homeswift-auth-token') || 
                 localStorage.getItem('sb-token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log request details in development
    if (import.meta.env.DEV) {
      console.log('API Request:', {
        url: config.url,
        method: config.method,
        headers: config.headers,
        data: config.data,
      });
    }

    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
apiClient.interceptors.response.use(
  (response) => {
    // Log response in development
    if (import.meta.env.DEV) {
      console.log('API Response:', {
        url: response.config.url,
        status: response.status,
        data: response.data,
      });
    }
    return response;
  },
  (error) => {
    // Handle errors
    const errorMessage = error.response?.data?.message || error.message;
    const status = error.response?.status;
    
    console.error('API Error:', {
      message: errorMessage,
      status: status,
      url: error.config?.url,
      method: error.config?.method,
    });

    // Handle specific error statuses
    if (status === 401) {
      // Handle unauthorized
      console.warn('Authentication required');
      // Optionally redirect to login
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    } else if (status === 403) {
      // Handle forbidden
      console.warn('Access denied');
    } else if (status === 404) {
      // Handle not found
      console.warn('Resource not found');
    } else if (status >= 500) {
      // Handle server errors
      console.error('Server error occurred');
    }

    return Promise.reject({
      message: errorMessage,
      status: status,
      response: error.response?.data,
      isAxiosError: true,
    });
  }
);

// Helper function to make API calls
export const apiRequest = async (method, url, data = null, config = {}) => {
  try {
    const response = await apiClient({
      method,
      url,
      data,
      ...config,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Convenience methods
export const get = (url, config = {}) => apiRequest('get', url, null, config);
export const post = (url, data, config = {}) => apiRequest('post', url, data, config);
export const put = (url, data, config = {}) => apiRequest('put', url, data, config);
export const del = (url, config = {}) => apiRequest('delete', url, null, config);

export default apiClient;
