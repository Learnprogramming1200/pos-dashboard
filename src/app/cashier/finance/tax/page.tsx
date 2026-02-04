import { WebComponents } from "@/components";
import { ServerActions } from "@/lib/server-lib";
import { SearchParamsTypes } from "@/types";

export default async function AdminTaxPage({ searchParams }: { searchParams: SearchParamsTypes.SearchParams }) {
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);
  const limit = parseInt(params.limit || "10", 10);
  const search = params.search;
  const isActive = params.isActive
  const type = params.type

  const response = await ServerActions.ServerApilib.ssrAdminTaxAPI.getAll(page, limit, search, isActive, type);
  const taxes = response?.data?.data?.data || [];
  const pagination = response?.data?.data?.pagination || {
    currentPage: page,
    itemsPerPage: limit,
    totalItems: taxes.length,
    totalPages: 1
  };
  return (
    <WebComponents.AdminComponents.AdminWebComponents.FinanceAdminWebComponents.TaxManagement
      initialTaxes={taxes}
      initialPagination={pagination}
    />
  );
}
