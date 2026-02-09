export interface SearchParams {
    page?: string;
    limit?: string;
    search?: string;
    isActive?: boolean;
    categoryId?: string;
    status?: string;
    category?: string;
    storeId?: string;
    type?: string;
    transactionType?: string;
    designation?: string;   //for designation
    all?: string;
    // Date Filters
    dateFrom?: string;
    dateTo?: string;
    fromDate?: string;
    toDate?: string;
    tab?: string;
    paymentStatus?: string;

    // Amount Filters
    minAmount?: string;
    maxAmount?: string;
    amountMin?: string;
    amountMax?: string;

    // Report Filters
    store?: string;
    storeName?: string;
    categoryName?: string;

    // User Login Report Filters
    role?: string;

    // Purchase Report Filters
    minPurchaseQty?: string;
    maxPurchaseQty?: string;
    minPurchaseAmount?: string;
    maxPurchaseAmount?: string;

    // Shift Calendar Filters
    shiftTypeId?: string;
    assignmentDate?: string;
    date?: string;
}
export interface DownloadSearchParams {
    search?: string;
    isActive?: boolean;
    status?: string;
    paymentStatus?: string;
    storeId?: string;
    categoryId?: string;
    type?: string;
    designation?: string;
}