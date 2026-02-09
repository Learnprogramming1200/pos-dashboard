"use client";

import React from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import { ServerActions } from "@/lib";
import { Constants } from "@/constant";
import { customHooks } from "@/hooks";
import { WebComponents } from "@/components";
import { PaginationType, SearchParamsTypes, AdminTypes } from "@/types";

interface RedeemTabProps {
    redeems: AdminTypes.loyaltyTypes.RedeemPointServerResponse[];
    pagination: PaginationType.Pagination;
    onViewDetails: (item: AdminTypes.loyaltyTypes.RedeemPointServerResponse) => void;
    onEdit: (item: AdminTypes.loyaltyTypes.RedeemPointServerResponse) => void;
    onDelete: (id: string) => void;
    onToggleStatus: (row: AdminTypes.loyaltyTypes.RedeemPointServerResponse, next: boolean) => Promise<void>;
}
export default function RedeemTab({
    redeems,
    pagination,
    onViewDetails,
    onEdit,
    onDelete,
    onToggleStatus,
}: RedeemTabProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [selectedRows, setSelectedRows] = React.useState<AdminTypes.loyaltyTypes.RedeemPointServerResponse[]>([]);
    const [actionFilter, setActionFilter] = React.useState<string>("All");
    const [activeStatusFilter, setActiveStatusFilter] = React.useState<string>("All");
    const [downloadData, setDownloadData] = React.useState<AdminTypes.loyaltyTypes.RedeemPointServerResponse[]>([]);
    const [clearSelectedRows, setClearSelectedRows] = React.useState(false);
    const { searchTerm, setSearchTerm, statusFilter, setStatusFilter, filteredData } = customHooks.useListFilters<AdminTypes.loyaltyTypes.RedeemPointServerResponse>(
        redeems,
    );

    /* Permissions */
    const { checkPermission } = customHooks.useUserPermissions();

    const bulkActionOptions = React.useMemo(() => {
        const options = Constants.commonConstants.actionOptions;
        return options.filter(option => {
            if (option.value === 'Status') {
                return checkPermission("promo.loyalty", "update");
            }
            if (option.value === 'Delete') {
                return checkPermission("promo.loyalty", "delete");
            }
            return true;
        });
    }, [checkPermission]);
    React.useEffect(() => {
        if (selectedRows.length === 0) {
            setActionFilter("All");
            setActiveStatusFilter("All");
        }
    }, [selectedRows]);

    const handleToggleStatusById = React.useCallback(
        async (id: string, next: boolean) => {
            const row = redeems.find(r => r._id === id);
            if (row) {
                await onToggleStatus(row, next);
            }
        },
        [redeems, onToggleStatus]
    );

    const tableColumns = React.useMemo(() => WebComponents.WebCommonComponents.CommonComponents.createColumns<AdminTypes.loyaltyTypes.RedeemPointServerResponse>({
        fields: [
            {
                name: "Rule Name",
                selector: (row) => row.ruleName || "-",
                sortable: true
            },
            {
                name: "Point From",
                selector: (row) => row.pointFrom?.toString() || "-",
                sortable: true
            },
            {
                name: "Point To",
                selector: (row) => row.pointTo?.toString() || "-",
                sortable: true
            },
            {
                name: "Amount",
                selector: (row) => row.amount?.toString() || "-",
                sortable: true
            },
        ],
        status: {
            idSelector: (row) => row._id,
            valueSelector: (row) => !!row.status,
            onToggle: handleToggleStatusById,
        },
        actions: [
            {
                render: (row) => (
                    <WebComponents.UiComponents.UiWebComponents.Button size="icon" variant="viewaction" onClick={() => onViewDetails(row)}>
                        <FaEye className="w-4 h-4" />
                    </WebComponents.UiComponents.UiWebComponents.Button>
                ),
            },
            {
                render: (row) => (
                    (checkPermission("promo.loyalty", "update")) && (
                        <WebComponents.UiComponents.UiWebComponents.Button size="icon" variant="editaction" onClick={() => onEdit(row)}>
                            <FaEdit className="w-4 h-4" />
                        </WebComponents.UiComponents.UiWebComponents.Button>
                    )
                ),
            },
            {
                render: (row) => (
                    (checkPermission("promo.loyalty", "delete")) && (
                        <WebComponents.UiComponents.UiWebComponents.Button size="icon" variant="deleteaction" onClick={() => onDelete(row._id)}>
                            <FaTrash className="w-4 h-4" />
                        </WebComponents.UiComponents.UiWebComponents.Button>
                    )
                ),
            },
        ],
    }), [handleToggleStatusById, onViewDetails, onEdit, onDelete, checkPermission]);

    const exportColumns = React.useMemo(() => {
        return WebComponents.WebCommonComponents.CommonComponents.generateExportColumns<AdminTypes.loyaltyTypes.RedeemPointServerResponse>([
            {
                key: "ruleName",
                label: "Rule Name",
                accessor: (row) => row.ruleName || '-',
                pdfWidth: 25
            },
            {
                key: "pointFrom",
                label: "Point From",
                accessor: (row) => row.pointFrom?.toString() || '-',
                pdfWidth: 20
            },
            {
                key: "pointTo",
                label: "Point To",
                accessor: (row) => row.pointTo?.toString() || '-',
                pdfWidth: 20
            },
            {
                key: "amount",
                label: "Amount",
                accessor: (row) => row.amount?.toString() || '-',
                pdfWidth: 20
            },
            {
                key: "status",
                label: "Status",
                accessor: (row) => row.status ? 'Active' : 'Inactive',
                pdfWidth: 15
            }
        ]);
    }, []);

    const downloadPdfData = async (): Promise<any[]> => {
        const selectedRowsIds = selectedRows.map(item => item._id);
        const isActiveParam = searchParams.get("isActive");
        const search = searchParams.get("search");
        const filterDatas: SearchParamsTypes.DownloadSearchParams = {
            isActive: undefined,
            search: undefined
        };
        if (isActiveParam !== null) {
            filterDatas.isActive = isActiveParam === "true";
        }
        if (search) {
            filterDatas.search = search;
        }
        let res;
        if (selectedRowsIds.length > 0) {
            res = await ServerActions.ServerActionslib.bulkGetSelectedLoyaltyPointsRedeemAction({ ids: selectedRowsIds });
        } else {
            res = await ServerActions.ServerActionslib.bulkGetLoyaltyPointsRedeemAction(filterDatas);
        }
        const rows = Array.isArray(res?.data?.data?.data) ? res.data.data.data : [];
        setDownloadData(rows);
        return rows;
    };

    const clearSelectedData = () => {
        setClearSelectedRows(prev => !prev);
        setSelectedRows([]);
        router.refresh();
    };

    const handleBulkApply = React.useCallback(async () => {
        const ids = selectedRows.map(r => r._id);
        if (actionFilter !== 'Status') {
            if (actionFilter === 'Delete') {
                const confirm = await WebComponents.UiComponents.UiWebComponents.SwalHelper.delete();
                if (!confirm.isConfirmed) return;
                try {
                    const result = await ServerActions.ServerActionslib.bulkDeleteLoyaltyPointsRedeemAction({ ids });
                    if (!result?.success) throw new Error(result?.error || 'Failed to delete selected redeem configurations');
                    WebComponents.UiComponents.UiWebComponents.SwalHelper.success({ text: 'Selected redeem configurations deleted.' });
                    clearSelectedData();
                } catch (error: unknown) {
                    const errorMessage = error instanceof Error ? error.message : 'Failed to delete selected redeem configurations.';
                    WebComponents.UiComponents.UiWebComponents.SwalHelper.error({ text: errorMessage });
                }
            }
            return;
        }
        if (activeStatusFilter === 'All') {
            WebComponents.UiComponents.UiWebComponents.SwalHelper.error({ text: 'Please select a status.' });
            return;
        }
        const isActive = activeStatusFilter === 'Active';
        try {
            const result = await ServerActions.ServerActionslib.bulkUpdateLoyaltyPointsRedeemStatusAction({ ids, status: isActive });
            if (!result?.success) throw new Error(result?.error || 'Failed to apply status');
            WebComponents.UiComponents.UiWebComponents.SwalHelper.success({ text: 'Status updated successfully.' });
            clearSelectedData();
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to apply status.';
            WebComponents.UiComponents.UiWebComponents.SwalHelper.error({ text: errorMessage });
        }
    }, [actionFilter, activeStatusFilter, selectedRows]);

    return (
        <div className="bg-white dark:bg-darkFilterbar rounded-[4px] h-full w-full mt-4 overflow-hidden">
            <WebComponents.WebCommonComponents.CommonComponents.CommonFilterBar
                actionFilter={actionFilter}
                onActionFilterChange={(value: string) => {
                    setActionFilter(value);
                    if (value !== "Status") {
                        setActiveStatusFilter("All");
                    }
                }}
                actionOptions={bulkActionOptions}
                activeStatusFilter={activeStatusFilter}
                onActiveStatusFilterChange={setActiveStatusFilter}
                activeStatusOptions={Constants.commonConstants.activeStatusOptions}
                selectedCount={selectedRows.length}
                onApply={handleBulkApply}
                categoryFilter="All"
                onCategoryFilterChange={() => { }}
                categoryOptions={[]}
                showCategoryFilter={false}
                statusFilter={statusFilter}
                onStatusFilterChange={(value: string) => {
                    const validValue = value === "Active" || value === "Inactive" ? value : "All";
                    setStatusFilter(validValue);
                }}
                statusOptions={Constants.commonConstants.CommonFilterOptions.CommonStatusOptions}
                searchTerm={searchTerm}
                onSearchTermChange={setSearchTerm}
                renderExports={
                    <>
                        <WebComponents.UiComponents.UiWebComponents.DownloadCSV
                            data={downloadData}
                            columns={exportColumns.csvColumns}
                            filename={`redeem-points-${new Date().toISOString().split('T')[0]}.csv`}
                            onExport={async () => {
                                const data = await downloadPdfData();
                                WebComponents.UiComponents.UiWebComponents.SwalHelper.success({ text: 'CSV exported successfully.' });
                                clearSelectedData();
                                return data;
                            }}
                        >
                            <button
                                type="button"
                                className="rounded-[4px] bg-[#ffffff] dark:bg-[#3A3A3A] border border-[#D8D9D9] border-opacity-50 font-interTight font-normal hover:bg-[#e0e0e0] dark:hover:bg-[#4A4A4A] shadow-sm transition-colors duration-200 cursor-pointer flex-shrink-0 sm:px-1 md:px-2 lg:px-2 xl:px-2 2xl:px-2 px-2 py-[6.9px]"
                                aria-label="Download CSV"
                                title="Download CSV"
                            >
                                <Image src={Constants.assetsIcon.assets.csv} alt="CSV" width={28} height={28} className="w-5 h-5 sm:w-6 sm:h-6 md:w-6 md:h-6 lg:w-7 lg:h-7 xl:w-7 xl:h-7 2xl:w-7 2xl:h-7" />
                            </button>
                        </WebComponents.UiComponents.UiWebComponents.DownloadCSV>
                        <WebComponents.UiComponents.UiWebComponents.DownloadPDF
                            data={downloadData}
                            columns={exportColumns.pdfColumns}
                            filename={`redeem-points-${new Date().toISOString().split('T')[0]}.pdf`}
                            title="Redeem Points Report"
                            orientation="landscape"
                            onExport={async () => {
                                const data = await downloadPdfData();
                                WebComponents.UiComponents.UiWebComponents.SwalHelper.success({ text: 'PDF exported successfully.' });
                                clearSelectedData();
                                return data;
                            }}
                        >
                            <button
                                type="button"
                                className="rounded-[4px] bg-[#ffffff] dark:bg-[#3A3A3A] border border-[#D8D9D9] border-opacity-50 font-interTight font-normal hover:bg-[#e0e0e0] dark:hover:bg-[#4A4A4A] shadow-sm transition-colors duration-200 cursor-pointer flex-shrink-0 sm:px-1 md:px-2 lg:px-2 xl:px-2 2xl:px-2 px-2 py-[6.9px]"
                                aria-label="Download PDF"
                                title="Download PDF"
                            >
                                <Image src={Constants.assetsIcon.assets.pdf} alt="PDF" width={28} height={28} className="w-5 h-5 sm:w-6 sm:h-6 md:w-6 md:h-6 lg:w-7 lg:h-7 xl:w-7 xl:h-7 2xl:w-7 2xl:h-7" />
                            </button>
                        </WebComponents.UiComponents.UiWebComponents.DownloadPDF>
                    </>
                }
            />
            <WebComponents.WebCommonComponents.CommonComponents.DataTable
                columns={tableColumns}
                data={filteredData}
                selectableRows
                clearSelectedRows={clearSelectedRows}
                onSelectedRowsChange={({ selectedRows }) => setSelectedRows(selectedRows as AdminTypes.loyaltyTypes.RedeemPointServerResponse[])}
                useCustomPagination={true}
                totalRecords={pagination.totalItems}
                filteredRecords={pagination.totalItems}
                paginationPerPage={pagination.itemsPerPage}
                paginationDefaultPage={pagination.currentPage}
                paginationRowsPerPageOptions={[5, 10, 25, 50]}
                useUrlParams={true}
            />
        </div>
    );
}
