"use client";
import { Calendar, Clock, Tag, Monitor, Store, MapPin, Power } from "lucide-react";
import { Constants } from "@/constant";
import { WebComponents } from "@/components";
import { POS } from "@/types/admin/sales/Sales";

interface POSDetailsModalProps {
    pos: POS;
    onClose: () => void;
}

const POSDetailsModal = ({
    pos,
    onClose,
}: POSDetailsModalProps) => {
    const statusLabel = pos.status;

    // Map POS status to supported layout status colors (active/inactive)
    // treating Maintenance as inactive for color coding purposes if warning is not supported
    const getStatusColor = (status: string): "active" | "inactive" => {
        if (status === "Active") return "active";
        return "inactive";
    };

    return (
        <WebComponents.WebCommonComponents.CommonComponents.DetailsModalLayout
            title="POS Details"
            subtitle="Complete POS Terminal Information and Details"
            icon={<Monitor size={32} className="text-white" />}
            statusLabel={statusLabel}
            statusColor={getStatusColor(pos.status)}
            onClose={onClose}
        >
            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* POS Information Card */}
                <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoCard
                    title="POS Information"
                    icon={<Monitor size={18} className="text-white" />}
                >
                    <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow
                        label="POS Name"
                        icon={<Tag size={16} />}
                        value={pos.name}
                    />
                    <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow
                        label="Store"
                        icon={<Store size={16} />}
                        value={pos.storeName}
                    />
                    <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow
                        label="Location"
                        icon={<MapPin size={16} />}
                        value={pos.location}
                    />
                </WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoCard>

                {/* Status Information Card */}
                <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoCard
                    title="Status Information"
                    icon={<Power size={18} className="text-white" />}
                >
                    <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow
                        label="Current Status"
                        icon={<Power size={16} />}
                        value={statusLabel}
                    />
                    <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow
                        label="Last Used"
                        icon={<Clock size={16} />}
                        value={pos.lastUsed ? new Date(pos.lastUsed).toLocaleDateString() + ' ' + new Date(pos.lastUsed).toLocaleTimeString() : "N/A"}
                    />
                </WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoCard>
            </div>

            {/* Timeline Section */}
            <div className="mt-4">
                <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoCard
                    title={Constants.adminConstants.activityTimelineLabel}
                    icon={<Clock size={18} className="text-white" />}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <WebComponents.UiComponents.UiWebComponents.DetailsCommon.TimelineItem
                            icon={<Calendar size={20} />}
                            label={Constants.adminConstants.createdOnLabel}
                            value={
                                pos.createdAt
                                    ? new Date(pos.createdAt).toLocaleDateString()
                                    : "N/A"
                            }
                        />
                        <WebComponents.UiComponents.UiWebComponents.DetailsCommon.TimelineItem
                            icon={<Clock size={20} />}
                            label={Constants.adminConstants.lastModifiedLabel}
                            value={
                                pos.updatedAt
                                    ? new Date(pos.updatedAt).toLocaleDateString()
                                    : "N/A"
                            }
                        />
                    </div>
                </WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoCard>
            </div>
        </WebComponents.WebCommonComponents.CommonComponents.DetailsModalLayout>
    );
};

export default POSDetailsModal;
