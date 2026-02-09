export interface SubCategoryType {
    _id: string;
    category: {
        _id: string;
        categoryName: string;
    };
    subcategory: string;
    categorycode: string;
    description: string;
    subCategoryImage: string | null;
    status: boolean;
    createdAt: string;
    updatedAt: string;
    __v: number;
}
