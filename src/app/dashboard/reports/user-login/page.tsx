import { WebComponents } from "@/components";
import { ServerActions } from "@/lib/server-lib";
import { SearchParams } from "@/types/SearchParams";
import { PageGuard } from "@/components/guards/page-guard";

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
    store: params.store && params.store !== "All" ? String(params.store) : undefined,
    role: params.role && params.role !== "All" ? String(params.role) : undefined,
    dateFrom: params.dateFrom ? String(params.dateFrom) : undefined,
    dateTo: params.dateTo ? String(params.dateTo) : undefined,
  };

  const result = await ServerActions.ServerApilib.ssrUserLoginAPI.getAll(
    page,
    limit,
    filters.search,
    filters.store,
    filters.role,
    filters.dateFrom,
    filters.dateTo
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
    <PageGuard permissionKey="reports.userLogin">
      <WebComponents.AdminComponents.AdminWebComponents.Reports.UserLoginReport
        initialData={data}
        initialPagination={pagination}
        initialStores={stores}
        initialSummary={summary}
      />
    </PageGuard>
  );
}
