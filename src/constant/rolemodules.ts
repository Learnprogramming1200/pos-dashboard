import { AdminTypes } from "@/types";

export const ROLE_DEFINITIONS: AdminTypes.RolePermissionTypes.RoleDefinition[] = [
    { key: "admin", label: "Admin" },
    { key: "manager", label: "Manager" },
    { key: "cashier", label: "Cashier" },
    { key: "generalstaff", label: "General Staff" },
];

export const getDefaultPermissions = (): Record<AdminTypes.RolePermissionTypes.RoleKey, boolean> => {
    return ROLE_DEFINITIONS.reduce((acc, role) => {
        acc[role.key] = false;
        return acc;
    }, {} as Record<AdminTypes.RolePermissionTypes.RoleKey, boolean>);
};

// Standard CRUD actions for all modules
const getStandardActions = () => [
    { key: "view", name: "View", permissions: getDefaultPermissions() },
    { key: "add", name: "Add", permissions: getDefaultPermissions() },
    { key: "edit", name: "Edit", permissions: getDefaultPermissions() },
    { key: "delete", name: "Delete", permissions: getDefaultPermissions() },
];

export const DEFAULT_MODULES: AdminTypes.RolePermissionTypes.ModuleGroup[] = [
    // Dashboard
    {
        key: "dashboard",
        name: "Dashboard",
        actions: getStandardActions(),
    },

    // Store
    {
        key: "store",
        name: "Store Management",
        actions: getStandardActions(),
    },

    // HRM
    {
        key: "hrm.staff",
        name: "Staff Management",
        actions: getStandardActions(),
    },
    {
        key: "hrm.shifts",
        name: "Shift Management",
        actions: getStandardActions(),
    },
    {
        key: "hrm.attendance",
        name: "Attendance",
        actions: getStandardActions(),
    },
    {
        key: "hrm.leaves",
        name: "Leaves",
        actions: getStandardActions(),
    },
    {
        key: "hrm.holidays",
        name: "Holidays",
        actions: getStandardActions(),
    },
    {
        key: "hrm.payroll",
        name: "Payroll",
        actions: getStandardActions(),
    },

    // Inventory
    {
        key: "inventory.products",
        name: "Products",
        actions: getStandardActions(),
    },
    {
        key: "inventory.category",
        name: "Category",
        actions: getStandardActions(),
    },
    {
        key: "inventory.subcategory",
        name: "Subcategory",
        actions: getStandardActions(),
    },
    {
        key: "inventory.expiredstock",
        name: "Expired Stock",
        actions: getStandardActions(),
    },
    {
        key: "inventory.lowstock",
        name: "Low Stock",
        actions: getStandardActions(),
    },
    {
        key: "inventory.variations",
        name: "Variations",
        actions: getStandardActions(),
    },
    {
        key: "inventory.units",
        name: "Units",
        actions: getStandardActions(),
    },
    {
        key: "inventory.brands",
        name: "Brands",
        actions: getStandardActions(),
    },
    {
        key: "inventory.warranty",
        name: "Warranty",
        actions: getStandardActions(),
    },
    {
        key: "inventory.printlabels",
        name: "Print Labels",
        actions: getStandardActions(),
    },

    // Stock
    {
        key: "stock.transfers",
        name: "Stock Transfers",
        actions: getStandardActions(),
    },
    {
        key: "stock.adjustments",
        name: "Stock Adjustments",
        actions: getStandardActions(),
    },

    // Purchase
    {
        key: "purchase.overview",
        name: "Purchase Overview",
        actions: getStandardActions(),
    },
    {
        key: "purchase.order",
        name: "Purchase Order",
        actions: getStandardActions(),
    },
    {
        key: "purchase.return",
        name: "Purchase Return",
        actions: getStandardActions(),
    },

    // Suppliers
    {
        key: "suppliers",
        name: "Suppliers",
        actions: getStandardActions(),
    },

    // Sales
    {
        key: "sales.sales",
        name: "Sales",
        actions: getStandardActions(),
    },
    {
        key: "sales.posTheme",
        name: "POS Themes",
        actions: getStandardActions(),
    },
    {
        key: "sales.salesReturn",
        name: "Sales Return",
        actions: getStandardActions(),
    },

    // Finance
    {
        key: "finance.expense",
        name: "Expense",
        actions: getStandardActions(),
    },
    {
        key: "finance.expenseCategory",
        name: "Expense Category",
        actions: getStandardActions(),
    },
    {
        key: "finance.tax",
        name: "Tax",
        actions: getStandardActions(),
    },

    // Promo
    {
        key: "promo.loyalty",
        name: "Loyalty Point Config",
        actions: getStandardActions(),
    },
    {
        key: "promo.loyaltyHistory",
        name: "Loyalty Point History",
        actions: getStandardActions(),
    },
    {
        key: "promo.giftcards",
        name: "Gift Card",
        actions: getStandardActions(),
    },
    {
        key: "promo.giftCardHistory",
        name: "Gift Card History",
        actions: getStandardActions(),
    },
    {
        key: "promo.coupons",
        name: "Coupons",
        actions: getStandardActions(),
    },

    // People
    {
        key: "people.customers",
        name: "Customers",
        actions: getStandardActions(),
    },

    // Reports
    {
        key: "reports.sales",
        name: "Sales Report",
        actions: getStandardActions(),
    },
    {
        key: "reports.dailyCashier",
        name: "Daily Cashier Report",
        actions: getStandardActions(),
    },
    {
        key: "reports.transaction",
        name: "Transaction Report",
        actions: getStandardActions(),
    },
    {
        key: "reports.purchase",
        name: "Purchase Report",
        actions: getStandardActions(),
    },
    {
        key: "reports.expenses",
        name: "Expenses Report",
        actions: getStandardActions(),
    },
    {
        key: "reports.stockHistory",
        name: "Stock History Report",
        actions: getStandardActions(),
    },
    {
        key: "reports.payroll",
        name: "Payroll Report",
        actions: getStandardActions(),
    },
    {
        key: "reports.customer",
        name: "Customer Report",
        actions: getStandardActions(),
    },
    {
        key: "reports.userLogin",
        name: "User Login Report",
        actions: getStandardActions(),
    },
    {
        key: "reports.userActivity",
        name: "User Activity Report",
        actions: getStandardActions(),
    },
    {
        key: "reports.financialTax",
        name: "Financial & Tax Report",
        actions: getStandardActions(),
    },

    // POS Terminals
    {
        key: "pos.pos1",
        name: "POS 1",
        actions: getStandardActions(),
    },
    {
        key: "pos.pos2",
        name: "POS 2",
        actions: getStandardActions(),
    },
    {
        key: "pos.pos3",
        name: "POS 3",
        actions: getStandardActions(),
    },
    {
        key: "pos.pos4",
        name: "POS 4",
        actions: getStandardActions(),
    },
    {
        key: "pos.pos5",
        name: "POS 5",
        actions: getStandardActions(),
    },

    // Access Control & Notifications
    {
        key: "access.roles",
        name: "Role Permissions",
        actions: getStandardActions(),
    },
    {
        key: "access.notifications",
        name: "Notifications",
        actions: getStandardActions(),
    },

    // Settings
    {
        key: "settings.general",
        name: "General Settings",
        actions: getStandardActions(),
    },
    {
        key: "settings.misc",
        name: "Misc Settings",
        actions: getStandardActions(),
    },
    {
        key: "settings.mail",
        name: "Mail Settings",
        actions: getStandardActions(),
    },
    {
        key: "settings.language",
        name: "Language Settings",
        actions: getStandardActions(),
    },
    {
        key: "settings.paymentMethods",
        name: "Payment Methods",
        actions: getStandardActions(),
    },
    {
        key: "settings.invoice",
        name: "Invoice Settings",
        actions: getStandardActions(),
    },
    {
        key: "settings.currency",
        name: "Currency Settings",
        actions: getStandardActions(),
    },
    {
        key: "settings.notification",
        name: "Notification Settings",
        actions: getStandardActions(),
    },
    {
        key: "settings.system",
        name: "System Settings",
        actions: getStandardActions(),
    },
    {
        key: "settings.sms",
        name: "SMS Settings",
        actions: getStandardActions(),
    },
    {
        key: "settings.whatsapp",
        name: "WhatsApp Settings",
        actions: getStandardActions(),
    },

    // Helpdesk
    {
        key: "helpdesk.support",
        name: "Helpdesk Support",
        actions: getStandardActions(),
    },
];
