"use client";

import { stringify } from 'csv-stringify/sync';
import React from 'react';
import { BusinessOwnerReportTypes } from '@/types/superadmin';
interface DownloadCSVProps<T = any> {
  data: T[];
  columns: BusinessOwnerReportTypes.CSVColumn<T>[];
  filename?: string;
  onExport?: () => Promise<T[] | { data: T[] } | void> | void;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Reusable CSV export component using csv-stringify
 * @template T - The type of data items
 */
export function DownloadCSV<T = any>({
  data,
  columns,
  filename = 'export.csv',
  onExport,
  className = '',
  children
}: DownloadCSVProps<T>) {
  const handleExport = async (e?: React.MouseEvent) => {
    e?.preventDefault();
    try {
      // 1️⃣ Get data from API if provided (same pattern as DownloadPDF)
      let exportData: T[] = Array.isArray(data) ? data : [];
      if (onExport) {
        const result = await onExport();
        if (Array.isArray(result)) {
          exportData = result;
        } else if (Array.isArray((result as any)?.data)) {
          exportData = (result as any).data;
        }
      }

      if (!exportData || exportData.length === 0) {
        console.warn('No data to export');
        return;
      }

      if (!columns || columns.length === 0) {
        console.warn('No columns defined for export');
        return;
      }

      // Prepare headers
      const headers = columns.map(col => col.label);

      // Prepare rows
      const rows = exportData.map(row => {
        return columns.map(col => {
          if (col.accessor) {
            const value = col.accessor(row);
            // Handle null/undefined values
            if (value === null || value === undefined) {
              return '';
            }
            // Convert to string and escape quotes
            return String(value).replace(/"/g, '""');
          }
          // Fallback to direct property access
          const value = (row as any)[col.key];
          if (value === null || value === undefined) {
            return '';
          }
          return String(value).replace(/"/g, '""');
        });
      });

      // Use csv-stringify to generate CSV
      const csvContent = stringify([headers, ...rows], {
        header: false,
        quoted: true,
        quoted_empty: true,
        delimiter: ','
      });

      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Error generating CSV:', error);
    }
  };

  if (children) {
    return (
      <div onClick={handleExport} className={className}>
        {children}
      </div>
    );
  }

  return null;
}

export default DownloadCSV;

