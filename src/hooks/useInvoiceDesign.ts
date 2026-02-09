
import { InvoiceDesignTypes } from "@/types/admin";

// Define the return type of the hook
interface InvoiceDesignTokens {
    fontFamily: string;
    colors: {
        primary: string;
        secondary: string;
        headings: string;
        text: string;
        highlight: string;
        tableBorder: string;
        totalsBoxBg: string;
        tableHeaderBg: string;
        tableHeaderText: string;
        footerText: string;
    };
    baseFontSize: string; // e.g. "12px"
    logoSize: string; // e.g. "60px"
    typography: {
        invoiceTitle: React.CSSProperties; // Huge title (INVOICE)
        companyName: React.CSSProperties; // Header Brand Name
        sectionTitle: React.CSSProperties; // "Invoice To", "Ship From"
        tableHeader: React.CSSProperties; // Table columns
        body: React.CSSProperties; // Normal text
        small: React.CSSProperties; // Secondary/meta text
        totalLabel: React.CSSProperties;
        totalValue: React.CSSProperties;
        lineItem: React.CSSProperties;
    };
    currencySymbol: string;
    dateFormat: string;
    formatDate: (dateStr: string) => string;
}

export const getInvoiceDesignTokens = (
    design: InvoiceDesignTypes.InvoiceDesignConfig | undefined,
    styles?: {
        font?: string;
        color?: string;
        logo?: string | null;
    }
): InvoiceDesignTokens => {

    // 1. Fonts
    const fontFamily = design?.fontFamily || styles?.font || "Inter, sans-serif";

    // 2. Colors
    const colors = {
        primary: design?.primaryColor || styles?.color || "#2563eb",
        secondary: design?.secondaryColor || "#64748b",
        headings: design?.headingsColor || "#1f2937",
        text: design?.textColor || "#4b5563",
        highlight: design?.highlightColor || (design?.primaryColor || "#2563eb"),
        tableBorder: design?.tableBorder || "#e5e7eb",
        totalsBoxBg: design?.totalsBoxBg || "#f9fafb",
        tableHeaderBg: design?.tableHeaderBg || "#1f2937",
        tableHeaderText: design?.tableHeaderText || "#ffffff",
        footerText: design?.footerText || "#9ca3af",
    };

    // 3. Font Scale (Base Size)
    const fontSizeMap = {
        small: "11px",
        medium: "12px",
        large: "14px",
    };
    const baseFontSize = fontSizeMap[(design?.fontSizeScale as keyof typeof fontSizeMap) || "medium"];

    // 4. Logo Size
    const logoSizeMap = {
        small: "40px",
        medium: "60px",
        large: "80px",
        xl: "100px",
    };
    const logoSize = logoSizeMap[(design?.logoSize as keyof typeof logoSizeMap) || "medium"];

    // 5. Typography Styles (em-based for scaling)
    const weightMap: Record<string, number> = {
        'normal': 400,
        'medium': 500,
        'semibold': 600,
        'bold': 700,
        'extrabold': 800
    };
    const userWeight = weightMap[design?.fontWeight || 'normal'] || 400;

    const commonTextStyles: React.CSSProperties = {
        fontStyle: (design?.fontStyle as any) || 'normal',
        textDecoration: (design?.textDecoration as any) || 'none',
        letterSpacing: `${design?.letterSpacing || 0}em`,
    };

    const userTransform = (design?.textTransform as any) || 'none';

    const typography = {
        invoiceTitle: {
            ...commonTextStyles,
            fontSize: "3em", // ~36px-42px
            fontWeight: 900,
            lineHeight: 1,
            textTransform: "uppercase" as const,
        },
        companyName: {
            ...commonTextStyles,
            fontSize: "1.5em", // ~18px-21px
            fontWeight: userWeight >= 700 ? 900 : 700,
            lineHeight: 1.2,
        },
        sectionTitle: {
            ...commonTextStyles,
            fontSize: "1em", // Same as base but bold/uppercase usually
            fontWeight: userWeight >= 600 ? 800 : 700,
            textTransform: "uppercase" as const,
            letterSpacing: "0.05em", // Default spacing for sections
        },
        tableHeader: {
            ...commonTextStyles,
            fontSize: "0.85em", // Slightly smaller than body for dense headers
            fontWeight: 700,
            textTransform: "uppercase" as const,
            letterSpacing: "0.05em",
        },
        body: {
            ...commonTextStyles,
            fontSize: "1em",
            fontWeight: userWeight,
            textTransform: userTransform,
            lineHeight: 1.5,
        },
        small: {
            ...commonTextStyles,
            fontSize: "0.85em", // ~9px-11px
            fontWeight: userWeight,
            lineHeight: 1.4,
            textTransform: userTransform,
        },
        totalLabel: {
            ...commonTextStyles,
            fontSize: "1.1em",
            fontWeight: 700,
        },
        totalValue: {
            ...commonTextStyles,
            fontSize: "1.5em",
            fontWeight: 900,
        },
        lineItem: {
            ...commonTextStyles,
            fontSize: "0.9em",
            fontWeight: userWeight === 400 ? 500 : userWeight, // Line items slightly clearer
            textTransform: userTransform,
        }
    };

    // 6. Content Config
    const currencySymbol = ""; 
    const dateFormat = design?.dateFormat || 'DD/MM/YYYY';

    const formatDate = (dateStr: string | Date) => {
        if (!dateStr) return '';

        // Handle ISO string or Date object
        const dateObj = new Date(dateStr);
        if (isNaN(dateObj.getTime())) {
            // Try parsing "DD/MM/YYYY" custom format fallback
            if (typeof dateStr === 'string') {
                const parts = dateStr.split('/');
                if (parts.length === 3) {
                    const day = parseInt(parts[0]);
                    const month = parseInt(parts[1]);
                    const year = parseInt(parts[2]);
                    const fbDate = new Date(year, month - 1, day);
                    if (!isNaN(fbDate.getTime())) {
                        // recursive call with valid date object
                        return formatDate(fbDate.toISOString());
                    }
                }
            }
            return String(dateStr);
        }

        const day = dateObj.getDate();
        const month = dateObj.getMonth();
        const year = dateObj.getFullYear();

        const d = String(day).padStart(2, '0');
        const m = String(month + 1).padStart(2, '0');
        const y = year;
        const monNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const mon = monNames[month];

        if (dateFormat === 'MM/DD/YYYY') return `${m}/${d}/${y}`;
        if (dateFormat === 'YYYY-MM-DD') return `${y}-${m}-${d}`;
        if (dateFormat === 'DD-MM-YYYY') return `${d}-${m}-${y}`;
        if (dateFormat === 'MMM DD, YYYY') return `${mon} ${d}, ${y}`;
        return `${d}/${m}/${y}`; // Default DD/MM/YYYY
    };

    return {
        fontFamily,
        colors,
        baseFontSize,
        logoSize,
        typography,
        currencySymbol,
        dateFormat,
        formatDate,
    };
};
