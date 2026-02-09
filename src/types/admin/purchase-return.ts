export interface PurchaseReturnItem {
  id: string;
  purchaseOrderId: string;
  productId: string;
  productName: string;
  sku: string;
  variant?: string;
  originalQuantity: number;
  returnedQuantity: number;
  unitPrice: number;
  refundAmount: number;
  reason: string;
}

export interface PurchaseReturn {
  id: string;
  _id?: string;

  // Backend does NOT send returnNumber separately
  // You can derive it from id if needed
  returnNumber?: string;
  purchaseReturnNumber?: string;
  /** Purchase Order */
  purchaseOrderId: {
    _id: string;
    orderDetails?: {
      poNumber?: string;
      storeName?: string;
    };
    status?: string;
    id?: string;
  };

  /** Supplier */
  supplierId: {
    _id: string;
    name: string;
    email?: string;
    phone?: string;
    fullAddress?: string;
    displayName?: string;
    id?: string;
  };

  /** Dates */
  returnDate: string;

  /** Store (flattened by backend sometimes) */
  storeId?: string;
  storeName?: string;

  /** Items */
  items: PurchaseReturnItem[];

  /** Amounts */
  itemsSubtotal?: number;
  itemsTaxTotal?: number;
  shippingAdjustment?: number;
  otherAdjustment?: number;

  totalCreditAmount: number;
  receivedCreditAmount?: number;
  balanceCreditAmount?: number;

  /** Status */
  status: "Draft" | "Approved" | "Returned" | "Credited" | "Cancelled";

  /** Reason / Notes */
  reason?: string;
  notes?: string;

  /** Audit */
  createdBy?: {
    _id: string;
    name: string;
    email?: string;
  };

  updatedBy?: string;

  createdAt: string;
  updatedAt: string;
}


export interface PurchaseReturnFormData {
  purchaseOrderId: string;
  returnDate: string;
  storeId?: string;
  storeName?: string;
  // Product Details
  productName?: string;
  quantity?: number;
  price?: number;
  total?: number;
  items: Omit<PurchaseReturnItem, 'id' | 'refundAmount'>[];
  notes?: string;
}
