import { WebComponents } from "@/components";
import { ssrExpenseCategoryAPI } from "@/lib/ssr-api";
import { SearchParamsTypes } from "@/types";

export default async function ExpenseCategoryPage({ searchParams }: { searchParams: SearchParamsTypes.SearchParams }) {
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);
  const limit = parseInt(params.limit || "10", 10);
  const search = params.search as string || "";
  const isActive = params.isActive

  const response = await ssrExpenseCategoryAPI.getAll(page, limit, search, isActive);
  const data = response?.data?.data?.data || [];
  const pagination = response?.data?.data?.pagination || {
    currentPage: page,
    itemsPerPage: limit,
    totalItems: data.length,
    totalPages: Math.ceil(data.length / limit)
  };

  return (
    <WebComponents.AdminComponents.AdminWebComponents.FinanceAdminWebComponents.ExpenseCategoryManagement
      initialCategories={data}
      initialPagination={pagination}
    />
  );
}
