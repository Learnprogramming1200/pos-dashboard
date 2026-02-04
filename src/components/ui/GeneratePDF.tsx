"use client";

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import React from 'react';
import { BusinessOwnerReportTypes } from '@/types/superadmin';

interface GeneratePDFProps<T = any> {
  data: T[];
  columns: BusinessOwnerReportTypes.PDFColumn<T>[];
  filename?: string;
  title?: string;
  onExport?: () => void;
  className?: string;
  children?: React.ReactNode;
  orientation?: 'portrait' | 'landscape';
  pageSize?: 'a4' | 'letter' | [number, number];
}

/**
 * Reusable PDF export component using jsPDF and jsPDF-autotable
 * @template T - The type of data items
 */
export function GeneratePDF<T = any>({
  data,
  columns,
  filename = 'export.pdf',
  title,
  onExport,
  className = '',
  children,
  orientation = 'portrait',
  pageSize = 'a4'
}: GeneratePDFProps<T>) {
  const handleExport = () => {
    try {
      if (!data || data.length === 0) {
        console.warn('No data to export');
        return;
      }

      if (!columns || columns.length === 0) {
        console.warn('No columns defined for export');
        return;
      }

      // Create new PDF document
      const doc = new jsPDF({
        orientation,
        unit: 'mm',
        format: pageSize
      });

      // Prepare table data
      const tableHead = [columns.map(col => col.label)];
      const tableBody = data.map(row => {
        return columns.map(col => {
          if (col.accessor) {
            const value = col.accessor(row);
            return value === null || value === undefined ? '' : String(value);
          }
          const value = (row as any)[col.key];
          return value === null || value === undefined ? '' : String(value);
        });
      });

      // Calculate page width (A4 landscape: 297mm, portrait: 210mm)
      const pageWidth = orientation === 'landscape' ? 297 : 210;
      const margin = 14; // Left and right margins
      const availableWidth = pageWidth - (margin * 2);

      // Build column styles - use provided widths or auto-distribute
      const hasCustomWidths = columns.some(col => col.width);
      const columnStyles: Record<number, { cellWidth?: number }> = {};

      if (hasCustomWidths) {
        // Use provided widths
        columns.forEach((col, index) => {
          if (col.width) {
            columnStyles[index] = { cellWidth: col.width };
          }
        });
      } else {
        // Auto-distribute columns evenly
        const columnWidth = availableWidth / columns.length;
        columns.forEach((_, index) => {
          columnStyles[index] = { cellWidth: columnWidth };
        });
      }

      // Add title if provided
      if (title) {
        doc.setFontSize(18);
        doc.text(title, margin, 20);
        // Add some spacing after title
        autoTable(doc, {
          startY: 30,
          head: tableHead,
          body: tableBody,
          styles: {
            fontSize: 8,
            cellPadding: 2.5,
            overflow: 'linebreak',
            cellWidth: 'wrap'
          },
          headStyles: {
            fillColor: [66, 139, 202], // Primary color
            textColor: 255,
            fontStyle: 'bold',
            halign: 'left'
          },
          bodyStyles: {
            halign: 'left'
          },
          alternateRowStyles: {
            fillColor: [245, 245, 245]
          },
          margin: { top: 30, left: margin, right: margin },
          columnStyles
        });
      } else {
        // No title, start table from top
        autoTable(doc, {
          head: tableHead,
          body: tableBody,
          styles: {
            fontSize: 8,
            cellPadding: 2.5,
            overflow: 'linebreak',
            cellWidth: 'wrap'
          },
          headStyles: {
            fillColor: [66, 139, 202], // Primary color
            textColor: 255,
            fontStyle: 'bold',
            halign: 'left'
          },
          bodyStyles: {
            halign: 'left'
          },
          alternateRowStyles: {
            fillColor: [245, 245, 245]
          },
          margin: { left: margin, right: margin },
          columnStyles
        });
      }

      // Save the PDF
      doc.save(filename);

      // Call optional callback
      if (onExport) {
        onExport();
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw error;
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

export default GeneratePDF;

