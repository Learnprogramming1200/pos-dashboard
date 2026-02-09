"use client";
import React from "react";
import Image from "next/image";
import { ChevronDown, CheckCircle2, X } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { ServerActions } from "@/lib";
import { WebComponents } from "@/components";
import { AdminTypes } from "@/types";
import { FaUser as FaUserIcon } from "react-icons/fa6";
import { attendanceFormSchema } from "@/app/validation/ValidationSchema";
import { Constants } from "@/constant";

type FormData = Yup.InferType<typeof attendanceFormSchema>;

interface AttendanceFormProps {
    title?: string; // Optional as wrapper might handle title
    onClose?: () => void;
    onSubmit: (data: any) => void;
    isAdd?: boolean;
    attendance?: AdminTypes.hrmTypes.attendanceTypes.AttendanceRecord | null;
    initialAddMode?: "attendance" | "leave";
    staffData?: AdminTypes.hrmTypes.attendanceTypes.StaffMember[];
    leaveTypesData?: AdminTypes.hrmTypes.attendanceTypes.LeaveType[];
    shiftsData?: any[];
    formId?: string;
}

const AttendanceForm = ({
    onSubmit,
    attendance,
    initialAddMode = "attendance",
    staffData = [],
    leaveTypesData = [],
    shiftsData = [],
    formId,
}: AttendanceFormProps) => {

    // Shifts state
    const [shifts, setShifts] = React.useState<any[]>([]);
    const [shiftsLoading, setShiftsLoading] = React.useState(false);
    const [assignedShiftId, setAssignedShiftId] = React.useState<string | null>(null);
    const [assignedShiftName, setAssignedShiftName] = React.useState<string | null>(null);
    const [assignedShiftDetails, setAssignedShiftDetails] = React.useState<{
        startTime?: string;
        endTime?: string;
    } | null>(null);
    const [assignedShiftAssignmentId, setAssignedShiftAssignmentId] = React.useState<string | null>(null);
    const [assignedShiftTypeId, setAssignedShiftTypeId] = React.useState<string | null>(null);
    const [checkingAssignment, setCheckingAssignment] = React.useState(false);

    // Employee search state
    const [employeeSearch, setEmployeeSearch] = React.useState("");
    const [filteredEmployees, setFilteredEmployees] = React.useState<any[]>([]);
    const [selectedEmployee, setSelectedEmployee] = React.useState<any>(null);
    const employeeSearchRef = React.useRef<HTMLDivElement>(null);

    type FormData = Yup.InferType<typeof attendanceFormSchema>;

    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
        setValue,
        watch,
    } = useForm<FormData>({
        resolver: yupResolver(attendanceFormSchema) as any,
        defaultValues: {
            staffId: attendance?.staffId || "",
            date: attendance?.date || new Date().toISOString().split("T")[0],
            clockIn: attendance?.clockIn || "",
            clockOut: attendance?.clockOut || "",
            notes: attendance?.notes || "",
            leaveTypeId: attendance?.leaveTypeId || "",
            shiftId: "",
            addMode: initialAddMode,
        },
    });

    const watchedAddMode = watch("addMode");
    const watchedStaffId = watch("staffId");
    const watchedDate = watch("date");
    const watchedShiftId = watch("shiftId");
    const watchedClockIn = watch("clockIn");
    const watchedClockOut = watch("clockOut");

    // Initialize with shifts data if provided
    React.useEffect(() => {
        if (shiftsData && shiftsData.length > 0) {
            const normalizedShifts = shiftsData.map((shift: any) => ({
                id: shift.id || shift._id || "",
                name: shift.title || shift.name || "",
                startTime: shift.startTime || "",
                endTime: shift.endTime || "",
                status: shift.status,
            }));
            setShifts(normalizedShifts);
        } else {
            // Fallback fetch if no props provided
            const fetchShifts = async () => {
                setShiftsLoading(true);
                try {
                    const result = await ServerActions.ServerActionslib.getShiftAll();
                    if (result.success && result.data) {
                        const fetchedShiftsData =
                            result.data?.data?.data || result.data?.data || result.data || [];
                        const normalizedShifts = Array.isArray(fetchedShiftsData)
                            ? fetchedShiftsData.map((shift: any) => ({
                                id: shift.id || shift._id || "",
                                name: shift.title || shift.name || "",
                                startTime: shift.startTime || "",
                                endTime: shift.endTime || "",
                                status: shift.status,
                            }))
                            : [];
                        setShifts(normalizedShifts);
                    }
                } catch (error) {
                    console.error("Failed to load shifts", error);
                } finally {
                    setShiftsLoading(false);
                }
            };
            fetchShifts();
        }
    }, [shiftsData]);

    const convertEmployeesToStaff = (employees: any[]) => {
        return employees.map((emp) => {
            const user = emp.user || {};
            const store = emp.store || {};
            return {
                id: emp._id || emp.id || user._id,
                name: user.name || emp.name || "Unknown",
                avatar: user.profilePicture || emp.image || null,
                designation: emp.designation || "",
                branch: store.name || emp.storeName || "",
                email: user.email || emp.email || "",
            };
        });
    };

    const handleEmployeeSearch = (searchTerm: string) => {
        setEmployeeSearch(searchTerm);
        if (searchTerm.length > 0) {
            const filtered = staffData.filter(
                (staff) => {
                    const name = staff.name || "";
                    const email = staff.email || "";
                    return name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        email.toLowerCase().includes(searchTerm.toLowerCase());
                }
            );
            setFilteredEmployees(convertEmployeesToStaff(filtered));
        } else {
            setFilteredEmployees(convertEmployeesToStaff(staffData));
        }
    };

    // Click outside handler for employee search
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                employeeSearchRef.current &&
                !employeeSearchRef.current.contains(event.target as Node)
            ) {
                setFilteredEmployees([]);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Check for shift assignment
    React.useEffect(() => {
        const checkShiftAssignment = async () => {
            if (
                !watchedStaffId ||
                !watchedDate ||
                watchedAddMode !== "attendance"
            ) {
                setAssignedShiftId(null);
                setAssignedShiftTypeId(null);
                setAssignedShiftAssignmentId(null);
                if (!watchedStaffId || !watchedDate) {
                    setValue("shiftId", "");
                }
                return;
            }

            try {
                setCheckingAssignment(true);
                const employeeAssignmentsResponse =
                    await ServerActions.ServerActionslib.getShiftAssignmentsByEmployeeAction(
                        watchedStaffId,
                    );

                let assignment: any = null;
                if (employeeAssignmentsResponse.success && employeeAssignmentsResponse.data) {
                    const employeeAssignments =
                        employeeAssignmentsResponse.data?.data?.data ||
                        employeeAssignmentsResponse.data?.data ||
                        employeeAssignmentsResponse.data ||
                        [];

                    if (Array.isArray(employeeAssignments) && employeeAssignments.length > 0) {
                        assignment = employeeAssignments.find((ass: any) => {
                            // Date normalization logic same as before
                            let assignmentDate = ass.assignmentDate || ass.date || ass.assignment_date || "";
                            if (assignmentDate) {
                                try {
                                    const date = new Date(assignmentDate);
                                    if (!isNaN(date.getTime())) {
                                        const year = date.getFullYear();
                                        const month = String(date.getMonth() + 1).padStart(2, "0");
                                        const day = String(date.getDate()).padStart(2, "0");
                                        assignmentDate = `${year}-${month}-${day}`;
                                    }
                                } catch (e) { }
                            }
                            return assignmentDate === watchedDate;
                        });
                    }
                }

                if (assignment) {
                    // Existing logic to extract shiftTypeId details...
                    let shiftTypeId = "";
                    let shiftDetails: any = null;

                    if (assignment.shiftType && typeof assignment.shiftType === "object") {
                        shiftDetails = assignment.shiftType;
                        shiftTypeId = assignment.shiftType._id || assignment.shiftType.id || "";
                    } else if (assignment.shift && typeof assignment.shift === "object") {
                        shiftDetails = assignment.shift;
                        shiftTypeId = assignment.shift._id || assignment.shift.id || "";
                    }

                    if (!shiftTypeId) {
                        // Fallback ID extraction logic
                        if (assignment.shiftTypeId) shiftTypeId = typeof assignment.shiftTypeId === 'object' ? (assignment.shiftTypeId._id || assignment.shiftTypeId.id) : String(assignment.shiftTypeId);
                        else if (assignment.shift_type_id) shiftTypeId = String(assignment.shift_type_id);
                        else if (assignment.shiftId) shiftTypeId = typeof assignment.shiftId === 'object' ? (assignment.shiftId._id || assignment.shiftId.id) : String(assignment.shiftId);
                        else if (assignment.shift_id) shiftTypeId = String(assignment.shift_id);
                    }

                    const shiftId = shiftTypeId;
                    let assignedShift = shifts.find((s) => String(s.id) === String(shiftId));

                    if (!assignedShift && shiftDetails) {
                        assignedShift = {
                            id: shiftDetails._id || shiftDetails.id || shiftId,
                            name: shiftDetails.title || shiftDetails.name || "",
                            startTime: shiftDetails.startTime || "",
                            endTime: shiftDetails.endTime || "",
                        };
                    }

                    if (shiftId && assignedShift) {
                        setAssignedShiftId(String(shiftId));
                        setAssignedShiftName(assignedShift.name || shiftDetails?.name || "Shift");
                        setAssignedShiftDetails({
                            startTime: assignedShift.startTime,
                            endTime: assignedShift.endTime,
                        });
                        if (assignment._id || assignment.id) setAssignedShiftAssignmentId(String(assignment._id || assignment.id));
                        if (shiftTypeId) setAssignedShiftTypeId(String(shiftTypeId));

                        setValue("shiftId", String(shiftId));
                        if (!watchedClockIn) setValue("clockIn", assignedShift.startTime || "");
                        if (!watchedClockOut) setValue("clockOut", assignedShift.endTime || "");
                    }
                }
                else {
                    setAssignedShiftId(null);
                    setAssignedShiftName(null);
                    setAssignedShiftDetails(null);
                    setAssignedShiftAssignmentId(null);
                    setAssignedShiftTypeId(null);
                }

            } catch (error) {
                console.error("Error checking assignments", error);
            } finally {
                setCheckingAssignment(false);
            }
        };

        const timeoutId = setTimeout(() => {
            checkShiftAssignment();
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [watchedStaffId, watchedDate, watchedAddMode, shifts]);

    const calculateStatus = (clockIn?: string, clockOut?: string, shiftId?: string) => {
        if (!shiftId) return "absent";
        const selectedShift = shifts.find((s) => String(s.id) === String(shiftId));
        if (!selectedShift) return "absent";
        if (!clockIn) return "absent";

        const parseTime = (timeStr: string) => {
            const [hours, minutes] = timeStr.split(":").map(Number);
            return hours * 60 + minutes;
        };

        const clockInMinutes = parseTime(clockIn);
        const shiftStartMinutes = parseTime(selectedShift.startTime);

        if (clockInMinutes > shiftStartMinutes) return "late";

        if (clockOut) {
            const shiftEndMinutes = parseTime(selectedShift.endTime);
            const clockOutMinutes = parseTime(clockOut);
            const shiftDuration = shiftEndMinutes - shiftStartMinutes;
            const workedDuration = clockOutMinutes - clockInMinutes;

            if (workedDuration < shiftDuration * 0.5) return "half_day";
            if (clockOutMinutes >= shiftEndMinutes) return "present";
        }
        return "present";
    };

    const onSubmitForm = (data: FormData) => {
        const calculatedStatus = data.addMode === "attendance"
            ? calculateStatus(data.clockIn || undefined, data.clockOut || undefined, data.shiftId || undefined)
            : "leave";

        let totalHours: number | undefined = undefined;
        if (data.addMode === "attendance" && data.clockIn && data.clockOut) {
            const ci = new Date(`2000-01-01T${data.clockIn}`);
            const co = new Date(`2000-01-01T${data.clockOut}`);
            const hours = (co.getTime() - ci.getTime()) / (1000 * 60 * 60);
            totalHours = hours > 0 ? Math.round(hours * 100) / 100 : undefined;
        }

        const payload = {
            ...data,
            status: calculatedStatus,
            totalHours,
            leaveTypeName: data.addMode === "leave" ? leaveTypesData.find((lt) => lt.id === data.leaveTypeId)?.name : undefined,
            shiftAssignmentId: assignedShiftAssignmentId ?? undefined,
            shiftTypeId: assignedShiftTypeId ?? data.shiftId ?? undefined,
        };

        onSubmit(payload);
    };

    return (
        <form id={formId} onSubmit={handleSubmit(onSubmitForm)}>
            <div className="p-4 sm:p-5 md:p-6 lg:p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 md:gap-6 lg:gap-8 mb-6">
                    {/* Staff Selection */}
                    <div className="relative" ref={employeeSearchRef}>
                        <WebComponents.UiComponents.UiWebComponents.FormLabel>
                            Employee *
                        </WebComponents.UiComponents.UiWebComponents.FormLabel>
                        <Controller
                            control={control}
                            name="staffId"
                            render={({ field }) => (
                                <div className="relative">
                                    <WebComponents.UiComponents.UiWebComponents.FormInput
                                        type="text"
                                        value={employeeSearch}
                                        onChange={(e) => handleEmployeeSearch(e.target.value)}
                                        onFocus={() => {
                                            if (employeeSearch.length === 0) {
                                                setFilteredEmployees(convertEmployeesToStaff(staffData));
                                            }
                                        }}
                                        placeholder="Search employee by name..."
                                        className={`h-[44px] w-full rounded-[4px] border-[0.6px] ${errors.staffId ? 'border-red-500' : 'border-[#D8D9D9] dark:border-[#616161]'} bg-textMain2 dark:bg-[#1B1B1B] pl-3 pr-3 text-gray-900 dark:text-white text-sm`}
                                    />
                                    <div
                                        className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
                                        onClick={() => {
                                            setFilteredEmployees(filteredEmployees.length > 0 ? [] : convertEmployeesToStaff(staffData));
                                        }}
                                    >
                                        <ChevronDown className="h-4 w-4 text-gray-400" />
                                    </div>
                                    {errors.staffId && <p className="text-red-500 text-xs mt-1">{errors.staffId.message}</p>}
                                </div>
                            )}
                        />

                        {/* Employee Dropdown - Keep existing logic for filteredEmployees */}
                        {filteredEmployees.length > 0 && (
                            <div className="absolute z-50 w-full bg-white dark:bg-[#1B1B1B] border border-[#D8D9D9] dark:border-[#616161] rounded-md shadow-lg max-h-48 overflow-y-auto top-full left-0">
                                {filteredEmployees.map((employee) => (
                                    <div
                                        key={employee.id}
                                        onClick={() => {
                                            setSelectedEmployee(employee);
                                            setEmployeeSearch(employee.name);
                                            setValue("staffId", employee.id); // Update form value
                                            setFilteredEmployees([]);
                                        }}
                                        className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-[#2A2A2A] cursor-pointer flex items-center gap-3"
                                    >
                                        {/* Avatar Logic */}
                                        <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center overflow-hidden">
                                            {employee.avatar ? (
                                                <Image src={employee.avatar} alt={employee.name} width={32} height={32} className="w-8 h-8 rounded-full object-cover" />
                                            ) : (
                                                <FaUserIcon className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                                            )}
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">{employee.name}</div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">{employee.designation}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Date Selection */}
                    <div>
                        <WebComponents.UiComponents.UiWebComponents.FormLabel>Date *</WebComponents.UiComponents.UiWebComponents.FormLabel>
                        <Controller
                            control={control}
                            name="date"
                            render={({ field }) => (
                                <>
                                    <WebComponents.UiComponents.UiWebComponents.SingleDatePicker
                                        value={field.value}
                                        onChange={(date) => field.onChange(date)}
                                        placeholder="Select Date"
                                    />
                                    {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date.message}</p>}
                                </>
                            )}
                        />
                    </div>

                    {/* Shift Selection */}
                    {watchedAddMode === "attendance" && (
                        <div>
                            <WebComponents.UiComponents.UiWebComponents.FormLabel>{Constants.adminConstants.attendanceManagementStrings.shiftLabel}*</WebComponents.UiComponents.UiWebComponents.FormLabel>
                            {(assignedShiftId || watchedShiftId) && !checkingAssignment ? (
                                <div className="h-[44px] w-full rounded-[4px] border-[0.6px] border-green-500 dark:border-green-400 bg-green-50 dark:bg-green-900/20 pl-3 pr-3 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                                        {(() => {
                                            if (assignedShiftName) {
                                                const timeStr = assignedShiftDetails?.startTime && assignedShiftDetails?.endTime ? ` (${assignedShiftDetails.startTime} - ${assignedShiftDetails.endTime})` : "";
                                                return <span className="text-sm font-medium text-gray-900 dark:text-white">{assignedShiftName}{timeStr}</span>;
                                            }
                                            const shiftIdToUse = assignedShiftId || watchedShiftId;
                                            if (shiftIdToUse) {
                                                const shift = shifts.find((s) => String(s.id) === String(shiftIdToUse));
                                                if (shift && shift.name) {
                                                    return <span className="text-sm font-medium text-gray-900 dark:text-white">{shift.name} {shift.startTime && shift.endTime ? `(${shift.startTime} - ${shift.endTime})` : ""}</span>;
                                                }
                                            }
                                        })()}
                                    </div>
                                    <button type="button" onClick={() => {
                                        setAssignedShiftId(null);
                                        setAssignedShiftName(null);
                                        setAssignedShiftDetails(null);
                                        setAssignedShiftAssignmentId(null);
                                        setAssignedShiftTypeId(null);
                                        setValue("shiftId", "");
                                    }} className="p-1 hover:bg-green-100 dark:hover:bg-green-800/30 rounded-full transition-colors group">
                                        <X className="w-4 h-4 text-gray-400 group-hover:text-red-500" />
                                    </button>
                                </div>
                            ) : (
                                <Controller
                                    control={control}
                                    name="shiftId"
                                    render={({ field }) => (
                                        <>
                                            <select
                                                {...field}
                                                disabled={shiftsLoading || checkingAssignment}
                                                className={`h-[44px] w-full rounded-[4px] border-[0.6px] ${errors.shiftId ? 'border-red-500' : 'border-[#D8D9D9] dark:border-[#616161]'} bg-textMain2 dark:bg-[#1B1B1B] pl-3 pr-3 text-gray-900 dark:text-white text-sm focus:outline-none`}
                                                onChange={(e) => {
                                                    const selectedShiftId = e.target.value;
                                                    field.onChange(selectedShiftId);
                                                    const selectedShift = shifts.find((s) => String(s.id) === String(selectedShiftId));
                                                    const startTime = selectedShift?.startTime || "";
                                                    const endTime = selectedShift?.endTime || "";

                                                    // Only update if not already set
                                                    if (!watchedClockIn) setValue("clockIn", startTime);
                                                    if (!watchedClockOut) setValue("clockOut", endTime);
                                                }}
                                            >
                                                <option value="">Select a shift</option>
                                                {Array.isArray(shifts) && shifts.map(shift => (
                                                    <option key={shift.id} value={shift.id}>{shift.name} ({shift.startTime} - {shift.endTime})</option>
                                                ))}
                                            </select>
                                            {errors.shiftId && <p className="text-red-500 text-xs mt-1">{errors.shiftId.message}</p>}
                                        </>
                                    )}
                                />
                            )}
                        </div>
                    )}
                </div>

                {/* Attendance Fields */}
                {watchedAddMode === "attendance" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <WebComponents.UiComponents.UiWebComponents.FormLabel>{Constants.adminConstants.attendanceManagementStrings.clockInLabel}</WebComponents.UiComponents.UiWebComponents.FormLabel>
                            <Controller
                                control={control}
                                name="clockIn"
                                render={({ field }) => (
                                    <>
                                        <WebComponents.UiComponents.UiWebComponents.TimePicker value={field.value || ""} onChange={field.onChange} />
                                        {errors.clockIn && <p className="text-red-500 text-xs mt-1">{errors.clockIn.message}</p>}
                                    </>
                                )}
                            />
                        </div>
                        <div>
                            <WebComponents.UiComponents.UiWebComponents.FormLabel>{Constants.adminConstants.attendanceManagementStrings.clockOutLabel}</WebComponents.UiComponents.UiWebComponents.FormLabel>
                            <Controller
                                control={control}
                                name="clockOut"
                                render={({ field }) => (
                                    <WebComponents.UiComponents.UiWebComponents.TimePicker value={field.value || ""} onChange={field.onChange} />
                                )}
                            />
                        </div>
                    </div>
                )}

                {/* Leave Fields */}
                {watchedAddMode === "leave" && (
                    <>
                        <div className="mb-6">
                            <WebComponents.UiComponents.UiWebComponents.FormLabel>{Constants.adminConstants.attendanceManagementStrings.leaveTypeLabel}</WebComponents.UiComponents.UiWebComponents.FormLabel>
                            <Controller
                                control={control}
                                name="leaveTypeId"
                                render={({ field }) => (
                                    <>
                                        <select
                                            {...field}
                                            className={`h-[44px] w-full rounded-[4px] border-[0.6px] ${errors.leaveTypeId ? 'border-red-500' : 'border-[#D8D9D9] dark:border-[#616161]'} bg-white dark:bg-[#1B1B1B] pl-3 pr-3 text-gray-900 dark:text-white text-sm focus:outline-none`}
                                        >
                                            <option value="">Select leave type</option>
                                            {leaveTypesData?.map((lt) => {
                                                const displayName = lt.name && !/^[0-9a-fA-F]{24}$/.test(lt.name.trim()) ? lt.name : "Unknown Leave Type";
                                                return <option key={lt.id} value={lt.id}>{displayName} ({lt.type})</option>;
                                            })}
                                        </select>
                                        {errors.leaveTypeId && <p className="text-red-500 text-xs mt-1">{errors.leaveTypeId.message}</p>}
                                    </>
                                )}
                            />
                        </div>
                        <div className="mb-6">
                            <WebComponents.UiComponents.UiWebComponents.FormLabel>{Constants.adminConstants.attendanceManagementStrings.statusLabel}</WebComponents.UiComponents.UiWebComponents.FormLabel>
                            <select value="On Leave" disabled className="h-[44px] w-full rounded-[4px] border-[0.6px] border-[#D8D9D9] dark:border-[#616161] bg-white dark:bg-[#1B1B1B] pl-3 pr-3 text-gray-900 dark:text-white text-sm focus:outline-none">
                                <option value="On Leave">{Constants.adminConstants.attendanceManagementStrings.onLeaveLabel}</option>
                            </select>
                        </div>
                    </>
                )}

                {/* Notes */}
                <div className="mt-6">
                    <WebComponents.UiComponents.UiWebComponents.FormLabel>{Constants.adminConstants.attendanceManagementStrings.notes}</WebComponents.UiComponents.UiWebComponents.FormLabel>
                    <Controller
                        control={control}
                        name="notes"
                        render={({ field }) => (
                            <textarea
                                {...field}
                                value={field.value || ""}
                                className="w-full px-3 py-2 border border-[#D8D9D9] dark:border-[#616161] rounded-md bg-white dark:bg-[#1B1B1B] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                rows={3}
                                placeholder="Enter any additional notes..."
                            />
                        )}
                    />
                </div>
            </div>
        </form>
    );
};
export default AttendanceForm;