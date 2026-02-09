"use client";
import React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FaEdit, FaTrash } from "react-icons/fa";
import { HiArrowLeft, HiPlus } from "react-icons/hi";
import { ServerActions } from "@/lib";
import { Constants } from "@/constant";
import { WebComponents } from "@/components";
import { LandingFormModels } from "./FormModels";
import {  PaginationType,SuperAdminTypes } from "@/types";

const ProductOverview = ({
    initialProductOverview,
    productOverviewPagination
}: {
    readonly initialProductOverview: SuperAdminTypes.LandingSettingPageTypes.ProductOverviewRow[];
    readonly productOverviewPagination: PaginationType.Pagination;
}) => {
    const [productOverview, setProductOverview] = React.useState<SuperAdminTypes.LandingSettingPageTypes.ProductOverviewRow[]>(initialProductOverview);
    const [pagination, setPagination] = React.useState<PaginationType.Pagination>(productOverviewPagination);
    const [loading, setLoading] = React.useState(false);
    const [showModal, setShowModal] = React.useState(false);
    const [showEditModal, setShowEditModal] = React.useState(false);
    const [editingItem, setEditingItem] = React.useState<SuperAdminTypes.LandingSettingPageTypes.ProductOverviewRow | null>(null);
    const [actionFilter, setActionFilter] = React.useState("All");
    const [activeStatusFilter, setActiveStatusFilter] = React.useState("All");
    const [selectedRows, setSelectedRows] = React.useState<SuperAdminTypes.LandingSettingPageTypes.ProductOverviewRow[]>([]);
    const [clearSelectedRows, setClearSelectedRows] = React.useState(false);
    const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
    const [formData, setFormData] = React.useState<{
        title: string;
        description: string;
        overviewImage: string | File | undefined;
        status: boolean;
    }>({
        title: "",
        description: "",
        overviewImage: undefined,
        status: true
    });
    const router = useRouter();

    // Sync state with props when URL params change
    React.useEffect(() => {
        setProductOverview(initialProductOverview);
        setPagination(productOverviewPagination);
    }, [initialProductOverview]);

    // Reset action filter when no rows are selected
    React.useEffect(() => {
        if (selectedRows.length === 0) {
            setActionFilter("All");
            setActiveStatusFilter("All");
        }
    }, [selectedRows]);

    const clearSelectedData = () => {
        setClearSelectedRows((prev) => !prev);
        setSelectedRows([]);
        router.refresh();
    };

    const handleAdd = async () => {
        const payload = { ...formData };
        if (selectedFile) {
            payload.overviewImage = selectedFile;
        }
        await ServerActions.HandleFunction.handleAddCommon({
            formData: payload,
            createAction: ServerActions.ServerActionslib.createProductOverviewAction,
            setLoading,
            setShowModal,
            router,
            successMessage: "Product overview added successfully.",
            errorMessage: "Failed to add product overview.",
            onSuccess: (result) => {
                if (result?.data?.data) {
                    setProductOverview((prev) => [...prev, result.data.data]);
                    setFormData({ title: "", description: "", overviewImage: undefined, status: true });
                    setSelectedFile(null);
                }
            },
        });
    };

    const handleEdit = async () => {
        const payload = { ...formData };
        if (selectedFile) {
            payload.overviewImage = selectedFile;
        }
        await ServerActions.HandleFunction.handleEditCommon({
            formData: payload,
            editingItem,
            getId: (item) => (item as any)._id,
            updateAction: (id, data) => ServerActions.ServerActionslib.updateProductOverviewAction(id as string, data),
            setLoading,
            setShowEditModal,
            setEditingItem,
            router,
            successMessage: "Product overview updated successfully.",
            errorMessage: "Failed to update product overview.",
            onSuccess: (result) => {
                if (result?.data?.data && editingItem) {
                    setProductOverview((prev) => prev.map((f) => ((f as any)._id === (editingItem as any)._id ? result.data.data : f)));
                    setFormData({ title: "", description: "", overviewImage: undefined, status: true });
                    setSelectedFile(null);
                }
            },
        });
    };

    const handleDelete = async (id: string) => {
        await ServerActions.HandleFunction.handleDeleteCommon({
            id,
            deleteAction: (id) => ServerActions.ServerActionslib.deleteProductOverviewAction(id as string),
            setLoading,
            router,
            successMessage: "Product overview deleted successfully.",
            errorMessage: "Failed to delete product overview.",
            onSuccess: () => {
                setProductOverview((prev) => prev.filter((f) => (f as any)._id !== id));
            },
        });
    };

    const handleToggleStatus = React.useCallback(async (row: SuperAdminTypes.LandingSettingPageTypes.ProductOverviewRow, next: boolean) => {
        setProductOverview((prev) => prev.map((f) => ((f as any)._id === (row as any)._id ? { ...f, status: next } : f)));
        await ServerActions.HandleFunction.handleToggleStatusCommon({
            row,
            next,
            getId: (item) => (item as any)._id,
            preparePayload: () => ({ status: next }),
            updateAction: (id, data) => ServerActions.ServerActionslib.updateProductOverviewAction(id as string, data),
            setLoading,
            router,
            successMessage: `Status updated to ${next ? "Active" : "Inactive"}.`,
            errorMessage: "Failed to update status.",
            onError: () => {
                setProductOverview((prev) => prev.map((f) => ((f as any)._id === (row as any)._id ? { ...f, status: !next } : f)));
            },
        });
    }, [router]);

    const handleToggleStatusById = React.useCallback(async (id: string, next: boolean) => {
        const row = productOverview.find((f) => (f as any)._id === id);
        if (row) await handleToggleStatus(row, next);
    }, [productOverview, handleToggleStatus]);

    const handleBulkApply = React.useCallback(async () => {
        await ServerActions.HandleFunction.handleBulkApplyCommon({
            selectedRows,
            actionFilter,
            activeStatusFilter,
            items: productOverview,
            setItems: setProductOverview,
            bulkDeleteAction: ServerActions.ServerActionslib.bulkDeleteProductOverviewAction,
            bulkUpdateStatusAction: ServerActions.ServerActionslib.bulkUpdateProductOverviewStatusAction,
            clearSelectedData,
            idSelector: (r) => (r as any)._id,
            statusProp: "status",
        });
    }, [selectedRows, actionFilter, activeStatusFilter, productOverview]);

    const tableColumns = React.useMemo(() => WebComponents.WebCommonComponents.CommonComponents.createColumns<SuperAdminTypes.LandingSettingPageTypes.ProductOverviewRow>({
        fields: [
            {
                name: "Title",
                selector: (row: any) => row.title,
                sortable: true,
            },
            {
                name: "Description",
                selector: (row: any) => row.description,
                sortable: true,
                cell: (row: any) => (
                    <div className="max-w-xs truncate" title={row.description}>
                        {row.description}
                    </div>
                ),
            },
            {
                name: "Image",
                selector: (row: any) => row.overviewImage,
                sortable: false,
                cell: (row: any) =>
                    row.overviewImage ? (
                        <Image
                            className="h-10 w-10 rounded-lg object-cover"
                            src={row.overviewImage}
                            alt={row.title}
                            width={40}
                            height={40}
                        />
                    ) : (
                        <span className="text-gray-400">No Image</span>
                    ),
            },
        ],
        status: {
            name: "Status",
            idSelector: (row: any) => row._id,
            valueSelector: (row: any) => !!row.status,
            onToggle: handleToggleStatusById,
        },
        actions: [
            {
                render: (row: any) => (
                    <WebComponents.UiComponents.UiWebComponents.Button
                        size="icon"
                        variant="editaction"
                        onClick={() => {
                            setEditingItem(row);
                            setFormData({
                                title: row.title || "",
                                description: row.description || "",
                                overviewImage: row.overviewImage || undefined,
                                status: !!row.status
                            });
                            setShowEditModal(true);
                        }}
                    >
                        <FaEdit className="w-4 h-4" />
                    </WebComponents.UiComponents.UiWebComponents.Button>
                ),
            },
            {
                render: (row: any) => (
                    <WebComponents.UiComponents.UiWebComponents.Button
                        size="icon"
                        variant="deleteaction"
                        onClick={() => handleDelete(row._id)}
                    >
                        <FaTrash className="w-4 h-4" />
                    </WebComponents.UiComponents.UiWebComponents.Button>
                ),
            },
        ],
    }), [handleToggleStatusById, handleDelete]);

    return (
        <div className="p-3">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4">
                <div className="flex-1 min-w-0">
                    <h1 className="text-lg sm:text-lg md:text-xl lg:text-2xl font-medium text-textMain dark:text-white truncate">
                        Product Overview
                        {(() => {
                            if (!showModal && !showEditModal) return "";
                            const modalTitle = showModal ? "Add Item" : "Edit Item";
                            return ` > ${modalTitle}`;
                        })()}
                    </h1>
                    <p className="text-xs sm:text-sm md:text-base text-textSmall pt-2">
                        Manage your product overview items here.
                    </p>
                </div>
                <WebComponents.UiComponents.UiWebComponents.Button
                    variant="addBackButton"
                    onClick={() => {
                        if (showModal || showEditModal) {
                            setShowModal(false);
                            setShowEditModal(false);
                            setEditingItem(null);
                            setFormData({ title: "", description: "", overviewImage: undefined, status: true });
                            setSelectedFile(null);
                        } else {
                            setShowModal(true);
                            setFormData({ title: "", description: "", overviewImage: undefined, status: true });
                        }
                    }}
                    disabled={loading}
                >
                    {showModal || showEditModal ? (
                        <>
                            <HiArrowLeft className="w-4 h-4" /> {Constants.superadminConstants.back}
                        </>
                    ) : (
                        <>
                            <HiPlus className="w-4 h-4" /> {Constants.superadminConstants.add}
                        </>
                    )}
                </WebComponents.UiComponents.UiWebComponents.Button>
            </div>

            <div className="bg-white dark:bg-darkFilterbar h-full w-full overflow-hidden border border-[#ffffff] rounded-[4px]">
                <WebComponents.WebCommonComponents.CommonComponents.CommonFilterBar
                    actionFilter={actionFilter}
                    onActionFilterChange={(value: string) => {
                        setActionFilter(value);
                        if (value !== "Status") {
                            setActiveStatusFilter("All");
                        }
                    }}
                    actionOptions={Constants.commonConstants.actionOptions}
                    activeStatusFilter={activeStatusFilter}
                    onActiveStatusFilterChange={setActiveStatusFilter}
                    activeStatusOptions={Constants.commonConstants.activeStatusOptions}
                    selectedCount={selectedRows.length}
                    onApply={handleBulkApply}
                    showCategoryFilter={false}
                    showSearch={false}
                    statusFilter=""
                    onStatusFilterChange={() => { }}
                    searchTerm=""
                    onSearchTermChange={() => { }}
                    renderExports={false}
                />

                <div>
                    {loading && !showModal && !showEditModal ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                            <p className="mt-2 text-gray-600 dark:text-gray-400">Loading product overview...</p>
                        </div>
                    ) : (
                        <WebComponents.WebCommonComponents.CommonComponents.DataTable
                            data={productOverview}
                            columns={tableColumns}
                            selectableRows
                            clearSelectedRows={clearSelectedRows}
                            onSelectedRowsChange={({ selectedRows }) => setSelectedRows(selectedRows)}
                            useCustomPagination={true}
                            totalRecords={pagination.totalItems}
                            filteredRecords={pagination.totalItems}
                            paginationPerPage={pagination.itemsPerPage}
                            paginationDefaultPage={pagination.currentPage}
                            paginationRowsPerPageOptions={[5, 10, 25, 50]}
                            useUrlParams={true}
                        />
                    )}
                </div>
            </div>

            {(showModal || showEditModal) && (
                <LandingFormModels.ProductOverviewFormModel
                    title={showEditModal ? "Edit Product Overview Item" : "Add Product Overview Item"}
                    onClose={() => {
                        setShowModal(false);
                        setShowEditModal(false);
                        setEditingItem(null);
                        setFormData({ title: "", description: "", overviewImage: undefined, status: true });
                        setSelectedFile(null);
                    }}
                    onSubmit={showEditModal ? handleEdit : handleAdd}
                    formData={formData}
                    setFormData={setFormData as any}
                    productOverviewLoading={loading}
                    setSelectedFile={setSelectedFile}
                />
            )}
        </div>
    );
};

export default ProductOverview;
