"use client";
/**
 * Lazy Exports for Admin Components
 * 
 * This file provides dynamic imports for admin components to enable code splitting.
 * Import from this file instead of the index barrel to avoid loading all components.
 * 
 * Usage:
 *   import { LazyProducts, LazyStockAdjustments } from '@/components/admin/lazy-exports';
 */

import dynamic from "next/dynamic";

// Loading skeleton for lazy components
const LoadingFallback = () => (
    <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-500">Loading...</p>
        </div>
    </div>
);

// ============================================================================
// Dashboard Components
// ============================================================================
export const LazyAdminDashboard = dynamic(
    () => import("./dashboard"),
    { loading: LoadingFallback, ssr: false }
);

// ============================================================================
// Inventory Components
// ============================================================================
export const LazyProducts = dynamic(
    () => import("./inventory/products"),
    { loading: LoadingFallback }
);

export const LazyCategory = dynamic(
    () => import("./inventory/category"),
    { loading: LoadingFallback }
);

export const LazySubcategory = dynamic(
    () => import("./inventory/subcategory"),
    { loading: LoadingFallback }
);

export const LazyBrands = dynamic(
    () => import("./inventory/brand"),
    { loading: LoadingFallback }
);

export const LazyUnits = dynamic(
    () => import("./inventory/unit"),
    { loading: LoadingFallback }
);

export const LazyVariations = dynamic(
    () => import("./inventory/variant"),
    { loading: LoadingFallback }
);

export const LazyWarranty = dynamic(
    () => import("./inventory/warranty"),
    { loading: LoadingFallback }
);

export const LazyLowStock = dynamic(
    () => import("./inventory/low-stock"),
    { loading: LoadingFallback }
);

export const LazyExpiredStock = dynamic(
    () => import("./inventory/expired-stock"),
    { loading: LoadingFallback }
);

export const LazyPrintLabels = dynamic(
    () => import("./inventory/print-labels"),
    { loading: LoadingFallback }
);

// ============================================================================
// Stock Components
// ============================================================================
export const LazyStockAdjustments = dynamic(
    () => import("./stock/StockAdjustments"),
    { loading: LoadingFallback }
);

export const LazyStockTransfers = dynamic(
    () => import("./stock/StockTransfers"),
    { loading: LoadingFallback }
);

// ============================================================================
// HRM Components
// ============================================================================
export const LazyStaffManagement = dynamic(
    () => import("./hrm/StaffManagement"),
    { loading: LoadingFallback }
);

export const LazyAttendance = dynamic(
    () => import("./hrm/Attendance"),
    { loading: LoadingFallback }
);

export const LazyLeaveManagement = dynamic(
    () => import("./hrm/LeaveManagement"),
    { loading: LoadingFallback }
);

export const LazyLeaveTypeManagement = dynamic(
    () => import("./hrm/LeaveTypeManagement"),
    { loading: LoadingFallback }
);

export const LazyHolidayManagement = dynamic(
    () => import("./hrm/HolidayManagement"),
    { loading: LoadingFallback }
);

export const LazyShiftManagement = dynamic(
    () => import("./hrm/ShiftManagement"),
    { loading: LoadingFallback }
);

export const LazyPayrollManagement = dynamic(
    () => import("./hrm/PayrollManagement"),
    { loading: LoadingFallback }
);

export const LazyShiftCalendar = dynamic(
    () => import("./shift-calendar"),
    { loading: LoadingFallback, ssr: false }
);

// ============================================================================
// Finance Components
// ============================================================================
export const LazyTaxManagement = dynamic(
    () => import("./finance/TaxManagement"),
    { loading: LoadingFallback }
);

export const LazyExpenseManagement = dynamic(
    () => import("./finance/ExpenseManagement"),
    { loading: LoadingFallback }
);

export const LazyExpenseCategory = dynamic(
    () => import("./finance/ExpenseCategoryManagement"),
    { loading: LoadingFallback }
);

// ============================================================================
// Purchase Components
// ============================================================================
export const LazyPurchaseOrderManagement = dynamic(
    () => import("./purchase/PurchaseOrderManagement"),
    { loading: LoadingFallback }
);

export const LazyPurchaseReturn = dynamic(
    () => import("./purchase/PurchaseReturnManagement"),
    { loading: LoadingFallback }
);

export const LazySupplierManagement = dynamic(
    () => import("./purchase/SupplierManagement"),
    { loading: LoadingFallback }
);

// ============================================================================
// Sales Components
// ============================================================================
export const LazySalesManagement = dynamic(
    () => import("./sales/SalesManagement"),
    { loading: LoadingFallback }
);

export const LazySalesReturnManagement = dynamic(
    () => import("./sales/SalesReturnManagement"),
    { loading: LoadingFallback }
);

// ============================================================================
// Promo Components
// ============================================================================
export const LazyCouponManagement = dynamic(
    () => import("./promo/CouponManagement"),
    { loading: LoadingFallback }
);

export const LazyGiftCardConfig = dynamic(
    () => import("./promo/GiftCardConfig"),
    { loading: LoadingFallback }
);

export const LazyLoyaltyPointsConfig = dynamic(
    () => import("./promo/LoyaltyPointsConfig"),
    { loading: LoadingFallback }
);

export const LazyLoyaltyPointsHistory = dynamic(
    () => import("./promo/LoyaltyPointsHistory"),
    { loading: LoadingFallback }
);

export const LazyGiftCardHistory = dynamic(
    () => import("./promo/GiftCardHistory"),
    { loading: LoadingFallback }
);

// ============================================================================
// People Components
// ============================================================================
export const LazyCustomerManagement = dynamic(
    () => import("./people/CustomerManagement"),
    { loading: LoadingFallback }
);

// ============================================================================
// Report Components (Heavy - always lazy load with ssr: false)
// ============================================================================
export const LazySalesReport = dynamic(
    () => import("./reports/SalesReport"),
    { loading: LoadingFallback, ssr: false }
);

export const LazyPurchaseReport = dynamic(
    () => import("./reports/PurchaseReport"),
    { loading: LoadingFallback, ssr: false }
);

export const LazyExpensesReport = dynamic(
    () => import("./reports/ExpensesReport"),
    { loading: LoadingFallback, ssr: false }
);

export const LazyAnnualReport = dynamic(
    () => import("./reports/AnnualReport"),
    { loading: LoadingFallback, ssr: false }
);

export const LazyProfitLossReport = dynamic(
    () => import("./reports/ProfitLossReport"),
    { loading: LoadingFallback, ssr: false }
);

export const LazyTaxReport = dynamic(
    () => import("./reports/TaxReport"),
    { loading: LoadingFallback, ssr: false }
);

export const LazyPayrollReport = dynamic(
    () => import("./reports/PayrollReport"),
    { loading: LoadingFallback, ssr: false }
);

export const LazyTransactionReport = dynamic(
    () => import("./reports/TransactionReport"),
    { loading: LoadingFallback, ssr: false }
);

export const LazyUserLoginReport = dynamic(
    () => import("./reports/UserLoginReport"),
    { loading: LoadingFallback, ssr: false }
);

export const LazyUserActivityReport = dynamic(
    () => import("./reports/UserActivityReport"),
    { loading: LoadingFallback, ssr: false }
);

export const LazyDailyCashierReport = dynamic(
    () => import("./reports/DailyCashierReport"),
    { loading: LoadingFallback, ssr: false }
);

export const LazyStockHistoryReport = dynamic(
    () => import("./reports/StockHistoryReport"),
    { loading: LoadingFallback, ssr: false }
);

export const LazyCustomerReport = dynamic(
    () => import("./reports/CustomerReport"),
    { loading: LoadingFallback, ssr: false }
);

// ============================================================================
// Barcode Components (Heavy)
// ============================================================================
export const LazyBarcodeGenerator = dynamic(
    () => import("./BarcodeGenerator"),
    { loading: LoadingFallback, ssr: false }
);

export const LazyBulkBarcodeGenerator = dynamic(
    () => import("./BulkBarcodeGenerator"),
    { loading: LoadingFallback, ssr: false }
);

export const LazyEnhancedBarcodeGenerator = dynamic(
    () => import("./EnhancedBarcodeGenerator"),
    { loading: LoadingFallback, ssr: false }
);
