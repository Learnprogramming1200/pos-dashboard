import React from 'react';
import { Toggle } from './toggle';

interface LabeledToggleProps {
  label: React.ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}

export function LabeledToggle({ label, checked, onChange, className, ...rest }: LabeledToggleProps) {
  return (
    <div className={className}>
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-3">
        {label}
      </label>
      <Toggle checked={checked} onCheckedChange={onChange} {...rest} />
    </div>
  );
} 