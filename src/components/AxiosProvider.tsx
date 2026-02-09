"use client";

import React, { useEffect } from 'react';
import { configureAxios } from '@/lib/utils';

export default function AxiosProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Configure axios interceptors when the app loads
    configureAxios();
  }, []);

  return <>{children}</>;
} 