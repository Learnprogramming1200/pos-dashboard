"use client";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import React, { useState, useEffect } from "react";
import { BusinessOwnerReportTypes } from "@/types/superadmin";
import { useSession } from "next-auth/react";
import { publicAPI } from "@/lib/api";

interface DownloadPDFProps<T = any> {
  data: T[];
  columns: BusinessOwnerReportTypes.PDFColumn<T>[];
  filename?: string;
  title?: string;
  onExport?: () => void;
  className?: string;
  children?: React.ReactNode;
  orientation?: "portrait" | "landscape";
  pageSize?: "a4" | "letter" | [number, number];
}

/**
 * Reusable PDF export component using jsPDF and jsPDF-autotable
 * @template T - The type of data items
 */
export function DownloadPDF<T = any>({
  data,
  columns,
  filename = "export.pdf",
  title,
  onExport,
  className = "",
  children,
  orientation = "portrait",
  pageSize = "a4",
}: DownloadPDFProps<T>) {
  const { data: session } = useSession();
  const user = session?.user;
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  // Fetch logo from general settings
  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const response = await publicAPI.getGeneralSettings();
        const settings = response?.data?.data;
        if (settings?.logos?.lightLogo?.url) {
          setLogoUrl(settings.logos.lightLogo.url);
        } else if (settings?.logos?.darkLogo?.url) {
          setLogoUrl(settings.logos.darkLogo.url);
        }
      } catch (error) {
        console.error("Failed to fetch logo:", error);
      }
    };
    fetchLogo();
  }, []);

  // Helper function to convert image URL to base64
  const getImageBase64 = (url: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          try {
            const base64 = canvas.toDataURL("image/png");
            resolve(base64);
          } catch (error) {
            reject(error);
          }
        } else {
          reject(new Error("Could not get canvas context"));
        }
      };
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = url;
    });
  };

  /**
   * jsPDF built-in fonts (helvetica) are not full-unicode.
   * Some currency symbols render as odd glyphs/spaced text in PDFs (e.g. ₹ -> ¹).
   * Sanitize cell text so exported PDFs stay readable.
   */
  const normalizePdfText = (value: unknown): string => {
    let text = String(value ?? "");

    // Remove zero-width & NBSP characters
    text = text.replace(/[\u00A0\u200B-\u200D\uFEFF]/g, "");

    // Normalize unicode to avoid unexpected glyph substitutions
    if (typeof (text as any).normalize === "function") {
      text = text.normalize("NFKC");
    }

    // Replace common currency symbols with ASCII equivalents
    const currencyMap: Record<string, string> = {
      "₹": "INR ",
      "৳": "BDT ",
      "€": "EUR ",
      "£": "GBP ",
      "¥": "JPY ",
      "₩": "KRW ",
      "₦": "NGN ",
      "₱": "PHP ",
      "฿": "THB ",
      "₫": "VND ",
      "₴": "UAH ",
      "₺": "TRY ",
      "₽": "RUB ",
      "₨": "Rs ",
    };
    text = text.replace(/[₹৳€£¥₩₦₱฿₫₴₺₽₨]/g, (m) => currencyMap[m] ?? "");

    // If it's purely numeric-ish, remove spaces between digits (e.g. "2 5 0 . 0 0")
    if (/^[0-9\s.,-]+$/.test(text)) {
      text = text.replace(/\s+/g, "");
    } else {
      text = text.replace(/\s+/g, " ").trim();
    }

    return text;
  };

  const handleExport = async (e?: React.MouseEvent) => {
    e?.preventDefault();
    try {
      // 1️⃣ Get data from API if provided
      let exportData: T[] = Array.isArray(data) ? data : [];
      if (onExport) {
        const result = await onExport();
        if (Array.isArray(result)) {
          exportData = result;
        } else if (Array.isArray((result as any)?.data)) {
          exportData = (result as any).data;
        }
      }

      if (!exportData.length) {
        console.warn("No data to export");
        return;
      }

      if (!columns?.length) {
        console.warn("No columns defined");
        return;
      }

      // 2️⃣ Generate PDF - Always use A4 size
      const doc = new jsPDF({ orientation, unit: "mm", format: "a4" });

      // A4 dimensions: 210mm × 297mm (portrait) or 297mm × 210mm (landscape)
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 14;
      let startY = margin;

      // Add logo if available
      if (logoUrl) {
        try {
          const imgData = await getImageBase64(logoUrl);
          const logoWidth = 40; // Logo width in mm
          const logoHeight = 15; // Logo height in mm
          doc.addImage(imgData, "PNG", margin, startY, logoWidth, logoHeight);
          startY += logoHeight + 5;
        } catch (error) {
          console.warn("Failed to add logo to PDF:", error);
        }
      }

      // Add user name and date/time (left-aligned below logo)
      const userName = user?.name || "User";
      const currentDate = new Date();
      // Format: "12/24/2025, 12:32:31 PM"
      const dateTimeStr = currentDate.toLocaleString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      });

      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text(`Downloaded by: ${userName}`, margin, startY);
      startY += 5;
      doc.text(`Date: ${dateTimeStr}`, margin, startY);
      startY += 10;

      const tableHead = [columns.map((col) => col.label)];
      const tableBody = exportData.map((row) =>
        columns.map((col) => {
          const value = col.accessor
            ? (col.accessor(row) ?? "")
            : ((row as any)[col.key] ?? "");
          // Ensure values are strings and handle long text properly
          return normalizePdfText(value);
        }),
      );

      // Column widths - properly calculate based on available space
      const availableWidth = pageWidth - margin * 2;
      const columnStyles: Record<number, { cellWidth?: number }> = {};

      // Calculate column widths
      const totalCustomWidth = columns.reduce(
        (sum, col) => sum + (col.width || 0),
        0,
      );
      const hasCustomWidths = totalCustomWidth > 0;

      if (hasCustomWidths) {
        // Scale custom widths proportionally to fit available width
        const scaleFactor = availableWidth / totalCustomWidth;
        columns.forEach((col, idx) => {
          const baseWidth = col.width || 0;
          columnStyles[idx] = {
            cellWidth:
              baseWidth > 0
                ? baseWidth * scaleFactor
                : availableWidth / columns.length,
          };
        });
      } else {
        // Equal distribution if no custom widths
        const colWidth = availableWidth / columns.length;
        columns.forEach(
          (_, idx) => (columnStyles[idx] = { cellWidth: colWidth }),
        );
      }

      // Add title if provided (centered)
      if (title) {
        doc.setFontSize(18);
        doc.setTextColor(0, 0, 0);
        doc.setFont("helvetica", "bold");
        const titleWidth = doc.getTextWidth(title);
        const titleX = (pageWidth - titleWidth) / 2;
        doc.text(title, titleX, startY);
        startY += 10;
      }

      autoTable(doc, {
        startY: startY,
        head: tableHead,
        body: tableBody,
        columnStyles,
        styles: {
          fontSize: 8,
          cellPadding: 2.5,
          overflow: "linebreak",
          cellWidth: "wrap",
        },
        headStyles: {
          fillColor: [66, 139, 202],
          textColor: 255,
          fontStyle: "bold",
          halign: "left",
        },
        bodyStyles: { halign: "left" },
        margin: { top: startY, left: margin, right: margin },
        didDrawPage: (data: any) => {
          // Add page number in footer (bottom-right)
          const pageHeight = doc.internal.pageSize.height;
          const pageNumber = data.pageNumber || 1;
          // Get total pages from doc after table is drawn, or use pageCount from data
          const totalPages = data.pageCount || doc.getNumberOfPages();
          doc.setFontSize(10);
          doc.setTextColor(100, 100, 100);
          doc.text(
            `Page ${pageNumber} of ${totalPages}`,
            pageWidth - margin,
            pageHeight - 10,
            { align: "right" },
          );
        },
      });

      // 3️⃣ Save PDF
      doc.save(filename);
    } catch (error) {
      console.error("Error generating PDF:", error);
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

export default DownloadPDF;
