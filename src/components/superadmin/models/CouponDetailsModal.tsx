"use client";

import { FaTag, FaFileAlt, FaCalendar } from "react-icons/fa";
import { Constants } from "@/constant";
import { SuperAdminTypes } from "@/types";
import { WebComponents } from "@/components";
import { formatFunctionsUtils } from "@/utils"; 

type Coupon = SuperAdminTypes.CouponTypes.Coupon;

interface CouponDetailsModalProps {
  readonly coupon: Coupon;
  readonly plans: Array<{ _id: string; name: string }>;
  readonly primaryCurrency:SuperAdminTypes.SettingTypes.CurrencySettingsTypes.CurrencyData
  readonly onClose: () => void;
}
export default function CouponDetailsModal({
  coupon,
  plans,
  primaryCurrency,
  onClose,
}: CouponDetailsModalProps) {
  const getPlanNames = (planIds: string[]): string => {
    if (!Array.isArray(planIds)) return '-';
    return planIds.map(planId => {
      if (typeof planId === 'string') {
        const plan = plans.find(p => p._id === planId);
        return plan ? plan.name : 'Unknown';
      } else {
        return (planId as { name: string } | undefined)?.name || 'Unknown';
      }
    }).join(', ');
  };

  const statusLabel = coupon.status
    ? Constants.superadminConstants.activestatus
    : Constants.superadminConstants.inactivestatus;

  const statusColor = coupon.status ? "active" : "inactive";

  return (
    <WebComponents.WebCommonComponents.CommonComponents.DetailsModalLayout
      title={Constants.superadminConstants.coupondetails}
      subtitle={Constants.superadminConstants.coupondetailsbio}
      icon={<FaTag size={32} className="text-white" />}
      statusLabel={statusLabel}
      statusColor={statusColor}
      onClose={onClose}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information Card */}
        <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoCard
          title={Constants.superadminConstants.basicinformation}
          icon={<FaTag size={18} className="text-white" />}
        >
          <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow
            label={Constants.superadminConstants.couponcodelabel}
            icon={<FaTag size={16} />}
            value={coupon.code || '-'}
          />

          <div>
            <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoLabel
              icon={<FaFileAlt size={16} />}
              label={Constants.superadminConstants.descriptionlabel}
            />
            <p className="text-base text-gray-700 ml-6 dark:text-gray-300">
              {coupon.description || 'No description provided'}
            </p>
          </div>

          <div>
            <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoLabel
              icon={<FaTag size={16} />}
              label={Constants.superadminConstants.typelabel}
            />
            <div className="ml-6">
              <span className="inline-block px-2.5 sm:px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-lg text-xs sm:text-sm font-medium">
                {coupon.type || '-'}
              </span>
            </div>
          </div>

          <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow
            label={Constants.superadminConstants.discountamountlabel}
            icon={<FaTag size={16} />}
            value={formatFunctionsUtils.formatDiscountAmount(coupon, primaryCurrency)}
          />
        </WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoCard>

        {/* Additional Information Card */}
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
              value={(() => {
                const dateStr = coupon.startDate || coupon.start_date;
                return dateStr ? new Date(dateStr).toLocaleDateString() : '-';
              })()}
            />
            <WebComponents.UiComponents.UiWebComponents.DetailsCommon.TimelineItem
              icon={<FaCalendar size={20} />}
              label={Constants.superadminConstants.enddatelabel}
              value={(() => {
                const dateStr = coupon.endDate || coupon.end_date;
                return dateStr ? new Date(dateStr).toLocaleDateString() : '-';
              })()}
            />
            <div>
              <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoLabel
                icon={<FaTag size={16} />}
                label={Constants.superadminConstants.limitlabel}
              />
              <p className="text-base font-semibold text-gray-900 dark:text-white ml-6">
                {coupon.limit || 'Unlimited'}
              </p>
            </div>
            <div>
              <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoLabel
                icon={<FaTag size={16} />}
                label={Constants.superadminConstants.selectplanslabel}
              />
              <p className="text-base text-gray-700 ml-6 dark:text-gray-300">
                {getPlanNames(coupon.plans ?? [])}
              </p>
            </div>
          </div>
        </div>
      </div>
    </WebComponents.WebCommonComponents.CommonComponents.DetailsModalLayout>
  );
}

