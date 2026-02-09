'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { usePOSCore, UsePOSCoreOptions } from './usePOSCore';
import type { POSContextValue } from './pos.types';

// Context
const POSContext = createContext<POSContextValue | undefined>(undefined);

// Provider Props
export interface POSProviderProps extends UsePOSCoreOptions {
    children: ReactNode;
}

// Provider Component
export function POSProvider({
    children,
    initialStoreId,
    enableAutoRefresh,
    refreshInterval,
}: POSProviderProps) {
    const posValue = usePOSCore({
        initialStoreId,
        enableAutoRefresh,
        refreshInterval,
    });

    return (
        <POSContext.Provider value={posValue}>
            {children}
        </POSContext.Provider>
    );
}

// Consumer Hook
export function usePOS(): POSContextValue {
    const context = useContext(POSContext);

    if (context === undefined) {
        throw new Error('usePOS must be used within a POSProvider');
    }

    return context;
}

// HOC for Class Components (if needed)
export function withPOS<P extends object>(
    WrappedComponent: React.ComponentType<P & POSContextValue>
) {
    const displayName = WrappedComponent.displayName || WrappedComponent.name || 'Component';

    const ComponentWithPOS = (props: P) => {
        const posContext = usePOS();
        return <WrappedComponent {...props} {...posContext} />;
    };

    ComponentWithPOS.displayName = `withPOS(${displayName})`;

    return ComponentWithPOS;
}

// Selector Hooks (Performance Optimization)

/**
 * Hook to select only store-related state
 * Use this instead of usePOS when you only need store data
 */
export function usePOSStore() {
    const context = usePOS();

    return {
        stores: context.stores,
        selectedStoreId: context.selectedStoreId,
        selectedStore: context.selectedStore,
        canChangeStore: context.canChangeStore,
        setSelectedStore: context.setSelectedStore,
        loading: context.loading.stores,
    };
}

// Hook to select only category-related state
export function usePOSCategories() {
    const context = usePOS();

    return {
        categories: context.categories,
        selectedCategoryId: context.selectedCategoryId,
        setSelectedCategory: context.setSelectedCategory,
        getCategoryById: context.getCategoryById,
        loading: context.loading.categories,
    };
}

// Hook to select only product-related state
export function usePOSProducts() {
    const context = usePOS();

    return {
        products: context.products,
        filteredProducts: context.filteredProducts,
        searchQuery: context.searchQuery,
        setSearchQuery: context.setSearchQuery,
        getFilteredProducts: context.getFilteredProducts,
        loading: context.loading.products,
    };
}

// Hook to select only order-related state
export function usePOSOrder() {
    const context = usePOS();
    return {
        orderItems: context.orderItems,
        currentOrderNumber: context.currentOrderNumber,
        productPrice: context.productPrice,
        tax: context.tax,
        discount: context.discount,
        shipping: context.shipping,
        grandTotal: context.grandTotal,
        addToOrder: context.addToOrder,
        updateOrderItemQuantity: context.updateOrderItemQuantity,
        removeFromOrder: context.removeFromOrder,
        clearOrder: context.clearOrder,
        appliedCoupon: context.appliedCoupon,
        applyCoupon: context.applyCoupon,
        removeCoupon: context.removeCoupon,
    };
}

// Hook to select only header-related state
export function usePOSHeader() {
    const context = usePOS();

    return {
        searchQuery: context.searchQuery,
        setSearchQuery: context.setSearchQuery,
        isFullscreen: context.isFullscreen,
        toggleFullscreen: context.toggleFullscreen,
        darkMode: context.darkMode,
        toggleDarkMode: context.toggleDarkMode,
        currentTime: context.currentTime,
        formattedDate: context.formattedDate,
        formattedTime: context.formattedTime,
        cashierInfo: context.cashierInfo,
        registerInfo: context.registerInfo,
        isCalculatorOpen: context.isCalculatorOpen,
        setIsCalculatorOpen: context.setIsCalculatorOpen,
        handleBack: context.handleBack,
        selectedStore: context.selectedStore,
        stores: context.stores,
        canChangeStore: context.canChangeStore,
        setSelectedStore: context.setSelectedStore,
    };
}

// Hook to select only payment-related state
export function usePOSPayment() {
    const context = usePOS();

    return {
        selectedPaymentMethod: context.selectedPaymentMethod,
        setSelectedPaymentMethod: context.setSelectedPaymentMethod,
        grandTotal: context.grandTotal,
        selectedCustomer: context.selectedCustomer,
        setSelectedCustomer: context.setSelectedCustomer,
        customers: context.customers,
    };
}

// Hook to check POS readiness state
export function usePOSReady() {
    const context = usePOS();

    return {
        isReady: context.isReady,
        loading: context.loading,
        error: context.error,
    };
}

export default POSProvider;
