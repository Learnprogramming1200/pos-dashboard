"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { User as UserIcon, LogOut, Menu, X, ArrowRight } from "lucide-react";
import { Constants } from "@/constant";
import { DarkModeToggle } from "@/components/ui/DarkModeToggle";
import {

  FaCog,
  FaChevronDown as FaChevronDownIcon,
  FaChevronRight as FaChevronRightIcon,
  FaStore,
  FaUserFriends,
  FaCreditCard,
  FaFileInvoice,
  FaChartPie,
  FaBell,
  FaGlobe,
  FaBoxes,
  FaShoppingCart,
  FaUsers,
  FaUserTie,
  FaHeadset,
  FaWarehouse,
} from "react-icons/fa";
import { RxDashboard } from "react-icons/rx";
import {
  LuLayers3,
  LuCalendarCheck,
  LuCalendarPlus2,
  LuCalendarMinus2,
  LuDollarSign,
} from "react-icons/lu";
import { RiCoupon2Line, RiAdvertisementLine } from "react-icons/ri";
import { TbReport, TbLayoutSidebarRight, TbNotification } from "react-icons/tb";
import {
  MdOutlineRequestPage,
  MdCategory,
  MdSubdirectoryArrowRight,
  MdBrandingWatermark,
  MdSecurity,
  MdImportExport,
} from "react-icons/md";
import { BsExclamationTriangle, BsCalendar2Check } from "react-icons/bs";
import { BiPackage, BiTransfer, BiAdjust } from "react-icons/bi";
import {
  FaBarcode,
  FaPrint,
  FaUserClock,
  FaUndo,
  FaReceipt,
  FaMinus,
  FaPlus,
  FaStar,
  FaGift,
  FaTruck,
  FaEnvelope,
  FaSms,
  FaWhatsapp,
  FaLanguage,
  FaFileInvoiceDollar,
  FaCoins,
  FaFileAlt,
} from "react-icons/fa";
import { HiOutlineShoppingBag, HiOutlineCurrencyDollar } from "react-icons/hi";
import { tokenUtils, getUserRole } from "@/lib/utils";
import { useSession, signOut } from "next-auth/react";

interface MobileNavbarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function MobileNavbar({ isOpen, onToggle }: MobileNavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user;
  const [reportsOpen, setReportsOpen] = React.useState(false);
  const [notificationsOpen, setNotificationsOpen] = React.useState(false);
  const [inventoryOpen, setInventoryOpen] = React.useState(false);
  const [hrmOpen, setHrmOpen] = React.useState(false);
  const [stockOpen, setStockOpen] = React.useState(false);
  const [purchaseOpen, setPurchaseOpen] = React.useState(false);
  const [salesOpen, setSalesOpen] = React.useState(false);
  const [financeOpen, setFinanceOpen] = React.useState(false);
  const [promoOpen, setPromoOpen] = React.useState(false);
  const [peopleOpen, setPeopleOpen] = React.useState(false);
  const [userMgmtOpen, setUserMgmtOpen] = React.useState(false);
  const [notificationsOpenAdmin, setNotificationsOpenAdmin] = React.useState(false);
  const [systemSettingsOpen, setSystemSettingsOpen] = React.useState(false);
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Helper function to check if a link is active
  const isActive = (href: string) => {
    const userRole = getUserRole(user);

    if (userRole === "superadmin") {
      if (href === "/superadmin") {
        return pathname === "/superadmin" || pathname === "/superadmin/";
      }
    } else if (userRole === "admin") {
      if (href === "/admin") {
        return pathname === "/admin" || pathname === "/admin/";
      }
    }

    return pathname === href || pathname.startsWith(href + "/");
  };

  // Superadmin navigation items
  const superadminNavItems = [
    {
      label: "Dashboard",
      href: "/superadmin",
      icon: <RxDashboard className="w-5 h-5" />,
    },
    {
      label: "Business Owners",
      href: "/superadmin/business-owner",
      icon: <FaUserFriends className="w-5 h-5" />,
    },
    {
      label: "Business Category",
      href: "/superadmin/business-category",
      icon: <MdCategory className="w-5 h-5" />,
    },
    {
      label: "Subscriptions",
      href: "/superadmin/subscription",
      icon: <FaCreditCard className="w-5 h-5" />,
    },
    {
      label: "Plans",
      href: "/superadmin/plans",
      icon: <FaFileInvoice className="w-5 h-5" />,
    },
    {
      label: "Taxes",
      href: "/superadmin/tax",
      icon: <FaChartPie className="w-5 h-5" />,
    },
    {
      label: "Coupons",
      href: "/superadmin/coupon",
      icon: <RiCoupon2Line className="w-5 h-5" />,
    },
    {
      label: "Settings",
      href: "/superadmin/settings",
      icon: <FaCog className="w-5 h-5" />,
    },
    {
      label: "Landing Page",
      href: "/superadmin/landingpage-setting",
      icon: <FaGlobe className="w-5 h-5" />,
    },
    {
      label: "Advertisement",
      href: "/superadmin/advertisement",
      icon: <RiAdvertisementLine className="w-5 h-5" />,
    },
    {
      label: "AI Chatbot Settings",
      href: "/superadmin/ai-chatbot-settings",
      icon: <FaHeadset className="w-5 h-5" />,
    },
  ];

  // Admin navigation items
  const adminNavItems = [
    {
      label: "Dashboard",
      href: "/admin",
      icon: <RxDashboard className="w-5 h-5" />,
    },
    {
      label: "Store Management",
      href: "/admin/store-management",
      icon: <FaStore className="w-5 h-5" />,
    },
    {
      label: "Orders",
      href: "/admin/orders",
      icon: <FaShoppingCart className="w-5 h-5" />,
    },
    {
      label: "Customers",
      href: "/admin/customers",
      icon: <FaUsers className="w-5 h-5" />,
    },
    {
      label: "Settings",
      href: "/admin/settings",
      icon: <FaCog className="w-5 h-5" />,
    },
  ];

  // Determine which navigation items to show based on user role
  const navItems =
    getUserRole(user) === "superadmin" ? superadminNavItems : adminNavItems;

  // Superadmin reports items
  const superadminReportsItems = [
    { label: "Business Owner", href: "/superadmin/reports/business-owner" },
    { label: "Commission", href: "/superadmin/reports/commission" },
  ];

  // Admin reports items
  const adminReportsItems = [
    { label: "Sales Report", href: "/admin/reports/sales" },
    { label: "Purchase Report", href: "/admin/reports/purchase" },
    { label: "Inventory Report", href: "/admin/reports/inventory" },
    { label: "Customer Report", href: "/admin/reports/customer" },
  ];

  // Determine which reports items to show
  const reportsItems =
    getUserRole(user) === "superadmin"
      ? superadminReportsItems
      : adminReportsItems;

  const notificationsItems = [
    { label: "List", href: "/superadmin/notifications/list" },
    { label: "Templates", href: "/superadmin/notifications/templates" },
  ];

  const inventoryItems = [
    {
      label: "Products",
      href: "/admin/inventory/products",
      icon: <FaBoxes className="w-4 h-4" />,
    },
    {
      label: "Category",
      href: "/admin/inventory/category",
      icon: <MdCategory className="w-4 h-4" />,
    },
    {
      label: "Subcategory",
      href: "/admin/inventory/subcategory",
      icon: <MdSubdirectoryArrowRight className="w-4 h-4" />,
    },
    {
      label: "Expired Stock",
      href: "/admin/inventory/expired-stock",
      icon: <BsExclamationTriangle className="w-4 h-4" />,
    },
    {
      label: "Low Stock",
      href: "/admin/inventory/low-stock",
      icon: <BsExclamationTriangle className="w-4 h-4" />,
    },
    {
      label: "Variations",
      href: "/admin/inventory/variations",
      icon: <BiPackage className="w-4 h-4" />,
    },
    {
      label: "Units",
      href: "/admin/inventory/units",
      icon: <FaWarehouse className="w-4 h-4" />,
    },
    {
      label: "Brands",
      href: "/admin/inventory/brands",
      icon: <MdBrandingWatermark className="w-4 h-4" />,
    },
    {
      label: "Warranty",
      href: "/admin/inventory/warranty",
      icon: <MdSecurity className="w-4 h-4" />,
    },
    {
      label: "Import Products",
      href: "/admin/inventory/import-products",
      icon: <MdImportExport className="w-4 h-4" />,
    },
    {
      label: "Import Opening Stock",
      href: "/admin/inventory/import-opening-stock",
      icon: <MdImportExport className="w-4 h-4" />,
    },
    {
      label: "Barcode Generate",
      href: "/admin/inventory/barcode-generate",
      icon: <FaBarcode className="w-4 h-4" />,
    },
    {
      label: "Print Labels",
      href: "/admin/inventory/print-labels",
      icon: <FaPrint className="w-4 h-4" />,
    },
  ];

  const hrmItems = [
    {
      label: "Staff & Manager",
      href: "/admin/hrm/staff-manager",
      icon: <FaUserTie className="w-4 h-4" />,
    },
    {
      label: "Shifts",
      href: "/admin/hrm/shifts",
      icon: <FaUserClock className="w-4 h-4" />,
    },
    {
      label: "Shift Calendar",
      href: "/admin/shift-calendar",
      icon: <BsCalendar2Check className="w-4 h-4" />,
    },
    {
      label: "Attendance",
      href: "/admin/hrm/attendance",
      icon: <LuCalendarCheck className="w-4 h-4" />,
    },
    {
      label: "Leaves",
      href: "/admin/hrm/leaves",
      icon: <LuCalendarPlus2 className="w-4 h-4" />,
    },
    {
      label: "Holidays",
      href: "/admin/hrm/holidays",
      icon: <LuCalendarMinus2 className="w-4 h-4" />,
    },
    {
      label: "Payroll",
      href: "/admin/hrm/payroll",
      icon: <LuDollarSign className="w-4 h-4" />,
    },
  ];

  const stockItems = [
    {
      label: "Stock Transfers",
      href: "/admin/stock/transfers",
      icon: <BiTransfer className="w-4 h-4" />,
    },
    {
      label: "Stock Adjustments",
      href: "/admin/stock/adjustments",
      icon: <BiAdjust className="w-4 h-4" />,
    },
  ];

  const purchaseItems = [
    {
      label: "Purchases",
      href: "/admin/purchase",
      icon: <HiOutlineShoppingBag className="w-4 h-4" />,
    },
    {
      label: "Purchase Order",
      href: "/admin/purchase/purchase-order",
      icon: <FaFileInvoice className="w-4 h-4" />,
    },
    {
      label: "Purchase Return",
      href: "/admin/purchase/purchase-return",
      icon: <FaUndo className="w-4 h-4" />,
    },
  ];

  const salesItems = [
    {
      label: "Sales",
      href: "/admin/sales/sales",
      icon: <FaShoppingCart className="w-4 h-4" />,
    },
    {
      label: "POS Theme",
      href: "/admin/sales/pos-theme",
      icon: <FaReceipt className="w-4 h-4" />,
    },
    {
      label: "Sales Return",
      href: "/admin/sales/sales-return",
      icon: <FaUndo className="w-4 h-4" />,
    },
  ];

  const financeItems = [
    {
      label: "Expense",
      href: "/admin/finance/expense",
      icon: <FaMinus className="w-4 h-4" />,
    },
    {
      label: "Expense Category",
      href: "/admin/finance/expense-category",
      icon: <FaPlus className="w-4 h-4" />,
    },
    {
      label: "Tax",
      href: "/admin/tax",
      icon: <HiOutlineCurrencyDollar className="w-4 h-4" />,
    },
  ];

  const promoItems = [
    {
      label: "Coupons",
      href: "/admin/promo/coupons",
      icon: <RiCoupon2Line className="w-4 h-4" />,
    },
    {
      label: "Loyalty Points Config",
      href: "/admin/promo/loyalty-points",
      icon: <FaStar className="w-4 h-4" />,
    },
    {
      label: "Gift Card",
      href: "/admin/promo/gift-card",
      icon: <FaGift className="w-4 h-4" />,
    },
  ];

  const peopleItems = [
    {
      label: "Customers",
      href: "/admin/people/customers",
      icon: <FaUsers className="w-4 h-4" />,
    },
    {
      label: "Suppliers",
      href: "/admin/people/suppliers",
      icon: <FaTruck className="w-4 h-4" />,
    },
  ];

  const userMgmtItems = [
    {
      label: "Roles and Permission",
      href: "/admin/user-management/roles-permission",
      icon: <FaUserTie className="w-4 h-4" />,
    },
  ];

  const notificationsItemsAdmin = [
    {
      label: "Email",
      href: "/admin/notifications/email",
      icon: <FaEnvelope className="w-4 h-4" />,
    },
    {
      label: "SMS",
      href: "/admin/notifications/sms",
      icon: <FaSms className="w-4 h-4" />,
    },
    {
      label: "Whatsapp",
      href: "/admin/notifications/whatsapp",
      icon: <FaWhatsapp className="w-4 h-4" />,
    },
  ];

  const systemSettingsItems = [
    {
      label: "General Settings",
      href: "/admin/system-settings/general",
      icon: <FaCog className="w-4 h-4" />,
    },
    {
      label: "Misc Settings",
      href: "/admin/system-settings/misc",
      icon: <FaFileAlt className="w-4 h-4" />,
    },
    {
      label: "Mail Settings",
      href: "/admin/system-settings/mail",
      icon: <FaEnvelope className="w-4 h-4" />,
    },
    {
      label: "Language Settings",
      href: "/admin/system-settings/language",
      icon: <FaLanguage className="w-4 h-4" />,
    },
    {
      label: "Payment Methods",
      href: "/admin/system-settings/payment-methods",
      icon: <FaCreditCard className="w-4 h-4" />,
    },
    {
      label: "Invoice Settings",
      href: "/admin/system-settings/invoice",
      icon: <FaFileInvoiceDollar className="w-4 h-4" />,
    },
    {
      label: "Currency Settings",
      href: "/admin/system-settings/currency",
      icon: <FaCoins className="w-4 h-4" />,
    },
    {
      label: "Notification Settings",
      href: "/admin/system-settings/notification",
      icon: <FaBell className="w-4 h-4" />,
    },
    {
      label: "System Settings (SMS, Email, OTP)",
      href: "/admin/system-settings/templates",
      icon: <FaFileAlt className="w-4 h-4" />,
    },
  ];

  const handleNavClick = () => {
    onToggle(); // Close navbar when navigation item is clicked
  };

  const handleLogout = async () => {
    try {
      await signOut({ redirect: false });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      tokenUtils.clearAuth();
      router.push("/login");
    }
  };

  return (
    <>
      {/* Mobile Navbar - Scrolls with page content */}
      <div className="lg:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Left: Blue circular button with right arrow */}
          <button
            onClick={onToggle}
            className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors"
          >
            <ArrowRight className="w-5 h-5 text-white" />
          </button>

          {/* Center: Logo */}
          <div className="flex-1 flex justify-center">
            <Link href="/">
              <Image
                src={Constants.assetsIcon.assets.fullLogo}
                alt="Logo"
                width={120}
                height={30}
                className="cursor-pointer"
              />
            </Link>
          </div>

          {/* Right: Hamburger menu button */}
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="w-10 h-10 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
      </div>

      {/* Mobile Navigation Sidebar */}
      <div
        className={`lg:hidden fixed inset-0 z-50 transition-opacity duration-300 ${isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
          }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black bg-opacity-50"
          onClick={onToggle}
        />

        {/* Sidebar */}
        <div
          className={`absolute top-0 left-0 h-full w-80 bg-white dark:bg-gray-900 shadow-lg transform transition-transform duration-300 ${isOpen ? "translate-x-0" : "-translate-x-full"
            }`}
        >
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              {mounted && (
                <>
                  <Image
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                    alt="Profile"
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {user?.name ||
                        (getUserRole(user) === "superadmin"
                          ? "Super Admin"
                          : "Admin")}
                    </p>
                    {user?.email && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {user.email}
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
            <button
              onClick={onToggle}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
          </div>

          {/* Theme Toggle */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Theme
            </span>
            <DarkModeToggle />
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto py-4">
            <nav className="space-y-1 px-4">
              {mounted &&
                navItems.map((item) => {
                  const isActiveItem = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={handleNavClick}
                      className={`flex items-center space-x-3 px-3 py-3 rounded-lg transition-colors ${isActiveItem
                          ? "bg-primary text-white shadow-md"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                        }`}
                    >
                      {item.icon}
                      <span className="text-sm font-medium">{item.label}</span>
                    </Link>
                  );
                })}

              {/* Reports Dropdown */}
              <div>
                <button
                  onClick={() => setReportsOpen(!reportsOpen)}
                  className={`flex items-center justify-between w-full px-3 py-3 rounded-lg transition-colors ${pathname.includes("/reports")
                      ? "bg-primary text-white"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                >
                  <div className="flex items-center space-x-3">
                    <TbReport className="w-5 h-5" />
                    <span className="text-sm font-medium">Reports</span>
                  </div>
                  {reportsOpen ? (
                    <FaChevronDownIcon className="w-4 h-4" />
                  ) : (
                    <FaChevronRightIcon className="w-4 h-4" />
                  )}
                </button>

                {mounted && reportsOpen && (
                  <div className="ml-8 mt-2 space-y-1">
                    {reportsItems.map(({ label, href }) => {
                      const isActiveItem = pathname === href;
                      return (
                        <Link
                          key={href}
                          href={href}
                          onClick={handleNavClick}
                          className={`block px-3 py-2 rounded-lg text-sm transition-colors ${isActiveItem
                              ? "bg-primary text-white shadow-sm"
                              : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                            }`}
                        >
                          {label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Inventory Management Dropdown - Only for admin */}
              {mounted && getUserRole(user) === "admin" && (
                <div>
                  <button
                    onClick={() => setInventoryOpen(!inventoryOpen)}
                    className={`flex items-center justify-between w-full px-3 py-3 rounded-lg transition-colors ${pathname.includes("/admin/inventory")
                        ? "bg-primary text-white"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                  >
                    <div className="flex items-center space-x-3">
                      <FaBoxes className="w-5 h-5" />
                      <span className="text-sm font-medium">
                        Inventory Management
                      </span>
                    </div>
                    {inventoryOpen ? (
                      <FaChevronDownIcon className="w-4 h-4" />
                    ) : (
                      <FaChevronRightIcon className="w-4 h-4" />
                    )}
                  </button>

                  {inventoryOpen && (
                    <div className="ml-8 mt-2 space-y-1">
                      {inventoryItems.map(({ label, href, icon }) => {
                        const isActiveItem = pathname === href;
                        return (
                          <Link
                            key={href}
                            href={href}
                            onClick={handleNavClick}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${isActiveItem
                                ? "bg-primary text-white shadow-sm"
                                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                              }`}
                          >
                            {icon}
                            <span>{label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* HRM Dropdown - Only for admin */}
              {mounted && getUserRole(user) === "admin" && (
                <div>
                  <button
                    onClick={() => setHrmOpen(!hrmOpen)}
                    className={`flex items-center justify-between w-full px-3 py-3 rounded-lg transition-colors ${pathname.includes("/admin/hrm")
                        ? "bg-primary text-white"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                  >
                    <div className="flex items-center space-x-3">
                      <FaUserTie className="w-5 h-5" />
                      <span className="text-sm font-medium">HRM</span>
                    </div>
                    {hrmOpen ? (
                      <FaChevronDownIcon className="w-4 h-4" />
                    ) : (
                      <FaChevronRightIcon className="w-4 h-4" />
                    )}
                  </button>

                  {hrmOpen && (
                    <div className="ml-8 mt-2 space-y-1">
                      {hrmItems.map(({ label, href, icon }) => {
                        const isActiveItem = pathname === href;
                        return (
                          <Link
                            key={href}
                            href={href}
                            onClick={handleNavClick}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${isActiveItem
                                ? "bg-primary text-white shadow-sm"
                                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                              }`}
                          >
                            {icon}
                            <span>{label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Stock Dropdown - Only for admin */}
              {mounted && getUserRole(user) === "admin" && (
                <div>
                  <button
                    onClick={() => setStockOpen(!stockOpen)}
                    className={`flex items-center justify-between w-full px-3 py-3 rounded-lg transition-colors ${pathname.includes("/admin/stock")
                        ? "bg-primary text-white"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                  >
                    <div className="flex items-center space-x-3">
                      <BiTransfer className="w-5 h-5" />
                      <span className="text-sm font-medium">Stock</span>
                    </div>
                    {stockOpen ? (
                      <FaChevronDownIcon className="w-4 h-4" />
                    ) : (
                      <FaChevronRightIcon className="w-4 h-4" />
                    )}
                  </button>

                  {stockOpen && (
                    <div className="ml-8 mt-2 space-y-1">
                      {stockItems.map(({ label, href, icon }) => {
                        const isActiveItem = pathname === href;
                        return (
                          <Link
                            key={href}
                            href={href}
                            onClick={handleNavClick}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${isActiveItem
                                ? "bg-primary text-white shadow-sm"
                                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                              }`}
                          >
                            {icon}
                            <span>{label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Purchase Dropdown - Only for admin */}
              {mounted && getUserRole(user) === "admin" && (
                <div>
                  <button
                    onClick={() => setPurchaseOpen(!purchaseOpen)}
                    className={`flex items-center justify-between w-full px-3 py-3 rounded-lg transition-colors ${pathname.includes("/admin/purchase")
                        ? "bg-primary text-white"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                  >
                    <div className="flex items-center space-x-3">
                      <HiOutlineShoppingBag className="w-5 h-5" />
                      <span className="text-sm font-medium">Purchase</span>
                    </div>
                    {purchaseOpen ? (
                      <FaChevronDownIcon className="w-4 h-4" />
                    ) : (
                      <FaChevronRightIcon className="w-4 h-4" />
                    )}
                  </button>

                  {purchaseOpen && (
                    <div className="ml-8 mt-2 space-y-1">
                      {purchaseItems.map(({ label, href, icon }) => {
                        const isActiveItem = pathname === href;
                        return (
                          <Link
                            key={href}
                            href={href}
                            onClick={handleNavClick}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${isActiveItem
                                ? "bg-primary text-white shadow-sm"
                                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                              }`}
                          >
                            {icon}
                            <span>{label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Sales Dropdown - Only for admin */}
              {mounted && getUserRole(user) === "admin" && (
                <div>
                  <button
                    onClick={() => setSalesOpen(!salesOpen)}
                    className={`flex items-center justify-between w-full px-3 py-3 rounded-lg transition-colors ${pathname.includes("/admin/sales")
                        ? "bg-primary text-white"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                  >
                    <div className="flex items-center space-x-3">
                      <FaShoppingCart className="w-5 h-5" />
                      <span className="text-sm font-medium">Sales</span>
                    </div>
                    {salesOpen ? (
                      <FaChevronDownIcon className="w-4 h-4" />
                    ) : (
                      <FaChevronRightIcon className="w-4 h-4" />
                    )}
                  </button>

                  {salesOpen && (
                    <div className="ml-8 mt-2 space-y-1">
                      {salesItems.map(({ label, href, icon }) => {
                        const isActiveItem = pathname === href;
                        return (
                          <Link
                            key={href}
                            href={href}
                            onClick={handleNavClick}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${isActiveItem
                                ? "bg-primary text-white shadow-sm"
                                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                              }`}
                          >
                            {icon}
                            <span>{label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Finance & Accounts Dropdown - Only for admin */}
              {mounted && getUserRole(user) === "admin" && (
                <div>
                  <button
                    onClick={() => setFinanceOpen(!financeOpen)}
                    className={`flex items-center justify-between w-full px-3 py-3 rounded-lg transition-colors ${pathname.includes("/admin/finance") ||
                        pathname.includes("/admin/tax")
                        ? "bg-primary text-white"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                  >
                    <div className="flex items-center space-x-3">
                      <HiOutlineCurrencyDollar className="w-5 h-5" />
                      <span className="text-sm font-medium">
                        Finance & Accounts
                      </span>
                    </div>
                    {financeOpen ? (
                      <FaChevronDownIcon className="w-4 h-4" />
                    ) : (
                      <FaChevronRightIcon className="w-4 h-4" />
                    )}
                  </button>

                  {financeOpen && (
                    <div className="ml-8 mt-2 space-y-1">
                      {financeItems.map(({ label, href, icon }) => {
                        const isActiveItem = pathname === href;
                        return (
                          <Link
                            key={href}
                            href={href}
                            onClick={handleNavClick}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${isActiveItem
                                ? "bg-primary text-white shadow-sm"
                                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                              }`}
                          >
                            {icon}
                            <span>{label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Promo Dropdown - Only for admin */}
              {mounted && getUserRole(user) === "admin" && (
                <div>
                  <button
                    onClick={() => setPromoOpen(!promoOpen)}
                    className={`flex items-center justify-between w-full px-3 py-3 rounded-lg transition-colors ${pathname.includes("/admin/promo")
                        ? "bg-primary text-white"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                  >
                    <div className="flex items-center space-x-3">
                      <RiCoupon2Line className="w-5 h-5" />
                      <span className="text-sm font-medium">Promo</span>
                    </div>
                    {promoOpen ? (
                      <FaChevronDownIcon className="w-4 h-4" />
                    ) : (
                      <FaChevronRightIcon className="w-4 h-4" />
                    )}
                  </button>

                  {promoOpen && (
                    <div className="ml-8 mt-2 space-y-1">
                      {promoItems.map(({ label, href, icon }) => {
                        const isActiveItem = pathname === href;
                        return (
                          <Link
                            key={href}
                            href={href}
                            onClick={handleNavClick}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${isActiveItem
                                ? "bg-primary text-white shadow-sm"
                                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                              }`}
                          >
                            {icon}
                            <span>{label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* People Dropdown - Only for admin */}
              {mounted && getUserRole(user) === "admin" && (
                <div>
                  <button
                    onClick={() => setPeopleOpen(!peopleOpen)}
                    className={`flex items-center justify-between w-full px-3 py-3 rounded-lg transition-colors ${pathname.includes("/admin/people")
                        ? "bg-primary text-white"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                  >
                    <div className="flex items-center space-x-3">
                      <FaUsers className="w-5 h-5" />
                      <span className="text-sm font-medium">People</span>
                    </div>
                    {peopleOpen ? (
                      <FaChevronDownIcon className="w-4 h-4" />
                    ) : (
                      <FaChevronRightIcon className="w-4 h-4" />
                    )}
                  </button>

                  {peopleOpen && (
                    <div className="ml-8 mt-2 space-y-1">
                      {peopleItems.map(({ label, href, icon }) => {
                        const isActiveItem = pathname === href;
                        return (
                          <Link
                            key={href}
                            href={href}
                            onClick={handleNavClick}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${isActiveItem
                                ? "bg-primary text-white shadow-sm"
                                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                              }`}
                          >
                            {icon}
                            <span>{label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* User Management Dropdown - Only for admin */}
              {mounted && getUserRole(user) === "admin" && (
                <div>
                  <button
                    onClick={() => setUserMgmtOpen(!userMgmtOpen)}
                    className={`flex items-center justify-between w-full px-3 py-3 rounded-lg transition-colors ${pathname.includes("/admin/user-management")
                        ? "bg-primary text-white"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                  >
                    <div className="flex items-center space-x-3">
                      <FaUserTie className="w-5 h-5" />
                      <span className="text-sm font-medium">
                        User Management
                      </span>
                    </div>
                    {userMgmtOpen ? (
                      <FaChevronDownIcon className="w-4 h-4" />
                    ) : (
                      <FaChevronRightIcon className="w-4 h-4" />
                    )}
                  </button>

                  {userMgmtOpen && (
                    <div className="ml-8 mt-2 space-y-1">
                      {userMgmtItems.map(({ label, href, icon }) => {
                        const isActiveItem = pathname === href;
                        return (
                          <Link
                            key={href}
                            href={href}
                            onClick={handleNavClick}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${isActiveItem
                                ? "bg-primary text-white shadow-sm"
                                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                              }`}
                          >
                            {icon}
                            <span>{label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Notifications Dropdown (Admin scope) */}
              {mounted && getUserRole(user) === "admin" && (
                <div>
                  <button
                    onClick={() =>
                      setNotificationsOpenAdmin(!notificationsOpenAdmin)
                    }
                    className={`flex items-center justify-between w-full px-3 py-3 rounded-lg transition-colors ${pathname.includes("/admin/notifications")
                        ? "bg-primary text-white"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                  >
                    <div className="flex items-center space-x-3">
                      <FaBell className="w-5 h-5" />
                      <span className="text-sm font-medium">Notifications</span>
                    </div>
                    {notificationsOpenAdmin ? (
                      <FaChevronDownIcon className="w-4 h-4" />
                    ) : (
                      <FaChevronRightIcon className="w-4 h-4" />
                    )}
                  </button>

                  {notificationsOpenAdmin && (
                    <div className="ml-8 mt-2 space-y-1">
                      {notificationsItemsAdmin.map(({ label, href, icon }) => {
                        const isActiveItem = pathname === href;
                        return (
                          <Link
                            key={href}
                            href={href}
                            onClick={handleNavClick}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${isActiveItem
                                ? "bg-primary text-white shadow-sm"
                                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                              }`}
                          >
                            {icon}
                            <span>{label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* System Settings Dropdown - Only for admin */}
              {mounted && getUserRole(user) === "admin" && (
                <div>
                  <button
                    onClick={() => setSystemSettingsOpen(!systemSettingsOpen)}
                    className={`flex items-center justify-between w-full px-3 py-3 rounded-lg transition-colors ${pathname.includes("/admin/system-settings")
                        ? "bg-primary text-white"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                  >
                    <div className="flex items-center space-x-3">
                      <FaCog className="w-5 h-5" />
                      <span className="text-sm font-medium">
                        System Settings
                      </span>
                    </div>
                    {systemSettingsOpen ? (
                      <FaChevronDownIcon className="w-4 h-4" />
                    ) : (
                      <FaChevronRightIcon className="w-4 h-4" />
                    )}
                  </button>

                  {systemSettingsOpen && (
                    <div className="ml-8 mt-2 space-y-1">
                      {systemSettingsItems.map(({ label, href, icon }) => {
                        const isActiveItem = pathname === href;
                        return (
                          <Link
                            key={href}
                            href={href}
                            onClick={handleNavClick}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${isActiveItem
                                ? "bg-primary text-white shadow-sm"
                                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                              }`}
                          >
                            {icon}
                            <span>{label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Notifications Dropdown - Only for superadmin */}
              {mounted && getUserRole(user) === "superadmin" && (
                <div>
                  <button
                    onClick={() => setNotificationsOpen(!notificationsOpen)}
                    className={`flex items-center justify-between w-full px-3 py-3 rounded-lg transition-colors ${pathname.includes("/superadmin/notifications")
                        ? "bg-primary text-white"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                  >
                    <div className="flex items-center space-x-3">
                      <TbNotification className="w-5 h-5" />
                      <span className="text-sm font-medium">Notifications</span>
                    </div>
                    {notificationsOpen ? (
                      <FaChevronDownIcon className="w-4 h-4" />
                    ) : (
                      <FaChevronRightIcon className="w-4 h-4" />
                    )}
                  </button>

                  {notificationsOpen && (
                    <div className="ml-8 mt-2 space-y-1">
                      {notificationsItems.map(({ label, href }) => {
                        const isActiveItem = pathname === href;
                        return (
                          <Link
                            key={href}
                            href={href}
                            onClick={handleNavClick}
                            className={`block px-3 py-2 rounded-lg text-sm transition-colors ${isActiveItem
                                ? "bg-primary text-white shadow-sm"
                                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                              }`}
                          >
                            {label}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </nav>
          </div>
        </div>
      </div>

      {/* Profile Dropdown Menu */}
      {isProfileOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setIsProfileOpen(false)}
          />

          {/* Dropdown Menu */}
          <div className="absolute top-16 right-4 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2">
            <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
              {mounted && (
                <>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {user?.name ||
                      (getUserRole(user) === "superadmin"
                        ? "Super Admin"
                        : "Admin")}
                  </p>
                  {user?.email && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {user.email}
                    </p>
                  )}
                </>
              )}
            </div>

            <button className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <UserIcon className="w-4 h-4 mr-3" />
              Profile Settings
            </button>

            <div className="border-t border-gray-200 dark:border-gray-700 mt-2 pt-2">
              <button
                className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-3" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
