// ============================================================================
// Supporting Types
// ============================================================================

export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  roleId: number;
  status?: string;
  profilePicture: string | null;
}

export interface Currency {
  _id: string;
  currencySymbol: string;
  currencyCode: string;
  currencyPosition: string;
  thousandSeparator: string;
  decimalSeparator: string;
  numberOfDecimals: number;
}

// ============================================================================
// Legacy Types (for backward compatibility)
// ============================================================================

// Legacy Plan type used in activePlans, pendingPlan fields
export interface Plan {
  _id: string;
  name: string;
  price: number;
  storeLimit: number;
  staffLimit: number;
  status: boolean;
  tax: string;
  themes: string[];
  description: string;
  duration: string;
  modules: string[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

// Legacy Tax type used in activePlanTaxes, pendingPlanTaxes fields
export interface Tax {
  _id: string;
  name: string;
  type: "Fixed" | "Percentage";
  value: number;
  status: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

// ============================================================================
// Core Subscription Types
// ============================================================================

export interface PlanObject {
  _id: string;
  name: string;
  type: string;
  price: number;
  discount?: number;
  discountType?: string;
  currencyId: string;
  storeLimit: number;
  staffLimit: number;
  status: boolean;
  isTrial: boolean;
  tax?: Tax;
  themes: string[];
  description: string;
  duration: number;
  modules: string[];
  totalPrice?: number;
  isDeleted: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface ActiveSubscription {
  _id: string;
  purchaseDate: string;
  planName: PlanObject;
  duration: number;
  amount: number;
  totalAmount: number;
  user: User;
  status: boolean;
  expiryDate: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  currency?: Currency;
  currencyId?: Currency;
}

export interface PendingSubscription {
  _id: string;
  purchaseDate: string;
  planName: PlanObject;
  duration: number;
  amount: number;
  totalAmount: number;
  user: User;
  status: boolean;
  expiryDate: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  currency?: Currency;
  currencyId?: Currency;
}

export interface Subscription {
  _id: string;
  purchaseDate: string;
  planName: string;
  duration: string;
  amount: number;
  discount: number;
  totalAmount: number;
  user: string;
  status: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
  currencyId?: {
    _id: string;
    currencySymbol: string;
    currencyCode: string;
    currencyPosition: string;
    thousandSeparator: string;
    decimalSeparator: string;
    numberOfDecimals: number;
  };
}

export interface SubscriptionData {
  _id: string;
  activeSubscription: ActiveSubscription | null;
  pendingSubscription: PendingSubscription | null;
  // Legacy fields for backward compatibility
  activePlans?: Plan[];
  pendingPlan?: Plan[];
  user?: User;
  activePlanTaxes?: Tax[];
  pendingPlanTaxes?: Tax[];
  activeSubscriptions?: Subscription[];
  lastPending?: Subscription | null;
}

// ============================================================================
// Response and Form Types
// ============================================================================

export interface SubscriptionResponse {
  data: SubscriptionData[];
}

export interface SubscriptionFormData {
  purchaseDate: string; // Display format: DD-MM-YYYY, Submit format: YYYY-MM-DD
  planName: string; // Plan ID
  amount: string; // Input as string, converted to number on submit
  discount: string; // Input as string, converted to number on submit
  discountType: 'Fixed' | 'Percentage';
  status: 'Active' | 'Inactive';
  userId: string; // User ID
  selectTax?: string; // Tax ID, optional
  taxAmount?: number; // Calculated tax amount
  totalAmount?: number; // Calculated total amount
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNext: boolean;
  hasPrev: boolean;
}


export interface UseSubscriptionsReturn {
  subscriptions: Subscription[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  } | null;
}
export interface Summary{
  activeSubscription:number;
  expiredSubscription:number;
  expiringSoon:number;
  totalSubscription:number
}