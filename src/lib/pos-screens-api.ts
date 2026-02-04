import { ServerActions } from "@/lib/server-lib";

export type InitialPosData = {
  customers: any[];
  activeStore: any[];
  products: any[];
  categories: any[];
  barcodeProducts: any[];
  activeCoupons: any[];
};

export async function getInitialPosData(opts?: { storeId?: string; barcode?: string }): Promise<InitialPosData> {
  const barcode = (opts?.barcode && String(opts.barcode)) || "1234";

  // First, fetch active stores to get the storeId
  const activeStoreRes = await ServerActions.ServerApilib.ssrStoreAPI.getActive();
  const activeStore = activeStoreRes?.data?.data?.stores || activeStoreRes?.data || [];

  // Use provided storeId, or fallback to first active store's ID, or undefined
  const providedStoreId = opts?.storeId ? String(opts.storeId) : undefined;
  const firstStoreId = activeStore.length > 0 ? (activeStore[0]._id) : undefined;
  const storeId = providedStoreId || firstStoreId;

  // Now fetch all other data in parallel, using storeId for products
  const [customersRes, productsRes, categoriesRes, barcodeRes, activeCouponsRes] = await Promise.all([
    ServerActions.ServerApilib.ssrCustomerAPI.getAll(),
    ServerActions.ServerApilib.ssrProductAPI.getActive(storeId),
    ServerActions.ServerApilib.ssrProductCategoryAPI.getActive(),
    ServerActions.ServerApilib.ssrProductAPI.getActiveByBarcode(barcode),
    ServerActions.ServerApilib.ssrAdminCouponAPI.getActive(),
  ]);

  const customers = customersRes?.data?.data?.data || customersRes?.data?.data || customersRes?.data || [];
  const products = productsRes?.data?.data?.products || productsRes?.data?.data || productsRes?.data || [];
  const categories = categoriesRes?.data?.data || categoriesRes?.data || [];
  const barcodeProducts = barcodeRes?.data?.data || barcodeRes?.data || [];
  const activeCoupons = activeCouponsRes?.data?.data?.coupons || activeCouponsRes?.data?.data || activeCouponsRes?.data || [];

  return { customers, activeStore, products, categories, barcodeProducts, activeCoupons };
}