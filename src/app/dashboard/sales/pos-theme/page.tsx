import { PageGuard } from "@/components/guards/page-guard";
// Direct import for better code-splitting
import POSManagement from "@/components/admin/sales/POSManagement";

export default async function POSThemePage() {
  return (
    <PageGuard permissionKey="sales.posTheme">
      <POSManagement />
    </PageGuard>
  );
}
