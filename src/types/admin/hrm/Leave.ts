import type { LeaveRequestStatus, StaffStatus } from "./Common";
export type { LeaveRequestStatus };
export interface LeaveType {
  _id: string;
  name: string;
  isPaid?: boolean;
  paidCount?: number;
  paidFrequency?: "Monthly" | "Yearly";
  description?: string;
  type?: string;
  color?: string;
  // status?: StaffStatus;
  status: boolean | "Active" | "Inactive";
  createdAt?: string;
  updatedAt: string;
  remainingLeaves?: number;
}

export interface LeaveTypeFormData {
  name: string;
  isPaid: boolean;
  paidCount?: number;
  paidFrequency?: "Monthly" | "Yearly";
  description?: string;
  status: "Active" | "Inactive";
}

export interface LeaveRequest {
  _id: string;
  employeeId: {
    user: {
      name: string;
      email: string;
      phone: string;
      _id: string;
      profilePicture: string
    }
  };
  staffName: string;
  storeId: {
    _id: string,
    name: string;
  };
  storeName: string;
  leaveTypeId: {
    description: string;
    name: string;
    _id: string;
    paidCount: number;
    status: boolean;
    type: string;
  }
  leaveTypeName: string;
  startDate: string;
  endDate: string;
  isHalfDay: boolean;
  isPaid: boolean;
  reason: string;
  status: LeaveRequestStatus;
  rejectionReason?: string;
  approvedBy?: {
    email: string;
    name: string;
    _id: string
  };
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeaveRequestFormData {
  employeeId: string;
  storeId: string;
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  isHalfDay: boolean;
  isPaid: boolean;
  reason: string;
  status: LeaveRequestStatus;
  rejectionReason?: string;
}




