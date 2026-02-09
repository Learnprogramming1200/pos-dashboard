"use client"
import { useState, useEffect, useCallback } from 'react';
import { InventoryTypes } from '@/types/admin';
import { BarcodeSuggestion, UseBarcodeSuggestionsProps } from '@/types/BarcodeSuggestion';


export const useBarcodeSuggestions = ({
    products,
    debounceMs = 300
}: UseBarcodeSuggestionsProps) => {
    const [suggestions, setSuggestions] = useState<BarcodeSuggestion[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Extract all barcodes from products (including variant barcodes)
    const getAllBarcodes = useCallback((products: InventoryTypes.ProductTypes.Product[]): BarcodeSuggestion[] => {
        const barcodeMap = new Map<string, BarcodeSuggestion>();

        products.forEach(product => {
            // Add main product barcode if it exists
            if (product.barcode) {
                barcodeMap.set(product.barcode, {
                    barcode: product.barcode,
                    productName: product.productName || 'Unknown Product',
                    sku: product.SKU || '',
                    productId: product._id || ''
                });
            }

            // Add variant barcodes if product has variations
            if (product.hasVariation) {
                // Check variantData (new structure)
                const variantData = product.variantData as any[];
                if (variantData && variantData.length > 0) {
                    variantData.forEach(variant => {
                        if (variant.barcode) {
                            barcodeMap.set(variant.barcode, {
                                barcode: variant.barcode,
                                productName: `${product.productName || 'Unknown Product'} - ${variant.variantValue || 'Variant'}`,
                                sku: variant.SKU || product.SKU || '',
                                productId: product._id || ''
                            });
                        }
                    });
                } else {
                    // Fallback to variantInventory (old structure)
                    const variantInventory = product.variantInventory as any[];
                    if (variantInventory && variantInventory.length > 0) {
                        variantInventory.forEach(variant => {
                            if (variant.barcode) {
                                barcodeMap.set(variant.barcode, {
                                    barcode: variant.barcode,
                                    productName: `${product.productName || 'Unknown Product'} - ${variant.variantValue || 'Variant'}`,
                                    sku: variant.SKU || product.SKU || '',
                                    productId: product._id || ''
                                });
                            }
                        });
                    }
                }
            }
        });

        return Array.from(barcodeMap.values());
    }, []);

    // Search barcodes based on input
    const searchBarcodes = useCallback((term: string, allBarcodes: BarcodeSuggestion[]): BarcodeSuggestion[] => {
        if (!term || term.length < 2) return [];

        const lowercaseTerm = term.toLowerCase();

        return allBarcodes
            .filter(suggestion =>
                suggestion.barcode.toLowerCase().includes(lowercaseTerm) ||
                suggestion.productName.toLowerCase().includes(lowercaseTerm) ||
                suggestion.sku.toLowerCase().includes(lowercaseTerm)
            )
            .slice(0, 10) // Limit to 10 suggestions
            .sort((a, b) => {
                // Prioritize exact barcode matches
                const aExactMatch = a.barcode.toLowerCase() === lowercaseTerm;
                const bExactMatch = b.barcode.toLowerCase() === lowercaseTerm;

                if (aExactMatch && !bExactMatch) return -1;
                if (!aExactMatch && bExactMatch) return 1;

                // Then prioritize barcode starts with
                const aStartsWith = a.barcode.toLowerCase().startsWith(lowercaseTerm);
                const bStartsWith = b.barcode.toLowerCase().startsWith(lowercaseTerm);

                if (aStartsWith && !bStartsWith) return -1;
                if (!aStartsWith && bStartsWith) return 1;

                // Finally sort alphabetically
                return a.barcode.localeCompare(b.barcode);
            });
    }, []);

    // Debounced search effect
    useEffect(() => {
        if (!searchTerm || searchTerm.length < 2) {
            setSuggestions([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);

        const timeoutId = setTimeout(() => {
            const allBarcodes = getAllBarcodes(products);
            const filteredSuggestions = searchBarcodes(searchTerm, allBarcodes);
            setSuggestions(filteredSuggestions);
            setIsLoading(false);
        }, debounceMs);

        return () => clearTimeout(timeoutId);
    }, [searchTerm, products, getAllBarcodes, searchBarcodes, debounceMs]);

    const updateSearchTerm = useCallback((term: string) => {
        setSearchTerm(term);
    }, []);

    const clearSuggestions = useCallback(() => {
        setSuggestions([]);
        setSearchTerm('');
    }, []);

    return {
        suggestions,
        isLoading,
        searchTerm,
        updateSearchTerm,
        clearSuggestions
    };
};
