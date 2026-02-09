"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, MailOpen, Mail, Clock, X } from 'lucide-react';
import { TableColumn } from 'react-data-table-component';
import { ServerActions } from "@/lib";
import { SuperAdminTypes } from '@/types';
import { Constants } from '@/constant';
import { WebComponents } from "@/components";

export default function NotificationList({ initialData = [] }: { initialData?: SuperAdminTypes.NotificationTypes.ListNotification[] }) {
    const router = useRouter();
    const [notifications, setNotifications] = React.useState<SuperAdminTypes.NotificationTypes.ListNotification[]>(initialData);
    const [loading, setLoading] = React.useState(false);

    const [selectedRows, setSelectedRows] = React.useState<SuperAdminTypes.NotificationTypes.ListNotification[]>([]);
    const [filterType, setFilterType] = React.useState<string>(Constants.superadminConstants.filterAll);
    const [viewNotification, setViewNotification] = React.useState<SuperAdminTypes.NotificationTypes.ListNotification | null>(null);
    const [isModalOpen, setIsModalOpen] = React.useState(false);

    // Filter notifications
    const filteredNotifications = React.useMemo(() => {
        if (filterType === Constants.superadminConstants.filterAll) return notifications;
        if (filterType === Constants.superadminConstants.filterUnread) return notifications.filter(n => !n.isRead);
        if (filterType === Constants.superadminConstants.filterRead) return notifications.filter(n => n.isRead);
        return notifications;
    }, [notifications, filterType]);

    const [unreadCount, setUnreadCount] = React.useState(0);

    const fetchUnreadCount = React.useCallback(async () => {
        try {
            const response = await ServerActions.ServerActionslib.getSuperAdminUnreadNotificationCountAction();
            if (response.success && typeof response.data === 'number') {
                setUnreadCount(response.data);
            }
        } catch (error) {
            console.error("Failed to fetch unread count", error);
        }
    }, []);

    React.useEffect(() => {
        fetchUnreadCount();
    }, [fetchUnreadCount, notifications]);

    // Handle row selection
    const handleSelectedRowsChange = (state: { selectedRows: SuperAdminTypes.NotificationTypes.ListNotification[] }) => {
        setSelectedRows(state.selectedRows);
    };

    // Toggle read status
    const toggleRead = async (id: string) => {
        const wasRead = notifications.find(n => n.id === id)?.isRead;
        // Optimistic update
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, isRead: !n.isRead } : n)
        );

        if (!wasRead) {
            setUnreadCount(prev => Math.max(0, prev - 1));
        }

        try {
            const result = await ServerActions.ServerActionslib.markSuperAdminNotificationAsReadAction(id);
            if (!result.success) throw new Error(result.error);
            router.refresh();
        } catch (error) {
            console.error("Failed to mark as read", error);
            // Revert
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, isRead: !!wasRead } : n)
            );
            WebComponents.UiComponents.UiWebComponents.SwalHelper.error({ text: "Failed to update status" });
        }
    };

    const handleMarkAllRead = async () => {
        try {
            setLoading(true);
            const result = await ServerActions.ServerActionslib.markAllSuperAdminNotificationsAsReadAction();
            if (result.success) {
                setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
                setUnreadCount(0);
                WebComponents.UiComponents.UiWebComponents.SwalHelper.success({ text: "All notifications marked as read" });
                router.refresh();
            } else {
                throw new Error(result.error);
            }
        } catch (error: any) {
            WebComponents.UiComponents.UiWebComponents.SwalHelper.error({ text: error.message || "Failed to mark all as read" });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAll = async () => {
        await ServerActions.HandleFunction.handleDeleteCommon({
            id: 'all',
            deleteAction: (_: string | number) =>
                ServerActions.ServerActionslib.deleteAllSuperAdminNotificationsAction(),
            setLoading,
            router,
            successMessage: "All notifications deleted successfully",
            errorMessage: "Failed to delete notifications",
            onSuccess: () => {
                setNotifications([]);
                setUnreadCount(0);
            },
        });
    };

    // Toggle read status for selected rows
    const toggleSelectedRead = () => {
        // Bulk action implementation pending backend support
        const selectedIds = new Set(selectedRows.map(r => r.id));
        const hasUnread = notifications.some(n => selectedIds.has(n.id) && !n.isRead);

        setNotifications(prev =>
            prev.map(n => selectedIds.has(n.id) ? { ...n, isRead: hasUnread } : n)
        );
    };

    // Single Delete using Helper
    const handleDelete = async (id: string) => {
        await ServerActions.HandleFunction.handleDeleteCommon({
            id,
            deleteAction: (id: string | number) =>
                ServerActions.ServerActionslib.deleteSuperAdminNotificationAction(id as string),
            setLoading,
            router,
            successMessage: "Notification deleted successfully",
            errorMessage: "Failed to delete notification",
            onSuccess: () => {
                setNotifications((prev) => prev.filter((n) => n.id !== id));
                if (viewNotification?.id === id) {
                    setIsModalOpen(false);
                    setViewNotification(null);
                }
            },
        });
    };

    // Delete selected
    const deleteSelected = () => {
        // Bulk delete implementation pending backend support
        const selectedIds = new Set(selectedRows.map(r => r.id));
        setNotifications(prev => prev.filter(n => !selectedIds.has(n.id)));
        setSelectedRows([]);
    };


    // Define columns
    const columns: TableColumn<SuperAdminTypes.NotificationTypes.ListNotification>[] = [
        {
            name: Constants.superadminConstants.notificationColumnLabel,
            cell: (row) => (
                <div className="py-2 flex-1 overflow-hidden">
                    <div className="flex items-center gap-2">
                        {!row.isRead && (
                            <div className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0" aria-hidden="true" />
                        )}
                        <div className="flex items-center gap-1 whitespace-nowrap overflow-hidden text-ellipsis flex-1">
                            <span className={`${row.isRead ? 'font-normal' : 'font-semibold'} text-sm flex-shrink-0`}>
                                {row.notification}
                            </span>
                            <span className="text-sm text-gray-600 dark:text-gray-400 flex-shrink-0">
                                -
                            </span>
                            <span className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                {(() => {
                                    const maxTotal = 110;
                                    const notificationLen = row.notification.length;
                                    const separatorLen = 3; // " - "
                                    const available = Math.max(0, maxTotal - notificationLen - separatorLen);
                                    return row.message.length > available
                                        ? row.message.substring(0, available) + '...'
                                        : row.message;
                                })()}
                            </span>
                        </div>
                    </div>
                </div>
            ),
            sortable: false,
            grow: 2,
        },
        {
            name: Constants.superadminConstants.dateColumnLabel,
            selector: (row) => row.timestamp,
            cell: (row) => (
                <div className="notification-actions-cell flex items-center justify-end gap-2">
                    <span className="timestamp text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        {row.timestamp}
                    </span>
                    <div className="action-icons hidden items-center gap-1">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleRead(row.id);
                            }}
                            className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                            title={row.isRead ? Constants.superadminConstants.markAsUnreadLabel : Constants.superadminConstants.markAsReadLabel}
                        >
                            {row.isRead ? (
                                <Mail className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                            ) : (
                                <MailOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            )}
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(row.id);
                            }}
                            className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-colors"
                            title={Constants.superadminConstants.deleteLabel}
                        >
                            <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                        </button>
                    </div>
                </div>
            ),
            sortable: true,
            width: '90px',
            style: {
                paddingRight: '0px',
            },
        },
    ];

    return (
        <>
            <style>{`
                .rdt_TableRow:hover .notification-actions-cell .timestamp {
                    display: none;
                }
                .rdt_TableRow:hover .notification-actions-cell .action-icons {
                    display: flex;
                }
            `}</style>
            <div className="space-y-6">


                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
                    <div className="flex-1 min-w-0">
                        <h1 className="text-lg sm:text-lg md:text-xl lg:text-2xl font-medium text-textMain dark:text-white truncate">
                            {Constants.superadminConstants.notificationHeading}
                        </h1>
                        <p className="text-xs sm:text-sm md:text-base text-textSmall pt-2">
                            {Constants.superadminConstants.notificationBio}
                        </p>
                    </div>
                </div>

                {/* Main List View */}
                <div className="bg-white dark:bg-darkFilterbar rounded-[4px] h-full w-full mt-4 overflow-hidden">
                    {/* Filters and Bulk Actions */}
                    <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between gap-4 flex-wrap">
                        {/* Filters */}
                        <div className="flex items-center gap-2 flex-wrap">
                            {[Constants.superadminConstants.filterAll, Constants.superadminConstants.filterUnread, Constants.superadminConstants.filterRead].map((filter) => (
                                <button
                                    key={filter}
                                    onClick={() => setFilterType(filter)}
                                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${filterType === filter
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                        }`}
                                >
                                    {filter}
                                </button>
                            ))}
                        </div>

                        {/* Bulk Actions */}
                        <div className="flex items-center gap-3">
                            {/* Global Actions */}
                            <div className="flex items-center gap-2 mr-2">
                                <button
                                    onClick={handleMarkAllRead}
                                    className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium"
                                >
                                    {Constants.superadminConstants.markAllAsReadLabel}
                                </button>
                                <button
                                    onClick={handleDeleteAll}
                                    className="text-xs sm:text-sm text-red-600 dark:text-red-400 hover:underline font-medium"
                                >
                                    {Constants.superadminConstants.deleteAllLabel}
                                </button>
                            </div>

                            {selectedRows.length > 0 && (
                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {selectedRows.length} {Constants.superadminConstants.selectedLabelCount}
                                    </span>
                                    <button
                                        onClick={toggleSelectedRead}
                                        className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[4px] text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-9 w-9 border-[1.5px] ${notifications.some(n => selectedRows.some(r => r.id === n.id) && !n.isRead) ? 'bg-white border-blue-500 hover:bg-blue-200 text-blue-600 dark:bg-gray-800 dark:border-blue-800 dark:text-blue-400' : 'bg-white border-gray-500 hover:bg-gray-100 text-gray-600 dark:bg-gray-700 dark:border-gray-700 dark:text-gray-400'}`}
                                        title={notifications.some(n => selectedRows.some(r => r.id === n.id) && !n.isRead) ? Constants.superadminConstants.markAsReadLabel : Constants.superadminConstants.markAsUnreadLabel}
                                    >
                                        {notifications.some(n => selectedRows.some(r => r.id === n.id) && !n.isRead) ? (
                                            <MailOpen className="w-4 h-4" />
                                        ) : (
                                            <Mail className="w-4 h-4" />
                                        )}
                                    </button>
                                    <button
                                        onClick={deleteSelected}
                                        className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[4px] text-sm font-poppins font-semibold transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-[#FFFAFA] text-[#DE4B37] hover:bg-[#c7432f] hover:text-white border-[1.5px] border-[#DE4B37] dark:bg-[#2d1b1b] dark:text-[#f87171] dark:hover:bg-[#ef4444] dark:hover:text-white dark:border-[#ef4444] h-9 w-9"
                                        title={Constants.superadminConstants.deleteLabel}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Data Table */}
                    <div>
                        <WebComponents.WebCommonComponents.CommonComponents.DataTable
                            columns={columns}
                            data={filteredNotifications}
                            selectableRows
                            onSelectedRowsChange={handleSelectedRowsChange}
                            onRowClicked={(row) => {
                                // Mark as read immediately if unread
                                if (!row.isRead) {
                                    toggleRead(row.id);
                                }

                                // Open modal with notification details
                                const updatedRow = { ...row, isRead: true };
                                setViewNotification(updatedRow);
                                setIsModalOpen(true);
                            }}
                            highlightOnHover
                            persistTableHead
                            paginationRowsPerPageOptions={[10, 20, 30, 40, 50]}
                            paginationPerPage={10}
                            useCustomPagination={true}
                            totalRecords={notifications.length}
                            filteredRecords={notifications.length}
                        />
                    </div>
                </div>

                {/* Notification Detail Modal */}
                {viewNotification && (() => {
                    // Format date to show day, date, and time
                    const formatDateTime = (date: Date) => {
                        const days = [
                            Constants.superadminConstants.sunday,
                            Constants.superadminConstants.monday,
                            Constants.superadminConstants.tuesday,
                            Constants.superadminConstants.wednesday,
                            Constants.superadminConstants.thursday,
                            Constants.superadminConstants.friday,
                            Constants.superadminConstants.saturday
                        ];
                        const dayName = days[date.getDay()];
                        const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                        const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
                        return { dayName, dateStr, timeStr };
                    };

                    const { dayName, dateStr, timeStr } = formatDateTime(viewNotification.date);



                    return (
                        <WebComponents.UiWebComponents.UiWebComponents.Dialog open={isModalOpen} onOpenChange={(open) => {
                            setIsModalOpen(open);
                            if (!open) {
                                setViewNotification(null);
                            }
                        }}>
                            <WebComponents.UiWebComponents.UiWebComponents.DialogContent className="w-[600px] h-[400px] max-w-[600px] max-h-[400px] overflow-hidden !p-0 [&>button]:hidden">
                                <WebComponents.UiWebComponents.UiWebComponents.DialogTitle className="sr-only">
                                    {viewNotification.notification}
                                </WebComponents.UiWebComponents.UiWebComponents.DialogTitle>
                                <div className="bg-white dark:bg-darkFilterbar rounded-lg overflow-hidden flex flex-col h-full">
                                    {/* Header with title and close button */}
                                    <div className="px-6 py-5 relative flex-shrink-0">
                                        <div className="flex items-start justify-between gap-4">
                                            <h2 className="text-xl font-semibold text-textMain dark:text-white break-words flex-1 pr-8 overflow-wrap-anywhere">
                                                {viewNotification.notification}
                                            </h2>
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                <button
                                                    onClick={() => handleDelete(viewNotification.id)}
                                                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                                                    aria-label={Constants.superadminConstants.deleteAriaLabel}
                                                    title={Constants.superadminConstants.deleteLabel}
                                                >
                                                    <Trash2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                                </button>
                                                <button
                                                    onClick={() => setIsModalOpen(false)}
                                                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                                                    aria-label="Close"
                                                    title="Close"
                                                >
                                                    <X className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                                </button>
                                            </div>
                                        </div>
                                        {/* Time display */}
                                        <div className="flex items-center gap-2 mt-3 text-sm text-gray-500 dark:text-gray-400">
                                            <Clock className="w-4 h-4 flex-shrink-0" />
                                            <span>{dayName}, {dateStr} {timeStr}</span>
                                        </div>
                                    </div>

                                    {/* Separator */}
                                    <div className="border-t border-gray-200 dark:border-gray-700 flex-shrink-0"></div>

                                    {/* Content */}
                                    <div className="px-6 py-6 overflow-y-auto flex-1 bg-white dark:bg-darkFilterbar min-h-0">
                                        <div className="text-base text-textMain dark:text-gray-300 whitespace-pre-wrap leading-relaxed break-words overflow-wrap-anywhere">
                                            {viewNotification.message}
                                        </div>
                                    </div>
                                </div>
                            </WebComponents.UiWebComponents.UiWebComponents.DialogContent>
                        </WebComponents.UiWebComponents.UiWebComponents.Dialog>
                    );
                })()}
            </div>
        </>
    );
}
