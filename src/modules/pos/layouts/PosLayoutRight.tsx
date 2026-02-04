/**
 * POS Layout - Right Panel
 * Layout with right sidebar for order panel
 * Used by: pos-2, pos-4
 * Contains NO business logic - only layout structure
 */

'use client';

import React, { ReactNode } from 'react';

export interface PosLayoutRightProps {
    /** Header section */
    header: ReactNode;
    /** Category section (horizontal or as part of main content) */
    categoryBar?: ReactNode;
    /** Main product grid content */
    productGrid: ReactNode;
    /** Right sidebar - Order panel */
    orderPanel: ReactNode;
    /** Mobile category sidebar/drawer */
    mobileCategorySidebar?: ReactNode;
    /** Mobile order sidebar/drawer */
    mobileOrderSidebar?: ReactNode;
    /** Calculator overlay */
    calculatorOverlay?: ReactNode;
    /** Add customer modal */
    addCustomerModal?: ReactNode;
    /** Today's sale modal */
    todaysSaleModal?: ReactNode;
    /** Mobile search bar */
    mobileSearchBar?: ReactNode;
    /** Additional modals/overlays */
    children?: ReactNode;
}

export function PosLayoutRight({
    header,
    categoryBar,
    productGrid,
    orderPanel,
    mobileCategorySidebar,
    mobileOrderSidebar,
    calculatorOverlay,
    addCustomerModal,
    todaysSaleModal,
    mobileSearchBar,
    children,
}: PosLayoutRightProps) {
    return (
        <div className="min-h-screen flex flex-col overflow-x-hidden">
            {/* Header */}
            {header}

            {/* Mobile Search Bar */}
            {mobileSearchBar}

            {/* Mobile Category Menu Overlay */}
            {mobileCategorySidebar}

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Main Product Grid */}
                <div className="flex-1 p-6 overflow-y-auto bg-gray-50 dark:bg-gray-900">
                    {/* Category Selector - Always visible at top */}
                    {categoryBar && (
                        <div className="mb-6">
                            {categoryBar}
                        </div>
                    )}

                    {/* Products */}
                    {productGrid}
                </div>

                {/* Right Sidebar - Order List - Hidden on mobile, visible on lg+ */}
                <div className="hidden lg:block w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 relative">
                    <div className="p-4 h-full flex flex-col overflow-y-auto">
                        {orderPanel}
                    </div>
                </div>
            </div>

            {/* Mobile Order Sidebar */}
            {mobileOrderSidebar}

            {/* Modals & Overlays */}
            {addCustomerModal}
            {calculatorOverlay}
            {todaysSaleModal}

            {/* Additional children (modals, toasts, etc.) */}
            {children}
        </div>
    );
}

export default PosLayoutRight;
