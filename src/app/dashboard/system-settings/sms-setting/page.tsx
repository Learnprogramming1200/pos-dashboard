import { WebComponents } from "@/components";
import { ServerActions } from "@/lib/server-lib";
import { PageGuard } from "@/components/guards/page-guard";

export default async function SmsSettingPage() {
    try {
        const response = await ServerActions.ServerApilib.ssrTenantSmsSettingAPI.getAll();
        const smsSetting = response?.data?.data || null;
        return (
            <WebComponents.AdminComponents.AdminWebComponents.SystemSettingsWebComponents.SmsSetting
                initialSmsSetting={smsSetting}
            />
        );
    } catch (error) {
        console.error("Error fetching sms settings:", error);
        return (
            <PageGuard permissionKey="settings.sms">
                <WebComponents.AdminComponents.AdminWebComponents.SystemSettingsWebComponents.SmsSetting
                    initialSmsSetting={null}
                />
            </PageGuard>
        );
    }
}