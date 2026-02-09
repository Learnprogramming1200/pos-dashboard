import { PageGuard } from "@/components/guards/page-guard";
import { Pos2Screen } from '@/modules/pos/screens';

export default function POS2Page() {
    return (
        <PageGuard permissionKey="pos.pos2">
            <Pos2Screen />
        </PageGuard>
    );
}
