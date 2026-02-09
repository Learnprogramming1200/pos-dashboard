import { PageGuard } from "@/components/guards/page-guard";
import { Pos1Screen } from '@/modules/pos/screens';

export default function POS1Page() {
    return (
        <PageGuard permissionKey="pos.pos1">
            <Pos1Screen />
        </PageGuard>
    );
}
