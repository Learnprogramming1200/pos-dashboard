import { WebComponents } from '@/components';
import { ServerActions } from "@/lib/server-lib";

export default async function BarcodeGenerate() {
  const response = await ServerActions.ServerApilib.ssrProductAPI.getAll();
  const data = response?.data?.data?.products || [];
 return (
  <WebComponents.AdminComponents.AdminWebComponents.Barcode initialProducts={data}/>
 )
}