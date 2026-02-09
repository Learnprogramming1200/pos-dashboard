import { WebComponents } from "@/components";
import { ServerActions } from "@/lib/server-lib";

export default async function NotificationListPage() {
    const notifications = await ServerActions.ServerApilib.ssrSuperAdminNotificationAPI.getAll();
    const notificationResponse = notifications?.data || [];
    return (<WebComponents.SuperAdminComponents.SuperadminWebComponents.SuperadminNotificationsWebComponents.NotificationList initialData={notificationResponse} />);
}
