export interface Profile {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  userRole: string;
  location: string;
  avatar?: string;
  address: {
    country: string;
    state: string;
    city: string;
    postalCode: string;
  };
}

export interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  country: string;
  city: string;
  postalCode: string;
} 