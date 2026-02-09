import React from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, LogOut, Menu, X, User as UserIcon, } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { tokenUtils } from "@/lib/utils";
import { DarkModeToggle } from "@/components/ui/DarkModeToggle";
import NotificationPopup from "@/components/superadmin/notifications/NotificationPopup";
import { ServerActions } from "@/lib";
import { Skeleton } from "@/components/ui/skeleton";

interface HeaderProps {
  collapsed: boolean;
  onToggleSidebar?: () => void;
}

export default function Header({ collapsed, onToggleSidebar }: HeaderProps) {
  const { data: session } = useSession();
  const ctxUser = session?.user;

  const logout = async () => {
    await signOut({ redirect: false });
    tokenUtils.clearAuth();
    router.push("/login");
    return { success: true };
  };
  const router = useRouter();
  const [user, setUser] = React.useState<{
    name?: string;
    email?: string;
    avatar?: string;
    role?: string;
  } | null>(null);
  const [miscSettings, setMiscSettings] = React.useState<any>(null);
  const [showDarkModeToggle, setShowDarkModeToggle] = React.useState(true);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    // Fetch miscellaneous settings to determine dark mode toggle visibility
    const fetchMiscSettings = async () => {
      if (
        !user?.role ||
        (user.role !== "superadmin" && user.role !== "admin")
      ) {
        return;
      }

      try {
        const response =
          user.role === "superadmin"
            ? await ServerActions.ServerActionslib.getSuperAdminMiscSettingsAction()
            : await ServerActions.ServerActionslib.getAdminMiscSettingsAction();

        // Handle server action response structure
        if (response?.success && response?.data?.data) {
          const settingsData = response.data.data;
          setMiscSettings(settingsData);
          // Show dark mode toggle only when darkMode is true
          setShowDarkModeToggle(settingsData.darkMode === true);
        }
      } catch (error) {
        console.error("Failed to fetch miscellaneous settings:", error);
        // Default to showing toggle if API fails
        setShowDarkModeToggle(true);
      }
    };

    fetchMiscSettings();
  }, [user?.role]);

  React.useEffect(() => {
    // Prefer AuthContext user when available
    if (ctxUser) {
      setUser({
        name: (ctxUser as { name?: string })?.name,
        email: (ctxUser as { email?: string })?.email,
        avatar:
          (ctxUser as { avatar?: string; profilePicture?: string })?.avatar ||
          (ctxUser as { profilePicture?: string })?.profilePicture,
        role: ServerActions.Utils.getUserRole(ctxUser as { role?: string }),
      });
      return;
    }

    // Fallback to token payload if context is not ready
    const token = ServerActions.Utils.tokenUtils.getToken();
    if (token) {
      try {
        const tokenPayload = ServerActions.Utils.tokenUtils.decodeToken(
          token,
        ) as {
          user?: {
            name?: string;
            email?: string;
            avatar?: string;
            profilePicture?: string;
          };
          userData?: {
            name?: string;
            email?: string;
            avatar?: string;
            profilePicture?: string;
          };
        };
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
  }, [ctxUser, router]);

  const [isProfileOpen, setIsProfileOpen] = React.useState(false);

  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  const handleLogout = async () => {
    try {
      // Use NextAuthContext logout method
      await logout();

      // Force a hard redirect to clear browser state and prevent back-button cache access
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      // Force hard redirect even if logout fails
      router.push("/login");
    }
  };

  return (
    <>
      <header
        className={`h-16 fixed top-0 ${collapsed ? "left-0 lg:left-20" : "left-0 lg:left-64"
          } right-0 bg-white dark:bg-darkFilterbar z-30 flex items-center px-4 lg:px-6 transition-all duration-300`}
      >
        {/* Mobile Menu Button */}
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors mr-2"
        >
          {collapsed ? (
            <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          ) : (
            <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          )}
        </button>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-2 lg:space-x-4 ml-auto">
          {/* Theme Segmented Toggle */}
          {showDarkModeToggle && <DarkModeToggle />}

          {/* Notifications */}
          <NotificationPopup />

          {/* Admin Profile Dropdown */}
          <div className="relative">
            <div className="flex items-center space-x-2 lg:space-x-3 p-1 lg:p-2 rounded-lg">
              {!mounted || session === undefined ? (
                <Skeleton className="w-8 h-8 lg:w-12 lg:h-12 rounded-full" />
              ) : (
                <Image
                  src={
                    user?.avatar ||
                    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                  }
                  alt="Admin Profile"
                  width={32}
                  height={32}
                  className="w-8 h-8 lg:w-12 lg:h-12 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                />
              )}
              <div className="hidden lg:block text-left">
                {!mounted || session === undefined ? (
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                ) : (
                  <>
                    <p className="text-sm font-semibold text-[#31394D] dark:text-white leading-tight">
                      {user?.name || "User Name"}
                    </p>
                    <p className="text-xs font-semibold text-[#828A90]">
                      {user?.role
                        ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
                        : "Admin"}
                    </p>
                  </>
                )}
              </div>
              <button onClick={toggleProfile}>
                <span className="hidden sm:inline-flex items-center justify-center w-6 h-6 rounded-full border border-[#292D32] dark:border-[#F2F2F2]">
                  <ChevronDown
                    strokeWidth={3}
                    className={`w-3 h-3 text-[#292D32] dark:text-[#F2F2F2] transition-transform duration-200 ${isProfileOpen ? "rotate-180" : ""
                      }`}
                  />
                </span>
              </button>
            </div>

            {/* Profile Dropdown */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-48 lg:w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 md:hidden">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {user?.name}
                  </p>
                  {user?.email && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {user.email}
                    </p>
                  )}
                </div>

                <Link
                  href={
                    user?.role === "superadmin"
                      ? "/superadmin/profile"
                      : "/admin"
                  }

                  className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <UserIcon className="w-4 h-4 mr-3" />
                  Profile Settings
                </Link>

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
            )}
          </div>
        </div>
      </header>

      {/* Overlay for mobile dropdown */}
      {isProfileOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setIsProfileOpen(false)}
        />
      )}
    </>
  );
}
