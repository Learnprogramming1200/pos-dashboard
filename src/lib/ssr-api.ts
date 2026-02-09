import 'server-only';
import { cookies } from 'next/headers';
import { env } from './env';
import { DownloadSearchParams } from '@/types/SearchParams';
import { auth } from './auth';

// Types for SSR API responses
export interface SSRResponse<T = any> {
  data: T;
  status: number;
  headers?: Record<string, string>;
  cookies?: Record<string, string>;
}

export interface SSRRequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  cache?: RequestCache;
  revalidate?: number;
}

// Cookie management utilities
export class SSRCookieManager {
  // Get cookie value
  async getCookie(name: string): Promise<string | undefined> {
    try {
      const cookieStore = await cookies();
      return cookieStore.get(name)?.value;
    } catch {
      return undefined;
    }
  }

  // Get all cookies as object
  async getAllCookies(): Promise<Record<string, string>> {
    try {
      const cookieStore = await cookies();
      const allCookies: Record<string, string> = {};
      (cookieStore.getAll() as any[]).forEach((cookie: any) => {
        if (cookie?.name && cookie?.value) {
          allCookies[cookie.name] = cookie.value;
        }
      });
      return allCookies;
    } catch {
      return {};
    }
  }

  async getAuthToken(): Promise<string | undefined> {
    // First try to get token from cookie (legacy support)
    let posSession = await this.getPosSession();

    // If no cookie token, try to get from NextAuth session (JWT fallback)
    if (!posSession) {
      try {
        const session = await auth();
        // pos-session is stored directly on the session object (not under user)
        if (session && 'pos-session' in session) {
          posSession = session['pos-session'] || undefined;
        }
      } catch (error) {
        // Silently fail if NextAuth session is not available
        // This can happen during SSR if session is not yet established
        // console.debug('NextAuth session not available for SSR API:', error);
      }
    }

    return posSession;
  }

  // Get refresh token from cookies
  async getRefreshToken(): Promise<string | undefined> {
    return this.getCookie('refresh-token');
  }

  // Get pos-session cookie
  async getPosSession(): Promise<string | undefined> {
    return this.getCookie('pos-session');
  }

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    const token = await this.getAuthToken();
    return !!token;
  }
}

// Main SSR API class
export class SSRAPI {
  private baseURL: string;
  private cookieManager: SSRCookieManager;

  constructor() {
    this.baseURL = env.BACKEND_URL;
    this.cookieManager = new SSRCookieManager();
  }

  // Create headers for API requests
  private async createHeaders(additionalHeaders?: Record<string, string>): Promise<HeadersInit> {
    const headers: HeadersInit = {
      'Accept': 'application/json',
      ...additionalHeaders,
    };

    // Get auth token (checks both cookie and NextAuth session)
    const authToken = await this.cookieManager.getAuthToken();

    // Add Authorization header if token is available
    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }

    // Add pos-session cookie if available (backend expects this in Cookie header)
    // Use the same token from getAuthToken which includes NextAuth fallback
    if (authToken) {
      headers.Cookie = `pos-session=${authToken}`;
    }

    return headers;
  }

  // Parse response and extract cookies
  private async parseResponse(response: Response): Promise<{ data: any; cookies: Record<string, string> }> {
    const cookies: Record<string, string> = {};

    // Extract Set-Cookie headers
    const setCookieHeader = response.headers.get('set-cookie');
    if (setCookieHeader) {
      const cookieStrings = setCookieHeader.split(/,(?=[^,]+=)/);
      cookieStrings.forEach(cookieString => {
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
    }

    const data = await response.json().catch(() => ({}));
    return { data, cookies };
  }

  // Make API request
  async request<T = any>(
    endpoint: string,
    config: SSRRequestConfig = {}
  ): Promise<SSRResponse<T>> {
    const {
      method = 'GET',
      headers = {},
      body,
      cache = 'default',
      revalidate
    } = config;

    const url = `${this.baseURL}${endpoint}`;
    const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
    const requestHeaders = await this.createHeaders({ ...(isFormData ? {} as Record<string, string> : { 'Content-Type': 'application/json' }), ...headers });

    const requestConfig: RequestInit = {
      method,
      headers: requestHeaders,
      cache,
      ...(revalidate && { next: { revalidate } }),
    };

    if (body && method !== 'GET') {
      requestConfig.body = isFormData ? (body as any) : JSON.stringify(body);
    }

    try {
      const response = await fetch(url, requestConfig);

      // Handle authentication errors without redirect to avoid loops
      if (response.status === 401 || response.status === 403) {
        const { data, cookies: responseCookies } = await this.parseResponse(response);
        return {
          data: (data as any) || {},
          status: response.status,
          headers: Object.fromEntries(response.headers.entries()),
          cookies: responseCookies,
        };
      }

      const { data, cookies: responseCookies } = await this.parseResponse(response);

      return {
        data,
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        cookies: responseCookies,
      };
    } catch (error) {
      console.error('SSR API Error:', error);
      throw error;
    }
  }

  // Convenience methods
  async get<T = any>(endpoint: string, config?: Omit<SSRRequestConfig, 'method'>): Promise<SSRResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'GET' });
  }

  async post<T = any>(endpoint: string, body?: any, config?: Omit<SSRRequestConfig, 'method' | 'body'>): Promise<SSRResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'POST', body });
  }

  async put<T = any>(endpoint: string, body?: any, config?: Omit<SSRRequestConfig, 'method' | 'body'>): Promise<SSRResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'PUT', body });
  }

  async delete<T = any>(endpoint: string, config?: Omit<SSRRequestConfig, 'method'>): Promise<SSRResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' });
  }

  async patch<T = any>(endpoint: string, body?: any, config?: Omit<SSRRequestConfig, 'method' | 'body'>): Promise<SSRResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'PATCH', body });
  }
}

// Create singleton instance
export const ssrAPI = new SSRAPI();


{/* Auth APIs */ }
export class SSRAuthAPI {
  constructor(private api: SSRAPI) { }

  async signup(userData: {
    name: string;
    email: string;
    password: string;
    phone: string;
    businessName: string;
    businessCategory: string;
  }) {
    return this.api.post('/auth/register', userData);
  }

}

{/* Public APIs */ }
export class SSRPublicAPI {
  constructor(private api: SSRAPI) { }

  async getMiscellaneousSettings() {
    return this.api.get('/misc-settings', { revalidate: 3600 });
  }

  async getBusinessCategories() {
    return this.api.get('/business-categories', { revalidate: 3600 });
  }

  async getGeneralSettings() {
    return this.api.get('/general-settings', { revalidate: 3600 });
  }

  async getInvoiceDesign() {
    return this.api.get('/general-settings/invoice-design', { revalidate: 3600 });
  }

  async getHeroSection() {
    return this.api.get('/hero-section');
  }

  async getFeatures() {
    return this.api.get('/features');
  }

  async getProductOverview() {
    return this.api.get('/product-overview');
  }

  async getPlans() {
    return this.api.get('/plans');
  }

  async getPlanById(id: string) {
    return this.api.get(`/plans/${id}`);
  }

  async getBusinessTypes() {
    return this.api.get('/business-types');
  }

  async getFAQs() {
    return this.api.get('/faqs');
  }

  async getBlogs() {
    return this.api.get('/blogs');
  }

  async getBlogBySlug(slug: string) {
    return this.api.get(`/blogs/slug/${slug}`);
  }

  async getFooterSection() {
    return this.api.get('/footer-section');
  }

  async getSocialMedia() {
    return this.api.get('/socialMedia');
  }

  async getAdvertisements() {
    return this.api.get('/advertisements');
  }

  async getDemoRequest() {
    return this.api.post('/admin/subscription/trial');
  }

  async getTrialDays() {
    return this.api.get('/plans/trialDays');
  }

  async getCoupons(planId: string) {
    return this.api.get(`admin/coupons/${planId}`);
  }

  async applyCoupon(subscriptionId: string, couponCode: string) {
    return this.api.post(`admin/subscription/${subscriptionId}/coupon/apply`, { couponCode });
  }

  async getEffectiveTotal(subscriptionId: string) {
    return this.api.get(`admin/subscription/${subscriptionId}/coupon/effective-total`);
  }

  async getRagToggle() {
    return this.api.get('/rag/toggle');
  }

  async removeCoupon(subscriptionId: string) {
    return this.api.delete(`admin/subscription/${subscriptionId}/coupon`);
  }
}


{/* Payment APIs */ }
export class SSRUserSubscriptionAPI {
  constructor(private api: SSRAPI) { }

  async createSubscription(data: {
    planId: string;
    amount: number;
    currency?: string;
    paymentMethod?: string;
    razorpayPaymentId?: string;
    razorpayOrderId?: string;
    correlationId?: string;
  }) {
    return this.api.post('/admin/subscription', data, {
      headers: {
        'x-correlation-id': data.correlationId || '',
      },
    });
  }
}

// User Payment API
export class SSRUserPaymentAPI {
  constructor(private api: SSRAPI) { }

  async createPayment(data: {
    planId: string;
    amount: number;
    currency?: string;
    paymentMethod?: string;
    correlationId?: string;
    subscriptionId: string;
  }) {
    return this.api.post('/admin/payment', data);
  }

  async finalizePayment(data: {
    paymentId: string;
    razorpayPaymentId: string;
    razorpayOrderId: string;
    razorpaySignature: string;
  }) {
    return this.api.post('/admin/payment/finalize', data);
  }

  async getPaymentById(id: string) {
    return this.api.get(`/admin/payments/${id}`);
  }
}

{/* Upload APIs */ }
export class SSRUploadAPI {
  constructor(private api: SSRAPI) { }

  async uploadSuperAdminFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.api.post('/super-admin/upload', formData);
  }

  async uploadAdminFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.api.post('/admin/upload', formData);
  }
}

{/* Super Admin APIs */ }

// Dashboard API
export class SSRDashboardAPI {
  constructor(private api: SSRAPI) { }

  async getStats(startDate?: string) {
    const queryParams = new URLSearchParams();
    if (startDate) {
      queryParams.append('startDate', startDate);
    }
    const query = queryParams.toString();
    const endpoint = query ? `/super-admin/dashboard?${query}` : '/super-admin/dashboard';
    return this.api.get(endpoint);
  }

  async getPlanWiseSubscription(startDate?: string) {
    const queryParams = new URLSearchParams();
    if (startDate) {
      queryParams.append('startDate', startDate);
    }
    const query = queryParams.toString();
    const endpoint = query ? `/super-admin/dashboard/plan-wise-subscriptions?${query}` : '/super-admin/dashboard/plan-wise-subscriptions';
    return this.api.get(endpoint);
  }

  async getRevenueOverview(startDate?: string) {
    const queryParams = new URLSearchParams();
    if (startDate) {
      queryParams.append('startDate', startDate);
    }
    const query = queryParams.toString();
    const endpoint = query ? `/super-admin/dashboard/revenue-overview?${query}` : '/super-admin/dashboard/revenue-overview';
    return this.api.get(endpoint);
  }
}

// Business Owners API
export class SSRBusinessOwnersAPI {
  constructor(private api: SSRAPI) { }

  async getAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
    isActive?: boolean,
    categoryId?: string
  ) {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (search) {
      queryParams.set('search', search);
    }
    if (isActive) {
      queryParams.set('isActive', String(isActive));
    }

    if (categoryId) {
      queryParams.set('categoryId', categoryId);
    }

    return this.api.get(`/super-admin/users?${queryParams.toString()}`);
  }

  async create(data: Record<string, unknown>) {
    return this.api.post('/super-admin/users', data);
  }

  async update(id: string, data: Record<string, unknown>) {
    return this.api.put(`/super-admin/users/${id}`, data);
  }

  async bulkUpdateStatus(data: Record<string, unknown>) {
    return this.api.patch('/super-admin/users/bulk-status', data);
  }

  async bulkGetSelected(data: { ids: string[] }) {
    return this.api.post('/super-admin/users/bulk-get', data);
  }

  async bulkAllDownload(filterData: any) {
    const queryParams = new URLSearchParams({});
    if (filterData.search) {
      queryParams.set('search', filterData.search);
    }
    if (filterData.isActive) {
      queryParams.set('isActive', String(filterData.isActive));
    }
    if (filterData.categoryId) {
      queryParams.set('categoryId', filterData.categoryId);
    }
    return this.api.get(`/super-admin/users?all=true&${queryParams.toString()}`);
  }
}

// Business Categories API
export class SSRBusinessCategoriesAPI {
  constructor(private api: SSRAPI) { }

  async getAll(page: number = 1, limit: number = 10, search?: string, isActive?: boolean, config?: Omit<SSRRequestConfig, 'method'>) {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (search) {
      queryParams.set('search', search);
    }
    if (isActive) {
      queryParams.set('isActive', isActive.toString());
    }
    return this.api.get(`/super-admin/business-categories?${queryParams.toString()}`, config);
  }

  async create(data: Record<string, unknown>) {
    return this.api.post('/super-admin/business-categories', data);
  }

  async update(id: string, data: Record<string, unknown>) {
    return this.api.put(`/super-admin/business-categories/${id}`, data);
  }

  async bulkUpdateStatus(data: Record<string, unknown>) {
    return this.api.patch('/super-admin/business-categories/bulk-status', data);
  }

  async delete(id: string) {
    return this.api.delete(`/super-admin/business-categories/${id}`);
  }

  async bulkDelete(data: Record<string, unknown>) {
    return this.api.delete('/super-admin/business-categories/bulk-delete', { body: data });
  }

  async bulkGetSelected(data: { ids: string[] }) {
    return this.api.post('/super-admin/business-categories/bulk-get', data);
  }

  async bulkAllDownload(filterData: any) {
    const queryParams = new URLSearchParams({});
    if (filterData.search) {
      queryParams.set('search', filterData.search);
    }
    if (filterData.isActive != undefined) {
      queryParams.set('isActive', String(filterData.isActive));
    }
    return this.api.get(`/super-admin/business-categories?all=true&${queryParams.toString()}`);
  }
}

// Subscriptions API
export class SSRSubscriptionsAPI {
  constructor(private api: SSRAPI) { }

  async getAll(page: number = 1, limit: number = 10, search?: string, status?: string) {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (search) {
      queryParams.set('search', search);
    }
    if (status) {
      queryParams.set('status', String(status));
    }
    return this.api.get(`/super-admin/subscription?${queryParams.toString()}`);
  }

  async create(data: Record<string, unknown>) {
    return this.api.post('/super-admin/subscription', data);
  }

  async bulkGetSelected(data: { ids: string[] }) {
    return this.api.post('/super-admin/subscription/bulk-get', data);
  }

  async bulkAllDownload(filterData: any) {
    const queryParams = new URLSearchParams();
    if (filterData.search) {
      queryParams.set('search', filterData.search);
    }
    if (filterData.status && filterData.status !== 'All') {
      queryParams.set('status', filterData.status);
    }
    return this.api.get(`/super-admin/subscription?all=true&${queryParams.toString()}`);
  }
}


// Plans API
export class SSRPlansAPI {
  constructor(private api: SSRAPI) { }

  async getAll(page: number = 1, limit: number = 10, search?: string, isActive?: boolean) {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (search) {
      queryParams.set('search', search);
    }
    if (isActive) {
      queryParams.set('isActive', String(isActive));
    }
    return this.api.get(`/super-admin/plans?${queryParams.toString()}`);
  }

  async create(data: Record<string, unknown>) {
    return this.api.post('/super-admin/plans', data);
  }

  async update(id: string, data: Record<string, unknown>) {
    return this.api.put(`/super-admin/plans/${id}`, data);
  }

  async bulkUpdateStatus(data: Record<string, unknown>) {
    return this.api.patch('/super-admin/plans/bulk-status', data);
  }

  async delete(id: string) {
    return this.api.delete(`/super-admin/plans/${id}`);
  }

  async bulkDelete(data: Record<string, unknown>) {
    return this.api.delete('/super-admin/plans/bulk-delete', { body: data });
  }
}

// Tax API
export class SSRTaxAPI {
  constructor(private api: SSRAPI) { }

  async getAll(page: number = 1, limit: number = 10, search?: string, isActive?: boolean) {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (search) {
      queryParams.set('search', search);
    }
    if (isActive) {
      queryParams.set('isActive', String(isActive));
    }
    return this.api.get(`/super-admin/tax?${queryParams.toString()}`);
  }

  async create(data: Record<string, unknown>) {
    return this.api.post('/super-admin/tax', data);
  }

  async update(id: string, data: Record<string, unknown>) {
    return this.api.put(`/super-admin/tax/${id}`, data);
  }

  async bulkUpdateStatus(data: Record<string, unknown>) {
    return this.api.patch('/super-admin/tax/bulk-status', data);
  }

  async delete(id: string) {
    return this.api.delete(`/super-admin/tax/${id}`);
  }

  async bulkDelete(data: Record<string, unknown>) {
    return this.api.delete('/super-admin/tax/bulk-delete', { body: data });
  }

  async bulkGetSelected(data: { ids: string[] }) {
    return this.api.post('/super-admin/tax/bulk-get', data);
  }

  async bulkAllDownload(filterData: any) {
    const queryParams = new URLSearchParams();
    if (filterData.search) {
      queryParams.set('search', filterData.search);
    }
    if (filterData.isActive !== undefined && filterData.isActive !== 'All') {
      queryParams.set('isActive', String(filterData.isActive === 'Active' || filterData.isActive === true));
    }
    return this.api.get(`/super-admin/tax?all=true&${queryParams.toString()}`);
  }
}

// Coupons API
export class SSRCouponsAPI {
  constructor(private api: SSRAPI) { }

  async getAll(page: number = 1, limit: number = 10, search?: string, isActive?: boolean, category?: string, type?: string) {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (search) {
      queryParams.set('search', search);
    }
    if (isActive) {
      queryParams.set('isActive', String(isActive));
    }
    if (category) {
      queryParams.set('category', category);
    }
    if (type) {
      queryParams.set('type', type)
    }
    return this.api.get(`/super-admin/coupons?${queryParams.toString()}`);
  }

  async create(data: Record<string, unknown>) {
    return this.api.post('/super-admin/coupons', data);
  }

  async update(id: string, data: Record<string, unknown>) {
    return this.api.put(`/super-admin/coupons/${id}`, data);
  }

  async bulkUpdateStatus(data: Record<string, unknown>) {
    return this.api.patch('/super-admin/coupons/bulk-status', data);
  }

  async delete(id: string) {
    return this.api.delete(`/super-admin/coupons/${id}`);
  }

  async bulkDelete(data: Record<string, unknown>) {
    return this.api.delete('/super-admin/coupons/bulk-delete', { body: data });
  }

  async bulkGetSelected(data: { ids: string[] }) {
    return this.api.post('/super-admin/coupons/bulk-get', data);
  }

  async bulkAllDownload(filterData: any) {
    const queryParams = new URLSearchParams();
    if (filterData.search) {
      queryParams.set('search', filterData.search);
    }
    if (filterData.isActive !== undefined && filterData.isActive !== 'All') {
      queryParams.set('isActive', String(filterData.isActive === 'Active' || filterData.isActive === true));
    }
    if (filterData.category && filterData.category !== 'All') {
      queryParams.set('category', filterData.category);
    }
    if (filterData.type && filterData.type !== 'All') {
      queryParams.set('type', filterData.type);
    }
    return this.api.get(`/super-admin/coupons?all=true&${queryParams.toString()}`);
  }
}
// Advertisement API
export class SSRAdvertisementAPI {
  constructor(private api: SSRAPI) { }

  async getAll(page: number = 1, limit: number = 10, search?: string, isActive?: boolean) {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (search) {
      queryParams.set('search', search);
    }
    if (isActive) {
      queryParams.set('isActive', String(isActive));
    }
    return this.api.get(`/super-admin/advertisements?${queryParams.toString()}`);
  }

  async create(data: Record<string, unknown>) {
    return this.api.post('/super-admin/advertisements', data);
  }

  async update(id: string, data: Record<string, unknown>) {
    return this.api.put(`/super-admin/advertisements/${id}`, data);
  }

  async bulkUpdateStatus(data: Record<string, unknown>) {
    return this.api.patch('/super-admin/advertisements/bulk-status', data);
  }

  async delete(id: string) {
    return this.api.delete(`/super-admin/advertisements/${id}`);
  }

  async bulkDelete(data: Record<string, unknown>) {
    return this.api.delete('/super-admin/advertisements/bulk-delete', { body: data });
  }
}

// Reports API
export class SSRReportsAPI {
  constructor(private api: SSRAPI) { }

  async getBusinessOwnerReports(page: number = 1, limit: number = 10, search?: string, isActive?: boolean) {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (search) {
      queryParams.set('search', search);
    }
    if (isActive) {
      queryParams.set('isActive', String(isActive));
    }
    return this.api.get(`/super-admin/business-owner-report?${queryParams.toString()}`);
  }

  async getCommissionReports() {
    return this.api.get('/reports/commission');
  }

  async bulkGetSelected(data: { ids: string[] }) {
    return this.api.post('/super-admin/business-owner-report/bulk-get', data);
  }

  async bulkAllDownload(filterData: DownloadSearchParams) {
    const queryParams = new URLSearchParams({});
    if (filterData.search) {
      queryParams.set('search', filterData.search);
    }
    if (filterData.isActive !== undefined) {
      queryParams.set('isActive', String(filterData.isActive));
    }
    return this.api.get(`/super-admin/business-owner-report?all=true&${queryParams.toString()}`);
  }
}

{/* Landing Page Settings APIs */ }
// Landing Page Settings Hero Section API
export class SSRHeroSectionAPI {
  constructor(private api: SSRAPI) { }

  async getAll() {
    return this.api.get('/super-admin/hero-section', { revalidate: 600 });
  }

  async create(data: Record<string, unknown>) {
    return this.api.post('/super-admin/hero-section', data);
  }

  async update(id: string, data: Record<string, unknown>) {
    return this.api.put(`/super-admin/hero-section/${id}`, data);
  }
}

// Landing Page Settings Features API
export class SSRFeaturesAPI {
  constructor(private api: SSRAPI) { }

  async getAll(page: number = 1, limit: number = 10, search?: string) {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (search) {
      queryParams.set('search', search);
    }
    return this.api.get(`/super-admin/features?${queryParams.toString()}`, { revalidate: 0 });
  }

  async create(data: Record<string, unknown>) {
    return this.api.post('/super-admin/features', data);
  }

  async update(id: string, data: Record<string, unknown>) {
    return this.api.put(`/super-admin/features/${id}`, data);
  }

  async bulkUpdateStatus(data: Record<string, unknown>) {
    return this.api.patch('/super-admin/features/bulk-status', data);
  }

  async delete(id: string) {
    return this.api.delete(`/super-admin/features/${id}`);
  }

  async bulkDelete(data: Record<string, unknown>) {
    return this.api.delete('/super-admin/features/bulk-delete', { body: data });
  }
}

// Landing Page Settings Product Overview API
export class SSRProductOverviewAPI {
  constructor(private api: SSRAPI) { }

  async getAll(page: number = 1, limit: number = 10, search?: string) {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (search) {
      queryParams.set('search', search);
    }
    return this.api.get(`/super-admin/product-overview?${queryParams.toString()}`, { revalidate: 0 });
  }

  async create(data: Record<string, unknown>) {
    return this.api.post('/super-admin/product-overview', data);
  }

  async update(id: string, data: Record<string, unknown>) {
    return this.api.put(`/super-admin/product-overview/${id}`, data);
  }

  async bulkUpdateStatus(data: Record<string, unknown>) {
    return this.api.patch('/super-admin/product-overview/bulk-status', data);
  }

  async delete(id: string) {
    return this.api.delete(`/super-admin/product-overview/${id}`);
  }

  async bulkDelete(data: Record<string, unknown>) {
    return this.api.delete('/super-admin/product-overview/bulk-delete', { body: data });
  }
}

// Landing Page Settings Business Types API
export class SSRBusinessTypesAPI {
  constructor(private api: SSRAPI) { }

  async getAll(page: number = 1, limit: number = 10, search?: string, isActive?: boolean) {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (search) {
      queryParams.set('search', search);
    }
    if (isActive !== undefined) {
      queryParams.set('isActive', String(isActive));
    }
    return this.api.get(`/super-admin/business-types?${queryParams.toString()}`, { revalidate: 0 });
  }

  async create(data: Record<string, unknown>) {
    return this.api.post('/super-admin/business-types', data);
  }

  async update(id: string, data: Record<string, unknown>) {
    return this.api.put(`/super-admin/business-types/${id}`, data);
  }

  async bulkUpdateStatus(data: Record<string, unknown>) {
    return this.api.patch('/super-admin/business-types/bulk-status', data);
  }

  async delete(id: string) {
    return this.api.delete(`/super-admin/business-types/${id}`);
  }

  async bulkDelete(data: Record<string, unknown>) {
    return this.api.delete('/super-admin/business-types/bulk-delete', { body: data });
  }
}

// Landing Page Settings FAQ Category API
export class SSRFAQCategoryAPI {
  constructor(private api: SSRAPI) { }

  async getAll(page: number = 1, limit: number = 10, search?: string) {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (search) {
      queryParams.set('search', search);
    }
    return this.api.get(`/super-admin/faq-categories?${queryParams.toString()}`, { revalidate: 0 });
  }

  async getActive() {
    return this.api.get('/super-admin/faq-categories/active', { revalidate: 600 });
  }

  async create(data: Record<string, unknown>) {
    return this.api.post('/super-admin/faq-categories', data);
  }

  async update(id: string, data: Record<string, unknown>) {
    return this.api.put(`/super-admin/faq-categories/${id}`, data);
  }

  async bulkUpdateStatus(data: Record<string, unknown>) {
    return this.api.patch('/super-admin/faq-categories/bulk-status', data);
  }

  async delete(id: string) {
    return this.api.delete(`/super-admin/faq-categories/${id}`);
  }

  async bulkDelete(data: Record<string, unknown>) {
    return this.api.delete('/super-admin/faq-categories/bulk-delete', { body: data });
  }
}

// Landing Page Settings FAQ API
export class SSRFAQAPI {
  constructor(private api: SSRAPI) { }

  async getAll(page: number = 1, limit: number = 10, search?: string) {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (search) {
      queryParams.set('search', search);
    }
    return this.api.get(`/super-admin/faqs?${queryParams.toString()}`, { revalidate: 0 });
  }

  async getById(id: string) {
    return this.api.get(`/super-admin/faqs/${id}`);
  }

  async create(data: { question: string; answer: string; status?: boolean; isPublished?: boolean }) {
    return this.api.post('/super-admin/faqs', data);
  }

  async update(id: string, data: { question?: string; answer?: string; status?: boolean; isPublished?: boolean }) {
    return this.api.put(`/super-admin/faqs/${id}`, data);
  }

  async bulkUpdateStatus(data: Record<string, unknown>) {
    return this.api.patch('/super-admin/faqs/bulk-status', data);
  }

  async delete(id: string) {
    return this.api.delete(`/super-admin/faqs/${id}`);
  }

  async bulkDelete(data: Record<string, unknown>) {
    return this.api.delete('/super-admin/faqs/bulk-delete', { body: data });
  }
}

// Landing Page Settings Blogs API
export class SSRBlogsAPI {
  constructor(private api: SSRAPI) { }

  async getAll(page: number = 1, limit: number = 10, search?: string) {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (search) {
      queryParams.set('search', search);
    }
    return this.api.get(`/super-admin/blogs?${queryParams.toString()}`, { revalidate: 0 });
  }

  async getById(id: string) {
    return this.api.get(`/super-admin/blogs/${id}`);
  }

  async create(data: Record<string, unknown>) {
    return this.api.post('/super-admin/blogs', data);
  }

  async update(id: string, data: Record<string, unknown>) {
    return this.api.put(`/super-admin/blogs/${id}`, data);
  }

  async bulkUpdateStatus(data: Record<string, unknown>) {
    return this.api.patch('/super-admin/blogs/bulk-status', data);
  }

  async togglePublish(id: string, isPublished: boolean) {
    return this.api.patch(`/super-admin/blogs/${id}/publish`, { isPublished });
  }

  async delete(id: string) {
    return this.api.delete(`/super-admin/blogs/${id}`);
  }

  async bulkDelete(data: Record<string, unknown>) {
    return this.api.delete('/super-admin/blogs/bulk-delete', { body: data });
  }
}

// Landing Page Settings Footer API
export class SSRFooterSectionAPI {
  constructor(private api: SSRAPI) { }

  async getAll() {
    // No cache for footer content to ensure fresh results after mutations
    return this.api.get('/super-admin/footer-section', { revalidate: 0 });
  }

  async create(data: Record<string, unknown>) {
    return this.api.post('/super-admin/footer-section', data);
  }
  async createCTA(data: Record<string, unknown>) {
    return this.api.post('/super-admin/footer-section/cta', data);
  }

  async updateCTA(id: string, data: Record<string, unknown>) {
    return this.api.put(`/super-admin/footer-section/${id}/cta`, data);
  }

  async appendLinks(sectionId: string, data: Record<string, unknown>) {
    return this.api.post(`/super-admin/footer-section/${sectionId}/link`, data);
  }

  async updateLinks(linkId: string, data: Record<string, unknown>) {
    return this.api.put(`/super-admin/footer-section/link/${linkId}`, data);
  }

  async deleteLinks(linkId: string) {
    return this.api.delete(`/super-admin/footer-section/link/${linkId}`);
  }
}

// Landing Page Setting Social Media Links
export class SSRSocialMediaLinksAPI {
  constructor(private api: SSRAPI) { }

  async getAll() {
    return this.api.get('/super-admin/socialMedia')
  }

  async create(data: Record<string, unknown>) {
    return this.api.post('/super-admin/socialMedia', data)
  }

  async update(data: Record<string, unknown>) {
    return this.api.put(`/super-admin/socialMedia`, data)
  }
}

{/* Settings Page APIs */ }
// General Settings API
export class SSRGeneralSettingsAPI {
  constructor(private api: SSRAPI) { }

  async getAll() {
    return this.api.get('/super-admin/general-settings');
  }

  async create(data: Record<string, unknown>) {
    return this.api.post('/super-admin/general-settings', data);
  }

  async update(data: Record<string, unknown>) {
    return this.api.put(`/super-admin/general-settings`, data);
  }
}

//Miscellaneous Settings API
export class SSRMiscellaneousSettingsAPI {
  constructor(private api: SSRAPI) { }

  async getCurrentSettings() {
    return this.api.get('/super-admin/misc-settings');
  }

  async updateSettings(data: Record<string, unknown>) {
    return this.api.put('/super-admin/misc-settings', data);
  }

  async toggleDarkMode() {
    return this.api.patch('/super-admin/misc-settings/dark-mode');
  }

  async toggleMaintenanceMode() {
    return this.api.patch('/super-admin/misc-settings/maintenance-mode');
  }

}

// Mail Settings Super Admin API
export class SSRMailSettingsAPI {
  constructor(private api: SSRAPI) { }

  async getAll() {
    return this.api.get('/super-admin/mail-settings');
  }

  async create(data: Record<string, unknown>) {
    return this.api.post('/super-admin/mail-settings', data);
  }

  async verify(id: string) {
    return this.api.post(`/super-admin/mail-settings/verify`);
  }

  async update(id: string, data: Record<string, unknown>) {
    return this.api.put(`/super-admin/mail-settings`, data);
  }

  async delete(id: string) {
    return this.api.delete(`/super-admin/mail-settings`);
  }
}

// Currency Settings API
export class SSRCurrencySettingsAPI {
  constructor(private api: SSRAPI) { }

  async getAll() {
    return this.api.get('/super-admin/currencies');
  }

  async getPrimary() {
    return this.api.get('/super-admin/currencies/primary');
  }

  async create(data: Record<string, unknown>) {
    return this.api.post('/super-admin/currencies', data);
  }

  async update(id: string, data: Record<string, unknown>) {
    return this.api.put(`/super-admin/currencies/${id}`, data);
  }

  async setPrimary(id: string) {
    return this.api.patch(`/super-admin/currencies/${id}/set-primary`);
  }

  async delete(id: string) {
    return this.api.delete(`/super-admin/currencies/${id}`);
  }
}

//Payment Settings API
export class SSRPaymentSettingsAPI {
  constructor(private api: SSRAPI) { }

  async getAll() {
    return this.api.get('/super-admin/payment-config');
  }

  async getById(id: string) {
    return this.api.get(`/super-admin/payment-config/${id}`);
  }

  async create(data: Record<string, unknown>) {
    return this.api.post('/super-admin/payment-config', data);
  }

  async update(id: string, data: Record<string, unknown>) {
    return this.api.put(`/super-admin/payment-config/${id}`, data);
  }
}

//Trial Settings API
export class SSRTrialSettingsAPI {
  constructor(private api: SSRAPI) { }

  async getAll() {
    return this.api.get('/super-admin/plans/trial');
  }

  async update(id: string, data: Record<string, unknown>) {
    return this.api.put(`/super-admin/plans/trial`, data);
  }
}

// GDPR Settings API
export class SSRGDPRSettingsAPI {
  constructor(private api: SSRAPI) { }

  async getAll() {
    return this.api.get('/super-admin/gdpr-cookie-settings');
  }

  async create(data: Record<string, unknown>) {
    return this.api.post('/super-admin/gdpr-cookie-settings', data);
  }

  async update(data: Record<string, unknown>) {
    return this.api.put('/super-admin/gdpr-cookie-settings', data);
  }

  async toggle(data: Record<string, unknown>) {
    return this.api.patch('/super-admin/gdpr-cookie-settings', data);
  }

}

// SEO Settings API
export class SSRSEOSettingsAPI {
  constructor(private api: SSRAPI) { }

  async getAll() {
    return this.api.get('/super-admin/seo-settings');
  }

  async create(data: Record<string, unknown>) {
    return this.api.post('/super-admin/seo-settings', data);
  }

  async update(data: Record<string, unknown>) {
    return this.api.put(`/super-admin/seo-settings`, data);
  }

  async delete() {
    return this.api.delete(`/super-admin/seo-settings/image/seo`);
  }
}


{/* Admin APIs */ }
// Store API
export class SSRStoreAPI {
  constructor(private api: SSRAPI) { }

  async getAll(page: number = 1, limit: number = 10, search?: string, isActive?: boolean) {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (search) {
      queryParams.set('search', search);
    }
    if (isActive) {
      queryParams.set('isActive', String(isActive));
    }
    return this.api.get(`/admin/store?${queryParams.toString()}`);
  }

  async getActive() {
    return this.api.get('/admin/store/active');
  }

  async create(data: Record<string, unknown>) {
    return this.api.post('/admin/store', data);
  }

  async update(id: string, data: Record<string, unknown>) {
    return this.api.put(`/admin/store/${id}`, data);
  }

  async bulkUpdateStatus(data: { ids: string[]; status: boolean }) {
    return this.api.patch(`/admin/store/bulk-status`, data);
  }

  async delete(id: string) {
    return this.api.delete(`/admin/store/${id}`);
  }

  async bulkDelete(data: { ids: string[] }) {
    return this.api.delete(`/admin/store/bulk-delete`, { body: data });
  }

  async bulkGetSelected(data: { ids: string[] }) {
    return this.api.post(`/admin/store/bulk-get`, data);
  }

  async bulkAllDownload(filterData: DownloadSearchParams) {
    const queryParams = new URLSearchParams({});
    if (filterData.search) {
      queryParams.set('search', filterData.search);
    }
    if (filterData.isActive != undefined) {
      queryParams.set('isActive', String(filterData.isActive));
    }
    return this.api.get(`/admin/store?all=true&${queryParams.toString()}`);
  }
}

// Product API
export class SSRProductAPI {
  constructor(private api: SSRAPI) { }

  async getAll(page: number = 1, limit: number = 10, search?: string, isActive?: boolean, categoryId?: string) {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (search) {
      queryParams.set('search', search);
    }
    if (isActive !== undefined) {
      queryParams.set('isActive', String(isActive));
    }
    if (categoryId) {
      queryParams.set('categoryId', categoryId);
    }
    return this.api.get(`/admin/product?${queryParams.toString()}`);
  }

  async getById(id: string) {
    return this.api.get(`/admin/product/${id}`);
  }

  async getByBarcode(barcode: string) {
    return this.api.get(`/admin/product/barcode/${barcode}`);
  }

  async getActive(storeId?: string, categoryId?: string) {
    const queryParams = new URLSearchParams();
    if (storeId) {
      queryParams.append('storeId', storeId);
    }
    if (categoryId && categoryId !== 'all') {
      queryParams.append('categoryId', categoryId);
    }
    const query = queryParams.toString();
    const url = query ? `/admin/product/active?${query}` : `/admin/product/active`;
    return this.api.get(url);
  }

  async getActiveByBarcode(barcode: string, storeId?: string) {
    const url = storeId
      ? `/admin/product/barcode/active/${barcode}?storeId=${storeId}`
      : `/admin/product/barcode/active/${barcode}`;
    return this.api.get(url);
  }

  async create(data: Record<string, unknown>) {
    return this.api.post('/admin/product', data);
  }

  async update(id: string, data: Record<string, unknown>) {
    return this.api.put(`/admin/product/${id}`, data);
  }

  async bulkUpdateStatus(data: { ids: string[]; status: boolean }) {
    return this.api.patch(`/admin/product/bulk-status`, data);
  }

  async delete(id: string) {
    return this.api.delete(`/admin/product/${id}`);
  }

  async bulkDelete(data: { ids: string[] }) {
    return this.api.delete('/admin/product/bulk-delete', { body: data });
  }

  async bulkGetSelected(data: { ids: string[] }) {
    return this.api.post(`/admin/product/bulk-get`, data);
  }

  async bulkAllDownload(filterData: DownloadSearchParams) {
    const queryParams = new URLSearchParams({});
    if (filterData.search) {
      queryParams.set('search', filterData.search);
    }
    if (filterData.isActive != undefined) {
      queryParams.set('isActive', String(filterData.isActive));
    }
    if (filterData.categoryId) {
      queryParams.set('categoryId', filterData.categoryId);
    }
    return this.api.get(`/admin/product?all=true&limit=10000&${queryParams.toString()}`);
  }

  async getInitalProductData() {
    return this.api.get(`/admin/product-data`);
  }
}


// Category API
export class SSRProductCategoryAPI {
  constructor(private api: SSRAPI) { }

  async getAll(page: number = 1, limit: number = 10, search?: string, isActive?: boolean) {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (search) {
      queryParams.set('search', search);
    }
    if (isActive) {
      queryParams.set('isActive', String(isActive));
    }
    return this.api.get(`/admin/product-category?${queryParams.toString()}`);
  }


  async getActive() {
    return this.api.get(`/admin/product-category/active`);
  }

  async create(data: Record<string, unknown>) {
    return this.api.post('/admin/product-category', data);
  }

  async update(id: string, data: Record<string, unknown>) {
    return this.api.put(`/admin/product-category/${id}`, data);
  }

  async bulkUpdateStatus(data: Record<string, unknown>) {
    return this.api.patch(`/admin/product-category/bulk-status`, data);
  }

  async delete(id: string) {
    return this.api.delete(`/admin/product-category/${id}`);
  }

  async bulkDelete(data: Record<string, unknown>) {
    return this.api.delete(`/admin/product-category/bulk-delete`, { body: data });
  }

  async bulkGetSelected(data: { ids: string[] }) {
    return this.api.post(`/admin/product-category/bulk-get`, data);
  }

  async bulkAllDownload(filterData: DownloadSearchParams) {
    const queryParams = new URLSearchParams({});
    if (filterData.search) {
      queryParams.set('search', filterData.search);
    }
    if (filterData.isActive != undefined) {
      queryParams.set('isActive', String(filterData.isActive));
    }
    return this.api.get(`/admin/product-category?all=true&${queryParams.toString()}`);
  }

}

// Sub-Category API
export class SSRProductSubCategoryAPI {
  constructor(private api: SSRAPI) { }

  async getAll(page: number = 1, limit: number = 10, search?: string, isActive?: boolean, categoryId?: string) {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (search) {
      queryParams.set('search', search);
    }
    if (isActive) {
      queryParams.set('isActive', String(isActive));
    }
    if (categoryId) {
      queryParams.set('categoryId', categoryId);
    }
    return this.api.get(`/admin/subcategory?${queryParams.toString()}`);
  }


  async getActive() {
    return this.api.get(`/admin/subcategory/active`);
  }

  async create(data: Record<string, unknown>) {
    return this.api.post('/admin/subcategory', data);
  }

  async update(id: string, data: Record<string, unknown>) {
    return this.api.put(`/admin/subcategory/${id}`, data);
  }

  async bulkUpdateStatus(data: Record<string, unknown>) {
    return this.api.patch(`/admin/subcategory/bulk-status`, data);
  }

  async delete(id: string) {
    return this.api.delete(`/admin/subcategory/${id}`);
  }

  async bulkDelete(data: Record<string, unknown>) {
    return this.api.delete(`/admin/subcategory/bulk-delete`, { body: data });
  }

  async bulkGetSelected(data: { ids: string[] }) {
    return this.api.post(`/admin/subcategory/bulk-get`, data);
  }

  async bulkAllDownload(filterData: DownloadSearchParams) {
    const queryParams = new URLSearchParams({});
    if (filterData.search) {
      queryParams.set('search', filterData.search);
    }
    if (filterData.isActive != undefined) {
      queryParams.set('isActive', String(filterData.isActive));
    }
    if (filterData.categoryId) {
      queryParams.set('categoryId', filterData.categoryId);
    }
    return this.api.get(`/admin/subcategory?all=true&${queryParams.toString()}`);
  }
}

// Low Stock API
export class SSRLowStockAPI {
  constructor(private api: SSRAPI) { }

  async getAll(page: number = 1, limit: number = 10, search?: string) {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (search) {
      queryParams.set('search', search);
    }
    return this.api.get(`/admin/low-stock?${queryParams.toString()}`);
  }
}

// Variants API
export class SSRVariantsAPI {
  constructor(private api: SSRAPI) { }

  async getAll(page: number = 1, limit: number = 10, search?: string, isActive?: boolean) {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (search) {
      queryParams.set('search', search);
    }
    if (isActive) {
      queryParams.set('isActive', String(isActive));
    }
    return this.api.get(`/admin/variant?${queryParams.toString()}`);
  }

  async getActive() {
    return this.api.get(`/admin/variant/active`);
  }

  async create(data: Record<string, unknown>) {
    return this.api.post('/admin/variant', data);
  }

  async update(id: string, data: Record<string, unknown>) {
    return this.api.put(`/admin/variant/${id}`, data);
  }

  async bulkUpdateStatus(data: Record<string, unknown>) {
    return this.api.patch(`/admin/variant/bulk-status`, data);
  }

  async delete(id: string) {
    return this.api.delete(`/admin/variant/${id}`);
  }

  async bulkDelete(data: Record<string, unknown>) {
    return this.api.delete(`/admin/variant/bulk-delete`, { body: data });
  }

  async bulkGetSelected(data: { ids: string[] }) {
    return this.api.post(`/admin/variant/bulk-get`, data);
  }

  async bulkAllDownload(filterData: DownloadSearchParams) {
    const queryParams = new URLSearchParams({});
    if (filterData.search) {
      queryParams.set('search', filterData.search);
    }
    if (filterData.isActive != undefined) {
      queryParams.set('isActive', String(filterData.isActive));
    }

    return this.api.get(`/admin/variant?all=true&${queryParams.toString()}`);
  }
}

// Unit API
export class SSRUnitAPI {
  constructor(private api: SSRAPI) { }

  async getAll(page: number = 1, limit: number = 10, search?: string, isActive?: boolean) {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (search) {
      queryParams.set('search', search);
    }
    if (isActive) {
      queryParams.set('isActive', String(isActive));
    }
    return this.api.get(`/admin/unit?${queryParams.toString()}`);
  }

  async getActive() {
    return this.api.get(`/admin/unit/active`);
  }

  async create(data: Record<string, unknown>) {
    return this.api.post('/admin/unit', data);
  }

  async update(id: string, data: Record<string, unknown>) {
    return this.api.put(`/admin/unit/${id}`, data);
  }

  async bulkUpdateStatus(data: Record<string, unknown>) {
    return this.api.patch(`/admin/unit/bulk-status`, data);
  }

  async delete(id: string) {
    return this.api.delete(`/admin/unit/${id}`);
  }

  async bulkDelete(data: Record<string, unknown>) {
    return this.api.delete(`/admin/unit/bulk-delete`, { body: data });
  }

  async bulkGetSelected(data: { ids: string[] }) {
    return this.api.post(`/admin/unit/bulk-get`, data);
  }

  async bulkAllDownload(filterData: DownloadSearchParams) {
    const queryParams = new URLSearchParams({});
    if (filterData.search) {
      queryParams.set('search', filterData.search);
    }
    if (filterData.isActive != undefined) {
      queryParams.set('isActive', String(filterData.isActive));
    }
    return this.api.get(`/admin/unit?all=true&${queryParams.toString()}`);
  }
}

// Brand API
export class SSRBrandAPI {
  constructor(private api: SSRAPI) { }

  async getAll(page: number = 1, limit: number = 10, search?: string, isActive?: boolean) {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (search) {
      queryParams.set('search', search);
    }
    if (isActive) {
      queryParams.set('isActive', String(isActive));
    }
    return this.api.get(`/admin/brand?${queryParams.toString()}`);
  }

  async getActive() {
    return this.api.get(`/admin/brand/active`);
  }

  async create(data: Record<string, unknown>) {
    return this.api.post('/admin/brand', data);
  }

  async update(id: string, data: Record<string, unknown>) {
    return this.api.put(`/admin/brand/${id}`, data);
  }

  async bulkUpdateStatus(data: Record<string, unknown>) {
    return this.api.patch(`/admin/brand/bulk-status`, data);
  }

  async delete(id: string) {
    return this.api.delete(`/admin/brand/${id}`);
  }

  async bulkDelete(data: Record<string, unknown>) {
    return this.api.delete(`/admin/brand/bulk-delete`, { body: data });
  }

  async bulkGetSelected(data: { ids: string[] }) {
    return this.api.post(`/admin/brand/bulk-get`, data);
  }

  async bulkAllDownload(filterData: DownloadSearchParams) {
    const queryParams = new URLSearchParams({});
    if (filterData.search) {
      queryParams.set('search', filterData.search);
    }
    if (filterData.isActive != undefined) {
      queryParams.set('isActive', String(filterData.isActive));
    }
    return this.api.get(`/admin/brand?all=true&${queryParams.toString()}`);
  }
}

// Warrenty API
export class SSRWarrentyAPI {
  constructor(private api: SSRAPI) { }

  async getAll(page: number = 1, limit: number = 10, search?: string, isActive?: boolean) {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (search) {
      queryParams.set('search', search);
    }
    if (isActive) {
      queryParams.set('isActive', String(isActive));
    }
    return this.api.get(`/admin/warranty?${queryParams.toString()}`);
  }

  async getActive() {
    return this.api.get(`/admin/warranty/active`);
  }

  async create(data: Record<string, unknown>) {
    return this.api.post('/admin/warranty', data);
  }

  async update(id: string, data: Record<string, unknown>) {
    return this.api.put(`/admin/warranty/${id}`, data);
  }

  async bulkUpdateStatus(data: Record<string, unknown>) {
    return this.api.patch(`/admin/warranty/bulk-status`, data);
  }

  async delete(id: string) {
    return this.api.delete(`/admin/warranty/${id}`);
  }

  async bulkDelete(data: Record<string, unknown>) {
    return this.api.delete(`/admin/warranty/bulk-delete`, { body: data });
  }

  async bulkGetSelected(data: { ids: string[] }) {
    return this.api.post(`/admin/warranty/bulk-get`, data);
  }

  async bulkAllDownload(filterData: DownloadSearchParams) {
    const queryParams = new URLSearchParams({});
    if (filterData.search) {
      queryParams.set('search', filterData.search);
    }
    if (filterData.isActive != undefined) {
      queryParams.set('isActive', String(filterData.isActive));
    }
    return this.api.get(`/admin/warranty?all=true&${queryParams.toString()}`);
  }
}

//StafF

export class SSRStaffHRMAPI {
  constructor(private api: SSRAPI) { }

  async create(data: Record<string, unknown>) {
    return this.api.post('/admin/employees', data);
  }
  async getById(id: string) {
    return this.api.get(`/admin/employees/${id}`);
  }
  async update(id: string, data: Record<string, unknown>) {
    return this.api.put(`/admin/employees/${id}`, data);
  }
  async deleteById(id: string) {
    return this.api.delete(`/admin/employees/${id}`);
  }
  async toggle(id: string) {
    return this.api.patch(`/admin/employees/toggle/${id}`);
  }
  async getByStore(storeId: string) {
    return this.api.get(`/admin/store/${storeId}`);
  }
  async getByDesignation(designation: string) {
    return this.api.get(`/admin/employees/designation/${encodeURIComponent(designation)}`);
  }
  async getAll(page: number = 1, limit: number = 10, search?: string, storeId?: string, designation?: string, isActive?: string | boolean) {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (search) queryParams.set('search', search);
    if (storeId) {
      queryParams.set('storeId', storeId);
    }
    if (designation) {
      queryParams.set('designation', designation);
    }
    if (isActive !== undefined) queryParams.set('isActive', String(isActive));
    return this.api.get(`/admin/employees?${queryParams.toString()}`);
  }
  async checkManagerForStore(storeId: string) {
    return this.api.get(`/admin/employees/check-manager/store/${storeId}`);
  }

  async bulkStatusUpdate(data: Record<string, unknown>) {
    return this.api.patch('/admin/employees/bulk-status', data);
  }

  async bulkDelete(data: { ids: string[] }) {
    return this.api.delete('/admin/employees/bulk-delete', { body: data });
  }
  async bulkGetSelected(data: { ids: string[] }) {
    return this.api.post(`/admin/employees/bulk-get`, data);
  }
  async bulkAllDownload(filterData: DownloadSearchParams) {
    const queryParams = new URLSearchParams({});
    if (filterData.search) {
      queryParams.set('search', filterData.search);
    }
    if (filterData.isActive != undefined) {
      queryParams.set('isActive', String(filterData.isActive));
    }
    if (filterData.storeId) {
      queryParams.set('storeId', filterData.storeId);
    }
    if (filterData.designation) {
      queryParams.set('designation', filterData.designation);
    }

    return this.api.get(`/admin/employees?all=true&${queryParams.toString()}`);
  }


}

export class SSRHrmManagerAPI {
  constructor(private api: SSRAPI) { }

  async getAll() {
    return this.api.get('/admin/manager');
  }

  async getById(id: string) {
    return this.api.get(`/admin/employees/managers/${id}`);
  }

  async getByStore(storeId: string) {
    return this.api.get(`/admin/store/${storeId}`);
  }

  async getByDesignation(designation: string) {
    return this.api.get(`/admin/employees?designation=${encodeURIComponent(designation)}`);
  }

  async checkManagerForStore(storeId: string) {
    return this.api.get(`/admin/employees/managers/check-manager/store/${storeId}`);
  }

  async create(data: Record<string, unknown>) {
    return this.api.post('/admin/employees', data);
  }

  async update(id: string, data: Record<string, unknown>) {
    return this.api.put(`/admin/employees/${id}`, data);
  }

  async toggle(id: string) {
    return this.api.patch(`/admin/employees/manager/toggle/${id}`);
  }

  async delete(id: string) {
    return this.api.delete(`/admin/employees/${id}`);
  }
}

//Shift
export class SSRShiftAPI {
  constructor(private api: SSRAPI) { }

  async getAll(page: number = 1, limit: number = 10, search?: string, isActive?: boolean) {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (search) {
      queryParams.set('search', search);
    }
    if (isActive) {
      queryParams.set('isActive', String(isActive));
    }
    return this.api.get(`/admin/shiftType?${queryParams.toString()}`);
  }

  async getById(id: string) {
    return this.api.get(`/admin/shiftType/${id}`);
  }

  async create(data: Record<string, unknown>) {
    return this.api.post('/admin/shiftType', data);
  }

  async update(id: string, data: Record<string, unknown>) {
    return this.api.put(`/admin/shiftType/${id}`, data);
  }

  async bulkUpdateStatus(data: Record<string, unknown>) {
    return this.api.patch(`/admin/shiftType/bulk-status`, data);
  }

  async toggle(id: string) {
    return this.api.patch(`/admin/shiftType/toggle/${id}`);
  }

  async delete(id: string) {
    return this.api.delete(`/admin/shiftType/${id}`);
  }

  async bulkDelete(data: Record<string, unknown>) {
    return this.api.delete('/admin/shiftType/bulk-delete', { body: data });
  }

  async bulkGetSelected(data: { ids: string[] }) {
    return this.api.post(`/admin/shiftType/bulk-get`, data);
  }

  async bulkAllDownload(filterData: DownloadSearchParams) {
    const queryParams = new URLSearchParams({});
    if (filterData.search) {
      queryParams.set('search', filterData.search);
    }
    if (filterData.isActive != undefined) {
      queryParams.set('isActive', String(filterData.isActive));
    }
    return this.api.get(`/admin/shiftType?all=true&${queryParams.toString()}`);
  }
}


//Leave Type API
export class SSRLeaveTypeAPI {
  constructor(private api: SSRAPI) { }

  async getAll(page: number = 1, limit: number = 10, search?: string, isActive?: boolean) {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (search) {
      queryParams.set('search', search);
    }
    if (isActive) {
      queryParams.set('isActive', String(isActive));
    }
    return this.api.get(`/admin/leave-type?${queryParams.toString()}`);
  }

  async getById(id: string) {
    return this.api.get(`/admin/leave-type/${id}`);
  }

  async getAllActive() {
    return this.api.get('/admin/leave-type/active', { revalidate: 300 });
  }

  async create(data: Record<string, unknown>) {
    return this.api.post('/admin/leave-type', data);
  }

  async update(id: string, data: Record<string, unknown>) {
    return this.api.put(`/admin/leave-type/${id}`, data);
  }

  async toggle(id: string) {
    return this.api.patch(`/admin/leave-type/toggle/${id}`);
  }

  async bulkUpdateStatus(data: { ids: string[]; status: boolean }) {
    return this.api.patch('/admin/leave-type/bulk-status', data);
  }

  async delete(id: string) {
    return this.api.delete(`/admin/leave-type/${id}`);
  }

  async bulkDelete(data: { ids: string[] }) {
    return this.api.delete('/admin/leave-type/bulk-delete', { body: data });
  }
}

//Shift Assignment API
export class SSRShiftAssignmentAPI {
  constructor(private api: SSRAPI) { }

  async create(data: Record<string, unknown>) {
    return this.api.post('/admin/shifts', data);
  }

  async getAll(queryParams: {
    page?: number;
    limit?: number;
    search?: string;
    storeId?: string;
    employeeId?: string;
    shiftTypeId?: string;
    assignmentDate?: string;
    all?: boolean;
  } = {}) {
    const {
      page = 1,
      limit = 10,
      search,
      storeId,
      employeeId,
      shiftTypeId,
      assignmentDate,
      all = true,
    } = queryParams;

    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });

    if (typeof all === "boolean") {
      params.set("all", String(all));
    }

    if (search) params.set("search", search);
    if (storeId) params.set("storeId", storeId);
    if (employeeId) params.set("employeeId", employeeId);
    if (shiftTypeId) params.set("shiftTypeId", shiftTypeId);
    if (assignmentDate) params.set("assignmentDate", assignmentDate);

    return this.api.get(
      `/admin/shifts?${params.toString()}`
    );
  }


  async getById(id: string) {
    return this.api.get(`/admin/shifts/${id}`, { revalidate: 0 });
  }

  async getByEmployee(employeeId: string) {
    return this.api.get(`/admin/shifts/employee/${employeeId}`, { revalidate: 0 });
  }

  async getByDate(date: string) {
    return this.api.get(`/admin/shifts/date/${date}`, { revalidate: 0 });
  }

  async update(id: string, data: Record<string, unknown>) {
    return this.api.put(`/admin/shifts/${id}`, data);
  }

  async delete(id: string) {
    return this.api.delete(`/admin/shifts/${id}`);
  }
}

//Stock Transfer API
export class SSRStockTransferAPI {
  constructor(private api: SSRAPI) { }

  async getAll(page: number = 1, limit: number = 10, search?: string, status?: string, storeId?: string) {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (search) {
      queryParams.set('search', search);
    }
    if (status) {
      queryParams.set('status', status);
    }
    if (storeId) {
      queryParams.set('storeId', storeId);
    }
    return this.api.get(`/admin/stock-transfer?${queryParams.toString()}`)
  }

  async create(data: Record<string, unknown>) {
    return this.api.post('/admin/stock-transfer', data);
  }

  async update(id: string, data: Record<string, unknown>) {
    return this.api.put(`/admin/stock-transfer/${id}`, data);
  }

  async complete(id: string) {
    return this.api.patch(`/admin/stock-transfer/${id}/complete`);
  }

  async cancel(id: string, reason?: string) {
    return this.api.patch(`/admin/stock-transfer/${id}/cancel`, { reason });
  }

  async approve(id: string) {
    return this.api.patch(`/admin/stock-transfer/${id}/approve`);
  }

  async pending(id: string) {
    return this.api.patch(`/admin/stock-transfer/${id}/pending`);
  }

  async bulkUpdateStatus(data: Record<string, unknown>) {
    return this.api.patch(`/admin/stock-transfer/bulk-status`, data);
  }

  async delete(id: string) {
    return this.api.delete(`/admin/stock-transfer/${id}`);
  }

  async bulkDelete(data: Record<string, unknown>) {
    return this.api.delete('/admin/stock-transfer/bulk-delete', { body: data });
  }

  async bulkGetSelected(data: { ids: string[] }) {
    return this.api.post(`/admin/stock-transfer/bulk-get`, data);
  }

  async bulkAllDownload(filterData: DownloadSearchParams) {
    const queryParams = new URLSearchParams({});
    if (filterData.search) {
      queryParams.set('search', filterData.search);
    }
    if (filterData.status) {
      queryParams.set('status', filterData.status);
    }
    if (filterData.storeId) {
      queryParams.set('storeId', filterData.storeId);
    }
    return this.api.get(`/admin/stock-transfer?all=true&${queryParams.toString()}`);
  }
}

// Stock Adjustment API
export class SSRStockAdjustmentAPI {
  constructor(private api: SSRAPI) { }

  async getAll(page: number = 1, limit: number = 10, search?: string, status?: string, storeId?: string) {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (search) {
      queryParams.set('search', search);
    }
    if (status) {
      queryParams.set('status', status);
    }
    if (storeId) {
      queryParams.set('storeId', storeId);
    }
    return this.api.get(`/admin/stock-adjustment?${queryParams.toString()}`);
  }

  async getById(id: string) {
    return this.api.get(`/admin/stock-adjustment/${id}`);
  }

  async getStats() {
    return this.api.get(`/admin/stock-adjustment/stats`);
  }

  async getPending() {
    return this.api.get(`/admin/stock-adjustment/pending`);
  }

  async getRecent() {
    return this.api.get(`/admin/stock-adjustment/recent`);
  }

  async create(data: Record<string, unknown>) {
    return this.api.post('/admin/stock-adjustment', data);
  }

  async bulkApprove(ids: string[]) {
    return this.api.post(`/admin/stock-adjustment/bulk-approve`, { ids });
  }

  async bulkComplete(ids: string[]) {
    return this.api.post(`/admin/stock-adjustment/bulk-complete`, { ids });
  }

  async update(id: string, data: Record<string, unknown>) {
    return this.api.put(`/admin/stock-adjustment/${id}`, data);
  }

  async pending(id: string) {
    return this.api.patch(`/admin/stock-adjustment/${id}/pending`);
  }

  async approve(id: string) {
    return this.api.patch(`/admin/stock-adjustment/${id}/approve`);
  }

  async cancel(id: string, reason?: string) {
    return this.api.patch(`/admin/stock-adjustment/${id}/cancel`, { reason });
  }

  async complete(id: string) {
    return this.api.patch(`/admin/stock-adjustment/${id}/complete`);
  }

  async bulkUpdateStatus(data: Record<string, unknown>) {
    return this.api.patch(`/admin/stock-adjustment/bulk-status`, data);
  }

  async delete(id: string) {
    return this.api.delete(`/admin/stock-adjustment/${id}`);
  }

  async bulkDelete(data: Record<string, unknown>) {
    return this.api.delete('/admin/stock-adjustment/bulk-delete', { body: data });
  }

  async bulkGetSelected(data: { ids: string[] }) {
    return this.api.post('/admin/stock-adjustment/bulk-get', data);
  }

  async bulkAllDownload(filterData: DownloadSearchParams) {
    const queryParams = new URLSearchParams({});
    if (filterData.search) {
      queryParams.set('search', filterData.search);
    }
    if (filterData.status) {
      queryParams.set('status', filterData.status);
    }
    if (filterData.storeId) {
      queryParams.set('storeId', filterData.storeId);
    }
    return this.api.get(`/admin/stock-adjustment?all=true&${queryParams.toString()}`);
  }
}

//Leave Management API
export class SSRLeaveManagementAPI {
  constructor(private api: SSRAPI) { }

  async getAllLeaveRequests(page: number = 1, limit: number = 10, search?: string, status?: string, storeId?: string) {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (search) {
      queryParams.set('search', search);
    }
    if (status) {
      queryParams.set('status', status);
    }
    if (storeId) {
      queryParams.set('storeId', storeId);
    }
    return this.api.get(`/admin/leave?${queryParams.toString()}`);
  }

  async getAllActive() {
    return this.api.get('/admin/leave-type/active');
  }
  async getLeaveRequestById(id: string) {
    return this.api.get(`/admin/leave/${id}`);
  }

  async getPendingLeaveRequests(storeId: string) {
    return this.api.get(`/admin/leave/store/${storeId}/pending`);
  }

  async getLeaveStatistics(storeId: string) {
    return this.api.get(`/admin/leave/store/${storeId}/statistics`);
  }

  async createApprovedLeave(data: Record<string, unknown>) {
    return this.api.post('/admin/leave/create-approved', data);
  }

  async updateLeaveRequest(id: string, data: Record<string, unknown>) {
    return this.api.put(`/admin/leave/${id}`, data);
  }

  async approveLeaveRequest(id: string, data?: Record<string, unknown>) {
    return this.api.patch(`/admin/leave/${id}/approve`, data);
  }
  async rejectLeaveRequest(id: string, data?: Record<string, unknown>) {
    return this.api.patch(`/admin/leave/${id}/reject`, data);
  }

  async cancelLeaveRequest(id: string, data?: Record<string, unknown>) {
    return this.api.patch(`/admin/leave/${id}/cancel`, data);
  }
}

//Attendance Management API
export class SSRAttendanceAPI {
  constructor(private api: SSRAPI) { }

  async getAllAttendanceRecords() {
    return this.api.get('/admin/attendance');
  }

  async getAttendanceById(id: string) {
    return this.api.get(`/admin/attendance/${id}`);
  }

  async getAttendanceByEmployee(employeeId: string) {
    return this.api.get(`/admin/attendance/employee/${employeeId}`);
  }

  async getAttendanceByStoreAndDate(storeId: string) {
    return this.api.get(`/admin/attendance/store/${storeId}`);
  }

  async getNoShows() {
    return this.api.get('/admin/attendance/no-shows');
  }

  async createAttendanceRecord(data: Record<string, unknown>) {
    return this.api.post('/admin/attendance', data);
  }

  async clockIn(shiftId: string, data: Record<string, unknown>) {
    return this.api.post(`/admin/attendance/shift/${shiftId}/clock-in`, data);
  }

  async clockOut(shiftId: string, data: Record<string, unknown>) {
    return this.api.post(`/admin/attendance/shift/${shiftId}/clock-out`, data);
  }

  async addBreak(shiftId: string, data: Record<string, unknown>) {
    return this.api.post(`/admin/attendance/shift/${shiftId}/break`, data);
  }

  async markAsNoShow(shiftId: string, data: Record<string, unknown>) {
    return this.api.post(`/admin/attendance/shift/${shiftId}/no-show`, data);
  }

  async markAsLeave(shiftId: string, data: Record<string, unknown>) {
    return this.api.post(`/admin/attendance/shift/${shiftId}/leave`, data);
  }

  async correctAttendance(id: string, data: Record<string, unknown>) {
    return this.api.put(`/admin/attendance/${id}/correct`, data);
  }
}

//Payroll Management API
export class SSRPayrollAPI {
  constructor(private api: SSRAPI) { }

  async getAll(params?: Record<string, unknown>) {
    const queryString = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return this.api.get(`/admin/payroll${queryString}`);
  }

  async getById(id: string) {
    return this.api.get(`/admin/payroll/${id}`);
  }

  async getSummary(month: string) {
    return this.api.get(`/admin/payroll/summary/${month}`);
  }

  async create(data?: Record<string, unknown>) {
    return this.api.post('/admin/payroll', data);
  }

  async generateForEmployee(employeeId: string, data?: Record<string, unknown>) {
    return this.api.post(`/admin/payroll/generate/employee/${employeeId}`, data);
  }

  async generateBulk(data?: Record<string, unknown>) {
    return this.api.post('/admin/payroll/generate/bulk', data);
  }

  async generateForStore(storeId: string, data?: Record<string, unknown>) {
    return this.api.post(`/admin/payroll/generate/store/${storeId}`, data);
  }

  async updateDeduction(id: string, data: Record<string, unknown>) {
    return this.api.patch(`/admin/payroll/${id}/deduction`, data);
  }

  async delete(id: string) {
    return this.api.delete(`/admin/payroll/${id}`);
  }

  async bulkDelete(data: Record<string, unknown>) {
    return this.api.delete('/admin/payroll/bulk-delete', { body: data });
  }

  async bulkGetSelected(data: { ids: string[] }) {
    return this.api.post('/admin/payroll/bulk-get', data);
  }

  async bulkAllDownload(filterData: DownloadSearchParams) {
    const queryParams = new URLSearchParams({});
    if (filterData.search) {
      queryParams.set('search', filterData.search);
    }
    if (filterData.status) {
      queryParams.set('status', filterData.status);
    }
    return this.api.get(`/admin/payroll?all=true&${queryParams.toString()}`);
  }

}

export class SSRHolidayAPI {
  constructor(private api: SSRAPI) { }

  async getAll(page: number = 1, limit: number = 10, search?: string, status?: string) {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (search) {
      queryParams.set('search', search);
    }
    if (status && status !== 'All') {
      queryParams.set('status', status);
    }
    return this.api.get(`/admin/holiday?${queryParams.toString()}`, { revalidate: 0 });
  }

  async getById(id: string) {
    return this.api.get(`/admin/holiday/${id}`);
  }

  async getActive() {
    return this.api.get('/admin/holiday/active');
  }

  async create(data: Record<string, unknown>) {
    return this.api.post('/admin/holiday', data);
  }

  async update(id: string, data: Record<string, unknown>) {
    return this.api.put(`/admin/holiday/${id}`, data);
  }

  async toggle(id: string) {
    return this.api.patch(`/admin/holiday/${id}/toggle`);
  }

  async delete(id: string) {
    return this.api.delete(`/admin/holiday/${id}`);
  }
}
export class SSRExpenseCategoryAPI {
  constructor(private api: SSRAPI) { }

  async getAll(page: number = 1, limit: number = 10, search?: string, isActive?: boolean) {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (search) {
      queryParams.set('search', search);
    }
    if (isActive !== undefined) {
      queryParams.set('isActive', isActive.toString());
    }
    return this.api.get(`/admin/expense-category?${queryParams.toString()}`);
  }

  async getById(id: string) {
    return this.api.get(`/admin/expense-category/${id}`);
  }

  async getActive() {
    return this.api.get('/admin/expense-category/active', { revalidate: 300 });
  }

  async create(data: Record<string, unknown>) {
    return this.api.post('/admin/expense-category', data);
  }

  async update(id: string, data: Record<string, unknown>) {
    return this.api.put(`/admin/expense-category/${id}`, data);
  }

  async toggle(id: string) {
    return this.api.patch(`/admin/expense-category/${id}/toggle`);
  }

  async bulkUpdateStatus(data: { ids: string[]; status: boolean }) {
    return this.api.patch('/admin/expense-category/bulk-status', data);
  }

  async delete(id: string) {
    return this.api.delete(`/admin/expense-category/${id}`);
  }

  async bulkDelete(data: { ids: string[] }) {
    return this.api.delete('/admin/expense-category/bulk-delete', { body: data });
  }

  async bulkGetSelected(data: { ids: string[] }) {
    return this.api.post('/admin/expense-category/bulk-get', data);
  }

  async bulkAllDownload(filterData: Record<string, any>) {
    const queryParams = new URLSearchParams({ all: 'true' });
    if (filterData.search) queryParams.set('search', filterData.search);
    if (filterData.isActive != undefined) {
      queryParams.set('isActive', String(filterData.isActive));
    }
    return this.api.get(`/admin/expense-category?all=true&${queryParams.toString()}`);
  }
}

// Supplier API
export class SSRSupplierAPI {
  constructor(private api: SSRAPI) { }

  async getAll(page: number = 1, limit: number = 10, search?: string, isActive?: boolean) {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (search) {
      queryParams.set('search', search);
    }
    if (isActive !== undefined) {
      queryParams.set('isActive', String(isActive));
    }
    return this.api.get(`/admin/supplier?${queryParams.toString()}`);
  }

  async create(data: Record<string, unknown>) {
    return this.api.post('/admin/supplier', data);
  }

  async update(id: string, data: Record<string, unknown>) {
    return this.api.put(`/admin/supplier/${id}`, data);
  }

  async updateStatus(id: string, status: boolean) {
    return this.api.patch(`/admin/supplier/${id}/status`, { status });
  }

  async toggleStatus(id: string) {
    return this.api.patch(`/admin/supplier/${id}/toggle`);
  }

  async bulkUpdateStatus(data: { ids: string[], status: boolean }) {
    return this.api.patch(`/admin/supplier/bulk-status`, data);
  }

  async delete(id: string) {
    return this.api.delete(`/admin/supplier/${id}`);
  }

  async bulkDelete(data: { ids: string[] }) {
    return this.api.post(`/admin/supplier/bulk-delete`, data);
  }

  async bulkGetSelected(data: { ids: string[] }) {
    return this.api.post(`/admin/supplier/bulk-get`, data);
  }

  async bulkAllDownload(filterData: DownloadSearchParams) {
    const queryParams = new URLSearchParams({});
    if (filterData.search) {
      queryParams.set('search', filterData.search);
    }
    if (filterData.isActive !== undefined) {
      queryParams.set('isActive', String(filterData.isActive));
    }
    return this.api.get(`/admin/supplier?all=true&${queryParams.toString()}`);
  }
}

// Admin Taxes API
export class SSRAdminTaxAPI {
  constructor(private api: SSRAPI) { }

  async getAll(page: number = 1, limit: number = 10, search?: string, isActive?: boolean, type?: string) {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (search) {
      queryParams.set('search', search);
    }
    if (isActive !== undefined) {
      queryParams.set('isActive', String(isActive));
    }
    if (type) {
      queryParams.set('type', type);
    }
    return this.api.get(`/admin/taxes?${queryParams.toString()}`);
  }

  async getActive() {
    return this.api.get('/admin/taxes/active');
  }

  async create(data: Record<string, unknown>) {
    return this.api.post('/admin/taxes', data);
  }

  async update(id: string, data: Record<string, unknown>) {
    return this.api.put(`/admin/taxes/${id}`, data);
  }

  async bulkUpdateStatus(data: { ids: string[]; status: boolean }) {
    return this.api.patch('/admin/taxes/bulk-status', data as any);
  }

  async delete(id: string) {
    return this.api.delete(`/admin/taxes/${id}`);
  }

  async bulkDelete(data: { ids: string[] }) {
    return this.api.delete('/admin/taxes/bulk-delete', { body: data });
  }

  async bulkGetSelected(data: { ids: string[] }) {
    return this.api.post('/admin/taxes/bulk-get', data);
  }

  async bulkAllDownload(filterData: DownloadSearchParams) {
    const queryParams = new URLSearchParams({ all: 'true' });
    if (filterData.search) {
      queryParams.set('search', filterData.search);
    }
    if (filterData.isActive !== undefined) {
      queryParams.set('isActive', String(filterData.isActive));
    }
    if (filterData.type) {
      queryParams.set('type', filterData.type);
    }
    return this.api.get(`/admin/taxes?all=true&${queryParams.toString()}`);
  }
}

// Purchase Order API
export class SSRPurchaseOrderAPI {
  constructor(private api: SSRAPI) { }

  async getAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
    status?: 'draft' | 'cancel' | 'approve' | 'billed',
    all?: boolean
  ) {
    const queryParams = new URLSearchParams();
    queryParams.set('page', String(page));
    queryParams.set('limit', String(limit));

    if (search?.trim()) {
      queryParams.set('search', search.trim());
    }
    if (status) {
      queryParams.set('status', status);
    }
    if (typeof all === 'boolean') {
      queryParams.set('all', String(all));
    }
    return this.api.get(`/admin/purchase-order?${queryParams.toString()}`);
  }

  async generatePurchaseOrderReport(
    page: number = 1,
    limit: number = 10,
    filters?: {
      search?: string;
      storeId?: string;
      storeName?: string;
      categoryId?: string;
      subCategoryId?: string;
      productId?: string;
      variantId?: string;
      categoryName?: string;
      subCategoryName?: string;
      productName?: string;
      variantName?: string;
      status?: string | string[];
      dateFrom?: string;
      dateTo?: string;
      minPurchaseQty?: number;
      maxPurchaseQty?: number;
      minPurchaseAmount?: number;
      maxPurchaseAmount?: number;
    }
  ) {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    const defaultStatuses = ['APPROVED', 'BILLED'];
    if (filters?.status) {
      const statusValue = Array.isArray(filters.status)
        ? filters.status.join(',')
        : filters.status;
      queryParams.set('status', statusValue);
    } else {
      queryParams.set('status', defaultStatuses.join(','));
    }
    if (filters?.search) queryParams.set('search', filters.search);
    if (filters?.storeId) queryParams.set('storeId', filters.storeId);
    if (filters?.storeName) queryParams.set('storeName', filters.storeName);
    if (filters?.categoryId) queryParams.set('categoryId', filters.categoryId);
    if (filters?.subCategoryId) queryParams.set('subCategoryId', filters.subCategoryId);
    if (filters?.productId) queryParams.set('productId', filters.productId);
    if (filters?.variantId) queryParams.set('variantId', filters.variantId);
    if (filters?.categoryName) queryParams.set('categoryName', filters.categoryName);
    if (filters?.subCategoryName) queryParams.set('subCategoryName', filters.subCategoryName);
    if (filters?.productName) queryParams.set('productName', filters.productName);
    if (filters?.variantName) queryParams.set('variantName', filters.variantName);
    if (filters?.dateFrom) queryParams.set('dateFrom', filters.dateFrom);
    if (filters?.dateTo) queryParams.set('dateTo', filters.dateTo);
    if (filters?.minPurchaseQty !== undefined)
      queryParams.set('minPurchaseQty', filters.minPurchaseQty.toString());
    if (filters?.maxPurchaseQty !== undefined)
      queryParams.set('maxPurchaseQty', filters.maxPurchaseQty.toString());
    if (filters?.minPurchaseAmount !== undefined)
      queryParams.set('minPurchaseAmount', filters.minPurchaseAmount.toString());
    if (filters?.maxPurchaseAmount !== undefined)
      queryParams.set('maxPurchaseAmount', filters.maxPurchaseAmount.toString());
    return this.api.get(
      `/admin/purchase-order/report-data?${queryParams.toString()}`
    );
  }

  async generatePurchaseOrderReportBulkDownload(
    filters?: {
      search?: string;
      storeId?: string;
      storeName?: string;
      categoryId?: string;
      subCategoryId?: string;
      productId?: string;
      variantId?: string;
      categoryName?: string;
      subCategoryName?: string;
      productName?: string;
      variantName?: string;
      status?: string | string[];
      dateFrom?: string;
      dateTo?: string;
      minPurchaseQty?: number;
      maxPurchaseQty?: number;
      minPurchaseAmount?: number;
      maxPurchaseAmount?: number;
    }
  ) {
    const queryParams = new URLSearchParams({});
    const defaultStatuses = ['APPROVED', 'BILLED'];
    if (filters?.status) {
      const statusValue = Array.isArray(filters.status)
        ? filters.status.join(',')
        : filters.status;
      queryParams.set('status', statusValue);
    } else {
      queryParams.set('status', defaultStatuses.join(','));
    }
    if (filters?.search) queryParams.set('search', filters.search);
    if (filters?.storeId) queryParams.set('store', filters.storeId);
    if (filters?.storeName) queryParams.set('storeName', filters.storeName);
    if (filters?.categoryId) queryParams.set('categoryId', filters.categoryId);
    if (filters?.subCategoryId) queryParams.set('subCategoryId', filters.subCategoryId);
    if (filters?.productId) queryParams.set('productId', filters.productId);
    if (filters?.variantId) queryParams.set('variantId', filters.variantId);
    if (filters?.categoryName) queryParams.set('categoryName', filters.categoryName);
    if (filters?.subCategoryName) queryParams.set('subCategoryName', filters.subCategoryName);
    if (filters?.productName) queryParams.set('productName', filters.productName);
    if (filters?.variantName) queryParams.set('variantName', filters.variantName);
    if (filters?.dateFrom) queryParams.set('dateFrom', filters.dateFrom);
    if (filters?.dateTo) queryParams.set('dateTo', filters.dateTo);
    if (filters?.minPurchaseQty !== undefined)
      queryParams.set('minPurchaseQty', filters.minPurchaseQty.toString());
    if (filters?.maxPurchaseQty !== undefined)
      queryParams.set('maxPurchaseQty', filters.maxPurchaseQty.toString());
    if (filters?.minPurchaseAmount !== undefined)
      queryParams.set('minPurchaseAmount', filters.minPurchaseAmount.toString());
    if (filters?.maxPurchaseAmount !== undefined)
      queryParams.set('maxPurchaseAmount', filters.maxPurchaseAmount.toString());
    queryParams.set('all', 'true');
    return this.api.get(
      `/admin/purchase-order/report-data?${queryParams.toString()}`
    );
  }

  async getById(id: string) {
    return this.api.get(`/admin/purchase-order/${id}`);
  }

  async getInvoice(id: string) {
    return this.api.post(`/admin/purchase-order/${id}/invoice`);
  }

  async sendEmail(id: string) {
    return this.api.get(`/admin/purchase-order/${id}/send-email`);
  }

  async create(data: Record<string, unknown>) {
    return this.api.post('/admin/purchase-order', data);
  }

  async update(id: string, data: Record<string, unknown>) {
    return this.api.put(`/admin/purchase-order/${id}`, data);
  }

  async updateStatus(id: string, data: Record<string, unknown>) {
    return this.api.patch(`/admin/purchase-order/${id}/status`, data);
  }

  async bulkUpdateStatus(data: Record<string, unknown>) {
    return this.api.patch('/admin/purchase-order/bulk-status', data);
  }

  async delete(id: string) {
    return this.api.delete(`/admin/purchase-order/${id}`);
  }

  async bulkDelete(data: { ids: string[] }) {
    return this.api.delete('/admin/purchase-order/bulk-delete', { body: data });
  }

  async bulkGetSelected(data: { ids: string[] }) {
    return this.api.post(`/admin/purchase-order/bulk-get`, data);
  }

  async bulkAllDownload(filterData: DownloadSearchParams) {
    const queryParams = new URLSearchParams({});
    if (filterData.search) {
      queryParams.set('search', filterData.search);
    }
    if (filterData.isActive !== undefined) {
      queryParams.set('isActive', String(filterData.isActive));
    }
    return this.api.get(`/admin/purchase-order?all=true&${queryParams.toString()}`);
  }

  async getInitialForm() {
    return this.api.get(`/admin/purchase-order-form`);
  }
}

// Customer API
export class SSRCustomerAPI {
  constructor(private api: SSRAPI) { }

  async getAll(page: number = 1, limit: number = 10, search?: string, isActive?: boolean) {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (search) {
      queryParams.set('search', search);
    }
    if (isActive) {
      queryParams.set('isActive', String(isActive));
    }
    return this.api.get(`/admin/customer?${queryParams.toString()}`);
  }

  async getById(id: string) {
    return this.api.get(`/admin/customer/${id}`);
  }

  async getAllActive() {
    return this.api.get('/admin/customer/active');
  }

  async create(data: Record<string, unknown>) {
    return this.api.post('/admin/customer', data);
  }

  async update(id: string, data: Record<string, unknown>) {
    return this.api.put(`/admin/customer/${id}`, data);
  }

  async bulkUpdateStatus(data: Record<string, unknown>) {
    return this.api.patch('/admin/customer/bulk-status', data);
  }

  async delete(id: string) {
    return this.api.delete(`/admin/customer/${id}`);
  }

  async softDelete(id: string) {
    return this.api.patch(`/admin/customer/${id}/soft-delete`);
  }

  async bulkSoftDelete(data: Record<string, unknown>) {
    return this.api.patch('/admin/customer/bulk-soft-delete', data);
  }

  async bulkGetSelected(data: { ids: string[] }) {
    return this.api.post(`/admin/customer/bulk-get`, data);
  }

  async bulkAllDownload(filterData: DownloadSearchParams) {
    const queryParams = new URLSearchParams({});
    if (filterData.search) {
      queryParams.set('search', filterData.search);
    }
    if (filterData.isActive) {
      queryParams.set('isActive', String(filterData.isActive));
    }
    return this.api.get(`/admin/customer?all=true&${queryParams.toString()}`);
  }
}

// Purchase Return API
export class SSRPurchaseReturnAPI {
  constructor(private api: SSRAPI) { }

  async getAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
    status?: 'Draft' | 'Approved' | 'Returned' | 'Credited' | 'Cancelled',
    all?: boolean
  ) {
    const queryParams = new URLSearchParams();
    queryParams.set('page', String(page));
    queryParams.set('limit', String(limit));
    if (search?.trim()) {
      queryParams.set('search', search.trim());
    }
    if (status) {
      queryParams.set('status', status);
    }
    if (typeof all === 'boolean') {
      queryParams.set('all', String(all));
    }
    return this.api.get(`/admin/purchase-return?${queryParams.toString()}`);
  }

  async getById(id: string) {
    return this.api.get(`/admin/purchase-return/${id}`);
  }

  async createDraft(data: Record<string, unknown>) {
    return this.api.post('/admin/purchase-return', data);
  }

  async update(id: string, data: Record<string, unknown>) {
    return this.api.put(`/admin/purchase-return/${id}`, data);
  }

  async changeStatus(id: string, data: Record<string, unknown>) {
    return this.api.patch(`/admin/purchase-return/${id}/status`, data);
  }

  async bulkUpdateStatus(data: Record<string, unknown>) {
    return this.api.patch('/admin/purchase-return/bulk-status', data);
  }

  async delete(id: string) {
    return this.api.delete(`/admin/purchase-return/${id}`);
  }

  async bulkDelete(data: { ids: string[] }) {
    return this.api.delete('/admin/purchase-return/bulk-delete', { body: data });
  }
  async bulkGetSelected(data: { ids: string[] }) {
    return this.api.post(`/admin/purchase-return/bulk-get`, data);
  }

  async bulkAllDownload(filterData: DownloadSearchParams) {
    const queryParams = new URLSearchParams({});
    if (filterData.search) {
      queryParams.set('search', filterData.search);
    }
    if (filterData.isActive) {
      queryParams.set('isActive', String(filterData.isActive));
    }
    return this.api.get(`/admin/purchase-return?all=true&${queryParams.toString()}`);
  }

  async downloadInvoice(id: string) {
    return this.api.get(`/admin/purchase-return/${id}/invoice`);
  }
}

// Loyalty Points API
export class SSRLoyaltyPointsAPI {
  constructor(private api: SSRAPI) { }

  async getAll(page: number = 1, limit: number = 10, search?: string, isActive?: boolean) {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (search) {
      queryParams.set('search', search);
    }
    if (isActive !== undefined) {
      queryParams.set('isActive', String(isActive));
    }
    return this.api.get(`/admin/loyalty-point?${queryParams.toString()}`);
  }

  async create(data: Record<string, unknown>) {
    return this.api.post('/admin/loyalty-point', data);
  }

  async update(id: string, data: Record<string, unknown>) {
    return this.api.put(`/admin/loyalty-point/${id}`, data);
  }

  async bulkUpdateStatus(data: Record<string, unknown>) {
    return this.api.patch('/admin/loyalty-point/bulk-status', data);
  }

  async delete(id: string) {
    return this.api.delete(`/admin/loyalty-point/${id}`);
  }

  async bulkDelete(data: Record<string, unknown>) {
    return this.api.delete('/admin/loyalty-point/bulk-delete', { body: data });
  }

  async bulkGetSelected(data: { ids: string[] }) {
    return this.api.post(`/admin/loyalty-point/bulk-get`, data);
  }

  async bulkAllDownload(filterData: DownloadSearchParams) {
    const queryParams = new URLSearchParams({});
    if (filterData.search) {
      queryParams.set('search', filterData.search);
    }
    if (filterData.isActive !== undefined) {
      queryParams.set('isActive', String(filterData.isActive));
    }
    return this.api.get(`/admin/loyalty-point?all=true&${queryParams.toString()}`);
  }
}

// Loyalty Points Redeem API
export class SSRLoyaltyPointsRedeemAPI {
  constructor(private api: SSRAPI) { }

  async getAll(page: number = 1, limit: number = 10, search?: string, isActive?: boolean) {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (search) {
      queryParams.set('search', search);
    }
    if (isActive !== undefined) {
      queryParams.set('isActive', String(isActive));
    }
    return this.api.get(`/admin/redemption-rule?${queryParams.toString()}`);
  }

  async create(data: Record<string, unknown>) {
    return this.api.post('/admin/redemption-rule', data);
  }

  async validate(customerId: string) {
    return this.api.post('/admin/redemption-rule/validate', { customerId });
  }

  async update(id: string, data: Record<string, unknown>) {
    return this.api.put(`/admin/redemption-rule/${id}`, data);
  }

  async bulkUpdateStatus(data: Record<string, unknown>) {
    return this.api.patch('/admin/redemption-rule/bulk-status', data);
  }

  async softDelete(id: string) {
    return this.api.delete(`/admin/redemption-rule/${id}`);
  }

  async bulkDelete(data: Record<string, unknown>) {
    return this.api.delete('/admin/redemption-rule/bulk-delete', { body: data });
  }

  async bulkGetSelected(data: { ids: string[] }) {
    return this.api.post(`/admin/redemption-rule/bulk-get`, data);
  }

  async bulkAllDownload(filterData: DownloadSearchParams) {
    const queryParams = new URLSearchParams({});
    if (filterData.search) {
      queryParams.set('search', filterData.search);
    }
    if (filterData.isActive !== undefined) {
      queryParams.set('isActive', String(filterData.isActive));
    }
    return this.api.get(`/admin/redemption-rule?all=true&${queryParams.toString()}`);
  }
}

//Loalty Point History API
export class SSRLoyaltyPointsHistoryAPI {
  constructor(private api: SSRAPI) { }

  async getAll(page: number = 1, limit: number = 10, search?: string, isActive?: boolean, transactionType?: string) {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (search) {
      queryParams.set('search', search);
    }
    if (isActive !== undefined) {
      queryParams.set('isActive', String(isActive));
    }
    if (transactionType && transactionType !== 'All') {
      queryParams.set('transactionType', transactionType);
    }
    return this.api.get(`/admin/customer-loyalty-point/history?${queryParams.toString()}`);
  }
}

// Admin Coupon API
export class SSRAdminCouponAPI {
  constructor(private api: SSRAPI) { }

  async getAll(page: number = 1, limit: number = 10, search?: string, isActive?: boolean) {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (search) {
      queryParams.set('search', search);
    }
    if (isActive) {
      queryParams.set('isActive', String(isActive));
    }
    return this.api.get(`/admin/coupon?${queryParams.toString()}`);
  }

  async getActive() {
    return this.api.get('/admin/coupon/active');
  }

  async create(data: Record<string, unknown>) {
    return this.api.post('/admin/coupon', data);
  }

  async validate(code: string, customerId?: string) {
    return this.api.post(`/admin/coupon/validate`, { code, customerId: customerId ?? null });
  }

  async update(id: string, data: Record<string, unknown>) {
    return this.api.put(`/admin/coupon/${id}`, data);
  }

  async bulkUpdateStatus(data: Record<string, unknown>) {
    return this.api.patch('/admin/coupon/bulk-status', data);
  }

  async delete(id: string) {
    return this.api.delete(`/admin/coupon/${id}`);
  }

  async bulkDelete(data: Record<string, unknown>) {
    return this.api.delete('/admin/coupon/bulk-delete', { body: data });
  }

  async bulkGetSelected(data: { ids: string[] }) {
    return this.api.post(`/admin/coupon/bulk-get`, data);
  }

  async bulkAllDownload(filterData: DownloadSearchParams) {
    const queryParams = new URLSearchParams({});
    if (filterData.search) {
      queryParams.set('search', filterData.search);
    }
    if (filterData.isActive !== undefined) {
      queryParams.set('isActive', String(filterData.isActive));
    }
    return this.api.get(`/admin/coupon?all=true&${queryParams.toString()}`);
  }
}

// Gift Card API
export class SSRGiftCardAPI {
  constructor(private api: SSRAPI) { }

  async getAll(page: number = 1, limit: number = 10, search?: string, isActive?: boolean) {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (search) {
      queryParams.set('search', search);
    }
    if (isActive) {
      queryParams.set('isActive', String(isActive));
    }
    return this.api.get(`/admin/gift-card?${queryParams.toString()}`);
  }

  async create(data: Record<string, unknown>) {
    return this.api.post('/admin/gift-card', data);
  }

  async validate(data: { number: string; customerId: string; purchaseAmount: number }) {
    return this.api.post('/admin/gift-card/validate', data);
  }

  async update(id: string, data: Record<string, unknown>) {
    return this.api.put(`/admin/gift-card/${id}`, data);
  }

  async bulkUpdateStatus(data: Record<string, unknown>) {
    return this.api.patch('/admin/gift-card/bulk-status', data);
  }

  async delete(id: string) {
    return this.api.delete(`/admin/gift-card/${id}`);
  }

  async bulkDelete(data: Record<string, unknown>) {
    return this.api.delete('/admin/gift-card/bulk-delete', { body: data });
  }

  async bulkGetSelected(data: { ids: string[] }) {
    return this.api.post(`/admin/gift-card/bulk-get`, data);
  }

  async bulkAllDownload(filterData: DownloadSearchParams) {
    const queryParams = new URLSearchParams({});
    if (filterData.search) {
      queryParams.set('search', filterData.search);
    }
    if (filterData.isActive) {
      queryParams.set('isActive', String(filterData.isActive));
    }
    return this.api.get(`/admin/gift-card?all=true&${queryParams.toString()}`);
  }
}

// Admin Tenant Mail Setting API
export class SSRTenantMailSettingAPI {
  constructor(private api: SSRAPI) { }

  async getAll() {
    return this.api.get('/admin/mail-setting');
  }

  async getStatus() {
    return this.api.get('/admin/mail-setting/status');
  }

  async createOrUpdate(data: Record<string, unknown>) {
    return this.api.post('/admin/mail-setting', data);
  }

  async verify(data?: Record<string, unknown>) {
    return this.api.post('/admin/mail-setting/verify', data);
  }

  async delete() {
    return this.api.delete('/admin/mail-setting');
  }
}

//expence api
export class SSRExpenseAPI {
  constructor(private api: SSRAPI) { }

  async getAll(page: number = 1, limit: number = 10, search?: string, status?: string, categoryId?: string) {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (search) {
      queryParams.set('search', search);
    }
    if (status) {
      queryParams.set('status', status.toLocaleLowerCase());
    }
    if (categoryId) {
      queryParams.set('categoryId', categoryId);
    }
    return this.api.get(`/admin/expenses?${queryParams.toString()}`);
  }

  async generateExpenseReport(
    page: number = 1,
    limit: number = 10,
    filters?: {
      search?: string;
      categoryName?: string;
      storeName?: string;
      status?: string;
      fromDate?: string;
      toDate?: string;
      minAmount?: number;
      maxAmount?: number;
    }
  ) {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (filters?.search) {
      queryParams.set('search', filters.search);
    }
    if (filters?.categoryName) {
      queryParams.set('categoryName', filters.categoryName);
    }
    if (filters?.storeName) {
      queryParams.set('storeName', filters.storeName);
    }
    if (filters?.status) {
      queryParams.set('status', filters.status);
    }
    if (filters?.fromDate) {
      queryParams.set('fromDate', filters.fromDate);
    }
    if (filters?.toDate) {
      queryParams.set('toDate', filters.toDate);
    }
    if (filters?.minAmount !== undefined) {
      queryParams.set('minAmount', filters.minAmount.toString());
    }
    if (filters?.maxAmount !== undefined) {
      queryParams.set('maxAmount', filters.maxAmount.toString());
    }
    return this.api.get(`/admin/expenses/report?${queryParams.toString()}`);
  }

  async getById(id: string) {
    return this.api.get(`/admin/expenses/${id}`);
  }

  async create(data: Record<string, unknown>) {
    return this.api.post('/admin/expenses', data);
  }

  async update(id: string, data: Record<string, unknown>) {
    return this.api.put(`/admin/expenses/${id}`, data);
  }

  async approve(id: string) {
    return this.api.patch(`/admin/expenses/${id}/approve`);
  }

  async reject(id: string, reason?: string) {
    return this.api.patch(`/admin/expenses/${id}/reject`, { reason });
  }

  async bulkUpdateStatus(data: Record<string, unknown>) {
    return this.api.patch('/admin/expenses/bulk-status', data);
  }

  async delete(id: string) {
    return this.api.delete(`/admin/expenses/${id}`);
  }

  async bulkDelete(data: Record<string, unknown>) {
    return this.api.delete('/admin/expenses/bulk-delete', { body: data });
  }

  async bulkGetSelected(data: { ids: string[] }) {
    return this.api.post('/admin/expenses/bulk-get', data);
  }

  async bulkAllDownload(filterData: DownloadSearchParams) {
    const queryParams = new URLSearchParams({});
    if (filterData.search) {
      queryParams.set('search', filterData.search);
    }
    if (filterData.status) {
      queryParams.set('status', filterData.status);
    }
    if (filterData.categoryId) {
      queryParams.set('categoryId', filterData.categoryId);
    }
    return this.api.get(`/admin/expenses?all=true&${queryParams.toString()}`);
  }
}

// Sales API
export class SSRSalesAPI {
  constructor(private api: SSRAPI) { }

  async getByCustomer(customerId: string) {
    return this.api.get(`/admin/sales?customerId=${customerId}`);
  }

  async getAll(page: number = 1, limit: number = 10, search?: string, paymentStatus?: string, storeId?: string) {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (search) {
      queryParams.set('search', search);
    }
    if (paymentStatus) {
      queryParams.set('paymentStatus', paymentStatus);
    }
    if (storeId) {
      queryParams.set('storeId', storeId);
    }
    return this.api.get(`/admin/sales?${queryParams.toString()}`);
  }

  async previewBilling(saleId: string) {
    const res = await this.api.get(`/admin/sales/${saleId}/preview-billing?saleId=${saleId}`);
    return res;
  }

  async getReport() {
    return this.api.get(`/admin/sales/report`);
  }

  async create(data: Record<string, unknown>) {
    return this.api.post('/admin/sales', data);
  }

  async update(id: string, data: Record<string, unknown>) {
    return this.api.put(`/admin/sales/${id}`, data);
  }

  async delete(id: string) {
    return this.api.delete(`/admin/sales/${id}`);
  }

  async bulkDelete(data: Record<string, unknown>) {
    return this.api.delete('/admin/sales/bulk-delete', { body: data });
  }

  async bulkGetSelected(data: { ids: string[] }) {
    return this.api.post(`/admin/sales/bulk-get`, data);
  }

  async bulkAllDownload(filterData: DownloadSearchParams) {
    const queryParams = new URLSearchParams({});
    if (filterData.search) {
      queryParams.set('search', filterData.search);
    }
    if (filterData.paymentStatus || filterData.status) {
      queryParams.set('paymentStatus', filterData.paymentStatus || filterData.status || '');
    }
    if (filterData.storeId) {
      queryParams.set('storeId', filterData.storeId);
    }
    return this.api.get(`/admin/sales?all=true&${queryParams.toString()}`);
  }


}

// Sales Return API
export class SSRSalesReturnAPI {
  constructor(private api: SSRAPI) { }

  async getAll(page: number = 1, limit: number = 10, search?: string, status?: string) {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (search) {
      queryParams.set('search', search);
    }
    if (status && status !== 'All') {
      queryParams.set('status', status);
    }
    return this.api.get(`/admin/sales-return?${queryParams.toString()}`);
  }

  async create(data: Record<string, unknown>) {
    return this.api.post('/admin/sales-return', data);
  }

  async update(id: string, data: Record<string, unknown>) {
    return this.api.put(`/admin/sales-return/${id}`, data);
  }

  async delete(id: string) {
    return this.api.delete(`/admin/sales-return/${id}`);
  }

  async changeStatus(id: string, data: { status: string }) {
    return this.api.patch(`/admin/sales-return/${id}/status`, data);
  }

  async bulkGetSelected(data: { ids: string[] }) {
    return this.api.post(`/admin/sales-return/bulk-get`, data);
  }

  async bulkAllDownload(filterData: DownloadSearchParams) {
    const queryParams = new URLSearchParams({});
    if (filterData.search) {
      queryParams.set('search', filterData.search);
    }
    if (filterData.status != undefined) {
      queryParams.set('status', String(filterData.status));
    }
    return this.api.get(`/admin/sales-return?all=true&${queryParams.toString()}`);
  }
}

// Admin Mail Setting API
export class SSRMailSettingAPI {
  constructor(private api: SSRAPI) { }
  async getAll() {
    return this.api.get('/admin/mail-setting');
  }

  async create(data: Record<string, unknown>) {
    return this.api.post('/admin/mail-setting', data);
  }

  async verify(id: string) {
    return this.api.post(`/admin/mail-setting/${id}/verify`);
  }

  async update(id: string, data: Record<string, unknown>) {
    return this.api.put(`/admin/mail-setting/${id}`, data);
  }

  async delete(id: string) {
    return this.api.delete(`/admin/mail-setting/${id}`);
  }
}

//Notification API
export class SSRNotificationAPI {
  constructor(private api: SSRAPI) { }

  async getAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
    isActive?: boolean
  ) {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (search) {
      queryParams.set('search', search);
    }
    if (isActive !== undefined) {
      queryParams.set('isActive', String(isActive));
    }
    return this.api.get(`/super-admin/notification?${queryParams.toString()}`);
  }

  async getById(id: string) {
    return this.api.get(`/super-admin/notification/${id}`);
  }

  async create(data: Record<string, unknown>) {
    return this.api.post('/super-admin/notification', data);
  }

  async update(id: string, data: Record<string, unknown>) {
    return this.api.put(`/super-admin/notification/${id}`, data);
  }

  async toggleStatus(id: string) {
    return this.api.patch(`/super-admin/notification/${id}/toggle`, {});
  }

  async bulkUpdateStatus(data: Record<string, unknown>) {
    return this.api.patch('/super-admin/notification/bulk-status', data);
  }

  async delete(id: string) {
    return this.api.delete(`/super-admin/notification/${id}`);
  }

  async bulkDelete(data: Record<string, unknown>) {
    return this.api.delete('/super-admin/notification/bulk-delete', { body: data });
  }
}

// Admin Misc Settings API
export class SSRAdminMiscSettingsAPI {
  constructor(private api: SSRAPI) { }
  async getAll() {
    return this.api.get('/admin/misc-setting');
  }

  async update(data: Record<string, unknown>) {
    return this.api.put('/admin/misc-setting', data);
  }

  async toggleDarkMode() {
    return this.api.patch('/admin/misc-setting/dark-mode');
  }
}

export class SSRMailTemplateAPI {
  constructor(private api: SSRAPI) { }

  async getAll(page: number = 1, limit: number = 10, search?: string, isActive?: boolean) {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (search) {
      queryParams.set('search', search);
    }
    if (isActive) {
      queryParams.set('isActive', String(isActive));
    }
    return this.api.get(`/admin/mail-templates?${queryParams.toString()}`);
  }

  async create(data: Record<string, unknown>) {
    return this.api.post('/admin/mail-templates', data);
  }

  async update(id: string, data: Record<string, unknown>) {
    return this.api.put(`/admin/mail-templates/${id}`, data);
  }

  async toggleStatus(id: string) {
    return this.api.patch(`/admin/mail-templates/${id}/toggle`);
  }

  async delete(id: string) {
    return this.api.delete(`/admin/mail-templates/${id}`);
  }
}


export class SSRTenantSMSSettingAPI {
  constructor(private api: SSRAPI) { }

  async getAll() {
    return this.api.get('/admin/sms-setting');
  }

  async getStatus() {
    return this.api.get('/admin/sms-setting/status');
  }

  async createOrUpdate(data: Record<string, unknown>) {
    return this.api.post('/admin/sms-setting', data);
  }

  async verify(data?: Record<string, unknown>) {
    return this.api.post('/admin/sms-setting/verify', data);
  }

  async delete() {
    return this.api.delete('/admin/sms-setting');
  }
}

export class SSRSMSTemplateAPI {
  constructor(private api: SSRAPI) { }

  async getAll(page: number = 1, limit: number = 10, search?: string, isActive?: boolean) {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (search) {
      queryParams.set('search', search);
    }
    if (isActive) {
      queryParams.set('isActive', String(isActive));
    }
    return this.api.get(`/admin/sms-templates?${queryParams.toString()}`);
  }

  async create(data: Record<string, unknown>) {
    return this.api.post('/admin/sms-templates', data);
  }

  async update(id: string, data: Record<string, unknown>) {
    return this.api.put(`/admin/sms-templates/${id}`, data);
  }

  async toggleStatus(id: string) {
    return this.api.patch(`/admin/sms-templates/${id}/toggle`);
  }

  async delete(id: string) {
    return this.api.delete(`/admin/sms-templates/${id}`);
  }
}


export class SSRTenantWhatsAppSettingAPI {
  constructor(private api: SSRAPI) { }

  async getAll() {
    return this.api.get('/admin/whatsapp-setting');
  }

  async getStatus() {
    return this.api.get('/admin/whatsapp-setting/status');
  }

  async createOrUpdate(data: Record<string, unknown>) {
    return this.api.post('/admin/whatsapp-setting', data);
  }

  async verify(data?: Record<string, unknown>) {
    return this.api.post('/admin/whatsapp-setting/verify', data);
  }

  async delete() {
    return this.api.delete('/admin/whatsapp-setting');
  }
}

export class SSRWhatsAppTemplateAPI {
  constructor(private api: SSRAPI) { }

  async getAll(page: number = 1, limit: number = 10, search?: string, isActive?: boolean) {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (search) {
      queryParams.set('search', search);
    }
    if (isActive) {
      queryParams.set('isActive', String(isActive));
    }
    return this.api.get(`/admin/whatsapp-templates?${queryParams.toString()}`);
  }

  async create(data: Record<string, unknown>) {
    return this.api.post('/admin/whatsapp-templates', data);
  }

  async update(id: string, data: Record<string, unknown>) {
    return this.api.put(`/admin/whatsapp-templates/${id}`, data);
  }

  async toggleStatus(id: string) {
    return this.api.patch(`/admin/whatsapp-templates/${id}/toggle`);
  }

  async delete(id: string) {
    return this.api.delete(`/admin/whatsapp-templates/${id}`);
  }
}
// Admin Currency Settings API
export class SSRAdminCurrencySettingsAPI {
  constructor(private api: SSRAPI) { }
  async getAll(page: number = 1,
    limit: number = 10,
  ) {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    return this.api.get(`/admin/currencies?${queryParams.toString()}`, { revalidate: 0 });
  }

  async getPrimary() {
    return this.api.get('/admin/currencies/primary');
  }

  async create(data: Record<string, unknown>) {
    return this.api.post('/admin/currencies', data);
  }

  async update(id: string, data: Record<string, unknown>) {
    return this.api.put(`/admin/currencies/${id}`, data);
  }

  async setPrimary(id: string) {
    return this.api.patch(`/admin/currencies/${id}/set-primary`);
  }

  async delete(id: string) {
    return this.api.delete(`/admin/currencies/${id}`);
  }
}


export class SSRUserLoginAPI {
  constructor(private api: SSRAPI) { }

  async getAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
    store?: string,
    role?: string,
    dateFrom?: string,
    dateTo?: string
  ) {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (search) queryParams.set("search", search);
    if (store && store !== "All") queryParams.set("store", store);
    if (role && role !== "All") queryParams.set("role", role);
    if (dateFrom) queryParams.set("dateFrom", dateFrom);
    if (dateTo) queryParams.set("dateTo", dateTo);
    return this.api.get(`/admin/login-history?${queryParams.toString()}`);
  }
}

export class SSRRolePermissionAPI {
  constructor(private api: SSRAPI) { }

  async getMe() {
    return this.api.get('/admin/access-control/me');
  }

  async getRoleByPermission(roleId: string) {
    return this.api.get(`/admin/access-control/role/${roleId}`);
  }

  async updateRolePermission(roleName: string, data: Record<string, unknown>) {
    return this.api.put(`/admin/access-control/role/${roleName}`, data);
  }
}

export class SSRPosScreenAPI {
  constructor(private api: SSRAPI) { }

  async getAll() {
    return this.api.get('/admin/pos-screen');
  }
}

export class SSRSuperAdminNotificationAPI {
  constructor(private api: SSRAPI) { }

  async getAll() {
    return this.api.get('/super-admin/notifications');
  }

  async getUnreadCount() {
    return this.api.get('/super-admin/notifications/unread-count');
  }

  async markAsRead(id: string) {
    return this.api.patch(`/super-admin/notifications/${id}/read`);
  }

  async markAllAsRead() {
    return this.api.patch('/super-admin/notifications/read-all');
  }

  async delete(id: string) {
    return this.api.delete(`/super-admin/notifications/${id}`);
  }

  async deleteAll() {
    return this.api.delete('/super-admin/notifications/all');
  }
}

export class SSRInvoiceDesignAPI {
  constructor(private api: SSRAPI) { }

  async get() {
    return this.api.get('/admin/invoice-design');
  }

  async save(data: Record<string, unknown>) {
    return this.api.post('/admin/invoice-design', data);
  }
}

export class SSRProfitLossReport {
  constructor(private api: SSRAPI) { }

  async getReport(params: any = {}) {
    const queryParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== "" && value !== "All") {
        queryParams.append(key, String(value));
      }
    }
    return this.api.get(`/admin/sales/profit-loss/report?${queryParams.toString()}`);
  }
}

// Export all API instances
export const ssrPlansAPI = new SSRPlansAPI(ssrAPI);
export const ssrHeroSectionAPI = new SSRHeroSectionAPI(ssrAPI);
export const ssrBusinessTypesAPI = new SSRBusinessTypesAPI(ssrAPI);
export const ssrFeaturesAPI = new SSRFeaturesAPI(ssrAPI);
export const ssrProductOverviewAPI = new SSRProductOverviewAPI(ssrAPI);
export const ssrFAQCategoryAPI = new SSRFAQCategoryAPI(ssrAPI);
export const ssrFAQAPI = new SSRFAQAPI(ssrAPI);
export const ssrBlogsAPI = new SSRBlogsAPI(ssrAPI);
export const ssrFooterSectionAPI = new SSRFooterSectionAPI(ssrAPI);
export const ssrSocialMediaLinksAPI = new SSRSocialMediaLinksAPI(ssrAPI)
export const ssrBusinessOwnersAPI = new SSRBusinessOwnersAPI(ssrAPI);
export const ssrBusinessCategoriesAPI = new SSRBusinessCategoriesAPI(ssrAPI);
export const ssrSubscriptionsAPI = new SSRSubscriptionsAPI(ssrAPI)
export const ssrTaxAPI = new SSRTaxAPI(ssrAPI);
export const ssrGeneralSettingsAPI = new SSRGeneralSettingsAPI(ssrAPI);
export const ssrMiscellaneousSettingsAPI = new SSRMiscellaneousSettingsAPI(ssrAPI);
export const ssrMailSettingsAPI = new SSRMailSettingsAPI(ssrAPI);
export const ssrCurrencySettingsAPI = new SSRCurrencySettingsAPI(ssrAPI);
export const ssrPaymentSettingsAPI = new SSRPaymentSettingsAPI(ssrAPI);
export const ssrTrialSettingsAPI = new SSRTrialSettingsAPI(ssrAPI);
export const ssrGDPRSettingsAPI = new SSRGDPRSettingsAPI(ssrAPI);
export const ssrSEOSettingsAPI = new SSRSEOSettingsAPI(ssrAPI);
export const ssrReportsAPI = new SSRReportsAPI(ssrAPI);
export const ssrPublicAPI = new SSRPublicAPI(ssrAPI);
export const ssrUserSubscriptionAPI = new SSRUserSubscriptionAPI(ssrAPI);
export const ssrUserPaymentAPI = new SSRUserPaymentAPI(ssrAPI);
export const ssrDashboardAPI = new SSRDashboardAPI(ssrAPI);
export const ssrCouponsAPI = new SSRCouponsAPI(ssrAPI);
export const ssrUploadAPI = new SSRUploadAPI(ssrAPI);
export const ssrAdvertisementAPI = new SSRAdvertisementAPI(ssrAPI);
export const ssrExpenseAPI = new SSRExpenseAPI(ssrAPI);
export const ssrNotificationAPI = new SSRNotificationAPI(ssrAPI);

//Admin Panel APIs
export const ssrProductCategoryAPI = new SSRProductCategoryAPI(ssrAPI);
export const ssrProductSubCategoryAPI = new SSRProductSubCategoryAPI(ssrAPI);
export const ssrLowStockAPI = new SSRLowStockAPI(ssrAPI);
export const ssrVariantsAPI = new SSRVariantsAPI(ssrAPI);
export const ssrBrandAPI = new SSRBrandAPI(ssrAPI);
export const ssrUnitAPI = new SSRUnitAPI(ssrAPI);
export const ssrWarrentyAPI = new SSRWarrentyAPI(ssrAPI);
export const ssrStoreAPI = new SSRStoreAPI(ssrAPI);
export const ssrStaffHRMAPI = new SSRStaffHRMAPI(ssrAPI);
export const ssrHrmManagerAPI = new SSRHrmManagerAPI(ssrAPI);
export const ssrShiftAPI = new SSRShiftAPI(ssrAPI);
export const ssrShiftAssignmentAPI = new SSRShiftAssignmentAPI(ssrAPI);
export const ssrLeaveTypeAPI = new SSRLeaveTypeAPI(ssrAPI);
export const ssrStockTransferAPI = new SSRStockTransferAPI(ssrAPI);
export const ssrStockAdjustmentAPI = new SSRStockAdjustmentAPI(ssrAPI);
export const ssrLeaveManagementAPI = new SSRLeaveManagementAPI(ssrAPI);
export const ssrAttendanceAPI = new SSRAttendanceAPI(ssrAPI);
export const ssrPayrollAPI = new SSRPayrollAPI(ssrAPI);
export const ssrHolidayAPI = new SSRHolidayAPI(ssrAPI);
export const ssrExpenseCategoryAPI = new SSRExpenseCategoryAPI(ssrAPI);
export const ssrProductAPI = new SSRProductAPI(ssrAPI);
export const ssrSupplierAPI = new SSRSupplierAPI(ssrAPI);
export const ssrAdminTaxAPI = new SSRAdminTaxAPI(ssrAPI);
export const ssrPurchaseOrderAPI = new SSRPurchaseOrderAPI(ssrAPI);
export const ssrCustomerAPI = new SSRCustomerAPI(ssrAPI);
export const ssrPurchaseReturnAPI = new SSRPurchaseReturnAPI(ssrAPI);
export const ssrLoyaltyPointsAPI = new SSRLoyaltyPointsAPI(ssrAPI);
export const ssrLoyaltyPointsRedeemAPI = new SSRLoyaltyPointsRedeemAPI(ssrAPI);
export const ssrAdminCouponAPI = new SSRAdminCouponAPI(ssrAPI);
export const ssrGiftCardAPI = new SSRGiftCardAPI(ssrAPI);
export const ssrTenantMailSettingAPI = new SSRTenantMailSettingAPI(ssrAPI);
export const ssrTenantSmsSettingAPI = new SSRTenantSMSSettingAPI(ssrAPI);
export const ssrTenantWhatsAppSettingAPI = new SSRTenantWhatsAppSettingAPI(ssrAPI);
export const ssrSalesAPI = new SSRSalesAPI(ssrAPI);
export const ssrAuthAPI = new SSRAuthAPI(ssrAPI);
export const ssrAdminMiscSettingsAPI = new SSRAdminMiscSettingsAPI(ssrAPI);
export const ssrMailTemplateAPI = new SSRMailTemplateAPI(ssrAPI);
export const ssrAdminCurrencySettingAPI = new SSRAdminCurrencySettingsAPI(ssrAPI);
export const ssrSuperAdminNotificationAPI = new SSRSuperAdminNotificationAPI(ssrAPI);
export const ssrUserLoginAPI = new SSRUserLoginAPI(ssrAPI);
export const ssrPosScreenAPI = new SSRPosScreenAPI(ssrAPI);
export const ssrRolePermissionAPI = new SSRRolePermissionAPI(ssrAPI);
export const ssrLoyaltyPointsHistoryAPI = new SSRLoyaltyPointsHistoryAPI(ssrAPI);
export const ssrInvoiceDesignAPI = new SSRInvoiceDesignAPI(ssrAPI);
export const ssrSalesReturnAPI = new SSRSalesReturnAPI(ssrAPI);
export const ssrSMSTemplateAPI = new SSRSMSTemplateAPI(ssrAPI);
export const ssrWhatsAppTemplateAPI = new SSRWhatsAppTemplateAPI(ssrAPI);
export const ssrProfitLossReportAPI = new SSRProfitLossReport(ssrAPI);

export const ssrCookieManager = new SSRCookieManager();