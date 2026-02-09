
import React from 'react';
import { Constants } from "@/constant";
import { barcodeLabelSchema } from "@/app/validation/ValidationSchema";
import { WebComponents } from '..';
import { AdminTypes } from '@/types';

export const LabelSettings: React.FC<AdminTypes.InventoryTypes.BarcodeTypes.LabelSettingsProps> = ({
    isLabelSectionEnabled,
    previewProduct,
    overrideExpiry,
    setOverrideExpiry,
    note,
    setNote,
    showName, setShowName, sizeName, setSizeName,
    showVariation, setShowVariation, sizeVariation, setSizeVariation,
    showPrice, setShowPrice, sizePrice, setSizePrice,
    showSKU, setShowSKU, sizeSKU, setSizeSKU,
    showExpiryDate, setShowExpiryDate, sizeExpiryDate, setSizeExpiryDate,
    showNote, setShowNote, sizeNote, setSizeNote
}) => {
    return (
        <div className="bg-white dark:bg-[#1E1E1E] rounded-lg border border-gray-200 dark:border-[#2E2E2E] mb-4">
            <div className={`p-6 ${!isLabelSectionEnabled ? 'opacity-50 pointer-events-none' : ''}`} aria-disabled={!isLabelSectionEnabled}>
                <div className="text-base font-semibold text-gray-800 dark:text-white mb-1">{Constants.adminConstants.BARCODE_CONSTANTS.infoTitle}</div>
                {!isLabelSectionEnabled && <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">Select a product to enable this section.</div>}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-gray-200 dark:border-[#2E2E2E] pb-6 mb-6">
                    <div className="col-span-1">
                        <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="expiryDate">Expiry Date Value</WebComponents.UiComponents.UiWebComponents.FormLabel>
                        <WebComponents.UiComponents.UiWebComponents.FormInput
                            id="expiryDate" name="expiryDate" type="text" placeholder="DD/MM/YYYY or YYYY-MM-DD" className="mt-1"
                            value={overrideExpiry || (previewProduct as any)?.expiryDate || ''}
                            onChange={(e) => setOverrideExpiry(e.target.value)}
                        />
                    </div>
                    <div className="col-span-1">
                        <div className="flex justify-between items-center mb-1">
                            <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="noteContentTop">Note Content Value</WebComponents.UiComponents.UiWebComponents.FormLabel>
                            <p className="text-textSmall dark:text-gray-400 font-interTight font-normal text-xs sm:text-sm leading-[8px]">
                                Max 45 characters
                            </p>
                        </div>
                        <WebComponents.UiComponents.UiWebComponents.FormInput
                            id="noteContentTop" name="noteContentTop" type="text" placeholder="Enter notes to show on label"
                            value={note} onChange={(e) => setNote(e.target.value)} maxLength={45}
                            className={(() => {
                                try {
                                    barcodeLabelSchema.validateSyncAt('note', { note });
                                    return "";
                                } catch (err) {
                                    return "border-red-500";
                                }
                            })()}
                        />
                        <div className="flex justify-between items-center mt-1">
                            <div>
                                {(() => {
                                    try {
                                        barcodeLabelSchema.validateSyncAt('note', { note });
                                        return null;
                                    } catch (err: any) {
                                        return <p className="text-sm text-red-500">{err.message}</p>;
                                    }
                                })()}
                            </div>
                            <div className="text-xs text-textSmall font-interTight">
                                {note.length}/45
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                        { label: 'Product Name', checked: showName, setChecked: setShowName, size: sizeName, setSize: setSizeName, id: 'productName' },
                        { label: 'Product Variation', checked: showVariation, setChecked: setShowVariation, size: sizeVariation, setSize: setSizeVariation, id: 'productVariation' },
                        { label: 'Product Price', checked: showPrice, setChecked: setShowPrice, size: sizePrice, setSize: setSizePrice, id: 'productPrice' },
                        { label: 'Product SKU', checked: showSKU, setChecked: setShowSKU, size: sizeSKU, setSize: setSizeSKU, id: 'productSKU' },
                        { label: 'Expiry Date', checked: showExpiryDate, setChecked: setShowExpiryDate, size: sizeExpiryDate, setSize: setSizeExpiryDate, id: 'expiryDateSize' },
                        { label: 'Note', checked: showNote, setChecked: setShowNote, size: sizeNote, setSize: setSizeNote, id: 'noteSize' },
                    ].map((item) => (
                        <div key={item.id} className="col-span-1">
                            <div className="flex items-center gap-2 mb-3 min-h-[32px]">
                                <input type="checkbox" checked={item.checked} onChange={(e) => item.setChecked(e.target.checked)} className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary" />
                                <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor={item.id} className="mb-0">{item.label}</WebComponents.UiComponents.UiWebComponents.FormLabel>
                            </div>
                            <WebComponents.UiComponents.UiWebComponents.FormInput
                                id={item.id} name={item.id} type="number" min={8} value={item.size}
                                onChange={(e) => {
                                    const val = parseInt(e.target.value || '0');
                                    item.setSize(val);
                                }} placeholder={Constants.adminConstants.BARCODE_CONSTANTS.fontSize}
                                className={(() => {
                                    try {
                                        barcodeLabelSchema.validateSyncAt(item.id, { [item.id]: item.size });
                                        return "";
                                    } catch (err) {
                                        return "border-red-500";
                                    }
                                })()}
                            />
                            {(() => {
                                try {
                                    barcodeLabelSchema.validateSyncAt(item.id, { [item.id]: item.size });
                                    return null;
                                } catch (err: any) {
                                    return <p className="mt-1 text-sm text-red-500">{err.message}</p>;
                                }
                            })()}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
