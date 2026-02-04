import { ServerActions } from "@/lib/server-lib";
import { WebComponents } from "@/components";
import { SearchParamsTypes } from "@/types"
export default async function LeaveTypesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParamsTypes.SearchParams>
}) {
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);
  const limit = parseInt(params.limit || "10", 10);
  const isActive = params.isActive;
  const search = typeof params.search === "string" && params.search.trim() !== ""
    ? params.search.trim()
    : undefined;

  const response = await ServerActions.ServerApilib.ssrLeaveTypeAPI.getAll(page, limit, search,isActive);
  const data = response?.data?.data?.data || [];
  const pagination = response?.data?.data?.pagination || {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
    hasNext: false,
    hasPrev: false,
  };
  return <WebComponents.AdminComponents.AdminWebComponents.AdminHRMWebComponents.LeaveTypeManagement
    initialLeaveTypePayload={data}
    initialPagination={pagination}

  />;
}
