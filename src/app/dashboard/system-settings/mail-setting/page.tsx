import { WebComponents } from "@/components";
import { ServerActions } from "@/lib/server-lib";
import { PageGuard } from "@/components/guards/page-guard";

export default async function MailPage() {
  try {
    const response = await ServerActions.ServerApilib.ssrTenantMailSettingAPI.getAll();
    const mailSetting = response?.data?.data || null;
    return (
      <WebComponents.AdminComponents.AdminWebComponents.SystemSettingsWebComponents.MailSetting
        initialMailSetting={mailSetting}
      />
    );
  } catch (error) {
    console.error("Error fetching mail settings:", error);
    return (
      <PageGuard permissionKey="settings.mail">
        <WebComponents.AdminComponents.AdminWebComponents.SystemSettingsWebComponents.MailSetting
          initialMailSetting={null}
        />
      </PageGuard>
    );
  }
}