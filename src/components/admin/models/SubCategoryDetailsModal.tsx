"use client";

import { Calendar, Clock, Tag, FileText, Image as ImageIcon, } from "lucide-react";
import Image from "next/image";
import { Constants } from "@/constant";
import { WebComponents } from "@/components";
import { AdminTypes } from "@/types";
interface SubCategoryDetailsModalProps {
  subcategory: AdminTypes.InventoryTypes.productSubCategoryTypes.SubCategoryType;
  onClose: () => void;
}

const SubCategoryDetailsModal = ({
  subcategory,
  onClose,
}: SubCategoryDetailsModalProps) => {
  const statusLabel = subcategory.status
    ? Constants.adminConstants.activestatus
    : Constants.adminConstants.inactivestatus;

  return (
    <WebComponents.WebCommonComponents.CommonComponents.DetailsModalLayout
      title={Constants.adminConstants.subcategoryStrings.subCategoryProfileLabel}
      subtitle={Constants.adminConstants.subcategoryStrings.completeSubCategoryInformationAndDetailsLabel}
      icon={<Tag size={32} className="text-white" />}
      statusLabel={statusLabel}
      statusColor={subcategory.status ? "active" : "inactive"}
      onClose={onClose}
    >
      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sub Category Information Card */}
        <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoCard
          title={Constants.adminConstants.categoryInformationLabel}
          icon={<Tag size={18} className="text-white" />}
        >
          {/* Image */}
          {subcategory.subCategoryImage && (
            <div>
              <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoLabel
                icon={<ImageIcon size={16} />}
                label={Constants.adminConstants.subcategoryStrings.imageLabel}
              />
              <div className="w-32 h-32 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 ml-6 mt-2">
                <Image
                  src={subcategory.subCategoryImage}
                  alt={subcategory.subcategory}
                  width={128}
                  height={128}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = Constants.assetsIcon.assets.noDataFound.src;
                  }}
                />
              </div>
            </div>
          )}

          <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow
            label={Constants.adminConstants.subcategoryStrings.subCategoryNameLabel}
            icon={<Tag size={16} />}
            value={subcategory.subcategory}
          />

          <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow
            label={Constants.adminConstants.subcategoryStrings.categoryLabel}
            icon={<Tag size={16} />}
            value={subcategory.category.categoryName}
          />

          <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow
            label={Constants.adminConstants.subcategoryStrings.subCategoryCodeLabel}
            icon={<Tag size={16} />}
            value={subcategory.categorycode}
          />

          <div>
            <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoLabel
              icon={<FileText size={16} />}
              label={Constants.adminConstants.subcategoryStrings.descriptionLabel}
            />
            <p className="text-base text-gray-700 ml-6 dark:text-gray-300">
              {subcategory.description || 'No description provided'}
            </p>
          </div>
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
              subcategory.createdAt
                ? new Date(subcategory.createdAt).toLocaleDateString()
                : "N/A"
            }
          />
          <WebComponents.UiComponents.UiWebComponents.DetailsCommon.TimelineItem
            icon={<Clock size={20} />}
            label={Constants.adminConstants.lastModifiedLabel}
            value={
              subcategory.updatedAt
                ? new Date(subcategory.updatedAt).toLocaleDateString()
                : "N/A"
            }
          />
        </div>
      </div>
    </WebComponents.WebCommonComponents.CommonComponents.DetailsModalLayout>
  );
};

export default SubCategoryDetailsModal;

