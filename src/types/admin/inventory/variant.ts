export interface Variant {
    _id: string;
    id:string
    variant: string;
    values: (string | { value: string; _id?: string })[];
    status: boolean;
    createdAt: string;
    updatedAt: string;
    __v: number;
}

export interface VariantFormProps {
  onSubmit: (data: {
    variant: string;
    values: string;
    status: boolean;
  }) => void;
  variant?: Variant;
}


export interface VariantDetailsModalProps {
  variant: Variant;
  onClose: () => void;
}
