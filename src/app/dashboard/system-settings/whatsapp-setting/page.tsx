import { WebComponents } from "@/components";
import { ServerActions } from "@/lib/server-lib";
import { PageGuard } from "@/components/guards/page-guard";

export default async function WhatsappSettingPage() {
    try {
        const response = await ServerActions.ServerApilib.ssrTenantWhatsAppSettingAPI.getAll();
        const whatsappSetting = response?.data?.data || null;
        return (
            <WebComponents.AdminComponents.AdminWebComponents.SystemSettingsWebComponents.WhatsappSetting
                initialWhatsappSetting={whatsappSetting}
            />
        );
    } catch (error) {
        console.error("Error fetching whatsapp settings:", error);
        return (
            <PageGuard permissionKey="settings.whatsapp">
                <WebComponents.AdminComponents.AdminWebComponents.SystemSettingsWebComponents.WhatsappSetting
                    initialWhatsappSetting={null}
                />
            </PageGuard>
        );
    }
}