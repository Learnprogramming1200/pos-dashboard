import { WebComponents } from "@/components";
import { Settings } from 'lucide-react';
import { AdminTypes } from '@/types';

export default function BarcodeSettingsModal({
    isOpen,
    onOpenChange,
    barcodeSettings,
    updateBarcodeSetting
}: AdminTypes.InventoryTypes.BarcodeTypes.BarcodeSettingsModalProps) {
    return (
        <WebComponents.UiComponents.UiWebComponents.Dialog open={isOpen} onOpenChange={onOpenChange}>
            <WebComponents.UiComponents.UiWebComponents.DialogContent className="bg-white dark:bg-[#1E1E1E] border-gray-200 dark:border-[#2E2E2E] max-w-4xl max-h-[90vh] overflow-y-auto">
                <WebComponents.AdminComponents.AdminWebComponents.DialogHeader>
                    <div className="flex items-center gap-2">
                        <Settings className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                        <WebComponents.UiComponents.UiWebComponents.DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">Settings</WebComponents.UiComponents.UiWebComponents.DialogTitle>
                    </div>
                    <WebComponents.UiComponents.UiWebComponents.DialogDescription className="text-sm text-gray-500 dark:text-gray-300">
                        Configure barcode and label settings
                    </WebComponents.UiComponents.UiWebComponents.DialogDescription>
                </WebComponents.AdminComponents.AdminWebComponents.DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mt-4">
                    {/* Barcode Settings */}
                    <div className="space-y-6">
                        <h4 className="font-medium text-lg text-gray-900 dark:text-white">Barcode Settings</h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div>
                                <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="format">Format</WebComponents.UiComponents.UiWebComponents.FormLabel>
                                <WebComponents.UiComponents.UiWebComponents.FormDropdown
                                    id="format"
                                    value={barcodeSettings.format}
                                    onChange={(e) => updateBarcodeSetting('format', e.target.value as AdminTypes.InventoryTypes.BarcodeTypes.BarcodeSettings['format'])}
                                >
                                    <WebComponents.UiComponents.UiWebComponents.FormOption value="CODE128">CODE128</WebComponents.UiComponents.UiWebComponents.FormOption>
                                    <WebComponents.UiComponents.UiWebComponents.FormOption value="CODE39">CODE39</WebComponents.UiComponents.UiWebComponents.FormOption>
                                    <WebComponents.UiComponents.UiWebComponents.FormOption value="EAN13">EAN13</WebComponents.UiComponents.UiWebComponents.FormOption>
                                    <WebComponents.UiComponents.UiWebComponents.FormOption value="EAN8">EAN8</WebComponents.UiComponents.UiWebComponents.FormOption>
                                    <WebComponents.UiComponents.UiWebComponents.FormOption value="UPC">UPC</WebComponents.UiComponents.UiWebComponents.FormOption>
                                    <WebComponents.UiComponents.UiWebComponents.FormOption value="ITF14">ITF14</WebComponents.UiComponents.UiWebComponents.FormOption>
                                    <WebComponents.UiComponents.UiWebComponents.FormOption value="MSI">MSI</WebComponents.UiComponents.UiWebComponents.FormOption>
                                    <WebComponents.UiComponents.UiWebComponents.FormOption value="pharmacode">Pharmacode</WebComponents.UiComponents.UiWebComponents.FormOption>
                                    <WebComponents.UiComponents.UiWebComponents.FormOption value="codabar">Codabar</WebComponents.UiComponents.UiWebComponents.FormOption>
                                </WebComponents.UiComponents.UiWebComponents.FormDropdown>
                            </div>

                            <div>
                                <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="width">Width</WebComponents.UiComponents.UiWebComponents.FormLabel>
                                <WebComponents.UiComponents.UiWebComponents.FormInput
                                    id="width"
                                    type="number"
                                    value={barcodeSettings.width}
                                    onChange={(e) => updateBarcodeSetting('width', parseInt(e.target.value))}
                                    min="1"
                                    max="10"
                                />
                            </div>

                            <div>
                                <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="height">Height</WebComponents.UiComponents.UiWebComponents.FormLabel>
                                <WebComponents.UiComponents.UiWebComponents.FormInput
                                    id="height"
                                    type="number"
                                    value={barcodeSettings.height}
                                    onChange={(e) => updateBarcodeSetting('height', parseInt(e.target.value))}
                                    min="50"
                                    max="300"
                                />
                            </div>

                            <div>
                                <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="fontSize">Font Size</WebComponents.UiComponents.UiWebComponents.FormLabel>
                                <WebComponents.UiComponents.UiWebComponents.FormInput
                                    id="fontSize"
                                    type="number"
                                    value={barcodeSettings.fontSize}
                                    onChange={(e) => updateBarcodeSetting('fontSize', parseInt(e.target.value))}
                                    min="10"
                                    max="50"
                                />
                            </div>

                            <div>
                                <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="margin">Margin</WebComponents.UiComponents.UiWebComponents.FormLabel>
                                <WebComponents.UiComponents.UiWebComponents.FormInput
                                    id="margin"
                                    type="number"
                                    value={barcodeSettings.margin}
                                    onChange={(e) => updateBarcodeSetting('margin', parseInt(e.target.value))}
                                    min="0"
                                    max="50"
                                />
                            </div>

                            <div>
                                <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="textPosition">Text Position</WebComponents.UiComponents.UiWebComponents.FormLabel>
                                <WebComponents.UiComponents.UiWebComponents.FormDropdown
                                    id="textPosition"
                                    value={barcodeSettings.textPosition}
                                    onChange={(e) => updateBarcodeSetting('textPosition', e.target.value as AdminTypes.InventoryTypes.BarcodeTypes.BarcodeSettings['textPosition'])}
                                >
                                    <WebComponents.UiComponents.UiWebComponents.FormOption value="bottom">Bottom</WebComponents.UiComponents.UiWebComponents.FormOption>
                                    <WebComponents.UiComponents.UiWebComponents.FormOption value="top">Top</WebComponents.UiComponents.UiWebComponents.FormOption>
                                </WebComponents.UiComponents.UiWebComponents.FormDropdown>
                            </div>

                            <div>
                                <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="textAlign">Text Align</WebComponents.UiComponents.UiWebComponents.FormLabel>
                                <WebComponents.UiComponents.UiWebComponents.FormDropdown
                                    id="textAlign"
                                    value={barcodeSettings.textAlign}
                                    onChange={(e) => updateBarcodeSetting('textAlign', e.target.value as AdminTypes.InventoryTypes.BarcodeTypes.BarcodeSettings['textAlign'])}
                                >
                                    <WebComponents.UiComponents.UiWebComponents.FormOption value="left">Left</WebComponents.UiComponents.UiWebComponents.FormOption>
                                    <WebComponents.UiComponents.UiWebComponents.FormOption value="center">Center</WebComponents.UiComponents.UiWebComponents.FormOption>
                                    <WebComponents.UiComponents.UiWebComponents.FormOption value="right">Right</WebComponents.UiComponents.UiWebComponents.FormOption>
                                </WebComponents.UiComponents.UiWebComponents.FormDropdown>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="displayValue"
                                checked={barcodeSettings.displayValue}
                                onChange={(e) => updateBarcodeSetting('displayValue', e.target.checked)}
                                className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary dark:bg-[#0F0F0F] dark:border-[#2E2E2E]"
                            />
                            <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="displayValue" className="mb-0">Display Value</WebComponents.UiComponents.UiWebComponents.FormLabel>
                        </div>
                    </div>
                </div>
            </WebComponents.UiComponents.UiWebComponents.DialogContent>
        </WebComponents.UiComponents.UiWebComponents.Dialog>
    );
}
