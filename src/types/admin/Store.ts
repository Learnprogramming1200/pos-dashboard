export interface GeoLocation {
  type: "Point";
  coordinates: [number, number];
}

export interface StoreLocation {
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

export interface StoreOwner {
  _id: string;
  name: string;
  isActive: boolean;
}

export interface Store {
  _id: string;
  name: string;
  description: string;
  manager?: string;
  staff: string[];
  email: string;
  contactNumber: string;
  owner?: StoreOwner;
  location: StoreLocation;
  geoLocation: GeoLocation;
  status: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StoreFormData {
  name: string;
  description: string;
  email: string;
  contactNumber: string;
  location: StoreLocation;
  latitude: string; // for form input only
  longitude: string; // for form input only
  status: "Active" | "Inactive";
}

export interface CardStat {
  title: string;
  key: 'total' | 'active' | 'inactive' | 'recent';
  color: string;
  icon: React.ReactNode;
}

export interface StoreData {
  id: string;
  name: string;
  description: string;
  email: string;
  contactNumber: string;
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  status: boolean;
  manager?: string;
  staff: string[];
  createdAt: string;
  updatedAt: string;
}
export interface storeManagementForm {
  name: string;
  description: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  latitude: string;
  longitude: string;
  status: "Active" | "Inactive";
  email: string;
  contactNumber: string;
  poc: string;
}

export interface StoreDetailsModalProps {
  store: Store;
  onClose: () => void;
}