export interface SmsTemplate {
    content: string;
}

export interface Template {
    userType: string;
    sms: SmsTemplate;
    isDefault: boolean;
    lastUsedAt: string | null;
    _id: string;
}

export interface SMSNotificationTemplate {
    _id: string;
    label: string;
    type: string;
    to: string[];
    templates: Template[];
    status: boolean;
    isSystem: boolean;
    lastUsedAt: string | null;
    createdBy: string | null;
    updatedBy: string | null;
    createdAt: string;
    updatedAt: string;
    __v: number;
    name?: string | null;
}

export interface SMSNotificationResponse {
    data: SMSNotificationTemplate[];
    pagination: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
        itemsPerPage: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}
