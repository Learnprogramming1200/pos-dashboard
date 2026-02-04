"use client";

import { Calendar, Clock, Tag, FileText, Coins } from "lucide-react";
import { Constants } from "@/constant";
import { WebComponents } from "@/components";
import { AdminTypes } from "@/types";
const RedeemDetailsModal = ({
  redeem,
  onClose,
}: {
  redeem: AdminTypes.loyaltyTypes.RedeemPointServerResponse;
  onClose: () => void;
}) => {
  const isActive = typeof redeem.status === 'boolean' ? redeem.status : redeem.status === "Active";
  const statusLabel = isActive
    ? Constants.adminConstants.activeStatus
    : Constants.adminConstants.inactiveStatus;

  return (
    <WebComponents.WebCommonComponents.CommonComponents.DetailsModalLayout
      title="Redeem Points Configuration Details"
      subtitle="Complete configuration information"
      icon={<Tag size={32} className="text-white" />}
      statusLabel={statusLabel}
      statusColor={isActive ? "active" : "inactive"}
      onClose={onClose}
    >
      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration Information Card */}
        <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoCard
          title="Configuration Information"
          icon={<Tag size={18} className="text-white" />}
        >
          <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow
            label="Rule Name"
            icon={<FileText size={16} />}
            value={redeem.ruleName || "-"}
          />

          <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow
            label="Point From"
            icon={<Tag size={16} />}
            value={redeem.pointFrom?.toString() || "-"}
          />

          <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow
            label="Point To"
            icon={<Tag size={16} />}
            value={redeem.pointTo?.toString() || "-"}
          />

          <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow
            label="Amount"
            icon={<Coins size={16} />}
            value={redeem.amount?.toString() || "-"}
          />
        </WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoCard>

        {/* Timeline Section */}
        {(redeem.createdAt || redeem.updatedAt) && (
          <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoCard
            title="Activity Timeline"
            icon={<Clock size={18} className="text-white" />}
          >
            {redeem.createdAt && (
              <WebComponents.UiComponents.UiWebComponents.DetailsCommon.TimelineItem
                icon={<Calendar size={20} />}
                label="Created On"
                value={
                  redeem.createdAt
                    ? new Date(redeem.createdAt).toLocaleDateString()
                    : "N/A"
                }
              />
            )}
            {redeem.updatedAt && (
              <WebComponents.UiComponents.UiWebComponents.DetailsCommon.TimelineItem
                icon={<Clock size={20} />}
                label="Last Modified"
                value={
                  redeem.updatedAt
                    ? new Date(redeem.updatedAt).toLocaleDateString()
                    : "N/A"
                }
              />
            )}
          </WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoCard>
        )}
      </div>
    </WebComponents.WebCommonComponents.CommonComponents.DetailsModalLayout>
  );
};

export default RedeemDetailsModal;

