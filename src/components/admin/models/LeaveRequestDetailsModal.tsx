"use client";

import { Calendar, Clock, User, Store, FileText, CheckCircle, XCircle, Info } from "lucide-react";
import { Constants } from "@/constant";
import { WebComponents } from "@/components";
import { AdminTypes } from "@/types";

interface LeaveRequestDetailsModalProps {
    leaveRequest: AdminTypes.hrmTypes.leaveTypes.LeaveRequest;
    onClose: () => void;
}

const LeaveRequestDetailsModal = ({
    leaveRequest,
    onClose,
}: LeaveRequestDetailsModalProps) => {
    // const statusColorMap = {
    //     pending: "warning",
    //     approved: "success",
    //     rejected: "danger",
    //     cancelled: "secondary",
    // } as const;
    return (
        <WebComponents.WebCommonComponents.CommonComponents.DetailsModalLayout
            title="Leave Request Details"
            subtitle="Complete leave request information and details"
            icon={<FileText size={32} className="text-white" />}
            statusLabel={leaveRequest.status}
            statusColor={leaveRequest.status === "approved" ? "active" : "inactive"}
            onClose={onClose}
        >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Employee & Store Information */}
                <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoCard
                    title="Request Information"
                    icon={<User size={18} className="text-white" />}
                >
                    <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow
                        label={Constants.adminConstants.leaveRequestStrings.staffLabel}
                        icon={<User size={16} />}
                        value={leaveRequest?.employeeId?.user?.name || "N/A"}
                    />

                    <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow
                        label={Constants.adminConstants.leaveRequestStrings.storeLabel}
                        icon={<Store size={16} />}
                        value={leaveRequest?.storeId?.name || "N/A"}
                    />

                    <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow
                        label={Constants.adminConstants.leaveRequestStrings.leaveTypeLabel}
                        icon={<FileText size={16} />}
                        value={leaveRequest?.leaveTypeId?.name || "N/A"}
                    />

                    <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow
                        label={Constants.adminConstants.leaveRequestStrings.isPaidLabel}
                        icon={<Info size={16} />}
                        value={leaveRequest.leaveTypeId?.type === "Paid" ? "Yes" : "No"}
                    />
                </WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoCard>

                {/* Date & Duration Information */}
                <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoCard
                    title="Date & Duration"
                    icon={<Calendar size={18} className="text-white" />}
                >
                    <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow
                        label={Constants.adminConstants.leaveRequestStrings.startDateLabel}
                        icon={<Calendar size={16} />}
                        value={new Date(leaveRequest.startDate).toLocaleDateString()}
                    />

                    <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow
                        label={Constants.adminConstants.leaveRequestStrings.endDateLabel}
                        icon={<Calendar size={16} />}
                        value={new Date(leaveRequest.endDate).toLocaleDateString()}
                    />

                    <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow
                        label="Duration"
                        icon={<Clock size={16} />}
                        value={`${Math.ceil((new Date(leaveRequest.endDate).getTime() - new Date(leaveRequest.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1} day(s)${leaveRequest.isHalfDay ? " (Half Day)" : ""}`}
                    />
                </WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoCard>

                {/* Reason Sections */}
                <div className="lg:col-span-2 space-y-6">
                    <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoCard
                        title="Reason for Leave"
                        icon={<FileText size={18} className="text-white" />}
                    >
                        <p className="text-base text-gray-700 dark:text-gray-300">
                            {leaveRequest.reason || "No reason provided"}
                        </p>
                    </WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoCard>

                    {leaveRequest.status === "rejected" && leaveRequest.rejectionReason && (
                        <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoCard
                            title="Rejection Reason"
                            icon={<XCircle size={18} className="text-white" />}
                        >
                            <p className="text-base text-red-600 dark:text-red-400 font-medium">
                                {leaveRequest.rejectionReason}
                            </p>
                        </WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoCard>
                    )}

                    {leaveRequest.status === "approved" && leaveRequest.approvedBy && (
                        <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoCard
                            title="Approval Information"
                            icon={<CheckCircle size={18} className="text-white" />}
                        >
                            <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow
                                label={Constants.adminConstants.leaveRequestStrings.approvedByLabel}
                                icon={<User size={16} />}
                                value={leaveRequest.approvedBy.name}
                            />
                            {leaveRequest.approvedAt && (
                                <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow
                                    label={Constants.adminConstants.leaveRequestStrings.approvedAtLabel}
                                    icon={<Clock size={16} />}
                                    value={new Date(leaveRequest.approvedAt).toLocaleString()}
                                />
                            )}
                        </WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoCard>
                    )}
                </div>
            </div>

            {/* Activity Timeline */}
            <div className="mt-4 bg-gradient-to-r from-slate-50 to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <Clock size={20} className="text-gray-600 dark:text-gray-300" />
                    {Constants.adminConstants.activityTimelineLabel}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <WebComponents.UiComponents.UiWebComponents.DetailsCommon.TimelineItem
                        icon={<Calendar size={20} />}
                        label={Constants.adminConstants.createdOnLabel}
                        value={leaveRequest.createdAt ? new Date(leaveRequest.createdAt).toLocaleDateString() : "N/A"}
                    />
                    <WebComponents.UiComponents.UiWebComponents.DetailsCommon.TimelineItem
                        icon={<Clock size={20} />}
                        label={Constants.adminConstants.lastModifiedLabel}
                        value={leaveRequest.updatedAt ? new Date(leaveRequest.updatedAt).toLocaleDateString() : "N/A"}
                    />
                </div>
            </div>
        </WebComponents.WebCommonComponents.CommonComponents.DetailsModalLayout>
    );
};

export default LeaveRequestDetailsModal;
