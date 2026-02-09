// Convert any date format to YYYY-MM-DD for payload submission
export const convertToYMD = (display: string) => {
  if (!display) return display;

  // Support common date formats
  const patterns: Record<string, RegExp> = {
    'DD-MM-YYYY': /^(\d{2})-(\d{2})-(\d{4})$/,
    'MM-DD-YYYY': /^(\d{2})-(\d{2})-(\d{4})$/,
    'YYYY-MM-DD': /^(\d{4})-(\d{2})-(\d{2})$/,
    'DD/MM/YYYY': /^(\d{2})\/(\d{2})\/(\d{4})$/,
    'MM/DD/YYYY': /^(\d{2})\/(\d{2})\/(\d{4})$/,
    'YYYY/MM/DD': /^(\d{4})\/(\d{2})\/(\d{2})$/,
  };

  let day: number, month: number, year: number;

  // Try each format
  for (const [format, pattern] of Object.entries(patterns)) {
    const match = pattern.exec(display);
    if (match) {
      switch (format) {
        case 'DD-MM-YYYY':
        case 'DD/MM/YYYY':
          day = Number(match[1]);
          month = Number(match[2]);
          year = Number(match[3]);
          break;
        case 'MM-DD-YYYY':
        case 'MM/DD/YYYY':
          month = Number(match[1]);
          day = Number(match[2]);
          year = Number(match[3]);
          break;
        case 'YYYY-MM-DD':
        case 'YYYY/MM/DD':
          year = Number(match[1]);
          month = Number(match[2]);
          day = Number(match[3]);
          break;
        default:
          return display;
      }

      // Validate date
      const date = new Date(year, month - 1, day);
      if (date.getFullYear() === year && date.getMonth() + 1 === month && date.getDate() === day) {
        return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      }
    }
  }

  // If no format matches, return original
  return display;
};

// Helper function to format date in DD-MM-YYYY format
export const formatDate = (dateStr: string | undefined): string => {
  if (!dateStr) return "N/A";
  try {
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return "Invalid Date";
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  } catch {
    return "Invalid Date";
  }
};

// Helper function to convert YYYY-MM-DD to DD-MM-YYYY
export const convertToDisplayFormat = (dateStr: string | undefined): string => {
  if (!dateStr) return "";
  try {
    // Check if already in DD-MM-YYYY format
    if (/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) return dateStr;
    // Convert from YYYY-MM-DD to DD-MM-YYYY
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return "";
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear()}`;
  } catch {
    return "";
  }
}; // Helper function to parse date range string into startDate and endDate
export const parseDateRange = (dateStr: string): { startDate: string; endDate: string; error?: string } => {
  const trimmed = (dateStr || "").trim();

  if (!trimmed) {
    return { startDate: "", endDate: "", error: "Please select a valid date range" };
  }

  // Helper to convert DD-MM-YYYY to YYYY-MM-DD
  const convertDDMMYYYYtoISO = (date: string): string => {
    const m = /^(\d{2})-(\d{2})-(\d{4})$/.exec(date.trim());
    if (!m) return date;
    const [, dd, mm, yyyy] = m;
    return `${yyyy}-${mm}-${dd}`;
  };

  // Check for date range format: DD-MM-YYYY to DD-MM-YYYY
  const dateRangeMatch = /^(\d{2}-\d{2}-\d{4})\s*[-to]+\s*(\d{2}-\d{2}-\d{4})$/i.exec(trimmed);
  if (dateRangeMatch) {
    return {
      startDate: convertDDMMYYYYtoISO(dateRangeMatch[1]),
      endDate: convertDDMMYYYYtoISO(dateRangeMatch[2])
    };
  }

  // Check for single date in DD-MM-YYYY format
  const singleDateMatch = /^(\d{2}-\d{2}-\d{4})$/i.exec(trimmed);
  if (singleDateMatch) {
    const converted = convertDDMMYYYYtoISO(singleDateMatch[1]);
    return { startDate: converted, endDate: converted };
  }

  // Check for ISO format YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
    const isoDate = trimmed.substring(0, 10);
    return { startDate: isoDate, endDate: isoDate };
  }

  return { startDate: "", endDate: "", error: "Please select a valid date range" };
};

