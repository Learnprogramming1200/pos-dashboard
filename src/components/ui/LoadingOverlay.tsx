"use client";

import React from "react";
import { Loader2 } from "lucide-react";

interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ 
  isVisible, 
  message = "Generating Invoice PDF..." 
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm transition-all duration-300">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl flex flex-col items-center gap-4 max-w-[300px] w-full animate-in fade-in zoom-in duration-300">
        <div className="relative">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
          <div className="absolute inset-0 bg-blue-500/10 blur-xl rounded-full"></div>
        </div>
        
        <div className="flex flex-col items-center gap-1">
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium text-center animate-pulse">
            {message}
          </p>
        </div>       
      </div>
    </div>
  );
};

export default LoadingOverlay;
