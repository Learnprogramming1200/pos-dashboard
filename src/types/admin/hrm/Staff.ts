import type { StaffStatus } from "./Common";

export interface Staff {
  _id: string;
  id?: string;
  name: string;
  email: string;
  phone: string;
  designation: string;
  storeId: string;
  storeName: string;
  salary: number;
  joinDate: string;
  isActive: boolean;
  // joiningDate: string;
  status: StaffStatus;
  gender?: string;
  image?: string;
  address?: string;
  emergencyContact?: string;
  password?: string;
  confirmPassword?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    email: string;
    name: string;
    phone: string;
    profilePicture: string;
    _id: string;
  }
  store?: {
    name: string;
    _id: string;
  }
  createdBy?: {
    name: string;
    _id: string;
    email: string;
  }
}

export interface StaffFormData {
  name: string;
  email: string;
  phone: string;
  designation: string;
  storeId: string;
  salary: number;
  joiningDate: string;
  status: StaffStatus;
  gender: string;
  password: string;
  confirmPassword: string;
  image?: string | File | null;
}
export interface StoreOption { id: string; name: string };
