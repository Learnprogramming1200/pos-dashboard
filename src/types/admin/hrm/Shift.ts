import type { ShiftStatus, WeekDay } from "./Common";

export interface Shift {
  _id: string;
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  breakDuration?: number;
  storeId: string;
  storeName: string;
  weekOff: WeekDay[];
  branchId: string;
  branchName: string;
  // status: ShiftStatus;
  createdAt: string;
  updatedAt: string;
  status?: string
}

export interface ShiftFormData {
  title: string;
  startTime: string;
  endTime: string;
  breakDuration?: number;
  shiftType?: "Morning" | "Afternoon" | "Night" | "Custom";
  storeId?: string;
  branchId?: string;
  weekOff?: WeekDay[];
  status: boolean;
  [key: string]: any;
}

export interface ShiftFormProps {
  title: string;
  onClose: () => void;
  onSubmit: (data: ShiftFormData) => void | Promise<void>;
  shift?: Shift;
}

