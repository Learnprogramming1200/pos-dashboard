"use client";
import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Plus, ArrowLeft, AlertTriangle, ChevronLeft, ChevronRight, Calendar, Star, CheckCircle2, XCircle, Plane, RotateCcw, } from "lucide-react";
import { ServerActions } from "@/lib";
import { Constants } from "@/constant";
import { WebComponents } from "@/components";
import { customHooks } from "@/hooks";
import { AdminTypes } from "@/types";
interface AttendanceProps {
  initialAttendanceData: any[];
  initialLeaveData: any[];
  initialHolidayData: any[];
  initialEmployeeData: any[];
  initialStoreData: any[];
  initialLeaveTypeData: any[];
}

export default function Attendance({
  initialAttendanceData = [],
  initialLeaveData = [],
  initialHolidayData = [],
  initialEmployeeData = [],
  initialStoreData = [],
  initialLeaveTypeData = [],
}: AttendanceProps) {
  const [attendance, setAttendance] = React.useState<AdminTypes.hrmTypes.attendanceTypes.AttendanceRecord[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [storeFilter, setStoreFilter] = React.useState("All");
  const [currentMonth, setCurrentMonth] = React.useState(new Date());
  const [showModal, setShowModal] = React.useState(false);
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [editingAttendance, setEditingAttendance] = React.useState<AdminTypes.hrmTypes.attendanceTypes.AttendanceRecord | null>(null);
  const [detailInfo, setDetailInfo] = React.useState<{ staffId: string; date: string; } | null>(null);
  const [defaultAddMode, setDefaultAddMode] = React.useState<"attendance" | "leave">("attendance");
  const [refreshTick, setRefreshTick] = React.useState(0);
  const searchParams = useSearchParams();
  const [pageSize, setPageSize] = React.useState(Number(searchParams.get('limit')) || 10);
  const [currentPage, setCurrentPage] = React.useState(Number(searchParams.get('page')) || 1);
  const [leaves, setLeaves] = React.useState<any[]>([]);
  const [leaveTypes, setLeaveTypes] = React.useState<any[]>([]);
  const [holidays, setHolidays] = React.useState<any[]>([]);
  const [employees, setEmployees] = React.useState<any[]>(initialEmployeeData);
  const [stores, setStores] = React.useState<any[]>(initialStoreData);
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user;

  /* Permissions */
  const { checkPermission } = customHooks.useUserPermissions();

  const monthLabel = AdminTypes.hrmTypes.attendanceTypes.getMonthLabel(currentMonth);
  const daysInMonth = AdminTypes.hrmTypes.attendanceTypes.getDaysInMonth(currentMonth);

  const filteredStaff = React.useMemo(() => {
    if (!employees) return [];

    return employees.filter((staff: any) => {
      const matchesSearch =
        !searchTerm ||
        (staff.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (staff.email?.toLowerCase() || "").includes(searchTerm.toLowerCase());

      const matchesStore =
        storeFilter === "All" ||
        (staff.storeName &&
          staff.storeName.toLowerCase().includes(storeFilter.toLowerCase()));

      return matchesSearch && matchesStore;
    });
  }, [employees, searchTerm, storeFilter]);

  const attendanceByKey = React.useMemo(() => {
    const map = new Map<string, AdminTypes.hrmTypes.attendanceTypes.AttendanceRecord>();
    attendance.forEach((record) => {
      map.set(`${record.staffId}-${record.date}`, record);
    });
    return map;
  }, [attendance]);


  const startIdx = (currentPage - 1) * pageSize;
  const endIdx = startIdx + pageSize;
  const paginatedStaff = filteredStaff.slice(startIdx, endIdx);

  React.useEffect(() => {
    setAttendance(initialAttendanceData);
    setLeaves(initialLeaveData);
    setEmployees(initialEmployeeData);
    setStores(initialStoreData);
    setLeaveTypes(initialLeaveTypeData);
    setHolidays(initialHolidayData)
    const activeHolidays = initialHolidayData.filter((holiday: any) => {
      const status = holiday.status;
      return (status === true || status === "Active" || status === "active" || status === undefined);
    });
    setHolidays(activeHolidays);
  }, [initialAttendanceData, initialLeaveData, initialHolidayData, initialEmployeeData, initialStoreData, initialLeaveTypeData]);

  const handleAdd = async (data: any) => {
    const employee = (employees as any[]).find((emp) => emp.id === data.staffId);
    const apiData: any = {
      employeeId: data.staffId,
      attendanceDate: data.date,
      status: data.status,
      storeId: employee.storeId,
      recordedBy: user?.id || undefined,
      notes: data.notes || undefined,
    };
    await ServerActions.HandleFunction.handleAddCommon({
      formData: apiData,
      createAction: ServerActions.ServerActionslib.createAttendanceRecordAction,
      setLoading,
      setShowModal,
      router,
      successMessage: "Attendance record added successfully!",
      errorMessage: "Failed to add attendance record",
      onSuccess: () => setRefreshTick(t => t + 1)
    });
  };

  const handleEdit = async (data: any) => {
    const apiData: any = {
      status: data.status,
      notes: data.notes,
      clockInTime: data.clockIn,
      clockOutTime: data.clockOut,
    };
    await ServerActions.HandleFunction.handleEditCommon({
      formData: apiData,
      editingItem: editingAttendance,
      getId: (item) => item.id!,
      updateAction: (id, formData) => ServerActions.ServerActionslib.correctAttendanceAction(String(id), formData),
      setLoading,
      setShowEditModal,
      setEditingItem: setEditingAttendance,
      router,
      successMessage: "Attendance record updated successfully!",
      errorMessage: "Failed to update attendance record",
      onSuccess: () => setRefreshTick(t => t + 1)
    });
  };

  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-[16px] gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
            {Constants.adminConstants.attendanceManagementStrings.title}
            {showModal || showEditModal ? showModal ? " > Add Attendance" : " > Update Attendance" : ""}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-300">
            {Constants.adminConstants.attendanceManagementStrings.description}
          </p>
        </div>
        {(showModal || showEditModal) && (
          <WebComponents.UiComponents.UiWebComponents.Button
            variant="addBackButton"
            onClick={() => {
              setShowModal(false);
              setShowEditModal(false);
              setEditingAttendance(null);
            }}
          >
            <ArrowLeft className="w-3 h-3 mr-0 inline" />{" "}
            {Constants.adminConstants.back}
          </WebComponents.UiComponents.UiWebComponents.Button>
        )}
      </div>
      {showModal && (
        <WebComponents.UiComponents.UiWebComponents.AdminFormModal
          formId="attendance-form"
          onClose={() => setShowModal(false)}
          loading={loading}
        >
          <WebComponents.AdminComponents.AdminWebComponents.Forms.AttendanceForm
            onClose={() => setShowModal(false)}
            onSubmit={handleAdd}
            isAdd
            initialAddMode={defaultAddMode}
            staffData={employees as any}
            leaveTypesData={[]}
            formId="attendance-form"
          />
        </WebComponents.UiComponents.UiWebComponents.AdminFormModal>
      )}

      {/* Show edit form when edit modal is open */}
      {showEditModal && editingAttendance && (
        <WebComponents.UiComponents.UiWebComponents.AdminFormModal
          formId="attendance-edit-form"
          onClose={() => setShowEditModal(false)}
          loading={loading}
        >
          <WebComponents.AdminComponents.AdminWebComponents.Forms.AttendanceForm
            onClose={() => setShowEditModal(false)}
            onSubmit={handleEdit}
            attendance={editingAttendance}
            staffData={employees as any}
            leaveTypesData={[]}
            formId="attendance-edit-form"
          />
        </WebComponents.UiComponents.UiWebComponents.AdminFormModal>
      )}

      {/* Show main content only when no modals are open */}
      {!showModal && !showEditModal && (
        <>
          {/* Month selector */}
          <div className="mb-4 sm:mb-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              {/* Month selector */}
              <div className="flex items-center gap-2">
                <WebComponents.UiComponents.UiWebComponents.Button
                  variant="ghost"
                  className="flex items-center justify-center h-8 w-8 p-0 dark:hover:bg-[#1E1E1E]"
                  onClick={() => setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
                >
                  <ChevronLeft className="w-4 h-4" />
                </WebComponents.UiComponents.UiWebComponents.Button>
                <div className="flex items-center gap-2 px-3 py-2 rounded-md border border-gray-200 dark:border-darkBorder">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">{monthLabel}</span>
                </div>
                <WebComponents.UiComponents.UiWebComponents.Button
                  variant="ghost"
                  className="flex items-center justify-center h-8 w-8 p-0 dark:hover:bg-[#1E1E1E]"
                  onClick={() =>
                    setCurrentMonth(
                      (prev) =>
                        new Date(prev.getFullYear(), prev.getMonth() + 1, 1),
                    )
                  }
                >
                  <ChevronRight className="w-4 h-4" />
                </WebComponents.UiComponents.UiWebComponents.Button>
                <WebComponents.UiComponents.UiWebComponents.Button
                  variant="outline"
                  className="flex items-center justify-center h-8 w-8 p-0"
                  onClick={() => {
                    setRefreshTick((t) => t + 1);
                  }}
                  title="Refresh"
                  disabled={loading}
                >
                  <RotateCcw
                    className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                  />
                </WebComponents.UiComponents.UiWebComponents.Button>
              </div>

              {/* Add actions */}
              <div className="flex gap-2">
                {checkPermission("hrm.attendance", "create") && (
                  <WebComponents.UiComponents.UiWebComponents.Button
                    className="bg-primary text-white hover:bg-primaryHover h-8 w-40 px-1.5 text-xs whitespace-nowrap"
                    onClick={() => {
                      setDefaultAddMode("attendance");
                      setShowModal(true);
                    }}
                  >
                    <Plus className="w-3 h-3 mr-0" />
                    {Constants.adminConstants.attendanceManagementStrings.addAttendanceLabel}
                  </WebComponents.UiComponents.UiWebComponents.Button>
                )}
                {checkPermission("hrm.leaves", "create") && (
                  <WebComponents.UiComponents.UiWebComponents.Button
                    className="bg-primary text-white hover:bg-primaryHover h-8 w-32 px-1.5 text-xs whitespace-nowrap"
                    onClick={() => router.push("/admin/hrm/leaves/management")}
                  >
                    <Plus className="w-3 h-3 mr-0" />
                    {Constants.adminConstants.attendanceManagementStrings.addLeaveLabel}
                  </WebComponents.UiComponents.UiWebComponents.Button>
                )}
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-col gap-2 bg-white dark:bg-darkFilterbar rounded-t-md border-[1.5px] border-b-0 border-gray-200 dark:border-darkBorder px-2 py-1">
            <div className="flex items-center justify-between gap-2 flex-wrap xl:flex-nowrap">
              {/* Left: Legend */}
              <div className="flex items-center gap-1 flex-wrap text-sm text-gray-600 dark:text-gray-300">
                <span className="font-medium">
                  {Constants.adminConstants.notesLabel}:
                </span>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span>→</span>
                  <span>
                    {Constants.adminConstants.attendanceManagementStrings.holidayLabel}
                  </span>
                </div>
                <span className="text-gray-400">|</span>
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span>→</span>
                  <span>
                    {Constants.adminConstants.attendanceManagementStrings.presentLabel}
                  </span>
                </div>
                <span className="text-gray-400">|</span>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-red-500" />
                  <span>→</span>
                  <span>
                    {Constants.adminConstants.attendanceManagementStrings.halfDayLabel}
                  </span>
                </div>
                <span className="text-gray-400">|</span>
                <div className="flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4 text-yellow-600" />
                  <span>→</span>
                  <span>
                    {Constants.adminConstants.attendanceManagementStrings.lateLabel}
                  </span>
                </div>
                <span className="text-gray-400">|</span>
                <div className="flex items-center gap-1">
                  <XCircle className="w-4 h-4 text-gray-500" />
                  <span>→</span>
                  <span>
                    {Constants.adminConstants.attendanceManagementStrings.absentLabel}
                  </span>
                </div>
                <span className="text-gray-400">|</span>
                <div className="flex items-center gap-1">
                  <Plane className="w-4 h-4 text-red-500" />
                  <span>→</span>
                  <span>
                    {Constants.adminConstants.attendanceManagementStrings.onLeaveLabel}
                  </span>
                </div>
              </div>

              {/* Right: search + filter (filters left, search right) */}
              <div className="flex flex-col lg:flex-row justify-between gap-1 sm:gap-1 items-stretch lg:items-center">
                <div className="flex flex-col sm:flex-row gap-2 lg:gap-4 p-[5px]">
                  <WebComponents.UiComponents.UiWebComponents.FilterDropdown
                    value={storeFilter === "All" ? null : storeFilter}
                    onChange={(e) => setStoreFilter(e.value ?? "All")}
                    options={[
                      {
                        name: Constants.adminConstants.allStoresLabel,
                        value: "All",
                      },
                      ...(stores?.map((store: any) => ({
                        name: store.name,
                        value: store.name,
                      })) || []),
                    ]}
                    optionLabel="name"
                    optionValue="value"
                    placeholder="All Stores"
                    filter={false}
                    showClear={false}
                    className="w-full md:w-30"
                    disabled={false}
                  />
                </div>
                <div className="p-[5px]">
                  <WebComponents.UiComponents.UiWebComponents.SearchBar
                    placeholder="Search by staff name, status, leave type, or notes..."
                    value={searchTerm}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Month Grid */}
          <div className="overflow-x-auto bg-white dark:bg-darkFilterbar border border-gray-200 dark:border-darkBorder border-b-0 rounded-t-md">
            {loading ? (
              <div className="flex justify-center items-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-2 text-gray-600 dark:text-gray-300">
                  {Constants.adminConstants.attendanceManagementStrings.loadingLabel}
                </span>
              </div>
            ) : (
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 dark:bg-darkFilterbar">
                    <th className="sticky left-0 z-10 bg-gray-50 dark:bg-darkFilterbar text-left px-1 py-2 border-b border-gray-200 dark:border-darkBorder w-[48px]">
                      {Constants.adminConstants.attendanceManagementStrings.staff}
                    </th>
                    {daysInMonth.map((d) => {
                      const dayNum = d.getDate();
                      const isToday =
                        dayNum === new Date().getDate() &&
                        d.getMonth() === new Date().getMonth() &&
                        d.getFullYear() === new Date().getFullYear();
                      return (
                        <th
                          key={dayNum}
                          className="text-center px-0 py-0.5 border-b border-gray-200 dark:border-darkBorder text-[10px] text-gray-600 dark:text-gray-300 w-5"
                        >
                          <span
                            className={`inline-flex items-center justify-center w-5 h-5 rounded ${isToday ? "bg-primary text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"}`}
                          >
                            {dayNum}
                          </span>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {paginatedStaff.length === 0 ? (
                    <tr>
                      <td colSpan={daysInMonth.length + 1}>
                        <div className="flex flex-col items-center justify-center py-10 bg-white dark:bg-darkCard">
                          <img
                            src={Constants.assetsIcon.assets.noDataFound.src}
                            alt="No data found"
                            className="w-[120px] h-[120px] object-contain mb-4"
                          />
                          <h3 className="text-lg font-semibold text-textMain dark:text-textDark">
                            {Constants.adminConstants.attendanceManagementStrings.noStaffFound}
                          </h3>
                          <p className="text-sm text-textSecondary dark:text-gray-400 mt-1">
                            {Constants.adminConstants.attendanceManagementStrings.tryAdjustingSearchOrFilters}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : null}
                  {(paginatedStaff as any[]).map((staff: any) => (
                    <tr
                      key={staff.id}
                      className="border-b border-gray-100 dark:border-darkBorder"
                    >
                      <td className="sticky left-0 z-10 bg-white dark:bg-darkFilterbar px-1 py-2 whitespace-nowrap w-[48px]">
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900 dark:text-white truncate text-xs">
                            {(staff.user.name || "").length > 10
                              ? `${(staff.user.name || "").substring(0, 10)}...`
                              : (staff.user.name || "Unknown")}
                          </span>
                        </div>
                      </td>
                      {daysInMonth.map((d: Date) => {
                        const key = `${staff.id}-${AdminTypes.hrmTypes.attendanceTypes.formatYMD(d)}`;
                        const rec = attendanceByKey.get(key);
                        const today = new Date();
                        const isFuture =
                          d.getTime() >
                          new Date(
                            today.getFullYear(),
                            today.getMonth(),
                            today.getDate(),
                          ).getTime();
                        const dateStr = AdminTypes.hrmTypes.attendanceTypes.formatYMD(d);
                        let content: React.ReactNode = (
                          <span className="text-gray-400">-</span>
                        );

                        // Check if this date is a holiday (applies to all employees)
                        const isHoliday =
                          holidays.length > 0 &&
                          holidays.some((holiday: any) => {
                            const status = holiday.status;
                            const isActive = status === true || status === "Active" || status === "active" || status === undefined;
                            if (!isActive) return false;
                            if (holiday.startDate && holiday.endDate) {
                              try {
                                const startDate = new Date(holiday.startDate);
                                const endDate = new Date(holiday.endDate);
                                const currentDate = new Date(dateStr + "T00:00:00");
                                startDate.setHours(0, 0, 0, 0);
                                endDate.setHours(23, 59, 59, 999);
                                currentDate.setHours(0, 0, 0, 0);
                                const isInRange = currentDate >= startDate && currentDate <= endDate;
                                return isInRange;
                              } catch (e) {
                                return false;
                              }
                            }
                            const holidayDate =
                              holiday.date || holiday.startDate;
                            if (!holidayDate) return false;

                            let holidayDateStr: string;
                            try {
                              if (holidayDate instanceof Date) {
                                holidayDateStr = AdminTypes.hrmTypes.attendanceTypes.formatYMD(holidayDate);
                              } else if (typeof holidayDate === "string") {
                                holidayDateStr = holidayDate.includes("T")
                                  ? holidayDate.split("T")[0]
                                  : holidayDate.split(" ")[0];
                                if (
                                  holidayDateStr.length === 10 &&
                                  holidayDateStr.includes("-")
                                ) {
                                } else {
                                  const parsed = new Date(holidayDateStr);
                                  if (!isNaN(parsed.getTime())) {
                                    holidayDateStr = AdminTypes.hrmTypes.attendanceTypes.formatYMD(parsed);
                                  }
                                }
                              } else {
                                return false;
                              }

                              return holidayDateStr === dateStr;
                            } catch (e) {
                              return false;
                            }
                          });
                        const hasLeave = (leaves || []).some((leave: any) => {
                          const employeeId =
                            leave.employeeId?._id ||
                            leave.employeeId?.user?._id ||
                            leave.employee?._id ||
                            leave.employeeId ||
                            leave.employee_id;
                          if (employeeId !== staff.id) return false;
                          const status =
                            leave.status || leave.statusDisplay || "";
                          if (status.toLowerCase() !== "approved") return false;
                          const leaveStartDate = leave.startDate || leave.date;
                          const leaveEndDate = leave.endDate || leave.startDate;
                          if (!leaveStartDate) return false;
                          if (leaveStartDate && leaveEndDate) {
                            const startDate = new Date(leaveStartDate);
                            const endDate = new Date(leaveEndDate);
                            const currentDate = new Date(dateStr);
                            return (
                              currentDate >= startDate && currentDate <= endDate
                            );
                          }
                          const leaveDateStr =
                            leaveStartDate instanceof Date
                              ? AdminTypes.hrmTypes.attendanceTypes.formatYMD(leaveStartDate)
                              : typeof leaveStartDate === "string" &&
                                leaveStartDate.includes("T")
                                ? leaveStartDate.split("T")[0]
                                : leaveStartDate;
                          return leaveDateStr === dateStr;
                        });
                        if (isHoliday) {
                          content = (
                            <Star className={`${AdminTypes.hrmTypes.attendanceTypes.ATTENDANCE_ICON_SIZE} text-yellow-500`} />
                          );
                        } else if (hasLeave) {
                          content = (
                            <Plane className={`${AdminTypes.hrmTypes.attendanceTypes.ATTENDANCE_ICON_SIZE} text-red-500`} />
                          );
                        } else if (rec && rec.status) {
                          const s = (rec.status || "").toString();
                          const statusLower = s.toLowerCase().trim();
                          if (statusLower === "present") {
                            content = (
                              <CheckCircle2 className={`${AdminTypes.hrmTypes.attendanceTypes.ATTENDANCE_ICON_SIZE} text-green-600`} />
                            );
                          } else if (statusLower === "absent" || statusLower === "no_show" || statusLower === "no-show") {
                            content = (
                              <XCircle className={`${AdminTypes.hrmTypes.attendanceTypes.ATTENDANCE_ICON_SIZE} text-gray-500`} />
                            );
                          } else if (statusLower === "late") {
                            content = (
                              <AlertTriangle className={`${AdminTypes.hrmTypes.attendanceTypes.ATTENDANCE_ICON_SIZE} text-yellow-600`} />
                            );
                          } else if (statusLower === "leave" || statusLower === "on leave") {
                            content = (
                              <Plane className={`${AdminTypes.hrmTypes.attendanceTypes.ATTENDANCE_ICON_SIZE} text-red-500`} />
                            );
                          } else if (statusLower === "half day" || statusLower === "half-day" || statusLower === "half_day") {
                            content = (
                              <Star className={`${AdminTypes.hrmTypes.attendanceTypes.ATTENDANCE_ICON_SIZE} text-red-500`} />
                            );
                          } else if (statusLower === "holiday") {
                            content = (
                              <Star className={`${AdminTypes.hrmTypes.attendanceTypes.ATTENDANCE_ICON_SIZE} text-yellow-500`} />
                            );
                          }
                        }

                        const hasRecord = !isFuture && Boolean(rec);
                        return (
                          <td key={AdminTypes.hrmTypes.attendanceTypes.formatYMD(d)} className="text-center px-0 py-1 w-5">
                            <div
                              className={`flex items-center justify-center ${hasRecord ? "cursor-pointer" : "cursor-default"}`}
                              onClick={hasRecord ? () => setDetailInfo({ staffId: staff.id, date: AdminTypes.hrmTypes.attendanceTypes.formatYMD(d), }) : undefined}
                            >
                              {content}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <div className="w-full bg-gray-50 dark:bg-darkFilterbar border-t border-gray-200 dark:border-darkBorder">
            <WebComponents.UiComponents.UiWebComponents.CustomPagination
              totalRecords={filteredStaff.length}
              filteredRecords={filteredStaff.length}
              currentPage={currentPage}
              rowsPerPage={pageSize}
              onPageChange={(page) => setCurrentPage(page)}
              onRowsPerPageChange={(perPage) => {
                setPageSize(perPage);
                setCurrentPage(1);
              }}
              rowsPerPageOptions={[5, 10, 20, 50]}
              useUrlParams={true}
            />
          </div>
        </>
      )}
    </>
  );
}