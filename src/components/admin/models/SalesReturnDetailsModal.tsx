"use client";
import {
    Calendar,
    Clock,
    Tag,
    FileText,
    User,
    Hash,
    DollarSign,
    AlertCircle
} from "lucide-react";
import { Constants } from "@/constant";
import { WebComponents } from "@/components";
import { AdminTypes } from "@/types";

const statusColor: Record<string, "active" | "warning" | "inactive" | "info" | "default"> = {
    Approved: "active",
    Pending: "warning",
    Rejected: "inactive",
    Completed: "info",
};

interface SalesReturnDetailsModalProps {
    salesReturn: AdminTypes.SalesTypes.Sales.SalesReturn;
    onClose: () => void;
}

const SalesReturnDetailsModal = ({
    salesReturn,
    onClose,
}: SalesReturnDetailsModalProps) => {
    const statusLabel = salesReturn.status;

    return (
        <WebComponents.WebCommonComponents.CommonComponents.DetailsModalLayout
            title="Sales Return Details"
            subtitle={`Detail view for Return #${salesReturn.returnNumber}`}
            icon={<FileText size={32} className="text-white" />}
            statusLabel={statusLabel}
            statusColor={(statusColor[salesReturn.status] || "default") as any}
            onClose={onClose}
        >
            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* General Information Card */}
                <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoCard
                    title="General Information"
                    icon={<FileText size={18} className="text-white" />}
                >
                    <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow
                        label="Return Number"
                        icon={<Hash size={16} />}
                        value={salesReturn.returnNumber}
                    />
                    <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow
                        label="Invoice Number"
                        icon={<Hash size={16} />}
                        value={salesReturn.invoiceNumber}
                    />
                    <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow
                        label="Customer"
                        icon={<User size={16} />}
                        value={salesReturn.customerName}
                    />
                    <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow
                        label="Reason"
                        icon={<AlertCircle size={16} />}
                        value={salesReturn.reason || "N/A"}
                    />

                    <div>
                        <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoLabel
                            icon={<FileText size={16} />}
                            label={Constants.adminConstants.descriptionLabel} // Reusing label for Notes
                        />
                        <p className="text-base text-gray-700 ml-6 dark:text-gray-300">
                            {salesReturn.notes || 'No notes provided'}
                        </p>
                    </div>

                </WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoCard>

                {/* Financial Information Card */}
                <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoCard
                    title="Financial Information"
                    icon={<DollarSign size={18} className="text-white" />}
                >
                    <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow
                        label="Total Amount"
                        icon={<DollarSign size={16} />}
                        value={`$${salesReturn.totalReturnAmount.toFixed(2)}`}
                    />
                    <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow
                        label="Return Charges"
                        icon={<DollarSign size={16} />}
                        value={`$${salesReturn.returnCharges.toFixed(2)}`}
                    />
                    <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow
                        label="Current Status"
                        icon={<Tag size={16} />}
                        value={statusLabel}
                    />
                </WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoCard>
            </div>

            {/* Items Detail Section (If needed, can be added here) */}
            {salesReturn.items && salesReturn.items.length > 0 && (
                <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-600">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Return Items</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Product</th>
                                    <th scope="col" className="px-6 py-3">Quantity</th>
                                    <th scope="col" className="px-6 py-3">Unit Price</th>
                                    <th scope="col" className="px-6 py-3">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {salesReturn.items.map((item) => (
                                    <tr key={item.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{item.productName}</td>
                                        <td className="px-6 py-4">{item.quantity}</td>
                                        <td className="px-6 py-4">${item.unitPrice.toFixed(2)}</td>
                                        <td className="px-6 py-4">${item.total.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}


            {/* Timeline Section */}
            <div className="mt-4 bg-gradient-to-r from-slate-50 to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-600">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <Clock size={20} className="text-gray-600 dark:text-gray-300" />
                    {Constants.adminConstants.activityTimelineLabel}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <WebComponents.UiComponents.UiWebComponents.DetailsCommon.TimelineItem
                        icon={<Calendar size={20} />}
                        label={Constants.adminConstants.createdOnLabel}
                        value={
                            salesReturn.returnDate
                                ? new Date(salesReturn.returnDate).toLocaleDateString()
                                : new Date((salesReturn as any).saleDate || Date.now()).toLocaleDateString()
                        }
                    />
                    <WebComponents.UiComponents.UiWebComponents.DetailsCommon.TimelineItem
                        icon={<Clock size={20} />}
                        label={Constants.adminConstants.lastModifiedLabel}
                        value={
                            salesReturn.updatedAt
                                ? new Date(salesReturn.updatedAt).toLocaleDateString()
                                : "N/A"
                        }
                    />
                </div>
            </div>
        </WebComponents.WebCommonComponents.CommonComponents.DetailsModalLayout>
    );
};

export default SalesReturnDetailsModal;
