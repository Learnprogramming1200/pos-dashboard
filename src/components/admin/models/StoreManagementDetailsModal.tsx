"use client";

import { Calendar, Clock, Building2, MapPin, Mail, Phone, Globe, } from "lucide-react";
import { Constants } from "@/constant";
import { WebComponents } from "@/components";
import { AdminTypes } from "@/types";
const StoreManagementDetailsModal = ({
  store,
  onClose,
}: AdminTypes.storeTypes.StoreDetailsModalProps) => {
  const storeData = {
    name: store.name,
    description: store.description || 'N/A',
    email: store.email,
    contactNumber: store.contactNumber,
    address: store.location?.address || 'N/A',
    city: store.location?.city || 'N/A',
    state: store.location?.state || 'N/A',
    country: store.location?.country || 'N/A',
    postalCode: store.location?.postalCode || 'N/A',
    latitude: store.geoLocation?.coordinates?.[1]?.toString() || 'N/A',
    longitude: store.geoLocation?.coordinates?.[0]?.toString() || 'N/A',
    status: typeof store.status === "boolean" ? (store.status ? "Active" : "Inactive") : store.status,
    createdDate: store.createdAt ? new Date(store.createdAt).toLocaleDateString() : 'N/A',
    lastUpdated: store.updatedAt ? new Date(store.updatedAt).toLocaleDateString() : 'N/A'
  };

  const statusLabel = typeof store.status === "boolean"
    ? (store.status ? Constants.adminConstants.activeStatus : Constants.adminConstants.inactiveStatus)
    : (store.status === "Active" ? Constants.adminConstants.activeStatus : Constants.adminConstants.inactiveStatus);

  return (
    <WebComponents.WebCommonComponents.CommonComponents.DetailsModalLayout
      title={Constants.adminConstants.storeProfileLabel}
      subtitle={Constants.adminConstants.completeStoreInformationAndDetailsLabel}
      icon={<Building2 size={32} className="text-white" />}
      statusLabel={statusLabel}
      statusColor={typeof store.status === "boolean" ? (store.status ? "active" : "inactive") : (store.status === "Active" ? "active" : "inactive")}
      onClose={onClose}
    >
      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Store Information Card */}
        <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoCard
          title={Constants.adminConstants.storeInformationLabel}
          icon={<Building2 size={18} className="text-white" />}
        >
          <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow
            label={Constants.adminConstants.storeNameLabel}
            icon={<Building2 size={16} />}
            value={storeData.name}
          />

          <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow
            label={Constants.adminConstants.emailLabel}
            icon={<Mail size={16} />}
            value={storeData.email}
          />

          <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow
            label={Constants.adminConstants.contactNumberLabel}
            icon={<Phone size={16} />}
            value={storeData.contactNumber}
          />

          <div>
            <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoLabel
              icon={<MapPin size={16} />}
              label={Constants.adminConstants.addressLabel}
            />
            <p className="text-base text-gray-700 dark:text-gray-300 ml-6">{storeData.address}</p>
          </div>

          <div>
            <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoLabel
              icon={<Globe size={16} />}
              label={Constants.adminConstants.locationLabel}
            />
            <p className="text-base text-gray-700 dark:text-gray-300 ml-6">
              {storeData.city}, {storeData.state}, {storeData.country} {storeData.postalCode}
            </p>
          </div>

          <div>
            <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoLabel
              icon={<MapPin size={16} />}
              label={Constants.adminConstants.coordinatesLabel}
            />
            <p className="text-base text-gray-700 dark:text-gray-300 ml-6">
              {Constants.adminConstants.latitudeLabel}: {storeData.latitude}, {Constants.adminConstants.longitudeLabel}: {storeData.longitude}
            </p>
          </div>

          <div>
            <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoLabel
              icon={<Building2 size={16} />}
              label={Constants.adminConstants.descriptionLabel}
            />
            <p className="text-base text-gray-700 dark:text-gray-300 ml-6">{storeData.description}</p>
          </div>
        </WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoCard>

        {/* Status Information Card */}
        <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoCard
          title={Constants.adminConstants.statusInformationLabel}
          icon={<Building2 size={18} className="text-white" />}
        >
          <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow
            label={Constants.adminConstants.currentStatusLabel}
            icon={<Building2 size={16} />}
            value={storeData.status}
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
            value={storeData.createdDate}
          />
          <WebComponents.UiComponents.UiWebComponents.DetailsCommon.TimelineItem
            icon={<Clock size={20} />}
            label={Constants.adminConstants.lastModifiedLabel}
            value={storeData.lastUpdated}
          />
        </div>
      </div>
    </WebComponents.WebCommonComponents.CommonComponents.DetailsModalLayout>
  );
};

export default StoreManagementDetailsModal;

