'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

export interface PosLoadingUIProps {
    message?: string;
    fullScreen?: boolean;
    className?: string;
}

export function PosLoadingUI({
    message = 'Loading...',
    fullScreen = false,
    className = '',
}: PosLoadingUIProps) {
    const content = (
        <div className="flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
            <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">{message}</p>
        </div>
    );

    if (fullScreen) {
        return (
            <div className={`fixed inset-0 bg-white dark:bg-gray-900 flex items-center justify-center z-50 ${className}`}>
                {content}
            </div>
        );
    }

    return (
        <div className={`flex items-center justify-center p-8 ${className}`}>
            {content}
        </div>
    );
}

/**
 * Skeleton loading for products grid
 */
export function ProductGridSkeleton({
    count = 12,
    gridCols = 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6',
}: {
    count?: number;
    gridCols?: string;
}) {
    return (
        <div className={`grid ${gridCols} gap-4`}>
            {Array.from({ length: count }).map((_, index) => (
                <div
                    key={index}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 animate-pulse"
                >
                    <div className="p-4">
                        <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg mb-3" />
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-3/4" />
                        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                    </div>
                </div>
            ))}
        </div>
    );
}

/**
 * Skeleton loading for order panel
 */
export function OrderPanelSkeleton() {
    return (
        <div className="p-4 animate-pulse">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-24" />
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-28" />
            </div>

            {/* Customer select */}
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded mb-4" />

            {/* Order items */}
            <div className="space-y-3 mb-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
                        <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded mb-2 w-3/4" />
                        <div className="flex justify-between">
                            <div className="h-6 bg-gray-200 dark:bg-gray-600 rounded w-20" />
                            <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-16" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Summary */}
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 space-y-2">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex justify-between">
                        <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-16" />
                        <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-12" />
                    </div>
                ))}
            </div>
        </div>
    );
}

export default PosLoadingUI;
