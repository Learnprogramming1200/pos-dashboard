"use client";

import React from "react";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { WebComponents } from "@/components";
import { AdminTypes } from "@/types";
import { quickAssignShiftSchema } from "@/app/validation/ValidationSchema";
import * as Yup from "yup";

interface Employee {
    id: string;
    name: string;
    avatar: string | null;
    designation: string;
    storeId: string;
}

interface Shift {
    id: string;
    title: string;
    startTime: string;
    endTime: string;
    status?: string;
}

interface QuickAssignShiftModalProps {
    // Data
    employees: any[];
    shifts: Shift[];
    shiftsLoading: boolean;

    // State values
    // State values
    selectedEmployee: Employee | null;
    selectedShift: string;
    assignmentDate: string;
    endDate: string;
    showEndDate: boolean;
    customWeekOff: AdminTypes.hrmTypes.commonTypes.WeekDay[];

    // State setters
    // State setters
    setSelectedEmployee: (employee: Employee | null) => void;
    setSelectedShift: (value: string) => void;
    setAssignmentDate: (value: string) => void;
    setEndDate: (value: string) => void;
    setShowEndDate: (value: boolean) => void;
    setCustomWeekOff: React.Dispatch<React.SetStateAction<AdminTypes.hrmTypes.commonTypes.WeekDay[]>>;

    // Handlers
    // Handlers
    onSubmit: () => void;
    onClose: () => void;
    onDelete?: () => void; // Optional delete handler

    // Ref
    // Ref
}

const QuickAssignShiftModal = ({
    employees,
    shifts,
    shiftsLoading,

    selectedEmployee,
    selectedShift,
    assignmentDate,
    endDate,
    showEndDate,
    customWeekOff,

    setSelectedEmployee,
    setSelectedShift,
    setAssignmentDate,
    setEndDate,
    setShowEndDate,
    setCustomWeekOff,

    onSubmit,
    onClose,
    onDelete,

}: QuickAssignShiftModalProps) => {


    const [errors, setErrors] = React.useState<any>({});
    const [employeeSearch, setEmployeeSearch] = React.useState("");
    const [filteredEmployees, setFilteredEmployees] = React.useState<Employee[]>([]);
    const employeeSearchRef = React.useRef<HTMLDivElement>(null);

    // Handle click outside to close dropdown
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (employeeSearchRef.current && !employeeSearchRef.current.contains(event.target as Node)) {
                setFilteredEmployees([]);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const mapEmployee = (emp: any): Employee => ({
        id: emp._id,
        name: emp.name,
        avatar: emp.image || null,
        designation: emp.designation,
        storeId: emp.storeId
    });

    const handleEmployeeSearch = (searchTerm: string) => {
        setEmployeeSearch(searchTerm);
        if (!searchTerm) {
            setFilteredEmployees(employees.map(mapEmployee));
            return;
        }
        const lowerTerm = searchTerm.toLowerCase();
        const filtered = employees.filter(emp =>
            emp.name.toLowerCase().includes(lowerTerm)
        ).map(mapEmployee);
        setFilteredEmployees(filtered);
    };

    const handleSubmit = async () => {
        try {
            await quickAssignShiftSchema.validate({
                employeeId: selectedEmployee?.id,
                shiftTypeId: selectedShift,
                assignmentDate,
                endDate: showEndDate ? endDate : null,
                showEndDate
            }, { abortEarly: false });

            setErrors({});
            onSubmit();
        } catch (err) {
            if (err instanceof Yup.ValidationError) {
                const newErrors: any = {};
                err.inner.forEach((error) => {
                    if (error.path) newErrors[error.path] = error.message;
                });
                setErrors(newErrors);
            }
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#1F1F1F] w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg p-4 sm:p-6 shadow-xl relative">
                <div className="flex justify-between items-center border-b pb-3 mb-4 border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Assign Shift</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white text-2xl"
                    >
                        &times;
                    </button>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-4">

                    {/* Employee Searchable Dropdown */}
                    <div className="relative" ref={employeeSearchRef}>
                        <label className="text-sm font-medium text-gray-900 dark:text-white mb-2 block">Employee</label>
                        <div className="relative">
                            <WebComponents.UiComponents.UiWebComponents.Input
                                type="text"
                                value={employeeSearch}
                                onChange={(e) => handleEmployeeSearch(e.target.value)}
                                onFocus={() => {
                                    if (employeeSearch.length === 0) {
                                        setFilteredEmployees(employees.map(emp => ({
                                            id: emp._id,
                                            name: emp.name,
                                            avatar: emp.image || null,
                                            designation: emp.designation,
                                            storeId: emp.storeId
                                        })));
                                    }
                                }}
                                placeholder="Search employee by name..."
                                className="h-[44px] w-full rounded-[4px] border-[0.6px] border-[#D8D9D9] dark:border-gray-600 bg-textMain2 dark:bg-gray-800 pl-3 pr-8 text-textMain dark:text-white font-interTight font-medium text-sm leading-[14px] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500"
                                required
                            />
                            <div
                                className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
                                onClick={() => {
                                    if (filteredEmployees.length > 0) {
                                        setFilteredEmployees([]);
                                    } else {
                                        setFilteredEmployees(employees.map(emp => ({
                                            id: emp._id,
                                            name: emp.name,
                                            avatar: emp.image || null,
                                            designation: emp.designation,
                                            storeId: emp.storeId
                                        })));
                                    }
                                }}
                            >
                                <ChevronDown className="h-4 w-4 text-gray-400" />
                            </div>
                        </div>

                        {/* Employee Dropdown */}
                        {filteredEmployees.length > 0 && (
                            <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-48 overflow-y-auto top-full left-0">
                                {filteredEmployees.map((employee) => (
                                    <div
                                        key={employee.id}
                                        onClick={() => {
                                            setSelectedEmployee(employee);
                                            setEmployeeSearch(employee.name);
                                            setFilteredEmployees([]);
                                        }}
                                        className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-[#1F1F1F] cursor-pointer flex items-center gap-3"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-[#1F1F1F] flex items-center justify-center">
                                            <Image
                                                src={employee.avatar || '/placeholder-avatar.png'}
                                                alt={employee.name}
                                                width={32}
                                                height={32}
                                                className="w-8 h-8 rounded-full object-cover"
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.style.display = 'none';
                                                    target.nextElementSibling?.classList.remove('hidden');
                                                }}
                                            />
                                            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-semibold text-xs hidden">
                                                {employee.name.split(' ').map((n: string) => n[0]).join('')}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">{employee.name}</div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">{employee.designation}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {errors.employeeId && <p className="text-red-500 text-xs mt-1">{errors.employeeId}</p>}
                    </div>

                    {/* Selected Employee Preview */}
                    {selectedEmployee && (
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div>
                                <div className="text-sm font-medium text-gray-900 dark:text-white">{selectedEmployee.name}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">{selectedEmployee.designation}</div>
                            </div>
                        </div>
                    )}

                    {/* Shift Selection */}
                    <div>
                        <label className="text-sm font-medium text-gray-900 dark:text-white">Shift Title</label>
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
                        {errors.shiftTypeId && <p className="text-red-500 text-xs mt-1">{errors.shiftTypeId}</p>}
                    </div>

                    {/* Assignment Dates */}
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-gray-900 dark:text-white h-[44px]">Assignment Date *</label>
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
                                    <span>Add End Date</span>
                                </label>
                            </div>
                            {errors.assignmentDate && <p className="text-red-500 text-xs mt-1">{errors.assignmentDate}</p>}
                            {errors.endDate && <p className="text-red-500 text-xs mt-1">{errors.endDate}</p>}
                        </div>
                    </div>

                    {/* Days Off */}
                    {selectedShift && (
                        <div>
                            <label className="text-sm font-medium text-gray-900 dark:text-white mb-2 block">Days Off</label>
                            <div className="flex flex-wrap gap-3">
                                {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => {
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
                                Check days off, uncheck working days.
                            </p>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-col-reverse sm:flex-row justify-between gap-3 mt-6">
                        {onDelete && (
                            <WebComponents.UiComponents.UiWebComponents.Button
                                type="button"
                                variant="destructive"
                                onClick={onDelete}
                                className="w-full sm:w-auto bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 border-none"
                            >
                                Delete
                            </WebComponents.UiComponents.UiWebComponents.Button>
                        )}
                        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto justify-end">
                            <WebComponents.UiComponents.UiWebComponents.Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                className="w-full sm:w-auto"
                            >
                                Cancel
                            </WebComponents.UiComponents.UiWebComponents.Button>
                            <WebComponents.UiComponents.UiWebComponents.Button
                                type="submit"
                                className="bg-primary hover:bg-primaryHover text-white w-full sm:w-auto"
                            >
                                Save
                            </WebComponents.UiComponents.UiWebComponents.Button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default QuickAssignShiftModal;
