"use client"
import { useState } from 'react';
import { userPaymentAPI } from '@/lib/api';
import { PayPalOptions, PayPalSuccessDetails, PayPalPaymentData } from '@/types/paypal';
import { PaymentData } from '@/types/payment';


export const usePayPalPayment = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [payPalData, setPayPalData] = useState<PayPalPaymentData | null>(null);

  const initializePayment = async (paymentData: PaymentData) => {
    setLoading(true);
    setError(null);

    try {
      const subscriptionId = paymentData.subscriptionId;

      if (!subscriptionId) {
        throw new Error('Subscription ID is required. Please go back to the landing page and try again.');
      }

      // Step 1: Create payment with backend API to get approval URL
      const paymentResponse = await userPaymentAPI.createPayment({
        subscriptionId: paymentData.subscriptionId,
        paymentProvider: paymentData.paymentProvider,
        currencyId: paymentData.currencyId,
      });

      const responseData = paymentResponse.data.data;

      if (!responseData) {
        throw new Error('Invalid response structure from payment API');
      }

      const paymentId = responseData.paymentId;
      const approvalUrl = responseData.providerData?.approvalUrl;

      if (!paymentId) {
        console.error('No payment ID found in response. Available fields:', Object.keys(responseData));
        throw new Error('Payment ID not received from backend. Please try again.');
      }

      if (!approvalUrl) {
        console.error('No approval URL found in PayPal response. Available fields:', Object.keys(responseData.providerData || {}));
        throw new Error('PayPal approval URL not received from backend. Please try again.');
      }

      // Store payment data for later use
      setPayPalData({
        amount: responseData.amount / 100, // Convert from paise to currency units
        currency: responseData.currency || 'USD',
        clientId: paymentData.gatewayCredentials?.clientId || 'AVWcpfi4dgZWzvQRMn0LqId1zdvR31geNtwhhNTpmH6YQ6uzfTYpY1telJ_8KpiUpQIpnUBTouehJi0X',
        paymentId: paymentId,
        subscriptionId: subscriptionId,
        currencyId: paymentData.currencyId,
      });

      // Step 2: Open PayPal in new tab with return URL

      const returnUrl = `${window.location.origin}/paypal-return`;
      const paypalUrl = `${approvalUrl}&return_url=${encodeURIComponent(returnUrl)}`;

      // Store payment ID in localStorage for return page
      localStorage.setItem('paypal_payment_id', paymentId);

      // Open PayPal in new tab
      window.open(paypalUrl, '_blank');

    } catch (error: unknown) {
      console.error('PayPal payment initialization error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to initialize PayPal payment';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handle PayPal return from approval URL
  const handlePayPalReturn = async () => {
    try {
      // 3. Handle PayPal return (in your success page)
      const urlParams = new URLSearchParams(window.location.search);
      const payerId = urlParams.get('PayerID');
      const paymentId = urlParams.get('paymentId');

      if (!payerId) {
        throw new Error('Missing PayerID in PayPal return URL');
      }

      // Get paymentId from stored data or URL
      const finalPaymentId = paymentId || payPalData?.paymentId;

      if (!finalPaymentId) {
        throw new Error('Payment ID not found');
      }

      // 4. Finalize payment
      const finalizeData = {
        paymentId: finalPaymentId,
        payerId: payerId,
      };

      await userPaymentAPI.finalizePayment(finalizeData);

      // Redirect to success page
      window.location.href = '/payment-success';
    } catch (error) {
      console.error('Error finalizing PayPal payment:', error);
      setError('PayPal payment approval successful but finalization failed. Please contact support.');
    }
  };


  const handlePayPalSuccess = async (details: PayPalSuccessDetails) => {
    try {
      if (!payPalData) {
        throw new Error('PayPal payment data is missing');
      }

      setLoading(true);

      // 1. Create payment with backend API
      const paymentResponse = await userPaymentAPI.createPayment({
        subscriptionId: payPalData.subscriptionId,
        paymentProvider: 'paypal',
        currencyId: payPalData.currencyId || 'USD',
      });

      const responseData = paymentResponse.data.data;

      if (!responseData) {
        throw new Error('Invalid response structure from payment API');
      }

      const paymentId = responseData.paymentId;

      if (!paymentId) {
        throw new Error('Payment ID not received from backend');
      }

      // 2. Finalize the payment with PayPal-specific payload format
      const finalizeData = {
        paymentId: paymentId,
        payerId: details.payer?.payer_id || details.id, // Use payer ID or payment ID as fallback
      };

      await userPaymentAPI.finalizePayment(finalizeData);

      // Redirect to success page
      window.location.href = '/payment-success';
    } catch (error) {
      console.error('Error finalizing PayPal payment:', error);
      setError('PayPal payment successful but finalization failed. Please contact support.');
    } finally {
      setLoading(false);
    }
  };

  const handlePayPalError = (error: any) => {
    console.error('PayPal Payment Error:', error);
    setError('PayPal payment failed. Please try again.');
  };

  const handlePayPalCancel = () => {
    setError('Payment was cancelled');
  };

  const clearPayPalData = () => {
    setPayPalData(null);
    setError(null);
  };

  return {
    initializePayment,
    handlePayPalReturn,
    handlePayPalSuccess,
    handlePayPalError,
    handlePayPalCancel,
    clearPayPalData,
    payPalData,
    loading,
    error,
  };
};
