import { WebComponents } from "@/components";
import { ServerActions } from "@/lib/server-lib";
import { PageGuard } from "@/components/guards/page-guard";

export default async function AdminMiscSetting() {
  const miscRes = await ServerActions.ServerApilib.ssrAdminMiscSettingsAPI.getAll();
  const initialMiscSettings = miscRes?.data?.data || null;

  return (
    <PageGuard permissionKey="settings.misc">
      <WebComponents.AdminComponents.AdminWebComponents.SystemSettingsWebComponents.MiscSetting
        initialMiscSettings={initialMiscSettings}
      />
    </PageGuard>
  );
}
