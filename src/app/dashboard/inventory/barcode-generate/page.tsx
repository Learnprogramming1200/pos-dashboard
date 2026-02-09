import { ServerActions } from "@/lib/server-lib";
import { PageGuard } from "@/components/guards/page-guard";
import BarcodeGenerator from "@/components/admin/BarcodeGenerator";

export default async function BarcodeGenerate() {
  const response = await ServerActions.ServerApilib.ssrProductAPI.getAll();
  const data = response?.data?.data?.products || [];
  return (
    <PageGuard permissionKey="inventory.printlabels">
      <BarcodeGenerator initialProducts={data} />
    </PageGuard>
  )
}