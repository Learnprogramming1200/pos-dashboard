
import React from 'react';
import { Package } from "lucide-react";
import { WebComponents } from "@/components"; // For EnhancedBarcodeGenerator
import { barcodeUtils } from '@/utils/barcodeUtils';
import { AdminTypes } from '@/types';

export const BarcodePreview: React.FC<AdminTypes.InventoryTypes.BarcodeTypes.BarcodePreviewProps> = ({
    showPreview,
    previewProduct,
    showName,
    showVariation,
    showPrice,
    showSKU,
    showExpiryDate,
    showNote,
    sizeName,
    sizeVariation,
    sizePrice,
    sizeSKU,
    sizeExpiryDate,
    sizeNote,
    note,
    overrideExpiry
}) => {
    return (
        <div className="bg-white dark:bg-[#1E1E1E] border border-gray-200 dark:border-[#2E2E2E] rounded-lg p-4 h-full">
            <div className="flex items-center justify-between mb-3"><div className="text-base font-medium text-gray-800 dark:text-white">Preview</div></div>
            {showPreview && previewProduct ? (
                <div className="space-y-4">
                    <WebComponents.AdminComponents.AdminWebComponents.EnhancedBarcodeGenerator
                        product={previewProduct} showProductName={showName} showPrice={showPrice} showSKU={showSKU} showExpiryDate={showExpiryDate} showNote={showNote} showVariation={showVariation}
                        fontSizeName={sizeName} fontSizeVariation={sizeVariation} fontSizePrice={sizePrice} fontSizeSKU={sizeSKU} fontSizeNote={sizeNote} fontSizeExpiryDate={sizeExpiryDate}
                        note={note} overrideExpiry={overrideExpiry}
                    />
                    <div className="border-t border-gray-200 dark:border-[#2E2E2E]"></div>
                    <div className="bg-gray-50 dark:bg-[#0F0F0F] p-4 rounded-lg border border-gray-200 dark:border-[#2E2E2E] min-h-[260px]">
                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2"><span>Label Information Preview</span><span className="text-xs text-gray-500 dark:text-gray-400">(Character limits shown)</span></h3>
                        <div className="space-y-2 text-sm">
                            {showName && <div className="flex justify-between items-center"><span className="text-gray-600 dark:text-gray-400">Product Name:</span><div className="flex items-center gap-2"><span className="font-medium text-gray-900 dark:text-white truncate max-w-[200px]" title={previewProduct.productName || previewProduct.name}>{previewProduct.productName || previewProduct.name}</span><span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-[#2A2A2A] px-2 py-1 rounded">{sizeName}</span></div></div>}
                            {showVariation && previewProduct.variation && <div className="flex justify-between items-center"><span className="text-gray-600 dark:text-gray-400">Product Variation:</span><div className="flex items-center gap-2"><span className="font-medium text-gray-900 dark:text-white">{previewProduct.variation}</span><span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">{sizeVariation}</span></div></div>}
                            {showPrice && <div className="flex justify-between items-center"><span className="text-gray-600 dark:text-gray-400">Product Price:</span><div className="flex items-center gap-2"><span className="font-medium text-gray-900 dark:text-white">₹{barcodeUtils.getProductPrice(previewProduct).toFixed(2)}</span><span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">{sizePrice}</span></div></div>}
                            {showSKU && <div className="flex justify-between items-center"><span className="text-gray-600 dark:text-gray-400">Product SKU:</span><div className="flex items-center gap-2"><span className="font-medium text-gray-900 dark:text-white">{previewProduct.variantData?.[0]?.SKU || previewProduct.SKU || previewProduct.sku || previewProduct.productSku}</span><span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">{sizeSKU}</span></div></div>}
                            {showNote && note && <div className="flex justify-between items-center"><span className="text-gray-600 dark:text-gray-400">Note:</span><div className="flex items-center gap-2"><span className="font-medium text-gray-900 dark:text-white text-right max-w-[200px] truncate" title={note}>{note}</span><span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">{sizeNote}</span></div></div>}
                            {showExpiryDate && (overrideExpiry || previewProduct.expiryDate) && <div className="flex justify-between items-center"><span className="text-gray-600 dark:text-gray-400">Expiry Date:</span><div className="flex items-center gap-2"><span className="font-medium text-gray-900 dark:text-white">{overrideExpiry || previewProduct.expiryDate}</span><span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">{sizeExpiryDate}</span></div></div>}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-[650px] text-gray-400 dark:text-gray-500 border-2 border-dashed border-gray-200 dark:border-[#2E2E2E] rounded-lg bg-gray-50 dark:bg-[#0F0F0F] m-2">
                    <Package className="w-12 h-12 mb-3 opacity-50" />
                    <p className="text-sm font-medium">Select a product to generate barcode</p>
                    <p className="text-xs mt-1 opacity-75">Search above to preview</p>
                </div>
            )}
        </div>
    );
};
