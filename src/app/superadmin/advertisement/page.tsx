import { WebComponents } from "@/components";
import { ServerActions } from "@/lib/server-lib";
import { SearchParams } from "@/types/SearchParams";

export default async function SuperadminAdvertisement({
    searchParams,
}: {
    // searchParams: { page?: string; limit?: string; search?: string };
    searchParams: Promise<SearchParams>;
}) {
    const params = await searchParams;
    const page = Number(params.page) || 1;
    const limit = Number(params.limit) || 10;
    const search = typeof params.search === 'string' ? (params.search.trim() || undefined) : undefined;
    const isActive = params.isActive;

    const response = await ServerActions.ServerApilib.ssrAdvertisementAPI.getAll(page, limit, search, isActive);
    const payload = (response as any)?.data?.data ?? (response as any)?.data ?? {};
    const data = Array.isArray(payload?.advertisements) ? payload.advertisements : [];
    const pagination = payload?.pagination ?? {
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: limit,
        hasNext: false,
        hasPrev: false,
    };

    return <WebComponents.SuperAdminComponents.SuperadminWebComponents.SuperadminAdvertisementWebComponents.AdvertisementComponent
        initialAdvertisements={data}
        initialPagination={pagination}
    />;
}
