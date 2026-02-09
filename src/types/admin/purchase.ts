
export interface PurchaseStats {
  totalOrders: number;
  totalAmount: number;
  pendingOrders: number;
  completedOrders: number;
  totalReturns: number;
  totalRefunds: number;
}

// API Response interfaces for purchase components
export interface ApiPurchaseOrder {
  _id: string;
  supplier: {
    supplierId: {
      _id: string;
      supplierCode: string;
      name: string;
    };
    supplierName: string;
    supplierCode: string;
    contactPerson: string;
    email: string;
    phone: string;
    billingAddress: any;
    shippingAddress: any;
  };
  orderDetails: {
    poNumber: string;
    purchaseDate: string;
    expectedDeliveryDate: string;
    deliveryAddress: any;
    reference: string;
    currency: string;
    exchangeRate: number;
  };
  items: any[];
  orderDiscountTax: any;
  totals: {
    subtotal: number;
    totalDiscount: number;
    totalTax: number;
    shippingFee: number;
    otherCharges: number;
    grandTotal: number;
    amountPaid: number;
    balanceDue: number;
  };
  paymentTerms: string;
  status: string;
  notes: string;
  createdBy: string;
  isDeleted: boolean;
  receiveLogs: any[];
  attachments: any[];
  createdAt: string;
  updatedAt: string;
  __v: number;
  lastModifiedBy: string;
}

export interface ApiPurchaseReturn {
  _id: string;
  supplierId: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    [key: string]: any;
  } | string;
  purchaseOrderId: {
    _id: string;
    orderDetails: {
      poNumber: string;
    };
    status: string;
    [key: string]: any;
  } | string;
  returnDate: string;
  status: string;
  reason?: string;
  items: Array<{
    productId: string;
    orderedQty?: number;
    receivedQty?: number;
    returnQty: number;
    unitCost: number;
    discountPerUnit?: number;
    taxRatePercent?: number;
    taxAmount?: number;
    lineSubtotal?: number;
    lineTotal?: number;
    reason?: string;
    restock?: boolean;
    [key: string]: any;
  }>;
  itemsSubtotal?: number;
  itemsTaxTotal?: number;
  shippingAdjustment?: number;
  otherAdjustment?: number;
  totalCreditAmount: number;
  receivedCreditAmount?: number;
  createdBy: string;
  creditTransactions?: any[];
  createdAt: string;
  updatedAt: string;
  __v?: number;
  returnNumber?: string;
  storeId?: string | {
    _id: string;
    name: string;
    [key: string]: any;
  };
  [key: string]: any;
}
