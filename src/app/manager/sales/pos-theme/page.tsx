import { WebComponents } from "@/components";
import { ssrProductCategoryAPI, ssrProductSubCategoryAPI } from "@/lib/ssr-api";

export default async function POSThemePage() {
  // Fetch categories server-side (following stock transfer pattern)
  // const categoryResponse = await ssrProductCategoryAPI.getAll();
  // const categoryData = categoryResponse?.data?.data?.data ||
  //                     categoryResponse?.data?.data ||
  //                     categoryResponse?.data ||
  //                     categoryResponse ||
  //                     [];

  // // Fetch subcategories server-side (following stock transfer pattern)
  // const subCategoryResponse = await ssrProductSubCategoryAPI.getAll();
  // const subCategoryData = subCategoryResponse?.data?.data?.data ||
  //                        subCategoryResponse?.data?.data ||
  //                        subCategoryResponse?.data ||
  //                        subCategoryResponse ||
  //                        [];

  return <WebComponents.AdminComponents.AdminWebComponents.AdminSalesWebComponents.POSManagement />;
}
