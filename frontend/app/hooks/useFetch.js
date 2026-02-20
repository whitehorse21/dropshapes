import { useState, useCallback } from 'react';

/**
 * Custom hook to replace use-http package functionality
 * Compatible with React 19
 */
export default function useFetch(baseUrl = '') {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  // Get API base URL
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const getBaseUrl = () => {
    if (baseUrl) return baseUrl;
    
    let apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (apiUrl?.startsWith('http://')) {
      apiUrl = apiUrl.replace('http://', 'https://');
    }
    if (apiUrl && !apiUrl.endsWith('/')) {
      apiUrl = `${apiUrl}/`;
    }
    return apiUrl || '/api/';
  };

  // Get auth token
  const getAuthToken = () => {
    if (typeof window === 'undefined') return null;
    try {
      return localStorage.getItem('access');
    } catch (error) {
      console.warn('Unable to access localStorage:', error);
      return null;
    }
  };

  const request = useCallback(async (url, options = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const fullUrl = `${getBaseUrl()}${url}`;
      const authToken = getAuthToken();
      
      const response = await fetch(fullUrl, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
          ...options.headers
        },
        credentials: 'include',
        ...options
      });

      let data;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setResponse(data);
      return data;
    } catch (err) {
      setError(err);
      throw err;    
    } 
      finally 
      {
      setLoading(false);
    }
  }, [getBaseUrl]);

  const get = useCallback((url, options = {}) => {
    return request(url, { ...options, method: 'GET' });
  }, [request]);

  const post = useCallback((url, body, options = {}) => {
    return request(url, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body)
    });
  }, [request]);

  const put = useCallback((url, body, options = {}) => {
    return request(url, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body)
    });
  }, [request]);

  const del = useCallback((url, options = {}) => {
    return request(url, { ...options, method: 'DELETE' });
  }, [request]);

  const patch = useCallback((url, body, options = {}) => {
    return request(url, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(body)
    });
  }, [request]);

  return {
    loading,
    response,
    error,
    get,
    post,
    put,
    delete: del,
    patch,
    request
  };
}
