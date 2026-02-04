export interface ExpenseCategory {
  _id: string;
  name: string;
  description: string;
  status: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Expense {
  _id: string;
  // store?: string;
  categoryId: string;
  categoryName: string;
  category: {
    _id: string;
    name: string;
  };
  amount: number;
  store?: {
    _id: string;
    name: string;
  };
  description: string;
  expenseDate: string;
  paymentMethod: 'Cash' | 'Bank Transfer' | 'Credit Card' | 'Cheque' | 'Digital Wallet' | 'Other';
  reference: string;
  status: 'pending' | 'approved' | 'rejected';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  attachments?: string[];
  notes?: string;
  // Card payment fields
  cardNumber?: string;
  cardHolderName?: string;
  cardType?: 'Visa' | 'Mastercard' | 'American Express' | 'Other';
  expiryMonth?: string;
  expiryYear?: string;
  // Bank transfer fields
  bankName?: string;
  branchName?: string;
  accountNumber?: string;
  ifscCode?: string;
  // Cheque fields
  chequeNumber?: string;
  rejectionReason?: string
}

export interface ExpenseStats {
  totalExpenses: number;
  totalAmount: number;
  pendingExpenses: number;
  approvedExpenses: number;
  rejectedExpenses: number;
  monthlyExpenses: number;
  totalRevenue: number;
  netProfit: number;
  profitMargin: number;
  categoryBreakdown: Array<{
    categoryId: string;
    categoryName: string;
    amount: number;
    percentage: number;
  }>;
}

export interface StaffMember {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  store: {
    _id: string;
    name: string;
  };
  designation: string;
  joinDate: string;
  isActive: boolean;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
  updatedBy?: {
    _id: string;
    name: string;
    email: string;
  };
}

export interface ExpenseFormData {
  store?: string;
  staff?: string;
  categoryId: string;
  amount: number;
  description: string;
  expenseDate: string;
  paymentMethod: 'Cash' | 'Bank Transfer' | 'Credit Card' | 'Cheque' | 'Digital Wallet' | 'Other';
  reference: string;
  notes?: string;
  attachments?: string[];
  // Card payment fields
  cardNumber?: string;
  cardHolderName?: string;
  cardType?: 'Visa' | 'Mastercard' | 'American Express' | 'Other';
  expiryMonth?: string;
  expiryYear?: string;
  // Bank transfer fields
  bankName?: string;
  branchName?: string;
  accountNumber?: string;
  ifscCode?: string;
  // Cheque fields
  chequeNumber?: string;
}

export interface ExpenseCategoryFormData {
  name: string;
  description: string;
  status: boolean;
}

export interface FinancialMetrics {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  expenseRatio: number;
  monthlyRevenue: number;
  monthlyExpenses: number;
  monthlyProfit: number;
}

export interface ExpenseApprovalData {
  expenseId: string;
  status: 'Approved' | 'Rejected';
  approvedBy: string;
  approvedAt: string;
  notes?: string;
}
