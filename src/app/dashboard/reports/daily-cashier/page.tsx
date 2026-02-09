import { WebComponents } from "@/components";
import { PageGuard } from "@/components/guards/page-guard";

export default function DailyCashierReportPage() {
  return (
    <PageGuard permissionKey="reports.dailyCashier">
      <WebComponents.AdminComponents.AdminWebComponents.Reports.DailyCashierReport />
    </PageGuard>
  );
}

