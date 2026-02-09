export interface NotificationContent {
    subject: string;
    content: string;
}

export interface NotificationTemplate {
    _id: string;
    label: string;
    type: string;
    status: boolean;
    userType: 'vendor' | 'customer' | 'admin' | string;
    notification: NotificationContent;
    email: NotificationContent;
}

export interface NotificationPagination {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNext: boolean;
    hasPrev: boolean;
}

export interface NotificationResponse {
    data: NotificationTemplate[];
    pagination: NotificationPagination;
}

export interface FlatNotificationTemplate {
    _id: string;
    label: string;
    type: string;
    status: boolean;
    notificationSubject: string;
    notificationContent: string;
    emailSubject: string;
    emailContent: string;
    userType: string;
    to: string | string[];
    templates?: {
        _id?: string;
        userType: string;
        notification: {
            subject: string;
            content: string;
        };
        email: {
            subject: string;
            content: string;
        };
    }[];
}

export interface ListNotification {
    id: string;
    sender: string;
    notification: string;
    message: string;
    type: 'System' | 'User' | 'Payment' | 'Order' | 'Alert';
    isRead: boolean;
    isStarred: boolean;
    timestamp: string;
    date: Date;
}
