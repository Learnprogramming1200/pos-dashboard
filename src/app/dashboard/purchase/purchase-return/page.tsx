import { ServerActions } from "@/lib/server-lib";
import { SearchParams } from "@/types/SearchParams";
import { PageGuard } from "@/components/guards/page-guard";
// Direct import for better code-splitting
import PurchaseReturnManagement from "@/components/admin/purchase/PurchaseReturnManagement";

export default async function PurchaseReturnPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  const page = parseInt(params.page || "1", 10);
  const limit = parseInt(params.limit || "10", 10);

  const search =
    typeof params.search === "string" && params.search.trim()
      ? params.search.trim()
      : undefined;

  const status =
    typeof params.status === "string"
      ? (params.status as
        | "Draft"
        | "Approved"
        | "Returned"
        | "Credited"
        | "Cancelled")
      : undefined;

  const all =
    typeof params.all === "string"
      ? params.all === "true"
      : undefined;

  const [
    storesRes,
    purchaseOrdersRes,
    purchaseReturnsRes,
  ] = await Promise.all([
    ServerActions.ServerApilib.ssrStoreAPI.getAll(),
    ServerActions.ServerApilib.ssrPurchaseOrderAPI.getAll(),
    ServerActions.ServerApilib.ssrPurchaseReturnAPI.getAll(
      page,
      limit,
      search,
      status,
      all
    ),
  ]);


  const stores = storesRes?.data?.data?.stores || [];
  const purchaseOrders = purchaseOrdersRes?.data?.data?.data || [];

  const purchaseReturnResponse = purchaseReturnsRes?.data?.data || {};
  const displayData = purchaseReturnResponse?.data || [];


  const pagination = purchaseReturnResponse?.pagination || {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: limit,
    hasNext: false,
    hasPrev: false,
  };

  return (
    <PageGuard permissionKey="purchase.return">
      <PurchaseReturnManagement
        initialStores={stores}
        initialPurchaseOrders={purchaseOrders}
        initialPurchaseReturns={displayData}
        initialPagination={pagination}
      />
    </PageGuard>
  );
}
