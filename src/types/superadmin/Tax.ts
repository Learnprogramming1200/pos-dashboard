export type Tax = {
  _id?: string;
  id?: string;
  name: string;
  type?: "Fixed" | "Percentage";
  valueType?: "Fixed" | "Percentage";
  value: number;
  status: boolean | "Active" | "Inactive";
  createdAt?: string;
  updatedAt?: string;
};

export interface TaxFormData {
  name: string;
  type: "Fixed" | "Percentage";
  value: number;
  status: boolean;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNext: boolean;
  hasPrev: boolean;
}