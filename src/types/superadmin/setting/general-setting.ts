export interface GeneralSettings {
    _id: string;
    id: string;
    appName: string;
    contactNumber: string;
    inquiryEmail: string;
    siteDescription: string;
    footerText: string;
    isActive: boolean;
    businessAddress: {
        shopNumber: string;
        buildingName: string;
        area: string;
        landmark: string;
        nearBy: string;
        country: string;
        state: string;
        city: string;
        postalCode: string;
        latitude: number;
        longitude: number;
        mapUrl?: string;
    };
    logos: {
        darkLogo: { url: string; publicId: string };
        lightLogo: { url: string; publicId: string };
        favicon: { url: string; publicId: string };
        collapsDarkLogo: { url: string; publicId: string };
        collapsLightLogo: { url: string; publicId: string };
        miniLogo?: { url: string; publicId: string };
    };
    // Legacy support / Optional fields from other contexts
    userApp?: string;
    lastCachePurge?: string;
    createdAt?: string;
    updatedAt?: string;
    fullAddress?: string;
    isValid?: boolean;
    requiredFieldsComplete?: boolean;

    // Invoice settings might be merged here or separate
    invoicePrefix?: string;
    invoiceNumberFormat?: string;
    invoiceFooter?: string;
    invoiceTerms?: boolean;
}

export interface GeneralSettingsFormData {
    appName: string;
    contactNumber: string;
    inquiryEmail: string;
    siteDescription: string;
    footerText: string;
    businessAddress: {
        shopNumber: string;
        buildingName: string;
        area: string;
        landmark: string;
        nearBy: string;
        country: string;
        state: string;
        city: string;
        postalCode: string;
        latitude: number;
        longitude: number;
    };
    logos?: {
        darkLogo?: string;
        lightLogo?: string;
        favicon?: string;
        collapsDarkLogo?: string;
        collapsLightLogo?: string;
        miniLogo?: string;
    };
    userApp?: string;
    invoicePrefix?: string;
    invoiceNumberFormat?: string;
    invoiceFooter?: string;
    invoiceTerms?: boolean;
}
