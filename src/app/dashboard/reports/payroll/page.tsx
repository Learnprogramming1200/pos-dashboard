import { WebComponents } from "@/components";
import { PageGuard } from "@/components/guards/page-guard";

export default function PayrollReportPage() {
  return (
    <PageGuard permissionKey="reports.payroll">
      <WebComponents.AdminComponents.AdminWebComponents.Reports.PayrollReport />
    </PageGuard>
  );
}
