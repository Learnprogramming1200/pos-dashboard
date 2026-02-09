import { WebComponents } from "@/components";
import { PageGuard } from "@/components/guards/page-guard";

export default function AnnualReportPage() {
  return (
    <PageGuard permissionKey="reports.financialTax">
      <WebComponents.AdminComponents.AdminWebComponents.Reports.AnnualReport />
    </PageGuard>
  );
}

