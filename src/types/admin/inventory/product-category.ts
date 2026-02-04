// Server response structure
export interface ServerCategoryType {
    _id: string;
    categoryName: string;
    description: string;
    business: string;
    isActive: boolean;
    hasExpiry?: boolean;
    hasWarranty?: boolean;
    createdBy: string;
    updatedBy: string;
    createdAt: string;
    updatedAt: string;
    slug: string;
    __v: number;
}

// Client-side category type (mapped from server)
export interface CategoryType {
    _id: string;
    name: string;
    description: string;
    status: boolean;
    createdOn: string;
    updatedOn: string;
}

// API response wrapper
export interface CategoryApiResponse {
    data: ServerCategoryType[];
}

// Category Details Modal Props
export interface CategoryDetailsModalProps {
    category: ServerCategoryType;
    onClose: () => void;
}
export interface ProductCategoryForm {
    categoryName: string;
    description: string;
    isActive: boolean;
    hasExpiry: boolean;
    hasWarranty: boolean;
}
