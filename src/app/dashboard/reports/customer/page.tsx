import { WebComponents } from "@/components";
import { PageGuard } from "@/components/guards/page-guard";

export default function CustomerReportPage() {
  return (
    <PageGuard permissionKey="reports.customer">
      <WebComponents.AdminComponents.AdminWebComponents.Reports.CustomerReport />
    </PageGuard>
  );
}

