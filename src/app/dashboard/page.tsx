"use client";

import dynamic from "next/dynamic";
import { PageGuard } from "@/components/guards/page-guard";
import { useAuthStore } from "@/stores/auth-store";

// Loading component for dashboard
const DashboardSkeleton = () => (
    <div className="space-y-4 sm:space-y-6 pb-10 animate-pulse">
        {/* Header skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
                <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-4 w-96 bg-gray-200 dark:bg-gray-700 rounded mt-2" />
            </div>
            <div className="flex gap-4">
                <div className="h-12 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-12 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
        </div>
        {/* Cards skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg" />
            ))}
        </div>
        {/* Charts skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg" />
            <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg" />
        </div>
    </div>
);

// Dynamic imports with SSR disabled for chart-heavy components
const AdminDashboard = dynamic(
    () => import("@/components/admin/dashboard"),
    { loading: () => <DashboardSkeleton />, ssr: false }
);

const CashierDashboard = dynamic(
    () => import("@/components/cashier/dashboard"),
    { loading: () => <DashboardSkeleton />, ssr: false }
);

const ManagerDashboard = dynamic(
    () => import("@/components/manager/dashboard"),
    { loading: () => <DashboardSkeleton />, ssr: false }
);

export default function DashboardPage() {
    const { role } = useAuthStore();

    const DashboardComponent =
        role === "cashier"
            ? CashierDashboard
            : role === "manager"
                ? ManagerDashboard
                : AdminDashboard;

    return (
        <PageGuard permissionKey="dashboard">
            <DashboardComponent />
        </PageGuard>
    );
}
