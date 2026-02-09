import { ServerActions } from "@/lib/server-lib";
import { SearchParams } from "@/types/SearchParams";
import { PageGuard } from "@/components/guards/page-guard";
// Direct import for better code-splitting
import CustomerManagement from "@/components/admin/people/CustomerManagement";

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || '1', 10);
  const limit = parseInt(params.limit || '10', 10);
  const isActive = params.isActive;
  const search = typeof params.search === "string" && params.search.trim() !== ""
    ? params.search.trim()
    : undefined;

  const response = await ServerActions.ServerApilib.ssrCustomerAPI.getAll(
    page,
    limit,
    search,
    isActive
  );
  const data = response?.data?.data?.data ?? response?.data?.data ?? response?.data ?? [];

  // Create default pagination if not provided by API
  const pagination = response?.data?.data?.pagination ?? {
    currentPage: page,
    totalPages: Math.ceil(data.length / limit),
    totalItems: data.length,
    itemsPerPage: limit,
    hasNext: page * limit < data.length,
    hasPrev: page > 1,
  };

  return (
    <PageGuard permissionKey="people.customers">
      <CustomerManagement
        initialCustomers={data}
        initialPagination={pagination}
      />
    </PageGuard>
  );
}
