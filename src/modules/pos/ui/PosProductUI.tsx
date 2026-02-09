'use client';

import React from 'react';
import Image from 'next/image';
import { Plus, Minus, Loader2 } from 'lucide-react';
import type { Product, OrderItem } from '../core/pos.types';
import type { PosProductCardConfig } from './pos-ui.config';

// Fallback image
const FALLBACK_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNGM0Y0RjYiLz48Y2lyY2xlIGN4PSIxMDAiIGN5PSI4MCIgcj0iMjAiIGZpbGw9IiM5Q0EzQUYiLz48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxNDAiIHI9IjIwIiBmaWxsPSIjOUNBM0FGIi8+PC9zdmc+';

// Default card config
const DEFAULT_CARD_CONFIG: PosProductCardConfig = {
    wrapperClass: 'bg-white rounded-lg shadow-sm border overflow-hidden',
    innerPaddingClass: 'p-4',
    imageWrapperClass: '',
    imageContainerClass: 'aspect-square bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden',
    imageClass: 'w-full h-full object-contain',
    stockBadgeClass: '',
    stockBadgeTextClass: '',
    contentContainerClass: '',
    infoWrapperClass: '',
    nameClass: 'text-sm text-gray-800',
    priceClass: 'text-lg font-bold text-blue-600',
    addButtonClass: 'px-3 py-2 bg-blue-600 text-white rounded',
    addButtonIconClass: '',
    addButtonText: 'Add',
    isClickable: false,
    showQuantityControls: false,
    footerClass: '',
    quantityContainerClass: '',
    quantityButtonClass: '',
    quantityButtonIconClass: '',
    quantityInputClass: '',
};

export interface PosProductUIProps {
    products: Product[];
    onAddToOrder: (product: Product) => void;
    isLoading?: boolean;
    gridCols?: string;
    className?: string;
    cardConfig?: PosProductCardConfig;
    orderItems?: OrderItem[];
    onUpdateQuantity?: (itemId: string, quantity: number) => void;
}

export function PosProductUI({
    products,
    onAddToOrder,
    isLoading = false,
    gridCols = 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6',
    className = '',
    cardConfig,
    orderItems = [],
    onUpdateQuantity,
}: PosProductUIProps) {
    const card = cardConfig || DEFAULT_CARD_CONFIG;

    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
        e.currentTarget.src = FALLBACK_IMAGE;
    };

    const getItemQuantity = (productId: string) => {
        const item = orderItems.find((item) => item.productId === productId);
        return item ? item.quantity : 0;
    };

    const handleDecreaseQuantity = (e: React.MouseEvent, product: Product) => {
        e.stopPropagation();
        if (!onUpdateQuantity) return;

        const item = orderItems.find((item) => item.productId === product._id);
        if (item) {
            onUpdateQuantity(item.id, item.quantity - 1);
        }
    };

    const handleIncreaseQuantity = (e: React.MouseEvent, product: Product) => {
        e.stopPropagation();
        onAddToOrder(product);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                <span className="ml-2 text-gray-500">Loading products...</span>
            </div>
        );
    }

    if (products.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <p>No products found</p>
            </div>
        );
    }

    // Image section component
    const ImageSection = ({ product }: { product: Product }) => (
        <>
            {/* Image */}
            <div className={`relative ${card.imageWrapperClass || card.imageContainerClass}`}>
                <Image
                    src={product.image || FALLBACK_IMAGE}
                    alt={product.name}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className={card.imageClass}
                    unoptimized
                    onError={handleImageError as any}
                />
                {/* Stock Badge - Moved inside image wrapper to overlay */}
                {product.stock !== undefined && product.stock !== null && card.stockBadgeClass && (
                    <div className={card.stockBadgeClass}>
                        <span className={card.stockBadgeTextClass}>{product.stock}</span>
                    </div>
                )}
            </div>
        </>
    );

    // SINGLE UNIFIED LAYOUT - All styling comes from config
    return (
        <div className={`grid ${gridCols} ${className}`}>
            {products.map((product) => {
                const quantity = getItemQuantity(product._id);

                return (
                    <div
                        key={product._id}
                        className={card.wrapperClass}
                        onClick={card.isClickable ? () => onAddToOrder(product) : undefined}
                        role={card.isClickable ? 'button' : undefined}
                        tabIndex={card.isClickable ? 0 : undefined}
                        onKeyDown={card.isClickable ? (e) => { if (e.key === 'Enter') onAddToOrder(product); } : undefined}
                    >
                        {/* Image Section - wrapped in innerPaddingClass if it exists */}
                        {card.innerPaddingClass ? (
                            <div className={card.innerPaddingClass}>
                                <ImageSection product={product} />
                            </div>
                        ) : (
                            <ImageSection product={product} />
                        )}

                        {/* Content Section */}
                        <div className={card.contentContainerClass}>
                            {card.priceRowClass ? (
                                // New Layout (Split: Top Info, Bottom Action Row)
                                <>
                                    <div className={card.infoWrapperClass}>
                                        {card.brandClass && product.brand && (
                                            <p className={card.brandClass}>{product.brand}</p>
                                        )}
                                        <p className={card.nameClass}>{product.name}</p>
                                    </div>
                                    <div className={card.priceRowClass}>
                                        <p className={card.priceClass}>${product.price.toFixed(2)}</p>
                                        {!card.showQuantityControls && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onAddToOrder(product);
                                                }}
                                                className={card.addButtonClass}
                                            >
                                                {card.addButtonIconClass && <Plus className={card.addButtonIconClass} />}
                                                {card.addButtonText && <span>{card.addButtonText}</span>}
                                            </button>
                                        )}
                                    </div>
                                </>
                            ) : (
                                // Original Layout (Side-by-side or stacked group)
                                <>
                                    <div className={card.infoWrapperClass}>
                                        <p className={card.nameClass}>{product.name}</p>
                                        <p className={card.priceClass}>${product.price.toFixed(2)}</p>
                                    </div>

                                    {/* Add Button (when no quantity controls) */}
                                    {!card.showQuantityControls && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onAddToOrder(product);
                                            }}
                                            className={card.addButtonClass}
                                        >
                                            {card.addButtonIconClass && <Plus className={card.addButtonIconClass} />}
                                            {card.addButtonText && <span>{card.addButtonText}</span>}
                                        </button>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Footer with Quantity Controls */}
                        {card.showQuantityControls && (
                            <div className={card.footerClass}>
                                <button
                                    onClick={(e) => handleIncreaseQuantity(e, product)}
                                    className={card.addButtonClass}
                                >
                                    {card.addButtonIconClass && <Plus className={card.addButtonIconClass} />}
                                    {card.addButtonText && <span>{card.addButtonText}</span>}
                                </button>
                                <div className={card.quantityContainerClass}>
                                    <button
                                        onClick={(e) => handleDecreaseQuantity(e, product)}
                                        className={card.quantityButtonClass}
                                        disabled={quantity === 0}
                                    >
                                        <Minus className={card.quantityButtonIconClass} />
                                    </button>
                                    <span className={card.quantityInputClass}>{quantity}</span>
                                    <button
                                        onClick={(e) => handleIncreaseQuantity(e, product)}
                                        className={card.quantityButtonClass}
                                    >
                                        <Plus className={card.quantityButtonIconClass} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

export default PosProductUI;
