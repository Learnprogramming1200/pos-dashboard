export interface MailSettings {
    _id: string;
    email: string;
    host: string;
    port: number;
    encryption: 'ssl' | 'tls' | 'none';
    password?: string;
    isVerified: boolean;
    lastVerifiedAt: string;
    isComplete: boolean;
    createdAt?: string;
    updatedAt?: string;
    __v?: number;
    id?: string;
}

export interface MailSettingsFormData {
    email: string;
    host: string;
    port: number;
    encryption: 'ssl' | 'tls' | 'none';
    password?: string;
}

