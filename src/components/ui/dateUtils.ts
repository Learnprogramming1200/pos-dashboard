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

