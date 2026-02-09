/**
 * Unified Dashboard Layout
 * 
 * Single layout for all operational roles (admin, manager, cashier).
 * Superadmin remains untouched with its own layout.
 * 
 * Features:
 * - Permission-based sidebar filtering
 * - Responsive design (mobile/desktop)
 * - POS screen full-screen mode
 * - No duplicate layouts
 * 
 * Performance optimizations:
 * - Memoized components
 * - No layout re-mounting on route change
 * - Server Component compatible (children)
 * - AuthProvider is in root layout (no duplicate here)
 */

'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import Header from '@/components/partials/Header';
import Sidebar from '@/components/partials/Sidebar';
import MobileNavbar from '@/components/partials/MobileNavbar';
import Footer from '@/components/partials/Footer';
// NOTE: AuthProvider is already in root layout - no need to duplicate here

export default function DashboardLayout({
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
    const isPOSScreen = useMemo(() => {
        return pathname?.includes('/pos-screen/pos-');
    }, [pathname]);

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
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, [hasMounted]);

    const toggleCollapse = useCallback(() => {
        setCollapsed((prev) => !prev);
    }, []);

    const toggleMobileNav = useCallback(() => {
        setIsMobileNavOpen((prev) => !prev);
    }, []);

    // Memoize the main content wrapper classes
    const contentClasses = useMemo(() => {
        if (isMobile) {
            return 'pb-12'; // Mobile-specific bottom padding
        }
        return collapsed
            ? 'ml-20 pt-16 pb-12'
            : 'ml-0 lg:ml-64 pt-16 pb-12';
    }, [isMobile, collapsed]);

    return (
        <>
            {isPOSScreen ? (
                // Full screen mode for POS screens - no sidebar, header, or footer
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
                    <div className={`transition-all duration-300 ${contentClasses}`}>
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
