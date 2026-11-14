import api from './api.js';

/**
 * Health check API service.
 * Performs availability and health status verification against the backend /api/health endpoint.
 */
export const checkBackendHealth = async () => {
  try {
    const response = await api.get('/health');
    return {
      success: true,
      message: response.data?.message || 'SOES API is running',
      raw: response.data,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || 'Unable to connect to SOES API server',
      status: error.status || 'UNREACHABLE',
      isNetworkError: error.isNetworkError || false,
      timestamp: new Date().toISOString(),
    };
  }
};

export default {
  checkBackendHealth,
};
