
// Core Config Interface (Shared with Frontend Builder)
export interface InvoiceDesignConfig {
    // Typography
    fontFamily: string;
    fontSizeScale: 'small' | 'medium' | 'large';

    // Brand
    logo?: string | null;

    // Layout
    logoPosition: 'left' | 'center' | 'right';
    logoSize: 'small' | 'medium' | 'large' | 'xl';

    // Colors
    primaryColor: string;
    secondaryColor: string;
    headingsColor: string;
    textColor: string;

    // Section Specifics
    tableHeaderBg: string;
    tableHeaderText: string;
    tableBorder: string;
    totalsBoxBg: string;
    highlightColor: string; // for "Due Amount" etc.
    footerText: string;

    // Text Styling
    fontWeight?: string;
    fontStyle?: string;
    textDecoration?: string;
    textTransform?: string;
    letterSpacing?: number;
    // Content
    dateFormat: string;
    currencySymbol: string;
}

// 1. Database Model (The "Real" Data)
export interface ApiInvoiceDesign extends InvoiceDesignConfig {
    _id: string;
    templateId: string; // e.g. "template1"
    createdAt?: string;
    updatedAt?: string;
    __v?: number;
}

// 2. Form Data (The "Input" Data)
export interface InvoiceDesignFormData {
    config: InvoiceDesignConfig;
    selectedTemplate: number;
}

// 3. API Responses (The "Envelope")
export interface InvoiceDesignResponse {
    message: string;
    data: {
        data: ApiInvoiceDesign;
    }
}

// Theme Presets (Helper Constants)
export const DEFAULT_DESIGN_CONFIG: InvoiceDesignConfig = {
    fontFamily: 'Poppins',
    fontSizeScale: 'medium',
    logoPosition: 'left',
    logoSize: 'medium',
    primaryColor: '#2563eb',
    secondaryColor: '#64748b',
    headingsColor: '#1f2937',
    textColor: '#4b5563',
    tableHeaderBg: '#1f2937',
    tableHeaderText: '#ffffff',
    tableBorder: '#e5e7eb',
    totalsBoxBg: '#f9fafb',
    highlightColor: '#2563eb',
    footerText: '#9ca3af',

    // Content
    dateFormat: 'DD/MM/YYYY',
    currencySymbol: '₹',

    // Text Styling
    fontWeight: 'normal',
    fontStyle: 'normal',
    textDecoration: 'none',
    textTransform: 'none',
    letterSpacing: 0,
};

export interface ThemePreset {
    id: string;
    name: string;
    config: Partial<InvoiceDesignConfig>;
}

export const THEME_PRESETS: ThemePreset[] = [
    {
        id: 'corporate',
        name: 'Corporate Professional',
        config: {
            primaryColor: '#1e3a8a', // Navy Blue
            secondaryColor: '#64748b',
            headingsColor: '#0f172a',
            textColor: '#334155',
            tableHeaderBg: '#f1f5f9',
            tableHeaderText: '#0f172a',
            tableBorder: '#e2e8f0',
            totalsBoxBg: '#f8fafc',
            highlightColor: '#1e3a8a',
        },
    },
    {
        id: 'modern',
        name: 'Modern Mineral',
        config: {
            primaryColor: '#10b981', // Emerald
            secondaryColor: '#374151',
            headingsColor: '#064e3b',
            textColor: '#064e3b',
            tableHeaderBg: '#10b981', // High contrast header
            tableHeaderText: '#ffffff',
            tableBorder: '#d1fae5',
            totalsBoxBg: '#ecfdf5',
            highlightColor: '#059669',
        },
    },
    {
        id: 'vitality',
        name: 'Creative Bold',
        config: {
            primaryColor: '#111827', // Black/Dark Gray
            secondaryColor: '#f59e0b', // Amber/Orange
            headingsColor: '#111827',
            textColor: '#1f2937',
            tableHeaderBg: '#1f2937',
            tableHeaderText: '#ffffff',
            tableBorder: '#e5e7eb',
            totalsBoxBg: '#fffbeb', // Amber tint
            highlightColor: '#f59e0b',
        },
    },
];
