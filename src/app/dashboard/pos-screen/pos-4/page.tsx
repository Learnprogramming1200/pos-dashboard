import { PageGuard } from "@/components/guards/page-guard";
import { Pos4Screen } from '@/modules/pos/screens';

export default function POS4Page() {
    return (
        <PageGuard permissionKey="pos.pos4">
            <Pos4Screen />
        </PageGuard>
    );
}
