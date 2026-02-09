import { ServerActions } from "@/lib/server-lib";
import { SearchParams } from "@/types/SearchParams";
import { PageGuard } from "@/components/guards/page-guard";
// Direct import for better code-splitting
import SalesReturnManagement from "@/components/admin/sales/SalesReturnManagement";

export default async function SalesReturnPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page ?? "1", 10);
  const limit = parseInt(params.limit ?? "10", 10);
  const status = params.status;

  const search =
    typeof params.search === "string" && params.search.trim() !== ""
      ? params.search.trim()
      : undefined;

  const response = await ServerActions.ServerApilib.ssrSalesReturnAPI.getAll(
    page,
    limit,
    search,
    status
  );

  const data = response?.data?.data?.data;
  console.log("salesReturns", data);

  const pagination = response?.data?.data?.pagination || {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: limit,
    hasNext: false,
    hasPrev: false,
  };

  return (
    <PageGuard permissionKey="sales.salesReturn">
      <SalesReturnManagement
        initialSalesReturns={data}
        initialPagination={pagination}
      />
    </PageGuard>
  );
}
