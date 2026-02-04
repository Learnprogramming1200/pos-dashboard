import { WebComponents } from "@/components";
import { ServerActions } from "@/lib/server-lib";
import { SearchParams } from "@/types/SearchParams";

export default async function UserLoginReportPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  const page = parseInt(params.page || "1", 10);
  const limit = parseInt(params.limit || "10", 10);

  const filters = {
    search: params.search ? String(params.search) : undefined,
    store: params.store === "All" ? undefined : String(params.store),
    role: params.role === "All" ? undefined : String(params.role),
    dateFrom: params.dateFrom ? String(params.dateFrom) : undefined,
    dateTo: params.dateTo ? String(params.dateTo) : undefined,
  };

  const result = await ServerActions.ServerApilib.ssrUserLoginAPI.getAll(
    page,
    limit,
    filters as any
  );

  const storesResult = await ServerActions.ServerApilib.ssrStoreAPI.getAll();
  const stores = storesResult?.data?.data?.stores || [];
  const data = result?.data?.data?.data || [];
  const summary = result?.data?.data?.summary || null;
  const pagination = result?.data?.data?.pagination || {
    currentPage: page,
    totalPages: Math.ceil((summary?.totalUserLogins || 0) / limit) || 1,
    totalItems: summary?.totalUserLogins || 0,
    itemsPerPage: limit,
  };



  return (
    <WebComponents.AdminComponents.AdminWebComponents.Reports.UserLoginReport
      initialData={data}
      initialPagination={pagination}
      initialStores={stores}
      initialSummary={summary}
    />
  );
}
