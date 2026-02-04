export interface Product {
  _id: string;
  productName: string;
  SKU: string;
  barcode?: string;
  barcodeUrl?: string;
  hasVariation: boolean;
  variantIds: string[];
  variantInventory?: ProductVariationItem[];
  category: string | { _id: string; categoryName: string };
  subCategory: string | { _id: string; subcategory: string };
  brand: string | { _id: string; brand: string };
  unit: string | { _id: string; unit: string };
  description: string;
  productImage: string;
  tax: string[];
  taxType?: string;
  taxValue?: number;
  taxPercent?: number;
  warrantyType: string | { _id: string; warranty: string; duration: number; period: string };
  warrantyDate: string;
  expiryDate: string;
  dimensions: string;
  weight: number;
  status: boolean;
  costPrice: number;
  sellingPrice: number;
  lowStockAlert?: number;
  stock: Array<{ storeId: string; quantity: number }>;
  storeQuantities?: Array<{ store: string | { _id: string; name: string }; quantity: number }>;
  discount?: number;
  variantData: ProductVariationItem[];
  variantStocks: Array<{ SKU: string; storeId: string; quantity: number }>;
  store: string | { _id: string; name: string };
  quantity: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductVariationItem {
  _id?: string;
  variantValue: string;
  SKU: string;
  quantity: number;
  costPrice: number;
  sellingPrice: number;
  tax?: string;
  image?: File | string | null;
  stock?: { store: { _id: string; name?: string } | string; quantity: number; _id?: string }[];
  variantId?: string;
  discount?: number;
  lowStockAlert?: number;
}

export interface ProductFormData {
  productImage?: File | string | null;
  stock?: Array<{ storeId: string; quantity: number }>;
  productName: string;
  description: string;
  category: string;
  subCategory: string;
  brand: string;
  unit: { unit: string; value: number };
  hasVariation: boolean;
  variantInventory?: ProductVariationItem[];
  productCostPrice?: number;
  productSellingPrice?: number;
  warrantyType: string;
  warrantyDate: string;
  expiryDate: string;
  tax: string[];
  productDiscount: number;
  productSKU: string;
  barcode: string;
  dimensions: string;
  status: boolean;
  lowStockAlert: number;
  variantId?: string;
  // New fields for variant structure
  variantIds?: string[];
  variantData?: VariantDataItem[];
  variantStocks?: VariantStockItem[];
}

export interface VariantDataItem {
  variantValues: Array<{ value: string; valueId: string }>;
  SKU: string;
  status: boolean;
  costPrice: number;
  sellingPrice: number;
  tax?: string;
  image?: File | string | null;
  discount?: number;
  lowStockAlert?: number;
}

export interface VariantStockItem {
  SKU: string;
  storeId: string;
  quantity: number;
}

export interface ProductCategory {
  _id: string;
  categoryName: string;
  description: string;
  business: string;
  hasExpiry?: boolean;
  hasWarranty?: boolean;
  isActive: boolean;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
  slug: string;
  __v: number;
}

export interface ProductSubCategory {
  _id: string;
  category: string | {
    _id: string;
    categoryName: string;
    business: {
      _id: string;
      businessName: string;
    };
  };
  subcategory: string;
  categorycode: string;
  description: string;
  subCategoryImage: string;
  status: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface ProductBrand {
  _id: string;
  brand: string;
  brandImage: string;
  status: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface ProductUnit {
  _id: string;
  unit: string;
  shortName: string;
  business: {
    _id: string;
    businessName: string;
  };
  status: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface ProductWarranty {
  _id: string;
  warranty: string;
  duration: number;
  period: string;
  description: string;
  status: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface ProductVariation {
  id?: string; // Server may return 'id' or '_id'
  _id?: string;
  variant: string;
  values: (string | { value: string; id: string })[];
  status: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface ProductLookupResult {
  product: Product | null;
  error: string | null;
  loading: boolean;
}


export interface ProductItem {
  id: string;
  productId: string;
  productName: string;
  variantId: string;
  variantName: string;
  hasVariation: boolean;
  variantData: any[];
  selectedVariantValue: string;
  quantity: string;
  price: string;
  taxRate: string;
  taxType?: 'Percentage' | 'Fixed' | 'None';
  originalQuantity?: number;
}
export interface CreateProductFormData {
  productName: string;
  description: string;
  category: string;
  subCategory: string;
  brand: string;
  unit: { unit: string; value: number };
  productSKU: string;
  barcode: string;
  status: boolean;
  hasVariation: boolean;
  stock: { storeId: string; quantity: number }[];
  productCostPrice: number;
  productSellingPrice: number;
  productDiscount: number;
  tax: string[];
  warrantyType: string;
  warrantyDate: string;
  expiryDate: string;
  dimensions: string;
  lowStockAlert: number;
  variantInventory: {
    _id?: string;
    variantValue: string;
    SKU: string;
    quantity: number;
    costPrice: number;
    sellingPrice: number;
    variantId: string;
    image: string | File | null;
    discount?: number;
    lowStockAlert?: number;
  }[];
}
