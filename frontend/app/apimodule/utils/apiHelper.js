// API Helper utility to safely handle API requests and avoid CORS issues

/**
 * Safely constructs API URLs to prevent CORS issues with redirects
 * @param {string} endpoint The API endpoint path (without domain)
 * @param {Object} options Additional options
 * @returns {string} A properly formatted URL that won't cause redirect CORS issues
 */
export function safeApiUrl(endpoint, options = {}) {
  // Get base URL from environment or use default
  let baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.www.dropshapes.com/api/';
  
  // Ensure HTTPS protocol to prevent protocol-change redirects
  if (baseUrl.startsWith('http://')) {
    baseUrl = baseUrl.replace('http://', 'https://');
  }
  
  // Handle double 'www' subdomain issues - this is a key fix for the API connectivity problems
  if (baseUrl.includes('www.www.')) {
    baseUrl = baseUrl.replace('www.www.', 'www.');
  }
  
  // Specifically handle api.www.www. pattern which causes domain resolution errors
  if (baseUrl.includes('api.www.www.')) {
    baseUrl = baseUrl.replace('api.www.www.', 'api.www.');
  }
  
  // Ensure trailing slash on base URL
  if (!baseUrl.endsWith('/')) {
    baseUrl += '/';
  }
  
  // Make sure the domain includes 'www' if it's dropshapes.com
  if (!baseUrl.includes('//www.') && baseUrl.includes('dropshapes.com')) {
    baseUrl = baseUrl.replace('//api.', '//api.www.');
  }
  
  // Format the endpoint path
  let path = endpoint;
  
  // Remove leading slashes
  path = path.replace(/^\/+/, '');
  
  // Ensure trailing slash on the final path
  if (!path.endsWith('/')) {
    path += '/';
  }
  
  // Combine and return
  return `${baseUrl}${path}`;
}

/**
 * Makes a fetch request with proper CORS handling to avoid redirect issues
 * @param {string} endpoint The API endpoint path
 * @param {Object} options Fetch options
 * @returns {Promise} The fetch promise
 */
export async function safeFetch(endpoint, options = {}) {
  const url = safeApiUrl(endpoint);
  
  console.log('Making safeFetch request to:', url);
  
  // Default options that prevent CORS issues
  const defaultOptions = {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    mode: 'cors',
    credentials: 'include',
    // We now use follow by default instead of error to handle redirects better
    redirect: 'follow',
  };
  
  try {
    const response = await fetch(url, { ...defaultOptions, ...options });
    
    // Log detailed information for debugging
    if (!response.ok) {
      console.warn(`API request failed: ${response.status} ${response.statusText} for URL: ${url}`);
      
      // For CORS errors, suggest using the proxy
      if (response.status === 0 || response.type === 'opaqueredirect') {
        console.warn('Possible CORS issue detected. Consider using the Next.js API proxy.');
        // We could automatically retry with proxy here
      }
    }
    
    return response;
  } catch (error) {
    // Handle network errors and provide better diagnostic information
    console.error('Network request failed:', error.message);
    
    // Detect common CORS issues
    if (error.message.includes('CORS') || error.message.includes('opaque') || 
        error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      console.warn('Detected likely CORS issue - consider using the proxy route instead');
    }
    
    throw error;
  }
}

/**
 * Makes an axios request with proper CORS handling
 * @param {Object} axios The axios instance
 * @param {string} endpoint The API endpoint path
 * @param {Object} options Axios options
 * @returns {Promise} The axios promise
 */
export async function safeAxios(axios, endpoint, options = {}) {
  // Format the endpoint to ensure consistency
  let path = endpoint;
  
  // Remove leading slashes
  path = path.replace(/^\/+/, '');
  
  // Ensure trailing slash
  if (!path.endsWith('/')) {
    path += '/';
  }
  
  // Default options
  const defaultOptions = {
    withCredentials: true,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    // Allow redirects but limit them to avoid infinite loops
    maxRedirects: 5,
  };
  
  return axios.request({ url: path, ...defaultOptions, ...options });
}

/**
 * Multi-strategy fetch function that tries different approaches to get data
 * This is especially useful for handling CORS issues in production
 * @param {string} endpoint The API endpoint to fetch
 * @param {Object} options Request options
 * @returns {Promise<Object>} The parsed JSON data
 */
export async function multiStrategyFetch(endpoint, options = {}) {
  const errors = [];
  
  // Special case for discussion endpoints - use our custom API endpoint first
  if (endpoint.includes('discussions/') && endpoint.match(/discussions\/\d+/)) {
    try {
      console.log('Strategy 0: Using custom Next.js API route for discussion');
      const discussionId = endpoint.match(/discussions\/(\d+)/)?.[1];
      if (discussionId) {
        const localApiEndpoint = `/api/discussions/${discussionId}`;
        console.log(`- Fetching from local API endpoint: ${localApiEndpoint}`);
        
        const response = await fetch(localApiEndpoint, {
          ...options,
          headers: {
            ...(options.headers || {}),
            'Accept': 'application/json',
          },
        });
        
        if (response.ok) {
          return await response.json();
        }
        errors.push(`Strategy 0 failed: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      errors.push(`Strategy 0 error: ${error.message}`);
    }
  }
  
  // Strategy 1: Direct fetch with safeFetch
  try {
    console.log('Strategy 1: Using safeFetch');
    const response = await safeFetch(endpoint, options);
    if (response.ok) {
      return await response.json();
    }
    errors.push(`Strategy 1 failed: ${response.status} ${response.statusText}`);
  } catch (error) {
    errors.push(`Strategy 1 error: ${error.message}`);
  }
  
  // Strategy 2: Use Next.js proxy route
  try {
    console.log('Strategy 2: Using Next.js proxy');
    const proxyPath = `/proxy-api/${endpoint.replace(/^\/+/, '')}`;
    const response = await fetch(proxyPath, {
      ...options,
      // No need for CORS with same-origin requests
      mode: 'same-origin',
      credentials: 'same-origin',
    });
    
    if (response.ok) {
      return await response.json();
    }
    errors.push(`Strategy 2 failed: ${response.status} ${response.statusText}`);
  } catch (error) {
    errors.push(`Strategy 2 error: ${error.message}`);
  }
  
  // Strategy 3: Use Axios as final fallback
  if (typeof window !== 'undefined' && window.axios) {
    try {
      console.log('Strategy 3: Using Axios');
      const { data } = await window.axios.get(endpoint);
      return data;
    } catch (error) {
      errors.push(`Strategy 3 error: ${error.message}`);
    }
  }
    // STRATEGY 4: Try with a corrected discussions endpoint format
  // The issue might be confusion between discussion (singular) vs discussions (plural)
  if (endpoint.includes('discussions/')) {
    try {
      console.log('Strategy 4: Checking alternative endpoint format (singular)');
      const discussionId = endpoint.match(/discussions\/(\d+)/)?.[1];
      
      if (discussionId) {
        // Try the singular form 'discussion' instead of 'discussions'
        const alternateEndpoint = `discussion/${discussionId}`;
        console.log(`- Trying alternate endpoint: ${alternateEndpoint}`);
        
        const response = await safeFetch(alternateEndpoint, options);
        
        if (response.ok) {
          return await response.json();
        }
        
        errors.push(`Strategy 4 failed: ${response.status} ${response.statusText}`);
      } else {
        errors.push('Strategy 4 skipped: Could not extract discussion ID');
      }
    } catch (error) {
      errors.push(`Strategy 4 error: ${error.message}`);
    }
  }
  
  // STRATEGY 5: Try to simulate getting a single discussion from the list
  // If we can't get an individual discussion by ID, we'll try to fetch the list
  // and filter for the one we want
  if (endpoint.includes('discussions/')) {
    try {
      console.log('Strategy 5: Fetching from list and filtering');
      const discussionId = endpoint.match(/discussions\/(\d+)/)?.[1];
      
      if (discussionId) {
        // Get the entire discussions list
        const listEndpoint = 'discussions';
        console.log(`- Fetching all discussions and filtering for ID: ${discussionId}`);
        
        const response = await safeFetch(listEndpoint, options);
        
        if (response.ok) {
          const allDiscussions = await response.json();
          
          if (Array.isArray(allDiscussions)) {
            // Find the discussion with the matching ID
            const targetDiscussion = allDiscussions.find(d => 
              d.id.toString() === discussionId.toString()
            );
            
            if (targetDiscussion) {
              console.log('- Found discussion in the list!');
              return targetDiscussion;
            }
            
            errors.push('Strategy 5 failed: Discussion not found in list');
          } else {
            errors.push('Strategy 5 failed: Response is not an array');
          }
        } else {
          errors.push(`Strategy 5 failed: ${response.status} ${response.statusText}`);
        }
      } else {
        errors.push('Strategy 5 skipped: Could not extract discussion ID');
      }
    } catch (error) {
      errors.push(`Strategy 5 error: ${error.message}`);
    }
  }
  
  // If all strategies failed, throw a comprehensive error
  throw new Error(`All API request strategies failed: ${errors.join('; ')}`);
}
