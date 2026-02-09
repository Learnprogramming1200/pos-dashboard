export interface Blog {
  _id: string;
  title: string;
  overview: string;
  description: string;
  tags: string[];
  createdBy: {
    _id: string;
    name: string;
    email: string;
    profilePicture?: string | null;
    role?: string | null;
    isAdmin?: boolean;
    id?: string;
  };
  readTime: number;
  isPublished: boolean;
  blogImage?: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
  __v?: number;
  id?: string;
}

export interface BlogFormData {
  title: string;
  overview: string;
  description: string;
  tags: string[];
  createdBy: string; // Keep as string for form submission
  readTime?: number;
  isPublished: boolean;
  blogImage: File | null; // Changed from featuredImage to blogImage
}

export interface PopularBlog {
  _id: string;
  title: string;
  overview: string;
  slug: string;
  blogImage?: string;
  createdAt: string;
}
