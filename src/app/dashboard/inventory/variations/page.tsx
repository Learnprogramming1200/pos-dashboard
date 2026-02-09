import { ServerActions } from "@/lib/server-lib";
import { SearchParams } from "@/types/SearchParams";
import { PageGuard } from "@/components/guards/page-guard";
// Direct import for better code-splitting
import Variant from "@/components/admin/inventory/variant";

export default async function AdminInventoryVariant({
    searchParams,
}: {
    searchParams: Promise<SearchParams>;
}) {
    const params = await searchParams;
    const page = parseInt(params.page ?? "1", 10);
    const limit = parseInt(params.limit ?? "10", 10);
    const isActive = params.isActive;

    const search =
        typeof params.search === "string" && params.search.trim() !== ""
            ? params.search.trim()
            : undefined;

    const response = await ServerActions.ServerApilib.ssrVariantsAPI.getAll(
        page,
        limit,
        search,
        isActive
    );
    const data = response?.data?.data?.data ?? [];
    const pagination = response?.data?.data?.pagination ?? {
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: limit,
        hasNext: false,
        hasPrev: false,
    };

    return (
        <PageGuard permissionKey="inventory.variations">
            <Variant
                initialVariants={data}
                initialPagination={pagination}
            />
        </PageGuard>
    );
}
