// API Service utility for making HTTP requests with error handling and retry logic
import axiosInstance from '../axiosConfig/Axios';
import { multiStrategyFetch } from './apiHelper';

/**
 * Enhanced API service with comprehensive error handling and retry mechanisms
 */
class ApiService {
  constructor() {
    this.axiosInstance = axiosInstance;
  }
  /**
   * Generic request method with enhanced error handling and fallback
   * @param {string} method - HTTP method (get, post, put, delete, etc.)
   * @param {string} url - API endpoint URL
   * @param {Object} data - Request payload (for POST, PUT requests)
   * @param {Object} config - Additional axios configuration
   * @returns {Promise} Response data or throws enhanced error
   */
  async request(method, url, data = null, config = {}) {
    try {
      const requestConfig = {
        method,
        url,
        ...config,
      };

      // Add data for methods that support it
      if (data && ['post', 'put', 'patch'].includes(method.toLowerCase())) {
        requestConfig.data = data;
      }

      console.log(`Making ${method.toUpperCase()} request to: ${url}`);
      const response = await this.axiosInstance.request(requestConfig);
      console.log(`Request successful: ${response.status} ${response.statusText}`);
      return response;
    } catch (error) {
      console.error(`Direct API request failed for ${url}:`, error.message);
      
      // Enhanced error handling with specific error codes
      this.handleApiError(error, url, method);
      
      // Try fallback to Next.js proxy API route for network errors
      if (this.shouldUseFallback(error)) {
        console.log(`Attempting fallback for ${url}...`);
        return await this.requestViaProxy(method, url, data, config);
      }
      
      throw error;
    }
  }

  /**
   * Determine if we should use the fallback proxy route
   * @param {Error} error - The error from the direct request
   * @returns {boolean} True if we should try the fallback
   */
  shouldUseFallback(error) {
    // Use fallback for network errors, timeouts, or CORS issues
    return !error.response || 
           error.code === 'ERR_NETWORK' ||
           error.code === 'ENOTFOUND' ||
           error.code === 'TIMEOUT' ||
           error.message.includes('CORS') ||
           error.message.includes('Failed to fetch') ||
           error.message.includes('Network Error') ||
           (error.response && error.response.status >= 500);
  }

  /**
   * Make request via Next.js proxy API route as fallback
   * @param {string} method - HTTP method
   * @param {string} url - Original API URL
   * @param {Object} data - Request data
   * @param {Object} config - Request config
   * @returns {Promise} Response data
   */  async requestViaProxy(method, url, data = null, config = {}) {
    try {
      // Convert the original API URL to proxy URL
      // Handle the subscriptions endpoint path more carefully
      let proxyUrl = `/api/proxy-api/${url}`;
      
      // Remove any double slashes but preserve the path structure
      proxyUrl = proxyUrl.replace(/\/+/g, '/');
      
      console.log(`Making fallback request via proxy: ${proxyUrl}`);
      
      const fetchOptions = {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...config.headers,
        },
        // Prevent fetch from following redirects automatically
        redirect: 'manual',
      };

      // Add auth header if available
      try {
        const authToken = localStorage.getItem('access');
        if (authToken) {
          fetchOptions.headers.Authorization = `Bearer ${authToken}`;
        }
      } catch (error) {
        console.warn('Unable to access auth token:', error);
      }

      // Add body for POST, PUT, PATCH requests
      if (data && ['post', 'put', 'patch'].includes(method.toLowerCase())) {
        fetchOptions.body = JSON.stringify(data);
      }

      const response = await fetch(proxyUrl, fetchOptions);
      
      if (!response.ok) {
        throw new Error(`Proxy request failed: ${response.status} ${response.statusText}`);
      }

      const responseData = await response.json();
      
      // Return in axios-like format
      return {
        data: responseData,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      };
    } catch (proxyError) {
      console.error('Proxy request also failed:', proxyError);
      proxyError.code = 'API_FALLBACK_FAILED';
      proxyError.userMessage = 'All connection attempts failed. Please check your internet connection and try again.';
      throw proxyError;
    }
  }

  /**
   * GET request wrapper
   * @param {string} url - API endpoint URL
   * @param {Object} config - Additional axios configuration
   * @returns {Promise} Response data
   */
  async get(url, config = {}) {
    return this.request('get', url, null, config);
  }

  /**
   * POST request wrapper
   * @param {string} url - API endpoint URL
   * @param {Object} data - Request payload
   * @param {Object} config - Additional axios configuration
   * @returns {Promise} Response data
   */
  async post(url, data, config = {}) {
    return this.request('post', url, data, config);
  }

  /**
   * PUT request wrapper
   * @param {string} url - API endpoint URL
   * @param {Object} data - Request payload
   * @param {Object} config - Additional axios configuration
   * @returns {Promise} Response data
   */
  async put(url, data, config = {}) {
    return this.request('put', url, data, config);
  }

  /**
   * PATCH request wrapper
   * @param {string} url - API endpoint URL
   * @param {Object} data - Request payload
   * @param {Object} config - Additional axios configuration
   * @returns {Promise} Response data
   */
  async patch(url, data, config = {}) {
    return this.request('patch', url, data, config);
  }

  /**
   * DELETE request wrapper
   * @param {string} url - API endpoint URL
   * @param {Object} config - Additional axios configuration
   * @returns {Promise} Response data
   */
  async delete(url, config = {}) {
    return this.request('delete', url, null, config);
  }

  /**
   * Enhanced error handler that provides more context and specific error codes
   * @param {Error} error - The axios error object
   * @param {string} url - The requested URL
   * @param {string} method - The HTTP method
   */
  handleApiError(error, url, method) {
    // Add context to the error
    error.requestUrl = url;
    error.requestMethod = method;
    error.timestamp = new Date().toISOString();

    // Classify the error type
    if (!error.response) {
      // Network errors, CORS errors, or request setup errors
      if (error.message.includes('CORS') || 
          error.message.includes('Failed to fetch') ||
          error.message.includes('Network Error')) {
        error.code = 'API_NETWORK_ERROR';
        error.userMessage = 'Unable to connect to the server. Please check your internet connection.';
      } else if (error.message.includes('timeout')) {
        error.code = 'API_TIMEOUT_ERROR';
        error.userMessage = 'Request timed out. Please try again.';
      } else {
        error.code = 'API_REQUEST_FAILED';
        error.userMessage = 'Unable to connect to API. Please try again later.';
      }
    } else {
      // Server responded with an error status
      const status = error.response.status;
      
      switch (status) {
        case 400:
          error.code = 'API_BAD_REQUEST';
          error.userMessage = 'Invalid request. Please check your input.';
          break;
        case 401:
          error.code = 'API_UNAUTHORIZED';
          error.userMessage = 'Please log in to continue.';
          break;
        case 403:
          error.code = 'API_FORBIDDEN';
          error.userMessage = 'Access denied. You don\'t have permission for this action.';
          break;
        case 404:
          error.code = 'API_NOT_FOUND';
          error.userMessage = 'The requested resource was not found.';
          break;
        case 409:
          error.code = 'API_CONFLICT';
          error.userMessage = 'Conflict with existing data. Please refresh and try again.';
          break;
        case 422:
          error.code = 'API_VALIDATION_ERROR';
          error.userMessage = 'Validation failed. Please check your input.';
          break;
        case 429:
          error.code = 'API_RATE_LIMITED';
          error.userMessage = 'Too many requests. Please wait a moment before trying again.';
          break;
        case 500:
          error.code = 'API_SERVER_ERROR';
          error.userMessage = 'Server error. Please try again later.';
          break;
        case 502:
        case 503:
        case 504:
          error.code = 'API_UNAVAILABLE';
          error.userMessage = 'Service temporarily unavailable. Please try again later.';
          break;
        default:
          error.code = 'API_UNKNOWN_ERROR';
          error.userMessage = 'An unexpected error occurred. Please try again.';
      }
    }

    // Log the error for debugging
    console.error(`API Error [${error.code}]:`, {
      url,
      method,
      status: error.response?.status,
      message: error.message,
      userMessage: error.userMessage,
      timestamp: error.timestamp
    });
  }

  /**
   * Fallback fetch method using multiStrategyFetch for critical endpoints
   * @param {string} url - API endpoint URL
   * @param {Object} options - Fetch options
   * @returns {Promise} Response data
   */
  async fallbackFetch(url, options = {}) {
    try {
      console.log('Using fallback fetch strategy for:', url);
      return await multiStrategyFetch(url, options);
    } catch (error) {
      console.error('Fallback fetch failed:', error);
      // Enhance the error with our standard error codes
      error.code = 'API_FALLBACK_FAILED';
      error.userMessage = 'All connection attempts failed. Please try again later.';
      throw error;
    }
  }

  /**
   * Check if the API is available
   * @returns {Promise<boolean>} True if API is available
   */
  async checkHealth() {
    try {
      // Try a simple request to check if the API is responsive
      await this.get('health/', { timeout: 5000 });
      return true;
    } catch (error) {
      console.warn('API health check failed:', error.message);
      return false;
    }
  }

  /**
   * Retry a failed request with exponential backoff
   * @param {Function} requestFn - The request function to retry
   * @param {number} maxRetries - Maximum number of retry attempts
   * @param {number} baseDelay - Base delay in milliseconds
   * @returns {Promise} Response data
   */
  async retryRequest(requestFn, maxRetries = 3, baseDelay = 1000) {
    let lastError;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await requestFn();
      } catch (error) {
        lastError = error;
        
        // Don't retry for certain error types
        if (error.response?.status === 401 || 
            error.response?.status === 403 || 
            error.response?.status === 404) {
          break;
        }
        
        // Don't retry on the last attempt
        if (attempt === maxRetries) {
          break;
        }
        
        // Calculate delay with exponential backoff
        const delay = baseDelay * Math.pow(2, attempt);
        console.log(`Retrying request in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError;
  }
}

// Create and export a singleton instance
const apiService = new ApiService();

export default apiService;
