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
import { SalesReturn } from "@/types/admin/sales/sales-return";

const statusColor: Record<string, "active" | "warning" | "inactive" | "info" | "default"> = {
    Approved: "active",
    Pending: "warning",
    Rejected: "inactive",
    Completed: "info",
};

interface SalesReturnDetailsModalProps {
    salesReturn: SalesReturn;
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
            subtitle={`Detail view for ${salesReturn.invoiceNumber}`}
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
                        label="Invoice Number"
                        icon={<Hash size={16} />}
                        value={salesReturn.invoiceNumber}
                    />
                    <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow
                        label="Customer"
                        icon={<User size={16} />}
                        value={salesReturn.customerId?.customerName || "N/A"}
                    />
                    <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow
                        label="Reason"
                        icon={<AlertCircle size={16} />}
                        value={salesReturn.reason || "N/A"}
                    />
                </WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoCard>

                {/* Financial Information Card */}
                <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoCard
                    title="Financial Information"
                    icon={<DollarSign size={18} className="text-white" />}
                >
                    <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow
                        label="Total Refund"
                        icon={<DollarSign size={16} />}
                        value={`$${salesReturn.totalRefundAmount.toFixed(2)}`}
                    />
                    <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow
                        label="Shipping Adj."
                        icon={<DollarSign size={16} />}
                        value={`$${salesReturn.shippingAdjustment.toFixed(2)}`}
                    />
                    <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow
                        label="Current Status"
                        icon={<Tag size={16} />}
                        value={statusLabel}
                    />
                </WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoCard>
            </div>

            {/* Items Detail Section */}
            {salesReturn.items && salesReturn.items.length > 0 && (
                <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-600">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Return Items</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Product</th>
                                    <th scope="col" className="px-6 py-3">Quantity</th>
                                    <th scope="col" className="px-6 py-3">Selling Price</th>
                                    <th scope="col" className="px-6 py-3">Net Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {salesReturn.items.map((item, idx) => (
                                    <tr key={item.salesItemId || idx} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{item.productName}</td>
                                        <td className="px-6 py-4">{item.returnQuantity}</td>
                                        <td className="px-6 py-4">${item.sellingPrice.toFixed(2)}</td>
                                        <td className="px-6 py-4">${item.netAmount.toFixed(2)}</td>
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
