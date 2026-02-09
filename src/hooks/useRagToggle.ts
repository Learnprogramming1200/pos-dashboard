"use client";
import { useState, useEffect } from 'react';
import { ragAPI } from '@/lib/rag-api';

export const useRagToggle = () => {
  const [isEnabled, setIsEnabled] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const checkRagStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      const enabled = await ragAPI.getToggle();
      setIsEnabled(enabled);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check RAG status');
      setIsEnabled(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkRagStatus();
  }, []);

  return {
    isEnabled,
    loading,
    error,
    refetch: checkRagStatus
  };
};
