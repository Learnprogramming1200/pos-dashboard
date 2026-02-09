"use client";

import React from "react";

export default function PayPalPopupReturnPage() {
  const [status, setStatus] = React.useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = React.useState('Processing PayPal payment...');

  React.useEffect(() => {
    const processPayPalReturn = () => {
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

        // Send success message to parent window
        const successData = {
          type: 'PAYPAL_PAYMENT_SUCCESS',
          data: {
            payerId,
            token,
            paymentId: paymentId || storedPaymentId
          }
        };

        // Send message to parent window
        if (window.opener) {
          window.opener.postMessage(successData, window.location.origin);
          setStatus('success');
          setMessage('Payment approved! Closing window...');
          
          // Close popup after a short delay
          setTimeout(() => {
            window.close();
          }, 2000);
        } else {
          throw new Error('Parent window not found');
        }

      } catch (error) {
        console.error('PayPal return processing error:', error);
        
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        
        // Send error message to parent window
        const errorData = {
          type: 'PAYPAL_PAYMENT_ERROR',
          message: errorMessage
        };

        if (window.opener) {
          window.opener.postMessage(errorData, window.location.origin);
        }
        
        setStatus('error');
        setMessage(`Error: ${errorMessage}`);
        
        // Close popup after showing error
        setTimeout(() => {
          window.close();
        }, 3000);
      }
    };

    // Process the return immediately
    processPayPalReturn();
  }, []);

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
          {status === 'success' && 'Payment Approved!'}
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
            Your payment has been approved. This window will close automatically.
          </div>
        )}
        
        {status === 'error' && (
          <div className="text-sm text-red-600 dark:text-red-400">
            There was an error processing your payment. This window will close automatically.
          </div>
        )}
      </div>
    </div>
  );
}
