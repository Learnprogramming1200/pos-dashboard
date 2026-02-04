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
import { PaginationType, SuperAdminTypes } from "@/types";

const Blog = ({
    initialBlogs,
    blogsPagination
}: {
    readonly initialBlogs: SuperAdminTypes.LandingSettingPageTypes.BlogRow[];
    readonly blogsPagination: PaginationType.Pagination;
}) => {
    const [blogs, setBlogs] = React.useState<SuperAdminTypes.LandingSettingPageTypes.BlogRow[]>(initialBlogs);
    const [pagination, setPagination] = React.useState<PaginationType.Pagination>(blogsPagination);
    const [loading, setLoading] = React.useState(false);
    const [showModal, setShowModal] = React.useState(false);
    const [showEditModal, setShowEditModal] = React.useState(false);
    const [editingItem, setEditingItem] = React.useState<SuperAdminTypes.LandingSettingPageTypes.BlogRow | null>(null);
    const [actionFilter, setActionFilter] = React.useState("All");
    const [activeStatusFilter, setActiveStatusFilter] = React.useState("All");
    const [selectedRows, setSelectedRows] = React.useState<SuperAdminTypes.LandingSettingPageTypes.BlogRow[]>([]);
    const [clearSelectedRows, setClearSelectedRows] = React.useState(false);
    const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
    const [formData, setFormData] = React.useState<{
        title: string;
        overview: string;
        description: string;
        tags: string[];
        createdBy: string;
        readTime: number;
        blogImage: string | File | undefined;
        isPublished: boolean;
    }>({
        title: "",
        overview: "",
        description: "",
        tags: [],
        createdBy: "",
        readTime: 0,
        blogImage: undefined,
        isPublished: true
    });
    const router = useRouter();

    // Sync state with props when URL params change
    React.useEffect(() => {
        setBlogs(initialBlogs);
        setPagination(blogsPagination);
    }, [initialBlogs]);

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
            payload.blogImage = selectedFile;
        }
        await ServerActions.HandleFunction.handleAddCommon({
            formData: payload,
            createAction: ServerActions.ServerActionslib.createBlogAction,
            setLoading,
            setShowModal,
            router,
            successMessage: "Blog added successfully.",
            errorMessage: "Failed to add blog.",
            onSuccess: (result) => {
                if (result?.data?.data) {
                    setBlogs((prev) => [...prev, result.data.data]);
                    setFormData({
                        title: "",
                        overview: "",
                        description: "",
                        tags: [],
                        createdBy: "",
                        readTime: 0,
                        blogImage: undefined,
                        isPublished: true
                    });
                    setSelectedFile(null);
                }
            },
        });
    };

    const handleEdit = async () => {
        const payload = { ...formData };
        if (selectedFile) {
            payload.blogImage = selectedFile;
        }
        await ServerActions.HandleFunction.handleEditCommon({
            formData: payload,
            editingItem,
            getId: (item) => (item as any)._id,
            updateAction: (id, data) => ServerActions.ServerActionslib.updateBlogAction(id as string, data),
            setLoading,
            setShowEditModal,
            setEditingItem,
            router,
            successMessage: "Blog updated successfully.",
            errorMessage: "Failed to update blog.",
            onSuccess: (result) => {
                if (result?.data?.data && editingItem) {
                    setBlogs((prev) => prev.map((b) => ((b as any)._id === (editingItem as any)._id ? result.data.data : b)));
                    setFormData({
                        title: "",
                        overview: "",
                        description: "",
                        tags: [],
                        createdBy: "",
                        readTime: 0,
                        blogImage: undefined,
                        isPublished: true
                    });
                    setSelectedFile(null);
                }
            },
        });
    };

    const handleDelete = async (id: string) => {
        await ServerActions.HandleFunction.handleDeleteCommon({
            id,
            deleteAction: (id) => ServerActions.ServerActionslib.deleteBlogAction(id as string),
            setLoading,
            router,
            successMessage: "Blog deleted successfully.",
            errorMessage: "Failed to delete blog.",
            onSuccess: () => {
                setBlogs((prev) => prev.filter((b) => (b as any)._id !== id));
            },
        });
    };

    const handleToggleStatus = React.useCallback(async (row: SuperAdminTypes.LandingSettingPageTypes.BlogRow, next: boolean) => {
        setBlogs((prev) => prev.map((b) => ((b as any)._id === (row as any)._id ? { ...b, isPublished: next } : b)));
        await ServerActions.HandleFunction.handleToggleStatusCommon({
            row,
            next,
            getId: (item) => (item as any)._id,
            preparePayload: () => ({ isPublished: next }),
            updateAction: (id, data) => ServerActions.ServerActionslib.updateBlogAction(id as string, data),
            setLoading,
            router,
            successMessage: `Status updated to ${next ? "Published" : "Unpublished"}.`,
            errorMessage: "Failed to update status.",
            onError: () => {
                setBlogs((prev) => prev.map((b) => ((b as any)._id === (row as any)._id ? { ...b, isPublished: !next } : b)));
            },
        });
    }, [router]);

    const handleToggleStatusById = React.useCallback(async (id: string, next: boolean) => {
        const row = blogs.find((b) => (b as any)._id === id);
        if (row) await handleToggleStatus(row, next);
    }, [blogs, handleToggleStatus]);

    const handleBulkApply = React.useCallback(async () => {
        await ServerActions.HandleFunction.handleBulkApplyCommon({
            selectedRows,
            actionFilter,
            activeStatusFilter,
            items: blogs,
            setItems: setBlogs,
            bulkDeleteAction: ServerActions.ServerActionslib.bulkDeleteBlogsAction,
            bulkUpdateStatusAction: ServerActions.ServerActionslib.bulkUpdateBlogsStatusAction,
            clearSelectedData,
            idSelector: (r) => (r as any)._id,
            statusProp: "isPublished",
        });
    }, [selectedRows, actionFilter, activeStatusFilter, blogs]);

    const tableColumns = React.useMemo(() => WebComponents.WebCommonComponents.CommonComponents.createColumns<SuperAdminTypes.LandingSettingPageTypes.BlogRow>({
        fields: [
            {
                name: "Title",
                selector: (row: any) => row.title,
                sortable: true,
                cell: (row: any) => (
                    <div className="max-w-xs font-medium truncate" title={row.title}>
                        {row.title}
                    </div>
                ),
            },
            {
                name: "Overview",
                selector: (row: any) => row.overview,
                sortable: true,
                cell: (row: any) => (
                    <div className="max-w-xs truncate" title={row.overview}>
                        {row.overview}
                    </div>
                ),
            },
            {
                name: "Tags",
                selector: (row: any) => row.tags?.join(", ") || "-",
                sortable: false,
                cell: (row: any) => (
                    <div className="max-w-xs truncate" title={row.tags?.join(", ")}>
                        {row.tags?.length > 0 ? row.tags.join(", ") : "-"}
                    </div>
                ),
            },
            {
                name: "Created By",
                selector: (row: any) => row.createdBy,
                sortable: true,
            },
            {
                name: "Read Time",
                selector: (row: any) => row.readTime,
                sortable: true,
                cell: (row: any) => `${row.readTime || 0} min`,
            },
            {
                name: "Image",
                selector: (row: any) => row.blogImage,
                sortable: false,
                cell: (row: any) =>
                    row.blogImage ? (
                        <Image
                            className="h-10 w-10 rounded-lg object-cover"
                            src={row.blogImage}
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
                            setEditingItem(row);
                            setFormData({
                                title: row.title || "",
                                overview: row.overview || "",
                                description: row.description || "",
                                tags: row.tags || [],
                                createdBy: row.createdBy || "",
                                readTime: row.readTime || 0,
                                blogImage: row.blogImage || undefined,
                                isPublished: !!row.isPublished
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
                        Blog Management
                        {(() => {
                            if (!showModal && !showEditModal) return "";
                            const modalTitle = showModal ? "Add Blog" : "Edit Blog";
                            return ` > ${modalTitle}`;
                        })()}
                    </h1>
                    <p className="text-xs sm:text-sm md:text-base text-textSmall pt-2">
                        Manage your blog posts here.
                    </p>
                </div>
                <WebComponents.UiComponents.UiWebComponents.Button
                    variant="addBackButton"
                    onClick={() => {
                        if (showModal || showEditModal) {
                            setShowModal(false);
                            setShowEditModal(false);
                            setEditingItem(null);
                            setFormData({
                                title: "",
                                overview: "",
                                description: "",
                                tags: [],
                                createdBy: "",
                                readTime: 0,
                                blogImage: undefined,
                                isPublished: true
                            });
                            setSelectedFile(null);
                        } else {
                            setShowModal(true);
                            setFormData({
                                title: "",
                                overview: "",
                                description: "",
                                tags: [],
                                createdBy: "",
                                readTime: 0,
                                blogImage: undefined,
                                isPublished: true
                            });
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
                    activeStatusOptions={[
                        { name: 'Published', value: 'Active' },
                        { name: 'Unpublished', value: 'Inactive' }
                    ]}
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
                            <p className="mt-2 text-gray-600 dark:text-gray-400">Loading blogs...</p>
                        </div>
                    ) : (
                        <WebComponents.WebCommonComponents.CommonComponents.DataTable
                            data={blogs}
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
                <LandingFormModels.BlogFormModel
                    title={showEditModal ? "Edit Blog" : "Add Blog"}
                    onClose={() => {
                        setShowModal(false);
                        setShowEditModal(false);
                        setEditingItem(null);
                        setFormData({
                            title: "",
                            overview: "",
                            description: "",
                            tags: [],
                            createdBy: "",
                            readTime: 0,
                            blogImage: undefined,
                            isPublished: true
                        });
                        setSelectedFile(null);
                    }}
                    onSubmit={showEditModal ? handleEdit : handleAdd}
                    formData={formData}
                    setFormData={setFormData as any}
                    blogLoading={loading}
                    setSelectedFile={setSelectedFile}
                />
            )}
        </div>
    );
};

export default Blog;
