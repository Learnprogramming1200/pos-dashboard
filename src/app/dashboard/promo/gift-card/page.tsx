import { WebComponents } from "@/components";
import { ServerActions } from "@/lib/server-lib";
import { SearchParams } from "@/types/SearchParams";
import { PageGuard } from "@/components/guards/page-guard";


export default async function GiftCardPage({
  searchParams,
}: {
  readonly searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const page = Number.parseInt(params.page ?? "1", 10);
  const limit = Number.parseInt(params.limit ?? "10", 10);
  const isActive = params.isActive;

  const search =
    typeof params.search === "string" && params.search.trim() !== ""
      ? params.search.trim()
      : undefined;

  const response = await ServerActions.ServerApilib.ssrGiftCardAPI.getAll(
    page,
    limit,
    search,
    isActive
  );

  const giftCardsData =
    response?.data?.data?.data ||
    response?.data?.data ||
    response?.data ||
    [];
  const pagination = response?.data?.data?.pagination ?? {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: limit,
    hasNext: false,
    hasPrev: false,
  };

  return (
    <PageGuard permissionKey="promo.giftcards">
      <WebComponents.AdminComponents.AdminWebComponents.AdminPromoWebComponents.GiftCardConfig
        initialGiftCards={giftCardsData}
        initialPagination={pagination}
      />
    </PageGuard>
  );
}


