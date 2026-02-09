import { WebComponents } from "@/components";
import { PageGuard } from "@/components/guards/page-guard";

export default function TaxReportPage() {
  return (
    <PageGuard permissionKey="reports.financialTax">
      <WebComponents.AdminComponents.AdminWebComponents.Reports.TaxReport />
    </PageGuard>
  );
}
