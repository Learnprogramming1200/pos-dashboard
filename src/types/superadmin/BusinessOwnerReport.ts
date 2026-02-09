export type BusinessOwnerReport = {
  subscriptionId: string;
  businessOwner: {
    id: string;
    name: string;
    email: string;
    phone: string;
    profilePicture: string | null;
    isActive: boolean;
  };
  business: {
    id: string;
    name: string;
    isActive: boolean;
  };
  plan: {
    id: string;
    name: string;
    type: string;
    price: number;
    isTrial: boolean;
  };
  paymentMethod: string;
  paymentProvider: string;
  paymentStatus: string;
  duration: number;
  durationUnit: string;
  discount: {
    value: number;
    type: string;
    amount: number;
  } | null;
  tax: {
    name: string;
    type: string;
    value: number;
    amount: number;
  } | null;
  amount: number;
  totalAmount: number;
  currency: {
    code: string;
    symbol: string;
    position?: string;
  };
  subscribeDate: string;
  expiryDate: string | null;
  status: string;
  isTrial: boolean;
  invoice: {
    paymentId?: string;
    providerOrderId?: string;
    providerPaymentId?: string;
  } | null;
  createdAt: string;
  updatedAt: string;
};

export interface PDFColumn<T = any> {
  key: string;
  label: string;
  accessor?: (row: T) => string | number | null | undefined;
  width?: number;
}

export interface CSVColumn<T = any> {
  key: string;
  label: string;
  accessor?: (row: T) => string | number | null | undefined;
}