import axios from 'axios';

// Get API URL from environment variables
const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle errors
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // Unauthorized - token expired or invalid
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          // Redirect to login page if not already there
          if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
          break;
          
        case 403:
          // Forbidden - no permission
          console.error('Access forbidden:', data.message);
          break;
          
        case 404:
          // Not found
          console.error('Resource not found:', data.message);
          break;
          
        case 422:
          // Validation error
          console.error('Validation error:', data.errors);
          break;
          
        case 429:
          // Too many requests
          console.error('Too many requests. Please try again later.');
          break;
          
        case 500:
          // Server error
          console.error('Server error:', data.message);
          break;
          
        default:
          console.error('API Error:', data.message || 'Unknown error occurred');
      }
    } else if (error.request) {
      // Request was made but no response
      console.error('No response received. Please check your network connection.');
    } else {
      // Something else happened
      console.error('Request error:', error.message);
    }
    
    // Return error for component-level handling
    return Promise.reject(error);
  }
);

// Add retry logic for payment endpoints
const paymentEndpoints = ['/payment/create-order', '/payment/verify', '/payment/cod'];

api.interceptors.request.use(
  (config) => {
    // Add retry count for payment endpoints
    if (paymentEndpoints.some(endpoint => config.url.includes(endpoint))) {
      config.retryCount = config.retryCount || 0;
      config.maxRetries = 2; // Retry twice
    }
    return config;
  }
);

// Retry interceptor for failed payment requests
api.interceptors.response.use(
  undefined,
  async (error) => {
    const config = error.config;
    
    // Check if it's a payment endpoint and we can retry
    if (paymentEndpoints.some(endpoint => config.url.includes(endpoint)) && 
        config.retryCount < config.maxRetries &&
        error.code !== 'ECONNABORTED' && // Don't retry timeout errors
        error.response?.status !== 401 && // Don't retry auth errors
        error.response?.status !== 422) { // Don't retry validation errors
      
      config.retryCount += 1;
      
      // Wait before retrying (exponential backoff)
      const delay = Math.min(1000 * Math.pow(2, config.retryCount), 10000);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      return api(config);
    }
    
    return Promise.reject(error);
  }
);

export default api;