"use client";
import React from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Pencil, Trash2, Eye, Plus, ArrowLeft } from "lucide-react";
import { ServerActions } from "@/lib";
import { Constants } from "@/constant";
import { customHooks } from "@/hooks";
import { WebComponents } from "@/components";
import { AdminTypes, PaginationType } from "@/types";
import CancellationDialog from "./CancellationDialog";

export default function StockTransfers({
  intialStockTransfers = [],
  stores: initialStores = [],
  categories: initialCategories = [],
  subcategories: initialSubcategories = [],
  products: initialProducts = [],
  initialPagination,
}: {
  readonly intialStockTransfers?: any[];
  readonly stores?: any[];
  readonly categories?: any[];
  readonly subcategories?: any[];
  readonly products?: any[]
  readonly initialPagination: PaginationType.Pagination;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [transfers, setTransfers] = React.useState<AdminTypes.StockTypes.Entities.StockTransfer[]>(intialStockTransfers as unknown as AdminTypes.StockTypes.Entities.StockTransfer[]);
  const [pagination, setPagination] = React.useState<PaginationType.Pagination>(initialPagination);
  const [showModal, setShowModal] = React.useState(false);
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [showDetailsModal, setShowDetailsModal] = React.useState(false);
  const [editing, setEditing] = React.useState<AdminTypes.StockTypes.Entities.StockTransfer | null>(null);
  const [selectedTransfer, setSelectedTransfer] = React.useState<AdminTypes.StockTypes.Entities.StockTransfer | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [selectedRows, setSelectedRows] = React.useState<AdminTypes.StockTypes.Entities.StockTransfer[]>([]);
  const [actionFilter, setActionFilter] = React.useState<string>("All");
  const [activeStatusFilter, setActiveStatusFilter] = React.useState<string>("All");
  const [clearSelectedRows, setClearSelectedRows] = React.useState(false);
  const [downloadData, setDownloadData] = React.useState([])
  const { searchTerm, setSearchTerm, storeFilter, setStoreFilter, allStatusFilter, setAllStatusFilter, filteredData } = customHooks.useListFilters<AdminTypes.StockTypes.Entities.StockTransfer>(
    transfers,
  )
  /* Permissions */
  const { checkPermission } = customHooks.useUserPermissions();

  const bulkActionOptions = React.useMemo(() => {
    return Constants.commonConstants.actionOptions.filter(option => {
      if (option.value === 'Status') {
        return checkPermission("stock.transfers", "update");
      }
      if (option.value === 'Delete') {
        return checkPermission("stock.transfers", "delete");
      }
      return true;
    });
  }, [checkPermission]);

  const [showCancellationDialog, setShowCancellationDialog] = React.useState(false);
  const [cancellingTransfer, setCancellingTransfer] = React.useState<AdminTypes.StockTypes.Entities.StockTransfer | null>(null);
  React.useEffect(() => {
    setTransfers(intialStockTransfers);
    setPagination(initialPagination);
  }, [intialStockTransfers]);

  // Map API response to StoreOption format
  const stores: AdminTypes.StockTypes.Options.StoreOption[] = React.useMemo(() => {
    if (!Array.isArray(initialStores)) {
      return [];
    }
    return initialStores.map((store: any) => ({
      id: store._id || store.id || '',
      name: store.name || '',
    })).filter((store: AdminTypes.StockTypes.Options.StoreOption) => store.id && store.name);
  }, [initialStores]);

  // Map API response to CategoryOption format
  const categories: AdminTypes.StockTypes.Options.CategoryOption[] = React.useMemo(() => {
    if (!Array.isArray(initialCategories)) {
      return [];
    }
    return initialCategories.map((category: any) => ({
      id: category._id || category.id || '',
      name: category.categoryName || category.name || '',
    })).filter((category: AdminTypes.StockTypes.Options.CategoryOption) => category.id && category.name);
  }, [initialCategories]);

  // Map API response to SubcategoryOption format
  const subcategories: AdminTypes.StockTypes.Options.SubcategoryOption[] = React.useMemo(() => {
    if (!Array.isArray(initialSubcategories)) {
      return [];
    }
    return initialSubcategories.map((subcategory: any) => ({
      id: subcategory._id || subcategory.id || '',
      name: subcategory.subcategory || subcategory.name || '',
      categoryId: subcategory.category?._id || subcategory.category?.id || subcategory.category || subcategory.categoryId || '',
    })).filter((subcategory: AdminTypes.StockTypes.Options.SubcategoryOption) => subcategory.id && subcategory.name && subcategory.categoryId);
  }, [initialSubcategories]);

  // Map API response to ProductOption format
  const products: AdminTypes.StockTypes.Options.ProductOption[] = React.useMemo(() => {
    if (!Array.isArray(initialProducts)) {
      return [];
    }
    return initialProducts.map((product: any) => {
      // Find category ID by matching categoryName
      const categoryId = categories.find(cat => cat.name === product.category?.categoryName)?.id || '';
      // Find subcategory ID by matching subcategory name
      const subcategoryId = subcategories.find(sub => sub.name === product.subCategory?.subcategory)?.id || '';
      // Extract variants from variantData
      const variants: string[] = [];
      if (product.hasVariation && Array.isArray(product.variantData) && product.variantData.length > 0) {
        product.variantData.forEach((variant: any) => {
          if (variant.variantTitle) {
            variants.push(variant.variantTitle);
          }
        });
      }

      const currentQty = product.stock?.totalStock ?? product.totalQuantity ?? 0;
      return {
        id: product._id || product.id || '',
        name: product.productName || product.name || '',
        sku: product.SKU || product.sku || '',
        currentQty: typeof currentQty === 'number' ? currentQty : 0,
        categoryId: categoryId,
        subcategoryId: subcategoryId || undefined,
        companyName: product.brand?.brand || product.companyName || '',
        variants: variants.length > 0 ? variants : undefined,
        variantData: product.hasVariation ? product.variantData : undefined,
      };
    }).filter((product: AdminTypes.StockTypes.Options.ProductOption) => product.id && product.name);
  }, [initialProducts, categories, subcategories]);

  // Reset action filter when no rows are selected
  React.useEffect(() => {
    if (selectedRows.length === 0) {
      setActionFilter('All');
      setActiveStatusFilter('All');
    }
  }, [selectedRows]);

  const activeStatusOptions = React.useMemo(() => [
    { name: 'Pending', value: 'pending' },
    { name: 'Approved', value: 'approved' },
    { name: 'Completed', value: 'completed' },
    // { name: 'Cancelled', value: 'cancelled' }
  ], []);

  const handleStatusChange = async (row: AdminTypes.StockTypes.Entities.StockTransfer, newStatus: string) => {
    let reason = '';
    // If cancelling, show popup to get reason
    if (newStatus.toLowerCase() === 'cancelled') {
      setCancellingTransfer(row);
      setShowCancellationDialog(true);
      return;
    }

    // For other status changes, proceed directly
    await processStatusChange(row, newStatus, '');
  };

  const processStatusChange = async (row: AdminTypes.StockTypes.Entities.StockTransfer, newStatus: string, reason: string) => {
    // Optimistic update
    setTransfers(prev => prev.map(t => t._id === row._id ? {
      ...t,
      status: newStatus as any,
      notes: reason || t.notes
    } : t));

    try {
      let result;
      // Call the appropriate action based on the new status
      switch (newStatus.toLowerCase()) {
        case 'pending':
          result = await ServerActions.ServerActionslib.pendingStockTransferAction(row._id);
          break;
        case 'approved':
          result = await ServerActions.ServerActionslib.approveStockTransferAction(row._id);
          break;
        case 'completed':
          result = await ServerActions.ServerActionslib.completeStockTransferAction(row._id);
          break;
        case 'cancelled':

          result = await ServerActions.ServerActionslib.cancelStockTransferAction(row._id, reason);
          break;
        default:
          result = await ServerActions.ServerActionslib.updateStockTransferStatusAction(row._id, newStatus);
      }

      if (result && result.success) {
        WebComponents.UiComponents.UiWebComponents.SwalHelper.success({ text: `Status updated to ${newStatus}` });

        // Refresh server-side data
        router.refresh();

        // Update local state with returned data if available
        if (result.data) {
          // Handle potential nested data structure
          const updatedItem = result.data.data || result.data;
          setTransfers(prev => prev.map(t => t._id === row._id ? { ...t, ...updatedItem } : t));
        }
      } else {
        throw new Error(result?.error || 'Failed to update status');
      }
    } catch (error) {
      // Revert on error
      setTransfers(prev => prev.map(t => t._id === row._id ? { ...t, status: row.status, notes: row.notes } : t));
      const errorMessage = error instanceof Error ? error.message : 'Failed to update status.';
      WebComponents.UiComponents.UiWebComponents.SwalHelper.error({ text: errorMessage });
    }
  };

  const handleCancellationConfirm = async (reason: string) => {
    if (cancellingTransfer) {
      await processStatusChange(cancellingTransfer, 'cancelled', reason);
      setShowCancellationDialog(false);
      setCancellingTransfer(null);
    }
  };

  const handleCancellationClose = () => {
    setShowCancellationDialog(false);
    setCancellingTransfer(null);
  };

  // Add
  const handleAdd = async (formData: AdminTypes.StockTypes.Forms.TransferFormData) => {
    await ServerActions.HandleFunction.handleAddCommon({
      formData: {
        ...formData,
        status: "pending"
      },
      createAction: ServerActions.ServerActionslib.createStockTransferAction,
      setLoading,
      setShowModal,
      router,
      successMessage: Constants.adminConstants.createStockTransfer,
      errorMessage: "Failed to create transfer.",
      onSuccess: (result) => {
        if (result?.data?.data) {
          setTransfers(prev => [result.data.data, ...prev]);
        }
      },
    });
  };

  // Edit
  const handleEdit = async (formData: AdminTypes.StockTypes.Forms.TransferFormData) => {
    await ServerActions.HandleFunction.handleEditCommon({
      formData: {
        ...formData,
        status: "pending"
      },
      editingItem: editing,
      getId: (item) => item._id,
      updateAction: (id: string | number, data) => ServerActions.ServerActionslib.updateStockTransferAction(String(id), data),
      setLoading,
      setShowEditModal,
      setEditingItem: setEditing,
      router,
      successMessage: Constants.adminConstants.updateStockTransfer,
      errorMessage: "Failed to update transfer.",
      onSuccess: (result) => {
        if (result?.data?.data && editing) {
          setTransfers(prev => prev.map(t => t._id === editing._id ? result.data.data : t));
        }
      },
    });
  };

  const handleEditClick = (row: AdminTypes.StockTypes.Entities.StockTransfer) => {
    setEditing(row);
    setShowEditModal(true);
  };

  const handleViewDetails = (row: AdminTypes.StockTypes.Entities.StockTransfer) => {
    setSelectedTransfer(row);
    setShowDetailsModal(true);
  };

  const handleDelete = async (id: string) => {
    await ServerActions.HandleFunction.handleDeleteCommon({
      id,
      deleteAction: (id: string | number) =>
        ServerActions.ServerActionslib.deleteStockTransferAction(id as string),
      setLoading,
      router,
      successMessage: "Transfer deleted successfully",
      errorMessage: "Failed to delete transfer",
      onSuccess: () => {
        setTransfers((prev) => prev.filter((t) => t._id !== id));
      },
    });
  };
  // clear selected data
  const clearSelectedData = () => {
    setClearSelectedRows(prev => !prev);
    setSelectedRows([]);
    router.refresh();
  }

  const tableColumns = React.useMemo(() => WebComponents.WebCommonComponents.CommonComponents.createColumns<AdminTypes.StockTypes.Entities.StockTransfer>({
    fields: [
      {
        name: "From Store",
        selector: (row) => row.fromStoreId?.name,
        sortable: true,
        // width: "10%",
        cell: (row) => (
          <span className="font-medium text-gray-900 dark:text-white truncate" title={row.fromStoreId?.name}>{row.fromStoreId?.name}</span>
        )
      },
      {
        name: "To Store",
        selector: (row) => row.toStoreId?.name,
        sortable: true,
        // width: "10%",
        cell: (row) => (
          <span className="font-medium text-gray-900 dark:text-white truncate" title={row.toStoreId?.name}>{row.toStoreId?.name}</span>
        )
      },
      {
        name: "Product",
        selector: (row) => row.productId?.productName,
        sortable: true,
        // width: "12%",
        cell: (row) => (
          <div className="w-full">
            <div className="font-medium text-gray-900 dark:text-white truncate" title={row.productId?.productName}>{row.productId?.productName}</div>
          </div>
        )
      },
      {
        name: "SKU",
        selector: (row) => row.SKU || "-",
        sortable: true,
        // width: "14%",
        cell: (row) => (
          <div className="text-center">
            {row.SKU ? (
              <span className="text-sm font-mono text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded truncate max-w-full block" title={row.SKU}>
                {row.SKU}
              </span>
            ) : (
              <span className="text-sm font-mono text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">-</span>
            )}
          </div>
        )
      },
      {
        name: "Quantity",
        selector: (row) => row.quantity,
        sortable: true,
        // width: "9%",
        cell: (row) => (
          <div className="text-center">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              {row.quantity}
            </span>
          </div>
        )
      },
      {
        name: "Reason",
        selector: (row) => row.reason || "-",
        // width: "18%",
        cell: (row) => (
          <div className="w-full">
            {row.reason ? (
              <span className="text-sm text-gray-600 dark:text-gray-300 truncate block w-full" title={row.reason}>
                {row.reason}
              </span>
            ) : (
              <span className="text-gray-400 dark:text-gray-500">-</span>
            )}
          </div>
        )
      },
      {
        name: "Status",
        selector: (row) => row.status,
        sortable: true,
        // width: "11%",
        cell: (row) => (
          <div className="flex justify-center w-full">
            <WebComponents.AdminComponents.AdminWebComponents.AdminStockWebComponents.StatusSelect
              currentStatus={row.status}
              onStatusChange={(newStatus) =>
                handleStatusChange(row, newStatus)}
              isDisabled={!checkPermission("stock.transfers", "update")}
            />
          </div>
        )
      },
      {
        name: "Cancelled Reason",
        selector: (row) => row.notes || "-",
        // width: "10%",
        cell: (row) => (
          <div className="w-full">
            {row.notes ? (
              <span className="text-sm text-gray-600 dark:text-gray-300 truncate block w-full" title={row.notes}>
                {row.notes}
              </span>
            ) : (
              <span className="text-gray-400 dark:text-gray-500">-</span>
            )}
          </div>
        )
      },
    ],
    actions: [
      {
        render: (row) => (
          <WebComponents.UiComponents.UiWebComponents.Button size="icon" variant="viewaction" onClick={() => handleViewDetails(row)}>
            <Eye className="w-4 h-4" />
          </WebComponents.UiComponents.UiWebComponents.Button>
        ),
      },
      {
        render: (row) => (
          (checkPermission("stock.transfers", "update")) && row.status == "pending" && (
            <WebComponents.UiComponents.UiWebComponents.Button size="icon" variant="editaction" onClick={() => handleEditClick(row)}>
              <Pencil className="w-4 h-4" />
            </WebComponents.UiComponents.UiWebComponents.Button>
          )
        ),
      },
      {
        render: (row) => (
          (checkPermission("stock.transfers", "delete")) && (row.status == "cancelled" || row.status == "pending") && (
            <WebComponents.UiComponents.UiWebComponents.Button size="icon" variant="deleteaction" onClick={() => handleDelete(row._id)}>
              <Trash2 className="w-4 h-4" />
            </WebComponents.UiComponents.UiWebComponents.Button>
          )
        ),
      },
    ],
  }), [handleEditClick, handleViewDetails, handleDelete, handleStatusChange, checkPermission]);

  // Bulk apply handler (status update / delete)
  const handleBulkApply = React.useCallback(async () => {
    await ServerActions.HandleFunction.handleBulkApplyCommon({
      selectedRows,
      actionFilter,
      activeStatusFilter,
      items: transfers,
      setItems: setTransfers,
      bulkDeleteAction: ServerActions.ServerActionslib.bulkDeleteStockTransferAction,
      bulkUpdateStatusAction: ServerActions.ServerActionslib.bulkUpdateStockTransferStatusAction,
      clearSelectedData,
      idSelector: (r) => r._id,
    });
  }, [selectedRows, actionFilter, activeStatusFilter, transfers, clearSelectedData]);

  // CSV and PDF export columns
  const exportColumns = React.useMemo(() => {
    return WebComponents.WebCommonComponents.CommonComponents.generateExportColumns<AdminTypes.StockTypes.Entities.StockTransfer>([
      { key: 'fromStoreId', label: 'From Store', accessor: (row) => row.fromStoreId?.name || '-', pdfWidth: 30 },
      { key: 'toStoreId', label: 'To Store', accessor: (row) => row.toStoreId?.name || '-', pdfWidth: 30 },
      { key: 'productId', label: 'Product', accessor: (row) => row.productId?.productName || '-', pdfWidth: 40 },
      { key: 'SKU', label: 'SKU', accessor: (row) => row.SKU || '-', pdfWidth: 45 },
      { key: 'quantity', label: 'Quantity', accessor: (row) => row.quantity, pdfWidth: 20 },
      { key: 'reason', label: 'Reason', accessor: (row) => row.reason || '-', pdfWidth: 40 },
      { key: 'status', label: 'Status', accessor: (row) => row.status, pdfWidth: 30 },
      { key: 'notes', label: 'Cancelled Reason', accessor: (row) => row.notes || '-', pdfWidth: 40 },
    ]);
  }, []);

  // handle download 
  const downloadPdf = async (): Promise<any[]> => {
    return await ServerActions.HandleFunction.handleDownloadCommon({
      selectedRows,
      searchParams,
      bulkGetSelectedAction: ServerActions.ServerActionslib.bulkGetSelectedStockTransferAction,
      bulkGetAllAction: ServerActions.ServerActionslib.bulkGetStockTransferAction,
      setDownloadData,
      idSelector: (item) => item._id,
    });
  };

  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-lg sm:text-lg md:text-xl lg:text-2xl font-medium text-textMain dark:text-white truncate">
            Stock Transfers
            {(() => {
              if (!showModal && !showEditModal) return "";
              const modalTitle = showModal ? "Add Transfer" : "Edit Transfer";
              return ` > ${modalTitle}`;
            })()}
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-textSmall pt-2">
            {showModal || showEditModal ? "Add new stock transfer." : "Move inventory from one store to another with reason trail"}
          </p>
        </div>
        {(checkPermission("stock.transfers", "create")) && (
          <WebComponents.UiComponents.UiWebComponents.Button
            variant="addBackButton"
            onClick={() => {
              if (showModal || showEditModal) {
                setShowModal(false);
                setShowEditModal(false);
                setEditing(null);
              } else {
                setEditing(null);
                setShowModal(true);
              }
            }}
          >
            {showModal || showEditModal ? <><ArrowLeft className="w-4 h-4" /> Back</> : <><Plus className="w-4 h-4" /> Add</>}
          </WebComponents.UiComponents.UiWebComponents.Button>
        )}
      </div>
      {/* Show filters and table only when modal is not open */}
      {!showModal && !showEditModal && (
        <div className="bg-white dark:bg-darkFilterbar rounded-[4px] h-full w-full mt-4 overflow-hidden">
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
            activeStatusOptions={activeStatusOptions}
            selectedCount={selectedRows.length}
            onApply={handleBulkApply}
            categoryFilter={storeFilter}
            onCategoryFilterChange={setStoreFilter}
            categoryOptions={[
              { name: 'All Stores', value: 'All' },
              ...stores.map(store => ({ name: store.name, value: store.id }))
            ]}
            statusFilter={allStatusFilter}
            // onStatusFilterChange={setStatusFilter}
            onStatusFilterChange={(value: string) => {
              setAllStatusFilter(value || "All")
              // const validValue = value ? value : "All";
              // setStatusFilter(validValue);
              // setAllTypeStatusFiilter(validValue)
            }}
            statusOptions={[
              { label: 'All Status', value: 'All' },
              { label: 'Pending', value: 'Pending' },
              { label: 'Approved', value: 'Approved' },
              { label: 'Completed', value: 'Completed' },
              { label: 'Cancelled', value: 'Cancelled' },
            ]}
            searchTerm={searchTerm}
            onSearchTermChange={setSearchTerm}
            categoryPlaceholder="All Stores"
            renderExports={
              <>
                <WebComponents.UiComponents.UiWebComponents.DownloadCSV
                  data={downloadData}
                  columns={exportColumns.csvColumns}
                  filename={`stock-transfers-${new Date().toISOString().split('T')[0]}.csv`}
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
                    disabled={transfers.length === 0}
                  >
                    <Image src={Constants.assetsIcon.assets.csv} alt="CSV" width={28} height={28} className="w-5 h-5 sm:w-6 sm:h-6 md:w-6 md:h-6 lg:w-7 lg:h-7 xl:w-7 xl:h-7 2xl:w-7 2xl:h-7" />
                  </button>
                </WebComponents.UiComponents.UiWebComponents.DownloadCSV>
                <WebComponents.UiComponents.UiWebComponents.DownloadPDF
                  data={downloadData}
                  columns={exportColumns.pdfColumns}
                  filename={`stock-transfers-${new Date().toISOString().split('T')[0]}.pdf`}
                  title="Stock Transfers Report"
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
                    disabled={transfers.length === 0}
                  >
                    <Image src={Constants.assetsIcon.assets.pdf} alt="PDF" width={28} height={28} className="w-5 h-5 sm:w-6 sm:h-6 md:w-6 md:h-6 lg:w-7 lg:h-7 xl:w-7 xl:h-7 2xl:w-7 2xl:h-7" />
                  </button>
                </WebComponents.UiComponents.UiWebComponents.DownloadPDF>
              </>
            }
            showActionSection={true}
            showCategoryFilter={true}
          />

          <div>
            {loading ? (
              <div className="flex justify-center items-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-2 text-gray-600 dark:text-gray-300">Loading stock transfers...</span>
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
        <WebComponents.AdminComponents.AdminWebComponents.Forms.StockTransferForm
          title={showModal ? "Add Transfer Stock" : "Edit Transfer Stock"}
          stores={stores}
          products={products}
          categories={categories}
          subcategories={subcategories}
          defaultValues={editing ? {
            fromStoreId: editing.fromStoreId?._id,
            toStoreId: editing.toStoreId?._id,
            categoryId: editing.categoryId?._id || "",
            subCategoryId: editing.subCategoryId?._id || "",
            productId: editing.productId?._id,
            variant: editing.productId?.variantData?.find((v: any) => v.SKU === editing.SKU)?.variantValues?.[0]?.value || "",
            SKU: editing.SKU || "",
            quantity: editing.quantity,
            reason: editing.reason,
            status: editing.status,
          } : undefined}
          onClose={() => {
            setShowModal(false);
            setShowEditModal(false);
            setEditing(null);
          }}
          // onSubmit={editing?handleEdit:handleAdd}
          onSubmit={async (data) => {
            if (editing) {
              await handleEdit(data);
            } else {
              await handleAdd(data);
            }
          }}
        />
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedTransfer && (
        <WebComponents.AdminComponents.AdminWebComponents.Models.StockTransferDetailsModal
          transfer={selectedTransfer}
          onClose={() => setShowDetailsModal(false)}
        />
      )}

      {/* Cancellation Dialog */}
      <CancellationDialog
        isOpen={showCancellationDialog}
        onClose={handleCancellationClose}
        onConfirm={handleCancellationConfirm}
        title="Transfer Cancellation Reason"
        confirmButtonText="Cancel Transfer"
      />
    </>
  );
}


