"use client";
import React from "react";
import Link from "next/link";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WebComponents } from "@/components";
import { FaShoppingBag, FaDollarSign, FaRegFileAlt, FaBox } from "react-icons/fa";
import { MdAssignmentReturn, MdPending, MdOutlineArrowOutward } from "react-icons/md"

import { AdminTypes } from "@/types";
import { Constants } from "@/constant";

/* -------------------- HELPERS -------------------- */

const formatDate = (date?: string) => {
  if (!date) return "-";
  const d = new Date(date);
  return d.toDateString() === new Date().toDateString()
    ? "Today"
    : d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
};

const getProductInfo = (items: any[] = []) => {
  if (!items.length) return { name: "No products", qty: 0 };

  const first = items[0];
  const name = first.productName || first.product?.name || "Product";
  const qty =
    first.quantity ||
    first.returnQty ||
    first.returnedQuantity ||
    first.receivedQuantity ||
    0;

  return {
    name: items.length > 1 ? `${name} +${items.length - 1} more` : name,
    qty,
  };
};

const getStatusClasses = (status: string) => {
  const map: Record<string, string> = {
    Received: "bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800",
    Billed: "bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800",
    Credited: "bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800",
    Pending: "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
    Ordered: "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
    Draft: "bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700",
    Cancelled: "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800",
    Returned: "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800",
    Approved: "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800",
  };

  return map[status] || "bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-400";
};

const StatusBadge = ({ status }: { status: string }) => (
  <WebComponents.UiWebComponents.UiWebComponents.Badge
    variant="outline"
    className={`px-2 py-0.5 text-xs border ${getStatusClasses(status)}`}
  >
    {status}
  </WebComponents.UiWebComponents.UiWebComponents.Badge>
);

/* -------------------- COMPONENT -------------------- */

export default function PurchaseOverview({
  initialOrders = [],
  initialReturns = [],
  initialStats,
}: {
  readonly initialOrders: AdminTypes.purchaseOrderTypes.PurchaseOrder[];
  readonly initialReturns: AdminTypes.purchaseReturnTypes.PurchaseReturn[];
  readonly initialStats?: AdminTypes.purchaseTypes.PurchaseStats;
}) {
  const orders = initialOrders;
  const returns = initialReturns;

  const stats = React.useMemo(() => {
    if (initialStats) return initialStats;

    return {
      totalOrders: orders.length,
      pendingOrders: orders.filter(o =>
        ["Pending", "Draft", "Ordered"].includes(o.status)
      ).length,
      completedOrders: orders.filter(o =>
        ["Received", "Billed", "Approved"].includes(o.status)
      ).length,
      totalReturns: returns.length,
      totalAmount: orders.reduce(
        (sum, o: any) =>
          sum + Number(o.totals?.grandTotal || o.totalAmount || 0),
        0
      ),
      totalRefunds: returns.reduce(
        (sum, r: any) => sum + Number(r.totalRefundAmount || 0),
        0
      ),
    };
  }, [initialStats, orders, returns]);

  const recentOrders = orders.slice(0, 5);
  const recentReturns = returns.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{Constants.adminConstants.purchaseManagement}</h1>
          <p className="text-gray-500">{Constants.adminConstants.purchaseManagemntTitle}</p>
        </div>

        <div className="flex gap-3">
          <Link href="/admin/purchase/purchase-order">
            <WebComponents.UiWebComponents.UiWebComponents.Button className="gap-2">
              <FaRegFileAlt className="h-4 w-4" /> {Constants.adminConstants.Order}
            </WebComponents.UiWebComponents.UiWebComponents.Button>
          </Link>
          <Link href="/admin/purchase/purchase-return">
            <WebComponents.UiWebComponents.UiWebComponents.Button className="gap-2">
              <MdAssignmentReturn className="h-4 w-4" /> {Constants.adminConstants.Return}
            </WebComponents.UiWebComponents.UiWebComponents.Button>
          </Link>
          <Link href="/admin/purchase/suppliers">
            <WebComponents.UiWebComponents.UiWebComponents.Button className="gap-2">
              <FaBox className="h-4 w-4" /> {Constants.adminConstants.suppliers}
            </WebComponents.UiWebComponents.UiWebComponents.Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat title={Constants.adminConstants.totalOrders} value={stats.totalOrders} icon={<FaShoppingBag />} />
        <Stat title={Constants.adminConstants.totalAmounts} value={`₹${stats.totalAmount.toLocaleString()}`} icon={<FaDollarSign />} />
        <Stat title={Constants.adminConstants.pendingOrders} value={stats.pendingOrders} icon={<MdPending />} />
        <Stat title={Constants.adminConstants.totalReturns} value={stats.totalReturns} icon={<MdAssignmentReturn />} />
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Orders */}
        <TableCard
          title={Constants.adminConstants.recentPurchaseOrders}
          link="/admin/purchase/purchase-order"
          viewAll={Constants.adminConstants.viewAllOrders}
        >
          {recentOrders.map((o: any, i) => {
            const { name, qty } = getProductInfo(o.items || o.orderDetails?.items);
            return (
              <Row
                key={i}
                date={formatDate(o.orderDate || o.createdAt)}
                name={name}
                qty={qty}
                status={o.status}
                total={o.totals?.grandTotal || o.totalAmount}
              />
            );
          })}
        </TableCard>

        {/* Returns */}
        <TableCard
          title={Constants.adminConstants.recentReturns}
          link="/admin/purchase/purchase-return"
          viewAll={Constants.adminConstants.viewAllReturns}
          emptyText={Constants.adminConstants.noRecentReturnLabel}
        >
          {recentReturns.map((r: any, i) => {
            const { name, qty } = getProductInfo(r.items);
            return (
              <Row
                key={i}
                date={formatDate(r.orderDate || r.createdAt)}
                name={name}
                qty={qty}
                status={r.status}
                total={r.totalRefundAmount}
              />
            );
          })}
        </TableCard>
      </div>
    </div>
  );
}

/* -------------------- SMALL COMPONENTS -------------------- */

const Stat = ({ title, value, icon }: any) => (
  <div className="flex justify-between p-4 border rounded-md bg-white dark:bg-[#333333] border-gray-200 dark:border-[#444444]">
    <div>
      <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
      <p className="text-xl font-bold dark:text-white">{value}</p>
    </div>
    <div className="h-10 w-10 rounded-md bg-primary text-white flex items-center justify-center">
      {icon}
    </div>
  </div>
);

const TableCard = ({ title, link, viewAll, children, emptyText }: any) => (
  <WebComponents.UiWebComponents.UiWebComponents.Card className="border rounded-md bg-white dark:bg-[#333333] border-gray-200 dark:border-[#444444]">
    <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2">
      <CardTitle className="text-lg font-bold dark:text-white">{title}</CardTitle>
      <Link href={link}>
        <WebComponents.UiWebComponents.UiWebComponents.Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm">
          {viewAll} <MdOutlineArrowOutward className="h-4 w-4 ml-1" />
        </WebComponents.UiWebComponents.UiWebComponents.Button>
      </Link>
    </CardHeader>
    <CardContent>
      {children?.length ? children : (
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 py-6">
          {emptyText || "No data found"}
        </p>
      )}
    </CardContent>
  </WebComponents.UiWebComponents.UiWebComponents.Card>
);

const Row = ({ date, name, qty, status, total }: any) => (
  <div
    className="
      grid grid-cols-[1fr_60px_110px_100px]
      items-center
      py-3
      border-b border-gray-200 dark:border-gray-700
      last:border-0
      gap-2
    "
  >
    {/* Product + Date */}
    <div className="min-w-0">
      {date && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {date}
        </p>
      )}
      <p className="font-medium dark:text-white truncate">
        {name}
      </p>
    </div>

    {/* Qty */}
    <p className="text-center dark:text-white font-medium">
      {qty}
    </p>

    {/* Status */}
    <div className="flex justify-center">
      <StatusBadge status={status} />
    </div>

    {/* Amount */}
    <p className="text-right font-semibold dark:text-white">
      {Number(total || 0).toLocaleString()}
    </p>
  </div>
);

