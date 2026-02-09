"use client";
import { Package, Store, AlertCircle, Calendar, Clock, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { WebComponents } from "@/components";
import { AdminTypes } from "@/types";

interface StockAdjustmentDetailsModalProps {
    adjustment:  AdminTypes.StockTypes.Entities.StockAdjustment
    onClose: () => void;
}

export default function StockAdjustmentDetailsModal({
    adjustment,
    onClose
}: StockAdjustmentDetailsModalProps) {
    // Prepare data for the UI structure
    const adjustmentData = {
        store: adjustment.storeId?.name || 'N/A',
        product: adjustment.productId?.productName || 'N/A',
        sku: adjustment.sku || 'N/A',
        previousStock: adjustment.previousStock,
        actualStock: adjustment.actualStock,
        difference: adjustment.difference,
        adjustmentType: adjustment.adjustmentType,
        reason: adjustment.reason || 'N/A',
        referenceType: adjustment.referenceType || 'N/A',
        status: adjustment.status || 'N/A',
        createdDate: adjustment.createdAt ? new Date(adjustment.createdAt).toLocaleDateString() : 'N/A',
        lastUpdated: adjustment.updatedAt ? new Date(adjustment.updatedAt).toLocaleDateString() : 'N/A',
        rejectionReason: adjustment.rejectionReason || 'N/A'
    };

    const statusColorMap: Record<string, "active" | "inactive"> = {
        pending: "inactive",
        approved: "active",
        completed: "active",
        cancelled: "inactive"
    };

    return (
        <WebComponents.WebCommonComponents.CommonComponents.DetailsModalLayout
            title="Adjustment Profile"
            subtitle="Complete adjustment information and details"
            icon={<TrendingUp size={32} className="text-white" />}
            statusLabel={adjustmentData.status}
            statusColor={statusColorMap[adjustmentData.status.toLowerCase()] || "inactive"}
            onClose={onClose}
        >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Adjustment Information Card */}
                <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoCard
                    title="Adjustment Information"
                    icon={<Package size={18} className="text-white" />}
                >
                    <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow
                        label="Store"
                        icon={<Store size={16} />}
                        value={adjustmentData.store}
                    />

                    <div>
                        <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoLabel
                            icon={<Package size={16} />}
                            label="Product"
                        />
                        <p className="text-lg font-semibold text-gray-900 dark:text-white ml-6">
                            {adjustmentData.product}
                        </p>
                        {adjustmentData.sku !== 'N/A' && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 ml-6 mt-1">SKU: {adjustmentData.sku}</p>
                        )}
                    </div>

                    <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow
                        label="Previous Quantity"
                        icon={<TrendingUp size={16} />}
                        value={String(adjustmentData.previousStock)}
                    />

                    <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow
                        label="Actual Quantity"
                        icon={<TrendingUp size={16} />}
                        value={String(adjustmentData.actualStock)}
                    />

                    <div>
                        <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoLabel
                            icon={adjustmentData.difference > 0 ? <TrendingUp size={16} className="text-green-500" /> : adjustmentData.difference < 0 ? <TrendingDown size={16} className="text-red-500" /> : <Minus size={16} className="text-gray-500" />}
                            label="Difference"
                        />
                        <p className={`text-lg font-semibold ml-6 ${adjustmentData.difference > 0 ? 'text-green-600' :
                            adjustmentData.difference < 0 ? 'text-red-600' :
                                'text-gray-600'
                            }`}>
                            {adjustmentData.difference > 0 ? '+' : ''}{adjustmentData.difference}
                        </p>
                    </div>

                    <div>
                        <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoLabel
                            icon={<AlertCircle size={16} />}
                            label="Reason"
                        />
                        <p className="text-base text-gray-700 dark:text-gray-300 ml-6">
                            {adjustmentData.reason}
                        </p>
                    </div>

                    {adjustmentData.rejectionReason !== 'N/A' && (
                        <div>
                            <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoLabel
                                icon={<AlertCircle size={16} />}
                                label="Cancelled Reason"
                            />
                            <p className="text-base text-red-600 dark:text-red-400 ml-6 font-medium">
                                {adjustmentData.rejectionReason}
                            </p>
                        </div>
                    )}
                </WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoCard>

                {/* Status Information Card */}
                <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoCard
                    title="Additional Information"
                    icon={<AlertCircle size={18} className="text-white" />}
                >
                    <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow
                        label="Adjustment Type"
                        icon={<AlertCircle size={16} />}
                        value={adjustmentData.adjustmentType}
                    />

                    <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow
                        label="Reference Type"
                        icon={<AlertCircle size={16} />}
                        value={adjustmentData.referenceType}
                    />

                    <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow
                        label="Current Status"
                        icon={<AlertCircle size={16} />}
                        value={adjustmentData.status}
                    />
                </WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoCard>
            </div>

            {/* Timeline Section */}
            <div className="mt-4 bg-gradient-to-r from-slate-50 to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <Clock size={20} className="text-gray-600 dark:text-gray-400" />
                    Activity Timeline
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <WebComponents.UiComponents.UiWebComponents.DetailsCommon.TimelineItem
                        icon={<Calendar size={20} />}
                        label="Created On"
                        value={adjustmentData.createdDate}
                    />
                    <WebComponents.UiComponents.UiWebComponents.DetailsCommon.TimelineItem
                        icon={<Clock size={20} />}
                        label="Last Modified"
                        value={adjustmentData.lastUpdated}
                    />
                </div>
            </div>
        </WebComponents.WebCommonComponents.CommonComponents.DetailsModalLayout>
    );
}
