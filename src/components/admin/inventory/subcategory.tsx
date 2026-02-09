"use client";
import React from "react";
import Image from 'next/image';
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { FaEdit, FaTrash, FaEye, FaArrowLeft, FaPlus } from 'react-icons/fa';
import { Constants } from "@/constant";
import { ServerActions } from "@/lib";
import { customHooks } from "@/hooks";
import { WebComponents } from "@/components";
import { AdminTypes, PaginationType } from "@/types";

export default function SubCategory({
  initialSubCategories,
  initialCategories,
  initialPagination,
}: {
  readonly initialSubCategories: AdminTypes.InventoryTypes.productSubCategoryTypes.SubCategoryType[];
  readonly initialCategories: AdminTypes.InventoryTypes.ProductCategoryTypes.ServerCategoryType[];
  readonly initialPagination: PaginationType.Pagination;
}) {
  const [subcategories, setSubcategories] = React.useState<AdminTypes.InventoryTypes.productSubCategoryTypes.SubCategoryType[]>(initialSubCategories);
  const [categories, setCategories] = React.useState<AdminTypes.InventoryTypes.ProductCategoryTypes.ServerCategoryType[]>(initialCategories);
  const [pagination, setPagination] = React.useState<PaginationType.Pagination>(initialPagination);
  const [loading, setLoading] = React.useState(false);
  const [showModal, setShowModal] = React.useState(false);
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [showDetailsModal, setShowDetailsModal] = React.useState(false);
  const [editingSubcategory, setEditingSubcategory] = React.useState<AdminTypes.InventoryTypes.productSubCategoryTypes.SubCategoryType | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = React.useState<AdminTypes.InventoryTypes.productSubCategoryTypes.SubCategoryType | null>(null);
  const [actionFilter, setActionFilter] = React.useState("All");
  const [activeStatusFilter, setActiveStatusFilter] = React.useState("All");
  const [selectedRows, setSelectedRows] = React.useState<AdminTypes.InventoryTypes.productSubCategoryTypes.SubCategoryType[]>([]);
  const [clearSelectedRows, setClearSelectedRows] = React.useState(false);
  const [downloadData, setDownloadData] = React.useState([])
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { searchTerm, setSearchTerm, statusFilter, setStatusFilter, selectedCategoryFilter, setSelectedCategoryFilter, filteredData } = customHooks.useListFilters<AdminTypes.InventoryTypes.productSubCategoryTypes.SubCategoryType>(
    subcategories,
  )
  const { checkPermission } = customHooks.useUserPermissions();
  // Sync state with props when URL params change (server re-fetches data)
  React.useEffect(() => {
    setSubcategories(initialSubCategories);
    setPagination(initialPagination);
  }, [initialSubCategories]);

  // Reset action filter when no rows are selected
  React.useEffect(() => {
    if (selectedRows.length === 0) {
      setActionFilter('All');
      setActiveStatusFilter('All');
    }
  }, [selectedRows]);

  // Category options for filter
  const categoryOptions = React.useMemo(() => {
    return [
      { name: 'All Categories', value: 'All' },
      ...categories.map(cat => ({
        name: cat.categoryName,
        value: cat._id
      }))
    ];
  }, [categories]);

  // CSV and PDF export columns
  const exportColumns = React.useMemo(() => {
    return WebComponents.WebCommonComponents.CommonComponents.generateExportColumns<AdminTypes.InventoryTypes.productSubCategoryTypes.SubCategoryType>([
      {
        key: 'subcategory',
        label: Constants.adminConstants.subcategoryStrings.subcategoryname,
        accessor: (row) => row.subcategory || '-',
        pdfWidth: 45
      },
      {
        key: 'categoryName',
        label: Constants.adminConstants.productcategory,
        accessor: (row) => row.category.categoryName || '-',
        pdfWidth: 25
      },
      {
        key: 'categorycode',
        label: 'Sub Category Code', // TODO: Add to admin constants
        accessor: (row) => row.categorycode || '-',
        pdfWidth: 20
      },
      {
        key: 'description',
        label: Constants.adminConstants.descriptionlabel,
        accessor: (row) => row.description || '-',
        pdfWidth: 40
      },
      {
        key: 'createdAt',
        label: Constants.adminConstants.createdOn,
        accessor: (row) => row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '-',
        pdfWidth: 25
      },
      {
        key: 'updatedAt',
        label: Constants.adminConstants.updatedOn,
        accessor: (row) => row.updatedAt ? new Date(row.updatedAt).toLocaleDateString() : '-',
        pdfWidth: 25
      },
      {
        key: 'status',
        label: Constants.adminConstants.statuslabel,
        accessor: (row) => row.status ? 'Active' : 'Inactive',
        pdfWidth: 20
      }
    ]);
  }, []);

  // Add
  const handleAdd = async (formData: {
    category: string;
    subcategory: string;
    categorycode: string;
    description?: string;
    subCategoryImage?: string | File;
    status: boolean
  }) => {
    await ServerActions.HandleFunction.handleAddCommon({
      formData,
      createAction: ServerActions.ServerActionslib.createProductSubCategoryAction,
      setLoading,
      setShowModal,
      router,
      successMessage: Constants.adminConstants.subcategoryStrings.createdSuccessfully,
      errorMessage: Constants.adminConstants.subcategoryStrings.addFailed || 'Failed to add subcategory.',
      onSuccess: (result) => {
        if (result?.data?.data) {
          setSubcategories(prev => [...prev, result.data.data]);
        }
      },
    });
  };
  // Edit
  const handleEdit = async (formData: {
    category: string;
    subcategory: string;
    categorycode: string;
    description?: string;
    subCategoryImage?: string | File;
    status: boolean
  }) => {
    await ServerActions.HandleFunction.handleEditCommon({
      formData,
      editingItem: editingSubcategory,
      getId: (item) => item._id,
      updateAction: (id: string | number, data: typeof formData) =>
        ServerActions.ServerActionslib.updateProductSubCategoryAction(id as string, data),
      setLoading,
      setShowEditModal,
      setEditingItem: setEditingSubcategory,
      router,
      successMessage: Constants.adminConstants.subcategoryStrings.updatedSuccessfully,
      errorMessage: Constants.adminConstants.subcategoryStrings.updateFailed,
      onSuccess: (result) => {
        if (result?.data?.data && editingSubcategory) {
          setSubcategories(prev => prev.map(subcategory =>
            subcategory._id === editingSubcategory._id ? result.data.data : subcategory
          ));
        }
      },
    });
  };

  // Delete
  const handleDelete = React.useCallback(async (id: string) => {
    await ServerActions.HandleFunction.handleDeleteCommon({
      id,
      deleteAction: (id: string | number) =>
        ServerActions.ServerActionslib.deleteProductSubCategoryAction(id as string),
      setLoading,
      router,
      successMessage: Constants.adminConstants.subcategoryStrings.deletedSuccessfully,
      errorMessage: Constants.adminConstants.subcategoryStrings.deleteFailed,
      onSuccess: () => {
        setSubcategories(prev => prev.filter(subcategory => subcategory._id !== id));
      },
    });
  }, [router]);

  const handleEditModal = React.useCallback((subcategory: AdminTypes.InventoryTypes.productSubCategoryTypes.SubCategoryType) => {
    setEditingSubcategory(subcategory);
    setShowEditModal(true);
  }, []);

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
      items: subcategories,
      setItems: setSubcategories,
      bulkDeleteAction: ServerActions.ServerActionslib.bulkDeleteSubCategoriesAction,
      bulkUpdateStatusAction: ServerActions.ServerActionslib.bulkUpdateSubCategoriesStatusAction,
      clearSelectedData,
      idSelector: (r) => r._id,
    });
  }, [selectedRows, actionFilter, activeStatusFilter, subcategories, clearSelectedData]);

  // View Details
  const handleViewDetails = React.useCallback((subcategory: AdminTypes.InventoryTypes.productSubCategoryTypes.SubCategoryType) => {
    setSelectedSubcategory(subcategory);
    setShowDetailsModal(true);
  }, []);

  const handleToggleStatus = React.useCallback(async (row: AdminTypes.InventoryTypes.productSubCategoryTypes.SubCategoryType, next: boolean) => {
    setSubcategories(prev => prev.map(subcategory => (subcategory._id === row._id ? { ...subcategory, status: next } : subcategory)));
    await ServerActions.HandleFunction.handleToggleStatusCommon({
      row,
      next,
      getId: (item) => item._id,
      preparePayload: (row) => ({
        category: (row.category as any)?._id || (row.category as any),
        subcategory: row.subcategory,
        categorycode: row.categorycode,
        description: row.description || "",
        subCategoryImage: row.subCategoryImage || "",
        status: next,
      }),
      updateAction: (id: string | number, data: any) =>
        ServerActions.ServerActionslib.updateProductSubCategoryAction(id as string, data),
      setLoading,
      router,
      successMessage: `Status updated to ${next ? 'Active' : 'Inactive'}.`,
      errorMessage: 'Failed to update status.',
      onError: () => {
        // Revert optimistic update on error
        setSubcategories(prev => prev.map(subcategory => (subcategory._id === row._id ? { ...subcategory, status: !next } : subcategory)));
      },
    });
  }, [router]);

  const handleToggleStatusById = React.useCallback(
    async (id: string, next: boolean) => {
      const row = subcategories.find(s => s._id === id);
      if (row) {
        await handleToggleStatus(row, next);
      }
    },
    [subcategories, handleToggleStatus]
  );
  // download pdf
  const downloadPdf = async (): Promise<any[]> => {
    return await ServerActions.HandleFunction.handleDownloadCommon({
      selectedRows,
      searchParams,
      bulkGetSelectedAction: ServerActions.ServerActionslib.bulkGetSelectedProductSubatgeoryAction,
      bulkGetAllAction: ServerActions.ServerActionslib.bulkGetProductSubcatgeoryAction,
      setDownloadData,
      idSelector: (item) => item._id,
    });
  };

  const bulkActionOptions = React.useMemo(() => {
    const options = Constants.commonConstants.actionOptions;
    return options.filter(option => {
      if (option.value === 'Status') {
        return checkPermission("inventory.subcategory", "update");
      }
      if (option.value === 'Delete') {
        return checkPermission("inventory.subcategory", "delete");
      }
      return true;
    });
  }, [checkPermission]);

  const tableColumns = React.useMemo(() => WebComponents.WebCommonComponents.CommonComponents.createColumns<AdminTypes.InventoryTypes.productSubCategoryTypes.SubCategoryType>({
    fields: [
      {
        name: "Image", // TODO: Add to admin constants if needed
        selector: (row: AdminTypes.InventoryTypes.productSubCategoryTypes.SubCategoryType) => row.subCategoryImage || 'No Image',
        cell: (row: AdminTypes.InventoryTypes.productSubCategoryTypes.SubCategoryType) => (
          <div className="p-2">
            <div className="w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
              {row.subCategoryImage ? (
                <Image
                  src={row.subCategoryImage}
                  alt={row.subcategory}
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                  <span className="text-gray-400 text-xs">No Image</span>
                </div>
              )}
            </div>
          </div>
        ),
        sortable: false,
        // width: "10%"
      },
      {
        name: Constants.adminConstants.subcategoryStrings.subcategoryname,
        selector: (row: AdminTypes.InventoryTypes.productSubCategoryTypes.SubCategoryType) => row.subcategory,
        sortable: true,
        width: "15%"
      },
      {
        name: Constants.adminConstants.productcategory,
        selector: (row: AdminTypes.InventoryTypes.productSubCategoryTypes.SubCategoryType) => row.category.categoryName,
        sortable: true,
        width: "15%"
      },
      {
        name: "Sub Category Code", // TODO: Add to admin constants if needed
        selector: (row: AdminTypes.InventoryTypes.productSubCategoryTypes.SubCategoryType) => row.categorycode,
        sortable: true,
        width: "12%"
      },
      {
        name: Constants.adminConstants.descriptionlabel,
        selector: (row: AdminTypes.InventoryTypes.productSubCategoryTypes.SubCategoryType) => row.description,
        sortable: true,
        width: "20%"
      },
      {
        name: Constants.adminConstants.createdOn,
        selector: (row: AdminTypes.InventoryTypes.productSubCategoryTypes.SubCategoryType) => {
          return row.createdAt ? new Date(row.createdAt).toLocaleDateString() : 'N/A';
        },
        sortable: true
      },
      {
        name: Constants.adminConstants.updatedOn,
        selector: (row: AdminTypes.InventoryTypes.productSubCategoryTypes.SubCategoryType) => {
          return row.updatedAt ? new Date(row.updatedAt).toLocaleDateString() : 'N/A';
        },
        sortable: true
      },

    ],
    status: {
      name: Constants.adminConstants.statuslabel,
      idSelector: (row) => row._id,
      valueSelector: (row) => !!row.status,
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
      ...(checkPermission("inventory.subcategory", "update") ? [{
        render: (row: any) => (
          <WebComponents.UiComponents.UiWebComponents.Button size="icon" variant="editaction" onClick={() => handleEditModal(row)}>
            <FaEdit className="w-4 h-4" />
          </WebComponents.UiComponents.UiWebComponents.Button>
        ),
      }] : []),
      ...(checkPermission("inventory.subcategory", "delete") ? [{
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
            {Constants.adminConstants.subcategoryStrings.title}
            {(() => {
              if (!showModal && !showEditModal) return "";
              const modalTitle = showModal ? Constants.adminConstants.subcategoryStrings.addModalTitle : Constants.adminConstants.subcategoryStrings.editModalTitle;
              return ` > ${modalTitle} `;
            })()}
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-textSmall pt-2">
            {Constants.adminConstants.subcategoryStrings.description}
          </p>
        </div>
        {(showModal || showEditModal || checkPermission("inventory.subcategory", "create")) && (
          <WebComponents.UiComponents.UiWebComponents.Button
            variant="addBackButton"
            onClick={() => {
              if (showModal || showEditModal) {
                setShowModal(false);
                setShowEditModal(false);
                setEditingSubcategory(null);
              } else {
                setShowModal(true);
              }
            }}
          >
            {showModal || showEditModal ? <><FaArrowLeft className="w-4 h-4" /> {Constants.adminConstants.back}</> : <><FaPlus className="w-4 h-4" /> {Constants.adminConstants.add}</>}
          </WebComponents.UiComponents.UiWebComponents.Button>
        )}
      </div>
      {/* Show filters and table only when modal is not open */}
      {!showModal && !showEditModal && (
        <div className="bg-white dark:bg-darkFilterbar rounded-[4px] h-full w-full mt-4 overflow-hidden">
          {/* Filters */}
          <WebComponents.WebCommonComponents.CommonComponents.CommonFilterBar
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
            categoryFilter={selectedCategoryFilter}
            onCategoryFilterChange={setSelectedCategoryFilter}
            categoryOptions={categoryOptions}
            statusFilter={statusFilter}
            onStatusFilterChange={(value: string) => {
              const validValue = value === "Active" || value === "Inactive" ? value : "All";
              setStatusFilter(validValue);
            }}
            // onStatusFilterChange={setStatusFilter}
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
                  filename={`subcategories - ${new Date().toISOString().split('T')[0]}.csv`}
                  onExport={async () => {
                    WebComponents.UiComponents.UiWebComponents.SwalHelper.success({ text: 'CSV exported successfully.' });
                    return filteredData;
                  }}
                >
                  <button
                    type="button"
                    className="rounded-[4px] bg-[#ffffff] dark:bg-[#3A3A3A] border border-[#D8D9D9] border-opacity-50 font-interTight font-normal hover:bg-[#e0e0e0] dark:hover:bg-[#4A4A4A] shadow-sm transition-colors duration-200 cursor-pointer flex-shrink-0 sm:px-1 md:px-2 lg:px-2 xl:px-2 2xl:px-2 px-2 py-[6.9px]"
                    aria-label="Download CSV"
                    title="Download CSV"
                    disabled={subcategories.length === 0}
                  >
                    <Image src={Constants.assetsIcon.assets.csv} alt="CSV" width={28} height={28} className="w-5 h-5 sm:w-6 sm:h-6 md:w-6 md:h-6 lg:w-7 lg:h-7 xl:w-7 xl:h-7 2xl:w-7 2xl:h-7" />
                  </button>
                </WebComponents.UiComponents.UiWebComponents.DownloadCSV>
                <WebComponents.UiComponents.UiWebComponents.DownloadPDF
                  data={downloadData}
                  columns={exportColumns.pdfColumns}
                  filename={`subcategories- ${new Date().toISOString().split('T')[0]}.pdf`}
                  title="Subcategories Report"
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
                    disabled={subcategories.length === 0}
                  >
                    <Image src={Constants.assetsIcon.assets.pdf} alt="PDF" width={28} height={28} className="w-5 h-5 sm:w-6 sm:h-6 md:w-6 md:h-6 lg:w-7 lg:h-7 xl:w-7 xl:h-7 2xl:w-7 2xl:h-7" />
                  </button>
                </WebComponents.UiComponents.UiWebComponents.DownloadPDF>
              </>
            }
          />

          {/* Table */}
          <div className="overflow-x-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-b-md">
            {loading ? (
              <div className="flex justify-center items-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-2 text-gray-600 dark:text-gray-300">Processing...</span>
              </div>
            ) : (
              <WebComponents.WebCommonComponents.CommonComponents.DataTable
                keyField="_id"
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
            )}
          </div>
        </div>
      )}
      {/* Show modal when open */}
      {(showModal || showEditModal) && (
        <WebComponents.UiComponents.UiWebComponents.AdminFormModal
          formId="subcategory-form"
          onClose={() => {
            setShowModal(false);
            setShowEditModal(false);
            setEditingSubcategory(null);
          }}
          loading={loading}
        >
          {editingSubcategory ? (
            <WebComponents.AdminComponents.AdminWebComponents.Forms.SubCategoryForm
              onSubmit={handleEdit}
              subcategory={editingSubcategory}
              categories={categories}
            />
          ) : (
            <WebComponents.AdminComponents.AdminWebComponents.Forms.SubCategoryForm
              onSubmit={handleAdd}
              categories={categories}
            />
          )}
        </WebComponents.UiComponents.UiWebComponents.AdminFormModal>
      )}
      {/* Details Modal */}
      {showDetailsModal && selectedSubcategory && (
        <WebComponents.AdminComponents.AdminWebComponents.Models.SubCategoryDetailsModal
          subcategory={selectedSubcategory}
          onClose={() => setShowDetailsModal(false)}
        />
      )}
    </>
  );
}

