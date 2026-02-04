import { WebComponents } from "@/components";
import { ServerActions } from "@/lib/server-lib";
import { SearchParams } from "@/types/SearchParams";

export default async function PurchaseReportPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  const page = parseInt(params.page || "1", 10);
  const limit = parseInt(params.limit || "10", 10);

  const filters = {
    search: params.search ? String(params.search) : undefined,
    storeId: params.storeId && params.storeId !== "All" ? String(params.storeId) : undefined,
    status: params.status && params.status !== "All" ? String(params.status) : undefined,
    dateFrom: params.dateFrom ? String(params.dateFrom) : undefined,
    dateTo: params.dateTo ? String(params.dateTo) : undefined,
    minPurchaseQty: params.minPurchaseQty
      ? Number(params.minPurchaseQty)
      : undefined,
    maxPurchaseQty: params.maxPurchaseQty
      ? Number(params.maxPurchaseQty)
      : undefined,
    minPurchaseAmount: params.minPurchaseAmount 
      ? Number(params.minPurchaseAmount)
      : undefined,
    maxPurchaseAmount: params.maxPurchaseAmount
      ? Number(params.maxPurchaseAmount)
      : undefined,
  };

  const result =
    await ServerActions.ServerApilib.ssrPurchaseOrderAPI.generatePurchaseOrderReport(
      page,
      limit,
      filters
    );

  const storesResult = await ServerActions.ServerApilib.ssrStoreAPI.getAll();
  const stores = storesResult?.data?.data?.stores || [];

  const data = result?.data?.data?.data || [];
  const summary = result?.data?.data?.summary || {
    totalPurchaseQty: 0,
    totalUnitPrice: 0,
    totalPurchaseAmount: 0,
  };
  const pagination = result?.data?.data?.pagination || {
    page: page,
    limit: limit,
    totalRecords: 0,
    totalPages: 1,
  };

  return (
    <WebComponents.AdminComponents.AdminWebComponents.Reports.PurchaseReport
      initialData={data}
      initialPagination={pagination}
      initialStores={stores}
      initialSummary={summary}
    />
  );
}
