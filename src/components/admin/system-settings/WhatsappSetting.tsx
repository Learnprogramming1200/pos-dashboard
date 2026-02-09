"use client";
import React, { useState } from "react";
import { ServerActions } from "@/lib";
import { Constants } from "@/constant";
import { UiWebComponents } from "@/components/ui";
import { AdminWhatsappSettingsTypes } from "@/types/admin";
import { toast } from "react-toastify";
import { CheckCircle, MessageSquare, Trash2 } from "lucide-react";

export default function WhatsappSetting({
    initialWhatsappSetting,
}: { initialWhatsappSetting: AdminWhatsappSettingsTypes.WhatsappSettings | null }) {
    const [whatsappSettings, setWhatsappSettings] = useState<AdminWhatsappSettingsTypes.WhatsappSettingsFormData>(() => {
        if (initialWhatsappSetting) {
            return {
                accountSid: initialWhatsappSetting.accountSid || '',
                authToken: initialWhatsappSetting.authToken || '',
                phoneNumber: initialWhatsappSetting.phoneNumber || '',
                isVerified: initialWhatsappSetting.isVerified || false,
            };
        }
        return {
            accountSid: '',
            authToken: '',
            phoneNumber: '',
            isVerified: false,
        };
    });
    const [whatsappSettingsId, setWhatsappSettingsId] = useState<string | null>(initialWhatsappSetting?._id || initialWhatsappSetting?.id || null);
    const [whatsappSettingsStatus, setWhatsappSettingsStatus] = useState<{
        isVerified: boolean;
        lastVerifiedAt?: Date;
        isComplete: boolean;
    }>(() => {
        if (initialWhatsappSetting) {
            return {
                isVerified: initialWhatsappSetting.isVerified || false,
                lastVerifiedAt: initialWhatsappSetting.lastVerifiedAt ? new Date(initialWhatsappSetting.lastVerifiedAt) : undefined,
                isComplete: initialWhatsappSetting.isComplete || false
            };
        }
        return {
            isVerified: false,
            isComplete: false
        };
    });

    const [isLoadingWhatsappSettings, setIsLoadingWhatsappSettings] = useState(false);
    const [isVerifyingSettings, setIsVerifyingSettings] = useState(false);


    // Whatsapp Settings Handlers
    const handleSaveWhatsappSettings = async () => {
        try {
            setIsLoadingWhatsappSettings(true);

            const result = await ServerActions.ServerActionslib.createOrUpdateTenantWhatsappSettingAction({
                accountSid: whatsappSettings.accountSid,
                authToken: whatsappSettings.authToken,
                phoneNumber: whatsappSettings.phoneNumber,
                isVerified: whatsappSettings.isVerified
            });

            if (result.success) {
                if (result.data) {
                    // Update the Whatsapp settings ID and status
                    setWhatsappSettingsId(result.data._id || result.data.id);
                    setWhatsappSettingsStatus({
                        isVerified: result.data.isVerified || false,
                        lastVerifiedAt: result.data.lastVerifiedAt ? new Date(result.data.lastVerifiedAt) : undefined,
                        isComplete: result.data.isComplete || false
                    });
                }
                toast.success(Constants.adminConstants.whatsappSettingStrings.saveSuccess);
            } else {
                toast.error(result.error || Constants.adminConstants.whatsappSettingStrings.saveError);
            }
        } catch (error: unknown) {
            console.error('Error saving Whatsapp settings:', error);
            toast.error(Constants.adminConstants.whatsappSettingStrings.saveError);
        } finally {
            setIsLoadingWhatsappSettings(false);
        }
    };

    const handleVerifyWhatsappSettings = async () => {
        try {
            setIsVerifyingSettings(true);
            const result = await ServerActions.ServerActionslib.verifyTenantWhatsappSettingAction();

            if (result.success) {
                if (result.data) {

                    // Update the status with the verification response
                    const newStatus = {
                        isVerified: result.data.isVerified || false,
                        lastVerifiedAt: result.data.lastVerifiedAt ? new Date(result.data.lastVerifiedAt) : undefined,
                        isComplete: result.data.isComplete || false
                    };

                    setWhatsappSettingsStatus(newStatus);

                    // Also update the Whatsapp settings ID if it's not set
                    if (!whatsappSettingsId && (result.data._id || result.data.id)) {
                        setWhatsappSettingsId(result.data._id || result.data.id);
                    }
                } else {
                    // If no data but success, assume verification worked
                    setWhatsappSettingsStatus(prev => ({
                        ...prev,
                        isVerified: true,
                        lastVerifiedAt: new Date(),
                        isComplete: true
                    }));
                }
                toast.success(Constants.adminConstants.whatsappSettingStrings.verifySuccess);

                // Reload page after successful verification
                setTimeout(() => {
                    window.location.reload();
                }, 1500); // Small delay to show the success message
            } else {
                console.error('Whatsapp settings verification failed:', result.error);
                toast.error(result.error || Constants.adminConstants.whatsappSettingStrings.verifyError);
            }
        } catch (error: unknown) {
            console.error('Error verifying Whatsapp settings:', error);
            console.error('Error details:', {
                message: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : undefined,
                error
            });
            toast.error(Constants.adminConstants.whatsappSettingStrings.verifyError);
        } finally {
            setIsVerifyingSettings(false);
        }
    };

    const handleDeleteWhatsappSettings = async () => {
        try {
            const result = await UiWebComponents.SwalHelper.confirm({
                title: Constants.adminConstants.whatsappSettingStrings.deleteButton,
                text: Constants.adminConstants.whatsappSettingStrings.deleteConfirm,
                icon: 'warning'
            });

            if (result.isConfirmed) {
                setIsLoadingWhatsappSettings(true);
                const deleteResult = await ServerActions.ServerActionslib.deleteTenantWhatsappSettingAction();

                if (deleteResult.success) {
                    // Reset Whatsapp settings to default
                    setWhatsappSettings({
                        accountSid: '',
                        authToken: '',
                        phoneNumber: '',
                        isVerified: false,
                    });
                    setWhatsappSettingsId(null);
                    setWhatsappSettingsStatus({
                        isVerified: false,
                        isComplete: false
                    });
                    toast.success(Constants.adminConstants.whatsappSettingStrings.deleteSuccess);
                } else {
                    toast.error(deleteResult.error || Constants.adminConstants.whatsappSettingStrings.deleteError);
                }
            }
        } catch (error: unknown) {
            console.error('Error deleting Whatsapp settings:', error);
            toast.error(Constants.adminConstants.whatsappSettingStrings.deleteError);
        } finally {
            setIsLoadingWhatsappSettings(false);
        }
    };

    return (
        <>
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-2">
                <div>
                    <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
                        {Constants.adminConstants.whatsappSettingStrings.title}
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-300">
                        {Constants.adminConstants.whatsappSettingStrings.description}
                    </p>
                </div>
            </div>
            {/* Content Area */}
            <div className="bg-white dark:bg-darkFilterbar rounded-[4px] h-full w-full mt-4 overflow-visible">
                <div className="p-4">
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <UiWebComponents.FormLabel htmlFor="accountSid">{Constants.adminConstants.whatsappSettingStrings.accountSidLabel}</UiWebComponents.FormLabel>
                                <UiWebComponents.FormInput
                                    id="accountSid"
                                    type="text"
                                    value={whatsappSettings.accountSid}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setWhatsappSettings(prev => ({ ...prev, accountSid: e.target.value }))}
                                    required
                                />
                            </div>
                            <div>
                                <UiWebComponents.FormLabel htmlFor="authToken">{Constants.adminConstants.whatsappSettingStrings.authTokenLabel}</UiWebComponents.FormLabel>
                                <UiWebComponents.FormInput
                                    id="authToken"
                                    type="password"
                                    value={whatsappSettings.authToken}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setWhatsappSettings(prev => ({ ...prev, authToken: e.target.value }))}
                                    required
                                />
                            </div>

                            <div>
                                <UiWebComponents.FormLabel htmlFor="phoneNumber">{Constants.adminConstants.whatsappSettingStrings.fromNumberLabel}</UiWebComponents.FormLabel>
                                <UiWebComponents.FormInput
                                    id="phoneNumber"
                                    type="text"
                                    value={whatsappSettings.phoneNumber}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setWhatsappSettings(prev => ({ ...prev, phoneNumber: e.target.value }))}
                                    required
                                />
                            </div>
                            <div className="flex items-center space-x-2 pt-8">
                                <input
                                    type="checkbox"
                                    id="isVerified"
                                    checked={whatsappSettings.isVerified}
                                    onChange={(e) => setWhatsappSettings(prev => ({ ...prev, isVerified: e.target.checked }))}
                                    className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                                />
                                <label htmlFor="isVerified" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Is Verified
                                </label>
                            </div>
                        </div>

                        {(whatsappSettingsStatus.isComplete || whatsappSettingsStatus.isVerified) && (
                            <div className="mt-4 flex items-center text-green-600 dark:text-green-400 text-sm">
                                <CheckCircle className="w-4 h-4 mr-2" />
                                {Constants.adminConstants.whatsappSettingStrings.verifiedStatus}
                            </div>
                        )}
                        {whatsappSettingsStatus.isVerified && whatsappSettingsStatus.lastVerifiedAt && (
                            <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                {Constants.adminConstants.whatsappSettingStrings.lastVerifiedLabel}: {whatsappSettingsStatus.lastVerifiedAt.toLocaleDateString()}
                            </div>
                        )}
                        {!whatsappSettingsStatus.isComplete && !whatsappSettingsStatus.isVerified && (
                            <div className="mt-2 text-sm text-red-500">
                                {Constants.adminConstants.whatsappSettingStrings.notVerifiedStatus}
                            </div>
                        )}
                    </div>
                    <div className="mt-8">
                        <div className="flex justify-end gap-3">
                            <UiWebComponents.Button
                                type="button"
                                variant="outline"
                                onClick={handleVerifyWhatsappSettings}
                                disabled={isVerifyingSettings || isLoadingWhatsappSettings}
                                className="flex items-center gap-2"
                            >
                                <MessageSquare className="w-4 h-4" />
                                {isVerifyingSettings ? Constants.adminConstants.whatsappSettingStrings.verifyingLabel : Constants.adminConstants.whatsappSettingStrings.verifyButton}
                            </UiWebComponents.Button>
                            {whatsappSettingsId && (
                                <UiWebComponents.Button
                                    type="button"
                                    variant="destructive"
                                    onClick={handleDeleteWhatsappSettings}
                                    disabled={isLoadingWhatsappSettings}
                                    className="flex items-center gap-2"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    {Constants.adminConstants.whatsappSettingStrings.deleteButton}
                                </UiWebComponents.Button>
                            )}
                            <UiWebComponents.SaveButtonWithStatus
                                onClick={handleSaveWhatsappSettings}
                                disabled={isLoadingWhatsappSettings}
                                showStatus={isLoadingWhatsappSettings}
                            >
                                {isLoadingWhatsappSettings ? Constants.adminConstants.whatsappSettingStrings.savingLabel : Constants.adminConstants.whatsappSettingStrings.saveButton}
                            </UiWebComponents.SaveButtonWithStatus>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
