import { ServerActions } from "@/lib/server-lib";
import { SearchParams } from "@/types/SearchParams";
import { PageGuard } from "@/components/guards/page-guard";
// Direct import for better code-splitting
import UnitsComponent from "@/components/admin/inventory/unit";

export default async function AdminInventoryUnit({
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

  const response = await ServerActions.ServerApilib.ssrUnitAPI.getAll(page, limit, search, isActive);
  const data = response?.data?.data?.data || [];
  const pagination = response?.data?.data?.pagination || {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: limit,
    hasNext: false,
    hasPrev: false,
  };
  return (
    <PageGuard permissionKey="inventory.units">
      <UnitsComponent
        initialUnits={data}
        initialPagination={pagination}
      />
    </PageGuard>
  );
}
