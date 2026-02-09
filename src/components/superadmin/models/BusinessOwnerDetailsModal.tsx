"use client";
import React from "react";
import { FaUser, FaEnvelope, FaPhone, FaBuilding, FaTag, FaClock, FaCalendar } from 'react-icons/fa';
import { Constants } from "@/constant";
import { WebComponents } from "@/components";
import { SuperAdminTypes } from "@/types";

interface BusinessOwnerDetailsModalProps {
    owner: SuperAdminTypes.BusinessOwnerTypes.BusinessOwner;
    onClose: () => void;
}

const BusinessOwnerDetailsModal: React.FC<BusinessOwnerDetailsModalProps> = ({ owner, onClose }) => {
    // Prevent body scroll when modal is open
    React.useEffect(() => {
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = originalOverflow;
        };
    }, []);

    // Handle Escape key to close modal
    React.useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        document.addEventListener('keydown', handleEscape);
        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [onClose]);

    if (!owner) return null;

    const getStatus = (): string => {
        if (owner.isActive !== undefined) {
            return owner.isActive ? "Active" : "Inactive";
        }
        return owner.status || "Unknown";
    };

    const getBusinessName = (): string => {
        if (owner.businesses && owner.businesses.length > 0) {
            return owner.businesses[0].businessName;
        }
        return owner.businessName || '-';
    };

    const getBusinessCategory = (): string => {
        if (owner.businesses && owner.businesses.length > 0) {
            return owner.businesses[0].businessCategoryId?.categoryName || '-';
        }
        if (typeof owner.businessCategory === 'string') {
            return owner.businessCategory;
        }
        return owner.businessCategory?.categoryName || '-';
    };

    const ownerData = {
        ownerName: owner.name,
        email: owner.email,
        phoneNumber: owner.phone,
        status: getStatus(),
        businessName: getBusinessName(),
        businessCategory: getBusinessCategory(),
        createdDate: owner.createdAt ? new Date(owner.createdAt).toLocaleDateString() : '-',
        lastUpdated: owner.updatedAt ? new Date(owner.updatedAt).toLocaleDateString() : '-'
    };

    const statusColor = ownerData.status === "Active" ? "active" : "inactive";

    return (
        <WebComponents.WebCommonComponents.CommonComponents.DetailsModalLayout
            title={Constants.superadminConstants.businessownerprofile}
            subtitle={Constants.superadminConstants.businessownerprofilebio}
            icon={<FaUser size={32} className="text-white" />}
            statusLabel={ownerData.status}
            statusColor={statusColor as any}
            onClose={onClose}
        >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Owner Information Card */}
                <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoCard
                    title={Constants.superadminConstants.ownerinformation}
                    icon={<FaUser size={18} className="text-white" />}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow
                            label={Constants.superadminConstants.fullnamelabel}
                            icon={<FaUser size={14} />}
                            value={ownerData.ownerName}
                        />
                        <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow
                            label={Constants.superadminConstants.emailaddresslabel}
                            icon={<FaEnvelope size={14} />}
                            value={ownerData.email}
                        />
                        <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow
                            label={Constants.superadminConstants.contactnumberlabel}
                            icon={<FaPhone size={14} />}
                            value={ownerData.phoneNumber}
                        />
                        {owner.gender && (
                            <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow
                                label={Constants.superadminConstants.genderlabel}
                                icon={<FaUser size={14} />}
                                value={owner.gender}
                            />
                        )}
                        {owner.lastLoginAt && (
                            <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow
                                label={Constants.superadminConstants.lastloginlabel}
                                icon={<FaClock size={14} />}
                                value={new Date(owner.lastLoginAt).toLocaleString()}
                            />
                        )}
                    </div>
                </WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoCard>

                {/* Business Information Card */}
                <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoCard
                    title={Constants.superadminConstants.businessinformation}
                    icon={<FaBuilding size={18} className="text-white" />}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow
                            label={Constants.superadminConstants.businessnamelabel}
                            icon={<FaBuilding size={14} />}
                            value={ownerData.businessName}
                        />
                        <div>
                            <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoLabel
                                icon={<FaTag size={14} />}
                                label={Constants.superadminConstants.categorylabel}
                            />
                            <div className="ml-6">
                                <span className="inline-block px-2.5 py-1 bg-primary text-white rounded-lg text-sm font-semibold">
                                    {ownerData.businessCategory}
                                </span>
                            </div>
                        </div>
                    </div>
                </WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoCard>
            </div>

            {/* Timeline Section */}
            <div className="mt-6 bg-gradient-to-r from-slate-50 to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <FaClock size={18} className="text-gray-600 dark:text-gray-400" />
                    <span>{Constants.superadminConstants.activitytimeline}</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <WebComponents.UiComponents.UiWebComponents.DetailsCommon.TimelineItem
                        icon={<FaCalendar size={20} />}
                        label={Constants.superadminConstants.createdonlabel}
                        value={ownerData.createdDate}
                    />
                    <WebComponents.UiComponents.UiWebComponents.DetailsCommon.TimelineItem
                        icon={<FaClock size={20} />}
                        label={Constants.superadminConstants.lastmodifiedlabel}
                        value={ownerData.lastUpdated}
                    />
                </div>
            </div>
        </WebComponents.WebCommonComponents.CommonComponents.DetailsModalLayout>
    );
};

export default BusinessOwnerDetailsModal;
