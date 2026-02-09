import React from 'react';

import { ServerActions } from '@/lib';
import { Constants } from '@/constant';
import { PaymentMethodCard } from './PaymentMethodCard';
import { SuperAdminTypes } from '@/types';
import { WebComponents } from '@/components';

interface PaymentProps {
    paymentConfigs: SuperAdminTypes.SettingTypes.PaymentSettingsTypes.PaymentConfig[];
}

const Payment = ({ paymentConfigs: initialConfigs }: PaymentProps) => {
    // Initialize state merging definitions with existing configs
    const [paymentConfigs, setPaymentConfigs] = React.useState<SuperAdminTypes.SettingTypes.PaymentSettingsTypes.PaymentConfig[]>([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const [savedSection, setSavedSection] = React.useState<string | null>(null);

    React.useEffect(() => {
        // Merge definitions with initial configs to ensure all providers exist in state
        const mergedConfigs = SuperAdminTypes.SettingTypes.PaymentSettingsTypes.PAYMENT_PROVIDER_DEFINITIONS.map(def => {
            const existing = initialConfigs?.find(c => c.provider === def.method.id);
            if (existing) return existing;

            // Default config structure
            return {
                provider: def.method.id,
                enabled: false,
                credentials: def.provider.requiredFields.reduce((acc: any, field: string) => ({
                    ...acc,
                    [field]: ''
                }), {})
            } as any;
        });
        setPaymentConfigs(mergedConfigs);
    }, [initialConfigs]);

    const handleFieldChange = (provider: string, field: string, value: any) => {
        setPaymentConfigs((prev: any[]) => prev.map(config => {
            if (config.provider === provider) {
                return {
                    ...config,
                    credentials: {
                        ...config.credentials,
                        [field]: value
                    }
                };
            }
            return config;
        }));
    };

    const handleToggle = (provider: string) => {
        setPaymentConfigs((prev: any[]) => prev.map(config => {
            if (config.provider === provider) {
                return { ...config, enabled: !config.enabled };
            }
            return config;
        }));
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            const results = await Promise.all(paymentConfigs.map(async (config) => {
                // Construct strictly typed payload
                const payload: SuperAdminTypes.SettingTypes.PaymentSettingsTypes.PaymentConfigFormData = {
                    provider: config.provider,
                    enabled: config.enabled,
                    credentials: config.credentials
                };

                if (config._id) {
                    return await ServerActions.ServerActionslib.updatePaymentConfigAction(config._id, payload);
                } else {
                    return await ServerActions.ServerActionslib.createPaymentConfigAction(payload);
                }
            }));

            const failed = results.filter(r => !r.success);
            const successful = results.filter(r => r.success);

            if (failed.length > 0) {
                console.error("Some payment settings failed to save", failed);
                WebComponents.UiComponents.UiWebComponents.SwalHelper.error({
                    text: `Failed to save ${failed.length} payment configuration(s).`
                });
            } else if (successful.length > 0) {
                WebComponents.UiComponents.UiWebComponents.SwalHelper.success({
                    text: "All payment settings saved successfully."
                });
                setSavedSection('payment');
                setTimeout(() => setSavedSection(null), 2000);
            }
        } catch (error) {
            console.error("Error saving payment settings:", error);
            WebComponents.UiComponents.UiWebComponents.SwalHelper.error({ text: "An unexpected error occurred while saving." });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-darkFilterbar rounded-[4px] p-6 space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-2">
                <div>
                    <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
                        Payment Settings
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-300">
                        Configure your payment gateways
                    </p>
                </div>
            </div>

            {/* List of Providers */}
            <div className="space-y-8">
                {SuperAdminTypes.SettingTypes.PaymentSettingsTypes.PAYMENT_PROVIDER_DEFINITIONS.map((def: any, index: number) => {
                    const config = paymentConfigs.find((c: any) => c.provider === def.method.id);
                    if (!config) return null; // Should not happen due to init logic

                    return (
                        <div key={def.method.id} className="border-b border-gray-100 dark:border-gray-800 pb-8 last:border-0 last:pb-0">
                            <PaymentMethodCard
                                method={def.method}
                                provider={def.provider}
                                config={config}
                                onChange={handleFieldChange}
                                onToggle={handleToggle}
                            />
                        </div>
                    );
                })}
            </div>

            {/* Save Button */}
            <div className="pt-4 flex justify-end">
                <WebComponents.UiComponents.UiWebComponents.SaveButtonWithStatus
                    onClick={handleSave}
                    disabled={isLoading}
                    showStatus={savedSection === 'payment'}
                >
                    {Constants.superadminConstants.savepaymentsettings}
                </WebComponents.UiComponents.UiWebComponents.SaveButtonWithStatus>
            </div>
        </div>
    );
};

export default Payment;
