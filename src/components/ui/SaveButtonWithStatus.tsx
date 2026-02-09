import React from 'react';
import { Button } from './button';

interface SaveButtonWithStatusProps {
  onClick: () => void;
  children: React.ReactNode;
  showStatus: boolean;
  className?: string;
  disabled?: boolean;
}

export function SaveButtonWithStatus({ onClick, children, showStatus, className, disabled = false }: SaveButtonWithStatusProps) {
  return (
    <div>
      <Button onClick={onClick} className={className} disabled={disabled}>
        {children}
      </Button>
      {showStatus && <p className="text-green-600 text-sm mt-2">Changes saved</p>}
    </div>
  );
} 