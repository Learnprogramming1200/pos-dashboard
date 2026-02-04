'use client';

import { useEffect, useCallback, useMemo, useRef } from 'react';
import { useSession } from "next-auth/react";
import { usePOSStoreCore } from './hooks/usePOSStoreCore';
import { usePOSProductCore } from './hooks/usePOSProductCore';
import { usePOSCartCore } from './hooks/usePOSCartCore';
import { usePOSUIState } from './hooks/usePOSUIState';
import { posAPI } from './pos.api';
import { convertSimpleProduct, convertVariantToProduct } from './hooks/usePOSProductCore';
import { toast } from 'react-toastify';
import type { POSContextValue, POSLoadingState, POSError, UserRole, Product } from './pos.types';

// Hook Options
export interface UsePOSCoreOptions {
    initialStoreId?: string;
    enableAutoRefresh?: boolean;
    refreshInterval?: number;
}

// Main Hook
export function usePOSCore(options: UsePOSCoreOptions = {}): POSContextValue {
    const { initialStoreId, enableAutoRefresh = false, refreshInterval = 300000 } = options;

    // Get auth context
    const { data: session } = useSession();
    const user = session?.user;

    // Determine user role
    const userRole: UserRole = useMemo(() => {
        if (!user) return 'cashier';
        const role = (user as any).role?.toLowerCase() || '';
        if (role.includes('superadmin')) return 'superadmin';
        if (role.includes('admin')) return 'admin';
        if (role.includes('manager')) return 'manager';
        return 'cashier';
    }, [user]);

    // Get user's assigned store (for cashiers)
    // Fix: Cast to any to access storeId which might exist on generic user object
    const userAssignedStoreId = (user as any)?.storeId || undefined;

    // Track initialization
    const isInitialized = useRef(false);
    const isInitializing = useRef(false);

    // Store management
    const storeCore = usePOSStoreCore({
        initialStoreId,
        userRole,
        userAssignedStoreId,
    });

    // Product management (with variant expansion)
    const productCore = usePOSProductCore({
        storeId: storeCore.selectedStoreId,
    });

    // Cart management
    const cartCore = usePOSCartCore();

    // UI state
    const uiState = usePOSUIState({
        userName: user?.name,
        userId: user?.id,
    });

    // Combined Loading State
    const loading: POSLoadingState = useMemo(() => ({
        initializing: !isInitialized.current && isInitializing.current,
        stores: storeCore.isLoading,
        categories: productCore.isLoadingCategories,
        products: productCore.isLoadingProducts,
        customers: cartCore.isLoadingCustomers,
    }), [
        storeCore.isLoading,
        productCore.isLoadingCategories,
        productCore.isLoadingProducts,
        cartCore.isLoadingCustomers,
    ]);

    // Combined Error State
    const error: POSError | null = useMemo(() => {
        const errorMessage = storeCore.error || productCore.error;
        if (!errorMessage) return null;
        return {
            type: 'api',
            message: errorMessage,
        } as POSError;
    }, [storeCore.error, productCore.error]);

    // Ready State
    const isReady = useMemo(() => {
        return isInitialized.current &&
            storeCore.stores.length > 0 &&
            !!storeCore.selectedStoreId;
    }, [storeCore.stores.length, storeCore.selectedStoreId]);

    // Store Change Handler
    const setSelectedStore = useCallback(async (storeId: string) => {
        // SECURITY: Prevent store change if not allowed
        if (!storeCore.canChangeStore) {
            console.warn('Store change blocked: User role does not allow');
            return;
        }

        // Clear cart and products BEFORE fetching new data
        cartCore.resetCart();
        productCore.clearProducts();

        // Update store selection
        await storeCore.setSelectedStore(storeId);

        // Fetch products for new store
        if (storeId) {
            await productCore.fetchProducts(storeId);
        }
    }, [storeCore, productCore, cartCore]);

    // Calculate Live Stock (Total - In Cart)
    const productsWithLiveStock = useMemo(() => {
        return productCore.products.map(product => {
            const cartItem = cartCore.getOrderItemByProductId(product._id);
            const inCartQty = cartItem ? cartItem.quantity : 0;
            return {
                ...product,
                stock: Math.max(0, product.stock - inCartQty)
            };
        });
    }, [productCore.products, cartCore.orderItems]);

    // Enhanced Filtered Products with Live Stock
    const filteredProductsWithLiveStock = useMemo(() => {
        return productCore.filteredProducts.map(product => {
            const cartItem = cartCore.getOrderItemByProductId(product._id);
            const inCartQty = cartItem ? cartItem.quantity : 0;
            return {
                ...product,
                stock: Math.max(0, product.stock - inCartQty)
            };
        });
    }, [productCore.filteredProducts, cartCore.orderItems]);

    // Add to Order with Stock Validation (Toast Notification)
    const addToOrder = useCallback((product: Product) => {
        // 1. Validation for User Interface state (Remaining Stock)
        if (product.stock <= 0) {
            toast.error(`Stock limit reached for ${product.name}`, {
                position: "top-center",
                autoClose: 2000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: false,
                draggable: true,
            });
            return;
        }

        // 2. Prepare Product for Cart Core (Needs Total Stock for integrity checks)
        // Since UI passes "Remaining Stock", we must restore "Total Stock"
        const existingItem = cartCore.getOrderItemByProductId(product._id);
        const currentQty = existingItem ? existingItem.quantity : 0;

        // Restore total stock estimate (Remaining + Cart)
        // Note: usage of Math.max(0) in map implies we can't perfectly reverse if oversold, 
        // but it's safe enough for blocking add.
        const productForCart = {
            ...product,
            stock: product.stock + currentQty
        };

        cartCore.addToOrder(productForCart);
    }, [cartCore]);

    // Initialization Effect - Use unified API to fetch all POS data
    useEffect(() => {
        const initialize = async () => {
            if (isInitialized.current || isInitializing.current) return;

            isInitializing.current = true;

            try {
                // Use the unified POS initialization API
                const result = await posAPI.initialize({
                    storeId: initialStoreId,
                    userAssignedStoreId: userAssignedStoreId,
                });

                if (!result.success || result.data.stores.length === 0) {
                    console.error('POS initialization failed:', result.error || 'No stores available');
                } else {
                    // Set stores data
                    storeCore.setStoresData(result.data.stores, result.data.selectedStoreId);

                    // Set categories data
                    productCore.setCategoriesData(result.data.categories);

                    // Set customers and coupons data
                    cartCore.setCustomersData(result.data.customers);
                    cartCore.setCouponsData(result.data.coupons);
                    cartCore.setRedemptionRulesData(result.data.redemptionRules);

                    // Fetch products for the selected store (products are still fetched separately)
                    if (result.data.selectedStoreId) {
                        await productCore.fetchProducts(result.data.selectedStoreId);
                    }
                }

                isInitialized.current = true;
            } catch (err) {
                console.error('POS initialization error:', err);
            } finally {
                isInitializing.current = false;
            }
        };

        initialize();
    }, []); // Run once on mount

    // Auto-refresh Effect (Optional)
    useEffect(() => {
        if (!enableAutoRefresh || !isInitialized.current || !storeCore.selectedStoreId) {
            return;
        }

        const interval = setInterval(() => {
            productCore.fetchProducts(storeCore.selectedStoreId!, productCore.selectedCategoryId);
        }, refreshInterval);

        return () => clearInterval(interval);
    }, [enableAutoRefresh, refreshInterval, storeCore.selectedStoreId, productCore]);

    // Reset POS
    const resetPOS = useCallback(async () => {
        cartCore.resetCart();
        productCore.clearProducts();

        if (storeCore.selectedStoreId) {
            await productCore.fetchProducts(storeCore.selectedStoreId);
        }
    }, [cartCore, productCore, storeCore.selectedStoreId]);

    // GLOBAL BARCODE SCANNER LOGIC
    const barcodeBuffer = useRef<string>('');
    const lastKeyTime = useRef<number>(0);
    const BARCODE_DELAY = 50; // ms threshold for hardware scanner input speed

    const handleBarcodeScan = useCallback(async (barcode: string) => {
        // Must have selected store
        if (!storeCore.selectedStoreId) {
            console.warn('Scan ignored: No store selected');
            return;
        }

        try {
            // Fetch product via API (Real-time check)
            const response = await posAPI.product.getProductByBarcode(barcode, storeCore.selectedStoreId);

            if (!response.success || !response.data) {
                console.warn('Product not found for barcode:', barcode);
                // Can trigger error state if UI needs it
                return;
            }

            const rawProduct = response.data;
            let productToAdd: Product | null = null;

            // Handle Variations
            if (rawProduct.hasVariation) {
                // Enterprise Rule: Match scanned barcode exactly with variant barcode
                const matchingVariant = rawProduct.variantData?.find(v => v.barcode === barcode);

                if (matchingVariant) {
                    productToAdd = convertVariantToProduct(matchingVariant, rawProduct, storeCore.selectedStoreId);
                } else {
                    console.warn('Variant not found for barcode (scanned parent?):', barcode);
                    // If scanning parent barcode but it has variations, behavior depends on spec.
                    // Spec says: "Match scanned barcode with variant.barcode". 
                    // If no variant matches, we arguably shouldn't add anything or maybe add parent if valid?
                    // "ONLY that variant is added." implies strictly variant match.
                }
            } else {
                // Simple Product
                productToAdd = convertSimpleProduct(rawProduct, storeCore.selectedStoreId);
            }

            if (productToAdd) {
                // SYNC STOCK WITH LOADED PRODUCTS (Source of Truth)
                // The barcode API might return partial/incorrect stock. We prioritize the fully loaded product data if available.
                const cachedProduct = productCore.products.find(p => p._id === productToAdd._id);
                if (cachedProduct) {
                    productToAdd.stock = cachedProduct.stock;
                }

                // Check if already in cart to calculate remaining stock for validation
                const existingItem = cartCore.getOrderItemByProductId(productToAdd._id);
                const currentQty = existingItem ? existingItem.quantity : 0;

                // Calculate real-time remaining stock
                const remainingStock = productToAdd.stock - currentQty;

                // Update product object to reflect remaining stock before passing to addToOrder
                const productWithLiveStock = {
                    ...productToAdd,
                    stock: Math.max(0, remainingStock)
                };

                addToOrder(productWithLiveStock);
            }

        } catch (err) {
            console.error('Error handling barcode scan:', err);
        }
    }, [storeCore.selectedStoreId, addToOrder]);

    // Global Key Listener
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore input on form fields
            const target = e.target as HTMLElement;
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;

            const currentTime = Date.now();

            if (e.key === 'Enter') {
                if (barcodeBuffer.current.length > 2) { // Minimum length to trigger
                    handleBarcodeScan(barcodeBuffer.current);
                }
                barcodeBuffer.current = '';
                return;
            }

            // Reset buffer if manual typing determined by delay
            if (currentTime - lastKeyTime.current > BARCODE_DELAY && barcodeBuffer.current.length > 0) {
                // Reset buffer if too slow (likely manual typing)
                barcodeBuffer.current = '';
            }

            // Accumulate printable characters
            if (e.key.length === 1) {
                barcodeBuffer.current += e.key;
            }

            lastKeyTime.current = currentTime;
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleBarcodeScan]);

    // Refresh All Data
    const refreshAll = useCallback(async () => {
        if (!storeCore.selectedStoreId) return;

        await Promise.all([
            (async () => { await storeCore.fetchStores(); })(),
            (async () => { await productCore.fetchCategories(); })(),
            (async () => { if (storeCore.selectedStoreId) await productCore.fetchProducts(storeCore.selectedStoreId, productCore.selectedCategoryId); })(),
            (async () => { await cartCore.fetchCustomers(); })(),
            cartCore.fetchCoupons(),
        ]);
    }, [storeCore, productCore, cartCore]);

    // Return Combined Context Value
    return {
        // Store
        stores: storeCore.stores,
        selectedStoreId: storeCore.selectedStoreId,
        selectedStore: storeCore.selectedStore,
        canChangeStore: storeCore.canChangeStore,
        setSelectedStore,
        refreshStores: async () => { await storeCore.fetchStores(); },

        // User & Role
        user: user as any, // Cast to match POSUser interface
        userRole,

        // Categories
        categories: productCore.categories,
        selectedCategoryId: productCore.selectedCategoryId,
        setSelectedCategory: async (categoryId: string) => {
            productCore.setSelectedCategory(categoryId);
            if (storeCore.selectedStoreId) {
                await productCore.fetchProducts(storeCore.selectedStoreId, categoryId);
            }
        },
        getCategoryById: productCore.getCategoryById,
        refreshCategories: async () => { await productCore.fetchCategories(); },

        // Products (with Live Stock)
        products: productsWithLiveStock,
        filteredProducts: filteredProductsWithLiveStock,
        searchQuery: productCore.searchQuery,
        setSearchQuery: productCore.setSearchQuery,
        getFilteredProducts: (search?: string, categoryId?: string) => {
            // Re-implement filter over the live stock products
            // This ensures search results also show correct stock
            const baseFiltered = productCore.getFilteredProducts(search, categoryId);
            return baseFiltered.map(p => {
                const cartItem = cartCore.getOrderItemByProductId(p._id);
                return {
                    ...p,
                    stock: Math.max(0, p.stock - (cartItem?.quantity || 0))
                };
            });
        },
        refreshProducts: async () => { if (storeCore.selectedStoreId) await productCore.fetchProducts(storeCore.selectedStoreId, productCore.selectedCategoryId); },

        // Order
        orderItems: cartCore.orderItems,
        currentOrderNumber: cartCore.currentOrderNumber,
        addToOrder,
        updateOrderItemQuantity: useCallback((itemId: string, newQty: number) => {
            // Validate Stock Limit
            const orderItem = cartCore.orderItems.find(item => item.id === itemId);
            if (orderItem) {
                // Find original product to check Total Stock
                // Note: productCore.products contain the Authoritative Total Stock from API
                const product = productCore.products.find(p => p._id === orderItem.productId);

                if (product && product.stock > 0 && newQty > product.stock) {
                    toast.error(`Stock limit reached for ${product.name}`, {
                        position: "top-center",
                        autoClose: 2000,
                        hideProgressBar: true,
                        closeOnClick: true,
                        pauseOnHover: false,
                        draggable: true,
                    });
                    return;
                }
            }

            cartCore.updateOrderItemQuantity(itemId, newQty);
        }, [cartCore, productCore.products]),
        removeFromOrder: cartCore.removeFromOrder,
        clearOrder: cartCore.clearOrder,

        // Calculations
        productPrice: cartCore.productPrice,
        discount: cartCore.discount,
        productDiscount: cartCore.productDiscount,
        couponDiscount: cartCore.couponDiscount,
        loyaltyDiscount: cartCore.loyaltyDiscount,
        giftCardDiscount: cartCore.giftCardDiscount,
        subTotal: cartCore.subTotal,
        tax: cartCore.tax,
        hasInclusiveTax: cartCore.hasInclusiveTax,
        hasExclusiveTax: cartCore.hasExclusiveTax,
        shipping: cartCore.shipping,
        grandTotal: cartCore.grandTotal,
        roundOff: cartCore.roundOff,

        // Customer
        customers: cartCore.customers,
        selectedCustomer: cartCore.selectedCustomer,
        setSelectedCustomer: cartCore.setSelectedCustomer,
        refreshCustomers: async () => { await cartCore.fetchCustomers(); },
        createCustomer: cartCore.createCustomer,

        // Coupon
        coupons: cartCore.coupons,
        appliedCoupon: cartCore.appliedCoupon,
        applyCoupon: cartCore.applyCoupon,
        removeCoupon: cartCore.removeCoupon,
        applyLoyalty: cartCore.applyLoyalty,
        removeLoyalty: cartCore.removeLoyalty,
        applyGiftCard: cartCore.applyGiftCard,
        removeGiftCard: cartCore.removeGiftCard,

        // Redemption Rules
        redemptionRules: cartCore.redemptionRules,

        // Payment
        selectedPaymentMethod: cartCore.selectedPaymentMethod,
        setSelectedPaymentMethod: cartCore.setSelectedPaymentMethod,

        // UI State
        isFullscreen: uiState.isFullscreen,
        toggleFullscreen: uiState.toggleFullscreen,
        darkMode: uiState.darkMode,
        toggleDarkMode: uiState.toggleDarkMode,
        isCalculatorOpen: uiState.isCalculatorOpen,
        setIsCalculatorOpen: uiState.setIsCalculatorOpen,
        isAddCustomerModalOpen: uiState.isAddCustomerModalOpen,
        setIsAddCustomerModalOpen: uiState.setIsAddCustomerModalOpen,
        currentTime: uiState.currentTime,
        formattedDate: uiState.formattedDate,
        formattedTime: uiState.formattedTime,
        cashierInfo: uiState.cashierInfo,
        registerInfo: uiState.registerInfo,
        handleBack: uiState.handleBack,

        // Status
        loading,
        error,
        isReady,

        // Actions
        resetPOS,
        refreshAll,
    };
}
