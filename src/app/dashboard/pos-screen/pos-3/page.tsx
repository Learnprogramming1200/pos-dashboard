import { PageGuard } from "@/components/guards/page-guard";
import { Pos3Screen } from '@/modules/pos/screens';

export default function POS3Page() {
    return (
        <PageGuard permissionKey="pos.pos3">
            <Pos3Screen />
        </PageGuard>
    );
}
