"use client";
import React, { useState } from "react";
import { ServerActions } from "@/lib";
import { Constants } from "@/constant";
import { UiWebComponents } from "@/components/ui";
import { AdminSmsSettingsTypes } from "@/types/admin";
import { toast } from "react-toastify";
import { CheckCircle, MessageSquare, Trash2 } from "lucide-react";

export default function SmsSetting({
    initialSmsSetting,
}: { initialSmsSetting: AdminSmsSettingsTypes.SmsSettings | null }) {
    const [smsSettings, setSmsSettings] = useState<AdminSmsSettingsTypes.SmsSettingsFormData>(() => {
        if (initialSmsSetting) {
            return {
                accountSid: initialSmsSetting.accountSid || '',
                authToken: initialSmsSetting.authToken || '',
                phoneNumber: initialSmsSetting.phoneNumber || '',
                isVerified: initialSmsSetting.isVerified || false,
            };
        }
        return {
            accountSid: '',
            authToken: '',
            phoneNumber: '',
            isVerified: false,
        };
    });
    const [smsSettingsId, setSmsSettingsId] = useState<string | null>(initialSmsSetting?._id || initialSmsSetting?.id || null);
    const [smsSettingsStatus, setSmsSettingsStatus] = useState<{
        isVerified: boolean;
        lastVerifiedAt?: Date;
        isComplete: boolean;
    }>(() => {
        if (initialSmsSetting) {
            return {
                isVerified: initialSmsSetting.isVerified || false,
                lastVerifiedAt: initialSmsSetting.lastVerifiedAt ? new Date(initialSmsSetting.lastVerifiedAt) : undefined,
                isComplete: initialSmsSetting.isComplete || false
            };
        }
        return {
            isVerified: false,
            isComplete: false
        };
    });

    const [isLoadingSmsSettings, setIsLoadingSmsSettings] = useState(false);
    const [isVerifyingSettings, setIsVerifyingSettings] = useState(false);


    // SMS Settings Handlers
    const handleSaveSmsSettings = async () => {
        try {
            setIsLoadingSmsSettings(true);

            const result = await ServerActions.ServerActionslib.createOrUpdateTenantSmsSettingAction({
                accountSid: smsSettings.accountSid,
                authToken: smsSettings.authToken,
                phoneNumber: smsSettings.phoneNumber,
                isVerified: smsSettings.isVerified
            });

            if (result.success) {
                if (result.data) {
                    // Update the SMS settings ID and status
                    setSmsSettingsId(result.data._id || result.data.id);
                    setSmsSettingsStatus({
                        isVerified: result.data.isVerified || false,
                        lastVerifiedAt: result.data.lastVerifiedAt ? new Date(result.data.lastVerifiedAt) : undefined,
                        isComplete: result.data.isComplete || false
                    });
                }
                toast.success(Constants.adminConstants.smsSettingStrings.saveSuccess);
            } else {
                toast.error(result.error || Constants.adminConstants.smsSettingStrings.saveError);
            }
        } catch (error: unknown) {
            console.error('Error saving SMS settings:', error);
            toast.error(Constants.adminConstants.smsSettingStrings.saveError);
        } finally {
            setIsLoadingSmsSettings(false);
        }
    };

    const handleVerifySmsSettings = async () => {
        try {
            setIsVerifyingSettings(true);
            const result = await ServerActions.ServerActionslib.verifyTenantSmsSettingAction();

            if (result.success) {
                if (result.data) {

                    // Update the status with the verification response
                    const newStatus = {
                        isVerified: result.data.isVerified || false,
                        lastVerifiedAt: result.data.lastVerifiedAt ? new Date(result.data.lastVerifiedAt) : undefined,
                        isComplete: result.data.isComplete || false
                    };

                    setSmsSettingsStatus(newStatus);

                    // Also update the SMS settings ID if it's not set
                    if (!smsSettingsId && (result.data._id || result.data.id)) {
                        setSmsSettingsId(result.data._id || result.data.id);
                    }
                } else {
                    // If no data but success, assume verification worked
                    setSmsSettingsStatus(prev => ({
                        ...prev,
                        isVerified: true,
                        lastVerifiedAt: new Date(),
                        isComplete: true
                    }));
                }
                toast.success(Constants.adminConstants.smsSettingStrings.verifySuccess);

                // Reload page after successful verification
                setTimeout(() => {
                    window.location.reload();
                }, 1500); // Small delay to show the success message
            } else {
                console.error('SMS settings verification failed:', result.error);
                toast.error(result.error || Constants.adminConstants.smsSettingStrings.verifyError);
            }
        } catch (error: unknown) {
            console.error('Error verifying SMS settings:', error);
            console.error('Error details:', {
                message: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : undefined,
                error
            });
            toast.error(Constants.adminConstants.smsSettingStrings.verifyError);
        } finally {
            setIsVerifyingSettings(false);
        }
    };

    const handleDeleteSmsSettings = async () => {
        try {
            const result = await UiWebComponents.SwalHelper.confirm({
                title: Constants.adminConstants.smsSettingStrings.deleteButton,
                text: Constants.adminConstants.smsSettingStrings.deleteConfirm,
                icon: 'warning'
            });

            if (result.isConfirmed) {
                setIsLoadingSmsSettings(true);
                const deleteResult = await ServerActions.ServerActionslib.deleteTenantSmsSettingAction();

                if (deleteResult.success) {
                    // Reset SMS settings to default
                    setSmsSettings({
                        accountSid: '',
                        authToken: '',
                        phoneNumber: '',
                        isVerified: false,
                    });
                    setSmsSettingsId(null);
                    setSmsSettingsStatus({
                        isVerified: false,
                        isComplete: false
                    });
                    toast.success(Constants.adminConstants.smsSettingStrings.deleteSuccess);
                } else {
                    toast.error(deleteResult.error || Constants.adminConstants.smsSettingStrings.deleteError);
                }
            }
        } catch (error: unknown) {
            console.error('Error deleting SMS settings:', error);
            toast.error(Constants.adminConstants.smsSettingStrings.deleteError);
        } finally {
            setIsLoadingSmsSettings(false);
        }
    };

    return (
        <>
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-2">
                <div>
                    <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
                        {Constants.adminConstants.smsSettingStrings.title}
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-300">
                        {Constants.adminConstants.smsSettingStrings.description}
                    </p>
                </div>
            </div>
            {/* Content Area */}
            <div className="bg-white dark:bg-darkFilterbar rounded-[4px] h-full w-full mt-4 overflow-visible">
                <div className="p-4">
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <UiWebComponents.FormLabel htmlFor="accountSid">{Constants.adminConstants.smsSettingStrings.accountSidLabel}</UiWebComponents.FormLabel>
                                <UiWebComponents.FormInput
                                    id="accountSid"
                                    type="text"
                                    value={smsSettings.accountSid}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSmsSettings(prev => ({ ...prev, accountSid: e.target.value }))}
                                    required
                                />
                            </div>
                            <div>
                                <UiWebComponents.FormLabel htmlFor="authToken">{Constants.adminConstants.smsSettingStrings.authTokenLabel}</UiWebComponents.FormLabel>
                                <UiWebComponents.FormInput
                                    id="authToken"
                                    type="password"
                                    value={smsSettings.authToken}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSmsSettings(prev => ({ ...prev, authToken: e.target.value }))}
                                    required
                                />
                            </div>

                            <div>
                                <UiWebComponents.FormLabel htmlFor="phoneNumber">{Constants.adminConstants.smsSettingStrings.fromNumberLabel}</UiWebComponents.FormLabel>
                                <UiWebComponents.FormInput
                                    id="phoneNumber"
                                    type="text"
                                    value={smsSettings.phoneNumber}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSmsSettings(prev => ({ ...prev, phoneNumber: e.target.value }))}
                                    required
                                />
                            </div>
                            <div className="flex items-center space-x-2 pt-8">
                                <input
                                    type="checkbox"
                                    id="isVerified"
                                    checked={smsSettings.isVerified}
                                    onChange={(e) => setSmsSettings(prev => ({ ...prev, isVerified: e.target.checked }))}
                                    className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                                />
                                <label htmlFor="isVerified" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Is Verified
                                </label>
                            </div>
                        </div>

                        {(smsSettingsStatus.isComplete || smsSettingsStatus.isVerified) && (
                            <div className="mt-4 flex items-center text-green-600 dark:text-green-400 text-sm">
                                <CheckCircle className="w-4 h-4 mr-2" />
                                {Constants.adminConstants.smsSettingStrings.verifiedStatus}
                            </div>
                        )}
                        {smsSettingsStatus.isVerified && smsSettingsStatus.lastVerifiedAt && (
                            <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                {Constants.adminConstants.smsSettingStrings.lastVerifiedLabel}: {smsSettingsStatus.lastVerifiedAt.toLocaleDateString()}
                            </div>
                        )}
                        {!smsSettingsStatus.isComplete && !smsSettingsStatus.isVerified && (
                            <div className="mt-2 text-sm text-red-500">
                                {Constants.adminConstants.smsSettingStrings.notVerifiedStatus}
                            </div>
                        )}
                    </div>
                    <div className="mt-8">
                        <div className="flex justify-end gap-3">
                            <UiWebComponents.Button
                                type="button"
                                variant="outline"
                                onClick={handleVerifySmsSettings}
                                disabled={isVerifyingSettings || isLoadingSmsSettings}
                                className="flex items-center gap-2"
                            >
                                <MessageSquare className="w-4 h-4" />
                                {isVerifyingSettings ? Constants.adminConstants.smsSettingStrings.verifyingLabel : Constants.adminConstants.smsSettingStrings.verifyButton}
                            </UiWebComponents.Button>
                            {smsSettingsId && (
                                <UiWebComponents.Button
                                    type="button"
                                    variant="destructive"
                                    onClick={handleDeleteSmsSettings}
                                    disabled={isLoadingSmsSettings}
                                    className="flex items-center gap-2"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    {Constants.adminConstants.smsSettingStrings.deleteButton}
                                </UiWebComponents.Button>
                            )}
                            <UiWebComponents.SaveButtonWithStatus
                                onClick={handleSaveSmsSettings}
                                disabled={isLoadingSmsSettings}
                                showStatus={isLoadingSmsSettings}
                            >
                                {isLoadingSmsSettings ? Constants.adminConstants.smsSettingStrings.savingLabel : Constants.adminConstants.smsSettingStrings.saveButton}
                            </UiWebComponents.SaveButtonWithStatus>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
