// Migration helper utilities for converting from client-side to SSR API

import { ssrAPI, ssrPlansAPI, ssrFAQAPI, ssrBusinessCategoriesAPI, ssrBusinessOwnersAPI, ssrTaxAPI, ssrReportsAPI, ssrPublicAPI, ssrUserSubscriptionAPI, ssrUserPaymentAPI, ssrDashboardAPI, ssrCouponsAPI } from './ssr-api';
import { ClientCookieManager } from './cookie-utils';

// Migration mapping from old API to new SSR API
export const API_MIGRATION_MAP = {
  // Plans API
  'plansAPI.getAll': 'ssrPlansAPI.getAll',
  'plansAPI.create': 'ssrPlansAPI.create',
  'plansAPI.update': 'ssrPlansAPI.update',
  'plansAPI.delete': 'ssrPlansAPI.delete',
  'plansAPI.getById': 'ssrPlansAPI.getById',

  // FAQ API
  'faqAPI.getAll': 'ssrFAQAPI.getAll',
  'faqAPI.create': 'ssrFAQAPI.create',
  'faqAPI.update': 'ssrFAQAPI.update',
  'faqAPI.delete': 'ssrFAQAPI.delete',
  'faqAPI.getById': 'ssrFAQAPI.getById',

  // Business Categories API
  'businessCategoriesAPI.getAll': 'ssrBusinessCategoriesAPI.getAll',
  'businessCategoriesAPI.create': 'ssrBusinessCategoriesAPI.create',
  'businessCategoriesAPI.update': 'ssrBusinessCategoriesAPI.update',
  'businessCategoriesAPI.delete': 'ssrBusinessCategoriesAPI.delete',
  'businessCategoriesAPI.getById': 'ssrBusinessCategoriesAPI.getById',

  // Business Owners API
  'businessOwnersAPI.getAll': 'ssrBusinessOwnersAPI.getAll',
  'businessOwnersAPI.create': 'ssrBusinessOwnersAPI.create',
  'businessOwnersAPI.update': 'ssrBusinessOwnersAPI.update',
  'businessOwnersAPI.delete': 'ssrBusinessOwnersAPI.delete',
  'businessOwnersAPI.getById': 'ssrBusinessOwnersAPI.getById',

  // Tax API
  'taxAPI.getAll': 'ssrTaxAPI.getAll',
  'taxAPI.create': 'ssrTaxAPI.create',
  'taxAPI.update': 'ssrTaxAPI.update',
  'taxAPI.delete': 'ssrTaxAPI.delete',
  'taxAPI.getById': 'ssrTaxAPI.getById',

  // Reports API
  'reportsAPI.getBusinessOwnerReport': 'ssrReportsAPI.getBusinessOwnerReport',
  'reportsAPI.getCommissionReport': 'ssrReportsAPI.getCommissionReport',

  // Public API
  'publicAPI.getPlans': 'ssrPublicAPI.getPlans',
  'publicAPI.getPlanById': 'ssrPublicAPI.getPlanById',
  'publicAPI.getFAQs': 'ssrPublicAPI.getFAQs',

  // User Subscription API
  'userSubscriptionAPI.createSubscription': 'ssrUserSubscriptionAPI.createSubscription',
  'userSubscriptionAPI.updateUserSubscription': 'ssrUserSubscriptionAPI.updateUserSubscription',
  'userSubscriptionAPI.getUserSubscriptions': 'ssrUserSubscriptionAPI.getUserSubscriptions',

  // User Payment API
  'userPaymentAPI.createPayment': 'ssrUserPaymentAPI.createPayment',
  'userPaymentAPI.updatePayment': 'ssrUserPaymentAPI.updatePayment',

  // Dashboard API
  'dashboardAPI.getStats': 'ssrDashboardAPI.getStats',

  // Coupons API
  'couponsAPI.getAll': 'ssrCouponsAPI.getAll',
  'couponsAPI.create': 'ssrCouponsAPI.create',
  'couponsAPI.update': 'ssrCouponsAPI.update',
  'couponsAPI.delete': 'ssrCouponsAPI.delete',
  'couponsAPI.getById': 'ssrCouponsAPI.getById',
};

// Helper function to migrate API calls
export function migrateAPICall(oldCall: string, newCall: string, params: any[] = []) {
  
  // Map the old call to new SSR API
  const newAPICall = API_MIGRATION_MAP[oldCall as keyof typeof API_MIGRATION_MAP];
  
  if (!newAPICall) {
    console.warn(`No migration found for API call: ${oldCall}`);
    return null;
  }

  // Execute the new API call
  try {
    // This is a placeholder - in practice, you would call the actual SSR API
    return { success: true, message: `Migrated ${oldCall} to ${newAPICall}` };
  } catch (error) {
    console.error(`Error migrating API call ${oldCall}:`, error);
    return { success: false, error };
  }
}

// Helper function to check if a component needs migration
export function needsMigration(componentCode: string): boolean {
  const oldAPIPatterns = [
    'plansAPI.',
    'faqAPI.',
    'businessCategoriesAPI.',
    'businessOwnersAPI.',
    'taxAPI.',
    'reportsAPI.',
    'publicAPI.',
    'userSubscriptionAPI.',
    'userPaymentAPI.',
    'dashboardAPI.',
    'couponsAPI.',
  ];

  return oldAPIPatterns.some(pattern => componentCode.includes(pattern));
}

// Helper function to get migration suggestions
export function getMigrationSuggestions(componentCode: string): string[] {
  const suggestions: string[] = [];
  
  Object.entries(API_MIGRATION_MAP).forEach(([oldCall, newCall]) => {
    if (componentCode.includes(oldCall)) {
      suggestions.push(`Replace ${oldCall} with ${newCall}`);
    }
  });

  return suggestions;
}

// Helper function to migrate localStorage to cookies
export function migrateStorageToCookies() {
  // No-op: localStorage is no longer used; preserved for backward compatibility
}

// Helper function to validate SSR setup
export function validateSSRSetup() {
  const checks = {
    ssrAPI: typeof ssrAPI !== 'undefined',
    ssrPlansAPI: typeof ssrPlansAPI !== 'undefined',
    ssrFAQAPI: typeof ssrFAQAPI !== 'undefined',
    ssrBusinessCategoriesAPI: typeof ssrBusinessCategoriesAPI !== 'undefined',
    ssrBusinessOwnersAPI: typeof ssrBusinessOwnersAPI !== 'undefined',
    ssrTaxAPI: typeof ssrTaxAPI !== 'undefined',
    ssrReportsAPI: typeof ssrReportsAPI !== 'undefined',
    ssrPublicAPI: typeof ssrPublicAPI !== 'undefined',
    ssrUserSubscriptionAPI: typeof ssrUserSubscriptionAPI !== 'undefined',
    ssrUserPaymentAPI: typeof ssrUserPaymentAPI !== 'undefined',
    ssrDashboardAPI: typeof ssrDashboardAPI !== 'undefined',
    ssrCouponsAPI: typeof ssrCouponsAPI !== 'undefined',
    ClientCookieManager: typeof ClientCookieManager !== 'undefined',
  };

  const allValid = Object.values(checks).every(Boolean);
  
  if (!allValid) {
    console.error('SSR setup validation failed:', checks);
  } else {
  }
  
  return { valid: allValid, checks };
}
