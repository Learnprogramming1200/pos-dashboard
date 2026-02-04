export type GiftCardHistoryStatus = "Active" | "Used" | "Expired";

export type SendVia = "Email" | "WhatsApp";

export type GiftCardHistory = {
  _id: string;
  giftCardId: string; // Gift Card ID / Reference No
  giftCardNumber: string; // Gift Card Number
  assignedCustomerId: string; // Assigned Customer ID
  assignedCustomerName: string; // Assigned Customer Name
  issuedDate: string; // Issued Date - ISO date string
  expiryDate: string; // Expiry Date - ISO date string
  giftCardValue: number; // Gift Card Value
  usedAmount: number; // Used Amount
  remainingBalance: number; // Remaining Balance
  redemptionDates?: string[]; // Redemption Date(s) - ISO date strings
  sentVia?: SendVia[]; // Sent Via (Email / WhatsApp)
  status: GiftCardHistoryStatus; // Status (Active / Used / Expired)
  handledBy: string; // Handled By (Admin/User)
  remarks?: string; // Remarks / Notes
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
};

export type GiftCardHistoryResponse = {
  message: string;
  data: {
    data: GiftCardHistory[];
    pagination?: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  };
};

