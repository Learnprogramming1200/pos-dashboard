import { WebComponents } from "@/components";
import { PageGuard } from "@/components/guards/page-guard";

export default function GiftCardHistoryPage() {
  return (
    <PageGuard permissionKey="promo.giftCardHistory">
      <WebComponents.AdminComponents.AdminWebComponents.AdminPromoWebComponents.GiftCardHistory />
    </PageGuard>
  );
}

