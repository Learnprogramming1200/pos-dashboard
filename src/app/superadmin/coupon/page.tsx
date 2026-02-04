import { WebComponents } from "@/components";
import { ServerActions } from "@/lib/server-lib";
import { SearchParams } from "@/types/SearchParams";

export default async function SuperadminCoupon({
    searchParams,
}: {
    searchParams: Promise<SearchParams>;
    // searchParams: { page?: string; limit?: string; search?: string };

}) {
    const params = await searchParams;

    const page = parseInt(params.page || '1', 10);
    const limit = parseInt(params.limit || '10', 10);
    const search = typeof params.search === 'string' && params.search.trim() !== ''
        ? params.search.trim()
        : undefined;
    const isActive = params.isActive;
    const category = params.category;
    const type=params.type
    const [couponsRes, plansRes] = await Promise.all([
        ServerActions.ServerApilib.ssrCouponsAPI.getAll(page, limit, search, isActive, category,type),
        ServerActions.ServerApilib.ssrPlansAPI.getAll(),
        // ServerActions.ServerApilib.ssrCurrencySettingsAPI.getPrimary(),
    ]);
    const data = couponsRes?.data?.data?.data || [];
    const pagination = couponsRes?.data?.data?.pagination || {
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: limit,
        hasNext: false,
        hasPrev: false,
    };
    const plans = plansRes?.data?.data?.data || plansRes?.data?.data || plansRes?.data || []
     const currencyData=couponsRes?.data?.data?.currency
    return <WebComponents.SuperAdminComponents.SuperadminWebComponents.SuperadminCouponWebComponents.CouponComponent 
    initialCoupons={data} 
    initialPlans={plans} 
    initialPagination={pagination} 
    primaryCurrency={currencyData} />;
}
