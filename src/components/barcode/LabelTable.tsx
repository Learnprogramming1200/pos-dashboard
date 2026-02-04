
import React from 'react';
import { barcodeUtils } from '@/utils/barcodeUtils';
import { WebComponents } from '..';
import { AdminTypes } from "@/types";

export const LabelTable: React.FC<AdminTypes.InventoryTypes.BarcodeTypes.LabelTableProps> = ({ labelRows, setLabelRows, isLabelSectionEnabled, allProducts }) => {
    return (
        <div className="bg-white dark:bg-[#1E1E1E] rounded-lg border border-gray-200 dark:border-[#2E2E2E] mb-4">
            <div className={`p-6 ${!isLabelSectionEnabled ? 'opacity-50 pointer-events-none' : ''}`} aria-disabled={!isLabelSectionEnabled}>
                <div className="text-base font-semibold text-gray-800 dark:text-white mb-1">Add products to generate Labels</div>
                {!isLabelSectionEnabled && <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">Select a product to enable this section.</div>}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-md overflow-hidden">
                        <thead className="bg-gray-50 dark:bg-[#0F0F0F]">
                            <tr className="h-12">
                                <th className="text-left px-4 py-3 font-medium text-gray-700 dark:text-gray-300 min-w-[300px]">Products</th>
                                <th className="text-left px-4 py-3 font-medium text-gray-700 dark:text-gray-300 w-[120px]">No. of labels</th>
                                <th className="text-left px-4 py-3 font-medium text-gray-700 dark:text-gray-300 w-[120px]">Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            {labelRows.length > 0 ? (
                                labelRows.map((row, idx) => {
                                    const originalProduct = row.fullProduct || allProducts.find(p => ((p as any)._id || (p as any).id) === row.id) as any;
                                    return (
                                        <tr key={row.id} className="border-t border-gray-200 dark:border-[#2E2E2E] hover:bg-gray-50 dark:hover:bg-[#0F0F0F] transition-colors h-14">
                                            <td className="px-4 py-3">
                                                <div className="font-medium text-gray-900 dark:text-white truncate max-w-[250px]" title={row.name}>{row.name}</div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <WebComponents.UiComponents.UiWebComponents.FormInput
                                                    type="number" min={1} value={row.labels}
                                                    onChange={(e) => setLabelRows(prev => prev.map((r, i) => i === idx ? { ...r, labels: Math.max(1, parseInt(e.target.value || '1')) } : r))}
                                                    className="h-10 w-full"
                                                />
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="h-10 w-full flex items-center px-3 bg-gray-50 dark:bg-[#0F0F0F] border border-gray-300 dark:border-[#2E2E2E] rounded-md text-gray-900 dark:text-white">
                                                    ₹{barcodeUtils.getProductPrice(originalProduct).toFixed(2)}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr className="h-16">
                                    <td className="px-4 py-6 text-gray-500 dark:text-gray-400 text-center" colSpan={3}>
                                        Search and select a product above to add it to the label list.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
