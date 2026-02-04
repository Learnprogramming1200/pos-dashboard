import { WebComponents } from "@/components";
import { ServerActions } from "@/lib/server-lib";
import { SearchParams } from "@/types/SearchParams";

export default async function NotificationTemplatesPage({
    searchParams,
}: {
    searchParams: Promise<SearchParams>;
}) {
    const params = await searchParams;
    const page = parseInt((params.page as string) ?? "1", 10);
    const limit = parseInt((params.limit as string) ?? "10", 10);
    const isActiveStr = params.isActive as string | undefined;
    const isActive = isActiveStr === 'true' ? true : isActiveStr === 'false' ? false : undefined;

    const search =
        typeof params.search === "string" && params.search.trim() !== ""
            ? params.search.trim()
            : undefined;

    const response = await ServerActions.ServerApilib.ssrNotificationAPI.getAll(
        page,
        limit,
        search,
        isActive
    );

    const data = response?.data?.data?.data ?? [];
    const pagination = response?.data?.data?.pagination ?? {
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: limit,
        hasNext: false,
        hasPrev: false,
    };

    return (
        <WebComponents.SuperAdminComponents.SuperadminWebComponents.SuperadminNotificationsWebComponents.NotificationTemplates
            initialTemplates={data}
            initialPagination={pagination}
        />
    );
}
