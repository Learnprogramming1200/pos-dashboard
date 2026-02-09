export interface PaymentData {
    subscriptionId: string;
    paymentProvider: string;
    currencyId: string;
    gatewayCredentials?: {
      key_id?: string;
      appKey?: string;
      siteId?: string;
      domain?: string;
      merchantId?: string;
      clientId?: string;
    } | null;
    amount?: number;
    currency?: string;
  }

export interface PaymentGateway {
    _id: string;
    provider: string;
    enabled: boolean;
    publicCredentials: {
      key_id?: string;
      appKey?: string;
      siteId?: string;
      domain?: string;
      merchantId?: string;
      clientId?: string;
    };
  }
  
export interface PaymentGatewaysResponse {
    message: string;
    status: number;
    data: PaymentGateway[];
  }
  