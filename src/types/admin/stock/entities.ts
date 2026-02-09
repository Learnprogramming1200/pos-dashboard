export interface StockAdjustment {
  _id: string;
  storeId: {
    _id: string;
    name: string;
  };
  productId: {
    _id: string;
    productName: string;
    SKU: string;
    variantData?: {
      variantValues: { value: string }[];
      SKU: string;
      variantTitle?: string;
    }[];
  };
  sku?: string;
  variant?: string;
  previousStock: number;
  actualStock: number;
  difference: number;
  adjustmentType: "increase" | "decrease" | "no change";
  reason?: string;
  referenceType?: string;
  status: "pending" | "approved" | "rejected" | "completed" | "cancelled";
  createdAt: string;
  updatedAt: string;
  categoryId?: {
    _id: string;
    categoryName: string;
  };
  subCategoryId?: {
    _id: string;
    subcategory: string;
  };
  rejectionReason?: string;
}

export interface StockTransfer {
  _id: string;
  fromStoreId: {
    _id: string;
    name: string;
  };
  toStoreId: {
    _id: string;
    name: string;
  };
  productId: {
    _id: string;
    productName: string;
    SKU: string;
    variantData?: {
      variantValues: { value: string }[];
      SKU: string;
      variantTitle?: string;
    }[];
  };
  categoryId: {
    _id: string;
    categoryName: string;
  };
  subCategoryId?: {
    _id: string;
    subcategory: string;
  };
  SKU: string;
  quantity: number;
  status: "pending" | "approved" | "rejected" | "in_transit" | "completed" | "cancelled";
  reason?: string;
  notes?: string;
  transferNumber?: string;
  createdAt: string;
  updatedAt: string;
}
