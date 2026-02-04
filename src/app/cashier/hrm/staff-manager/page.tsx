import { ServerActions } from "@/lib/server-lib";
import { WebComponents } from "@/components";

import { SearchParams } from "@/types/SearchParams";

export default async function AdminStaffManagement({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);
  const limit = parseInt(params.limit || "10", 10);
  const isActive = params.isActive;
  const storeId = params.storeId;
  const search = typeof params.search === "string" && params.search.trim() !== ""
    ? params.search.trim()
    : undefined;
    const designation = params.designation;

  const [staffRes, storesRes] = await Promise.all([
    ServerActions.ServerApilib.ssrStaffHRMAPI.getAll(page, limit, search, storeId,designation, isActive),
    ServerActions.ServerApilib.ssrStoreAPI.getAll(),
  ]);

  const data = staffRes?.data?.data?.data || staffRes?.data?.data?.employees || [];
  const pagination = staffRes?.data?.data?.pagination || {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: limit,
    hasNext: false,
    hasPrev: false,
  };

  const rawStoresData = storesRes?.data?.data;
  const rawStores = Array.isArray(rawStoresData) ? rawStoresData : (rawStoresData?.stores || []);
  const stores = rawStores
    .filter((s: any) => s && (s.status === true || s.status === 'Active' || s.isActive === true || s.isActive === 'Active'))
    .map((s: any) => ({
      id: s.id || s._id || s.storeId || '',
      name: s.name || s.storeName || '',
    }));
  return <WebComponents.AdminComponents.AdminWebComponents.AdminHRMWebComponents.StaffManagement
    initialStaffPayload={data}
    initialStoresPayload={stores}
    initialPagination={pagination}
  />;
}
