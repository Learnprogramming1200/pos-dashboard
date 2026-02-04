export interface FooterSection {
  _id: string;
  title: string;
  links: FooterLink[];
  status?: boolean;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export interface FooterLink {
  label: string;
  url: string;
  isOpenInNewTab?: boolean;
}
