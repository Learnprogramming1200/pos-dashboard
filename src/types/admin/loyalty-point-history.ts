export type Customer = {
    customerId: string;
    customerName: string;
    customerEmail: string;
    customerImage: string | null;
};

export type LoyaltyPointsHistory = {
    _id: string;
    transactionType: "accrual" | "redemption";
    customer: Customer;
    transactionId: string;
    orderId: string;
    earnedPoints: number;
    redeemedPoints: number;
    balancePoints: number;
    transactiondateTime: string;
};

export type LoyaltyPointsHistoryResponse = {
    message: string;
    status: number;
    data: {
        data: LoyaltyPointsHistory[];
        pagination: {
            currentPage: number;
            totalPages: number;
            totalItems: number;
            itemsPerPage: number;
            hasNext: boolean;
            hasPrev: boolean;
        };
    };
};

