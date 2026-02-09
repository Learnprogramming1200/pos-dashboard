"use client";

import { X } from "lucide-react";
import React from "react";

interface DetailsModalLayoutProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  statusLabel?: string;
  statusColor?: "active" | "inactive" | "pending";
  onClose: () => void;
  children: React.ReactNode;
}

const DetailsModalLayout = ({
  title,
  subtitle,
  icon,
  statusLabel,
  statusColor,
  onClose,
  children,
}: DetailsModalLayoutProps) => {
  return (
    <div className="fixed inset-0 bg-gray-900/60 dark:bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">

      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-200 dark:border-gray-700">

        {/* Header */}
        <div className="relative bg-gradient-to-r from-primary to-primaryHover p-5 text-white">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 text-white/80 hover:text-white hover:bg-white/10 rounded-lg p-2 transition-all"
            aria-label="Close modal"
          >
            <X size={24} />
          </button>

          <div className="flex items-center gap-4">
            {icon}
            <div>
              <h2 className="text-3xl font-bold mb-1 text-white">{title}</h2>
              {subtitle && (
                <p className="text-white/80 text-sm">{subtitle}</p>
              )}
            </div>
          </div>
        </div>

        {/* Status badge */}
        {statusLabel && (
          <div className="px-8 -mt-4 relative z-10">
            <div className="inline-flex items-center gap-2 bg-white dark:bg-gray-800 rounded-full px-5 py-1 shadow-lg border border-gray-100 dark:border-gray-700">
              <div
                className={`w-2.5 h-2.5 rounded-full ${statusColor === "active"
                  ? "bg-emerald-500 dark:bg-emerald-400 animate-pulse"
                  : statusColor === "pending"
                    ? "bg-amber-500 dark:bg-amber-400"
                    : "bg-gray-400 dark:bg-gray-500"
                  }`}
              />
              <span
                className={`font-semibold text-sm ${statusColor === "active"
                  ? "text-emerald-700 dark:text-emerald-400"
                  : statusColor === "pending"
                    ? "text-amber-700 dark:text-amber-400"
                    : "text-gray-600 dark:text-gray-400"
                  }`}
              >
                {statusLabel}
              </span>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-8 pt-4 overflow-y-auto max-h-[calc(90vh-200px)]">
          {children}
        </div>
      </div>
    </div>
  );
};

export default DetailsModalLayout;
