import { WebComponents } from "@/components";
import { ServerActions } from "@/lib/server-lib";
import { SearchParams } from "@/types/SearchParams";

export default async function LoyaltyPointsHistoryPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);
  const limit = parseInt(params.limit || "10", 10);
  const search = typeof params.search === "string" && params.search.trim() !== ""
    ? params.search.trim()
    : undefined;
  const transactionType = typeof params.transactionType === "string" && params.transactionType !== "All"
    ? params.transactionType
    : undefined;

  const isActive = params.isActive !== undefined ? String(params.isActive) === "true" : undefined;
  const response = await ServerActions.ServerApilib.ssrLoyaltyPointsHistoryAPI.getAll(page, limit, search, isActive, transactionType);
  const data = response?.data?.data?.data || [];

  const pagination = response?.data?.data?.pagination || {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: limit,
    hasNext: false,
    hasPrev: false,
  };

  return (
    <WebComponents.AdminComponents.AdminWebComponents.AdminPromoWebComponents.LoyaltyPointsHistory
      initialData={data}
      initialPagination={pagination}
    />
  );
}

