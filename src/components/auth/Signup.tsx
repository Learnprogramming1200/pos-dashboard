"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";
import { signupAction } from "@/lib/server-actions";
import { toast } from "react-toastify";
import { Constants } from "@/constant";
import { SuperAdminTypes } from "@/types";
import { WebComponents } from "@/components";

// Parse phone number to extract country code and number
const parsePhoneNumber = (phone: string | undefined): { countryCode: string; phoneNumber: string } => {
  if (!phone) return { countryCode: "+1", phoneNumber: "" };

  // Try to extract country code (common patterns: +1, +44, etc.)
  const phoneRegex = /^(\+\d{1,4})\s*(.+)$/;
  const phoneMatch = phoneRegex.exec(phone);
  if (phoneMatch) {
    return { countryCode: phoneMatch[1], phoneNumber: phoneMatch[2] };
  }
  // If phone starts with + but no space, try to find the code
  if (phone.startsWith("+")) {
    // Common country code lengths: 1-4 digits after +
    const codeRegex = /^(\+\d{1,4})(\d+)$/;
    const codeMatch = codeRegex.exec(phone);
    if (codeMatch) {
      return { countryCode: codeMatch[1], phoneNumber: codeMatch[2] };
    }
  }
  // Default: assume US/Canada (+1) if no code found
  return { countryCode: "+1", phoneNumber: phone };
};

export default function Signup({
  initialBusinessCategories,
}: {
  readonly initialBusinessCategories: SuperAdminTypes.BusinessCategoryTypes.BusinessCategory[];
}) {
  const [form, setForm] = React.useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    businessName: "",
    businessCategory: "",
  });

  const [countryCode, setCountryCode] = React.useState("+1");
  const [phoneNumber, setPhoneNumber] = React.useState("");


  const [businessCategories, setBusinessCategories] = React.useState<SuperAdminTypes.BusinessCategoryTypes.BusinessCategory[]>(initialBusinessCategories);

  // Filter only active categories
  const activeCategories = businessCategories.filter(cat => cat.isActive);
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [passwordError, setPasswordError] = React.useState("");
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));

    // Clear password error when user starts typing
    if (name === "confirmPassword" || name === "password") {
      setPasswordError("");
    }
  };

  const handleSignup = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // Combine country code and phone number
    const fullPhone = `${countryCode} ${phoneNumber}`.trim();

    // Validate required fields
    if (!form.name || !form.email || !form.password || !form.confirmPassword || !phoneNumber || !form.businessName || !form.businessCategory) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Validate business category is selected
    if (!form.businessCategory || form.businessCategory === "") {
      toast.error("Please select a business category");
      return;
    }

    // Validate password match
    if (form.password !== form.confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    // Validate password strength
    if (form.password.length < 6) {
      setPasswordError("Password must be at least 6 characters long");
      return;
    }

    setPasswordError("");
    setIsLoading(true);

    try {
      const result = await signupAction({
        name: form.name,
        email: form.email,
        password: form.password,
        phone: fullPhone,
        businessName: form.businessName,
        businessCategory: form.businessCategory,
      });

      if (result.success) {
        // Signup successful
        toast.success("Account created successfully! Redirecting to login...");
        // Show success message and redirect
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        // Handle error from server action
        toast.error(result.error || "Signup failed. Please try again.");
      }
    } catch (error: unknown) {
      console.error("Signup error:", error);
      const errorMessage = error instanceof Error ? error.message : "Signup failed. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        .signup-phone-input input::placeholder {
          font-size: 0.75rem !important;
        }
      `}} />
      <div className="min-h-screen flex flex-col lg:flex-row relative bg-white dark:bg-gray-900">
      {/* Left Side: Sign-up Image - Hidden on mobile and tablet, visible only on desktop */}
      <div className="hidden lg:flex w-full lg:w-[40%] flex-col items-center justify-center lg:ml-10">
        <Image
          src={Constants.assetsIcon.assets.signup}
          alt="Sign Up Page Image"
          width={700}
          height={100}
          style={{ width: "100%", maxWidth: "700px", height: "auto", maxHeight: "700px", objectFit: "contain", borderRadius: "20px" }}
        />
      </div>

      {/* Right Side: Signup Form - Full width on mobile, adjusted on larger screens */}
      <div className="w-full lg:w-[70%] flex flex-col justify-center items-center p-3 sm:p-4 lg:p-4">
        <div className="w-full max-w-sm sm:max-w-none md:max-w-none lg:max-w-md rounded-xl">
          {/* Heading */}
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold font-poppins text-center text-textMain dark:text-white mb-2 sm:mb-3">
            Create your account
          </h2>

          {/* Form */}
          <form onSubmit={handleSignup} className="mt-3 sm:mt-4 lg:mt-6" role="form">
            {/* Name */}
            <div className="mb-2 sm:mb-3">
              <label htmlFor="name" className="block mb-1 text-sm font-medium text-textMain dark:text-gray-300 font-poppins">
                Name<span className="text-required">*</span>
              </label>
              <input
                id="name"
                type="text"
                name="name"
                placeholder="eg John"
                value={form.name}
                onChange={handleChange}
                className="w-full border border-border dark:border-gray-600 rounded-md px-3 py-2 outline-none focus:ring-1 focus:ring-primary font-interTight text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                required
              />
            </div>

            {/* Email | Phone Number */}
            <div className="mb-2 sm:mb-3 grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label htmlFor="email" className="block mb-1 text-sm font-medium text-textMain dark:text-gray-300 font-poppins">
                  Email<span className="text-required">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="Enter your email address"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full border border-border dark:border-gray-600 rounded-md px-3 py-2 outline-none focus:ring-1 focus:ring-primary font-interTight text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  required
                />
              </div>
              <div>
                <label htmlFor="phone" className="block mb-1 text-sm font-medium text-textMain dark:text-gray-300 font-poppins">
                  Phone Number<span className="text-required">*</span>
                </label>
                <div className="signup-phone-input">
                  <WebComponents.UiComponents.UiWebComponents.PhoneInputWithCountryCode
                    countryCode={countryCode}
                    phoneNumber={phoneNumber}
                    onCountryCodeChange={setCountryCode}
                    onPhoneNumberChange={setPhoneNumber}
                  />
                </div>
              </div>
            </div>

            {/* Business Name */}
            <div className="mb-2 sm:mb-3">
              <label htmlFor="businessName" className="block mb-1 text-sm font-medium text-textMain dark:text-gray-300 font-poppins">
                Business Name<span className="text-required">*</span>
              </label>
              <input
                id="businessName"
                type="text"
                name="businessName"
                placeholder="Business Name"
                value={form.businessName}
                onChange={handleChange}
                className="w-full border border-border dark:border-gray-600 rounded-md px-3 py-2 outline-none focus:ring-1 focus:ring-primary font-interTight text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                required
              />
            </div>

            {/* Business Category */}
            <div className="mb-2 sm:mb-3">
              <label htmlFor="businessCategory" className="block mb-1 text-sm font-medium text-textMain dark:text-gray-300 font-poppins">
                Business Category<span className="text-required">*</span>
              </label>
              <select
                id="businessCategory"
                name="businessCategory"
                value={form.businessCategory}
                onChange={handleChange}
                className="w-full border border-border dark:border-gray-600 rounded-md px-3 py-2 outline-none focus:ring-1 focus:ring-primary font-interTight text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                required
              >
                <option value="">Select Business Category</option>
                {activeCategories.length > 0 && activeCategories.map((cat) => (
                  <option key={cat._id} value={cat._id} className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                    {cat.categoryName}
                  </option>
                ))}
              </select>
              {activeCategories.length > 0 && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{activeCategories.length} categories available</p>
              )}
              {activeCategories.length === 0 && (
                <p className="text-xs text-required mt-1">No business categories available</p>
              )}
            </div>

            {/* Password */}
            <div className="mb-2 sm:mb-3 relative">
              <label htmlFor="password" className="block mb-1 text-sm font-medium text-textMain dark:text-gray-300 font-poppins">
                Password<span className="text-required">*</span>
              </label>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                className="w-full border border-border dark:border-gray-600 rounded-md px-3 py-2 pr-10 outline-none focus:ring-1 focus:ring-primary font-interTight text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 pt-5"
              >
                {showPassword ? (
                  <Eye className="h-4 w-4 text-[#6e8192] dark:text-gray-400 font-interTight" />
                ) : (
                  <EyeOff className="h-4 w-4 text-[#6e8192] dark:text-gray-400 font-interTight" />
                )}
              </button>
            </div>

            {/* Re-enter Password */}
            <div className="mb-3 sm:mb-4 relative">
              <label htmlFor="confirmPassword" className="block mb-1 text-sm font-medium text-textMain dark:text-gray-300 font-poppins">
                Re-enter Password<span className="text-required">*</span>
              </label>
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Re-enter your password"
                value={form.confirmPassword}
                onChange={handleChange}
                className="w-full border border-border dark:border-gray-600 rounded-md px-3 py-2 pr-10 outline-none focus:ring-1 focus:ring-primary font-interTight text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 pt-5"
              >
                {showConfirmPassword ? (
                  <Eye className="h-4 w-4 text-[#6e8192] dark:text-gray-400 font-interTight" />
                ) : (
                  <EyeOff className="h-4 w-4 text-[#6e8192] dark:text-gray-400 font-interTight" />
                )}
              </button>
              {passwordError && (
                <p className="text-red-600 dark:text-red-400 text-xs mt-1">{passwordError}</p>
              )}
            </div>

            {/* Sign Up Button */}
            <button
              type="submit"
              disabled={isLoading}
              data-testid="signup-submit-button"
              className="w-full text-white font-poppins bg-primary py-2 rounded-md text-sm font-semibold hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Creating Account..." : "Sign Up"}
            </button>

            {/* Footer */}
            <p className="text-center text-sm mt-3 text-textSmall dark:text-gray-400 font-interTight">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-primary dark:text-blue-400 text-sm font-bold font-interTight hover:text-primaryHover dark:hover:text-blue-300"
              >
                Log In
              </Link>
            </p>
          </form>
        </div>
      </div>

      {/* Background Image - Responsive for all screen sizes */}
      <div className="flex flex-col items-center justify-center pointer-events-none -z-10 absolute right-0 top-0 
        lg:ml-10 
        md:right-0 md:top-0
        sm:right-0 sm:top-0">
        <Image
          src={Constants.assetsIcon.assets.signup}
          alt="Sign Up Page Background"
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
    </>
  );
}
