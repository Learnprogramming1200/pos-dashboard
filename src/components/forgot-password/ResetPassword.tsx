"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";
import { authAPI } from "@/lib/api";
import { toast } from "react-toastify";
import { Constants } from "@/constant";
import { BsArrowLeft } from "react-icons/bs";

export default function ResetPassword() {
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showNewPassword, setShowNewPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const otp = searchParams.get("otp");

  const validatePassword = (password: string) => {
    if (password.length < 8) {
      return "Password must be at least 8 characters long";
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return "Password must contain at least one lowercase letter";
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return "Password must contain at least one uppercase letter";
    }
    if (!/(?=.*\d)/.test(password)) {
      return "Password must contain at least one number";
    }
    return "";
  };

  const handleResetPassword = async () => {
    // Validate new password
    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      toast.error(passwordError);
      return;
    }

    // Check if passwords match
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (!email || !otp) {
      toast.error("Missing email or OTP. Please try again.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await authAPI.resetPassword(email, otp, newPassword, confirmPassword);

      if (response.status === 200 || response.status === 201) {
        // Password reset successful
        toast.success("Password reset successfully!");
        router.push("/login");
      } else {
        throw new Error("Password reset failed");
      }
    } catch (error: unknown) {
      console.error("Reset password error:", error);

      // Handle specific error responses from the backend
      if (error && typeof error === 'object' && 'response' in error) {
        const errorResponse = error as { response: { status: number; data: { message?: string } } };
        const { data } = errorResponse.response;

        if (data?.message) {
          // Use the message from the backend response
          toast.error(data.message);
        } else {
          toast.error("Failed to reset password. Please try again.");
        }
      } else {
        const errorMessage = error instanceof Error ? error.message : "Failed to reset password. Please try again.";
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    router.push(`/forgot-password/otp?email=${encodeURIComponent(email!)}`);
  };

  if (!email || !otp) {
    router.push("/forgot-password");
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row relative bg-white dark:bg-gray-900">
      {/* Left Side: Set Password Image - Hidden on mobile and tablet, visible only on desktop */}
      <div className="hidden lg:flex w-full lg:w-[40%] flex-col items-center justify-center lg:ml-10">
        <Image
          src={Constants.assetsIcon.assets.setPassword}
          alt="Set Password Page Image"
          width={700}
          height={100}
          style={{ width: "700px", height: "700px", objectFit: "cover", borderRadius: "20px" }}
        />
      </div>

      {/* Right Side: Reset Password Form - Full width on mobile, adjusted on larger screens */}
      <div className="w-full lg:w-[70%] flex flex-col justify-center items-center p-4 sm:p-6 lg:p-4">
        <div className="w-full max-w-sm sm:max-w-none md:max-w-none lg:max-w-md rounded-xl">

          {/* Heading */}
          <h2 className="text-xl sm:text-xl md:text-4xl font-bold text-center text-textMain dark:text-white font-poppins mb-4 sm:mb-6">
            Set NewPassword
          </h2>

          {/* Description */}
          <div className="text-center mb-8">
            <p className="text-textSmall dark:text-gray-400 font-interTight text-lg mb-2 sm:text-base">
              Create a new password for your account
            </p>
          </div>

          {/* Form */}
          <div className="mt-8 sm:mt-12 lg:mt-16">

            {/* New Password */}
            <div className="mb-3 relative">
              <label htmlFor="newPassword" className="block text-sm font-medium mb-1 text-textMain dark:text-gray-300 font-poppins">
                New Password<span className="text-required">*</span>
              </label>
              <input
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                name="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full border border-border dark:border-gray-600 rounded-md px-3 sm:px-4 py-2 sm:py-3 pr-10 outline-none focus:ring-1 focus:ring-primary font-interTight text-sm sm:text-base bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                required
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute inset-y-0 right-0 pr-3 pt-6"
              >
                {showNewPassword ? (
                  <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-[#6e8192] dark:text-gray-400 font-interTight" />
                ) : (
                  <EyeOff className="h-4 w-4 sm:h-5 sm:w-5 text-[#6e8192] dark:text-gray-400 font-interTight" />
                )}
              </button>
            </div>

            {/* Confirm Password */}
            <div className="mb-10 relative">
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1 text-textMain dark:text-gray-300 font-poppins">
                Confirm Password<span className="text-required">*</span>
              </label>
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full border border-border dark:border-gray-600 rounded-md px-3 sm:px-4 py-2 sm:py-3 pr-10 outline-none focus:ring-1 focus:ring-primary font-interTight text-sm sm:text-base bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 pt-6"
              >
                {showConfirmPassword ? (
                  <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-[#6e8192] dark:text-gray-400 font-interTight" />
                ) : (
                  <EyeOff className="h-4 w-4 sm:h-5 sm:w-5 text-[#6e8192] dark:text-gray-400 font-interTight" />
                )}
              </button>
            </div>

            {/* Reset Password Button */}
            <button
              onClick={handleResetPassword}
              disabled={isLoading || !newPassword || !confirmPassword}
              className="w-full text-white font-poppins bg-primary py-2 sm:py-[10px] sm:px-[24px] rounded-md text-base sm:text-base font-semibold hover:bg-primaryHover transition disabled:opacity-50 disabled:cursor-not-allowed mb-6"
            >
              {isLoading ? "Resetting Password..." : "Reset Password"}
            </button>

            {/* Footer */}
            <div className="flex justify-center mt-4">
              <button
                onClick={handleBack}
                className="flex items-center gap-2 text-primary dark:text-blue-400 text-sm sm:text-base font-bold font-interTight hover:opacity-80 transition-opacity"
              >
                <BsArrowLeft className="h-5 w-5 text-primary dark:text-blue-400" />
                <p className="font-interTight font-semibold text-base">Back</p>
              </button>
            </div>

            {/* Password Requirements */}
            <div className="mb-6 p-4 bg-background2 dark:bg-gray-800 rounded-md">
              <h3 className="text-sm font-medium text-textMain dark:text-gray-300 font-poppins mb-2">Password Requirements:</h3>
              <ul className="text-xs text-textMain dark:text-gray-400 space-y-1 font-interTight">
                <li className={newPassword.length >= 8 ? "text-success" : ""}>
                  • At least 8 characters long
                </li>
                <li className={/(?=.*[a-z])/.test(newPassword) ? "text-success" : ""}>
                  • At least one lowercase letter
                </li>
                <li className={/(?=.*[A-Z])/.test(newPassword) ? "text-success" : ""}>
                  • At least one uppercase letter
                </li>
                <li className={/(?=.*\d)/.test(newPassword) ? "text-success" : ""}>
                  • At least one number
                </li>
              </ul>
            </div>

          </div>
        </div>
      </div>

      {/* Background Image - Responsive for all screen sizes */}
      <div className="flex flex-col items-center justify-center pointer-events-none -z-10 absolute right-0 top-0 
        lg:ml-10 
        md:right-0 md:top-0
        sm:right-0 sm:top-0
        right-0 top-0">
        <Image
          src={Constants.assetsIcon.assets.authBg}
          alt="Authentication Background"
          width={600}
          height={500}
          className="
            lg:w-[600px] lg:h-[100dvh]
            md:w-[400px] md:h-[100dvh]
            sm:w-[300px] sm:h-[100dvh]
            w-[250px] h-[100dvh]
            object-cover"
        />
      </div>
    </div>
  );
} 