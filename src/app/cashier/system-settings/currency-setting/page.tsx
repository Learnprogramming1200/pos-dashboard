import { WebComponents } from "@/components";
import { ServerActions } from "@/lib/server-lib";
import { SearchParams } from "@/types/SearchParams";

export default async function CurrencySettingPage({
    searchParams,
}: {
    searchParams: Promise<SearchParams>;
}) {
    const params = await searchParams;
    const page = parseInt(params.page || '1', 10);
    const limit = parseInt(params.limit || '10', 10);

    const response = await ServerActions.ServerApilib.ssrAdminCurrencySettingAPI.getAll(
        page,
        limit,
    );
    const data = response?.data?.data?.data?.data ?? response?.data?.data?.data ?? response?.data?.data ?? [];
    const pagination = response?.data?.data?.data?.pagination ?? response?.data?.data?.pagination ?? {
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: limit,
        hasNext: false,
        hasPrev: false,
    };

    return (
        <WebComponents.AdminComponents.AdminWebComponents.SystemSettingsWebComponents.CurrencySetting
            initialCurrencies={data}
            initialPagination={pagination}
        />
    );
}
