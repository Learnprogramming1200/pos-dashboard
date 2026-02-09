import { WebComponents } from "@/components";
import { ServerActions } from "@/lib/server-lib";
import { PageGuard } from "@/components/guards/page-guard";

export default async function AdminAttendance() {

  const attendanceRecord = await ServerActions.ServerApilib.ssrAttendanceAPI.getAllAttendanceRecords();
  const attendanceData = attendanceRecord?.data?.data?.data || [];
  const leaveTypeRecord = await ServerActions.ServerApilib.ssrLeaveManagementAPI.getAllLeaveRequests();
  const leaveTypeData = leaveTypeRecord?.data?.data || [];
  const employeesRecord = leaveTypeData.employees;
  const leaveTypeRecordData = leaveTypeData.leaveTypes;
  const storeRecord = leaveTypeData.stores;
  const holidayRecord = await ServerActions.ServerApilib.ssrHolidayAPI.getActive();
  const holidayData = holidayRecord?.data?.data || [];
  return (
    <PageGuard permissionKey="hrm.attendance">
      <WebComponents.AdminComponents.AdminWebComponents.AdminHRMWebComponents.Attendance
        initialAttendanceData={attendanceData}
        initialLeaveData={leaveTypeData.data}
        initialHolidayData={holidayData}
        initialEmployeeData={employeesRecord}
        initialStoreData={storeRecord}
        initialLeaveTypeData={leaveTypeRecordData}
      />
    </PageGuard>
  );
}
