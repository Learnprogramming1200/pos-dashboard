import { WebComponents } from "@/components";
import { PageGuard } from "@/components/guards/page-guard";


export default function RolesPermissionPage() {
  return (
    <PageGuard permissionKey="access.roles">
      <WebComponents.AdminComponents.AdminWebComponents.AdminUserManagementWebComponents.RolesPermission />
    </PageGuard>
  );
}


