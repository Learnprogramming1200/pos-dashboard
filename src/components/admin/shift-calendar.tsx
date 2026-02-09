"use client";

import React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Plus, Heart, X, Pencil, Trash2 } from "lucide-react";
import Image from "next/image";
import { FaUser } from "react-icons/fa6";
import { ServerActions } from "@/lib";
import { WebComponents } from "@/components";
import { AdminTypes } from "@/types";
import { customHooks } from "@/hooks";
import { Constants } from "@/constant";

// Utility functions
const getDaysOfWeek = (selectedDate: Date) => {
  const startOfWeek = new Date(selectedDate);
  const day = startOfWeek.getDay();
  const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(startOfWeek.setDate(diff));

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayKeys = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

  return Array.from({ length: 7 }, (_, i) => {
    const currentDate = new Date(monday);
    currentDate.setDate(monday.getDate() + i);
    const dayIndex = currentDate.getDay();

    return {
      key: dayKeys[dayIndex],
      label: dayNames[dayIndex],
      dateLabel: `${currentDate.getDate()} ${currentDate.toLocaleDateString('en-US', { month: 'short' })} ${currentDate.getFullYear()}`,
      date: new Date(currentDate)
    };
  });
};

const formatYMD = (date: Date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};


const dateToDisplay = (d: Date) => {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
};

const displayToISO = (display: string) => {
  // Handle both ISO format (YYYY-MM-DD) from SingleDatePicker and display format (DD-MM-YYYY)
  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(display || "");
  if (isoMatch) {
    return display; // Already in ISO format
  }
  const displayMatch = /^(\d{2})-(\d{2})-(\d{4})$/.exec(display || "");
  return displayMatch ? `${displayMatch[3]}-${displayMatch[2]}-${displayMatch[1]}` : "";
};

const displayToDate = (display: string) => {
  const iso = displayToISO(display);
  return iso ? new Date(iso) : new Date(NaN);
};

const getDayKeyFromDate = (date: Date) => {
  return ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][date.getDay()];
};

const getCurrentDayKey = () => {
  return getDayKeyFromDate(new Date());
};


export default function ShiftCalendar({
  initialShiftAssignments,
  initialShifts,
  initialLeaveRequests,
  initialAttendanceRecords,
  initialHolidays
}: {
  initialShiftAssignments: AdminTypes.hrmTypes.shiftAssignmentTypes.ShiftAssignmentData[];
  initialShifts: AdminTypes.hrmTypes.shiftTypes.Shift[];
  initialLeaveRequests?: AdminTypes.hrmTypes.leaveTypes.LeaveRequest[];
  initialAttendanceRecords?: AdminTypes.hrmTypes.attendanceTypes.Attendance[];
  initialHolidays: AdminTypes.hrmTypes.holidayTypes.Holiday[];
}) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState(() => {
    const dateParam = searchParams.get('date') || searchParams.get('assignmentDate');
    if (dateParam) {
      const d = displayToDate(dateParam);
      if (!isNaN(d.getTime())) return d;
      const d2 = new Date(dateParam);
      if (!isNaN(d2.getTime())) return d2;
    }
    return new Date();
  });
  const [showAssignShiftModal, setShowAssignShiftModal] = React.useState(false);
  const [selectedStaff, setSelectedStaff] = React.useState<any>(null);
  const [selectedShift, setSelectedShift] = React.useState("");
  const [assignmentDate, setAssignmentDate] = React.useState("");
  const [endDate, setEndDate] = React.useState("");
  const [customWeekOff, setCustomWeekOff] = React.useState<AdminTypes.hrmTypes.commonTypes.WeekDay[]>([]);
  const [showQuickAssignModal, setShowQuickAssignModal] = React.useState(false);
  const [selectedEmployee, setSelectedEmployee] = React.useState<any>(null);
  const [showEndDate, setShowEndDate] = React.useState(false);

  // Initialize filters from URL params
  const [selectedStoreFilter, setSelectedStoreFilter] = React.useState(searchParams.get('storeId') || searchParams.get('store') || "");
  const [selectedShiftFilter, setSelectedShiftFilter] = React.useState(searchParams.get('shiftTypeId') || "");
  const [searchTerm, setSearchTerm] = React.useState(searchParams.get('search') || "");

  const [localShiftAssignments, setLocalShiftAssignments] = React.useState<{ [key: string]: { [dayKey: string]: { status: string, shift: string | null, shiftTypeId?: string } } }>({});
  const [holidays, setHolidays] = React.useState<AdminTypes.hrmTypes.holidayTypes.Holiday[]>(initialHolidays);
  const [selectedDay, setSelectedDay] = React.useState<string>(getCurrentDayKey());
  const [editingAssignmentId, setEditingAssignmentId] = React.useState<string | null>(null);

  // Sync state with props when URL params change (server re-fetches data)
  // React.useEffect(() => {
  //   setHolidays(initialHolidays);
  // }, [initialHolidays]);



  // Sync local filters with URL params
  React.useEffect(() => {
    setSelectedStoreFilter(searchParams.get('storeId') || searchParams.get('store') || "");
    setSelectedShiftFilter(searchParams.get('shiftTypeId') || "");
    setSearchTerm(searchParams.get('search') || "");

    const dateParam = searchParams.get('date') || searchParams.get('assignmentDate');
    if (dateParam) {
      // Use existing displayToDate helper or standard Date constructor
      // displayToDate expects DD-MM-YYYY or YYYY-MM-DD
      const d = displayToDate(dateParam);
      if (!isNaN(d.getTime())) {
        setSelectedDate(d);
        setSelectedDay(getDayKeyFromDate(d));
      } else {
        const d2 = new Date(dateParam);
        if (!isNaN(d2.getTime())) {
          setSelectedDate(d2);
          setSelectedDay(getDayKeyFromDate(d2));
        }
      }
    }
  }, [searchParams]);

  // Helper to update URL params
  const updateUrlParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const attendanceRecords = React.useMemo(() => {
    return Array.isArray(initialAttendanceRecords) ? initialAttendanceRecords : [];
  }, [initialAttendanceRecords]);

  const leaves = React.useMemo(() => {
    return Array.isArray(initialLeaveRequests) ? initialLeaveRequests : [];
  }, [initialLeaveRequests]);

  // Fetch stores, shifts, employees, and shift assignments dynamically
  const { stores, loading: storesLoading } = customHooks.useStores();
  const { shifts, loading: shiftsLoading } = customHooks.useShifts(initialShifts);
  const { employees } = customHooks.useEmployees();
  const { shiftAssignments, refreshShiftAssignments, getAssignmentsForCalendar, getAllAssignmentsForCalendar } = customHooks.useShiftAssignments(initialShiftAssignments);



  // Function to truncate names to 10 characters
  const truncateName = (name: string) => {
    if (!name) return '';
    if (name.length > 10) {
      return name.substring(0, 10) + "...";
    }
    return name;
  };

  const getStatusForDate = React.useCallback((employeeId: string, date: Date) => {
    const dateStr = formatYMD(date);
    const normalizedDate = new Date(date).setHours(0, 0, 0, 0);

    const attendanceReview = attendanceRecords.find(r => {
      const id = r.employeeId?._id || r.employeeId || r.employee?._id || r.staffId;
      return String(id) === String(employeeId) && formatYMD(new Date(r.attendanceDate || r.date)) === dateStr;
    });

    if (attendanceReview) {
      const status = (attendanceReview.statusDisplay || attendanceReview.status || '').toLowerCase().trim();
      if (['present', 'late', 'absent', 'no_show', 'no-show', 'half day', 'half-day', 'half_day'].includes(status)) {
        return { status: status.includes('half') ? 'halfday' : (status.includes('no_show') || status === 'absent') ? 'absent' : status, shift: null };
      }
    }

    const leaveReview = leaves.find(l => {
      // @ts-ignore - Handling potential inconsistent data structure or type definition mismatches
      const id = l.employeeId?.user?._id || l.employeeId?._id || l.employeeId;
      if (String(id) !== String(employeeId) || l.status?.toLowerCase() !== 'approved') return false;
      const start = new Date(l.startDate).setHours(0, 0, 0, 0);
      const end = new Date(l.endDate).setHours(23, 59, 59, 999);
      return normalizedDate >= start && normalizedDate <= end;
    });

    return leaveReview ? { status: 'leave', shift: null } : { status: 'empty', shift: null };
  }, [attendanceRecords, leaves]);

  const currentStaffMembers = React.useMemo(() => {
    if (!employees?.length) return [];
    const currentWeekDates = getDaysOfWeek(selectedDate).map(d => d.date);
    const allDbAssignments = getAllAssignmentsForCalendar(currentWeekDates, shifts);
    const dayKeys = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

    return employees.map(emp => {
      const dbAssignments = allDbAssignments[String(emp._id)] || {};
      const localAssignments = localShiftAssignments[String(emp._id)] || {};
      const staffShifts: any = {};

      currentWeekDates.forEach((date) => {
        const dayKey = dayKeys[date.getDay()];
        const attLeave = getStatusForDate(String(emp._id), date);
        staffShifts[dayKey] = attLeave.status !== 'empty' ? attLeave : (localAssignments[dayKey] || dbAssignments[dayKey] || { status: 'empty', shift: null });
      });

      return {
        id: emp._id,
        name: emp.name,
        avatar: emp.image || null,
        designation: emp.designation,
        branch: emp.storeName,
        storeId: emp.storeId,
        shifts: staffShifts
      };
    });
  }, [employees, shiftAssignments, localShiftAssignments, selectedDate, getAllAssignmentsForCalendar, getStatusForDate]);

  // Filter staff for calendar display based on search and filters
  const displayStaffMembers = React.useMemo(() => {
    let filtered = currentStaffMembers;

    // Filter by store
    if (selectedStoreFilter) {
      filtered = filtered.filter(staff => staff.storeId === selectedStoreFilter);
    }

    // Filter by shift
    if (selectedShiftFilter) {
      const selectedShift = shifts.find(shift => shift.id === selectedShiftFilter);
      if (selectedShift) {
        filtered = filtered.filter(staff => {
          const staffShifts = Object.values(staff.shifts);
          return staffShifts.some((shiftData: any) =>
            shiftData.shift && shiftData.shift.includes(selectedShift.title.charAt(0).toUpperCase())
          );
        });
      }
    }

    // Filter by search term
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(staff => staff.name.toLowerCase().includes(lowerTerm));
    }

    return filtered;
  }, [currentStaffMembers, selectedStoreFilter, selectedShiftFilter, searchTerm, shifts]);





  // Helper function to check if a date is a holiday
  const isDateHoliday = (date: Date): boolean => {
    if (!date || holidays.length === 0) return false;

    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);

    return holidays.some(holiday => {
      // Check if holiday is active
      if (holiday.status !== 'Active') return false;

      // Handle date range holidays
      if (holiday.startDate && holiday.endDate) {
        const startDate = new Date(holiday.startDate);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(holiday.endDate);
        endDate.setHours(23, 59, 59, 999);

        return checkDate >= startDate && checkDate <= endDate;
      }

      // Handle single date holidays (legacy or startDate only)
      const holidayDate = new Date(holiday.startDate || holiday.date);
      holidayDate.setHours(0, 0, 0, 0);

      return checkDate.getTime() === holidayDate.getTime();
    });
  };





  // Handle quick assign shift submission using common CRUD pattern
  const handleQuickAssignSubmit = async () => {
    // Validate that shifts exist before proceeding
    if (shifts.length === 0) {
      WebComponents.UiComponents.UiWebComponents.SwalHelper.error({ text: 'No shift types available. Please create shift types first in Shift Management before assigning shifts to employees.' });
      return;
    }

    if (!selectedEmployee || !selectedShift || !assignmentDate) {
      WebComponents.UiComponents.UiWebComponents.SwalHelper.warning({ text: 'Please fill in all required fields.' });
      return;
    }

    // Find the day key for the assignment date
    const assignmentDateObj = displayToDate(assignmentDate);

    // Validate that the date is valid
    if (isNaN(assignmentDateObj.getTime())) {
      WebComponents.UiComponents.UiWebComponents.SwalHelper.warning({ text: 'Please select a valid assignment date.' });
      return;
    }

    // Check if the date is a holiday
    if (isDateHoliday(assignmentDateObj)) {
      WebComponents.UiComponents.UiWebComponents.SwalHelper.warning({ text: 'Cannot assign shifts on holidays. Please select a different date.' });
      return;
    }

    // If end date is provided, check if any date in the range is a holiday
    if (endDate) {
      const endDateObj = displayToDate(endDate);
      if (!isNaN(endDateObj.getTime())) {
        const currentDate = new Date(assignmentDateObj);
        while (currentDate <= endDateObj) {
          if (isDateHoliday(new Date(currentDate))) {
            WebComponents.UiComponents.UiWebComponents.SwalHelper.warning({ text: 'The selected date range includes holidays. Please select a date range that does not include holidays.' });
            return;
          }
          currentDate.setDate(currentDate.getDate() + 1);
        }
      }
    }

    const dayOfWeek = assignmentDateObj.getDay();
    const dayKeys = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayKey = dayKeys[dayOfWeek];

    // Validate dayKey is valid
    if (!dayKey) {
      console.error('Invalid dayOfWeek calculated:', dayOfWeek, 'from date:', assignmentDate);
      WebComponents.UiComponents.UiWebComponents.SwalHelper.error({ text: 'Error calculating day of week. Please try again.' });
      return;
    }

    // Find the shift details
    const shiftDetails = shifts.find(shift => shift.id === selectedShift);

    // Get the full shift time display
    const shiftTimeDisplay = shiftDetails ?
      `${shiftDetails.title.charAt(0).toUpperCase()} ${shiftDetails.startTime}${shiftDetails.endTime ? ` - ${shiftDetails.endTime}` : ''}` :
      "A 08:00";

    // Get store information
    let storeId = "";
    if (selectedEmployee?.storeId) {
      storeId = selectedEmployee.storeId;
    } else {
      const originalEmployee = employees.find(emp => emp._id === selectedEmployee.id);
      if (originalEmployee?.storeId) {
        storeId = originalEmployee.storeId;
      } else {
        WebComponents.UiComponents.UiWebComponents.SwalHelper.error({ text: 'Error: Employee does not have a valid store assignment. Please ensure the employee is assigned to a store.' });
        return;
      }
    }

    if (!storeId) {
      WebComponents.UiComponents.UiWebComponents.SwalHelper.error({ text: 'Error: Could not find store information. Please try again.' });
      return;
    }

    // Prepare assignment data
    const assignmentData: AdminTypes.hrmTypes.shiftAssignmentTypes.ShiftAssignmentFormData = {
      employeeId: selectedStaff ? selectedStaff.id : selectedEmployee.id,
      employeeName: selectedStaff ? selectedStaff.name : selectedEmployee.name,
      storeId: storeId,
      shiftTypeId: selectedShift,
      assignmentDate: displayToISO(assignmentDate),
      dayOfWeek: dayKey,
      status: "scheduled",
      shiftTime: shiftTimeDisplay,
      endDate: endDate ? displayToISO(endDate) : displayToISO(assignmentDate),
      customWeekOff: customWeekOff ?? []
    };

    if (editingAssignmentId) {
      await handleEditShiftAssignment(assignmentData);
    } else {
      await handleAddShiftAssignment(assignmentData);
    }
  };

  const handleEditClick = (staff: any, date: Date, assignmentId: string, shiftTypeId: string, weekOff: any[]) => {
    // Check if the date is a holiday
    if (isDateHoliday(date)) {
      WebComponents.UiComponents.UiWebComponents.SwalHelper.warning({ text: 'Cannot edit shifts on holidays.' });
      return;
    }

    setSelectedStaff(staff);
    setSelectedEmployee({
      id: staff.id,
      name: staff.name,
      avatar: staff.avatar,
      designation: staff.designation,
      storeId: staff.storeId
    });

    setAssignmentDate(dateToDisplay(date));
    setSelectedShift(shiftTypeId || "");
    setEditingAssignmentId(assignmentId);
    setEndDate("");
    setCustomWeekOff((weekOff || []) as any);
    setShowQuickAssignModal(true);
  };

  // Delete shift assignment
  const handleDeleteShiftAssignment = React.useCallback(async (id: string) => {
    await ServerActions.HandleFunction.handleDeleteCommon({
      id,
      deleteAction: (id: string | number) => ServerActions.ServerActionslib.deleteShiftAssignmentAction(String(id)),
      setLoading,
      router,
      successMessage: "Shift assignment deleted successfully.",
      errorMessage: "Failed to delete shift assignment.",
    });
  }, [router, refreshShiftAssignments]);

  // Edit shift assignment
  const handleEditShiftAssignment = async (formData: AdminTypes.hrmTypes.shiftAssignmentTypes.ShiftAssignmentFormData) => {
    await ServerActions.HandleFunction.handleEditCommon({
      formData,
      editingItem: { id: editingAssignmentId } as any,
      getId: (item) => item.id,
      updateAction: (id: string | number, data) => ServerActions.ServerActionslib.updateShiftAssignmentAction(String(id), data),
      setLoading,
      setShowEditModal: () => setShowQuickAssignModal(false),
      setEditingItem: () => setEditingAssignmentId(null),
      router,
      successMessage: "Shift assignment updated successfully.",
      errorMessage: "Failed to update shift assignment.",
    });
  };

  // Add shift assignment
  const handleAddShiftAssignment = async (formData: AdminTypes.hrmTypes.shiftAssignmentTypes.ShiftAssignmentFormData) => {
    await ServerActions.HandleFunction.handleAddCommon({
      formData,
      createAction: ServerActions.ServerActionslib.createShiftAssignmentAction,
      setLoading,
      setShowModal: (state: boolean) => {
        setShowQuickAssignModal(state);
        if (!state) {
          setSelectedEmployee(null);
          setSelectedShift("");
          setAssignmentDate("");
          setEndDate("");
          setCustomWeekOff([]);
        }
      },
      router,
      successMessage: "Shift assign successfully.",
      errorMessage: "Failed to assign shift assignment.",
      checkExistsError: (errorMsg) => errorMsg.includes('No shift types found') || errorMsg.includes('shift types'),
      existsErrorMessage: 'No shift types found. Please create shift types first in Shift Management before assigning shifts to employees.'
    });
  };

  const statistics = React.useMemo(() => {
    const stats = { totalStaff: displayStaffMembers.length, presentStaff: 0, halfDayStaff: 0, absentStaff: 0, onLeaveStaff: 0 };
    displayStaffMembers.forEach(staff => {
      const status = staff.shifts[selectedDay]?.status;
      if (status === "present" || status === "shift") stats.presentStaff++;
      else if (status === "halfday") stats.halfDayStaff++;
      else if (status === "absent") stats.absentStaff++;
      else if (status === "leave") stats.onLeaveStaff++;
    });
    return stats;
  }, [displayStaffMembers, selectedDay]);




  const getStatusBadge = (status: string, shift: string | null, staff: any, isGlobalHoliday?: boolean, date?: Date, shiftId?: string, shiftTypeId?: string, customWeekOff?: any[]) => {
    const wrap = "relative w-full h-[80px] group"; // uniform cell height

    // If it's a global holiday, always show holiday styling and don't allow shift assignment
    // This overlaps all shifts for that day
    if (isGlobalHoliday) {
      return (
        <div className={wrap}>
          <div className="absolute inset-0 bg-blue-500 dark:bg-blue-400 border-l border-l-blue-300 dark:border-l-blue-400 border-r border-r-blue-300 dark:border-r-blue-400">
            <span className="absolute top-1 right-1 text-[10px] font-medium text-blue-800 dark:text-blue-900">{Constants.adminConstants.shiftAssignmentStrings.Holiday}</span>
          </div>
        </div>
      );
    }

    switch (status) {
      case "holiday":
        return (
          <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-purple-100 dark:bg-purple-200 text-purple-700 dark:text-purple-900 border border-purple-200 dark:border-purple-400">
            <Heart className="w-3 h-3" />
            {shift}
          </div>
        );
      case "present":
        return (
          <div className={wrap}>
            <div className="absolute inset-0 px-2 py-2 bg-green-100 dark:bg-green-200 text-green-800 dark:text-green-900 border border-green-200 dark:border-green-400">
              <span className="absolute top-1 right-1 text-[10px] font-medium">{Constants.adminConstants.shiftAssignmentStrings.Present}</span>
              <div className="w-full h-full flex items-center justify-center">
                {shift && (
                  <span className="px-2 py-1 rounded-full text-xs font-semibold bg-purple-100 dark:bg-purple-200 text-purple-700 dark:text-purple-900 border border-purple-200 dark:border-purple-400">
                    {shift}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      case "late":
        return (
          <div className={wrap}>
            <div className="absolute inset-0 px-2 py-2 bg-yellow-100 dark:bg-yellow-200 text-yellow-800 dark:text-yellow-900 border border-yellow-200 dark:border-yellow-400">
              <span className="absolute top-1 right-1 text-[10px] font-medium">{Constants.adminConstants.shiftAssignmentStrings.Late}</span>
              <div className="w-full h-full flex items-center justify-center">
                {shift && (
                  <span className="px-2 py-1 rounded-full text-xs font-semibold bg-purple-100 dark:bg-purple-200 text-purple-700 dark:text-purple-900 border border-purple-200 dark:border-purple-400">
                    {shift}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      case "absent":
        return (
          <div className={wrap}>
            <div className="absolute inset-0 px-2 py-2 bg-red-100 dark:bg-red-200 text-red-800 dark:text-red-900 border border-red-200 dark:border-red-400">
              <span className="absolute top-1 right-1 text-[10px] font-medium">{Constants.adminConstants.shiftAssignmentStrings.Absent}</span>
            </div>
          </div>
        );
      case "leave":
        return (
          <div className={wrap}>
            <div className="absolute inset-0 px-2 py-2 bg-red-600/20 dark:bg-red-600/20">
              <span className="absolute top-1 right-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-100 dark:bg-red-200 text-red-700 dark:text-red-900 border border-red-200 dark:border-red-400">
                {Constants.adminConstants.shiftAssignmentStrings.Leave}
              </span>
            </div>
          </div>
        );
      case "shift":
        const isPastDate = date ? new Date(date).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0) : false;
        return (
          <div className={wrap}>
            <div className="absolute inset-0 w-full h-full flex items-center justify-center">
              {shift ? (
                <span className="px-2 py-1 rounded-full text-xs font-semibold bg-purple-100 dark:bg-purple-200 text-purple-700 dark:text-purple-900 border border-purple-200 dark:border-purple-400 text-center">
                  {shift}
                </span>
              ) : (
                <span className="px-2 py-1 rounded-full text-xs font-semibold bg-purple-100 dark:bg-purple-200 text-purple-700 dark:text-purple-900 border border-purple-200 dark:border-purple-400 text-center">
                  {Constants.adminConstants.shiftAssignmentStrings.Shift}
                </span>
              )}
              {!isPastDate && (
                <div className="absolute bottom-1 right-1 flex gap-1 ">
                  <button
                    className="p-0.5 bg-gray-200 dark:bg-gray-600 dark:text-white rounded text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (date && staff && shiftId) {
                        handleEditClick(
                          staff,
                          date,
                          shiftId,
                          shiftTypeId || "",
                          customWeekOff || []
                        );
                      }
                    }}
                    title="Edit Shift"
                  >
                    <Pencil className="w-3 h-3" />
                  </button>
                  {shiftId && (
                    <button
                      className="p-0.5 bg-red-100 dark:bg-red-900/40 text-red-400 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 rounded"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteShiftAssignment(shiftId);
                      }}
                      title="Delete Shift"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      case "halfday":
        return (
          <div className={wrap}>
            <div className="absolute inset-0 px-2 py-2 bg-yellow-100 dark:bg-yellow-200 text-yellow-800 dark:text-yellow-900 border border-yellow-200 dark:border-yellow-400">
              <span className="absolute top-1 right-1 text-[10px] font-medium">{Constants.adminConstants.shiftAssignmentStrings.HalfDay}</span>
              <div className="w-full h-full flex items-center justify-center">
                {(() => {
                  const isPastDate = date ? new Date(date).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0) : false;
                  const isDisabled = isPastDate || (date ? isDateHoliday(date) : false);
                  return (
                    <WebComponents.UiWebComponents.UiWebComponents.Button
                      type="button"
                      className={`flex items-center gap-1 text-xs ${isDisabled ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 hover:text-blue-600'}`}
                      onClick={() => date && !isDisabled && handleAssignShiftClick(staff, date)}
                      disabled={isDisabled}
                    >
                      <Plus className="w-3 h-3" />
                      {Constants.adminConstants.shiftAssignmentStrings.AssignShift}
                    </WebComponents.UiWebComponents.UiWebComponents.Button>
                  );
                })()}
              </div>
            </div>
          </div>
        );
      case "empty":
        const isPastDateEmpty = date ? new Date(date).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0) : false;
        const isDisabledEmpty = isPastDateEmpty || (date ? isDateHoliday(date) : false);
        return (
          <div className={wrap}>
            <div className="absolute inset-0">
              <div className="w-full h-full flex items-center justify-center">
                <button
                  type="button"
                  className={`flex items-center gap-1 text-xs disabled:opacity-50 disabled:cursor-not-allowed ${isDisabledEmpty ? 'text-gray-400 cursor-not-allowed' : 'text-gray-500 hover:text-blue-600'}`}
                  onClick={() => date && !isDisabledEmpty && handleAssignShiftClick(staff, date)}
                  disabled={isDisabledEmpty}
                >
                  <Plus className="w-3 h-3" />
                  {Constants.adminConstants.shiftAssignmentStrings.AssignShift}
                </button>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const handleAssignShiftClick = (staff: any, date?: Date) => {
    const checkDate = date || selectedDate;

    // Check if the date is in the past
    const isPastDate = new Date(checkDate).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0);
    if (isPastDate) {
      WebComponents.UiComponents.UiWebComponents.SwalHelper.warning({ text: 'Cannot assign shifts on past dates.' });
      return;
    }

    // Check if the date is a holiday
    if (isDateHoliday(checkDate)) {
      WebComponents.UiComponents.UiWebComponents.SwalHelper.warning({ text: 'Cannot assign shifts on holidays. Please select a different date.' });
      return;
    }

    if (staff) {
      setSelectedStaff(staff);
      setAssignmentDate(dateToDisplay(checkDate));
      setSelectedShift("");
      setEndDate("");
      setCustomWeekOff([]);
      setShowAssignShiftModal(true);
    }
  };

  // Effect to initialize custom weekOff days when shift is selected
  React.useEffect(() => {
    if (selectedShift) {
      const shiftDetails = shifts.find(shift => shift.id === selectedShift);
      if (shiftDetails && shiftDetails.weekOff) {
        setCustomWeekOff([...(shiftDetails.weekOff || [])]);
      } else {
        setCustomWeekOff([]);
      }
    }
  }, [selectedShift, shifts]);


  // Handle assign shift submit using common CRUD pattern (inline form)
  const handleAssignShiftSubmit = async () => {
    // Validate that shifts exist before proceeding
    if (shifts.length === 0) {
      WebComponents.UiComponents.UiWebComponents.SwalHelper.error({ text: 'No shift types available. Please create shift types first in Shift Management before assigning shifts to employees.' });
      return;
    }

    if (!selectedStaff || !selectedShift || !assignmentDate) {
      WebComponents.UiComponents.UiWebComponents.SwalHelper.warning({ text: 'Please fill in all required fields.' });
      return;
    }

    // Find the day key for the assignment date
    const assignmentDateObj = displayToDate(assignmentDate);

    // Validate that the date is valid
    if (isNaN(assignmentDateObj.getTime())) {
      WebComponents.UiComponents.UiWebComponents.SwalHelper.warning({ text: 'Please select a valid assignment date.' });
      return;
    }

    // Check if the date is a holiday
    if (isDateHoliday(assignmentDateObj)) {
      WebComponents.UiComponents.UiWebComponents.SwalHelper.warning({ text: 'Cannot assign shifts on holidays. Please select a different date.' });
      return;
    }

    // If end date is provided, check if any date in the range is a holiday
    if (endDate) {
      const endDateObj = displayToDate(endDate);
      if (!isNaN(endDateObj.getTime())) {
        const currentDate = new Date(assignmentDateObj);
        while (currentDate <= endDateObj) {
          if (isDateHoliday(new Date(currentDate))) {
            WebComponents.UiComponents.UiWebComponents.SwalHelper.warning({ text: 'The selected date range includes holidays. Please select a date range that does not include holidays.' });
            return;
          }
          currentDate.setDate(currentDate.getDate() + 1);
        }
      }
    }

    const dayOfWeek = assignmentDateObj.getDay();
    const dayKeys = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayKey = dayKeys[dayOfWeek];

    // Validate dayKey is valid
    if (!dayKey) {
      console.error('Invalid dayOfWeek calculated:', dayOfWeek, 'from date:', assignmentDate);
      WebComponents.UiComponents.UiWebComponents.SwalHelper.error({ text: 'Error calculating day of week. Please try again.' });
      return;
    }

    // Find the shift details
    const shiftDetails = shifts.find(shift => shift.id === selectedShift);

    // Get the full shift time display
    const shiftTimeDisplay = shiftDetails ?
      `${shiftDetails.title.charAt(0).toUpperCase()} ${shiftDetails.startTime}${shiftDetails.endTime ? ` - ${shiftDetails.endTime}` : ''}` :
      "A 08:00";

    // Get store information
    let storeId = "";
    if (selectedStaff?.storeId) {
      storeId = selectedStaff.storeId;
    } else {
      const originalStaff = employees.find(emp => emp._id === selectedStaff.id);
      if (originalStaff?.storeId) {
        storeId = originalStaff.storeId;
      } else {
        WebComponents.UiComponents.UiWebComponents.SwalHelper.error({ text: 'Error: Staff member does not have a valid store assignment. Please ensure the staff member is assigned to a store.' });
        return;
      }
    }

    if (!storeId) {
      WebComponents.UiComponents.UiWebComponents.SwalHelper.error({ text: 'Error: Could not find store information. Please try again.' });
      return;
    }

    // Prepare assignment data
    const assignmentData = {
      employeeId: selectedStaff.id,
      employeeName: selectedStaff.name,
      storeId: storeId,
      shiftTypeId: selectedShift,
      assignmentDate: displayToISO(assignmentDate),
      dayOfWeek: dayKey,
      status: "scheduled",
      shiftTime: shiftTimeDisplay,
      endDate: endDate ? displayToISO(endDate) : displayToISO(assignmentDate),
      customWeekOff: customWeekOff
    };

    // Use common CRUD function for adding
    await ServerActions.HandleFunction.handleAddCommon({
      formData: assignmentData,
      createAction: ServerActions.ServerActionslib.createShiftAssignmentAction,
      setLoading,
      setShowModal: setShowAssignShiftModal,
      router,
      successMessage: "Shift assignment created successfully.",
      errorMessage: "Failed to create shift assignment.",
      onSuccess: () => refreshShiftAssignments(),
      checkExistsError: (errorMsg) => errorMsg.includes('No shift types found') || errorMsg.includes('shift types'),
      existsErrorMessage: 'No shift types found. Please create shift types first in Shift Management before assigning shifts to employees.'
    });
  };


  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
            {Constants.adminConstants.shiftAssignmentStrings.ShiftCalendar}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-300">{Constants.adminConstants.shiftAssignmentStrings.ShiftCalendarDescription}</p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">


          <WebComponents.UiComponents.UiWebComponents.Button
            variant="addBackButton"
            onClick={() => {
              setAssignmentDate(dateToDisplay(selectedDate));
              setEndDate("");
              setSelectedEmployee(null);
              setSelectedShift("");
              setCustomWeekOff([]);
              setShowQuickAssignModal(true);
            }}
          >
            <Plus className="w-4 h-4" />
            {Constants.adminConstants.shiftAssignmentStrings.Assign}
          </WebComponents.UiComponents.UiWebComponents.Button>
        </div>
      </div>

      {/* Filters and Table Container */}
      <div className="bg-white dark:bg-darkFilterbar rounded-[4px] h-full w-full mt-4 overflow-hidden">

        <div className="flex flex-col lg:flex-row justify-between gap-3 sm:gap-4 items-stretch lg:items-center p-3">
          <div className="flex flex-col sm:flex-row gap-2 lg:gap-3 items-center w-full">
            <WebComponents.UiComponents.UiWebComponents.FilterDropdown
              value={selectedStoreFilter}
              onChange={(e) => updateUrlParam('storeId', e.value ?? '')}
              options={[
                { name: 'All Stores', value: '' },
                ...stores.map(store => ({
                  name: store.name,
                  value: store.id
                }))
              ]}
              optionLabel="name"
              optionValue="value"
              placeholder="All Stores"
              filter={false}
              showClear={false}
              className="w-full sm:w-40"
              disabled={storesLoading}
            />
            <WebComponents.UiComponents.UiWebComponents.FilterDropdown
              value={selectedShiftFilter === '' ? null : selectedShiftFilter}
              onChange={(e) => updateUrlParam('shiftTypeId', e.value ?? '')}
              options={[
                { name: 'All Shifts', value: '' },
                ...shifts
                  .filter(shift => String(shift.status) === "Active")
                  .map(shift => ({
                    name: shift.title,
                    value: shift.id
                  }))
              ]}
              optionLabel="name"
              optionValue="value"
              placeholder="All Shifts"
              filter={false}
              showClear={false}
              className="w-full sm:w-40"
              disabled={shiftsLoading}
            />
            {(() => {
              const yyyy = selectedDate.getFullYear();
              const mm = String(selectedDate.getMonth() + 1).padStart(2, '0');
              const dd = String(selectedDate.getDate()).padStart(2, '0');
              const isoDate = `${yyyy}-${mm}-${dd}`;

              return (
                <div className="w-full sm:w-[220px]">
                  <WebComponents.UiComponents.UiWebComponents.SingleDatePicker
                    value={isoDate}
                    forceFormat="DD-MM-YYYY"
                    onChange={(v) => {
                      if (!v) return;
                      const [y, m, d] = v.split('-').map(Number);
                      const newDate = new Date(y, m - 1, d);

                      if (!isNaN(newDate.getTime())) {
                        setSelectedDate(newDate);
                        setSelectedDay(getDayKeyFromDate(newDate));
                        updateUrlParam('date', v);
                      }
                    }}
                  />
                </div>
              );
            })()}
            {(selectedStoreFilter || selectedShiftFilter || searchTerm) && (
              <WebComponents.UiComponents.UiWebComponents.Button
                variant="outline"
                onClick={() => {
                  router.push(pathname);
                }}
                className="flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                {Constants.adminConstants.shiftAssignmentStrings.ClearFilters}
              </WebComponents.UiComponents.UiWebComponents.Button>
            )}
          </div>

          <div className="w-full lg:w-72 mt-2 lg:mt-0">
            <WebComponents.UiComponents.UiWebComponents.SearchBar
              placeholder="Search staff..."
              value={searchTerm}
              onChange={(e) => updateUrlParam('search', e.target.value)}
            />
          </div>
        </div>

        {/* Statistics */}
        <div className="p-2 dark:bg-[#616161]">
          <div className="flex flex-wrap gap-6 text-sm justify-between items-center">
            <div className="flex flex-wrap gap-6 text-sm">
              <span className="text-gray-600 dark:text-gray-300 flex items-center gap-2">
                {Constants.adminConstants.shiftAssignmentStrings.TotalStaff}:
                <span className="w-6 h-6 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center text-black dark:text-white font-semibold text-xs">
                  {statistics.totalStaff}
                </span>
              </span>
              <span className="text-gray-600 dark:text-gray-300 flex items-center gap-2">
                {Constants.adminConstants.shiftAssignmentStrings.PresentStaff}:
                <span className="w-6 h-6 bg-green-200 dark:bg-green-300 rounded flex items-center justify-center text-black font-semibold text-xs">
                  {statistics.presentStaff.toString().padStart(2, '0')}
                </span>
              </span>
              <span className="text-gray-600 dark:text-gray-300 flex items-center gap-2">
                {Constants.adminConstants.shiftAssignmentStrings.HalfDay}:
                <span className="w-6 h-6 bg-yellow-200 dark:bg-yellow-300 rounded flex items-center justify-center text-black font-semibold text-xs">
                  {statistics.halfDayStaff.toString().padStart(2, '0')}
                </span>
              </span>
              <span className="text-gray-600 dark:text-gray-300 flex items-center gap-2">
                {Constants.adminConstants.shiftAssignmentStrings.AbsentStaff}:
                <span className="w-6 h-6 bg-red-200 dark:bg-red-300 rounded flex items-center justify-center text-black font-semibold text-xs">
                  {statistics.absentStaff.toString().padStart(2, '0')}
                </span>
              </span>
              <span className="text-gray-600 dark:text-gray-300 flex items-center gap-2">
                {Constants.adminConstants.shiftAssignmentStrings.Leave}:
                <span className="w-6 h-6 bg-orange-200 dark:bg-red-300 rounded flex items-center justify-center text-black font-semibold text-xs">
                  {statistics.onLeaveStaff.toString().padStart(2, '0')}
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="overflow-x-auto">

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100 dark:bg-[#1F1F1F] border-b border-gray-200 dark:border-gray-600">
                  <th className="px-2 py-4 text-center text-sm font-medium text-gray-900 dark:text-white min-w-[150px] border-r border-gray-200 dark:border-gray-600">Staff</th>
                  {getDaysOfWeek(selectedDate).map((day) => {
                    const isToday = new Date().toDateString() === day.date.toDateString();
                    return (
                      <th key={day.key} className={`px-4 py-4 text-center text-sm font-medium text-gray-900 dark:text-white min-w-[150px] border-r border-gray-200 dark:border-gray-600 ${isToday ? 'bg-blue-100 dark:bg-blue-900/50' : ''}`}>
                        <div className="flex flex-col">
                          <div className="text-xs">{day.label}</div>
                          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">{day.dateLabel}</div>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {displayStaffMembers.map((staff, index) => (
                  <tr key={staff.id} className={`${index % 2 === 0 ? 'bg-white dark:bg-[#1F1F1F]' : 'bg-gray-50 dark:bg-[#1F1F1F]'} border-b border-gray-200 dark:border-gray-600`}>
                    <td className="px-3 py-1 border-r border-gray-200 dark:border-gray-600">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {staff.avatar ? (
                            <Image src={staff.avatar} alt={staff.name} width={32} height={32} className="w-8 h-8 rounded-full object-cover" />
                          ) : (
                            <FaUser className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[100px]" title={staff.name}>{truncateName(staff.name)}</div>
                        </div>
                      </div>
                    </td>
                    {getDaysOfWeek(selectedDate).map((day) => {
                      const isGlobalHoliday = !!(day.date && isDateHoliday(day.date));
                      const isToday = new Date().toDateString() === day.date.toDateString();

                      const tdClass = `p-0 align-middle text-center border-r border-gray-200 dark:border-gray-600 last:border-r-0 ${isGlobalHoliday ? 'bg-blue-50 dark:bg-blue-900/40' : (isToday ? 'bg-blue-50 dark:bg-blue-900/20' : '')}`;
                      return (
                        <td key={day.key} className={tdClass}>
                          {getStatusBadge(
                            isGlobalHoliday ? 'holiday' : staff.shifts[day.key as keyof typeof staff.shifts].status,
                            isGlobalHoliday ? null : staff.shifts[day.key as keyof typeof staff.shifts].shift,
                            staff,
                            isGlobalHoliday,
                            day.date,
                            isGlobalHoliday ? null : staff.shifts[day.key as keyof typeof staff.shifts].id,
                            isGlobalHoliday ? undefined : staff.shifts[day.key as keyof typeof staff.shifts].shiftTypeId,
                            isGlobalHoliday ? undefined : staff.shifts[day.key as keyof typeof staff.shifts].customWeekOff
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </div>

      {/* Assign Shift Modal */}
      {showAssignShiftModal && selectedStaff && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1F1F1F] w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg p-4 sm:p-6 shadow-xl relative">
            <div className="flex justify-between items-center border-b pb-3 mb-4 border-gray-200 dark:border-gray-700">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">{Constants.adminConstants.shiftAssignmentStrings.AssignShift}</h2>
              <button
                onClick={() => setShowAssignShiftModal(false)}
                className="text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white text-2xl"
              >
                &times;
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleAssignShiftSubmit(); }} className="space-y-4">

              {/* Employee Selection */}
              <div>
                <label className="text-sm font-medium text-gray-900 dark:text-white">{Constants.adminConstants.shiftAssignmentStrings.Employee}</label>
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                      {selectedStaff.avatar ? (
                        <Image
                          src={selectedStaff.avatar}
                          alt={selectedStaff.name}
                          width={40}
                          height={40}
                          className="w-10 h-10 rounded-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <div className={`w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-semibold text-sm ${selectedStaff.avatar ? 'hidden' : ''}`}>
                        {selectedStaff.name.split(' ').map((n: string) => n[0]).join('')}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{selectedStaff.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{selectedStaff.designation}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Shift Selection */}
              <div>
                <label className="text-sm font-medium text-gray-900 dark:text-white">{Constants.adminConstants.shiftAssignmentStrings.ShiftTitle}</label>
                <select
                  value={selectedShift}
                  onChange={(e) => setSelectedShift(e.target.value)}
                  className="h-[44px] w-full rounded-[4px] border-[0.6px] border-[#D8D9D9] dark:border-gray-600 bg-textMain2 dark:bg-gray-800 pl-3 pr-3 text-textMain dark:text-white font-interTight font-medium text-sm leading-[14px] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500"
                  required
                  disabled={shiftsLoading}
                >
                  <option value="">
                    {shiftsLoading ? "Loading shifts..." : "Select shift"}
                  </option>
                  {shifts.filter(shift => String(shift.status) === 'Active')
                    .map((shift) => (
                      <option key={shift.id} value={shift.id} className="dark:text-white dark:bg-gray-800">
                        {shift.title} ({shift.startTime} - {shift.endTime})
                      </option>
                    ))}
                </select>
              </div>

              {/* Assignment Dates */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-900 dark:text-white h-[44px]">{Constants.adminConstants.shiftAssignmentStrings.AssignmentDate}</label>
                  <div className="flex items-center gap-3">
                    {!showEndDate ? (
                      <div className="flex-1">
                        <WebComponents.UiComponents.UiWebComponents.SingleDatePicker value={assignmentDate} onChange={(v) => setAssignmentDate(v)} />
                      </div>
                    ) : (
                      <div className="flex-1">
                        <WebComponents.UiComponents.UiWebComponents.DateRangePicker
                          start={assignmentDate}
                          end={endDate || assignmentDate}
                          onChange={({ start, end }) => {
                            setAssignmentDate(start);
                            setEndDate(end);
                          }}
                          placeholders={{ start: "DD-MM-YYYY", end: "DD-MM-YYYY" }}
                        />
                      </div>
                    )}
                    <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showEndDate}
                        onChange={(e) => {
                          setShowEndDate(e.target.checked);
                          if (!e.target.checked) {
                            setEndDate("");
                          }
                        }}
                        className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-primary focus:ring-primary focus:ring-2 cursor-pointer accent-primary"
                      />
                      <span>{Constants.adminConstants.shiftAssignmentStrings.EndDate}</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Days Off */}
              {selectedShift && (
                <div>
                  <label className="text-sm font-medium text-gray-900 dark:text-white mb-2 block">{Constants.adminConstants.shiftAssignmentStrings.DaysOff}</label>
                  <div className="flex flex-wrap gap-3">
                    {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, index) => {
                      const isWeekOff = customWeekOff.includes(day as AdminTypes.hrmTypes.commonTypes.WeekDay);
                      return (
                        <label key={day} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isWeekOff}
                            onChange={(e) => {
                              const dayAsWeekDay = day as AdminTypes.hrmTypes.commonTypes.WeekDay;
                              if (e.target.checked) {
                                // Add to weekOff days (make it a day off)
                                setCustomWeekOff(prev => [...prev, dayAsWeekDay]);
                              } else {
                                // Remove from weekOff days (make it a working day)
                                setCustomWeekOff(prev => prev.filter(d => d !== dayAsWeekDay));
                              }
                            }}
                            className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-primary focus:ring-primary focus:ring-2 cursor-pointer accent-primary"
                          />
                          <span className={`text-sm ${isWeekOff ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-500 dark:text-gray-400'}`}>
                            {day}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {Constants.adminConstants.shiftAssignmentStrings.CheckDaysOffUncheckWorkingDays}
                  </p>
                </div>
              )}


              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
                <WebComponents.UiComponents.UiWebComponents.Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAssignShiftModal(false)}
                  className="w-full sm:w-auto"
                >
                  {Constants.adminConstants.cancel}
                </WebComponents.UiComponents.UiWebComponents.Button>
                <WebComponents.UiComponents.UiWebComponents.Button
                  type="submit"
                  className="bg-primary hover:bg-primaryHover text-white w-full sm:w-auto"
                >
                  {Constants.adminConstants.save}
                </WebComponents.UiComponents.UiWebComponents.Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Assign Shift Modal */}
      {showQuickAssignModal && (
        <WebComponents.AdminComponents.AdminWebComponents.Models.QuickAssignShiftModal
          employees={employees}
          shifts={shifts}
          shiftsLoading={shiftsLoading}

          selectedEmployee={selectedEmployee}
          selectedShift={selectedShift}
          assignmentDate={assignmentDate}
          endDate={endDate}
          showEndDate={showEndDate}
          customWeekOff={customWeekOff}

          setSelectedEmployee={setSelectedEmployee}
          setSelectedShift={setSelectedShift}
          setAssignmentDate={setAssignmentDate}
          setEndDate={setEndDate}
          setShowEndDate={setShowEndDate}
          setCustomWeekOff={setCustomWeekOff}

          onSubmit={handleQuickAssignSubmit}
          onClose={() => setShowQuickAssignModal(false)}
          onDelete={editingAssignmentId ? () => {
            handleDeleteShiftAssignment(editingAssignmentId);
            setShowQuickAssignModal(false);
            setEditingAssignmentId(null);
          } : undefined}

        />
      )}
    </>
  );
}
