"use client"
import React, { useState } from 'react';
import { useRazorpayPayment } from './useRazorpayPayment';
import { usePaymentGateways } from './usePaymentGateways';
import { usePayPalPayment } from './usePayPalPayment';
import PayPalPayment from '@/components/payments/PayPalPayment';
import { PaymentData } from '@/types/payment';


export const usePayment = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPayPal, setShowPayPal] = useState(false);
  const {
    getRazorpayCredentials,
    getPayPalCredentials,
    loading: gatewaysLoading,
    error: gatewaysError
  } = usePaymentGateways();

  const { initializePayment: initializeRazorpayPayment } = useRazorpayPayment();
  const {
    initializePayment: initializePayPalPayment,
    handlePayPalReturn,
    handlePayPalSuccess,
    handlePayPalError,
    handlePayPalCancel,
    clearPayPalData,
    payPalData,
    loading: payPalLoading,
    error: payPalError
  } = usePayPalPayment();

  const initializePayment = async (paymentData: PaymentData) => {
    setLoading(true);
    setError(null);

    try {
      let gatewayCredentials = null;

      if (paymentData.paymentProvider === 'razorpay') {
        gatewayCredentials = getRazorpayCredentials();
      } else if (paymentData.paymentProvider === 'paypal') {
        gatewayCredentials = getPayPalCredentials();
      }

      // Add gateway credentials to payment data
      const paymentDataWithCredentials = {
        ...paymentData,
        gatewayCredentials
      };

      if (paymentData.paymentProvider === 'paypal') {
        // For PayPal, use the popup approach (no component needed)
        const paypalPaymentData = {
          ...paymentDataWithCredentials,
          amount: paymentData.amount || 0,
          currency: paymentData.currency || 'USD',
        };
        await initializePayPalPayment(paypalPaymentData);
        // Don't set showPayPal to true for popup approach
        setLoading(false);
      } else {
        // For other providers (Razorpay, etc.), use the existing logic
        await initializeRazorpayPayment(paymentDataWithCredentials);
        setLoading(false);
      }
    } catch (error: unknown) {
      console.error('Payment initialization error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to initialize payment';
      setError(errorMessage);
      setLoading(false);
    }
  };

  const closePayPal = () => {
    setShowPayPal(false);
    clearPayPalData();
  };

  const PayPalComponent = showPayPal && payPalData ? React.createElement('div', {
    className: "fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4"
  }, React.createElement('div', {
    className: "bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full"
  }, React.createElement('div', {
    className: "flex justify-between items-center mb-4"
  }, React.createElement('h3', {
    className: "text-lg font-semibold text-gray-900 dark:text-white"
  }, "Complete PayPal Payment"), React.createElement('button', {
    onClick: closePayPal,
    className: "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
  }, "✕")), React.createElement('div', {
    className: "mb-4"
  }, React.createElement('p', {
    className: "text-sm text-gray-600 dark:text-gray-400"
  }, `Amount: ${payPalData.currency} ${payPalData.amount}`)), React.createElement(PayPalPayment, {
    amount: payPalData.amount,
    currency: payPalData.currency,
    clientId: payPalData.clientId,
    onSuccess: handlePayPalSuccess,
    onError: handlePayPalError,
    onCancel: handlePayPalCancel,
    description: "Subscription Payment"
  }), (error || payPalError) && React.createElement('div', {
    className: "mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
  }, React.createElement('p', {
    className: "text-sm text-red-800 dark:text-red-200"
  }, error || payPalError)))) : null;

  return {
    initializePayment,
    handlePayPalReturn,
    loading: loading || payPalLoading || gatewaysLoading,
    error: error || payPalError || gatewaysError,
    showPayPal,
    PayPalComponent,
    closePayPal,
  };
};
