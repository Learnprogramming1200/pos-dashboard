"use client";

import React from "react";
import Link from "next/link";
import { TrendingUp, ShoppingCart, ShoppingBag, Receipt, CreditCard, Calculator, Users, User, Activity, BarChart3, Calendar, Package, UserCircle } from "lucide-react";

const reports = [
  {
    title: "Profit & Loss Report",
    description: "View comprehensive profit and loss analysis with sales, purchases, and expenses",
    href: "/admin/reports/profit-loss",
    icon: TrendingUp,
    color: "bg-green-500",
  },
  {
    title: "Sales Report",
    description: "Detailed sales analysis with product information and performance metrics",
    href: "/admin/reports/sales",
    icon: ShoppingCart,
    color: "bg-blue-500",
  },
  {
    title: "Purchase Report",
    description: "Comprehensive purchase analysis and inventory tracking",
    href: "/admin/reports/purchase",
    icon: ShoppingBag,
    color: "bg-purple-500",
  },
  {
    title: "Expenses Report",
    description: "Track and analyze business expenses with approval status",
    href: "/admin/reports/expenses",
    icon: Receipt,
    color: "bg-red-500",
  },
  {
    title: "Transaction Report",
    description: "Complete transaction history with payment methods and staff performance",
    href: "/admin/reports/transactions",
    icon: CreditCard,
    color: "bg-indigo-500",
  },
  {
    title: "Tax Report",
    description: "Tax calculations and compliance tracking across all transactions",
    href: "/admin/reports/tax",
    icon: Calculator,
    color: "bg-orange-500",
  },
  {
    title: "Payroll Report",
    description: "Staff salary calculations and payout management with attendance tracking",
    href: "/admin/reports/payroll",
    icon: Users,
    color: "bg-pink-500",
  },
  {
    title: "User Login Report",
    description: "Track user login sessions and security information",
    href: "/admin/reports/user-login",
    icon: User,
    color: "bg-teal-500",
  },
  {
    title: "User Activity Report",
    description: "Monitor user activities and menu access patterns",
    href: "/admin/reports/user-activity",
    icon: Activity,
    color: "bg-cyan-500",
  },
  {
    title: "Daily Cashier Report",
    description: "Track daily cashier performance and transactions",
    href: "/admin/reports/daily-cashier",
    icon: Receipt,
    color: "bg-yellow-500",
  },
  {
    title: "Annual Report",
    description: "Comprehensive yearly financial overview and performance analysis",
    href: "/admin/reports/annual",
    icon: Calendar,
    color: "bg-indigo-500",
  },
  {
    title: "Stock History Report",
    description: "Track all stock movements and inventory transactions",
    href: "/admin/reports/stock-history",
    icon: Package,
    color: "bg-teal-500",
  },
  {
    title: "Customer Report",
    description: "Comprehensive customer analytics and purchase behavior insights",
    href: "/admin/reports/customer",
    icon: UserCircle,
    color: "bg-cyan-500",
  },
];

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reports</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Access comprehensive business reports and analytics
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <BarChart3 className="w-8 h-8 text-blue-600" />
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report) => {
          const IconComponent = report.icon;
          return (
            <Link
              key={report.href}
              href={report.href}
              className="group block p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200 hover:border-blue-300 dark:hover:border-blue-600"
            >
              <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-lg ${report.color} group-hover:scale-110 transition-transform duration-200`}>
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {report.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-2">
                    {report.description}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300">
                View Report
                <svg
                  className="ml-1 w-4 h-4 transform group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Stats */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Report Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <BarChart3 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Real-time Analytics</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">Live data updates</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Export Options</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">CSV, Excel, PDF</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Advanced Filters</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">Date, store, category</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
