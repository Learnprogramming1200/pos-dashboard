
export type FilterFieldType = "text" | "number" | "date" | "select" | "range";
export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterFieldConfig {
  type: FilterFieldType;
  label: string;
  key?: string; // For single value fields (text, number, date, select)
  minKey?: string; // For range fields
  maxKey?: string; // For range fields
  options?: FilterOption[]; // For select fields
  placeholder?: string;
  className?: string; // Optional custom class
  prefix?: string; // Optional prefix for range values (e.g. "$")
}

export interface ExtendedFiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: () => void;
  onReset: () => void;
  filters: any; // Dynamic filter state
  setFilters: (filters: any) => void;
  filterConfig: FilterFieldConfig[];
}

