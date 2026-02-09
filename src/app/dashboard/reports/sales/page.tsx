import { ServerActions } from "@/lib/server-lib";
import { PageGuard } from "@/components/guards/page-guard";
// Direct import for better code-splitting
import SalesReport from "@/components/admin/reports/SalesReport";

export default async function SalesReportPage() {
  const salesReport = await ServerActions.ServerApilib.ssrSalesAPI.getReport();
  const salesRerportResponse = salesReport?.data?.data || [];
  const salesReportData = salesRerportResponse.data;
  const stores = salesRerportResponse.stores;
  const category = salesRerportResponse.category;
  const products = salesRerportResponse.products;

  return (
    <PageGuard permissionKey="reports.sales">
      <SalesReport initialData={salesReportData} stores={stores} category={category} products={products} />
    </PageGuard>
  );
}
