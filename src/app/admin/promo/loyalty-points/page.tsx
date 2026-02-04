import { WebComponents } from "@/components";
import { ServerActions } from "@/lib/server-lib";
import { SearchParams } from "@/types/SearchParams";

export default async function LoyaltyPointsPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<SearchParams>;
}>) {
  const params = await searchParams;
  const page = Number.parseInt(params.page || "1", 10);
  const limit = Number.parseInt(params.limit || "10", 10);
  const type = params.type || "Loyalty";
  const isActive = params.isActive;
  const search = typeof params.search === "string" && params.search.trim() !== ""
    ? params.search.trim()
    : undefined;
  let loyaltyData = [];
  let redeemData = [];
  let pagination = {
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  };

  if (type === "Redeem") {
    const redeemResponse = await ServerActions.ServerApilib.ssrLoyaltyPointsRedeemAPI.getAll(page, limit, search, isActive).catch((err: any) => {
      console.error("Failed to fetch redeem points:", err);
      return null;
    });
    redeemData = redeemResponse?.data?.data?.data || [];
    pagination = redeemResponse?.data?.data?.pagination || pagination;
  } else {
    const loyaltyResponse = await ServerActions.ServerApilib.ssrLoyaltyPointsAPI.getAll(page, limit, search, isActive).catch((err: any) => {
      console.error("Failed to fetch loyalty points:", err);
      return null;
    });
    loyaltyData = loyaltyResponse?.data?.data?.data || [];
    pagination = loyaltyResponse?.data?.data?.pagination || pagination;
  }

  return (
    <WebComponents.AdminComponents.AdminWebComponents.AdminPromoWebComponents.LoyaltyPointsConfig
      initialLoyaltyPoints={loyaltyData}
      initialRedeems={redeemData}
      initialPagination={pagination}
    />
  );
}


