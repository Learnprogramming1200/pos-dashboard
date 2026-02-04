export interface PDFColumn<T = any> {
    key: string;
    label: string;
    accessor?: (row: T) => string | number | null | undefined;
    width?: number;
  }
  
  export interface CSVColumn<T = any> {
    key: string;
    label: string;
    accessor?: (row: T) => string | number | null | undefined;
  }
  