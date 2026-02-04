import React from 'react';
import { CheckCircle } from 'lucide-react';
import { Constants } from '@/constant';
import { WebComponents } from '@/components';
import { ServerActions } from '@/lib';
import { toast } from 'react-toastify';
import { SuperAdminTypes } from '@/types';
import { useRouter } from 'next/navigation';

const Mail = ({ mailSettings: initialSettings }: { mailSettings: SuperAdminTypes.SettingTypes.MailSettingsTypes.MailSettings | null }) => {
    const router = useRouter();
    const [mailSettings, setMailSettings] = React.useState<SuperAdminTypes.SettingTypes.MailSettingsTypes.MailSettingsFormData>(initialSettings || {
        email: '',
        host: '',
        port: 587,
        encryption: 'tls',
        password: ''
    });
    const [mailSettingsId, setMailSettingsId] = React.useState<string | null>(null);
    const [mailSettingsStatus, setMailSettingsStatus] = React.useState({
        isVerified: false,
        lastVerifiedAt: undefined as Date | undefined,
        isComplete: false
    });
    const [isLoading, setIsLoading] = React.useState(false);
    const [isVerifying, setIsVerifying] = React.useState(false);
    const [savedSection, setSavedSection] = React.useState<string | null>(null);

    React.useEffect(() => {
        if (initialSettings) {
            const mailData = initialSettings;
            setMailSettingsId(mailData._id || mailData.id || null);
            setMailSettings({
                email: mailData.email || '',
                host: mailData.host || '',
                port: mailData.port || 587,
                encryption: (mailData.encryption as 'tls' | 'ssl' | 'none') || 'tls',
                password: mailData.password || ''
            });

            // Note: Some properties like isVerified might not be in the form data type but in the response
            setMailSettingsStatus({
                isVerified: mailData.isVerified || false,
                lastVerifiedAt: mailData.lastVerifiedAt ? new Date(mailData.lastVerifiedAt) : undefined,
                isComplete: mailData.isComplete || false
            });
        }
    }, [initialSettings]);

    const handleSaveMailSettings = async () => {
        const formData = {
            email: mailSettings.email,
            host: mailSettings.host,
            port: mailSettings.port,
            encryption: mailSettings.encryption,
            password: mailSettings.password || ''
        };

        const onSuccess = (result: any) => {
            if (result?.data) {
                setMailSettingsId(result.data._id || result.data.id);
                setMailSettingsStatus({
                    isVerified: result.data.isVerified || false,
                    lastVerifiedAt: result.data.lastVerifiedAt ? new Date(result.data.lastVerifiedAt) : undefined,
                    isComplete: result.data.isComplete || false
                });
            }
            setSavedSection('mail');
            setTimeout(() => setSavedSection(null), 2000);
        };

        if (mailSettingsId) {
            await ServerActions.HandleFunction.handleEditCommon({
                formData,
                editingItem: { id: mailSettingsId },
                getId: (item: any) => item.id,
                updateAction: (_, data) => ServerActions.ServerActionslib.updateMailSettingsAction(data),
                setLoading: setIsLoading,
                setShowEditModal: () => { },
                setEditingItem: () => { },
                router,
                successMessage: "Mail settings updated successfully.",
                onSuccess
            });
        } else {
            await ServerActions.HandleFunction.handleAddCommon({
                formData,
                createAction: ServerActions.ServerActionslib.createMailSettingsAction,
                setLoading: setIsLoading,
                setShowModal: () => { },
                router,
                successMessage: "Mail settings saved successfully.",
                onSuccess
            });
        }
    };

    const handleVerifyMailSettings = async () => {
        try {
            setIsVerifying(true);
            const result = await ServerActions.ServerActionslib.verifyMailSettingsAction();
            if (result.success) {
                if (result.data) {
                    setMailSettingsStatus({
                        isVerified: result.data.isVerified || false,
                        lastVerifiedAt: result.data.lastVerifiedAt ? new Date(result.data.lastVerifiedAt) : undefined,
                        isComplete: result.data.isComplete || false
                    });
                    if (!mailSettingsId && (result.data._id || result.data.id)) {
                        setMailSettingsId(result.data._id || result.data.id);
                    }
                }
                toast.success('Mail settings verified successfully!');
                setTimeout(() => router.refresh(), 1500);
            } else {
                toast.error(result.error || 'Failed to verify mail settings');
            }
        } catch (error: unknown) {
            console.error('Error verifying mail settings:', error);
            toast.error('Failed to verify mail settings');
        } finally {
            setIsVerifying(false);
        }
    };

    const handleDeleteMailSettings = async () => {
        if (!mailSettingsId) return;

        await ServerActions.HandleFunction.handleDeleteCommon({
            id: mailSettingsId,
            deleteAction: () => ServerActions.ServerActionslib.deleteMailSettingsAction(),
            setLoading: setIsLoading,
            router,
            onSuccess: () => {
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
                    lastVerifiedAt: undefined,
                    isComplete: false
                });
            }
        });
    };

    if (isLoading && !mailSettingsId && !mailSettings.email) {
        return <div className="p-8 text-center text-gray-500">Loading mail settings...</div>;
    }

    return (
        <div className='m-4'>
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="email">Email Address</WebComponents.UiComponents.UiWebComponents.FormLabel>
                        <WebComponents.UiComponents.UiWebComponents.FormInput
                            id="email"
                            type="email"
                            value={mailSettings.email}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMailSettings(prev => ({ ...prev, email: e.target.value }))}
                            required
                        />
                    </div>
                    <div>
                        <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="smtpHost">{Constants.superadminConstants.smtphost}</WebComponents.UiComponents.UiWebComponents.FormLabel>
                        <WebComponents.UiComponents.UiWebComponents.FormInput
                            id="smtpHost"
                            value={mailSettings.host}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMailSettings(prev => ({ ...prev, host: e.target.value }))}
                            required
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="smtpPort">{Constants.superadminConstants.smtpport}</WebComponents.UiComponents.UiWebComponents.FormLabel>
                        <WebComponents.UiComponents.UiWebComponents.FormInput
                            id="smtpPort"
                            type="number"
                            value={mailSettings.port?.toString() || '587'}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMailSettings(prev => ({ ...prev, port: parseInt(e.target.value) || 587 }))}
                            required
                        />
                    </div>
                    <div>
                        <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="smtpEncryption">{Constants.superadminConstants.smtpencryption}</WebComponents.UiComponents.UiWebComponents.FormLabel>
                        <WebComponents.UiComponents.UiWebComponents.FormDropdown
                            id="smtpEncryption"
                            value={mailSettings.encryption}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setMailSettings(prev => ({ ...prev, encryption: e.target.value as 'ssl' | 'tls' | 'none' }))}
                        >
                            <WebComponents.UiComponents.UiWebComponents.FormOption value="tls">TLS</WebComponents.UiComponents.UiWebComponents.FormOption>
                            <WebComponents.UiComponents.UiWebComponents.FormOption value="ssl">SSL</WebComponents.UiComponents.UiWebComponents.FormOption>
                            <WebComponents.UiComponents.UiWebComponents.FormOption value="none">None</WebComponents.UiComponents.UiWebComponents.FormOption>
                        </WebComponents.UiComponents.UiWebComponents.FormDropdown>
                    </div>
                </div>

                <div>
                    <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="smtpPassword">{Constants.superadminConstants.smtppassword}</WebComponents.UiComponents.UiWebComponents.FormLabel>
                    <WebComponents.UiComponents.UiWebComponents.FormInput
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
                        {Constants.superadminConstants.settingsverified}
                    </div>
                )}
                {mailSettingsStatus.isVerified && mailSettingsStatus.lastVerifiedAt && (
                    <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        {Constants.superadminConstants.lastverified}: {mailSettingsStatus.lastVerifiedAt.toLocaleDateString()}
                    </div>
                )}
                {!mailSettingsStatus.isComplete && !mailSettingsStatus.isVerified && (
                    <div className="mt-2 text-sm text-red-500">
                        {Constants.superadminConstants.settingsnotverified}
                    </div>
                )}
            </div>
            <div className="mt-8">
                <div className="flex justify-end gap-3">
                    <WebComponents.UiComponents.UiWebComponents.Button
                        type="button"
                        variant="outline"
                        onClick={handleVerifyMailSettings}
                        disabled={isVerifying || isLoading}
                    >
                        {isVerifying ? 'Verifying...' : Constants.superadminConstants.verify}
                    </WebComponents.UiComponents.UiWebComponents.Button>

                    {mailSettingsId && (
                        <WebComponents.UiComponents.UiWebComponents.Button
                            type="button"
                            variant="destructive"
                            onClick={handleDeleteMailSettings}
                            disabled={isLoading}
                        >
                            {Constants.superadminConstants.deleteLabel}
                        </WebComponents.UiComponents.UiWebComponents.Button>
                    )}

                    <WebComponents.UiComponents.UiWebComponents.SaveButtonWithStatus
                        showStatus={savedSection === 'mail'}
                        onClick={handleSaveMailSettings}
                        disabled={isLoading}
                    >
                        {Constants.superadminConstants.save}
                    </WebComponents.UiComponents.UiWebComponents.SaveButtonWithStatus>

                </div>
            </div>
        </div>
    );
};

export default Mail;
