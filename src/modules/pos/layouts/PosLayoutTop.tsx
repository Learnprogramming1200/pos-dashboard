/**
 * POS Layout - Top Category Bar
 * Layout with top/horizontal category filtering
 * Used by: pos-3, pos-5
 * Contains NO business logic - only layout structure
 */

'use client';

import React, { ReactNode } from 'react';

export interface PosLayoutTopProps {
    /** Header section */
    header: ReactNode;
    /** Left sidebar - Categories (vertical on desktop) */
    categorySidebar?: ReactNode;
    /** Main product grid content */
    productGrid: ReactNode;
    /** Right sidebar - Order panel */
    orderPanel: ReactNode;
    /** Middle action buttons panel (optional - used in pos-3) */
    actionPanel?: ReactNode;
    /** Bottom action bar (optional - used in pos-5) */
    bottomActionBar?: ReactNode;
    /** Mobile category drawer */
    mobileCategoryDrawer?: ReactNode;
    /** Mobile cart/order drawer */
    mobileCartDrawer?: ReactNode;
    /** Mobile search bar */
    mobileSearchBar?: ReactNode;
    /** Calculator overlay */
    calculatorOverlay?: ReactNode;
    /** Additional modals/overlays */
    children?: ReactNode;
}

export function PosLayoutTop({
    header,
    categorySidebar,
    productGrid,
    orderPanel,
    actionPanel,
    bottomActionBar,
    mobileCategoryDrawer,
    mobileCartDrawer,
    mobileSearchBar,
    calculatorOverlay,
    children,
}: PosLayoutTopProps) {
    return (
        <div className="h-screen w-full flex flex-col overflow-hidden">
            {/* Header */}
            {header}

            {/* Mobile Search Bar */}
            {mobileSearchBar}

            {/* Main Content */}
            <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
                {/* Left Sidebar - Categories (Desktop) */}
                {categorySidebar}

                {/* Center - Product Grid */}
                <div className="flex-1 overflow-y-auto p-2 sm:p-3 md:p-4 lg:p-5 xl:p-6 bg-gray-50 dark:bg-gray-900 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-track]:bg-neutral-700 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500">
                    {productGrid}
                </div>

                {/* Middle Panel - Action Buttons (optional) */}
                {actionPanel}

                {/* Right Panel - Order Details */}
                <div className="hidden lg:flex flex-col w-full sm:w-80 md:w-96 lg:w-80 xl:w-96 2xl:w-96 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700">
                    {orderPanel}
                </div>
            </div>

            {/* Bottom Action Bar (optional - for pos-5 style) */}
            {bottomActionBar}

            {/* Mobile Drawers */}
            {mobileCategoryDrawer}
            {mobileCartDrawer}

            {/* Overlays */}
            {calculatorOverlay}

            {/* Additional children */}
            {children}
        </div>
    );
}

export default PosLayoutTop;
