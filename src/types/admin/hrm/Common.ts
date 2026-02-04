export type StaffStatus = "Active" | "Inactive";
export type ShiftStatus = boolean;
export type AttendanceStatus = "Present" | "Absent" | "On Leave" | "Half Day";
export type LeaveRequestStatus = "pending" | "approved" | "rejected" | "cancelled";
export type PayrollStatus = "Pending" | "Paid" | "Processing";
export type WeekDay =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

export interface HRMApiResponse<T> {
  message: string;
  data: T;
  success: boolean;
}

export interface HRMPaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export interface HRMListResponse<T> {
  data: T[];
  pagination: HRMPaginationInfo;
}

