import { getActiveProductsAction, getProductByBarcodeAction, createCustomerActionPOS, getPosScreenDataAction, validateCouponAction, validateRedemptionRuleAction, validateGiftCardAction, createSaleAction, previewBillingAction } from './actions';

import type { Store, Category, RawProduct, Customer, Coupon, Order, RedemptionRule, APIResponse, POSInitData, SalesSummary, StoreChangeData } from './pos.types';


// Product API
export const productAPI = {
    async getActiveProducts(storeId: string, categoryId?: string): Promise<APIResponse<RawProduct[]>> {
        if (!storeId) {
            console.error('getActiveProducts called without storeId');
            return { success: false, data: [], error: 'Store ID is required to fetch products' };
        }

        try {
            const response = await getActiveProductsAction(storeId, categoryId);

            if (!response.success) {
                return { success: false, data: [], error: response.error };
            }

            const products = response?.data?.data?.products || response?.data?.data || response?.data || [];

            if (products.length > 0) {
            }

            // Map API response to RawProduct type, ensuring name property is populated
            const rawProducts: RawProduct[] = products.map((p: any) => ({
                ...p,
                name: p.name || p.productName || 'Unknown Product',
                // Ensure category follows consistent structure if populated
                category: typeof p.category === 'object' && p.category ? {
                    ...p.category,
                    name: p.category.name || p.category.categoryName || 'Unknown Category'
                } : p.category
            }));

            return { success: true, data: rawProducts };
        } catch (error) {
            console.error('Error fetching active products:', error);
            return { success: false, data: [], error: 'Failed to fetch products' };
        }
    },

    // Get product by barcode - returns raw product
    async getProductByBarcode(barcode: string, storeId: string): Promise<APIResponse<RawProduct | null>> {
        try {
            const response = await getProductByBarcodeAction(barcode, storeId);
            if (!response.success) {
                return { success: false, data: null, error: response.error };
            }

            let product = response?.data?.data || response?.data;
            if (Array.isArray(product)) {
                product = product[0];
            }

            if (!product) {
                return { success: false, data: null, error: 'Product not found' };
            }

            const rawProduct: RawProduct = {
                _id: product._id || product.id || '',
                name: product.name || product.productName || 'Unknown Product',
                sku: product.sku || '',
                barcode: product.barcode || '',
                productImage: product.productImage || product.image || '',
                images: product.images || [],
                description: product.description || '',
                purchasePrice: parseFloat(product.purchasePrice) || 0,
                sellingPrice: parseFloat(product.sellingPrice) || parseFloat(product.price) || 0,
                category: product.category || null,
                categoryId: product.categoryId || product.category?._id || '',
                subcategoryId: product.subcategoryId || '',
                brand: product.brand || null,
                unit: product.unit || 'pcs',
                taxPercent: parseFloat(product.taxPercent) || 0,
                taxable: product.taxable ?? true,
                status: product.status || 'active',
                hasVariation: product.hasVariation ?? false,
                variantData: Array.isArray(product.variantData) ? product.variantData : [],
                stock: (typeof product.stock === 'number' || typeof product.stock === 'string') ? { totalStock: Number(product.stock), storeStock: [] } : (product.stock || { totalStock: 0, storeStock: [] }),
                warranty: product.warranty || { hasWarranty: false, duration: 0, unit: '' },
                expiry: product.expiry || { hasExpiry: false, expiryDate: '' },
                lowStockAlert: parseInt(product.lowStockAlert) || 0,
                storeId: product.storeId || storeId,
                createdAt: product.createdAt || '',
                updatedAt: product.updatedAt || '',
            };

            return { success: true, data: rawProduct };
        } catch (error) {
            console.error('Error fetching product by barcode:', error);
            return { success: false, data: null, error: 'Failed to fetch product' };
        }
    },
};

// Customer API - only createCustomer remains, getAllCustomers is now from unified API
export const customerAPI = {
    // Create a new customer
    async createCustomer(customerData: Partial<Customer>): Promise<APIResponse<Customer | null>> {
        try {
            const response = await createCustomerActionPOS(customerData);
            if (!response.success) {
                return { success: false, data: null, error: response.error };
            }

            const customer = response?.data?.data || response?.data;

            if (!customer) {
                return { success: false, data: null, error: 'Failed to create customer' };
            }

            return { success: true, data: customer };
        } catch (error) {
            console.error('Error creating customer:', error);
            return { success: false, data: null, error: 'Failed to create customer' };
        }
    },
};

// Coupon API - getActiveCoupons
export const couponAPI = {
    // Validate a coupon code with optional customerId
    async validateCoupon(code: string, customerId?: string): Promise<APIResponse<Coupon | null>> {
        try {
            const response = await validateCouponAction(code, customerId);

            if (!response.success) {
                return { success: false, data: null, error: response.error };
            }

            // Extract coupon data from API response
            const rawCoupon = response?.data?.data || response?.data;

            if (!rawCoupon) {
                return { success: false, data: null, error: 'Coupon not found' };
            }

            // Map API response to Coupon type, normalizing field names
            // API returns: type: "Fixed" | "Percentage", discount_amount
            // Expected: type: "fixed" | "percentage", value
            const coupon: Coupon = {
                _id: rawCoupon._id || '',
                code: rawCoupon.code || code,
                description: rawCoupon.description || '',
                // Normalize type to lowercase
                type: (rawCoupon.type?.toLowerCase() || 'fixed') as 'percentage' | 'fixed',
                // Map discount_amount to value
                value: rawCoupon.discount_amount ?? rawCoupon.value ?? 0,
                discount_amount: rawCoupon.discount_amount,
                minPurchase: rawCoupon.minPurchase || rawCoupon.min_purchase,
                maxDiscount: rawCoupon.maxDiscount || rawCoupon.max_discount,
                limit: rawCoupon.limit,
                usageLimit: rawCoupon.usageLimit || rawCoupon.limit,
                usageCount: rawCoupon.usageCount,
                usedCount: rawCoupon.usedCount || rawCoupon.usageCount,
                maxUsagePerUser: rawCoupon.maxUsagePerUser,
                start_date: rawCoupon.start_date,
                end_date: rawCoupon.end_date,
                startDate: rawCoupon.startDate || rawCoupon.start_date,
                endDate: rawCoupon.endDate || rawCoupon.end_date,
                status: rawCoupon.status,
            };

            return { success: true, data: coupon };
        } catch (error) {
            console.error('Error validating coupon:', error);
            return { success: false, data: null, error: 'Failed to validate coupon' };
        }
    },
};

export const redemptionRuleAPI = {
    async validate(customerId: string): Promise<APIResponse<any>> {
        try {
            const response = await validateRedemptionRuleAction(customerId);
            if (!response.success) {
                return { success: false, data: null, error: response.error };
            }
            return { success: true, data: response.data };
        } catch (error) {
            console.error('Error validating redemption rule:', error);
            return { success: false, data: null, error: 'Failed to validate redemption rule' };
        }
    }
};

export const giftCardAPI = {
    async validate(data: { number: string; customerId: string; purchaseAmount: number }): Promise<APIResponse<any>> {
        try {
            const response = await validateGiftCardAction(data);
            if (!response.success) {
                return { success: false, data: null, error: response.error };
            }
            return { success: true, data: response.data };
        } catch (error) {
            console.error('Error validating gift card:', error);
            return { success: false, data: null, error: 'Failed to validate gift card' };
        }
    }
};

// Order API
export const orderAPI = {
    // Create a new order (Sale)
    async createSale(orderData: any): Promise<APIResponse<any>> {
        try {
            const response = await createSaleAction(orderData);

            if (!response.success) {
                return { success: false, data: null, error: response.error };
            }

            return { success: true, data: response.data };
        } catch (error) {
            console.error('Error creating sale:', error);
            return { success: false, data: null, error: 'Failed to create sale' };
        }
    },

    // Preview Billing
    async previewBilling(saleId: string): Promise<APIResponse<any>> {
        try {
            const response = await previewBillingAction(saleId);

            if (!response.success) {
                return { success: false, data: null, error: response.error };
            }

            return { success: true, data: response.data };
        } catch (error) {
            console.error('Error previewing billing:', error);
            return { success: false, data: null, error: 'Failed to preview billing' };
        }
    },

    // Get today's sales summary
    async getTodaysSales(storeId: string): Promise<APIResponse<SalesSummary | null>> {
        try {
            // This would call the actual sales API
            return {
                success: true,
                data: {
                    totalSales: 0,
                    totalOrders: 0,
                    totalCash: 0,
                    totalCard: 0,
                },
            };
        } catch (error) {
            console.error('Error fetching today\'s sales:', error);
            return { success: false, data: null, error: 'Failed to fetch sales' };
        }
    },
};

// Consolidated POS API
export const posAPI = {
    product: productAPI,
    customer: customerAPI,
    coupon: couponAPI,
    order: orderAPI,

    // Initialize POS with all required data
    async initialize(opts?: { storeId?: string; userAssignedStoreId?: string }): Promise<APIResponse<POSInitData>> {
        try {
            // Step 1: Fetch all POS initialization data in a single API call
            const posScreenResponse = await getPosScreenDataAction();

            if (!posScreenResponse.success) {
                return {
                    success: false,
                    data: {
                        stores: [],
                        selectedStoreId: null,
                        categories: [],
                        products: [],
                        customers: [],
                        coupons: [],
                        redemptionRules: [],
                    },
                    error: posScreenResponse.error || 'Failed to fetch POS initialization data',
                };
            }

            // Extract data from API response
            const responseData = posScreenResponse.data?.data || posScreenResponse.data || {};
            const rawStores = responseData.stores || [];
            const rawCategories = responseData.categories || [];
            const rawCustomers = responseData.customers || [];
            const rawCoupons = responseData.coupons || [];
            const rawRedemptionRules = responseData.redemptionRules || [];

            // Direct assignment as requested
            const stores: Store[] = rawStores;

            if (stores.length === 0) {
                return {
                    success: false,
                    data: {
                        stores: [],
                        selectedStoreId: null,
                        categories: [],
                        products: [],
                        customers: [],
                        coupons: [],
                        redemptionRules: [],
                    },
                    error: 'No stores available',
                };
            }

            // Step 2: Determine selectedStoreId
            // Priority: User assigned store > Provided storeId > First available store
            let selectedStoreId: string | null = null;

            if (opts?.userAssignedStoreId) {
                const assignedStore = stores.find((s) => s._id === opts.userAssignedStoreId);
                if (assignedStore) {
                    selectedStoreId = assignedStore._id;
                }
            }

            if (!selectedStoreId && opts?.storeId) {
                const providedStore = stores.find((s) => s._id === opts.storeId);
                if (providedStore) {
                    selectedStoreId = providedStore._id;
                }
            }

            if (!selectedStoreId) {
                selectedStoreId = stores[0]._id;
            }

            const categories: Category[] = [
                {
                    _id: 'all',
                    id: 'all',
                    name: 'All Categories',
                    status: 'active',
                },
                ...rawCategories.map((c: any) => ({
                    ...c,
                    name: c.name || c.categoryName || 'Unknown Category'
                })),
            ];

            // Map customers to ensure name property is populated
            const customers: Customer[] = rawCustomers.map((c: any) => ({
                ...c,
                name: c.name || c.customerName || c.fullName || 'Unknown Customer'
            }));
            // Map coupons to normalize field names
            // API returns: type: "Fixed" | "Percentage", discount_amount
            // Expected: type: "fixed" | "percentage", value
            const coupons: Coupon[] = rawCoupons.map((c: any) => ({
                _id: c._id || '',
                code: c.code || '',
                description: c.description || '',
                // Normalize type to lowercase
                type: (c.type?.toLowerCase() || 'fixed') as 'percentage' | 'fixed',
                // Map discount_amount to value
                value: c.discount_amount ?? c.value ?? 0,
                discount_amount: c.discount_amount,
                minPurchase: c.minPurchase || c.min_purchase,
                maxDiscount: c.maxDiscount || c.max_discount,
                limit: c.limit,
                usageLimit: c.usageLimit || c.limit,
                usageCount: c.usageCount,
                usedCount: c.usedCount || c.usageCount,
                maxUsagePerUser: c.maxUsagePerUser,
                start_date: c.start_date,
                end_date: c.end_date,
                startDate: c.startDate || c.start_date,
                endDate: c.endDate || c.end_date,
                status: c.status,
            }));
            const redemptionRules: RedemptionRule[] = rawRedemptionRules;

            // Step 3: Fetch products for the selected store (still separate API call)
            const productsResponse = await productAPI.getActiveProducts(selectedStoreId!);

            return {
                success: true,
                data: {
                    stores,
                    selectedStoreId,
                    categories,
                    products: productsResponse.data,
                    customers,
                    coupons,
                    redemptionRules,
                },
            };
        } catch (error) {
            console.error('Error initializing POS:', error);
            return {
                success: false,
                data: {
                    stores: [],
                    selectedStoreId: null,
                    categories: [],
                    products: [],
                    customers: [],
                    coupons: [],
                    redemptionRules: [],
                },
                error: 'Failed to initialize POS',
            };
        }
    },

    // Handle store change - clears and refetches store-dependent data
    async onStoreChange(newStoreId: string): Promise<APIResponse<StoreChangeData>> {
        if (!newStoreId) {
            return { success: false, data: { products: [] }, error: 'Store ID is required' };
        }

        try {
            // Fetch products for the new store
            const productsResponse = await productAPI.getActiveProducts(newStoreId);

            return {
                success: productsResponse.success,
                data: {
                    products: productsResponse.data,
                },
                error: productsResponse.error,
            };
        } catch (error) {
            console.error('Error handling store change:', error);
            return { success: false, data: { products: [] }, error: 'Failed to load store data' };
        }
    },
};

export default posAPI;
