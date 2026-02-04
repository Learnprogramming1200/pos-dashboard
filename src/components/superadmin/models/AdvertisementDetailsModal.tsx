"use client";

import { FaTag, FaFileAlt, FaCalendar } from "react-icons/fa";
import { Constants } from "@/constant";
import { WebComponents } from "@/components";
import { SuperAdminTypes } from "@/types";

type Advertisement = SuperAdminTypes.AdvertisementTypes.Advertisement;

interface AdvertisementDetailsModalProps {
  readonly advertisement: Advertisement;
  readonly onClose: () => void;
}

export default function AdvertisementDetailsModal({
  advertisement,
  onClose,
}: AdvertisementDetailsModalProps) {
  const statusLabel = advertisement.status
    ? Constants.superadminConstants.activestatus
    : Constants.superadminConstants.inactivestatus;

  const statusColor = advertisement.status ? "active" : "inactive";

  return (
    <WebComponents.WebCommonComponents.CommonComponents.DetailsModalLayout
      title={Constants.superadminConstants.advertisementdetails}
      subtitle={Constants.superadminConstants.advertisementdetailsbio}
      icon={<FaTag size={32} className="text-white" />}
      statusLabel={statusLabel}
      statusColor={statusColor}
      onClose={onClose}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoCard
          title={Constants.superadminConstants.basicinformation}
          icon={<FaTag size={18} className="text-white" />}
        >
          <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow
            label={Constants.superadminConstants.adnamelabel}
            icon={<FaTag size={16} />}
            value={advertisement.adName || "-"}
          />

          <div>
            <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoLabel
              icon={<FaTag size={16} />}
              label={Constants.superadminConstants.typelabel}
            />
            <div className="ml-6">
              <span className="inline-block px-2.5 sm:px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-lg text-xs sm:text-sm font-medium">
                {advertisement.selectType || "-"}
              </span>
            </div>
          </div>

          <div>
            <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoLabel
              icon={<FaTag size={16} />}
              label={Constants.superadminConstants.urltypelabel}
            />
            <div className="ml-6">
              <span className="inline-block px-2.5 sm:px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-lg text-xs sm:text-sm font-medium">
                {advertisement.urlType || "-"}
              </span>
            </div>
          </div>

          <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow
            label={Constants.superadminConstants.placementlabel}
            icon={<FaTag size={16} />}
            value={advertisement.placement || "-"}
          />

          <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow
            label={Constants.superadminConstants.positionlabel}
            icon={<FaTag size={16} />}
            value={advertisement.position || "-"}
          />
        </WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoCard>

        {/* Additional Information */}
        <div className="bg-gradient-to-br from-slate-50 to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <FaCalendar size={18} className="text-white" />
            </div>
            {Constants.superadminConstants.additionalinformation}
          </h3>
          <div className="grid grid-cols-1 gap-6">
            <WebComponents.UiComponents.UiWebComponents.DetailsCommon.TimelineItem
              icon={<FaCalendar size={20} />}
              label={Constants.superadminConstants.startdatelabel}
              value={advertisement.startDate ? new Date(advertisement.startDate).toLocaleDateString() : "-"}
            />
            <WebComponents.UiComponents.UiWebComponents.DetailsCommon.TimelineItem
              icon={<FaCalendar size={20} />}
              label={Constants.superadminConstants.enddatelabel}
              value={advertisement.endDate ? new Date(advertisement.endDate).toLocaleDateString() : "-"}
            />

            <div>
              <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoLabel
                icon={<FaTag size={16} />}
                label={Constants.superadminConstants.redirecturllabel}
              />
              <p className="text-base text-gray-700 ml-6 dark:text-gray-300 break-all">
                {advertisement.redirectUrl || "-"}
              </p>
            </div>

            <div>
              <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoLabel
                icon={<FaTag size={16} />}
                label={Constants.superadminConstants.advertisementidlabel}
              />
              <p className="text-sm text-gray-700 dark:text-gray-300 ml-6 font-mono break-words">
                {advertisement._id || "-"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Media Content */}
      <div className="mt-6">
        <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoCard
          title={Constants.superadminConstants.mediacontentlabel}
          icon={<FaFileAlt size={18} className="text-white" />}
        >
          {advertisement.urlType === "Url" ? (
            <div>
              <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoLabel
                icon={<FaTag size={16} />}
                label={Constants.superadminConstants.mediacontentlabel}
              />
              <p className="text-base text-gray-700 ml-6 dark:text-gray-300 break-all">
                {advertisement.mediaContent?.url || "-"}
              </p>
            </div>
          ) : (
            <div>
              <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoLabel
                icon={<FaTag size={16} />}
                label={Constants.superadminConstants.localmedialabel}
              />
              <p className="text-base text-gray-700 ml-6 dark:text-gray-300">
                {Constants.superadminConstants.fileuploadedlocallylabel}
              </p>
            </div>
          )}
        </WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoCard>
      </div>
    </WebComponents.WebCommonComponents.CommonComponents.DetailsModalLayout>
  );
}

