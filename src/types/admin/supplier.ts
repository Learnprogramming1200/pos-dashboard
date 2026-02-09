// export interface Supplier {
//   id: string;
//   code?: string;
//   name: string;
//   email: string;
//   phone: string;
//   address: string;
//   city: string;
//   state: string;
//   country: string;
//   postalCode: string;
//   contactPerson: string;
//   status: boolean;
//   image?: string;
//   createdAt: string;
//   updatedAt: string;
// }


export interface Supplier {
  id: string,
  supplierCode: string,
  name: string,
  email: string,
  phone: string,
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  contactPerson: string,
  status: boolean,
  supplierImage?: string,
  createdAt: string,
  updatedAt: string,
  createdBy?: string,
  updatedBy?: string
}



export interface SupplierFormData {
  supplierCode: string;
  name: string;
  email: string;
  phone: string;
  supplierImage?: string | File | null;
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  status: boolean;
  createdBy?: string;
  updatedBy?: string;
}