export type LoyaltyType = "Services" | "Products" | "Both";

// Loyalty Form data types
export type LoyaltyPointFormData = {
  minimumAmount: number;
  maximumAmount: number;
  loyaltyPoints: number;
  expiryDuration: number;
  status: boolean;
};

// Server response type for loyalty points
export type LoyaltyPointServerResponse = {
  _id: string;
  loyaltyPoints: number;
  minimumAmount: number;
  maximumAmount: number;
  expiryDuration: number;
  createdBy: string;
  updatedBy: string;
  status: boolean;
  createdAt: string;
  updatedAt: string;
};

// Redeem Form data types
export type RedeemPointFormData = {
  ruleName: string;
  pointFrom: number;
  pointTo: number;
  amount: number;
  status: boolean;
};

// Server response type for redeem points
export type RedeemPointServerResponse = {
  _id: string;
  ruleName: string;
  pointFrom: number;
  pointTo: number;
  amount: number;
  status: boolean;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
};

export type LoyaltyConfigResponse = {
  message: string;
  data: {
    data: LoyaltyPointServerResponse;
  };
};

export type RedeemConfigResponse = {
  message: string;
  data: {
    data: RedeemPointServerResponse;
  };
};
