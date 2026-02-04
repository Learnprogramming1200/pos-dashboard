"use client";

import React from "react";
import { ChevronDown, Loader2 } from "lucide-react";
import { customHooks } from "@/hooks";
import { WebComponents } from "@/components";
import { ServerActions } from "@/lib";
import { hrmTypes } from "@/types/admin";
import { Constants } from "@/constant";

// PayrollForm component
interface PayrollFormProps {
  readonly title: string;
  readonly payroll?: hrmTypes.payrollTypes.Payroll | null;
  readonly staff: hrmTypes.staffTypes.Staff[];
  readonly onClose: () => void;
  readonly onSubmit: (data: hrmTypes.payrollTypes.PayrollFormData) => void;
}

export function PayrollForm({ title, payroll, staff, onClose, onSubmit }: PayrollFormProps) {
  const { employees } = customHooks.useEmployees();
  const getCurrentMonth = () => {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    return months[new Date().getMonth()];
  };

  // Helper function to convert month name to MM format (for backend)
  const monthNameToMM = (monthName: string): string => {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const monthIndex = months.indexOf(monthName);
    if (monthIndex >= 0) {
      return String(monthIndex + 1).padStart(2, '0');
    }
    return "01";
  };

  const [formData, setFormData] = React.useState<hrmTypes.payrollTypes.PayrollFormData & { status: string }>({
    staffId: payroll?.staffId || "",
    month: payroll?.month || getCurrentMonth(),
    year: payroll?.year || new Date().getFullYear().toString(),
    basicSalary: payroll?.basicSalary || 0,
    daysWorked: payroll?.daysWorked || 0,
    totalDays: payroll?.totalDays || 0,
    paidLeaves: payroll?.paidLeaves || 0,
    unpaidDays: payroll?.unpaidDays || 0,
    deductions: payroll?.deductions || 0,
    totalSalary: payroll?.netSalary || 0,
    remarks: payroll?.remarks || "",
    status: payroll?.status || "Pending"
  });

  const [loadingAttendance, setLoadingAttendance] = React.useState(false);
  const [autoCalculated, setAutoCalculated] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const backendData = {
      ...formData,
      month: monthNameToMM(formData.month),
      year: formData.year
    };
    onSubmit(backendData);
  };

  // Staff list definition
  const filteredStaff = employees.length ? employees : (staff || []);

  // Searchable Employee UI
  const [employeeSearch, setEmployeeSearch] = React.useState<string>(payroll?.staffName || "");
  const [employeeResults, setEmployeeResults] = React.useState<typeof filteredStaff>([]);
  const employeeSearchRef = React.useRef<HTMLDivElement>(null);

  const handleEmployeeSearch = (value: string) => {
    setEmployeeSearch(value);
    if (!value) {
      setEmployeeResults([]);
      return;
    }
    const lower = value.toLowerCase();
    setEmployeeResults(filteredStaff.filter(e => e.name.toLowerCase().includes(lower)));
  };

  React.useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (employeeSearchRef.current && !employeeSearchRef.current.contains(e.target as Node)) {
        setEmployeeResults([]);
      }
    };
    document.addEventListener('mousedown', onDocClick, true);
    return () => document.removeEventListener('mousedown', onDocClick, true);
  }, []);

  const getMonthNumber = (monthName: string): number => {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    return months.indexOf(monthName) + 1;
  };

  const getDaysInMonth = (month: number, year: number): number => {
    return new Date(year, month, 0).getDate();
  };

  const countDaysBetween = (startDate: string, endDate: string): number => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1;
  };

  const calculateAttendanceData = async (staffId: string, month: string, year: string) => {
    if (!staffId || !month || !year) {
      return;
    }

    setLoadingAttendance(true);
    setAutoCalculated(false);

    try {
      const monthNum = getMonthNumber(month);
      const yearNum = Number.parseInt(year, 10);
      const totalDaysInMonth = getDaysInMonth(monthNum, yearNum);

      const attendanceResult = await ServerActions.ServerActionslib.getAttendanceByEmployeeAction(staffId);
      let attendanceRecords: any[] = [];

      if (attendanceResult?.success) {
        const data = attendanceResult.data?.data || attendanceResult.data;
        if (Array.isArray(data)) {
          attendanceRecords = data;
        } else if (data?.data && Array.isArray(data.data)) {
          attendanceRecords = data.data;
        }
      } else {
        attendanceRecords = [];
      }

      const monthAttendance = attendanceRecords.filter((record: any) => {
        const recordDate = record.attendanceDate || record.date || record.attendance_date || record.createdAt;
        if (!recordDate) return false;

        let dateToCheck: Date;
        try {
          if (typeof recordDate === 'string') {
            if (recordDate.toLowerCase().includes('invalid')) return false;
            dateToCheck = new Date(recordDate);
            if (Number.isNaN(dateToCheck.getTime())) return false;
          } else if (recordDate instanceof Date) {
            if (Number.isNaN(recordDate.getTime())) return false;
            dateToCheck = recordDate;
          } else {
            return false;
          }
          return dateToCheck.getMonth() + 1 === monthNum && dateToCheck.getFullYear() === yearNum;
        } catch (err) {
          return false;
        }
      });

      const daysWorked = monthAttendance.filter((record: any) => {
        const status = (record.status || record.statusDisplay || record.attendanceStatus || record.attendanceStatusDisplay || '').toString().toLowerCase().trim();
        const hasClockIn = record.clockIn || record.clockInTime || record.checkIn || record.checkInTime;
        const hasClockOut = record.clockOut || record.clockOutTime || record.checkOut || record.checkOutTime;

        if (hasClockIn && hasClockOut) return true;

        return status === 'present' ||
          status === 'p' ||
          status === 'attended' ||
          status === 'checked-in' ||
          status === 'active' ||
          status === 'completed' ||
          status === 'worked' ||
          status === 'on-time' ||
          status === 'checked in';
      }).length;

      const leaveResult = await ServerActions.ServerActionslib.getAllLeaveRequestsAction();
      let leaveRequests: any[] = [];

      if (leaveResult?.success) {
        const data = leaveResult.data?.data || leaveResult.data;
        if (Array.isArray(data)) {
          leaveRequests = data;
        } else if (data?.data && Array.isArray(data.data)) {
          leaveRequests = data.data;
        }
      }

      const employeeLeaves = leaveRequests.filter((leave: any) => {
        const leaveEmployeeId = leave.employeeId || leave.staffId || leave.employeeId?._id || leave.employeeId?.id;
        const leaveStatus = leave.status || '';
        const matchesEmployee = leaveEmployeeId === staffId || String(leaveEmployeeId) === String(staffId);
        const isApproved = leaveStatus.toLowerCase() === 'approved';
        return matchesEmployee && isApproved;
      });

      const monthLeaves = employeeLeaves.filter((leave: any) => {
        const startDate = leave.startDate || leave.start_date;
        const endDate = leave.endDate || leave.end_date;
        if (!startDate || !endDate) return false;

        const start = new Date(startDate);
        const end = new Date(endDate);
        const monthStart = new Date(yearNum, monthNum - 1, 1);
        const monthEnd = new Date(yearNum, monthNum, 0);

        return (start <= monthEnd && end >= monthStart);
      });

      let paidLeaves = 0;

      for (const leave of monthLeaves) {
        const startDate = leave.startDate || leave.start_date;
        const endDate = leave.endDate || leave.end_date;
        const isPaid = leave.isPaid !== false && (leave.leaveTypeId?.type === 'Paid' || leave.isPaid === true);
        const isHalfDay = leave.isHalfDay || false;

        const monthStart = new Date(yearNum, monthNum - 1, 1);
        const monthEnd = new Date(yearNum, monthNum, 0);
        const leaveStart = new Date(startDate);
        const leaveEnd = new Date(endDate);

        const overlapStart = Math.max(leaveStart.getTime(), monthStart.getTime());
        const overlapEnd = Math.min(leaveEnd.getTime(), monthEnd.getTime());

        if (overlapStart <= overlapEnd) {
          const daysInMonth = countDaysBetween(
            new Date(overlapStart).toISOString().split('T')[0],
            new Date(overlapEnd).toISOString().split('T')[0]
          );
          const leaveDays = isHalfDay ? 0.5 : daysInMonth;

          if (isPaid) {
            paidLeaves += leaveDays;
          }
        }
      }

      const paidLeavesCount = Math.ceil(paidLeaves);
      const unpaidDaysCount = Math.max(0, totalDaysInMonth - daysWorked - paidLeavesCount);

      setFormData(prev => ({
        ...prev,
        totalDays: totalDaysInMonth,
        daysWorked: daysWorked,
        paidLeaves: paidLeavesCount,
        unpaidDays: unpaidDaysCount
      }));
      setAutoCalculated(true);
    } catch (error: any) {
      console.error('Error calculating attendance data:', error);
      setAutoCalculated(false);
    } finally {
      setLoadingAttendance(false);
    }
  };

  // Pre-fill employee search if staffId exists (for ghost records)
  React.useEffect(() => {
    if (payroll?.staffName) {
      setEmployeeSearch(payroll.staffName);
    } else if (formData.staffId && employees.length > 0) {
      const selected = employees.find(e => e.id === formData.staffId);
      if (selected) {
        setEmployeeSearch(selected.name);
      }
    }
  }, [formData.staffId, employees, payroll?.staffName]);

  const handleStaffChange = (staffId: string) => {
    const selectedStaff = filteredStaff.find(s => s.id === staffId);

    if (selectedStaff) {
      setFormData(prev => ({
        ...prev,
        staffId,
        basicSalary: selectedStaff.salary || 0
      }));
      setEmployeeSearch(selectedStaff.name);
      setAutoCalculated(false);
    } else {
      setFormData(prev => ({ ...prev, staffId }));
      setAutoCalculated(false);
    }
  };

  React.useEffect(() => {
    if (formData.staffId && formData.month && formData.year) {
      const timer = setTimeout(() => {
        calculateAttendanceData(formData.staffId, formData.month, formData.year);
      }, 100);

      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.staffId, formData.month, formData.year]);

  const handleMonthChange = (month: string) => {
    setFormData(prev => ({ ...prev, month }));
    setAutoCalculated(false);
  };

  const handleYearChange = (year: string) => {
    setFormData(prev => ({ ...prev, year }));
    setAutoCalculated(false);
  };

  const calculateNetSalary = React.useMemo(() => {
    if (formData.basicSalary > 0 && formData.totalDays > 0) {
      const payableDays = formData.daysWorked + formData.paidLeaves;
      const netSalary = (payableDays / formData.totalDays) * formData.basicSalary;
      return Math.round(netSalary * 100) / 100;
    }
    return 0;
  }, [formData.basicSalary, formData.totalDays, formData.daysWorked, formData.paidLeaves]);

  const calculatedDeductions = React.useMemo(() => {
    return formData.basicSalary - calculateNetSalary;
  }, [formData.basicSalary, calculateNetSalary]);

  React.useEffect(() => {
    // Only update form data if values actually change to avoid infinite loops
    setFormData(prev => {
      const newDeductions = Math.round(calculatedDeductions * 100) / 100;
      const newNetSalary = calculateNetSalary;

      if (prev.deductions !== newDeductions || prev.totalSalary !== newNetSalary) {
        return {
          ...prev,
          deductions: newDeductions, // This field was previously likely 0 or manual only
          totalSalary: newNetSalary,
          netSalary: newNetSalary // Ensure netSalary is synced
        };
      }
      return prev;
    });
  }, [calculatedDeductions, calculateNetSalary]);

  React.useEffect(() => {
    if (formData.totalDays > 0 && !loadingAttendance) {
      const calculatedUnpaidDays = Math.max(0, formData.totalDays - formData.daysWorked - formData.paidLeaves);
      setFormData(prev => {
        if (Math.abs(calculatedUnpaidDays - prev.unpaidDays) > 0.01) {
          return {
            ...prev,
            unpaidDays: calculatedUnpaidDays
          };
        }
        return prev;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.totalDays, formData.daysWorked, formData.paidLeaves]);

  return (
    <form id="payroll-form" onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">

        {/* Employee & Period Card */}
        <div className="rounded-[4px] border-[0.6px] border-[#D8D9D9] dark:border-[#616161] bg-transparent p-4">
          <h3 className="text-base font-medium text-gray-900 dark:text-white mb-4">{Constants.adminConstants.payrollManagementStrings.employeePeriodLabel}</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <WebComponents.UiComponents.UiWebComponents.FormLabel> {Constants.adminConstants.payrollManagementStrings.employeeLabel} <span className="text-red-500">{Constants.adminConstants.requiredstar}</span></WebComponents.UiComponents.UiWebComponents.FormLabel>
              <div className="relative" ref={employeeSearchRef}>
                <div className="relative">
                  <input
                    id="payroll-employee-search"
                    type="text"
                    value={employeeSearch}
                    onChange={(e) => !payroll && handleEmployeeSearch(e.target.value)}
                    onFocus={() => {
                      if (!employeeSearch && !payroll) setEmployeeResults(filteredStaff);
                    }}
                    placeholder="Search employee by name..."
                    readOnly={!!payroll}
                    className={`w-full h-11 px-3 rounded-[4px] border-[0.6px] border-[#D8D9D9] dark:border-[#616161] bg-white dark:bg-[#1B1B1B] text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600 ${payroll ? 'opacity-60 cursor-not-allowed' : ''}`}
                    autoComplete="off"
                  />
                  {!payroll && (
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
                      onClick={() => {
                        setEmployeeResults(prev => prev.length ? [] : filteredStaff);
                      }}
                    >
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    </button>
                  )}
                </div>
                {employeeResults.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white dark:bg-[#1B1B1B] border border-[#D8D9D9] dark:border-[#616161] rounded-md shadow-lg max-h-48 overflow-y-auto top-full left-0">
                    {employeeResults.map((emp) => (
                      <button
                        key={emp.id}
                        type="button"
                        onClick={() => {
                          handleStaffChange(emp._id);
                          setEmployeeResults([]);
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800/50 cursor-pointer flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 last:border-0"
                      >
                        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center shrink-0">
                          <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                            {emp.name?.charAt(0)?.toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{emp.name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{emp.designation}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div>
              <WebComponents.UiComponents.UiWebComponents.FormLabel>Month <span className="text-red-500">*</span></WebComponents.UiComponents.UiWebComponents.FormLabel>
              <WebComponents.UiComponents.UiWebComponents.FormDropdown
                value={formData.month}
                onChange={(e) => handleMonthChange(e.target.value)}
                id="payroll-month"
                name="month"
                required
                disabled={!!payroll}
                className={`w-full h-11 bg-white dark:bg-[#1B1B1B] border-[#D8D9D9] dark:border-[#616161] ${payroll ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                <WebComponents.UiComponents.UiWebComponents.FormOption value="">{Constants.adminConstants.payrollManagementStrings.selectMonthLabel}</WebComponents.UiComponents.UiWebComponents.FormOption>
                {[
                  "January", "February", "March", "April", "May", "June",
                  "July", "August", "September", "October", "November", "December"
                ].map(m => (
                  <WebComponents.UiComponents.UiWebComponents.FormOption key={m} value={m}>{m}</WebComponents.UiComponents.UiWebComponents.FormOption>
                ))}
              </WebComponents.UiComponents.UiWebComponents.FormDropdown>
            </div>
            <div>
              <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="year">{Constants.adminConstants.payrollManagementStrings.yearLabel} <span className="text-red-500">{Constants.adminConstants.requiredstar}</span></WebComponents.UiComponents.UiWebComponents.FormLabel>
              <WebComponents.UiComponents.UiWebComponents.FormInput
                id="year"
                name="year"
                type="number"
                value={formData.year}
                onChange={(e) => handleYearChange(e.target.value)}
                placeholder="2024"
                required
                readOnly={!!payroll}
                className={`h-11 bg-white dark:bg-[#1B1B1B] border-[#D8D9D9] dark:border-[#616161] ${payroll ? 'opacity-60 cursor-not-allowed' : ''}`}
              />
            </div>
          </div>
        </div>

        {/* Salary & Summary Card */}
        <div className="rounded-[4px] border-[0.6px] border-[#D8D9D9] dark:border-[#616161] bg-transparent p-4">
          <h3 className="text-base font-medium text-gray-900 dark:text-white mb-4">{Constants.adminConstants.payrollManagementStrings.salarySummaryLabel}</h3>
          <div className="grid grid-cols-1 gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="basicSalary">{Constants.adminConstants.payrollManagementStrings.salaryLabel} <span className="text-red-500">{Constants.adminConstants.requiredstar}</span></WebComponents.UiComponents.UiWebComponents.FormLabel>
                <WebComponents.UiComponents.UiWebComponents.FormInput
                  id="basicSalary"
                  name="basicSalary"
                  type="number"
                  value={formData.basicSalary}
                  onChange={(e) => setFormData({ ...formData, basicSalary: Number(e.target.value) })}
                  placeholder="25000"
                  required
                  className="h-11 bg-white dark:bg-[#1B1B1B] border-[#D8D9D9] dark:border-[#616161]"
                />
              </div>
              <div>
                <WebComponents.UiComponents.UiWebComponents.FormLabel>Status <span className="text-red-500">*</span></WebComponents.UiComponents.UiWebComponents.FormLabel>
                <WebComponents.UiComponents.UiWebComponents.FormDropdown
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  id="payroll-status"
                  name="status"
                  required
                  className="w-full h-11 bg-white dark:bg-[#1B1B1B] border-[#D8D9D9] dark:border-[#616161]"
                >
                  <WebComponents.UiComponents.UiWebComponents.FormOption value="Pending">Pending</WebComponents.UiComponents.UiWebComponents.FormOption>
                  <WebComponents.UiComponents.UiWebComponents.FormOption value="Paid">Paid</WebComponents.UiComponents.UiWebComponents.FormOption>
                </WebComponents.UiComponents.UiWebComponents.FormDropdown>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-red-50 dark:bg-red-900/10 p-3 rounded-[4px] border border-red-100 dark:border-red-900/30">
                <div className="text-sm font-medium text-gray-900 dark:text-white">{Constants.adminConstants.payrollManagementStrings.totalDeductionsLabel}</div>
                <div className="text-lg font-bold text-red-600 mt-1">₹{calculatedDeductions.toLocaleString()}</div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">({Constants.adminConstants.payrollManagementStrings.unpaidDaysLabel})</p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/10 p-3 rounded-[4px] border border-blue-100 dark:border-blue-900/30">
                <div className="text-sm font-medium text-gray-900 dark:text-white">{Constants.adminConstants.payrollManagementStrings.netSalaryLabel}</div>
                <div className="text-lg font-bold text-blue-600 mt-1">₹{calculateNetSalary.toLocaleString()}</div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 leading-tight">
                  Based on: {formData.daysWorked} days present
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Attendance & Leaves Card */}
        <div className="rounded-[4px] border-[0.6px] border-[#D8D9D9] dark:border-[#616161] bg-transparent p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-medium text-gray-900 dark:text-white">{Constants.adminConstants.payrollManagementStrings.attendanceLeaveSummaryLabel}</h3>
            {loadingAttendance && (
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Calc...</span>
              </div>
            )}
            {autoCalculated && !loadingAttendance && (
              <span className="text-xs text-green-600 dark:text-green-400 font-medium">Auto-Calculated</span>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="totalDays">{Constants.adminConstants.payrollManagementStrings.totalDaysLabel} <span className="text-red-500">*</span></WebComponents.UiComponents.UiWebComponents.FormLabel>
              <WebComponents.UiComponents.UiWebComponents.FormInput
                id="totalDays"
                name="totalDays"
                type="number"
                value={formData.totalDays}
                onChange={(e) => {
                  setFormData({ ...formData, totalDays: Number(e.target.value) });
                  setAutoCalculated(false);
                }}
                placeholder="26"
                required
                disabled={loadingAttendance}
                className="h-11 bg-white dark:bg-[#1B1B1B] border-[#D8D9D9] dark:border-[#616161]"
              />
              <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 ml-0.5">Total in {formData.month}</p>
            </div>
            <div>
              <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="daysWorked">{Constants.adminConstants.payrollManagementStrings.daysWorkedLabel} <span className="text-red-500">*</span></WebComponents.UiComponents.UiWebComponents.FormLabel>
              <WebComponents.UiComponents.UiWebComponents.FormInput
                id="daysWorked"
                name="daysWorked"
                type="number"
                value={formData.daysWorked}
                onChange={(e) => {
                  setFormData({ ...formData, daysWorked: Number(e.target.value) });
                  setAutoCalculated(false);
                }}
                placeholder="22"
                required
                disabled={loadingAttendance}
                className="h-11 bg-white dark:bg-[#1B1B1B] border-[#D8D9D9] dark:border-[#616161]"
              />
            </div>
            <div>
              <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="paidLeaves">{Constants.adminConstants.payrollManagementStrings.paidLeavesLabel} <span className="text-red-500">*</span></WebComponents.UiComponents.UiWebComponents.FormLabel>
              <WebComponents.UiComponents.UiWebComponents.FormInput
                id="paidLeaves"
                name="paidLeaves"
                type="number"
                value={formData.paidLeaves}
                onChange={(e) => {
                  setFormData({ ...formData, paidLeaves: Number(e.target.value) });
                  setAutoCalculated(false);
                }}
                placeholder="2"
                disabled={loadingAttendance}
                className="h-11 bg-white dark:bg-[#1B1B1B] border-[#D8D9D9] dark:border-[#616161]"
              />
            </div>
            <div>
              <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="unpaidDays">{Constants.adminConstants.payrollManagementStrings.unpaidDaysLabel} <span className="text-red-500">*</span></WebComponents.UiComponents.UiWebComponents.FormLabel>
              <WebComponents.UiComponents.UiWebComponents.FormInput
                id="unpaidDays"
                name="unpaidDays"
                type="number"
                value={formData.unpaidDays}
                onChange={(e) => {
                  setFormData({ ...formData, unpaidDays: Number(e.target.value) });
                  setAutoCalculated(false);
                }}
                placeholder="2"
                disabled={loadingAttendance}
                className="h-11 bg-white dark:bg-[#1B1B1B] border-[#D8D9D9] dark:border-[#616161]"
              />
            </div>
          </div>
        </div>

        {/* Remarks Card */}
        <div className="rounded-[4px] border-[0.6px] border-[#D8D9D9] dark:border-[#616161] bg-transparent p-4">
          <h3 className="text-base font-medium text-gray-900 dark:text-white mb-3">{Constants.adminConstants.payrollManagementStrings.remarksLabel}</h3>
          <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="remarks">{Constants.adminConstants.payrollManagementStrings.additionalNotesLabel}</WebComponents.UiComponents.UiWebComponents.FormLabel>
          <textarea
            id="remarks"
            name="remarks"
            value={formData.remarks}
            onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
            placeholder="Additional notes..."
            className="flex min-h-[80px] w-full rounded-[4px] border-[0.6px] border-[#D8D9D9] dark:border-[#616161] bg-white dark:bg-[#1B1B1B] px-3 py-2 text-sm dark:text-white placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            rows={3}
          />
        </div>
      </div>
    </form>
  );
}
