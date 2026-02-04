"use client";
import React from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import {ChevronDown} from "lucide-react";
import { customHooks } from "@/hooks";
import { Constants } from "@/constant";
import { WebComponents } from "@/components";
import { AdminTypes } from "@/types";
import { leaveAssignFormSchema } from "@/app/validation/ValidationSchema";

interface LeaveAssignFormProps {
    onSubmit: (data: AdminTypes.hrmTypes.leaveTypes.LeaveRequestFormData) => void;
    // staff: AdminTypes.hrmTypes.staffTypes.Staff[];
    stores: AdminTypes.storeTypes.Store[];
    leaveTypes: AdminTypes.hrmTypes.leaveTypes.LeaveType[];
    leaveRequest?: AdminTypes.hrmTypes.leaveTypes.LeaveRequest;
}

type FormData = Yup.InferType<typeof leaveAssignFormSchema>;

export function LeaveAssignForm({
    onSubmit,
    leaveTypes,
    leaveRequest,
}: LeaveAssignFormProps) {
    // Fetch employees using the hook
    const { employees,  searchEmployeesByName } = customHooks.useEmployees();


    const {
        register,
        handleSubmit,
        control,
        formState: { errors,},
        reset,
        watch,
        setValue,
        trigger,
    } = useForm<FormData>({
        resolver: yupResolver(leaveAssignFormSchema) as any,
        defaultValues: {
            employeeId: "",
            storeId: "",
            leaveTypeId: "",
            duration: "full",
            startDate: new Date().toISOString().split("T")[0],
            endDate: new Date().toISOString().split("T")[0],
            isHalfDay: false,
            isPaid: false,
            reason: "",
            status: "pending",
            rejectionReason: "",
        },
    });


    const watchDuration = watch("duration");
    const watchStatus = watch("status");
    const watchStartDate = watch("startDate");
    const watchLeaveTypeId = watch("leaveTypeId");
    const watchEmployeeId = watch("employeeId");

    // Helpers to convert between formats
    const ymdToDisplay = (ymd?: string) => {
        const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd || "");
        if (!m) return "";
        return `${m[3]}-${m[2]}-${m[1]}`;
    };

    const displayToYmd = (disp: string) => {
        const m = /^(\d{2})-(\d{2})-(\d{4})$/.exec(disp || "");
        if (!m) return "";
        return `${m[3]}-${m[2]}-${m[1]}`;
    };

    // Employee search functionality
    const [employeeSearch, setEmployeeSearch] = React.useState("");
    const [filteredEmployees, setFilteredEmployees] = React.useState<any[]>([]);
    const employeeSearchRef = React.useRef<HTMLDivElement>(null);

    // Initial load for edit mode
    React.useEffect(() => {
        if (leaveRequest) {
            const initialEmployeeId = typeof leaveRequest.employeeId === 'object'
                ? (leaveRequest.employeeId as any)?._id || (leaveRequest.employeeId as any)?.id
                : leaveRequest.employeeId;

            const initialLeaveTypeId = typeof leaveRequest.leaveTypeId === 'object'
                ? (leaveRequest.leaveTypeId as any)?._id || (leaveRequest.leaveTypeId as any)?.id
                : leaveRequest.leaveTypeId;

            const initialStoreId = typeof leaveRequest.storeId === 'object'
                ? (leaveRequest.storeId as any)?._id || (leaveRequest.storeId as any)?.id
                : leaveRequest.storeId;

            let initialDuration: "full" | "half" | "multiple" = "full";
            if (leaveRequest.isHalfDay) {
                initialDuration = "half";
            } else if (leaveRequest.startDate && leaveRequest.endDate) {
                const start = new Date(leaveRequest.startDate);
                const end = new Date(leaveRequest.endDate);
                const diffDays = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
                if (diffDays >= 1) initialDuration = "multiple";
            }

            reset({
                employeeId: initialEmployeeId || "",
                storeId: initialStoreId || "",
                leaveTypeId: initialLeaveTypeId || "",
                duration: initialDuration,
                startDate: leaveRequest.startDate ? new Date(leaveRequest.startDate).toISOString().split("T")[0] : "",
                endDate: leaveRequest.endDate ? new Date(leaveRequest.endDate).toISOString().split("T")[0] : "",
                isHalfDay: leaveRequest.isHalfDay || false,
                isPaid: leaveRequest.isPaid || false,
                reason: leaveRequest.reason || "",
                status: (leaveRequest.status as any) || "pending",
                rejectionReason: leaveRequest.rejectionReason || "",
            });

            // Set employee search text
            if (employees.length > 0) {
                const emp = employees.find(e => (e._id || (e as any).id) === initialEmployeeId);
                if (emp) setEmployeeSearch(emp.name);
            }
        }
    }, [leaveRequest, reset, employees]);

    // Handle employee search update from watch
    React.useEffect(() => {
        if (!leaveRequest && employees.length > 0 && watchEmployeeId) {
            const emp = employees.find(e => (e._id || (e as any).id) === watchEmployeeId);
            if (emp) setEmployeeSearch(emp.name);
        }
    }, [watchEmployeeId, employees, leaveRequest]);

    // Handle duration changes to update endDate
    React.useEffect(() => {
        const selectedLeaveType = leaveTypes.find((lt: any) => (lt._id || lt.id) === watchLeaveTypeId);

        if (watchDuration === "multiple" && selectedLeaveType?.paidCount && watchStartDate) {
            const startDate = new Date(watchStartDate);
            const endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + selectedLeaveType.paidCount - 1);
            setValue("endDate", endDate.toISOString().split("T")[0]);
            setValue("isHalfDay", false);
        } else if (watchDuration === "half") {
            setValue("endDate", watchStartDate);
            setValue("isHalfDay", true);
        } else if (watchDuration === "full") {
            setValue("endDate", watchStartDate);
            setValue("isHalfDay", false);
        }
    }, [watchDuration, watchStartDate, watchLeaveTypeId, setValue, leaveTypes]);

    // Update isPaid when leaveType changes
    React.useEffect(() => {
        const lt = leaveTypes.find(l => (l._id || (l as any).id) === watchLeaveTypeId);
        if (lt) {
            setValue("isPaid", lt.isPaid || false);
        }
    }, [watchLeaveTypeId, leaveTypes, setValue]);

    // Clear rejection reason when status changes from rejected to something else
    React.useEffect(() => {
        if (watchStatus !== "rejected") {
            setValue("rejectionReason", "");
        }
    }, [watchStatus, setValue]);

  

    // Click outside handler for employee dropdown
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (employeeSearchRef.current && !employeeSearchRef.current.contains(event.target as Node)) {
                setFilteredEmployees([]);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const onSubmitForm = async (data: FormData) => {
        const submitData = {
            ...data,
            isHalfDay: data.duration === "half",
        };
        onSubmit(submitData as AdminTypes.hrmTypes.leaveTypes.LeaveRequestFormData);
    };

    return (
        <form id="leave-form" onSubmit={handleSubmit(onSubmitForm)}>
            <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Employee Searchable Dropdown */}
                    <div className="col-span-1">
                        <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="employeeId">
                            Employee <span className="text-required">{Constants.adminConstants.requiredstar}</span>
                        </WebComponents.UiComponents.UiWebComponents.FormLabel>
                        <Controller
                            name="employeeId"
                            control={control}
                            render={({ field: { onChange, value } }) => (
                                <div className="relative" ref={employeeSearchRef}>
                                    <div className="relative">
                                        <WebComponents.UiComponents.UiWebComponents.FormInput
                                            id="employeeId"
                                            type="text"
                                            value={employeeSearch}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setEmployeeSearch(val);
                                                if (val.length > 0) {
                                                    setFilteredEmployees(searchEmployeesByName(val));
                                                } else {
                                                    setFilteredEmployees(employees);
                                                    onChange(""); // Clear selection
                                                    setValue("storeId", "");
                                                }
                                            }}
                                            onFocus={() => {
                                                if (employeeSearch.length === 0) {
                                                    setFilteredEmployees(employees);
                                                } else {
                                                    setFilteredEmployees(searchEmployeesByName(employeeSearch));
                                                }
                                            }}
                                            placeholder="Search employee by name..."
                                            className={errors.employeeId ? "border-red-500" : ""}
                                        />
                                        <div
                                            className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
                                            onClick={() => setFilteredEmployees(prev => prev.length > 0 ? [] : employees)}
                                        >
                                            <ChevronDown className="h-4 w-4 text-gray-400" />
                                        </div>
                                    </div>

                                    {filteredEmployees.length > 0 && (
                                        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-[#1B1B1B] border border-gray-200 dark:border-[#616161] rounded-md shadow-lg max-h-48 overflow-y-auto top-full left-0">
                                            {filteredEmployees.map((employee: any) => (
                                                <div
                                                    key={employee._id || employee.id}
                                                    onClick={() => {
                                                        onChange(employee._id || employee.id);
                                                        setEmployeeSearch(employee.name);
                                                        setFilteredEmployees([]);
                                                        setValue("storeId", employee.storeId || "");
                                                    }}
                                                    className="px-3 py-2 bg-white dark:bg-[#1B1B1B] hover:bg-gray-100 dark:hover:bg-[#2A2A2A] cursor-pointer flex items-center gap-3 transition-colors"
                                                >
                                                    <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-xs font-medium text-gray-700 dark:text-white">
                                                        {employee.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900 dark:text-white">{employee.name}</div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                                            {employee.designation} • {employee.storeName || "No Store"}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        />
                        {errors.employeeId && (
                            <p className="mt-1 text-sm text-red-500">{errors.employeeId.message}</p>
                        )}
                    </div>

                    {/* Leave Type */}
                    <div className="col-span-1">
                        <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="leaveTypeId">
                            Leave Type <span className="text-required">{Constants.adminConstants.requiredstar}</span>
                        </WebComponents.UiComponents.UiWebComponents.FormLabel>
                        <Controller
                            name="leaveTypeId"
                            control={control}
                            render={({ field: { value, onChange } }) => (
                                <WebComponents.UiComponents.UiWebComponents.FormDropdown
                                    id="leaveTypeId"
                                    value={value}
                                    onChange={onChange}
                                    className={errors.leaveTypeId ? "border-red-500" : ""}
                                >
                                    <WebComponents.UiComponents.UiWebComponents.FormOption value="">
                                        {Constants.adminConstants.leaveManagementStrings.selectLeaveTypeLabel}
                                    </WebComponents.UiComponents.UiWebComponents.FormOption>
                                    {leaveTypes.map((lt: any) => (
                                        <WebComponents.UiComponents.UiWebComponents.FormOption key={lt._id || lt.id} value={lt._id || lt.id}>
                                            {`${lt.name} (${lt.type} - ${lt.remainingLeaves ?? lt.paidCount ?? 0})`}
                                        </WebComponents.UiComponents.UiWebComponents.FormOption>
                                    ))}
                                </WebComponents.UiComponents.UiWebComponents.FormDropdown>
                            )}
                        />
                        {errors.leaveTypeId && (
                            <p className="mt-1 text-sm text-red-500">{errors.leaveTypeId.message}</p>
                        )}
                    </div>

                    {/* Duration Selection */}
                    <div className="col-span-1">
                        <WebComponents.UiComponents.UiWebComponents.FormLabel>
                            {Constants.adminConstants.leaveManagementStrings.selectDurationLabel} <span className="text-required">{Constants.adminConstants.requiredstar}</span>
                        </WebComponents.UiComponents.UiWebComponents.FormLabel>
                        <Controller
                            name="duration"
                            control={control}
                            render={({ field: { value, onChange } }) => (
                                <div className="flex flex-wrap items-center gap-4 mt-2">
                                    {["full", "half", "multiple"].map((d) => {
                                        const selectedLeaveType = leaveTypes.find((lt: any) => (lt._id || lt.id) === watchLeaveTypeId);
                                        const disabled = d === "multiple" && selectedLeaveType?.paidCount === 1;
                                        return (
                                            <label key={d} className={`flex items-center space-x-2 ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}>
                                                <input
                                                    type="radio"
                                                    value={d}
                                                    checked={value === d}
                                                    onChange={() => !disabled && onChange(d)}
                                                    disabled={disabled}
                                                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                                                />
                                                <span className="text-sm font-medium capitalize">
                                                    {d === "full" ? "Full Day" : d === "half" ? "Half Day" : "Multiple"}
                                                </span>
                                            </label>
                                        );
                                    })}
                                </div>
                            )}
                        />
                        {errors.duration && (
                            <p className="mt-1 text-sm text-red-500">{errors.duration.message}</p>
                        )}
                    </div>

                    {/* Date Pickers */}
                    <div className="col-span-1">
                        <WebComponents.UiComponents.UiWebComponents.FormLabel>
                            {watchDuration === "multiple" ? "Select Date Range" : "Select Date"} <span className="text-required">{Constants.adminConstants.requiredstar}</span>
                        </WebComponents.UiComponents.UiWebComponents.FormLabel>
                        {watchDuration === "multiple" ? (
                            <Controller
                                name="startDate"
                                control={control}
                                render={({ field: { value: startVal, onChange: onStartChange } }) => (
                                    <Controller
                                        name="endDate"
                                        control={control}
                                        render={({ field: { value: endVal, onChange: onEndChange } }) => (
                                            <WebComponents.UiComponents.UiWebComponents.DateRangePicker
                                                start={ymdToDisplay(startVal)}
                                                end={ymdToDisplay(endVal)}
                                                onChange={(range) => {
                                                    onStartChange(displayToYmd(range.start));
                                                    onEndChange(displayToYmd(range.end));
                                                }}
                                            />
                                        )}
                                    />
                                )}
                            />
                        ) : (
                            <Controller
                                name="startDate"
                                control={control}
                                render={({ field: { value, onChange } }) => (
                                    <WebComponents.UiComponents.UiWebComponents.SingleDatePicker
                                        value={value}
                                        onChange={onChange}
                                        className="w-full"
                                    />
                                )}
                            />
                        )}
                        {(errors.startDate || errors.endDate) && (
                            <p className="mt-1 text-sm text-red-500">{errors.startDate?.message || errors.endDate?.message}</p>
                        )}
                    </div>

                    {/* Status (only in edit mode) */}
                    {leaveRequest && (
                        <div className="col-span-1">
                            <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="status">Status</WebComponents.UiComponents.UiWebComponents.FormLabel>
                            <Controller
                                name="status"
                                control={control}
                                render={({ field: { value, onChange } }) => (
                                    <WebComponents.UiComponents.UiWebComponents.FormDropdown
                                        id="status"
                                        value={value}
                                        onChange={onChange}
                                    >
                                        <WebComponents.UiComponents.UiWebComponents.FormOption value="pending">pending</WebComponents.UiComponents.UiWebComponents.FormOption>
                                        <WebComponents.UiComponents.UiWebComponents.FormOption value="approved">approved</WebComponents.UiComponents.UiWebComponents.FormOption>
                                        <WebComponents.UiComponents.UiWebComponents.FormOption value="rejected">rejected</WebComponents.UiComponents.UiWebComponents.FormOption>
                                        {/* <WebComponents.UiComponents.UiWebComponents.FormOption value="cancelled">cancelled</WebComponents.UiComponents.UiWebComponents.FormOption> */}
                                    </WebComponents.UiComponents.UiWebComponents.FormDropdown>
                                )}
                            />
                        </div>
                    )}

                    {/* Reason */}
                    <div className="col-span-1">
                        <div className="flex justify-between items-center mb-1">
                            <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="reason">
                                {Constants.adminConstants.leaveManagementStrings.reasonLabel} <span className="text-required">{Constants.adminConstants.requiredstar}</span>
                            </WebComponents.UiComponents.UiWebComponents.FormLabel>
                            <p className="text-xs text-gray-500">Max 250 characters</p>
                        </div>
                        <Controller
                            name="reason"
                            control={control}
                            render={({ field: { value, onChange } }) => (
                                <>
                                    <WebComponents.UiComponents.UiWebComponents.Textarea
                                        id="reason"
                                        placeholder="Please provide a detailed reason for leave..."
                                        rows={3}
                                        value={value}
                                        onChange={onChange}
                                        charCounter={false}
                                        className={errors.reason ? "border-red-500" : ""}
                                    />
                                    <div className="flex justify-between items-center mt-1 text-xs">
                                        <div className={errors.reason ? "text-red-500" : "text-gray-500"}>
                                            {errors.reason ? errors.reason.message : (value.length < 10 ? "(minimum 10 characters required)" : "")}
                                        </div>
                                        <div className="text-gray-500">{value.length}/250</div>
                                    </div>
                                </>
                            )}
                        />
                    </div>

                    {/* Rejection Reason (Conditional) */}
                    {leaveRequest && watchStatus === "rejected" && (
                        <div className="col-span-1">
                            <div className="flex justify-between items-center mb-1">
                                <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="rejectionReason">
                                    Rejection Reason <span className="text-required">{Constants.adminConstants.requiredstar}</span>
                                </WebComponents.UiComponents.UiWebComponents.FormLabel>
                            </div>
                            <Controller
                                name="rejectionReason"
                                control={control}
                                render={({ field: { value, onChange } }) => (
                                    <>
                                        <WebComponents.UiComponents.UiWebComponents.Textarea
                                            id="rejectionReason"
                                            placeholder="Please provide the reason for rejection..."
                                            rows={2}
                                            value={value || ""}
                                            onChange={onChange}
                                            charCounter={false}
                                            className={errors.rejectionReason ? "border-red-500" : ""}
                                        />
                                        {errors.rejectionReason && (
                                            <p className="mt-1 text-xs text-red-500">{errors.rejectionReason.message}</p>
                                        )}
                                    </>
                                )}
                            />
                        </div>
                    )}
                </div>
            </div>
        </form>
    );
}
