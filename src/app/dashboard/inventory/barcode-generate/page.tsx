import { WebComponents } from '@/components';
import { ServerActions } from "@/lib/server-lib";
import { PageGuard } from "@/components/guards/page-guard";

export default async function BarcodeGenerate() {
  const response = await ServerActions.ServerApilib.ssrProductAPI.getAll();
  const data = response?.data?.data?.products || [];
  return (
    <PageGuard permissionKey="inventory.printlabels">
      <WebComponents.AdminComponents.AdminWebComponents.Barcode initialProducts={data} />
    </PageGuard>
  )
}