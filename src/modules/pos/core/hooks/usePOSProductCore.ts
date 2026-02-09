'use client';

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { productAPI, posAPI } from '../pos.api';
import type { Product, Category, RawProduct, ProductVariant, StoreStockItem } from '../pos.types';

// Fallback image constant - using data URI to avoid 404 errors
const FALLBACK_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNFNUU3RUIiLz48cGF0aCBkPSJNODAgNzBDODAgNjQuNDc3MiA4NC40NzcyIDYwIDkwIDYwSDExMEMxMTUuNTIzIDYwIDEyMCA2NC40NzcyIDEyMCA3MFY5MEMxMjAgOTUuNTIyOCAxMTUuNTIzIDEwMCAxMTAgMTAwSDkwQzg0LjQ3NzIgMTAwIDgwIDk1LjUyMjggODAgOTBWNzBaIiBmaWxsPSIjOUNBM0FGIi8+PHBhdGggZD0iTTYwIDExMEg4MFYxMzBINjBWMTEwWiIgZmlsbD0iIzlDQTNBRiIvPjxwYXRoIGQ9Ik0xMjAgMTEwSDE0MFYxMzBIMTIwVjExMFoiIGZpbGw9IiM5Q0EzQUYiLz48cGF0aCBkPSJNOTAgMTIwSDExMFYxNDBIOTBWMTIwWiIgZmlsbD0iIzlDQTNBRiIvPjwvc3ZnPg==';

export interface UsePOSProductCoreOptions {
    storeId: string | null;
}

export interface UsePOSProductCoreReturn {
    // State
    products: Product[];
    rawProducts: RawProduct[];
    categories: Category[];
    selectedCategoryId: string;
    searchQuery: string;
    isLoadingProducts: boolean;
    isLoadingCategories: boolean;
    error: string | null;

    // Derived
    filteredProducts: Product[];

    // Actions
    fetchProducts: (storeId: string, categoryId?: string) => Promise<Product[]>;
    fetchCategories: () => Promise<Category[]>;
    setSelectedCategory: (categoryId: string) => void;
    setSearchQuery: (query: string) => void;
    getFilteredProducts: (search?: string, categoryId?: string) => Product[];
    getCategoryById: (categoryId: string) => Category | null;
    clearProducts: () => void;
    getProductBySku: (sku: string) => Product | null;
    getProductByBarcode: (barcode: string) => Product | null;
    setCategoriesData: (categories: Category[]) => void;

    // Internal
    abortController: React.MutableRefObject<AbortController | null>;
}

// Resolves stock quantity for a specific store from storeStock array

// Resolves stock quantity for a specific store from storeStock array
export function resolveStockForStore(
    stock: { totalStock?: number; storeStock?: StoreStockItem[] } | undefined,
    storeId: string
): number {
    if (!stock) return 0;

    // Check storeStock array first
    if (Array.isArray(stock.storeStock) && stock.storeStock.length > 0) {
        const storeStockItem = stock.storeStock.find(
            (s: StoreStockItem) => s.storeId === storeId
        );
        if (storeStockItem) {
            return parseInt(String(storeStockItem.quantity)) || 0;
        }
    }

    // Fallback to totalStock if no store-specific stock found
    return parseInt(String(stock.totalStock)) || 0;
}

// Extracts category name from category field
function extractCategoryName(
    category: { _id?: string; categoryName?: string; name?: string } | string | null | undefined
): string {
    if (!category) return '';
    if (typeof category === 'string') return category;
    return category.categoryName || category.name || '';
}

// Extracts category ID from category field
function extractCategoryId(
    category: { _id?: string; categoryName?: string; name?: string } | string | null | undefined,
    categoryId?: string
): string {
    if (categoryId) return categoryId;
    if (!category) return '';
    if (typeof category === 'string') return '';
    return category._id || '';
}

// Extracts brand name from brand field
function extractBrandName(
    brand: { _id?: string; brand?: string; name?: string } | string | null | undefined
): string {
    if (!brand) return '';
    if (typeof brand === 'string') return brand;
    return brand.brand || brand.name || '';
}

// Extracts unit name from unit field
function extractUnitName(
    unit: { _id?: string; name?: string; shortName?: string } | string | null | undefined
): string {
    if (!unit) return 'pcs';
    if (typeof unit === 'string') return unit;
    return unit.name || unit.shortName || 'pcs';
}

// Converts a RawProduct (no variants) to a display Product
// Converts a RawProduct (no variants) to a display Product
export function convertSimpleProduct(raw: RawProduct, storeId: string): Product {
    return {
        _id: raw._id,
        name: raw.name,
        sku: raw.sku || raw.SKU || '',
        barcode: raw.barcode || '',
        price: raw.sellingPrice || 0,
        salePrice: raw.sellingPrice || 0,
        cost: raw.purchasePrice || raw.costPrice || 0,
        category: extractCategoryName(raw.category),
        categoryId: extractCategoryId(raw.category, raw.categoryId),
        subcategoryId: raw.subcategoryId || '',
        image: raw.productImage || raw.images?.[0] || FALLBACK_IMAGE,
        images: raw.images || [],
        stock: resolveStockForStore(raw.stock, storeId),
        quantity: resolveStockForStore(raw.stock, storeId),
        unit: extractUnitName(raw.unit),
        lowStockAlert: raw.lowStockAlert || 0,
        // Full tax info (array of taxes)
        taxes: raw.tax || null,
        taxPercent: Array.isArray(raw.tax) && raw.tax.length > 0 ? raw.tax[0].value || 0 : (raw.taxPercent || 0),
        taxType: Array.isArray(raw.tax) && raw.tax.length > 0 ? (raw.tax[0].taxType || 'Exclusive') : 'Exclusive',
        taxValueType: Array.isArray(raw.tax) && raw.tax.length > 0 ? (raw.tax[0].valueType || 'Percentage') : 'Percentage',
        taxable: Array.isArray(raw.tax) && raw.tax.length > 0 ? true : (raw.taxable ?? false),
        // Discount info
        discount: raw.discount || 0,
        discountType: 'Percentage', // Simple products default to percentage
        status: (raw.status === true || raw.status === 'active') ? 'active' : 'inactive',
        storeId: storeId,
        description: raw.description || '',
        brand: extractBrandName(raw.brand),
        isVariant: false,
        parentProductId: '',
        variantAttributes: [],
        hasWarranty: raw.warranty?.hasWarranty ?? !!raw.warrantyType,
        warrantyDuration: raw.warranty?.duration || 0,
        warrantyUnit: raw.warranty?.unit || '',
        hasExpiry: raw.expiry?.hasExpiry ?? !!raw.expiryDate,
        expiryDate: raw.expiry?.expiryDate || raw.expiryDate || '',
        createdAt: raw.createdAt || '',
        updatedAt: raw.updatedAt || '',
    };
}

// Converts a ProductVariant to a display Product
// Inherits parent product data where applicable
// Converts a ProductVariant to a display Product
// Inherits parent product data where applicable
export function convertVariantToProduct(
    variant: ProductVariant,
    parentRaw: RawProduct,
    storeId: string
): Product {
    return {
        _id: variant._id,
        name: variant.variantTitle ? `${parentRaw.name} - ${variant.variantTitle}` : parentRaw.name,
        sku: variant.variantSku || variant.SKU || '',
        barcode: variant.barcode || '',
        price: variant.sellingPrice || 0,
        salePrice: variant.sellingPrice || 0,
        cost: variant.purchasePrice || variant.costPrice || 0,
        category: extractCategoryName(parentRaw.category),
        categoryId: extractCategoryId(parentRaw.category, parentRaw.categoryId),
        subcategoryId: parentRaw.subcategoryId || '',
        image: variant.variantImage || parentRaw.productImage || parentRaw.images?.[0] || FALLBACK_IMAGE,
        images: parentRaw.images || [],
        stock: resolveStockForStore(variant.stock, storeId),
        quantity: resolveStockForStore(variant.stock, storeId),
        unit: extractUnitName(parentRaw.unit),
        lowStockAlert: variant.lowStockAlert || parentRaw.lowStockAlert || 0,
        // Full tax info (array of taxes, inherited from parent)
        taxes: parentRaw.tax || null,
        taxPercent: Array.isArray(parentRaw.tax) && parentRaw.tax.length > 0 ? parentRaw.tax[0].value || 0 : (parentRaw.taxPercent || 0),
        taxType: Array.isArray(parentRaw.tax) && parentRaw.tax.length > 0 ? (parentRaw.tax[0].taxType || 'Exclusive') : 'Exclusive',
        taxValueType: Array.isArray(parentRaw.tax) && parentRaw.tax.length > 0 ? (parentRaw.tax[0].valueType || 'Percentage') : 'Percentage',
        taxable: Array.isArray(parentRaw.tax) && parentRaw.tax.length > 0 ? true : (parentRaw.taxable ?? false),
        // Discount info (per-variant)
        discount: variant.discount || 0,
        discountType: 'Percentage', // Variant discounts are typically percentage
        status: (variant.status === true || variant.status === 'active') ? 'active' : 'inactive',
        storeId: storeId,
        description: parentRaw.description || '',
        brand: extractBrandName(parentRaw.brand),
        isVariant: true,
        parentProductId: parentRaw._id,
        variantAttributes: variant.attributes || [],
        hasWarranty: parentRaw.warranty?.hasWarranty ?? !!parentRaw.warrantyType,
        warrantyDuration: parentRaw.warranty?.duration || 0,
        warrantyUnit: parentRaw.warranty?.unit || '',
        hasExpiry: parentRaw.expiry?.hasExpiry ?? !!parentRaw.expiryDate,
        expiryDate: parentRaw.expiry?.expiryDate || parentRaw.expiryDate || '',
        createdAt: parentRaw.createdAt || '',
        updatedAt: parentRaw.updatedAt || '',
    };
}

// Expands raw products into display products
// - Simple products (hasVariation: false) → 1 display product
// - Variant products (hasVariation: true) → N display products (one per variant)
function expandProductsForDisplay(rawProducts: RawProduct[], storeId: string): Product[] {
    const displayProducts: Product[] = [];

    for (const raw of rawProducts) {
        // Skip inactive products
        if (raw.status === 'inactive') continue;

        if (raw.hasVariation && Array.isArray(raw.variantData) && raw.variantData.length > 0) {
            // Product has variants - expand each variant as a separate product card
            for (const variant of raw.variantData) {
                // Skip inactive variants
                if (variant.status === 'inactive') continue;
                displayProducts.push(convertVariantToProduct(variant, raw, storeId));
            }
        } else {
            // Simple product - show as-is
            const product = convertSimpleProduct(raw, storeId);
            displayProducts.push(product);
        }
    }
    return displayProducts;
}

export function usePOSProductCore(options: UsePOSProductCoreOptions): UsePOSProductCoreReturn {
    const { storeId } = options;

    // State
    const [rawProducts, setRawProducts] = useState<RawProduct[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [isLoadingProducts, setIsLoadingProducts] = useState(false);
    const [isLoadingCategories, setIsLoadingCategories] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Abort controller for cancelling requests
    const abortController = useRef<AbortController | null>(null);

    // Request tracking to prevent race conditions
    const lastRequestId = useRef<number>(0);

    // Expanded Products (with variant expansion)
    const products = useMemo(() => {
        if (!storeId) return [];
        return expandProductsForDisplay(rawProducts, storeId);
    }, [rawProducts, storeId]);

    // Get category by ID
    const getCategoryById = useCallback((categoryId: string): Category | null => {
        return categories.find(c => c._id === categoryId) || null;
    }, [categories]);

    // Filter products by category and search
    const getFilteredProducts = useCallback((search: string = '', categoryId: string = 'all'): Product[] => {
        return products.filter(product => {
            // Category filter
            // We rely on server-side filtering now. If products are loaded, they belong to the current context.
            // We kept the 'all' check just in case, but strict ID matching caused issues if backend data wasn't perfect.
            // So we primarily filter by Search.

            // Search filter - match name, sku, or barcode
            const searchLower = search.toLowerCase();
            const matchesSearch = !search ||
                product.name.toLowerCase().includes(searchLower) ||
                product.sku.toLowerCase().includes(searchLower) ||
                product.barcode.toLowerCase().includes(searchLower);

            return matchesSearch;
        });
    }, [products]);

    // Derived: Filtered products based on current state
    const filteredProducts = useMemo(() => {
        return getFilteredProducts(searchQuery, selectedCategoryId);
    }, [getFilteredProducts, searchQuery, selectedCategoryId]);

    // Get product by SKU
    const getProductBySku = useCallback((sku: string): Product | null => {
        if (!sku) return null;
        return products.find(p => p.sku.toLowerCase() === sku.toLowerCase()) || null;
    }, [products]);

    // Get product by barcode
    const getProductByBarcode = useCallback((barcode: string): Product | null => {
        if (!barcode) return null;
        return products.find(p => p.barcode.toLowerCase() === barcode.toLowerCase()) || null;
    }, [products]);

    // Fetch categories - uses unified API for refresh
    const fetchCategories = useCallback(async (): Promise<Category[]> => {
        setIsLoadingCategories(true);
        setError(null);

        try {
            // Use unified POS initialization API to refresh categories
            const response = await posAPI.initialize();

            if (!response.success) {
                throw new Error(response.error || 'Failed to fetch categories');
            }

            setCategories(response.data.categories);
            return response.data.categories;
        } catch (err: any) {
            const errorMessage = err.message || 'Failed to fetch categories';
            setError(errorMessage);
            console.error('Error fetching categories:', err);
            return [];
        } finally {
            setIsLoadingCategories(false);
        }
    }, []);

    // Fetch products for a specific store and optional category
    // CRITICAL: Products NEVER load without a valid storeId
    const fetchProducts = useCallback(async (targetStoreId: string, categoryId: string = 'all'): Promise<Product[]> => {
        // SECURITY: Prevent fetching without storeId
        if (!targetStoreId) {
            console.error('fetchProducts called without storeId - BLOCKED');
            setError('Store ID is required to fetch products');
            return [];
        }

        // Cancel any pending request
        if (abortController.current) {
            abortController.current.abort();
        }
        abortController.current = new AbortController();

        // Track this request
        const requestId = ++lastRequestId.current;

        setIsLoadingProducts(true);
        setError(null);

        try {
            // Pass categoryId to API (only if not 'all', handled by API wrapper logic if needed, but here API accepts it)
            const response = await productAPI.getActiveProducts(targetStoreId, categoryId);

            // Check if this is still the latest request (prevent race conditions)
            if (requestId !== lastRequestId.current) {
                return [];
            }

            if (!response.success) {
                throw new Error(response.error || 'Failed to fetch products');
            }

            // Store raw products - expansion happens in useMemo
            setRawProducts(response.data);

            // Return expanded products
            return expandProductsForDisplay(response.data, targetStoreId);
        } catch (err: any) {
            if (err.name !== 'AbortError' && requestId === lastRequestId.current) {
                const errorMessage = err.message || 'Failed to fetch products';
                setError(errorMessage);
                console.error('Error fetching products:', err);
            }
            return [];
        } finally {
            if (requestId === lastRequestId.current) {
                setIsLoadingProducts(false);
            }
        }
    }, []);

    // Clear products (used when store changes)
    const clearProducts = useCallback(() => {
        setRawProducts([]);
        setSelectedCategoryId('all');
        setSearchQuery('');
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (abortController.current) {
                abortController.current.abort();
            }
        };
    }, []);

    // Set categories data from unified API (skips API call)
    const setCategoriesData = useCallback((categoriesData: Category[]) => {
        setCategories(categoriesData);
    }, []);

    return {
        products,
        rawProducts,
        categories,
        selectedCategoryId,
        searchQuery,
        isLoadingProducts,
        isLoadingCategories,
        error,
        filteredProducts,
        fetchProducts,
        fetchCategories,
        setSelectedCategory: setSelectedCategoryId,
        setSearchQuery,
        getFilteredProducts,
        getCategoryById,
        clearProducts,
        getProductBySku,
        getProductByBarcode,
        setCategoriesData,
        abortController,
    };
}
