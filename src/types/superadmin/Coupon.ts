export interface Coupon {
  _id?: string; // API response field
  id: string; // mapped from _id
  code: string;
  description: string; // maps from description
  // API response fields (snake_case)
  start_date?: string
  end_date?: string;
  discount_amount?: number;
  usageCount?: number;
  // Internal fields (camelCase)
  startDate: string; // maps from start_date
  endDate: string; // maps from end_date
  discountAmount: number; // maps from discount_amount
  usedCount?: number; // maps from usageCount
  type: 'Percentage' | 'Fixed';
  limit: number;
  plans?: string[]; // plan ids from server
  status: boolean;
  maxUsagePerUser?: number;
  applicableFor?: string;
  minOrderAmount?: number;
  createdAt: string;
  updatedAt: string;
  isDeleted?: boolean;
  deletedAt?: string | null;
  __v?: number;
}

export interface CouponFormData {
  code: string;
  description: string;
  start_date: string;
  end_date: string;
  type: "Percentage" | "Fixed";
  discount_amount: number;
  limit: number;
  plans: string[];
  status: boolean;
  maxUsagePerUser?: number;
  applicableFor?: string;
  minOrderAmount?: number;
}

export interface CouponStats {
  totalCoupons: number;
  activeCoupons: number;
  inactiveCoupons: number;
  percentageCoupons: number;
  fixedCoupons: number;
  totalUsage: number;
  totalSavings: number;
  expiringSoon: number;
}


export interface CouponUsage {
  id: string;
  couponId: string;
  couponCode: string;
  userId: string;
  userName: string;
  orderId: string;
  discountAmount: number;
  usedAt: string;
}