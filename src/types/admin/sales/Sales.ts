export interface Sales {
  _id: string; // Changed from id to _id to match API
  invoiceNumber: string;
  customerSnapshot: {
    customerName: string;
    customerCode: string;
    phone: string;
    email: string;
  };
  storeSnapshot: {
    name: string;
    location: {
      address: string;
      city: string;
      state: string;
      country: string;
    };
  };
  billingSummary: {
    subTotal: number;
    discountTotal: number;
    couponDiscount: number;
    loyaltyDiscount: number;
    giftCardDiscount: number;
    taxableAmount: number;
    taxTotal: number;
    roundingAdjustment: number;
    grandTotal: number;
    roundedGrandTotal: number;
    amountPaid: number;
    balanceDue: number;
  };
  giftCard?: {
    discountAmount: number;
  };
  coupon?: {
    discountAmount: number;
  };
  loyalty?: {
    pointsRedeemed: number;
    pointsAwarded: number;
    redemptionValue: number;
  };
  products: any[];
  paymentStatus: string;
  paymentDetails: any[];
  appliedTaxes: any[];
  saleStatus: string;
  fulfillmentStatus?: string;
  isWalkInCustomer?: boolean;
  saleDate: string;
  notes?: string;
  createdBy: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  __v?: number;

  // Legacy/Optional/New fields for compatibility
  id?: string;
  customerName?: string;
  customerId?: string;
  customer?: string;
  storeId?: string;
  store?: string;
  storeName?: string;
  totalItems?: number;
  totalAmount?: number;
  totalPaid?: number;
  discount?: number;
  tax?: number;
  orderDate?: string;
  status?: string;
  paymentMethod?: string;
  items?: SaleItem[];
}

export interface SaleItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
}

export interface SalesReturn {
  id: string;
  returnNumber: string;
  saleId: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  storeId: string;
  storeName: string;
  returnDate: string;
  reason: string;
  status: "Pending" | "Approved" | "Rejected" | "Completed";
  items: SalesReturnItem[];
  totalReturnAmount: number;
  returnCharges: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SalesReturnItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  discount: number;
  returnCharges: number;
  total: number;
}

export interface POS {
  id: string;
  name: string;
  storeId: string;
  storeName: string;
  location: string;
  status: "Active" | "Inactive" | "Maintenance";
  lastUsed: string;
  createdAt: string;
  updatedAt: string;
}

export interface SalesFormData {
  customerName: string;
  customerId: string;
  store: string;
  items: Omit<SaleItem, 'id'>[];
  discount: number;
  tax: number;
  paymentMethod: "Cash" | "Card" | "UPI" | "Bank Transfer" | "Other";
  notes?: string;
  [key: string]: any;
}

export interface SalesReturnFormData {
  saleId: string;
  customerId: string;
  storeId: string;
  reason: string;
  items: Omit<SalesReturnItem, 'id' | 'subtotal' | 'total'>[];
  returnCharges: number;
  notes?: string;
}

export interface POSFormData {
  name: string;
  storeId: string;
  location: string;
  status: "Active" | "Inactive" | "Maintenance";
}

export interface SalesDetailsModalProps {
  sale: Sales;
  onClose: () => void;
}

export interface SaleEditModalProps {
  sale: Sales;
  onClose: () => void;
}

export interface SalesStats {
  totalSales: number;
  totalRevenue: number;
  totalReturns: number;
  totalReturnAmount: number;
  averageOrderValue: number;
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  cancelledOrders: number;
}

export interface SalesFilter {
  dateRange: {
    start: string;
    end: string;
  };
  storeId?: string;
  status?: string;
  paymentMethod?: string;
  customerId?: string;
}

export interface SalesReturnFilter {
  dateRange: {
    start: string;
    end: string;
  };
  storeId?: string;
  status?: string;
  customerId?: string;
}
