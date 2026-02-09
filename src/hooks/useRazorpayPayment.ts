"use client"
import { useState } from 'react';
import { userPaymentAPI } from '@/lib/api';
import { RazorpayOptions, RazorpayResponse } from '@/types/razorpay';
import { env } from '@/lib/env';
import { PaymentData } from '@/types/payment';

  
export const useRazorpayPayment = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initializePayment = async (paymentData: PaymentData) => {

    setLoading(true);
    setError(null);

    try {
      // Use the subscriptionId passed from the component (already created on landing page)
      const subscriptionId = paymentData.subscriptionId;

      if (!subscriptionId) {
        throw new Error('Subscription ID is required. Please go back to the landing page and try again.');
      }

      const paymentResponse = await userPaymentAPI.createPayment({
        subscriptionId: paymentData.subscriptionId,
        paymentProvider: paymentData.paymentProvider,
        currencyId: paymentData.currencyId,
      });

      // Handle new API response structure
      const responseData = paymentResponse.data.data;

      if (!responseData) {
        throw new Error('Invalid response structure from payment API');
      }

      // Extract payment ID
      const paymentId = responseData.paymentId;

      if (!paymentId) {
        console.error('No payment ID found in response. Available fields:', Object.keys(responseData));
        throw new Error('Payment ID not received from backend. Please try again.');
      }

      // Extract Razorpay order ID
      const razorpayOrderId = responseData.orderId;

      if (!razorpayOrderId) {
        console.error('No Razorpay order ID found in response');
        throw new Error('Razorpay order ID not received from backend. Please try again.');
      }
      // Get Razorpay key from gateway credentials or fallback to response or env
      const razorpayKey = paymentData.gatewayCredentials?.key_id ||
        responseData.publicKey ||
        env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

      // Validate required parameters
      if (!razorpayKey) {
        throw new Error('Razorpay key is not configured. Please configure Razorpay credentials in payment gateway settings or set NEXT_PUBLIC_RAZORPAY_KEY_ID in your environment variables.');
      }
      // Initialize Razorpay
      const options: RazorpayOptions = {
        key: razorpayKey, // Use publicKey from response or fallback to env
        amount: responseData.amount, // Amount is already in paise from the API
        currency: responseData.currency || 'INR',
        name: 'POS Dashboard',
        description: `Subscription Payment`,
        order_id: razorpayOrderId, // Use the actual Razorpay order ID
        // Add notes for payment tracking
        notes: {
          subscriptionId: subscriptionId,
        },
        handler: async (response: RazorpayResponse) => {
          try {
            // Finalize payment using the dedicated endpoint
            const finalizeData = {
              paymentId: paymentId, // Use the stored payment ID
              providerPaymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            };


            await userPaymentAPI.finalizePayment(finalizeData);
            // Redirect to success page
            window.location.href = '/payment-success';
          } catch (error) {
            console.error('Error finalizing payment:', error);
            setError('Payment successful but finalization failed. Please contact support.');
          }
        },
        modal: {
          ondismiss: () => {
            // Redirect to failure page when modal is dismissed
            window.location.href = '/payment-failed?error=Payment was cancelled';
          }
        },
        prefill: {
          name: responseData.providerData?.rawResponse?.notes?.userName || '',
          email: responseData.providerData?.rawResponse?.notes?.userEmail || '',
          contact: responseData.providerData?.rawResponse?.notes?.userPhone || '',
        },
        theme: {
          color: '#3B82F6',
        },
      };

      // Check if Razorpay key is configured
      if (!razorpayKey) {
        setError('Razorpay key is not configured. Please configure Razorpay credentials in payment gateway settings or set NEXT_PUBLIC_RAZORPAY_KEY_ID in your environment variables.');
        return;
      }

      // Load Razorpay script dynamically
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        try {

          const rzp = new window.Razorpay(options);

          rzp.open();
        } catch (error) {
          console.error('Razorpay initialization error:', error);
          setError('Failed to initialize Razorpay payment. Please check your configuration.');
        }
      };
      script.onerror = (error) => {
        console.error('Failed to load Razorpay script:', error);
        setError('Failed to load Razorpay. Please check your internet connection and try again.');
      };
      document.body.appendChild(script);

    } catch (error: unknown) {
      console.error('Payment initialization error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to initialize payment';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    initializePayment,
    loading,
    error,
  };
};
