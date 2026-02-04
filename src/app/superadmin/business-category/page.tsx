import { WebComponents } from "@/components";
import { ServerActions } from "@/lib/server-lib";
import { SearchParams } from "@/types/SearchParams";

export default async function SuperadminBusinessCategory({
  searchParams,
}: {
  // searchParams: { page?: string; limit?: string; search?: string };
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);
  const limit = parseInt(params.limit || "10", 10);
  const search = typeof params.search === "string" && params.search.trim() !== ""
    ? params.search.trim()
    : undefined;
  const isActive = params.isActive;

  const response = await ServerActions.ServerApilib.ssrBusinessCategoriesAPI.getAll(page, limit, search, isActive);
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
    <WebComponents.SuperAdminComponents.SuperadminWebComponents.SuperadminBusinessCategoryWebComponents.BusinessCategoryComponent
      initialCategories={data}
      initialPagination={pagination}
    />
  );
}
