export type BusinessCategory = {
  _id: string;
  categoryName: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
};

export interface BusinessCategoryFormData {
  categoryName: string;
  description: string;
  isActive: boolean;
} 

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNext: boolean;
  hasPrev: boolean;
}