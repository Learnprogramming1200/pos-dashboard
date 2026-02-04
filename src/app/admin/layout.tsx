"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Header from "@/components/partials/Header";
import Sidebar from "@/components/partials/Sidebar";
import MobileNavbar from "@/components/partials/MobileNavbar";
import Footer from "@/components/partials/Footer";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  // Check if current route is a POS screen route
  const isPOSScreen = pathname?.startsWith("/admin/pos-screen/pos-");

  // Handle hydration - only run client-side logic after mounting
  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Handle mobile detection and sidebar state (only after mounting)
  useEffect(() => {
    if (!hasMounted) return;

    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      // On mobile, sidebar should be collapsed (hidden) by default
      if (mobile) {
        setCollapsed(true);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [hasMounted]);

  // Token refresh is handled centrally in AuthProvider; avoid duplicating here

  const toggleCollapse = () => {
    setCollapsed((prev) => !prev);
  };

  const toggleMobileNav = () => {
    setIsMobileNavOpen((prev) => !prev);
  };

  return (
    <>
      {isPOSScreen ? (
        // Full screen mode for POS screens - no sidebar, header, or footer
        // Allow scrolling if content overflows
        <div className="fixed inset-0 w-full h-full overflow-auto">
          {children}
        </div>
      ) : (
        <>
          {/* Desktop Header and Sidebar */}
          <div className="hidden lg:block">
            <Sidebar collapsed={collapsed} toggleCollapse={toggleCollapse} />
            <Header collapsed={collapsed} onToggleSidebar={toggleCollapse} />
          </div>

          {/* Mobile Navbar - Scrolls with content */}
          <MobileNavbar isOpen={isMobileNavOpen} onToggle={toggleMobileNav} />

          {/* Main Content */}
          <div
            className={`transition-all duration-300 ${isMobile
                ? "pb-12" // Mobile-specific bottom padding
                : collapsed
                  ? "ml-20 pt-16 pb-12"
                  : "ml-0 lg:ml-64 pt-16 pb-12"
              }`}
          >
            <div className="min-h-screen bg-[#f9fafb] dark:bg-[#111111]">
              <main className="p-4 lg:p-6">{children}</main>
            </div>
          </div>

          {/* Footer - Only show on desktop */}
          <div className="hidden lg:block">
            <Footer collapsed={collapsed} />
          </div>
        </>
      )}
    </>
  );
}
