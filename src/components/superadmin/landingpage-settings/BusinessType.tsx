"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { FaEdit, FaTrash } from 'react-icons/fa';
import { HiArrowLeft, HiPlus } from "react-icons/hi";
import { ServerActions } from "@/lib";
import { Constants } from "@/constant";
import { WebComponents } from "@/components";
import { LandingFormModels } from "./FormModels";
import { PaginationType, SuperAdminTypes } from "@/types";

const BusinessType = ({ initialBusinessTypes, businessTypesPagination }: {
    initialBusinessTypes: SuperAdminTypes.LandingSettingPageTypes.BusinessTypeRow[]
    businessTypesPagination: PaginationType.Pagination
}) => {
    const [businessTypes, setBusinessTypes] = React.useState<SuperAdminTypes.LandingSettingPageTypes.BusinessTypeRow[]>(initialBusinessTypes);
    const [pagination, setPagination] = React.useState<PaginationType.Pagination>(businessTypesPagination);
    const [loading, setLoading] = React.useState(false);
    const [showModal, setShowModal] = React.useState(false);
    const [showEditModal, setShowEditModal] = React.useState(false);
    const [editingBusinessType, setEditingBusinessType] = React.useState<SuperAdminTypes.LandingSettingPageTypes.BusinessTypeRow | null>(null);
    const [actionFilter, setActionFilter] = React.useState('All');
    const [activeStatusFilter, setActiveStatusFilter] = React.useState('All');
    const [selectedRows, setSelectedRows] = React.useState<SuperAdminTypes.LandingSettingPageTypes.BusinessTypeRow[]>([]);
    const [clearSelectedRows, setClearSelectedRows] = React.useState(false);
    const [formData, setFormData] = React.useState({
        title: "",
        description: "",
        status: true
    });
    const router = useRouter();
    // Sync state with props when URL params change
    React.useEffect(() => {
        setBusinessTypes(initialBusinessTypes);
        setPagination(businessTypesPagination);
    }, [initialBusinessTypes]);

    // Reset action filter when no rows are selected
    React.useEffect(() => {
        if (selectedRows.length === 0) {
            setActionFilter('All');
            setActiveStatusFilter('All');
        }
    }, [selectedRows]);

    const clearSelectedData = () => {
        setClearSelectedRows(prev => !prev);
        setSelectedRows([]);
        router.refresh();
    };

    // Business Type handlers
    const handleAdd = async () => {
        await ServerActions.HandleFunction.handleAddCommon({
            formData,
            createAction: ServerActions.ServerActionslib.createBusinessTypeAction,
            setLoading,
            setShowModal,
            router,
            successMessage: 'Business type added successfully.',
            errorMessage: 'Failed to add business type.',
            onSuccess: (result) => {
                if (result?.data?.data) {
                    setBusinessTypes(prev => [...prev, result.data.data]);
                    setFormData({ title: "", description: "", status: true });
                }
            },

        });
    };

    const handleEdit = async () => {
        await ServerActions.HandleFunction.handleEditCommon({
            formData,
            editingItem: editingBusinessType,
            getId: (item) => (item as any)._id,
            updateAction: (id, data) => ServerActions.ServerActionslib.updateBusinessTypeAction(id as string, data),
            setLoading,
            setShowEditModal,
            setEditingItem: setEditingBusinessType,
            router,
            successMessage: 'Business type updated successfully.',
            errorMessage: 'Failed to update business type.',
            onSuccess: (result) => {
                if (result?.data?.data && editingBusinessType) {
                    setBusinessTypes(prev => prev.map(bt => (bt as any)._id === (editingBusinessType as any)._id ? result.data.data : bt));
                    setFormData({ title: "", description: "", status: true });
                }
            },

        });
    };

    const handleDelete = async (id: string) => {
        await ServerActions.HandleFunction.handleDeleteCommon({
            id,
            deleteAction: (id) => ServerActions.ServerActionslib.deleteBusinessTypeAction(id as string),
            setLoading,
            router,
            successMessage: 'Business type deleted successfully.',
            errorMessage: 'Failed to delete business type.',
            onSuccess: () => {
                setBusinessTypes(prev => prev.filter(bt => (bt as any)._id !== id));
            },

        });
    };

    const handleToggleStatus = React.useCallback(async (row: SuperAdminTypes.LandingSettingPageTypes.BusinessTypeRow, next: boolean) => {
        setBusinessTypes(prev => prev.map(bt => ((bt as any)._id === (row as any)._id ? { ...bt, status: next } : bt)));
        await ServerActions.HandleFunction.handleToggleStatusCommon({
            row,
            next,
            getId: (item) => (item as any)._id,
            preparePayload: () => ({ status: next }),
            updateAction: (id, data) => ServerActions.ServerActionslib.updateBusinessTypeAction(id as string, data),
            setLoading,
            router,
            successMessage: `Status updated to ${next ? 'Active' : 'Inactive'}.`,
            errorMessage: 'Failed to update status.',
            onError: () => {
                setBusinessTypes(prev => prev.map(bt => ((bt as any)._id === (row as any)._id ? { ...bt, status: !next } : bt)));
            },

        });
    }, [router]);

    const handleToggleStatusById = React.useCallback(async (id: string, next: boolean) => {
        const row = businessTypes.find(bt => (bt as any)._id === id);
        if (row) await handleToggleStatus(row, next);
    }, [businessTypes, handleToggleStatus]);

    const handleBulkApply = React.useCallback(async () => {
        await ServerActions.HandleFunction.handleBulkApplyCommon({
            selectedRows,
            actionFilter,
            activeStatusFilter,
            items: businessTypes,
            setItems: setBusinessTypes,
            bulkDeleteAction: ServerActions.ServerActionslib.bulkDeleteBusinessTypesAction,
            bulkUpdateStatusAction: ServerActions.ServerActionslib.bulkUpdateBusinessTypesStatusAction,
            clearSelectedData,
            idSelector: (r) => (r as any)._id,
            statusProp: 'status',
        });
    }, [selectedRows, actionFilter, activeStatusFilter, businessTypes]);

    const tableColumns = React.useMemo(() => WebComponents.WebCommonComponents.CommonComponents.createColumns<SuperAdminTypes.LandingSettingPageTypes.BusinessTypeRow>({
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
                            setEditingBusinessType(row);
                            setFormData({
                                title: row.title || "",
                                description: row.description || "",
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
                        {Constants.superadminConstants.businessTypeHeading || "Business Types"}
                        {(() => {
                            if (!showModal && !showEditModal) return "";
                            const modalTitle = showModal ? "Add Business Type" : "Edit Business Type";
                            return ` > ${modalTitle}`;
                        })()}
                    </h1>
                    <p className="text-xs sm:text-sm md:text-base text-textSmall pt-2">
                        Manage your business types here.
                    </p>
                </div>
                <WebComponents.UiComponents.UiWebComponents.Button
                    variant="addBackButton"
                    onClick={() => {
                        if (showModal || showEditModal) {
                            setShowModal(false);
                            setShowEditModal(false);
                            setEditingBusinessType(null);
                            setFormData({ title: "", description: "", status: true });
                        } else {
                            setShowModal(true);
                            setFormData({ title: "", description: "", status: true });
                        }
                    }}
                >
                    {showModal || showEditModal ? <><HiArrowLeft className="w-4 h-4" /> {Constants.superadminConstants.back}</> : <><HiPlus className="w-4 h-4" /> {Constants.superadminConstants.add}</>}
                </WebComponents.UiComponents.UiWebComponents.Button>
            </div>

            {/* {!showModal && !showEditModal && ( */}
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
                    {loading ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                            <p className="mt-2 text-gray-600 dark:text-gray-400">Loading business types...</p>
                        </div>
                    ) : (
                        <WebComponents.WebCommonComponents.CommonComponents.DataTable
                            data={businessTypes}
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
            {/* )} */}

            {(showModal || showEditModal) && (
                <LandingFormModels.BusinessTypeFormModel
                    title={showEditModal ? "Edit Business Type" : "Add Business Type"}
                    onClose={() => {
                        setShowModal(false);
                        setShowEditModal(false);
                        setEditingBusinessType(null);
                        setFormData({ title: "", description: "", status: true });
                    }}
                    onSubmit={showEditModal ? handleEdit : handleAdd}
                    formData={formData}
                    setFormData={setFormData}
                    businessTypeLoading={loading}
                />
            )}
        </div>
    )
}

export default BusinessType;
