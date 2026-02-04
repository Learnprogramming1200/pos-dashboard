import React from 'react';
import { Constants } from '@/constant';
import { WebComponents } from '@/components';
import { ServerActions } from '@/lib';
import { toast } from 'react-toastify';
import { SuperAdminTypes } from '@/types';
import { useRouter } from 'next/navigation';

interface GDPRProps {
    gdprSettings: SuperAdminTypes.SettingTypes.GDPRSettingsTypes.GDPRSettings | null;
}

const GDPR = ({ gdprSettings: initialSettings }: GDPRProps) => {
    const router = useRouter();
    const [gdprSettings, setGDPRSettings] = React.useState<SuperAdminTypes.SettingTypes.GDPRSettingsTypes.GDPRSettings | null>(initialSettings);
    const [gdprEnabled, setGdprEnabled] = React.useState(false);
    const [cookieMessage, setCookieMessage] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);
    const [savedSection, setSavedSection] = React.useState<string | null>(null);

    React.useEffect(() => {
        if (initialSettings) {
            setGDPRSettings(initialSettings);
            setGdprEnabled(initialSettings.enableGdprCookieNotice);
            setCookieMessage(initialSettings.cookieMessage || '');
        }
    }, [initialSettings]);

    const handleToggleGDPRSettings = React.useCallback(async () => {
        const originalState = gdprEnabled;
        const newEnabledState = !originalState;
        try {
            // Optimistically update the UI
            
            setGdprEnabled(newEnabledState);

            const result = await ServerActions.ServerActionslib.toggleGDPRSettingsAction({
                enableGdprCookieNotice: newEnabledState
            });

            if (result.success) {
                if (result.data) {
                    const data = Array.isArray(result.data) ? result.data[0] : (result.data.data && Array.isArray(result.data.data) ? result.data.data[0] : result.data.data || result.data);
                    setGDPRSettings(data);
                }
                toast.success(`GDPR cookie notice ${newEnabledState ? 'enabled' : 'disabled'} successfully!`);
                router.refresh();
            } else {
                setGdprEnabled(originalState);
                toast.error(result.error || 'Failed to toggle GDPR settings');
            }
        } catch (error: unknown) {
            console.error('Error toggling GDPR settings:', error);
            setGdprEnabled(originalState);
            toast.error('Failed to toggle GDPR settings');
        }
    }, [gdprEnabled, router]);

    const handleSaveGDPRSettings = async () => {
        const formData = {
            enableGdprCookieNotice: gdprEnabled,
            cookieMessage: cookieMessage
        };

        try {
            setIsLoading(true);
            const result = await ServerActions.ServerActionslib.createGDPRSettingsAction(formData);

            if (result.success) {
                if (result.data) {
                    const data = Array.isArray(result.data) ? result.data[0] : (result.data.data && Array.isArray(result.data.data) ? result.data.data[0] : result.data.data || result.data);
                    setGDPRSettings(data);
                }
                toast.success('GDPR settings saved successfully!');
                setSavedSection('gdpr');
                setTimeout(() => setSavedSection(null), 2000);
                router.refresh();
            } else {
                toast.error(result.error || 'Failed to save GDPR settings');
            }
        } catch (error: unknown) {
            console.error('Error saving GDPR settings:', error);
            toast.error('Failed to save GDPR settings');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className='m-4'>
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{Constants.superadminConstants.enablegdprcookienotice}</label>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{Constants.superadminConstants.enablegdprbio}</p>
                    </div>
                    <WebComponents.UiComponents.UiWebComponents.Switch
                        checked={gdprEnabled}
                        onCheckedChange={handleToggleGDPRSettings}
                    />
                </div>

                <div>
                    <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="cookieMessage">Cookie Message</WebComponents.UiComponents.UiWebComponents.FormLabel>
                    <textarea
                        id="cookieMessage"
                        value={cookieMessage}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCookieMessage(e.target.value)}
                        rows={3}
                        className="h-[44px] w-full rounded-[4px] border-[0.6px] border-[#D8D9D9] dark:border-gray-600 bg-textMain2 dark:bg-gray-800 pl-3 pr-3 pt-2 text-textMain dark:text-white font-interTight font-medium text-sm leading-[14px] placeholder:text-textSmall dark:placeholder-gray-400 placeholder:font-interTight placeholder:font-normal placeholder:text-sm placeholder:leading-[14px] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 min-h-[100px] resize-vertical"
                    />
                </div>
            </div>
            <div className="mt-8 flex justify-end gap-3">
                <WebComponents.UiComponents.UiWebComponents.SaveButtonWithStatus
                    onClick={handleSaveGDPRSettings}
                    showStatus={savedSection === 'gdpr'}
                    disabled={isLoading}
                >
                    {Constants.superadminConstants.savegdprsettings}
                </WebComponents.UiComponents.UiWebComponents.SaveButtonWithStatus>
            </div>
        </div>
    );
};

export default GDPR;
