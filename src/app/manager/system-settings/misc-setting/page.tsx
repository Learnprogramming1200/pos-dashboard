import { WebComponents } from "@/components";
import { ServerActions } from "@/lib/server-lib";

export default async function AdminMiscSetting() {
  const miscRes = await ServerActions.ServerApilib.ssrAdminMiscSettingsAPI.getAll();
  const initialMiscSettings = miscRes?.data?.data || null;

  return (
    <WebComponents.AdminComponents.AdminWebComponents.SystemSettingsWebComponents.MiscSetting
      initialMiscSettings={initialMiscSettings}
    />
  );
}
