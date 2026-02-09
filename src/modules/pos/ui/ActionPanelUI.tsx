'use client';

import React from 'react';
import {
    Square,
    X,
    DollarSign,
    Receipt,
    Printer,
    type LucideIcon,
} from 'lucide-react';
import type { PosActionPanelConfig } from './pos-ui.config';

// Default action buttons with icons and colors
interface ActionButton {
    id: string;
    label: string;
    icon: LucideIcon;
    colorClass: string;
}

const DEFAULT_ACTION_BUTTONS: ActionButton[] = [
    { id: 'draft', label: 'Draft', icon: Square, colorClass: 'bg-orange-500 hover:bg-orange-600' },
    { id: 'cancel', label: 'Cancel', icon: X, colorClass: 'bg-red-500 hover:bg-red-600' },
    { id: 'payment', label: 'Payment', icon: DollarSign, colorClass: 'bg-teal-500 hover:bg-teal-600' },
    { id: 'recent', label: 'Recent Transaction', icon: Receipt, colorClass: 'bg-blue-600 hover:bg-blue-700' },
    { id: 'print', label: 'Print', icon: Printer, colorClass: 'bg-purple-500 hover:bg-purple-600' },
];

// Default config
const DEFAULT_CONFIG: PosActionPanelConfig = {
    show: true,
    wrapperClass: 'flex items-center gap-2 mb-4',
    buttonsContainerClass: 'flex items-center gap-2',
    buttonClass: 'flex items-center gap-2 px-4 py-2 rounded-md text-white text-sm font-medium',
    buttonIconClass: 'w-4 h-4',
};

export interface ActionPanelUIProps {
    onDraft?: () => void;
    onCancel?: () => void;
    onPayment?: () => void;
    onRecentTransaction?: () => void;
    onPrint?: () => void;
    uiConfig?: PosActionPanelConfig;
    className?: string;
    /** Custom action buttons - overrides default buttons */
    customButtons?: ActionButton[];
}

export function ActionPanelUI({
    onDraft,
    onCancel,
    onPayment,
    onRecentTransaction,
    onPrint,
    uiConfig,
    className = '',
    customButtons,
    children,
}: ActionPanelUIProps & { children?: React.ReactNode }) {
    const config = uiConfig || DEFAULT_CONFIG;

    // Don't render if show is false
    if (!config.show) {
        return null;
    }

    const buttons = customButtons || DEFAULT_ACTION_BUTTONS;

    // Map button id to handler
    const getHandler = (id: string) => {
        switch (id) {
            case 'draft': return onDraft;
            case 'cancel': return onCancel;
            case 'payment': return onPayment;
            case 'recent': return onRecentTransaction;
            case 'print': return onPrint;
            default: return undefined;
        }
    };

    return (
        <div className={`${config.wrapperClass} ${className}`}>
            <div className={config.buttonsContainerClass}>
                {buttons.map((button) => {
                    const Icon = button.icon;
                    const handler = getHandler(button.id);
                    return (
                        <button
                            key={button.id}
                            onClick={handler}
                            className={`${config.buttonClass} ${button.colorClass}`}
                        >
                            <Icon className={config.buttonIconClass} />
                            <span className={config.buttonTextClass || ''}>{button.label}</span>
                        </button>
                    );
                })}
            </div>
            {children}
        </div>
    );
}

export default ActionPanelUI;
