'use server';

import { ssrPosScreenAPI, ssrProductAPI, ssrCustomerAPI, ssrAdminCouponAPI, ssrLoyaltyPointsRedeemAPI, ssrGiftCardAPI, ssrSalesAPI } from '@/lib/ssr-api';

// POS Screen Initialization Action - fetches all data in a single API call
export async function getPosScreenDataAction() {
    try {
        const response = await ssrPosScreenAPI.getAll();
        return {
            success: response.status === 200,
            data: response.data,
        };
    } catch (error: any) {
        console.error('Error in getPosScreenDataAction:', error);
        return { success: false, error: error.message };
    }
}

// All Active Products 
export async function getActiveProductsAction(storeId: string, categoryId?: string) {
    try {
        const response = await ssrProductAPI.getActive(storeId, categoryId);
        return {
            success: response.status === 200,
            data: response.data,
        };
    } catch (error: any) {
        console.error('Error in getActiveProductsAction:', error);
        return { success: false, error: error.message };
    }
}

// Get Product By Barcode
// Get Product By Barcode
export async function getProductByBarcodeAction(barcode: string, storeId?: string) {
    try {
        const response = await ssrProductAPI.getActiveByBarcode(barcode, storeId);
        return {
            success: response.status === 200,
            data: response.data,
        };
    } catch (error: any) {
        console.error('Error in getProductByBarcodeAction:', error);
        return { success: false, error: error.message };
    }
}

// Create Customer
export async function createCustomerActionPOS(data: any) {
    try {
        const response = await ssrCustomerAPI.create(data);
        return {
            success: response.status === 200 || response.status === 201,
            data: response.data,
        };
    } catch (error: any) {
        console.error('Error in createCustomerActionPOS:', error);
        return { success: false, error: error.message };
    }
}

// Coupon Actions
// Coupon Actions
export async function validateCouponAction(code: string, customerId?: string) {
    try {
        const response = await ssrAdminCouponAPI.validate(code, customerId);
        return {
            success: response.status === 200,
            data: response.data,
        };
    } catch (error: any) {
        console.error('Error in validateCouponAction:', error);
        return { success: false, error: error.message };
    }
}

// Redemption Rule Actions
export async function validateRedemptionRuleAction(customerId: string) {
    try {
        const response = await ssrLoyaltyPointsRedeemAPI.validate(customerId);
        return {
            success: response.status === 200,
            data: response.data,
        };
    } catch (error: any) {
        console.error('Error in validateRedemptionRuleAction:', error);
        return { success: false, error: error.message };
    }
}

// Gift Card Actions
export async function validateGiftCardAction(data: { number: string; customerId: string; purchaseAmount: number }) {
    try {
        const response = await ssrGiftCardAPI.validate(data);
        return {
            success: response.status === 200,
            data: response.data,
        };
    } catch (error: any) {
        console.error('Error in validateGiftCardAction:', error);
        return { success: false, error: error.message };
    }
}

// Sales Actions
export async function createSaleAction(data: Record<string, unknown>) {
    try {
        const response = await ssrSalesAPI.create(data);
        if (response.status === 200 || response.status === 201) {
            return { success: true, data: response.data };
        }
        return { success: false, error: 'Failed to create sale' };
    } catch (error: any) {
        console.error('Error in createSaleAction:', error);
        return { success: false, error: error.message || 'Failed to create sale' };
    }
}

export async function previewBillingAction(saleId: string) {
    try {
        const response = await ssrSalesAPI.previewBilling(saleId);
        if (response.status === 200 || response.status === 201) {
            return { success: true, data: response.data };
        }
        return { success: false, error: 'Failed to preview billing' };
    } catch (error: any) {
        console.error('Error in previewBillingAction:', error);
        return { success: false, error: error.message || 'Failed to preview billing' };
    }
}
