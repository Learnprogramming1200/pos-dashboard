"use client";

import { Calendar, Clock, FileText, Tag, Percent, Hash, } from "lucide-react";
import { Constants } from "@/constant";
import { WebComponents } from "@/components";
import { AdminTypes } from "@/types";
const CouponDetailsModal = ({
  coupon,
  onClose,
}: {
  coupon: AdminTypes.adminCouponTypes.AdminCoupon;
  onClose: () => void;
}) => {
  const statusLabel = coupon.status
    ? Constants.adminConstants.activeStatus
    : Constants.adminConstants.inactiveStatus;

  const discountDisplay = coupon.type === "Percentage"
    ? `${coupon.discount_amount}%`
    : `₹${coupon.discount_amount}`;

  return (
    <WebComponents.WebCommonComponents.CommonComponents.DetailsModalLayout
      title={Constants.adminConstants.couponDetails}
      subtitle={Constants.adminConstants.completeCouponInformation}
      icon={<Tag size={32} className="text-white" />}
      statusLabel={statusLabel}
      statusColor={coupon.status ? "active" : "inactive"}
      onClose={onClose}
    >
      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Coupon Info */}
        <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoCard
          title={Constants.adminConstants.basicInformationLabel}
          icon={<Tag size={18} className="text-white" />}
        >
          <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow
            label={Constants.adminConstants.couponCodeLabel}
            icon={<Tag size={16} />}
            value={coupon.code}
          />

          <div>
            <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoLabel
              icon={<FileText size={16} />}
              label={Constants.adminConstants.descriptionLabel}
            />
            <p className="text-sm text-gray-700 dark:text-gray-300 ml-6 mt-1">
              {coupon.description?.replace(/<[^>]*>/g, '') || Constants.adminConstants.variantStrings.noValuesLabel}
            </p>
          </div>

          <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow
            label={Constants.adminConstants.typeLabel}
            icon={<Tag size={16} />}
            value={coupon.type}
          />

          <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow
            label={Constants.adminConstants.discountAmountLabel}
            icon={coupon.type === "Percentage" ? <Percent size={16} /> : <Hash size={16} />}
            value={discountDisplay}
          />
        </WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoCard>

        {/* Additional Info */}
        <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoCard
          title={Constants.adminConstants.additionalInformationLabel}
          icon={<Calendar size={18} className="text-white" />}
        >
          <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow
            label={Constants.adminConstants.startDateLabel}
            icon={<Calendar size={16} />}
            value={
              coupon.start_date
                ? new Date(coupon.start_date).toLocaleDateString()
                : "N/A"
            }
          />

          <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow
            label={Constants.adminConstants.endDateLabel}
            icon={<Calendar size={16} />}
            value={
              coupon.end_date
                ? new Date(coupon.end_date).toLocaleDateString()
                : "N/A"
            }
          />

          <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow
            label={Constants.adminConstants.limitLabel}
            icon={<Tag size={16} />}
            value={coupon.limit ? String(coupon.limit) : "Unlimited"}
          />

          <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow
            label={Constants.adminConstants.usedCountLabel}
            icon={<Tag size={16} />}
            value={`${coupon.usageCount || 0} / ${coupon.limit || "Unlimited"}`}
          />

          <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow
            label="Max Usage per User"
            icon={<Tag size={16} />}
            value={coupon.maxUsagePerUser ? String(coupon.maxUsagePerUser) : "1"}
          />
        </WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoCard>
      </div>

      {/* Status Info */}
      <div className="mt-4">
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
              coupon.createdAt
                ? new Date(coupon.createdAt).toLocaleDateString()
                : "N/A"
            }
          />

          <WebComponents.UiComponents.UiWebComponents.DetailsCommon.TimelineItem
            icon={<Clock size={20} />}
            label={Constants.adminConstants.lastModifiedLabel}
            value={
              coupon.updatedAt
                ? new Date(coupon.updatedAt).toLocaleDateString()
                : "N/A"
            }
          />
        </div>
      </div>
    </WebComponents.WebCommonComponents.CommonComponents.DetailsModalLayout>
  );
};

export default CouponDetailsModal;

