/**
 * Navigation Configuration
 * 
 * Static sidebar configuration that maps permission keys to paths.
 * This is the single source of truth for navigation structure.
 * 
 * Sidebar visibility is determined by:
 * 1. permissions.tabs[key].read === true
 * 2. Bypass roles (admin, superadmin) have full access
 */

import { ComponentType } from 'react';
import {
    FaBoxes,
    FaStore,
    FaCog,
    FaUserTie,
    FaUsers,
    FaShoppingCart,
    FaDesktop,
    FaReceipt,
    FaUndo,
    FaWarehouse,
    FaBarcode,
    FaUserClock,
    FaDollarSign,
    FaExchangeAlt,
    FaPlus,
    FaMinus,
    FaGift,
    FaStar,
    FaTruck,
    FaChartLine,
    FaChartBar,
    FaFileInvoice,
    FaEnvelope,
    FaSms,
    FaWhatsapp,
    FaLanguage,
    FaCreditCard,
    FaFileInvoiceDollar,
    FaCoins,
    FaBell,
    FaClock,
} from 'react-icons/fa';
import { RxDashboard } from 'react-icons/rx';
import {
    LuCalendarPlus2,
    LuCalendarCheck,
    LuCalendarMinus2,
    LuDollarSign,
} from 'react-icons/lu';
import { RiCoupon2Line } from 'react-icons/ri';
import { TbReport } from 'react-icons/tb';
import {
    MdCategory,
    MdSubdirectoryArrowRight,
    MdBrandingWatermark,
    MdSecurity,
} from 'react-icons/md';
import { BiPackage, BiTransfer, BiAdjust } from 'react-icons/bi';
import { HiOutlineShoppingBag, HiOutlineCurrencyDollar } from 'react-icons/hi';
import { BsExclamationTriangle, BsCalendar2Check } from 'react-icons/bs';

// ============================================================================
// Types
// ============================================================================

export interface NavItem {
    /** Display label */
    label: string;
    /** URL path (unified /dashboard/* namespace) */
    path: string;
    /** Permission key from backend tabs */
    permissionKey: string;
    /** Icon component */
    icon?: ComponentType<{ className?: string }>;
    /** Nested items */
    children?: NavItem[];
}

export interface NavSection {
    /** Section header label */
    title?: string;
    /** Items in this section */
    items: NavItem[];
}

// ============================================================================
// Navigation Configuration
// ============================================================================

export const DASHBOARD_NAV_CONFIG: NavSection[] = [
    // Core
    {
        items: [
            {
                label: 'Dashboard',
                path: '/dashboard',
                permissionKey: 'dashboard',
                icon: RxDashboard,
            },
            {
                label: 'Store Management',
                path: '/dashboard/store-management',
                permissionKey: 'store',
                icon: FaStore,
            },
        ],
    },

    // Inventory Management
    {
        title: 'Inventory',
        items: [
            {
                label: 'Inventory Management',
                path: '/dashboard/inventory',
                permissionKey: 'inventory',
                icon: FaBoxes,
                children: [
                    {
                        label: 'Products',
                        path: '/dashboard/inventory/products',
                        permissionKey: 'inventory.products',
                        icon: FaBoxes,
                    },
                    {
                        label: 'Category',
                        path: '/dashboard/inventory/category',
                        permissionKey: 'inventory.category',
                        icon: MdCategory,
                    },
                    {
                        label: 'Subcategory',
                        path: '/dashboard/inventory/subcategory',
                        permissionKey: 'inventory.subcategory',
                        icon: MdSubdirectoryArrowRight,
                    },
                    {
                        label: 'Expired Stock',
                        path: '/dashboard/inventory/expired-stock',
                        permissionKey: 'inventory.expiredstock',
                        icon: BsExclamationTriangle,
                    },
                    {
                        label: 'Low Stock',
                        path: '/dashboard/inventory/low-stock',
                        permissionKey: 'inventory.lowstock',
                        icon: BsExclamationTriangle,
                    },
                    {
                        label: 'Variations',
                        path: '/dashboard/inventory/variations',
                        permissionKey: 'inventory.variations',
                        icon: BiPackage,
                    },
                    {
                        label: 'Units',
                        path: '/dashboard/inventory/units',
                        permissionKey: 'inventory.units',
                        icon: FaWarehouse,
                    },
                    {
                        label: 'Brands',
                        path: '/dashboard/inventory/brands',
                        permissionKey: 'inventory.brands',
                        icon: MdBrandingWatermark,
                    },
                    {
                        label: 'Warranty',
                        path: '/dashboard/inventory/warranty',
                        permissionKey: 'inventory.warranty',
                        icon: MdSecurity,
                    },
                    {
                        label: 'Print Labels',
                        path: '/dashboard/inventory/barcode-generate',
                        permissionKey: 'inventory.printlabels',
                        icon: FaBarcode,
                    },
                ],
            },
        ],
    },

    // HRM
    {
        title: 'Human Resources',
        items: [
            {
                label: 'HRM',
                path: '/dashboard/hrm',
                permissionKey: 'hrm',
                icon: FaUserTie,
                children: [
                    {
                        label: 'Staff Management',
                        path: '/dashboard/hrm/staff-manager',
                        permissionKey: 'hrm.staff',
                        icon: FaUserTie,
                    },
                    {
                        label: 'Shifts',
                        path: '/dashboard/hrm/shifts',
                        permissionKey: 'hrm.shifts',
                        icon: FaUserClock,
                        children: [
                            {
                                label: 'Shift Creation',
                                path: '/dashboard/hrm/shifts/management',
                                permissionKey: 'hrm.shifts',
                                icon: FaUserClock,
                            },
                            {
                                label: 'Shift Calendar',
                                path: '/dashboard/hrm/shifts/shift-calendar',
                                permissionKey: 'hrm.shifts',
                                icon: BsCalendar2Check,
                            },
                        ],
                    },
                    {
                        label: 'Attendance',
                        path: '/dashboard/hrm/attendance',
                        permissionKey: 'hrm.attendance',
                        icon: LuCalendarCheck,
                    },
                    {
                        label: 'Leaves',
                        path: '/dashboard/hrm/leaves',
                        permissionKey: 'hrm.leaves',
                        icon: LuCalendarPlus2,
                        children: [
                            {
                                label: 'Leave Types',
                                path: '/dashboard/hrm/leaves/types',
                                permissionKey: 'hrm.leaves',
                                icon: LuCalendarPlus2,
                            },
                            {
                                label: 'Leave Management',
                                path: '/dashboard/hrm/leaves/management',
                                permissionKey: 'hrm.leaves',
                                icon: LuCalendarPlus2,
                            },
                        ],
                    },
                    {
                        label: 'Holidays',
                        path: '/dashboard/hrm/holidays',
                        permissionKey: 'hrm.holidays',
                        icon: LuCalendarMinus2,
                    },
                    {
                        label: 'Payroll',
                        path: '/dashboard/hrm/payroll',
                        permissionKey: 'hrm.payroll',
                        icon: LuDollarSign,
                    },
                ],
            },
        ],
    },

    // Stock
    {
        title: 'Stock',
        items: [
            {
                label: 'Stock',
                path: '/dashboard/stock',
                permissionKey: 'stock',
                icon: BiTransfer,
                children: [
                    {
                        label: 'Stock Transfers',
                        path: '/dashboard/stock/transfers',
                        permissionKey: 'stock.transfers',
                        icon: BiTransfer,
                    },
                    {
                        label: 'Stock Adjustments',
                        path: '/dashboard/stock/adjustments',
                        permissionKey: 'stock.adjustments',
                        icon: BiAdjust,
                    },
                ],
            },
        ],
    },

    // Purchase
    {
        title: 'Purchase',
        items: [
            {
                label: 'Purchase',
                path: '/dashboard/purchase',
                permissionKey: 'purchase',
                icon: HiOutlineShoppingBag,
                children: [
                    {
                        label: 'Purchase Overview',
                        path: '/dashboard/purchase/purchase-overview',
                        permissionKey: 'purchase.overview',
                        icon: HiOutlineShoppingBag,
                    },
                    {
                        label: 'Purchase Order',
                        path: '/dashboard/purchase/purchase-order',
                        permissionKey: 'purchase.order',
                        icon: FaFileInvoice,
                    },
                    {
                        label: 'Purchase Return',
                        path: '/dashboard/purchase/purchase-return',
                        permissionKey: 'purchase.return',
                        icon: FaUndo,
                    },
                    {
                        label: 'Suppliers',
                        path: '/dashboard/purchase/suppliers',
                        permissionKey: 'suppliers',
                        icon: FaTruck,
                    },
                ],
            },
        ],
    },

    // Sales
    {
        title: 'Sales',
        items: [
            {
                label: 'Sales',
                path: '/dashboard/sales',
                permissionKey: 'sales',
                icon: FaShoppingCart,
                children: [
                    {
                        label: 'Sales',
                        path: '/dashboard/sales/sales',
                        permissionKey: 'sales.sales',
                        icon: FaShoppingCart,
                    },
                    {
                        label: 'POS Theme',
                        path: '/dashboard/sales/pos-theme',
                        permissionKey: 'sales.posTheme',
                        icon: FaReceipt,
                    },
                    {
                        label: 'Sales Return',
                        path: '/dashboard/sales/sales-return',
                        permissionKey: 'sales.salesReturn',
                        icon: FaUndo,
                    },
                ],
            },
        ],
    },

    // Finance
    {
        title: 'Finance',
        items: [
            {
                label: 'Finance',
                path: '/dashboard/finance',
                permissionKey: 'finance',
                icon: HiOutlineCurrencyDollar,
                children: [
                    {
                        label: 'Expense',
                        path: '/dashboard/finance/expense',
                        permissionKey: 'finance.expense',
                        icon: FaMinus,
                    },
                    {
                        label: 'Expense Category',
                        path: '/dashboard/finance/expense-category',
                        permissionKey: 'finance.expenseCategory',
                        icon: FaPlus,
                    },
                    {
                        label: 'Tax',
                        path: '/dashboard/finance/tax',
                        permissionKey: 'finance.tax',
                        icon: HiOutlineCurrencyDollar,
                    },
                ],
            },
        ],
    },

    // Promo
    {
        title: 'Promotions',
        items: [
            {
                label: 'Promo',
                path: '/dashboard/promo',
                permissionKey: 'promo',
                icon: RiCoupon2Line,
                children: [
                    {
                        label: 'Coupons',
                        path: '/dashboard/promo/coupons',
                        permissionKey: 'promo.coupons',
                        icon: RiCoupon2Line,
                    },
                    {
                        label: 'Loyalty Points Config',
                        path: '/dashboard/promo/loyalty-points?type=Loyalty',
                        permissionKey: 'promo.loyalty',
                        icon: FaStar,
                    },
                    {
                        label: 'Loyalty Points History',
                        path: '/dashboard/promo/loyalty-points-history',
                        permissionKey: 'promo.loyaltyHistory',
                        icon: FaClock,
                    },
                    {
                        label: 'Gift Card',
                        path: '/dashboard/promo/gift-card',
                        permissionKey: 'promo.giftcards',
                        icon: FaGift,
                    },
                    {
                        label: 'Gift Card History',
                        path: '/dashboard/promo/gift-card-history',
                        permissionKey: 'promo.giftCardHistory',
                        icon: FaClock,
                    },
                ],
            },
        ],
    },

    // POS Screen
    {
        title: 'POS',
        items: [
            {
                label: 'POS Screen',
                path: '/dashboard/pos-screen',
                permissionKey: 'pos',
                icon: FaDesktop,
                children: [
                    {
                        label: 'POS 1',
                        path: '/dashboard/pos-screen/pos-1',
                        permissionKey: 'pos.pos1',
                        icon: FaDesktop,
                    },
                    {
                        label: 'POS 2',
                        path: '/dashboard/pos-screen/pos-2',
                        permissionKey: 'pos.pos2',
                        icon: FaDesktop,
                    },
                    {
                        label: 'POS 3',
                        path: '/dashboard/pos-screen/pos-3',
                        permissionKey: 'pos.pos3',
                        icon: FaDesktop,
                    },
                    {
                        label: 'POS 4',
                        path: '/dashboard/pos-screen/pos-4',
                        permissionKey: 'pos.pos4',
                        icon: FaDesktop,
                    },
                    {
                        label: 'POS 5',
                        path: '/dashboard/pos-screen/pos-5',
                        permissionKey: 'pos.pos5',
                        icon: FaDesktop,
                    },
                ],
            },
        ],
    },

    // People
    {
        title: 'People',
        items: [
            {
                label: 'People',
                path: '/dashboard/people',
                permissionKey: 'people',
                icon: FaUsers,
                children: [
                    {
                        label: 'Customers',
                        path: '/dashboard/people/customers',
                        permissionKey: 'people.customers',
                        icon: FaUsers,
                    },
                ],
            },
        ],
    },

    // Reports
    {
        title: 'Reports',
        items: [
            {
                label: 'Reports',
                path: '/dashboard/reports',
                permissionKey: 'reports',
                icon: TbReport,
                children: [
                    {
                        label: 'Sales Report',
                        path: '/dashboard/reports/sales',
                        permissionKey: 'reports.sales',
                        icon: FaShoppingCart,
                    },
                    {
                        label: 'Daily Cashier Report',
                        path: '/dashboard/reports/daily-cashier',
                        permissionKey: 'reports.dailyCashier',
                        icon: FaReceipt,
                    },
                    {
                        label: 'Transaction Report',
                        path: '/dashboard/reports/transactions',
                        permissionKey: 'reports.transaction',
                        icon: FaExchangeAlt,
                    },
                    {
                        label: 'Purchase Report',
                        path: '/dashboard/reports/purchase',
                        permissionKey: 'reports.purchase',
                        icon: HiOutlineShoppingBag,
                    },
                    {
                        label: 'Expenses Report',
                        path: '/dashboard/reports/expenses',
                        permissionKey: 'reports.expenses',
                        icon: FaMinus,
                    },
                    {
                        label: 'Stock History Report',
                        path: '/dashboard/reports/stock-history',
                        permissionKey: 'reports.stockHistory',
                        icon: FaBoxes,
                    },
                    {
                        label: 'Payroll Report',
                        path: '/dashboard/reports/payroll',
                        permissionKey: 'reports.payroll',
                        icon: FaDollarSign,
                    },
                    {
                        label: 'Customer Report',
                        path: '/dashboard/reports/customer',
                        permissionKey: 'reports.customer',
                        icon: FaUsers,
                    },
                    {
                        label: 'User Login Report',
                        path: '/dashboard/reports/user-login',
                        permissionKey: 'reports.userLogin',
                        icon: FaUserClock,
                    },
                    {
                        label: 'User Activity Report',
                        path: '/dashboard/reports/user-activity',
                        permissionKey: 'reports.userActivity',
                        icon: FaUserClock,
                    },
                    {
                        label: 'Financial & Tax Report',
                        path: '/dashboard/reports/financial-summary-tax',
                        permissionKey: 'reports.financialTax',
                        icon: FaChartLine,
                        children: [
                            {
                                label: 'Profit & Loss Report',
                                path: '/dashboard/reports/profit-loss',
                                permissionKey: 'reports.financialTax',
                                icon: FaChartLine,
                            },
                            {
                                label: 'Annual Report',
                                path: '/dashboard/reports/annual',
                                permissionKey: 'reports.financialTax',
                                icon: FaChartBar,
                            },
                            {
                                label: 'Tax Report',
                                path: '/dashboard/reports/tax',
                                permissionKey: 'reports.financialTax',
                                icon: HiOutlineCurrencyDollar,
                            },
                        ],
                    },
                ],
            },
        ],
    },

    // User Management
    {
        title: 'Administration',
        items: [
            {
                label: 'User Management',
                path: '/dashboard/user-management',
                permissionKey: 'access',
                icon: FaUserTie,
                children: [
                    {
                        label: 'Roles and Permission',
                        path: '/dashboard/user-management/roles-permission',
                        permissionKey: 'access.roles',
                        icon: FaUserTie,
                    },
                ],
            },
            {
                label: 'Notifications',
                path: '/dashboard/notifications',
                permissionKey: 'access.notifications',
                icon: FaBell,
                children: [
                    {
                        label: 'Email',
                        path: '/dashboard/notifications/email',
                        permissionKey: 'access.notifications',
                        icon: FaEnvelope,
                    },
                    {
                        label: 'SMS',
                        path: '/dashboard/notifications/sms',
                        permissionKey: 'access.notifications',
                        icon: FaSms,
                    },
                    {
                        label: 'Whatsapp',
                        path: '/dashboard/notifications/whatsapp',
                        permissionKey: 'access.notifications',
                        icon: FaWhatsapp,
                    },
                ],
            },
        ],
    },

    // System Settings
    {
        title: 'Settings',
        items: [
            {
                label: 'System Settings',
                path: '/dashboard/system-settings',
                permissionKey: 'settings',
                icon: FaCog,
                children: [
                    {
                        label: 'General Settings',
                        path: '/dashboard/system-settings/general-setting',
                        permissionKey: 'settings.general',
                        icon: FaCog,
                    },
                    {
                        label: 'Misc Settings',
                        path: '/dashboard/system-settings/misc-setting',
                        permissionKey: 'settings.misc',
                        icon: FaCog,
                    },
                    {
                        label: 'Mail Settings',
                        path: '/dashboard/system-settings/mail-setting',
                        permissionKey: 'settings.mail',
                        icon: FaEnvelope,
                    },
                    {
                        label: 'SMS Settings',
                        path: '/dashboard/system-settings/sms-setting',
                        permissionKey: 'settings.sms',
                        icon: FaSms,
                    },
                    {
                        label: 'WhatsApp Settings',
                        path: '/dashboard/system-settings/whatsapp-setting',
                        permissionKey: 'settings.whatsapp',
                        icon: FaWhatsapp,
                    },
                    {
                        label: 'Language Settings',
                        path: '/dashboard/system-settings/language-setting',
                        permissionKey: 'settings.language',
                        icon: FaLanguage,
                    },
                    {
                        label: 'Payment Methods',
                        path: '/dashboard/system-settings/payment-method-setting',
                        permissionKey: 'settings.paymentMethods',
                        icon: FaCreditCard,
                    },
                    {
                        label: 'Invoice Settings',
                        path: '/dashboard/system-settings/invoice-setting',
                        permissionKey: 'settings.invoice',
                        icon: FaFileInvoiceDollar,
                    },
                    {
                        label: 'Currency Settings',
                        path: '/dashboard/system-settings/currency-setting',
                        permissionKey: 'settings.currency',
                        icon: FaCoins,
                    },
                ],
            },
        ],
    },
];

// ============================================================================
// Path to Permission Key Mapping (for page-level authorization)
// ============================================================================

/**
 * Generate a flat map of paths to permission keys for quick lookup
 */
export const generatePathPermissionMap = (): Map<string, string> => {
    const map = new Map<string, string>();

    const processItems = (items: NavItem[]) => {
        for (const item of items) {
            map.set(item.path.split('?')[0], item.permissionKey);
            if (item.children) {
                processItems(item.children);
            }
        }
    };

    for (const section of DASHBOARD_NAV_CONFIG) {
        processItems(section.items);
    }

    return map;
};

export const PATH_PERMISSION_MAP = generatePathPermissionMap();

/**
 * Get permission key for a given path
 */
export const getPermissionKeyForPath = (path: string): string | undefined => {
    // Exact match first
    const exactMatch = PATH_PERMISSION_MAP.get(path);
    if (exactMatch) return exactMatch;

    // Try parent paths
    const segments = path.split('/').filter(Boolean);
    while (segments.length > 1) {
        segments.pop();
        const parentPath = '/' + segments.join('/');
        const parentMatch = PATH_PERMISSION_MAP.get(parentPath);
        if (parentMatch) return parentMatch;
    }

    return undefined;
};
