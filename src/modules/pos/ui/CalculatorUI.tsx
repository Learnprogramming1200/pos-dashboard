'use client';

import React from 'react';
import { X } from 'lucide-react';
import SimpleCalculator from '@/components/ui/SimpleCalculator';

export interface CalculatorUIProps {
    isOpen: boolean;
    onClose: () => void;
    className?: string;
}

export function CalculatorUI({
    isOpen,
    onClose,
    className = '',
}: CalculatorUIProps) {
    if (!isOpen) return null;

    return (
        <div className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 ${className}`}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-auto overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-3 bg-gray-200 dark:bg-gray-700">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Calculator</span>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    </button>
                </div>

                {/* Calculator Component */}
                <div className="p-2 flex justify-center bg-gray-100 dark:bg-gray-900">
                    <SimpleCalculator />
                </div>
            </div>
        </div>
    );
}

export default CalculatorUI;
