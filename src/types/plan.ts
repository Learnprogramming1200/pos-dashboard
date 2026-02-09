export interface Plan {
  _id: string;
  name: string;
  type: "Monthly" | "Yearly" | "monthly" | "yearly"; // Support both formats
  price: number;
  totalPrice?: number; // Total price after discount and tax
  duration: string; // backend will store months as string like "12 month"
  storeLimit: number;
  userLimit?: number; // Legacy field name
  staffLimit?: number; // New API field name
  themes: string[];
  modules: string[];
  tax?: string | { name: string; value: number; type: string }; // Reference to Tax document ID or populated tax object
  description?: string;
  status: boolean; // Backend expects boolean
  isTrial?: boolean;
  isMostPopular?: boolean; // Added from API response
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export interface ExtendedPlan extends Plan {
  id: string; // For compatibility with existing components
  Plan_Name: string; // For compatibility with existing components
  Plan_Type: string; // For compatibility with existing components
  Total_Stores: string; // For compatibility with existing components
  Price: string; // For compatibility with existing components
  Created_Date: string; // For compatibility with existing components
  Status: string; // For compatibility with existing components
  Plan_Position?: string; // For compatibility with existing components
  Discount_Type?: string; // For compatibility with existing components
  Discount?: string; // For compatibility with existing components
  StaffLimit?: number | string; // For compatibility with existing components
  Pos_Theme?: string; // For compatibility with existing components
  Modules?: string[]; // For compatibility with existing components
  Is_Recommended?: boolean; // For compatibility with existing components
  Description?: string; // For compatibility with existing components
  color?: string;
  textColor?: string;
  features?: string[];
  max_locations?: number;
  max_users?: number;
  support_level?: string;
  popular?: boolean;
  isMostPopular?: boolean; // match usage in components
  isRecommended?: boolean;
  posTheme?: string;
  planPosition?: number;
  discountType?: string;
  discount?: number;
  annual_price?: number;
  formattedPrice?: string; // Formatted price from API
  totalPrice?: number; // Total price after discount and tax
  currency?: {
    symbol: string;
    code: string;
    position: 'Left' | 'Right';
  };
  currencyId?: string;
}