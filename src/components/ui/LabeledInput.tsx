import React from 'react';
import { Input } from './input';

interface LabeledInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  label: React.ReactNode;
  id?: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  className?: string;
  placeholder?: string;
}

export function LabeledInput({ label, id, value, onChange, type = 'text', required, className, placeholder, ...rest }: LabeledInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <Input
        id={id}
        value={value}
        onChange={handleChange}
        type={type}
        required={required}
        placeholder={placeholder}
        className={"mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-slate-800 dark:border-slate-600 dark:text-white " + (className || "")}
        {...rest}
      />
    </div>
  );
} 