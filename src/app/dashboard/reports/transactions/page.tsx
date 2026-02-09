import { WebComponents } from "@/components";
import { PageGuard } from "@/components/guards/page-guard";

export default function TransactionReportPage() {
  return (
    <PageGuard permissionKey="reports.transaction">
      <WebComponents.AdminComponents.AdminWebComponents.Reports.TransactionReport />
    </PageGuard>
  );
}
