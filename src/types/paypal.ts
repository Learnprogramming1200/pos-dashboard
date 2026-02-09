export interface PayPalOptions {
  clientId: string;
  currency: string;
  amount: number;
  description?: string;
  onSuccess: (details: PayPalSuccessDetails) => void;
  onError: (error: any) => void;
  onCancel: () => void;
}

export interface PayPalSuccessDetails {
  id: string;
  status: string;
  purchase_units: Array<{
    payments: {
      captures: Array<{
        id: string;
        status: string;
        amount: {
          currency_code: string;
          value: string;
        };
      }>;
    };
  }>;
  payer: {
    name: {
      given_name: string;
      surname: string;
    };
    email_address: string;
    payer_id?: string;
  };
}

export interface PayPalPaymentData {
  amount: number;
  currency: string;
  clientId: string;
  paymentId: string;
  subscriptionId: string;
  currencyId?: string;
  approvalUrl?: string;
}

export interface PayPalInstance {
  render(element: string | HTMLElement, options: any): void;
}

declare global {
  interface Window {
    paypal?: any;
  }
}
