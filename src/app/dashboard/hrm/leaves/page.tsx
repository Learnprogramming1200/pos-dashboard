import { WebComponents } from "@/components";
import { PageGuard } from "@/components/guards/page-guard";

export default function LeavesPage() {
  return (
    <PageGuard permissionKey="hrm.leaves">
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
    </PageGuard>
  );
}
