import React from 'react';
import { useRouter } from 'next/navigation';
import { WebComponents } from '@/components';
import { Constants } from '@/constant';
import { ServerActions } from '@/lib';
import { SuperAdminTypes } from '@/types';

interface TrialProps {
    trialSettings: SuperAdminTypes.SettingTypes.TrialSettingsTypes.TrialSettings | null;
}

const Trial = ({ trialSettings: initialSettings }: TrialProps) => {
    const router = useRouter();
    const [trialSettings, setTrialSettings] = React.useState<SuperAdminTypes.SettingTypes.TrialSettingsTypes.TrialSettings | null>(initialSettings);
    const [isLoading, setIsLoading] = React.useState(false);
    const [savedSection, setSavedSection] = React.useState<string | null>(null);

    React.useEffect(() => {
        if (initialSettings) {
            setTrialSettings(initialSettings);
        }
    }, [initialSettings]);

    const handleSaveTrialSettings = async () => {
        if (!trialSettings) return;

        const formData: SuperAdminTypes.SettingTypes.TrialSettingsTypes.TrialSettingsFormData = {
            duration: trialSettings.duration,
            description: trialSettings.description
        };

        const onSuccess = (result: any) => {
            if (result?.data) {
                setTrialSettings(result.data);
            }
            setSavedSection('trial');
            setTimeout(() => setSavedSection(null), 2000);
        };

        if (trialSettings?._id) {
            await ServerActions.HandleFunction.handleEditCommon({
                formData,
                editingItem: trialSettings,
                getId: (item: any) => item._id,
                updateAction: (_: any, data: any) => ServerActions.ServerActionslib.updateTrialSettingsAction(data),
                setLoading: setIsLoading,
                setShowEditModal: () => { },
                setEditingItem: () => { },
                router,
                successMessage: "Trial settings updated successfully.",
                onSuccess
            });
        } else {
            await ServerActions.HandleFunction.handleAddCommon({
                formData,
                createAction: (data: any) => ServerActions.ServerActionslib.updateTrialSettingsAction(data),
                setLoading: setIsLoading,
                setShowModal: () => { },
                router,
                successMessage: "Trial settings saved successfully.",
                onSuccess
            });
        }
    };

    if (isLoading && !trialSettings) {
        return <div className="p-8 text-center text-gray-500">Loading trial settings...</div>;
    }

    return (
        <div className='m-4'>
            <div className="space-y-4">
                <div>
                    <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="trialDays">Trial Days</WebComponents.UiComponents.UiWebComponents.FormLabel>
                    <WebComponents.UiComponents.UiWebComponents.FormInput
                        id="trialDays"
                        type="number"
                        value={trialSettings?.duration?.toString() || '0'}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTrialSettings((prev: any) => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
                    />
                </div>

                <div>
                    <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="trialDescription">Trial Description</WebComponents.UiComponents.UiWebComponents.FormLabel>
                    <textarea
                        id="trialDescription"
                        value={trialSettings?.description || ''}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setTrialSettings((prev: any) => ({ ...prev, description: e.target.value }))}
                        rows={3}
                        className="h-[44px] w-full rounded-[4px] border-[0.6px] border-[#D8D9D9] dark:border-gray-600 bg-textMain2 dark:bg-gray-800 pl-3 pr-3 text-textMain dark:text-white font-interTight font-medium text-sm leading-[14px] placeholder:text-textSmall dark:placeholder-gray-400 placeholder:font-interTight placeholder:font-normal placeholder:text-sm placeholder:leading-[14px] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 min-h-[100px] resize-vertical"
                    />
                </div>
            </div>
            <div className="mt-8">
                <WebComponents.UiComponents.UiWebComponents.SaveButtonWithStatus
                    onClick={handleSaveTrialSettings}
                    showStatus={savedSection === 'trial'}
                >
                    {Constants.superadminConstants.savetrialsettings}
                </WebComponents.UiComponents.UiWebComponents.SaveButtonWithStatus>
            </div>
        </div>
    );
};

export default Trial;
