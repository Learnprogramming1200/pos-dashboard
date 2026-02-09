export type NumberGenerationType = "Auto" | "Manual";

export type CustomerScope = "All" | "Specific";

export type GiftCardStatus = "Active" | "Inactive";

export type GiftCard = {
  _id?: string;
  name: string; // Gift Card Name
  number: string; // Gift Card Number (Auto / Manual)
  numberGenerationType: NumberGenerationType; // Auto or Manual
  value: number; // Gift Card Value
  thresholdAmount?: number; // Threshold Amount (Optional)
  validity: string; // Validity (Future Date) - ISO date string
  customerScope: CustomerScope; // Customers (Dropdown — Specific / All)
  assignedCustomerIds?: string[]; // Specific customer IDs if customerScope is "Specific"
  assignedCustomers?: Array<{ // Populated customer objects from API
    _id?: string;
    id?: string;
    name?: string;
    fullName?: string;
    customerName?: string;
    email?: string;
    user?: {
      name?: string;
      email?: string;
    };
    [key: string]: any;
  }>;
  terms?: string; // Terms & Conditions (HTML)
  giftCardImage?: string; // Gift Card Image URL
  status: GiftCardStatus; // Status (Active / Inactive)
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
};

// Response type for single gift card (POST/PUT responses)
export type GiftCardResponse = {
  message: string;
  data: {
    data: GiftCard;
  };
};

// Response type for multiple gift cards (GET all responses)
export type GiftCardsResponse = {
  message: string;
  data: {
    data: GiftCard[];
    pagination?: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
};

