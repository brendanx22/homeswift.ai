import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: process.env.VITE_API_BASE_URL || 'http://localhost:5001/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    // If token exists, add it to the headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - clear any stored session data
      localStorage.removeItem('token');
      localStorage.removeItem('google_user_session');
      // You might want to redirect to login here or handle it in your components
    }
    return Promise.reject(error);
  }
);

export default api;
