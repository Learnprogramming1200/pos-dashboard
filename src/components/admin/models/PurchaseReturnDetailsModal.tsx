"use client";

import React from "react";
import {
    Undo2,
    Tag,
    Building2,
    Calendar,
    Package,
    User,
    Clock,
    FileText,
} from "lucide-react";

import DetailsModalLayout from "@/components/common/DetailsModalLayout";
import { InfoCard, InfoRow, TimelineItem } from "@/components/ui/DetailsCommon";
import { AdminTypes } from "@/types";
import { getPurchaseOrderByIdAction } from "@/lib/server-actions";
import { Constants } from "@/constant";

export default function PurchaseReturnDetailsModal({
    return: returnData,
    onClose,
}: {
    return: AdminTypes.purchaseReturnTypes.PurchaseReturn;
    onClose: () => void;
}) {
    const [purchaseOrderData, setPurchaseOrderData] = React.useState<any>(null);

    React.useEffect(() => {
        if (!returnData.purchaseOrderId) return;

        const fetchPO = async () => {
            const poId =
                typeof returnData.purchaseOrderId === "object"
                    ? (returnData.purchaseOrderId as any)._id ||
                    (returnData.purchaseOrderId as any).id
                    : returnData.purchaseOrderId;

            if (!poId) return;

            const res = await getPurchaseOrderByIdAction(String(poId));
            if (res?.success) {
                setPurchaseOrderData((res.data as any)?.data || res.data);
            }
        };

        fetchPO();
    }, [returnData.purchaseOrderId]);

    const createdBy =
        typeof returnData.createdBy === "string"
            ? returnData.createdBy
            : (returnData.createdBy as any)?.name ||
            (returnData.createdBy as any)?.email ||
            "N/A";

    // Map purchase return status to status color
    const getStatusColor = (status: string): "active" | "inactive" | undefined => {
        switch (status) {
            case "Approved":
            case "Credited":
            case "Closed":
                return "active";
            case "Draft":
            case "Returned":
            case "Cancelled":
                return "inactive";
            default:
                return undefined;
        }
    };

    return (
        <DetailsModalLayout
            title={Constants.adminConstants.purchaseReturnDetailsLabel}
            subtitle={Constants.adminConstants.completeReturnInformationAndHistoryLabel}
            icon={<Undo2 size={32} className="text-white" />}
            statusLabel={returnData.status}
            statusColor={getStatusColor(returnData.status)}
            onClose={onClose}
        >
            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Return Info */}
                <InfoCard
                    title={Constants.adminConstants.returnInformationLabel}
                    icon={<Tag size={18} className="text-white" />}
                >
                    <InfoRow
                        label={Constants.adminConstants.returnNumberLabel}
                        icon={<Tag size={16} />}
                        value={`POS-RET-${(returnData.returnNumber || returnData.id || "").slice(-7) || "N/A"}`}

                    />

                    <InfoRow
                        label={Constants.adminConstants.purchaseOrderLabel}
                        icon={<Package size={16} />}
                        value={
                            (typeof returnData.purchaseOrderId === 'object' && returnData.purchaseOrderId
                                ? returnData.purchaseOrderId.orderDetails?.poNumber
                                : returnData.purchaseOrderId) || "N/A"
                        }
                    />

                    <InfoRow
                        label={Constants.adminConstants.supplierLabel}
                        icon={<Building2 size={16} />}
                        value={
                            (typeof returnData.supplierId === 'object' && returnData.supplierId
                                ? returnData.supplierId.displayName || returnData.supplierId.name
                                : returnData.supplierId) || "N/A"
                        }
                    />

                    <InfoRow
                        label={Constants.adminConstants.returnDateLabel}
                        icon={<Calendar size={16} />}
                        value={
                            returnData.returnDate
                                ? new Date(returnData.returnDate).toLocaleDateString()
                                : "N/A"
                        }
                    />

                    <InfoRow
                        label={Constants.adminConstants.storeLabel}
                        icon={<Building2 size={16} />}
                        value={returnData.storeName || "N/A"}
                    />
                </InfoCard>

                {/* Financial Info */}
                <InfoCard
                    title={Constants.adminConstants.financialInformationLabel}
                    icon={<Package size={18} className="text-white" />}
                >
                    <InfoRow
                        label={Constants.adminConstants.totalRefundAmountLabel}
                        icon={<Tag size={16} />}
                        value={`₹${(returnData.totalCreditAmount || 0).toLocaleString(
                            "en-IN",
                            { minimumFractionDigits: 2 }
                        )}`}
                    />

                    <InfoRow
                        label="Received Credit Amount"
                        icon={<Tag size={16} />}
                        value={`₹${((returnData as any).receivedCreditAmount || 0).toLocaleString(
                            "en-IN",
                            { minimumFractionDigits: 2 }
                        )}`}
                    />

                    <InfoRow
                        label="Balance Credit Amount"
                        icon={<Tag size={16} />}
                        value={`₹${((returnData as any).balanceCreditAmount || 0).toLocaleString(
                            "en-IN",
                            { minimumFractionDigits: 2 }
                        )}`}
                    />

                    <InfoRow
                        label={Constants.adminConstants.createdByLabel}
                        icon={<User size={16} />}
                        value={createdBy}
                    />

                    <InfoRow
                        label={Constants.adminConstants.currentStatusLabel}
                        icon={<Tag size={16} />}
                        value={returnData.status}
                    />
                </InfoCard>
            </div>

            {/* Items */}
            <div className="mt-4">
                <InfoCard
                    title={`${Constants.adminConstants.returnedProductsLabel} (${returnData.items.length})`}
                    icon={<Package size={18} className="text-white" />}
                >
                    {returnData.items.map((item, index) => (
                        <div
                            key={(item as any).productId || index}
                            className="border-b last:border-none pb-3 mb-3"
                        >
                            <InfoRow
                                label={(item as any).productName}
                                icon={<Package size={14} />}
                                value={`Return Qty: ${(item as any).returnQty || 0} | Unit Cost: ₹${(
                                    (item as any).unitCost || 0
                                ).toLocaleString("en-IN")} | Line Total: ₹${(
                                    (item as any).lineTotal || 0
                                ).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`}
                            />
                        </div>
                    ))}
                </InfoCard>
            </div>

            {/* Notes */}
            <div className="mt-4">
                <InfoCard
                    title={Constants.adminConstants.notesLabel}
                    icon={<FileText size={18} className="text-white" />}
                >
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                        {returnData.notes || returnData.reason || "N/A"}
                    </p>
                </InfoCard>
            </div>

            {/* Credit Transactions */}
            {(returnData as any).creditTransactions && (returnData as any).creditTransactions.length > 0 && (
                <div className="mt-4">
                    <InfoCard
                        title={`Credit Transactions (${(returnData as any).creditTransactions.length})`}
                        icon={<Tag size={18} className="text-white" />}
                    >
                        {(returnData as any).creditTransactions.map((transaction: any, index: number) => (
                            <div
                                key={index}
                                className="border-b last:border-none pb-3 mb-3"
                            >
                                <InfoRow
                                    label={`Transaction ${index + 1}`}
                                    icon={<Tag size={14} />}
                                    value={`₹${transaction.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })} via ${transaction.method}`}
                                />
                                <p className="text-xs text-gray-600 dark:text-gray-400 ml-6 mt-1">
                                    Date: {new Date(transaction.date).toLocaleDateString()}
                                </p>
                            </div>
                        ))}
                    </InfoCard>
                </div>
            )}

            {/* Timeline */}
            <div className="mt-4 bg-gradient-to-r from-slate-50 to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 border">
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                    <Clock size={20} />
                    {Constants.adminConstants.activityTimelineLabel}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <TimelineItem
                        icon={<Calendar size={20} />}
                        label={Constants.adminConstants.createdOnLabel}
                        value={
                            returnData.createdAt
                                ? new Date(returnData.createdAt).toLocaleDateString()
                                : "N/A"
                        }
                    />

                    <TimelineItem
                        icon={<Clock size={20} />}
                        label={Constants.adminConstants.lastModifiedLabel}
                        value={
                            returnData.updatedAt
                                ? new Date(returnData.updatedAt).toLocaleDateString()
                                : "N/A"
                        }
                    />
                </div>
            </div>
        </DetailsModalLayout>
    );
}
