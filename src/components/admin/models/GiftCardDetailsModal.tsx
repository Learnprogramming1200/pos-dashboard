"use client";

import React from "react";
import {Calendar,Clock,FileText,Gift,Hash,Tag,User,} from "lucide-react";
import { Constants } from "@/constant";
import { WebComponents } from "@/components";
import { AdminTypes } from "@/types";

const GiftCardDetailsModal = ({
  giftCard,
  onClose,
}: AdminTypes.giftCardTypes.GiftCardDetailsModalProps) => {
  // Extract customer names from the card object (from API response)
  const customerNames = React.useMemo(() => {
    if (giftCard.customerScope === "All") {
      return [];
    }

    // The data might be in assignedCustomers or assignedCustomerIds (as objects)
    const rawCustomers =
      giftCard.assignedCustomers ||
      (Array.isArray(giftCard.assignedCustomerIds) &&
        typeof giftCard.assignedCustomerIds[0] === "object"
        ? giftCard.assignedCustomerIds
        : []);

    if (!rawCustomers || rawCustomers.length === 0) {
      return [];
    }

    // Transform from API response to Customer format
    return (rawCustomers as any[])
      .map((customer: any) => {
        const name =
          customer.customerName ||
          customer.name ||
          customer.fullName ||
          customer.user?.name ||
          "";
        if (!name) return null;
        return {
          id: customer._id || customer.id || Math.random().toString(),
          name: name,
          email: customer.email || customer.user?.email || "",
        };
      })
      .filter((c): c is AdminTypes.giftCardTypes.GiftCardCustomer => c !== null);
  }, [
    giftCard.assignedCustomers,
    giftCard.assignedCustomerIds,
    giftCard.customerScope,
  ]);

  const statusLabel =
    giftCard.status === "Active"
      ? Constants.adminConstants.activeStatus
      : Constants.adminConstants.inactiveStatus;

  return (
    <WebComponents.WebCommonComponents.CommonComponents.DetailsModalLayout
      title="Gift Card Configuration Details"
      subtitle="Complete configuration information"
      icon={<Gift size={32} className="text-white" />}
      statusLabel={statusLabel}
      statusColor={giftCard.status === "Active" ? "active" : "inactive"}
      onClose={onClose}
    >
      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gift Card Information */}
        <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoCard
          title="Gift Card Information"
          icon={<Gift size={18} className="text-white" />}
        >
          <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow
            label={Constants.adminConstants.giftCardNameLabel}
            icon={<Gift size={16} />}
            value={giftCard.name}
          />

          <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow
            label={Constants.adminConstants.giftCardNumberLabel}
            icon={<Hash size={16} />}
            value={giftCard.number}
          />

          <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow
            label={Constants.adminConstants.giftCardValueLabel}
            icon={<Tag size={16} />}
            value={giftCard.value.toFixed(2)}
          />

          {giftCard.thresholdAmount && (
            <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow
              label={Constants.adminConstants.thresholdAmountLabel}
              icon={<Tag size={16} />}
              value={giftCard.thresholdAmount.toFixed(2)}
            />
          )}

          <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow
            label={Constants.adminConstants.validityLabel}
            icon={<Calendar size={16} />}
            value={new Date(giftCard.validity).toLocaleDateString()}
          />
        </WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoCard>

        {/* Customer Information */}
        <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoCard
          title="Customer Information"
          icon={<User size={18} className="text-white" />}
        >
          <div>
            <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoLabel
              icon={<User size={16} />}
              label={Constants.adminConstants.customersLabel}
            />
            <div className="ml-6">
              {giftCard.customerScope === "All" ? (
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-widetext-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-widetext-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-widetext-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">
                  All Customers
                </p>
              ) : (
                <div>
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-widetext-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-widetext-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-widetext-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">
                    {giftCard.assignedCustomerIds?.length || 0} Selected
                  </p>
                  {customerNames.length > 0 && (
                    <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
                      {customerNames.map(
                        (customer: AdminTypes.giftCardTypes.GiftCardCustomer) => (
                          <div
                            key={customer.id}
                            className="text-sm text-gray-700 bg-gray-50 rounded px-2 py-1"
                          >
                            <span className="font-medium">{customer.name}</span>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoCard>
      </div>

      {/* Terms and Conditions */}
      {giftCard.terms && (
        <div className="mt-6 bg-gradient-to-r from-slate-50 to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <FileText size={20} className="text-gray-600 dark:text-gray-300" />
            {Constants.adminConstants.termsAndConditionsLabel}
          </h3>
          <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: giftCard.terms }}
          />
        </div>
      )}

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
              giftCard.createdAt
                ? new Date(giftCard.createdAt).toLocaleDateString()
                : "N/A"
            }
          />

          <WebComponents.UiComponents.UiWebComponents.DetailsCommon.TimelineItem
            icon={<Clock size={20} />}
            label={Constants.adminConstants.lastModifiedLabel}
            value={
              giftCard.updatedAt
                ? new Date(giftCard.updatedAt).toLocaleDateString()
                : "N/A"
            }
          />
        </div>
      </div>
    </WebComponents.WebCommonComponents.CommonComponents.DetailsModalLayout>
  );
};

export default GiftCardDetailsModal;

