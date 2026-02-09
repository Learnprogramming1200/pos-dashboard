"use client";
import React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { BsArrowLeft } from "react-icons/bs";
import { authAPI } from "@/lib/api";
import { Constants } from "@/constant";
import { toast } from "react-toastify";

export default function EnterEmail() {
  const [email, setEmail] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const router = useRouter();

  const handleGetOTP = async () => {
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    if (!email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsLoading(true);

    try {
      const response = await authAPI.forgotPassword(email);

      if (response.status === 200 || response.status === 201) {
        // OTP sent successfully
        toast.success("OTP sent successfully!");
        router.push(`/forgot-password/otp?email=${encodeURIComponent(email)}`);
      } else {
        throw new Error("Failed to send OTP");
      }
    } catch (error: unknown) {
      console.error("Forgot password error:", error);

      // Handle specific error responses from the backend
      if (error && typeof error === 'object' && 'response' in error) {
        const errorResponse = error as { response: { status: number; data: { message?: string } } };
        const { data } = errorResponse.response;

        if (data?.message) {
          // Use the message from the backend response
          toast.error(data.message);
        } else {
          toast.error("Failed to send OTP. Please try again.");
        }
      } else {
        const errorMessage = error instanceof Error ? error.message : "Failed to send OTP. Please try again.";
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    router.push("/login");
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row relative bg-white dark:bg-gray-900">
      {/* Left Side: Enter Email Image - Hidden on mobile and tablet, visible only on desktop */}
      <div className="hidden lg:flex w-full lg:w-[40%] flex-col items-center justify-center lg:ml-10">
        <Image
          src={Constants.assetsIcon.assets.enterEmail}
          alt="Enter Email Page Image"
          width={700}
          height={100}
          style={{ width: "100%", maxWidth: "700px", height: "auto", maxHeight: "700px", objectFit: "contain", borderRadius: "20px" }}
        />
      </div>

      {/* Right Side: Forgot Password Form - Full width on mobile, adjusted on larger screens */}
      <div className="w-full lg:w-[70%] flex flex-col justify-center items-center p-4 sm:p-6 lg:p-4">
        <div className="w-full max-w-sm sm:max-w-none md:max-w-none lg:max-w-md rounded-xl">

          {/* Heading */}
          <h2 className="text-xl sm:text-xl md:text-4xl font-bold text-center text-textMain dark:text-white font-poppins mb-4 sm:mb-6">
            Forgot Password?
          </h2>
          <p className="text-center text-textSmall dark:text-gray-400 mb-12 font-interTight text-lg">
            Enter your email address and we&apos;ll send you a verification code to reset your password.
          </p>

          {/* Form */}
          <div className="mb-10">
            <label className="block text-sm font-medium mb-3 text-textMain dark:text-gray-300 font-poppins">
              Email<span className="text-required">*</span>
            </label>
            <input
              type="email"
              placeholder="Enter Registered Email Id"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
              }}
              className="w-full border border-border dark:border-gray-600 rounded-md px-3 sm:px-4 py-2 sm:py-3 outline-none focus:ring-1 focus:ring-primary font-interTight text-sm sm:text-base bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>

          {/* Submit Button */}
          <button
            onClick={handleGetOTP}
            disabled={isLoading}
            className="w-full text-white font-poppins bg-primary py-2 sm:py-[10px] sm:px-[24px] rounded-md text-base sm:text-base font-semibold hover:bg-primaryHover transition disabled:opacity-50 disabled:cursor-not-allowed mb-6"
          >
            {isLoading ? "Sending OTP..." : "Get OTP"}
          </button>

          {/* Footer */}
          <div className="flex justify-center mt-6">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-primary dark:text-blue-400 text-sm sm:text-base font-bold font-interTight hover:opacity-80 transition-opacity"
            >
              <BsArrowLeft className="h-5 w-5 text-primary dark:text-blue-400" />
              <p className="font-interTight font-semibold text-base">Back to Login Page</p>
            </button>
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
          alt="Background Image"
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