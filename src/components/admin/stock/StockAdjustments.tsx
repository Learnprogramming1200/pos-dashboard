"use client";
import React from "react";
import Image from "next/image";
import { Plus, TrendingUp, TrendingDown, Minus, ArrowLeft } from "lucide-react";
import { FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ServerActions } from "@/lib";
import { Constants } from "@/constant";
import { customHooks } from "@/hooks";
import { WebComponents } from "@/components";
import { AdminTypes, PaginationType } from "@/types";
import CancellationDialog from "./CancellationDialog";

export default function StockAdjustments({
  initialStockAdjustments,
  initialStores,
  initialCategories,
  initialSubcategories,
  initialProducts,
  initialPagination,
}: {
  readonly initialStockAdjustments: any[];
  readonly initialStores: any[];
  readonly initialCategories: any[];
  readonly initialSubcategories: any[];
  readonly initialProducts: any[];
  readonly initialPagination: PaginationType.Pagination;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [adjustments, setAdjustments] = React.useState<AdminTypes.StockTypes.Entities.StockAdjustment[]>(() => initialStockAdjustments)
  const [showModal, setShowModal] = React.useState(false);
  const [pagination, setPagination] = React.useState<PaginationType.Pagination>(initialPagination);
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [showDetailsModal, setShowDetailsModal] = React.useState(false);
  const [editing, setEditing] = React.useState<AdminTypes.StockTypes.Entities.StockAdjustment | null>(null);
  const [selectedAdjustment, setSelectedAdjustment] = React.useState<AdminTypes.StockTypes.Entities.StockAdjustment | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [selectedRows, setSelectedRows] = React.useState<AdminTypes.StockTypes.Entities.StockAdjustment[]>([]);
  const [actionFilter, setActionFilter] = React.useState<string>("All");
  const [activeStatusFilter, setActiveStatusFilter] = React.useState<string>("All");
  const [clearSelectedRows, setClearSelectedRows] = React.useState(false);
  const [downloadData, setDownloadData] = React.useState([])
  const { searchTerm, setSearchTerm, storeFilter, setStoreFilter, allStatusFilter, setAllStatusFilter, filteredData } = customHooks.useListFilters<AdminTypes.StockTypes.Entities.StockAdjustment>(
    adjustments,
  )

  /* Permissions */
  const { checkPermission } = customHooks.useUserPermissions();

  const bulkActionOptions = React.useMemo(() => {
    return Constants.commonConstants.actionOptions.filter(option => {
      if (option.value === 'Status') {
        return checkPermission("stock.adjustments", "update");
      }
      if (option.value === 'Delete') {
        return checkPermission("stock.adjustments", "delete");
      }
      return true;
    });
  }, [checkPermission]);

  const [showCancellationDialog, setShowCancellationDialog] = React.useState(false);
  const [cancellingAdjustment, setCancellingAdjustment] = React.useState<AdminTypes.StockTypes.Entities.StockAdjustment | null>(null);
  // Update local adjustments when server data prop changes
  React.useEffect(() => {
    setAdjustments(initialStockAdjustments)
    setPagination(initialPagination);
  }, [initialStockAdjustments]);

  // Map API response to StoreOption format
  const stores: AdminTypes.StockTypes.Options.StoreOption[] = React.useMemo(() => {
    if (!Array.isArray(initialStores)) {
      return [];
    }
    return initialStores.map((store: any) => ({
      id: store._id || store.id || '',
      name: store.name || '',
    })).filter((s: AdminTypes.StockTypes.Options.StoreOption) => s.id && s.name);
  }, [initialStores]);

  // Map API response to CategoryOption format
  const categories: AdminTypes.StockTypes.Options.CategoryOption[] = React.useMemo(() => {
    if (!Array.isArray(initialCategories)) {
      return [];
    }
    return initialCategories.map((category: any) => ({
      id: category._id || category.id || '',
      name: category.categoryName || category.name || '',
    })).filter((c: AdminTypes.StockTypes.Options.CategoryOption) => c.id && c.name);
  }, [initialCategories]);

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

  // Map API response to SubcategoryOption format
  const subcategories: AdminTypes.StockTypes.Options.SubcategoryOption[] = React.useMemo(() => {
    if (!Array.isArray(initialSubcategories)) {
      return [];
    }
    return initialSubcategories.map((subcategory: any) => {
      // Extract category ID - can be nested object or direct ID
      let categoryId = '';
      if (typeof subcategory.category === 'object' && subcategory.category !== null) {
        categoryId = subcategory.category._id || subcategory.category.id || '';
      } else {
        categoryId = subcategory.category || subcategory.categoryId || '';
      }
      return {
        id: subcategory._id || subcategory.id || '',
        name: subcategory.subcategory || subcategory.name || '',
        categoryId: categoryId,
      };
    }).filter((subcategory: AdminTypes.StockTypes.Options.SubcategoryOption) => subcategory.id && subcategory.name && subcategory.categoryId);
  }, [initialSubcategories]);

  // Map API response to ProductOption format
  const mappedProducts: AdminTypes.StockTypes.Options.ProductOption[] = React.useMemo(() => {
    if (!Array.isArray(initialProducts)) {
      return [];
    }
    return initialProducts.map((product: any) => {
      const categoryId = categories.find(cat => cat.name === product.category?.categoryName)?.id || '';
      const subcategoryId = subcategories.find(sub => sub.name === product.subCategory?.subcategory)?.id || '';
      // Extract variants from variantData
      const variants: string[] = [];
      if (product.hasVariation && Array.isArray(product.variantData) && product.variantData.length > 0) {
        product.variantData.forEach((variant: any) => {
          const title = variant.variantTitle || variant.variantValues?.[0]?.value;
          if (title) {
            variants.push(title);
          }
        });
      }

      // Get current quantity from stock.totalStock or totalQuantity
      const currentQty = product.stock?.totalStock ?? product.totalQuantity ?? 0;
      return {
        id: product._id || product.id || '',
        name: product.productName || product.name || '',
        sku: product.SKU || '',
        currentQty: typeof currentQty === 'number' ? currentQty : 0,
        categoryId: categoryId,
        subcategoryId: subcategoryId || undefined,
        companyName: product.brand?.brand || product.companyName || '',
        variants: variants.length > 0 ? variants : undefined,
        variantData: product.hasVariation ? product.variantData : undefined,
        rawData: product,
      };
    }).filter((product: AdminTypes.StockTypes.Options.ProductOption) => product.id && product.name);
  }, [initialProducts, categories, subcategories]);



  const handleEditClick = (row: AdminTypes.StockTypes.Entities.StockAdjustment) => {
    setEditing(row);
    setShowEditModal(true);
  };

  const handleViewDetails = (row: AdminTypes.StockTypes.Entities.StockAdjustment) => {
    setSelectedAdjustment(row);
    setShowDetailsModal(true);
  };

  const handleDelete = async (id: string) => {
    await ServerActions.HandleFunction.handleDeleteCommon({
      id,
      deleteAction: (id: string | number) =>
        ServerActions.ServerActionslib.deleteStockAdjustmentAction(id as string),
      setLoading,
      router,
      successMessage: "Adjustment deleted successfully",
      errorMessage: "Failed to delete adjustment",
      onSuccess: () => {
        setAdjustments((prev) => prev.filter((a) => a._id !== id));
      },
    });
  };
  const handleStatusChange = async (row: AdminTypes.StockTypes.Entities.StockAdjustment, newStatus: string) => {
    let cancelReason = '';
    // If cancelling, show popup to get reason
    if (newStatus.toLowerCase() === 'cancelled') {
      setCancellingAdjustment(row);
      setShowCancellationDialog(true);
      return;
    }

    // For other status changes, proceed directly
    await processStatusChange(row, newStatus, '');
  };

  const processStatusChange = async (row: AdminTypes.StockTypes.Entities.StockAdjustment, newStatus: string, cancelReason: string) => {
    // Optimistic update
    setAdjustments(prev => prev.map(t => t._id === row._id ? {
      ...t,
      status: newStatus as any,
      reason: cancelReason || t.reason
    } : t));

    try {
      let result;
      // Call the appropriate action based on the new status
      switch (newStatus.toLowerCase()) {
        case 'pending':
          result = await ServerActions.ServerActionslib.pendingStockAdjustmentAction(row._id);
          break;
        case 'approved':
          result = await ServerActions.ServerActionslib.approveStockAdjustmentAction(row._id);
          break;
        case 'completed':
          result = await ServerActions.ServerActionslib.completeStockAdjustmentAction(row._id);
          break;
        case 'cancelled':
          // Use reject action for cancelled if no specific cancel action exists
          result = await ServerActions.ServerActionslib.cancelStockAdjustmentAction(row._id, cancelReason)
          break;
        default:
          result = { success: false, error: 'Status update not supported' };
      }
      if (result && result.success) {
        WebComponents.UiComponents.UiWebComponents.SwalHelper.success({ text: `Status updated to ${newStatus}` });
        // Refresh server-side data
        router.refresh();
        // Update local state with returned data if available
        if ('data' in result && result.data) {
          const updatedItem = (result.data as any).data || result.data;
          setAdjustments(prev => prev.map(t => t._id === row._id ? { ...t, ...updatedItem } : t));
        }
      } else {
        throw new Error(result?.error || 'Failed to update status');
      }
    } catch (error) {
      // Revert on error
      setAdjustments(prev => prev.map(t => t._id === row._id ? { ...t, status: row.status, reason: row.reason } : t));
      const errorMessage = error instanceof Error ? error.message : 'Failed to update status.';
      WebComponents.UiComponents.UiWebComponents.SwalHelper.error({ text: errorMessage });
    }
  };

  const handleCancellationConfirm = async (reason: string) => {
    if (cancellingAdjustment) {
      await processStatusChange(cancellingAdjustment, 'cancelled', reason);
      setShowCancellationDialog(false);
      setCancellingAdjustment(null);
    }
  };

  const handleCancellationClose = () => {
    setShowCancellationDialog(false);
    setCancellingAdjustment(null);
  };

  // Add
  const handleAdd = async (formData: AdminTypes.StockTypes.Forms.AdjustmentFormData) => {
    const { currentQty, ...data } = formData;
    const product = mappedProducts.find(p => p.id === data.productId);
    // Determine SKU and Previous Stock
    let skuToSend = product?.sku;
    let prevQty = currentQty ?? product?.currentQty ?? 0;
    let storeStockFound = false;
    if (data.variant && product?.variantData) {
      const selectedVariant = product.variantData.find((v: any) => v.variantTitle === data.variant);
      if (selectedVariant) {
        skuToSend = selectedVariant.SKU || selectedVariant.sku || skuToSend;
        // Try to find variant's store-specific stock
        if (product.rawData?.variantData) {
          const rawVariant = product.rawData.variantData.find((v: any) => v.variantTitle === data.variant);
          if (rawVariant?.stock) {
            let stockEntries: any[] = [];
            if (Array.isArray(rawVariant.stock)) {
              stockEntries = rawVariant.stock;
            } else if (rawVariant.stock && Array.isArray(rawVariant.stock.storeStock)) {
              stockEntries = rawVariant.stock.storeStock;
            }

            const stockEntry = stockEntries.find((s: any) => {
              const sStoreId = s.storeId?._id || s.storeId || s.store?._id || s.store;
              return sStoreId === data.storeId;
            });

            if (stockEntry) {
              prevQty = stockEntry.quantity;
              storeStockFound = true;
            }
          }
        }
      }
    }
    // If no variant or variant lookup failed, try to find store-specific stock from product.stock structure
    if (!storeStockFound && currentQty === undefined && product?.rawData?.stock && Array.isArray(product.rawData.stock.storeWise)) {
      const storeStock = product.rawData.stock.storeWise.find((s: any) =>
        (typeof s.store === 'string' ? s.store === data.storeId : s.store?._id === data.storeId)
      );
      if (storeStock) {
        prevQty = storeStock.quantity || 0;
      }
    }
    const diff = data.actualStock - prevQty;
    const adjType: "increase" | "decrease" | "no change" = diff > 0 ? "increase" : diff < 0 ? "decrease" : "no change";
    // Reason required when there is a change
    if (diff !== 0 && !data.reason) {
      WebComponents.UiComponents.UiWebComponents.SwalHelper.warning({ title: "Reason required", text: "Please provide a reason for the adjustment." });
      return;
    }
    await ServerActions.HandleFunction.handleAddCommon({
      formData: {
        ...data,
        SKU: skuToSend,
        previousStock: prevQty,
        difference: diff,
        adjustmentType: adjType,
        status: "pending"
      },
      createAction: ServerActions.ServerActionslib.createStockAdjustmentAction,
      setLoading,
      setShowModal,
      router,
      successMessage: "Adjustment created successfully",
      errorMessage: "Failed to create adjustment.",
      onSuccess: (result) => {
        if (result?.data?.data) {
          const newItem = {
            ...result.data.data,
            storeId: { _id: data.storeId, name: stores.find(s => s.id === data.storeId)?.name || "" },
            productId: product?.rawData,
            categoryId: categories.find(c => c.id === data.categoryId) ? { _id: data.categoryId, categoryName: categories.find(c => c.id === data.categoryId)!.name } : undefined,
            subCategoryId: subcategories.find(s => s.id === data.subcategoryId) ? { _id: data.subcategoryId!, subcategory: subcategories.find(s => s.id === data.subcategoryId)!.name } : undefined,
          };
          setAdjustments(prev => [newItem, ...prev]);
        }
      },
    });
  };

  // Edit
  const handleEdit = async (formData: AdminTypes.StockTypes.Forms.AdjustmentFormData) => {
    if (!editing) return;
    const { currentQty, ...data } = formData;
    const product = mappedProducts.find(p => p.id === data.productId);

    // Determine SKU and Previous Stock (re-calculate in case product/variant/store changed)
    let skuToSend = product?.sku;
    let prevQty = currentQty ?? product?.currentQty ?? 0;
    let storeStockFound = false;

    if (data.variant && product?.variantData) {
      const selectedVariant = product.variantData.find((v: any) => (v.variantTitle || v.variantValues?.[0]?.value) === data.variant);
      if (selectedVariant) {
        skuToSend = selectedVariant.SKU || selectedVariant.sku || skuToSend;

        // Try to find variant's store-specific stock
        if (product.rawData?.variantData) {
          const rawVariant = product.rawData.variantData.find((v: any) => (v.variantTitle || v.variantValues?.[0]?.value) === data.variant);

          if (rawVariant?.stock) {
            let stockEntries: any[] = [];
            if (Array.isArray(rawVariant.stock)) {
              stockEntries = rawVariant.stock;
            } else if (rawVariant.stock && Array.isArray(rawVariant.stock.storeStock)) {
              stockEntries = rawVariant.stock.storeStock;
            }

            const stockEntry = stockEntries.find((s: any) => {
              const sStoreId = s.storeId?._id || s.storeId || s.store?._id || s.store;
              return sStoreId === data.storeId;
            });

            if (stockEntry) {
              prevQty = stockEntry.quantity;
              storeStockFound = true;
            }
          }
        }
      }
    }

    // If no variant or variant lookup failed, try to find store-specific stock from product.stock structure
    if (!storeStockFound && currentQty === undefined && product?.rawData?.stock && Array.isArray(product.rawData.stock.storeWise)) {
      const storeStock = product.rawData.stock.storeWise.find((s: any) =>
        (typeof s.store === 'string' ? s.store === data.storeId : s.store?._id === data.storeId)
      );
      if (storeStock) {
        prevQty = storeStock.quantity || 0;
      }
    }

    const diff = data.actualStock - prevQty;
    const adjType: "increase" | "decrease" | "no change" = diff > 0 ? "increase" : diff < 0 ? "decrease" : "no change";
    // Reason required when there is a change
    if (diff !== 0 && !data.reason) {
      WebComponents.UiComponents.UiWebComponents.SwalHelper.warning({ title: "Reason required", text: "Please provide a reason for the adjustment." });
      return;
    }

    await ServerActions.HandleFunction.handleEditCommon({
      formData: {
        ...data,
        SKU: skuToSend,
        previousStock: prevQty,
        difference: diff,
        adjustmentType: adjType,
      },
      editingItem: editing,
      getId: (item) => item._id,
      updateAction: (id, payload) => ServerActions.ServerActionslib.updateStockAdjustmentAction(String(id), payload),
      setLoading,
      setShowEditModal,
      setEditingItem: setEditing,
      router,
      successMessage: "Adjustment updated successfully",
      errorMessage: "Failed to update adjustment.",
      onSuccess: (result) => {
        if (result?.data?.data && editing) {
          const updatedItem = {
            ...result.data.data,
            productId: product?.rawData || editing.productId,
            storeId: stores.find(s => s.id === data.storeId) ? { _id: data.storeId, name: stores.find(s => s.id === data.storeId)!.name } : editing.storeId,
            categoryId: categories.find(c => c.id === data.categoryId) ? { _id: data.categoryId, categoryName: categories.find(c => c.id === data.categoryId)!.name } : editing.categoryId,
            subCategoryId: subcategories.find(s => s.id === data.subcategoryId) ? { _id: data.subcategoryId!, subcategory: subcategories.find(s => s.id === data.subcategoryId)!.name } : editing.subCategoryId,
          };
          setAdjustments(prev => prev.map(a => a._id === editing._id ? updatedItem : a));
        }
      },
    });
  };

  const tableColumns = React.useMemo(() => WebComponents.WebCommonComponents.CommonComponents.createColumns<AdminTypes.StockTypes.Entities.StockAdjustment>({
    fields: [
      {
        name: "Store",
        selector: (row) => row.storeId?.name || "-",
        sortable: true,
        // width: "10%",
        cell: (row) => (
          <span className="font-medium text-gray-900 dark:text-white">{row.storeId?.name || "-"}</span>
        )
      },
      {
        name: "Product",
        selector: (row) => row.productId?.productName || "-",
        sortable: true,
        // width: "11%",
        cell: (row) => (
          <div>
            <div className="font-medium text-gray-900 dark:text-white">{row.productId?.productName || "-"}</div>
          </div>
        )
      },
      {
        name: "SKU",
        selector: (row) => row.sku || "-",
        sortable: true,
        // width: "11%",
        cell: (row) => (
          <div className="text-center">
            {row.sku ? (
              <span className="text-sm font-mono text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded truncate max-w-full block" title={row.sku}>
                {row.sku}
              </span>
            ) : (
              <span className="text-gray-400 dark:text-gray-500">-</span>
            )}
          </div>
        )
      },
      {
        name: "Previous Qty",
        selector: (row) => row.previousStock,
        // width: "11%",
        cell: (row) => (
          <div className="text-center">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
              {row.previousStock}
            </span>
          </div>
        )
      },
      {
        name: "Actual Qty",
        selector: (row) => row.actualStock,
        // width: "11%",
        cell: (row) => (
          <div className="text-center">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              {row.actualStock}
            </span>
          </div>
        )
      },
      {
        name: "Difference",
        selector: (row) => row.difference,
        // width: "11%",
        cell: (row) => (
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1">
              {row.difference > 0 ? (
                <TrendingUp className="w-4 h-4 text-green-500" />
              ) : row.difference < 0 ? (
                <TrendingDown className="w-4 h-4 text-red-500" />
              ) : (
                <Minus className="w-4 h-4 text-gray-500" />
              )}
              <span className={`font-semibold ${row.difference > 0 ? 'text-green-600 dark:text-green-400' :
                row.difference < 0 ? 'text-red-600 dark:text-red-400' :
                  'text-gray-600 dark:text-gray-400'
                }`}>
                {row.difference > 0 ? '+' : ''}{row.difference}
              </span>
            </div>
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
                handleStatusChange(row, newStatus)
              }
              isDisabled={!checkPermission("stock.adjustments", "update")}
            />
          </div>
        )
      },
      {
        name: "Cancelled Reason",
        selector: (row) => row.rejectionReason || "-",
        // width: "10%",
        cell: (row: any) => (
          <div className="w-full">
            {row.rejectionReason ? (
              <span className="text-sm text-gray-600 dark:text-gray-300 truncate block w-full" title={row.rejectionReason}>
                {row.rejectionReason}
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
            <FaEye className="w-4 h-4" />
          </WebComponents.UiComponents.UiWebComponents.Button>
        ),
      },
      {
        render: (row) => (
          (checkPermission("stock.adjustments", "update")) && row.status == "pending" && (
            <WebComponents.UiComponents.UiWebComponents.Button size="icon" variant="editaction" onClick={() => handleEditClick(row)}>
              <FaEdit className="w-4 h-4" />
            </WebComponents.UiComponents.UiWebComponents.Button>
          )
        ),
      },
      {
        render: (row) => (
          (checkPermission("stock.adjustments", "delete")) && (row.status == "cancelled" || row.status == "pending") && (
            <WebComponents.UiComponents.UiWebComponents.Button size="icon" variant="deleteaction" onClick={() => handleDelete(row._id)}>
              <FaTrash className="w-4 h-4" />
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
      items: adjustments,
      setItems: setAdjustments,
      bulkDeleteAction: ServerActions.ServerActionslib.bulkDeleteStockAdjustmentAction,
      bulkUpdateStatusAction: ServerActions.ServerActionslib.bulkUpdateStockAdjustmentsStatusAction,
      clearSelectedData,
      idSelector: (r) => r._id,
    });
  }, [selectedRows, actionFilter, activeStatusFilter, adjustments]);

  // clear selected data
  const clearSelectedData = () => {
    setClearSelectedRows(prev => !prev);
    setSelectedRows([]);
    router.refresh();
  }

  // CSV and PDF export columns
  const exportColumns = React.useMemo(() => {
    return WebComponents.WebCommonComponents.CommonComponents.generateExportColumns<AdminTypes.StockTypes.Entities.StockAdjustment>([
      { key: 'storeName', label: 'Store', accessor: (row) => row.storeId?.name || '-', pdfWidth: 40 },
      { key: 'productName', label: 'Product', accessor: (row) => row.productId?.productName || '-', pdfWidth: 45 },
      { key: 'sku', label: 'SKU', accessor: (row) => row.sku || '-', pdfWidth: 40 },
      { key: 'previousStock', label: 'Prev Qty', accessor: (row) => row.previousStock, pdfWidth: 20 },
      { key: 'actualStock', label: 'Actual Qty', accessor: (row) => row.actualStock, pdfWidth: 20 },
      { key: 'difference', label: 'Diff', accessor: (row) => row.difference, pdfWidth: 20 },
      { key: 'adjustmentType', label: 'Type', accessor: (row) => row.adjustmentType, pdfWidth: 25 },
      { key: 'reason', label: 'Reason', accessor: (row) => row.reason || '-', pdfWidth: 50 },
      { key: 'status', label: 'Status', accessor: (row) => row.status, pdfWidth: 30 },
      { key: 'rejectionReason', label: 'Cancelled Reason', accessor: (row) => row.rejectionReason || '-', pdfWidth: 50 },
    ]);
  }, []);

  // handle download 
  const downloadPdf = async (): Promise<any[]> => {
    return await ServerActions.HandleFunction.handleDownloadCommon({
      selectedRows,
      searchParams,
      bulkGetSelectedAction: ServerActions.ServerActionslib.bulkGetSelectedStockAdjustmentAction,
      bulkGetAllAction: ServerActions.ServerActionslib.bulkGetStockAdjustmentAction,
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
            Stock Adjustments
            {(() => {
              if (!showModal && !showEditModal) return "";
              const modalTitle = showModal ? "Add Adjustment" : "Edit Adjustment";
              return ` > ${modalTitle}`;
            })()}
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-textSmall pt-2">
            {showModal || showEditModal ? "Add new stock adjustment." : "Set actual quantity to increase/decrease inventory accordingly"}
          </p>
        </div>
        {(checkPermission("stock.adjustments", "create")) && (
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
            onActionFilterChange={setActionFilter}
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
            categoryPlaceholder="All Stores"
            statusFilter={allStatusFilter}
            onStatusFilterChange={(value: string) => setAllStatusFilter(value || "All")}
            statusOptions={[
              { label: 'All Status', value: 'All' },
              { label: 'Pending', value: 'Pending' },
              { label: 'Approved', value: 'Approved' },
              { label: 'Completed', value: 'Completed' },
              { label: 'Cancelled', value: 'Cancelled' },
            ]}
            searchTerm={searchTerm}
            onSearchTermChange={setSearchTerm}
            renderExports={
              <>
                <WebComponents.UiComponents.UiWebComponents.DownloadCSV
                  data={downloadData}
                  columns={exportColumns.csvColumns}
                  filename={`stock-adjustments-${new Date().toISOString().split('T')[0]}.csv`}
                  onExport={async () => {
                    const data = await downloadPdf();
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
                    disabled={adjustments.length === 0}
                  >
                    <Image src={Constants.assetsIcon.assets.csv} alt="CSV" width={28} height={28} className="w-5 h-5 sm:w-6 sm:h-6 md:w-6 md:h-6 lg:w-7 lg:h-7 xl:w-7 xl:h-7 2xl:w-7 2xl:h-7" />
                  </button>
                </WebComponents.UiComponents.UiWebComponents.DownloadCSV>
                <WebComponents.UiComponents.UiWebComponents.DownloadPDF
                  data={downloadData}
                  columns={exportColumns.pdfColumns}
                  filename={`stock-adjustments-${new Date().toISOString().split('T')[0]}.pdf`}
                  title="Stock Adjustments Report"
                  orientation="landscape"
                  onExport={async () => {
                    const data = await downloadPdf();
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
                    disabled={adjustments.length === 0}
                  >
                    <Image src={Constants.assetsIcon.assets.pdf} alt="PDF" width={28} height={28} className="w-5 h-5 sm:w-6 sm:h-6 md:w-6 md:h-6 lg:w-7 lg:h-7 xl:w-7 xl:h-7 2xl:w-7 2xl:h-7" />
                  </button>
                </WebComponents.UiComponents.UiWebComponents.DownloadPDF>
              </>
            }
          />

          <div>
            {loading ? (
              <div className="flex justify-center items-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-2 text-gray-600 dark:text-gray-300">Loading stock adjustments...</span>
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
        <WebComponents.AdminComponents.AdminWebComponents.Forms.StockAdjustmentForm
          title={showModal ? "Add Adjustment" : "Edit Adjustment"}
          stores={stores}
          products={mappedProducts}
          categories={categories}
          subcategories={subcategories}
          defaultValues={editing ? {
            storeId: editing.storeId?._id,
            categoryId: editing.categoryId?._id || "",
            subcategoryId: editing.subCategoryId?._id || "",
            productId: editing.productId?._id,
            variant: editing.variant || (editing.productId?.variantData?.find((v: any) => v.SKU === editing.sku || v.sku === editing.sku) as any)?.variantTitle || (editing.productId?.variantData?.find((v: any) => v.SKU === editing.sku || v.sku === editing.sku) as any)?.variantValues?.[0]?.value || "",
            actualStock: editing.actualStock,
            reason: editing.reason,
          } : undefined}
          onClose={() => {
            setShowModal(false);
            setShowEditModal(false);
            setEditing(null);
          }}
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
      {showDetailsModal && selectedAdjustment && (
        <WebComponents.AdminComponents.AdminWebComponents.Models.StockAdjustmentDetailsModal
          adjustment={selectedAdjustment}
          onClose={() => setShowDetailsModal(false)}
        />
      )}

      {/* Cancellation Dialog */}
      <CancellationDialog
        isOpen={showCancellationDialog}
        onClose={handleCancellationClose}
        onConfirm={handleCancellationConfirm}
        title="Adjustment Cancellation Reason"
        confirmButtonText="Cancel Adjustment"
      />
    </>
  );
}
