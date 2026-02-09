"use client";
import { Calendar, Clock, FileText, Tag, } from "lucide-react";
import { Constants } from "@/constant";
import { WebComponents } from "@/components";
import { AdminTypes } from "@/types";
const VariantDetailsModal = ({
  variant,
  onClose,
}: AdminTypes.InventoryTypes.VariantTypes.VariantDetailsModalProps) => {
  const valuesArray = variant.values.map((value) =>
    typeof value === "string"
      ? value.trim()
      : value.value?.trim() || String(value)
  );

  const statusLabel = variant.status
    ? Constants.adminConstants.activeStatus
    : Constants.adminConstants.inactiveStatus;

  return (
    <WebComponents.WebCommonComponents.CommonComponents.DetailsModalLayout
      title={Constants.adminConstants.variantStrings.variantProfileLabel}
      subtitle={
        Constants.adminConstants.variantStrings
          .completeVariantInformationAndDetailsLabel
      }
      icon={<Tag size={32} className="text-white" />}
      statusLabel={statusLabel}
      statusColor={variant.status ? "active" : "inactive"}
      onClose={onClose}
    >
      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Variant Info */}
        <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoCard
          title={Constants.adminConstants.variantStrings.variantInformationLabel}
          icon={<Tag size={18} className="text-white" />}
        >
          <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow
            label={
              Constants.adminConstants.variantStrings.variantNameLabel
            }
            icon={<Tag size={16} />}
            value={variant.variant}
          />

          <div>
            <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoLabel
              icon={<FileText size={16} />}
              label={
                Constants.adminConstants.variantStrings.valuesLabel
              }
            />
            <div className="flex flex-wrap gap-2 ml-6">
              {valuesArray.length > 0 ? (
                valuesArray.map((value, index) => (
                  <WebComponents.UiComponents.UiWebComponents.Badge
                    key={index}
                    variant="outline"
                    className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 font-medium px-2.5 py-0.5"
                  >
                    {value}
                  </WebComponents.UiComponents.UiWebComponents.Badge>
                ))
              ) : (
                <span className="text-gray-500 text-sm">
                  {Constants.adminConstants.variantStrings.noValuesLabel}
                </span>
              )}
            </div>
          </div>
        </WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoCard>

        {/* Status Info */}
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

      {/* Timeline */}
      <div className="mt-4 bg-gradient-to-r from-slate-50 to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <Clock size={20} className="text-gray-600 dark:text-gray-300" />
          {Constants.adminConstants.activityTimelineLabel}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <WebComponents.UiComponents.UiWebComponents.DetailsCommon.TimelineItem
            icon={<Calendar size={20} />}
            label={Constants.adminConstants.createdOnLabel}
            value={
              variant.createdAt
                ? new Date(variant.createdAt).toLocaleDateString()
                : "N/A"
            }
          />

          <WebComponents.UiComponents.UiWebComponents.DetailsCommon.TimelineItem
            icon={<Clock size={20} />}
            label={Constants.adminConstants.lastModifiedLabel}
            value={
              variant.updatedAt
                ? new Date(variant.updatedAt).toLocaleDateString()
                : "N/A"
            }
          />
        </div>
      </div>
    </WebComponents.WebCommonComponents.CommonComponents.DetailsModalLayout>
  );
};

export default VariantDetailsModal;
