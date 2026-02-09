import { WebComponents } from "@/components";
import { ServerActions } from "@/lib/server-lib";
import { SearchParams } from "@/types/SearchParams";

export default async function SuperadminPlans({
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
    const isActive = params.isActive;
    const [plansRes, taxesRes] = await Promise.all([
        ServerActions.ServerApilib.ssrPlansAPI.getAll(page, limit, search, isActive),
        ServerActions.ServerApilib.ssrTaxAPI.getAll(),
    ]);
    const data = plansRes?.data?.data?.data || [];
    const pagination = plansRes?.data?.data?.pagination || {
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: limit,
        hasNext: false,
        hasPrev: false,
    };

    const taxes = taxesRes?.data?.data?.data || [];

    return (
        <WebComponents.SuperAdminComponents.SuperadminWebComponents.SuperadminPlanWebComponents.PlanComponent
            initialPlans={data}
            initialTaxes={taxes}
            initialPagination={pagination}
        />
    );
}
