/**
 * Dashboard Products Page
 * 
 * Uses direct imports for better code-splitting (not barrel exports).
 * Server Components for data fetching, PageGuard for authorization.
 */

import { ServerActions } from '@/lib/server-lib';
import { SearchParams } from '@/types/SearchParams';
import { PageGuard } from '@/components/guards/page-guard';
// Direct import for better tree-shaking and code-splitting
import Products from '@/components/admin/inventory/products';

export default async function DashboardInventoryProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || '1', 10);
  const limit = parseInt(params.limit || '10', 10);
  const isActiveParam = (params as any).isActive;
  const isActive = isActiveParam === 'true' ? true : isActiveParam === 'false' ? false : undefined;
  const categoryId = params.categoryId;
  const search = typeof params.search === 'string' && params.search.trim() !== ''
    ? params.search.trim()
    : undefined;

  // Parallel Fetching for faster TTFB
  const [productIntialData, productsResult] = await Promise.all([
    ServerActions.ServerApilib.ssrProductAPI.getInitalProductData(),
    ServerActions.ServerApilib.ssrProductAPI.getAll(page, limit, search, isActive, categoryId)
  ]);

  console.log("Product inital data fetched in parallel");

  const stores = productIntialData?.data?.data?.stores;
  const categories = productIntialData?.data?.data?.productCategories;
  const subCategories = productIntialData?.data?.data?.subCategories;
  const brands = productIntialData?.data?.data?.brands;
  const units = productIntialData?.data?.data?.units;
  const warrenties = productIntialData?.data?.data?.warranties;
  const variations = productIntialData?.data?.data?.variants;
  const taxes = productIntialData?.data?.data?.taxes;


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


  return (
    <PageGuard permissionKey="inventory.products">
      <Products
        initialProducts={products}
        initialPagination={pagination}
        initialCategories={categories}
        initialSubCategories={subCategories}
        initialBrands={brands}
        initialUnits={units}
        initialWarrenties={warrenties}
        initialStores={stores}
        initialVariations={variations}
        initialTaxes={taxes}
      />
    </PageGuard>
  );
}
