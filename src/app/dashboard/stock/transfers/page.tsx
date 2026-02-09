import { ssrProductAPI, ssrProductSubCategoryAPI, ssrStoreAPI, ssrStockTransferAPI } from "@/lib/ssr-api";
import { ssrProductCategoryAPI } from "@/lib/ssr-api";
import { SearchParamsTypes } from "@/types";
import { PageGuard } from "@/components/guards/page-guard";
// Direct import for better code-splitting
import StockTransfers from "@/components/admin/stock/StockTransfers";

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
    transferResult,
    storeResult,
    categoryResult,
    subCategoryResult,
    productResult
  ] = await Promise.all([
    ssrStockTransferAPI.getAll(page, limit, search, status, storeId).catch((err: any) => {
      console.error("Failed to fetch transfers:", err);
      return null;
    }),
    ssrStoreAPI.getAll().catch((err: any) => {
      console.error("Failed to fetch stores:", err);
      return null;
    }),
    ssrProductCategoryAPI.getAll().catch((err: any) => {
      console.error("Failed to fetch categories:", err);
      return null;
    }),
    ssrProductSubCategoryAPI.getAll().catch((err: any) => {
      console.error("Failed to fetch subcategories:", err);
      return null;
    }),
    ssrProductAPI.getAll().catch((err: any) => {
      console.error("Failed to fetch products:", err);
      return null;
    }),
  ]);

  // Extract data from successful responses with fallbacks
  const data = transferResult?.data?.data?.data || [];
  const pagination = transferResult?.data?.data?.pagination || {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: limit,
    hasNext: false,
    hasPrev: false,
  };

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

  return (
    <PageGuard permissionKey="stock.transfers">
      <StockTransfers
        intialStockTransfers={data}
        stores={storeData}
        categories={categoryData}
        subcategories={subCategoryData}
        products={productData}
        initialPagination={pagination}
      />
    </PageGuard>
  );
}
