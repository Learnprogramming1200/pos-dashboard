import { WebComponents } from "@/components";
import { ServerActions } from "@/lib/server-lib";
import { SearchParams } from "@/types/SearchParams";

export default async function ExpensesReportPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);
  const limit = parseInt(params.limit || "10", 10);

  const filters = {
    search: params.search ? (params.search as string) : undefined,
    status: params.status === "All" ? undefined : (params.status as string),
    categoryName: params.category === "All" ? undefined : (params.category as string),
    storeName: params.store === "All" ? undefined : (params.store as string),
    fromDate: params.dateFrom as string,
    toDate: params.dateTo as string,
    minAmount: params.amountMin ? parseFloat(params.amountMin as string) : undefined,
    maxAmount: params.amountMax ? parseFloat(params.amountMax as string) : undefined,
  };

  const result = await ServerActions.ServerApilib.ssrExpenseAPI.generateExpenseReport(
    page,
    limit,
    filters
  );

  const storesResult = await ServerActions.ServerApilib.ssrStoreAPI.getAll();
  const stores = storesResult?.data?.data?.stores || [];

  const data = result?.data?.data?.data || [];
  const summary = result?.data?.data?.summary || null;
  const categoryBreakdown = result?.data?.data?.categoryBreakdown || [];

  const pagination = result?.data?.data?.pagination || {
    currentPage: page,
    totalPages: Math.ceil((summary?.totalExpenses || 0) / limit) || 1,
    totalItems: summary?.totalExpenses || 0,
    itemsPerPage: limit,
  };

  return (
    <WebComponents.AdminComponents.AdminWebComponents.Reports.ExpensesReport
      initialData={data}
      initialSummary={summary}
      initialCategoryBreakdown={categoryBreakdown}
      initialStores={stores}
      initialPagination={pagination}
    />
  );
}
