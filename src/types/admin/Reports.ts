// Report Types for Admin Reports

export interface ProfitLossReport {
  id: string;
  date: string;
  sales: number;
  purchaseReturn: number;
  purchase: number;
  expenses: number;
  salesReturn: number;
  netProfit: number;
  storeId: string;
  storeName: string;
}

export interface SalesReport {
  id?: string;
  _id?: string;
  code?: string; // Mapped from sku
  sku?: string;
  productName: string;
  category: string;
  soldQty: number; // Mapped from qty
  qty?: number;
  salesAmount: number; // Mapped from netAmount or amount
  amount?: number;
  netAmount?: number;
  availableStockQty: number; // Mapped from availableQty
  availableQty?: number;
  paymentMethod: string;
  paymentStatus?: string;
  date: string; // Mapped from saleDate
  saleDate?: string;
  invoiceNumber?: string;
  storeId: string;
  storeName: string;
}

export interface Store {
  _id: string;
  name: string;
}

export interface Category {
  _id: string;
  categoryName: string;
}

export interface Product {
  _id: string;
  productName: string;
  hasVariation?: boolean;
  variantData?: {
    variantValues: {
      value: string;
    }[];
  }[];
  category: {
    _id: string;
    categoryName: string;
  };
}


export interface PurchaseReport {
  _id: string;
  status: string;
  purchaseQty: number;
  unitPrice: number;
  purchaseAmount: number;
  poNumber: string;
  purchaseDate: string;
  storeName: string;
  storeId: string;
  productName: string;
  productId: string;
  categoryId: string;
  variantName?: string | null;
  variantId?: string | null;
  supplierName: string;
}

export interface PurchaseReportSummary {
  totalPurchaseQty: number;
  totalUnitPrice: number;
  totalPurchaseAmount: number;
}

export interface PurchaseReportPagination {
  page: number;
  limit: number;
  totalRecords: number;
  totalPages: number;
}

export interface ExpensesReport {
  _id?: string;
  expenseName: string;
  expenseCategory: string;
  description: string;
  amount: number;
  approvedDate: string;
  status: string;
  expenseBy: string;
  store: string;
}

export interface ExpensesReportSummary {
  _id: string | null;
  totalAmount: number;
  totalExpenses: number;
}

export interface ExpensesCategoryBreakdown {
  _id: string;
  categoryName: string;
  totalAmount: number;
  count: number;
}

export interface TransactionReport {
  id: string;
  date: string;
  transactionId: string;
  productName: string;
  soldQty: number;
  amount: number;
  discount: number;
  loyaltyAmount: number;
  taxes: number;
  totalAmount: number;
  paymentMethod: string;
  soldBy: string;
  storeId: string;
  storeName: string;
}

export interface TaxReport {
  id: string;
  date: string;
  taxName: string;
  taxType: string;
  taxRate: number;
  taxableAmount: number;
  taxAmount: number;
  storeId: string;
  storeName: string;
}

export interface SalesTaxReport {
  id: string;
  date: string;
  invoiceNo: string;
  items: string; // Product × quantity
  taxableValue: number; // Sale amount (excl. tax)
  taxType: 'Inclusive' | 'Exclusive' | 'NA';
  taxRate: number; // %
  taxAmount: number; // Tax collected
  saleType: 'Taxable' | 'Non-Taxable';
  totalAmount: number; // Incl. tax
  storeId: string;
  storeName: string;
}

export interface PurchaseTaxReport {
  id: string;
  date: string;
  supplier: string; // Supplier name
  supplierNo: string; // GSTIN / VAT No. / Vendor ID
  invoiceNo: string; // Supplier invoice
  items: string; // Product × quantity
  taxableValue: number; // Purchase amount (excl. tax)
  taxType: 'Inclusive' | 'Exclusive' | 'Reverse' | 'NA';
  taxRate: number; // %
  taxAmount: number; // Total tax
  purchaseType: 'Taxable' | 'Non-Taxable';
  totalAmount: number; // Incl. tax
  storeId: string;
  storeName: string;
}

export interface MonthlyTaxSummary {
  id: string;
  period: string; // Month / Year (e.g., "January 2024")
  month: string;
  year: number;
  totalSalesValue: number;
  outputTaxCollected: number; // Tax collected from customers
  totalPurchaseValue: number;
  inputTaxPaid: number; // Tax paid on purchases
  reverseTaxPaid: number; // Tax paid under reverse charge
  netTaxPayable: number; // Output − (Input + Reverse)
  taxStatus: 'Payable' | 'Refund';
  generatedOn: string; // Report date
  storeId: string;
  storeName: string;
}

export interface AnnualTaxSummary {
  id: string;
  financialYear: string; // e.g., "2024–25"
  year: number;
  totalOutputTax: number; // Yearly sales tax
  totalInputTax: number; // Yearly purchase tax
  totalReverseTax: number; // Yearly RCM
  netTaxPaid: number; // Final paid amount
  avgMonthlyTax: number; // Net ÷ 12
  storeId: string;
  storeName: string;
}

export type TaxReportData = SalesTaxReport | PurchaseTaxReport | MonthlyTaxSummary | AnnualTaxSummary;

export interface PayrollReport {
  id: string;
  staffName: string;
  storeName: string;
  fixedSalary: number;
  totalWorkingDays: number;
  presentDays: number;
  totalPayableAmount: number;
  payout: 'Pending' | 'Paid' | 'Failed';
  month: string;
  year: number;
  bankAccount: string;
}

export interface UserLoginReport {
  id: string; // Add if needed, or map 'user' + 'loginTime' or index as fallback ID in component if unique ID missing
  user: string; // Changed from username
  role: string;
  loginTime: string;
  logoutTime: string | null;
  duration: string;
  macAddress: string;
  ipAddress: string;
  device: string; // Changed from macAddress
  storeId?: string; // Optional if missing
  storeName?: string; // Optional if missing
  store?: string;
}

export interface UserActivityReport {
  id: string;
  username: string;
  menuName: string;
  loginTime: string;
  logoutTime: string;
  storeId: string;
  storeName: string;
}

export interface UserLoginReportSummary {
  totalLogins: number;
  activeLogins: number;
  averageSessionDuration: string;
}

export interface DailyCashierReport {
  id: string;
  date: string;
  staffName: string;
  posId: string;
  counterId?: string; // Keep for backward compatibility
  totalBills: number;
  netSales: number;
  amountReceived: number;
  changeGiven: number;
  cashInHand: number;
  storeId: string;
  storeName: string;
}

export interface AnnualReport {
  id: string;
  month: string;
  year: number;
  storeId: string;
  storeName: string;
  totalSales: number;
  totalPurchases: number;
  totalExpenses: number;
  netProfit: number;
  growthPercentage: number;
}

export interface StockHistoryReport {
  id: string;
  date: string;
  storeName: string;
  productName: string;
  category: string;
  subCategory?: string; // Optional subcategory
  method: 'Add Stock' | 'Adjustment' | 'Transfer' | 'Return' | 'Expiry';
  stockBefore: number;
  stockAfter: number;
  handledBy: string;
  variantName?: string; // Optional variant name - shows when product has variants
  storeId: string;
}

export interface CustomerReport {
  id: string;
  customerCode: string;
  customerName: string;
  email: string;
  phone: string;
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  lastPurchaseDate: string;
  firstPurchaseDate: string;
  daysSinceLastPurchase: number;
  loyaltyPoints: number;
  totalReturns: number;
  returnAmount: number;
  preferredPaymentMethod: string;
  city?: string;
  state?: string;
  country?: string;
  gender?: string;
}

// Filter types
export interface ReportFilters {
  storeId?: string;
  productId?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  paymentMethod?: string;
  category?: string;
}

// Export types
export interface ExportOptions {
  format: 'csv' | 'excel' | 'pdf';
  filename: string;
  includeFilters?: boolean;
}
