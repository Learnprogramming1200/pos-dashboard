import { WebComponents } from "@/components";

export default function LeavesPage() {
  return (
    <WebComponents.AdminComponents.AdminWebComponents.AdminHRMWebComponents.LeaveManagement 
      initialStoresPayload={[]}
      initialLeaveTypesPayload={[]}
      initialLeaveRequestsPayload={[]}
      initialEmployeesPayload={[]}
      initialPagination={{
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 10,
        hasNext: false,
        hasPrev: false,
      }}
    />
  );
}
