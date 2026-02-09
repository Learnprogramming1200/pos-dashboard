export type SEOSettings = {
  _id?: string;
  id?: string;
  seoSlug: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string[];
  seoImage: {
    url: string;
    publicId: string;
  };
  googleSiteVerification: string;
  canonicalUrl: string;
  isActive?: boolean;
  lastCachePurge?: string;
  seoCompleteness?: number;
  isValid?: boolean;
  requiredFieldsComplete?: boolean;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
};

export type SEOSettingsFormData = {
  seoSlug: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string[];
  seoImage?: string | File;
  googleSiteVerification: string;
  canonicalUrl: string;
};
