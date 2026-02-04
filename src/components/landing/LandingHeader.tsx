"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";
import { usePathname, useRouter } from "next/navigation";
import { Shield, ChevronDown, X, Menu, LogOut, LayoutDashboard } from "lucide-react";
import { WebComponents } from "@/components";
import { landingStrings } from "@/constant/common";
import { ServerActions } from "@/lib"
import { createPageUrl } from "@/utils";
import { useSession, signOut } from "next-auth/react";
import { tokenUtils } from "@/lib/utils";
import { useGeneralSettings } from "@/contexts/GeneralSettingsContext";

const navigation = landingStrings.header.navigation;
const moreNavigation = landingStrings.header.moreNavigation;

interface LandingHeaderProps {
    user?: { name?: string; email?: string; roleId?: number } | null;
    loading?: boolean;
    onLogin?: () => void;
    onRegister?: () => void;
    onLogout?: () => void;
    minimal?: boolean;
    hideNavLinks?: boolean;
    miscSettings?: any;
    generalSettings?: any;
}

export default function LandingHeader({ loading, onLogin, onRegister, onLogout, minimal, hideNavLinks, miscSettings, generalSettings }: LandingHeaderProps) {
    const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
    const [profileDropdownOpen, setProfileDropdownOpen] = React.useState(false);
    const { data: session } = useSession();
    const [user, setUser] = React.useState<{ name?: string; email?: string; avatar?: string; role?: string } | null>(null);
    const pathname = usePathname();
    const router = useRouter();
    const [isScrolledPastHero, setIsScrolledPastHero] = React.useState(false);

    const { resolvedTheme } = useTheme();
    const { generalSettings: ctxGeneralSettings } = useGeneralSettings();
    const [mounted, setMounted] = React.useState(false);
    const [showDarkModeToggle, setShowDarkModeToggle] = React.useState(true);
    const ctxUser = session?.user;
    
    // Use SSR generalSettings if available, otherwise fall back to context
    const activeGeneralSettings = generalSettings || ctxGeneralSettings;

    React.useEffect(() => {
        setMounted(true);
        // Use SSR data for miscSettings, no client-side API calls
        if (miscSettings) {
            setShowDarkModeToggle(miscSettings.darkMode === true);
        } else {
            // Default to showing toggle if no SSR data
            setShowDarkModeToggle(true);
        }
    }, [miscSettings]);

    // Scroll detection for hero section
    React.useEffect(() => {
        const handleScroll = () => {
            const heroSection = document.getElementById('home');
            if (heroSection) {
                const rect = heroSection.getBoundingClientRect();
                // Check if quarter of hero section is scrolled past (before half)
                // When top + quarter height is at or above viewport top, trigger header change
                setIsScrolledPastHero(rect.top + rect.height / 8 <= 0);
            } else {
                // If hero section doesn't exist, default to scrolled past
                setIsScrolledPastHero(true);
            }
        };

    // Check initial state
    handleScroll();

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

    const logoUrl = mounted ? (resolvedTheme === 'dark' ? activeGeneralSettings?.logos?.darkLogo?.url : activeGeneralSettings?.logos?.lightLogo?.url) : null;

    React.useEffect(() => {
        // Prefer AuthContext user when available
        if (ctxUser) {
            setUser({
                name: (ctxUser as { name?: string })?.name,
                email: (ctxUser as { email?: string })?.email,
                avatar: (ctxUser as { avatar?: string; profilePicture?: string })?.avatar || (ctxUser as { profilePicture?: string })?.profilePicture,
                role: ServerActions.Utils.getUserRole(ctxUser as { role?: string }),
            });
            return;
        }

        // Fallback to token payload if context is not ready
        const token = ServerActions.Utils.tokenUtils.getToken();
        if (token) {
            try {
                const tokenPayload = ServerActions.Utils.tokenUtils.decodeToken(token) as { user?: { name?: string; email?: string; avatar?: string; profilePicture?: string }; userData?: { name?: string; email?: string; avatar?: string; profilePicture?: string } };
                const payloadUser = tokenPayload?.user || tokenPayload?.userData;
                if (payloadUser) {
                    setUser({
                        name: payloadUser.name,
                        email: payloadUser.email,
                        avatar: payloadUser.avatar || payloadUser.profilePicture,
                        role: ServerActions.Utils.getUserRole(payloadUser),
                    });
                }
            } catch (error) {
                console.error("Error decoding token:", error);
                ServerActions.Utils.tokenUtils.clearAuth();
                router.push("/login");
            }
        }
    }, [ctxUser]);

    // Close dropdown when clicking outside
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Element;
            if (profileDropdownOpen && !target.closest('.profile-dropdown-container')) {
                setProfileDropdownOpen(false);
            }
        };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [profileDropdownOpen]);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    tokenUtils.clearAuth();
    router.push("/login");
    return { success: true };
  };

    if (minimal) {
        return (
            <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolledPastHero
                ? 'bg-white dark:bg-slate-900 shadow-sm'
                : 'bg-transparent shadow-none'
                }`}>
                <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
                    <div className="flex items-center justify-between h-[72px]">
                        {/* Logo */}
                        <div className="flex items-center gap-3 group cursor-pointer">
                            <Link href={createPageUrl('/')} className="flex items-center gap-3 group">
                                {logoUrl ? (
                                    <div className="relative h-10 w-auto">
                                        <Image
                                            src={logoUrl}
                                            alt={generalSettings?.appName || "Logo"}
                                            width={0}
                                            height={0}
                                            sizes="100vw"
                                            className="h-full w-auto object-contain"
                                        />
                                    </div>
                                ) : (
                                    <>
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-gradient-to-r from-[#007bff] via-[#00bfff] to-[#43d7e7] rounded-2xl blur-md opacity-60 group-hover:opacity-90 transition-all duration-300"></div>
                                            <div className="relative bg-gradient-to-r from-[#007bff] via-[#00bfff] to-[#43d7e7] p-2.5 rounded-2xl shadow-xl">
                                                <Shield className="w-7 h-7 text-white" strokeWidth={2.5} />
                                            </div>
                                        </div>
                                        <div className="flex flex-col -gap-1">
                                            <div className="flex items-baseline gap-0.5">
                                                <span className="text-[26px] font-bold tracking-tight bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 dark:from-slate-100 dark:via-slate-200 dark:to-slate-300 bg-clip-text text-transparent">
                                                    POS
                                                </span>
                                                <span className="text-[26px] font-bold tracking-tight bg-gradient-to-r from-[#007bff] via-[#00bfff] to-[#43d7e7] bg-clip-text text-transparent">
                                                    Pro
                                                </span>
                                            </div>
                                            <span className="text-[9px] font-semibold tracking-widest text-slate-400 dark:text-slate-500 uppercase -mt-1">
                                                Business Suite
                                            </span>
                                        </div>
                                    </>
                                )}
                            </Link>
                        </div>
                        {/* Right side - Theme toggle and Login */}
                        <div className="flex items-center gap-5">
                            {showDarkModeToggle && <WebComponents.UiWebComponents.UiWebComponents.DarkModeToggle />}
                            <WebComponents.UiWebComponents.UiWebComponents.Button
                                variant="outline"
                                className="px-5 py-2.5 rounded-lg shadow-sm hover:shadow focus-visible:ring-2 focus-visible:ring-primary/40"
                                onClick={() => { onLogin ? onLogin() : router.push('/login'); }}
                            >
                                {landingStrings.common.login}
                            </WebComponents.UiWebComponents.UiWebComponents.Button>
                        </div>
                    </div>
                </div>
            </header>
        );
    }

    return (
        <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolledPastHero
            ? 'bg-white dark:bg-slate-900 shadow-sm'
            : 'bg-transparent shadow-none'
            }`}>
            <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
                <div className="flex items-center justify-between h-[72px]">
                    {/* Left Section - Logo */}
                    <div className="flex items-center gap-3 group cursor-pointer">
                        <Link href={createPageUrl('/')} className="flex items-center gap-3 group">
                            {logoUrl ? (
                                <div className="relative h-10 w-auto">
                                    <Image
                                        src={logoUrl}
                                        alt={generalSettings?.appName || "Logo"}
                                        width={0}
                                        height={0}
                                        sizes="100vw"
                                        className="h-full w-auto object-contain"
                                    />
                                </div>
                            ) : (
                                <>
                                    {/* <div className="relative">
                                        <div className="absolute inset-0 bg-gradient-to-r from-[#007bff] via-[#00bfff] to-[#43d7e7] rounded-2xl blur-md opacity-60 group-hover:opacity-90 transition-all duration-300"></div>
                                        <div className="relative bg-gradient-to-r from-[#007bff] via-[#00bfff] to-[#43d7e7] p-2.5 rounded-2xl shadow-xl">
                                            <Shield className="w-7 h-7 text-white" strokeWidth={2.5} />
                                        </div>
                                    </div>
                                    <div className="flex flex-col -gap-1">
                                        <div className="flex items-baseline gap-0.5">
                                            <span className="text-[26px] font-bold tracking-tight bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 dark:from-slate-100 dark:via-slate-200 dark:to-slate-300 bg-clip-text text-transparent">
                                                POS
                                            </span>
                                            <span className="text-[26px] font-bold tracking-tight bg-gradient-to-r from-[#007bff] via-[#00bfff] to-[#43d7e7] bg-clip-text text-transparent">
                                                Pro
                                            </span>
                                        </div>
                                        <span className="text-[9px] font-semibold tracking-widest text-slate-400 dark:text-slate-500 uppercase -mt-1">
                                            Business Suite
                                        </span>
                                    </div> */}
                                </>
                            )}
                        </Link>
                    </div>

          {/* Center Section - Desktop Navigation */}
          {!hideNavLinks && (
            <nav className="hidden lg:flex items-center gap-0.5">
              {navigation.map((item) => {
                const isHomePage = pathname === "/";
                const href =
                  !isHomePage && item.href.startsWith("#")
                    ? `/${item.href}`
                    : item.href;

                                return (
                                    <Link
                                        key={item.name}
                                        href={href}
                                        className={`relative px-5 py-2.5 text-[15px] font-semibold transition-colors duration-200 group ${isScrolledPastHero
                                            ? 'text-slate-700 dark:text-slate-200 hover:text-primary dark:hover:text-primary'
                                            : 'text-white hover:text-primary dark:hover:text-primary'
                                            }`}
                                        onClick={e => {
                                            if (isHomePage && item.href.startsWith('#')) {
                                                e.preventDefault();
                                                const el = document.querySelector(item.href);
                                                if (el) {
                                                    el.scrollIntoView({ behavior: 'smooth' });
                                                }
                                            }
                                        }}
                                    >
                                        {item.name}
                                        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-[#007bff] via-[#00bfff] to-[#43d7e7] group-hover:w-4/5 transition-all duration-300 rounded-full"></span>
                                    </Link>
                                );
                            })}
                            <div className="relative group">
                                <button className={`relative flex items-center gap-1.5 px-5 py-2.5 text-[15px] font-semibold transition-colors duration-200 group ${isScrolledPastHero
                                    ? 'text-slate-700 dark:text-slate-200 hover:text-primary dark:hover:text-primary'
                                    : 'text-white hover:text-primary dark:hover:text-primary'
                                    }`}>
                                    {landingStrings.common.more}
                                    <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform duration-200" />
                                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-[#007bff] via-[#00bfff] to-[#43d7e7] group-hover:w-4/5 transition-all duration-300 rounded-full"></span>
                                </button>
                                <div className="absolute left-0 top-full z-50 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md shadow-lg rounded-lg min-w-[120px] border border-slate-200/50 dark:border-slate-700/50 mt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                                    {moreNavigation.map((item) => {
                                        const isHomePage = pathname === '/';
                                        const href = !isHomePage && item.href.startsWith('#')
                                            ? `/${item.href}`
                                            : item.href;
                                        return (
                                            <Link
                                                key={item.name}
                                                href={href}
                                                onClick={e => {
                                                    if (isHomePage && item.href.startsWith('#')) {
                                                        e.preventDefault();
                                                        const el = document.querySelector(item.href);
                                                        if (el) {
                                                            el.scrollIntoView({ behavior: 'smooth' });
                                                        }
                                                    }
                                                }}
                                                className="block w-full px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700/80 transition-colors first:rounded-t-lg last:rounded-b-lg"
                                            >
                                                {item.name}
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        </nav>
                    )}

                    {/* Right Section */}
                    <div className="flex items-center gap-5">
                        {/* Theme Toggle */}
                        {showDarkModeToggle && <WebComponents.UiWebComponents.UiWebComponents.DarkModeToggle />}

                        {/* User Profile */}
                        {user ? (
                            <div className={`hidden lg:flex items-center gap-3.5 pl-5 border-l ${isScrolledPastHero
                                ? 'border-slate-200 dark:border-slate-700'
                                : 'border-white/20'
                                }`}>
                                <div className="relative profile-dropdown-container">
                                    <button
                                        className={`flex items-center gap-3.5 rounded-lg p-1 transition-colors duration-200 ${isScrolledPastHero
                                            ? 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                                            : 'hover:bg-white/10 backdrop-blur-sm'
                                            }`}
                                        onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                                    >
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full blur-md opacity-0 hover:opacity-60 transition-opacity duration-300"></div>
                                            <Image
                                                src={user.avatar || "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=200"}
                                                alt="User Profile"
                                                width={44}
                                                height={44}
                                                className={`relative w-11 h-11 rounded-full object-cover transition-all duration-300 shadow-sm ${isScrolledPastHero
                                                    ? 'ring-2 ring-slate-200 dark:ring-slate-600 hover:ring-[#43d7e7]'
                                                    : 'ring-2 ring-white/30 hover:ring-white/50'
                                                    }`}
                                            />
                                            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#43d7e7] border-[2.5px] border-white dark:border-slate-900 rounded-full shadow-sm"></div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="flex flex-col -gap-1">
                                                <span className={`text-[15px] font-semibold ${isScrolledPastHero
                                                    ? 'text-slate-800 dark:text-slate-200'
                                                    : 'text-white'
                                                    }`}>
                                                    {user?.name || "User"}
                                                </span>
                                            </div>
                                            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${profileDropdownOpen ? 'rotate-180' : ''} ${isScrolledPastHero
                                                ? 'text-slate-400 dark:text-slate-500'
                                                : 'text-white/70'
                                                }`} />
                                        </div>
                                    </button>

                                    {/* Profile Dropdown */}
                                    {profileDropdownOpen && (
                                        <div className="absolute right-0 mt-2 w-56 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md rounded-lg shadow-lg border border-slate-200/50 dark:border-slate-700/50 py-2 z-50 animate-in slide-in-from-top-2 duration-200">
                                            <Link
                                                href={user?.role === "superadmin" ? "/superadmin" : "/admin"}
                                                className="flex items-center px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/80 transition-colors"
                                            >
                                                <LayoutDashboard className="w-4 h-4 mr-3" />
                                                Go to Dashboard
                                            </Link>
                                            <div className="h-px bg-slate-200 dark:bg-slate-700 my-1"></div>
                                            <button
                                                className="flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors w-full text-left"
                                                onClick={handleLogout}
                                            >
                                                <LogOut className="w-4 h-4 mr-3" />
                                                {landingStrings.common.signOut}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className={`hidden lg:flex items-center gap-3 pl-5 border-l ${isScrolledPastHero
                                ? 'border-slate-200 dark:border-slate-700'
                                : 'border-white'
                                }`}>
                                <WebComponents.UiWebComponents.UiWebComponents.Button
                                    variant="outline"
                                    className="px-5 py-2.5 rounded-lg shadow-sm hover:shadow focus-visible:ring-2 focus-visible:ring-primary/40"
                                    onClick={() => { onLogin ? onLogin() : router.push('/login'); }}
                                >
                                    {landingStrings.common.login}
                                </WebComponents.UiWebComponents.UiWebComponents.Button>
                                <WebComponents.UiWebComponents.UiWebComponents.Button
                                    variant="default"
                                    className="px-5 py-2.5 rounded-lg shadow-sm hover:shadow focus-visible:ring-2 focus-visible:ring-primary/40"
                                    onClick={() => { onRegister ? onRegister() : router.push('/signup'); }}
                                >
                                    Register
                                </WebComponents.UiWebComponents.UiWebComponents.Button>
                            </div>
                        )}

                        {/* Mobile Menu WebComponents.UiWebComponents.UiWebComponents.Button */}
                        <WebComponents.UiWebComponents.UiWebComponents.Button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="lg:hidden flex items-center justify-center w-10 h-10 rounded-xl text-slate-600 dark:text-slate-400 hover:text-teal-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
                        >
                            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </WebComponents.UiWebComponents.UiWebComponents.Button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className={`lg:hidden border-t bg-white/95 dark:bg-slate-800/95 backdrop-blur-md ${isScrolledPastHero
                    ? 'border-slate-200 dark:border-slate-700'
                    : 'border-white'
                    }`}>
                    <div className="px-6 py-4 space-y-1">
                        {!hideNavLinks && navigation.map((item) => {
                            const isHomePage = pathname === '/';
                            const href = !isHomePage && item.href.startsWith('#')
                                ? `/${item.href}`
                                : item.href;
                            return (
                                <Link
                                    key={item.name}
                                    href={href}
                                    className="block px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-lg transition-all duration-200"
                                    onClick={e => {
                                        if (isHomePage && item.href.startsWith('#')) {
                                            e.preventDefault();
                                            const el = document.querySelector(item.href);
                                            if (el) {
                                                el.scrollIntoView({ behavior: 'smooth' });
                                            }
                                        }
                                        setMobileMenuOpen(false);
                                    }}
                                >
                                    {item.name}
                                </Link>
                            );
                        })}
                        {!hideNavLinks && moreNavigation.map((item) => {
                            const isHomePage = pathname === '/';
                            const href = !isHomePage && item.href.startsWith('#')
                                ? `/${item.href}`
                                : item.href;

                            return (
                                <Link
                                    key={item.name}
                                    href={href}
                                    className="block px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-lg transition-all duration-200"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    {item.name}
                                </Link>
                            );
                        })}
                        {!hideNavLinks && !user && (
                            <div className={`pt-4 mt-4 border-t grid grid-cols-2 gap-3 ${isScrolledPastHero
                                ? 'border-slate-200 dark:border-slate-700'
                                : 'border-white'
                                }`}>
                                <WebComponents.UiWebComponents.UiWebComponents.Button
                                    variant="outline"
                                    className="w-full px-4 py-2.5 rounded-lg"
                                    onClick={() => {
                                        setMobileMenuOpen(false);
                                        if (onLogin) onLogin();
                                        else router.push('/login');
                                    }}
                                >
                                    {landingStrings.common.login}
                                </WebComponents.UiWebComponents.UiWebComponents.Button>
                                <WebComponents.UiWebComponents.UiWebComponents.Button
                                    variant="default"
                                    className="w-full px-4 py-2.5 rounded-lg"
                                    onClick={() => {
                                        setMobileMenuOpen(false);
                                        if (onRegister) onRegister();
                                        else router.push('/signup');
                                    }}
                                >
                                    Register
                                </WebComponents.UiWebComponents.UiWebComponents.Button>
                            </div>
                        )}
                        {user && (
                            <div className={`pt-4 mt-4 border-t flex items-center gap-3 ${isScrolledPastHero
                                ? 'border-slate-200 dark:border-slate-700'
                                : 'border-white'
                                }`}>
                                <Image
                                    src={user.avatar || "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=200"}
                                    alt="User Profile"
                                    width={40}
                                    height={40}
                                    className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-200 dark:ring-slate-600"
                                />
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{user.name || "User"}</span>
                                    <span className="text-xs text-slate-400 dark:text-slate-500">{user.role || "User"}</span>
                                </div>
                            </div>
                        )}
                        {user && (
                            <>
                                <Link
                                    href={user?.role === "superadmin" ? "/superadmin" : "/admin"}
                                    className="block px-5 py-3 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-lg transition-all duration-200 mt-2"
                                >
                                    <div className="flex items-center">
                                        <LayoutDashboard className="w-4 h-4 mr-3" />
                                        Go to Dashboard
                                    </div>
                                </Link>
                                <WebComponents.UiWebComponents.UiWebComponents.Button
                                className="w-full flex items-center px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 mt-2"
                                onClick={handleLogout}
                            >
                                <LogOut className="w-4 h-4 mr-3" />
                                {landingStrings.common.signOut}
                            </WebComponents.UiWebComponents.UiWebComponents.Button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}
