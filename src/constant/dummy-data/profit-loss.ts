import type { ProfitLossReport } from "@/types/admin/Reports";

// Mock profit loss data - replace with API response when available
export const profitLossDataDummy: ProfitLossReport[] = [
  {
    id: "1",
    date: "2024-01-15",
    sales: 15000,
    purchaseReturn: 500,
    purchase: 8000,
    expenses: 2000,
    salesReturn: 300,
    netProfit: 7200,
    storeId: "1",
    storeName: "Main Store"
  },
  {
    id: "2",
    date: "2024-01-16",
    sales: 12000,
    purchaseReturn: 200,
    purchase: 7000,
    expenses: 1500,
    salesReturn: 100,
    netProfit: 3600,
    storeId: "1",
    storeName: "Main Store"
  },
  {
    id: "3",
    date: "2024-01-15",
    sales: 8000,
    purchaseReturn: 100,
    purchase: 5000,
    expenses: 1000,
    salesReturn: 50,
    netProfit: 2050,
    storeId: "2",
    storeName: "Branch Store"
  },
  {
    id: "4",
    date: "2025-01-15",
    sales: 18000,
    purchaseReturn: 600,
    purchase: 9000,
    expenses: 2500,
    salesReturn: 400,
    netProfit: 8100,
    storeId: "1",
    storeName: "Main Store"
  },
  {
    id: "5",
    date: "2025-01-20",
    sales: 10000,
    purchaseReturn: 150,
    purchase: 6000,
    expenses: 1200,
    salesReturn: 80,
    netProfit: 2930,
    storeId: "2",
    storeName: "Branch Store"
  }
];

