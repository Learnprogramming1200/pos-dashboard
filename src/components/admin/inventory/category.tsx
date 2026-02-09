"use client";
import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from 'next/image';
import { FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import { HiArrowLeft, HiPlus } from "react-icons/hi";
import { ServerActions } from "@/lib";
import { Constants } from "@/constant";
import { customHooks } from "@/hooks";
import { WebComponents } from "@/components";
import { AdminTypes, PaginationType } from "@/types";
export default function Category({
  initialCategories,
  initialPagination,
}: {
  readonly initialCategories: AdminTypes.InventoryTypes.ProductCategoryTypes.ServerCategoryType[];
  readonly initialPagination: PaginationType.Pagination;
}) {
  const [categories, setCategories] = React.useState<AdminTypes.InventoryTypes.ProductCategoryTypes.ServerCategoryType[]>(initialCategories);
  const [pagination, setPagination] = React.useState<PaginationType.Pagination>(initialPagination);
  const [loading, setLoading] = React.useState(false);
  const [showModal, setShowModal] = React.useState(false);
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [showDetailsModal, setShowDetailsModal] = React.useState(false);
  const [editingCategory, setEditingCategory] = React.useState<AdminTypes.InventoryTypes.ProductCategoryTypes.ServerCategoryType | null>(null);
  const [selectedCategory, setSelectedCategory] = React.useState<AdminTypes.InventoryTypes.ProductCategoryTypes.ServerCategoryType | null>(null);
  const [actionFilter, setActionFilter] = React.useState("All");
  const [activeStatusFilter, setActiveStatusFilter] = React.useState("All");
  const [selectedRows, setSelectedRows] = React.useState<AdminTypes.InventoryTypes.ProductCategoryTypes.ServerCategoryType[]>([]);
  const [clearSelectedRows, setClearSelectedRows] = React.useState(false);
  const [downloadData, setDownloadData] = React.useState([])
  const router = useRouter();
  const searchParams = useSearchParams();
  const { searchTerm, setSearchTerm, statusFilter, setStatusFilter, filteredData } = customHooks.useListFilters<AdminTypes.InventoryTypes.ProductCategoryTypes.ServerCategoryType>(
    categories,
  )
  const { checkPermission } = customHooks.useUserPermissions();
  // Sync state with props when URL params change (server re-fetches data)
  React.useEffect(() => {
    setCategories(initialCategories);
    setPagination(initialPagination);
  }, [initialCategories]);

  // Reset action filter when no rows are selected
  React.useEffect(() => {
    if (selectedRows.length === 0) {
      setActionFilter('All');
      setActiveStatusFilter('All');
    }
  }, [selectedRows]);

  // CSV and PDF export columns
  const exportColumns = React.useMemo(() => {
    return WebComponents.WebCommonComponents.CommonComponents.generateExportColumns<AdminTypes.InventoryTypes.ProductCategoryTypes.ServerCategoryType>([
      {
        key: 'categoryName',
        label: Constants.adminConstants.categoryName,
        accessor: (row) => row.categoryName || '-',
        pdfWidth: 45
      },
      {
        key: 'description',
        label: Constants.adminConstants.descriptionColumn,
        accessor: (row) => row.description || '-',
        pdfWidth: 80
      },
      {
        key: 'createdAt',
        label: Constants.adminConstants.createdOn,
        accessor: (row) => row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '-',
        pdfWidth: 35
      },
      {
        key: 'updatedAt',
        label: Constants.adminConstants.updatedOn,
        accessor: (row) => row.updatedAt ? new Date(row.updatedAt).toLocaleDateString() : '-',
        pdfWidth: 35
      },
      {
        key: 'status',
        label: Constants.adminConstants.statusLabel,
        accessor: (row) => row.isActive ? 'Active' : 'Inactive',
        pdfWidth: 25
      }
    ]);
  }, []);

  // Add
  const handleAdd = async (formData: AdminTypes.InventoryTypes.ProductCategoryTypes.ProductCategoryForm) => {
    await ServerActions.HandleFunction.handleAddCommon({
      formData,
      createAction: ServerActions.ServerActionslib.createProductCategoryAction,
      setLoading,
      setShowModal,
      router,
      successMessage: Constants.adminConstants.createdSuccessfully,
      errorMessage: Constants.adminConstants.addFailed,
      onSuccess: (result) => {
        if (result?.data?.data) {
          setCategories(prev => [...prev, result.data.data]);
        }
      },
    });
  };

  // Edit
  const handleEdit = async (formData: AdminTypes.InventoryTypes.ProductCategoryTypes.ProductCategoryForm) => {
    await ServerActions.HandleFunction.handleEditCommon({
      formData,
      editingItem: editingCategory,
      getId: (item) => item._id,
      updateAction: (id: string | number, data: typeof formData) =>
        ServerActions.ServerActionslib.updateProductCategoryAction(id as string, data),
      setLoading,
      setShowEditModal,
      setEditingItem: setEditingCategory,
      router,
      successMessage: Constants.adminConstants.updatedSuccessfully,
      errorMessage: Constants.adminConstants.updateFailed,
      onSuccess: (result) => {
        if (result?.data?.data && editingCategory) {
          setCategories(prev => prev.map(category =>
            category._id === editingCategory._id ? result.data.data : category
          ));
        }
      },
    });
  };

  // View Details
  const handleViewDetails = React.useCallback((category: AdminTypes.InventoryTypes.ProductCategoryTypes.ServerCategoryType) => {
    setSelectedCategory(category);
    setShowDetailsModal(true);
  }, []);

  const handleToggleStatus = React.useCallback(async (row: AdminTypes.InventoryTypes.ProductCategoryTypes.ServerCategoryType, next: boolean) => {
    setCategories(prev => prev.map(category => (category._id === row._id ? { ...category, isActive: next } : category)));
    await ServerActions.HandleFunction.handleToggleStatusCommon({
      row,
      next,
      getId: (item) => item._id,
      preparePayload: () => ({ isActive: next }),
      updateAction: (id: string | number, data: { isActive: boolean }) =>
        ServerActions.ServerActionslib.updateProductCategoryAction(id as string, data),
      setLoading,
      router,
      successMessage: `Status updated to ${next ? 'Active' : 'Inactive'}.`,
      errorMessage: 'Failed to update status.',
      onError: () => {
        // Revert optimistic update on error
        setCategories(prev => prev.map(category => (category._id === row._id ? { ...category, isActive: !next } : category)));
      },
    });
  }, [router]);

  const handleToggleStatusById = React.useCallback(
    async (id: string, next: boolean) => {
      const row = categories.find(c => c._id === id);
      if (row) {
        await handleToggleStatus(row, next);
      }
    },
    [categories, handleToggleStatus]
  );
  // Delete
  const handleDelete = async (id: string) => {
    await ServerActions.HandleFunction.handleDeleteCommon({
      id,
      deleteAction: (id: string | number) =>
        ServerActions.ServerActionslib.deleteProductCategoryAction(id as string),
      setLoading,
      router,
      successMessage: 'The category has been deleted.',
      errorMessage: 'Failed to delete category.',
      onSuccess: () => {
        setCategories(prev => prev.filter(category => category._id !== id));
      },
    });
  };

  // Open edit modal
  const handleEditModal = React.useCallback((category: AdminTypes.InventoryTypes.ProductCategoryTypes.ServerCategoryType) => {
    setEditingCategory(category);
    setShowEditModal(true);
  }, []);

  // clear selected data
  const clearSelectedData = () => {
    setClearSelectedRows(prev => !prev);
    setSelectedRows([]);
    router.refresh();
  }

  // Bulk apply handler (status update / delete)
  const handleBulkApply = React.useCallback(async () => {
    await ServerActions.HandleFunction.handleBulkApplyCommon({
      selectedRows,
      actionFilter,
      activeStatusFilter,
      items: categories,
      setItems: setCategories,
      bulkDeleteAction: ServerActions.ServerActionslib.bulkDeleteProductCategoriesAction,
      bulkUpdateStatusAction: ServerActions.ServerActionslib.bulkUpdateProductCategoriesStatusAction,
      clearSelectedData,
      idSelector: (r) => r._id,
      statusProp: 'isActive',
    });
  }, [selectedRows, actionFilter, activeStatusFilter, categories, clearSelectedData]);
  // download pdf or csv
  const downloadPdf = async (): Promise<any[]> => {
    return await ServerActions.HandleFunction.handleDownloadCommon({
      selectedRows,
      searchParams,
      bulkGetSelectedAction: ServerActions.ServerActionslib.bulkGetSelectedProductCatgeoryAction,
      bulkGetAllAction: ServerActions.ServerActionslib.bulkGetProductCatgeoryAction,
      setDownloadData,
    });
  };

  const bulkActionOptions = React.useMemo(() => {
    const options = Constants.commonConstants.actionOptions;
    return options.filter(option => {
      if (option.value === 'Status') {
        return checkPermission("inventory.category", "update");
      }
      if (option.value === 'Delete') {
        return checkPermission("inventory.category", "delete");
      }
      return true;
    });
  }, [checkPermission]);

  const tableColumns = React.useMemo(() => WebComponents.WebCommonComponents.CommonComponents.createColumns<AdminTypes.InventoryTypes.ProductCategoryTypes.ServerCategoryType>({
    fields: [
      {
        name: Constants.adminConstants.categoryName,
        selector: (row: AdminTypes.InventoryTypes.ProductCategoryTypes.ServerCategoryType) => row.categoryName,
        sortable: true,
        width: "15%"
      },
      {
        name: Constants.adminConstants.descriptionColumn,
        selector: (row: AdminTypes.InventoryTypes.ProductCategoryTypes.ServerCategoryType) => row.description,
        sortable: true,
        width: "25%"
      },
      {
        name: Constants.adminConstants.createdOn,
        selector: (row: AdminTypes.InventoryTypes.ProductCategoryTypes.ServerCategoryType) => {
          return row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '-';
        },
        sortable: true
      },
      {
        name: Constants.adminConstants.updatedOn,
        selector: (row: AdminTypes.InventoryTypes.ProductCategoryTypes.ServerCategoryType) => {
          return row.updatedAt ? new Date(row.updatedAt).toLocaleDateString() : '-';
        },
        sortable: true
      },
    ],
    status: {
      name: Constants.adminConstants.statusLabel,
      idSelector: (row) => row._id,
      valueSelector: (row) => !!row.isActive,
      onToggle: handleToggleStatusById,

    },
    actions: [
      {
        render: (row) => (
          <WebComponents.UiComponents.UiWebComponents.Button size="icon" variant="viewaction" onClick={() => handleViewDetails(row)}>
            <FaEye className="w-4 h-4" />
          </WebComponents.UiComponents.UiWebComponents.Button>
        ),
      },
      ...(checkPermission("inventory.category", "update") ? [{
        render: (row: any) => (
          <WebComponents.UiComponents.UiWebComponents.Button size="icon" variant="editaction" onClick={() => handleEditModal(row)}>
            <FaEdit className="w-4 h-4" />
          </WebComponents.UiComponents.UiWebComponents.Button>
        ),
      }] : []),
      ...(checkPermission("inventory.category", "delete") ? [{
        render: (row: any) => (
          <WebComponents.UiComponents.UiWebComponents.Button size="icon" variant="deleteaction" onClick={() => handleDelete(row._id)}>
            <FaTrash className="w-4 h-4" />
          </WebComponents.UiComponents.UiWebComponents.Button>
        ),
      }] : []),
    ],
  }), [handleToggleStatusById, handleViewDetails, handleEditModal, handleDelete, checkPermission]);

  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-lg sm:text-lg md:text-xl lg:text-2xl font-medium text-textMain dark:text-white truncate">
            {Constants.adminConstants.title}
            {(() => {
              if (!showModal && !showEditModal) return "";
              const modalTitle = showModal ? Constants.adminConstants.addModalTitle : Constants.adminConstants.editModalTitle;
              return ` > ${modalTitle}`;
            })()}
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-textSmall pt-2">
            {Constants.adminConstants.categorydescription}
          </p>
        </div>
        {(showModal || showEditModal || checkPermission("inventory.category", "create")) && (
          <WebComponents.UiComponents.UiWebComponents.Button
            variant="addBackButton"
            onClick={() => {
              if (showModal || showEditModal) {
                setShowModal(false);
                setShowEditModal(false);
                setEditingCategory(null);
              } else {
                setShowModal(true);
              }
            }}
          >
            {showModal || showEditModal ? <><HiArrowLeft className="w-4 h-4" /> {Constants.adminConstants.back}</> : <><HiPlus className="w-4 h-4" /> {Constants.adminConstants.add}</>}
          </WebComponents.UiComponents.UiWebComponents.Button>
        )}
      </div>

      {/* Show filters and table only when modal is not open */}
      {!showModal && !showEditModal && (
        <div className="bg-white dark:bg-darkFilterbar rounded-[4px] h-full w-full mt-4 overflow-hidden">
          {/* Filters */}
          < WebComponents.WebCommonComponents.CommonComponents.CommonFilterBar
            actionFilter={actionFilter}
            onActionFilterChange={(value: string) => {
              setActionFilter(value);
              if (value !== 'Status') {
                setActiveStatusFilter('All');
              }
            }}
            actionOptions={bulkActionOptions}
            activeStatusFilter={activeStatusFilter}
            onActiveStatusFilterChange={setActiveStatusFilter}
            activeStatusOptions={Constants.commonConstants.activeStatusOptions}
            selectedCount={selectedRows.length}
            onApply={bulkActionOptions.length > 0 ? handleBulkApply : undefined}
            categoryFilter="All"
            onCategoryFilterChange={() => { }}
            categoryOptions={[]}
            showCategoryFilter={false}
            statusFilter={statusFilter}
            onStatusFilterChange={(value: string) => {
              const validValue = value === "Active" || value === "Inactive" ? value : "All";
              setStatusFilter(validValue);
            }}
            statusOptions={[
              { label: 'All Status', value: 'All' },
              { label: 'Active', value: 'Active' },
              { label: 'Inactive', value: 'Inactive' },
            ]}
            searchTerm={searchTerm}
            onSearchTermChange={setSearchTerm}
            renderExports={
              <>
                <WebComponents.UiComponents.UiWebComponents.DownloadCSV
                  data={downloadData}
                  columns={exportColumns.csvColumns}
                  filename={`categories-${new Date().toISOString().split('T')[0]}.csv`}
                  onExport={async () => {
                    const data = await downloadPdf();
                    WebComponents.UiComponents.UiWebComponents.SwalHelper.success({ text: 'CSV exported successfully.' });
                    clearSelectedData()
                    return data;
                  }}
                >
                  <button
                    type="button"
                    className="rounded-[4px] bg-[#ffffff] dark:bg-[#3A3A3A] border border-[#D8D9D9] border-opacity-50 font-interTight font-normal hover:bg-[#e0e0e0] dark:hover:bg-[#4A4A4A] shadow-sm transition-colors duration-200 cursor-pointer flex-shrink-0 sm:px-1 md:px-2 lg:px-2 xl:px-2 2xl:px-2 px-2 py-[6.9px]"
                    aria-label="Download CSV"
                    title="Download CSV"
                    disabled={categories.length === 0}
                  >
                    <Image src={Constants.assetsIcon.assets.csv} alt="CSV" width={28} height={28} className="w-5 h-5 sm:w-6 sm:h-6 md:w-6 md:h-6 lg:w-7 lg:h-7 xl:w-7 xl:h-7 2xl:w-7 2xl:h-7" />
                  </button>
                </WebComponents.UiComponents.UiWebComponents.DownloadCSV>
                <WebComponents.UiComponents.UiWebComponents.DownloadPDF
                  data={downloadData}
                  columns={exportColumns.pdfColumns}
                  filename={`categories-${new Date().toISOString().split('T')[0]}.pdf`}
                  title="Categories Report"
                  orientation="landscape"
                  onExport={async () => {
                    const data = await downloadPdf();
                    WebComponents.UiComponents.UiWebComponents.SwalHelper.success({ text: 'PDF exported successfully.' });
                    clearSelectedData()
                    return data;
                  }}
                >
                  <button
                    type="button"
                    className="rounded-[4px] bg-[#ffffff] dark:bg-[#3A3A3A] border border-[#D8D9D9] border-opacity-50 font-interTight font-normal hover:bg-[#e0e0e0] dark:hover:bg-[#4A4A4A] shadow-sm transition-colors duration-200 cursor-pointer flex-shrink-0 sm:px-1 md:px-2 lg:px-2 xl:px-2 2xl:px-2 px-2 py-[6.9px]"
                    aria-label="Download PDF"
                    title="Download PDF"
                    disabled={categories.length === 0}
                  >
                    <Image src={Constants.assetsIcon.assets.pdf} alt="PDF" width={28} height={28} className="w-5 h-5 sm:w-6 sm:h-6 md:w-6 md:h-6 lg:w-7 lg:h-7 xl:w-7 xl:h-7 2xl:w-7 2xl:h-7" />
                  </button>
                </WebComponents.UiComponents.UiWebComponents.DownloadPDF>
              </>
            }
          />
          < WebComponents.WebCommonComponents.CommonComponents.DataTable
            columns={tableColumns}
            data={filteredData}
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
        </div>
      )}

      {/* Show modal when open */}
      {(showModal || showEditModal) && (
        <WebComponents.UiComponents.UiWebComponents.AdminFormModal
          formId="category-form"
          onClose={() => {
            setShowModal(false);
            setShowEditModal(false);
            setEditingCategory(null);
          }}
          loading={loading}
        >
          {editingCategory ? (
            <WebComponents.AdminComponents.AdminWebComponents.Forms.CategoryForm
              onSubmit={handleEdit}
              category={editingCategory}
            />
          ) : (
            <WebComponents.AdminComponents.AdminWebComponents.Forms.CategoryForm onSubmit={handleAdd} />
          )}
        </WebComponents.UiComponents.UiWebComponents.AdminFormModal>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedCategory && (
        <WebComponents.AdminComponents.AdminWebComponents.Models.CategoryDetailsModal
          category={selectedCategory}
          onClose={() => setShowDetailsModal(false)}
        />
      )}
    </>
  );
}
