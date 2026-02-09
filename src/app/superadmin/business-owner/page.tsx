import { WebComponents } from "@/components";
import { ServerActions } from "@/lib/server-lib";
import { SearchParams } from "@/types/SearchParams";

export default async function SuperadminBusinessOwner({
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

    const categoryId =
        typeof params.categoryId === "string" && params.categoryId.trim() !== ""
            ? params.categoryId
            : undefined;

    const [response, responseForCategories] = await Promise.all([
        ServerActions.ServerApilib.ssrBusinessOwnersAPI.getAll(
            page,
            limit,
            search,
            isActive,
            categoryId
        ),
        ServerActions.ServerApilib.ssrBusinessCategoriesAPI.getAll(),
    ]);

    const data = response?.data?.data?.data ?? [];
    const pagination = response?.data?.data?.pagination ?? {
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: limit,
        hasNext: false,
        hasPrev: false,
    };
    const categories = responseForCategories?.data?.data?.data ?? [];
    return (
        <WebComponents.SuperAdminComponents.SuperadminWebComponents.SuperadminBusinessOwnerWebComponents.BusinessOwnerComponent
            initialBusinessOwners={data}
            initialCategories={categories}
            initialPagination={pagination}
        />
    );
}
