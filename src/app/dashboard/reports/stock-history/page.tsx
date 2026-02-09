import { PageGuard } from "@/components/guards/page-guard";
// Direct import for better code-splitting
import StockHistoryReport from "@/components/admin/reports/StockHistoryReport";

export default function StockHistoryReportPage() {
  return (
    <PageGuard permissionKey="reports.stockHistory">
      <StockHistoryReport />
    </PageGuard>
  );
}
