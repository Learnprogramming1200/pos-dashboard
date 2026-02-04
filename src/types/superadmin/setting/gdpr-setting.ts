export type GDPRSettings = {
  _id?: string;
  id?: string;
  enableGdprCookieNotice: boolean;
  cookieMessage: string;
  createdAt?: string;
  updatedAt?: string;
  isValid?: boolean;
  requiredFieldsComplete?: boolean;
  bannerConfig: {
    enabled: boolean;
    message: string;
  };
  __v?: number;
};

export type GDPRSettingsFormData = {
  enableGdprCookieNotice: boolean;
  cookieMessage: string;
};