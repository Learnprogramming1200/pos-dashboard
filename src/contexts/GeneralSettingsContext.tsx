"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { publicAPI } from "@/lib/api";

type GeneralSettings = any; // Existing API returns mixed shapes; keep flexible for now.

interface GeneralSettingsContextValue {
  generalSettings: GeneralSettings | null;
  loading: boolean;
  error: unknown;
  refetch: () => Promise<void>;
}

const GeneralSettingsContext = createContext<GeneralSettingsContextValue | undefined>(undefined);

export function GeneralSettingsProvider({ children }: { children: React.ReactNode }) {
  const [generalSettings, setGeneralSettings] = useState<GeneralSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const fetchGeneralSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await publicAPI.getGeneralSettings();
      const data = response?.data?.data || response?.data;
      const parsed = Array.isArray(data) ? data[0] : data;
      setGeneralSettings(parsed ?? null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch only once on first mount
    fetchGeneralSettings();
  }, []);

  const value = useMemo(
    () => ({
      generalSettings,
      loading,
      error,
      refetch: fetchGeneralSettings,
    }),
    [generalSettings, loading, error]
  );

  return <GeneralSettingsContext.Provider value={value}>{children}</GeneralSettingsContext.Provider>;
}

export function useGeneralSettings() {
  const ctx = useContext(GeneralSettingsContext);
  if (!ctx) {
    throw new Error("useGeneralSettings must be used within GeneralSettingsProvider");
  }
  return ctx;
}

