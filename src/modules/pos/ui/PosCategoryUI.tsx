'use client';

'use client';

import React from 'react';
import type { LucideIcon } from 'lucide-react';
import {
    Grid3X3,
    Headphones,
    Footprints,
    Smartphone,
    Watch,
    Laptop,
    Shirt,
} from 'lucide-react';
import type { Category } from '../core/pos.types';
import type { PosCategorySidebarConfig } from './pos-ui.config';

// Default icons for categories
const DEFAULT_CATEGORY_ICONS: Record<string, LucideIcon> = {
    all: Grid3X3,
    headphones: Headphones,
    shoes: Footprints,
    mobiles: Smartphone,
    watches: Watch,
    laptops: Laptop,
    clothes: Shirt,
};

// Default config (fallback)
const DEFAULT_CONFIG: PosCategorySidebarConfig = {
    wrapperClass: '',
    innerContainerClass: 'flex space-x-2 overflow-x-auto pb-2',
    categoryButtonClass: 'flex items-center space-x-2 px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-colors bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600',
    categoryButtonActiveClass: 'bg-slate-700 text-white border-slate-700',
    categoryIconClass: 'w-4 h-4 flex-shrink-0',
    categoryTextClass: 'font-medium',
    variant: 'horizontal',
    showMobileHorizontal: true,
    mobileHorizontalWrapperClass: 'mb-6',
};

export interface PosCategoryUIProps {
    // Data
    categories: Category[];
    selectedCategoryId: string;
    onCategorySelect: (categoryId: string) => void;

    // Layout variant (can be overridden by uiConfig.variant)
    variant?: 'horizontal' | 'vertical' | 'mobile';

    // UI Configuration - ALL styles come from here
    uiConfig?: PosCategorySidebarConfig;

    // Additional styling
    className?: string;
}

export function PosCategoryUI({
    categories,
    selectedCategoryId,
    onCategorySelect,
    variant,
    uiConfig,
    className = '',
}: PosCategoryUIProps) {
    // Merge config with defaults
    const config = uiConfig || DEFAULT_CONFIG;

    // Use variant from config if not explicitly passed
    const activeVariant = variant || config.variant || 'horizontal';

    // Get icon for category
    const getCategoryIcon = (category: Category): LucideIcon => {
        if (category.icon && typeof category.icon === 'function') {
            return category.icon as LucideIcon;
        }
        const iconKey = category._id?.toLowerCase() || category.name?.toLowerCase() || '';
        return DEFAULT_CATEGORY_ICONS[iconKey] || Grid3X3;
    };

    // Render category button with appropriate classes from config
    const renderCategoryButton = (category: Category) => {
        const Icon = getCategoryIcon(category);
        const isSelected = selectedCategoryId === category._id;

        // Combine base button class with active class if selected
        const buttonClass = isSelected
            ? `${config.categoryButtonClass} ${config.categoryButtonActiveClass}`
            : config.categoryButtonClass;

        return (
            <button
                key={category._id}
                onClick={() => onCategorySelect(category._id)}
                className={buttonClass}
            >
                <Icon className={config.categoryIconClass} />
                <span className={config.categoryTextClass}>
                    {category.name}
                </span>
            </button>
        );
    };

    // Vertical variant
    if (activeVariant === 'vertical') {
        return (
            <div className={`${config.wrapperClass} ${className}`}>
                <div className={config.innerContainerClass}>
                    {categories.map(renderCategoryButton)}
                </div>
            </div>
        );
    }

    // Mobile variant
    if (activeVariant === 'mobile') {
        return (
            <div className={`${config.wrapperClass} ${className}`}>
                <div className={config.innerContainerClass}>
                    {categories.map(renderCategoryButton)}
                </div>
            </div>
        );
    }

    // Default: horizontal variant
    return (
        <div className={`${config.wrapperClass} ${className}`}>
            <div className={config.innerContainerClass}>
                {categories.map(renderCategoryButton)}
            </div>
        </div>
    );
}

export default PosCategoryUI;
