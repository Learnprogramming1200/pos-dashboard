import { PageGuard } from "@/components/guards/page-guard";
// Direct import for better code-splitting
import PrintLabels from "@/components/admin/inventory/print-labels";

export default function AdminInventoryPrintLabels() {
    return (
        <PageGuard permissionKey="inventory.printLabels">
            <PrintLabels />
        </PageGuard>
    );
}
