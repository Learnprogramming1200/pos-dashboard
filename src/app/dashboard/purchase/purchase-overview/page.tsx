import { WebComponents } from "@/components";
import { ServerActions } from "@/lib/server-lib";
import { PageGuard } from "@/components/guards/page-guard";

export default async function PurchaseOverviewPage() {
  // Fetch purchase orders for stats and recent lists
  const purchaseOrderResponse = await ServerActions.ServerApilib.ssrPurchaseOrderAPI.getAll();
  const initialOrders = purchaseOrderResponse?.data?.data?.data || [];

  //Purchase Returns
  const purchaseReturnResponse = await ServerActions.ServerApilib.ssrPurchaseReturnAPI.getAll();

  const purchaseReturnData = purchaseReturnResponse?.data?.data?.data || [];

  return (
    <PageGuard permissionKey="purchase.overview">
      <WebComponents.AdminComponents.AdminWebComponents.AdminPurchaseWebComponents.PurchaseOverview initialOrders={initialOrders} initialReturns={purchaseReturnData} />
    </PageGuard>
  );
}
