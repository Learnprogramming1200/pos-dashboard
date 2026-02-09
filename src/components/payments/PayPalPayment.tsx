'use client';

import React from 'react';
import { payPalTypes } from '@/types';

interface PayPalPaymentProps {
  amount: number;
  currency: string;
  clientId: string;
  onSuccess: (details: payPalTypes.PayPalSuccessDetails) => void;
  onError: (error: any) => void;
  onCancel: () => void;
  description?: string;
}

const PayPalPayment: React.FC<PayPalPaymentProps> = ({
  amount,
  currency,
  clientId,
  onSuccess,
  onError,
  onCancel,
  description = 'Subscription Payment'
}) => {
  const paypalRef = React.useRef<HTMLDivElement>(null);
  const isLoaded = React.useRef(false);

  React.useEffect(() => {
    if (!clientId) {
      onError('PayPal Client ID is not configured');
      return;
    }

    if (isLoaded.current) return;
    isLoaded.current = true;

    // Load PayPal SDK
    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=${currency}`;
    script.async = true;
    
    script.onload = () => {
      if (window.paypal && paypalRef.current) {
        window.paypal.Buttons({
          style: {
            layout: 'vertical',
            color: 'blue',
            shape: 'rect',
            label: 'paypal'
          },
          createOrder: async (data: any, actions: any) => {
            // For subscription payments, we'll create a simple order
            // The actual payment processing will be handled by the backend
            return actions.order.create({
              purchase_units: [{
                amount: {
                  currency_code: currency,
                  value: amount.toFixed(2)
                },
                description: description
              }]
            });
          },
          onApprove: async (data: any, actions: any) => {
            try {
              const details = await actions.order.capture();
              onSuccess(details);
            } catch (error) {
              onError(error);
            }
          },
          onError: (error: any) => {
            onError(error);
          },
          onCancel: () => {
            onCancel();
          }
        }).render(paypalRef.current);
      }
    };

    script.onerror = (error) => {
      console.error('Failed to load PayPal SDK:', error);
      onError('Failed to load PayPal. Please check your internet connection and try again.');
    };

    document.body.appendChild(script);

    return () => {
      // Cleanup
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
      isLoaded.current = false;
    };
  }, [clientId, currency, amount, description, onSuccess, onError, onCancel]);

  return (
    <div className="w-full">
      <div ref={paypalRef} className="w-full" />
    </div>
  );
};

export default PayPalPayment;
