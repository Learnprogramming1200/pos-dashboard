export interface MiscSettings {
    _id: string;
    darkMode: boolean;
    timeZone: string;
    UTC: string;
    isMaintenanceMode: boolean;
    dateFormat: string;
    timeFormat: string;
    dataTableRow: number;
    subscriptionExpiryAlerts: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface MiscSettingsFormData {
    timeZone: string;
    UTC: string;
    dateFormat: string;
    timeFormat: string;
    dataTableRow: number;
    subscriptionExpiryAlerts: number;
}
