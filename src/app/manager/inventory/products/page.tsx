import { SearchParams } from "@/types/SearchParams";
import AdminInventoryProductsPage from "@/app/admin/inventory/products/page";

export default async function CashierInventoryProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  return <AdminInventoryProductsPage searchParams={searchParams} />
}
