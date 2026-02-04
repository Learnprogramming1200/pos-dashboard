import { WebComponents } from "@/components";
import { ServerActions } from "@/lib/server-lib";
import { SearchParams } from "@/types/SearchParams";

export default async function AdminPromoCoupon({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || '1', 10);
  const limit = parseInt(params.limit || '10', 10);
  const isActive = params.isActive;

  const search = typeof params.search === "string" && params.search.trim() !== ""
    ? params.search.trim()
    : undefined;

  const response = await ServerActions.ServerApilib.ssrAdminCouponAPI.getAll(
    page,
    limit,
    search,
    isActive
  );
  const data = response?.data?.data?.data?.data ?? [];;
  const pagination = response?.data?.data?.data?.pagination ?? {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: limit,
    hasNext: false,
    hasPrev: false,
  };

  const customerResponse = await ServerActions.ServerApilib.ssrCustomerAPI.getAllActive();
  const customers = customerResponse?.data?.data || [];

  return (
    <WebComponents.AdminComponents.AdminWebComponents.AdminPromoWebComponents.CouponManagement
      initialCoupons={data}
      initialPagination={pagination}
      initialCustomers={customers}
    />
  );
}
