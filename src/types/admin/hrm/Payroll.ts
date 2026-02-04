import type { PayrollStatus, StaffStatus } from "./Common";

export interface Payroll {
  id: string;
  staffId: string;
  staffName: string;
  month: string;
  year: string;
  basicSalary: number;
  daysWorked: number;
  totalDays: number;
  paidLeaves: number;
  unpaidDays: number;
  deductions: number;
  netSalary: number;
  status: PayrollStatus;
  paidAt?: string;
  paymentMethod?: "Bank Transfer" | "Cash" | "Check";
  remarks?: string;
  branchId?: string;
  branchName?: string;
  designation?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PayrollFormData {
  staffId: string;
  month: string;
  year: string;
  basicSalary: number;
  daysWorked: number;
  totalDays: number;
  paidLeaves: number;
  unpaidDays: number;
  deductions: number;
  totalSalary?: number;
  remarks?: string;
  status?: PayrollStatus | string;
}

export interface SalaryStructure {
  id: string;
  staffId: string;
  staffName: string;
  basicSalary: number;
  status: StaffStatus;
  effectiveFrom: string;
  effectiveTo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SalaryStructureFormData {
  branchId: string;
  staffId: string;
  basicSalary: number;
  effectiveFrom: string;
  effectiveTo?: string;
}

