import { WebComponents } from "@/components";
import { ServerActions } from "@/lib/server-lib";
import { PayrollManagementLazy } from "@/components/lazy";
import { PageGuard } from "@/components/guards/page-guard";

export default async function PayrollPage() {
  const [payrollResponse, staffResponse] = await Promise.all([
    ServerActions.ServerApilib.ssrPayrollAPI.getAll(),
    ServerActions.ServerApilib.ssrStaffHRMAPI.getAll(),
  ]);
  const payrolls = payrollResponse?.data || {};
  const staff = staffResponse?.data?.data?.employees || staffResponse?.data?.data || [];

  return (
    <PageGuard permissionKey="hrm.payroll">
      <PayrollManagementLazy
        initialPayrollsPayload={payrolls}
        initialStaffPayload={staff}
      />
    </PageGuard>
  );
}
