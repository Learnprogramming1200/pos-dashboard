"use client"
import { useState, useEffect } from 'react';
import { getAllStoresAction } from '@/lib/server-actions';
import { StoreData } from '@/types/admin/Store';
  

export const useStores = () => {
  const [stores, setStores] = useState<StoreData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStores = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await getAllStoresAction();

      if (result.success && result.data) {
        const storesData = result.data?.data?.stores ||
          result.data?.data ||
          result.data ||
          [];

        setStores(Array.isArray(storesData) ? storesData : []);
      } else {
        setError(result.error || 'Failed to fetch stores');
        setStores([]);
      }
    } catch (err: unknown) {
      console.error('Error fetching stores:', err);
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to fetch stores');
      setStores([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  const refreshStores = () => {
    fetchStores();
  };

  return {
    stores,
    loading,
    error,
    refreshStores
  };
};
