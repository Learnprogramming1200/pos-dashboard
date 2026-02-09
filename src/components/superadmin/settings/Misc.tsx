import React from 'react';
import { Constants } from '@/constant';
import { WebComponents } from '@/components';
import timezonesData from '@/constant/timezone.json';
import { ServerActions } from '@/lib';
import { toast } from 'react-toastify';
import { SuperAdminTypes } from '@/types';

import { useRouter } from 'next/navigation';

// Helper function to convert UI timeFormat (12h/24h) to server format (12/24)
const convertTimeFormatToServer = (uiFormat: string): string => {
    return uiFormat.replace('h', '');
};

// Helper function to convert server timeFormat (12/24) to UI format (12h/24h)
const convertTimeFormatToUI = (serverFormat: string): string => {
    return serverFormat.includes('h') ? serverFormat : `${serverFormat}h`;
};

// Helper function to convert timezone name to UTC offset format (e.g., "+05:30")
const getUTCOffsetFromTimezone = (timezoneName: string): string => {
    const timezone = timezonesData.find(tz => tz.value === timezoneName);
    if (!timezone) {
        return '+00:00'; // Default to UTC if timezone not found
    }

    const offset = timezone.offset;
    const hours = Math.floor(Math.abs(offset));
    const minutes = Math.round((Math.abs(offset) - hours) * 60);

    const sign = offset >= 0 ? '+' : '-';
    const hoursStr = hours.toString().padStart(2, '0');
    const minutesStr = minutes.toString().padStart(2, '0');

    return `${sign}${hoursStr}:${minutesStr}`;
};

const Misc = ({ miscSettings: initialSettings }: { miscSettings: SuperAdminTypes.SettingTypes.MiscSettingsTypes.MiscSettings | null }) => {
    const router = useRouter();
    const [miscSettings, setMiscSettings] = React.useState<SuperAdminTypes.SettingTypes.MiscSettingsTypes.MiscSettings | null>(initialSettings);
    const [isLoading, setIsLoading] = React.useState(false);
    const [savedSection, setSavedSection] = React.useState<string | null>(null);

    // Form state
    const [darkMode, setDarkMode] = React.useState(true);
    const [maintenanceMode, setMaintenanceMode] = React.useState(false);
    const [timezone, setTimezone] = React.useState('UTC');
    const [dateFormat, setDateFormat] = React.useState('MM/DD/YYYY');
    const [timeFormat, setTimeFormat] = React.useState('12h');
    const [dataTableRow, setDataTableRow] = React.useState<number | string>(25);
    const [subscriptionExpiryAlerts, setSubscriptionExpiryAlerts] = React.useState(7);

    React.useEffect(() => {
        if (initialSettings) {
            setMiscSettings(initialSettings);
            const data = initialSettings;
            setDarkMode(data.darkMode);
            setMaintenanceMode(data.isMaintenanceMode);
            setTimezone(data.timeZone || 'UTC');
            setDateFormat(data.dateFormat || 'MM/DD/YYYY');
            setTimeFormat(convertTimeFormatToUI(data.timeFormat || '12'));
            setDataTableRow(data.dataTableRow || 25);
            setSubscriptionExpiryAlerts(data.subscriptionExpiryAlerts || 7);
        }
    }, [initialSettings]);

    const handleSaveMiscSettings = async () => {
        const timeFormatValue = convertTimeFormatToServer(timeFormat);
        const utcOffset = getUTCOffsetFromTimezone(timezone);

        const formData: SuperAdminTypes.SettingTypes.MiscSettingsTypes.MiscSettingsFormData = {
            timeZone: timezone,
            UTC: utcOffset,
            dateFormat: dateFormat,
            timeFormat: timeFormatValue,
            dataTableRow: dataTableRow === 'All' ? 999999 : (typeof dataTableRow === 'string' ? parseInt(dataTableRow) : dataTableRow),
            subscriptionExpiryAlerts: subscriptionExpiryAlerts,
        };

        const onSuccess = (result: any) => {
            if (result?.data) {
                const data = Array.isArray(result.data) ? result.data[0] : (result.data.data && Array.isArray(result.data.data) ? result.data.data[0] : result.data.data || result.data);
                setMiscSettings(data);
            }
            setSavedSection('misc');
            setTimeout(() => setSavedSection(null), 2000);
        };

        if (miscSettings?._id) {
            await ServerActions.HandleFunction.handleEditCommon({
                formData,
                editingItem: miscSettings,
                getId: (item: any) => item._id,
                updateAction: (_, data) => ServerActions.ServerActionslib.updateMiscSetting(data as any),
                setLoading: setIsLoading,
                setShowEditModal: () => { },
                setEditingItem: () => { },
                router,
                successMessage: "Miscellaneous settings saved successfully.",
                onSuccess
            });
        } else {
            await ServerActions.HandleFunction.handleAddCommon({
                formData,
                createAction: (data) => ServerActions.ServerActionslib.updateMiscSetting(data as any),
                setLoading: setIsLoading,
                setShowModal: () => { },
                router,
                successMessage: "Miscellaneous settings saved successfully.",
                onSuccess
            });
        }
    };

    const handleToggleDarkMode = async () => {
        if (!miscSettings) return;

        const originalDarkMode = darkMode;
        setDarkMode(!originalDarkMode);

        await ServerActions.HandleFunction.handleEditCommon({
            formData: {},
            editingItem: miscSettings,
            getId: (item) => item._id,
            updateAction: () => ServerActions.ServerActionslib.darkModeEnableToggle(),
            setLoading: setIsLoading,
            setShowEditModal: () => { },
            setEditingItem: () => { },
            router,
            successMessage: `Dark mode ${!originalDarkMode ? 'enabled' : 'disabled'} successfully!`,
            onSuccess: (result) => {
                if (result?.data) {
                    const data = Array.isArray(result.data) ? result.data[0] : (result.data.data && Array.isArray(result.data.data) ? result.data.data[0] : result.data.data || result.data);
                    setMiscSettings(data);
                }
            },
            onError: () => {
                setDarkMode(originalDarkMode);
            }
        });
    };

    const handleToggleMaintenanceMode = async () => {
        if (!miscSettings) return;

        const originalMaintenanceMode = maintenanceMode;
        setMaintenanceMode(!originalMaintenanceMode);

        await ServerActions.HandleFunction.handleEditCommon({
            formData: {},
            editingItem: miscSettings,
            getId: (item) => item._id,
            updateAction: () => ServerActions.ServerActionslib.maintenanceModeToggle(),
            setLoading: setIsLoading,
            setShowEditModal: () => { },
            setEditingItem: () => { },
            router,
            successMessage: `Maintenance mode ${!originalMaintenanceMode ? 'enabled' : 'disabled'} successfully!`,
            onSuccess: (result) => {
                if (result?.data) {
                    const data = Array.isArray(result.data) ? result.data[0] : (result.data.data && Array.isArray(result.data.data) ? result.data.data[0] : result.data.data || result.data);
                    setMiscSettings(data);
                }
            },
            onError: () => {
                setMaintenanceMode(originalMaintenanceMode);
            }
        });
    };

    if (isLoading && !miscSettings) {
        return <div className="p-8 text-center text-gray-500">Loading miscellaneous settings...</div>;
    }

    return (
        <div className='m-4'>
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{Constants.superadminConstants.enabledarkmode}</label>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{Constants.superadminConstants.allowusertoggledarkmode}</p>
                    </div>
                    <WebComponents.UiComponents.UiWebComponents.Switch
                        checked={darkMode}
                        onCheckedChange={handleToggleDarkMode}
                    />
                </div>

                <div className="flex items-center justify-between">
                    <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{Constants.superadminConstants.maintenancemode}</label>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{Constants.superadminConstants.maintenancemodebio}</p>
                    </div>
                    <WebComponents.UiComponents.UiWebComponents.Switch
                        checked={maintenanceMode}
                        onCheckedChange={handleToggleMaintenanceMode}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="timezone">{Constants.superadminConstants.timezone}</WebComponents.UiComponents.UiWebComponents.FormLabel>
                        <WebComponents.UiComponents.UiWebComponents.FormDropdown
                            id="timezone"
                            value={timezone}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setTimezone(e.target.value)}
                        >
                            {timezonesData.map((tz, index) => (
                                <WebComponents.UiComponents.UiWebComponents.FormOption key={`${tz.value}-${index}`} value={tz.value}>
                                    {tz.text}
                                </WebComponents.UiComponents.UiWebComponents.FormOption>
                            ))}
                        </WebComponents.UiComponents.UiWebComponents.FormDropdown>
                    </div>

                    <div>
                        <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="dateFormat">{Constants.superadminConstants.dateformat}</WebComponents.UiComponents.UiWebComponents.FormLabel>
                        <WebComponents.UiComponents.UiWebComponents.FormDropdown
                            id="dateFormat"
                            value={dateFormat}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setDateFormat(e.target.value)}
                        >
                            <WebComponents.UiComponents.UiWebComponents.FormOption value="MM/DD/YYYY">MM/DD/YYYY</WebComponents.UiComponents.UiWebComponents.FormOption>
                            <WebComponents.UiComponents.UiWebComponents.FormOption value="DD/MM/YYYY">DD/MM/YYYY</WebComponents.UiComponents.UiWebComponents.FormOption>
                            <WebComponents.UiComponents.UiWebComponents.FormOption value="YYYY-MM-DD">YYYY-MM-DD</WebComponents.UiComponents.UiWebComponents.FormOption>
                            <WebComponents.UiComponents.UiWebComponents.FormOption value="MM-DD-YYYY">MM-DD-YYYY</WebComponents.UiComponents.UiWebComponents.FormOption>
                            <WebComponents.UiComponents.UiWebComponents.FormOption value="DD-MM-YYYY">DD-MM-YYYY</WebComponents.UiComponents.UiWebComponents.FormOption>
                        </WebComponents.UiComponents.UiWebComponents.FormDropdown>
                    </div>

                    <div>
                        <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="timeFormat">{Constants.superadminConstants.timeformat}</WebComponents.UiComponents.UiWebComponents.FormLabel>
                        <WebComponents.UiComponents.UiWebComponents.FormDropdown
                            id="timeFormat"
                            value={timeFormat}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setTimeFormat(e.target.value)}
                        >
                            <WebComponents.UiComponents.UiWebComponents.FormOption value="12h">12 Hour (AM/PM)</WebComponents.UiComponents.UiWebComponents.FormOption>
                            <WebComponents.UiComponents.UiWebComponents.FormOption value="24h">24 Hour</WebComponents.UiComponents.UiWebComponents.FormOption>
                        </WebComponents.UiComponents.UiWebComponents.FormDropdown>
                    </div>

                    <div>
                        <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="dataTableRows">
                            Datatable Rows
                        </WebComponents.UiComponents.UiWebComponents.FormLabel>
                        <WebComponents.UiComponents.UiWebComponents.FormDropdown
                            id="dataTableRows"
                            value={dataTableRow?.toString()}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setDataTableRow(e.target.value === 'All' ? 'All' : parseInt(e.target.value) || 25)}
                        >
                            <WebComponents.UiComponents.UiWebComponents.FormOption value="5">5</WebComponents.UiComponents.UiWebComponents.FormOption>
                            <WebComponents.UiComponents.UiWebComponents.FormOption value="10">10</WebComponents.UiComponents.UiWebComponents.FormOption>
                            <WebComponents.UiComponents.UiWebComponents.FormOption value="25">25</WebComponents.UiComponents.UiWebComponents.FormOption>
                            <WebComponents.UiComponents.UiWebComponents.FormOption value="50">50</WebComponents.UiComponents.UiWebComponents.FormOption>
                            <WebComponents.UiComponents.UiWebComponents.FormOption value="100">100</WebComponents.UiComponents.UiWebComponents.FormOption>
                            <WebComponents.UiComponents.UiWebComponents.FormOption value="All">All</WebComponents.UiComponents.UiWebComponents.FormOption>
                        </WebComponents.UiComponents.UiWebComponents.FormDropdown>
                    </div>

                    <div>
                        <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="subscriptionExpiryAlerts">{Constants.superadminConstants.subscriptionexpiryalert}</WebComponents.UiComponents.UiWebComponents.FormLabel>
                        <WebComponents.UiComponents.UiWebComponents.FormInput
                            id="subscriptionExpiryAlerts"
                            type="number"
                            min="1"
                            max="365"
                            value={subscriptionExpiryAlerts?.toString() || '7'}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSubscriptionExpiryAlerts(parseInt(e.target.value) || 7)}
                        />
                    </div>

                </div>
            </div>
            <div className="mt-6">
                <WebComponents.UiComponents.UiWebComponents.SaveButtonWithStatus
                    onClick={handleSaveMiscSettings}
                    showStatus={savedSection === 'misc'}
                    disabled={isLoading}
                >
                    {Constants.superadminConstants.save}
                </WebComponents.UiComponents.UiWebComponents.SaveButtonWithStatus>
            </div>
        </div>
    );
};

export default Misc;
