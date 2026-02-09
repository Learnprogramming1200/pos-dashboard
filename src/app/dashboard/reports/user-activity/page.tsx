import { WebComponents } from "@/components";
import { PageGuard } from "@/components/guards/page-guard";

export default function UserActivityReportPage() {
  return (
    <PageGuard permissionKey="reports.userActivity">
      <WebComponents.AdminComponents.AdminWebComponents.Reports.UserActivityReport />
    </PageGuard>
  );
}
