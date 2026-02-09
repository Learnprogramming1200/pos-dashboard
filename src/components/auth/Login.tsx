"use client";

import React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import { toast } from "react-toastify";
import { Constants } from "@/constant";
import { ServerActions } from "@/lib";
import { DASHBOARD_NAV_CONFIG, type NavItem } from "@/config";

function LoginForm() {
  const { data: session } = useSession();
  const authUser = session?.user;
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [successMessage, setSuccessMessage] = React.useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = React.useState(false);
  const [lastAttemptTime, setLastAttemptTime] = React.useState(0);

  // Helper: does a permission entry have read access?
  const hasReadAccess = (perm: any) =>
    !!(perm && (perm.read || perm.view));

  // Helper: find first readable path from tabs using DASHBOARD_NAV_CONFIG
  const findFirstReadablePath = (tabs: Record<string, any>): string | null => {
    const visitItems = (items: NavItem[]): string | null => {
      for (const item of items) {
        const perm = tabs[item.permissionKey];
        if (hasReadAccess(perm)) {
          return item.path;
        }
        if (item.children) {
          const childPath = visitItems(item.children);
          if (childPath) return childPath;
        }
      }
      return null;
    };

    for (const section of DASHBOARD_NAV_CONFIG) {
      const path = visitItems(section.items);
      if (path) return path;
    }

    return null;
  };

  React.useEffect(() => {
    const message = searchParams.get("message");

    if (message) {
      setSuccessMessage(message);
      // Clear the message from URL after showing it
      router.replace("/login");
    }
  }, [searchParams, router]);

  // Handle redirect when user becomes authenticated
  React.useEffect(() => {
    if (!authUser || loading) return;

    const doRedirect = async () => {
      const role = authUser.role;

      // Superadmin still goes to its own area
      if (role === "superadmin") {
        router.replace("/superadmin");
        return;
      }

      // For admin, keep existing business validity checks first
      if (role === "admin") {
        const isActive = authUser?.isActive === true;
        const isAdmin = authUser?.isAdmin === true;
        const isSubscription = authUser?.isSubscription === true;
        const hasPlan = !!authUser?.planName;

        if (!(isActive && isAdmin && isSubscription && hasPlan)) {
          router.replace("/");
          return;
        }
      }

      // For all operational roles (admin/manager/cashier), use permissions
      try {
        const response = await ServerActions.ServerActionslib.getRolePermissionsMeAction();
        const data = response?.data?.data || response?.data || {};
        const tabs: Record<string, any> = data.tabs || {};


        // 2) Otherwise, go to first readable tab path
        const firstPath = findFirstReadablePath(tabs);
        if (firstPath) {
          router.replace(firstPath);
          return;
        }

        // 3) Fallback
        router.replace("/");
      } catch (error) {
        console.error("Login redirect permission error:", error);
        router.replace("/");
      }
    };

    void doRedirect();
  }, [authUser, loading, router]);

  const handleLogin = async (formData: FormData) => {
    const emailValue = formData.get("email") as string;
    const passwordValue = formData.get("password") as string;

    if (!emailValue || !passwordValue) {
      toast.error("Please enter both email and password");
      return;
    }

    // Check for rate limiting cooldown
    const now = Date.now();
    const timeSinceLastAttempt = now - lastAttemptTime;
    const cooldownPeriod = 2000; // 2 seconds cooldown

    if (timeSinceLastAttempt < cooldownPeriod) {
      toast.warning(
        `Please wait ${Math.ceil((cooldownPeriod - timeSinceLastAttempt) / 1000)} seconds before trying again.`,
      );
      return;
    }

    setLastAttemptTime(now);
    setLoading(true);

    try {
      // Step 1: Make client-side API call to login
      // This allows the backend's Set-Cookie header to set pos-session directly in the browser
      const { authAPI } = await import("@/lib/api");
      const loginResponse = await authAPI.login(emailValue, passwordValue);

      if (loginResponse.status === 200 || loginResponse.status === 201) {
        // Step 2: Now call NextAuth signIn to establish the session
        // NextAuth will use the same credentials to create its session
        const result = await signIn("credentials", {
          email: emailValue,
          password: passwordValue,
          redirect: false,
        });

        if (result?.ok && !result?.error) {
          toast.success("Login successful!");
          // Redirection handled by useEffect
        } else {
          const errorMessage = result?.error || "Login failed";
          if (errorMessage.includes("CredentialsSignin")) {
            toast.error("Invalid email or password.");
          } else {
            toast.error(errorMessage);
          }
        }
      } else {
        toast.error("Login failed. Please check your credentials.");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      // Handle specific error messages from backend
      const errorMessage = error?.response?.data?.message || error?.message || "Login failed. Please try again.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    await handleLogin(formData);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row relative bg-white dark:bg-gray-900">
      {/* Left Side: Testimonials - Hidden on mobile and tablet, visible only on desktop */}
      <div className="hidden lg:flex w-full lg:w-[40%] flex-col items-center justify-center lg:ml-10">
        <Image
          src={Constants.assetsIcon.assets.loginImage}
          alt="Login Page Image"
          width={700}
          height={100}
          style={{
            width: "100%",
            maxWidth: "700px",
            height: "auto",
            maxHeight: "700px",
            objectFit: "contain",
            borderRadius: "20px",
          }}
        />
      </div>

      {/* Right Side: Login Form - Full width on mobile, adjusted on larger screens */}
      <div className="w-full lg:w-[70%] flex flex-col justify-center items-center p-4 sm:p-6 lg:p-4">
        <div className="w-full max-w-sm sm:max-w-none md:max-w-none lg:max-w-md rounded-xl">
          {/* Heading */}
          <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-center text-gray-900 dark:text-white mb-4 sm:mb-6">
            Welcome back to{" "}
            <span className="text-gray-800 dark:text-gray-200 font-poppins">
              POSPRO
            </span>
          </h2>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-8 sm:mt-12 lg:mt-16">
            {/* Email */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1 text-textMain dark:text-gray-300 font-poppins">
                Email<span className="text-required">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder='eg "demo@vendor.com"'
                className="w-full border border-border dark:border-gray-600 rounded-md px-3 sm:px-4 py-2 sm:py-3 outline-none focus:ring-1 focus:ring-primary font-interTight text-sm sm:text-base bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                required
              />
            </div>

            {/* Password */}
            <div className="mb-3 relative">
              <label className="block text-sm font-medium mb-1 text-textMain dark:text-gray-300 font-poppins">
                Password<span className="text-required">*</span>
              </label>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full border border-border dark:border-gray-600 rounded-md px-3 sm:px-4 py-2 sm:py-3 pr-10 outline-none focus:ring-1 focus:ring-primary font-interTight text-sm sm:text-base bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 pt-6"
              >
                {showPassword ? (
                  <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-[#6e8192] dark:text-gray-400 font-interTight" />
                ) : (
                  <EyeOff className="h-4 w-4 sm:h-5 sm:w-5 text-[#6e8192] dark:text-gray-400 font-interTight" />
                )}
              </button>
            </div>

            {/* Remember Me */}
            <div className="flex flex-row justify-between items-start sm:items-center mt-3 mb-6 gap-2 sm:gap-0">
              <label className="flex items-center text-sm text-textSmall dark:text-gray-400 font-interTight">
                <input
                  type="checkbox"
                  className="mr-2 rounded border-gray-300 dark:border-gray-600 text-primary focus:ring-primary dark:bg-gray-800"
                />
                Remember Me
              </label>
              <Link
                href="/forgot-password"
                className="text-sm text-primary dark:text-blue-400 italic font-semibold font-interTight hover:text-primaryHover dark:hover:text-blue-300"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full text-white font-poppins bg-primary py-2 sm:py-[10px] sm:px-[24px] rounded-md text-base sm:text-base font-semibold hover:bg-primaryHover transition disabled:opacity-50 disabled:cursor-not-allowed mb-6"
            >
              {loading ? "Logging In..." : "Log In"}
            </button>

            {successMessage && (
              <p className="text-success text-sm mt-2 text-center">
                {successMessage}
              </p>
            )}

            {/* Footer */}
            <p className="text-center text-sm sm:text-base mt-4 sm:mt-6 text-textSmall dark:text-gray-400 font-interTight">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="text-primary dark:text-blue-400 text-sm sm:text-base font-bold font-interTight hover:text-primaryHover dark:hover:text-blue-300"
              >
                Sign Up
              </Link>
            </p>
          </form>
        </div>
      </div>

      {/* Background Image - Responsive for all screen sizes */}
      <div
        className="flex flex-col items-center justify-center pointer-events-none -z-10 absolute right-0 top-0 
        lg:ml-10 
        md:right-0 md:top-0
        sm:right-0 sm:top-0
        right-0 top-0"
      >
        <Image
          src={Constants.assetsIcon.assets.authenticationBg}
          alt="Login Page Image"
          width={600}
          height={500}
          className="
            lg:w-[600px] lg:h-[100dvh]
            md:w-[400px] md:h-[100dvh]
            sm:w-[300px] sm:h-[100dvh]
            w-[250px] h-[100dvh]
            object-contain"
        />
      </div>
    </div>
  );
}

export default function Login() {
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </React.Suspense>
  );
}
