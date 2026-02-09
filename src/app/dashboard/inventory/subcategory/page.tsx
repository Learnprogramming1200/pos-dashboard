import { ServerActions } from "@/lib/server-lib";
import { SearchParams } from "@/types/SearchParams";
import { PageGuard } from "@/components/guards/page-guard";
// Direct import for better code-splitting
import SubCategoryComponent from "@/components/admin/inventory/subcategory";

export default async function AdminInventorySubCategory({
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
  const isActive = params.isActive;
  const categoryId =
    typeof params.categoryId === "string" && params.categoryId.trim() !== ""
      ? params.categoryId
      : undefined;


  // Fetch data in parallel
  const [response, categoryResponse] = await Promise.all([
    ServerActions.ServerApilib.ssrProductSubCategoryAPI.getAll(page, limit, search, isActive, categoryId),
    ServerActions.ServerApilib.ssrProductCategoryAPI.getAll()
  ]);

  const data = response?.data?.data?.data || [];
  const pagination = response?.data?.data?.pagination || {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: limit,
    hasNext: false,
    hasPrev: false,
  };

  const categories = categoryResponse?.data?.data?.data || [];

  return (
    <PageGuard permissionKey="inventory.subcategory">
      <SubCategoryComponent initialSubCategories={data} initialCategories={categories} initialPagination={pagination} />
    </PageGuard>
  );
}
