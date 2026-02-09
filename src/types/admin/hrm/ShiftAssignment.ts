import type { WeekDay } from "./Common";

export interface ShiftAssignment {
  id: string;
  shiftTypeId: string;
  shiftTitle: string;
  staffId: string;
  staffName: string;
  date: string;
  branchName: string;
  startTime: string;
  endTime: string;
  breakDuration?: number;
  weekOffOverride?: WeekDay[];
  isRecurring: boolean;
  recurringDays?: WeekDay[];
  status: "Assigned" | "Completed" | "Absent" | "On Leave";
  createdAt: string;
  updatedAt: string;
}

export interface ShiftAssignmentFormData {
  employeeId: string;
  employeeName: string;
  storeId: string;
  shiftTypeId: string;
  assignmentDate: string;
  dayOfWeek: string;
  status: string;
  shiftTime: string;
  endDate?: string | undefined;
  customWeekOff: string[];
}


export interface ShiftAssignmentData {
  id: string;
  employeeId: string;
  employeeName: string;
  storeId: string;
  shiftTypeId: string;
  assignmentDate: string;
  dayOfWeek: string;
  status: string;
  shiftTime: string;
  endDate?: string;
  customWeekOff?: string[];
  applicableDates?: string[]; // Array of dates in YYYY-MM-DD format where the shift applies
  createdAt?: string;
  updatedAt?: string;
}