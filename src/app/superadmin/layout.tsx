"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/partials/Header";
import Sidebar from "@/components/partials/Sidebar";
import MobileNavbar from "@/components/partials/MobileNavbar";
import Footer from "@/components/partials/Footer";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Handle mobile detection and sidebar state
  useEffect(() => {
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
  }, []);

  const toggleCollapse = () => {
    setCollapsed((prev) => !prev);
  };

  const toggleMobileNav = () => {
    setIsMobileNavOpen((prev) => !prev);
  };

  return (
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
        className={`transition-all duration-300 ${
          isMobile
            ? "pb-12" // Add bottom padding for mobile footer
            : collapsed
              ? "ml-20 pt-16 pb-12"
              : "ml-64 pt-16 pb-12"
        }`}
      >
        <div className="min-h-screen bg-[#f9fafb] dark:bg-[#111111]">
          <main className="p-4 lg:p-8">{children}</main>
        </div>
      </div>

      {/* Footer - Fixed at bottom, show on all screens */}
      <Footer collapsed={collapsed} />
    </>
  );
}
