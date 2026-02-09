export interface SmsSettings {
    _id?: string;
    id?: string;
    accountSid: string;
    authToken: string;
    phoneNumber: string;
    isVerified: boolean;
    lastVerifiedAt?: string;
    isComplete?: boolean;
    createdAt?: string;
    updatedAt?: string;
    __v?: number;
}

export interface SmsSettingsFormData {
    accountSid: string;
    authToken: string;
    phoneNumber: string;
    isVerified: boolean;
}

export interface SmsSettingsUpdateData {
    accountSid?: string;
    authToken?: string;
    phoneNumber?: string;
    isVerified?: boolean;
}

