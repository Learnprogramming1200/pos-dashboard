"use client"
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Advertisement } from '@/types/superadmin/Advertisement';



export const useAdvertisements = () => {
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAdvertisements = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/advertisements');

      // Handle the API response structure
      const adsData = response.data?.data || response.data || [];

      setAdvertisements(Array.isArray(adsData) ? adsData : []);
    } catch (err) {
      setError('Failed to fetch advertisements');
      console.error('Error fetching advertisements:', err);
      setAdvertisements([]);
    } finally {
      setLoading(false);
    }
  };

  const getAdsByPlacement = (placement: string) => {
    if (!Array.isArray(advertisements)) return [];
    return advertisements.filter(ad => ad.placement === placement && ad.status);
  };

  const getAdsByPlacementAndPosition = (placement: string, position: 'Left' | 'Right' | 'Center') => {
    if (!Array.isArray(advertisements)) return [];
    return advertisements.filter(ad =>
      ad.placement === placement &&
      ad.position === position &&
      ad.status
    );
  };

  const incrementViewCount = async (adId: string) => {
    try {
      // You can implement view count increment API call here if needed
    } catch (err) {
      console.error('Error incrementing view count:', err);
    }
  };

  const incrementClickCount = async (adId: string) => {
    try {
      // You can implement click count increment API call here if needed
    } catch (err) {
      console.error('Error incrementing click count:', err);
    }
  };

  useEffect(() => {
    fetchAdvertisements();
  }, []);

  return {
    advertisements,
    loading,
    error,
    fetchAdvertisements,
    getAdsByPlacement,
    getAdsByPlacementAndPosition,
    incrementViewCount,
    incrementClickCount
  };
};
