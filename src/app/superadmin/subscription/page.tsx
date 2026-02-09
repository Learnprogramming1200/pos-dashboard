import { WebComponents } from "@/components";
import { ServerActions } from "@/lib/server-lib";
import { SearchParams } from "@/types/SearchParams";

export default async function SuperadminSubscription({
    searchParams,
}: {
    searchParams: Promise<SearchParams>;
}) {
    const params = await searchParams;
    const page = parseInt(params.page || '1', 10);
    const limit = parseInt(params.limit || '10', 10);
    const search = typeof params.search === 'string' && params.search.trim() !== ''
        ? params.search.trim()
        : undefined;
    const status = params.status;

    const subsRes = await ServerActions.ServerApilib.ssrSubscriptionsAPI.getAll(page, limit, search, status);
    const data = subsRes?.data?.data?.data || [];
    const summaryData = subsRes?.data?.data?.summary
    const pagination = subsRes?.data?.data?.pagination || {
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: limit,
        hasNext: false,
        hasPrev: false,
    };
    
    return (
        <WebComponents.SuperAdminComponents.SuperadminWebComponents.SuperadminSubscriptionWebComponents.SubscriptionComponent
            initialSubscriptions={data}
            initialPagination={pagination}
            summary={summaryData}
        />
    );
}
