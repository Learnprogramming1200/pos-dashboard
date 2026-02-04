export type BusinessOwner = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  password?: string;
  businessName?: string;
  businessCategory?: string | { _id: string; categoryName: string };
  status?: "Active" | "Inactive" | "Pending";
  subscription_status?: "Active" | "Expired" | "Pending";
  subscription_plan?: string;
  subscription_start_date?: string;
  subscription_end_date?: string;
  payment_status?: "Paid" | "Pending" | "Failed";
  total_payments?: string;
  last_payment_date?: string;
  createdAt: string;
  updatedAt: string;
  roleId?: { _id: number; name: string } | number;
  role?: string;
  isAdmin?: boolean;
  isActive?: boolean;
  profilePicture?: string | null;
  gender?: string;
  id?: string;
  lastLoginAt?: string | null;
  // New fields from the actual response
  businesses?: Business[];
};

export type Business = {
  _id: string;
  businessName: string;
  businessCategoryId: {
    _id: string;
    categoryName: string;
    description: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
  owner: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
};

export interface BusinessOwnerFormData {
  name: string;
  email: string;
  phone: string;
  password: string;
  businessName?: string;
  businessCategory?: string;
  isActive?: boolean;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNext: boolean;
  hasPrev: boolean;
}