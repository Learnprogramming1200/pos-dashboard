import React from 'react';

export interface SalesData {
  name: string;
  sales: number;
  purchase: number;
}

export interface CategoryData {
  name: string;
  value: number;
  color: string;
}

export interface OrderData {
  name: string;
  orders: number;
}

export interface SummaryCard {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}

export interface TopSellingProduct {
  name: string;
  price: string;
  sales: string;
  trend: string;
  image: string;
  trendIcon: React.ReactNode;
}

export interface LowStockProduct {
  name: string;
  id: string;
  stock: string;
  image: string;
}

export interface RecentSale {
  name: string;
  category: string;
  price: string;
  date: string;
  status: string;
  image: string;
}

export interface TopCustomer {
  name: string;
  totalSpent: string;
  orders: number;
  image: string;
}

export interface RecentlyAddedProduct {
  name: string;
  category: string;
  price: string;
  date: string;
  image: string;
}

export interface ExpiredProduct {
  name: string;
  expiryDate: string;
  quantity: number;
  image: string;
}

export interface RecentTransaction {
  id: string;
  customer: string;
  amount: string;
  status: string;
  date: string;
  image: string;
}

export interface PurchaseTransaction {
  id: string;
  supplier: string;
  amount: string;
  status: string;
  date: string;
}

export interface CardStat {
  title: string;
  key: 'total' | 'active' | 'inactive' | 'recent';
  color: string;
  icon: React.ReactNode;
}

export interface DashboardStats {
  // Main statistics
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  totalPlans: number;
  activePlans: number;
  inactivePlans: number;
  totalSubscriptions: number;
  activeSubscriptions: number;
  inactiveSubscriptions: number;
  expiringSoon: number;
  
  // Revenue data
  monthlyRevenue: {
    currentMonth: number;
    previousMonth: number;
    percentageChange: number;
  };
  
  // Plan-wise subscriptions
  planWiseSubscriptions: Array<{
    planName: string;
    revenue: number;
    planId: string;
    totalSubscriptions: number;
    activeSubscriptions: number;
    inactiveSubscriptions: number;
  }>;
  
  // Subscription trends
  subscriptionTrends: Array<{
    month: string;
    newSubscriptions: number;
    renewals: number;
  }>;
  
  // Recent activity
  recentActivity: Array<{
    type: string;
    user: string;
    email: string;
    plan: string;
    amount: number;
    date: string;
    status: string;
  }>;
  
  // Additional metrics
  renewalsThisMonth: number;
  newSubscriptionsThisMonth: number;
  totalRevenueThisYearAgg: Array<{
    revenue: number;
    year: number;
    month: number;
  }>;
  newUsersThisWeek: number;
  newSubscriptionsThisWeek: number;
} 