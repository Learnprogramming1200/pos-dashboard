import { PageGuard } from "@/components/guards/page-guard";
import { Pos5Screen } from '@/modules/pos/screens';

export default function POS5Page() {
    return (
        <PageGuard permissionKey="pos.pos5">
            <Pos5Screen />
        </PageGuard>
    );
}
