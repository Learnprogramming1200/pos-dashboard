"use client";
import { useState, useCallback } from 'react';
import { InventoryTypes } from '@/types/admin';

interface UseProductLookupProps {
  products?: InventoryTypes.ProductTypes.Product[];
}

export const useProductLookup = ({ products = [] }: UseProductLookupProps = {}) => {
  const [result, setResult] = useState<InventoryTypes.ProductTypes.ProductLookupResult>({
    product: null,
    error: null,
    loading: false,
  });

  const lookupProduct = useCallback(async (scannedData: string): Promise<InventoryTypes.ProductTypes.ProductLookupResult> => {
    setResult({ product: null, error: null, loading: true });

    try {
      // First, try to parse as JSON (in case it's a barcode with product data)
      let productData: any = null;
      try {
        productData = JSON.parse(scannedData);
      } catch {
        // If not JSON, treat as barcode/SKU
        productData = { barcode: scannedData, sku: scannedData };
      }

      // Look up product by various identifiers
      let foundProduct: InventoryTypes.ProductTypes.Product | null = null;

      if (productData.id || productData._id) {
        // If it's a complete product object, use it directly
        foundProduct = productData as InventoryTypes.ProductTypes.Product;
      } else {
        // Search in products array by barcode, SKU, or name
        const searchTerm = scannedData.toLowerCase();
        foundProduct = products.find(product =>
          product.barcode?.toLowerCase() === searchTerm ||
          product.SKU?.toLowerCase() === searchTerm ||
          product._id?.toLowerCase() === searchTerm ||
          product.productName?.toLowerCase().includes(searchTerm)
        ) || null;
      }

      if (foundProduct) {
        setResult({ product: foundProduct, error: null, loading: false });
        return { product: foundProduct, error: null, loading: false };
      } else {
        const errorMsg = `Product not found for: ${scannedData}`;
        setResult({ product: null, error: errorMsg, loading: false });
        return { product: null, error: errorMsg, loading: false };
      }
    } catch (error) {
      const errorMsg = `Error looking up product: ${error instanceof Error ? error.message : 'Unknown error'}`;
      setResult({ product: null, error: errorMsg, loading: false });
      return { product: null, error: errorMsg, loading: false };
    }
  }, [products]);

  const clearResult = useCallback(() => {
    setResult({ product: null, error: null, loading: false });
  }, []);

  return {
    ...result,
    lookupProduct,
    clearResult,
  };
};

