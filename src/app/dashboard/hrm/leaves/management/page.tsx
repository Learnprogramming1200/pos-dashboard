import { WebComponents } from "@/components";
import { ServerActions } from "@/lib/server-lib";
import { SearchParamsTypes } from "@/types"
import { PageGuard } from "@/components/guards/page-guard";

export default async function LeaveAssignmentPage({ searchParams }: {
  searchParams: Promise<SearchParamsTypes.SearchParams>
}) {
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);
  const limit = parseInt(params.limit || "10", 10);
  const status = params.status
  const storeId = params.storeId;
  // const isActive = params.isActive;
  const search = typeof params.search === "string" && params.search.trim() !== ""
    ? params.search.trim()
    : undefined;

  const leaveRequestsRes = await ServerActions.ServerApilib.ssrLeaveManagementAPI.getAllLeaveRequests(page, limit, search, status, storeId)
  const storesData = leaveRequestsRes?.data?.data?.stores || [];
  // const employees = employeesRes?.data?.data || [];
  const employees = leaveRequestsRes?.data?.data?.employees || [];
  const leaveTypes = leaveRequestsRes?.data?.data?.leaveTypes || [];
  const leaveRequests = leaveRequestsRes?.data?.data?.data || [];
  const leaveRequestPagination = leaveRequestsRes?.data?.data?.pagination || {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
    hasNext: false,
    hasPrev: false,
  }
  return (
    <PageGuard permissionKey="hrm.leaves">
      <WebComponents.AdminComponents.AdminWebComponents.AdminHRMWebComponents.LeaveManagement
        initialStoresPayload={storesData}
        initialLeaveTypesPayload={leaveTypes}
        // initialLeaveRequestsPayload={actiiveLeaveRequests}
        initialLeaveRequestsPayload={leaveRequests}
        initialEmployeesPayload={employees}
        initialPagination={leaveRequestPagination}
      />
    </PageGuard>
  );
}
