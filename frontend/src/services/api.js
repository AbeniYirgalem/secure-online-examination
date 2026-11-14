import axios from 'axios';

/**
 * Centralized Axios client instance.
 * Reads base URL from environment variables with fallback to local development backend.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - prepared for future token injection
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - centralized error formatting
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const formattedError = {
      message: error.response?.data?.message || error.message || 'Network error occurred',
      status: error.response?.status,
      data: error.response?.data,
    };
    return Promise.reject(formattedError);
  }
);

export default api;
