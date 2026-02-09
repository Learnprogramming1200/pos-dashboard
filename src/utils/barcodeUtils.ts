import React, { useCallback } from 'react';
import { AdminTypes } from "@/types";
import { WebComponents } from "@/components";
import { barcodeLabelSchema } from "@/app/validation/ValidationSchema";
import { ServerActions } from "@/lib";

export const barcodeUtils = {
    generateBarcodeFromSKU: (sku: string): string => {
        if (!sku) return '';
        const numericValue = sku.replace(/[^0-9]/g, '');
        return numericValue.length >= 12 ? numericValue.substring(0, 12) : numericValue.padStart(12, '0');
    },

    getProductBarcode: (product: any): string => {
        if (!product) return '';
        if (product.hasVariation && product.variantData?.[0]) {
            const firstVariant = product.variantData[0];
            return firstVariant.barcode || firstVariant.SKU || '';
        }
        return product.barcode || (product.SKU || product.sku ? barcodeUtils.generateBarcodeFromSKU(product.SKU || product.sku) : product._id || product.id || '');
    },

    getProductPrice: (product: any): number => {
        if (!product) return 0;
        if (product.hasVariation && Array.isArray(product.variantData) && product.variantData.length > 0) {
            const firstVariant = product.variantData[0] || {};
            const variantPrice = firstVariant.sellingPrice ?? firstVariant.price ?? firstVariant.costPrice ?? 0;
            return typeof variantPrice === 'number' ? variantPrice : parseFloat(variantPrice) || 0;
        }
        const basePrice = product.sellingPrice ?? product.price ?? product.mrp ?? product.costPrice ?? 0;
        return typeof basePrice === 'number' ? basePrice : parseFloat(basePrice) || 0;
    },

    calculateStock: (p: any): string | number => {
        const stock = (p as any).stock;
        const totalQuantity = (p as any).totalQuantity ?? (p as any).total_quantity ?? (p as any).totalStock;
        if (Array.isArray((p as any).variantData) && (p as any).variantData.length > 0) {
            const v = (p as any).variantData[0];
            if (v?.stock?.totalStock !== undefined) return v.stock.totalStock;
            if (typeof v?.quantity === 'number') return v.quantity;
        }
        if (typeof totalQuantity === 'number') return totalQuantity;
        if (stock && typeof stock === 'object' && (stock as any).totalStock !== undefined) return (stock as any).totalStock;
        return 'N/A';
    },

    needsBarcodeGeneration: (product: any): boolean => {
        if (!product) return false;
        if (product.hasVariation && product.variantData?.[0]) {
            return !product.variantData[0].barcode;
        }
        return !product.barcode;
    },

    updateProductBarcodeInDB: async (product: any, generatedBarcode: string, updateStateCallback?: (product: any) => void): Promise<boolean> => {
        try {
            const productId = product._id || product.id;
            if (!productId) return false;

            const result = await ServerActions.ServerActionslib.updateProductBarcodeAction(productId, generatedBarcode);

            if (result.success && result.data && updateStateCallback) {
                updateStateCallback(result.data);
            }
            return true;
        } catch (error) {
            console.error('Error updating barcode:', error);
            return false;
        }
    },

    handlePrintBarcode: (
        selectedProduct: any,
        settings: {
            sizeName: number;
            sizeVariation: number;
            sizePrice: number;
            sizeSKU: number;
            sizeExpiryDate: number;
            sizeNote: number;
            note: string;
        },
        updateStateCallback?: (product: any) => void
    ) => {
        if (!selectedProduct) return;

        // Validate settings before printing
        try {
            const settingsToValidate = {
                productName: settings.sizeName,
                productVariation: settings.sizeVariation,
                productPrice: settings.sizePrice,
                productSKU: settings.sizeSKU,
                expiryDateSize: settings.sizeExpiryDate,
                noteSize: settings.sizeNote,
                note: settings.note
            };
            barcodeLabelSchema.validateSync(settingsToValidate, { abortEarly: false });
        } catch (err: any) {
            WebComponents.UiComponents.UiWebComponents.SwalHelper.error({
                text: "Please fix validation errors before printing: " + err.errors.join(", ")
            });
            return;
        }

        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const canvas = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 150;

        try {
            const JsBarcode = require('jsbarcode');
            let barcodeValue = barcodeUtils.getProductBarcode(selectedProduct);

            if (barcodeUtils.needsBarcodeGeneration(selectedProduct)) {
                const sku = (selectedProduct as any).SKU || (selectedProduct as any).sku;
                if (sku) {
                    barcodeValue = barcodeUtils.generateBarcodeFromSKU(sku);
                    barcodeUtils.updateProductBarcodeInDB(selectedProduct, barcodeValue, updateStateCallback);
                }
            }
            JsBarcode(canvas, barcodeValue, { format: "CODE128", width: 2, height: 80, displayValue: true, fontSize: 16, margin: 10 });
            const dataURL = canvas.toDataURL('image/png');

            printWindow.document.write(`<html><body onload="window.print();window.close()"><div style="text-align:center"><img src="${dataURL}"/><div style="font-size:12px">${barcodeValue}</div></div></body></html>`);
            printWindow.document.close();
        } catch (error) {
            console.error('Print error:', error);
        }
    },

    handleBulkPrint: async (
        labelRows: any[],
        allProducts: AdminTypes.InventoryTypes.ProductTypes.Product[],
        settings: {
            sizeName: number;
            sizeVariation: number;
            sizePrice: number;
            sizeSKU: number;
            sizeExpiryDate: number;
            sizeNote: number;
            note: string;
        },
        showSettings: {
            showName: boolean;
            showVariation: boolean;
            showPrice: boolean;
            showSKU: boolean;
            showExpiryDate: boolean;
            showNote: boolean;
        },
        overrideExpiry: string,
        updateStateCallback?: (product: any) => void
    ) => {
        if (!labelRows || labelRows.length === 0) return;

        // Validate settings before printing
        try {
            const settingsToValidate = {
                productName: settings.sizeName,
                productVariation: settings.sizeVariation,
                productPrice: settings.sizePrice,
                productSKU: settings.sizeSKU,
                expiryDateSize: settings.sizeExpiryDate,
                noteSize: settings.sizeNote,
                note: settings.note
            };
            barcodeLabelSchema.validateSync(settingsToValidate, { abortEarly: false });
        } catch (err: any) {
            WebComponents.UiComponents.UiWebComponents.SwalHelper.error({
                text: "Please fix validation errors before printing: " + err.errors.join(", ")
            });
            return;
        }

        const makeDataUrl = (value: string) => {
            const canvas = document.createElement('canvas');
            canvas.width = 400;
            canvas.height = 150;
            try {
                const JsBarcode = require('jsbarcode');
                JsBarcode(canvas, value, { format: 'CODE128', width: 2, height: 80, displayValue: true, fontSize: 14, margin: 8 });
                return canvas.toDataURL('image/png');
            } catch { return ''; }
        };

        const items = labelRows.map(r => {
            const originalProduct = r.fullProduct || allProducts.find(p => ((p as any)._id || (p as any).id) === r.id) as any;
            let barcodeValue = barcodeUtils.getProductBarcode(originalProduct);

            if (barcodeUtils.needsBarcodeGeneration(originalProduct)) {
                const sku = originalProduct.SKU || originalProduct.sku;
                if (sku) {
                    barcodeValue = barcodeUtils.generateBarcodeFromSKU(sku);
                    barcodeUtils.updateProductBarcodeInDB(originalProduct, barcodeValue, updateStateCallback);
                }
            }

            return {
                ...r,
                img: makeDataUrl(barcodeValue),
                barcodeValue,
                variation: originalProduct?.variation || originalProduct?.variantTitle || '',
                note: settings.note || '',
                overrideExpiry,
                expiryDate: originalProduct?.expiryDate || '',
                price: r.price ?? barcodeUtils.getProductPrice(originalProduct)
            };
        });

        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const { showName, showVariation, showSKU, showPrice, showNote, showExpiryDate } = showSettings;
        const { sizeName, sizeVariation, sizeSKU, sizePrice, sizeNote, sizeExpiryDate } = settings;

        const html = `<!DOCTYPE html><html><head><style>@media print { body { margin: 0; } .label { page-break-inside: avoid; } } body { font-family: Arial, sans-serif; padding: 16px; } .grid { display: flex; flex-wrap: wrap; gap: 12px; } .label { border: 1px solid #e5e7eb; border-radius: 6px; padding: 10px; width: 300px; text-align: center; } .name { font-weight: 600; margin-bottom: 6px; } .meta { color: #6b7280; font-size: 12px; margin-bottom: 6px; } .img { width: 100%; height: auto; }</style></head><body onload="window.print();window.close()"><div class="grid">${items.map((it: any) => Array.from({ length: Math.max(1, it.labels || 1) }).map(() => `<div class="label"><div class="top">${showName ? `<div class="name" style="font-size:${sizeName}px">${it.name}</div>` : ''}${showVariation && it.variation ? `<div class="meta" style="font-size:${sizeVariation}px">${it.variation}</div>` : ''}${showSKU && it.sku ? `<div class="meta" style="font-size:${sizeSKU}px">SKU: ${it.sku}</div>` : ''}${showNote && it.note ? `<div class="meta" style="font-size:${sizeNote}px">${it.note}</div>` : ''}${showPrice && it.price ? `<div class="meta" style="font-size:${sizePrice}px"><strong>MRP:</strong> &#8377;${it.price.toFixed(2)}</div>` : ''}${showExpiryDate && (it.overrideExpiry || it.expiryDate) ? `<div class="meta" style="font-size:${sizeExpiryDate}px">Exp: ${it.overrideExpiry || it.expiryDate}</div>` : ''}</div><img class="img" src="${it.img}" /></div>`).join('')).join('')}</div></body></html>`;

        printWindow.document.write(html);
        printWindow.document.close();
    },

    generateBarcodeImageFile: async (barcodeValue: string, sku: string): Promise<File | null> => {
        try {
            const canvas = document.createElement('canvas');
            canvas.width = 400;
            canvas.height = 150;

            const JsBarcode = require('jsbarcode');
            JsBarcode(canvas, barcodeValue, {
                format: "CODE128",
                width: 2,
                height: 80,
                displayValue: true,
                fontSize: 14,
                margin: 8
            });

            return new Promise<File | null>((resolve) => {
                canvas.toBlob((blob) => {
                    if (blob) {
                        const fileName = `barcode-${sku}-${Date.now()}.png`;
                        const file = new File([blob], fileName, { type: 'image/png' });
                        resolve(file);
                    } else {
                        resolve(null);
                    }
                }, 'image/png');
            });
        } catch (error) {
            console.error('Error generating barcode image file:', error);
            return null;
        }
    }
};

interface UseBarcodeHandlersProps {
    selectedProduct: any;
    labelRows: any[];
    allProducts: AdminTypes.InventoryTypes.ProductTypes.Product[];
    setAllProducts: React.Dispatch<React.SetStateAction<AdminTypes.InventoryTypes.ProductTypes.Product[]>>;
    settings: {
        sizeName: number;
        sizeVariation: number;
        sizePrice: number;
        sizeSKU: number;
        sizeExpiryDate: number;
        sizeNote: number;
        note: string;
    };
    showSettings: {
        showName: boolean;
        showVariation: boolean;
        showPrice: boolean;
        showSKU: boolean;
        showExpiryDate: boolean;
        showNote: boolean;
    };
    overrideExpiry: string;
}

export const useBarcodeHandlers = ({
    selectedProduct,
    labelRows,
    allProducts,
    setAllProducts,
    settings,
    showSettings,
    overrideExpiry
}: UseBarcodeHandlersProps) => {

    const handlePrintBarcode = useCallback(() => {
        barcodeUtils.handlePrintBarcode(
            selectedProduct,
            settings,
            (updatedProduct) => {
                setAllProducts(prev => prev.map(p => {
                    const pId = (p as any)._id || (p as any).id;
                    const generatedId = (updatedProduct as any)._id || (updatedProduct as any).id;
                    return pId === generatedId ? { ...p, barcode: updatedProduct.barcode, barcodeUrl: updatedProduct.barcodeUrl } : p;
                }));
            }
        );
    }, [selectedProduct, settings, setAllProducts]);

    const handleBulkPrint = useCallback(async () => {
        await barcodeUtils.handleBulkPrint(
            labelRows,
            allProducts,
            settings,
            showSettings,
            overrideExpiry,
            (updatedProduct) => {
                setAllProducts(prev => prev.map(p => {
                    const pId = (p as any)._id || (p as any).id;
                    const generatedId = (updatedProduct as any)._id || (updatedProduct as any).id;
                    return pId === generatedId ? { ...p, barcode: updatedProduct.barcode, barcodeUrl: updatedProduct.barcodeUrl } : p;
                }));
            }
        );
    }, [labelRows, allProducts, settings, showSettings, overrideExpiry, setAllProducts]);

    return {
        handlePrintBarcode,
        handleBulkPrint
    };
};
