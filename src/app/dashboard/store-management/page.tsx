/**
 * Store Management Page
 */

import { PageGuard } from '@/components/guards/page-guard';
import { WebComponents } from '@/components';
import { ServerActions } from '@/lib/server-lib';
import { SearchParams } from '@/types/SearchParams';

export default async function DashboardStoreManagementPage({
    searchParams,
}: {
    searchParams: Promise<SearchParams>;
}) {
    const params = await searchParams;
    const page = parseInt(params.page || '1', 10);
    const limit = parseInt(params.limit || '10', 10);
    const search = typeof params.search === 'string' && params.search.trim() !== ''
        ? params.search.trim()
        : undefined;

    const storeResult = await ServerActions.ServerApilib.ssrStoreAPI.getAll(page, limit, search).catch((err: any) => {
        console.error('Failed to fetch stores:', err);
        return null;
    });

    const stores = storeResult?.data?.data?.stores || [];
    const pagination = storeResult?.data?.data?.pagination || {
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: limit,
        hasNext: false,
        hasPrev: false,
    };

    return (
        <PageGuard permissionKey="store">
            <WebComponents.AdminComponents.AdminWebComponents.StoreManagement.StoreManagementComponent
                initialStores={stores}
                initialPagination={pagination}
            />
        </PageGuard>
    );
}

