"use client";

import React from 'react';
import { WebComponents } from '@/components';
import { settingsTypes } from '@/types';

interface PaymentMethodCardProps {
    method: any;
    provider: any;
    config: settingsTypes.PaymentConfig;
    onChange: (provider: string, field: string, value: any) => void;
    onToggle: (provider: string) => void;
}

export function PaymentMethodCard({
    method,
    provider,
    config,
    onChange,
    onToggle,
}: PaymentMethodCardProps) {
    const isActive = config.enabled;

    const handleFieldChange = (fieldName: string, value: string) => {
        onChange(config.provider, fieldName, value);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{method.name}</span>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{method.description}</p>
                </div>
                <WebComponents.UiComponents.UiWebComponents.Switch
                    checked={isActive}
                    onCheckedChange={() => onToggle(config.provider)}
                />
            </div>

            {isActive && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    {provider.requiredFields.map((fieldName: string) => {
                        const isSensitive = (provider.sensitiveFields as string[]).includes(fieldName);
                        const fieldValue = config.credentials[fieldName as keyof typeof config.credentials] || '';

                        return (
                            <div key={fieldName} className="space-y-1.5">
                                <WebComponents.UiComponents.UiWebComponents.FormLabel>
                                    {fieldName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                    <span className="text-red-500">*</span>
                                </WebComponents.UiComponents.UiWebComponents.FormLabel>
                                <WebComponents.UiComponents.UiWebComponents.FormInput
                                    type={isSensitive ? "password" : "text"}
                                    value={fieldValue as string}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFieldChange(fieldName, e.target.value)}
                                    placeholder={`Enter ${fieldName.replace(/([A-Z])/g, ' $1').toLowerCase()}`}
                                />
                                {isSensitive && (
                                    <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                                        This field contains sensitive information
                                    </p>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
