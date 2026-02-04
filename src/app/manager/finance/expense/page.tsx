import { WebComponents } from "@/components";
import { ssrExpenseCategoryAPI, ssrExpenseAPI, ssrStoreAPI } from "@/lib/ssr-api";
import { SearchParams } from "@/types/SearchParams";

export default async function AdminFinanceExpensePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  // Avoid server-side API calls during static export or when unauthenticated
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);
  const limit = parseInt(params.limit || "10", 10);
  const status = params.status;
  const categoryId = params.categoryId;
  const search = typeof params.search === "string" && params.search.trim() !== ""
    ? params.search.trim()
    : undefined;

  const [categoryRes, expenseRes, storeRes] = await Promise.all([
    ssrExpenseCategoryAPI.getActive().catch(() => null),
    ssrExpenseAPI.getAll(page, limit, search, status, categoryId).catch(() => null),
    ssrStoreAPI.getAll().catch(() => null),
  ]);

  // "any" is intentional here (like your reference snippet) since these server API wrappers have deep nested shapes.
  const categories = categoryRes?.data?.data || [];
  const expenses = expenseRes?.data?.data?.data || [];
  const stores = storeRes?.data?.data?.stores || [];
  const pagination = expenseRes?.data?.data?.pagination || {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: limit,
    hasNext: false,
    hasPrev: false,
  };
  return (
    <WebComponents.AdminComponents.AdminWebComponents.FinanceAdminWebComponents.ExpenseManagement
      initialCategories={categories}
      initialStores={stores}
      initialExpenses={expenses}
      initialPagination={pagination}
    />
  );
}
