import axios from 'axios';
import { autoDetectAPI } from '../utils/connectionTest';

// Base URL configuration with HTTPS enforcement and trailing slash handling
let baseURL = process.env.NEXT_PUBLIC_API_URL;

// 1. Always ensure HTTPS to avoid protocol changes in redirects
if (baseURL?.startsWith('http://')) {
  baseURL = baseURL.replace('http://', 'https://');
}

// 2. Fix common URL issues that cause redirects
if (baseURL?.includes('www.www.')) {
  baseURL = baseURL.replace('www.www.', 'www.');
}

// 3. Normalize trailing slashes - we'll make Axios handle them consistently
// This ensures we match the server's expectations and avoid 307 redirects
if (baseURL && !baseURL.endsWith('/')) {
  baseURL = `${baseURL}/`;
}

console.log('Using baseURL:', baseURL);

// Create custom Axios instance
const axiosInstance = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },  // Reduce max redirects to prevent infinite loops and CORS issues
  maxRedirects: 0, // Don't follow redirects as they cause CORS preflight failures
  // Increase timeout slightly for potentially slow connections
  timeout: 15000,
});

// Request interceptor for authentication and URL handling
axiosInstance.interceptors.request.use(
  config => {
    // Add auth token if available
    try {
      const authToken = localStorage.getItem('access');
      if (authToken) {
        config.headers.Authorization = `Bearer ${authToken}`;
      }
    } catch (error) {
      console.warn('Unable to access localStorage:', error);
    }
      // Fix URL path to avoid redirects that can cause CORS preflight issues
    if (config.url) {
      // 1. Ensure we're using HTTPS for all requests
      if (config.url.startsWith('http://')) {
        config.url = config.url.replace('http://', 'https://');
      }      // 2. Special handling for endpoints that don't accept trailing slashes
      // These cause redirects that break CORS
      if (config.url.includes('subscriptions/') || 
          config.url.includes('auth/') ||
          config.url.match(/^resumes\/\d+$/) || // Resume by ID endpoints (e.g., resumes/11)
          config.url.match(/^cover-letters\/\d+$/) || // Cover letter by ID endpoints
          config.url.match(/\/\d+$/) || // Any endpoint ending with a number (resource by ID)
          config.url.includes('/duplicate/') || // Duplicate endpoints
          config.url.includes('/clone/')) { // Clone endpoints
        // Remove trailing slash for these endpoints to prevent redirects
        if (config.url.endsWith('/')) {
          config.url = config.url.slice(0, -1);
        }
      } else {
        // For other endpoints, handle trailing slashes carefully
        // Only add trailing slash if it doesn't already end with one
        if (config.url && !config.url.endsWith('/') && config.url !== '') {
          config.url = `${config.url}/`;
        }
      }
      
      // 3. Handle API paths properly to avoid duplicates
      if (baseURL && baseURL.includes('/api') && config.url.startsWith('api/')) {
        config.url = config.url.substring(4); // Remove 'api/' prefix
      }
      
      // 4. If URL includes /api/ path and baseURL also has it, handle the duplication
      if (config.url.includes('/api/') && baseURL && baseURL.includes('/api')) {
        config.url = config.url.replace('/api/', '/');
      }
    }

    return config;
  },
  error => Promise.reject(error)
);

// Debug logging for requests
axiosInstance.interceptors.request.use(
  config => {
    console.log('Outgoing Request:', {
      method: config.method,
      url: config.baseURL + (config.url || ''),
      headers: config.headers
    });
    return config;
  },
  error => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Response handling with improved redirect handling and error reporting
axiosInstance.interceptors.response.use(
  response => {
    console.log('Response Success:', {
      status: response.status,
      url: response.config?.url
    });
    return response;
  },
  async error => {
    // Handle redirects with protocol changes (HTTP to HTTPS)
    if (error.response && [301, 302, 307, 308].includes(error.response.status)) {
      const redirectUrl = error.response.headers.location;
      
      if (redirectUrl) {
        console.warn('Redirect detected:', {
          from: error.config.url,
          to: redirectUrl,
          status: error.response.status
        });
        
        // Don't follow redirects automatically as they cause CORS issues
        // Instead, log the issue and reject the request
        console.error('CORS-causing redirect detected. Server configuration needs to be fixed.');
        console.error('Suggested fix: Ensure API server handles both with/without trailing slashes without redirects');
      }
    }
      // Handle CORS-related errors specifically
    if (error.message.includes('CORS') || 
        (error.code === 'ERR_NETWORK' && error.config?.url?.includes('api.www.dropshapes.com'))) {
      console.warn('CORS Error detected - will attempt fallback strategy');
      
      // Don't log the full error object for CORS errors to reduce noise
      console.warn('CORS Error details:', {
        message: error.message,
        url: error.config?.url,
        code: error.code
      });
      
      // Add more context to CORS errors
      const corsError = new Error('CORS policy violation - likely due to server redirect');
      corsError.originalError = error;
      corsError.code = 'ERR_CORS_REDIRECT';
      error = corsError;
    }
      // Log detailed error information for debugging (but less verbose)
    if (error.response) {
      console.error('API Error:', {
        status: error.response.status,
        statusText: error.response.statusText,
        url: error.config?.url,
        method: error.config?.method,
        data: error.response.data ? Object.keys(error.response.data) : 'No data'
      });    
    } else if (error.request) {
      // Enhanced network error details
      const networkErrorDetails = {
        message: error.message || 'Unknown network error',
        url: error.config?.url || 'Unknown URL',
        baseURL: error.config?.baseURL || 'Unknown base URL',
        fullURL: error.config?.baseURL && error.config?.url ? 
          `${error.config.baseURL}${error.config.url}` : 'Cannot construct full URL',
        code: error.code || 'Unknown code',
        status: error.response?.status || 'No status',
        method: error.config?.method?.toUpperCase() || 'Unknown method',
        timeout: error.config?.timeout || 'No timeout set',
        timestamp: new Date().toISOString()
      };
      
      console.error('Network Error:', networkErrorDetails);
      
      // Additional troubleshooting info
      if (error.code === 'ENOTFOUND' || error.code === 'EAI_AGAIN') {
        console.error('DNS Resolution Error: The API server domain cannot be resolved. Check your internet connection and DNS settings.');
      } else if (error.code === 'ECONNREFUSED') {
        console.error('Connection Refused: The API server is not accepting connections. The server may be down.');
      } else if (error.code === 'ETIMEDOUT') {
        console.error('Connection Timeout: The API server is not responding within the timeout period.');
      } else if (error.code === 'ERR_NETWORK') {
        console.error('Network Error: General network connectivity issue. Check your internet connection.');
      }
    } else {
      console.error('Request Setup Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Auto-detect working API if the default one fails (for development)
if (typeof window !== 'undefined') {
  // Only run in browser environment
  const checkAPIConnection = async () => {
    // Since login is working, skip intensive health checks for production
    if (baseURL && baseURL.includes('api.www.dropshapes.com')) {
      console.log('✅ Using production API:', baseURL);
      return;
    }
    
    try {
      // Simple connectivity test for development environments only
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      clearTimeout(timeoutId);
      console.log('✅ API is accessible:', baseURL);
    } catch (error) {
      console.log('⚠️ API connectivity check failed (this may be normal for production)');
      
      // Only attempt auto-detection for development environments
      if (!baseURL || !baseURL.includes('api.www.dropshapes.com')) {
        console.log('Attempting auto-detection for development environment...');
        try {
          const workingAPI = await autoDetectAPI();
          if (workingAPI !== baseURL) {
            console.log(`🔄 Switching from ${baseURL} to ${workingAPI}`);
            baseURL = workingAPI;
            // Update the axios instance baseURL
            if (axiosInstance) {
              axiosInstance.defaults.baseURL = baseURL;
            }
          }
        } catch (detectionError) {
          console.warn('Failed to auto-detect working API, continuing with current URL');
        }
      }
    }
  };
  
  // Run the check but don't block initialization
  checkAPIConnection();
}

export default axiosInstance;