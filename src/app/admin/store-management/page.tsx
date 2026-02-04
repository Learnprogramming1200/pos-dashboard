import { WebComponents } from "@/components";
import { ServerActions } from "@/lib/server-lib";
import { SearchParams } from "@/types/SearchParams";

export default async function StoreManagementPage({ searchParams }: {
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
    const response = await ServerActions.ServerApilib.ssrStoreAPI.getAll(page,
        limit,
        search,
        isActive);
    const pagination = response?.data?.data?.pagination ?? {
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: limit,
        hasNext: false,
        hasPrev: false,
    };
    const data = response?.data?.data?.stores || [];
    return <WebComponents.AdminComponents.AdminWebComponents.StoreManagement.StoreManagementComponent
        initialStores={data}
        initialPagination={pagination}
    />;
}
