import { WebComponents } from "@/components";
import { ServerActions } from "@/lib/server-lib";
import { SearchParamsTypes } from "@/types"
import { PageGuard } from "@/components/guards/page-guard";
export default async function AdminShiftManagement({ searchParams }: { searchParams: Promise<SearchParamsTypes.SearchParams> }) {

  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);
  const limit = parseInt(params.limit || "10", 10);
  const isActive = params.isActive;
  const search = typeof params.search === "string" && params.search.trim() !== ""
    ? params.search.trim() : undefined;
  const response = await ServerActions.ServerApilib.ssrShiftAPI.getAll(page, limit, search, isActive);
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
    <PageGuard permissionKey="hrm.shifts">
      <WebComponents.AdminComponents.AdminWebComponents.AdminHRMWebComponents.ShiftManagement
        initialShiftData={data}
        initialPagination={pagination}
      />
    </PageGuard>
  );
}
