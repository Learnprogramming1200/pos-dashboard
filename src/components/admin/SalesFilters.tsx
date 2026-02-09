"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Search, Filter, X } from "lucide-react";
import { SalesFilter, SalesReturnFilter } from "@/types/admin/sales/Sales";

interface SalesFiltersProps {
  filters: SalesFilter | SalesReturnFilter;
  onFiltersChange: (filters: SalesFilter | SalesReturnFilter) => void;
  onReset: () => void;
  type?: "sales" | "returns";
}

export default function SalesFilters({
  filters,
  onFiltersChange,
  onReset,
  type = "sales"
}: SalesFiltersProps) {
  const handleDateRangeChange = (field: "start" | "end", value: string) => {
    onFiltersChange({
      ...filters,
      dateRange: {
        ...filters.dateRange,
        [field]: value
      }
    });
  };

  const handleFilterChange = (field: keyof Omit<SalesFilter, "dateRange">, value: string) => {
    onFiltersChange({
      ...filters,
      [field]: value === "all" ? undefined : value
    });
  };

  const hasActiveFilters = () => {
    return (
      filters.dateRange.start ||
      filters.dateRange.end ||
      filters.storeId ||
      filters.status ||
      ("paymentMethod" in filters && filters.paymentMethod) ||
      (type === "returns" && "customerId" in filters && filters.customerId)
    );
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <h3 className="font-medium text-gray-900 dark:text-white">Filters</h3>
          </div>
          {hasActiveFilters() && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="w-4 h-4 mr-1" />
              Clear All
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div>
            <Label htmlFor="search">Search</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="search"
                placeholder={`Search ${type}...`}
                className="pl-10"
                onChange={(e) => {
                  // This would need to be handled by parent component
                  // as we don't have search in the filter types
                }}
              />
            </div>
          </div>

          {/* Date Range */}
          <div>
            <Label htmlFor="start-date">Start Date</Label>
            <Input
              id="start-date"
              type="date"
              value={filters.dateRange.start}
              onChange={(e) => handleDateRangeChange("start", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="end-date">End Date</Label>
            <Input
              id="end-date"
              type="date"
              value={filters.dateRange.end}
              onChange={(e) => handleDateRangeChange("end", e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <div>
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              value={filters.status || "all"}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="all">All Status</option>
              {type === "sales" ? (
                <>
                  <option value="Pending">Pending</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="Refunded">Refunded</option>
                </>
              ) : (
                <>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Completed">Completed</option>
                </>
              )}
            </select>
          </div>

          {/* Store Filter */}
          <div>
            <Label htmlFor="store">Store</Label>
            <select
              id="store"
              value={filters.storeId || "all"}
              onChange={(e) => handleFilterChange("storeId", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="all">All Stores</option>
              <option value="STORE-001">Main Store</option>
              <option value="STORE-002">Store</option>
            </select>
          </div>
        </div>

        {/* Additional filters for sales */}
        {type === "sales" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            <div>
              <Label htmlFor="payment-method">Payment Method</Label>
              <select
                id="payment-method"
                value={("paymentMethod" in filters && filters.paymentMethod) || "all"}
                onChange={(e) => handleFilterChange("paymentMethod", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="all">All Methods</option>
                <option value="Cash">Cash</option>
                <option value="Card">Card</option>
                <option value="UPI">UPI</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        )}

        {/* Additional filters for returns */}
        {type === "returns" && "customerId" in filters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            <div>
              <Label htmlFor="customer">Customer</Label>
              <select
                id="customer"
                value={filters.customerId || "all"}
                onChange={(e) => handleFilterChange("customerId", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="all">All Customers</option>
                <option value="CUST-001">John Doe</option>
                <option value="CUST-002">Jane Smith</option>
                <option value="CUST-003">Bob Johnson</option>
              </select>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
