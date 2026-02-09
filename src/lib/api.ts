import axios from 'axios';
import { tokenUtils } from './utils';
import { env } from './env';

const getBaseURL = () => {
  // Prefer client-side URL for browser requests, fallback to server-side URL
  return env.BACKEND_URL;
};



const API_BASE_URL = getBaseURL();

let nextAuthAccessTokenCache: string | null = null;
let nextAuthTokenFetchedAt = 0;
const NEXTAUTH_TOKEN_TTL_MS = 60000;
let nextAuthTokenPromise: Promise<string | null> | null = null;

type CacheEntry = { ts: number; res: any };
const GET_CACHE_TTL_MS = 60000;
const getCache = new Map<string, CacheEntry>();

const buildCacheKey = (config: any) => {
  const url = (config.url || '').toString();
  const params = config.params ? JSON.stringify(config.params) : '';
  const auth = config.headers?.Authorization || '';
  return `${config.baseURL || ''}${url}|${params}|${auth}`;
};

// Utility function to parse cookies from Set-Cookie header
export const parseSetCookie = (setCookieHeader: string | null): Record<string, string> => {
  if (!setCookieHeader) {
    return {};
  }

  const cookies: Record<string, string> = {};

  // Split by comma, but be careful about commas in cookie values
  const cookieStrings = setCookieHeader.split(/,(?=[^,]+=)/);

  cookieStrings.forEach(cookieString => {
    // Split by semicolon to get name=value part
    const parts = cookieString.split(';');
    const nameValuePart = parts[0].trim();

    if (nameValuePart && nameValuePart.includes('=')) {
      const equalIndex = nameValuePart.indexOf('=');
      const name = nameValuePart.substring(0, equalIndex).trim();
      const value = nameValuePart.substring(equalIndex + 1).trim();

      if (name && value) {
        cookies[name] = value;
      }
    }
  });

  return cookies;
};

// Utility function to manually set a cookie (for testing)
export const setCookie = (name: string, value: string, days: number = 1) => {
  if (typeof window !== 'undefined') {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
  }
};

// Utility function to get a specific cookie
export const getCookie = (name: string): string | null => {
  if (typeof window !== 'undefined') {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null;
    }
  }
  return null;
};

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: false, // Disabled by default - we manually control Cookie header to send ONLY pos-session
  headers: {
    'Accept': 'application/json',
  },
});

// Add request interceptor to include token and set Content-Type
api.interceptors.request.use(
  async (config) => {
    const url = (config.url || '').toString();
    const isAuthLogin = url.includes('/auth/login');
    const isAuthRegister = url.includes('/auth/register');
    const isAuthForgot = url.includes('/auth/forgotPassword') || url.includes('/auth/verifyOtp') || url.includes('/auth/resetPassword');
    const isPublicAuthEndpoint = isAuthLogin || isAuthRegister || isAuthForgot;
    const isProtectedEndpoint = /^\/(admin|super-admin|reports|auth\/me)/.test(url);

    if ((config.method || 'get').toLowerCase() === 'get') {
      const key = buildCacheKey(config);
      const entry = getCache.get(key);
      if (entry && Date.now() - entry.ts <= GET_CACHE_TTL_MS) {
        config.adapter = async () => entry.res;
      }
    }

    // Get token for protected endpoints
    let token: string | null = null;

    if (isProtectedEndpoint && typeof window !== 'undefined') {
      // First try to get pos-session cookie directly
      token = getCookie('pos-session');

      // If still no token, get from NextAuth session
      if (!token) {
        try {
          const now = Date.now();
          const cacheValid = nextAuthAccessTokenCache && (now - nextAuthTokenFetchedAt) <= NEXTAUTH_TOKEN_TTL_MS;
          if (!cacheValid) {
            if (!nextAuthTokenPromise) {
              nextAuthTokenPromise = (async () => {
                const { getSession } = await import('next-auth/react');
                const session = await getSession();
                nextAuthAccessTokenCache = session?.['pos-session'] || null;
                nextAuthTokenFetchedAt = Date.now();
                return nextAuthAccessTokenCache;
              })().finally(() => {
                nextAuthTokenPromise = null;
              });
            }
            await nextAuthTokenPromise;
          }
          if (nextAuthAccessTokenCache) {
            token = nextAuthAccessTokenCache;
          }
        } catch (e) {
          console.error('Error getting NextAuth session:', e);
        }
      }
    }

    // CRITICAL: Set ONLY pos-session in Cookie header for protected endpoints
    // Backend expects ONLY pos-session cookie, remove all other cookies
    // Disable withCredentials to prevent browser from auto-sending all cookies
    if (isProtectedEndpoint) {
      if (typeof window !== 'undefined') {

        config.withCredentials = true;
        // Do NOT set config.headers.Cookie manually here
      } else {
        // Server environment (SSR): Manually control cookies
        // Disable automatic cookie sending - we'll manually control it
        config.withCredentials = false;

        if (token) {
          // Set ONLY pos-session cookie, ignore all other cookies
          config.headers.Cookie = `pos-session=${token}`;
        } else {
          // Remove Cookie header if no token available
          delete config.headers.Cookie;
          // Log warning if no token found for protected endpoint
          console.warn(`[API] No pos-session token available for protected endpoint: ${url}`);
        }
      }
    } else {
      // For non-protected endpoints, keep withCredentials as is (might be needed for CORS)
      // But remove Cookie header to avoid sending unnecessary cookies
      delete config.headers.Cookie;
    }

    // Set Content-Type to application/json only for non-FormData requests
    if (!(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }

    // Add error handling for network issues
    config.validateStatus = (status) => {
      return status >= 200 && status < 300; // default
    };

    return config;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token expiration and extract cookies
api.interceptors.response.use(
  (response) => {
    const url = (response.config?.url || '').toString();
    const isAuthLogin = url.includes('/auth/login');

    // Extract tokens from login response body (if backend sends them in body)
    if (isAuthLogin && response.data && typeof window !== 'undefined') {
      try {
        const data = response.data;
        const posSession = data?.data?.['pos-session'] || data?.['pos-session'] ||
          data?.data?.accessToken || data?.accessToken ||
          data?.data?.token || data?.token;
      } catch (e) {
        console.error('Error extracting token from login response:', e);
      }
    }

    // Extract tokens from Set-Cookie headers and store them
    // Note: Browser handles Set-Cookie automatically. We don't need to manually set them.
    // Removing manual extraction prevents accidental overwrites (e.g. accessToken overriding pos-session).

    const method = response?.config?.method || 'get';
    if (method.toLowerCase() === 'get' && response?.status === 200) {
      const key = buildCacheKey(response.config);
      getCache.set(key, { ts: Date.now(), res: response });
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle network errors
    if (!error.response) {
      if (process.env.NODE_ENV !== 'production') {
        console.error("Network error:", error.message);
      }
      if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error' || error.message === 'fetch failed') {
        if (process.env.NODE_ENV !== 'production') {
          console.error("Backend server may be down or unreachable");
        }
        return Promise.reject(error);
      }
    }

    if (error.response?.status === 401 || error.response?.status === 403) {
      // Check if this is already a retry attempt to avoid infinite loops
      if (originalRequest._retry) {
        // If it was a retry and still failed (401/403), it means the token is technically valid (refreshed),
        // but this specific endpoint is rejecting it (or server is misconfigured).
        // DO NOT logout the user here. Just reject so the UI can handle it.
        return Promise.reject(error);
      }

      // Check if NextAuth session exists before redirecting
      // This prevents redirecting when user is authenticated via NextAuth but backend session is missing
      if (typeof window !== 'undefined') {
        try {
          const { getSession } = await import('next-auth/react');
          const session = await getSession();

          if (session?.['pos-session']) {
            // NextAuth session exists - backend session might have expired

            originalRequest._retry = true;

            if (session['pos-session']) {
              // Set ONLY pos-session in Cookie header (remove all other cookies)
              originalRequest.withCredentials = false; // Disable auto cookie sending
              originalRequest.headers.Cookie = `pos-session=${session['pos-session']}`;
              return api(originalRequest);
            }

            // If no access token, reject and let user refresh/re-login
            return Promise.reject({
              ...error,
              message: 'Backend session expired. Please refresh the page.',
              needsRefresh: true
            });
          }
        } catch (e) {
          if (process.env.NODE_ENV !== 'production') {
            console.error('Error checking NextAuth session:', e);
          }
          // If we can't check NextAuth session, continue with legacy flow
        }
      }

      // Mark this request as a retry attempt
      originalRequest._retry = true;

      try {
        // Attempt to refresh the token
        const refreshResult = await tokenUtils.refreshToken();

        if (refreshResult.success && refreshResult.authrefresh) {
          // Prefer pos-session, fallback to accessToken for backward compatibility
          const token = refreshResult.authrefresh['pos-session'] || refreshResult.authrefresh.accessToken;
          if (token) {
            // Update the Cookie header with ONLY the new pos-session token (remove all other cookies)
            originalRequest.withCredentials = false; // Disable auto cookie sending
            originalRequest.headers.Cookie = `pos-session=${token}`;

            // Retry the original request with the new token
            return api(originalRequest);
          }
        }

        // Refresh failed, clear auth data and redirect to login
        tokenUtils.clearAuth();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      } catch (refreshError) {
        if (process.env.NODE_ENV !== 'production') {
          console.error('Token refresh failed:', refreshError);
        }
        // Refresh failed, clear auth data and redirect to login
        tokenUtils.clearAuth();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

// Authentication APIS
// Auth API
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }, { withCredentials: true }),
  me: () =>
    api.get('/auth/me'),

  signup: (userData: {
    name: string;
    email: string;
    password: string;
    phone: string;
    businessName: string;
    businessCategory: string;
  }) =>
    api.post('/auth/register', userData),

  logout: () =>
    api.post('/auth/logout'),

  forgotPassword: (email: string) =>
    api.post('/auth/forgotPassword', { email }),

  verifyOTP: (email: string, otp: string) =>
    api.post('/auth/verifyOtp', { email, otp }),

  resetPassword: (email: string, otp: string, newPassword: string, confirmPassword: string) =>
    api.post('/auth/resetPassword', { email, otp, newPassword, confirmPassword }),

  refresh: () =>
    api.post('/auth/refresh', {}, {
      withCredentials: true, // Ensure credentials are sent for refresh token
    }),

};

// Landing Page APIS
// Public API (for landing page)
export const publicAPI = {
  // Get Miscellaneous Settings (for Landing Page)
  getMiscellaneousSettings: () =>
    api.get('/misc-settings'),

  // Get Business Categories (for Register Page)
  getBusinessCategories: () =>
    api.get('/business-categories'),

  // Get General Settings (for Landing Page)
  getGeneralSettings: () =>
    api.get('/general-settings'),

  // Get Invoice Design Settings
  getInvoiceDesign: () =>
    api.get('/admin/invoice-design'),

  // Get Advertisements (for Landing Page)
  getAdvertisements: () =>
    api.get('/advertisements'),

  // Get Hero Section (for Landing Page)
  getHeroSection: () =>
    api.get('/hero-section'),

  // Get Business Types (for Landing Page)
  getBusinessTypes: () =>
    api.get('/business-types'),

  // Get Features (for Landing Page)
  getFeatures: () =>
    api.get('/features'),

  // Get Product Overview (for Landing Page)
  getProductOverview: () =>
    api.get('/product-overview'),

  // Get Plans (for Landing Page)
  getPlans: () =>
    api.get('/plans'),

  getPlanById: (id: string) =>
    api.get(`/plans/${id}`),

  // Get FAQs (for Landing Page)
  getFAQs: () =>
    api.get('/faqs'),

  // Get Blogs (for Landing Page)
  getBlogs: () =>
    api.get('/blogs'),

  getBlogBySlug: (slug: string) =>
    api.get(`/blogs/slug/${slug}`),

  getPopular: () =>
    api.get('/blogs/popular'),

  getByTags: (tags: string) =>
    api.get(`/blogs/tags/${tags}`),

  // Get Footer Section (for Landing Page)
  getFooterSection: () =>
    api.get('/footer-section'),

  // Get Social Media Links
  getSocialMedia: () =>
    api.get('/socialMedia'),

  // Get Demo Request (for Landing Page)
  getDemoRequest: () =>
    api.post('/admin/subscription/trial'),

  // Get Trial Details (for Landing Page)
  getTrialDays: () =>
    api.get('/plans/trialDays'),

  //Get Coupons for Payment
  getCoupons: (planId: string) =>
    api.get(`/admin/coupons/${planId}`),

  applyCoupon: (subscriptionId: string, couponCode: string) =>
    api.post(`/admin/subscription/${subscriptionId}/coupon/apply`, { couponCode }),

  getEffectiveTotal: (subscriptionId: string) =>
    api.get(`/admin/subscription/${subscriptionId}/coupon/effective-total`),

  removeCoupon: (subscriptionId: string) =>
    api.delete(`/admin/subscription/${subscriptionId}/coupon`),
};

// Common/Utility APIS
export const commonAPI = {
  uploadFile: (file: File, fieldname: string = 'image') => {
    const formData = new FormData();
    formData.append(fieldname, file);
    return api.post('/admin/upload', formData);
  }
};

// Payment APIS
// Payment Gateways API
export const paymentGatewaysAPI = {
  getAll: () =>
    api.get('/admin/payment-gateways'),
};

// Razorpay Payment API
export const userSubscriptionAPI = {
  createSubscription: (data: {
    planId: string;
    amount: number;
    currency?: string;
    paymentMethod?: string;
    razorpayPaymentId?: string;
    razorpayOrderId?: string;
    correlationId?: string;
  }) =>
    api.post('/admin/subscription', data, {
      headers: {
        'x-correlation-id': data.correlationId || '',
      },
    }),

  getSubscriptionById: (id: string) =>
    api.get(`/admin/subscription/${id}`),
};


// User Payment API
export const userPaymentAPI = {
  createPayment: (data: {
    subscriptionId: string;
    paymentProvider: string;
    currencyId: string;
  }) =>
    api.post('/admin/payment2/create', data),

  finalizePayment: (data: {
    paymentId: string;
    // Razorpay fields
    providerPaymentId?: string;
    signature?: string;
    // PayPal fields
    payerId?: string;
    token?: string;
  }) =>
    api.post('/admin/payment2/finalize', data),

  getPaymentById: (id: string) =>
    api.get(`/admin/payments/${id}`),
};

// Super Admin APIS
// Dashboard API
export const dashboardAPI = {
  getStats: () =>
    api.get('/super-admin/dashboard'),
};

// Business Owners API
export const businessOwnersAPI = {
  getAll: (page: number = 1, limit: number = 10, search?: string) => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (search) {
      params.append('search', search);
    }
    return api.get(`/super-admin/users?${params.toString()}`);
  },

  getById: (id: string) =>
    api.get(`/super-admin/users/${id}`),

  create: (data: Record<string, unknown>) =>
    api.post('/super-admin/users', data),

  update: (id: string, data: Record<string, unknown>) =>
    api.put(`/super-admin/users/${id}`, data),

  getAllBusnessOwnerData: () => {
    return api.get(`/super-admin/users?all=true`);
  },
};

// Business Categories API
export const businessCategoriesAPI = {
  getAll: (page: number = 1, limit: number = 10, search?: string) => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (search) {
      params.append('search', search);
    }
    return api.get(`/super-admin/business-categories?${params.toString()}`);
  },

  getById: (id: string) =>
    api.get(`/super-admin/business-categories/${id}`),

  create: (data: Record<string, unknown>) =>
    api.post('/super-admin/business-categories', data),

  update: (id: string, data: Record<string, unknown>) =>
    api.put(`/super-admin/business-categories/${id}`, data),

  delete: (id: string) =>
    api.delete(`/super-admin/business-categories/${id}`),
};

// Subscriptions API
export const subscriptionsAPI = {
  getAll: () =>
    api.get('/super-admin/subscription'),

  getById: (id: string) =>
    api.get(`/super-admin/subscription/${id}`),

  create: (data: Record<string, unknown>) =>
    api.post('/super-admin/subscription', data),
};

// Plans API (for super admin)
export const plansAPI = {
  getAll: (page?: number, limit?: number, search?: string) => {
    const hasParams = page || limit || search;
    if (hasParams) {
      const params = new URLSearchParams();
      if (page) {
        params.append('page', page.toString());
      }
      if (limit) {
        params.append('limit', limit.toString());
      }
      if (search) {
        params.append('search', search);
      }
      return api.get(`/super-admin/plans?${params.toString()}`);
    }
    return api.get('/super-admin/plans');
  },

  getById: (id: string) =>
    api.get(`/super-admin/plans/${id}`),

  create: (data: Record<string, unknown>) =>
    api.post('/super-admin/plans', data),

  update: (id: string, data: Record<string, unknown>) =>
    api.put(`/super-admin/plans/${id}`, data),

  delete: (id: string) =>
    api.delete(`/super-admin/plans/${id}`),
};

// Tax API
export const taxAPI = {
  getAll: (page: number = 1, limit: number = 10, search?: string) => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (search) {
      params.append('search', search);
    }
    return api.get(`/super-admin/tax?${params.toString()}`);
  },

  getById: (id: string) =>
    api.get(`/super-admin/tax/${id}`),

  create: (data: Record<string, unknown>) =>
    api.post('/super-admin/tax', data),

  update: (id: string, data: Record<string, unknown>) =>
    api.put(`/super-admin/tax/${id}`, data),

  delete: (id: string) =>
    api.delete(`/super-admin/tax/${id}`),
};

// Coupons API
export const couponsAPI = {
  getAll: (page: number = 1, limit: number = 10, search?: string) => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (search) {
      params.append('search', search);
    }
    return api.get(`/super-admin/coupons?${params.toString()}`);
  },

  getById: (id: string) =>
    api.get(`/super-admin/coupons/${id}`),

  create: (data: Record<string, unknown>) =>
    api.post('/super-admin/coupons', data),

  update: (id: string, data: Record<string, unknown>) =>
    api.put(`/super-admin/coupons/${id}`, data),

  delete: (id: string) =>
    api.delete(`/super-admin/coupons/${id}`),
};

// FAQ API (for super admin Landing Page Settings)
export const faqAPI = {
  getAll: () =>
    api.get('/super-admin/faqs'),

  getById: (id: string) =>
    api.get(`/super-admin/faqs/${id}`),

  create: (data: { question: string; answer: string; status?: boolean; isPublished?: boolean }) =>
    api.post('/super-admin/faqs', data),

  update: (id: string, data: { question?: string; answer?: string; status?: boolean; isPublished?: boolean }) =>
    api.put(`/super-admin/faqs/${id}`, data),

  delete: (id: string) =>
    api.delete(`/super-admin/faqs/${id}`),
};

// Blog API (for super admin Landing Page Settings)
export const blogAPI = {
  getAll: (page: number = 1, limit: number = 10, search?: string) => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (search) {
      params.append('search', search);
    }

    return api.get(`/super-admin/blogs?${params.toString()}`);
  },

  getById: (id: string) =>
    api.get(`/super-admin/blogs/${id}`),

  create: (data: {
    title: string;
    overview: string;
    description: string;
    tags: string[];
    createdBy: string;
    readTime?: number;
    isPublished?: boolean;
    blogImage?: string;
  } | FormData) => {
    // If it's FormData, let the browser set Content-Type automatically
    if (data instanceof FormData) {
      return api.post('/super-admin/blogs', data);
    }
    // Regular JSON data
    return api.post('/super-admin/blogs', data);
  },

  update: (id: string, data: {
    title?: string;
    overview?: string;
    description?: string;
    tags?: string[];
    createdBy?: string;
    readTime?: number;
    isPublished?: boolean;
    blogImage?: string;
  } | FormData) => {
    // If it's FormData, let the browser set Content-Type automatically
    if (data instanceof FormData) {
      return api.put(`/super-admin/blogs/${id}`, data);
    }
    // Regular JSON data
    return api.put(`/super-admin/blogs/${id}`, data);
  },

  delete: (id: string) =>
    api.delete(`/super-admin/blogs/${id}`),

  togglePublish: (id: string, isPublished: boolean) =>
    api.patch(`/super-admin/blogs/${id}/publish`, { isPublished }),

  getStats: () =>
    api.get('/super-admin/blogs/stats/statistics'),
};

// Reports API
export const reportsAPI = {
  getBusinessOwnerReports: () =>
    api.get('/reports/business-owners'),

  getCommissionReports: () =>
    api.get('/reports/commission'),
};

{/* Admin Product Category APIS */ }
export const productCategoryAPI = {
  getAll: () =>
    api.get('/admin/product-category'),

  getById: (id: string) =>
    api.get(`/admin/product-category/${id}`),

  create: (data: Record<string, unknown>) =>
    api.post('/admin/product-category', data),

  updateById: (id: string, data: Record<string, unknown>) =>
    api.put(`/admin/product-category/${id}`, data),

  deleteById: (id: string) =>
    api.delete(`/admin/product-category/${id}`),

  toggle: (id: string) =>
    api.patch(`/admin/product-category/toggle/${id}`),
};

// Mail Settings API (for super admin)
export const mailSettingsAPI = {
  get: () =>
    api.get('/super-admin/mail-settings'),

  getById: (id: string) =>
    api.get(`/super-admin/mail-settings/${id}`),

  create: (data: {
    email: string;
    driver: string;
    host: string;
    port: number;
    encryption: string;
    username: string;
    password: string;
    mailFrom: string;
    fromName: string;
  }) =>
    api.post('/super-admin/mail-settings', data),

  update: (id: string, data: {
    email?: string;
    driver?: string;
    host?: string;
    port?: number;
    encryption?: string;
    username?: string;
    password?: string;
    mailFrom?: string;
    fromName?: string;
  }) =>
    api.put(`/super-admin/mail-settings/${id}`, data),

  delete: (id: string) =>
    api.delete(`/super-admin/mail-settings/${id}`),

  verify: (id: string) =>
    api.post(`/super-admin/mail-settings/${id}/verify`),

  // Helper method for testing connection (you may need to implement this endpoint)
  testConnection: (id: string) =>
    api.post(`/super-admin/mail-settings/${id}/test`),
};

export default api; 
