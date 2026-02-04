"use client";
import { useState, useEffect } from 'react';
import { getShiftAll } from '@/lib/server-actions';
import { Shift } from '@/types/admin/hrm/Shift';

export const useShifts = (initialData?: any[]) => {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(!initialData || initialData.length === 0);
  const [error, setError] = useState<string | null>(null);

  // Normalizer to map API records to Shift type
  const normalizeShift = (shiftData: any): Shift => {
    return {
      _id: shiftData._id || shiftData.id || '',
      id: shiftData.id || shiftData._id || '',
      title: shiftData.title || '',
      startTime: shiftData.startTime || '',
      endTime: shiftData.endTime || '',
      breakDuration: shiftData.breakDuration || 0,
      storeId: shiftData.storeId || shiftData.branchId || '',
      storeName: shiftData.storeName || shiftData.branchName || '',
      branchId: shiftData.branchId || '',
      branchName: shiftData.branchName || '',
      weekOff: shiftData.weekOff || (shiftData.weekoff || []),
      status: shiftData.status === true ? 'Active' : shiftData.status === false ? 'Inactive' : (shiftData.status || 'Active'),
      createdAt: shiftData.createdAt || new Date().toISOString().split('T')[0],
      updatedAt: shiftData.updatedAt || new Date().toISOString().split('T')[0]
    };
  };

  const fetchShifts = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await getShiftAll();

      if (result.success && result.data) {
        const shiftsData = result.data?.data?.data ||
          result.data?.data ||
          result.data ||
          [];

        const normalizedShifts = Array.isArray(shiftsData)
          ? shiftsData.map((shift: any) => normalizeShift(shift))
          : [];

        setShifts(normalizedShifts);
      } else {
        setError(result.error || 'Failed to fetch shifts');
        setShifts([]);
      }
    } catch (err: unknown) {
      const axiosError = err as { response?: { status?: number; data?: { message?: string } } };
      const status = axiosError?.response?.status;

      if (status === 404) {
        console.warn('⚠️ Shift types endpoint not found (404). Continuing with empty shifts array.');
        setError(null); // Don't show error for 404 - shifts might not be required
        setShifts([]);
      } else {
        console.error('❌ Error fetching shifts:', err);
        setError(axiosError?.response?.data?.message || 'Failed to fetch shifts');
        setShifts([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Initialize with SSR data if provided, and sync when initialData changes (like CouponManagement.tsx pattern)
  useEffect(() => {
    if (initialData && initialData.length > 0) {
      try {
        const normalizedShifts = Array.isArray(initialData)
          ? initialData.map((shift: any) => normalizeShift(shift))
          : [];
        setShifts(normalizedShifts);
        setLoading(false);
      } catch (err) {
        console.error('❌ Error normalizing initial shifts data:', err);
        setError('Failed to process initial shifts');
        setLoading(false);
      }
    } else if (!initialData || initialData.length === 0) {
      // Fetch from API if no initial data
      fetchShifts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData]);

  const refreshShifts = () => {
    fetchShifts();
  };

  // Get active shifts only
  const getActiveShifts = () => {
    return shifts.filter(shift => shift.status === 'Active');
  };

  // Get shifts by store/branch
  const getShiftsByStore = (storeName: string) => {
    return shifts.filter(shift =>
      shift.branchName === storeName ||
      shift.branchId === storeName ||
      storeName === '' // Return all if no store specified
    );
  };

  // Get active shifts by store
  const getActiveShiftsByStore = (storeName: string) => {
    return getShiftsByStore(storeName).filter(shift => shift.status === 'Active');
  };

  return {
    shifts,
    loading,
    error,
    refreshShifts,
    getActiveShifts,
    getShiftsByStore,
    getActiveShiftsByStore
  };
};
