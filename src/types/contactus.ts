export interface BusinessAddress {
  shopNumber: string;
  buildingName: string;
  area: string;
  landmark: string;
  nearBy: string;
  country: string;
  state: string;
  city: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  mapUrl?: string;
}

export interface Logo {
  url: string;
  publicId: string;
}

export interface Logos {
  darkLogo: Logo;
  lightLogo: Logo;
  favicon: Logo;
  collapsDarkLogo: Logo;
  collapsLightLogo: Logo;
}

export interface GeneralSettings {
  businessAddress: BusinessAddress;
  logos: Logos;
  _id: string;
  appName: string;
  contactNumber: string;
  inquiryEmail: string;
  siteDescription: string;
  isActive: boolean;
  lastCachePurge: string;
  createdAt: string;
  updatedAt: string;
  footerText: string;
  fullAddress: string;
  isValid: boolean;
  requiredFieldsComplete: boolean;
  id: string;
}
