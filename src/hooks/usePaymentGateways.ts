"use client"
import { useState, useEffect } from 'react';
import { paymentGatewaysAPI } from '@/lib/api';
import { PaymentGateway, PaymentGatewaysResponse } from '@/types/payment';


export const usePaymentGateways = () => {
  const [gateways, setGateways] = useState<PaymentGateway[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGateways = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await paymentGatewaysAPI.getAll();
      const data: PaymentGatewaysResponse = response.data;

      if (data.status === 200 && data.data) {
        setGateways(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch payment gateways');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch payment gateways';
      setError(errorMessage);
      console.error('Error fetching payment gateways:', err);
    } finally {
      setLoading(false);
    }
  };

  const getGatewayByProvider = (provider: string): PaymentGateway | null => {
    return gateways.find(gateway =>
      gateway.provider === provider && gateway.enabled
    ) || null;
  };

  const getRazorpayCredentials = () => {
    const razorpayGateway = getGatewayByProvider('razorpay');
    return razorpayGateway?.publicCredentials || null;
  };

  const getPayPalCredentials = () => {
    const paypalGateway = getGatewayByProvider('paypal');
    return paypalGateway?.publicCredentials || null;
  };

  useEffect(() => {
    fetchGateways();
  }, []);

  return {
    gateways,
    loading,
    error,
    fetchGateways,
    getGatewayByProvider,
    getRazorpayCredentials,
    getPayPalCredentials,
  };
};