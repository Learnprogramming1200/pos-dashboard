export interface Tax {
  _id?: string;
  id?: string;
  taxName?: string;
  taxType?: TaxType;
  valueType?: ValueType;
  value: number;
  status: boolean | StatusType;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
};


type TaxType = "Exclusive" | "Inclusive";
type ValueType = "Fixed" | "Percentage";
type StatusType = "Active" | "Inactive";


export interface FormData {
  taxName: string;
  taxType: TaxType;
  valueType: ValueType;
  value: number;
  status: boolean;
  description: string;
}



