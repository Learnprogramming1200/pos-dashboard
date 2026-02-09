import { WebComponents } from "@/components";
import { PageGuard } from "@/components/guards/page-guard";
import { ServerActions } from "@/lib/server-lib";

export default async function ProfitLossReportPage({ searchParams }: { searchParams: any }) {
  const profitLossReport = await ServerActions.ServerApilib.ssrProfitLossReportAPI.getReport(searchParams);
  const profitLossReportData = profitLossReport?.data?.data || {};

  return (
    <PageGuard permissionKey="reports.financialTax">
      <WebComponents.AdminComponents.AdminWebComponents.Reports.ProfitLossReport initialData={profitLossReportData?.data || []}
        initialSummary={profitLossReportData?.summary}
        currency={profitLossReportData?.currency} />
    </PageGuard>
  );
}
