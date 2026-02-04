import { WebComponents } from "@/components";
import { ServerActions } from "@/lib/server-lib";

export default async function SalesReportPage() {

  const category = await ServerActions.ServerApilib.ssrProductCategoryAPI.getAll();
  const product = await ServerActions.ServerApilib.ssrProductAPI.getAll();
  const store = await ServerActions.ServerApilib.ssrStoreAPI.getAll();
  const salesReport = await ServerActions.ServerApilib.ssrSalesAPI.getReport();
  const salesRerportResponse = salesReport?.data?.data?.data || [];

  return (
    <>
      <WebComponents.AdminComponents.AdminWebComponents.Reports.SalesReport initialData={salesRerportResponse} />
    </>
  );
}
