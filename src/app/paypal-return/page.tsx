"use client";

import React from "react";
import { useRouter } from "next/navigation";

export default function PayPalReturnPage() {
  const [status, setStatus] = React.useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = React.useState('Processing PayPal payment...');
  const router = useRouter();

  React.useEffect(() => {
    const processPayPalReturn = async () => {
      try {
        // Extract URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const payerId = urlParams.get('PayerID');
        const token = urlParams.get('token');
        const paymentId = urlParams.get('paymentId');

        if (!payerId || !token) {
          throw new Error('Missing required PayPal parameters');
        }

        // Get payment ID from localStorage (set by parent window)
        const storedPaymentId = localStorage.getItem('paypal_payment_id');
        
        if (!storedPaymentId) {
          throw new Error('Payment ID not found in localStorage');
        }

        // Call the finalization API directly
        const finalizeData = {
          paymentId: paymentId || storedPaymentId,
          payerId,
          token
        };

        // Import the API function dynamically to avoid SSR issues
        const { userPaymentAPI } = await import('@/lib/api');
        
        await userPaymentAPI.finalizePayment(finalizeData);
        
        // Clean up localStorage
        localStorage.removeItem('paypal_payment_id');
        
        setStatus('success');
        setMessage('Payment completed successfully! Redirecting...');
        
        // Redirect to success page after a short delay
        setTimeout(() => {
          router.push('/payment-success');
        }, 2000);

      } catch (error) {
        console.error('PayPal return processing error:', error);
        
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        
        setStatus('error');
        setMessage(`Error: ${errorMessage}`);
        
        // Redirect to error page or back to payment page after showing error
        setTimeout(() => {
          router.push('/#pricing');
        }, 3000);
      }
    };

    // Process the return immediately
    processPayPalReturn();
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <div className="mb-6">
          {status === 'processing' && (
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          )}
          {status === 'success' && (
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto">
              <span className="text-white text-2xl">✓</span>
            </div>
          )}
          {status === 'error' && (
            <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mx-auto">
              <span className="text-white text-2xl">✗</span>
            </div>
          )}
        </div>
        
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          {status === 'processing' && 'Processing Payment...'}
          {status === 'success' && 'Payment Successful!'}
          {status === 'error' && 'Payment Error'}
        </h2>
        
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {message}
        </p>
        
        {status === 'processing' && (
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Please wait while we process your PayPal payment...
          </div>
        )}
        
        {status === 'success' && (
          <div className="text-sm text-green-600 dark:text-green-400">
            Your payment has been processed successfully. Redirecting to dashboard...
          </div>
        )}
        
        {status === 'error' && (
          <div className="text-sm text-red-600 dark:text-red-400">
            There was an error processing your payment. Redirecting to pricing page...
          </div>
        )}
        
        <div className="mt-6">
          <button
            onClick={() => router.push('/#pricing')}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
          >
            Back to Pricing
          </button>
        </div>
      </div>
    </div>
  );
}
