"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Users,
  Package,
  AlertCircle,
  CheckCircle,
  Clock
} from "lucide-react";
import { SalesStats as SalesStatsType } from "@/types/admin/sales/Sales";

interface SalesStatsProps {
  stats: SalesStatsType;
  isLoading?: boolean;
}

export default function SalesStats({ stats, isLoading = false }: SalesStatsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="animate-pulse">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2"></div>
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                  </div>
                  <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Revenue",
      value: `$${stats.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/20"
    },
    {
      title: "Total Orders",
      value: stats.totalOrders.toString(),
      icon: ShoppingCart,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/20"
    },
    {
      title: "Completed Orders",
      value: stats.completedOrders.toString(),
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/20"
    },
    {
      title: "Average Order Value",
      value: `$${stats.averageOrderValue.toFixed(2)}`,
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900/20"
    },
    {
      title: "Pending Orders",
      value: stats.pendingOrders.toString(),
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100 dark:bg-yellow-900/20"
    },
    {
      title: "Cancelled Orders",
      value: stats.cancelledOrders.toString(),
      icon: AlertCircle,
      color: "text-red-600",
      bgColor: "bg-red-100 dark:bg-red-900/20"
    },
    {
      title: "Total Returns",
      value: stats.totalReturns.toString(),
      icon: Package,
      color: "text-orange-600",
      bgColor: "bg-orange-100 dark:bg-orange-900/20"
    },
    {
      title: "Return Amount",
      value: `$${stats.totalReturnAmount.toFixed(2)}`,
      icon: DollarSign,
      color: "text-red-600",
      bgColor: "bg-red-100 dark:bg-red-900/20"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((card, index) => {
        const IconComponent = card.icon;
        return (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white truncate">{card.value}</p>
                </div>
                <div className={`w-10 h-10 ${card.bgColor} rounded-lg flex items-center justify-center flex-shrink-0 ml-2`}>
                  <IconComponent className={`w-5 h-5 ${card.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
