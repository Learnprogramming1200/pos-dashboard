import { hrmTypes } from "..";
import type { AttendanceStatus } from "./Common";

export interface Attendance {
  id: string;
  staffId: string;
  staffName: string;
  date: string;
  clockIn?: string;
  clockOut?: string;
  totalHours?: number;
  status: AttendanceStatus | string;
  leaveType?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  employeeId?: any; // Using any to support both string and object structure flexibly
  employee?: any;
  attendanceDate?: string;
  statusDisplay?: string;
}

export interface AttendanceFormData {
  staffId: string;
  date: string;
  clockIn?: string;
  clockOut?: string;
  status: AttendanceStatus;
  leaveType?: string;
  notes?: string;
}

export interface AttendanceRecord {
  id?: string;
  staffId: string;
  date: string;
  status: string;
  clockIn?: string;
  clockOut?: string;
  totalHours?: number;
  notes?: string;
  leaveTypeId?: string;
  leaveTypeName?: string;
  shiftId?: string;
  shiftTypeId?: string;
}

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  designation: string;
  storeId: string;
  storeName: string;
  status: "Active" | "Inactive";
  image?: string;
  user?: string;
  store?: string;
}

export interface LeaveType {
  id: string;
  name: string;
  type: string;
  paidCount: number;
  isActive: boolean;
}


export const ATTENDANCE_ICON_SIZE = "w-4 h-4";

// Helper functions
export const formatYMD = (date: Date) => {
    return date.toISOString().split("T")[0];
};

export const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return Array.from(
        { length: daysInMonth },
        (_, i) => new Date(year, month, i + 1),
    );
};

export const getMonthLabel = (date: Date) => {
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
};

export interface AttendanceDetailModalProps {
    staffId: string;
    date: string;
    record?: hrmTypes.attendanceTypes.AttendanceRecord;
    onClose: () => void;
    staffData: hrmTypes.attendanceTypes.StaffMember[];
    onUpdate: (updates: { clockIn?: string; clockOut?: string }) => void;
}
