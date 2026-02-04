import { WebComponents } from "@/components";
import { ServerActions } from "@/lib/server-lib";
import { SearchParams } from "@/types/SearchParams";

export default async function SalesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);
  const limit = parseInt(params.limit || "10", 10);
  const search = typeof params.search === "string" && params.search.trim() !== ""
    ? params.search.trim()
    : undefined;

  const status = typeof params.status === "string" ? params.status : undefined;
  const storeId = typeof params.storeId === "string" ? params.storeId : undefined;

  const [
    salesResult,
    storeResult,
  ] = await Promise.all([
    ServerActions.ServerApilib.ssrSalesAPI.getAll(page, limit, search, status, storeId).catch((err: any) => {
      console.error("Failed to fetch products:", err);
      return null;
    }),
    ServerActions.ServerApilib.ssrStoreAPI.getAll().catch((err: any) => {
      console.error("Failed to fetch stores:", err);
      return null;
    }),
  ]);

  const sales = (salesResult)?.data?.data?.data || [];
  const stores = storeResult?.data?.data?.stores ||
    storeResult?.data?.stores ||
    storeResult?.data?.data ||
    storeResult?.data ||
    [];
  const pagination = (salesResult)?.data?.data?.pagination || {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: limit,
    hasNext: false,
    hasPrev: false,
  };

  return (
    <WebComponents.AdminComponents.AdminWebComponents.AdminSalesWebComponents.SalesManagement
      initialSales={sales}
      initialStores={stores}
      initialPagination={pagination}
    />
  );
}
