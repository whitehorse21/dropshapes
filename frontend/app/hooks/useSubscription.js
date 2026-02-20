"use client";

import { useState, useEffect, createContext, useContext } from 'react';
import axiosInstance from '../apimodule/axiosConfig/Axios';
import apiService from '../apimodule/utils/apiService';
import endpoints from '../apimodule/endpoints/ApiEndpoints';

// Subscription Context
const SubscriptionContext = createContext();

// Custom hook to use subscription context
export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

// Subscription Provider Component
export const SubscriptionProvider = ({ children }) => {
  const [subscription, setSubscription] = useState(null);
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [circuitBreakerOpen, setCircuitBreakerOpen] = useState(false);
  // Maximum retry attempts to prevent infinite loops
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 2000; // 2 seconds
  const CIRCUIT_BREAKER_TIMEOUT = 30000; // 30 seconds before allowing retry

  // Shared retry state to prevent multiple functions from retrying simultaneously
  const [globalRetryInProgress, setGlobalRetryInProgress] = useState(false);

  // Helper function to check if user is authenticated
  const isAuthenticated = () => {
    try {
      const authToken = localStorage.getItem('access');
      return !!authToken;
    } catch (error) {
      return false;
    }
  };

  // Fetch current subscription
  const fetchSubscription = async (isRetryAttempt = false) => {
    // Check authentication first to avoid unnecessary API calls
    if (!isAuthenticated()) {
      console.log('User not authenticated - skipping subscription fetch');
      setSubscription(null);
      setError('Authentication required');
      setLoading(false);
      return null;
    }

    // Circuit breaker: don't attempt if we've failed too many times recently
    if (circuitBreakerOpen) {
      console.log('Circuit breaker open - skipping subscription fetch');
      return null;
    }

    // Prevent concurrent retries
    if (globalRetryInProgress && !isRetryAttempt) {
      console.log('Global retry in progress - skipping duplicate subscription fetch');
      return null;
    }
      try {
      const response = await apiService.get(endpoints.mySubscription);
      setSubscription(response.data);
      setRetryCount(0); // Reset retry count on success
      setCircuitBreakerOpen(false); // Reset circuit breaker on success
      setGlobalRetryInProgress(false); // Reset global retry state
      return response.data;      } 
    catch (err) {
      console.error('Error fetching subscription:', err);
      
      // Handle authentication errors specifically
      if (err.response?.status === 401) {
        console.log('Authentication required for subscription data');
        setSubscription(null);
        setError('Authentication required');
        setGlobalRetryInProgress(false);
        return null;
      }
      
      // Enhanced error detection including API service errors
      const isNetworkError = !err.response || 
                           err.code === 'ERR_NETWORK' || 
                           err.code === 'API_UNAVAILABLE' ||
                           err.code === 'API_REQUEST_FAILED' ||
                           err.message.includes('CORS') ||
                           err.message.includes('Failed to fetch') ||
                           err.message.includes('Unable to connect to API') ||
                           (err.response && err.response.status >= 500);
      
      // Be more conservative with retries - only retry for true network errors
      const shouldRetry = (err.code === 'ERR_NETWORK' || err.message.includes('Failed to fetch')) &&
                         retryCount < MAX_RETRIES && 
                         !isRetrying && 
                         !isRetryAttempt;
      
      if (shouldRetry) {
        console.log(`Retrying subscription fetch (attempt ${retryCount + 1}/${MAX_RETRIES})`);
        setIsRetrying(true);
        setGlobalRetryInProgress(true);
        
        setTimeout(async () => {
          setRetryCount(prev => prev + 1);
          try {
            await fetchSubscription(true); // Mark as retry attempt
          } finally {
            setIsRetrying(false);
            setGlobalRetryInProgress(false);
          }
        }, RETRY_DELAY);
        
        return null;
      } else if (retryCount >= MAX_RETRIES || isRetryAttempt) {
        // Open circuit breaker after max retries
        if (retryCount >= MAX_RETRIES) {
          console.log('Max retries exceeded - opening circuit breaker');
          setCircuitBreakerOpen(true);
          
          // Auto-reset circuit breaker after timeout
          setTimeout(() => {
            console.log('Circuit breaker timeout - allowing retry');
            setCircuitBreakerOpen(false);
            setRetryCount(0);
          }, CIRCUIT_BREAKER_TIMEOUT);
        }
        
        setGlobalRetryInProgress(false);
        setIsRetrying(false);
      }      
      // Provide a user-friendly error message
      let errorMessage = 'Failed to fetch subscription';
      if (err.code === 'API_UNAVAILABLE') {
        errorMessage = 'Unable to connect to subscription service. Please check your connection.';
      } else if (err.response?.status === 401) {
        errorMessage = 'Please log in to view your subscription.';
      } else if (err.response?.status === 403) {
        errorMessage = 'Access denied. Please check your permissions.';
      } else if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      }
      
      setError(errorMessage);
      return null;
    }
  };// Fetch usage summary
  const fetchUsage = async (isRetryAttempt = false) => {
    // Check authentication first to avoid unnecessary API calls
    if (!isAuthenticated()) {
      console.log('User not authenticated - skipping usage fetch');
      setUsage(null);
      setError('Authentication required');
      setLoading(false);
      return null;
    }

    // Circuit breaker: don't attempt if we've failed too many times recently
    if (circuitBreakerOpen) {
      console.log('Circuit breaker open - skipping usage fetch');
      return null;
    }

    // Prevent concurrent retries
    if (globalRetryInProgress && !isRetryAttempt) {
      console.log('Global retry in progress - skipping duplicate usage fetch');
      return null;
    }
      try {
      const response = await apiService.get(endpoints.subscriptionUsage);
      setUsage(response.data);
      setRetryCount(0); // Reset retry count on success
      setCircuitBreakerOpen(false); // Reset circuit breaker on success
      setGlobalRetryInProgress(false); // Reset global retry state
      return response.data;    } catch (err) {
      console.error('Error fetching usage:', err);
      
      // Handle authentication errors specifically
      if (err.response?.status === 401) {
        console.log('Authentication required for usage data');
        setUsage(null);
        setError('Authentication required');
        setGlobalRetryInProgress(false);
        return null;
      }
      
      // Enhanced error detection including API service errors
      const isNetworkError = !err.response || 
                           err.code === 'ERR_NETWORK' || 
                           err.code === 'API_UNAVAILABLE' ||
                           err.code === 'API_REQUEST_FAILED' ||
                           err.message.includes('CORS') ||
                           err.message.includes('Failed to fetch') ||
                           err.message.includes('Unable to connect to API') ||
                           (err.response && err.response.status >= 500);
      
      // Be more conservative with retries - only retry for true network errors
      const shouldRetry = (err.code === 'ERR_NETWORK' || err.message.includes('Failed to fetch')) &&
                         retryCount < MAX_RETRIES && 
                         !isRetrying && 
                         !isRetryAttempt;
      
      if (shouldRetry) {
        console.log(`Retrying usage fetch (attempt ${retryCount + 1}/${MAX_RETRIES})`);
        setIsRetrying(true);
        setGlobalRetryInProgress(true);
        
        setTimeout(async () => {
          setRetryCount(prev => prev + 1);
          try {
            await fetchUsage(true); // Mark as retry attempt
          } finally {
            setIsRetrying(false);
            setGlobalRetryInProgress(false);
          }
        }, RETRY_DELAY);
        
        return null;
      } else if (retryCount >= MAX_RETRIES || isRetryAttempt) {
        // Open circuit breaker after max retries
        if (retryCount >= MAX_RETRIES) {
          console.log('Max retries exceeded - opening circuit breaker');
          setCircuitBreakerOpen(true);
          
          // Auto-reset circuit breaker after timeout
          setTimeout(() => {
            console.log('Circuit breaker timeout - allowing retry');
            setCircuitBreakerOpen(false);
            setRetryCount(0);
          }, CIRCUIT_BREAKER_TIMEOUT);
        }
        
        setGlobalRetryInProgress(false);
        setIsRetrying(false);
      }      
      // Provide a user-friendly error message
      let errorMessage = 'Failed to fetch usage data';
      if (err.code === 'API_UNAVAILABLE') {
        errorMessage = 'Unable to connect to usage service. Please check your connection.';
      } else if (err.response?.status === 401) {
        errorMessage = 'Please log in to view your usage.';
      } else if (err.response?.status === 403) {
        errorMessage = 'Access denied. Please check your permissions.';
      } else if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      }
      
      setError(errorMessage);
      return null;
    }
  };
  // Check if user can create a resume
  const canCreateResume = async () => {
    try {
      const response = await apiService.get(endpoints.canCreateResume);
      return response.data.can_create;
    } catch (err) {
      console.error('Error checking resume creation permission:', err);
      return false;
    }
  };

  // Check if user can create a cover letter
  const canCreateCoverLetter = async () => {
    try {
      const response = await apiService.get(endpoints.canCreateCoverLetter);
      return response.data.can_create;
    } catch (err) {
      console.error('Error checking cover letter creation permission:', err);
      return false;
    }
  };// Refresh subscription and usage data
  const refresh = async () => {
    // Prevent refresh if already retrying to avoid cascading requests
    if (isRetrying || globalRetryInProgress) {
      console.log('Refresh skipped - already retrying');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Use Promise.allSettled to handle individual failures gracefully
      const results = await Promise.allSettled([
        fetchSubscription(),
        fetchUsage()
      ]);
      
      // Log any failures for debugging
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          const type = index === 0 ? 'subscription' : 'usage';
          console.warn(`Failed to fetch ${type}:`, result.reason);
        }
      });
      
    } catch (err) {
      console.error('Error refreshing subscription data:', err);
    } finally {
      setLoading(false);
    }
  };  // Initialize data on mount
  useEffect(() => {
    let mounted = true;
    
    const initializeData = async () => {
      if (mounted && !isRetrying && !globalRetryInProgress) {
        await refresh();
      }
    };
    
    initializeData();
    
    return () => {
      mounted = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [globalRetryInProgress, isRetrying]); // Empty dependency array - we only want this to run once on mount

  // Helper functions to check limits
  const isAtResumeLimit = () => {
    if (!subscription || !usage) return false;
    if (subscription.resume_limit === -1) return false; // Unlimited
    return usage.current_resumes >= subscription.resume_limit;
  };

  const isAtCoverLetterLimit = () => {
    if (!subscription || !usage) return false;
    if (subscription.cover_letter_limit === -1) return false; // Unlimited
    return usage.current_cover_letters >= subscription.cover_letter_limit;
  };

  const getRemainingResumes = () => {
    if (!subscription || !usage) return 0;
    if (subscription.resume_limit === -1) return Infinity; // Unlimited
    return Math.max(0, subscription.resume_limit - usage.current_resumes);
  };

  const getRemainingCoverLetters = () => {
    if (!subscription || !usage) return 0;
    if (subscription.cover_letter_limit === -1) return Infinity; // Unlimited
    return Math.max(0, subscription.cover_letter_limit - usage.current_cover_letters);
  };

  const getUsagePercentage = (type) => {
    if (!subscription || !usage) return 0;
    
    if (type === 'resume') {
      if (subscription.resume_limit === -1) return 0; // Unlimited
      return Math.min(100, (usage.current_resumes / subscription.resume_limit) * 100);
    } else if (type === 'cover_letter') {
      if (subscription.cover_letter_limit === -1) return 0; // Unlimited
      return Math.min(100, (usage.current_cover_letters / subscription.cover_letter_limit) * 100);
    }
    
    return 0;
  };

  const value = {
    subscription,
    usage,
    loading,
    error,
    fetchSubscription,
    fetchUsage,
    canCreateResume,
    canCreateCoverLetter,
    refresh,
    isAtResumeLimit,
    isAtCoverLetterLimit,
    getRemainingResumes,
    getRemainingCoverLetters,
    getUsagePercentage
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};

// Standalone subscription service functions (for use outside React components)
export const subscriptionService = {
  async checkCanCreateResume() {
    try {
      const response = await axiosInstance.get(endpoints.canCreateResume);
      return response.data.can_create;
    } catch (err) {
      console.error('Error checking resume creation permission:', err);
      return false;
    }
  },

  async checkCanCreateCoverLetter() {
    try {
      const response = await axiosInstance.get(endpoints.canCreateCoverLetter);
      return response.data.can_create;
    } catch (err) {
      console.error('Error checking cover letter creation permission:', err);
      return false;
    }
  },

  async getUsage() {
    try {
      const response = await axiosInstance.get(endpoints.subscriptionUsage);
      return response.data;
    } catch (err) {
      console.error('Error fetching usage:', err);
      return null;
    }
  },

  async getSubscription() {
    try {
      const response = await axiosInstance.get(endpoints.mySubscription);
      return response.data;
    } catch (err) {
      console.error('Error fetching subscription:', err);
      return null;
    }
  }
};
