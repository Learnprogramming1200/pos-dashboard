"use client";
import React, { useState } from "react";
import { Constants } from "@/constant";
import { WebComponents } from "@/components";
import { AdminTypes } from "@/types";
import { toast } from "react-toastify";

const initialData: AdminTypes.PaymentSettingsTypes.PaymentSettingTypes.AllPaymentSettings = {
    razorpay: { provider: 'razorpay', enabled: true, credentials: { secretKey: '', appKey: '' } },
    stripe: { provider: 'stripe', enabled: true, credentials: { secretKey: '', appKey: '' } },
    paystack: { provider: 'paystack', enabled: false, credentials: { secretKey: '', appKey: '' } },
    paypal: { provider: 'paypal', enabled: false, credentials: { secretKey: '', siteId: '' } },
    flutterwave: { provider: 'flutterwave', enabled: false, credentials: { secretKey: '', appKey: '' } },
    cinet: { provider: 'cinet', enabled: false, credentials: { clientApiKey: '', siteId: '', secretKey: '' } },
    sadad: { provider: 'sadad', enabled: false, credentials: { siteId: '', secretKey: '', domain: '' } },
    airtelMoney: { provider: 'airtelMoney', enabled: false, credentials: { siteId: '', secretKey: '' } },
    phonePe: { provider: 'phonePe', enabled: false, credentials: { appId: '', merchantId: '', saltId: '', saltKey: '' } },
    midtrans: { provider: 'midtrans', enabled: false, credentials: { siteId: '' } },
    mercadopago: { provider: 'mercadopago', enabled: false, credentials: { publicKey: '' } },
    xendit: { provider: 'xendit', enabled: false, credentials: { secretKey: '', webhookToken: '' } },
    cashfree: { provider: 'cashfree', enabled: false, credentials: { secretKey: '', appId: '' } },
};

export default function PaymentSetting() {
    const [settings, setSettings] = useState<AdminTypes.PaymentSettingsTypes.PaymentSettingTypes.AllPaymentSettings>(initialData);
    const [isLoading, setIsLoading] = useState(false);

    const handleToggle = (provider: AdminTypes.PaymentSettingsTypes.PaymentSettingTypes.PaymentProvider) => {
        setSettings(prev => ({
            ...prev,
            [provider]: {
                ...prev[provider],
                enabled: !prev[provider].enabled
            }
        }));
    };

    const handleFieldChange = (provider: AdminTypes.PaymentSettingsTypes.PaymentSettingTypes.PaymentProvider, field: string, value: string) => {
        setSettings(prev => ({
            ...prev,
            [provider]: {
                ...prev[provider],
                credentials: {
                    ...prev[provider].credentials,
                    [field]: value
                }
            }
        }));
    };

    const handleSubmit = async () => {
        try {
            setIsLoading(true);
            // Simulated server action
            toast.success("Payment settings saved successfully!");
        } catch (error) {
            console.error("Error saving payment settings:", error);
            toast.error("Failed to save payment settings");
        } finally {
            setIsLoading(false);
        }
    };

    const strings = Constants.adminConstants.paymentSettingStrings;

    return (
        <>
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-2">
                <div>
                    <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
                        {Constants.adminConstants.paymentSettingStrings.title}
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-300">
                        {Constants.adminConstants.paymentSettingStrings.description}
                    </p>
                </div>
            </div>

            <div className="bg-white dark:bg-darkFilterbar rounded-[4px] p-6 space-y-8">
                {(Object.keys(settings) as Array<AdminTypes.PaymentSettingsTypes.PaymentSettingTypes.PaymentProvider>).map((providerKey) => {
                    const providerSettings = settings[providerKey];
                    const providerStrings = (strings as any)[providerKey];
                    return (
                        <div key={providerKey} className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {providerStrings.title}
                                </span>
                                <WebComponents.AdminComponents.AdminWebComponents.Switch
                                    checked={providerSettings.enabled}
                                    onCheckedChange={() => handleToggle(providerKey)}
                                />
                            </div>

                            {providerSettings.enabled && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                                    {Object.entries(providerStrings).map(([fieldKey, label]) => {
                                        if (['title', 'secretKeyError', 'appKeyError'].includes(fieldKey)) return null;

                                        return (
                                            <div key={fieldKey} className="space-y-1.5">
                                                <WebComponents.AdminComponents.AdminWebComponents.FormLabel>
                                                    {label as string}
                                                </WebComponents.AdminComponents.AdminWebComponents.FormLabel>
                                                <WebComponents.AdminComponents.AdminWebComponents.FormInput
                                                    value={(providerSettings.credentials as any)[fieldKey] || ''}
                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFieldChange(providerKey, fieldKey, e.target.value)}
                                                />
                                                {providerKey === 'razorpay' && fieldKey === 'secretKey' && (
                                                    <p className="text-xs text-red-500 mt-1">{providerStrings.secretKeyError}</p>
                                                )}
                                                {providerKey === 'razorpay' && fieldKey === 'appKey' && (
                                                    <p className="text-xs text-red-500 mt-1">{providerStrings.appKeyError}</p>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}

                <div className="pt-4 flex justify-end">
                    <WebComponents.AdminComponents.AdminWebComponents.Button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="bg-button-gradient dark:bg-dark-btn hover:opacity-90 text-white flex items-center gap-2 px-6"
                    >
                        {isLoading ? strings.savingLabel : strings.submitButton}
                    </WebComponents.AdminComponents.AdminWebComponents.Button>
                </div>
            </div>
        </>
    );
}