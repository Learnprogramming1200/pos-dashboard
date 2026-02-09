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

const FAQCategory = ({ initialFAQCategories, faqCategoriesPagination }: {
    readonly initialFAQCategories: SuperAdminTypes.LandingSettingPageTypes.FAQCategoryRow[]
   readonly faqCategoriesPagination: PaginationType.Pagination
}) => {
    const [faqCategories, setFaqCategories] = React.useState<SuperAdminTypes.LandingSettingPageTypes.FAQCategoryRow[]>(initialFAQCategories);
    const [pagination, setPagination] = React.useState<PaginationType.Pagination>(faqCategoriesPagination);
    const [loading, setLoading] = React.useState(false);
    const [showModal, setShowModal] = React.useState(false);
    const [showEditModal, setShowEditModal] = React.useState(false);
    const [editingFAQCategory, setEditingFAQCategory] = React.useState<SuperAdminTypes.LandingSettingPageTypes.FAQCategoryRow | null>(null);
    const [actionFilter, setActionFilter] = React.useState('All');
    const [activeStatusFilter, setActiveStatusFilter] = React.useState('All');
    const [selectedRows, setSelectedRows] = React.useState<SuperAdminTypes.LandingSettingPageTypes.FAQCategoryRow[]>([]);
    const [clearSelectedRows, setClearSelectedRows] = React.useState(false);
    const [formData, setFormData] = React.useState({
        categoryName: "",
        status: true
    });
    const router = useRouter();

    // Sync state with props when URL params change
    React.useEffect(() => {
        setFaqCategories(initialFAQCategories);
        setPagination(faqCategoriesPagination);
    }, [initialFAQCategories]);

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

    // FAQ Category handlers
    const handleAdd = async () => {
        await ServerActions.HandleFunction.handleAddCommon({
            formData,
            createAction: ServerActions.ServerActionslib.createFAQCategoryAction,
            setLoading,
            setShowModal,
            router,
            successMessage: 'FAQ category added successfully.',
            errorMessage: 'Failed to add FAQ category.',
            onSuccess: (result) => {
                if (result?.data?.data) {
                    setFaqCategories(prev => [...prev, result.data.data]);
                    setFormData({ categoryName: "", status: true });
                }
            },
           
        });
    };

    const handleEdit = async () => {
        await ServerActions.HandleFunction.handleEditCommon({
            formData,
            editingItem: editingFAQCategory,
            getId: (item) => (item as any)._id,
            updateAction: (id, data) => ServerActions.ServerActionslib.updateFAQCategoryAction(id as string, data),
            setLoading,
            setShowEditModal,
            setEditingItem: setEditingFAQCategory,
            router,
            successMessage: 'FAQ category updated successfully.',
            errorMessage: 'Failed to update FAQ category.',
            onSuccess: (result) => {
                if (result?.data?.data && editingFAQCategory) {
                    setFaqCategories(prev => prev.map(cat => (cat as any)._id === (editingFAQCategory as any)._id ? result.data.data : cat));
                    setFormData({ categoryName: "", status: true });
                }
            },
          
        });
    };

    const handleDelete = async (id: string) => {
        await ServerActions.HandleFunction.handleDeleteCommon({
            id,
            deleteAction: (id) => ServerActions.ServerActionslib.deleteFAQCategoryAction(id as string),
            setLoading,
            router,
            successMessage: 'FAQ category deleted successfully.',
            errorMessage: 'Failed to delete FAQ category.',
            onSuccess: () => {
                setFaqCategories(prev => prev.filter(cat => (cat as any)._id !== id));
            },
           
        });
    };

    const handleToggleStatus = React.useCallback(async (row: SuperAdminTypes.LandingSettingPageTypes.FAQCategoryRow, next: boolean) => {
        setFaqCategories(prev => prev.map(cat => ((cat as any)._id === (row as any)._id ? { ...cat, status: next } : cat)));
        await ServerActions.HandleFunction.handleToggleStatusCommon({
            row,
            next,
            getId: (item) => (item as any)._id,
            preparePayload: () => ({ status: next }),
            updateAction: (id, data) => ServerActions.ServerActionslib.updateFAQCategoryAction(id as string, data),
            setLoading,
            router,
            successMessage: `Status updated to ${next ? 'Active' : 'Inactive'}.`,
            errorMessage: 'Failed to update status.',
            onError: () => {
                setFaqCategories(prev => prev.map(cat => ((cat as any)._id === (row as any)._id ? { ...cat, status: !next } : cat)));
            },
          
        });
    }, [router]);

    const handleToggleStatusById = React.useCallback(async (id: string, next: boolean) => {
        const row = faqCategories.find(cat => (cat as any)._id === id);
        if (row) await handleToggleStatus(row, next);
    }, [faqCategories, handleToggleStatus]);

    const handleBulkApply = React.useCallback(async () => {
        await ServerActions.HandleFunction.handleBulkApplyCommon({
            selectedRows,
            actionFilter,
            activeStatusFilter,
            items: faqCategories,
            setItems: setFaqCategories,
            bulkDeleteAction: ServerActions.ServerActionslib.bulkDeleteFAQCategoriesAction,
            bulkUpdateStatusAction: ServerActions.ServerActionslib.bulkUpdateFAQCategoriesStatusAction,
            clearSelectedData,
            idSelector: (r) => (r as any)._id,
            statusProp: 'status',
        });
    }, [selectedRows, actionFilter, activeStatusFilter, faqCategories]);

    const tableColumns = React.useMemo(() => WebComponents.WebCommonComponents.CommonComponents.createColumns<SuperAdminTypes.LandingSettingPageTypes.FAQCategoryRow>({
        fields: [
            {
                name: "Category Name",
                selector: (row: any) => row.categoryName,
                sortable: true,
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
                            setEditingFAQCategory(row);
                            setFormData({
                                categoryName: row.categoryName || "",
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
                        {Constants.superadminConstants.tabFAQCategory || "FAQ Category"}
                        {(() => {
                            if (!showModal && !showEditModal) return "";
                            const modalTitle = showModal ? "Add FAQ Category" : "Edit FAQ Category";
                            return ` > ${modalTitle}`;
                        })()}
                    </h1>
                    <p className="text-xs sm:text-sm md:text-base text-textSmall pt-2">
                        Manage your FAQ categories here.
                    </p>
                </div>
                <WebComponents.UiComponents.UiWebComponents.Button
                    variant="addBackButton"
                    onClick={() => {
                        if (showModal || showEditModal) {
                            setShowModal(false);
                            setShowEditModal(false);
                            setEditingFAQCategory(null);
                            setFormData({ categoryName: "", status: true });
                        } else {
                            setShowModal(true);
                            setFormData({ categoryName: "", status: true });
                        }
                    }}
                >
                    {showModal || showEditModal ? <><HiArrowLeft className="w-4 h-4" /> {Constants.superadminConstants.back}</> : <><HiPlus className="w-4 h-4" /> {Constants.superadminConstants.add}</>}
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
                    {loading ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                            <p className="mt-2 text-gray-600 dark:text-gray-400">Loading FAQ categories...</p>
                        </div>
                    ) : (
                        <WebComponents.WebCommonComponents.CommonComponents.DataTable
                            data={faqCategories}
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
                <LandingFormModels.FAQCategoryFormModel
                    title={showEditModal ? "Edit FAQ Category" : "Add FAQ Category"}
                    onClose={() => {
                        setShowModal(false);
                        setShowEditModal(false);
                        setEditingFAQCategory(null);
                        setFormData({ categoryName: "", status: true });
                    }}
                    onSubmit={showEditModal ? handleEdit : handleAdd}
                    formData={formData}
                    setFormData={setFormData}
                    faqCategoryLoading={loading}
                />
            )}
        </div>
    );
};

export default FAQCategory;
