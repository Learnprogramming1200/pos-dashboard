export interface EmailTemplate {
  subject: string;
  content: string;
}

export interface Template {
  userType: string;
  email: EmailTemplate;
  isDefault: boolean;
  lastUsedAt: string | null;
  _id: string;
}

export interface EmailNotificationTemplate {
  _id: string;
  label: string;
  type: string;
  to: string[];
  templates: Template[];
  status: boolean;
  isSystem: boolean;
  lastUsedAt: string | null;
  createdBy: string | null;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
  __v: number;
  name?: string | null;
}

export interface EmailNotificationResponse {
  data: EmailNotificationTemplate[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}