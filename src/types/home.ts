export interface IPlan {
    id: string;
    _id: string;
    name: string;
    price: number;
    totalPrice?: number;
    type?: string;
    features?: string[];
    modules?: string[];
    annual_price?: number | null;
    max_locations?: number | null;
    max_users?: number | null;
    storeLimit?: number | null;
    staffLimit?: number | null;
    support_level?: string;
    popular?: boolean;
    isMostPopular?: boolean;
    status?: any;
    isTrial?: boolean;
    description?: string;
    duration?: string;
    themes?: string[];
    formattedPrice?: string;
    currency?: {
        symbol: string;
        code: string;
        position: 'Left' | 'Right';
    };
    currencyId?: string;
    tax?: any;
    createdAt?: string;
    updatedAt?: string;
    discount?: number;
    discountType?: string;
    isRecommended?: boolean;
    planPosition?: number | string;
    posTheme?: string;

    // Legacy fields for compatibility
    Plan_Name?: string;
    Plan_Type?: string;
    Total_Stores?: string;
    Price?: string;
    Created_Date?: string;
    Status?: string;
    Description?: string;
    Modules?: string[];
    Pos_Theme?: string;
    color?: string;
    textColor?: string;
    Plan_Position?: string;
    Discount_Type?: string;
    Discount?: string;
    Is_Recommended?: boolean;
    StaffLimit?: string | number;
}

export interface Testimonial {
    id: string | number;
    rating: number;
    testimonial: string;
    customer_name: string;
    author?: string; // Compatibility
    message?: string; // Compatibility
    position?: string;
    business_name?: string;
    business_type?: string;
    status?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

// Footer Link Interface
export interface FooterLink {
    _id: string;
    title: string;
    description?: string;
    name?: string;
    url?: string;
    link?: string;
    status?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface FooterSection {
    _id?: string;
    logo?: string;
    description?: string;
    copyrightText?: string;
    socialMedia?: {
        platform: string;
        url: string;
        icon?: string;
    }[];
    sections?: {
        title: string;
        links: FooterLink[];
    }[];
    status?: boolean;
    createdAt?: string;
    updatedAt?: string;
    [key: string]: any;
}
