import { WebComponents } from "@/components";
import { ServerActions } from "@/lib/server-lib";
import { SearchParams } from "@/types/SearchParams";
export default async function SuppliersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);
  const limit = parseInt(params.limit || "10", 10);
  const isActive = params.isActive
  const search = typeof params.search === "string" && params.search.trim() !== "" ? params.search.trim() : undefined;


  const result = await ServerActions.ServerApilib.ssrSupplierAPI.getAll(page, limit, search, isActive);

  const data = result?.data?.data?.data || [];
  const pagination = result?.data?.data?.pagination || {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  };

  return (
    <WebComponents.AdminComponents.AdminWebComponents.AdminPurchaseWebComponents.SupplierManagement
      initialSuppliers={data}
      initialPagination={pagination}
    />
  );
}
