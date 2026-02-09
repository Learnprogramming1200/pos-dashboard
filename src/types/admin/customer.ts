
export interface Customer {
  _id: string;
  id?: string;
  code?: string;
  customerCode?: string;
  customerName: string;
  gender?: "Male" | "Female" | "Other";
  phone: string;
  email: string;
  type?: "Admin" | "Cashier";
  address?:
  | string
  | {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    pincode?: string;
  };
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  status?: boolean;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  fullName?: string;
  fullAddress?: string;
  [key: string]: any;
}


// Customer form data type for form submission
export interface CustomerFormData {
  customerCode?: string;
  customerName: string;
  gender: GenderType;
  phone: string;
  email: string;
  address: AddressObject;
  isActive: boolean;
}

// Customer form props
export interface CustomerFormProps {
  onSubmit: (data: CustomerFormData) => void;
  customer?: Customer;
  nextCode?: string;
  existingCustomers?: Customer[];
}

// Customer details modal props
export interface CustomerDetailsModalProps {
  customer: Customer;
  onClose: () => void;
}

// Customer response types
export interface CustomerResponse {
  message: string;
  data: {
    data: Customer;
  };
}

export interface CustomersResponse {
  message: string;
  data: {
    data: Customer[];
    pagination?: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
}

// Type aliases
export type GenderType = "Male" | "Female" | "Other";

// Type guard for address object
export type AddressObject = {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
};