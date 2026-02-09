export type TrialSettings = {
  _id?: string;
  description: string;
  duration: number;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
};

export type TrialSettingsResponse = {
  message: string;
  data: TrialSettings;
};

export type TrialSettingsFormData = {
  description: string;
  duration: number;
};

export type PaymentConfig = {
  tanentId?: string | null;
  _id?: string;
  provider: 'razorpay' | 'stripe' | 'paypal' | 'cinet' | 'sadad' | 'airtelMoney' | 'phonePe' | 'midtrans' | 'paystack' | 'flutterwave';
  enabled: boolean;
  credentials: {
    // Razorpay fields
    key_id?: string;
    key_secret?: string;
    // Stripe fields
    secretKey?: string;
    appKey?: string;
    // PayPal fields
    clientId?: string;
    clientSecret?: string;
    siteId?: string;
    // Cinet fields
    apiKey?: string;
    // SADAD fields
    domain?: string;
    // PhonePe fields
    appId?: string;
    merchantId?: string;
    saltId?: string;
    saltKey?: string;
  };
  publicCredentials: {
    // Public fields that can be shown to users
    key_id?: string;
    siteId?: string;
    appKey?: string;
    appId?: string;
    merchantId?: string;
    saltId?: string;
  };
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
};

export type PaymentConfigFormData = {
  provider: 'razorpay' | 'stripe' | 'paypal' | 'cinet' | 'sadad' | 'airtelMoney' | 'phonePe' | 'midtrans' | 'paystack' | 'flutterwave';
  enabled: boolean;
  credentials: {
    // Razorpay fields
    key_id?: string;
    key_secret?: string;
    // Stripe fields
    secretKey?: string;
    appKey?: string;
    // PayPal fields
    clientId?: string;
    clientSecret?: string;
    siteId?: string;
    // Cinet fields
    apiKey?: string;
    // SADAD fields
    domain?: string;
    // PhonePe fields
    appId?: string;
    merchantId?: string;
    saltId?: string;
    saltKey?: string;
  };
};



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

export type GDPRSettingsResponse = {
  message: string;
  data: GDPRSettings[];
};

export type SEOSettings = {
  _id?: string;
  id?: string;
  seoSlug: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string[];
  seoImage: {
    url: string;
    publicId: string;
  };
  googleSiteVerification: string;
  canonicalUrl: string;
  isActive?: boolean;
  lastCachePurge?: string;
  seoCompleteness?: number;
  isValid?: boolean;
  requiredFieldsComplete?: boolean;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
};

export type SEOSettingsFormData = {
  seoSlug: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string[];
  seoImage?: string | File;
  googleSiteVerification: string;
  canonicalUrl: string;
};

export type SEOSettingsResponse = {
  message: string;
  data: SEOSettings[];
};
