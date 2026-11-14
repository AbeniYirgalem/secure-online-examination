import axios from 'axios';

/**
 * Resolves the API base URL from Vite environment or falls back to local Express default.
 */
const getBaseUrl = () => {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL) {
      return import.meta.env.VITE_API_BASE_URL;
    }
  } catch {
    // Fallback for non-Vite environments
  }
  return 'http://localhost:5000/api';
};

/**
 * Centralized Axios client instance for the SOES application.
 * Reads API base URL with fallback to local Express development server.
 */
const api = axios.create({
  baseURL: getBaseUrl(),
  timeout: 10000,
  withCredentials: true, // Enables cross-origin HttpOnly cookie transmission
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request interceptor - prepared for future JWT authorization injection
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject({
      message: error.message || 'Client request setup error',
      isNetworkError: false,
    });
  }
);

// Response interceptor - centralized and consistent error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    let formattedMessage = 'An unexpected server error occurred.';
    let isNetworkError = false;

    if (error.response) {
      // Server responded with an error HTTP status code (4xx, 5xx)
      formattedMessage =
        error.response.data?.message ||
        `Server error with status code ${error.response.status}`;
    } else if (error.request) {
      // The request was sent but no response was received (backend offline, CORS blocked)
      isNetworkError = true;
      formattedMessage =
        'Backend server is unreachable. Ensure the Express server is running on http://localhost:5000.';
    } else {
      formattedMessage = error.message || formattedMessage;
    }

    const standardizedError = {
      message: formattedMessage,
      status: error.response?.status || null,
      data: error.response?.data || null,
      isNetworkError,
    };

    return Promise.reject(standardizedError);
  }
);

export default api;
