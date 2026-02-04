import { ServerActions } from "@/lib/server-lib";
import { SearchParams } from "@/types/SearchParams";
import { WebComponents } from "@/components";

export default async function AdminInventoryProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);
  const limit = parseInt(params.limit || "10", 10);
  const isActiveParam = (params as any).isActive;
  const isActive = isActiveParam === "true" ? true : isActiveParam === "false" ? false : undefined;
  const categoryId = params.categoryId;
  const search = typeof params.search === "string" && params.search.trim() !== ""
    ? params.search.trim()
    : undefined;

  // Parallelize all API calls for better performance
  const [
    productsResult,
    storeResult,
    categoryResult,
    subCategoryResult,
    brandResult,
    unitResult,
    warrentyResult,
    variationsResult,
    taxesResult
  ] = await Promise.all([
    ServerActions.ServerApilib.ssrProductAPI.getAll(page, limit, search, isActive, categoryId).catch((err: any) => {
      console.error("Failed to fetch products:", err);
      return null;
    }),
    ServerActions.ServerApilib.ssrStoreAPI.getActive().catch((err: any) => {
      console.error("Failed to fetch stores:", err);
      return null;
    }),
    ServerActions.ServerApilib.ssrProductCategoryAPI.getActive().catch((err: any) => {
      console.error("Failed to fetch categories:", err);
      return null;
    }),
    ServerActions.ServerApilib.ssrProductSubCategoryAPI.getActive().catch((err: any) => {
      console.error("Failed to fetch subcategories:", err);
      return null;
    }),
    ServerActions.ServerApilib.ssrBrandAPI.getActive().catch((err: any) => {
      console.error("Failed to fetch brands:", err);
      return null;
    }),
    ServerActions.ServerApilib.ssrUnitAPI.getActive().catch((err: any) => {
      console.error("Failed to fetch units:", err);
      return null;
    }),
    ServerActions.ServerApilib.ssrWarrentyAPI.getActive().catch((err: any) => {
      console.error("Failed to fetch warranties:", err);
      return null;
    }),
    ServerActions.ServerApilib.ssrVariantsAPI.getActive().catch((err: any) => {
      console.error("Failed to fetch variations:", err);
      return null;
    }),
    ServerActions.ServerApilib.ssrAdminTaxAPI.getActive().catch((err: any) => {
      console.error("Failed to fetch taxes:", err);
      return null;
    }),
  ]);

  // Extract data from successful responses, with fallback for failed requests
  const products = (productsResult)?.data?.data?.products || [];
  const pagination = (productsResult)?.data?.data?.pagination || {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: limit,
    hasNext: false,
    hasPrev: false,
  };

  const stores = (storeResult)?.data?.data?.stores || [];
  const categories = (categoryResult)?.data?.data || [];
  const subCategories = (subCategoryResult)?.data?.data || [];
  const brands = (brandResult)?.data?.data || [];
  const units = (unitResult)?.data?.data || [];
  const warrenties = (warrentyResult)?.data?.data || [];
  const variations = (variationsResult)?.data?.data || [];
  const taxes = (taxesResult)?.data?.data || [];

  return <WebComponents.AdminComponents.AdminWebComponents.InventoryWebComponents.Products initialProducts={products}
    initialPagination={pagination}
    initialCategories={categories}
    initialSubCategories={subCategories}
    initialBrands={brands}
    initialUnits={units}
    initialWarrenties={warrenties}
    initialStores={stores}
    initialVariations={variations}
    initialTaxes={taxes} />;
}

