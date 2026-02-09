"use client";

import { Calendar, Clock, Tag } from "lucide-react";
import { Constants } from "@/constant";
import { WebComponents } from "@/components";
import { AdminTypes } from "@/types";
const LoyaltyDetailsModal = ({
  loyalty,
  onClose,
}: {
  loyalty: AdminTypes.loyaltyTypes.LoyaltyPointServerResponse;
  onClose: () => void;
}) => {
  const isActive = typeof loyalty.status === 'boolean' ? loyalty.status : loyalty.status === "Active";
  const statusLabel = isActive
    ? Constants.adminConstants.activeStatus
    : Constants.adminConstants.inactiveStatus;

  return (
    <WebComponents.WebCommonComponents.CommonComponents.DetailsModalLayout
      title="Loyalty Points Configuration Details"
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
            label="Minimum Amount"
            icon={<Tag size={16} />}
            value={loyalty.minimumAmount?.toString() || "-"}
          />

          {loyalty.maximumAmount && (
            <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow
              label="Maximum Amount"
              icon={<Tag size={16} />}
              value={loyalty.maximumAmount.toString()}
            />
          )}

          <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow
            label="Loyalty Points"
            icon={<Tag size={16} />}
            value={loyalty.loyaltyPoints?.toString() || "-"}
          />

          {loyalty.expiryDuration && (
            <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow
              label="Expiry Duration (Days)"
              icon={<Calendar size={16} />}
              value={loyalty.expiryDuration.toString()}
            />
          )}
        </WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoCard>

        {/* Timeline Section */}
        {(loyalty.createdAt || loyalty.updatedAt) && (
          <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoCard
            title="Activity Timeline"
            icon={<Clock size={18} className="text-white" />}
          >
            {loyalty.createdAt && (
              <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow
                icon={<Calendar size={20} />}
                label="Created On"
                value={
                  loyalty.createdAt
                    ? new Date(loyalty.createdAt).toLocaleDateString()
                    : "N/A"
                }
              />
            )}
            {loyalty.updatedAt && (
              <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow
                icon={<Clock size={20} />}
                label="Last Modified"
                value={
                  loyalty.updatedAt
                    ? new Date(loyalty.updatedAt).toLocaleDateString()
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

export default LoyaltyDetailsModal;

