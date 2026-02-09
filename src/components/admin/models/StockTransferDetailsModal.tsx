"use client";
import { ArrowRightLeft, Package, Store, AlertCircle, Calendar, Clock } from "lucide-react";
import { WebComponents } from "@/components";
import { AdminTypes } from "@/types";

interface StockTransferDetailsModalProps {
  transfer: AdminTypes.StockTypes.Entities.StockTransfer;
  onClose: () => void;
}

export default function StockTransferDetailsModal({
  transfer,
  onClose
}: StockTransferDetailsModalProps) {
  // Prepare data for the UI structure
  const transferData = {
    fromStore: transfer.fromStoreId?.name,
    toStore: transfer.toStoreId?.name,
    product: transfer.productId?.productName,
    sku: transfer.SKU || 'N/A',
    quantity: transfer.quantity,
    reason: transfer.reason || 'N/A',
    status: transfer.status,
    createdDate: transfer.createdAt ? new Date(transfer.createdAt).toLocaleDateString() : 'N/A',
    lastUpdated: transfer.updatedAt ? new Date(transfer.updatedAt).toLocaleDateString() : 'N/A',
    cancelReason: transfer.notes || ''
  };

  const statusColorMap: Record<string, "active" | "inactive"> = {
    pending: "inactive",
    approved: "active",
    completed: "active",
    cancelled: "inactive"
  };

  return (
    <WebComponents.WebCommonComponents.CommonComponents.DetailsModalLayout
      title="Transfer Profile"
      subtitle="Complete transfer information and details"
      icon={<ArrowRightLeft size={32} className="text-white" />}
      statusLabel={transferData.status}
      statusColor={statusColorMap[transferData.status.toLowerCase()] || "inactive"}
      onClose={onClose}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transfer Information Card */}
        <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoCard
          title="Transfer Information"
          icon={<Package size={18} className="text-white" />}
        >
          <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow
            label="From Store"
            icon={<Store size={16} />}
            value={transferData.fromStore}
          />

          <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow
            label="To Store"
            icon={<Store size={16} />}
            value={transferData.toStore}
          />

          <div>
            <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoLabel
              icon={<Package size={16} />}
              label="Product"
            />
            <p className="text-lg font-semibold text-gray-900 dark:text-white ml-6">
              {transferData.product}
            </p>
            {transferData.sku !== 'N/A' && (
              <p className="text-sm text-gray-600 dark:text-gray-400 ml-6 mt-1">SKU: {transferData.sku}</p>
            )}
          </div>

          <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow
            label="Quantity"
            icon={<Package size={16} />}
            value={String(transferData.quantity)}
          />

          <div>
            <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoLabel
              icon={<AlertCircle size={16} />}
              label="Reason"
            />
            <p className="text-base text-gray-700 dark:text-gray-300 ml-6">
              {transferData.reason}
            </p>
          </div>
        </WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoCard>

        {/* Status Information Card */}
        <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoCard
          title="Status Information"
          icon={<AlertCircle size={18} className="text-white" />}
        >
          <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow
            label="Current Status"
            icon={<AlertCircle size={16} />}
            value={transferData.status}
          />
          {transferData.status === "cancelled" && (
            <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow
              label="Cancel Reason"
              icon={<AlertCircle size={16} />}
              value={transferData.cancelReason}
            />
          )}
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
            value={transferData.createdDate}
          />
          <WebComponents.UiComponents.UiWebComponents.DetailsCommon.TimelineItem
            icon={<Clock size={20} />}
            label="Last Modified"
            value={transferData.lastUpdated}
          />
        </div>
      </div>
    </WebComponents.WebCommonComponents.CommonComponents.DetailsModalLayout>
  );
}


