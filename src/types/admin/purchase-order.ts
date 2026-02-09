export interface PurchaseOrderItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  variant?: string;
  quantity: number;
  unitPrice: number;
  productTax: number; // Changed from tax to productTax
  netCost: number; // Added net cost
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
}

export interface PurchaseOrder {
  _id?: string;
  id: string;
  orderNumber: string;
  purchaseDate: string;
  supplierId: string;
  supplierName: string;
  supplierEmail: string;
  items: PurchaseOrderItem[];
  subtotal: number;
  taxAmount: number;
  discountType?: 'Percentage' | 'Fixed Amount';
  discountAmount: number;
  shippingCharges: number;
  shippingDetails?: {
    address: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    contactPerson: string;
    phone: string;
  };
  storeId?: string;
  storeName?: string;
  deliveryAddress?: {
    address: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  paymentMethod: 'Cash' | 'Credit Card' | 'Bank Transfer' | 'Cheque' | 'Other';
  // Card payment fields
  cardNumber?: string;
  cardHolderName?: string;
  cardType?: 'Visa' | 'Mastercard' | 'American Express' | 'Other';
  expiryMonth?: string;
  expiryYear?: string;
  // Bank transfer fields
  bankName?: string;
  branchName?: string;
  accountNumber?: string;
  ifscCode?: string;
  // Cheque fields
  chequeNumber?: string;
  totalAmount: number;
  status: "Received" | "Pending" | "Ordered" | "Billed" | "Draft" | "Approved" | "Cancelled";
  notes?: string;
  paymentTerms?: string;
  expectedDeliveryDate?: string;
  receivedDate?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  totals?: {
    subtotal: number;
    totalDiscount: number;
    totalTax: number;
    shippingFee: number;
    otherCharges: number;
    grandTotal: number;
    amountPaid: number;
    balanceDue: number;
  };
  // Additional fields for API response compatibility
  orderDetails?: any;
  supplier?: any;
  orderDiscountTax?: any;
  originalTotals?: any;
}

export interface PurchaseOrderFormData {
  supplierId: string;
  storeId: string;
  storeName?: string;
  purchaseDate: string;
  expectedDeliveryDate?: string;
  items: Omit<PurchaseOrderItem, 'id' | 'subtotal' | 'total'>[];
  discountType?: 'Percentage' | 'Fixed Amount';
  discountAmount: number;
  shippingCharges: number;
  shippingDetails?: {
    address: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    contactPerson: string;
    phone: string;
  };
  paymentMethod: 'Cash' | 'Credit Card' | 'Bank Transfer' | 'Cheque' | 'Other';
  // Card payment fields
  cardNumber?: string;
  cardHolderName?: string;
  cardType?: 'Visa' | 'Mastercard' | 'American Express' | 'Other';
  expiryMonth?: string;
  expiryYear?: string;
  // Bank transfer fields
  bankName?: string;
  branchName?: string;
  accountNumber?: string;
  ifscCode?: string;
  // Cheque fields
  chequeNumber?: string;
  status: "Received" | "Pending" | "Ordered" | "Billed" | "Draft" | "Approved" | "Cancelled";
  notes?: string;
}
