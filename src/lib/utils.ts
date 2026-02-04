import axios, { InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { ClientCookieManager } from './cookie-utils';

export function cn(...inputs: (string | undefined | null | false)[]) {
  return inputs.filter(Boolean).join(" ");
}

// Generate URL-friendly slug from title
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

// Token management utilities
export const tokenUtils = {

  getToken: () => {
    return ClientCookieManager.getPosSession();
  },

  // Set token in cookies (no localStorage)
  setToken: (token: string) => {
    ClientCookieManager.setPosSession(token);
  },

  // Remove token from cookies (no localStorage)
  removeToken: () => {
    ClientCookieManager.deleteCookie('pos-session');
    ClientCookieManager.deleteCookie('token');
  },

  // Clear all auth data (tokens in cookies; user in localStorage if present)
  clearAuth: () => {
    ClientCookieManager.clearAuthCookies();
  },

  // Check if user is authenticated using cookies
  isAuthenticated: () => {
    return ClientCookieManager.isAuthenticated();
  },

  // Decode JWT token
  decodeToken: (token: string) => {
    try {
      if (!token || typeof token !== 'string') {
        return null;
      }

      const parts = token.split('.');
      if (parts.length !== 3) {
        console.error("Invalid JWT token format - expected 3 parts, got:", parts.length);
        return null;
      }

      const payload = JSON.parse(atob(parts[1]));
      return payload;
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  },

  // Check if token is valid (not expired)
  isTokenValid: (token: string) => {
    try {
      if (!token || typeof token !== 'string' || token === '') {
        return false;
      }

      const decoded = tokenUtils.decodeToken(token);
      if (!decoded) {
        return false;
      }

      // Check if token has expired
      const currentTime = Math.floor(Date.now() / 1000);
      if (decoded.exp && decoded.exp < currentTime) {
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error validating token:", error);
      return false;
    }
  },

  // Refresh token and get cookie, store it, and return authrefresh payload
  refreshToken: async (): Promise<{ success: boolean; authrefresh?: any; error?: string }> => {
    try {
      // Check if we have a refresh token available
      const { ClientCookieManager } = await import('./cookie-utils');
      const refreshToken = ClientCookieManager.getRefreshToken();

      if (!refreshToken) {
        return {
          success: false,
          error: 'No refresh token available'
        };
      }

      // Call the refresh endpoint to get the cookie
      const { authAPI } = await import('./api');
      const response = await authAPI.refresh();

      if (response.status === 200 || response.status === 201) {
        const payload = response.data as any;
        const authrefresh = payload?.data ?? payload ?? {};

        // Store the authrefresh data using pos-session
        if (authrefresh['pos-session'] || authrefresh.accessToken) {
          // Prefer pos-session, fallback to accessToken for backward compatibility
          tokenUtils.setToken(authrefresh['pos-session'] || authrefresh.accessToken);
        }

        if (authrefresh.refreshToken && typeof window !== 'undefined') {
          ClientCookieManager.setRefreshToken(authrefresh.refreshToken);
        }

        return {
          success: true,
          authrefresh: authrefresh
        };
      }

      return {
        success: false,
        error: 'Failed to refresh token'
      };
    } catch (error: any) {
      console.error('Refresh token error:', error);

      // If refresh fails, clear all auth data
      tokenUtils.clearAuth();

      return {
        success: false,
        error: error.message || 'Failed to refresh token'
      };
    }
  },

  // Check if refresh token is available
  hasRefreshToken: (): boolean => {
    if (typeof window === 'undefined') return false;

    const { ClientCookieManager } = require('./cookie-utils');
    return !!ClientCookieManager.getRefreshToken();
  },

  // Validate current token and attempt refresh if needed
  validateAndRefresh: async (): Promise<{ valid: boolean; user?: any; refreshed?: boolean }> => {
    try {
      const token = tokenUtils.getToken();

      if (!token) {
        return { valid: false };
      }

      // Check if token is valid
      if (tokenUtils.isTokenValid(token)) {
        const user = tokenUtils.decodeToken(token);
        return { valid: true, user: user?.user || user };
      }

      // Token is invalid, try to refresh
      const refreshResult = await tokenUtils.refreshToken();

      if (refreshResult.success && refreshResult.authrefresh) {
        const user = refreshResult.authrefresh.user || refreshResult.authrefresh.userData;
        return { valid: true, user, refreshed: true };
      }

      return { valid: false };
    } catch (error) {
      console.error('Token validation error:', error);
      return { valid: false };
    }
  }
};

// Configure axios with interceptors for automatic token handling
export const configureAxios = () => {
  // Request interceptor to add token
  axios.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = tokenUtils.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error: AxiosError) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor to handle token expiration
  axios.interceptors.response.use(
    (response: AxiosResponse) => {
      return response;
    },
    async (error: AxiosError) => {
      const originalRequest = error.config as any;

      // Handle 401 (Unauthorized) and 403 (Forbidden)
      if (error.response?.status === 401 || error.response?.status === 403) {

        // 1. If this is already a retry, DO NOT logout. 
        // Just reject. This likely means permission denied for this resource.
        if (originalRequest._retry) {
          return Promise.reject(error);
        }

        // 2. If it's a 403 (Forbidden), DO NOT attempt refresh or logout.
        // It strictly means "Logged in, but no permission".
        if (error.response.status === 403) {
          return Promise.reject(error);
        }

        // 3. For 401, Try to refresh the token
        originalRequest._retry = true;

        try {
          const { tokenUtils } = await import('./utils');
          // Note: using dynamic import or ensuring tokenUtils is available

          const refreshResult = await tokenUtils.refreshToken();

          if (refreshResult.success && refreshResult.authrefresh) {
            const token = refreshResult.authrefresh['pos-session'] || refreshResult.authrefresh.accessToken;
            if (token) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              // If cookie based, the browser/api interaction might handle it, 
              // but for global axios we often use Bearer for consistency if configured so.
              // However, utils.ts configureAxios uses: config.headers.Authorization = `Bearer ${token}`;
              // So updating the cookie/storage is enough for the NEXT request, 
              // but for THIS retry we must set the header manually.

              return axios(originalRequest);
            }
          }

          // If refresh fails, THEN logout
          tokenUtils.clearAuth();
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        } catch (refreshError) {
          // Refresh failed
          tokenUtils.clearAuth();
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
      }
      return Promise.reject(error);
    }
  );
};

// Utility function to extract user role consistently
export const getUserRole = (user: any): string | undefined => {
  if (!user) {
    return undefined;
  }

  // Extract role from user object - check multiple possible locations
  if (typeof user.role === 'string') {
    return user.role.toLowerCase();
  } else if (typeof user.roleName === 'string') {
    return user.roleName.toLowerCase();
  } else if (user.roleId && typeof user.roleId.name === 'string') {
    return user.roleId.name.toLowerCase();
  }

  return undefined;
}; 
