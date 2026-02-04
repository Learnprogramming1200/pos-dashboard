import { ServerActions } from "@/lib/server-lib";
import { WebComponents } from "@/components";
import { SearchParamsTypes } from "@/types";
export default async function Page({ searchParams }: { searchParams: Promise<SearchParamsTypes.SearchParams> }) {
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);
  const limit = parseInt(params.limit || "10", 10);
  const status = params.status;
  const storeId = params.storeId;
  const search = typeof params.search === "string" && params.search.trim() !== ""
    ? params.search.trim()
    : undefined;

  // Parallelize all API calls for better performance
  const [
    adjustmentResult,
    storeResult,
    categoryResult,
    subCategoryResult,
    productResult
  ] = await Promise.all([
    ServerActions.ServerApilib.ssrStockAdjustmentAPI.getAll(page, limit, search, status, storeId).catch((err: any) => {
      console.error("Failed to fetch adjustments:", err);
      return null;
    }),
    ServerActions.ServerApilib.ssrStoreAPI.getAll().catch((err: any) => {
      console.error("Failed to fetch stores:", err);
      return null;
    }),
    ServerActions.ServerApilib.ssrProductCategoryAPI.getAll().catch((err: any) => {
      console.error("Failed to fetch categories:", err);
      return null;
    }),
    ServerActions.ServerApilib.ssrProductSubCategoryAPI.getAll().catch((err: any) => {
      console.error("Failed to fetch subcategories:", err);
      return null;
    }),
    ServerActions.ServerApilib.ssrProductAPI.getAll().catch((err: any) => {
      console.error("Failed to fetch products:", err);
      return null;
    }),
  ]);

  // Extract data from successful responses with fallbacks
  const adjustmentData = adjustmentResult?.data?.data?.data || [];
  const storeData = storeResult?.data?.data?.stores ||
    storeResult?.data?.stores ||
    storeResult?.data ||
    storeResult ||
    [];
  const categoryData = categoryResult?.data?.data?.data ||
    categoryResult?.data?.data ||
    categoryResult ||
    [];
  const subCategoryData = subCategoryResult?.data?.data?.data ||
    subCategoryResult?.data ||
    subCategoryResult ||
    [];
  const productData = productResult?.data?.data?.products ||
    productResult?.data?.products ||
    productResult?.data ||
    productResult ||
    [];
  const pagination = adjustmentResult?.data?.data?.pagination || {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: limit,
    hasNext: false,
    hasPrev: false,
  };
  return (
    <WebComponents.AdminComponents.AdminWebComponents.AdminStockWebComponents.StockAdjustments
      initialStockAdjustments={adjustmentData}
      initialStores={storeData}
      initialCategories={categoryData}
      initialSubcategories={subCategoryData}
      initialProducts={productData}
      initialPagination={pagination}
    />
  );
}
