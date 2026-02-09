'use client';

import React from 'react';
import {
    Banknote,
    CreditCard,
    Coins,
    Gift,
    Clock,
    ScanLine,
} from 'lucide-react';
import type { PaymentMethodType } from '../core/pos.types';

// Payment method configurations
const PAYMENT_METHODS = [
    { id: 'cash' as PaymentMethodType, name: 'Cash', icon: Banknote, color: 'text-green-600' },
    { id: 'card' as PaymentMethodType, name: 'Card', icon: CreditCard, color: 'text-purple-600' },
    { id: 'loyalty-points' as PaymentMethodType, name: 'Loyalty Points', icon: Coins, color: 'text-orange-600' },
    { id: 'gift-card' as PaymentMethodType, name: 'Gift Card', icon: Gift, color: 'text-pink-600' },
    { id: 'pay-later' as PaymentMethodType, name: 'Pay Later', icon: Clock, color: 'text-blue-600' },
    { id: 'scan' as PaymentMethodType, name: 'Scan', icon: ScanLine, color: 'text-cyan-600' },
];

export interface PaymentPanelUIProps {
    // Data
    grandTotal: number;
    selectedMethod: PaymentMethodType | null;
    onMethodSelect: (method: PaymentMethodType) => void;

    // Payment actions
    onPay: () => void;
    onCancel: () => void;

    // State
    isProcessing?: boolean;

    // Styling
    variant?: 'default' | 'compact' | 'horizontal';
    className?: string;
}

export function PaymentPanelUI({
    grandTotal,
    selectedMethod,
    onMethodSelect,
    onPay,
    onCancel,
    isProcessing = false,
    variant = 'default',
    className = '',
}: PaymentPanelUIProps) {
    return (
        <div className={`bg-white dark:bg-gray-800 rounded-lg p-4 ${className}`}>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                Payment Method
            </h3>

            {/* Payment Methods Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                {PAYMENT_METHODS.map((method) => {
                    const Icon = method.icon;
                    const isSelected = selectedMethod === method.id;

                    return (
                        <button
                            key={method.id}
                            onClick={() => onMethodSelect(method.id)}
                            className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${isSelected
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                                }`}
                        >
                            <Icon className={`w-6 h-6 mb-2 ${isSelected ? 'text-blue-500' : method.color}`} />
                            <span className={`text-sm font-medium ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
                                }`}>
                                {method.name}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Total and Action Buttons */}
            <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-medium text-gray-700 dark:text-gray-300">Total:</span>
                    <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        ${grandTotal.toFixed(2)}
                    </span>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-3 px-4 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onPay}
                        disabled={!selectedMethod || isProcessing}
                        className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${selectedMethod && !isProcessing
                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                : 'bg-gray-300 dark:bg-gray-500 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                            }`}
                    >
                        {isProcessing ? 'Processing...' : 'Pay Now'}
                    </button>
                </div>
            </div>
        </div>
    );
}

/**
 * Horizontal Payment Method Bar - Used in pos-3, pos-4 style
 */
export interface PaymentMethodBarUIProps {
    selectedMethod: PaymentMethodType | null;
    onMethodSelect: (method: PaymentMethodType) => void;
    className?: string;
}

export function PaymentMethodBarUI({
    selectedMethod,
    onMethodSelect,
    className = '',
}: PaymentMethodBarUIProps) {
    return (
        <div className={`flex flex-wrap gap-2 ${className}`}>
            {PAYMENT_METHODS.map((method) => {
                const Icon = method.icon;
                const isSelected = selectedMethod === method.id;

                return (
                    <button
                        key={method.id}
                        onClick={() => onMethodSelect(method.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${isSelected
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                    >
                        <Icon className="w-4 h-4" />
                        <span>{method.name}</span>
                    </button>
                );
            })}
        </div>
    );
}

export default PaymentPanelUI;
