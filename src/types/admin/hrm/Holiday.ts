import type { StaffStatus } from "./Common";
import type { Staff } from "./Staff";
import type { Store } from "../Store";
import type { Pagination } from "../../Pagination";

export interface Holiday {
  id: string;
  name: string;
  date: string;
  startDate?: string;
  endDate?: string;
  description?: string;
  isRecurring: boolean;
  status: StaffStatus;
  statusDisplay?: string;
  recurringDisplay?: string;
  __v?: number;
  branchId?: string;
  branchName?: string;
  applicableStaffIds?: string[];
  applicableShiftIds?: string[];
  isPaidHoliday?: boolean;
  overrideShiftRules?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface HolidayFormData {
  name: string;
  date: string;
  description?: string;
  isRecurring: boolean;
  status: StaffStatus;
  branchId?: string;
  branchName?: string;
  applicableStaffIds?: string[];
  applicableShiftIds?: string[];
  isPaidHoliday?: boolean;
  overrideShiftRules?: boolean;
}

export interface LegacyHolidayFormProps {
  title: string;
  holiday?: Holiday | null;
  staff?: Staff[];
  stores?: Store[];
  onClose: () => void;
  onSubmit: (data: HolidayFormData) => void;
}

export interface HolidayFormSubmitData {
  name: string;
  date: string;
  description?: string;
  isRecurring: boolean;
  status: string;
}

export interface HolidayFormProps {
  onSubmit: (data: HolidayFormSubmitData) => void;
  holiday?: Holiday;
}



export interface HolidayManagementUIProps {
  // Data
  loading: boolean;
  showModal: boolean;
  showEditModal: boolean;
  editingHoliday: Holiday | null;
  viewMode: "list" | "calendar";
  searchTerm: string;
  statusFilter: string;
  filteredData: Holiday[];
  pagination: Pagination;
  clearSelectedRows: boolean;
  currentMonth: Date;
  yearOptions: { name: string; value: string }[];
  monthCells: Array<{ date: Date; iso: string; items: Holiday[] } | null>;
  tableColumns: any[];

  // Handlers
  setShowModal: (show: boolean) => void;
  setShowEditModal: (show: boolean) => void;
  setEditingHoliday: (holiday: Holiday | null) => void;
  setSearchTerm: (term: string) => void;
  setStatusFilter: (status: "All" | "Active" | "Inactive") => void;
  setViewMode: (mode: "list" | "calendar") => void;
  setSelectedRows: (rows: Holiday[]) => void;
  prevMonth: () => void;
  nextMonth: () => void;
  handleMonthChange: (e: any) => void;
  handleYearChange: (e: any) => void;
  handleAdd: (data: HolidayFormSubmitData) => Promise<void>;
  handleEdit: (data: HolidayFormSubmitData) => Promise<void>;
}
