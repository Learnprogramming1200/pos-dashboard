export interface StoreOption { 
  id: string; 
  name: string; 
}

export interface CategoryOption { 
  id: string; 
  name: string; 
}

export interface SubcategoryOption { 
  id: string; 
  name: string; 
  categoryId: string; 
}

export interface ProductOption { 
  id: string; 
  name: string; 
  sku?: string; 
  currentQty: number; 
  categoryId: string; 
  subcategoryId?: string; 
  companyName?: string; 
  variants?: string[]; 
  variantData?: any[]; 
  variantStocks?: any[]; 
  rawData?: any 
}
