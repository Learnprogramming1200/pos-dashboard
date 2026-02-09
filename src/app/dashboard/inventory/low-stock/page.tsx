import { ServerActions } from "@/lib/server-lib";
import { SearchParams } from "@/types/SearchParams";
import { PageGuard } from "@/components/guards/page-guard";
// Direct import for better code-splitting
import LowStock from "@/components/admin/inventory/low-stock";

export default async function AdminInventoryLowStock({
    searchParams,
}: {
    searchParams: Promise<SearchParams>;
}) {
    const params = await searchParams;
    const page = parseInt(params.page ?? "1", 10);
    const limit = parseInt(params.limit ?? "10", 10);

    const search =
        typeof params.search === "string" && params.search.trim() !== ""
            ? params.search.trim()
            : undefined;

    const response = await ServerActions.ServerApilib.ssrLowStockAPI.getAll(
        page,
        limit,
        search
    );
    const data = response?.data?.data?.products ?? [];
    const pagination = response?.data?.data?.pagination ?? {
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: limit,
        hasNext: false,
        hasPrev: false,
    };

    return (
        <PageGuard permissionKey="inventory.lowstock">
            <LowStock
                initialLowStockItems={data}
                initialPagination={pagination}
            />
        </PageGuard>
    );
}
