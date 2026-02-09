"use client";
import React from "react";
import { Calculator, Tag, Clock, Calendar, Percent, DollarSign } from "lucide-react";
import { WebComponents } from "@/components";
import { AdminTypes } from "@/types";

interface TaxDetailsModalProps {
    tax: AdminTypes.taxTypes.Tax;
    onClose: () => void;
}

const TaxDetailsModal: React.FC<TaxDetailsModalProps> = ({ tax, onClose }) => {
    if (!tax) return null;

    const taxData = {
        taxName: tax.taxName || "-",
        taxType: tax.taxType || "N/A",
        valueType: tax.valueType || "N/A",
        value: tax.value || 0,
        description: tax.description || "N/A",
        status: typeof tax.status === "boolean" ? (tax.status ? "Active" : "Inactive") : (tax.status || "Inactive"),
        createdDate: tax.createdAt ? new Date(tax.createdAt).toLocaleDateString() : "N/A",
        lastUpdated: tax.updatedAt ? new Date(tax.updatedAt).toLocaleDateString() : "N/A",
    };

    const statusColor = taxData.status === "Active" ? "active" : "inactive";
    return (
        <WebComponents.WebCommonComponents.CommonComponents.DetailsModalLayout
            title="Tax Profile"
            subtitle="Complete tax information and details"
            icon={<Calculator size={32} className="text-white" />}
            statusLabel={taxData.status}
            statusColor={statusColor as any}
            onClose={onClose}
        >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Tax Information Card */}
                <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoCard
                    title="Tax Information"
                    icon={<Calculator size={18} className="text-white" />}
                >
                    <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow
                        label="Tax Name"
                        icon={<Tag size={16} />}
                        value={taxData.taxName}
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow
                            label="Tax Type"
                            icon={<Calculator size={16} />}
                            value={taxData.taxType}
                        />
                        <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow
                            label="Value"
                            icon={taxData.valueType === "Percentage" ? <Percent size={16} /> : <DollarSign size={16} />}
                            value={`${taxData.value}${taxData.valueType === "Percentage" ? "%" : ""} (${taxData.valueType})`}
                        />
                    </div>

                    <div>
                        <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoLabel
                            icon={<Clock size={16} />}
                            label="Description"
                        />
                        <p className="text-base text-gray-700 ml-6 dark:text-gray-300 italic leading-relaxed">
                            {taxData.description}
                        </p>
                    </div>
                </WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoCard>

                {/* Timestamps Section */}
                <div className="bg-gradient-to-br from-slate-50 to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                        <Calendar size={20} className="text-gray-600 dark:text-gray-300" />
                        Timestamps
                    </h3>

                    <div className="grid grid-cols-1 gap-6">
                        <WebComponents.UiComponents.UiWebComponents.DetailsCommon.TimelineItem
                            icon={<Calendar size={20} />}
                            label="Created Date"
                            value={taxData.createdDate}
                        />

                        <WebComponents.UiComponents.UiWebComponents.DetailsCommon.TimelineItem
                            icon={<Clock size={20} />}
                            label="Last Updated"
                            value={taxData.lastUpdated}
                        />
                    </div>
                </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 flex justify-end">
                <button
                    onClick={onClose}
                    className="px-6 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl transition-all active:scale-95"
                >
                    Close Details
                </button>
            </div>
        </WebComponents.WebCommonComponents.CommonComponents.DetailsModalLayout>
    );
};

export default TaxDetailsModal;
