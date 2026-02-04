import { WebComponents } from "@/components";
import { ServerActions } from "@/lib/server-lib";
import { SearchParams } from "@/types/SearchParams";

export default async function PurchaseOrderPage({
    searchParams,
}: {
    searchParams: Promise<SearchParams>;
}) {
    const params = await searchParams;

    const page = parseInt(params.page || "1", 10);
    const limit = parseInt(params.limit || "10", 10);

    const search =
        typeof params.search === "string" && params.search.trim()
            ? params.search.trim()
            : undefined;

    const status =
        typeof params.status === "string"
            ? (params.status as "draft" | "cancel" | "approve" | "billed")
            : undefined;

    const all =
        typeof params.all === "string"
            ? params.all === "true"
            : undefined;

    const purchaseOrdersRes = await ServerActions.ServerApilib.ssrPurchaseOrderAPI.getAll(page, limit, search, status, all);


    const initialFormRes = await ServerActions.ServerApilib.ssrPurchaseOrderAPI.getInitialForm();
    const initialFormData = initialFormRes?.data?.data || {};

    const suppliers = initialFormData?.suppliers || [];
    const products = initialFormData?.products || [];
    const taxes = initialFormData?.taxes || [];

    const purchaseOrderResponse = purchaseOrdersRes?.data?.data || {};
    const displayData = purchaseOrderResponse?.data || [];

    const pagination = purchaseOrderResponse?.pagination || {
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: limit,
        hasNext: false,
        hasPrev: false,
    };

    return (
        <WebComponents.AdminComponents.AdminWebComponents.AdminPurchaseWebComponents.PurchaseOrderManagement
            initialSuppliers={suppliers}
            initialProducts={products}
            initialTaxes={taxes}
            initialPurchaseOrders={displayData}
            initialPagination={pagination}
        />
    );
}
