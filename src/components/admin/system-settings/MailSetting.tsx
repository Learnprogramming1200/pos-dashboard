"use client";
import React from "react";
import { useState } from "react";
import { ServerActions } from "@/lib";
import { Constants } from "@/constant";
import { UiWebComponents } from "@/components/ui";
import { AdminMailSettingsTypes } from "@/types/admin";
import { toast } from "react-toastify";
import { CheckCircle, Mail, Trash2 } from "lucide-react";

export default function MailSetting({
  initialMailSetting,
}: { initialMailSetting: AdminMailSettingsTypes.MailSettings | null }) {
  const [mailSettings, setMailSettings] = useState<AdminMailSettingsTypes.MailSettingsFormData>(() => {
    if (initialMailSetting) {
      return {
        email: initialMailSetting.email || '',
        host: initialMailSetting.host || '',
        port: initialMailSetting.port || 587,
        encryption: initialMailSetting.encryption || 'tls',
        password: initialMailSetting.password || ''
      };
    }
    return {
      email: '',
      host: '',
      port: 587,
      encryption: 'tls',
      password: ''
    };
  });
  const [mailSettingsId, setMailSettingsId] = useState<string | null>(initialMailSetting?._id || initialMailSetting?.id || null);
  const [mailSettingsStatus, setMailSettingsStatus] = useState<{
    isVerified: boolean;
    lastVerifiedAt?: Date;
    isComplete: boolean;
  }>(() => {
    if (initialMailSetting) {
      return {
        isVerified: initialMailSetting.isVerified || false,
        lastVerifiedAt: initialMailSetting.lastVerifiedAt ? new Date(initialMailSetting.lastVerifiedAt) : undefined,
        isComplete: initialMailSetting.isComplete || false
      };
    }
    return {
      isVerified: false,
      isComplete: false
    };
  });

  const [isLoadingMailSettings, setIsLoadingMailSettings] = useState(false);
  const [isVerifyingSettings, setIsVerifyingSettings] = useState(false);


  // Mail Settings Handlers
  const handleSaveMailSettings = async () => {
    try {
      setIsLoadingMailSettings(true);

      let result;
      if (mailSettingsId) {
        // Update existing mail settings
        result = await ServerActions.ServerActionslib.createOrUpdateTenantMailSettingAction({
          email: mailSettings.email,
          host: mailSettings.host,
          port: mailSettings.port,
          encryption: mailSettings.encryption,
          password: mailSettings.password
        });
      } else {
        // Create new mail settings
        result = await ServerActions.ServerActionslib.createOrUpdateTenantMailSettingAction({
          email: mailSettings.email,
          host: mailSettings.host,
          port: mailSettings.port,
          encryption: mailSettings.encryption,
          password: mailSettings.password
        });
      }

      if (result.success) {
        if (result.data) {
          // Update the mail settings ID and status
          setMailSettingsId(result.data._id || result.data.id);
          setMailSettingsStatus({
            isVerified: result.data.isVerified || false,
            lastVerifiedAt: result.data.lastVerifiedAt ? new Date(result.data.lastVerifiedAt) : undefined,
            isComplete: result.data.isComplete || false
          });
        }
        toast.success('Mail settings saved successfully!');
      } else {
        toast.error(result.error || 'Failed to save mail settings');
      }
    } catch (error: unknown) {
      console.error('Error saving mail settings:', error);
      toast.error('Failed to save mail settings');
    } finally {
      setIsLoadingMailSettings(false);
    }
  };

  const handleVerifyMailSettings = async () => {
    try {
      setIsVerifyingSettings(true);
      const result = await ServerActions.ServerActionslib.verifyTenantMailSettingAction();

      if (result.success) {
        if (result.data) {

          // Update the status with the verification response
          const newStatus = {
            isVerified: result.data.isVerified || false,
            lastVerifiedAt: result.data.lastVerifiedAt ? new Date(result.data.lastVerifiedAt) : undefined,
            isComplete: result.data.isComplete || false
          };

          setMailSettingsStatus(newStatus);

          // Also update the mail settings ID if it's not set
          if (!mailSettingsId && (result.data._id || result.data.id)) {
            setMailSettingsId(result.data._id || result.data.id);
          }
        } else {
          // If no data but success, assume verification worked
          setMailSettingsStatus(prev => ({
            ...prev,
            isVerified: true,
            lastVerifiedAt: new Date(),
            isComplete: true
          }));
        }
        toast.success('Mail settings verified successfully!');

        // Reload page after successful verification
        setTimeout(() => {
          window.location.reload();
        }, 1500); // Small delay to show the success message
      } else {
        console.error('Mail settings verification failed:', result.error);
        toast.error(result.error || 'Failed to verify mail settings');
      }
    } catch (error: unknown) {
      console.error('Error verifying mail settings:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        error
      });
      toast.error('Failed to verify mail settings');
    } finally {
      setIsVerifyingSettings(false);
    }
  };

  const handleDeleteMailSettings = async () => {
    try {
      const result = await UiWebComponents.SwalHelper.confirm({
        title: 'Delete Mail Settings',
        text: 'Are you sure you want to delete the mail settings? This action cannot be undone.',
        icon: 'warning'
      });

      if (result.isConfirmed) {
        setIsLoadingMailSettings(true);
        const deleteResult = await ServerActions.ServerActionslib.deleteTenantMailSettingAction();

        if (deleteResult.success) {
          // Reset mail settings to default
          setMailSettings({
            email: '',
            host: '',
            port: 587,
            encryption: 'tls',
            password: ''
          });
          setMailSettingsId(null);
          setMailSettingsStatus({
            isVerified: false,
            isComplete: false
          });
          toast.success('Mail settings deleted successfully!');
        } else {
          toast.error(deleteResult.error || 'Failed to delete mail settings');
        }
      }
    } catch (error: unknown) {
      console.error('Error deleting mail settings:', error);
      toast.error('Failed to delete mail settings');
    } finally {
      setIsLoadingMailSettings(false);
    }
  };
  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
            {Constants.adminConstants.mailSettingStrings.title}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-300">
            {Constants.adminConstants.mailSettingStrings.description}
          </p>
        </div>
      </div>
      {/* Content Area */}
      <div className="bg-white dark:bg-darkFilterbar rounded-[4px] h-full w-full mt-4 overflow-visible">
        <div className="p-4">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <UiWebComponents.FormLabel htmlFor="email">{Constants.adminConstants.mailSettingStrings.emailLabel}</UiWebComponents.FormLabel>
                <UiWebComponents.FormInput
                  id="email"
                  type="email"
                  value={mailSettings.email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMailSettings(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
              <div>
                <UiWebComponents.FormLabel htmlFor="smtpHost">{Constants.adminConstants.mailSettingStrings.hostLabel}</UiWebComponents.FormLabel>
                <UiWebComponents.FormInput
                  id="smtpHost"
                  value={mailSettings.host}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMailSettings(prev => ({ ...prev, host: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <UiWebComponents.FormLabel htmlFor="smtpPort">{Constants.adminConstants.mailSettingStrings.portLabel}</UiWebComponents.FormLabel>
                <UiWebComponents.FormInput
                  id="smtpPort"
                  type="number"
                  value={mailSettings.port?.toString() || '587'}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMailSettings(prev => ({ ...prev, port: parseInt(e.target.value) || 587 }))}
                  required
                />
              </div>
              <div>
                <UiWebComponents.FormLabel htmlFor="smtpEncryption">{Constants.adminConstants.mailSettingStrings.encryptionLabel}</UiWebComponents.FormLabel>
                <UiWebComponents.FormDropdown
                  id="smtpEncryption"
                  value={mailSettings.encryption}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setMailSettings(prev => ({ ...prev, encryption: e.target.value as 'ssl' | 'tls' | 'none' }))}
                >
                  <UiWebComponents.FormOption value="tls">{Constants.adminConstants.mailSettingStrings.tlsLabel}</UiWebComponents.FormOption>
                  <UiWebComponents.FormOption value="ssl">{Constants.adminConstants.mailSettingStrings.sslLabel}</UiWebComponents.FormOption>
                  <UiWebComponents.FormOption value="none">{Constants.adminConstants.mailSettingStrings.noneLabel}</UiWebComponents.FormOption>
                </UiWebComponents.FormDropdown>
              </div>
            </div>

            <div>
              <UiWebComponents.FormLabel htmlFor="smtpPassword">{Constants.adminConstants.mailSettingStrings.passwordLabel}</UiWebComponents.FormLabel>
              <UiWebComponents.FormInput
                id="smtpPassword"
                type="password"
                value={mailSettings.password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMailSettings(prev => ({ ...prev, password: e.target.value }))}
                required
              />
            </div>
            {(mailSettingsStatus.isComplete || mailSettingsStatus.isVerified) && (
              <div className="mt-4 flex items-center text-green-600 dark:text-green-400 text-sm">
                <CheckCircle className="w-4 h-4 mr-2" />
                {Constants.adminConstants.mailSettingStrings.verifiedStatus}
              </div>
            )}
            {mailSettingsStatus.isVerified && mailSettingsStatus.lastVerifiedAt && (
              <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {Constants.adminConstants.mailSettingStrings.lastVerifiedLabel}: {mailSettingsStatus.lastVerifiedAt.toLocaleDateString()}
              </div>
            )}
            {!mailSettingsStatus.isComplete && !mailSettingsStatus.isVerified && (
              <div className="mt-2 text-sm text-red-500">
                {Constants.adminConstants.mailSettingStrings.notVerifiedStatus}
              </div>
            )}
          </div>
          <div className="mt-8">
            <div className="flex justify-end gap-3">
              <UiWebComponents.Button
                type="button"
                variant="outline"
                onClick={handleVerifyMailSettings}
                disabled={isVerifyingSettings || isLoadingMailSettings}
                className="flex items-center gap-2"
              >
                <Mail className="w-4 h-4" />
                {isVerifyingSettings ? Constants.adminConstants.mailSettingStrings.verifyingLabel : Constants.adminConstants.mailSettingStrings.verifyButton}
              </UiWebComponents.Button>
              {mailSettingsId && (
                <UiWebComponents.Button
                  type="button"
                  variant="destructive"
                  onClick={handleDeleteMailSettings}
                  disabled={isLoadingMailSettings}
                  className="flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  {Constants.adminConstants.mailSettingStrings.deleteButton}
                </UiWebComponents.Button>
              )}
              <UiWebComponents.SaveButtonWithStatus
                onClick={handleSaveMailSettings}
                disabled={isLoadingMailSettings}
                showStatus={isLoadingMailSettings}
              >
                {isLoadingMailSettings ? Constants.adminConstants.mailSettingStrings.savingLabel : Constants.adminConstants.mailSettingStrings.saveButton}
              </UiWebComponents.SaveButtonWithStatus>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

