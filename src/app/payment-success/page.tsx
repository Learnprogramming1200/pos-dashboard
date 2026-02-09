"use client";

import React from "react";
import Link from "next/link";
import { customHooks } from "@/hooks";

export default function PaymentSuccessPage() {
  const [countdown, setCountdown] = React.useState(5);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const { handlePayPalReturn } = customHooks.usePayment();

  React.useEffect(() => {
    // Check if this is a PayPal approval return
    const urlParams = new URLSearchParams(window.location.search);
    const paymentId = urlParams.get('paymentId');
    const payerId = urlParams.get('PayerID');

    if (paymentId && payerId) {
      // This is a PayPal approval return, process it
      setIsProcessing(true);
      handlePayPalReturn()
        .then(() => {
          setIsProcessing(false);
        })
        .catch((err) => {
          console.error('PayPal approval return error:', err);
          setError('Failed to process PayPal payment. Please contact support.');
          setIsProcessing(false);
        });
    } else {

      // Regular payment success, start countdown
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            window.location.href = "/dashboard";
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [handlePayPalReturn]);

  if (isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
        <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Processing Payment...
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Please wait while we finalize your PayPal payment.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
        <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-600 dark:text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Payment Error
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {error}
            </p>
          </div>
          <Link
            href="/dashboard"
            className="w-full inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
      <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-green-600 dark:text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Payment Successful!
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Your subscription has been activated successfully.
          </p>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
          <div className="text-sm text-green-800 dark:text-green-200">
            <p className="font-medium mb-1">What&apos;s next?</p>
            <ul className="text-left space-y-1">
              <li>• Your subscription is now active</li>
              <li>• You can access all plan features</li>
              <li>• You&apos;ll receive a confirmation email</li>
            </ul>
          </div>
        </div>

        <div className="space-y-4">
          <Link
            href="/dashboard"
            className="w-full inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            Go to Dashboard
          </Link>

          <p className="text-sm text-gray-500 dark:text-gray-400">
            Redirecting to dashboard in {countdown} seconds...
          </p>
        </div>
      </div>
    </div>
  );
}

