
import React from 'react';
import { Constants } from "@/constant";
import { WebComponents } from '..';

interface ManualProductFormProps {
    manualProduct: {
        name: string;
        sku: string;
        barcode: string;
        price: string;
        description: string;
        category: string;
        brand: string;
    };
    manualProductError: string | null;
    handlers: {
        handleManualProductChange: (field: string, value: string) => void;
        handleGenerateManualProduct: () => void;
        handleClearManualProduct: () => void;
    };
}

export const ManualProductForm: React.FC<ManualProductFormProps> = ({ manualProduct, manualProductError, handlers }) => {
    // Individual field handlers
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => handlers.handleManualProductChange('name', e.target.value);
    const handleSkuChange = (e: React.ChangeEvent<HTMLInputElement>) => handlers.handleManualProductChange('sku', e.target.value);
    const handleBarcodeChange = (e: React.ChangeEvent<HTMLInputElement>) => handlers.handleManualProductChange('barcode', e.target.value);
    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => handlers.handleManualProductChange('price', e.target.value);
    const handleCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => handlers.handleManualProductChange('category', e.target.value);
    const handleBrandChange = (e: React.ChangeEvent<HTMLInputElement>) => handlers.handleManualProductChange('brand', e.target.value);
    const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => handlers.handleManualProductChange('description', e.target.value);

    return (
        <div className="bg-white dark:bg-[#1E1E1E] border border-gray-200 dark:border-[#2E2E2E] rounded-lg p-4 mb-4">
            <div className="text-sm text-gray-600 dark:text-gray-300 mb-3">{Constants.adminConstants.BARCODE_CONSTANTS.createProduct}</div>
            <div className="space-y-3">
                {manualProductError && <div className="text-xs text-red-600 bg-red-50 p-2 rounded border border-red-200">{manualProductError}</div>}
                <WebComponents.UiComponents.UiWebComponents.FormInput value={manualProduct.name} onChange={handleNameChange} placeholder="Product name *" className="w-full text-sm border-gray-300" />
                <div className="grid grid-cols-2 gap-3">
                    <WebComponents.UiComponents.UiWebComponents.FormInput value={manualProduct.sku} onChange={handleSkuChange} placeholder="SKU" className="text-sm border-gray-300" />
                    <WebComponents.UiComponents.UiWebComponents.FormInput value={manualProduct.barcode} onChange={handleBarcodeChange} placeholder="Barcode" className="text-sm border-gray-300" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <WebComponents.UiComponents.UiWebComponents.FormInput type="number" value={manualProduct.price} onChange={handlePriceChange} placeholder="Price" step="0.01" className="text-sm border-gray-300" />
                    <WebComponents.UiComponents.UiWebComponents.FormInput value={manualProduct.category} onChange={handleCategoryChange} placeholder="Category" className="text-sm border-gray-300" />
                </div>
                <WebComponents.UiComponents.UiWebComponents.FormInput value={manualProduct.brand} onChange={handleBrandChange} placeholder="Brand" className="w-full text-sm border-gray-300" />
                <WebComponents.UiComponents.UiWebComponents.Textarea value={manualProduct.description} onChange={handleDescriptionChange} placeholder="Description" rows={2} className="w-full text-sm border-gray-300" />
                <div className="flex gap-2">
                    <WebComponents.UiComponents.UiWebComponents.Button onClick={handlers.handleGenerateManualProduct} size="sm" disabled={!manualProduct.name.trim()} className="flex-1 text-xs">{Constants.adminConstants.BARCODE_CONSTANTS.generate}</WebComponents.UiComponents.UiWebComponents.Button>
                    <WebComponents.UiComponents.UiWebComponents.Button onClick={handlers.handleClearManualProduct} variant="outline" size="sm" className="text-xs">{Constants.adminConstants.BARCODE_CONSTANTS.clear}</WebComponents.UiComponents.UiWebComponents.Button>
                </div>
            </div>
        </div>
    );
};
