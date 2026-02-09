import { PageGuard } from "@/components/guards/page-guard";
// Direct import for better code-splitting
import ExpiredStock from "@/components/admin/inventory/expired-stock";

export default function AdminInventoryExpiredStock() {
    return (
        <PageGuard permissionKey="inventory.expiredstock">
            <ExpiredStock />
        </PageGuard>
    );
}
