
export interface WhatsappSettings {
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

export interface WhatsappSettingsFormData {
    accountSid: string;
    authToken: string;
    phoneNumber: string;
    isVerified: boolean;
}

export interface WhatsappSettingsUpdateData {
    accountSid?: string;
    authToken?: string;
    phoneNumber?: string;
    isVerified?: boolean;
}
