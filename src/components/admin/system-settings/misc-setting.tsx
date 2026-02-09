"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { UiWebComponents } from "@/components/ui";
import { Constants } from "@/constant";
import { ServerActions } from "@/lib";
import { adminDarkModeToggleAction } from "@/lib/server-actions";
import timezonesData from '@/constant/timezone.json';

interface MiscSettings {
  timezone: string;
  dateFormat: string;
  timeFormat: string;
  darkMode?: boolean;
  dataTableRow?: number | string;
}

interface MiscSettingProps {
  initialMiscSettings?: MiscSettings | null;
}

// Helper function to convert time format from API to UI format (handles "12", "24", "12h", "24h")
const convertTimeFormatToUI = (apiFormat: string): string => {
  if (apiFormat === '12' || apiFormat === '12h') return '12h';
  if (apiFormat === '24' || apiFormat === '24h') return '24h';
  return apiFormat;
};

// Helper function to convert time format from UI to API format (sends "12" or "24")
const convertTimeFormatToAPI = (uiFormat: string): string => {
  return uiFormat.replace('h', '');
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

// Helper function to extract Misc settings from server response
const getMiscSettingsFromResponse = (data: any): MiscSettings | null => {
  if (!data) return null;

  // Handle direct settings object
  if (data.timezone || data.timeZone || data.dateFormat || data.timeFormat) {
    return {
      timezone: data.timezone || data.timeZone || 'UTC',
      dateFormat: data.dateFormat || 'MM/DD/YYYY',
      timeFormat: data.timeFormat ? convertTimeFormatToUI(data.timeFormat) : '12h',
      darkMode: data.darkMode ?? true,
      dataTableRow: data.dataTableRow ?? 25,
    };
  }

  console.warn('initialMiscSettings is not in expected format:', data);
  return null;
};

export default function MiscSetting({ initialMiscSettings }: MiscSettingProps) {
  const router = useRouter();
  const [miscSettings, setMiscSettings] = React.useState<MiscSettings | null>(
    getMiscSettingsFromResponse(initialMiscSettings)
  );
  const [settings, setSettings] = React.useState({
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    darkMode: true,
    dataTableRow: 25 as number | string,
  });
  const [loading, setLoading] = React.useState(false);

  // Sync state with props when initialMiscSettings changes
  React.useEffect(() => {
    const parsedSettings = getMiscSettingsFromResponse(initialMiscSettings);
    if (parsedSettings) {
      setMiscSettings(parsedSettings);
    }
  }, [initialMiscSettings]);

  // Sync settings state when miscSettings changes
  React.useEffect(() => {
    if (miscSettings) {
      setSettings(prev => ({
        ...prev,
        timezone: miscSettings.timezone ?? prev.timezone,
        dateFormat: miscSettings.dateFormat ?? prev.dateFormat,
        timeFormat: miscSettings.timeFormat ? convertTimeFormatToUI(miscSettings.timeFormat) : prev.timeFormat,
        darkMode: miscSettings.darkMode ?? prev.darkMode,
        dataTableRow: miscSettings.dataTableRow ?? prev.dataTableRow,
      }));
    }
  }, [miscSettings]);

  const handleSave = React.useCallback(async () => {
    setLoading(true);
    try {
      // Get UTC offset from timezone
      const utcOffset = getUTCOffsetFromTimezone(settings.timezone);
      
      const miscData = {
        timeZone: settings.timezone,
        UTC: utcOffset,
        dateFormat: settings.dateFormat,
        timeFormat: convertTimeFormatToAPI(settings.timeFormat),
        dataTableRow: settings.dataTableRow,
      };

      const result = await ServerActions.ServerActionslib.updateAdminMiscSettingAction(miscData);

      if (result.success) {
        // Update miscSettings state with server response
        if (result.data) {
          const updatedMiscSettings = getMiscSettingsFromResponse(result.data?.data || result.data);
          if (updatedMiscSettings) {
            setMiscSettings(updatedMiscSettings);
          }
        }
        UiWebComponents.SwalHelper.success({ text: 'Misc settings saved successfully!' });
        router.refresh();
      } else {
        UiWebComponents.SwalHelper.error({ text: result.error || 'Failed to save misc settings' });
      }
    } catch (error: unknown) {
      console.error('Error saving misc settings:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save misc settings';
      UiWebComponents.SwalHelper.error({ text: errorMessage });
    } finally {
      setLoading(false);
    }
  }, [settings, router]);

  const handleToggleDarkMode = React.useCallback(async (checked: boolean) => {
    const originalState = settings.darkMode;

    try {
      // Optimistically update the UI first
      setSettings(prev => ({ ...prev, darkMode: checked }));

      const result = await adminDarkModeToggleAction();

      if (result.success) {
        // Update miscSettings state with server response
        if (result.data) {
          const updatedMiscSettings = getMiscSettingsFromResponse(result.data?.data || result.data);
          if (updatedMiscSettings) {
            setMiscSettings(updatedMiscSettings);
          }
        }
        UiWebComponents.SwalHelper.success({ text: `Dark mode ${checked ? 'enabled' : 'disabled'} successfully!` });
      } else {
        // Revert the optimistic update if the server call failed
        setSettings(prev => ({ ...prev, darkMode: originalState }));
        UiWebComponents.SwalHelper.error({ text: result.error || 'Failed to toggle dark mode' });
      }
    } catch (error: unknown) {
      console.error('Error toggling dark mode:', error);
      // Revert the optimistic update if there was an error
      setSettings(prev => ({ ...prev, darkMode: originalState }));
      const errorMessage = error instanceof Error ? error.message : 'Failed to toggle dark mode';
      UiWebComponents.SwalHelper.error({ text: errorMessage });
    }
  }, [settings.darkMode]);

  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
            Misc Settings
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-300">
            Configure miscellaneous system settings
          </p>
        </div>
      </div>

      {/* Content Area */}
      <div className="bg-white dark:bg-darkFilterbar rounded-[4px] h-full w-full mt-4 overflow-visible">
        <div className="p-4">
          <div className="space-y-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{Constants.adminConstants.miscSettingStrings.enableDarkMode}</label>
                <p className="text-sm text-gray-500 dark:text-gray-400">{Constants.adminConstants.miscSettingStrings.allowUserToggleDarkMode}</p>
              </div>
              <UiWebComponents.Switch
                checked={settings.darkMode}
                onCheckedChange={handleToggleDarkMode}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <UiWebComponents.FormLabel htmlFor="timezone">Timezone</UiWebComponents.FormLabel>
              <UiWebComponents.FormDropdown
                id="timezone"
                value={settings.timezone}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setSettings(prev => ({ ...prev, timezone: e.target.value }))
                }
              >
                {timezonesData.map((tz, index) => (
                  <UiWebComponents.FormOption key={`${tz.value}-${index}`} value={tz.value}>
                    {tz.text}
                  </UiWebComponents.FormOption>
                ))}
              </UiWebComponents.FormDropdown>
            </div>

            <div>
              <UiWebComponents.FormLabel htmlFor="dateFormat">Date Format</UiWebComponents.FormLabel>
              <UiWebComponents.FormDropdown
                id="dateFormat"
                value={settings.dateFormat}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setSettings(prev => ({ ...prev, dateFormat: e.target.value }))
                }
              >
                <UiWebComponents.FormOption value="MM/DD/YYYY">MM/DD/YYYY</UiWebComponents.FormOption>
                <UiWebComponents.FormOption value="DD/MM/YYYY">DD/MM/YYYY</UiWebComponents.FormOption>
                <UiWebComponents.FormOption value="YYYY-MM-DD">YYYY-MM-DD</UiWebComponents.FormOption>
                <UiWebComponents.FormOption value="MM-DD-YYYY">MM-DD-YYYY</UiWebComponents.FormOption>
                <UiWebComponents.FormOption value="DD-MM-YYYY">DD-MM-YYYY</UiWebComponents.FormOption>
              </UiWebComponents.FormDropdown>
            </div>

            <div>
              <UiWebComponents.FormLabel htmlFor="timeFormat">Time Format</UiWebComponents.FormLabel>
              <UiWebComponents.FormDropdown
                id="timeFormat"
                value={settings.timeFormat}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setSettings(prev => ({ ...prev, timeFormat: e.target.value }))
                }
              >
                <UiWebComponents.FormOption value="12h">12 Hour (AM/PM)</UiWebComponents.FormOption>
                <UiWebComponents.FormOption value="24h">24 Hour</UiWebComponents.FormOption>
              </UiWebComponents.FormDropdown>
            </div>

            <div>
              <UiWebComponents.FormLabel htmlFor="dataTableRows">
                Data Table Rows
              </UiWebComponents.FormLabel>
              <UiWebComponents.FormDropdown
                id="dataTableRows"
                value={settings.dataTableRow?.toString()}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSettings(prev => ({ ...prev, dataTableRow: e.target.value === 'All' ? 'All' : parseInt(e.target.value) || 25 }))}
              >
                <UiWebComponents.FormOption value="5">5</UiWebComponents.FormOption>
                <UiWebComponents.FormOption value="10">10</UiWebComponents.FormOption>
                <UiWebComponents.FormOption value="25">25</UiWebComponents.FormOption>
                <UiWebComponents.FormOption value="50">50</UiWebComponents.FormOption>
                <UiWebComponents.FormOption value="100">100</UiWebComponents.FormOption>
                <UiWebComponents.FormOption value="All">All</UiWebComponents.FormOption>
              </UiWebComponents.FormDropdown>
            </div>
          </div>
          {/* Save Button - Inside content area */}
          <div className="mt-6">
            <UiWebComponents.Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              variant="default"
              type="button"
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? Constants.adminConstants.saving : Constants.adminConstants.saveButtonLabel}
            </UiWebComponents.Button>
          </div>
        </div>
      </div>
    </>
  );
}
