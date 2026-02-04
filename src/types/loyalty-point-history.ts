export type LoyaltyPointsHistory = {
  _id: string;
  transactionId: string; // Transaction ID / Reference No
  customerId: string;
  customerName: string; // Customer Name / ID
  customerEmail?: string; // Customer Email
  customerImage?: string; // Customer Avatar/Image
  orderId?: string; // Order ID
  earnedPoints: number; // Earned Points
  redeemedPoints: number; // Redeemed Points
  balancePoints: number; // Balance Points
  transactionType: "Earn" | "Redeem"; // Transaction Type
  dateTime: string; // Date & Time
  handledBy: string; // Handled By (User/Admin)
  remarks?: string; // Remarks / Notes
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
};

export type LoyaltyPointsHistoryResponse = {
  message: string;
  data: {
    data: LoyaltyPointsHistory[];
    pagination?: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  };
};

