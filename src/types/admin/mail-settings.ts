export interface MailSettings {
    _id?: string;
    id?: string;
    email: string;
    host: string;
    port: number;
    encryption: 'ssl' | 'tls' | 'none';
    password: string;
    isVerified: boolean;
    lastVerifiedAt?: string;
    isComplete?: boolean;
    createdAt?: string;
    updatedAt?: string;
    __v?: number;
  }
  
  export interface MailSettingsFormData {
    email: string;
    host: string;
    port: number;
    encryption: 'ssl' | 'tls' | 'none';
    password: string;
  }
  
  export interface MailSettingsUpdateData {
    email?: string;
    host?: string;
    port?: number;
    encryption?: 'ssl' | 'tls' | 'none';
    password?: string;
  }
  