"use client";
import { FaTag, FaFileAlt, FaClock, FaCalendar } from 'react-icons/fa';
import { Constants } from '@/constant';
import { WebComponents } from "@/components";
import { SuperAdminTypes } from "@/types";

interface BusinessCategoryDetailsModalProps {
    readonly category: SuperAdminTypes.BusinessCategoryTypes.BusinessCategory;
    readonly onClose: () => void;
}

const BusinessCategoryDetailsModal = ({
    category,
    onClose,
}: BusinessCategoryDetailsModalProps) => {
    const statusLabel = category.isActive ? Constants.superadminConstants.active : Constants.superadminConstants.inactive;

    return (
        <WebComponents.WebCommonComponents.CommonComponents.DetailsModalLayout
            title={Constants.superadminConstants.businesscategorydetails}
            subtitle={Constants.superadminConstants.businesscategorydetailsbio}
            icon={<FaTag size={32} className="text-white" />}
            statusLabel={statusLabel}
            statusColor={category.isActive ? "active" : "inactive"}
            onClose={onClose}
        >
            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Category Information Card */}
                <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoCard
                    title={Constants.superadminConstants.categoryinformation}
                    icon={<FaTag size={18} className="text-white" />}
                >
                    <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow
                        label={Constants.superadminConstants.categoryname}
                        icon={<FaTag size={16} />}
                        value={category.categoryName}
                    />

                    <div>
                        <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoLabel
                            icon={<FaFileAlt size={16} />}
                            label={Constants.superadminConstants.descriptionlabel}
                        />
                        <p className="text-base text-gray-700 ml-6 dark:text-gray-300">
                            {category.description || 'No description provided'}
                        </p>
                    </div>
                </WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoCard>

                {/* Timeline Section */}
                <div className="bg-gradient-to-br from-slate-50 to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                            <FaClock size={18} className="text-white" />
                        </div>
                        {Constants.superadminConstants.activitytimeline}
                    </h3>
                    <div className="grid grid-cols-1 gap-6">
                        <WebComponents.UiComponents.UiWebComponents.DetailsCommon.TimelineItem
                            icon={<FaCalendar size={20} />}
                            label={Constants.superadminConstants.createdonlabel}
                            value={category.createdAt ? new Date(category.createdAt).toLocaleDateString() : '-'}
                        />
                        <WebComponents.UiComponents.UiWebComponents.DetailsCommon.TimelineItem
                            icon={<FaClock size={20} />}
                            label={Constants.superadminConstants.lastmodifiedlabel}
                            value={category.updatedAt ? new Date(category.updatedAt).toLocaleDateString() : '-'}
                        />
                    </div>
                </div>
            </div>
        </WebComponents.WebCommonComponents.CommonComponents.DetailsModalLayout>
    );
};

export default BusinessCategoryDetailsModal;
