import { WebComponents } from "@/components";
import { ServerActions } from "@/lib/server-lib";
import { SearchParams } from "@/types/SearchParams";
import { PaginationInfo } from "@/types/superadmin/BusinessCategory";

export default async function AdminInventoryWarranty({
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
  const isActive = params.isActive;

  const response = await ServerActions.ServerApilib.ssrWarrentyAPI.getAll(page, limit, search, isActive);
  const data = response?.data?.data?.data || [];
  const pagination: PaginationInfo = response?.data?.data?.pagination || {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: limit,
    hasNext: false,
    hasPrev: false,
  };

  return (
    <WebComponents.AdminComponents.AdminWebComponents.InventoryWebComponents.WarrantyComponent
      initialWarranties={data}
      initialPagination={pagination}
    />
  );
}
