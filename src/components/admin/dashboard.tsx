"use client";

import React from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import {
  Calendar,
  TrendingUp,
  TrendingDown,
  ArrowUpRight
} from "lucide-react";
import DateRangePicker from "@/components/ui/DateRangePicker";
import type { SummaryCard } from "@/types/Dashboard";
import { Constants } from "@/constant";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });
// Summary Card Component
type SummaryCardProps = Readonly<{
  title: string;
  value: string;
  iconSrc: string;
  iconBg: string;
  change?: string;
  iconAlt?: string;
}>;
function SummaryCard({
  title,
  value,
  iconSrc,
  iconBg,
  change,
  iconAlt,
}: SummaryCardProps) {
  return (
    <div className="bg-white dark:bg-[#333333] rounded-[6px] border-[#EBEBEB] dark:border-[#444444] mt-[12px]">
      <div className="flex flex-col px-4 py-4 sm:px-5 sm:py-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col">
            <p className="text-sm font-medium text-[#6C757D] dark:text-gray-300">{title}</p>
            <p className="text-[20px] font-bold text-[#1C1F34] dark:text-white leading-9">{value}</p>
          </div>
          <div className={`${iconBg} rounded-[6px] p-3`}>
            <Image src={iconSrc} alt={iconAlt ?? title} width={20} height={20} />
          </div>
        </div>
        {change && (
          <div className="pt-3">
            {change === "-" ? (
              <p className="text-sm font-regular text-[#6C757D] dark:text-gray-400">{change}</p>
            ) : (
              <p className="text-sm font-regular">
                <span className={
                  change.startsWith("+")
                    ? "text-[#1AC769] dark:text-green-400"
                    : change.startsWith("-")
                      ? "text-red-500 dark:text-red-400"
                      : "text-[#1AC769] dark:text-green-400"
                }>
                  {change.split(" From Last Month")[0]}
                </span>
                <span className="text-[#6C757D] dark:text-gray-400">
                  {change.includes("From Last Month") ? " From Last Month" : ""}
                </span>
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  // Helper function to format date to DD-MM-YYYY
  const formatDateToDDMMYYYY = (date: Date): string => {
    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yyyy = date.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  };

  // Initialize with last 30 days
  const getInitialDates = () => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    return {
      start: formatDateToDDMMYYYY(start),
      end: formatDateToDDMMYYYY(end),
    };
  };

  const [customDateRange, setCustomDateRange] = React.useState<{ start: string; end: string }>(getInitialDates());

  // State for dropdown values
  const [topSellingFilter, setTopSellingFilter] = React.useState("Today");
  const [purchaseSalesFilter, setPurchaseSalesFilter] = React.useState("2025");
  const [activeTransactionTab, setActiveTransactionTab] = React.useState("Sale");
  // Theme detection for charts
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === 'dark';

  return (
    <div className="space-y-4 sm:space-y-6 pb-10">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h4 className="text-textMain dark:text-white font-poppins font-semibold text-[28px] leading-9">Welcome to Admin Dashboard</h4>
          <p className="text-textSmall dark:text-textSmall font-interTight font-regular text-sm leading-6 pt-1">Manage your store operations, track sales, and monitor inventory</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-5">
          <Link href="/admin/store-management" className="bg-primary hover:bg-primaryHover text-white font-poppins font-semibold text-base leading-5 rounded-[4px] px-6 py-[14px]">
            Manage Stores
          </Link>
          <Link href="/admin/inventory/products" className="bg-dark hover:bg-gray-700 dark:bg-[#333333] dark:hover:bg-[#444444] text-white font-poppins font-semibold text-base leading-5 rounded-[4px] px-6 py-[14px]">
            View Products
          </Link>
        </div>
      </div>

      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-[30px]">
        <div>
          <h6 className="text-[#1C1F34] dark:text-white font-poppins font-semibold text-[20px] leading-[30px] tracking-[1%]">Insights</h6>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 opacity-0 pointer-events-auto">
              <DateRangePicker
                start={customDateRange.start}
                end={customDateRange.end}
                onChange={(next) => setCustomDateRange({ start: next.start, end: next.end })}
                placeholders={{ start: "DD-MM-YYYY", end: "DD-MM-YYYY" }}
              />
            </div>
            <button
              type="button"
              className="bg-[#F2F2F2] text-textSmall font-interTight font-regular text-[12px] leading-[22px] rounded-[6px] px-6 py-2 text-left"
              aria-label="Select date range"
            >
              {customDateRange.start} to {customDateRange.end}
            </button>
          </div>
          <button
            className="bg-primary text-white font-poppins font-semibold text-[14px] leading-[18px] capitalize rounded-[6px] px-6 py-[10px]"
          >
            Generate Report
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-3 sm:gap-4 mt-3">
        <SummaryCard
          title="Total Sales"
          value={Constants.dashboardConstants.summaryCards[0]?.value || "0"}
          iconSrc={Constants.assetsIcon.assets.totalRevenue.src}
          iconBg="bg-[#EFF6FE]"
          change="+12.5% From Last Month"
        />
        <SummaryCard
          title="Total Purchase"
          value={Constants.dashboardConstants.summaryCards[1]?.value || "0"}
          iconSrc={Constants.assetsIcon.assets.monthlyRevenue.src}
          iconBg="bg-[#F0FDF4]"
          change="+8.2% From Last Month"
        />
        <SummaryCard
          title="Orders"
          value={Constants.dashboardConstants.summaryCards[2]?.value || "0"}
          iconSrc={Constants.assetsIcon.assets.crown1.src}
          iconBg="bg-[#FAF5FF]"
          change="+15.3% From Last Month"
        />
        <SummaryCard
          title="Customers"
          value={Constants.dashboardConstants.summaryCards[3]?.value || "0"}
          iconSrc={Constants.assetsIcon.assets.users.src}
          iconBg="bg-[#FFF7ED]"
          change="+5.7% From Last Month"
        />
        <SummaryCard
          title="Sales Return"
          value={Constants.dashboardConstants.summaryCards[4]?.value || "0"}
          iconSrc={Constants.assetsIcon.assets.listChecks.src}
          iconBg="bg-[#EEF2FF]"
          change="+6.8% From Last Month"
        />
        <SummaryCard
          title="Purchase Return"
          value={Constants.dashboardConstants.summaryCards[5]?.value || "0"}
          iconSrc={Constants.assetsIcon.assets.calender.src}
          iconBg="bg-[#FDF4FF]"
          change="-2.1% From Last Month"
        />
        <SummaryCard
          title="Expense"
          value={Constants.dashboardConstants.summaryCards[6]?.value || "0"}
          iconSrc={Constants.assetsIcon.assets.crown2.src}
          iconBg="bg-[#FEF3F2]"
          change="-1.5% From Last Month"
        />
        <SummaryCard
          title="Profit"
          value={Constants.dashboardConstants.summaryCards[7]?.value || "0"}
          iconSrc={Constants.assetsIcon.assets.expiringSoon.src}
          iconBg="bg-[#FDF0F4]"
          change="+3.2% From Last Month"
        />
      </div>

      {/* Lists Section - Reorganized */}
      {/* Row 1: Top Selling Products, Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Top Selling Products */}
        <div className="lg:col-span-1">
          <div className="h-full px-10 py-10 bg-white dark:bg-[#333333] rounded-[6px] border-[0.5px] border-[#EBEBEB] dark:border-[#444444]">
            <div className="pb-6 border-b-[1.5px] border-[#D8D9D9] dark:border-textSmall flex items-center justify-between">
              <h2 className="text-textMain dark:text-white font-poppins font-semibold text-[22px] leading-8">Top Selling Products</h2>
              <div className="relative group">
                <button className="flex items-center gap-2 px-3 py-1.5 bg-[#F2F9FF] text-base text-textSmall font-interTight font-regular rounded-[25px] hover:bg-gray-50">
                  <Calendar size={16} />
                  <span>{topSellingFilter}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="absolute top-full right-0 mt-1 w-28 bg-white border border-gray-200 shadow-lg rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="py-1">
                    <button
                      onClick={() => setTopSellingFilter("Today")}
                      className="w-full text-left px-3 py-2 text-textSmall font-interTight font-regular hover:bg-gray-100 transition-colors"
                    >
                      Today
                    </button>
                    <button
                      onClick={() => setTopSellingFilter("Weekly")}
                      className="w-full text-left px-3 py-2 text-textSmall font-interTight font-regular hover:bg-gray-100 transition-colors"
                    >
                      Weekly
                    </button>
                    <button
                      onClick={() => setTopSellingFilter("Monthly")}
                      className="w-full text-left px-3 py-2 text-textSmall font-interTight font-regular hover:bg-gray-100 transition-colors"
                    >
                      Monthly
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2">
              {Constants.dashboardConstants.topSellingProducts.map((product, index) => {
                const isPositive = product.trend.startsWith('+');
                const trendValue = product.trend.replace(/[+%-]/g, '');
                const productId = `${product.name}-${product.price}-${product.sales}`.replace(/\s+/g, '-').toLowerCase();
                return (
                  <div key={productId} className={`p-4 flex items-center gap-4 ${index < Constants.dashboardConstants.topSellingProducts.length - 1 ? 'border-b border-[#D8D9D9] dark:border-textSmall' : ''}`}>
                    <div className="w-12 h-12 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      <Image
                        src={product.image}
                        alt={product.name}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover rounded-md"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-textMain dark:text-white font-poppins font-semibold text-[16px] leading-[30px] tracking-[1%]">{product.name}</h3>
                      <p className="text-textSmall font-interTight font-normal text-sm">{product.sales}</p>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <p className="text-textMain dark:text-white font-poppins font-semibold text-base">{product.price}</p>
                      <div className={`flex items-center justify-end gap-1 mt-0.5 text-sm font-normal ${isPositive ? 'text-[#3CAE5C]' : 'text-[#F4462C]'
                        }`}>
                        {isPositive ? (
                          <TrendingUp size={12} />
                        ) : (
                          <TrendingDown size={12} />
                        )}
                        <span>{trendValue}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Low Stock Products */}
        <div className="lg:col-span-1">
          <div className="h-full px-10 py-10 bg-white dark:bg-[#333333] rounded-[6px] border-[0.5px] border-[#EBEBEB] dark:border-[#444444]">
            <div className="pb-6 border-b-[1.5px] border-[#D8D9D9] dark:border-textSmall flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-textMain dark:text-white font-poppins font-semibold text-[22px] leading-8">Low Stock Products</h2>
              </div>
            </div>

            <div className="pt-2">
              {Constants.dashboardConstants.lowStockProducts.map((product, index) => {
                const productId = `${product.name}-${product.id}-${product.stock}`.replace(/\s+/g, '-').toLowerCase();
                return (
                  <div key={productId} className={`p-4 flex items-center gap-4 ${index < Constants.dashboardConstants.lowStockProducts.length - 1 ? 'border-b border-[#D8D9D9] dark:border-textSmall' : ''}`}>
                    <div className="w-12 h-12 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      <Image
                        src={product.image}
                        alt={product.name}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover rounded-md"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-textMain dark:text-white font-poppins font-semibold text-[16px] leading-[30px] tracking-[1%]">{product.name}</h3>
                      <p className="text-textSmall font-interTight font-normal text-sm mt-0.5">ID: {product.id}</p>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <p className="text-textSmall dark:text-white font-interTight font-normal text-xs mb-1">In Stock</p>
                      <p className="text-[#F4462C] font-interTight font-semibold text-sm">{product.stock}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Recent Transactions, Expired Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Recent Transactions */}
        <div className="lg:col-span-1">
          <div className="h-full px-10 py-10 bg-white dark:bg-[#333333] rounded-[6px] border-[0.5px] border-[#EBEBEB] dark:border-[#444444]">
            <div className="pb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-textMain dark:text-white font-poppins font-semibold text-[22px] leading-8">Recent Transactions</h2>
              </div>
              <Link href="#" className="flex items-center gap-2 px-3 py-1.5 bg-[#F2F9FF] text-base text-textSmall font-interTight font-regular rounded-[25px] hover:bg-gray-50">
                View All
                <ArrowUpRight size={16} />
              </Link>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-textSmall">
              <div className="flex gap-4 -mb-px overflow-x-auto">
                {["Sale", "Purchase", "Quotation", "Expenses", "Invoices", "Products"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTransactionTab(tab)}
                    className={`px-0 py-3 text-base leading-7 tracking-[1%] font-poppins font-semibold border-b-2 transition-colors whitespace-nowrap ${activeTransactionTab === tab
                      ? "border-primary text-primary"
                      : "border-transparent text-textSmall hover:text-gray-700 dark:hover:text-white"
                      }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* List Content */}
            <div>
              {activeTransactionTab === "Sale" && Constants.dashboardConstants.recentSales.slice(0, 5).map((sale, index) => (
                <div key={index} className={`p-4 flex items-center gap-4 ${index < Math.min(Constants.dashboardConstants.recentSales.length, 5) - 1 ? "border-b border-[#D8D9D9] dark:border-textSmall" : ""}`}>
                  <div className="w-12 h-12 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    <Image
                      src={sale.image}
                      alt={sale.name}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover rounded-md"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-textMain dark:text-white font-poppins font-semibold text-[16px] leading-[30px] tracking-[1%]">{sale.name}</h3>
                    <p className="text-textSmall font-interTight font-normal text-sm mt-0.5">{sale.category} • {sale.date}</p>
                  </div>
                  <div className="text-right flex-shrink-0 flex flex-col items-end gap-1">
                    <p className="text-textMain dark:text-white font-poppins font-semibold text-base">{sale.price}</p>
                    <div className={`text-xs ${sale.status === "Completed" ? "text-green-600" : sale.status === "Processing" ? "text-purple-600" : sale.status === "Pending" ? "text-blue-600" : sale.status === "Cancelled" ? "text-red-600" : "text-gray-600"}`}>• {sale.status}</div>

                  </div>
                </div>
              ))}

              {activeTransactionTab === "Products" && Constants.dashboardConstants.recentlyAddedProducts.slice(0, 5).map((product, index) => {
                const formatProductDate = (dateStr: string) => {
                  const date = new Date(dateStr);
                  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                  const day = date.getDate().toString().padStart(2, "0");
                  const month = months[date.getMonth()];
                  const year = date.getFullYear();
                  return `${day} ${month} ${year}`;
                };
                return (
                  <div key={index} className={`p-4 flex items-center gap-4 ${index < Math.min(Constants.dashboardConstants.recentlyAddedProducts.length, 5) - 1 ? "border-b border-[#D8D9D9] dark:border-textSmall" : ""}`}>
                    <div className="w-12 h-12 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      <Image
                        src={product.image}
                        alt={product.name}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover rounded-md"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-textMain dark:text-white font-poppins font-semibold text-[16px] leading-[30px] tracking-[1%]">{product.name}</h3>
                      <p className="text-textSmall font-interTight font-normal text-sm mt-0.5">{product.category}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-textMain dark:text-white font-poppins font-semibold text-base">{product.price}</p>
                      <p className="text-textSmall font-interTight font-normal text-xs">{formatProductDate(product.date)}</p>
                    </div>
                  </div>
                );
              })}

              {activeTransactionTab !== "Sale" && activeTransactionTab !== "Products" && Constants.dashboardConstants.recentTransactions.slice(0, 5).map((transaction, index) => (
                <div key={index} className={`p-4 flex items-center gap-4 ${index < Math.min(Constants.dashboardConstants.recentTransactions.length, 5) - 1 ? "border-b border-[#D8D9D9]" : ""}`}>
                  <div className="w-12 h-12 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    <Image
                      src={transaction.image}
                      alt={transaction.customer}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover rounded-md"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-textMain dark:text-white font-poppins font-semibold text-[16px] leading-[30px] tracking-[1%]">{transaction.customer}</h3>
                    <p className="text-xs text-orange-600 mt-0.5">{transaction.id} • {transaction.date}</p>
                  </div>
                  <div className="text-right flex-shrink-0 flex flex-col items-end gap-1">
                    <p className="text-textMain dark:text-white font-poppins font-semibold text-base">{transaction.amount}</p>
                    <div className={`text-xs ${transaction.status === "completed" ? "text-green-600" : (transaction.status === "pending" || transaction.status === "draft") ? "text-pink-600" : "text-gray-600"}`}>• {transaction.status === "draft" ? "Draft" : transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Expired Products */}
        <div className="lg:col-span-1">
          <div className="h-full px-10 py-10 bg-white dark:bg-[#333333] rounded-[6px] border-[0.5px] border-[#EBEBEB] dark:border-[#444444]">
            <div className="pb-6 border-b-[1.5px] border-[#D8D9D9] dark:border-textSmall flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-textMain dark:text-white font-poppins font-semibold text-[22px] leading-8">Expired Products</h2>
              </div>
            </div>

            <div className="pt-2">
              {Constants.dashboardConstants.expiredProducts.map((product, index) => {
                const productId = `${product.name}-${product.quantity}-${product.expiryDate}`.replace(/\s+/g, '-').toLowerCase();

                return (
                  <div key={productId} className={`p-4 flex items-center gap-4 ${index < Constants.dashboardConstants.expiredProducts.length - 1 ? 'border-b border-[#D8D9D9] dark:border-textSmall' : ''}`}>
                    <div className="w-12 h-12 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      <Image
                        src={product.image}
                        alt={product.name}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover rounded-md"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-textMain dark:text-white font-poppins font-semibold text-[16px] leading-[30px] tracking-[1%]">{product.name}</h3>
                      <p className="text-textSmall font-interTight font-normal text-sm mt-0.5">Qty: {product.quantity}</p>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <p className="text-textMain dark:text-white font-poppins font-semibold text-base">{product.expiryDate}</p>
                      <p className="bg-[#F8D9D9] rounded-md px-3 py-1 flex items-center justify-center text-[#F4462C] font-interTight font-semibold text-xs leading-6 tracking-[1%] w-fit ml-auto">Expired</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Purchase & Sale Statistics Graph */}
      {/* Statistics Grid */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Purchase & Sale Statistics Graph */}
        <div className="h-full px-10 py-10 bg-white dark:bg-[#333333] rounded-lg border-[0.5px] border-[#EBEBEB] dark:border-[#444444]">
          <div className="mb-8 flex items-start justify-between">
            <div>
              <p className="text-textSmall dark:text-white font-interTight font-medium text-lg leading-6">Statistics</p>
              <h2 className="text-textMain dark:text-textSmall font-poppins font-semibold text-[28px] leading-10 mt-1">Purchase & sale</h2>
            </div>
            <div className="relative group">
              <button className="flex items-center gap-2 px-3 py-1.5 bg-[#F2F9FF] text-base text-textSmall font-interTight font-regular rounded-[25px] hover:bg-gray-50 transition-colors">
                <Calendar size={16} />
                <span>{purchaseSalesFilter}</span>
                <svg className="w-4 h-4 text-textSmall" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="absolute top-full right-0 mt-1 w-28 bg-white border border-gray-200 shadow-lg rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="py-1">
                  <button
                    onClick={() => setPurchaseSalesFilter("2024")}
                    className="w-full text-left px-3 py-2 text-textSmall font-interTight font-regular hover:bg-gray-100 transition-colors"
                  >
                    2024
                  </button>
                  <button
                    onClick={() => setPurchaseSalesFilter("2025")}
                    className="w-full text-left px-3 py-2 text-textSmall font-interTight font-regular hover:bg-gray-100 transition-colors"
                  >
                    2025
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div id="chart-purchase-sale" className="-ml-2">
            <ReactApexChart
              options={{
                chart: {
                  type: 'line',
                  height: 350,
                  toolbar: { show: false },
                  zoom: { enabled: false },
                  fontFamily: 'inherit',
                  background: 'transparent'
                },
                theme: {
                  mode: isDarkMode ? 'dark' : 'light'
                },
                colors: ['#2F80ED', isDarkMode ? '#1f1f1f' : '#333333'],
                plotOptions: {
                  bar: {
                    columnWidth: '40%',
                    borderRadius: 4,
                    dataLabels: { position: 'top' } // Clean look
                  }
                },
                stroke: {
                  curve: 'smooth',
                  width: 3
                },
                dataLabels: { enabled: false },
                legend: {
                  position: 'top',
                  horizontalAlign: 'right',
                  offsetY: -40,
                  fontSize: '14px',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 400,
                  labels: {
                    colors: isDarkMode ? '#D1D5DB' : '#6B7280',
                    useSeriesColors: false
                  },
                  markers: {
                    // radius: 12,
                    offsetX: -2,
                  },
                  itemMargin: { horizontal: 10, vertical: 0 }
                },
                xaxis: {
                  categories: Constants.dashboardConstants.salesData.map(item => item.name),
                  axisBorder: { show: false },
                  axisTicks: { show: false },
                  labels: {
                    style: {
                      colors: isDarkMode ? '#9CA3AF' : '#6B7280',
                      fontSize: '12px',
                      fontFamily: 'Inter, sans-serif'
                    }
                  },
                  tooltip: { enabled: false }
                },
                yaxis: {
                  labels: {
                    style: {
                      colors: isDarkMode ? '#9CA3AF' : '#6B7280',
                      fontSize: '12px',
                      fontFamily: 'Inter, sans-serif'
                    },
                    formatter: (val) => { return val >= 1000 ? (val / 1000).toFixed(0) + 'k' : val.toString() }
                  },
                },
                grid: {
                  show: true,
                  borderColor: isDarkMode ? '#374151' : '#F3F4F6',
                  xaxis: { lines: { show: false } },
                  yaxis: { lines: { show: true } },
                  padding: { top: 0, right: 0, bottom: 0, left: 10 }
                },
                tooltip: {
                  x: { show: false },
                  marker: { show: false },
                  theme: isDarkMode ? 'dark' : 'light'
                }
              }}
              series={[
                { name: 'Sale', data: Constants.dashboardConstants.salesData.map(item => item.sales) },
                { name: 'Purchase', data: Constants.dashboardConstants.salesData.map(item => item.purchase) }
              ]}
              type="line"
              height={350}
            />
          </div>
        </div>

        {/* Sale Statistics Graph */}
        <div className="h-full px-10 py-10 bg-white dark:bg-[#333333] rounded-lg border-[0.5px] border-[#EBEBEB] dark:border-[#444444]">
          <div className="mb-8 flex items-start justify-between">
            <div>
              <p className="text-textSmall dark:text-white font-interTight font-medium text-lg leading-6">Statistics</p>
              <h2 className="text-textMain dark:text-textSmall font-poppins font-semibold text-[28px] leading-10 mt-1">Sale Statistics</h2>
            </div>
            <div className="relative group">
              <button className="flex items-center gap-2 px-3 py-1.5 bg-[#F2F9FF] text-base text-textSmall font-interTight font-regular rounded-[25px] hover:bg-gray-50 transition-colors">
                <span>Annual</span>
                <svg className="w-4 h-4 text-textSmall" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>

          <div id="chart-sale-stats" className="-ml-2">
            <ReactApexChart
              options={{
                chart: {
                  stacked: true,
                  toolbar: { show: false },
                  zoom: { enabled: false },
                  fontFamily: 'inherit',
                  background: 'transparent'
                },
                theme: {
                  mode: isDarkMode ? 'dark' : 'light'
                },
                colors: ['#D1E9FF', '#8BC7FF', '#2F80ED', isDarkMode ? '#F59E0B' : '#333333'],
                plotOptions: {
                  bar: {
                    columnWidth: '40%',
                    borderRadius: 4,
                    dataLabels: { position: 'top' } // Clean look
                  }
                },
                stroke: {
                  width: [0, 0, 0, 2],
                  curve: 'smooth'
                },
                dataLabels: { enabled: false },
                legend: { show: false },
                xaxis: {
                  categories: ['2018', '2019', '2020', '2021', '2022', '2023'],
                  axisBorder: { show: false },
                  axisTicks: { show: false },
                  labels: {
                    style: { colors: isDarkMode ? '#9CA3AF' : '#6B7280', fontSize: '12px', fontFamily: 'Inter, sans-serif' }
                  },
                  tooltip: { enabled: false }
                },
                yaxis: {
                  min: 0,
                  max: 3000000,
                  tickAmount: 3,
                  labels: {
                    style: { colors: isDarkMode ? '#9CA3AF' : '#6B7280', fontSize: '12px', fontFamily: 'Inter, sans-serif' },
                    formatter: (val) => { return val >= 1000000 ? (val / 1000000).toFixed(0) + 'M' : val >= 1000 ? (val / 1000).toFixed(0) + 'k' : val.toString() }
                  },
                },
                grid: {
                  show: true,
                  borderColor: isDarkMode ? '#374151' : '#F3F4F6',
                  xaxis: { lines: { show: false } },
                  yaxis: { lines: { show: true } },
                  padding: { top: 0, right: 0, bottom: 0, left: 10 }
                },
                tooltip: {
                  shared: true,
                  intersect: false,
                  theme: isDarkMode ? 'dark' : 'light',
                  y: {
                    formatter: function (y) {
                      if (typeof y !== "undefined") {
                        return y.toFixed(0);
                      }
                      return y;
                    }
                  }
                }
              }}
              series={[
                { name: 'Low', type: 'bar', data: [500000, 500000, 500000, 500000, 500000, 500000] },
                { name: 'Mid', type: 'bar', data: [800000, 500000, 1000000, 500000, 500000, 500000] },
                { name: 'High', type: 'bar', data: [500000, 400000, 800000, 500000, 400000, 500000] },
                { name: 'Trend', type: 'line', data: [1800000, 1400000, 2300000, 1500000, 1400000, 1500000] }
              ]}
              height={350}
            />
          </div>
        </div>
      </div>

      {/* Top Categories & Order Statistics Grid */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Top Categories */}
        <div className="h-full px-10 py-10 bg-white dark:bg-[#333333] rounded-lg border-[0.5px] border-[#EBEBEB] dark:border-[#444444]">
          <div className="mb-2 flex items-start justify-between">
            <div>
              <p className="text-textSmall dark:text-white font-interTight font-medium text-lg leading-6">Statistics</p>
              <h2 className="text-textMain dark:text-textSmall font-poppins font-semibold text-[28px] leading-10 mt-1">Top Categories</h2>
            </div>
            <div className="relative group">
              <button className="flex items-center gap-2 px-3 py-1.5 bg-[#F2F9FF] text-base text-textSmall font-interTight font-regular rounded-[25px] hover:bg-gray-50 transition-colors">
                <span>All</span>
                <svg className="w-4 h-4 text-textSmall" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center">
            <div className="flex-1 min-w-[200px]">
              <ReactApexChart
                options={{
                  chart: {
                    type: 'pie',
                    width: '100%',
                    fontFamily: 'inherit',
                    background: 'transparent'
                  },
                  theme: {
                    mode: isDarkMode ? 'dark' : 'light'
                  },
                  labels: ['Electronics', 'Clothing', 'Books', 'Home'],
                  colors: ['#2F80ED', '#2563EB', '#88BFFF', '#B1D9FF'],
                  legend: { show: false },
                  dataLabels: { enabled: false },
                  stroke: { show: false },
                  tooltip: { enabled: true }
                }}
                series={[39.11, 28.02, 23.13, 5.03]}
                type="pie"
                height={300}
              />
            </div>
            <div className="flex-shrink-0 w-full sm:w-auto mt-4 sm:mt-0 sm:ml-6 space-y-4">
              {[
                { name: 'Electronics', value: '39.11%', trend: '+2.98%', color: '#2F80ED', isPositive: true },
                { name: 'Clothing', value: '28.02%', trend: '-3.25%', color: '#2563EB', isPositive: false },
                { name: 'Books', value: '23.13%', trend: '+0.14%', color: '#88BFFF', isPositive: true },
                { name: 'Home', value: '5.03%', trend: '-1.11%', color: '#B1D9FF', isPositive: false },
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between sm:justify-start gap-4 text-base">
                  <div className="flex items-center gap-2 min-w-[120px]">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></span>
                    <span className="text-textMain font-medium">{item.name}</span>
                  </div>
                  <span className="text-gray-500 w-[60px] text-right">{item.value}</span>
                  <span className={`w-[70px] text-right ${item.isPositive ? 'text-[#1AC769]' : 'text-[#F4462C]'}`}>
                    ({item.trend})
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Statistics */}
        <div className="h-full px-10 py-10 bg-white dark:bg-[#333333] rounded-lg border-[0.5px] border-[#EBEBEB] dark:border-[#444444]">
          <div className="mb-8 flex items-start justify-between">
            <div>
              <p className="text-textSmall dark:text-white font-interTight font-medium text-lg leading-6">Statistics</p>
              <h2 className="text-textMain dark:text-textSmall font-poppins font-semibold text-[28px] leading-10 mt-1">Order Statistics</h2>
            </div>
            <div className="relative group">
              <button className="flex items-center gap-2 px-3 py-1.5 bg-[#F2F9FF] text-base text-textSmall font-interTight font-regular rounded-[25px] hover:bg-gray-50 transition-colors">
                <span>Weekly</span>
                <svg className="w-4 h-4 text-textSmall" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>

          <div id="chart-order-stats" className="-ml-2">
            <ReactApexChart
              options={{
                chart: {
                  type: 'bar',
                  toolbar: { show: false },
                  fontFamily: 'inherit',
                  background: 'transparent'
                },
                theme: {
                  mode: isDarkMode ? 'dark' : 'light'
                },
                plotOptions: {
                  bar: {
                    columnWidth: '45%',
                    borderRadius: 8,
                    borderRadiusApplication: 'end',
                    distributed: true, // Allows individual bar colors
                  }
                },
                colors: ['#B1D9FF', '#B1D9FF', '#B1D9FF', '#B1D9FF', '#007AFF', '#B1D9FF', '#B1D9FF'],
                dataLabels: { enabled: false },
                legend: { show: false },
                xaxis: {
                  categories: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
                  axisBorder: { show: false },
                  axisTicks: { show: false },
                  labels: {
                    style: { colors: isDarkMode ? '#9CA3AF' : '#6B7280', fontSize: '12px', fontFamily: 'Inter, sans-serif' }
                  }
                },
                yaxis: {
                  min: 0,
                  max: 100,
                  tickAmount: 4,
                  labels: {
                    style: { colors: isDarkMode ? '#9CA3AF' : '#6B7280', fontSize: '12px', fontFamily: 'Inter, sans-serif' }
                  }
                },
                grid: {
                  show: true,
                  borderColor: isDarkMode ? '#374151' : '#F3F4F6',
                  xaxis: { lines: { show: false } },
                  yaxis: { lines: { show: true } },
                  padding: { top: 0, right: 0, bottom: 0, left: 10 }
                },
                tooltip: {
                  theme: isDarkMode ? 'dark' : 'light',
                  y: {
                    formatter: function (val) {
                      return val.toLocaleString();
                    },
                    title: {
                      formatter: () => ''
                    }
                  },
                  marker: { show: false }
                }
              }}
              series={[{
                name: 'Orders',
                data: [40, 20, 42, 28, 65, 18, 40]
              }]}
              type="bar"
              height={300}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
