// Types for Superadmin Dashboard

export interface ValueWithPercentage {
    value: number;
    percentageChange: number;
}

export interface MonthlyRevenue {
    currentMonth: number;
    previousMonth: number;
    currentMonthlyRevenue: ValueWithPercentage;
}

export interface PlanWiseSubscription {
    planName: string;
    revenue: number;
    planId: string;
    totalSubscriptions: number;
    activeSubscriptions: number;
    inactiveSubscriptions: number;
}

export interface SubscriptionTrend {
    month: string;
    newSubscriptions: number;
    renewals: number;
}

export interface RecentActivity {
    type: string;
    user: string;
    email: string;
    plan: string;
    amount: number;
    date: string;
    status: string;
}

export interface DashboardStats {
    totalUsers: number | ValueWithPercentage;
    activeUsers: number;
    inactiveUsers: number;
    totalPlans: number;
    activePlans: number;
    inactivePlans: number;
    totalSubscriptions: number | ValueWithPercentage;
    activeSubscriptions: number | ValueWithPercentage;
    inactiveSubscriptions: number;
    expiringSoon: number | ValueWithPercentage;
    monthlyRevenue: MonthlyRevenue;
    planWiseSubscriptions: PlanWiseSubscription[];
    subscriptionTrends: SubscriptionTrend[];
    recentActivity: RecentActivity[];
    renewalsThisMonth: number;
    newSubscriptionsThisMonth: number;
    totalRevenue: number;
    newUsersThisWeek: number;
    newSubscriptionsThisWeek: number;
    totalRevenueThisYearAgg?: Array<{
        revenue: number;
        year: number;
        month: number;
    }>;
}

// Type aliases for API response
export type PlanWiseSubscriptionsData = PlanWiseSubscription[];

export interface RevenueOverviewData {
    revenueByMonth: Array<{
        revenue: number;
        year: number;
        month: number;
    }>;
}

// Helper type to extract value from field that can be number or ValueWithPercentage
export type StatValue = number | ValueWithPercentage;

// Helper function type to get numeric value
export const getStatValue = (stat: StatValue): number => {
    return typeof stat === 'number' ? stat : stat.value;
};

// Helper function type to get percentage change
export const getStatPercentageChange = (stat: StatValue): number | null => {
    return typeof stat === 'number' ? null : stat.percentageChange;
};

