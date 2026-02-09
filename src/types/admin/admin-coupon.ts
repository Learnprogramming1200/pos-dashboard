export interface AdminCoupon {
  _id: string;
  code: string;
  description: string;
  start_date: string;
  end_date: string;
  type: 'Percentage' | 'Fixed';
  discount_amount: number;
  limit: number;
  status: boolean;
  usageCount: number;
  maxUsagePerUser: number;
  customerScope?: 'All' | 'Specific';
  assignedCustomerIds?: string[];
  options?: { sendEmail?: boolean };
  createdAt: string;
  updatedAt: string;
}

export interface AdminCouponFormData {
  code: string;
  description: string;
  start_date: string;
  end_date: string;
  type: 'Percentage' | 'Fixed';
  discount_amount: number;
  limit: number;
  maxUsagePerUser: number;
  customerScope?: 'All' | 'Specific';
  assignedCustomerIds?: string[];
  options?: { sendEmail?: boolean };
  status: boolean;
}

