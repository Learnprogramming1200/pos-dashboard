"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface DemoRequest {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  companyName: string;
  businessCategory: string;
  additionalRequirements: string;
  status: "Pending" | "Approved" | "Rejected" | "Completed";
  requestedDate: string;
  scheduledDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface DemoRequestContextType {
  demoRequests: DemoRequest[];
  addDemoRequest: (request: Omit<DemoRequest, "id" | "status" | "requestedDate" | "createdAt" | "updatedAt">) => void;
  updateDemoRequest: (id: string, request: Partial<DemoRequest>) => void;
  deleteDemoRequest: (id: string) => void;
  getDemoRequest: (id: string) => DemoRequest | undefined;
}

const DemoRequestContext = createContext<DemoRequestContextType | undefined>(undefined);

export const useDemoRequest = () => {
  const context = useContext(DemoRequestContext);
  if (!context) {
    throw new Error('useDemoRequest must be used within a DemoRequestProvider');
  }
  return context;
};

interface DemoRequestProviderProps {
  children: ReactNode;
}

export const DemoRequestProvider: React.FC<DemoRequestProviderProps> = ({ children }) => {
  const [demoRequests, setDemoRequests] = useState<DemoRequest[]>([]);

  const addDemoRequest = (request: Omit<DemoRequest, "id" | "status" | "requestedDate" | "createdAt" | "updatedAt">) => {
    const now = new Date().toISOString().split('T')[0];
    const newRequest: DemoRequest = {
      ...request,
      id: Math.random().toString(36).substr(2, 9),
      status: "Pending",
      requestedDate: now,
      createdAt: now,
      updatedAt: now,
    };
    setDemoRequests(prev => [...prev, newRequest]);
  };

  const updateDemoRequest = (id: string, request: Partial<DemoRequest>) => {
    const now = new Date().toISOString().split('T')[0];
    setDemoRequests(prev => prev.map(req =>
      req.id === id ? { ...req, ...request, updatedAt: now } : req
    ));
  };

  const deleteDemoRequest = (id: string) => {
    setDemoRequests(prev => prev.filter(req => req.id !== id));
  };

  const getDemoRequest = (id: string) => {
    return demoRequests.find(req => req.id === id);
  };

  const value: DemoRequestContextType = {
    demoRequests,
    addDemoRequest,
    updateDemoRequest,
    deleteDemoRequest,
    getDemoRequest,
  };

  return (
    <DemoRequestContext.Provider value={value}>
      {children}
    </DemoRequestContext.Provider>
  );
};
