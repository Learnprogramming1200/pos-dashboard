export interface WarrantyType {
    _id: string;
    warranty: string;
    description: string;
    duration: number;
    period: 'Month' | 'Year';
    status: boolean;
    createdAt: string;
    updatedAt: string;
}
