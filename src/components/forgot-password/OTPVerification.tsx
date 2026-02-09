"use client";
import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { BsArrowLeft } from "react-icons/bs";
import { authAPI } from "@/lib/api";
import { toast } from "react-toastify";
import { Constants } from "@/constant";

export default function OTPVerification() {
  const [otp, setOtp] = React.useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = React.useState(30);
  const [canResend, setCanResend] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

  React.useEffect(() => {
    if (!email) {
      router.push("/forgot-password");
      return;
    }

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [email, router]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async () => {
    const otpString = otp.join("");
    if (otpString.length !== 6) {
      toast.error("Please enter the complete 6-digit OTP");
      return;
    }

    setIsLoading(true);

    try {
      const response = await authAPI.verifyOTP(email!, otpString);

      if (response.status === 200 || response.status === 201) {
        // OTP verified successfully
        toast.success("OTP verified successfully!");
        router.push(
          `/forgot-password/reset?email=${encodeURIComponent(email!)}&otp=${otpString}`
        );
      } else {
        throw new Error("OTP verification failed");
      }
    } catch (error: unknown) {
      console.error("OTP verification error:", error);

      // Handle specific error responses from the backend
      if (error && typeof error === 'object' && 'response' in error) {
        const errorResponse = error as { response: { status: number; data: { message?: string } } };
        const { status, data } = errorResponse.response;

        if (status === 500 && data?.message === "Invalid OTP") {
          toast.error("Invalid OTP. Please check your code and try again.");
        } else if (data?.message) {
          // Use the message from the backend response
          toast.error(data.message);
        } else {
          toast.error("Invalid OTP. Please try again.");
        }
      } else {
        const errorMessage = error instanceof Error ? error.message : "Invalid OTP. Please try again.";
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setTimer(30);
    setCanResend(false);
    setOtp(["", "", "", "", "", ""]);

    try {
      await authAPI.forgotPassword(email!);
      toast.success("OTP resent successfully!");
      // Focus first input
      inputRefs.current[0]?.focus();
    } catch (error: unknown) {
      console.error("Resend OTP error:", error);

      // Handle specific error responses from the backend
      if (error && typeof error === 'object' && 'response' in error) {
        const errorResponse = error as { response: { status: number; data: { message?: string } } };
        const { data } = errorResponse.response;

        if (data?.message) {
          // Use the message from the backend response
          toast.error(data.message);
        } else {
          toast.error("Failed to resend OTP. Please try again.");
        }
      } else {
        const errorMessage = error instanceof Error ? error.message : "Failed to resend OTP. Please try again.";
        toast.error(errorMessage);
      }
    }
  };

  const handleBack = () => {
    router.push("/forgot-password");
  };

  if (!email) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row relative bg-white dark:bg-gray-900">
      {/* Left Side: OTP Image - Hidden on mobile and tablet, visible only on desktop */}
      <div className="hidden lg:flex w-full lg:w-[40%] flex-col items-center justify-center lg:ml-10">
        <Image
          src={Constants.assetsIcon.assets.enterOtp}
          alt="OTP Verification Image"
          width={700}
          height={100}
          style={{ width: "700px", height: "700px", objectFit: "cover", borderRadius: "20px" }}
        />
      </div>

      {/* Right Side: OTP Form - Full width on mobile, adjusted on larger screens */}
      <div className="w-full lg:w-[70%] flex flex-col justify-center items-center p-4 sm:p-6 lg:p-4">
        <div className="w-full max-w-sm sm:max-w-none md:max-w-none lg:max-w-md rounded-xl">

          {/* Heading */}
          <h2 className="text-xl sm:text-xl md:text-4xl font-bold text-center text-textMain dark:text-white font-poppins mb-4 sm:mb-6">
            Enter Verification Code
          </h2>

          {/* Description */}
          <div className="text-center mb-8">
            <p className="text-textSmall dark:text-gray-400 font-interTight text-lg mb-2 sm:text-base">
              We&apos;ve sent a 6-digit verification code to
            </p>
            <p className="text-textMain dark:text-gray-300 font-poppins font-medium text-lg sm:text-base">{email}</p>
          </div>

          {/* OTP Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-3 text-textMain dark:text-gray-300 font-poppins">
              Enter OTP<span className="text-required">*</span>
            </label>
            <div className="flex gap-3 justify-center">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    if (el) {
                      inputRefs.current[index] = el;
                    }
                  }}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-14 h-12 text-center border border-border dark:border-gray-600 rounded-sm text-xl text-textMain dark:text-white font-semibold focus:outline-none focus:bg-primary focus:text-white font-poppins bg-white dark:bg-gray-800"
                />
              ))}
            </div>
          </div>

          {/* Verify Button */}
          <button
            onClick={handleVerifyOTP}
            disabled={isLoading || otp.join("").length !== 6}
            className="w-full text-white font-poppins bg-primary py-2 sm:py-[10px] sm:px-[24px] rounded-md text-base sm:text-base font-semibold hover:bg-primaryHover transition disabled:opacity-50 disabled:cursor-not-allowed mb-6"
          >
            {isLoading ? "Verifying..." : "Verify OTP"}
          </button>

          {/* Resend OTP */}
          <div className="text-center">
            <p className="text-lg text-textSmall dark:text-gray-400 mb-2 font-interTight">
              Didn&apos;t receive the code?
            </p>
            <button
              onClick={handleResendOTP}
              disabled={!canResend}
              className="text-primary dark:text-blue-400 font-medium text-base disabled:opacity-50 disabled:cursor-not-allowed font-interTight hover:text-primaryHover dark:hover:text-blue-300"
            >
              {canResend ? "Resend OTP" : `Resend in ${timer}s`}
            </button>
          </div>

          {/* Footer */}
          <div className="flex justify-center mt-6">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-primary dark:text-blue-400 text-sm sm:text-base font-bold font-interTight hover:opacity-80 transition-opacity"
            >
              <BsArrowLeft className="h-5 w-5 text-primary dark:text-blue-400" />
              <p className="font-interTight font-semibold text-base">Back</p>
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
          alt="OTP Verification Background"
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
