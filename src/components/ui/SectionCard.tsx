import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './card';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface SectionCardProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  isCollapsed?: boolean;
  onToggle?: () => void;
}

export function SectionCard({ title, subtitle, icon, children, className, isCollapsed, onToggle }: SectionCardProps) {
  return (
    <Card className={className}>
      <CardHeader 
        className={onToggle ? "cursor-pointer" : ""}
        onClick={onToggle}
      >
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon}
            <div>
              <div>{title}</div>
              {subtitle && (
                <div className="text-sm font-normal text-gray-500 dark:text-gray-400 mt-1">
                  {subtitle}
                </div>
              )}
            </div>
          </div>
          {onToggle && (
            <div className="text-gray-400">
              {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </div>
          )}
        </CardTitle>
      </CardHeader>
      {!isCollapsed && (
        <CardContent>
          {children}
        </CardContent>
      )}
    </Card>
  );
} 