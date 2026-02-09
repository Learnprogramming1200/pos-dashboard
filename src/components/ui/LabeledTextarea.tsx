import React from 'react';

interface LabeledTextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'value' | 'onChange'> {
  label: React.ReactNode;
  id?: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  required?: boolean;
  className?: string;
  placeholder?: string;
}

export function LabeledTextarea({ label, id, value, onChange, rows, required, className, placeholder, ...rest }: LabeledTextareaProps) {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <textarea
        id={id}
        value={value}
        onChange={handleChange}
        rows={rows}
        required={required}
        placeholder={placeholder}
        className={"mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-slate-800 dark:border-slate-600 dark:text-white " + (className || "")}
        {...rest}
      />
    </div>
  );
} 