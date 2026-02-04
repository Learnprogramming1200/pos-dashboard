import { CommonTypes } from "@/types";

/**
 * Column configuration for generating CSV and PDF columns
 */
export interface ColumnConfig<T = any> {
  key: string;
  label: string;
  accessor: (row: T) => string | number | null | undefined;
  pdfWidth?: number; // Optional width for PDF columns
}

/**
 * Generates both CSV and PDF columns from a single configuration
 * @param columns - Array of column configurations
 * @returns Object containing csvColumns and pdfColumns
 */
export function generateExportColumns<T = any>(
  columns: ColumnConfig<T>[]
): {
  csvColumns: CommonTypes.CSVColumn<T>[];
  pdfColumns: CommonTypes.PDFColumn<T>[];
} {
  const csvColumns: CommonTypes.CSVColumn<T>[] = columns.map((col) => ({
    key: col.key,
    label: col.label,
    accessor: col.accessor,
  }));

  const pdfColumns: CommonTypes.PDFColumn<T>[] = columns.map((col) => ({
    key: col.key,
    label: col.label,
    accessor: col.accessor,
    width: col.pdfWidth,
  }));

  return { csvColumns, pdfColumns };
}

