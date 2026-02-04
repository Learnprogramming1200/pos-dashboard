export interface AdjustmentFormData {
  storeId: string;
  categoryId: string;
  subcategoryId?: string;
  productId: string;
  variant?: string;
  actualStock: number;
  reason?: string;
  currentQty?: number;
}

export interface TransferFormData {
  fromStoreId: string;
  toStoreId: string;
  categoryId: string;
  subCategoryId?: string;
  productId: string;
  variant?: string;
  SKU?: string;
  quantity: number;
  reason?: string;
  status: string;
}
