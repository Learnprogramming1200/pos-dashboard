"use client";
import React from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { FaEye, FaEdit, FaTrash, FaDownload } from "react-icons/fa";
import { HiArrowLeft, HiPlus } from "react-icons/hi";
import { ServerActions } from "@/lib";
import { Constants } from "@/constant";
import { customHooks } from "@/hooks";
import { WebComponents } from "@/components";
import { AdminTypes, PaginationType } from "@/types";


export default function PurchaseOrderManagement({
  initialSuppliers,
  initialProducts,
  initialTaxes,
  initialPurchaseOrders,
  initialPagination
}: {
  readonly initialSuppliers: AdminTypes.supplierTypes.Supplier[],
  readonly initialProducts: AdminTypes.InventoryTypes.ProductTypes.Product[],
  readonly initialTaxes: AdminTypes.taxTypes.Tax[],
  readonly initialPurchaseOrders: AdminTypes.purchaseOrderTypes.PurchaseOrder[],
  readonly initialPagination: PaginationType.Pagination
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [purchaseOrders, setPurchaseOrders] = React.useState<AdminTypes.purchaseOrderTypes.PurchaseOrder[]>(initialPurchaseOrders);
  const [pagination, setPagination] = React.useState<PaginationType.Pagination>(initialPagination);
  const [showModal, setShowModal] = React.useState(false);
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [showDetailsModal, setShowDetailsModal] = React.useState(false);
  const [editingOrder, setEditingOrder] = React.useState<AdminTypes.purchaseOrderTypes.PurchaseOrder | null>(null);
  const [selectedOrder, setSelectedOrder] = React.useState<AdminTypes.purchaseOrderTypes.PurchaseOrder | null>(null);
  const [selectedRows, setSelectedRows] = React.useState<AdminTypes.purchaseOrderTypes.PurchaseOrder[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [showReceiveModal, setShowReceiveModal] = React.useState(false);
  const [receivingOrder, setReceivingOrder] = React.useState<AdminTypes.purchaseOrderTypes.PurchaseOrder | null>(null);
  const [actionFilter, setActionFilter] = React.useState<string>("All");
  const [activeStatusFilter, setActiveStatusFilter] = React.useState<string>("All");
  const [clearSelectedRows, setClearSelectedRows] = React.useState(false);
  const [downloadData, setDownloadData] = React.useState<AdminTypes.purchaseOrderTypes.PurchaseOrder[]>([]);
  const [isGeneratingPDF, setIsGeneratingPDF] = React.useState(false);
  const storesHook = customHooks.useStores();

  /* Permissions */
  const { checkPermission } = customHooks.useUserPermissions();

  const bulkActionOptions = React.useMemo(() => {
    const options = Constants.commonConstants.actionOptions;
    return options.filter(option => {
      if (option.value === 'Status') {
        return checkPermission("purchase.order", "update");
      }
      if (option.value === 'Delete') {
        return checkPermission("purchase.order", "delete");
      }
      return true;
    });
  }, [checkPermission]);

  // Convert StoreData to Store format for the form
  const convertedStores = React.useMemo(() => {
    return (storesHook.stores || []) as any[];
  }, [storesHook.stores]);
  const { searchTerm, setSearchTerm, statusFilter, setStatusFilter, filteredData, allStatusFilter, setAllStatusFilter } = customHooks.useListFilters<AdminTypes.purchaseOrderTypes.PurchaseOrder>(
    purchaseOrders,
    {
      statusAllSelector: (row) => row.status,
    }
  );

  // Sync state with props when URL params change (server re-fetches data)
  React.useEffect(() => {
    setPurchaseOrders(initialPurchaseOrders);
    if (initialPagination) setPagination(initialPagination);
  }, [initialPurchaseOrders, initialPagination]);

  // Reset action filter when no rows are selected
  React.useEffect(() => {
    if (selectedRows.length === 0) {
      setActionFilter("All");
      setActiveStatusFilter("All");
    }
  }, [selectedRows]);

  // Add
  const handleAdd = async (formData: AdminTypes.purchaseOrderTypes.PurchaseOrderFormData) => {
    await ServerActions.HandleFunction.handleAddCommon({
      formData,
      createAction: ServerActions.ServerActionslib.createPurchaseOrderAction,
      setLoading,
      setShowModal: setShowModal,
      router,
      successMessage: "Purchase order added successfully.",
      errorMessage: "Failed to add purchase order.",
      checkExistsError: (errorMessage) => errorMessage.toLowerCase() === "purchase order already exists",
    });
  };

  // Update
  const handleEdit = async (formData: AdminTypes.purchaseOrderTypes.PurchaseOrderFormData) => {
    await ServerActions.HandleFunction.handleEditCommon({
      formData,
      editingItem: editingOrder,
      getId: (item) => String(item._id || item.id || ''),
      updateAction: (id: string | number, data) => ServerActions.ServerActionslib.updatePurchaseOrderAction(String(id), data),
      setLoading,
      setShowEditModal,
      setEditingItem: setEditingOrder,
      router,
      successMessage: "Purchase order updated successfully.",
      errorMessage: "Failed to update purchase order.",
      checkExistsError: (errorMessage) => errorMessage.toLowerCase() === "purchase order already exists",
    });
  };

  // Delete
  const handleDelete = React.useCallback(async (id: string) => {
    await ServerActions.HandleFunction.handleDeleteCommon({
      id,
      deleteAction: (id) => ServerActions.ServerActionslib.deletePurchaseOrderAction(String(id)),
      setLoading,
      router,
      successMessage: "The purchase order has been deleted.",
      errorMessage: "Failed to delete purchase order.",
    });
  }, [router]);


  const handleEditModal = React.useCallback((order: AdminTypes.purchaseOrderTypes.PurchaseOrder) => {
    setEditingOrder(order);
    setShowEditModal(true);
  }, []);

  // View Details
  const handleViewDetails = React.useCallback((order: AdminTypes.purchaseOrderTypes.PurchaseOrder) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  }, []);

  const handleStatusChange = async (row: AdminTypes.purchaseOrderTypes.PurchaseOrder, newStatus: string) => {
    const targetId = String(row._id || row.id || row.orderDetails?.poNumber || row.orderNumber || '');
    if (!targetId || !newStatus || newStatus === row.status) return;

    try {
      setLoading(true);
      const payload: any = { status: newStatus };

      if (newStatus === 'Billed') {
        const grandTotal = row.totals?.grandTotal || row.totalAmount || 0;
        payload.amountPaid = grandTotal;
        payload.paymentAmount = grandTotal;
        payload.note = 'Status updated to Billed';
      }

      const result = await ServerActions.ServerActionslib.updatePurchaseOrderStatusAction(targetId, payload);
      if (!result.success) throw new Error(result.error || 'Failed to update status');

      WebComponents.UiComponents.UiWebComponents.SwalHelper.success({ text: `Status updated to ${newStatus}.` });
      router.refresh();
    } catch (err: any) {
      WebComponents.UiComponents.UiWebComponents.SwalHelper.error({ text: err?.message || 'Failed to update status' });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateInvoice = async (order: any) => {
    try {
      setIsGeneratingPDF(true);

      // Check order status - prevent invoice generation for Draft, PendingApproval, and Cancelled
      const currentStatus = order?.status || (order as any)?.orderDetails?.status || '';
      if (currentStatus === 'Draft' || currentStatus === 'PendingApproval' || currentStatus === 'Cancelled') {
        let errorMessage = '';
        if (currentStatus === 'Draft') {
          errorMessage = 'Cannot generate invoice for Draft status. Please approve the order first.';
        } else if (currentStatus === 'PendingApproval') {
          errorMessage = 'Cannot generate invoice for Pending Approval status. Please approve the order first.';
        } else if (currentStatus === 'Cancelled') {
          errorMessage = 'Cannot generate invoice for Cancelled orders.';
        }
        WebComponents.UiComponents.UiWebComponents.SwalHelper.error({ text: errorMessage });
        return;
      }

      const orderId = String(order._id || order.id || order.orderDetails?.poNumber || order.orderNumber || '');

      if (orderId) {
        // Use the new dedicated invoice endpoint which returns the PDF directly
        const res = await ServerActions.ServerActionslib.getPurchaseOrderInvoiceAction(orderId);

        if (!res.success || !res.data) {
          throw new Error(res.error || 'Failed to generate invoice PDF');
        }

        // Base64 to Blob
        const byteCharacters = atob(res.data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });

        const url = URL.createObjectURL(blob);

        // Open in new tab
        window.open(url, '_blank');

        // Clean up object URL after a delay
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
    } catch (err: any) {
      console.error('Invoice generation error:', err);
      WebComponents.UiComponents.UiWebComponents.SwalHelper.error({ text: err?.message || 'Failed to generate invoice' });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const clearSelectedData = React.useCallback(() => {
    setClearSelectedRows(prev => !prev);
    setSelectedRows([]);
    router.refresh();
  }, [router]);

  const handleBulkApply = React.useCallback(async () => {
    await ServerActions.HandleFunction.handleBulkApplyCommon({
      selectedRows,
      actionFilter,
      activeStatusFilter,
      items: purchaseOrders,
      setItems: setPurchaseOrders,
      bulkDeleteAction: ServerActions.ServerActionslib.bulkDeletePurchaseOrdersAction,
      bulkUpdateStatusAction: ServerActions.ServerActionslib.bulkUpdatePurchaseOrderStatusAction,
      clearSelectedData,
      idSelector: (r) => r._id,
      statusProp: 'status',
    });
  }, [selectedRows, actionFilter, activeStatusFilter, purchaseOrders, clearSelectedData]);


  const columns = React.useMemo(() => WebComponents.WebCommonComponents.CommonComponents.createColumns<AdminTypes.purchaseOrderTypes.PurchaseOrder>({
    fields: [
      {
        name: "PO #",
        selector: (row: AdminTypes.purchaseOrderTypes.PurchaseOrder) => row.orderDetails?.poNumber || row.orderNumber,
        cell: (row: AdminTypes.purchaseOrderTypes.PurchaseOrder) => (
          <span className="font-medium text-gray-900 dark:text-white">
            {row.orderDetails?.poNumber || row.orderNumber}
          </span>
        ),
        sortable: true,
      },
      {
        name: "Supplier",
        selector: (row: AdminTypes.purchaseOrderTypes.PurchaseOrder) => row.supplier?.supplierName || row.supplierName,
        cell: (row: AdminTypes.purchaseOrderTypes.PurchaseOrder) => (
          <span className="text-gray-900 dark:text-white">
            {row.supplier?.supplierName || row.supplierName}
          </span>
        ),
        sortable: true,
      },
      {
        name: "Product Name",
        selector: (row: AdminTypes.purchaseOrderTypes.PurchaseOrder) => row.items?.[0]?.productName || '-',
        cell: (row: AdminTypes.purchaseOrderTypes.PurchaseOrder) => (
          <div className="max-w-[200px]">
            <span className="text-gray-900 dark:text-white truncate block">
              {row.items?.[0]?.productName || '-'}
            </span>
            {row.items && row.items.length > 1 && (
              <span className="text-xs text-gray-500">+{row.items.length - 1} more</span>
            )}
          </div>
        ),
        sortable: true,
      },
      {
        name: "Purchase Date",
        selector: (row: AdminTypes.purchaseOrderTypes.PurchaseOrder) => row.orderDetails?.purchaseDate,
        cell: (row: AdminTypes.purchaseOrderTypes.PurchaseOrder) => (
          <span className="text-gray-900 dark:text-white">
            {row.orderDetails?.purchaseDate ? new Date(row.orderDetails?.purchaseDate).toLocaleDateString('en-GB') : '-'}
          </span>
        ),
        sortable: true,
      },
      {
        name: "Expected Delivery",
        selector: (row: AdminTypes.purchaseOrderTypes.PurchaseOrder) => row.orderDetails?.expectedDeliveryDate,
        cell: (row: AdminTypes.purchaseOrderTypes.PurchaseOrder) => (
          <span className="text-gray-900 dark:text-white">
            {row.orderDetails?.expectedDeliveryDate ? new Date(row.orderDetails?.expectedDeliveryDate).toLocaleDateString('en-GB') : '-'}
          </span>
        ),
        sortable: true,
      },
      {
        name: "Grand Total",
        selector: (row: AdminTypes.purchaseOrderTypes.PurchaseOrder) => row.totals?.grandTotal || row.totalAmount || 0,
        cell: (row: AdminTypes.purchaseOrderTypes.PurchaseOrder) => (
          <span className="font-medium text-gray-900 dark:text-white">
            ₹{(row.totals?.grandTotal || row.totalAmount || 0).toLocaleString()}
          </span>
        ),
        sortable: true,
      },
      {
        name: "Balance Due",
        selector: (row: AdminTypes.purchaseOrderTypes.PurchaseOrder) => row.totals?.balanceDue || 0,
        cell: (row: AdminTypes.purchaseOrderTypes.PurchaseOrder) => (
          <span className="font-medium text-red-600 dark:text-red-400">
            ₹{(row.totals?.balanceDue || 0).toLocaleString()}
          </span>
        ),
        sortable: true,
      },
      {
        name: "Status",
        selector: (row: AdminTypes.purchaseOrderTypes.PurchaseOrder) => row.status,
        cell: (row: AdminTypes.purchaseOrderTypes.PurchaseOrder) => (
          <div className="flex justify-center">
            <WebComponents.UiComponents.UiWebComponents.StatusSelect
              currentStatus={row.status}
              onStatusChange={(newStatus) => handleStatusChange(row, newStatus)}
            />
          </div>
        ),
        sortable: true,
      },
    ],
    actions: [
      {
        render: (row: AdminTypes.purchaseOrderTypes.PurchaseOrder) => (
          <div className="flex gap-2">
            <WebComponents.UiComponents.UiWebComponents.Button size="icon" variant="viewaction" onClick={() => handleViewDetails(row)} title="View Details">
              <FaEye className="w-4 h-4" />
            </WebComponents.UiComponents.UiWebComponents.Button>
            {row.status === 'Billed' && (
              <WebComponents.UiComponents.UiWebComponents.Button size="icon" variant="downloadaction" onClick={() => handleGenerateInvoice(row)} title="Generate Invoice">
                <FaDownload className="w-4 h-4" />
              </WebComponents.UiComponents.UiWebComponents.Button>
            )}
            {(row.status !== 'Billed' && row.status !== 'Cancelled') && (checkPermission("purchase.order", "update")) && (
              <WebComponents.UiComponents.UiWebComponents.Button size="icon" variant="editaction" onClick={() => handleEditModal(row)} title="Edit">
                <FaEdit className="w-4 h-4" />
              </WebComponents.UiComponents.UiWebComponents.Button>
            )}
            {(row.status === 'Draft' || row.status === 'Cancelled') && (checkPermission("purchase.order", "delete")) && (
              <WebComponents.UiComponents.UiWebComponents.Button size="icon" variant="deleteaction" onClick={() => handleDelete(String(row._id || row.id))} title="Delete">
                <FaTrash className="w-4 h-4" />
              </WebComponents.UiComponents.UiWebComponents.Button>
            )}
          </div>
        ),
      },
    ],
  }), [handleStatusChange, handleViewDetails, handleGenerateInvoice, handleEditModal, handleDelete]);


  const downloadPdf = async (): Promise<any[]> => {
    return await ServerActions.HandleFunction.handleDownloadCommon({
      selectedRows,
      searchParams: new URLSearchParams(searchParams.toString()),
      bulkGetSelectedAction: ServerActions.ServerActionslib.bulkGetSelectedPurchaseOrderAction,
      bulkGetAllAction: ServerActions.ServerActionslib.bulkGetPurchaseOrderAction,
      setDownloadData,
      idSelector: (item) => item._id,
    });
  };
  // CSV and PDF export columns
  const exportColumns = React.useMemo(() => {
    return WebComponents.WebCommonComponents.CommonComponents.generateExportColumns<AdminTypes.purchaseOrderTypes.PurchaseOrder>([
      {
        key: 'orderNumber',
        label: 'PO #',
        accessor: (row) => row.orderDetails?.poNumber || row.orderNumber || '-',
        pdfWidth: 25
      },
      {
        key: 'supplierName',
        label: 'Supplier',
        accessor: (row) => row.supplier?.supplierName || row.supplier?.name || '-',
        pdfWidth: 25
      },
      {
        key: 'productName',
        label: 'Product Name',
        accessor: (row) => row.items?.[0]?.productName || '-',
        pdfWidth: 25
      },
      {
        key: 'purchaseDate',
        label: 'Purchase Date',
        accessor: (row) => row.orderDetails?.purchaseDate ? new Date(row.orderDetails?.purchaseDate).toLocaleDateString() : '-',
        pdfWidth: 25
      },
      {
        key: 'totalAmount',
        label: 'Total Amount',
        accessor: (row) => row.totals?.grandTotal || row.totalAmount || 0,
        pdfWidth: 25
      },
      {
        key: 'status',
        label: 'Status',
        accessor: (row) => row.status,
        pdfWidth: 20
      },
      {
        key: 'expectedDeliveryDate',
        label: 'Expected Delivery',
        accessor: (row) => row.orderDetails?.expectedDeliveryDate ? new Date(row.orderDetails?.expectedDeliveryDate).toLocaleDateString() : '-',
        pdfWidth: 25
      },
      {
        key: 'createdAt',
        label: 'Created Date',
        accessor: (row) => row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '-',
        pdfWidth: 25
      },
    ]);
  }, []);

  return (
    <>
      <WebComponents.UiComponents.UiWebComponents.LoadingOverlay isVisible={isGeneratingPDF} />
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-[30px] gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
            {showModal || showEditModal ? `Purchase Order > ${showModal ? "Add Order" : "Edit Order"}` : "Purchase Order Management"}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-300">
            Manage your purchase orders, track deliveries and generate invoices
          </p>
        </div>
        {(checkPermission("purchase.order", "create")) && (
          <WebComponents.UiComponents.UiWebComponents.Button
            variant="addBackButton"
            onClick={() => {
              if (showModal || showEditModal) {
                setShowModal(false);
                setShowEditModal(false);
                setEditingOrder(null);
              } else {
                setEditingOrder(null);
                setShowModal(true);
              }
            }}
          >
            {showModal || showEditModal ? (
              <>
                <HiArrowLeft className="w-4 h-4" />
                {Constants.adminConstants.back}
              </>
            ) : (
              <>
                <HiPlus className="w-4 h-4" />
                {Constants.adminConstants.add}
              </>
            )}
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
              if (value !== "Status") {
                setActiveStatusFilter("All");
              }
            }}
            actionOptions={bulkActionOptions}
            showCategoryFilter={false}
            activeStatusFilter={activeStatusFilter}
            onActiveStatusFilterChange={setActiveStatusFilter}
            activeStatusOptions={Constants.commonConstants.purchaseOrderStatusOptionsSelect}
            selectedCount={selectedRows.length}
            onApply={handleBulkApply}
            statusFilter={allStatusFilter}
            onStatusFilterChange={setAllStatusFilter}
            statusOptions={Constants.commonConstants.purchaseOrderStatusOptions}
            searchTerm={searchTerm}
            onSearchTermChange={setSearchTerm}
            renderExports={
              <>
                <WebComponents.UiComponents.UiWebComponents.DownloadCSV
                  data={downloadData}
                  columns={exportColumns.csvColumns}
                  filename={`purchase-orders-${new Date().toISOString().split("T")[0]}.csv`}
                  onExport={async () => {
                    const data = await downloadPdf();
                    WebComponents.UiComponents.UiWebComponents.SwalHelper.success({ text: 'CSV exported successfully.' });
                    clearSelectedData();
                    return data;
                  }}
                >
                  <button
                    type="button"
                    className="rounded-[4px] bg-[#ffffff] dark:bg-[#3A3A3A] border border-[#D8D9D9] border-opacity-50 font-interTight font-normal hover:bg-[#e0e0e0] dark:hover:bg-[#4A4A4A] shadow-sm transition-colors duration-200 cursor-pointer flex-shrink-0 px-2 py-[6.9px]"
                    aria-label="Download CSV"
                    title="Download CSV"
                  >
                    <Image src={Constants.assetsIcon.assets.csv} alt="CSV" width={28} height={28} className="w-7 h-7" />
                  </button>
                </WebComponents.UiComponents.UiWebComponents.DownloadCSV>
                <WebComponents.UiComponents.UiWebComponents.DownloadPDF
                  data={purchaseOrders}
                  columns={exportColumns.pdfColumns}
                  filename={`purchase-orders-${new Date().toISOString().split("T")[0]}.pdf`}
                  title="Purchase Orders Report"
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
                    className="rounded-[4px] bg-[#ffffff] dark:bg-[#3A3A3A] border border-[#D8D9D9] border-opacity-50 font-interTight font-normal hover:bg-[#e0e0e0] dark:hover:bg-[#4A4A4A] shadow-sm transition-colors duration-200 cursor-pointer flex-shrink-0 px-2 py-[6.9px]"
                    aria-label="Download PDF"
                    title="Download PDF"
                  >
                    <Image src={Constants.assetsIcon.assets.pdf} alt="PDF" width={28} height={28} className="w-7 h-7" />
                  </button>
                </WebComponents.UiComponents.UiWebComponents.DownloadPDF>
              </>
            }
          />
          <WebComponents.WebCommonComponents.CommonComponents.DataTable
            columns={columns}
            data={filteredData}
            selectableRows
            clearSelectedRows={clearSelectedRows}
            onSelectedRowsChange={({ selectedRows }) => setSelectedRows(selectedRows)}
            useCustomPagination={true}
            totalRecords={pagination.totalItems}
            filteredRecords={pagination.totalItems || filteredData.length}
            paginationPerPage={pagination.itemsPerPage}
            paginationDefaultPage={pagination.currentPage}
            paginationRowsPerPageOptions={[5, 10, 25, 50]}
            useUrlParams={true}
          />
        </div>
      )}

      {/* Add / Edit Modal */}
      {(showModal || showEditModal) && (
        <WebComponents.UiComponents.UiWebComponents.AdminFormModal
          formId="purchase-order-form"
          onClose={() => {
            setShowModal(false);
            setShowEditModal(false);
            setEditingOrder(null);
          }}
          loading={loading}
        >
          {editingOrder ? (
            <WebComponents.AdminComponents.AdminWebComponents.Forms.PurchaseOrderForm
              id="purchase-order-form"
              onSubmit={handleEdit}
              order={editingOrder || undefined}
              suppliers={initialSuppliers}
              products={initialProducts}
              taxes={initialTaxes}
              stores={convertedStores}
            />
          ) : (
            <WebComponents.AdminComponents.AdminWebComponents.Forms.PurchaseOrderForm
              id="purchase-order-form"
              onSubmit={handleAdd}
              order={editingOrder || undefined}
              suppliers={initialSuppliers}
              products={initialProducts}
              taxes={initialTaxes}
              stores={convertedStores}
            />
          )}
        </WebComponents.UiComponents.UiWebComponents.AdminFormModal>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedOrder && (
        <WebComponents.AdminComponents.AdminWebComponents.Models.PurchaseOrderDetailsModal
          order={selectedOrder}
          onClose={() => setShowDetailsModal(false)}
          onEdit={(order) => {
            setShowDetailsModal(false);
            handleEditModal(order);
          }}
          onUpdateStatus={async (id, status, orderData) => {
            const targetOrder = orderData || purchaseOrders.find(o => o.id === id);
            if (targetOrder) {
              await handleStatusChange(targetOrder, status);
            }
          }}
          onReceive={(order) => {
            setShowDetailsModal(false);
            setReceivingOrder(order);
            setShowReceiveModal(true);
          }}
        />
      )}
    </>
  );
}
