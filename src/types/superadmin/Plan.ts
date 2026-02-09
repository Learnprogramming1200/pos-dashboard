import type { Tax } from './Tax';

export type Plan = {
  // Basic Information
  _id: string;
  name: string;
  description?: string;
  type?: "monthly" | "yearly" | "daily" | "weekly";
  duration: string;
  status: boolean;

  // Pricing & Discount
  price: number;
  discountType?: "fixed" | "percentage" | null;
  discount?: number | null;
  totalPrice?: number; // Total price after discount and tax

  // Limits & Features
  storeLimit: number;
  staffLimit: number;
  userLimit?: number;
  screens: string[]; // Array of screen names or ObjectIds
  modules: string[];

  // Tax & Currency
  taxes?: string[] | Tax[] | null; // Optional: Array of ObjectId strings or populated Tax objects or null
  taxesIds?: string[]; // Tax ID field for easier access in edit form
  currencyId?: string | null;
  formattedPrice?: string | null;
  currency?: {
    symbol: string;
    code: string;
    position: string;
  } | null;

  // Plan Category
  planCategory?: "paid" | "free";
  isTrial?: boolean;

  // Timestamps
  createdAt?: string;
  updatedAt?: string;
  __v?: number;

  // Legacy display fields for UI compatibility
  Plan_Name?: string;
  Plan_Type?: string;
  Total_Stores?: string;
  Price?: string;
  Created_Date?: string;
  Status?: string;
  Plan_Position?: string;
  Discount_Type?: string;
  Discount?: string;
  Staff?: number | string;
  Pos_Screen?: string;
  Modules?: string[];
  Is_Recommended?: boolean;
  Description?: string;
};

export interface PlanFormData {
  name: string;
  type: "monthly" | "yearly" | "daily" | "weekly";
  price: number;
  duration: string;
  storeLimit: number;
  staffLimit: number;
  screens: string[];
  modules: string[];
  description: string;
  status: boolean;
  taxes?: string[];
  planCategory?: "paid" | "free";
  isTrial?: boolean;
  discountType?: "fixed" | "percentage";
  discount?: number;
  totalPrice?: number;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNext: boolean;
  hasPrev: boolean;
}


