"use client";

import React from "react";
import { Calendar, Clock, User, Mail, Phone, Building2, Tag } from "lucide-react";
import { Constants } from "@/constant";
import { WebComponents } from "@/components";
import { AdminTypes } from "@/types";
const CustomerDetailsModal = ({
  customer,
  onClose,
}: AdminTypes.customerTypes.CustomerDetailsModalProps) => {
  // Prepare customer data
  const customerName = React.useMemo(() => {
    return (customer as Record<string, string | undefined>).customerName ||
      customer.fullName ||
      `${(customer as Record<string, string | undefined>).firstName || ''} ${(customer as Record<string, string | undefined>).lastName || ''}`.trim() ||
      'N/A';
  }, [customer]);



  const address = React.useMemo(() => {
    const addr = customer.address;
    if (typeof addr === 'string') {
      return addr;
    }
    if (typeof addr === 'object' && addr !== null && !Array.isArray(addr)) {
      return addr.street || 'N/A';
    }
    return (customer as Record<string, string | undefined>).fullAddress || 'N/A';
  }, [customer]);

  const city = React.useMemo(() => {
    const addr = customer.address;
    if (typeof addr === 'object' && addr !== null && !Array.isArray(addr)) {
      return addr.city || (customer as Record<string, string | undefined>).city || 'N/A';
    }
    return (customer as Record<string, string | undefined>).city || 'N/A';
  }, [customer]);

  const state = React.useMemo(() => {
    const addr = customer.address;
    if (typeof addr === 'object' && addr !== null && !Array.isArray(addr)) {
      return addr.state || (customer as Record<string, string | undefined>).state || 'N/A';
    }
    return (customer as Record<string, string | undefined>).state || 'N/A';
  }, [customer]);

  const country = React.useMemo(() => {
    const addr = customer.address;
    if (typeof addr === 'object' && addr !== null && !Array.isArray(addr)) {
      return addr.country || (customer as Record<string, string | undefined>).country || 'N/A';
    }
    return (customer as Record<string, string | undefined>).country || 'N/A';
  }, [customer]);

  const pincode = React.useMemo(() => {
    const addr = customer.address;
    if (typeof addr === 'object' && addr !== null && !Array.isArray(addr)) {
      return addr.pincode || (customer as Record<string, string | undefined>).pincode || 'N/A';
    }
    return (customer as Record<string, string | undefined>).pincode || 'N/A';
  }, [customer]);

  const statusLabel = (customer as Record<string, boolean | undefined>).isActive
    ? Constants.adminConstants.activeStatus
    : Constants.adminConstants.inactiveStatus;

  return (
    <WebComponents.WebCommonComponents.CommonComponents.DetailsModalLayout
      title={Constants.adminConstants.customerProfileLabel}
      subtitle={Constants.adminConstants.completeCustomerInformationAndDetailsLabel}
      icon={<User size={32} className="text-white" />}
      statusLabel={statusLabel}
      statusColor={(customer as Record<string, boolean | undefined>).isActive ? "active" : "inactive"}
      onClose={onClose}
    >
      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Information */}
        <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoCard
          title={Constants.adminConstants.customerInformationLabel}
          icon={<User size={18} className="text-white" />}
        >
          <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow
            label={Constants.adminConstants.CustomerNameLabel}
            icon={<User size={16} />}
            value={customerName}
          />



          <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow
            label={Constants.adminConstants.emailAddressLabel}
            icon={<Mail size={16} />}
            value={customer.email || 'N/A'}
          />

          <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow
            label={Constants.adminConstants.contactNumberLabel}
            icon={<Phone size={16} />}
            value={customer.phone || 'N/A'}
          />

          <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow
            label={Constants.adminConstants.genderLabel}
            icon={<User size={16} />}
            value={customer.gender || 'N/A'}
          />
        </WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoCard>

        {/* Address Information */}
        <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoCard
          title={Constants.adminConstants.roleAndAddressInformationLabel}
          icon={<Building2 size={18} className="text-white" />}
        >
          <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow
            label={`${Constants.adminConstants.typeLabel} (${Constants.adminConstants.roleLabel})`}
            icon={<Tag size={16} />}
            value={customer.type || 'N/A'}
          />

          <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow
            label={Constants.adminConstants.addressLabel}
            icon={<Building2 size={16} />}
            value={address}
          />

          <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow
            label={Constants.adminConstants.cityLabel}
            icon={<Building2 size={16} />}
            value={city}
          />

          <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow
            label={Constants.adminConstants.stateLabel}
            icon={<Building2 size={16} />}
            value={state}
          />

          <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow
            label={Constants.adminConstants.countryLabel}
            icon={<Building2 size={16} />}
            value={country}
          />

          <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow
            label={Constants.adminConstants.pincodeLabel}
            icon={<Building2 size={16} />}
            value={pincode}
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
              customer.createdAt
                ? new Date(customer.createdAt).toLocaleDateString()
                : "N/A"
            }
          />

          <WebComponents.UiComponents.UiWebComponents.DetailsCommon.TimelineItem
            icon={<Clock size={20} />}
            label={Constants.adminConstants.lastModifiedLabel}
            value={
              customer.updatedAt
                ? new Date(customer.updatedAt).toLocaleDateString()
                : "N/A"
            }
          />
        </div>
      </div>
    </WebComponents.WebCommonComponents.CommonComponents.DetailsModalLayout>
  );
};

export default CustomerDetailsModal;

