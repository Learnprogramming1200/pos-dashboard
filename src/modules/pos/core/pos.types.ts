import type { LucideIcon } from 'lucide-react';

// API Response Types
export interface APIResponse<T> {
    success: boolean;
    data: T;
    error?: string;
    message?: string;
}

export interface POSInitData {
    stores: Store[];
    selectedStoreId: string | null;
    categories: Category[];
    products: RawProduct[];
    customers: Customer[];
    coupons: Coupon[];
    redemptionRules: RedemptionRule[];
}

export interface SalesSummary {
    totalSales: number;
    totalOrders: number;
    totalCash: number;
    totalCard: number;
}

export interface StoreChangeData {
    products: RawProduct[];
}

// Store Types
export interface Store {
    _id: string;
    name: string;
    description?: string;
    owner?: { _id: string; name: string; isActive: boolean };
    email?: string;
    contactNumber?: string; // API field
    phone?: string;
    location?: {
        address: string;
        city: string;
        state: string;
        country: string;
        postalCode: string;
    }; // API field covers address
    address?: string; // Kept for backward compatibility
    geoLocation?: { type: string; coordinates: number[] };
    status?: 'active' | 'inactive' | boolean | string;
    createdAt?: string;
    updatedAt?: string;
}

// User & Role Types
export type UserRole = 'superadmin' | 'admin' | 'manager' | 'cashier' | 'user';

export interface POSUser {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    role: UserRole;
    roleId?: { _id: number; name: string };
    roleName?: string;
    isAdmin: boolean;
    assignedStoreId?: string;
    assignedStore?: Store;
    profilePicture?: string | null;
}

export interface CashierInfo {
    name: string;
    id: string;
    role?: UserRole;
    avatar?: string;
}

export interface RegisterInfo {
    id: string;
    name: string;
    location?: string;
}

// Category Types
export interface Category {
    _id: string;
    name: string;
    categoryName?: string; // API field
    slug?: string;
    icon?: LucideIcon | React.ComponentType<any>;
    image?: string;
    description?: string;
    status?: 'active' | 'inactive' | boolean | string;
    isActive?: boolean; // API field
    business?: string;
    createdBy?: string;
    updatedBy?: string;
    hasExpiry?: boolean;
    hasWarranty?: boolean;
    isDeleted?: boolean;
    parentId?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface CategoryDisplayItem extends Category {
    isActive?: boolean;
}

// Stock Types (Production API Structure)
export interface StoreStockItem {
    storeId: string;
    storeName?: string;
    quantity: number;
    lowStockAlert?: number;
}

export interface ProductStock {
    totalStock?: number;
    storeStock?: StoreStockItem[];
}

// Tax Types (Production API Structure)
export interface ProductTax {
    _id?: string;
    taxName?: string;
    taxType?: 'Exclusive' | 'Inclusive';
    valueType?: 'Percentage' | 'Fixed';
    value: number;
}

// Variant Types (Production API Structure)
export interface VariantAttributeValue {
    attributeId?: string;
    attributeName: string;
    valueId?: string;
    valueName: string;
}

export interface ProductVariant {
    _id: string;
    variantSku: string;
    variantTitle: string;
    variantImage?: string;
    purchasePrice: number;
    sellingPrice: number;
    discount?: number; // Discount percentage or fixed amount per variant
    attributes: VariantAttributeValue[];
    stock: ProductStock;
    barcode?: string;
    barcodeUrl?: string;
    status?: 'active' | 'inactive' | boolean;
    lowStockAlert?: number;
    costPrice?: number;
    SKU?: string; // Alternative SKU field from API
    variantValues?: Array<{ value: string; valueId: string; _id: string }>;
}

// Raw Product Types (Production API Structure)
export interface RawProduct {
    _id: string;
    productName?: string; // API field
    name: string;
    sku?: string;
    SKU?: string; // Alternative SKU field from API
    barcode?: string;
    barcodeUrl?: string;
    productImage?: string;
    images?: string[];
    description?: string;
    purchasePrice?: number;
    costPrice?: number; // Alternative cost price field from API
    sellingPrice?: number;
    discount?: number; // Product-level discount
    category?: {
        _id?: string;
        categoryName?: string;
        name?: string;
        hasExpiry?: boolean;
        hasWarranty?: boolean;
    } | string;
    subCategory?: {
        subcategory?: string;
    };
    categoryId?: string;
    subcategoryId?: string;
    brand?: {
        _id?: string;
        brand?: string;
        name?: string;
    } | string;
    unit?: {
        _id?: string;
        name?: string;
        shortName?: string;
        value?: number;
    } | string;
    tax?: ProductTax[] | null; // Array of tax objects from API
    taxPercent?: number;
    taxable?: boolean;
    status?: 'active' | 'inactive' | boolean;
    hasVariation?: boolean;
    variantIds?: Array<{ _id: string; variant: string }>;
    variantData?: ProductVariant[];
    stock?: ProductStock;
    warrantyType?: {
        _id?: string;
        name?: string;
    } | null;
    warranty?: {
        hasWarranty?: boolean;
        duration?: number;
        unit?: string;
    };
    expiryDate?: string;
    expiry?: {
        hasExpiry?: boolean;
        expiryDate?: string;
    };
    dimensions?: string;
    lowStockAlert?: number;
    totalQuantity?: number;
    storeId?: string;
    createdAt?: string;
    updatedAt?: string;
}

// Display Product Type (For UI Rendering)
export interface Product {
    // Core identifiers
    _id: string;

    // Display fields
    name: string;
    sku: string;
    barcode: string;
    price: number;
    salePrice?: number;
    cost?: number;

    // Category
    category: string;
    categoryId: string;
    subcategoryId: string;

    // Images
    image: string;
    images: string[];

    // Inventory
    stock: number;
    quantity?: number;
    unit: string;
    lowStockAlert: number;

    // Tax (full tax info - array of taxes)
    taxes?: ProductTax[] | null;
    taxPercent: number;
    taxType: 'Exclusive' | 'Inclusive';
    taxValueType: 'Percentage' | 'Fixed';
    taxable: boolean;

    // Discount (product/variant level)
    discount: number; // Discount percentage or fixed value
    discountType?: 'Percentage' | 'Fixed';

    // Status
    status: 'active' | 'inactive';

    // Store
    storeId: string;

    // Additional info
    description: string;
    brand: string;

    // Variant info (if this is a variant)
    isVariant: boolean;
    parentProductId: string;
    variantAttributes: VariantAttributeValue[];

    // Warranty & Expiry
    hasWarranty: boolean;
    warrantyDuration: number;
    warrantyUnit: string;
    hasExpiry: boolean;
    expiryDate: string;

    // Timestamps
    createdAt: string;
    updatedAt: string;
}

// Order Types
export interface OrderItem {
    id: string;
    productId?: string;
    name: string;
    price: number; // Unit selling price
    quantity: number;

    // Discount info
    discount: number; // Discount value (percentage or fixed per unit)
    discountType?: 'Percentage' | 'Fixed';
    discountAmount?: number; // Calculated discount amount for this item

    // Tax info (array of taxes)
    taxes?: ProductTax[] | null;
    taxBreakdown?: Array<{ taxId: string; taxName: string; taxType: 'Exclusive' | 'Inclusive'; valueType: 'Percentage' | 'Fixed'; value: number; taxAmount: number }>;
    taxAmount?: number; // Total calculated tax amount for this item

    // Totals
    subtotal?: number; // price * quantity
    total?: number; // subtotal - discountAmount + taxAmount (for exclusive tax)

    notes?: string;
    image?: string;
    sku?: string;
    barcode?: string;
    isVariant?: boolean;
    variantAttributes?: VariantAttributeValue[];
}

export interface Order {
    _id?: string;
    orderNumber: string;
    items: OrderItem[];
    customerId?: string;
    customerName?: string;
    storeId: string;
    status: 'draft' | 'pending' | 'completed' | 'cancelled' | 'refunded';
    paymentMethod?: PaymentMethodType;
    paymentStatus?: 'pending' | 'paid' | 'partial' | 'refunded';
    subTotal: number;
    tax: number;
    discount: number;
    shipping: number;
    grandTotal: number;
    notes?: string;
    createdAt?: string;
    updatedAt?: string;
    createdBy?: string;
}

// Gift Card Assignment Type
export interface AssignedGiftCard {
    _id: string;
    name: string;
    number: string;
    value: number;
    thresholdAmount?: number;
    validity?: string;
    customerScope?: string;
    terms?: string;
    giftCardImage?: string;
}

// Loyalty Points Data Type
export interface LoyaltyPointsData {
    totalEarned: number;
    totalRedeemed: number;
    totalExpired: number;
    currentBalance: number;
    availablePoints: number;
}

// Customer Types
export interface Customer {
    _id: string;
    name: string;
    customerName?: string; // API field
    fullName?: string; // API field
    email?: string;
    phone: string;
    code?: string;
    customerCode?: string; // API field
    address?: string | {
        street: string;
        city: string;
        state: string;
        country: string;
        pincode?: string;
    }; // Modified to accept object from API
    gender?: string;
    isActive?: boolean;
    isDeleted?: boolean;
    createdBy?: string;
    updatedBy?: string;
    loyaltyPoints?: number | {
        totalEarned: number;
        totalRedeemed: number;
        totalExpired: number;
        currentBalance: number;
        availablePoints: number;
    };
    loyaltyPointsData?: LoyaltyPointsData;
    assignedGiftCards?: AssignedGiftCard[];
    createdAt?: string;
    updatedAt?: string;
}

// Payment Types
export type PaymentMethodType =
    | 'cash'
    | 'card'
    | 'loyalty-points'
    | 'gift-card'
    | 'pay-later'
    | 'scan';

export interface PaymentMethod {
    id: PaymentMethodType;
    name: string;
    icon: LucideIcon;
    color: string;
    enabled?: boolean;
}

// Coupon Types
export interface Coupon {
    _id: string;
    code: string;
    description?: string;
    type: 'percentage' | 'fixed' | 'Percentage' | 'Fixed'; // Added capital case from older API checks
    discount_amount?: number; // API field
    value: number;
    minPurchase?: number;
    maxDiscount?: number;
    limit?: number; // API field
    usageLimit?: number;
    usageCount?: number; // API field
    usedCount?: number;
    maxUsagePerUser?: number;
    start_date?: string; // API field
    end_date?: string; // API field
    startDate?: string;
    endDate?: string;
    status?: 'active' | 'inactive' | 'expired' | boolean | string;
}

// Redemption Rule Types
export interface RedemptionRule {
    _id: string;
    ruleName: string;
    pointFrom: number;
    pointTo: number;
    amount: number;
    status: boolean;
    isDeleted?: boolean;
    createdBy?: string;
    updatedBy?: string;
    createdAt?: string;
    updatedAt?: string;
}

// POS State Types
export interface POSLoadingState {
    stores: boolean;
    categories: boolean;
    products: boolean;
    customers: boolean;
    initializing: boolean;
}

export interface POSError {
    type: 'stores' | 'categories' | 'products' | 'customers' | 'general' | 'api';
    message: string;
    code?: string;
}

export interface POSCoreState {
    // Store data
    stores: Store[];
    selectedStoreId: string | null;
    selectedStore: Store | null;

    // User & Role
    user: POSUser | null;
    userRole: UserRole | null;
    canChangeStore: boolean;

    // Categories
    categories: Category[];
    selectedCategoryId: string;

    // Products
    products: Product[];
    filteredProducts: Product[];
    searchQuery: string;

    // Customers
    customers: Customer[];
    selectedCustomer: Customer | null;

    // Order
    orderItems: OrderItem[];
    currentOrderNumber: string;

    // Payment
    selectedPaymentMethod: PaymentMethodType | null;

    // Coupons
    coupons: Coupon[];
    appliedCoupon: Coupon | null;

    // Redemption Rules
    redemptionRules: RedemptionRule[];

    // UI State
    loading: POSLoadingState;
    error: POSError | null;

    // Calculated values
    productPrice: number;
    discount: number;
    productDiscount: number;
    couponDiscount: number;
    loyaltyDiscount: number;
    giftCardDiscount: number;
    subTotal: number;
    tax: number;
    hasInclusiveTax: boolean;
    hasExclusiveTax: boolean;
    shipping: number;
    grandTotal: number;
    roundOff: number;
}

// POS Actions Types
export interface POSActions {
    // Store actions
    setSelectedStore: (storeId: string) => void;
    refreshStores: () => Promise<void>;

    // Category actions
    setSelectedCategory: (categoryId: string) => void;
    refreshCategories: () => Promise<void>;

    // Product actions
    setSearchQuery: (query: string) => void;
    refreshProducts: () => Promise<void>;

    // Order actions
    addToOrder: (product: Product) => void;
    updateOrderItemQuantity: (itemId: string, quantity: number) => void;
    removeFromOrder: (itemId: string) => void;
    clearOrder: () => void;

    // Customer actions
    setSelectedCustomer: (customer: Customer | null) => void;
    refreshCustomers: () => Promise<void>;
    createCustomer: (data: { name: string; phone: string; email?: string; code?: string }) => Promise<void>;

    // Payment actions
    setSelectedPaymentMethod: (method: PaymentMethodType) => void;


    // Coupon actions
    applyCoupon: (couponCode: string) => Promise<boolean>;
    removeCoupon: () => void;
    applyLoyalty: (amount: number) => void;
    removeLoyalty: () => void;
    applyGiftCard: (amount: number) => void;
    removeGiftCard: () => void;

    // General actions
    resetPOS: () => void;
    refreshAll: () => Promise<void>;
}

// POS Context Type
export interface POSContextValue extends POSCoreState, POSActions {
    // Header-specific data
    isFullscreen: boolean;
    toggleFullscreen: () => void;
    darkMode: boolean;
    toggleDarkMode: () => void;
    currentTime: Date;
    formattedDate: string;
    formattedTime: string;
    cashierInfo: CashierInfo;
    registerInfo: RegisterInfo;
    isCalculatorOpen: boolean;
    setIsCalculatorOpen: (open: boolean) => void;
    handleBack: () => void;
    isAddCustomerModalOpen: boolean;
    setIsAddCustomerModalOpen: (open: boolean) => void;

    // Category helpers
    getFilteredProducts: (search?: string, categoryId?: string) => Product[];
    getCategoryById: (categoryId: string) => Category | null | undefined;

    // Utility
    isReady: boolean;
}

// Component Props Types
export interface POSLayoutProps {
    children?: React.ReactNode;
}

export interface POSScreenProps {
    variant?: 'pos-2' | 'pos-3' | 'pos-4' | 'pos-5';
}
