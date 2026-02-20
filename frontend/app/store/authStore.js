import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import axiosInstance from '../apimodule/axiosConfig/Axios';
import endpoints from '../apimodule/endpoints/ApiEndpoints';

const TOKEN_EXPIRY_TIME = 24 * 60 * 60 * 1000; // 1 day in milliseconds

const useAuthStore = create(persist((set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      error: null,
      expiryTime: null,
      
      // Set the logout timer
      setLogoutTimer: (expiryTime) => {
        const currentTime = new Date().getTime();
        const remainingTime = expiryTime - currentTime;
        
        // Clear any existing timer
        if (get().logoutTimer) {
          clearTimeout(get().logoutTimer);
        }
        
        // Only set timer if there's remaining time
        if (remainingTime > 0) {
          const logoutTimer = setTimeout(() => {
            get().logout();
          }, remainingTime);
          
          set({ logoutTimer });
        } else {
          // Token already expired, logout immediately
          get().logout();
        }
      },
      
      // Initialize auth state from localStorage on app load
      initializeAuth: () => {
        const { expiryTime } = get();
        
        if (expiryTime) {
          // Check if token is still valid
          if (new Date().getTime() < expiryTime) {
            get().setLogoutTimer(expiryTime);
          } else {
            // Token expired, logout
            get().logout();
          }
        }
      },
      
      // Register new user
      register: async (userData) => {
        set({ loading: true, error: null });
        
        try {
          const response = await axiosInstance.post(
            endpoints.register, 
            userData
          );
          
          const { access_token, user } = response.data;
          const expiryTime = new Date().getTime() + TOKEN_EXPIRY_TIME;
          
          // Store token in localStorage for axios interceptor
          localStorage.setItem('access', access_token);
          
          set({
            user,
            token: access_token,
            isAuthenticated: true,
            loading: false,
            expiryTime,
            error: null
          });
          
          get().setLogoutTimer(expiryTime);
          
          return { success: true, user };
        } catch (error) {
          const errorMessage = error.response?.data?.detail || 'Registration failed';
          set({
            loading: false,
            error: errorMessage
          });
          return { success: false, error: errorMessage };
        }
      },
      
      // Login user
      login: async (credentials) => {
        set({ loading: true, error: null });
        
        try {
          const response = await axiosInstance.post(
            endpoints.login, 
            credentials
          );
          
          const { access_token, user } = response.data;
          const expiryTime = new Date().getTime() + TOKEN_EXPIRY_TIME;
          
          // Store token in localStorage for axios interceptor
          localStorage.setItem('access', access_token);
          
          set({
            user,
            token: access_token,
            isAuthenticated: true,
            loading: false,
            expiryTime,
            error: null
          });
          
          get().setLogoutTimer(expiryTime);
          
          return { success: true, user };        } catch (error) {
          console.error('Login error details:', {
            error,
            response: error.response,
            request: error.request,
            message: error.message,
            code: error.code,
            config: error.config
          });
          
          // Log the actual URL being called for debugging
          console.log('Login endpoint being called:', endpoints.login);
          console.log('Full URL would be:', axiosInstance.defaults.baseURL + endpoints.login);
          
          // Provide user-friendly error messages based on error type
          let errorMessage;
          
          if (error.response) {
            // Server responded with error status
            errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message || 
                          `Server error: ${error.response.status}`;
          } else if (error.request) {
            // Network error - no response received
            if (error.code === 'ENOTFOUND' || error.code === 'EAI_AGAIN') {
              errorMessage = 'Unable to connect to server. Please check your internet connection.';
            } else if (error.code === 'ECONNREFUSED') {
              errorMessage = 'Server is currently unavailable. Please try again later.';
            } else if (error.code === 'ETIMEDOUT') {
              errorMessage = 'Connection timeout. Please check your network and try again.';
            } else if (error.code === 'ERR_NETWORK') {
              errorMessage = 'Network error. Please check your internet connection and try again.';
            } else {
              errorMessage = 'Unable to connect to server. Please try again later.';
            }
          } else {
            // Request setup error
            errorMessage = 'An unexpected error occurred. Please try again.';
          }
          
          set({
            loading: false,
            error: errorMessage
          });
          return { success: false, error: errorMessage };
        }
      },
      
      // Logout user
      logout: () => {
        // Clear the logout timer if it exists
        const { logoutTimer } = get();
        if (logoutTimer) {
          clearTimeout(logoutTimer);
        }
        
        // Remove token from localStorage
        localStorage.removeItem('access');
        
        // Reset auth state
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          expiryTime: null,
          logoutTimer: null,
          error: null
        });
        
        // Optional: Redirect to login page
        // window.location.href = '/login';
      },
        // Check if user is authenticated
      checkAuth: () => {
        const { expiryTime } = get();
        return expiryTime && new Date().getTime() < expiryTime;
      },
      
      // Check if current user is admin
      isAdmin: () => {
        const { user, isAuthenticated } = get();
        return isAuthenticated && user && user.is_admin === true;
      },
      
      // Get user role
      getUserRole: () => {
        const { user, isAuthenticated } = get();
        if (!isAuthenticated || !user) return null;
        return user.is_admin ? 'admin' : 'user';
      },

      // Clear any errors
      clearError: () => set({ error: null }),
      
      // Update user data in store
      updateUser: (userData) => set({ user: { ...get().user, ...userData } })
    }),
    {
      name: 'auth-storage', // name of the item in localStorage
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token, 
        isAuthenticated: state.isAuthenticated,
        expiryTime: state.expiryTime
      })
    }
  )
);

// Initialize auth on import
const initializer = () => {
  const authStore = useAuthStore.getState();
  if (authStore.expiryTime) {
    authStore.initializeAuth();
  }
  return null;
};
initializer();

export default useAuthStore;
