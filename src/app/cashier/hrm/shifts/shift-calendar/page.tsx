import { WebComponents } from "@/components";
import { ServerActions } from "@/lib/server-lib";
import { SearchParams } from "@/types/SearchParams";

export default async function ShiftCalendarPage({
    searchParams,
}: {
    searchParams: Promise<SearchParams>;
}) {
    const params = await searchParams;
    const page = parseInt(params.page || '1', 10);
    const limit = parseInt(params.limit || '1000', 10);

    const search = typeof params.search === "string" && params.search.trim() !== ""
        ? params.search.trim()
        : undefined;

    const storeId = typeof params.storeId === "string" && params.storeId.trim() !== ""
        ? params.storeId.trim()
        : (typeof params.store === "string" && params.store.trim() !== "" ? params.store.trim() : undefined);

    const shiftTypeId = typeof params.shiftTypeId === "string" && params.shiftTypeId.trim() !== ""
        ? params.shiftTypeId.trim()
        : undefined;

    const assignmentDate = typeof params.assignmentDate === "string" && params.assignmentDate.trim() !== ""
        ? params.assignmentDate.trim()
        : (typeof params.date === "string" && params.date.trim() !== "" ? params.date.trim() : undefined);

    // Fetch shift assignments
    const assignmentsResponse = await ServerActions.ServerApilib.ssrShiftAssignmentAPI.getAll({
        page,
        limit,
        search,
        storeId,
        shiftTypeId,
        assignmentDate,
    });
    const assignmentsData = assignmentsResponse?.data?.data?.data?.data ||
        assignmentsResponse?.data?.data?.data ||
        assignmentsResponse?.data?.shifts ||
        assignmentsResponse?.data?.assignments ||
        assignmentsResponse?.data?.result ||
        assignmentsResponse?.data || [];


    // Fetch shift types
    const shiftsResponse = await ServerActions.ServerApilib.ssrShiftAPI.getAll();
    const shiftsData = shiftsResponse?.data?.data?.data ||
        shiftsResponse?.data?.data ||
        shiftsResponse?.data?.shifts ||
        shiftsResponse?.data?.result ||
        shiftsResponse?.data || [];

    // Fetch leave requests
    const leavesResponse = await ServerActions.ServerActionslib.getAllLeaveRequestsAction({ page: 1, limit: 1000 });
    const leavesData = leavesResponse?.success && leavesResponse?.data
        ? (leavesResponse.data?.data?.data?.data ||
            leavesResponse.data?.data?.data ||
            leavesResponse.data?.data ||
            leavesResponse.data || [])
        : [];

    // Fetch attendance records
    const attendanceResponse = await ServerActions.ServerApilib.ssrAttendanceAPI.getAllAttendanceRecords();
    const attendanceData = attendanceResponse?.data?.data?.data?.data ||
        attendanceResponse?.data?.data?.data ||
        attendanceResponse?.data?.data ||
        attendanceResponse?.data || [];
    // Fetch holidays
    let holidaysResponse = await ServerActions.ServerApilib.ssrHolidayAPI.getAll();
    const holidaysData = holidaysResponse?.data?.data?.data?.holidays ||
        holidaysResponse?.data?.data?.holidays ||
        holidaysResponse?.data?.holidays ||
        holidaysResponse?.data?.data ||
        holidaysResponse?.data || [];
    return (
        <WebComponents.AdminComponents.AdminWebComponents.ShiftCalendar
            initialShiftAssignments={assignmentsData}
            initialShifts={shiftsData}
            initialLeaveRequests={leavesData}
            initialAttendanceRecords={attendanceData}
            initialHolidays={holidaysData}
        />
    );
}
