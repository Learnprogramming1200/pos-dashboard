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

const FAQ = ({ initialFAQs, faqsPagination, faqCategories }: {
   readonly initialFAQs: SuperAdminTypes.LandingSettingPageTypes.FAQRow[];
    readonly faqsPagination: PaginationType.Pagination;
    readonly faqCategories: SuperAdminTypes.LandingSettingPageTypes.FAQCategoryRow[];
}) => {
    const [faqs, setFaqs] = React.useState<SuperAdminTypes.LandingSettingPageTypes.FAQRow[]>(initialFAQs);
    const [pagination, setPagination] = React.useState<PaginationType.Pagination>(faqsPagination);
    const [loading, setLoading] = React.useState(false);
    const [showModal, setShowModal] = React.useState(false);
    const [showEditModal, setShowEditModal] = React.useState(false);
    const [editingFAQ, setEditingFAQ] = React.useState<SuperAdminTypes.LandingSettingPageTypes.FAQRow | null>(null);
    const [actionFilter, setActionFilter] = React.useState('All');
    const [activeStatusFilter, setActiveStatusFilter] = React.useState('All');
    const [selectedRows, setSelectedRows] = React.useState<SuperAdminTypes.LandingSettingPageTypes.FAQRow[]>([]);
    const [clearSelectedRows, setClearSelectedRows] = React.useState(false);
    const [formData, setFormData] = React.useState<{
        question: string;
        answer: string;
        isPublished: boolean;
        categoryId?: string | null;
    }>({
        question: "",
        answer: "",
        isPublished: true,
        categoryId: ""
    });
    const router = useRouter();

    // Sync state with props when URL params change
    React.useEffect(() => {
        setFaqs(initialFAQs);
        setPagination(faqsPagination);
    }, [initialFAQs]);

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

    // FAQ handlers
    const handleAdd = async () => {
        await ServerActions.HandleFunction.handleAddCommon({
            formData,
            createAction: ServerActions.ServerActionslib.createFAQAction,
            setLoading,
            setShowModal,
            router,
            successMessage: 'FAQ added successfully.',
            errorMessage: 'Failed to add FAQ.',
            onSuccess: (result) => {
                if (result?.data?.data) {
                    setFaqs(prev => [...prev, result.data.data]);
                    setFormData({ question: "", answer: "", isPublished: true, categoryId: "" });
                }
            },
        });
    };

    const handleEdit = async () => {
        await ServerActions.HandleFunction.handleEditCommon({
            formData,
            editingItem: editingFAQ,
            getId: (item) => (item as any)._id,
            updateAction: (id, data) => ServerActions.ServerActionslib.updateFAQAction(id as string, data),
            setLoading,
            setShowEditModal,
            setEditingItem: setEditingFAQ,
            router,
            successMessage: 'FAQ updated successfully.',
            errorMessage: 'Failed to update FAQ.',
            onSuccess: (result) => {
                if (result?.data?.data && editingFAQ) {
                    setFaqs(prev => prev.map(faq => (faq as any)._id === (editingFAQ as any)._id ? result.data.data : faq));
                    setFormData({ question: "", answer: "", isPublished: true, categoryId: "" });
                }
            },
        });
    };

    const handleDelete = async (id: string) => {
        await ServerActions.HandleFunction.handleDeleteCommon({
            id,
            deleteAction: (id) => ServerActions.ServerActionslib.deleteFAQAction(id as string),
            setLoading,
            router,
            successMessage: 'FAQ deleted successfully.',
            errorMessage: 'Failed to delete FAQ.',
            onSuccess: () => {
                setFaqs(prev => prev.filter(faq => (faq as any)._id !== id));
            },
        });
    };

    const handleToggleStatus = React.useCallback(async (row: SuperAdminTypes.LandingSettingPageTypes.FAQRow, next: boolean) => {
        setFaqs(prev => prev.map(faq => ((faq as any)._id === (row as any)._id ? { ...faq, isPublished: next } : faq)));
        await ServerActions.HandleFunction.handleToggleStatusCommon({
            row,
            next,
            getId: (item) => (item as any)._id,
            preparePayload: () => ({ isPublished: next }),
            updateAction: (id, data) => ServerActions.ServerActionslib.updateFAQAction(id as string, data),
            setLoading,
            router,
            successMessage: `Status updated to ${next ? 'Published' : 'Hidden'}.`,
            errorMessage: 'Failed to update status.',
            onError: () => {
                setFaqs(prev => prev.map(faq => ((faq as any)._id === (row as any)._id ? { ...faq, isPublished: !next } : faq)));
            },
        });
    }, [router]);

    const handleToggleStatusById = React.useCallback(async (id: string, next: boolean) => {
        const row = faqs.find(faq => (faq as any)._id === id);
        if (row) await handleToggleStatus(row, next);
    }, [faqs, handleToggleStatus]);

    const handleBulkApply = React.useCallback(async () => {
        await ServerActions.HandleFunction.handleBulkApplyCommon({
            selectedRows,
            actionFilter,
            activeStatusFilter,
            items: faqs,
            setItems: setFaqs,
            bulkDeleteAction: ServerActions.ServerActionslib.bulkDeleteFAQsAction,
            bulkUpdateStatusAction: ServerActions.ServerActionslib.bulkUpdateFAQsStatusAction,
            clearSelectedData,
            idSelector: (r) => (r as any)._id,
            statusProp: 'isPublished',
        });
    }, [selectedRows, actionFilter, activeStatusFilter, faqs]);

    const tableColumns = React.useMemo(() => WebComponents.WebCommonComponents.CommonComponents.createColumns<SuperAdminTypes.LandingSettingPageTypes.FAQRow>({
        fields: [
            {
                name: "Question",
                selector: (row: any) => row.question,
                sortable: true,
                cell: (row: any) => (
                    <div className="max-w-xs font-medium truncate" title={row.question}>
                        {row.question}
                    </div>
                ),
            },
            {
                name: "Answer",
                selector: (row: any) => row.answer,
                sortable: true,
                cell: (row: any) => (
                    <div className="max-w-xs font-medium truncate" title={row.answer}>
                        {row.answer}
                    </div>
                ),
            },
            {
                name: "Category",
                selector: (row: any) => row.categoryId?.categoryName || '-',
                sortable: true,
            },
        ],
        status: {
            name: "Status",
            idSelector: (row: any) => (row as any)._id,
            valueSelector: (row: any) => !!row.isPublished,
            onToggle: handleToggleStatusById,
        },
        actions: [
            {
                render: (row: any) => (
                    <WebComponents.UiComponents.UiWebComponents.Button
                        size="icon"
                        variant="editaction"
                        onClick={() => {
                            setEditingFAQ(row);
                            setFormData({
                                question: row.question || "",
                                answer: row.answer || "",
                                isPublished: !!row.isPublished,
                                categoryId: row.categoryId?._id || row.categoryId || ""
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
                        {Constants.superadminConstants.tabFAQ || "FAQ"}
                        {(() => {
                            if (!showModal && !showEditModal) return "";
                            const modalTitle = showModal ? "Add FAQ" : "Edit FAQ";
                            return ` > ${modalTitle}`;
                        })()}
                    </h1>
                    <p className="text-xs sm:text-sm md:text-base text-textSmall pt-2">
                        Manage your frequently asked questions here.
                    </p>
                </div>
                <WebComponents.UiComponents.UiWebComponents.Button
                    variant="addBackButton"
                    onClick={() => {
                        if (showModal || showEditModal) {
                            setShowModal(false);
                            setShowEditModal(false);
                            setEditingFAQ(null);
                            setFormData({ question: "", answer: "", isPublished: true, categoryId: "" });
                        } else {
                            setShowModal(true);
                            setFormData({ question: "", answer: "", isPublished: true, categoryId: "" });
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
                            <p className="mt-2 text-gray-600 dark:text-gray-400">Loading FAQs...</p>
                        </div>
                    ) : (
                        <WebComponents.WebCommonComponents.CommonComponents.DataTable
                            data={faqs}
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
                <LandingFormModels.FAQFormModel
                    title={showEditModal ? "Edit FAQ" : "Add FAQ"}
                    onClose={() => {
                        setShowModal(false);
                        setShowEditModal(false);
                        setEditingFAQ(null);
                        setFormData({ question: "", answer: "", isPublished: true, categoryId: "" });
                    }}
                    onSubmit={showEditModal ? handleEdit : handleAdd}
                    formData={formData}
                    setFormData={setFormData}
                    faqLoading={loading}
                    faqCategories={faqCategories}
                />
            )}
        </div>
    );
};

export default FAQ;