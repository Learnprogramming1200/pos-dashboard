export interface FAQRow {
  _id: string;
  question: string;
  answer: string;
  isPublished: boolean;
  slug: string;
  categoryId: FAQCategoryRow | string | null;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export interface HeroSection {
  id?: string;
  _id: string;
  title1: string;
  title2?: string;
  subtitle?: string;
  heroImage: string | File;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export interface HeroSectionFormData {
  title1: string;
  title2: string;
  subtitle?: string;
  heroImage: string | File;
}

export interface BusinessTypeRow {
  _id: string;
  title: string;
  description: string;
  status: boolean;
}

export interface FeatureRow {
  _id: string;
  title: string;
  description: string;
  status: boolean;
}

export interface FAQCategoryRow {
  _id: string;
  categoryName: string;
  status: boolean;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
  _index?: number;
}

export interface ProductOverviewRow {
  _id: string;
  title: string;
  description: string;
  overviewImage: string;
  status: boolean;
  createdAt: string;
  updatedAt: string;
  __v?: number;
  _index?: number;
}

export interface BlogRow {
  id?: string;
  _id: string;
  title: string;
  overview: string;
  description: string;
  tags: string[];
  createdBy: string;
  readTime: number;
  isPublished: boolean;
  blogImage?: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export interface FooterLink {
  _id: string;
  title: string;
  description: string;
  status: boolean;
}

export interface FooterSection {
  _id?: string;
  cta: {
    title: string;
    subtitle: string;
  };
  links: FooterLink[];
}

export interface LandingPageSettings {
  hero: {
    title1: string;
    title2?: string;
    subtitle: string;
    heroImage: string | File;
  };
  businessTypes: {
    title: string;
    subtitle: string;
    types: Array<{
      title: string;
      description: string;
      active: boolean;
    }>;
  };
  features: {
    title: string;
    subtitle: string;
    features: Array<{
      title: string;
      description: string;
      active: boolean;
    }>;
  };
  productOverview: {
    title: string;
    subtitle: string;
    dashboards: ProductOverviewRow[];
  };
  pricing: {
    title: string;
    subtitle: string;
  };
  faq: {
    title: string;
    subtitle: string;
    questions: FAQRow[];
  };
  blog: {
    title: string;
    subtitle: string;
    posts: BlogRow[];
  };
  footer: FooterSection;
  socialMedia?: {
    instagramLink?: string;
    facebookLink?: string;
    twitterLink?: string;
    youtubeLink?: string;
  };
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Social Media specific types
export interface SocialMediaSettings {
  InstagramLink?: string;
  FacebookLink?: string;
  TwitterLink?: string;
  YoutubeLink?: string;
  createdAt?: string;
  updatedAt?: string;
  hasAnyLink?: boolean;
  id?: string;
}

export interface SocialMediaFormData {
  instagramLink: string;
  facebookLink: string;
  twitterLink: string;
  youtubeLink: string;
}
