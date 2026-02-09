"use client";

import { Calendar,Clock,Tag,FileText,} from "lucide-react";
import { Constants } from "@/constant";
import { WebComponents } from "@/components";
import { AdminTypes } from "@/types";
interface UnitDetailsModalProps {
  unit: AdminTypes.InventoryTypes.UnitTypes.UnitType;
  onClose: () => void;
}

const UnitDetailsModal = ({
  unit,
  onClose,
}: UnitDetailsModalProps) => {
  const statusLabel = unit.status
    ? Constants.adminConstants.activestatus
    : Constants.adminConstants.inactivestatus;

  return (
    <WebComponents.WebCommonComponents.CommonComponents.DetailsModalLayout
      title={Constants.adminConstants.unitStrings.unitProfileLabel}
      subtitle={Constants.adminConstants.unitStrings.completeUnitInformationAndDetailsLabel}
      icon={<Tag size={32} className="text-white" />}
      statusLabel={statusLabel}
      statusColor={unit.status ? "active" : "inactive"}
      onClose={onClose}
    >
      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Unit Information Card */}
        <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoCard
          title={Constants.adminConstants.unitStrings.unitInformationLabel}
          icon={<Tag size={18} className="text-white" />}
        >
          <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow
            label={Constants.adminConstants.unitStrings.unitNameLabel}
            icon={<Tag size={16} />}
            value={unit.unit}
          />

          <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow
            label={Constants.adminConstants.unitStrings.shortNameLabel}
            icon={<FileText size={16} />}
            value={unit.shortName}
          />
        </WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoCard>

        {/* Status Information Card */}
        <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoCard
          title={Constants.adminConstants.statusInformationLabel}
          icon={<Tag size={18} className="text-white" />}
        >
          <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow
            label={Constants.adminConstants.currentStatusLabel}
            icon={<Tag size={16} />}
            value={statusLabel}
          />
        </WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoCard>
      </div>

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
              unit.createdAt
                ? new Date(unit.createdAt).toLocaleDateString()
                : "N/A"
            }
          />
          <WebComponents.UiComponents.UiWebComponents.DetailsCommon.TimelineItem
            icon={<Clock size={20} />}
            label={Constants.adminConstants.lastModifiedLabel}
            value={
              unit.updatedAt
                ? new Date(unit.updatedAt).toLocaleDateString()
                : "N/A"
            }
          />
        </div>
      </div>
    </WebComponents.WebCommonComponents.CommonComponents.DetailsModalLayout>
  );
};

export default UnitDetailsModal;

