"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import PerfectScrollbar from "react-perfect-scrollbar";
import "react-perfect-scrollbar/dist/css/styles.css";
import { getUserRole } from "@/lib/utils";
import { useTheme } from "next-themes";
import { publicAPI } from "@/lib/api";
import { ServerActions } from "@/lib";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "next-auth/react";
import { Constants } from "@/constant";
import {
  FaArrowLeft,
  FaArrowRight,
  FaRegUser,
  FaTags,
  FaClipboardList,
  FaChartBar,
  FaCog,
  FaChevronDown,
  FaChevronRight,
  FaStore,
  FaUsers,
  FaClock,
  FaBoxes,
  FaWarehouse,
  FaBarcode,
  FaUserTie,
  FaUserClock,
  FaDollarSign,
  FaExchangeAlt,
  FaPlus,
  FaMinus,
  FaShoppingCart,
  FaReceipt,
  FaUndo,
  FaCreditCard,
  FaGift,
  FaStar,
  FaTruck,
  FaChartLine,
  FaChartPie,
  FaFileInvoice,
  FaFileAlt,
  FaEnvelope,
  FaSms,
  FaWhatsapp,
  FaLanguage,
  FaFileInvoiceDollar,
  FaCoins,
  FaBell,
  FaHeadset,
  FaDesktop,
} from "react-icons/fa";
import { RxDashboard } from "react-icons/rx";
import {
  LuLayers3,
  LuCalendarPlus2,
  LuCalendarCheck,
  LuCalendarMinus2,
  LuDollarSign,
} from "react-icons/lu";
import { RiCoupon2Line, RiAdvertisementLine } from "react-icons/ri";
import { TbReport, TbLayoutSidebarRight, TbNotification } from "react-icons/tb";
import {
  MdCategory,
  MdSubdirectoryArrowRight,
  MdBrandingWatermark,
  MdSecurity,
} from "react-icons/md";
import { BiPackage, BiTransfer, BiAdjust } from "react-icons/bi";
import { HiOutlineShoppingBag, HiOutlineCurrencyDollar } from "react-icons/hi";
import { BsExclamationTriangle, BsCalendar2Check } from "react-icons/bs";

type SidebarProps = {
  collapsed: boolean;
  toggleCollapse: () => void;
};

interface MenuItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }> | null;
  hasDropdown?: boolean;
  permissionKey?: string;
  dropdownItems?: {
    label: string;
    href: string;
    icon?: React.ComponentType<{ className?: string }>;
    hasDropdown?: boolean;
    permissionKey?: string;
    dropdownItems?: {
      label: string;
      href: string;
      icon?: React.ComponentType<{ className?: string }>;
      permissionKey?: string;
    }[];
  }[];
  isSectionHeader?: boolean;
}

interface GeneralSettingsData {
  logos?: {
    darkLogo?: { url?: string };
    lightLogo?: { url?: string };
    collapsDarkLogo?: { url?: string };
    collapsLightLogo?: { url?: string };
  };
  appName?: string;
}

export default function Sidebar({ collapsed, toggleCollapse }: SidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [openDropdowns, setOpenDropdowns] = React.useState<Record<string, boolean>>(
    {},
  );
  const { data: session, status } = useSession();
  const user = session?.user;
  const { resolvedTheme } = useTheme();
  const [settings, setSettings] = React.useState<GeneralSettingsData | null>(null);
  const [mounted, setMounted] = React.useState(false);

  const userRole = React.useMemo(() => getUserRole(user), [user]);

  // Memoize the isActive function to handle path and query params
  const isActive = React.useCallback(
    (href: string) => {
      const [path] = href.split("?");

      if (userRole === "superadmin") {
        if (path === "/superadmin") {
          return pathname === "/superadmin" || pathname === "/superadmin/";
        }
      } else if (userRole === "admin") {
        if (path === "/admin") {
          return pathname === "/admin" || pathname === "/admin/";
        }
      } else if (userRole === "cashier") {
        if (path === "/cashier") {
          return pathname === "/cashier" || pathname === "/cashier/";
        }
      } else if (userRole === "manager") {
        if (path === "/manager") {
          return pathname === "/manager" || pathname === "/manager/";
        }
      }

      return pathname === path || pathname.startsWith(path + "/");
    },
    [pathname, userRole],
  );

  React.useEffect(() => {
    setMounted(true);

    const fetchSettings = async () => {
      try {
        const response = await publicAPI.getGeneralSettings();
        if (response?.data?.data) {
          setSettings(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch general settings", error);
      }
    };

    fetchSettings();
  }, []);

  // Fetch Permissions
  const [permissions, setPermissions] = React.useState<any>(null);

  React.useEffect(() => {
    // Admin role has full access, so we only fetch for other roles if needed
    // However, if we want strict control even for admins (usually not requested), we would fetch.
    // User requested "admin inside full access", so we skip fetching/filtering for admin.
    if (mounted && userRole && userRole !== "superadmin" && userRole !== "admin") {
      const fetchPermissions = async () => {
        try {
          const response = await ServerActions.ServerActionslib.getRolePermissionsMeAction();
          if (response?.success && response?.data) {
            const data = response.data.data || response.data;
            setPermissions(data.tabs || {});
          }
        } catch (error) {
          console.error("Failed to fetch permissions", error);
        }
      };
      fetchPermissions();
    }
  }, [mounted, userRole]);

  const checkPermission = React.useCallback((tabs: any, key: string) => {
    if (!tabs) return true;
    let perm = tabs[key];
    if (perm) return !!perm.read;

    const foundKey = Object.keys(tabs).find(k => {
      const parts = k.split('.');
      return parts[parts.length - 1] === key;
    });
    if (foundKey) return !!tabs[foundKey].read;

    return false;
  }, []);

  const logoSrc = React.useMemo(() => {
    const fallbackCollapsed = Constants.assetsIcon.assets.logo;
    const fallbackExpanded = Constants.assetsIcon.assets.fullLogo;

    if (!mounted) {
      return collapsed ? fallbackCollapsed : fallbackExpanded;
    }

    const isDark = resolvedTheme === "dark";
    const logos = settings?.logos;

    if (collapsed) {
      return isDark
        ? logos?.collapsDarkLogo?.url || fallbackCollapsed
        : logos?.collapsLightLogo?.url || fallbackCollapsed;
    }

    return isDark
      ? logos?.darkLogo?.url || fallbackExpanded
      : logos?.lightLogo?.url || fallbackExpanded;
  }, [collapsed, mounted, resolvedTheme, settings]);

  // Superadmin menu items
  const superadminItems: MenuItem[] = React.useMemo(
    () => [
      {
        label: "Dashboard",
        href: "/superadmin",
        icon: RxDashboard,
      },
      {
        label: "Business Owners",
        href: "/superadmin/business-owner",
        icon: FaRegUser,
      },
      {
        label: "Business Category",
        href: "/superadmin/business-category",
        icon: LuLayers3,
      },
      {
        label: "Subscriptions",
        href: "/superadmin/subscription",
        icon: FaTags,
      },
      {
        label: "Plans",
        href: "/superadmin/plans",
        icon: FaClipboardList,
      },
      {
        label: "Taxes",
        href: "/superadmin/tax",
        icon: FaChartBar,
      },
      {
        label: "Coupons",
        href: "/superadmin/coupon",
        icon: RiCoupon2Line,
      },
      {
        label: "Advertisement",
        href: "/superadmin/advertisement",
        icon: RiAdvertisementLine,
      },
      {
        label: "Notifications",
        href: "/superadmin/notifications",
        icon: TbNotification,
        hasDropdown: true,
        dropdownItems: [
          {
            label: "List",
            href: "/superadmin/notifications/list",
            icon: TbNotification,
          },
          {
            label: "Templates",
            href: "/superadmin/notifications/templates",
            icon: TbNotification,
          },
        ],
      },
      {
        label: "Reports",
        href: "/superadmin/reports",
        icon: TbReport,
        hasDropdown: true,
        dropdownItems: [
          {
            label: "Business Owner",
            href: "/superadmin/reports/business-owner",
            icon: TbReport,
          },
          {
            label: "Commission",
            href: "/superadmin/reports/commission",
            icon: TbReport,
          },
        ],
      },
      {
        label: "Landing Page Settings",
        href: "/superadmin/landingpage-setting",
        icon: TbLayoutSidebarRight,
      },
      {
        label: "AI Chatbot Settings",
        href: "/superadmin/ai-chatbot-settings",
        icon: FaHeadset,
      },
      {
        label: "Settings",
        href: "/superadmin/settings",
        icon: FaCog,
      },
    ],
    [],
  );

  // Admin menu items
  const adminItems: MenuItem[] = React.useMemo(
    () => [
      {
        label: "Dashboard",
        href: "/admin",
        icon: RxDashboard,
        permissionKey: "dashboard",
      },
      {
        label: "Store Management",
        href: "/admin/store-management",
        icon: FaStore,
        permissionKey: "store",
      },
      {
        label: "Inventory Management",
        href: "/admin/inventory",
        icon: FaBoxes,
        hasDropdown: true,
        dropdownItems: [
          {
            label: "Products",
            href: "/admin/inventory/products",
            icon: FaBoxes,
            permissionKey: "products",
          },
          {
            label: "Category",
            href: "/admin/inventory/category",
            icon: MdCategory,
            permissionKey: "category",
          },
          {
            label: "Subcategory",
            href: "/admin/inventory/subcategory",
            icon: MdSubdirectoryArrowRight,
            permissionKey: "subcategory",
          },
          {
            label: "Expired Stock",
            href: "/admin/inventory/expired-stock",
            icon: BsExclamationTriangle,
            permissionKey: "inventory.expiredstock",
          },
          {
            label: "Low Stock",
            href: "/admin/inventory/low-stock",
            icon: BsExclamationTriangle,
            permissionKey: "inventory.lowstock",
          },
          {
            label: "Variations",
            href: "/admin/inventory/variations",
            icon: BiPackage,
            permissionKey: "variations",
          },
          { label: "Units", href: "/admin/inventory/units", icon: FaWarehouse, permissionKey: "inventory.units" },
          {
            label: "Brands",
            href: "/admin/inventory/brands",
            icon: MdBrandingWatermark,
            permissionKey: "brands",
          },
          {
            label: "Warranty",
            href: "/admin/inventory/warranty",
            icon: MdSecurity,
            permissionKey: "warranty",
          },
          // { label: "Import Products", href: "/admin/inventory/import-products", icon: MdImportExport },
          // { label: "Import Opening Stock", href: "/admin/inventory/import-opening-stock", icon: MdImportExport },
          {
            label: "Print Labels",
            href: "/admin/inventory/barcode-generate",
            icon: FaBarcode,
            permissionKey: "inventory.printlabels",
          },
          // { label: "Print Labels", href: "/admin/inventory/print-labels", icon: FaPrint },
        ],
      },
      {
        label: "HRM",
        href: "/admin/hrm",
        icon: FaUserTie,
        hasDropdown: true,
        dropdownItems: [
          {
            label: "Staff Management",
            href: "/admin/hrm/staff-manager",
            icon: FaUserTie,
            permissionKey: "hrm.staff",
          },
          {
            label: "Shifts", href: "/admin/hrm/shifts", icon: FaUserClock, hasDropdown: true, dropdownItems: [
              { label: "Shift Creation", href: "/admin/hrm/shifts/management", icon: FaUserClock, permissionKey: "hrm.shifts" },
              { label: "Shift Calendar", href: "/admin/hrm/shifts/shift-calendar", icon: BsCalendar2Check, permissionKey: "hrm.shifts" },
            ]
          },
          {
            label: "Attendance",
            href: "/admin/hrm/attendance",
            icon: LuCalendarCheck,
            permissionKey: "hrm.attendance",
          },
          {
            label: "Leaves",
            href: "/admin/hrm/leaves",
            icon: LuCalendarPlus2,
            hasDropdown: true,
            dropdownItems: [
              {
                label: "Leave Types",
                href: "/admin/hrm/leaves/types",
                icon: LuCalendarPlus2,
                permissionKey: "hrm.leaves",
              },
              {
                label: "Leave Management",
                href: "/admin/hrm/leaves/management",
                icon: LuCalendarPlus2,
                permissionKey: "hrm.leaves",
              },
            ],
          },
          {
            label: "Holidays",
            href: "/admin/hrm/holidays",
            icon: LuCalendarMinus2,
            permissionKey: "hrm.holidays",
          },
          { label: "Payroll", href: "/admin/hrm/payroll", icon: LuDollarSign, permissionKey: "hrm.payroll" },
        ],
      },
      {
        label: "Stock",
        href: "/admin/stock",
        icon: BiTransfer,
        hasDropdown: true,
        dropdownItems: [
          {
            label: "Stock Transfers",
            href: "/admin/stock/transfers",
            icon: BiTransfer,
            permissionKey: "stock.transfers",
          },
          {
            label: "Stock Adjustments",
            href: "/admin/stock/adjustments",
            icon: BiAdjust,
            permissionKey: "stock.adjustments",
          },
        ],
      },
      {
        label: "Purchase",
        href: "/admin/purchase/purchase-overview",
        icon: HiOutlineShoppingBag,
        hasDropdown: true,
        dropdownItems: [
          {
            label: "Purchase Overview",
            href: "/admin/purchase/purchase-overview",
            icon: HiOutlineShoppingBag,
            permissionKey: "purchase.overview",
          },
          {
            label: "Purchase Order",
            href: "/admin/purchase/purchase-order",
            icon: FaFileInvoice,
            permissionKey: "purchase.order",
          },
          {
            label: "Purchase Return",
            href: "/admin/purchase/purchase-return",
            icon: FaUndo,
            permissionKey: "purchase.return",
          },

          {
            label: "Suppliers",
            href: "/admin/purchase/suppliers",
            icon: FaTruck,
            permissionKey: "suppliers",
          },
        ],
      },
      {
        label: "Sales",
        href: "/admin/sales",
        icon: FaShoppingCart,
        hasDropdown: true,
        dropdownItems: [
          { label: "Sales", href: "/admin/sales/sales", icon: FaShoppingCart, permissionKey: "sales.sales" },
          {
            label: "POS Theme",
            href: "/admin/sales/pos-theme",
            icon: FaReceipt,
            permissionKey: "sales.postheme",
          },
          {
            label: "Sales Return",
            href: "/admin/sales/sales-return",
            icon: FaUndo,
            permissionKey: "sales.salesreturn",
          },
        ],
      },
      {
        label: "Finance",
        href: "/admin/finance",
        icon: HiOutlineCurrencyDollar,
        hasDropdown: true,
        dropdownItems: [
          { label: "Expense", href: "/admin/finance/expense", icon: FaMinus, permissionKey: "finance.expense" },
          {
            label: "Expense Category",
            href: "/admin/finance/expense-category",
            icon: FaPlus,
            permissionKey: "finance.expensecategory",
          },
          {
            label: "Tax",
            href: "/admin/finance/tax",
            icon: HiOutlineCurrencyDollar,
            permissionKey: "finance.tax",
          },
        ],
      },
      {
        label: "Promo",
        href: "/admin/promo",
        icon: RiCoupon2Line,
        hasDropdown: true,
        dropdownItems: [
          {
            label: "Coupons",
            href: "/admin/promo/coupons",
            icon: RiCoupon2Line,
            permissionKey: "promo.coupons",
          },
          {
            label: "Loyalty Points Config",
            href: "/admin/promo/loyalty-points?type=Loyalty",
            icon: FaStar,
            permissionKey: "promo.loyalty",
          },
          {
            label: "Loyalty Points History",
            href: "/admin/promo/loyalty-points-history",
            icon: FaClock,
            permissionKey: "promo.loyaltyhistory",
          },
          { label: "Gift Card", href: "/admin/promo/gift-card", icon: FaGift, permissionKey: "promo.giftcards" },
          {
            label: "Gift Card History",
            href: "/admin/promo/gift-card-history",
            icon: FaClock,
            permissionKey: "promo.giftcardhistory",
          },
        ],
      },
      {
        label: "POS Screen",
        href: "/admin/pos-screen",
        icon: FaDesktop,
        hasDropdown: true,
        dropdownItems: [
          { label: "POS 1", href: "/admin/pos-screen/pos-1", icon: FaDesktop, permissionKey: "pos.pos1" },
          { label: "POS 2", href: "/admin/pos-screen/pos-2", icon: FaDesktop, permissionKey: "pos.pos2" },
          { label: "POS 3", href: "/admin/pos-screen/pos-3", icon: FaDesktop, permissionKey: "pos.pos3" },
          { label: "POS 4", href: "/admin/pos-screen/pos-4", icon: FaDesktop, permissionKey: "pos.pos4" },
          { label: "POS 5", href: "/admin/pos-screen/pos-5", icon: FaDesktop, permissionKey: "pos.pos5" },
        ],
      },
      {
        label: "People",
        href: "/admin/people",
        icon: FaUsers,
        hasDropdown: true,
        dropdownItems: [
          {
            label: "Customers",
            href: "/admin/people/customers",
            icon: FaUsers,
            permissionKey: "people.customers",
          },
        ],
      },
      {
        label: "Reports",
        href: "/admin/reports",
        icon: TbReport,
        hasDropdown: true,
        dropdownItems: [
          // 1. Sales & Revenue
          {
            label: "Sales Report",
            href: "/admin/reports/sales",
            icon: FaShoppingCart,
            permissionKey: "reports.sales",
          },
          {
            label: "Daily Cashier Report",
            href: "/admin/reports/daily-cashier",
            icon: FaReceipt,
            permissionKey: "reports.dailycashier",
          },
          {
            label: "Transaction Report",
            href: "/admin/reports/transactions",
            icon: FaExchangeAlt,
            permissionKey: "reports.transaction",
          },
          // 2. Purchase & Expenses
          {
            label: "Purchase Report",
            href: "/admin/reports/purchase",
            icon: HiOutlineShoppingBag,
            permissionKey: "reports.purchase",
          },
          {
            label: "Expenses Report",
            href: "/admin/reports/expenses",
            icon: FaMinus,
            permissionKey: "reports.expenses",
          },
          {
            label: "Stock History Report",
            href: "/admin/reports/stock-history",
            icon: FaBoxes,
            permissionKey: "reports.stockhistory",
          },
          // 3. Payroll
          {
            label: "Payroll Report",
            href: "/admin/reports/payroll",
            icon: FaDollarSign,
            permissionKey: "reports.payroll",
          },
          // 4. User Reports
          {
            label: "Customer Report",
            href: "/admin/reports/customer",
            icon: FaUsers,
            permissionKey: "reports.customer",
          },
          {
            label: "User Login Report",
            href: "/admin/reports/user-login",
            icon: FaUserClock,
            permissionKey: "reports.userlogin",
          },
          {
            label: "User Activity Report",
            href: "/admin/reports/user-activity",
            icon: FaUserClock,
            permissionKey: "reports.useractivity",
          },
          // 5. Financial Summary and Tax Report
          {
            label: "Financial & Tax Report",
            href: "/admin/reports/financial-summary-tax",
            icon: FaChartLine,
            hasDropdown: true,
            dropdownItems: [
              {
                label: "Profit & Loss Report",
                href: "/admin/reports/profit-loss",
                icon: FaChartLine,
                permissionKey: "profit_loss_report",
              },
              {
                label: "Annual Report",
                href: "/admin/reports/annual",
                icon: FaChartBar,
                permissionKey: "annual_report",
              },
              {
                label: "Tax Report",
                href: "/admin/reports/tax",
                icon: HiOutlineCurrencyDollar,
                permissionKey: "tax_report",
              },
            ],
          },
        ],
      },
      {
        label: "User Management",
        href: "/admin/user-management",
        icon: FaUserTie,
        hasDropdown: true,
        dropdownItems: [
          {
            label: "Roles and Permission",
            href: "/admin/user-management/roles-permission",
            icon: FaUserTie,
            permissionKey: "access.roles",
          },
        ],
      },
      {
        label: "Notifications",
        href: "/admin/notifications",
        icon: FaBell,
        hasDropdown: true,
        dropdownItems: [
          {
            label: "Email",
            href: "/admin/notifications/email",
            icon: FaEnvelope,
            permissionKey: "access.notifications",
          },
          { label: "SMS", href: "/admin/notifications/sms", icon: FaSms, permissionKey: "access.notifications" },
          {
            label: "Whatsapp",
            href: "/admin/notifications/whatsapp",
            icon: FaWhatsapp,
            permissionKey: "access.notifications",
          },
        ],
      },
      {
        label: "System Settings",
        href: "/admin/system-settings",
        icon: FaCog,
        hasDropdown: true,
        dropdownItems: [
          {
            label: "General Settings",
            href: "/admin/system-settings/general-setting",
            icon: FaCog,
            permissionKey: "settings.general",
          },
          {
            label: "Misc Settings",
            href: "/admin/system-settings/misc-setting",
            icon: FaFileAlt,
            permissionKey: "settings.misc",
          },
          {
            label: "Mail Settings",
            href: "/admin/system-settings/mail-setting",
            icon: FaEnvelope,
            permissionKey: "settings.mail",
          },
          {
            label: "Language Settings",
            href: "/admin/system-settings/language-setting",
            icon: FaLanguage,
            permissionKey: "settings.language",
          },
          {
            label: "Payment Methods",
            href: "/admin/system-settings/payment-method-setting",
            icon: FaCreditCard,
            permissionKey: "settings.paymentmethods",
          },
          {
            label: "Invoice Settings",
            href: "/admin/system-settings/invoice-setting",
            icon: FaFileInvoiceDollar,
            permissionKey: "settings.invoice",
          },
          {
            label: "Currency Settings",
            href: "/admin/system-settings/currency-setting",
            icon: FaCoins,
            permissionKey: "settings.currency",
          },
          {
            label: "Notification Settings",
            href: "/admin/system-settings/notification-setting",
            icon: FaBell,
            permissionKey: "settings.notification",
          },
          {
            label: "System Settings (SMS, Email, OTP)",
            href: "/admin/system-settings/template-setting",
            icon: FaFileAlt,
            permissionKey: "settings.system",
          },
        ],
      },
      {
        label: "Helpdesk & Support Desk",
        href: "/admin/helpdesk-support-desk",
        icon: FaHeadset,
      },
    ],
    [],
  );


  const transformMenuItems = React.useCallback((items: MenuItem[], fromPrefix: string, toPrefix: string): MenuItem[] => {
    return items.map(item => {
      const newItem: MenuItem = {
        ...item,
        href: item.href.replace(fromPrefix, toPrefix),
      };

      if (item.dropdownItems) {
        newItem.dropdownItems = item.dropdownItems.map(dropdownItem => ({
          ...dropdownItem,
          href: dropdownItem.href.replace(fromPrefix, toPrefix),
          dropdownItems: dropdownItem.dropdownItems?.map(nestedItem => ({
            ...nestedItem,
            href: nestedItem.href.replace(fromPrefix, toPrefix),
          })),
        }));
      }

      return newItem;
    });
  }, []);

  // Cashier menu items - dynamically generated from admin items with /cashier paths
  // Permission keys are kept the same as they match the API response structure
  const cashierItems: MenuItem[] = React.useMemo(() => {
    // Transform the /admin prefix to /cashier for all admin items
    return transformMenuItems(adminItems, "/admin", "/cashier");
  }, [adminItems, transformMenuItems]);

  // Manager menu items - dynamically generated from admin items with /manager paths
  const managerItems: MenuItem[] = React.useMemo(() => {
    // Transform the /admin prefix to /manager for all admin items
    return transformMenuItems(adminItems, "/admin", "/manager");
  }, [adminItems, transformMenuItems]);

  // Memoize menu items based on user role - only recalculate when userRole changes
  const menuItems: MenuItem[] = React.useMemo(() => {
    let items: MenuItem[] = [];

    if (userRole === "superadmin") {
      return superadminItems;
    } else if (userRole === "cashier") {
      // Cashier gets filtered cashier items
      items = cashierItems;
    } else if (userRole === "manager") {
      // Manager gets filtered manager items
      items = managerItems;
    } else {
      // Admin, etc. use admin items base
      items = adminItems;
    }

    const requiresFiltering = userRole !== "superadmin" && userRole !== "admin";

    // If filtering is required but permissions haven't loaded yet, return empty to prevent flash of unauthorized content
    if (requiresFiltering && !permissions) {
      return [];
    }

    if (permissions && requiresFiltering) {
      const filterItems = (list: MenuItem[]): MenuItem[] => {
        return list.reduce((acc: MenuItem[], item) => {
          let isVisible = true;

          // 1. Check direct permission key
          if (item.permissionKey) {
            isVisible = checkPermission(permissions, item.permissionKey);
          }

          // 2. Process children
          let visibleChildren: MenuItem[] = [];
          if (item.dropdownItems) {
            // Recursively filter children
            // We cast strictly for the recursive call as structure matches enough for our needs
            visibleChildren = filterItems(item.dropdownItems as unknown as MenuItem[]);
          }

          if (isVisible) {
            // Extra check: if item has dropdowns but all are hidden, and it doesn't have an explicit permission key, hide it.
            if (item.dropdownItems && visibleChildren.length === 0 && !item.permissionKey) {
              isVisible = false;
            }
          }

          if (isVisible) {
            const newItem = { ...item };
            if (item.dropdownItems) {
              // Cast back to original type
              newItem.dropdownItems = visibleChildren as any;
            }
            acc.push(newItem);
          }

          return acc;
        }, []);
      };

      items = filterItems(items);
    }

    return items;
  }, [userRole, superadminItems, adminItems, cashierItems, managerItems, permissions, checkPermission]);

  // Auto-open dropdowns when child items are active
  React.useEffect(() => {
    const newOpenDropdowns: Record<string, boolean> = {};

    menuItems.forEach((item) => {
      if (item.hasDropdown && item.dropdownItems) {
        // Check if any child item is active
        const hasActiveChild = item.dropdownItems.some((dropdownItem) => {
          if (dropdownItem.hasDropdown && dropdownItem.dropdownItems) {
            // Check nested dropdown items
            return dropdownItem.dropdownItems.some((nestedItem) =>
              isActive(nestedItem.href),
            );
          }
          return isActive(dropdownItem.href);
        });

        if (hasActiveChild) {
          newOpenDropdowns[item.label] = true;
        }
      }
    });

    // Preserve existing open dropdowns and merge with auto-opened ones
    setOpenDropdowns((prev) => ({ ...prev, ...newOpenDropdowns }));
  }, [pathname, menuItems, isActive]);

  // isActive moved up to be available for other effects

  // Memoize the toggle dropdown function
  const toggleDropdown = React.useCallback((label: string) => {
    setOpenDropdowns((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  }, []);

  // Memoize the render menu item function to prevent recreation
  const renderMenuItem = React.useCallback(
    (item: MenuItem, index: number) => {
      // Handle section headers (like HRM title)
      if (item.isSectionHeader) {
        return (
          <li key={`section-${item.label}-${index}`} className="mt-4 mb-3">
            {!collapsed && (
              <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {item.label}
              </h3>
            )}
          </li>
        );
      }

      const IconComponent = item.icon;
      const isActiveItem = isActive(item.href);
      const isDropdownOpen = openDropdowns[item.label];

      if (item.hasDropdown) {
        return (
          <li key={`dropdown-${item.label}-${index}`}>
            {!collapsed ? (
              // Expanded state dropdown
              <div>
                <button
                  onClick={() => toggleDropdown(item.label)}
                  className={`sidebar-menu-item group relative flex items-center justify-between w-full transition-all duration-200 rounded-lg py-3 px-2
                  ${isActiveItem
                      ? "bg-primary text-white shadow-md"
                      : "text-textSmall hover:text-primary hover:bg-indigo-100 dark:text-textSmall dark:hover:text-primary dark:hover:bg-[#243387]"
                    }
                `}
                >
                  {/* Vertical indicator line for dropdown buttons */}
                  <div
                    className={`absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-10 bg-primary transition-all duration-200 rounded-full ${isActiveItem
                      ? "opacity-100"
                      : "opacity-0 group-hover:opacity-50"
                      }`}
                    style={{ left: "-16px" }}
                  />
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {IconComponent && <IconComponent className="w-5 h-5" />}
                    <span className="font-poppins font-medium min-h-[1.25rem] block text-left leading-snug whitespace-normal break-words flex-1 min-w-0">
                      {item.label}
                    </span>
                  </div>
                  {isDropdownOpen ? (
                    <FaChevronDown className="w-4 h-4" />
                  ) : (
                    <FaChevronRight className="w-4 h-4" />
                  )}
                </button>

                {isDropdownOpen && item.dropdownItems && (
                  <ul className="ml-8 mt-2 space-y-1">
                    {item.dropdownItems.map((dropdownItem, dropdownIndex) => {
                      const isActiveDropdownItem = isActive(dropdownItem.href);
                      const DropdownIconComponent = dropdownItem.icon;
                      const isNestedDropdownOpen =
                        openDropdowns[`${item.label}-${dropdownItem.label}`];

                      if (
                        dropdownItem.hasDropdown &&
                        dropdownItem.dropdownItems
                      ) {
                        return (
                          <li
                            key={`nested-dropdown-${dropdownItem.href}-${index}-${dropdownIndex}`}
                          >
                            <button
                              onClick={() =>
                                toggleDropdown(
                                  `${item.label}-${dropdownItem.label}`,
                                )
                              }
                              className={`sidebar-menu-item group relative w-full flex items-center justify-between py-2 px-3 rounded-lg text-sm transition-all duration-200
                              ${isActiveDropdownItem
                                  ? "bg-primary text-white shadow-sm"
                                  : "text-textSmall hover:text-primary hover:bg-indigo-100 dark:text-textSmall dark:hover:text-primary dark:hover:bg-[#243387]"
                                }
                            `}
                            >
                              {/* Vertical indicator line for nested dropdown buttons */}
                              <div
                                className={`absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-primary transition-all duration-200 ${isActiveDropdownItem
                                  ? "opacity-100"
                                  : "opacity-0 group-hover:opacity-50"
                                  }`}
                                style={{ left: "-16px" }}
                              />
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                {DropdownIconComponent && (
                                  <DropdownIconComponent className="w-4 h-4" />
                                )}
                                <span className="font-poppins font-medium min-h-[1.25rem] block text-left leading-snug whitespace-normal break-words flex-1 min-w-0">
                                  {dropdownItem.label}
                                </span>
                              </div>
                              {isNestedDropdownOpen ? (
                                <FaChevronDown className="w-3 h-3" />
                              ) : (
                                <FaChevronRight className="w-3 h-3" />
                              )}
                            </button>

                            {isNestedDropdownOpen && (
                              <ul className="ml-4 mt-1 space-y-1">
                                {dropdownItem.dropdownItems.map(
                                  (nestedItem) => {
                                    const isActiveNestedItem = isActive(
                                      nestedItem.href,
                                    );
                                    const NestedIconComponent = nestedItem.icon;
                                    return (
                                      <li
                                        key={`nested-item-${nestedItem.href}-${index}-${dropdownIndex}`}
                                      >
                                        <Link
                                          href={nestedItem.href}
                                          className={`group relative flex items-center gap-3 py-2 px-3 rounded-lg text-sm transition-all duration-200
                                        ${isActiveNestedItem
                                              ? "bg-primary text-white shadow-sm"
                                              : "text-textSmall hover:text-primary hover:bg-indigo-100 dark:text-textSmall dark:hover:text-primary dark:hover:bg-[#243387]"
                                            }
                                      `}
                                        >
                                          {/* Vertical indicator line for nested dropdown items */}
                                          <div
                                            className={`absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-5 bg-primary transition-all duration-200 ${isActiveNestedItem
                                              ? "opacity-100"
                                              : "opacity-0 group-hover:opacity-50"
                                              }`}
                                            style={{ left: "-16px" }}
                                          />

                                          {NestedIconComponent && (
                                            <NestedIconComponent className="w-3 h-3" />
                                          )}
                                          <span className="font-poppins font-medium  min-h-[1.25rem] flex items-center">
                                            {nestedItem.label}
                                          </span>
                                        </Link>
                                      </li>
                                    );
                                  },
                                )}
                              </ul>
                            )}
                          </li>
                        );
                      }

                      return (
                        <li
                          key={`dropdown-item-${dropdownItem.href}-${index}-${dropdownIndex}`}
                        >
                          <Link
                            href={dropdownItem.href}
                            className={`group relative flex items-center gap-3 py-2 px-3 rounded-lg text-sm transition-all duration-200
                            ${isActiveDropdownItem
                                ? "bg-primary text-white shadow-sm"
                                : "text-textSmall hover:text-primary hover:bg-indigo-100 dark:text-textSmall dark:hover:text-primary dark:hover:bg-[#243387]"
                              }
                          `}
                          >
                            {/* Vertical indicator line for dropdown items */}
                            <div
                              className={`absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-primary transition-all duration-200 rounded-full ${isActiveDropdownItem
                                ? "opacity-100"
                                : "opacity-0 group-hover:opacity-50"
                                }`}
                              style={{ left: "-16px" }}
                            />

                            {DropdownIconComponent && (
                              <DropdownIconComponent className="w-4 h-4" />
                            )}
                            <span className="font-poppins font-medium min-h-[1.25rem] block text-left leading-snug whitespace-normal break-words flex-1 min-w-0">
                              {dropdownItem.label}
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            ) : (
              // Collapsed state dropdown - show inner page icons directly
              <div className="space-y-1">
                {/* Parent item */}
                <button
                  onClick={() => toggleDropdown(item.label)}
                  className={`sidebar-menu-item group relative w-full flex justify-center items-center py-3 px-2 rounded-lg transition-all duration-200
                  ${isActiveItem
                      ? "bg-primary text-white shadow-md"
                      : "text-textSmall hover:text-primary hover:bg-indigo-100 dark:text-textSmall dark:hover:text-primary dark:hover:bg-[#243387]"
                    }
                `}
                >
                  {/* Vertical indicator line for collapsed dropdown buttons */}
                  <div
                    className={`absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-10 bg-primary transition-all duration-200 rounded-full ${isActiveItem
                      ? "opacity-100"
                      : "opacity-0 group-hover:opacity-50"
                      }`}
                    style={{ left: "-16px" }}
                  />
                  {IconComponent && <IconComponent className="w-5 h-5" />}
                </button>

                {/* Dropdown items shown only when parent is clicked */}
                {isDropdownOpen && item.dropdownItems && (
                  <div className="space-y-1">
                    {item.dropdownItems.map((dropdownItem) => {
                      const isActiveDropdownItem = isActive(dropdownItem.href);
                      const DropdownIconComponent = dropdownItem.icon;
                      const isNestedDropdownOpen =
                        openDropdowns[`${item.label}-${dropdownItem.label}`];

                      // Handle nested dropdowns
                      if (
                        dropdownItem.hasDropdown &&
                        dropdownItem.dropdownItems
                      ) {
                        return (
                          <div
                            key={`collapsed-nested-dropdown-${dropdownItem.href}-${index}`}
                            className="space-y-1"
                          >
                            {/* Nested dropdown parent */}
                            <button
                              onClick={() =>
                                toggleDropdown(
                                  `${item.label}-${dropdownItem.label}`,
                                )
                              }
                              className={`sidebar-menu-item group relative w-full flex justify-center items-center py-2 px-3 rounded-lg transition-all duration-200
                              ${isActiveDropdownItem
                                  ? "bg-primary text-white shadow-md"
                                  : "text-textSmall hover:text-primary hover:bg-indigo-100 dark:text-textSmall dark:hover:text-primary dark:hover:bg-[#243387]"
                                }
                            `}
                            >
                              {/* Vertical indicator line for nested dropdown items */}
                              <div
                                className={`absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-primary transition-all duration-200 rounded-full ${isActiveDropdownItem
                                  ? "opacity-100"
                                  : "opacity-0 group-hover:opacity-50"
                                  }`}
                                style={{ left: "-16px" }}
                              />
                              {DropdownIconComponent && (
                                <DropdownIconComponent className="w-3 h-3" />
                              )}
                            </button>

                            {/* Nested dropdown items */}
                            {isNestedDropdownOpen && (
                              <div className="space-y-1">
                                {dropdownItem.dropdownItems.map(
                                  (nestedItem) => {
                                    const isActiveNestedItem = isActive(
                                      nestedItem.href,
                                    );
                                    const NestedIconComponent = nestedItem.icon;
                                    return (
                                      <Link
                                        key={`collapsed-nested-item-${nestedItem.href}-${index}`}
                                        href={nestedItem.href}
                                        className={`sidebar-menu-item group relative w-full flex justify-center items-center py-1 px-3 rounded-lg transition-all duration-200
                                      ${isActiveNestedItem
                                            ? "bg-primary text-white shadow-md"
                                            : "text-textSmall hover:text-primary hover:bg-indigo-100 dark:text-textSmall dark:hover:text-primary dark:hover:bg-[#243387]"
                                          }
                                    `}
                                      >
                                        {/* Vertical indicator line for nested items */}
                                        <div
                                          className={`absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-5 bg-primary transition-all duration-200 rounded-full ${isActiveNestedItem
                                            ? "opacity-100"
                                            : "opacity-0 group-hover:opacity-50"
                                            }`}
                                          style={{ left: "-16px" }}
                                        />
                                        {NestedIconComponent && (
                                          <NestedIconComponent className="w-2.5 h-2.5" />
                                        )}
                                      </Link>
                                    );
                                  },
                                )}
                              </div>
                            )}
                          </div>
                        );
                      }

                      // Regular dropdown item
                      return (
                        <Link
                          key={`collapsed-dropdown-item-${dropdownItem.href}-${index}`}
                          href={dropdownItem.href}
                          className={`sidebar-menu-item group relative w-full flex justify-center items-center py-2 px-3 rounded-lg transition-all duration-200
                          ${isActiveDropdownItem
                              ? "bg-primary text-white shadow-md"
                              : "text-textSmall hover:text-primary hover:bg-indigo-100 dark:text-textSmall dark:hover:text-primary dark:hover:bg-[#243387]"
                            }
                        `}
                        >
                          {/* Vertical indicator line for dropdown items */}
                          <div
                            className={`absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-primary transition-all duration-200 rounded-full ${isActiveDropdownItem
                              ? "opacity-100"
                              : "opacity-0 group-hover:opacity-50"
                              }`}
                            style={{ left: "-16px" }}
                          />
                          {DropdownIconComponent && (
                            <DropdownIconComponent className="w-3 h-3" />
                          )}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </li>
        );
      }

      // Regular menu item
      return (
        <li key={`regular-item-${item.label}-${index}`}>
          <Link
            href={item.href}
            className={`sidebar-menu-item group relative flex items-center transition-all duration-200 rounded-lg py-3 px-2
            ${collapsed ? "justify-center" : "gap-3"}
            ${isActiveItem
                ? "bg-primary text-white shadow-md"
                : "text-textSmall hover:text-primary hover:bg-indigo-100 dark:text-textSmall dark:hover:text-primary dark:hover:bg-[#243387]"
              }
          `}
          >
            {/* Vertical indicator line - positioned outside the tab box */}
            <div
              className={`absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-10 bg-primary transition-all duration-200 rounded-full ${isActiveItem
                ? "opacity-100"
                : "opacity-0 group-hover:opacity-50"
                }`}
              style={{ left: "-16px" }}
            />

            <div className="relative flex flex-col items-center">
              {IconComponent && <IconComponent className="w-5 h-5" />}
            </div>
            {!collapsed && (
              <span className="font-poppins font-medium min-h-[1.25rem] block text-left leading-snug whitespace-normal break-words">
                {item.label}
              </span>
            )}
          </Link>
        </li>
      );
    },
    [collapsed, isActive, openDropdowns, pathname, toggleDropdown],
  );

  return (
    <aside
      className={`fixed top-0 left-0 h-screen bg-white dark:bg-darkFilterbar text-gray-900 dark:text-white z-40 transition-all duration-300 flex flex-col ${collapsed ? "w-20" : "w-64"
        }`}
    >
      {/* Toggle Collapse Button */}
      <button
        onClick={toggleCollapse}
        className="absolute -right-3 top-5 bg-primary text-white p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900 focus:ring-blue-500 z-50"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? (
          <FaArrowRight className="w-4 h-4" />
        ) : (
          <FaArrowLeft className="w-4 h-4" />
        )}
      </button>

      {/* Logo */}
      <div className="p-4 flex-shrink-0 border-b-[0.4px] border-[#CCCDCD]">
        <Link href="/" title="Back to Home">
          <Image
            src={logoSrc}
            alt={settings?.appName || "Logo"}
            width={collapsed ? 40 : 120}
            height={collapsed ? 40 : 30}
            className="object-contain"
            unoptimized={typeof logoSrc === "string" ? logoSrc.startsWith("http") : false}
            priority
          />
        </Link>
      </div>

      {/* Navigation Items with Perfect Scrollbar */}
      <div className="flex-1 overflow-hidden min-h-0">
        <PerfectScrollbar
          options={{
            suppressScrollX: true,
            wheelPropagation: false,
            minScrollbarLength: 20,
          }}
          className="h-full px-4 pt-6 sidebar-scrollbar"
          style={{ overflow: "hidden" }}
        >
          <nav className="flex flex-col gap-2 text-sm pb-6">
            <ul className="flex flex-col gap-2">
              {!mounted || status === "loading"
                ? // Shimmer placeholders for menu items - matching the actual design height
                Array.from({ length: 16 }).map((_, i) => (
                  <li key={`skeleton-${i}`} className="px-3">
                    <Skeleton
                      className={`w-full ${collapsed ? "h-11" : "h-12"} rounded-lg mt-4`}
                    />
                  </li>
                ))
                : menuItems.map((item, index) => renderMenuItem(item, index))}
            </ul>
          </nav>
        </PerfectScrollbar>
      </div>
    </aside>
  );
}
