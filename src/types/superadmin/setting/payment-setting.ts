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

export type PaymentProviderDefinition = {
  method: {
    id: string;
    name: string;
    description: string;
  };
  provider: {
    requiredFields: string[];
    sensitiveFields: string[];
  };
};

export const PAYMENT_PROVIDER_DEFINITIONS: PaymentProviderDefinition[] = [
  {
    method: {
      id: 'razorpay',
      name: 'Razorpay',
      description: 'Secure payment processing via Razorpay',
    },
    provider: {
      requiredFields: ['key_id', 'key_secret'],
      sensitiveFields: ['key_secret']
    }
  },
  {
    method: {
      id: 'stripe',
      name: 'Stripe',
      description: 'Accept credit card payments via Stripe',
    },
    provider: {
      requiredFields: ['secretKey', 'appKey'],
      sensitiveFields: ['secretKey']
    }
  },
  {
    method: {
      id: 'paypal',
      name: 'PayPal',
      description: 'Accept payments via PayPal account',
    },
    provider: {
      requiredFields: ['clientId', 'clientSecret', 'siteId'],
      sensitiveFields: ['clientSecret']
    }
  },
  {
    method: {
      id: 'cinet',
      name: 'CinetPay',
      description: 'Payment integration via CinetPay',
    },
    provider: {
      requiredFields: ['apiKey'],
      sensitiveFields: ['apiKey']
    }
  },
  {
    method: {
      id: 'sadad',
      name: 'Sadad',
      description: 'Payment integration via Sadad',
    },
    provider: {
      requiredFields: ['domain'],
      sensitiveFields: []
    }
  },
  {
    method: {
      id: 'airtelMoney',
      name: 'Airtel Money',
      description: 'Accept payments via Airtel Money',
    },
    provider: {
      requiredFields: ['siteId', 'secretKey'],
      sensitiveFields: ['secretKey']
    }
  },
  {
    method: {
      id: 'phonePe',
      name: 'PhonePe',
      description: 'UPI and Wallet payments via PhonePe',
    },
    provider: {
      requiredFields: ['appId', 'merchantId', 'saltId', 'saltKey'],
      sensitiveFields: ['saltId', 'saltKey']
    }
  },
  {
    method: {
      id: 'midtrans',
      name: 'Midtrans',
      description: 'Payment gateway for Indonesia',
    },
    provider: {
      requiredFields: ['siteId'],
      sensitiveFields: []
    }
  },
  {
    method: {
      id: 'paystack',
      name: 'Paystack',
      description: 'Modern online and offline payments for Africa',
    },
    provider: {
      requiredFields: ['secretKey', 'appKey'],
      sensitiveFields: ['secretKey']
    }
  },
  {
    method: {
      id: 'flutterwave',
      name: 'Flutterwave',
      description: 'Endless possibilities for every business',
    },
    provider: {
      requiredFields: ['secretKey', 'appKey'],
      sensitiveFields: ['secretKey']
    }
  }
];
