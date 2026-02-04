"use client"

import React from 'react';
import { cn } from '@/lib/utils';

interface ToggleProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

const Toggle: React.FC<ToggleProps> = ({ 
  checked, 
  onCheckedChange, 
  disabled = false, 
  className 
}) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "relative inline-flex h-4 w-9 items-center rounded-full transition-colors duration-200 ease-in-out disabled:opacity-50",
        checked 
          ? "bg-green-500" 
          : "bg-gray-300",
        className
      )}
    >
      <span
        className={cn(
          "inline-block h-2 w-2 transform rounded-full bg-white shadow-lg transition-transform duration-200 ease-in-out",
          checked ? "translate-x-6" : "translate-x-1"
        )}
      />
    </button>
  );
};

export { Toggle }; 