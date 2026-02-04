'use server';

import { cookies, headers } from 'next/headers';
import { ssrBusinessCategoriesAPI, ssrPlansAPI, ssrNotificationAPI, ssrBusinessOwnersAPI, ssrTaxAPI, ssrCouponsAPI, ssrSubscriptionsAPI, ssrProductCategoryAPI, ssrProductSubCategoryAPI, ssrUnitAPI, ssrWarrentyAPI, ssrStoreAPI, ssrVariantsAPI, ssrBrandAPI, ssrFAQAPI, ssrFAQCategoryAPI, ssrBlogsAPI, ssrHeroSectionAPI, ssrFooterSectionAPI, ssrBusinessTypesAPI, ssrFeaturesAPI, ssrProductOverviewAPI, ssrTrialSettingsAPI, ssrPaymentSettingsAPI, ssrCurrencySettingsAPI, ssrMailSettingsAPI, ssrGeneralSettingsAPI, ssrGDPRSettingsAPI, ssrSEOSettingsAPI, ssrUploadAPI, ssrAdvertisementAPI, ssrStaffHRMAPI, ssrHrmManagerAPI, ssrShiftAPI, ssrShiftAssignmentAPI, ssrLeaveTypeAPI, ssrStockTransferAPI, ssrStockAdjustmentAPI, ssrLeaveManagementAPI, ssrAttendanceAPI, ssrPayrollAPI, ssrHolidayAPI, ssrExpenseCategoryAPI, ssrProductAPI, ssrSupplierAPI, ssrAdminTaxAPI, ssrPurchaseOrderAPI, ssrPurchaseReturnAPI, ssrCustomerAPI, ssrLoyaltyPointsAPI, ssrLoyaltyPointsRedeemAPI, ssrAdminCouponAPI, ssrGiftCardAPI, ssrMiscellaneousSettingsAPI, ssrExpenseAPI, ssrSocialMediaLinksAPI, ssrAuthAPI, ssrSalesAPI, ssrTenantMailSettingAPI, ssrAdminMiscSettingsAPI, ssrMailTemplateAPI, ssrAdminCurrencySettingAPI, ssrRolePermissionAPI, ssrInvoiceDesignAPI, ssrReportsAPI, ssrSuperAdminNotificationAPI, ssrPosScreenAPI } from './ssr-api'
import { AdminTypes, SearchParamsTypes } from '@/types';
import { PurchaseOrderItem } from '@/types/admin/purchase-order';
import { generateInvoicePDF } from '@/lib/invoice-generator';


// Auth: signup
export async function signupAction(userData: {
  name: string;
  email: string;
  password: string;
  phone: string;
  businessName: string;
  businessCategory: string;
}) {
  try {
    const response = await ssrAuthAPI.signup(userData);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Signup failed', data: response.data };
  } catch (error: any) {
    console.error('Signup error:', error);
    // Return the error message from the backend if available
    if (error?.response?.data?.message) {
      return { success: false, error: error.response.data.message };
    }
    return { success: false, error: 'Signup failed. Please try again.' };
  }
}

// Business Category: create
export async function createBusinessCategoryAction(data: { categoryName: string; description: string; isActive: boolean }) {
  try {
    const response = await ssrBusinessCategoriesAPI.create(data);
    if (response.status === 200 || response.status === 201) {
      1

      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to create business category' };
  } catch (error) {
    console.error('Create business category error:', error);
    return { success: false, error: 'Failed to create business category' };
  }
}

// Business Category: update
export async function updateBusinessCategoryAction(id: string, data: { categoryName?: string; description?: string; isActive?: boolean }) {
  try {
    const response = await ssrBusinessCategoriesAPI.update(id, data);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to update business category' };
  } catch (error) {
    console.error('Update business category error:', error);
    return { success: false, error: 'Failed to update business category' };
  }
}

// Business Category: delete
export async function deleteBusinessCategoryAction(id: string) {
  try {
    const response = await ssrBusinessCategoriesAPI.delete(id);
    if (response.status === 200 || response.status === 204) {
      return { success: true };
    }
    return { success: false, error: 'Failed to delete business category' };
  } catch (error) {
    console.error('Delete business category error:', error);
    return { success: false, error: 'Failed to delete business category' };
  }
}

// Business Category: bulk update status (mirror business owner flow)
export async function bulkUpdateBusinessCategoriesStatusAction(data: { ids: string[]; status: boolean }) {
  try {
    const response = await ssrBusinessCategoriesAPI.bulkUpdateStatus(data as unknown as Record<string, unknown>);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to update status for selected business categories' };
  } catch (error) {
    console.error('Bulk update business categories status error:', error);
    return { success: false, error: 'Failed to update status for selected business categories' };
  }
}

// Business Category: bulk delete
export async function bulkDeleteBusinessCategoriesAction(data: { ids: string[] }) {
  try {
    const response = await ssrBusinessCategoriesAPI.bulkDelete(data as unknown as Record<string, unknown>);
    if (response.status === 200 || response.status === 204) {
      return { success: true };
    }
    return { success: false, error: 'Failed to delete selected business categories' };
  } catch (error) {
    console.error('Bulk delete business categories error:', error);
    return { success: false, error: 'Failed to delete selected business categories' };
  }
}

// Business Category: bulk get all for download
export async function bulkGetBusinessCategoriesAction(filterData: SearchParamsTypes.DownloadSearchParams) {
  try {
    const response = await ssrBusinessCategoriesAPI.bulkAllDownload(filterData);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to fetch business categories' };
  } catch (error) {
    console.error('Bulk get business categories error:', error);
    return { success: false, error: 'Failed to fetch business categories' };
  }
}

// Business Category: bulk get selected for download
export async function bulkGetSelectedBusinessCategoriesAction(data: { ids: string[] }) {
  try {
    const response = await ssrBusinessCategoriesAPI.bulkGetSelected(data);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to fetch selected business categories' };
  } catch (error) {
    console.error('Bulk get selected business categories error:', error);
    return { success: false, error: 'Failed to fetch selected business categories' };
  }
}

// Customer: create
export async function createCustomerAction(data: {
  customerCode?: string;
  customerName: string;
  gender?: "Male" | "Female" | "Other";
  phone: string;
  email?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    pincode?: string;
  };
  isActive: boolean;
}) {
  try {
    const response = await ssrCustomerAPI.create(data);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to create customer' };
  } catch (error) {
    console.error('Create customer error:', error);
    return { success: false, error: 'Failed to create customer' };
  }
}

// Customer: update
export async function updateCustomerAction(id: string, data: Record<string, unknown>) {
  try {
    const response = await ssrCustomerAPI.update(id, data);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to update customer' };
  } catch (error) {
    console.error('Update customer error:', error);
    return { success: false, error: 'Failed to update customer' };
  }
}

// Customer: delete (hard delete)
export async function deleteCustomerAction(id: string) {
  try {
    const response = await ssrCustomerAPI.delete(id);
    if (response.status === 200 || response.status === 204) {
      return { success: true };
    }
    return { success: false, error: 'Failed to delete customer' };
  } catch (error) {
    console.error('Delete customer error:', error);
    return { success: false, error: 'Failed to delete customer' };
  }
}

// Customer: soft delete
export async function softDeleteCustomerAction(id: string) {
  try {
    const response = await ssrCustomerAPI.softDelete(id);
    if (response.status === 200 || response.status === 204) {
      return { success: true };
    }
    return { success: false, error: 'Failed to soft delete customer' };
  } catch (error) {
    console.error('Soft delete customer error:', error);
    return { success: false, error: 'Failed to soft delete customer' };
  }
}

// Customer: bulk update status
export async function bulkUpdateCustomersStatusAction(data: { ids: string[]; isActive: boolean }) {
  try {
    const response = await ssrCustomerAPI.bulkUpdateStatus(data as unknown as Record<string, unknown>);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to update status for selected customers' };
  } catch (error) {
    console.error('Bulk update customers status error:', error);
    return { success: false, error: 'Failed to update status for selected customers' };
  }
}

// Customer: bulk soft delete
export async function bulkSoftDeleteCustomersAction(data: { ids: string[] }) {
  try {
    const response = await ssrCustomerAPI.bulkSoftDelete(data as unknown as Record<string, unknown>);
    if (response.status === 200 || response.status === 204) {
      return { success: true };
    }
    return { success: false, error: 'Failed to delete selected customers' };
  } catch (error) {
    console.error('Bulk soft delete customers error:', error);
    return { success: false, error: 'Failed to delete selected customers' };
  }
}

// Customer: get all active
export async function getAllActiveCustomersAction() {
  try {
    const response = await ssrCustomerAPI.getAllActive();
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to fetch active customers' };
  } catch (error) {
    console.error('Get all active customers error:', error);
    return { success: false, error: 'Failed to fetch active customers' };
  }
}

// Loyalty Points: create
export async function createLoyaltyPointsAction(data: Record<string, unknown>) {
  try {
    const response = await ssrLoyaltyPointsAPI.create(data);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to create loyalty points' };
  } catch (error) {
    console.error('Create loyalty points error:', error);
    return { success: false, error: 'Failed to create loyalty points' };
  }
}

// Loyalty Points: update
export async function updateLoyaltyPointsAction(id: string, data: Record<string, unknown>) {
  try {
    const response = await ssrLoyaltyPointsAPI.update(id, data);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to update loyalty points' };
  } catch (error) {
    console.error('Update loyalty points error:', error);
    return { success: false, error: 'Failed to update loyalty points' };
  }
}

// Loyalty Points: delete
export async function deleteLoyaltyPointsAction(id: string) {
  try {
    const response = await ssrLoyaltyPointsAPI.delete(id);
    if (response.status === 200 || response.status === 204) {
      return { success: true };
    }
    return { success: false, error: 'Failed to delete loyalty points' };
  } catch (error) {
    console.error('Delete loyalty points error:', error);
    return { success: false, error: 'Failed to delete loyalty points' };
  }
}

// Loyalty Points: bulk update status
export async function bulkUpdateLoyaltyPointsStatusAction(data: { ids: string[]; status: boolean }) {
  try {
    const response = await ssrLoyaltyPointsAPI.bulkUpdateStatus(data as unknown as Record<string, unknown>);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to update status for selected loyalty points' };
  } catch (error) {
    console.error('Bulk update loyalty points status error:', error);
    return { success: false, error: 'Failed to update status for selected loyalty points' };
  }
}

// Loyalty Points: bulk delete
export async function bulkDeleteLoyaltyPointsAction(data: { ids: string[] }) {
  try {
    const response = await ssrLoyaltyPointsAPI.bulkDelete(data as unknown as Record<string, unknown>);
    if (response.status === 200 || response.status === 204) {
      return { success: true };
    }
    return { success: false, error: 'Failed to delete selected loyalty points' };
  } catch (error) {
    console.error('Bulk delete loyalty points error:', error);
    return { success: false, error: 'Failed to delete selected loyalty points' };
  }
}

// Loyalty Points: bulk get (for export with filters)
export async function bulkGetLoyaltyPointsAction(filterData: SearchParamsTypes.DownloadSearchParams) {
  try {
    const response = await ssrLoyaltyPointsAPI.bulkAllDownload(filterData);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to fetch loyalty points for export' };
  } catch (error) {
    console.error('Bulk get loyalty points error:', error);
    return { success: false, error: 'Failed to fetch loyalty points for export' };
  }
}

// Loyalty Points: bulk get selected (for export selected rows)
export async function bulkGetSelectedLoyaltyPointsAction(data: { ids: string[] }) {
  try {
    const response = await ssrLoyaltyPointsAPI.bulkGetSelected(data);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to fetch selected loyalty points' };
  } catch (error) {
    console.error('Bulk get selected loyalty points error:', error);
    return { success: false, error: 'Failed to fetch selected loyalty points' };
  }
}

// Loyalty Points Redeem: create
export async function createLoyaltyPointsRedeemAction(data: Record<string, unknown>) {
  try {
    const response = await ssrLoyaltyPointsRedeemAPI.create(data);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to create loyalty points redeem' };
  } catch (error) {
    console.error('Create loyalty points redeem error:', error);
    return { success: false, error: 'Failed to create loyalty points redeem' };
  }
}

// Loyalty Points Redeem: update
export async function updateLoyaltyPointsRedeemAction(id: string, data: Record<string, unknown>) {
  try {
    const response = await ssrLoyaltyPointsRedeemAPI.update(id, data);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to update loyalty points redeem' };
  } catch (error) {
    console.error('Update loyalty points redeem error:', error);
    return { success: false, error: 'Failed to update loyalty points redeem' };
  }
}

// Loyalty Points Redeem: delete
export async function deleteLoyaltyPointsRedeemAction(id: string) {
  try {
    const response = await ssrLoyaltyPointsRedeemAPI.softDelete(id);
    if (response.status === 200 || response.status === 204) {
      return { success: true };
    }
    return { success: false, error: 'Failed to delete loyalty points redeem' };
  } catch (error) {
    console.error('Delete loyalty points redeem error:', error);
    return { success: false, error: 'Failed to delete loyalty points redeem' };
  }
}

// Loyalty Points Redeem: bulk update status
export async function bulkUpdateLoyaltyPointsRedeemStatusAction(data: { ids: string[]; status: boolean }) {
  try {
    const response = await ssrLoyaltyPointsRedeemAPI.bulkUpdateStatus(data as unknown as Record<string, unknown>);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to update status for selected redeem configurations' };
  } catch (error) {
    console.error('Bulk update loyalty points redeem status error:', error);
    return { success: false, error: 'Failed to update status for selected redeem configurations' };
  }
}

// Loyalty Points Redeem: bulk delete
export async function bulkDeleteLoyaltyPointsRedeemAction(data: { ids: string[] }) {
  try {
    const response = await ssrLoyaltyPointsRedeemAPI.bulkDelete(data as unknown as Record<string, unknown>);
    if (response.status === 200 || response.status === 204) {
      return { success: true };
    }
    return { success: false, error: 'Failed to delete selected redeem configurations' };
  } catch (error) {
    console.error('Bulk delete loyalty points redeem error:', error);
    return { success: false, error: 'Failed to delete selected redeem configurations' };
  }
}

// Loyalty Points Redeem: bulk get (for export with filters)
export async function bulkGetLoyaltyPointsRedeemAction(filterData: SearchParamsTypes.DownloadSearchParams) {
  try {
    const response = await ssrLoyaltyPointsRedeemAPI.bulkAllDownload(filterData);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to fetch redeem configurations for export' };
  } catch (error) {
    console.error('Bulk get loyalty points redeem error:', error);
    return { success: false, error: 'Failed to fetch redeem configurations for export' };
  }
}

// Loyalty Points Redeem: bulk get selected (for export selected rows)
export async function bulkGetSelectedLoyaltyPointsRedeemAction(data: { ids: string[] }) {
  try {
    const response = await ssrLoyaltyPointsRedeemAPI.bulkGetSelected(data);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to fetch selected redeem configurations' };
  } catch (error) {
    console.error('Bulk get selected loyalty points redeem error:', error);
    return { success: false, error: 'Failed to fetch selected redeem configurations' };
  }
}

// Business Owner: create
export async function createBusinessOwnerAction(data: {
  name: string;
  email: string;
  phone: string;
  password: string;
  businessName?: string;
  businessCategory?: string;
  isActive?: boolean;
}) {
  try {
    const response = await ssrBusinessOwnersAPI.create(data);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: response.data?.message || 'Failed to create business owner' };
  } catch (error: any) {
    console.error('Create business owner error:', error);
    if (error.response) {
      return { success: false, error: error.response.data?.message || 'Server error while creating  business owner' };
    } else if (error.request) {
      return { success: false, error: 'Network error. Please check your connection.' };
    }

    return { success: false, error: error.message || 'Failed to create business owner' };
  }
}

// Business Owner: update
export async function updateBusinessOwnerAction(id: string, data: {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  businessName?: string;
  businessCategory?: string;
  isActive?: boolean;
}) {
  try {
    const response = await ssrBusinessOwnersAPI.update(id, data);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: response.data?.message || 'Failed to update business owner' };
  } catch (error: any) {
    console.error('Update business owner error:', error);
    if (error.response) {
      return { success: false, error: error.response.data?.message || 'Server error while updating business owner' };
    } else if (error.request) {
      return { success: false, error: 'Network error. Please check your connection.' };
    }
    return { success: false, error: error.message || 'Failed to update business owner' };
  }
}

// Business Owner: bulk toggle status
export async function bulkToggleBusinessOwnersStatusAction(data: {
  userIds: string[];
  isActive: boolean;
}) {
  try {
    const response = await ssrBusinessOwnersAPI.bulkUpdateStatus(data as unknown as Record<string, unknown>);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: response.data?.message || 'Failed to update status for selected business owners' };
  } catch (error: any) {
    console.error('Bulk toggle business owners status error:', error);
    if (error.response) {
      return { success: false, error: error.response.data?.message || 'Server error while updating business owner' };
    } else if (error.request) {
      return { success: false, error: 'Network error. Please check your connection.' };
    }
    return { success: false, error: error.message || 'Failed to update business owner' };
  }
}

// Business Owner: bulk get all for download
export async function bulkGetBusinessOwnersAction(filterData: SearchParamsTypes.DownloadSearchParams) {
  try {
    const response = await ssrBusinessOwnersAPI.bulkAllDownload(filterData);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: response.data?.message || 'Failed to fetch business owners' };
  } catch (error: any) {
    console.error('Bulk get business owners error:', error);
    if (error.response) {
      return { success: false, error: error.response.data?.message || 'Server error while updating business owner' };
    } else if (error.request) {
      return { success: false, error: 'Network error. Please check your connection.' };
    }
    return { success: false, error: error.message || 'Failed to update business owner' };
  }
}

// Business Owner: bulk get selected for download
export async function bulkGetSelectedBusinessOwnersAction(data: { ids: string[] }) {
  try {
    const response = await ssrBusinessOwnersAPI.bulkGetSelected(data);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: response.data?.message || 'Failed to fetch selected business owners' };
  } catch (error: any) {
    console.error('Bulk get selected business owners error:', error);
    if (error.response) {
      return { success: false, error: error.response.data?.message || 'Server error while updating business owner' };
    } else if (error.request) {
      return { success: false, error: 'Network error. Please check your connection.' };
    }
    return { success: false, error: error.message || 'Failed to update business owner' };
  }
}

// Tax: create
export async function createTaxAction(data: { name: string; type: "Fixed" | "Percentage"; value: number; status: boolean }) {
  try {
    const response = await ssrTaxAPI.create(data);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to create tax' };
  } catch (error) {
    console.error('Create tax error:', error);
    return { success: false, error: 'Failed to create tax' };
  }
}

// Tax: update
export async function updateTaxAction(id: string, data: { name: string; type: "Fixed" | "Percentage"; value: number; status: boolean }) {
  try {
    const response = await ssrTaxAPI.update(id, data);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to update tax' };
  } catch (error) {
    console.error('Update tax error:', error);
    return { success: false, error: 'Failed to update tax' };
  }
}

// Tax: delete
export async function deleteTaxAction(id: string) {
  try {
    const response = await ssrTaxAPI.delete(id);
    if (response.status === 200 || response.status === 204) {
      return { success: true };
    }
    return { success: false, error: 'Failed to delete tax' };
  } catch (error) {
    console.error('Delete tax error:', error);
    return { success: false, error: 'Failed to delete tax' };
  }
}

// Tax: bulk update status
export async function bulkUpdateTaxesStatusAction(data: { ids: string[]; status: boolean }) {
  try {
    const response = await ssrTaxAPI.bulkUpdateStatus(data as unknown as Record<string, unknown>);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to update status for selected taxes' };
  } catch (error) {
    console.error('Bulk update taxes status error:', error);
    return { success: false, error: 'Failed to update status for selected taxes' };
  }
}

// Tax: bulk delete
export async function bulkDeleteTaxesAction(data: { ids: string[] }) {
  try {
    const response = await ssrTaxAPI.bulkDelete(data as unknown as Record<string, unknown>);
    if (response.status === 200 || response.status === 204) {
      return { success: true };
    }
    return { success: false, error: 'Failed to delete selected taxes' };
  } catch (error) {
    console.error('Bulk delete business categories error:', error);
    return { success: false, error: 'Failed to delete selected taxes' };
  }
}

// Tax: bulk get
export async function bulkGetTaxesAction(filterData: SearchParamsTypes.DownloadSearchParams) {
  try {
    const response = await ssrTaxAPI.bulkAllDownload(filterData);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to get taxes' };
  } catch (error) {
    console.error('Bulk get taxes error:', error);
    return { success: false, error: 'Failed to get taxes' };
  }
}

// Tax: bulk get selected
export async function bulkGetSelectedTaxesAction(data: { ids: string[] }) {
  try {
    const response = await ssrTaxAPI.bulkGetSelected(data);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to get selected taxes' };
  } catch (error) {
    console.error('Bulk get selected taxes error:', error);
    return { success: false, error: 'Failed to get selected taxes' };
  }
}

// Plan: create
export async function createPlanAction(data: {
  name: string;
  type: "monthly" | "yearly" | "daily" | "weekly";
  price: number;
  duration: string;
  storeLimit: number;
  staffLimit: number;
  screens: string[];
  modules: string[];
  description: string;
  status: boolean;
  taxes?: string[];
  isTrial?: boolean;
  planCategory?: "paid" | "free";
  discountType?: "fixed" | "percentage";
  discount?: number;
  totalPrice?: number;
}) {
  try {
    // Prepare data for API call - only include tax for paid plans
    const apiData = { ...data };
    if (data.planCategory === "free") {
      delete apiData.taxes; // Remove tax field for free plans
    }

    const response = await ssrPlansAPI.create(apiData);
    if (response.status === 200 || response.status === 201) {
      // Handle nested response structure: response.data.data contains the actual plan
      const planData = response.data?.data || response.data;
      return { success: true, data: planData };
    }
    return { success: false, error: 'Failed to create plan' };
  } catch (error) {
    console.error('Create plan error:', error);
    return { success: false, error: 'Failed to create plan' };
  }
}

// Plan: update
export async function updatePlanAction(id: string, data: {
  name?: string;
  type?: "monthly" | "yearly" | "daily" | "weekly";
  price?: number;
  duration?: string;
  storeLimit?: number;
  staffLimit?: number;
  screens?: string[];
  modules?: string[];
  description?: string;
  status: boolean;
  taxes?: string[];
  isTrial?: boolean;
  planCategory?: "paid" | "free";
  discountType?: "fixed" | "percentage";
  discount?: number;
  totalPrice?: number;
}) {
  try {
    // Prepare data for API call - only include tax for paid plans
    const apiData = { ...data };
    if (data.planCategory === "free") {
      delete apiData.taxes; // Remove tax field for free plans
    }

    const response = await ssrPlansAPI.update(id, apiData);
    if (response.status === 200 || response.status === 201) {
      // Handle nested response structure: response.data.data contains the actual plan
      const planData = response.data?.data || response.data;
      return { success: true, data: planData };
    }
    return { success: false, error: 'Failed to update plan' };
  } catch (error) {
    console.error('Update plan error:', error);
    return { success: false, error: 'Failed to update plan' };
  }
}

// Plan: delete
export async function deletePlanAction(id: string) {
  try {
    const response = await ssrPlansAPI.delete(id);
    if (response.status === 200 || response.status === 204) {
      return { success: true };
    }
    return { success: false, error: 'Failed to delete plan' };
  } catch (error) {
    console.error('Delete plan error:', error);
    return { success: false, error: 'Failed to delete plan' };
  }
}

// Plan: bulk update status
export async function bulkUpdatePlansStatusAction(data: { ids: string[]; status: boolean }) {
  try {
    const response = await ssrPlansAPI.bulkUpdateStatus(data as unknown as Record<string, unknown>);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to update status for selected plans' };
  } catch (error) {
    console.error('Bulk update plans status error:', error);
    return { success: false, error: 'Failed to update status for selected plans' };
  }
}

// Plan: bulk delete
export async function bulkDeletePlansAction(data: { ids: string[] }) {
  try {
    const response = await ssrPlansAPI.bulkDelete(data as unknown as Record<string, unknown>);
    if (response.status === 200 || response.status === 204) {
      return { success: true };
    }
    return { success: false, error: 'Failed to delete selected plans' };
  } catch (error) {
    console.error('Bulk delete plans error:', error);
    return { success: false, error: 'Failed to delete selected plans' };
  }
}

// Coupon: create
export async function createCouponAction(data: {
  code: string;
  description: string;
  start_date: string;
  end_date: string;
  type: "Percentage" | "Fixed";
  discount_amount: number;
  limit: number;
  plans: string[];
  status: boolean;
  maxUsagePerUser?: number;
  applicableFor?: string;
  minOrderAmount?: number;
}) {
  try {
    const response = await ssrCouponsAPI.create(data);
    if (response.status === 200 || response.status === 201) {
      // Handle nested response structure: response.data.data contains the actual coupon
      const couponData = response.data?.data || response.data;
      return { success: true, data: couponData };
    }
    return { success: false, error: response.data.message || 'Failed to create coupon' };
  } catch (error) {
    console.error('Create coupon error:', error);
    return { success: false, error: 'Failed to create coupon' };
  }
}

// Coupon: update
export async function updateCouponAction(id: string, data: {
  code: string;
  description: string;
  start_date: string;
  end_date: string;
  type: "Percentage" | "Fixed";
  discount_amount: number;
  limit: number;
  plans: string[];
  status: boolean;
  maxUsagePerUser?: number;
  applicableFor?: string;
  minOrderAmount?: number;
}) {
  try {
    const response = await ssrCouponsAPI.update(id, data);
    if (response.status === 200 || response.status === 201) {
      // Handle nested response structure: response.data.data contains the actual coupon
      const couponData = response.data?.data || response.data;
      return { success: true, data: couponData };
    }
    return { success: false, error: response.data.message || 'Failed to update coupon' };
  } catch (error) {
    console.error('Update coupon error:', error);
    return { success: false, error: 'Failed to update coupon' };
  }
}

// Coupon: delete
export async function deleteCouponAction(id: string) {
  try {
    const response = await ssrCouponsAPI.delete(id);
    if (response.status === 200 || response.status === 204) {
      return { success: true };
    }
    return { success: false, error: 'Failed to delete coupon' };
  } catch (error) {
    console.error('Delete coupon error:', error);
    return { success: false, error: 'Failed to delete coupon' };
  }
}

// Coupon: bulk update status
export async function bulkUpdateCouponsStatusAction(data: { ids: string[]; status: boolean }) {
  try {
    const response = await ssrCouponsAPI.bulkUpdateStatus(data as unknown as Record<string, unknown>);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to update status for selected coupons' };
  } catch (error) {
    console.error('Bulk update coupons status error:', error);
    return { success: false, error: 'Failed to update status for selected coupons' };
  }
}

// Coupon: bulk delete
export async function bulkDeleteCouponsAction(data: { ids: string[] }) {
  try {
    const response = await ssrCouponsAPI.bulkDelete(data as unknown as Record<string, unknown>);
    if (response.status === 200 || response.status === 204) {
      return { success: true };
    }
    return { success: false, error: 'Failed to delete selected coupons' };
  } catch (error) {
    console.error('Bulk delete coupons error:', error);
    return { success: false, error: 'Failed to delete selected coupons' };
  }
}

// Coupon: bulk get
export async function bulkGetCouponsAction(filterData: SearchParamsTypes.DownloadSearchParams) {
  try {
    const response = await ssrCouponsAPI.bulkAllDownload(filterData);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to get coupons' };
  } catch (error) {
    console.error('Bulk get coupons error:', error);
    return { success: false, error: 'Failed to get coupons' };
  }
}

// Coupon: bulk get selected
export async function bulkGetSelectedCouponsAction(data: { ids: string[] }) {
  try {
    const response = await ssrCouponsAPI.bulkGetSelected(data);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to get selected coupons' };
  } catch (error) {
    console.error('Bulk get selected coupons error:', error);
    return { success: false, error: 'Failed to get selected coupons' };
  }
}

// Subscription: bulk get all for download
export async function bulkGetSubscriptionsAction(filterData: SearchParamsTypes.DownloadSearchParams) {
  try {
    const response = await ssrSubscriptionsAPI.bulkAllDownload(filterData);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to fetch subscriptions' };
  } catch (error) {
    console.error('Bulk get subscriptions error:', error);
    return { success: false, error: 'Failed to fetch subscriptions' };
  }
}

// Subscription: bulk get selected for download
export async function bulkGetSelectedSubscriptionsAction(data: { ids: string[] }) {
  try {
    const response = await ssrSubscriptionsAPI.bulkGetSelected(data);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: response?.data?.message || 'Failed to fetch selected subscriptions' };
  } catch (error) {
    console.error('Bulk get selected subscriptions error:', error);
    return { success: false, error: 'Failed to fetch selected subscriptions' };
  }
}

// Business Owner Reports: bulk get all for download
export async function bulkGetBusinessOwnerReportsAction(filterData: SearchParamsTypes.DownloadSearchParams) {
  try {
    const response = await ssrReportsAPI.bulkAllDownload(filterData);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: response.data.message || 'Failed to fetch business owner reports' };
  } catch (error: any) {
    console.error('Bulk get business owner reports error:', error);
    if (error.response) {
      return { success: false, error: error.response.data?.message || 'Server error while fetching business owner reports' };
    } else if (error.request) {
      return { success: false, error: 'Network error. Please check your connection.' };
    }
    return { success: false, error: error.message || 'Failed to fetch business owner reports' };
  }
}

// Business Owner Reports: bulk get selected for download
export async function bulkGetSelectedBusinessOwnerReportsAction(data: { ids: string[] }) {
  try {
    const response = await ssrReportsAPI.bulkGetSelected(data);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to fetch selected business owner reports' };
  } catch (error: any) {
    console.error('Bulk get selected business owner reports error:', error);
    if (error.response) {
      return { success: false, error: error.response.data?.message || 'Server error while fetching selected business owner reports' };
    } else if (error.request) {
      return { success: false, error: 'Network error. Please check your connection.' };
    }
    return { success: false, error: error.message || 'Failed to fetch selected business owner reports' };
  }
}

// Subscription: create
export async function createSubscriptionAction(data: {
  purchaseDate: string;
  planName: string;
  duration: string;
  amount: number;
  discount: number;
  taxes: number;
  totalAmount: number;
  userId: string;
  status: boolean;
  selectTax?: string;
  discountType?: string;
}): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    // Transform data to match API expectations - send userId instead of user
    const apiPayload = {
      purchaseDate: data.purchaseDate,
      planName: data.planName,
      amount: String(data.amount),
      discount: String(data.discount),
      discountType: data.discountType || 'Fixed',
      status: data.status ? 'Active' : 'Inactive',
      userId: data.userId,
      selectTax: data.selectTax,
      taxAmount: data.taxes,
      totalAmount: data.totalAmount,
    };
    const response = await ssrSubscriptionsAPI.create(apiPayload);
    if (response.status === 200 || response.status === 201) {
      // Handle the specific response structure: { success: true, data: { ... } }
      const responseData = response.data;

      if (responseData.success && responseData.data) {
        return { success: true, data: responseData.data };
      } else if (responseData.data) {
        // Fallback for direct data structure
        return { success: true, data: responseData.data };
      } else {
        return { success: false, error: 'Invalid response format from server' };
      }
    }
    return { success: false, error: response.data.message || 'Failed to create subscription' };
  } catch (error: any) {
    console.error('Create subscription error:', error);

    // Handle specific error types
    if (error.response) {
      // Server responded with error status
      const errorMessage = error.response.data?.message || error.response.data?.error || 'Server error occurred';
      return { success: false, error: errorMessage };
    } else if (error.request) {
      // Network error
      return { success: false, error: 'Network error. Please check your connection.' };
    } else {
      // Other errors
      return { success: false, error: error.message || 'Failed to create subscription' };
    }
  }
}

// Invoice: generate PDF
export async function generateInvoicePDFAction(data: any): Promise<{ success: boolean; data?: string; error?: string }> {
  try {
    const headersList = await import('next/headers').then(mod => mod.headers());
    const host = headersList.get('host') || '';

    // 1. Fetch user's custom invoice design settings (Template, Logo, Colors etc.)
    let designConfig = {};
    try {
      const designResponse = await ssrInvoiceDesignAPI.get();
      if (designResponse.status === 200 || designResponse.status === 201) {
        designConfig = designResponse.data?.data || designResponse.data || {};
      }
    } catch (err) {
      console.warn('Could not fetch invoice design for Purchase Return, using default settings.');
    }

    // 2. Pass those settings to the PDf generator
    const buffer = await generateInvoicePDF(data, designConfig, host);
    const base64 = buffer.toString('base64');

    return { success: true, data: base64 };
  } catch (error: any) {
    console.error('Generate invoice PDF error:', error);
    return { success: false, error: error.message || 'Failed to generate invoice PDF' };
  }
}

// Admin Inventory
// Product Category: create
export async function createProductCategoryAction(data: { categoryName: string; description: string; isActive: boolean }) {
  try {
    const response = await ssrProductCategoryAPI.create(data);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to create product category' };
  } catch (error) {
    console.error('Create product category error:', error);
    return { success: false, error: 'Failed to create product category' };
  }
}

// Product Category: update
export async function updateProductCategoryAction(id: string, data: { categoryName?: string; description?: string; isActive?: boolean }) {
  try {
    const response = await ssrProductCategoryAPI.update(id, data);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to update product category' };
  } catch (error) {
    console.error('Update product category error:', error);
    return { success: false, error: 'Failed to update product category' };
  }
}

// Product Category: delete
export async function deleteProductCategoryAction(id: string) {
  try {
    const response = await ssrProductCategoryAPI.delete(id);
    if (response.status === 200 || response.status === 204) {
      return { success: true };
    }
    return { success: false, error: 'Failed to delete product category' };
  } catch (error) {
    console.error('Delete product category error:', error);
    return { success: false, error: 'Failed to delete product category' };
  }
}

// Product Category: bulk update status
export async function bulkUpdateProductCategoriesStatusAction(data: { ids: string[]; status: boolean }) {
  try {
    const response = await ssrProductCategoryAPI.bulkUpdateStatus(data as unknown as Record<string, unknown>);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to update status for selected product categories' };
  } catch (error) {
    console.error('Bulk update product categories status error:', error);
    return { success: false, error: 'Failed to update status for selected product categories' };
  }
}

// Product Category: bulk delete
export async function bulkDeleteProductCategoriesAction(data: { ids: string[] }) {
  try {
    const response = await ssrProductCategoryAPI.bulkDelete(data as unknown as Record<string, unknown>);
    if (response.status === 200 || response.status === 204) {
      return { success: true };
    }
    return { success: false, error: 'Failed to delete selected product categories' };
  } catch (error) {
    console.error('Bulk delete product categories error:', error);
    return { success: false, error: 'Failed to delete selected product categories' };
  }
}
// get all product category download
export async function bulkGetProductCatgeoryAction(filterData: SearchParamsTypes.DownloadSearchParams) {
  try {
    const response = await ssrProductCategoryAPI.bulkAllDownload(filterData);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to get product category' };
  } catch (error) {
    console.error('Bulk get product category error:', error);
    return { success: false, error: 'Failed to get product category' };
  }
}
// product category  selecetd rows download
export async function bulkGetSelectedProductCatgeoryAction(data: { ids: string[] }) {
  try {
    const response = await ssrProductCategoryAPI.bulkGetSelected(data);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to get selecetd product category' };
  } catch (error) {
    console.error('Bulk get selecetd product category error:', error);
    return { success: false, error: 'Failed to get selecetd product category' };
  }
}


// Product Sub Category: create
export async function createProductSubCategoryAction(data: {
  category: string;
  subcategory: string;
  categorycode: string;
  description?: string;
  subCategoryImage?: string | File;
  status: boolean
}) {
  try {
    // Build FormData to support binary file upload
    const formData = new FormData();
    formData.append('category', data.category);
    formData.append('subcategory', data.subcategory);
    formData.append('categorycode', data.categorycode);
    if (data.description !== undefined) {
      formData.append('description', data.description || '');
    }
    if (data.subCategoryImage instanceof File) {
      formData.append('subCategoryImage', data.subCategoryImage);
    } else if (typeof data.subCategoryImage === 'string') {
      formData.append('subCategoryImage', data.subCategoryImage);
    } else {
      formData.append('subCategoryImage', '');
    }
    formData.append('status', String(data.status));

    const response = await ssrProductSubCategoryAPI.create(formData as any);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to create product subcategory', errorData: response };
  } catch (error) {
    console.error('Create product subcategory error:', error);
    return { success: false, error: 'Failed to create product subcategory' };
  }
}

// Product Sub Category: update
export async function updateProductSubCategoryAction(id: string, data: {
  category?: string;
  subcategory?: string;
  categorycode?: string;
  description?: string;
  subCategoryImage?: string | File;
  status?: boolean
}) {
  try {
    // Build FormData to support binary file upload
    const formData = new FormData();
    if (data.category !== undefined) {
      formData.append('category', data.category);
    }
    if (data.subcategory !== undefined) {
      formData.append('subcategory', data.subcategory);
    }
    if (data.categorycode !== undefined) {
      formData.append('categorycode', data.categorycode);
    }
    if (data.description !== undefined) {
      formData.append('description', data.description || '');
    }
    if (data.subCategoryImage instanceof File) {
      formData.append('subCategoryImage', data.subCategoryImage);
    } else if (typeof data.subCategoryImage === 'string') {
      formData.append('subCategoryImage', data.subCategoryImage);
    }
    if (typeof data.status === 'boolean') {
      formData.append('status', String(data.status));
    }

    const response = await ssrProductSubCategoryAPI.update(id, formData as any);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to update product subcategory' };
  } catch (error) {
    console.error('Update product subcategory error:', error);
    return { success: false, error: 'Failed to update product subcategory' };
  }
}

// Product Sub Category: delete
export async function deleteProductSubCategoryAction(id: string) {
  try {
    const response = await ssrProductSubCategoryAPI.delete(id);
    if (response.status === 200 || response.status === 204) {
      return { success: true };
    }
    return { success: false, error: 'Failed to delete product subcategory' };
  } catch (error) {
    console.error('Delete product subcategory error:', error);
    return { success: false, error: 'Failed to delete product subcategory' };
  }
}

// Subcategory: bulk update status
export async function bulkUpdateSubCategoriesStatusAction(data: { ids: string[]; status: boolean }) {
  try {
    const response = await ssrProductSubCategoryAPI.bulkUpdateStatus(data as unknown as Record<string, unknown>);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to update status for selected subcategories' };
  } catch (error) {
    console.error('Bulk update subcategories status error:', error);
    return { success: false, error: 'Failed to update status for selected subcategories' };
  }
}

// Subcategory: bulk delete
export async function bulkDeleteSubCategoriesAction(data: { ids: string[] }) {
  try {
    const response = await ssrProductSubCategoryAPI.bulkDelete(data as unknown as Record<string, unknown>);
    if (response.status === 200 || response.status === 204) {
      return { success: true };
    }
    return { success: false, error: 'Failed to delete selected subcategories' };
  } catch (error) {
    console.error('Bulk delete subcategories error:', error);
    return { success: false, error: 'Failed to delete selected subcategories' };
  }
}
export async function bulkGetProductSubcatgeoryAction(filterData: SearchParamsTypes.DownloadSearchParams) {
  try {
    const response = await ssrProductSubCategoryAPI.bulkAllDownload(filterData);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to get product category' };
  } catch (error) {
    console.error('Bulk get product category error:', error);
    return { success: false, error: 'Failed to get product category' };
  }
}
// product category  selecetd rows download
export async function bulkGetSelectedProductSubatgeoryAction(data: { ids: string[] }) {
  try {
    const response = await ssrProductSubCategoryAPI.bulkGetSelected(data);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to get selecetd product category' };
  } catch (error) {
    console.error('Bulk get selecetd product category error:', error);
    return { success: false, error: 'Failed to get selecetd product category' };
  }
}

// Variants: create
export async function createVariantsAction(data: { variant: string; values: string; status: boolean }) {
  try {
    const response = await ssrVariantsAPI.create(data);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: response?.data?.message || 'Failed to create variants data' }
  } catch (error: any) {
    console.error('Create variants error:', error);
    if (error.response) {
      return { success: false, error: error.response.data?.message || 'Server error while creating variants' };
    } else if (error.request) {
      return { success: false, error: 'Network error. Please check your connection.' };
    }
    return { success: false, error: error.message || 'Failed to create variants' };
  }
}

// Variants: update
export async function updateVariantsAction(id: string, data: { variant: string; values: string; status: boolean }) {
  try {
    const response = await ssrVariantsAPI.update(id, data);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: response?.data?.message || 'Failed to update variants' };
  } catch (error) {
    console.error('Update variants error:', error);
    return { success: false, error: 'Failed to update variants' };
  }
}
export async function bulkUpdateVariantStatusAction(data: { ids: string[]; status: boolean }) {
  try {
    const response = await ssrVariantsAPI.bulkUpdateStatus(data as unknown as Record<string, unknown>);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to update status for selected variant' };
  } catch (error) {
    console.error('Bulk update variant status error:', error);
    return { success: false, error: 'Failed to update status for selected variant' };
  }
}


// Variants: delete
export async function deleteVariantsAction(id: string) {
  try {
    const response = await ssrVariantsAPI.delete(id);
    if (response.status === 200 || response.status === 204) {
      return { success: true };
    }
    return { success: false, error: 'Failed to delete variants' };
  } catch (error) {
    console.error('Delete variants error:', error);
    return { success: false, error: 'Failed to delete variants' };
  }
}
export async function bulkDeleteVariantAction(data: { ids: string[] }) {
  try {
    const response = await ssrVariantsAPI.bulkDelete(data as unknown as Record<string, unknown>);
    if (response.status === 200 || response.status === 204) {
      return { success: true };
    }
    return { success: false, error: 'Failed to delete selected variant' };
  } catch (error) {
    console.error('Bulk delete variant error:', error);
    return { success: false, error: 'Failed to delete selected variant' };
  }
}

// Variants: bulk get
export async function bulkGetVariantsAction(filterData: SearchParamsTypes.DownloadSearchParams) {
  try {
    const response = await ssrVariantsAPI.bulkAllDownload(filterData);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to get variants' };
  } catch (error) {
    console.error('Bulk get variants error:', error);
    return { success: false, error: 'Failed to get variants' };
  }
}
export async function bulkGetSelectedAction(data: { ids: string[] }) {
  try {
    const response = await ssrVariantsAPI.bulkGetSelected(data);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to get variants' };
  } catch (error) {
    console.error('Bulk get variants error:', error);
    return { success: false, error: 'Failed to get variants' };
  }
}

// Loyalty Points: bulk


//Gift Card: bulk get
export async function bulkGetGiftCardAction(filterData: SearchParamsTypes.DownloadSearchParams) {
  try {
    const response = await ssrGiftCardAPI.bulkAllDownload(filterData);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to get gift cards' };
  } catch (error) {
    console.error('Bulk get gift cards error:', error);
    return { success: false, error: 'Failed to get gift cards' };
  }
}
export async function bulkGetSelectedGiftCardAction(data: { ids: string[] }) {
  try {
    const response = await ssrGiftCardAPI.bulkGetSelected(data);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to get gift cards' };
  } catch (error) {
    console.error('Bulk get gift cards error:', error);
    return { success: false, error: 'Failed to get gift cards' };
  }
}


// Customer: bulk get
export async function bulkGetCustomersAction(filterData: SearchParamsTypes.DownloadSearchParams) {
  try {
    const response = await ssrCustomerAPI.bulkAllDownload(filterData);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to get customers' };
  } catch (error) {
    console.error('Bulk get customers error:', error);
    return { success: false, error: 'Failed to get customers' };
  }
}
export async function bulkGetSelectedCustomersAction(data: { ids: string[] }) {
  try {
    const response = await ssrCustomerAPI.bulkGetSelected(data);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to get customers' };
  } catch (error) {
    console.error('Bulk get customers error:', error);
    return { success: false, error: 'Failed to get customers' };
  }
}
// Unit: create
export async function createUnitAction(data: { unit: string; shortName: string; status: boolean }) {
  try {
    const response = await ssrUnitAPI.create(data);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to create unit' };
  } catch (error) {
    console.error('Create unit error:', error);
    return { success: false, error: 'Failed to create unit' };
  }
}

// Unit: update
export async function updateUnitAction(id: string, data: { unit: string; shortName: string; status: boolean }) {
  try {
    const response = await ssrUnitAPI.update(id, data);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to update unit' };
  } catch (error) {
    console.error('Update unit error:', error);
    return { success: false, error: 'Failed to update unit' };
  }
}

// Unit: delete
export async function deleteUnitAction(id: string) {
  try {
    const response = await ssrUnitAPI.delete(id);
    if (response.status === 200 || response.status === 204) {
      return { success: true };
    }
    return { success: false, error: 'Failed to delete unit' };
  } catch (error) {
    console.error('Delete unit error:', error);
    return { success: false, error: 'Failed to delete unit' };
  }
}

// Unit: bulk update status
export async function bulkUpdateUnitStatusAction(data: { ids: string[]; status: boolean }) {
  try {
    const response = await ssrUnitAPI.bulkUpdateStatus(data);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to update unit status' };
  } catch (error) {
    console.error('Bulk update unit status error:', error);
    return { success: false, error: 'Failed to update unit status' };
  }
}

// Unit: bulk delete
export async function bulkDeleteUnitsAction(data: { ids: string[] }) {
  try {
    const response = await ssrUnitAPI.bulkDelete(data);
    if (response.status === 200 || response.status === 204) {
      return { success: true };
    }
    return { success: false, error: 'Failed to delete units' };
  } catch (error) {
    console.error('Bulk delete units error:', error);
    return { success: false, error: 'Failed to delete units' };
  }
}
//Unit get all product category download
export async function bulkGetUnitAction(filterData: SearchParamsTypes.DownloadSearchParams) {
  try {
    const response = await ssrUnitAPI.bulkAllDownload(filterData);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to get product category' };
  } catch (error) {
    console.error('Bulk get product category error:', error);
    return { success: false, error: 'Failed to get product category' };
  }
}
// Unit  get selected unit download
export async function bulkGetSelectedUnitAction(data: { ids: string[] }) {
  try {
    const response = await ssrUnitAPI.bulkGetSelected(data);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to get selecetd product category' };
  } catch (error) {
    console.error('Bulk get selecetd product category error:', error);
    return { success: false, error: 'Failed to get selecetd product category' };
  }
}

// Brand: create
export async function createBrandAction(data: {
  brand: string;
  brandImage?: string | File;
  status: boolean
}) {
  try {
    // Build FormData to support binary file upload
    const formData = new FormData();
    formData.append('brand', data.brand);
    if (data.brandImage instanceof File) {
      formData.append('brandImage', data.brandImage);
    } else if (typeof data.brandImage === 'string') {
      formData.append('brandImage', data.brandImage);
    } else {
      formData.append('brandImage', '');
    }
    formData.append('status', String(data.status));
    const response = await ssrBrandAPI.create(formData as any);
    if (response.status === 200 || response.status === 201) {
      const responseData = response.data;
      const payload = responseData?.data ?? responseData;
      return { success: true, data: payload };
    }
    return { success: false, error: response.data?.message || 'Failed to create brand' };
  } catch (error: any) {
    // console.error('Create brand error:', error);
    if (error.response) {
      return { success: false, error: error.response.data?.message || 'Server error while creating brand' };
    } else if (error.request) {
      return { success: false, error: 'Network error. Please check your connection.' };
    }
    return { success: false, error: error.message || 'Failed to create brand' };
  }
}
// Brand: update
export async function updateBrandAction(id: string, data: {
  brand?: string;
  brandImage?: string | File;
  status?: boolean
}) {
  try {
    // Build FormData to support binary file upload
    const formData = new FormData();
    if (data.brand !== undefined) {
      formData.append('brand', data.brand);
    }
    if (data.brandImage instanceof File) {
      formData.append('brandImage', data.brandImage);
    } else if (typeof data.brandImage === 'string') {
      formData.append('brandImage', data.brandImage);
    }
    if (typeof data.status === 'boolean') {
      formData.append('status', String(data.status));
    }
    const response = await ssrBrandAPI.update(id, formData as any);
    if (response.status === 200 || response.status === 201) {
      const responseData = response.data;
      const payload = responseData?.data ?? responseData;
      return { success: true, data: payload };
    }
    return { success: false, error: response.data?.message || 'Failed to update brand' };
  } catch (error: any) {
    // console.error('Update brand error:', error);
    if (error.response) {
      return { success: false, error: error.response.data?.message || 'Server error while updating brand' };
    } else if (error.request) {
      return { success: false, error: 'Network error. Please check your connection.' };
    }
    return { success: false, error: error.message || 'Failed to update brand' };
  }
}

// Brand: delete
export async function deleteBrandAction(id: string) {
  try {
    const response = await ssrBrandAPI.delete(id);
    if (response.status === 200 || response.status === 204) {
      const responseData = response.data;
      const payload = responseData?.data ?? responseData;
      return { success: true, data: payload };
    }
    return { success: false, error: response.data?.message || 'Failed to delete brand' };
  } catch (error: any) {
    if (error.response) {
      return { success: false, error: error.response.data?.message || 'Server error while deleting brand' };
    } else if (error.request) {
      return { success: false, error: 'Network error. Please check your connection.' };
    }
    return { success: false, error: error.message || 'Failed to delete brand' };
  }
}

// Brand: bulk update status
export async function bulkUpdateBrandsStatusAction(data: { ids: string[]; status: boolean }) {
  try {
    const response = await ssrBrandAPI.bulkUpdateStatus(data as unknown as Record<string, unknown>);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: response.data?.message || 'Failed to bulk update brand status' };
  } catch (error: any) {
    if (error.response) {
      return { success: false, error: error.response.data?.message || 'Server error while update brand stataus' };
    } else if (error.request) {
      return { success: false, error: 'Network error. Please check your connection.' };
    }
    return { success: false, error: error.response?.data?.message || 'Failed to bulk update brand status' };
  }
}

// Brand: bulk delete
export async function bulkDeleteBrandsAction(data: { ids: string[] }) {
  try {
    const response = await ssrBrandAPI.bulkDelete(data as unknown as Record<string, unknown>);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: response.data?.message || 'Failed to bulk delete brands' };
  } catch (error: any) {
    if (error.response) {
      return { success: false, error: error.response.data?.message || 'Server error while delete brand' };
    } else if (error.request) {
      return { success: false, error: 'Network error. Please check your connection.' };
    }
    return { success: false, error: error.response?.data?.message || 'Failed to bulk delete brands' };
  }
}
//brand get all brand download
export async function bulkGetBrandAction(filterData: SearchParamsTypes.DownloadSearchParams) {
  try {
    const response = await ssrBrandAPI.bulkAllDownload(filterData);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: response.data?.message || 'Failed to get brand' };
  } catch (error: any) {
    if (error.response) {
      return { success: false, error: error.response.data?.message || 'Server error while get brand' };
    } else if (error.request) {
      return { success: false, error: 'Network error. Please check your connection.' };
    }
    return { success: false, error: error.response?.data?.message || 'Failed to get brand' };
  }
}
// brand get  selecetd rows download
export async function bulkGetSelectedBrandAction(data: { ids: string[] }) {
  try {
    const response = await ssrBrandAPI.bulkGetSelected(data);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: response.data?.message || 'Failed to get selecetd brand' };
  } catch (error: any) {
    if (error.response) {
      return { success: false, error: error.response.data?.message || 'Server error while get selecetd brand' };
    } else if (error.request) {
      return { success: false, error: 'Network error. Please check your connection.' };
    }
    return { success: false, error: error.response?.data?.message || 'Failed to get selecetd brand' };
  }
}

// Warranty: create
export async function createWarrantyAction(data: {
  warranty: string;
  description: string;
  duration: number;
  period: 'Month' | 'Year';
  status: boolean
}) {
  try {
    const response = await ssrWarrentyAPI.create(data);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to create warranty' };
  } catch (error) {
    console.error('Create warranty error:', error);
    return { success: false, error: 'Failed to create warranty' };
  }
}

// Warranty: update
export async function updateWarrantyAction(id: string, data: { warranty: string; description: string; duration: number; period: 'Month' | 'Year'; status: boolean }) {
  try {
    const response = await ssrWarrentyAPI.update(id, data);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to update warranty' };
  } catch (error) {
    console.error('Update warranty error:', error);
    return { success: false, error: 'Failed to update warranty' };
  }
}

// Warranty: delete
export async function deleteWarrantyAction(id: string) {
  try {
    const response = await ssrWarrentyAPI.delete(id);
    if (response.status === 200 || response.status === 204) {
      return { success: true };
    }
    return { success: false, error: 'Failed to delete warranty' };
  } catch (error) {
    console.error('Delete warranty error:', error);
    return { success: false, error: 'Failed to delete warranty' };
  }
}

// Warranty: bulk update status
export async function bulkUpdateWarrantyStatusAction(data: { ids: string[]; status: boolean }) {
  try {
    const response = await ssrWarrentyAPI.bulkUpdateStatus(data);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to bulk update warranty status' };
  } catch (error) {
    console.error('Bulk update warranty status error:', error);
    return { success: false, error: 'Failed to bulk update warranty status' };
  }
}

// Warranty: bulk delete
export async function bulkDeleteWarrantyAction(data: { ids: string[] }) {
  try {
    const response = await ssrWarrentyAPI.bulkDelete(data);
    if (response.status === 200 || response.status === 204) {
      return { success: true };
    }
    return { success: false, error: 'Failed to bulk delete warranties' };
  } catch (error) {
    console.error('Bulk delete warranty error:', error);
    return { success: false, error: 'Failed to bulk delete warranties' };
  }
}
// get  warranty  downloads
export async function bulkGetWarrantyAction(filterData: SearchParamsTypes.DownloadSearchParams) {
  try {
    const response = await ssrWarrentyAPI.bulkAllDownload(filterData);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to get warranty' };
  } catch (error) {
    console.error('Bulk get warranty error:', error);
    return { success: false, error: 'Failed to get warranty' };
  }
}
// warranty  selecetd rows download
export async function bulkGetSelectedWarrantyAction(data: { ids: string[] }) {
  try {
    const response = await ssrWarrentyAPI.bulkGetSelected(data);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to get selecetd warranty' };
  } catch (error) {
    console.error('Bulk get selected warranty error:', error);
    return { success: false, error: 'Failed to get selected warranty' };
  }
}

// Store Management Server Actions

// Create store
export async function createStoreAction(data: {
  name: string;
  description: string;
  email: string;
  contactNumber: string;
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  geoLocation: {
    type: "Point";
    coordinates: [number, number];
  };
  status: boolean;
}) {
  try {
    const response = await ssrStoreAPI.create(data);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to create store', errorData: response };
  } catch (error) {
    console.error('Create store error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to create store';
    return { success: false, error: errorMessage };
  }
}

// Update store
export async function updateStoreAction(id: string, data: {
  name?: string;
  description?: string;
  email?: string;
  contactNumber?: string;
  location?: {
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
  geoLocation?: {
    type: "Point";
    coordinates: [number, number];
  };
  status?: boolean;
  store?: string;
}) {
  try {
    const response = await ssrStoreAPI.update(id, data);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to update store' };
  } catch (error) {
    console.error('Update store error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to update store';
    return { success: false, error: errorMessage };
  }
}

// Delete store
export async function deleteStoreAction(id: string) {
  try {
    const response = await ssrStoreAPI.delete(id);

    if (response.status === 200 || response.status === 204) {
      return { success: true };
    }
    return { success: false, error: 'Failed to delete store' };
  } catch (error) {
    console.error('Delete store error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete store';
    return { success: false, error: errorMessage };
  }
} // Added closing brace here

// Get all stores
export async function getAllStoresAction() {
  try {
    const response = await ssrStoreAPI.getAll();
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to fetch stores' };
  } catch (error) {
    console.error('Get all stores error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch stores';
    return { success: false, error: errorMessage };
  }
}
export async function bulkGetStoresAction(filterData: SearchParamsTypes.DownloadSearchParams) {
  try {
    const response = await ssrStoreAPI.bulkAllDownload(filterData);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to get variants' };
  } catch (error) {
    console.error('Bulk get variants error:', error);
    return { success: false, error: 'Failed to get variants' };
  }
}
export async function bulkGetSelectedStoreAction(data: { ids: string[] }) {
  try {
    const response = await ssrStoreAPI.bulkGetSelected(data);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to get variants' };
  } catch (error) {
    console.error('Bulk get variants error:', error);
    return { success: false, error: 'Failed to get variants' };
  }
}
// Store bulk status update
export async function bulkUpdateStoresStatusAction(data: { ids: string[]; status: boolean }) {
  try {
    const response = await ssrStoreAPI.bulkUpdateStatus(data);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to update status for selected stores' };
  } catch (error) {
    console.error('Bulk update stores status error:', error);
    return { success: false, error: 'Failed to update status for selected stores' };
  }
}

// Store bulk delete
export async function bulkDeleteStoresAction(data: { ids: string[] }) {
  try {
    const response = await ssrStoreAPI.bulkDelete(data);
    if (response.status === 200 || response.status === 204) {
      return { success: true };
    }
    return { success: false, error: 'Failed to delete selected stores' };
  } catch (error) {
    console.error('Bulk delete stores error:', error);
    return { success: false, error: 'Failed to delete selected stores' };
  }
}



// Get all product categories
export async function getAllProductCategoriesAction() {
  try {
    const response = await ssrProductCategoryAPI.getAll();
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to fetch product categories' };
  } catch (error) {
    console.error('Get product categories error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch product categories';
    return { success: false, error: errorMessage };
  }
}

// Get all product subcategories
export async function getAllProductSubCategoriesAction() {
  try {
    const response = await ssrProductSubCategoryAPI.getAll();
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to fetch product subcategories' };
  } catch (error) {
    console.error('Get product subcategories error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch product subcategories';
    return { success: false, error: errorMessage };
  }
}

// FAQ Category Management

// FAQ Category: create
export async function createFAQCategoryAction(data: { categoryName: string; status: boolean }) {
  try {
    const response = await ssrFAQCategoryAPI.create(data);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to create FAQ category' };
  } catch (error) {
    console.error('Create FAQ category error:', error);
    return { success: false, error: 'Failed to create FAQ category' };
  }
}

// FAQ Category: update
export async function updateFAQCategoryAction(id: string, data: { categoryName?: string; status?: boolean }) {
  try {
    const response = await ssrFAQCategoryAPI.update(id, data);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to update FAQ category' };
  } catch (error) {
    console.error('Update FAQ category error:', error);
    return { success: false, error: 'Failed to update FAQ category' };
  }
}

// FAQ Category: delete
export async function deleteFAQCategoryAction(id: string) {
  try {
    const response = await ssrFAQCategoryAPI.delete(id);
    if (response.status === 200 || response.status === 204) {
      return { success: true };
    }
    return { success: false, error: 'Failed to delete FAQ category' };
  } catch (error) {
    console.error('Delete FAQ category error:', error);
    return { success: false, error: 'Failed to delete FAQ category' };
  }
}

// FAQ Category: bulk update status
export async function bulkUpdateFAQCategoriesStatusAction(data: { ids: string[]; status: boolean }) {
  try {
    const response = await ssrFAQCategoryAPI.bulkUpdateStatus(data as unknown as Record<string, unknown>);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to update status for selected FAQ categories' };
  } catch (error) {
    console.error('Bulk update FAQ categories status error:', error);
    return { success: false, error: 'Failed to update status for selected FAQ categories' };
  }
}

// FAQ Category: bulk delete
export async function bulkDeleteFAQCategoriesAction(data: { ids: string[] }) {
  try {
    const response = await ssrFAQCategoryAPI.bulkDelete(data as unknown as Record<string, unknown>);
    if (response.status === 200 || response.status === 204) {
      return { success: true };
    }
    return { success: false, error: 'Failed to delete selected FAQ categories' };
  } catch (error) {
    console.error('Bulk delete FAQ categories error:', error);
    return { success: false, error: 'Failed to delete selected FAQ categories' };
  }
}

// FAQ Category: get active
export async function getActiveFAQCategoriesAction() {
  try {
    const response = await ssrFAQCategoryAPI.getActive();
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to fetch FAQ categories' };
  } catch (error) {
    console.error('Get active FAQ categories error:', error);
    return { success: false, error: 'Failed to fetch FAQ categories' };
  }
}

// FAQ Management Server Actions

// Create FAQ
export async function createFAQAction(data: {
  question: string;
  answer: string;
  status?: boolean;
  isPublished?: boolean;
}) {
  try {
    const response = await ssrFAQAPI.create(data);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to create FAQ' };
  } catch (error) {
    console.error('Create FAQ error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to create FAQ';
    return { success: false, error: errorMessage };
  }
}

// Update FAQ
export async function updateFAQAction(id: string, data: {
  question?: string;
  answer?: string;
  status?: boolean;
  isPublished?: boolean;
}) {
  try {
    const response = await ssrFAQAPI.update(id, data);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to update FAQ' };
  } catch (error) {
    console.error('Update FAQ error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to update FAQ';
    return { success: false, error: errorMessage };
  }
}

// Delete FAQ
export async function deleteFAQAction(id: string) {
  try {
    const response = await ssrFAQAPI.delete(id);
    if (response.status === 200 || response.status === 204) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to delete FAQ' };
  } catch (error) {
    console.error('Delete FAQ error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete FAQ';
    return { success: false, error: errorMessage };
  }
}

// FAQ: bulk update status
export async function bulkUpdateFAQsStatusAction(data: { ids: string[]; status: boolean }) {
  try {
    const response = await ssrFAQAPI.bulkUpdateStatus(data as unknown as Record<string, unknown>);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to update status for selected FAQs' };
  } catch (error) {
    console.error('Bulk update FAQs status error:', error);
    return { success: false, error: 'Failed to update status for selected FAQs' };
  }
}

// FAQ: bulk delete
export async function bulkDeleteFAQsAction(data: { ids: string[] }) {
  try {
    const response = await ssrFAQAPI.bulkDelete(data as unknown as Record<string, unknown>);
    if (response.status === 200 || response.status === 204) {
      return { success: true };
    }
    return { success: false, error: 'Failed to delete selected FAQs' };
  } catch (error) {
    console.error('Bulk delete FAQs error:', error);
    return { success: false, error: 'Failed to delete selected FAQs' };
  }
}

// Features Management Server Actions

// Create Feature
export async function createFeatureAction(data: {
  title: string;
  description: string;
  status: boolean;
}) {
  try {
    const response = await ssrFeaturesAPI.create(data);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to create feature' };
  } catch (error) {
    console.error('Create feature error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to create feature';
    return { success: false, error: errorMessage };
  }
}

// Update Feature
export async function updateFeatureAction(id: string, data: {
  title?: string;
  description?: string;
  status?: boolean;
}) {
  try {
    const response = await ssrFeaturesAPI.update(id, data);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to update feature' };
  } catch (error) {
    console.error('Update feature error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to update feature';
    return { success: false, error: errorMessage };
  }
}

// Delete Feature
export async function deleteFeatureAction(id: string) {
  try {
    const response = await ssrFeaturesAPI.delete(id);
    if (response.status === 200 || response.status === 204) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to delete feature' };
  } catch (error) {
    console.error('Delete feature error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete feature';
    return { success: false, error: errorMessage };
  }
}

// Features: bulk status update
export async function bulkUpdateFeaturesStatusAction(data: { ids: string[]; status: boolean }) {
  try {
    const response = await ssrFeaturesAPI.bulkUpdateStatus(data as unknown as Record<string, unknown>);
    if (response.status === 200 || response.status === 204) {
      return { success: true };
    }
    return { success: false, error: 'Failed to update status for selected features' };
  } catch (error) {
    console.error('Bulk update features status error:', error);
    return { success: false, error: 'Failed to update status for selected features' };
  }
}

// Features: bulk delete
export async function bulkDeleteFeaturesAction(data: { ids: string[] }) {
  try {
    const response = await ssrFeaturesAPI.bulkDelete(data as unknown as Record<string, unknown>);
    if (response.status === 200 || response.status === 204) {
      return { success: true };
    }
    return { success: false, error: 'Failed to delete selected features' };
  } catch (error) {
    console.error('Bulk delete features error:', error);
    return { success: false, error: 'Failed to delete selected features' };
  }
}

// Product Overview Management Server Actions

// Create Product Overview
export async function createProductOverviewAction(data: {
  title: string;
  description: string;
  overviewImage?: string | File;
  status: boolean;
}) {
  try {
    // Build FormData to support binary file upload
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('status', String(data.status));

    // Handle overview image file upload
    if (data.overviewImage instanceof File) {
      formData.append('overviewImage', data.overviewImage);
    } else if (typeof data.overviewImage === 'string' && data.overviewImage.trim() !== '') {
      formData.append('overviewImage', data.overviewImage);
    }

    const response = await ssrProductOverviewAPI.create(formData as any);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: response.data.message || 'Failed to create product overview' };
  } catch (error) {
    console.error('Create product overview error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to create product overview';
    return { success: false, error: errorMessage };
  }
}

// Update Product Overview
export async function updateProductOverviewAction(id: string, data: {
  title?: string;
  description?: string;
  overviewImage?: string | File;
  status?: boolean;
}) {
  try {
    // Build FormData to support binary file upload
    const formData = new FormData();

    if (data.title !== undefined) formData.append('title', data.title);
    if (data.description !== undefined) formData.append('description', data.description);
    if (data.status !== undefined) formData.append('status', String(data.status));

    // Handle overview image file upload
    if (data.overviewImage instanceof File) {
      formData.append('overviewImage', data.overviewImage);
    } else if (typeof data.overviewImage === 'string' && data.overviewImage.trim() !== '') {
      formData.append('overviewImage', data.overviewImage);
    }

    const response = await ssrProductOverviewAPI.update(id, formData as any);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to update product overview' };
  } catch (error) {
    console.error('Update product overview error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to update product overview';
    return { success: false, error: errorMessage };
  }
}

// Delete Product Overview
export async function deleteProductOverviewAction(id: string) {
  try {
    const response = await ssrProductOverviewAPI.delete(id);
    if (response.status === 200 || response.status === 204) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to delete product overview' };
  } catch (error) {
    console.error('Delete product overview error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete product overview';
    return { success: false, error: errorMessage };
  }
}

// Product Overview: bulk status update
export async function bulkUpdateProductOverviewStatusAction(data: { ids: string[]; status: boolean }) {
  try {
    const response = await ssrProductOverviewAPI.bulkUpdateStatus(data as unknown as Record<string, unknown>);
    if (response.status === 200 || response.status === 204) {
      return { success: true };
    }
    return { success: false, error: 'Failed to update status for selected product overview items' };
  } catch (error) {
    console.error('Bulk update product overview status error:', error);
    return { success: false, error: 'Failed to update status for selected product overview items' };
  }
}

// Product Overview: bulk delete
export async function bulkDeleteProductOverviewAction(data: { ids: string[] }) {
  try {
    const response = await ssrProductOverviewAPI.bulkDelete(data as unknown as Record<string, unknown>);
    if (response.status === 200 || response.status === 204) {
      return { success: true };
    }
    return { success: false, error: 'Failed to delete selected product overview items' };
  } catch (error) {
    console.error('Bulk delete product overview error:', error);
    return { success: false, error: 'Failed to delete selected product overview items' };
  }
}

// Business Types Management Server Actions

// Create Business Type
export async function createBusinessTypeAction(data: {
  title: string;
  description: string;
  status: boolean;
}) {
  try {
    const response = await ssrBusinessTypesAPI.create(data);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to create business type' };
  } catch (error) {
    console.error('Create business type error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to create business type';
    return { success: false, error: errorMessage };
  }
}

// Update Business Type
export async function updateBusinessTypeAction(id: string, data: {
  title?: string;
  description?: string;
  status?: boolean;
}) {
  try {
    const response = await ssrBusinessTypesAPI.update(id, data);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to update business type' };
  } catch (error) {
    console.error('Update business type error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to update business type';
    return { success: false, error: errorMessage };
  }
}

// Delete Business Type
export async function deleteBusinessTypeAction(id: string) {
  try {
    const response = await ssrBusinessTypesAPI.delete(id);
    if (response.status === 200 || response.status === 204) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to delete business type' };
  } catch (error) {
    console.error('Delete business type error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete business type';
    return { success: false, error: errorMessage };
  }
}

// Business Types: bulk status update
export async function bulkUpdateBusinessTypesStatusAction(data: { ids: string[]; status: boolean }) {
  try {
    const response = await ssrBusinessTypesAPI.bulkUpdateStatus(data as unknown as Record<string, unknown>);
    if (response.status === 200 || response.status === 204) {
      return { success: true };
    }
    return { success: false, error: 'Failed to update status for selected business types' };
  } catch (error) {
    console.error('Bulk update business types status error:', error);
    return { success: false, error: 'Failed to update status for selected business types' };
  }
}

// Business Types: bulk delete
export async function bulkDeleteBusinessTypesAction(data: { ids: string[] }) {
  try {
    const response = await ssrBusinessTypesAPI.bulkDelete(data as unknown as Record<string, unknown>);
    if (response.status === 200 || response.status === 204) {
      return { success: true };
    }
    return { success: false, error: 'Failed to delete selected business types' };
  } catch (error) {
    console.error('Bulk delete business types error:', error);
    return { success: false, error: 'Failed to delete selected business types' };
  }
}

// Blog Management Server Actions

// Create Blog
export async function createBlogAction(data: {
  title: string;
  overview: string;
  description: string;
  tags: string[];
  createdBy: string;
  readTime?: number;
  isPublished: boolean;
  blogImage?: string | File;
}) {
  try {
    // Build FormData to support binary file upload
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('overview', data.overview);
    formData.append('description', data.description);

    // Handle tags properly - send as individual array items
    if (data.tags && data.tags.length > 0) {
      data.tags.forEach((tag, index) => {
        formData.append(`tags[${index}]`, tag);
      });
    }

    formData.append('createdBy', data.createdBy);
    if (data.readTime !== undefined) formData.append('readTime', data.readTime.toString());
    formData.append('isPublished', String(data.isPublished));

    // Handle blogImage file upload
    if (data.blogImage instanceof File) {
      formData.append('blogImage', data.blogImage);
    } else if (typeof data.blogImage === 'string' && data.blogImage.trim() !== '') {
      formData.append('blogImage', data.blogImage);
    }
    // Don't append blogImage if it's null, undefined, or empty string

    const response = await ssrBlogsAPI.create(formData as any);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to create blog' };
  } catch (error) {
    console.error('Create blog error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to create blog';
    return { success: false, error: errorMessage };
  }
}

// Update Blog
export async function updateBlogAction(id: string, data: {
  title?: string;
  overview?: string;
  description?: string;
  tags?: string[];
  createdBy?: string;
  readTime?: number;
  isPublished?: boolean;
  blogImage?: string | File;
}) {
  try {
    // Build FormData to support binary file upload
    const formData = new FormData();

    if (data.title !== undefined) formData.append('title', data.title);
    if (data.overview !== undefined) formData.append('overview', data.overview);
    if (data.description !== undefined) formData.append('description', data.description);

    // Handle tags properly - send as individual array items
    if (data.tags && data.tags.length > 0) {
      data.tags.forEach((tag, index) => {
        formData.append(`tags[${index}]`, tag);
      });
    }

    if (data.createdBy !== undefined) formData.append('createdBy', data.createdBy);
    if (data.readTime !== undefined) formData.append('readTime', data.readTime.toString());
    if (data.isPublished !== undefined) formData.append('isPublished', String(data.isPublished));

    // Handle blogImage file upload
    if (data.blogImage instanceof File) {
      formData.append('blogImage', data.blogImage);
    } else if (typeof data.blogImage === 'string' && data.blogImage.trim() !== '') {
      formData.append('blogImage', data.blogImage);
    }
    // Don't append blogImage if it's null, undefined, or empty string

    const response = await ssrBlogsAPI.update(id, formData as any);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to update blog' };
  } catch (error) {
    console.error('Update blog error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to update blog';
    return { success: false, error: errorMessage };
  }
}

// Delete Blog
export async function deleteBlogAction(id: string) {
  try {
    const response = await ssrBlogsAPI.delete(id);
    if (response.status === 200 || response.status === 204) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to delete blog' };
  } catch (error) {
    console.error('Delete blog error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete blog';
    return { success: false, error: errorMessage };
  }
}

// Blog: bulk update status (publish/unpublish)
export async function bulkUpdateBlogsStatusAction(data: { ids: string[]; status: boolean }) {
  try {
    const response = await ssrBlogsAPI.bulkUpdateStatus(data as unknown as Record<string, unknown>);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to update status for selected blogs' };
  } catch (error) {
    console.error('Bulk update blogs status error:', error);
    return { success: false, error: 'Failed to update status for selected blogs' };
  }
}

// Blog: bulk delete
export async function bulkDeleteBlogsAction(data: { ids: string[] }) {
  try {
    const response = await ssrBlogsAPI.bulkDelete(data as unknown as Record<string, unknown>);
    if (response.status === 200 || response.status === 204) {
      return { success: true };
    }
    return { success: false, error: 'Failed to delete selected blogs' };
  } catch (error) {
    console.error('Bulk delete blogs error:', error);
    return { success: false, error: 'Failed to delete selected blogs' };
  }
}

// Toggle Blog Publish Status
export async function togglePublishBlogAction(id: string, isPublished: boolean) {
  try {
    const response = await ssrBlogsAPI.togglePublish(id, isPublished);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    console.error('Toggle blog publish status failed:', response);
    return { success: false, error: 'Failed to toggle blog publish status' };
  } catch (error) {
    console.error('Toggle blog publish error:', error);
    console.error('Toggle blog publish error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to toggle blog publish status';
    console.error('Toggle blog publish error:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

// Hero Section Management Server Actions

// Create Hero Section
export async function createHeroSectionAction(data: {
  title1: string;
  title2: string;
  subtitle?: string;
  backgroundImage: string | File | null;
  heroImage: string | File | null;
}) {
  try {
    // Build FormData to support binary file upload
    const formData = new FormData();
    formData.append('title1', data.title1);
    formData.append('title2', data.title2);
    if (data.subtitle !== undefined) formData.append('subtitle', data.subtitle);

    // Handle backgroundImage file upload
    if (data.backgroundImage instanceof File) {
      formData.append('backgroundImage', data.backgroundImage);
    } else if (typeof data.backgroundImage === 'string' && data.backgroundImage.trim() !== '') {
      formData.append('backgroundImage', data.backgroundImage);
    }

    // Handle heroImage file upload
    if (data.heroImage instanceof File) {
      formData.append('heroImage', data.heroImage);
    } else if (typeof data.heroImage === 'string' && data.heroImage.trim() !== '') {
      formData.append('heroImage', data.heroImage);
    }

    const response = await ssrHeroSectionAPI.create(formData as any);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to create hero section' };
  } catch (error) {
    console.error('Create hero section error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to create hero section';
    return { success: false, error: errorMessage };
  }
}

// Update Hero Section
export async function updateHeroSectionAction(id: string, data: {
  title1?: string;
  title2?: string;
  subtitle?: string;
  backgroundImage?: string | File | null;
  heroImage?: string | File | null;
}) {
  try {
    // Build FormData to support binary file upload
    const formData = new FormData();

    if (data.title1 !== undefined) formData.append('title1', data.title1);
    if (data.title2 !== undefined) formData.append('title2', data.title2);
    if (data.subtitle !== undefined) formData.append('subtitle', data.subtitle);

    // Handle backgroundImage file upload
    if (data.backgroundImage instanceof File) {
      formData.append('backgroundImage', data.backgroundImage);
    } else if (typeof data.backgroundImage === 'string' && data.backgroundImage.trim() !== '') {
      formData.append('backgroundImage', data.backgroundImage);
    }

    // Handle heroImage file upload
    if (data.heroImage instanceof File) {
      formData.append('heroImage', data.heroImage);
    } else if (typeof data.heroImage === 'string' && data.heroImage.trim() !== '') {
      formData.append('heroImage', data.heroImage);
    }

    const response = await ssrHeroSectionAPI.update(id, formData as any);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to update hero section' };
  } catch (error) {
    console.error('Update hero section error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to update hero section';
    return { success: false, error: errorMessage };
  }
}

// Footer Section Management Server Actions

// Create Footer Section
export async function createFooterCTAAction(cta: {
  title: string;
  subtitle: string;
}) {
  try {
    const response = await ssrFooterSectionAPI.createCTA({ cta });
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: response.data.message || 'Failed to create footer section' };
  } catch (error) {
    console.error('Create footer section error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to create footer section';
    return { success: false, error: errorMessage };
  }
}
export async function createFooterSectionAction(data: {
  cta: {
    title: string;
    subtitle: string;
  };
  links: Array<{
    title: string;
    description: string;
    status: boolean;
  }>;
}) {
  try {
    const response = await ssrFooterSectionAPI.create(data);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to create footer section' };
  } catch (error) {
    console.error('Create footer section error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to create footer section';
    return { success: false, error: errorMessage };
  }
}



// Update Footer CTA
export async function updateFooterCTAAction(id: string, cta: {
  title: string;
  subtitle: string;
}) {
  try {
    const response = await ssrFooterSectionAPI.updateCTA(id, { cta });
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: response.data.message || 'Failed to update footer CTA' };
  } catch (error) {
    console.error('Update footer CTA error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to update footer CTA';
    return { success: false, error: errorMessage };
  }
}


// Append a single footer link to existing links
export async function appendFooterLinkAction(sectionId: string, link: {
  title: string;
  description: string;
  status: boolean;
}) {
  try {
    const response = await ssrFooterSectionAPI.appendLinks(sectionId, link);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to append footer link' };
  } catch (error) {
    console.error('Append footer link error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to append footer link';
    return { success: false, error: errorMessage };
  }
}

// Update a single footer link by ID
export async function updateFooterLinkAction(linkId: string, data: {
  title: string;
  description: string;
  status: boolean;
}) {
  try {
    const response = await ssrFooterSectionAPI.updateLinks(linkId, data);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to update footer link' };
  } catch (error) {
    console.error('Update footer link error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to update footer link';
    return { success: false, error: errorMessage };
  }
}

// Delete a single footer link by ID
export async function deleteFooterLinkAction(linkId: string) {
  try {
    const response = await ssrFooterSectionAPI.deleteLinks(linkId);
    if (response.status === 200 || response.status === 204) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to delete footer link' };
  } catch (error) {
    console.error('Delete footer link error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete footer link';
    return { success: false, error: errorMessage };
  }
}

// Social Media Links Management Server Actions

// Create Social Media Links
export async function createSocialMediaLinksAction(data: {
  instagramLink?: string;
  facebookLink?: string;
  twitterLink?: string;
  youtubeLink?: string;
}) {
  try {
    const response = await ssrSocialMediaLinksAPI.create(data);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to create social media links' };
  } catch (error) {
    console.error('Create social media links error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to create social media links';
    return { success: false, error: errorMessage };
  }
}

// Update Social Media Links
export async function updateSocialMediaLinksAction(data: {
  instagramLink?: string;
  facebookLink?: string;
  twitterLink?: string;
  youtubeLink?: string;
}) {
  try {
    const response = await ssrSocialMediaLinksAPI.update(data);
    if (response.status === 200 || response.status === 201) {
      // Handle array response - return first item or empty object
      const data = Array.isArray(response.data) ? response.data[0] : response.data;
      return { success: true, data };
    }
    return { success: false, error: response.data.message || 'Failed to update social media links' };
  } catch (error) {
    console.error('Update social media links error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to update social media links';
    return { success: false, error: errorMessage };
  }
}

// Get Social Media Links
export async function getSocialMediaLinksAction() {
  try {
    const response = await ssrSocialMediaLinksAPI.getAll();
    if (response.status === 200 || response.status === 201) {
      // Handle response structure
      const data = Array.isArray(response.data) ? response.data[0] : response.data;
      return { success: true, data };
    }
    return { success: false, error: 'Failed to fetch social media links' };
  } catch (error) {
    console.error('Get social media links error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch social media links';
    return { success: false, error: errorMessage };
  }
}

// Currency Settings Management Server Actions

// Create Currency
export async function createCurrencyAction(data: {
  currencyName: string;
  currencyCode: string;
  currencySymbol: string;
  currencyPosition: 'Left' | 'Right';
  thousandSeparator: string;
  decimalSeparator: string;
  numberOfDecimals: number;
}) {
  try {
    const response = await ssrCurrencySettingsAPI.create(data);
    if (response.status === 200 || response.status === 201) {
      // Handle nested response structure: response.data.data contains the actual currency
      const currencyData = response.data?.data || response.data;
      return { success: true, data: currencyData };
    }
    return { success: false, error: 'Failed to create currency' };
  } catch (error) {
    console.error('Create currency error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to create currency';
    return { success: false, error: errorMessage };
  }
}

// Update Currency
export async function updateCurrencyAction(id: string, data: {
  currencyName?: string;
  currencyCode?: string;
  currencySymbol?: string;
  currencyPosition?: 'Left' | 'Right';
  thousandSeparator?: string;
  decimalSeparator?: string;
  numberOfDecimals?: number;
}) {
  try {
    const response = await ssrCurrencySettingsAPI.update(id, data);
    if (response.status === 200 || response.status === 201) {
      // Handle nested response structure: response.data.data contains the actual currency
      const currencyData = response.data?.data || response.data;
      return { success: true, data: currencyData };
    }
    return { success: false, error: 'Failed to update currency' };
  } catch (error) {
    console.error('Update currency error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to update currency';
    return { success: false, error: errorMessage };
  }
}

// Delete Currency
export async function deleteCurrencyAction(id: string) {
  try {
    const response = await ssrCurrencySettingsAPI.delete(id);
    if (response.status === 200 || response.status === 204) {
      return { success: true };
    }
    return { success: false, error: 'Failed to delete currency' };
  } catch (error) {
    console.error('Delete currency error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete currency';
    return { success: false, error: errorMessage };
  }
}

// Set Primary Currency
export async function setPrimaryCurrencyAction(id: string) {
  try {
    const response = await ssrCurrencySettingsAPI.setPrimary(id);
    if (response.status === 200 || response.status === 201) {
      // Handle nested response structure: response.data.data contains the updated currencies
      const currencyData = response.data?.data || response.data;
      return { success: true, data: currencyData };
    }
    return { success: false, error: 'Failed to set primary currency' };
  } catch (error) {
    console.error('Set primary currency error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to set primary currency';
    return { success: false, error: errorMessage };
  }
}




// Payment Configuration Management Server Actions

// Create Payment Configuration
export async function createPaymentConfigAction(data: {
  provider: 'razorpay' | 'stripe' | 'paypal' | 'cinet' | 'sadad' | 'airtelMoney' | 'phonePe' | 'midtrans' | 'paystack' | 'flutterwave';
  enabled: boolean;
  credentials: {
    // Razorpay fields
    key_id?: string;
    key_secret?: string;
    // Stripe fields
    secretKey?: string;
    appKey?: string;
    // PayPal fields
    clientId?: string;
    clientSecret?: string;
    siteId?: string;
    // Cinet fields
    apiKey?: string;
    // SADAD fields
    domain?: string;
    // PhonePe fields
    appId?: string;
    merchantId?: string;
    saltId?: string;
    saltKey?: string;
  };
}) {
  try {
    const response = await ssrPaymentSettingsAPI.create(data);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to create payment configuration' };
  } catch (error) {
    console.error('Create payment configuration error:', error);
    return { success: false, error: 'Failed to create payment configuration' };
  }
}

// Update Payment Configuration
export async function updatePaymentConfigAction(id: string, data: {
  provider?: 'razorpay' | 'stripe' | 'paypal' | 'cinet' | 'sadad' | 'airtelMoney' | 'phonePe' | 'midtrans' | 'paystack' | 'flutterwave';
  enabled?: boolean;
  credentials?: {
    // Razorpay fields
    key_id?: string;
    key_secret?: string;
    // Stripe fields
    secretKey?: string;
    appKey?: string;
    // PayPal fields
    clientId?: string;
    clientSecret?: string;
    siteId?: string;
    // Cinet fields
    apiKey?: string;
    // SADAD fields
    domain?: string;
    // PhonePe fields
    appId?: string;
    merchantId?: string;
    saltId?: string;
    saltKey?: string;
  };
}) {
  try {
    const response = await ssrPaymentSettingsAPI.update(id, data);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to update payment configuration' };
  } catch (error) {
    console.error('Update payment configuration error:', error);
    return { success: false, error: 'Failed to update payment configuration' };
  }
}



// Trial Settings Management Server Actions

// Update Trial Settings
export async function updateTrialSettingsAction(data: {
  duration: number;
  description: string;
}) {
  try {
    const response = await ssrTrialSettingsAPI.update('trial', data);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to update trial settings' };
  } catch (error) {
    console.error('Update trial settings error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to update trial settings';
    return { success: false, error: errorMessage };
  }
}

// Mail Settings Management Server Actions

// Create Mail Settings
export async function createMailSettingsAction(data: {
  email: string;
  host: string;
  port: number;
  encryption: string;
  password: string;
}) {
  try {
    const response = await ssrMailSettingsAPI.create(data);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to create mail settings' };
  } catch (error) {
    console.error('Create mail settings error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to create mail settings';
    return { success: false, error: errorMessage };
  }
}

// Update Mail Settings
export async function updateMailSettingsAction(data: {
  email?: string;
  host?: string;
  port?: number;
  encryption?: string;
  password?: string;
}) {
  try {
    const response = await ssrMailSettingsAPI.update('', data);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to update mail settings' };
  } catch (error) {
    console.error('Update mail settings error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to update mail settings';
    return { success: false, error: errorMessage };
  }
}

// Verify Mail Settings
export async function verifyMailSettingsAction() {
  try {
    const response = await ssrMailSettingsAPI.verify('');
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to verify mail settings' };
  } catch (error) {
    console.error('Server action: Verify mail settings error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to verify mail settings';
    return { success: false, error: errorMessage };
  }
}

// Delete Mail Settings
export async function deleteMailSettingsAction() {
  try {
    const response = await ssrMailSettingsAPI.delete('');
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to delete mail settings' };
  } catch (error) {
    console.error('Delete mail settings error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete mail settings';
    return { success: false, error: errorMessage };
  }
} // Added closing bracket here

// General Settings Server Actions

// Create General Settings
export async function createGeneralSettingsAction(data: {
  appName: string;
  footerText: string;
  contactNumber: string;
  inquiryEmail: string;
  siteDescription: string;
  businessAddress: {
    shopNumber: string;
    buildingName: string;
    area: string;
    landmark: string;
    nearBy: string;
    country: string;
    state: string;
    city: string;
    postalCode: string;
    latitude: number;
    longitude: number;
  };
  darkLogo?: string | File;
  lightLogo?: string | File;
  favicon?: string | File;
  logos?: {
    darkLogo?: string | File;
    lightLogo?: string | File;
    favicon?: string | File;
    collapsDarkLogo?: string | File;
    collapsLightLogo?: string | File;
    miniLogo?: string | File;
  };
  userApp?: string;
  invoicePrefix?: string;
  invoiceNumberFormat?: string;
  invoiceFooter?: string;
  invoiceTerms?: boolean;
}) {
  try {
    const response = await ssrGeneralSettingsAPI.create(data);

    if (response.status === 200 || response.status === 201) {
      // Handle array response - return first item or empty object
      const data = Array.isArray(response.data) ? response.data[0] : response.data;
      return { success: true, data };
    }
    return { success: false, error: 'Failed to create general settings' };
  } catch (error) {
    console.error('Create general settings error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to create general settings';
    return { success: false, error: errorMessage };
  }
}

// Update General Settings
export async function updateGeneralSettingsAction(data: {
  appName?: string;
  footerText?: string;
  contactNumber?: string;
  inquiryEmail?: string;
  siteDescription?: string;
  businessAddress?: {
    shopNumber?: string;
    buildingName?: string;
    area?: string;
    landmark?: string;
    nearBy?: string;
    country?: string;
    state?: string;
    city?: string;
    postalCode?: string;
    latitude?: number;
    longitude?: number;
  };
  darkLogo?: string | File;
  lightLogo?: string | File;
  favicon?: string | File;
  logos?: {
    darkLogo?: string | File;
    lightLogo?: string | File;
    favicon?: string | File;
    collapsDarkLogo?: string | File;
    collapsLightLogo?: string | File;
    miniLogo?: string | File;
  };
  userApp?: string;
  invoicePrefix?: string;
  invoiceNumberFormat?: string;
  invoiceFooter?: string;
  invoiceTerms?: boolean;
}) {
  try {
    const response = await ssrGeneralSettingsAPI.update(data);

    if (response.status === 200 || response.status === 201) {
      // Handle array response - return first item or empty object
      const data = Array.isArray(response.data) ? response.data[0] : response.data;
      return { success: true, data };
    }
    return { success: false, error: 'Failed to update general settings' };
  } catch (error) {
    console.error('Update general settings error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to update general settings';
    return { success: false, error: errorMessage };
  }
}

// GDPR Settings Actions
export async function getAllGDPRSettingsAction() {
  try {
    const response = await ssrGDPRSettingsAPI.getAll();
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to get GDPR settings' };
  } catch (error) {
    console.error('Get GDPR settings error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to get GDPR settings';
    return { success: false, error: errorMessage };
  }
}

export async function createGDPRSettingsAction(data: { enableGdprCookieNotice: boolean; cookieMessage: string }) {
  try {
    const response = await ssrGDPRSettingsAPI.create(data);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to create GDPR settings' };
  } catch (error) {
    console.error('Create GDPR settings error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to create GDPR settings';
    return { success: false, error: errorMessage };
  }
}

export async function updateGDPRSettingsAction(data: { enableGdprCookieNotice: boolean; cookieMessage: string }) {
  try {
    const response = await ssrGDPRSettingsAPI.update(data);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to update GDPR settings' };
  } catch (error) {
    console.error('Update GDPR settings error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to update GDPR settings';
    return { success: false, error: errorMessage };
  }
}

export async function toggleGDPRSettingsAction(data: { enableGdprCookieNotice: boolean }) {
  try {
    const response = await ssrGDPRSettingsAPI.toggle(data);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to toggle GDPR settings' };
  } catch (error) {
    console.error('Toggle GDPR settings error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to toggle GDPR settings';
    return { success: false, error: errorMessage };
  }
}


// Get All SEO Settings
export async function getAllSEOSettingsAction() {
  try {
    const response = await ssrSEOSettingsAPI.getAll();
    if (response.status === 200 || response.status === 201) {
      // Handle array response - return first item or empty object
      const data = Array.isArray(response.data) ? response.data[0] : response.data;
      return { success: true, data };
    }
    return { success: false, error: 'Failed to get SEO settings' };
  } catch (error) {
    console.error('Get SEO settings error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to get SEO settings';
    return { success: false, error: errorMessage };
  }
}

// Create SEO Settings
export async function createSEOSettingsAction(data: {
  seoSlug: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string[];
  seoImage?: string | File;
  googleSiteVerification: string;
  canonicalUrl: string;
}) {
  try {
    // Build FormData to support binary file upload
    const formData = new FormData();
    formData.append('seoSlug', data.seoSlug);
    formData.append('metaTitle', data.metaTitle);
    formData.append('metaDescription', data.metaDescription);

    // Handle metaKeywords array
    if (data.metaKeywords && data.metaKeywords.length > 0) {
      data.metaKeywords.forEach((keyword, index) => {
        formData.append(`metaKeywords[${index}]`, keyword);
      });
    }

    formData.append('googleSiteVerification', data.googleSiteVerification);
    formData.append('canonicalUrl', data.canonicalUrl);

    // Handle seoImage file upload
    if (data.seoImage instanceof File) {
      formData.append('seoImage', data.seoImage);
    } else if (typeof data.seoImage === 'string' && data.seoImage.trim() !== '') {
      formData.append('seoImage', data.seoImage);
    }

    const response = await ssrSEOSettingsAPI.create(formData as any);
    if (response.status === 200 || response.status === 201) {
      // Handle array response - return first item or empty object
      const responseData = Array.isArray(response.data) ? response.data[0] : response.data;
      return { success: true, data: responseData };
    }
    return { success: false, error: 'Failed to create SEO settings' };
  } catch (error) {
    console.error('Create SEO settings error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to create SEO settings';
    return { success: false, error: errorMessage };
  }
}

// Update SEO Settings
export async function updateSEOSettingsAction(data: {
  seoSlug?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  seoImage?: string | File;
  googleSiteVerification?: string;
  canonicalUrl?: string;
}) {
  try {
    // Build FormData to support binary file upload
    const formData = new FormData();

    if (data.seoSlug !== undefined) formData.append('seoSlug', data.seoSlug);
    if (data.metaTitle !== undefined) formData.append('metaTitle', data.metaTitle);
    if (data.metaDescription !== undefined) formData.append('metaDescription', data.metaDescription);

    // Handle metaKeywords array
    if (data.metaKeywords && data.metaKeywords.length > 0) {
      data.metaKeywords.forEach((keyword, index) => {
        formData.append(`metaKeywords[${index}]`, keyword);
      });
    }

    if (data.googleSiteVerification !== undefined) formData.append('googleSiteVerification', data.googleSiteVerification);
    if (data.canonicalUrl !== undefined) formData.append('canonicalUrl', data.canonicalUrl);

    // Handle seoImage file upload
    if (data.seoImage instanceof File) {
      formData.append('seoImage', data.seoImage);
    } else if (typeof data.seoImage === 'string' && data.seoImage.trim() !== '') {
      formData.append('seoImage', data.seoImage);
    }

    const response = await ssrSEOSettingsAPI.update(formData as any);
    if (response.status === 200 || response.status === 201) {
      // Handle array response - return first item or empty object
      const responseData = Array.isArray(response.data) ? response.data[0] : response.data;
      return { success: true, data: responseData };
    }
    return { success: false, error: 'Failed to update SEO settings' };
  } catch (error) {
    console.error('Update SEO settings error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to update SEO settings';
    return { success: false, error: errorMessage };
  }
}

// Delete SEO Image
export async function deleteSEOSettingsImageAction() {
  try {
    const response = await ssrSEOSettingsAPI.delete();
    if (response.status === 200 || response.status === 201) {
      // Handle array response - return first item or empty object
      const data = Array.isArray(response.data) ? response.data[0] : response.data;
      return { success: true, data };
    }
    return { success: false, error: 'Failed to delete SEO image' };
  } catch (error) {
    console.error('Delete SEO image error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete SEO image';
    return { success: false, error: errorMessage };
  }
}

// Upload Management Server Actions

// Upload File
export async function uploadSuperAdminFileAction(file: File) {
  try {
    const response = await ssrUploadAPI.uploadSuperAdminFile(file);
    if (response.status === 200 || response.status === 201) {
      const fileUrl = response.data?.data?.url || response.data?.url || response.data?.data || response.data;
      return { success: true, data: fileUrl };
    }
    return { success: false, error: 'Failed to upload file' };
  } catch (error) {
    console.error('Upload file error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to upload file';
    return { success: false, error: errorMessage };
  }
}

// Upload Admin File (uses /admin/upload with productImage parameter)
export async function uploadAdminFileAction(file: File) {
  try {
    const response = await ssrUploadAPI.uploadAdminFile(file);
    if (response.status === 200 || response.status === 201) {
      const fileUrl = response.data?.data?.url || response.data?.url || response.data?.data || response.data;
      return { success: true, data: fileUrl };
    }
    return { success: false, error: 'Failed to upload file' };
  } catch (error) {
    console.error('Upload file error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to upload file';
    return { success: false, error: errorMessage };
  }
}

// Advertisement Management Server Actions

// Create Advertisement
export async function createAdvertisementAction(data: {
  adName: string;
  selectType: "Video" | "Image";
  urlType: "Local" | "Url";
  placement: "Hero Section" | "Pricing" | "Home Page";
  position: "Left" | "Right" | "Center";
  redirectUrl: string;
  mediaContent?: {
    url: string;
  };
  startDate: string;
  endDate: string;
  status: boolean;
}) {
  try {
    const response = await ssrAdvertisementAPI.create(data);
    if (response.status === 200 || response.status === 201) {
      // Handle nested response structure: response.data.data contains the actual advertisement
      const advertisementData = response.data?.data || response.data;
      return { success: true, data: advertisementData };
    }
    return { success: false, error: response?.data?.message || 'Failed to create advertisement' };
  } catch (error) {
    console.error('Create advertisement error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to create advertisement';
    return { success: false, error: errorMessage };
  }
}

// Update Advertisement
export async function updateAdvertisementAction(id: string, data: {
  adName?: string;
  selectType?: "Video" | "Image";
  urlType?: "Local" | "Url";
  placement?: "Hero Section" | "Pricing" | "Home Page";
  position?: "Left" | "Right" | "Center";
  redirectUrl?: string;
  mediaContent?: {
    url: string;
  };
  startDate?: string;
  endDate?: string;
  status?: boolean;
}) {
  try {
    const response = await ssrAdvertisementAPI.update(id, data);
    if (response.status === 200 || response.status === 201) {
      // Handle nested response structure: response.data.data contains the actual advertisement
      const advertisementData = response.data?.data || response.data;
      return { success: true, data: advertisementData };
    }
    return { success: false, error: response?.data?.message || 'Failed to update advertisement' };
  } catch (error) {
    console.error('Update advertisement error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to update advertisement';
    return { success: false, error: errorMessage };
  }
}

// Delete Advertisement
export async function deleteAdvertisementAction(id: string) {
  try {
    const response = await ssrAdvertisementAPI.delete(id);
    if (response.status === 200 || response.status === 204) {
      return { success: true };
    }
    return { success: false, error: response?.data?.message || 'Failed to delete advertisement' };
  } catch (error) {
    console.error('Delete advertisement error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete advertisement';
    return { success: false, error: errorMessage };
  }

}

// Advertisement: bulk update status
export async function bulkUpdateAdvertisementsStatusAction(data: { ids: string[]; status: boolean }) {
  try {
    const response = await ssrAdvertisementAPI.bulkUpdateStatus(data as unknown as Record<string, unknown>);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: response.data?.message || 'Failed to update status for selected advertisements' };
  } catch (error) {
    console.error('Bulk update advertisements status error:', error);
    return { success: false, error: 'Failed to update status for selected advertisements' };
  }
}

// Advertisement: bulk delete
export async function bulkDeleteAdvertisementsAction(data: { ids: string[] }) {
  try {
    const response = await ssrAdvertisementAPI.bulkDelete(data as unknown as Record<string, unknown>);
    if (response.status === 200 || response.status === 204) {
      return { success: true };
    }
    return { success: false, error: response.data?.message || 'Failed to delete selected advertisements' };
  } catch (error) {
    console.error('Bulk delete advertisements error:', error);
    return { success: false, error: 'Failed to delete selected advertisements' };
  }
}

//HRM - Employee & Manager APIS
// Create Employee
export async function createEmployeeAction(data: any) {
  try {
    const isActive = data.status === 'Active';
    const store = data.storeId;

    // Check if we have an image
    const hasImage = data.image && (data.image instanceof File || typeof data.image === 'string');

    // 1. Prepare base payload (matching update action structure)
    const { image, ...rest } = data;
    const basePayload = {
      ...rest,
      store,
      isActive,
    };

    if (hasImage && typeof data.image === 'string' && (data.image.startsWith('http://') || data.image.startsWith('https://'))) {
      const payload = {
        ...basePayload,
        profilePicture: data.image,
      };
      const response = await ssrStaffHRMAPI.create(payload);
      if (response.status === 200 || response.status === 201) {
        return { success: true, data: response.data };
      }
      return { success: false, error: response.data.message || 'Failed to create employee', errorData: response };
    } else if (hasImage) {
      const formData = new FormData();
      // Append all base payload fields
      Object.entries(basePayload).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });

      // Handle the image specifically
      if (data.image instanceof File) {
        formData.append('profilePicture', data.image);
      } else if (typeof data.image === 'string' && data.image.startsWith('data:')) {
        try {
          const [header, base64Data] = data.image.split(',');
          const mimeType = header.match(/data:([^;]+)/)?.[1] || 'image/jpeg';
          const binaryString = atob(base64Data);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          const blob = new Blob([bytes], { type: mimeType });
          const file = new File([blob], 'profile-image.jpg', { type: mimeType });
          formData.append('profilePicture', file);
        } catch (error) {
          console.error('Error converting base64 to file:', error);
        }
      }

      const response = await ssrStaffHRMAPI.create(formData as any);
      if (response.status === 200 || response.status === 201) {
        return { success: true, data: response.data };
      }
      return { success: false, error: response.data.message || 'Failed to create employee', errorData: response };
    } else {
      const response = await ssrStaffHRMAPI.create(basePayload);
      if (response.status === 200 || response.status === 201) {
        return { success: true, data: response.data };
      }
      return { success: false, error: response.data.message || 'Failed to create employee', errorData: response };
    }
  } catch (error: any) {
    console.error('🚀 [createEmployeeAction] Fatal Error:', error);
    return { success: false, error: error.message || 'Failed to create employee' };
  }
}

// Update Employee
export async function updateEmployeeAction(id: string, data: any) {
  try {
    const isActive = data.status === 'Active';
    const store = data.storeId;

    // Check if we have an image
    const hasImage = data.image && (data.image instanceof File || typeof data.image === 'string');

    if (hasImage && typeof data.image === 'string' && (data.image.startsWith('http://') || data.image.startsWith('https://'))) {
      const { image, ...rest } = data;
      const payload = {
        ...rest,
        profilePicture: image,
        store,
        isActive,
      };
      const response = await ssrStaffHRMAPI.update(id, payload);
      if (response.status === 200 || response.status === 201) {
        return { success: true, data: response.data };
      }
      return { success: false, error: response.data.message || 'Failed to update employee', errorData: response };
    } else if (hasImage) {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('email', data.email);
      formData.append('phone', data.phone);
      formData.append('designation', data.designation);
      formData.append('store', store);
      formData.append('salary', String(data.salary));
      formData.append('joiningDate', data.joiningDate);
      formData.append('isActive', String(isActive));
      formData.append('gender', data.gender);
      if (data.password) formData.append('password', data.password);
      if (data.confirmPassword) formData.append('confirmPassword', data.confirmPassword);

      if (data.image instanceof File) {
        formData.append('profilePicture', data.image);
      } else if (typeof data.image === 'string' && data.image.startsWith('data:')) {
        try {
          const [header, base64Data] = data.image.split(',');
          const mimeType = header.match(/data:([^;]+)/)?.[1] || 'image/jpeg';
          const binaryString = atob(base64Data);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          const blob = new Blob([bytes], { type: mimeType });
          const file = new File([blob], 'profile-image.jpg', { type: mimeType });
          formData.append('profilePicture', file);
        } catch (error) {
          console.error('Error converting base64 to file:', error);
        }
      }

      const response = await ssrStaffHRMAPI.update(id, formData as any);
      if (response.status === 200 || response.status === 201) {
        return { success: true, data: response.data };
      }
      return { success: false, error: response.data.message || 'Failed to update employee' };
    } else {
      const { image, ...rest } = data;
      const payloadWithoutImage = {
        ...rest,
        store,
        isActive,
      };
      const response = await ssrStaffHRMAPI.update(id, payloadWithoutImage);
      if (response.status === 200 || response.status === 201) {
        return { success: true, data: response.data };
      }
      return { success: false, error: response.data.message || 'Failed to update employee', errorData: response };
    }
  } catch (error) {
    console.error('Update employee error:', error);
    return { success: false, error: 'Failed to update employee' };
  }
}

// Get Employee by ID (for editing with password data)
// export async function getEmployeeByIdAction(id: string) {
//   try {
//     const response = await ssrStaffHRMAPI.getById(id);
//     if (response.status === 200 || response.status === 201) {
//       return { success: true, data: response.data };
//     }
//     return { success: false, error: 'Failed to fetch employee' };
//   } catch (error) {
//     console.error('Get employee error:', error);
//     return { success: false, error: 'Failed to fetch employee' };
//   }
// }

// Delete Employee
export async function deleteEmployeeAction(id: string) {
  try {
    const response = await ssrStaffHRMAPI.deleteById(id);
    if (response.status === 200 || response.status === 204) {
      return { success: true };
    }
    return { success: false, error: 'Failed to delete employee' };
  } catch (error) {
    console.error('Delete employee error:', error);
    return { success: false, error: 'Failed to delete employee' };
  }
}

// Get Employee by ID
export async function getEmployeeByIdAction(id: string) {
  try {
    const response = await ssrStaffHRMAPI.getById(id);

    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: `Failed to get employee. Status: ${response.status}` };
  } catch (error) {
    console.error('Get employee by ID error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to get employee';
    return { success: false, error: errorMessage };
  }
}

// Toggle Employee Status
export async function toggleEmployeeStatusAction(id: string) {
  try {
    const getResponse = await ssrStaffHRMAPI.getById(id);

    if (getResponse.status !== 200) {
      return { success: false, error: `Failed to get employee data. Status: ${getResponse.status}` };
    }

    // The backend uses 'isActive' field (boolean) instead of 'status' field (string)
    const currentIsActive = getResponse.data?.isActive;
    const newIsActive = !currentIsActive; // Toggle the boolean value

    // Update the employee with the new isActive status
    const updateResponse = await ssrStaffHRMAPI.update(id, { isActive: newIsActive });

    if (updateResponse.status === 200 || updateResponse.status === 201) {
      return { success: true, data: updateResponse.data };
    }
    return { success: false, error: `Failed to toggle employee status. Status: ${updateResponse.status}` };
  } catch (error) {
    console.error('Toggle employee status error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to toggle employee status';
    return { success: false, error: errorMessage };
  }
}

// Update Employee Status (explicit next state)
export async function updateEmployeeStatusAction(id: string, isActive: boolean) {
  try {
    const response = await ssrStaffHRMAPI.update(id, { isActive });
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: `Failed to update employee status. Status: ${response.status}` };
  } catch (error) {
    console.error('Update employee status error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to update employee status';
    return { success: false, error: errorMessage };
  }
}

export async function getAllEmployeesAction() {
  try {
    const response = await ssrStaffHRMAPI.getAll();
    return { success: true, data: response.data };
  }
  catch (error) {
    console.error('Get all employees error:', error);
    return { success: false, error: 'Failed to get all employees' };
  }
}

// Bulk Delete Employees
export async function bulkDeleteEmployeesAction(payload: { ids: string[] }) {
  try {
    const response = await ssrStaffHRMAPI.bulkDelete(payload);
    if (response.status === 200 || response.status === 204) {
      return { success: true };
    }
    return { success: false, error: response.data.message || 'Failed to delete selected employees' };
  } catch (error: any) {
    console.error('Bulk delete employees error:', error);
    return { success: false, error: error.message || 'Failed to delete selected employees' };
  }
}

// Bulk Update Employees Status
export async function bulkUpdateEmployeesStatusAction(data: { ids: string[]; status: boolean }) {
  try {
    const response = await ssrStaffHRMAPI.bulkStatusUpdate(data as unknown as Record<string, unknown>);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to update status for selected employees' };
  } catch (error) {
    console.error('Bulk update employees status error:', error);
    return { success: false, error: 'Failed to update status for selected employees' };
  }
}

// Bulk Get Selected Employees (for PDF/CSV)
export async function bulkGetSelectedEmployeesAction(data: { ids: string[] }) {
  try {
    const response = await ssrStaffHRMAPI.bulkGetSelected(data);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to fetch selected employees' };
  } catch (error) {
    console.error('Bulk get selected employees error:', error);
    return { success: false, error: 'Failed to fetch selected employees' };
  }
}



// Bulk Get All Employees (for PDF/CSV)
export async function bulkGetEmployeesAction(filterData: SearchParamsTypes.DownloadSearchParams) {
  try {
    //  const response = await ssrStaffHRMAPI.getAll(1, 1000, filterData.search, filterData.storeId, filterData.isActive);
    const response = await ssrStaffHRMAPI.bulkAllDownload(filterData);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to fetch all employees' };
  } catch (error) {
    console.error('Bulk get employees error:', error);
    return { success: false, error: 'Failed to fetch all employees' };
  }
}


// Manager Actions
export async function createManagerAction(data: {
  name: string;
  email: string;
  phone: string;
  designation: string;
  store: string;
  salary: number;
  joiningDate: string;
  isActive: boolean;
}) {
  try {
    const response = await ssrHrmManagerAPI.create(data);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to create manager' };
  } catch (error) {
    console.error('Create manager error:', error);
    return { success: false, error: 'Failed to create manager' };
  }
}

export async function updateManagerAction(id: string, data: {
  name: string;
  email: string;
  phone: string;
  designation: string;
  store: string;
  salary: number;
  joiningDate: string;
  isActive: boolean;
}) {
  try {
    const response = await ssrHrmManagerAPI.update(id, data);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to update manager' };
  } catch (error: any) {
    console.error('Update manager error:', error);
    return { success: false, error: 'Failed to update manager' };
  }
}

export async function deleteManagerAction(id: string) {
  try {
    const response = await ssrHrmManagerAPI.delete(id);
    if (response.status === 200 || response.status === 204) {
      return { success: true };
    }
    return { success: false, error: 'Failed to delete manager' };
  } catch (error) {
    console.error('Delete manager error:', error);
    return { success: false, error: 'Failed to delete manager' };
  }
}

//getbyStore
export async function getByStoreAction(storeId: string) {
  try {
    const response = await ssrStaffHRMAPI.getByStore(storeId);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to get employee by store' };
  } catch (error) {
    console.error('Get employee by store error:', error);
    return { success: false, error: 'Failed to get employee by store' };
  }
}

//getByDesignation
export async function getByDesignationAction(designation: string) {
  try {
    // Fetch managers by designation (align with ManagerManagement usage)
    const response = await ssrHrmManagerAPI.getByDesignation(designation);
    if (response.status === 200 || response.status === 201) {
      // Normalize common API envelope shapes
      const payload: any = response.data;
      const data = payload?.data ?? payload ?? [];
      return { success: true, data };
    }
    return { success: false, error: 'Failed to get employee by designation' };
  } catch (error) {
    console.error('Get employee by designation error:', error);
    return { success: false, error: 'Failed to get employee by designation' };
  }
}

//getManagersForAllStores
export async function getManagersForAllStoresAction() {
  try {
    const response = await ssrStaffHRMAPI.getAll();
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to get managers for all stores' };
  } catch (error) {
    console.error('Get managers for all stores error:', error);
    return { success: false, error: 'Failed to get managers for all stores' };
  }
}

//checkManagerForStore
export async function checkManagerForStoreAction(storeId: string) {
  try {
    const response = await ssrStaffHRMAPI.checkManagerForStore(storeId);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to check manager for store' };
  } catch (error) {
    console.error('Check manager for store error:', error);
    return { success: false, error: 'Failed to check manager for store' };
  }
}

//Shift
export async function createShiftAction(data: AdminTypes.hrmTypes.shiftTypes.ShiftFormData) {
  try {
    const response = await ssrShiftAPI.create(data);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: response.data?.message || 'Failed to create shift' };
  } catch (error: any) {
    console.error('Create shift error:', error);
    if (error.response) {
      return { success: false, error: error.response.data?.message || 'Server error while creating shift' };
    } else if (error.request) {
      return { success: false, error: 'Network error. Please check your connection.' };
    }
    return { success: false, error: error.message || 'Failed to create shift' };
  }
}

export async function updateShiftAction(id: string, data: Partial<AdminTypes.hrmTypes.shiftTypes.ShiftFormData>) {
  try {
    const response = await ssrShiftAPI.update(id, data);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: response.data?.message || 'Failed to update shift' };
  } catch (error: any) {
    if (error.response) {
      return { success: false, error: error.response.data?.message || 'Server error while updating shift' };
    } else if (error.request) {
      return { success: false, error: 'Network error. Please check your connection.' };
    }
    return { success: false, error: error.message || 'Failed to update shift' };
  }

}

export async function deleteShiftAction(id: string) {
  try {
    const response = await ssrShiftAPI.delete(id);
    if (response.status === 200 || response.status === 204) {
      return { success: true };
    }
    return { success: false, error: response.data?.message || 'Failed to delete shift' };
  } catch (error: any) {
    if (error.response) {
      return { success: false, error: error.response.data?.message || 'Server error while deleting shift' };
    } else if (error.request) {
      return { success: false, error: 'Network error. Please check your connection.' };
    }
    console.error('Delete shift error:', error);
    return { success: false, error: error.message || 'Failed to delete shift' };
  }
}

export async function getShiftAll(params?: Record<string, any>) {
  try {
    const response = await ssrShiftAPI.getAll(params?.page, params?.limit, params?.search, params?.status);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: response.data?.message || 'Failed to get shift all' };
  } catch (error: any) {
    if (error.response) {
      return { success: false, error: error.response.data?.message || 'Server error while getting shift all' };
    } else if (error.request) {
      return { success: false, error: 'Network error. Please check your connection.' };
    }
    console.error('Get shift all error:', error);
    return { success: false, error: error.message || 'Failed to get shift all' };
  }
}

// Bulk Actions
export async function bulkUpdateShiftsStatusAction(data: { ids: string[]; status: boolean }) {
  try {
    const response = await ssrShiftAPI.bulkUpdateStatus(data as unknown as Record<string, unknown>);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: response.data?.message || 'Failed to update status for selected shifts' };
  } catch (error: any) {
    console.error('Bulk update shifts status error:', error);
    if (error.response) {
      return { success: false, error: error.response.data?.message || 'Server  error while update status' };
    } else if (error.request) {
      return { success: false, error: 'Network error. Please check your connection.' };
    }
    return { success: false, error: error.message || 'Failed to update status for selected shifts' };
  }
}


export async function bulkDeleteShiftsAction(payload: { ids: string[] }) {
  try {
    const response = await ssrShiftAPI.bulkDelete(payload);
    if (response.status === 200 || response.status === 204) {
      return { success: true };
    }
    return { success: false, error: response.data?.message || 'Failed to delete selected shifts' };
  } catch (error: any) {
    if (error.response) {
      return { success: false, error: error.response.data?.message || 'Server  error while deleted shift' };
    } else if (error.request) {
      return { success: false, error: 'Network error. Please check your connection.' };
    }
    return { success: false, error: error.message || 'Failed to delete for selected shifts' };
  }
}

export async function bulkGetSelectedShiftsAction(data: { ids: string[] }) {
  try {
    const response = await ssrShiftAPI.bulkGetSelected(data);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: response.data.message || 'Failed to fetch selected shifts' };
  } catch (error: any) {
    if (error.response) {
      return { success: false, error: error.response.data?.message || 'Server error while fetching selected shifts' };
    } else if (error.request) {
      return { success: false, error: 'Network error. Please check your connection.' };
    }
    console.error('Bulk get selected shifts error:', error);
    return { success: false, error: error.message || 'Failed to fetch selected shifts' };
  }
}

export async function bulkGetAllShiftsAction(filterData: SearchParamsTypes.DownloadSearchParams) {
  try {
    const response = await ssrShiftAPI.bulkAllDownload(filterData);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: response.data.message || 'Failed to fetch all shifts' };
  } catch (error: any) {
    if (error.response) {
      return { success: false, error: error.response.data?.message || 'Server error while fetching all shifts' };
    } else if (error.request) {
      return { success: false, error: 'Network error. Please check your connection.' };
    }
    console.error('Bulk get all shifts error:', error);
    return { success: false, error: error.message || 'Failed to fetch all shifts' };
  }
}


//Shift Assignment


//Shift Assignment
export async function getAllShiftAssignmentsAction() {
  try {
    const response = await ssrShiftAssignmentAPI.getAll();
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to get shift assignments' };
  } catch (error) {
    console.error('Get all shift assignments error:', error);
    return { success: false, error: 'Failed to get shift assignments' };
  }
}

export async function getShiftAssignmentByIdAction(id: string) {
  try {
    const response = await ssrShiftAssignmentAPI.getById(id);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to get shift assignment' };
  } catch (error) {
    console.error('Get shift assignment by ID error:', error);
    return { success: false, error: 'Failed to get shift assignment' };
  }
}

export async function getShiftAssignmentsByEmployeeAction(employeeId: string) {
  try {
    const response = await ssrShiftAssignmentAPI.getByEmployee(employeeId);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to get shift assignments by employee' };
  } catch (error) {
    console.error('Get shift assignments by employee error:', error);
    return { success: false, error: 'Failed to get shift assignments by employee' };
  }
}

export async function getShiftAssignmentsByDateAction(date: string) {
  try {
    const response = await ssrShiftAssignmentAPI.getByDate(date);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to get shift assignments by date' };
  } catch (error) {
    console.error('Get shift assignments by date error:', error);
    return { success: false, error: 'Failed to get shift assignments by date' };
  }
}


//Leave Type

export async function createLeaveTypeAction(data: {
  name: string;
  type: 'Paid' | 'Unpaid';
  paidCount?: number;
  description: string;
  status: boolean;
  businessId?: string;
}) {
  try {
    const response = await ssrLeaveTypeAPI.create(data);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to create leave type' };
  } catch (error) {
    console.error('Create leave type error:', error);
    return { success: false, error: 'Failed to create leave type' };
  }
}

//Get All
export async function getAllLeaveTypeAction() {
  try {
    const response = await ssrLeaveTypeAPI.getAll();
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
  } catch (error) {
    console.error('Get all leave type error:', error);
    return { success: false, error: 'Failed to get all leave type' };
  }
}

//Get By Id
export async function getByIdLeaveTypeAction(id: string) {
  try {
    const response = await ssrLeaveTypeAPI.getById(id);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
  } catch (error) {
    console.error('Get by id leave type error:', error);
    return { success: false, error: 'Failed to get by id leave type' };
  }
}

//Update
export async function updateLeaveTypeAction(id: string, data: {
  name: string;
  type: 'Paid' | 'Unpaid';
  paidCount: number;
  description: string;
  status: boolean;
  businessId?: string;
}) {
  try {
    const response = await ssrLeaveTypeAPI.update(id, data);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to update leave type' };
  } catch (error) {
    console.error('Update leave type error:', error);
    return { success: false, error: 'Failed to update leave type' };
  }
}

export async function toggleLeaveTypeStatusAction(id: string) {
  try {
    const response = await ssrLeaveTypeAPI.toggle(id);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to toggle leave type status' };
  } catch (error) {
    console.error('Toggle leave type status error:', error);
    return { success: false, error: 'Failed to toggle leave type status' };
  }
}

//Delete
export async function deleteLeaveTypeAction(id: string) {
  try {
    const response = await ssrLeaveTypeAPI.delete(id);
    if (response.status === 200 || response.status === 204) {
      return { success: true };
    }
    return { success: false, error: 'Failed to delete leave type' };
  } catch (error) {
    console.error('Delete leave type error:', error);
    return { success: false, error: 'Failed to delete leave type' };
  }
}

// Bulk update status
export async function bulkUpdateLeaveTypeStatusAction(data: { ids: string[]; status: boolean }) {
  try {
    const response = await ssrLeaveTypeAPI.bulkUpdateStatus(data);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
  } catch (error) {
    console.error('Bulk update leave type status error:', error);
    return { success: false, error: 'Failed to update leave types status' };
  }
}

// Bulk delete
export async function bulkDeleteLeaveTypeAction(data: { ids: string[] }) {
  try {
    const response = await ssrLeaveTypeAPI.bulkDelete(data);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
  } catch (error) {
    console.error('Bulk delete leave type error:', error);
    return { success: false, error: 'Failed to delete leave types' };
  }
}

//Toggle Status
export async function toggleShiftStatusAction(id: string) {
  try {
    const response = await ssrShiftAPI.toggle(id);
    return { success: true, data: response.data };
  }
  catch (error) {
    console.error('Toggle shift status error:', error);
    return { success: false, error: 'Failed to toggle shift status' };
  }
}

//Leave Management API

//Create Approved Leave
export async function createApprovedLeaveAction(data: {
  employeeId: string;
  storeId: string;
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  isHalfDay: boolean;
  isPaid: boolean;
  reason: string;
  status?: string;
}) {
  try {
    const response = await ssrLeaveManagementAPI.createApprovedLeave(data);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: response.data.message || 'Failed to create approved leave' };
  } catch (error) {
    console.error('Create approved leave error:', error);
    return { success: false, error: 'Failed to create approved leave' };
  }
}

//Get All Leave Requests
export async function getAllLeaveRequestsAction(params?: Record<string, unknown>) {
  try {
    const response = await ssrLeaveManagementAPI.getAllLeaveRequests();
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to get all leave requests' };
  } catch (error) {
    console.error('Get all leave requests error:', error);
    return { success: false, error: 'Failed to get all leave requests' };
  }
}

//Get All Active Leave Requests
export async function getAllActiveLeaveRequestsAction() {
  try {
    const response = await ssrLeaveManagementAPI.getAllActive();
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
  }
  catch (error) {
    console.error('Get all active leave requests error:', error);
    return { success: false, error: 'Failed to get all active leave requests' };
  }
}

//Get Leave Request by ID
export async function getLeaveRequestByIdAction(id: string) {
  try {
    const response = await ssrLeaveManagementAPI.getLeaveRequestById(id);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to get leave request by ID' };
  } catch (error) {
    console.error('Get leave request by ID error:', error);
    return { success: false, error: 'Failed to get leave request by ID' };
  }
}

//Approve Leave Request
export async function approveLeaveRequestAction(id: string, data?: Record<string, unknown>) {
  try {
    const response = await ssrLeaveManagementAPI.approveLeaveRequest(id, data);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to approve leave request' };
  } catch (error) {
    console.error('Approve leave request error:', error);
    return { success: false, error: 'Failed to approve leave request' };
  }
}

//Reject Leave Request
export async function rejectLeaveRequestAction(id: string, data?: Record<string, unknown>) {
  try {
    const response = await ssrLeaveManagementAPI.rejectLeaveRequest(id, data);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to reject leave request' };
  } catch (error) {
    console.error('Reject leave request error:', error);
    return { success: false, error: 'Failed to reject leave request' };
  }
}

//Get Pending Leave Requests for Store
export async function getPendingLeaveRequestsAction(storeId: string) {
  try {
    const response = await ssrLeaveManagementAPI.getPendingLeaveRequests(storeId);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to get pending leave requests' };
  } catch (error) {
    console.error('Get pending leave requests error:', error);
    return { success: false, error: 'Failed to get pending leave requests' };
  }
}

//Get Leave Statistics for Store
export async function getLeaveStatisticsAction(storeId: string) {
  try {
    const response = await ssrLeaveManagementAPI.getLeaveStatistics(storeId);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to get leave statistics' };
  } catch (error) {
    console.error('Get leave statistics error:', error);
    return { success: false, error: 'Failed to get leave statistics' };
  }
}

//Update Leave Request
export async function updateLeaveRequestAction(id: string, data: {
  employeeId?: string;
  storeId?: string;
  leaveTypeId?: string;
  startDate?: string;
  endDate?: string;
  isHalfDay?: boolean;
  isPaid?: boolean;
  reason?: string;
  status?: string;
}) {
  try {
    const response = await ssrLeaveManagementAPI.updateLeaveRequest(id, data);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: response.data.message || 'Failed to update leave request' };
  } catch (error) {
    console.error('Update leave request error:', error);
    return { success: false, error: 'Failed to update leave request' };
  }
}

//Cancel Leave Request
export async function cancelLeaveRequestAction(id: string, data?: Record<string, unknown>) {
  try {
    const response = await ssrLeaveManagementAPI.cancelLeaveRequest(id, data);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to cancel leave request' };
  } catch (error) {
    console.error('Cancel leave request error:', error);
    return { success: false, error: 'Failed to cancel leave request' };
  }
}

//Stock Adjustment

//Create
export async function createStockAdjustmentAction(data: Record<string, unknown>) {
  try {
    const response = await ssrStockAdjustmentAPI.create(data);
    if (response.status === 200 || response.status === 201) {
      const responseData = response.data;
      const payload = responseData?.data ?? responseData;
      return { success: true, data: payload };
    }
    return { success: false, error: response.data?.message || 'Failed to create stock adjustment' };
  } catch (error: any) {
    console.error('Create stock adjustment error:', error);
    if (error.response) {
      return { success: false, error: error.response.data?.message || 'Server error while creating stock adjustment' };
    } else if (error.request) {
      return { success: false, error: 'Network error. Please check your connection.' };
    }
    return { success: false, error: error.message || 'Failed to create stock adjustment' };
  }
}

//Get By id
export async function getByIdStockAdjustmentAction(id: string) {
  try {
    const response = await ssrStockAdjustmentAPI.getById(id);
    if (response.status === 200 || response.status === 201) {
      const responseData = response.data;
      const payload = responseData?.data ?? responseData;
      return { success: true, data: payload };
    }
    return { success: false, error: response.data?.message || 'Failed to get stock adjustment by id' };
  } catch (error: any) {
    console.error('Get stock adjustment by id error:', error);
    if (error.response) {
      return { success: false, error: error.response.data?.message || 'Server error while fetching stock adjustment' };
    } else if (error.request) {
      return { success: false, error: 'Network error. Please check your connection.' };
    }
    return { success: false, error: error.message || 'Failed to get stock adjustment by id' };
  }
}

//Update
export async function updateStockAdjustmentAction(id: string, data: Record<string, unknown>) {
  try {
    const response = await ssrStockAdjustmentAPI.update(id, data);
    if (response.status === 200 || response.status === 201) {
      const responseData = response.data;
      const payload = responseData?.data ?? responseData;
      return { success: true, data: payload };
    }
    return { success: false, error: response.data?.message || 'Failed to update stock adjustment' };
  } catch (error: any) {
    console.error('Update stock adjustment error:', error);
    if (error.response) {
      return { success: false, error: error.response.data?.message || 'Server error while updating stock adjustment' };
    } else if (error.request) {
      return { success: false, error: 'Network error. Please check your connection.' };
    }
    return { success: false, error: error.message || 'Failed to update stock adjustment' };
  }
}

//Delete
export async function deleteStockAdjustmentAction(id: string) {
  try {
    const response = await ssrStockAdjustmentAPI.delete(id);
    if (response.status === 200 || response.status === 204) {
      const responseData = response.data;
      const payload = responseData?.data ?? responseData;
      return { success: true, data: payload };
    }
    return { success: false, error: response.data?.message || 'Failed to delete stock adjustment' };
  } catch (error: any) {
    console.error('Delete stock adjustment error:', error);
    if (error.response) {
      return { success: false, error: error.response.data?.message || 'Server error while deleting stock adjustment' };
    } else if (error.request) {
      return { success: false, error: 'Network error. Please check your connection.' };
    }
    return { success: false, error: error.message || 'Failed to delete stock adjustment' };
  }
}

//Approve
export async function approveStockAdjustmentAction(id: string) {
  try {
    const response = await ssrStockAdjustmentAPI.approve(id);
    if (response.status === 200 || response.status === 201) {
      const responseData = response.data;
      const payload = responseData?.data ?? responseData;
      return { success: true, data: payload };
    }
    return { success: false, error: response.data?.message || 'Failed to approve stock adjustment' };
  } catch (error: any) {
    console.error('Approve stock adjustment error:', error);
    if (error.response) {
      return { success: false, error: error.response.data?.message || 'Server error while approving stock adjustment' };
    } else if (error.request) {
      return { success: false, error: 'Network error. Please check your connection.' };
    }
    return { success: false, error: error.message || 'Failed to approve stock adjustment' };
  }
}
export async function pendingStockAdjustmentAction(id: string) {
  try {
    const response = await ssrStockAdjustmentAPI.pending(id);
    if (response.status === 200 || response.status === 201) {
      const responseData = response.data;
      const payload = responseData?.data ?? responseData;
      return { success: true, data: payload };
    }
    return { success: false, error: response.data?.message || 'Failed to pending stock adjustment' };
  } catch (error: any) {
    console.error('pending stock adjustment error:', error);
    if (error.response) {
      return { success: false, error: error.response.data?.message || 'Server error while pending stock adjustment' };
    } else if (error.request) {
      return { success: false, error: 'Network error. Please check your connection.' };
    }
    return { success: false, error: error.message || 'Failed to pending stock adjustment' };
  }
}

//Reject
export async function cancelStockAdjustmentAction(id: string, reason: string) {
  try {
    const response = await ssrStockAdjustmentAPI.cancel(id, reason);
    if (response.status === 200 || response.status === 201) {
      return { success: true };
    }
    return { success: false, error: 'Failed to cancel stock adjustment', errordata: response };
  } catch (error) {
    return { success: false, error: 'Failed to cancel stock adjustment' };
  }
}

//Complete
export async function completeStockAdjustmentAction(id: string) {
  try {
    const response = await ssrStockAdjustmentAPI.complete(id);
    if (response.status === 200 || response.status === 201) {
      const responseData = response.data;
      const payload = responseData?.data ?? responseData;
      return { success: true, data: payload };
    }
    return { success: false, error: response.data?.message || 'Failed to complete stock adjustment' };
  } catch (error: any) {
    console.error('Complete stock adjustment error:', error);
    if (error.response) {
      return { success: false, error: error.response.data?.message || 'Server error while complete stock adjustment' };
    } else if (error.request) {
      return { success: false, error: 'Network error. Please check your connection.' };
    }
    return { success: false, error: error.message || 'Failed to complete stock adjustment' };
  }
}

//Bulk Approve
export async function bulkApproveStockAdjustmentAction(ids: string[]) {
  try {
    const response = await ssrStockAdjustmentAPI.bulkApprove(ids);
    if (response.status === 200 || response.status === 201) {
      return { success: true };
    }
    return { success: false, error: 'Failed to bulk approve stock adjustments' };
  } catch (error) {
    return { success: false, error: 'Failed to bulk approve stock adjustments' };
  }
}

//Bulk Complete
export async function bulkCompleteStockAdjustmentAction(ids: string[]) {
  try {
    const response = await ssrStockAdjustmentAPI.bulkComplete(ids);
    if (response.status === 200 || response.status === 201) {
      return { success: true };
    }
    return { success: false, error: 'Failed to bulk complete stock adjustments' };
  } catch (error) {
    return { success: false, error: 'Failed to bulk complete stock adjustments' };
  }
}

//Bulk Delete
export async function bulkDeleteStockAdjustmentAction(data: { ids: string[] }) {
  try {
    const response = await ssrStockAdjustmentAPI.bulkDelete(data);
    if (response.status === 200 || response.status === 201 || response.status === 204) {
      return { success: true, errorData: response, message: response.data?.message };
    }
    return { success: false, error: response.data?.message || 'Failed to bulk delete stock adjustments', errorData: response };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to bulk delete stock adjustments' };
  }
}


// bulk status updates
export async function bulkUpdateStockAdjustmentsStatusAction(data: { ids: string[]; status: string }) {
  try {
    const response = await ssrStockAdjustmentAPI.bulkUpdateStatus(data as unknown as Record<string, unknown>);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to update status for selected stock adjustment', errorData: response };
  } catch (error) {
    console.error('Bulk update stock adjustment status error:', error);
    return { success: false, error: 'Failed to update status for selected stock adjustment' };
  }
}
//Stats
export async function getStockAdjustmentStatsAction() {
  try {
    const response = await ssrStockAdjustmentAPI.getStats();
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to fetch stock adjustment stats' };
  } catch (error) {
    return { success: false, error: 'Failed to fetch stock adjustment stats' };
  }
}

//Pending
export async function getPendingStockAdjustmentAction() {
  try {
    const response = await ssrStockAdjustmentAPI.getPending();
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to fetch pending stock adjustments' };
  } catch (error) {
    return { success: false, error: 'Failed to fetch pending stock adjustments' };
  }
}

//Recent
export async function getRecentStockAdjustmentAction() {
  try {
    const response = await ssrStockAdjustmentAPI.getRecent();
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to fetch recent stock adjustments' };
  } catch (error) {
    return { success: false, error: 'Failed to fetch recent stock adjustments' };
  }
}

//Stock Transfer

//Create
export async function createStockTransferAction(data: Record<string, unknown>) {
  try {
    const response = await ssrStockTransferAPI.create(data);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to create stock transfer', errorData: response };
  } catch (error) {
    console.error('Create stock transfer error:', error);
    return { success: false, error: 'Failed to create stock transfer' };
  }
}

export async function cancelStockTransferAction(id: string, reason: string) {
  try {
    const response = await ssrStockTransferAPI.cancel(id, reason);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to cancel stock transfer' };
  } catch (error) {
    console.error('Cancel stock transfer error:', error);
    return { success: false, error: 'Failed to cancel stock transfer' };
  }
}
export async function pendingStockTransferAction(id: string) {
  try {
    const response = await ssrStockTransferAPI.pending(id);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to pending stock transfer' };
  } catch (error) {
    console.error('pending stock transfer error:', error);
    return { success: false, error: 'Failed pending stock transfer' };
  }
}
export async function approveStockTransferAction(id: string) {
  try {
    const response = await ssrStockTransferAPI.approve(id);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to approve stock transfer' };
  } catch (error) {
    console.error('Approve stock transfer error:', error);
    return { success: false, error: 'Failed to approve stock transfer' };
  }
}

export async function updateStockTransferStatusAction(id: string, status: string) {
  try {
    const response = await ssrStockTransferAPI.update(id, { status });
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };

    }
    return { success: false, error: 'Failed to update stock transfer status' };
  } catch (error) {
    console.error('Update stock transfer status error:', error);
    return { success: false, error: 'Failed to update stock transfer status' };
  }
}


//complete
export async function completeStockTransferAction(id: string) {
  try {
    const response = await ssrStockTransferAPI.complete(id);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to complete stock transfer' };
  } catch (error) {
    console.error('Complete stock transfer error:', error);
    return { success: false, error: 'Failed to complete stock transfer' };
  }
}

//Update
export async function updateStockTransferAction(id: string, data: Record<string, unknown>) {
  try {
    const response = await ssrStockTransferAPI.update(id, data);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to update stock transfer', errorData: response };
  } catch (error) {
    console.error('Update stock transfer error:', error);
    return { success: false, error: 'Failed to update stock transfer' };
  }
}
// bulk status updates
export async function bulkUpdateStockTransferStatusAction(data: { ids: string[]; status: string }) {
  try {
    const response = await ssrStockTransferAPI.bulkUpdateStatus(data as unknown as Record<string, unknown>);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to update status for selected stock transfer', errorData: response };
  } catch (error) {
    console.error('Bulk update stock transfer status error:', error);
    return { success: false, error: 'Failed to update status for selected stock transfer' };
  }
}

//Delete
export async function deleteStockTransferAction(id: string) {
  try {
    const response = await ssrStockTransferAPI.delete(id);
    if (response.status === 200 || response.status === 204) {
      return { success: true };
    }
    return { success: false, error: 'Failed to delete stock transfer', errorData: response };
  } catch (error) {
    console.error('Delete stock transfer error:', error);
    return { success: false, error: 'Failed to delete stock transfer' };
  }
}
// bulk delete stock tranfer
export async function bulkDeleteStockTransferAction(data: { ids: string[] }) {
  try {
    const response = await ssrStockTransferAPI.bulkDelete(data as unknown as Record<string, unknown>);
    if (response.status === 200 || response.status === 204) {
      const responseData = response.data;
      const payload = responseData?.data ?? responseData;
      return { success: true, data: payload, message: response.data?.message };
    }
    return { success: false, error: response.data?.message || 'Failed to delete stock transfer' };
  } catch (error: any) {
    console.error('Delete stock transfer error:', error);
    if (error.response) {
      return { success: false, error: error.response.data?.message || 'Server error while deleting stock transfer' };
    } else if (error.request) {
      return { success: false, error: 'Network error. Please check your connection.' };
    }
    return { success: false, error: error.message || 'Failed to delete stock transfer' };
  }
}
// 
export async function bulkGetStockTransferAction(filterData: SearchParamsTypes.DownloadSearchParams) {
  try {
    const response = await ssrStockTransferAPI.bulkAllDownload(filterData);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to get stock transfer' };
  } catch (error) {
    console.error('Bulk get stock transfer error:', error);
    return { success: false, error: 'Failed to get stock transfer' };
  }
}
export async function bulkGetSelectedStockTransferAction(data: { ids: string[] }) {
  try {
    const response = await ssrStockTransferAPI.bulkGetSelected(data);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data, res: response };
    }
    return { success: false, error: 'Failed to get selecetd stock transfer' };
  } catch (error) {
    console.error('Bulk get selecetd stock transfer error:', error);
    return { success: false, error: 'Failed to get selecetd stock transfer' };
  }
}

//Stock Adjustment
export async function bulkGetStockAdjustmentAction(filterData: SearchParamsTypes.DownloadSearchParams) {
  try {
    const response = await ssrStockAdjustmentAPI.bulkAllDownload(filterData);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to get stock adjustment' };
  } catch (error) {
    console.error('Bulk get stock adjustment error:', error);
    return { success: false, error: 'Failed to get stock adjustment' };
  }
}

export async function bulkGetSelectedStockAdjustmentAction(data: { ids: string[] }) {
  try {
    const response = await ssrStockAdjustmentAPI.bulkGetSelected(data);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data, res: response };
    }
    return { success: false, error: 'Failed to get selecetd stock adjustment' };
  } catch (error) {
    console.error('Bulk get selecetd stock adjustment error:', error);
    return { success: false, error: 'Failed to get selecetd stock adjustment' };
  }
}
export async function createAttendanceRecordAction(data: {
  employeeId: string;
  shiftId: string;
  shiftTypeId?: string;

  shiftAssignmentId?: string;
  attendanceDate: string; // ISO date for that day
  status: 'present' | 'absent' | 'leave' | 'no_show';
  businessId?: string;
  storeId: string;
  recordedBy?: string;
  notes?: string;
}) {

  try {
    const response = await ssrAttendanceAPI.createAttendanceRecord(data);

    // Check response status - only 200/201 are considered success
    if (response.status === 200 || response.status === 201) {
      const responseData = response.data;

      // Handle different response structures - check for errors first
      if (responseData?.success === false || responseData?.error) {
        const errorMessage = responseData.error || responseData.message || 'Failed to create attendance record';
        return { success: false, error: errorMessage };
      }

      // Check if response is empty or null (might indicate failure)
      if (!responseData || (typeof responseData === 'object' && Object.keys(responseData).length === 0)) {
        return { success: false, error: 'Server returned empty response. Attendance may not have been saved.' };
      }

      // Check if data exists in response
      const resultData = responseData?.data || responseData;
      if (!resultData || (typeof resultData === 'object' && !resultData.id && !resultData._id)) {
        // Still return success but log warning
      }

      // Success - return the data
      return { success: true, data: resultData };
    }

    // Non-success status codes
    const errorMessage = response.data?.error || response.data?.message || `Server returned status ${response.status}`;
    return { success: false, error: errorMessage };

  } catch (error: any) {
    // Handle different error types
    if (error.response) {
      // Server responded with error status
      const errorMessage = error.response.data?.error ||
        error.response.data?.message ||
        error.response.data?.data?.error ||
        error.response.data?.data?.message ||
        `Server error (${error.response.status})`;
      return { success: false, error: errorMessage };
    } else if (error.request) {
      // Network error
      return { success: false, error: 'Network error. Please check your connection.' };
    } else {
      // Other errors
      return { success: false, error: error.message || 'Failed to create attendance record' };
    }
  }
}

export async function getAttendanceByIdAction(id: string) {

  try {
    const response = await ssrAttendanceAPI.getAttendanceById(id);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Get attendance by ID error:', error);
    return { success: false, error: 'Failed to fetch attendance record' };
  }
}

export async function correctAttendanceAction(id: string, data: {
  clockInTime?: string;
  clockOutTime?: string;
  status?: 'Present' | 'Absent' | 'Late' | 'Half Day' | 'Leave';
  notes?: string;
  reason?: string;
}) {

  try {
    const response = await ssrAttendanceAPI.correctAttendance(id, data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Correct attendance error:', error);
    return { success: false, error: 'Failed to correct attendance record' };
  }
}

export async function clockInAction(shiftId: string, data: {
  employeeId: string;
  clockInTime?: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  notes?: string;
}) {

  try {
    const response = await ssrAttendanceAPI.clockIn(shiftId, data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Clock in error:', error);
    return { success: false, error: 'Failed to clock in' };
  }
}

export async function clockOutAction(shiftId: string, data: {
  employeeId: string;
  clockOutTime?: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  notes?: string;
}) {

  try {
    const response = await ssrAttendanceAPI.clockOut(shiftId, data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Clock out error:', error);
    return { success: false, error: 'Failed to clock out' };
  }
}

export async function addBreakAction(shiftId: string, data: {
  employeeId: string;
  breakStartTime: string;
  breakEndTime?: string;
  breakType?: 'Lunch' | 'Tea' | 'Personal' | 'Other';
  notes?: string;
}) {

  try {
    const response = await ssrAttendanceAPI.addBreak(shiftId, data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Add break error:', error);
    return { success: false, error: 'Failed to add break' };
  }
}

export async function markAsNoShowAction(shiftId: string, data: {
  employeeId: string;
  reason?: string;
  notes?: string;
}) {

  try {
    const response = await ssrAttendanceAPI.markAsNoShow(shiftId, data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Mark as no show error:', error);
    return { success: false, error: 'Failed to mark as no show' };
  }
}

export async function markAsLeaveAction(shiftId: string, data: {
  employeeId: string;
  leaveTypeId: string;
  reason?: string;
  notes?: string;
}) {

  try {
    const response = await ssrAttendanceAPI.markAsLeave(shiftId, data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Mark as leave error:', error);
    return { success: false, error: 'Failed to mark as leave' };
  }
}

export async function getAttendanceByEmployeeAction(employeeId: string) {
  try {
    const response = await ssrAttendanceAPI.getAttendanceByEmployee(employeeId);

    // Check if response contains an error even with 200 status
    if (response.data && typeof response.data === 'object') {
      // Check for error in response data
      if (response.data.status === 500 || response.data.error || (response.data.message && response.data.message.includes('Error'))) {
        console.error('Attendance API returned error:', response.data);
        return {
          success: false,
          error: response.data.message || response.data.error || 'Failed to fetch employee attendance',
          status: response.data.status || 500
        };
      }
    }

    // Check HTTP status code
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }

    return {
      success: false,
      error: 'Failed to fetch employee attendance',
      status: response.status
    };
  } catch (error: any) {
    console.error('Get attendance by employee error:', error);
    const errorMessage = error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      'Failed to fetch employee attendance';
    const statusCode = error?.response?.status || error?.status || 500;
    return {
      success: false,
      error: errorMessage,
      status: statusCode
    };
  }
}

export async function getAttendanceByStoreAndDateAction(storeId: string) {

  try {
    const response = await ssrAttendanceAPI.getAttendanceByStoreAndDate(storeId);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Get attendance by store error:', error);
    return { success: false, error: 'Failed to fetch store attendance' };
  }
}

export async function getNoShowsAction() {

  try {
    const response = await ssrAttendanceAPI.getNoShows();
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Get no shows error:', error);
    return { success: false, error: 'Failed to fetch no shows' };
  }
}

// ===== PAYROLL MANAGEMENT ACTIONS =====

// Create payroll record (POST to /admin/payroll)
export async function createPayrollAction(data?: Record<string, unknown>) {
  try {
    const response = await ssrPayrollAPI.create(data);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    // Extract error message from response
    const errorMessage = response.data?.message || response.data?.error || `Failed to create payroll (Status: ${response.status})`;
    return { success: false, error: errorMessage, status: response.status };
  } catch (error: any) {
    console.error('Create payroll error:', error);
    // Extract error message from caught error
    const errorMessage = error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      'Failed to create payroll';
    const statusCode = error?.response?.status || error?.status || 500;
    return { success: false, error: errorMessage, status: statusCode };
  }
}

// Generate payroll for a specific employee
export async function generatePayrollForEmployeeAction(employeeId: string, data?: Record<string, unknown>) {
  try {
    // Use the generate endpoint with employeeId in the URL parameter
    const response = await ssrPayrollAPI.generateForEmployee(employeeId, data);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    // Extract error message from response
    const errorMessage = response.data?.message || response.data?.error || `Failed to generate payroll (Status: ${response.status})`;
    return { success: false, error: errorMessage, status: response.status };
  } catch (error: any) {
    console.error('Generate payroll for employee error:', error);
    // Extract error message from caught error
    const errorMessage = error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      'Failed to generate payroll for employee';
    const statusCode = error?.response?.status || error?.status || 500;
    return { success: false, error: errorMessage, status: statusCode };
  }
}

// Generate payroll in bulk
export async function generatePayrollBulkAction(data?: Record<string, unknown>) {
  try {
    const response = await ssrPayrollAPI.generateBulk(data);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to generate payroll in bulk' };
  } catch (error) {
    console.error('Generate payroll bulk error:', error);
    return { success: false, error: 'Failed to generate payroll in bulk' };
  }
}

// Generate payroll for a store
export async function generatePayrollForStoreAction(storeId: string, data?: Record<string, unknown>) {
  try {
    const response = await ssrPayrollAPI.generateForStore(storeId, data);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to generate payroll for store' };
  } catch (error) {
    console.error('Generate payroll for store error:', error);
    return { success: false, error: 'Failed to generate payroll for store' };
  }
}

// Get all payroll records
export async function getAllPayrollsAction(params?: Record<string, unknown>) {
  try {
    const response = await ssrPayrollAPI.getAll(params);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to fetch payroll records' };
  } catch (error) {
    console.error('Get all payrolls error:', error);
    return { success: false, error: 'Failed to fetch payroll records' };
  }
}

// Get payroll by ID
export async function getPayrollByIdAction(id: string) {
  try {
    const response = await ssrPayrollAPI.getById(id);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to fetch payroll record' };
  } catch (error) {
    console.error('Get payroll by ID error:', error);
    return { success: false, error: 'Failed to fetch payroll record' };
  }
}

// Update payroll deduction
export async function updatePayrollDeductionAction(id: string, data: Record<string, unknown>) {
  try {
    const response = await ssrPayrollAPI.updateDeduction(id, data);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to update payroll deduction' };
  } catch (error) {
    console.error('Update payroll deduction error:', error);
    return { success: false, error: 'Failed to update payroll deduction' };
  }
}

// Delete payroll
export async function deletePayrollAction(id: string) {
  try {
    const response = await ssrPayrollAPI.delete(id);
    if (response.status === 200 || response.status === 204) {
      return { success: true };
    }
    return { success: false, error: 'Failed to delete payroll record' };
  } catch (error) {
    console.error('Delete payroll error:', error);
    return { success: false, error: 'Failed to delete payroll record' };
  }
}

// Bulk delete payroll
export async function bulkDeletePayrollAction(data: { ids: string[] }) {
  try {
    const response = await ssrPayrollAPI.bulkDelete(data as unknown as Record<string, unknown>);
    if (response.status === 200 || response.status === 204) {
      return { success: true };
    }
    return { success: false, error: 'Failed to delete selected payroll records' };
  } catch (error) {
    console.error('Bulk delete payroll error:', error);
    return { success: false, error: 'Failed to delete selected payroll records' };
  }
}

// Get payroll summary for a month
export async function getPayrollSummaryAction(month: string) {
  try {
    const response = await ssrPayrollAPI.getSummary(month);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to fetch payroll summary' };
  } catch (error) {
    console.error('Get payroll summary error:', error);
    return { success: false, error: 'Failed to fetch payroll summary' };
  }
}

// ===== HOLIDAY MANAGEMENT ACTIONS =====

export async function createHolidayAction(data: {
  name: string;
  startDate: string;
  endDate: string;
  description?: string;
  isRecurring?: boolean;
  status: boolean;
}) {
  try {
    const response = await ssrHolidayAPI.create(data);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to create holiday' };
  } catch (error) {
    console.error('Create holiday error:', error);
    return { success: false, error: 'Failed to create holiday' };
  }
}

export async function getAllHolidaysAction() {
  try {
    const response = await ssrHolidayAPI.getAll();
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to fetch holidays' };
  } catch (error) {
    console.error('Get all holidays error:', error);
    return { success: false, error: 'Failed to fetch holidays' };
  }
}

export async function getHolidayByIdAction(id: string) {
  'use server';
  try {
    const response = await ssrHolidayAPI.getById(id);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to fetch holiday' };
  } catch (error) {
    console.error('Get holiday by ID error:', error);
    return { success: false, error: 'Failed to fetch holiday' };
  }
}

export async function updateHolidayAction(id: string, data: {
  name?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
  isRecurring?: boolean;
  status?: boolean;
}) {

  try {
    const response = await ssrHolidayAPI.update(id, data);

    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to update holiday' };
  } catch (error) {
    console.error('Update holiday error:', error);
    return { success: false, error: 'Failed to update holiday' };
  }
}

export async function deleteHolidayAction(id: string) {

  try {
    const response = await ssrHolidayAPI.delete(id);
    if (response.status === 200 || response.status === 204) {
      return { success: true };
    }
    return { success: false, error: 'Failed to delete holiday' };
  } catch (error) {
    console.error('Delete holiday error:', error);
    return { success: false, error: 'Failed to delete holiday' };
  }
}

export async function getActiveHolidaysAction() {

  try {
    const response = await ssrHolidayAPI.getActive();
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to fetch active holidays' };
  } catch (error) {
    console.error('Get active holidays error:', error);
    return { success: false, error: 'Failed to fetch active holidays' };
  }
}

export async function toggleHolidayStatusAction(id: string) {

  try {
    const response = await ssrHolidayAPI.toggle(id);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to toggle holiday status' };
  } catch (error) {
    console.error('Toggle holiday status error:', error);
    return { success: false, error: 'Failed to toggle holiday status' };
  }
}

// Expense Category Actions
export async function createExpenseCategoryAction(data: {
  name: string;
  description?: string;
  status: boolean;
}) {
  try {
    const response = await ssrExpenseCategoryAPI.create(data);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to create expense category' };
  } catch (error) {
    console.error('Create expense category error:', error);
    return { success: false, error: 'Failed to create expense category' };
  }
}

export async function getActiveExpenseCategoriesAction() {
  try {
    const response = await ssrExpenseCategoryAPI.getActive();

    if (response.status === 200) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to fetch active expense categories' };
  } catch (error) {
    console.error('Get active expense categories error:', error);
    return { success: false, error: 'Failed to fetch active expense categories' };
  }
}

export async function getExpenseCategoryByIdAction(id: string) {
  try {
    const response = await ssrExpenseCategoryAPI.getById(id);
    if (response.status === 200) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to fetch expense category' };
  } catch (error) {
    console.error('Get expense category error:', error);
    return { success: false, error: 'Failed to fetch expense category' };
  }
}

export async function updateExpenseCategoryAction(id: string, data: {
  name?: string;
  description?: string;
  status?: boolean;
}) {
  try {
    const response = await ssrExpenseCategoryAPI.update(id, data);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to update expense category' };
  } catch (error) {
    console.error('Update expense category error:', error);
    return { success: false, error: 'Failed to update expense category' };
  }
}

export async function deleteExpenseCategoryAction(id: string) {
  try {
    const response = await ssrExpenseCategoryAPI.delete(id);
    if (response.status === 200 || response.status === 204) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to delete expense category' };
  } catch (error) {
    console.error('Delete expense category error:', error);
    return { success: false, error: 'Failed to delete expense category' };
  }
}

export async function toggleExpenseCategoryStatusAction(id: string) {
  try {
    const response = await ssrExpenseCategoryAPI.toggle(id);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to toggle expense category status' };
  } catch (error) {
    console.error('Toggle expense category status error:', error);
    return { success: false, error: 'Failed to toggle expense category status' };
  }
}

// Expense Category Bulk Actions
export async function bulkUpdateExpenseCategoriesStatusAction(data: { ids: string[]; status: boolean }) {
  try {
    const response = await ssrExpenseCategoryAPI.bulkUpdateStatus(data);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to bulk update expense category status' };
  } catch (error) {
    console.error('Bulk update expense category status error:', error);
    return { success: false, error: 'Failed to bulk update expense category status' };
  }
}

export async function bulkDeleteExpenseCategoriesAction(data: { ids: string[] }) {
  try {
    const response = await ssrExpenseCategoryAPI.bulkDelete(data);
    if (response.status === 200 || response.status === 201 || response.status === 204) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to bulk delete expense categories' };
  } catch (error) {
    console.error('Bulk delete expense categories error:', error);
    return { success: false, error: 'Failed to bulk delete expense categories' };
  }
}

export async function bulkGetExpenseCategoryAction(filterData: SearchParamsTypes.DownloadSearchParams) {
  try {
    const response = await ssrExpenseCategoryAPI.bulkAllDownload(filterData);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to download expense categories' };
  } catch (error) {
    console.error('Bulk download expense categories error:', error);
    return { success: false, error: 'Failed to download expense categories' };
  }
}

export async function bulkGetSelectedExpenseCategoryAction(data: { ids: string[] }) {
  try {
    const response = await ssrExpenseCategoryAPI.bulkGetSelected(data);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to get selected expense categories' };
  } catch (error) {
    console.error('Bulk get selected expense categories error:', error);
    return { success: false, error: 'Failed to get selected expense categories' };
  }
}

// Expense Actions
export async function getAllExpensesAction() {
  try {
    const response = await ssrExpenseAPI.getAll();
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to fetch expenses' };
  } catch (error) {
    console.error('Get all expenses error:', error);
    return { success: false, error: 'Failed to fetch expenses' };
  }
}

export async function getExpenseByIdAction(id: string) {
  try {
    const response = await ssrExpenseAPI.getById(id);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to fetch expense' };
  } catch (error) {
    console.error('Get expense by id error:', error);
    return { success: false, error: 'Failed to fetch expense' };
  }
}

export async function createExpenseAction(data: Record<string, unknown>) {
  try {
    const response = await ssrExpenseAPI.create(data);
    if (response.status === 200 || response.status === 201) {
      const responseData = response.data;
      const payload = responseData?.data ?? responseData;
      return { success: true, data: payload };
    }
    return { success: false, error: response.data?.message || 'Failed to create expense' };
  } catch (error: any) {
    if (error.response) {
      return { success: false, error: error.response.data?.message || 'Server error while creating expense' };
    } else if (error.request) {
      return { success: false, error: 'Network error. Please check your connection.' };
    }
    return { success: false, error: error.message || 'Failed to create expense' };
  }
}

export async function updateExpenseAction(id: string, data: Record<string, unknown>) {
  try {
    const response = await ssrExpenseAPI.update(id, data);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to update expense' };
  } catch (error) {
    console.error('Update expense error:', error);
    return { success: false, error: 'Failed to update expense' };
  }
}


export async function approveExpenseAction(id: string) {
  try {
    const response = await ssrExpenseAPI.approve(id);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to approve expense' };
  } catch (error) {
    console.error('Approve expense error:', error);
    return { success: false, error: 'Failed to approve expense' };
  }
}
export async function rejectExpenseAction(id: string, reason: string) {
  try {
    const response = await ssrExpenseAPI.reject(id, reason);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to reject expense' };
  } catch (error) {
    console.error('Reject expense error:', error);
    return { success: false, error: 'Failed to reject expense' };
  }
}



export async function deleteExpenseAction(id: string) {
  try {
    const response = await ssrExpenseAPI.delete(id);
    if (response.status === 200 || response.status === 204) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to delete expense' };
  } catch (error) {
    console.error('Delete expense error:', error);
    return { success: false, error: 'Failed to delete expense' };
  }
}

export async function bulkUpdateExpensesStatusAction(data: { ids: string[]; status: string }) {
  try {
    const response = await ssrExpenseAPI.bulkUpdateStatus(data as unknown as Record<string, unknown>);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to update status for selected expenses', errorData: response };
  } catch (error) {
    console.error('Bulk update expenses status error:', error);
    return { success: false, error: 'Failed to update status for selected expenses' };
  }
}

export async function bulkDeleteExpensesAction(data: { ids: string[] }) {
  try {
    const response = await ssrExpenseAPI.bulkDelete(data);
    if (response.status === 200 || response.status === 201 || response.status === 204) {
      return { success: true, errorData: response, message: response.data?.message };
    }
    return { success: false, error: response.data?.message || 'Failed to bulk delete expenses', errorData: response };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to bulk delete delete expenses' };
  }

}

export async function bulkGetExpensesAction(filterData: Record<string, unknown>) {
  try {
    const response = await ssrExpenseAPI.bulkAllDownload(filterData);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to fetch expenses for export' };
  } catch (error) {
    console.error('Bulk get expenses error:', error);
    return { success: false, error: 'Failed to fetch expenses for export' };
  }
}

export async function bulkGetSelectedExpensesAction(data: { ids: string[] }) {
  try {
    const response = await ssrExpenseAPI.bulkGetSelected(data);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to fetch selected expenses' };
  } catch (error) {
    console.error('Bulk get selected expenses error:', error);
    return { success: false, error: 'Failed to fetch selected expenses' };
  }
}

// Product Actions
export async function createProductAction(data: AdminTypes.InventoryTypes.ProductTypes.ProductFormData) {
  try {
    const hasFileUpload = data.productImage instanceof File;

    if (hasFileUpload) {
      // Use FormData for file uploads
      const formData = new FormData();
      formData.append('productName', data.productName);
      formData.append('description', data.description);
      formData.append('category', data.category);
      formData.append('subCategory', data.subCategory);
      formData.append('brand', data.brand);
      formData.append('unit', JSON.stringify(data.unit));
      formData.append('dimensions', data.dimensions);
      if (data.barcode) formData.append('barcode', data.barcode as any);
      if (data.expiryDate) formData.append('expiryDate', data.expiryDate);
      if (Array.isArray(data.tax)) {
        data.tax.forEach((t) => formData.append('tax', t));
      }
      formData.append('warrantyType', data.warrantyType);
      formData.append('warrantyDate', data.warrantyDate);
      formData.append('productSKU', data.productSKU);
      formData.append('status', String(data.status));
      if (data.lowStockAlert !== undefined) {
        formData.append('lowStockAlert', String(data.lowStockAlert));
      }
      // formData.append('productSKU', data.productSKU);

      // Add stock array only if no variations
      if (!data.hasVariation && Array.isArray(data.stock)) {
        data.stock.forEach((stockItem: any, idx: number) => {
          formData.append(`stock[${idx}][storeId]`, stockItem.storeId);
          formData.append(`stock[${idx}][quantity]`, String(stockItem.quantity));
        });
      }

      // Variations
      if (typeof data.hasVariation === 'boolean') {
        formData.append('hasVariation', String(data.hasVariation));
      }

      if (data.hasVariation && Array.isArray(data.variantData)) {
        // Send variantIds array - always send it when hasVariation is true
        // Backend requires it to be non-empty, so send it even if empty for proper validation
        const variantIdsToSend = data.variantIds && data.variantIds.length > 0 ? data.variantIds : [];
        variantIdsToSend.forEach((id: string, idx: number) => {
          formData.append(`variantIds[${idx}]`, id);
        });

        // Send variantData array
        data.variantData.forEach((v: any, idx: number) => {
          // Send variantValues
          v.variantValues.forEach((vv: any, vvIdx: number) => {
            formData.append(`variantData[${idx}][variantValues][${vvIdx}][value]`, vv.value);
            formData.append(`variantData[${idx}][variantValues][${vvIdx}][valueId]`, vv.valueId);
          });

          formData.append(`variantData[${idx}][variantId]`, v.variantId || "");
          formData.append(`variantData[${idx}][SKU]`, v.SKU);
          formData.append(`variantData[${idx}][status]`, String(v.status));
          formData.append(`variantData[${idx}][costPrice]`, String(v.costPrice));
          formData.append(`variantData[${idx}][sellingPrice]`, String(v.sellingPrice));
          if (v.lowStockAlert !== undefined) {
            formData.append(`variantData[${idx}][lowStockAlert]`, String(v.lowStockAlert));
          }
          if (v.tax !== undefined) {
            formData.append(`variantData[${idx}][tax]`, v.tax as any);
          }

          // Handle variant image
          if (v.image instanceof File) {
            formData.append(`variantData[${idx}][variantImage]`, v.image);
          } else if (v.image !== undefined && v.image !== null) {
            formData.append(`variantData[${idx}][variantImage]`, v.image as string);
          }
        });

        if (data.variantStocks && data.variantStocks.length > 0) {
          data.variantStocks.forEach((vs: any, idx: number) => {
            formData.append(`variantStocks[${idx}][SKU]`, vs.SKU);
            formData.append(`variantStocks[${idx}][storeId]`, vs.storeId);
            formData.append(`variantStocks[${idx}][quantity]`, String(vs.quantity));
          });
        }
      } else {
        // For products without variations, send the individual product fields
        formData.append('costPrice', String(data.productCostPrice));
        formData.append('sellingPrice', String(data.productSellingPrice));
        formData.append('discount', String(data.productDiscount));
      }

      // Image
      if (data.productImage instanceof File) {
        formData.append('productImage', data.productImage);
      } else if (data.productImage !== undefined) {
        formData.append('productImage', data.productImage as string);
      }
      const response = await ssrProductAPI.create(formData as any);
      if (response.status === 200 || response.status === 201) {
        return { success: true, data: response.data };
      }
      return { success: false, error: 'Failed to create product' };
    } else {
      // Use JSON for non-file uploads
      const jsonData: any = {
        productName: data.productName,
        description: data.description,
        category: data.category,
        subCategory: data.subCategory,
        brand: data.brand,
        unit: data.unit,
        dimensions: data.dimensions,
        ...(data.barcode ? { barcode: data.barcode } : {}),
        expiryDate: data.expiryDate,
        tax: data.tax,
        warrantyType: data.warrantyType,
        warrantyDate: data.warrantyDate,
        status: data.status,
        hasVariation: data.hasVariation,
        productImage: data.productImage,
        productSKU: data.productSKU,
        ...(data.lowStockAlert !== undefined ? { lowStockAlert: data.lowStockAlert } : {})
      };

      if (data.hasVariation && Array.isArray(data.variantData)) {
        // Send variantIds array - always send it when hasVariation is true
        // Backend requires it to be non-empty, so send it even if empty for proper validation
        jsonData.variantIds = data.variantIds && data.variantIds.length > 0 ? data.variantIds : [];

        // Send variantData array
        jsonData.variantData = data.variantData.map((v: any) => ({
          variantId: v.variantId || "",
          variantValues: v.variantValues,
          SKU: v.SKU,
          status: v.status,
          costPrice: v.costPrice,
          sellingPrice: v.sellingPrice,
          lowStockAlert: v.lowStockAlert,
          tax: v.tax,
          image: v.image && typeof v.image === 'string' ? v.image : null,
          discount: v.discount
        }));

        if (data.variantStocks && data.variantStocks.length > 0) {
          jsonData.variantStocks = data.variantStocks;
        }
      } else {
        // For products without variations
        jsonData.costPrice = data.productCostPrice;
        jsonData.sellingPrice = data.productSellingPrice;
        jsonData.stock = data.stock;
        jsonData.discount = data.productDiscount;
      }

      const response = await ssrProductAPI.create(jsonData);
      if (response.status === 200 || response.status === 201) {
        return { success: true, data: response.data };
      }
      return { success: false, error: 'Failed to create product', errorData: response };
    }
  } catch (error) {
    console.error('Create product error:', error);
    return { success: false, error: 'Failed to create product' };
  }
}

export async function updateProductAction(id: string, data: AdminTypes.InventoryTypes.ProductTypes.ProductFormData) {
  try {
    const hasFileUpload = data.productImage instanceof File;

    if (hasFileUpload) {
      // Use FormData for file uploads
      const formData = new FormData();
      formData.append('productName', data.productName);
      formData.append('description', data.description);
      formData.append('category', data.category);
      formData.append('subCategory', data.subCategory);
      formData.append('brand', data.brand);
      formData.append('unit', JSON.stringify(data.unit));
      formData.append('dimensions', data.dimensions);
      if (data.barcode) formData.append('barcode', data.barcode as any);
      if (data.expiryDate) formData.append('expiryDate', data.expiryDate);
      if (Array.isArray(data.tax)) {
        data.tax.forEach((t) => formData.append('tax', t));
      }
      formData.append('warrantyType', data.warrantyType);
      formData.append('warrantyDate', data.warrantyDate);
      formData.append('productSKU', data.productSKU);
      formData.append('status', String(data.status));
      if (data.lowStockAlert !== undefined) {
        formData.append('lowStockAlert', String(data.lowStockAlert));
      }

      // Variations
      if (typeof data.hasVariation === 'boolean') {
        formData.append('hasVariation', String(data.hasVariation));
      }


      if (data.hasVariation && Array.isArray(data.variantData)) {
        // Send variantIds array - always send it when hasVariation is true
        // Backend requires it to be non-empty, so send it even if empty for proper validation
        const variantIdsToSend = data.variantIds && data.variantIds.length > 0 ? data.variantIds : [];
        variantIdsToSend.forEach((id: string, idx: number) => {
          formData.append(`variantIds[${idx}]`, id);
        });

        // Send variantData array
        data.variantData.forEach((v: any, idx: number) => {
          // Send variantValues
          v.variantValues.forEach((vv: any, vvIdx: number) => {
            formData.append(`variantData[${idx}][variantValues][${vvIdx}][value]`, vv.value);
            formData.append(`variantData[${idx}][variantValues][${vvIdx}][valueId]`, vv.valueId);
          });

          formData.append(`variantData[${idx}][variantId]`, v.variantId || "");
          if (v._id) {
            formData.append(`variantData[${idx}][_id]`, v._id);
          }

          formData.append(`variantData[${idx}][SKU]`, v.SKU);
          formData.append(`variantData[${idx}][status]`, String(v.status));
          formData.append(`variantData[${idx}][costPrice]`, String(v.costPrice));
          formData.append(`variantData[${idx}][sellingPrice]`, String(v.sellingPrice));
          if (v.lowStockAlert !== undefined) {
            formData.append(`variantData[${idx}][lowStockAlert]`, String(v.lowStockAlert));
          }
          if (v.tax !== undefined) {
            formData.append(`variantData[${idx}][tax]`, v.tax as any);
          }
          if (v.discount !== undefined) {
            formData.append(`variantData[${idx}][discount]`, String(v.discount));
          }

          // Handle variant image
          if (v.image instanceof File) {
            formData.append(`variantData[${idx}][variantImage]`, v.image);
          } else if (v.image !== undefined && v.image !== null) {
            formData.append(`variantData[${idx}][variantImage]`, v.image as string);
          }
        });


        // Send variantStocks array
        if (data.variantStocks && data.variantStocks.length > 0) {
          data.variantStocks.forEach((vs: any, idx: number) => {
            formData.append(`variantStocks[${idx}][SKU]`, vs.SKU);
            formData.append(`variantStocks[${idx}][storeId]`, vs.storeId);
            formData.append(`variantStocks[${idx}][quantity]`, String(vs.quantity));
          });
        }
      } else {
        // For products without variations, send the individual product fields
        formData.append('costPrice', String(data.productCostPrice));
        formData.append('sellingPrice', String(data.productSellingPrice));
        formData.append('discount', String(data.productDiscount));
      }

      // Main image
      if (data.productImage instanceof File) {
        formData.append('productImage', data.productImage);
      } else if (data.productImage !== undefined) {
        formData.append('productImage', data.productImage as string);
      }

      const response = await ssrProductAPI.update(id, formData as any);
      if (response.status === 200 || response.status === 201) {
        return { success: true, data: response.data };
      }
      return { success: false, error: response.data?.message || 'Failed to update product', errorData: response };
    } else {
      // Use JSON for non-file uploads
      const jsonData: any = {
        productName: data.productName,
        description: data.description,
        category: data.category,
        subCategory: data.subCategory,
        brand: data.brand,
        unit: data.unit,
        dimensions: data.dimensions,
        ...(data.barcode ? { barcode: data.barcode } : {}),
        expiryDate: data.expiryDate,
        tax: data.tax,
        warrantyType: data.warrantyType,
        warrantyDate: data.warrantyDate,
        status: data.status,
        hasVariation: data.hasVariation,
        productImage: data.productImage,
        productSKU: data.productSKU,
        ...(data.lowStockAlert !== undefined ? { lowStockAlert: data.lowStockAlert } : {})
      };

      if (data.hasVariation && Array.isArray(data.variantData)) {
        // Send variantIds array - always send it when hasVariation is true
        // Backend requires it to be non-empty, so send it even if empty for proper validation
        jsonData.variantIds = data.variantIds && data.variantIds.length > 0 ? data.variantIds : [];

        if (Array.isArray(data.variantData)) {
          jsonData.variantData = data.variantData.map((v: any) => ({
            _id: v._id || undefined,
            variantId: v.variantId || "",
            variantValues: v.variantValues,
            SKU: v.SKU,
            status: v.status,
            costPrice: v.costPrice,
            sellingPrice: v.sellingPrice,
            lowStockAlert: v.lowStockAlert,
            tax: v.tax,
            image: v.image && typeof v.image === 'string' ? v.image : null, // Use 'image' to match createProductAction
            discount: v.discount
          }));
        }


        if (data.variantStocks && data.variantStocks.length > 0) {
          jsonData.variantStocks = data.variantStocks;
        }
      } else {
        // For products without variations
        jsonData.costPrice = data.productCostPrice;
        jsonData.sellingPrice = data.productSellingPrice;
        jsonData.stock = data.stock;
        jsonData.discount = data.productDiscount;
      }

      const response = await ssrProductAPI.update(id, jsonData);
      if (response.status === 200 || response.status === 201) {
        return { success: true, data: response.data };
      }
      return { success: false, error: response.data?.message || 'Failed to update product' };
    }
  } catch (error) {
    console.error('Update product error:', error);
    return { success: false, error: 'Failed to update product' };
  }
}

export async function deleteProductAction(id: string) {
  try {
    const response = await ssrProductAPI.delete(id);
    if (response.status === 200 || response.status === 204) {
      return { success: true };
    }
    return { success: false, error: 'Failed to delete product' };
  } catch (error) {
    console.error('Delete product error:', error);
    return { success: false, error: 'Failed to delete product' };
  }
}

export async function bulkDeleteProductsAction(data: { ids: string[] }) {
  try {
    const response = await ssrProductAPI.bulkDelete(data);
    if (response.status === 200 || response.status === 204) {
      return { success: true };
    }
    return { success: false, error: response.data?.message || 'Failed to delete products' };
  } catch (error) {
    console.error('Bulk delete products error:', error);
    return { success: false, error: 'Failed to delete products' };
  }
}

export async function bulkUpdateProductsStatusAction(data: { ids: string[]; status: boolean }) {
  try {
    const response = await ssrProductAPI.bulkUpdateStatus(data);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to update products status' };
  } catch (error) {
    console.error('Bulk update products status error:', error);
    return { success: false, error: 'Failed to update products status' };
  }
}

export async function bulkGetProductAction(filterData: SearchParamsTypes.DownloadSearchParams) {
  try {
    const response = await ssrProductAPI.bulkAllDownload(filterData);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to fetch products for export' };
  } catch (error) {
    console.error('Bulk get products error:', error);
    return { success: false, error: 'Failed to fetch products for export' };
  }
}

export async function bulkGetSelectedProductAction(data: { ids: string[] }) {
  try {
    const response = await ssrProductAPI.bulkGetSelected(data);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to fetch selected products' };
  } catch (error) {
    console.error('Bulk get selected products error:', error);
    return { success: false, error: 'Failed to fetch selected products' };
  }
}



// Update Product Barcode Action
export async function updateProductBarcodeAction(id: string, barcode: string, barcodeImageFile?: File) {
  try {
    // For now, just send the barcode value without the image file
    // The backend should handle generating the barcode URL
    const barcodeData: Partial<AdminTypes.InventoryTypes.ProductTypes.ProductFormData> = {
      barcode: barcode
    };

    // Use the existing updateProductAction
    return await updateProductAction(id, barcodeData as AdminTypes.InventoryTypes.ProductTypes.ProductFormData);
  } catch (error) {
    console.error('Update product barcode error:', error);
    return { success: false, error: 'Failed to update product barcode' };
  }
}

export async function getProductByBarcodeAction(barcode: string) {
  try {
    const response = await ssrProductAPI.getByBarcode(barcode);
    if (response.status === 200) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Product not found' };
  } catch (error) {
    console.error('Get product by barcode error:', error);
    return { success: false, error: 'Failed to fetch product by barcode' };
  }
}

// Get Active Product by Barcode
export async function getActiveProductByBarcodeAction(barcode: string) {
  try {
    const response = await ssrProductAPI.getActiveByBarcode(barcode);
    if (response.status === 200) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Active product not found' };
  } catch (error) {
    console.error('Get active product by barcode error:', error);
    return { success: false, error: 'Failed to fetch active product by barcode' };
  }
}

// Get Product by ID
export async function getProductByIdAction(id: string) {
  try {
    const response = await ssrProductAPI.getById(id);
    if (response.status === 200) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Product not found' };
  } catch (error) {
    console.error('Get product by id error:', error);
    return { success: false, error: 'Failed to fetch product by id' };
  }
}

// Get All Admin Taxes
export async function getAllAdminTaxesAction(page: number = 1, limit: number = 10, search?: string, isActive?: boolean) {
  try {
    const response = await ssrAdminTaxAPI.getAll(page, limit, search, isActive);
    if (response.status === 200) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to fetch taxes' };
  } catch (error) {
    console.error('Get all admin taxes error:', error);
    return { success: false, error: 'Failed to fetch taxes' };
  }
}



export async function createSupplierAction(data: {
  supplierCode: string;
  name: string;
  email: string;
  phone: string;
  supplierImage?: File | string | null;
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  status: boolean;
}) {
  try {
    const formData = new FormData();
    formData.append('supplierCode', data.supplierCode);
    formData.append('name', data.name);
    formData.append('email', data.email);
    formData.append('phone', data.phone);
    formData.append('status', String(data.status));
    formData.append('address[street]', data.address.street);
    formData.append('address[city]', data.address.city);
    formData.append('address[state]', data.address.state);
    formData.append('address[pincode]', data.address.pincode);
    formData.append('address[country]', data.address.country);

    if (data.supplierImage instanceof File) {
      formData.append('supplierImage', data.supplierImage);
    } else if (typeof data.supplierImage === 'string' && data.supplierImage.trim() !== '') {
      formData.append('supplierImage', data.supplierImage);
    }

    const response = await ssrSupplierAPI.create(formData as any);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to create supplier' };
  } catch (error) {
    console.error('Create supplier error:', error);
    return { success: false, error: 'Failed to create supplier' };
  }
}

export async function updateSupplierStatusAction(id: string, status: boolean) {
  try {
    const response = await ssrSupplierAPI.updateStatus(id, status);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to update supplier status' };
  } catch (error) {
    console.error('Update supplier status error:', error);
    return { success: false, error: 'Failed to update supplier status' };
  }
}

export async function toggleSupplierStatusAction(id: string) {
  try {
    const response = await ssrSupplierAPI.toggleStatus(id);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to toggle supplier status' };
  } catch (error) {
    console.error('Toggle supplier status error:', error);
    return { success: false, error: 'Failed to toggle supplier status' };
  }
}

export async function bulkUpdateSupplierStatusAction(data: {
  ids: string[];
  status: boolean;
}) {
  try {
    const response = await ssrSupplierAPI.bulkUpdateStatus(data);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to update status for selected suppliers' };
  } catch (error) {
    console.error('Bulk update supplier status error:', error);
    return { success: false, error: 'Failed to update status for selected suppliers' };
  }
}

export async function bulkDeleteSupplierAction(data: {
  ids: string[];
}) {
  try {
    const response = await ssrSupplierAPI.bulkDelete(data);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to delete selected suppliers' };
  } catch (error) {
    console.error('Bulk delete suppliers error:', error);
    return { success: false, error: 'Failed to delete selected suppliers' };
  }
}

export async function updateSupplierAction(id: string, data: {
  supplierCode: string;
  name: string;
  email: string;
  phone: string;
  supplierImage?: File | string | null;
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  status: boolean;
}) {
  try {
    // Build FormData to support image file upload and nested address
    const formData = new FormData();
    formData.append('supplierCode', data.supplierCode);
    formData.append('name', data.name);
    formData.append('email', data.email);
    formData.append('phone', data.phone);
    formData.append('status', String(data.status));
    formData.append('address[street]', data.address.street);
    formData.append('address[city]', data.address.city);
    formData.append('address[state]', data.address.state);
    formData.append('address[pincode]', data.address.pincode);
    formData.append('address[country]', data.address.country);

    // Attach supplierImage file if provided
    if (data.supplierImage instanceof File) {
      formData.append('supplierImage', data.supplierImage);
    } else if (typeof data.supplierImage === 'string' && data.supplierImage.trim() !== '') {
      // If backend supports image URL, send as imageUrl field
      formData.append('supplierImage', data.supplierImage);
    } else {
      // Send empty string if no image
      formData.append('supplierImage', '');
    }

    const response = await ssrSupplierAPI.update(id, formData as any);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to update supplier' };
  } catch (error) {
    console.error('Update supplier error:', error);
    return { success: false, error: 'Failed to update supplier' };
  }
}

export async function deleteSupplierAction(id: string) {
  try {
    const response = await ssrSupplierAPI.delete(id);
    if (response.status === 200 || response.status === 204) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to delete supplier' };
  } catch (error) {
    console.error('Delete supplier error:', error);
    return { success: false, error: 'Failed to delete supplier' };
  }
}

export async function bulkGetSelectedSupplierAction(data: { ids: string[] }) {
  try {
    const response = await ssrSupplierAPI.bulkGetSelected(data);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to get selected suppliers' };
  } catch (error) {
    console.error('Bulk get selected suppliers error:', error);
    return { success: false, error: 'Failed to get selected suppliers' };
  }
}

export async function bulkGetSuppliersAction(filterData: SearchParamsTypes.DownloadSearchParams) {
  try {
    const response = await ssrSupplierAPI.bulkAllDownload(filterData);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to get suppliers' };
  } catch (error) {
    console.error('Bulk get suppliers error:', error);
    return { success: false, error: 'Failed to get suppliers' };
  }
}
// Tax Actions
export async function createAdminTaxAction(data: {
  taxName: string;
  taxType: 'Inclusive' | 'Exclusive';
  valueType: 'Fixed' | 'Percentage';
  value: number;
  status: boolean;
  description?: string;
}) {
  try {
    // Map to admin API contract: status boolean, name as taxNAme
    const payload: any = {
      taxName: data.taxName, // API expects this exact key
      taxType: data.taxType,
      valueType: data.valueType,
      value: data.value,
      status: data.status === true,
      description: data.description ?? ''
    };
    const response = await ssrAdminTaxAPI.create(payload);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to create tax' };
  } catch (error) {
    console.error('Create tax error:', error);
    return { success: false, error: 'Failed to create tax' };
  }
}

export async function updateAdminTaxAction(id: string, data: {
  taxName: string;
  taxType: 'Inclusive' | 'Exclusive';
  valueType: 'Fixed' | 'Percentage';
  value: number;
  status: boolean;
  description?: string;
}) {
  try {
    const payload: any = {
      taxName: data.taxName,
      taxType: data.taxType,
      valueType: data.valueType,
      value: data.value,
      status: !!data.status,
      description: data.description ?? ''
    };
    const response = await ssrAdminTaxAPI.update(id, payload);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to update tax' };
  } catch (error) {
    console.error('Update tax error:', error);
    return { success: false, error: 'Failed to update tax' };
  }
}

export async function deleteAdminTaxAction(id: string) {
  try {
    const response = await ssrAdminTaxAPI.delete(id);
    if (response.status === 200 || response.status === 204) {
      return { success: true };
    }
    return { success: false, error: 'Failed to delete tax' };
  } catch (error) {
    console.error('Delete tax error:', error);
    return { success: false, error: 'Failed to delete tax' };
  }
}

export async function bulkUpdateAdminTaxStatusAction(data: { ids: string[]; status: boolean }) {
  try {
    const response = await ssrAdminTaxAPI.bulkUpdateStatus(data);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to update tax statuses' };
  } catch (error) {
    console.error('Bulk update tax status error:', error);
    return { success: false, error: 'Failed to update tax statuses' };
  }
}

// Tax: bulk delete (Admin)
export async function bulkDeleteAdminTaxesAction(data: { ids: string[] }) {
  try {
    const response = await ssrAdminTaxAPI.bulkDelete(data);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to delete taxes' };
  } catch (error) {
    console.error('Bulk delete taxes error:', error);
    return { success: false, error: 'Failed to delete taxes' };
  }
}

// Tax: bulk get (Admin)
export async function bulkGetAdminTaxesAction(filterData: SearchParamsTypes.DownloadSearchParams) {
  try {
    const response = await ssrAdminTaxAPI.bulkAllDownload(filterData);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to get taxes' };
  } catch (error) {
    console.error('Bulk get taxes error:', error);
    return { success: false, error: 'Failed to get taxes' };
  }
}

// Tax: bulk get selected (Admin)
export async function bulkGetSelectedAdminTaxAction(data: { ids: string[] }) {
  try {
    const response = await ssrAdminTaxAPI.bulkGetSelected(data);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to get selected taxes' };
  } catch (error) {
    console.error('Bulk get selected taxes error:', error);
    return { success: false, error: 'Failed to get selected taxes' };
  }
}

// Purchase Order: create (aligns with router.post('/purchase-order', PurchaseOrderController.create))
export async function createPurchaseOrderAction(data: {
  supplierId: string;
  purchaseDate: string;
  expectedDeliveryDate?: string;
  items: Omit<PurchaseOrderItem, 'id' | 'subtotal' | 'total'>[];
  discountType?: 'Percentage' | 'Fixed Amount';
  discountAmount: number;
  shippingCharges: number;
  shippingDetails?: {
    address: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    contactPerson: string;
    phone: string;
  };
  paymentMethod: 'Cash' | 'Credit Card' | 'Bank Transfer' | 'Cheque' | 'Other';
  status: "Received" | "Pending" | "Ordered" | "Billed" | "Draft" | "Approved" | "Cancelled";
  notes?: string;

}) {
  try {
    const response = await ssrPurchaseOrderAPI.create(data);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to create purchase order' };
  } catch (error) {
    console.error('Create purchase order error:', error);
    return { success: false, error: 'Failed to create purchase order' };
  }
}

//Purchase Order: delete
export async function deletePurchaseOrderAction(id: string) {
  try {
    const response = await ssrPurchaseOrderAPI.delete(id);
    if (response.status === 200 || response.status === 201 || response.status === 204) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to delete purchase order' };
  } catch (error) {
    console.error('Delete purchase order error:', error);
    return { success: false, error: 'Failed to delete purchase order' };
  }
}

export async function bulkUpdatePurchaseOrderStatusAction(data: {
  ids: string[];
  status: 'APPROVED' | 'BILLED';
}) {
  try {
    const response = await ssrPurchaseOrderAPI.bulkUpdateStatus(data);

    if (response?.status === 200 || response?.status === 201) {
      const result = response.data?.data || response.data;

      return {
        success: true,
        message: response.data?.message,
        summary: {
          total: result.total,
          updated: result.updated,
          failed: result.failed,
        },
        results: result.results,
      };
    }

    return {
      success: false,
      error:
        response?.data?.message ||
        'Failed to bulk update purchase order status',
      errorData: response?.data,
    };
  } catch (error: any) {
    console.error('Bulk update purchase order status error:', error);

    return {
      success: false,
      error:
        error?.response?.data?.message ||
        error?.message ||
        'Failed to bulk update purchase order status',
    };
  }
}


export async function bulkDeletePurchaseOrdersAction(data: { ids: string[] }) {
  try {
    const response = await ssrPurchaseOrderAPI.bulkDelete(data);
    if (response.status === 200 || response.status === 201 || response.status === 204) {
      return { success: true, errorData: response, message: response.data?.message };
    }
    return { success: false, error: response.data?.message || 'Failed to bulk delete purchase order', errorData: response };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to bulk delete delete purchase order' };
  }

}

// Purchase Order: update
export async function updatePurchaseOrderAction(id: string, data: {
  supplierId: string;
  purchaseDate: string;
  expectedDeliveryDate?: string;
  items: Omit<PurchaseOrderItem, 'id' | 'subtotal' | 'total'>[];
  discountType?: 'Percentage' | 'Fixed Amount';
  discountAmount: number;
  shippingCharges: number;
  shippingDetails?: {
    address: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    contactPerson: string;
    phone: string;
  };
  paymentMethod: 'Cash' | 'Credit Card' | 'Bank Transfer' | 'Cheque' | 'Other';
  status: "Received" | "Pending" | "Ordered" | "Billed" | "Draft" | "Approved" | "Cancelled";
  notes?: string;

}) {
  try {
    const response = await ssrPurchaseOrderAPI.update(id, data);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to update purchase order' };
  } catch (error) {
    console.error('Update purchase order error:', error);
    return { success: false, error: 'Failed to update purchase order' };
  }
}

// Purchase Order: get by id
export async function getPurchaseOrderByIdAction(id: string) {
  try {
    const response = await ssrPurchaseOrderAPI.getById(id);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to fetch purchase order' };
  } catch (error) {
    console.error('Get purchase order by id error:', error);
    return { success: false, error: 'Failed to fetch purchase order' };
  }
}

// Purchase Order: update status
export async function updatePurchaseOrderStatusAction(id: string, data: Record<string, unknown>) {
  try {
    const response = await ssrPurchaseOrderAPI.updateStatus(id, data);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to update purchase order status' };
  } catch (error) {
    console.error('Update purchase order status error:', error);
    return { success: false, error: 'Failed to update purchase order status' };
  }
}

// Purchase Return: create draft
export async function createPurchaseReturnDraftAction(data: Record<string, unknown>) {
  try {
    const response = await ssrPurchaseReturnAPI.createDraft(data);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to create purchase return draft' };
  } catch (error) {
    console.error('Create purchase return draft error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to create purchase return draft';
    return { success: false, error: errorMessage };
  }
}

export async function updatePurchaseReturnAction(id: string, data: Record<string, unknown>) {
  try {
    const response = await ssrPurchaseReturnAPI.update(id, data);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to update purchase return' };
  } catch (error) {
    console.error('Update purchase return error:', error);
    return { success: false, error: 'Failed to update purchase return' };
  }
}

// Purchase Return: change status
export async function changePurchaseReturnStatusAction(id: string, data: Record<string, unknown>) {
  try {
    const response = await ssrPurchaseReturnAPI.changeStatus(id, data);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to change purchase return status' };
  } catch (error) {
    console.error('Change purchase return status error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to change purchase return status';
    return { success: false, error: errorMessage };
  }
}

// Purchase Order: update status
export async function updatePurchaseReturnStatusAction(id: string, data: Record<string, unknown>) {
  try {
    const response = await ssrPurchaseReturnAPI.changeStatus(id, data);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to update purchase return status' };
  } catch (error) {
    console.error('Update purchase order status error:', error);
    return { success: false, error: 'Failed to update purchase return  status' };
  }
}

// Purchase Return: get by id
export async function getPurchaseReturnByIdAction(id: string) {
  try {
    const response = await ssrPurchaseReturnAPI.getById(id);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to fetch purchase return' };
  } catch (error) {
    console.error('Get purchase return by id error:', error);
    return { success: false, error: 'Failed to fetch purchase return' };
  }
}

export async function deletePurchaseReturnAction(id: string) {
  try {
    const response = await ssrPurchaseReturnAPI.delete(id);
    if (response.status === 200 || response.status === 201 || response.status === 204) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to delete purchase return' };
  } catch (error) {
    console.error('Delete purchase return error:', error);
    return { success: false, error: 'Failed to delete purchase return' };
  }
}



export async function bulkUpdatePurchaseReturnStatusAction(data: {
  ids: string[];
  status: | 'Approved'
  | 'Credited'
  | 'Cancelled';
}) {
  try {
    const response = await ssrPurchaseReturnAPI.bulkUpdateStatus(data);

    if (response?.status === 200 || response?.status === 201) {
      const result = response.data?.data || response.data;

      return {
        success: true,
        message: response.data?.message || 'Purchase return status updated',
        summary: {
          total: result.total,
          updated: result.updated,
          failed: result.failed,
        },
      };
    }

    return {
      success: false,
      error:
        response?.data?.message ||
        'Failed to bulk update purchase return status',
      errorData: response?.data,
    };
  } catch (error: any) {
    console.error('Bulk update purchase return status error:', error);

    return {
      success: false,
      error:
        error?.response?.data?.message ||
        error?.message ||
        'Failed to bulk update purchase return status',
    };
  }
}




export async function bulkDeletePurchaseReturnsAction(data: { ids: string[] }) {
  try {
    const response = await ssrPurchaseReturnAPI.bulkDelete(data);
    if (response.status === 200 || response.status === 201 || response.status === 204) {
      return { success: true, errorData: response, message: response.data?.message };
    }
    return { success: false, error: response.data?.message || 'Failed to bulk delete purchase order', errorData: response };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to bulk delete delete purchase order' };
  }

}

export async function bulkGetPurchaseReturnAction(filterData: SearchParamsTypes.DownloadSearchParams) {
  try {
    const response = await ssrPurchaseReturnAPI.bulkAllDownload(filterData);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to get purchase return' };
  } catch (error) {
    console.error('Bulk get purchase return error:', error);
    return { success: false, error: 'Failed to get purchase return' };
  }
}

export async function bulkGetSelectedPurchaseReturnAction(data: { ids: string[] }) {
  try {
    const response = await ssrPurchaseReturnAPI.bulkGetSelected(data);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to get selected purchase return' };
  } catch (error) {
    console.error('Bulk get selected purchase return error:', error);
    return { success: false, error: 'Failed to get selected purchase return' };
  }
}

export async function bulkGetPurchaseOrderAction(filterData: SearchParamsTypes.DownloadSearchParams) {
  try {
    const response = await ssrPurchaseOrderAPI.bulkAllDownload(filterData);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to get purchase order' };
  } catch (error) {
    console.error('Bulk get purchase order error:', error);
    return { success: false, error: 'Failed to get purchase order' };
  }
}

export async function bulkGetSelectedPurchaseOrderAction(data: { ids: string[] }) {
  try {
    const response = await ssrPurchaseOrderAPI.bulkGetSelected(data);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to get selected purchase order' };
  } catch (error) {
    console.error('Bulk get selected purchase order error:', error);
    return { success: false, error: 'Failed to get selected purchase order' };
  }
}



// Admin Coupon: create
export async function createAdminCouponAction(data: {
  code: string;
  description: string;
  start_date: string;
  end_date: string;
  type: "Percentage" | "Fixed";
  discount_amount: number;
  limit: number;
  status: boolean;
  maxUsagePerUser?: number;
}) {
  try {
    const response = await ssrAdminCouponAPI.create(data);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: response?.data?.message || 'Failed to create coupon' };
  } catch (error) {
    console.error('Create admin coupon error:', error);
    return { success: false, error: 'Failed to create coupon' };
  }
}

// Admin Coupon: update
export async function updateAdminCouponAction(id: string, data: {
  code: string;
  description: string;
  start_date: string;
  end_date: string;
  type: "Percentage" | "Fixed";
  discount_amount: number;
  limit: number;
  status: boolean;
  maxUsagePerUser?: number;
}) {
  try {
    const response = await ssrAdminCouponAPI.update(id, data);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: response?.data?.message || 'Failed to update coupon' };
  } catch (error) {
    console.error('Update admin coupon error:', error);
    return { success: false, error: 'Failed to update coupon' };
  }
}

// Admin Coupon: delete
export async function deleteAdminCouponAction(id: string) {
  try {
    const response = await ssrAdminCouponAPI.delete(id);
    if (response.status === 200 || response.status === 204) {
      return { success: true };
    }
    return { success: false, error: 'Failed to delete coupon' };
  } catch (error) {
    console.error('Delete admin coupon error:', error);
    return { success: false, error: 'Failed to delete coupon' };
  }
}

// Admin Coupon: bulk update status
export async function bulkUpdateAdminCouponsStatusAction(data: { ids: string[]; status: boolean }) {
  try {
    const response = await ssrAdminCouponAPI.bulkUpdateStatus(data as unknown as Record<string, unknown>);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to update status for selected coupons' };
  } catch (error) {
    console.error('Bulk update admin coupons status error:', error);
    return { success: false, error: 'Failed to update status for selected coupons' };
  }
}

// Admin Coupon: bulk delete
export async function bulkDeleteAdminCouponsAction(data: { ids: string[] }) {
  try {
    const response = await ssrAdminCouponAPI.bulkDelete(data as unknown as Record<string, unknown>);
    if (response.status === 200 || response.status === 204) {
      return { success: true };
    }
    return { success: false, error: 'Failed to delete selected coupons' };
  } catch (error) {
    console.error('Bulk delete admin coupons error:', error);
    return { success: false, error: 'Failed to delete selected coupons' };
  }
}

// Admin Coupon: bulk get
export async function bulkGetAdminCouponsAction(filterData: SearchParamsTypes.DownloadSearchParams) {
  try {
    const response = await ssrAdminCouponAPI.bulkAllDownload(filterData);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to get admin coupons' };
  } catch (error) {
    console.error('Bulk get admin coupons error:', error);
    return { success: false, error: 'Failed to get admin coupons' };
  }
}

// Admin Coupon: bulk get selected
export async function bulkGetSelectedAdminCouponAction(data: { ids: string[] }) {
  try {
    const response = await ssrAdminCouponAPI.bulkGetSelected(data);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to get selected admin coupons' };
  } catch (error) {
    console.error('Bulk get selected admin coupons error:', error);
    return { success: false, error: 'Failed to get selected admin coupons' };
  }
}

// Admin Currency: create
export async function createAdminCurrencyAction(data: {
  currencyName: string;
  currencyCode: string;
  currencySymbol: string;
  currencyPosition: 'Left' | 'Right';
  thousandSeparator: string;
  decimalSeparator: string;
  numberOfDecimals: number;
}) {
  try {
    const response = await ssrAdminCurrencySettingAPI.create(data);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: response?.data?.message || 'Failed to create currency' };
  } catch (error) {
    console.error('Create admin currency error:', error);
    return { success: false, error: 'Failed to create currency' };
  }
}

// Admin Currency: update
export async function updateAdminCurrencyAction(id: string, data: {
  currencyName?: string;
  currencyCode?: string;
  currencySymbol?: string;
  currencyPosition?: 'Left' | 'Right';
  thousandSeparator?: string;
  decimalSeparator?: string;
  numberOfDecimals?: number;
}) {
  try {
    const response = await ssrAdminCurrencySettingAPI.update(id, data);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: response?.data?.message || 'Failed to update currency' };
  } catch (error) {
    console.error('Update admin currency error:', error);
    return { success: false, error: 'Failed to update currency' };
  }
}

// Admin Currency: delete
export async function deleteAdminCurrencyAction(id: string) {
  try {
    const response = await ssrAdminCurrencySettingAPI.delete(id);
    if (response.status === 200 || response.status === 204) {
      return { success: true };
    }
    return { success: false, error: 'Failed to delete currency' };
  } catch (error) {
    console.error('Delete admin currency error:', error);
    return { success: false, error: 'Failed to delete currency' };
  }
}

// Admin Currency: set primary
export async function setAdminCurrencyPrimaryAction(id: string) {
  try {
    const response = await ssrAdminCurrencySettingAPI.setPrimary(id);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to set primary currency' };
  } catch (error) {
    console.error('Set admin primary currency error:', error);
    return { success: false, error: 'Failed to set primary currency' };
  }
}

export async function createGiftCardAction(data: {
  name: string;
  number: string;
  numberGenerationType: string;
  value: number;
  thresholdAmount?: number;
  validity: string;
  customerScope: string;
  assignedCustomerIds?: string[];
  terms?: string;
  giftCardImage?: string | null;
  status: string;
}) {
  try {
    const response = await ssrGiftCardAPI.create(data);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to create gift card', errorData: response.data };
  } catch (error) {
    console.error('Create gift card error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to create gift card';
    return { success: false, error: errorMessage };
  }
}

export async function updateGiftCardAction(id: string, data: {
  name: string;
  number: string;
  numberGenerationType: string;
  value: number;
  thresholdAmount?: number;
  validity: string;
  customerScope: string;
  assignedCustomerIds?: string[];
  terms?: string;
  giftCardImage?: string;
  status: string;
}) {
  try {
    const response = await ssrGiftCardAPI.update(id, data);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to update gift card' };
  } catch (error) {
    console.error('Update gift card error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to update gift card';
    return { success: false, error: errorMessage };
  }
}

export async function deleteGiftCardAction(id: string) {
  try {
    const response = await ssrGiftCardAPI.delete(id);
    if (response.status === 200 || response.status === 204) {
      return { success: true };
    }
    return { success: false, error: 'Failed to delete gift card' };
  } catch (error) {
    console.error('Delete gift card error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete gift card';
    return { success: false, error: errorMessage };
  }
}

// Gift Card: bulk update status
export async function bulkUpdateGiftCardsStatusAction(data: { ids: string[]; status: string }) {
  try {
    const response = await ssrGiftCardAPI.bulkUpdateStatus(data as unknown as Record<string, unknown>);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to update status for selected gift cards' };
  } catch (error) {
    console.error('Bulk update gift cards status error:', error);
    return { success: false, error: 'Failed to update status for selected gift cards' };
  }
}

// Gift Card: bulk delete
export async function bulkDeleteGiftCardsAction(data: { ids: string[] }) {
  try {
    const response = await ssrGiftCardAPI.bulkDelete(data as unknown as Record<string, unknown>);
    if (response.status === 200 || response.status === 204) {
      return { success: true };
    }
    return { success: false, error: 'Failed to delete selected gift cards' };
  } catch (error) {
    console.error('Bulk delete gift cards error:', error);
    return { success: false, error: 'Failed to delete selected gift cards' };
  }

}

export async function updateMiscSetting(data: Record<string, unknown>) {
  try {
    const response = await ssrMiscellaneousSettingsAPI.updateSettings(data);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to update miscellaneous settings' };
  } catch (error) {
    console.error('Update miscellaneous settings error:', error);
    return { success: false, error: 'Failed to update miscellaneous settings' };
  }
}

export async function darkModeEnableToggle() {
  try {
    const response = await ssrMiscellaneousSettingsAPI.toggleDarkMode();
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to toggle dark mode' };
  } catch (error) {
    console.error('Toggle dark mode error:', error);
    return { success: false, error: 'Failed to toggle dark mode' };
  }
}

export async function maintenanceModeToggle() {
  try {
    const response = await ssrMiscellaneousSettingsAPI.toggleMaintenanceMode();
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to toggle maintenance mode' };
  } catch (error) {
    console.error('Toggle maintenance mode error:', error);
    return { success: false, error: 'Failed to toggle maintenance mode' };
  }
}

// Admin Misc Settings: update
export async function updateAdminMiscSettingAction(data: Record<string, unknown>) {
  try {
    const response = await ssrAdminMiscSettingsAPI.update(data);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to update misc settings' };
  } catch (error) {
    console.error('Update misc settings error:', error);
    return { success: false, error: 'Failed to update misc settings' };
  }
}

// Admin Misc Settings: dark mode toggle
export async function adminDarkModeToggleAction() {
  try {
    const response = await ssrAdminMiscSettingsAPI.toggleDarkMode();
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to toggle dark mode' };
  } catch (error) {
    console.error('Admin toggle dark mode error:', error);
    return { success: false, error: 'Failed to toggle dark mode' };
  }
}

// Sales: create
export async function createSaleAction(data: Record<string, unknown>) {
  try {
    const response = await ssrSalesAPI.create(data);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to create sale' };
  } catch (error) {
    console.error('Create sale error:', error);
    return { success: false, error: 'Failed to create sale' };
  }
}

// Sales: update
export async function updateSaleAction(id: string, data: Record<string, unknown>) {
  try {
    const response = await ssrSalesAPI.update(id, data);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    // Extract error from non-success response
    const errorMsg = response.data?.message || response.data?.error || `Failed to update sale (status: ${response.status})`;
    console.error('Update sale non-success response:', response);
    return { success: false, error: errorMsg };
  } catch (error: any) {
    console.error('Update sale error:', error);
    // Extract detailed error message
    const errorMsg = error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      'Failed to update sale';
    return { success: false, error: errorMsg };
  }
}

// Sales: Preview Billing
export async function previewBillingAction(saleId: string) {
  try {
    const response = await ssrSalesAPI.previewBilling(saleId);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to preview billing' };
  } catch (error: any) {
    console.error('Preview billing error:', error);
    const errorMsg = error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      'Failed to preview billing';
    return { success: false, error: errorMsg };
  }
}

// Sales: bulk get all
export async function bulkGetSalesAction(filterData: SearchParamsTypes.DownloadSearchParams) {
  try {
    const response = await ssrSalesAPI.bulkAllDownload(filterData);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to get sales' };
  } catch (error) {
    console.error('Bulk get sales error:', error);
    return { success: false, error: 'Failed to get sales' };
  }
}

// Sales: bulk get selected
export async function bulkGetSelectedSalesAction(data: { ids: string[] }) {
  try {
    const response = await ssrSalesAPI.bulkGetSelected(data);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to get selected sales' };
  } catch (error) {
    console.error('Bulk get selected sales error:', error);
    return { success: false, error: 'Failed to get selected sales' };
  }
}

// Sales: delete
export async function deleteSaleAction(id: string) {
  try {
    const response = await ssrSalesAPI.delete(id);
    if (response.status === 200 || response.status === 204) {
      return { success: true };
    }
    return { success: false, error: 'Failed to delete sale' };
  } catch (error) {
    console.error('Delete sale error:', error);
    return { success: false, error: 'Failed to delete sale' };
  }
}

// Sales: bulk delete
export async function bulkDeleteSalesAction(data: { ids: string[] }) {
  try {
    const response = await ssrSalesAPI.bulkDelete(data as unknown as Record<string, unknown>);
    if (response.status === 200 || response.status === 204) {
      return { success: true };
    }
    return { success: false, error: 'Failed to delete selected sales' };
  } catch (error) {
    console.error('Bulk delete sales error:', error);
    return { success: false, error: 'Failed to delete selected sales' };
  }
}

// Product: get active by store
export async function getActiveProductsByStoreAction(storeId: string) {
  try {
    const response = await ssrProductAPI.getActive(storeId);
    if (response.status === 200 || response.status === 201) {
      const products = response.data?.data?.products || response.data?.data || response.data || [];
      return { success: true, data: products };
    }
    return { success: false, error: 'Failed to fetch active products' };
  } catch (error) {
    console.error('Fetch active products error:', error);
    return { success: false, error: 'Failed to fetch active products' };
  }
}

// Notification: create
export async function createNotificationAction(data: Record<string, unknown>) {
  try {
    const response = await ssrNotificationAPI.create(data);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to create notification' };
  } catch (error) {
    console.error('Create notification error:', error);
    return { success: false, error: 'Failed to create notification' };
  }
}

// Notification: update
export async function updateNotificationAction(id: string, data: Record<string, unknown>) {
  try {
    const response = await ssrNotificationAPI.update(id, data);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to update notification' };
  } catch (error) {
    console.error('Update notification error:', error);
    return { success: false, error: 'Failed to update notification' };
  }
}

// Notification: delete
export async function deleteNotificationAction(id: string) {
  try {
    const response = await ssrNotificationAPI.delete(id);
    if (response.status === 200 || response.status === 204) {
      return { success: true };
    }
    return { success: false, error: response.data?.message || 'Failed to delete notification' };
  } catch (error) {
    console.error('Delete notification error:', error);
    return { success: false, error: 'Failed to delete notification' };
  }
}

// Notification: toggle status
export async function toggleNotificationStatusAction(id: string) {
  try {
    const response = await ssrNotificationAPI.toggleStatus(id);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to toggle notification status' };
  } catch (error) {
    console.error('Toggle notification status error:', error);
    return { success: false, error: 'Failed to toggle notification status' };
  }
}

// Notification: bulk update status
export async function bulkUpdateNotificationsStatusAction(data: { ids: string[]; status: boolean }) {
  try {
    const response = await ssrNotificationAPI.bulkUpdateStatus(data as unknown as Record<string, unknown>);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: response.data?.message || 'Failed to update status for selected notifications' };
  } catch (error) {
    console.error('Bulk update notifications status error:', error);
    return { success: false, error: 'Failed to update status for selected notifications' };
  }
}

// Notification: bulk delete
export async function bulkDeleteNotificationsAction(data: { ids: string[] }) {
  try {
    const response = await ssrNotificationAPI.bulkDelete(data as unknown as Record<string, unknown>);
    if (response.status === 200 || response.status === 204) {
      return { success: true };
    }
    return { success: false, error: response.data?.message || 'Failed to delete selected notifications' };
  } catch (error) {
    console.error('Bulk delete notifications error:', error);
    return { success: false, error: 'Failed to delete selected notifications' };
  }
}

// Tenant Mail Settings Server Action

// Create or Update Tenant Mail Settings
export async function createOrUpdateTenantMailSettingAction(data: {
  email: string;
  host: string;
  port: number;
  encryption: 'ssl' | 'tls' | 'none';
  password: string;
}) {
  try {
    const response = await ssrTenantMailSettingAPI.createOrUpdate(data);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to save mail settings' };
  } catch (error) {
    console.error('Create or update tenant mail settings error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to save mail settings';
    return { success: false, error: errorMessage };
  }
}

// Verify Tenant Mail Settings
export async function verifyTenantMailSettingAction() {
  try {
    const response = await ssrTenantMailSettingAPI.verify();
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to verify mail settings' };
  } catch (error) {
    console.error('Verify tenant mail settings error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to verify mail settings';
    return { success: false, error: errorMessage };
  }
}

// Delete Tenant Mail Settings
export async function deleteTenantMailSettingAction() {
  try {
    const response = await ssrTenantMailSettingAPI.delete();
    if (response.status === 200 || response.status === 201 || response.status === 204) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to delete mail settings' };
  } catch (error) {
    console.error('Delete tenant mail settings error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete mail settings';
    return { success: false, error: errorMessage };
  }
}

// Admin Misc Settings: get all
export async function getAdminMiscSettingsAction() {
  try {
    const response = await ssrAdminMiscSettingsAPI.getAll();
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to fetch admin misc settings' };
  } catch (error) {
    console.error('Get all admin misc settings error:', error);
    return { success: false, error: 'Failed to fetch admin misc settings' };
  }
}

// Misc Settings: get current settings
export async function getSuperAdminMiscSettingsAction() {
  try {
    const response = await ssrMiscellaneousSettingsAPI.getCurrentSettings();
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to fetch current misc settings' };
  } catch (error) {
    console.error('Get current misc settings error:', error);
    return { success: false, error: 'Failed to fetch current misc settings' };
  }
}

// Mail Template: create
export async function createMailTemplateAction(data: Record<string, unknown>) {
  try {
    const response = await ssrMailTemplateAPI.create(data);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to create mail template' };
  } catch (error) {
    console.error('Create mail template error:', error);
    return { success: false, error: 'Failed to create mail template' };
  }
}

// Mail Template: update
export async function updateMailTemplateAction(id: string, data: Record<string, unknown>) {
  try {
    const response = await ssrMailTemplateAPI.update(id, data);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to update mail template' };
  } catch (error) {
    console.error('Update mail template error:', error);
    return { success: false, error: 'Failed to update mail template' };
  }
}

// Mail Template: delete
export async function deleteMailTemplateAction(id: string) {
  try {
    const response = await ssrMailTemplateAPI.delete(id);
    if (response.status === 200 || response.status === 204) {
      return { success: true };
    }
    return { success: false, error: 'Failed to delete mail template' };
  } catch (error) {
    console.error('Delete mail template error:', error);
    return { success: false, error: 'Failed to delete mail template' };
  }
}

// Mail Template: toggle status
export async function toggleMailTemplateStatusAction(id: string) {
  try {
    const response = await ssrMailTemplateAPI.toggleStatus(id);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to toggle mail template status' };
  } catch (error) {
    console.error('Toggle mail template status error:', error);
    return { success: false, error: 'Failed to toggle mail template status' };
  }
}

// Purchase Order: Invoice PDF
export async function getPurchaseOrderInvoiceAction(id: string) {
  try {
    // 1. Fetch Purchase Order Invoice Data
    const invPromise = ssrPurchaseOrderAPI.getInvoice(id);
    // 2. Fetch Invoice Design Settings (optional/custom)
    const designPromise = ssrInvoiceDesignAPI.get().catch(err => {
      console.warn('Failed to fetch invoice design, falling back to default:', err.message);
      return { status: 404, data: null };
    });

    const [invResponse, designResponse] = await Promise.all([invPromise, designPromise]);
    if (invResponse.status === 200 || invResponse.status === 201) {
      const invoiceData = invResponse.data?.data;
      if (!invoiceData) {
        return { success: false, error: 'No invoice data found' };
      }

      // Design config might be empty or valid
      const designConfig = (designResponse?.status === 200 || designResponse?.status === 201)
        ? (designResponse.data?.data || designResponse.data)
        : {};

      // Get Host for absolute URL resolution (Logo etc)
      let host = '';
      try {
        const headersList = await headers();
        host = headersList.get('host') || '';
      } catch (e) {
        console.warn('Could not get headers in server action', e);
      }

      // Generate PDF
      // We pass the RAW invoiceData. The 'generateInvoicePDF' function uses 'invoice-mapper'
      // which is now smart enough to handle the 'supplier' and 'orderDetails' structures directly.
      const pdfBuffer = await generateInvoicePDF(invoiceData, designConfig, host);

      // Return base64 string to be safe for client-server serialization
      return { success: true, data: pdfBuffer.toString('base64') };
    }
    return { success: false, error: 'Failed to fetch invoice' };
  } catch (error) {
    console.error('Get PO invoice error:', error);
    return { success: false, error: `Failed to generate invoice PDF: ${error instanceof Error ? error.message : String(error)}` };
  }
}



export async function sendPurchaseOrderEmailAction(id: string) {
  try {
    const response = await ssrPurchaseOrderAPI.sendEmail(id);
    if (response.status === 200 || response.status === 201) {
      return { success: true, message: response.data?.message || 'Email sent successfully' };
    }
    return { success: false, error: response.data?.message || 'Failed to send email' };
  } catch (error: any) {
    console.error('Send PO email error:', error);
    const errorMessage = error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      'Failed to send email';
    return { success: false, error: errorMessage };
  }
}


export async function getRolePermissionsAction(id: string) {
  try {
    const response = await ssrRolePermissionAPI.getRoleByPermission(id);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to fetch role permissions' };
  } catch (error) {
    console.error('Get role permissions error:', error);
    return { success: false, error: 'Failed to fetch role permissions' };
  }
}

export async function getRolePermissionsMeAction() {
  try {
    const response = await ssrRolePermissionAPI.getMe();
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to fetch user permissions' };
  } catch (error) {
    console.error('Get user permissions error:', error);
    return { success: false, error: 'Failed to fetch user permissions' };
  }
}

export async function updateRolePermissionsAction(roleName: string, data: Record<string, unknown>) {
  try {
    const response = await ssrRolePermissionAPI.updateRolePermission(roleName, data);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to update role permissions' };
  } catch (error) {
    console.error('Update role permissions error:', error);
    return { success: false, error: 'Failed to update role permissions' };
  }
}

// Shift Assignment: create
export async function createShiftAssignmentAction(data: {
  employeeId: string;
  employeeName: string;
  storeId: string;
  shiftTypeId: string;
  assignmentDate: string;
  dayOfWeek: string;
  status: string;
  shiftTime: string;
  endDate?: string;
  customWeekOff: string[];
}) {
  try {
    const response = await ssrShiftAssignmentAPI.create(data);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to create shift assignment' };
  } catch (error) {
    console.error('Create shift assignment error:', error);
    return { success: false, error: 'Failed to create shift assignment' };
  }
}

// Shift Assignment: update
export async function updateShiftAssignmentAction(id: string, data: {
  employeeId: string;
  employeeName: string;
  storeId: string;
  shiftTypeId: string;
  assignmentDate: string;
  dayOfWeek: string;
  status: string;
  shiftTime: string;
  endDate?: string | undefined;
  customWeekOff: string[];
}) {
  try {
    const response = await ssrShiftAssignmentAPI.update(id, data);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to update shift assignment' };
  } catch (error) {
    console.error('Update shift assignment error:', error);
    return { success: false, error: 'Failed to update shift assignment' };
  }
}

// Shift Assignment: delete
export async function deleteShiftAssignmentAction(id: string) {
  try {
    const response = await ssrShiftAssignmentAPI.delete(id);
    if (response.status === 200 || response.status === 204) {
      return { success: true };
    }
    return { success: false, error: 'Failed to delete shift assignment' };
  } catch (error) {
    console.error('Delete shift assignment error:', error);
    return { success: false, error: 'Failed to delete shift assignment' };
  }
}

export async function getActiveProductsAction(storeId?: string, categoryId?: string) {
  try {
    const response = await ssrProductAPI.getActive(storeId, categoryId);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to fetch active products' };
  } catch (error) {
    console.error('Get active products error:', error);
    return { success: false, error: 'Failed to fetch active products' };
  }
}

export async function getAllPosProductsAction() {
  try {
    const response = await ssrPosScreenAPI.getAll();
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to fetch POS screen data' };
  } catch (error) {
    console.error('Get POS screen data error:', error);
    return { success: false, error: 'Failed to fetch POS screen data' };
  }
}

// Super Admin Notification: get unread count
export async function getSuperAdminUnreadNotificationCountAction() {
  try {
    const response = await ssrSuperAdminNotificationAPI.getUnreadCount();
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to fetch unread notification count' };
  } catch (error) {
    console.error('Get unread notification count error:', error);
    return { success: false, error: 'Failed to fetch unread notification count' };
  }
}

// Super Admin Notification: mark all as read
export async function markAllSuperAdminNotificationsAsReadAction() {
  try {
    const response = await ssrSuperAdminNotificationAPI.markAllAsRead();
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to mark all notifications as read' };
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    return { success: false, error: 'Failed to mark all notifications as read' };
  }
}

// Super Admin Notification: mark as read
export async function markSuperAdminNotificationAsReadAction(id: string) {
  try {
    const response = await ssrSuperAdminNotificationAPI.markAsRead(id);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to mark notification as read' };
  } catch (error) {
    console.error('Mark notification as read error:', error);
    return { success: false, error: 'Failed to mark notification as read' };
  }
}

// Super Admin Notification: delete all
export async function deleteAllSuperAdminNotificationsAction() {
  try {
    const response = await ssrSuperAdminNotificationAPI.deleteAll();
    if (response.status === 200 || response.status === 204) {
      return { success: true };
    }
    return { success: false, error: 'Failed to delete all notifications' };
  } catch (error) {
    console.error('Delete all notifications error:', error);
    return { success: false, error: 'Failed to delete all notifications' };
  }
}

// Super Admin Notification: delete
export async function deleteSuperAdminNotificationAction(id: string) {
  try {
    const response = await ssrSuperAdminNotificationAPI.delete(id);
    if (response.status === 200 || response.status === 204) {
      return { success: true };
    }
    return { success: false, error: 'Failed to delete notification' };
  } catch (error) {
    console.error('Delete notification error:', error);
    return { success: false, error: 'Failed to delete notification' };
  }
}

// Sales: get by customer
export async function getSalesByCustomerAction(customerId: string) {
  try {
    const response = await ssrSalesAPI.getByCustomer(customerId);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to fetch sales for customer' };
  } catch (error) {
    console.error('Get sales by customer error:', error);
    return { success: false, error: 'Failed to fetch sales for customer' };
  }
}

// Mail Settings: get all
export async function getMailSettingsAction() {
  try {
    const response = await ssrMailSettingsAPI.getAll();
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to fetch mail settings' };
  } catch (error) {
    console.error('Get mail settings error:', error);
    return { success: false, error: 'Failed to fetch mail settings' };
  }
}

// Currency Settings: get all
export async function getCurrencySettingsAction() {
  try {
    const response = await ssrCurrencySettingsAPI.getAll();
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to fetch currency settings' };
  } catch (error) {
    console.error('Get currency settings error:', error);
    return { success: false, error: 'Failed to fetch currency settings' };
  }
}

// Currency Settings: update (set primary currency)
export async function updateCurrencySettingsAction(data: { currency: string }) {
  try {
    const response = await ssrCurrencySettingsAPI.setPrimary(data.currency);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to update currency settings' };
  } catch (error) {
    console.error('Update currency settings error:', error);
    return { success: false, error: 'Failed to update currency settings' };
  }
}

// Payment Settings: get all
export async function getPaymentSettingsAction() {
  try {
    const response = await ssrPaymentSettingsAPI.getAll();
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to fetch payment settings' };
  } catch (error) {
    console.error('Get payment settings error:', error);
    return { success: false, error: 'Failed to fetch payment settings' };
  }
}

// Trial Settings: get all
export async function getTrialSettingsAction() {
  try {
    const response = await ssrTrialSettingsAPI.getAll();
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to fetch trial settings' };
  } catch (error) {
    console.error('Get trial settings error:', error);
    return { success: false, error: 'Failed to fetch trial settings' };
  }
}

// GDPR Settings: get all
export async function getGDPRSettingsAction() {
  try {
    const response = await ssrGDPRSettingsAPI.getAll();
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to fetch GDPR settings' };
  } catch (error) {
    console.error('Get GDPR settings error:', error);
    return { success: false, error: 'Failed to fetch GDPR settings' };
  }
}

// SEO Settings: get all
export async function getSEOSettingsAction() {
  try {
    const response = await ssrSEOSettingsAPI.getAll();
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to fetch SEO settings' };
  } catch (error) {
    console.error('Get SEO settings error:', error);
    return { success: false, error: 'Failed to fetch SEO settings' };
  }
}

// General Settings: get all
export async function getGeneralSettingsAction() {
  try {
    const response = await ssrGeneralSettingsAPI.getAll();
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to fetch general settings' };
  } catch (error) {
    console.error('Get general settings error:', error);
    return { success: false, error: 'Failed to fetch general settings' };
  }
}

// Payroll: bulk get all for download
export async function bulkGetPayrollAction(filterData: SearchParamsTypes.DownloadSearchParams) {
  try {
    const response = await ssrPayrollAPI.bulkAllDownload(filterData);
    if (response.status === 200 || response.status === 201) {
      const data = response.data;
      // Extract array helper
      const list = Array.isArray(data) ? data :
        (Array.isArray(data?.payrolls) ? data.payrolls :
          (Array.isArray(data?.data) ? data.data :
            (Array.isArray(data?.data?.payrolls) ? data.data.payrolls : [])));

      return { success: true, data: list };
    }
    return { success: false, error: 'Failed to fetch payrolls' };
  } catch (error) {
    console.error('Bulk get payrolls error:', error);
    return { success: false, error: 'Failed to fetch payrolls' };
  }
}

// Payroll: bulk get selected for download
export async function bulkGetSelectedPayrollAction(data: { ids: string[] }) {
  try {
    const response = await ssrPayrollAPI.bulkAllDownload({});
    if (response.status === 200 || response.status === 201) {
      const resData = response.data;
      const list = Array.isArray(resData) ? resData :
        (Array.isArray(resData?.payrolls) ? resData.payrolls :
          (Array.isArray(resData?.data) ? resData.data :
            (Array.isArray(resData?.data?.payrolls) ? resData.data.payrolls : [])));

      const filtered = list.filter((item: any) => {
        const id = item._id || item.id;
        return data.ids.includes(id);
      });

      return { success: true, data: filtered };
    }
    return { success: false, error: 'Failed to fetch selected payrolls' };
  } catch (error) {
    console.error('Bulk get selected payrolls error:', error);
    return { success: false, error: 'Failed to fetch selected payrolls' };
  }
}
// Invoice Design: update
export async function updateInvoiceDesignAction(data: Record<string, unknown>) {
  try {
    const response = await ssrInvoiceDesignAPI.save(data);
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Failed to update invoice design' };
  } catch (error) {
    console.error('Update invoice design error:', error);
    return { success: false, error: 'Failed to update invoice design' };
  }
}
