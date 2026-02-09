export const MONTHS_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
export const MONTHS_LONG = ["January","February","March","April","May","June","July","August","September","October","November","December"];
export const WEEKDAYS_SHORT = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

export function isValidDate(input: unknown): boolean {
  if (input === null || input === undefined) return false;
  const d = input instanceof Date ? input : new Date(input as any);
  return d instanceof Date && !isNaN(d.getTime());
}

export function formatDate(input: Date | string | number, pattern: string): string {
  const date = input instanceof Date ? input : new Date(input);
  if (isNaN(date.getTime())) return "";
  const day = date.getDate();
  const year = date.getFullYear();
  const monthIndex = date.getMonth();
  const monthNum = String(monthIndex + 1).padStart(2, "0");
  const weekdayShort = WEEKDAYS_SHORT[date.getDay()];

  const replacements: Record<string, string> = {
    "MMMM": MONTHS_LONG[monthIndex],
    "MMM": MONTHS_SHORT[monthIndex],
    "dd": String(day).padStart(2, "0"),
    "d": String(day),
    "yyyy": String(year),
    "MM": monthNum,
    "EEE": weekdayShort,
  };

  let out = pattern;
  for (const token of ["MMMM", "MMM", "yyyy", "MM", "dd", "d", "EEE"]) {
    out = out.replace(token, replacements[token]);
  }
  return out;
}

export const enUSLocale = {
  localize: {
    month: (index: number, options?: { width?: "abbreviated" | "wide" | "narrow" }) => {
      const width = options?.width || "abbreviated";
      if (width === "wide") return MONTHS_LONG[index] || "";
      return MONTHS_SHORT[index] || "";
    },
    day: (index: number, options?: { width?: "abbreviated" | "wide" | "narrow" }) => {
      const width = options?.width || "abbreviated";
      if (width === "wide") return ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][index] || "";
      return WEEKDAYS_SHORT[index] || "";
    },
  },
  options: {
    weekStartsOn: 0,
  },
} as any;


export const getCurrentYear = () => {
  return new Date().getFullYear().toString();
};

export const getYears = () => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let i = currentYear; i >= currentYear - 5; i--) {
    years.push(i.toString());
  }
  return years;
};
// Helper function to format date
export const formatDateStringToLocale = (dateString: string | null | undefined): string => {
  if (!dateString) return "-";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  } catch {
    return "-";
  }
};

/**
 * Formats a date string to DD-MM-YYYY format
 * @param dateStr - Date string to format (can be undefined)
 * @returns Formatted date string in DD-MM-YYYY format, "N/A" if undefined, or "Invalid Date" if invalid
 */
export function formatDateDDMMYYYY(dateStr: string | undefined): string {
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
}
