"use client";

import { FaFileInvoiceDollar, FaTag, FaClock, FaCalendar } from "react-icons/fa";
import { Constants } from "@/constant";
import { WebComponents } from "@/components";
import { SuperAdminTypes } from "@/types";

type Tax = SuperAdminTypes.TaxTypes.Tax;

interface TaxDetailsModalProps {
  readonly tax: Tax;
  readonly primaryCurrency?: {
    symbol?: string;
    position?: string;
  };
  readonly onClose: () => void;
}

export default function TaxDetailsModal({
  tax,
  primaryCurrency,
  onClose,
}: TaxDetailsModalProps) {
  const isActive =
    typeof tax.status === "boolean"
      ? Boolean(tax.status)
      : tax.status === "Active";

  const getType = (t: Tax) => t.type || (t as any).valueType || "Fixed";

  const formatValue = () => {
    const type = getType(tax);
    if (type === "Percentage") {
      return `${tax.value}%`;
    }
    const symbol = primaryCurrency?.symbol || "";
    const position = primaryCurrency?.position || "Left";
    if (position === "Right") {
      return `${tax.value}${symbol}`;
    }
    return `${symbol}${tax.value}`;
  };

  const statusLabel = isActive
    ? Constants.superadminConstants.activestatus
    : Constants.superadminConstants.inactivestatus;

  const statusColor = isActive ? "active" : "inactive";

  return (
    <WebComponents.WebCommonComponents.CommonComponents.DetailsModalLayout
      title={Constants.superadminConstants.taxdetails}
      subtitle={Constants.superadminConstants.taxdetailsbio}
      icon={<FaFileInvoiceDollar size={32} className="text-white" />}
      statusLabel={statusLabel}
      statusColor={statusColor}
      onClose={onClose}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tax Information */}
        <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoCard
          title={Constants.superadminConstants.taxinformation}
          icon={<FaFileInvoiceDollar size={18} className="text-white" />}
        >
          <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow
            label={Constants.superadminConstants.taxname}
            icon={<FaTag size={16} />}
            value={tax.name}
          />

          <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow
            label={Constants.superadminConstants.taxtypelabel}
            icon={<FaTag size={16} />}
            value={getType(tax)}
          />

          <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow
            label={Constants.superadminConstants.taxvaluelabel}
            icon={<FaTag size={16} />}
            value={formatValue()}
          />
        </WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoCard>

        {/* Timeline */}
        <div className="bg-gradient-to-br from-slate-50 to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <FaClock size={18} className="text-white" />
            </div>
            {Constants.superadminConstants.activitytimeline}
          </h3>
          <div className="grid grid-cols-1 gap-6">
            <WebComponents.UiComponents.UiWebComponents.DetailsCommon.TimelineItem
              icon={<FaCalendar size={20} />}
              label={Constants.superadminConstants.createdonlabel}
              value={tax.createdAt ? new Date(tax.createdAt).toLocaleDateString() : "-"}
            />
            <WebComponents.UiComponents.UiWebComponents.DetailsCommon.TimelineItem
              icon={<FaClock size={20} />}
              label={Constants.superadminConstants.lastmodifiedlabel}
              value={tax.updatedAt ? new Date(tax.updatedAt).toLocaleDateString() : "-"}
            />
          </div>
        </div>
      </div>
    </WebComponents.WebCommonComponents.CommonComponents.DetailsModalLayout>
  );
}


