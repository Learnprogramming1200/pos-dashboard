export interface SalesReturnCustomer {
    _id: string;
    customerCode: string;
    customerName: string;
    phone: string;
    fullName: string;
}

export interface SalesReturnBillingSummary {
    grandTotal: number;
}

export interface SalesReturnSalesInfo {
    billingSummary: SalesReturnBillingSummary;
    _id: string;
    invoiceNumber: string;
    saleDate: string;
}

export interface SalesReturnItem {
    salesItemId: string;
    productId: string;
    variantId: string | null;
    SKU: string;
    productName: string;
    hasVariation: boolean;
    variantCombination: any[];
    soldQuantity: number;
    returnQuantity: number;
    originalLineDiscountAmount: number;
    sellingPrice: number;
    grossAmount: number;
    discountPercent: number;
    discountAmount: number;
    inclusiveTaxRatePercent: number;
    exclusiveTaxRatePercent: number;
    taxableValue: number;
    inclusiveTaxAmount: number;
    exclusiveTaxAmount: number;
    taxAmount: number;
    netAmount: number;
    reason: string | null;
    notes: string | null;
}

export interface SalesReturn {
    _id: string;
    customerId: SalesReturnCustomer;
    salesId: SalesReturnSalesInfo;
    invoiceNumber: string; // This seems to be the return reference or original invoice ref
    returnDate: string;
    status: string; // e.g., "pending"
    reason: string;
    items: SalesReturnItem[];
    itemsSubtotal: number;
    itemsTaxTotal: number;
    shippingAdjustment: number; // Was returnCharges in old type?
    otherAdjustment: number;
    totalRefundAmount: number;
    refundedAmount: number;
    refundTransactions: any[];
    createdAt: string;
    updatedAt: string;
    __v: number;
}

// Form Data Type for creating/editing
export interface SalesReturnFormData {
    salesId: string;
    customerId: string; // ID of the customer
    invoiceNumber: string;
    reason: string;
    returnDate: string;
    items: {
        salesItemId?: string; // Optional for new items if that was possible, but usually returns are based on existing sales items
        productId: string;
        variantId?: string;
        SKU?: string;
        returnQuantity: number;
        reason?: string;
        notes?: string;
        productName?: string;
        unitPrice?: number;
    }[];
    shippingAdjustment?: number;
    otherAdjustment?: number;
    status?: string;
    notes?: string;
}
