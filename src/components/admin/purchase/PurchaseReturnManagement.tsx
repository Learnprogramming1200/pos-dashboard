"use client";
import React from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from 'next/navigation';
import { FaEye, FaEdit, FaTrash, FaDownload } from "react-icons/fa";
import { HiArrowLeft, HiPlus } from "react-icons/hi";
import { ServerActions } from "@/lib";
import { Constants } from "@/constant";
import { customHooks } from "@/hooks";
import { WebComponents } from "@/components";
import { PaginationType, AdminTypes } from "@/types";

export default function PurchaseReturnManagement({
  initialStores,
  initialPurchaseOrders,
  initialPurchaseReturns,
  initialPagination
}: {
  readonly initialStores: AdminTypes.storeTypes.Store[];
  readonly initialPurchaseOrders?: AdminTypes.purchaseTypes.ApiPurchaseOrder[];
  readonly initialPurchaseReturns: AdminTypes.purchaseReturnTypes.PurchaseReturn[];
  readonly initialPagination: PaginationType.Pagination;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [purchaseReturns, setPurchaseReturns] = React.useState<AdminTypes.purchaseReturnTypes.PurchaseReturn[]>([]);
  const [purchaseOrders, setPurchaseOrders] = React.useState<AdminTypes.purchaseOrderTypes.PurchaseOrder[]>([]); // Transformed POs
  const [stores, setStores] = React.useState<AdminTypes.storeTypes.Store[]>(initialStores);
  const [suppliers, setSuppliers] = React.useState<AdminTypes.supplierTypes.Supplier[]>([]); // Extracted from POs or fetched
  const [pagination, setPagination] = React.useState<PaginationType.Pagination>(initialPagination);
  const [showModal, setShowModal] = React.useState(false);
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [showDetailsModal, setShowDetailsModal] = React.useState(false);
  const [editingReturn, setEditingReturn] = React.useState<AdminTypes.purchaseReturnTypes.PurchaseReturn | null>(null);
  const [selectedReturn, setSelectedReturn] = React.useState<AdminTypes.purchaseReturnTypes.PurchaseReturn | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [selectedRows, setSelectedRows] = React.useState<AdminTypes.purchaseReturnTypes.PurchaseReturn[]>([]);
  const [actionFilter, setActionFilter] = React.useState<string>("All");
  const [downloadData, setDownloadData] = React.useState([]);
  const [activeStatusFilter, setActiveStatusFilter] = React.useState<string>("All");
  const [clearSelectedRows, setClearSelectedRows] = React.useState(false);
  const { searchTerm, setSearchTerm, filteredData, allStatusFilter, setAllStatusFilter } = customHooks.useListFilters<AdminTypes.purchaseReturnTypes.PurchaseReturn>(purchaseReturns, {
    statusAllSelector: (row) => row.status,
  });

  /* Permissions */
  const { checkPermission } = customHooks.useUserPermissions();

  const bulkActionOptions = React.useMemo(() => {
    const options = Constants.commonConstants.actionOptions;
    return options.filter(option => {
      if (option.value === 'Status') {
        return checkPermission("purchase.return", "update");
      }
      if (option.value === 'Delete') {
        return checkPermission("purchase.return", "delete");
      }
      return true;
    });
  }, [checkPermission]);

  // Sync state with props
  React.useEffect(() => {
    setPurchaseReturns(initialPurchaseReturns);
    setPagination(initialPagination);
  }, [initialPurchaseReturns]);

  // Transform POs  
  React.useEffect(() => {
    setPurchaseOrders(initialPurchaseOrders as any || []);
    const uniqueSuppliers = new Map();
    initialPurchaseOrders?.forEach((order: any) => {
      if (order.supplierId && !uniqueSuppliers.has(order.supplierId)) {
        uniqueSuppliers.set(order.supplierId, {
          id: order.supplierId,
          name: order.supplierName,
          email: order.supplierEmail,
          _id: order.supplierId
        });
      }
    });
    setSuppliers(Array.from(uniqueSuppliers.values()));

  }, [initialPurchaseOrders]);

  React.useEffect(() => {
    if (selectedRows.length === 0) {
      setActionFilter("All");
      setActiveStatusFilter("All");
    }
  }, [selectedRows]);

  const handleAdd = async (formData: any) => {
    await ServerActions.HandleFunction.handleAddCommon({
      formData,
      createAction: ServerActions.ServerActionslib.createPurchaseReturnDraftAction,
      setLoading,
      setShowModal,
      router,
      successMessage: "Purchase return created successfully.",
      errorMessage: "Failed to create purchase return.",
    });
  };

  const handleEdit = async (formData: any) => {
    await ServerActions.HandleFunction.handleEditCommon({
      formData,
      editingItem: editingReturn,
      getId: (item) => item.id,
      updateAction: (id, data) => ServerActions.ServerActionslib.updatePurchaseReturnAction(String(id), data),
      setLoading,
      setShowEditModal,
      setEditingItem: setEditingReturn,
      router,
      successMessage: "Purchase return updated successfully.",
      errorMessage: "Failed to update purchase return.",
    });
  };

  const handleEditModal = React.useCallback((row: AdminTypes.purchaseReturnTypes.PurchaseReturn) => {
    setEditingReturn(row);
    setShowEditModal(true);
  }, []);

  const handleViewDetails = React.useCallback((row: AdminTypes.purchaseReturnTypes.PurchaseReturn) => {
    setSelectedReturn(row);
    setShowDetailsModal(true);
  }, []);

  const handleStatusChange = async (
    row: AdminTypes.purchaseReturnTypes.PurchaseReturn,
    newStatus: string,
  ) => {
    const targetId = String(row._id || row.id || '');
    if (!targetId || !newStatus || newStatus === row.status) return;
    try {
      setLoading(true);
      const payload: any = {
        status: newStatus,
      };
      /**
       * ✅ Status specific UI payload (optional – backend-safe)
       */
      if (newStatus === 'Credited') {
        payload.creditAmount = row.totalCreditAmount || 0;
        payload.note = 'Purchase return credited';
      }

      if (newStatus === 'Returned') {
        payload.creditAmount = row.totalCreditAmount || 0;
        payload.note = 'Purchase return marked as returned';
      }

      if (newStatus === 'Cancelled') {
        payload.note = 'Purchase return cancelled';
      }

      if (newStatus === 'Closed') {
        payload.note = 'Purchase return closed';
      }
      const result = await ServerActions.ServerActionslib.updatePurchaseReturnStatusAction(targetId, payload);
      if (!result.success) {
        throw new Error(result.error || 'Failed to update purchase return status');
      }
      WebComponents.UiComponents.UiWebComponents.SwalHelper.success({
        text: `Purchase return status updated to ${newStatus}.`,
      });
      router.refresh();
    } catch (err: any) {
      WebComponents.UiComponents.UiWebComponents.SwalHelper.error({
        text: err?.message || 'Failed to update purchase return status',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = React.useCallback(async (id: string) => {
    await ServerActions.HandleFunction.handleDeleteCommon({
      id,
      deleteAction: (id) => ServerActions.ServerActionslib.deletePurchaseReturnAction(String(id)),
      setLoading,
      router,
      successMessage: "Purchase return deleted successfully.",
      errorMessage: "Failed to delete purchase return."
    });
  }, [router]);

  const handleGenerateInvoice = async (row: AdminTypes.purchaseReturnTypes.PurchaseReturn) => {
    try {
      setLoading(true);

      // 1. Validation: Ensure strict status check
      if (!['Returned', 'Credited', 'Closed'].includes(row.status)) {
        WebComponents.UiComponents.UiWebComponents.SwalHelper.error({
          text: 'Invoice can be generated only for Returned/Credited/Closed returns'
        });
        return;
      }

      // 2. Fetch Detailed Data
      let returnData: any = row;
      const id = String(row.id || (row as any)._id || '');
      if (id) {
        const res = await ServerActions.ServerActionslib.getPurchaseReturnByIdAction(id);
        if (res?.success && res.data) {
          returnData = (res.data as any).data || res.data;
        }
      }

      // 3. Prepare Business/Store Info & Supplier Info
      const business = returnData.business || {};
      const supplier = returnData.supplier || returnData.supplierId || {};

      const supplierAddress = supplier.address ||
        [supplier.city, supplier.state, supplier.zipCode].filter(Boolean).join(', ');

      const storeName = returnData.name || returnData.purchaseOrderId?.orderDetails?.storeName || 'Your Business';
      const businessInfo = {
        businessName: business.name || returnData.purchaseOrderId?.orderDetails?.storeName || storeName,
        email: business.email || returnData.purchaseOrderId?.orderDetails?.storeEmail || 'contact@example.com',
        phone: business.phone || returnData.purchaseOrderId?.orderDetails?.storePhone || '',
        address: business.address || returnData.storeAddress || '',
      };

      // 4. Build Payload matching the backend DTO structure expected by PDF Generator
      const payload = {
        invoiceType: 'PURCHASE_RETURN',
        invoiceTitle: 'CREDIT NOTE',
        business: businessInfo,
        customer: {
          // "Ship From" -> Us (Returning Goods)
          shippingName: businessInfo.businessName,
          shippingAddress: businessInfo.address,
          shippingPhone: businessInfo.phone,

          // "Invoice To" -> Supplier (Receiving Goods)
          deliveryName: supplier.name,
          deliveryPhone: supplier.phone,
          deliveryAddress: supplierAddress || 'N/A',
          deliveryContact: supplier.contactPerson || supplier.name,
          deliveryEmail: supplier.email
        },
        invoice: {
          // Use Credit Note Number logic
          invoiceNumber: `CN-${returnData.returnNumber || returnData.purchaseReturnNumber || id.slice(-6)}`,
          purchaseOrderNumber: returnData.purchaseOrderId?.orderDetails?.poNumber || returnData.purchaseOrder?.poNumber,
          invoiceDate: returnData.returnDate || returnData.invoiceDate,
          currency: '₹', // Default or dynamic
          reason: returnData.reason || '',
        },
        items: (returnData.items || []).map((i: any, idx: number) => ({
          srNo: idx + 1,
          productName: i.productName || 'Unknown Product',
          SKU: i.sku || i.productCode || 'N/A',
          quantity: i.returnedQuantity || i.returnQty || i.quantity || 0,
          unitPrice: i.unitCost || i.unitPrice || 0,
          taxAmount: i.taxAmount || 0,
          discountAmount: i.discountPerUnit ? (Number(i.discountPerUnit) * Number(i.returnedQuantity || i.quantity || i.returnQty)) : 0,
          lineTotal: i.refundAmount || i.lineTotal || 0
        })),
        totals: {
          subtotal: returnData.summary?.itemsSubtotal || returnData.itemsSubtotal || 0,
          totalTax: returnData.summary?.taxTotal || returnData.itemsTaxTotal || 0,
          shippingFee: returnData.summary?.shippingAdjustment || returnData.shippingAdjustment || 0,
          grandTotal: returnData.summary?.totalCreditAmount || returnData.totalCreditAmount || 0,
          balanceDue: returnData.summary?.balanceDue || returnData.balanceCreditAmount || 0
        },
        notes: returnData.notes || returnData.reason || ''
      };

      const res = await ServerActions.ServerActionslib.generateInvoicePDFAction(payload);

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
      window.open(url, '_blank');
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error: any) {
      WebComponents.UiComponents.UiWebComponents.SwalHelper.error({ text: error.message || "Failed to generate invoice." });
    } finally {
      setLoading(false);
    }
  };

  const columns = React.useMemo(
    () =>
      WebComponents.WebCommonComponents.CommonComponents.createColumns<
        AdminTypes.purchaseReturnTypes.PurchaseReturn
      >({
        fields: [
          {
            name: "Return #",
            selector: (row) => row.id,
            cell: (row) => (
              <span className="font-medium text-gray-900 dark:text-white">
                {row.purchaseReturnNumber}
              </span>
            ),
            sortable: true,
          },
          {
            name: "PO #",
            selector: (row) =>
              row.purchaseOrderId?.orderDetails?.poNumber,
            cell: (row) => (
              <span className="text-gray-900 dark:text-white">
                {row.purchaseOrderId?.orderDetails?.poNumber || "-"}
              </span>
            ),
            sortable: true,
          },
          {
            name: "Supplier",
            selector: (row) => row.supplierId?.name,
            cell: (row) => (
              <span className="text-gray-900 dark:text-white">
                {row.supplierId?.name || "-"}
              </span>
            ),
            sortable: true,
          },
          {
            name: "Return Date",
            selector: (row) => row.returnDate,
            cell: (row) => (
              <span className="text-gray-900 dark:text-white">
                {row.returnDate
                  ? new Date(row.returnDate).toLocaleDateString("en-GB")
                  : "-"}
              </span>
            ),
            sortable: true,
          },
          {
            name: "Total Credit",
            selector: (row) => row.totalCreditAmount || 0,
            cell: (row) => (
              <span className="font-medium text-gray-900 dark:text-white">
                ₹{(row.totalCreditAmount || 0).toLocaleString()}
              </span>
            ),
            sortable: true,
          },
          {
            name: "Balance",
            selector: (row) => row.balanceCreditAmount || 0,
            cell: (row) => (
              <span className="font-medium text-red-600 dark:text-red-400">
                ₹{(row.balanceCreditAmount || 0).toLocaleString()}
              </span>
            ),
            sortable: true,
          },
          {
            name: "Status",
            selector: (row) => row.status,
            cell: (row) => (
              <div className="flex justify-center">
                <WebComponents.UiComponents.UiWebComponents.StatusSelectReturn
                  currentStatus={row.status}
                  onStatusChange={(newStatus: string) => handleStatusChange(row, newStatus)}
                />
              </div>
            ),
            sortable: true,
          },
        ],
        actions: [
          {
            render: (row) => (
              <div className="flex gap-2">
                <WebComponents.UiComponents.UiWebComponents.Button
                  size="icon"
                  variant="viewaction"
                  onClick={() => handleViewDetails(row)}
                  title="View Details"
                >
                  <FaEye className="w-4 h-4" />
                </WebComponents.UiComponents.UiWebComponents.Button>

                {(row.status === "Returned" || row.status === "Credited") && (
                  <WebComponents.UiComponents.UiWebComponents.Button
                    size="icon"
                    variant="downloadaction"
                    onClick={() => handleGenerateInvoice(row)}
                    title="Credit Note"
                  >
                    <FaDownload className="w-4 h-4" />
                  </WebComponents.UiComponents.UiWebComponents.Button>
                )}

                {(row.status === "Draft") && (checkPermission("purchase.return", "update")) && (
                  <WebComponents.UiComponents.UiWebComponents.Button
                    size="icon"
                    variant="editaction"
                    onClick={() => handleEditModal(row)}
                    title="Edit"
                  >
                    <FaEdit className="w-4 h-4" />
                  </WebComponents.UiComponents.UiWebComponents.Button>
                )}

                {(row.status === "Draft" || row.status === "Cancelled") && (checkPermission("purchase.return", "delete")) && (
                  <WebComponents.UiComponents.UiWebComponents.Button
                    size="icon"
                    variant="deleteaction"
                    onClick={() => handleDelete(String(row.id))}
                    title="Delete"
                  >
                    <FaTrash className="w-4 h-4" />
                  </WebComponents.UiComponents.UiWebComponents.Button>
                )}
              </div>
            ),
          },
        ],
      }),
    [
      handleViewDetails,
      handleGenerateInvoice,
      handleEditModal,
      handleDelete,
    ]
  );

  const downloadPdf = async (): Promise<any[]> => {
    return await ServerActions.HandleFunction.handleDownloadCommon({
      selectedRows,
      searchParams: new URLSearchParams(searchParams.toString()),
      bulkGetSelectedAction: ServerActions.ServerActionslib.bulkGetSelectedPurchaseReturnAction,
      bulkGetAllAction: ServerActions.ServerActionslib.bulkGetPurchaseReturnAction,
      setDownloadData,
      idSelector: (item) => item._id,
    });
  };


  const exportColumns = React.useMemo(
    () =>
      WebComponents.WebCommonComponents.CommonComponents.generateExportColumns<
        AdminTypes.purchaseReturnTypes.PurchaseReturn
      >([
        {
          key: "returnNumber",
          label: "Return #",
          accessor: (r) => r.purchaseReturnNumber || "-",
          pdfWidth: 20,
        },
        {
          key: "purchaseOrderNumber",
          label: "PO #",
          accessor: (r) =>
            r.purchaseOrderId?.orderDetails?.poNumber || "-",
          pdfWidth: 20,
        },
        {
          key: "supplierName",
          label: "Supplier",
          accessor: (r) => r.supplierId?.name || "-",
          pdfWidth: 25,
        },
        {
          key: "totalCreditAmount",
          label: "Refund",
          accessor: (r) =>
            r.totalCreditAmount
              ? `${r.totalCreditAmount.toLocaleString()}`
              : "₹0",
          pdfWidth: 15,
        },
        {
          key: "status",
          label: "Status",
          accessor: (r) => r.status,
          pdfWidth: 10,
        },
        {
          key: "returnDate",
          label: "Date",
          accessor: (r) =>
            r.returnDate
              ? new Date(r.returnDate).toLocaleDateString("en-GB")
              : "-",
          pdfWidth: 10,
        },
      ]),
    []
  );



  const clearSelectedData = () => {
    setClearSelectedRows(prev => !prev);
    setSelectedRows([]);
    router.refresh();
  }

  const handleBulkApply = React.useCallback(async () => {
    await ServerActions.HandleFunction.handleBulkApplyCommon({
      selectedRows,
      actionFilter,
      activeStatusFilter,
      items: purchaseReturns,
      setItems: setPurchaseReturns,
      bulkDeleteAction: ServerActions.ServerActionslib.bulkDeletePurchaseReturnsAction,
      bulkUpdateStatusAction: ServerActions.ServerActionslib.bulkUpdatePurchaseReturnStatusAction,
      clearSelectedData,
      idSelector: (r) => r._id,
      statusProp: 'status',
    });
  }, [selectedRows, actionFilter, activeStatusFilter, purchaseReturns, clearSelectedData]);

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
            {showModal || showEditModal ? `Purchase Management > ${showModal ? 'Add Return' : 'Edit Return'}` : 'Purchase Return Management'}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-300">Manage purchase returns and refunds</p>
        </div>
        {(checkPermission("purchase.return", "create")) && (
          <WebComponents.UiComponents.UiWebComponents.Button
            variant="addBackButton"
            onClick={() => {
              if (showModal || showEditModal) {
                setShowModal(false);
                setShowEditModal(false);
                setEditingReturn(null);
              } else {
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

      {!showModal && !showEditModal && (
        <div className="bg-white dark:bg-darkFilterbar rounded-[4px] h-full w-full mt-4 overflow-hidden">
          <WebComponents.WebCommonComponents.CommonComponents.CommonFilterBar
            actionFilter={actionFilter}
            onActionFilterChange={(val: string) => {
              setActionFilter(val);
              if (val !== 'Status') setActiveStatusFilter('All');
            }}
            actionOptions={bulkActionOptions}
            activeStatusFilter={activeStatusFilter}
            onActiveStatusFilterChange={setActiveStatusFilter}
            activeStatusOptions={Constants.commonConstants.activeStatusOptionsPurchaseReturn}
            selectedCount={selectedRows.length}
            onApply={handleBulkApply}
            showCategoryFilter={false}
            categoryFilter="All"
            onCategoryFilterChange={() => { }}
            categoryOptions={[]}
            statusFilter={allStatusFilter}
            onStatusFilterChange={setAllStatusFilter}
            statusOptions={Constants.commonConstants.purchaseReturnStatusOptions}
            searchTerm={searchTerm}
            onSearchTermChange={setSearchTerm}
            renderExports={
              <>
                <WebComponents.UiComponents.UiWebComponents.DownloadCSV
                  data={filteredData}
                  columns={exportColumns.csvColumns}
                  filename={`returns-${new Date().toISOString().split('T')[0]}.csv`}
                  onExport={async () => {
                    const data = await downloadPdf();
                    WebComponents.UiComponents.UiWebComponents.SwalHelper.success({ text: 'CSV exported successfully.' });
                    clearSelectedData();
                    return data;
                  }}
                >
                  <button className="rounded-[4px] bg-[#ffffff] dark:bg-[#3A3A3A] border border-[#D8D9D9] border-opacity-50 hover:bg-[#e0e0e0] dark:hover:bg-[#4A4A4A] px-2 py-[6.9px]">
                    <Image src={Constants.assetsIcon.assets.csv} alt="CSV" width={28} height={28} className="w-5 h-5" />
                  </button>
                </WebComponents.UiComponents.UiWebComponents.DownloadCSV>
                <WebComponents.UiComponents.UiWebComponents.DownloadPDF
                  data={downloadData}
                  columns={exportColumns.pdfColumns}
                  filename={`returns-${new Date().toISOString().split('T')[0]}.pdf`}
                  title="Returns Report"
                  onExport={async () => {
                    const data = await downloadPdf();
                    WebComponents.UiComponents.UiWebComponents.SwalHelper.success({ text: 'PDF exported successfully.' });
                    clearSelectedData();
                    return data;
                  }}
                >
                  <button className="rounded-[4px] bg-[#ffffff] dark:bg-[#3A3A3A] border border-[#D8D9D9] border-opacity-50 hover:bg-[#e0e0e0] dark:hover:bg-[#4A4A4A] px-2 py-[6.9px]">
                    <Image src={Constants.assetsIcon.assets.pdf} alt="PDF" width={28} height={28} className="w-5 h-5" />
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
            totalRecords={pagination.totalItems || purchaseReturns.length}
            filteredRecords={pagination.totalItems || filteredData.length}
            paginationPerPage={pagination.itemsPerPage}
            paginationDefaultPage={pagination.currentPage}
            paginationRowsPerPageOptions={[5, 10, 25, 50]}
            useUrlParams={true}
          />
        </div>
      )}

      {(showModal || showEditModal) && (
        <WebComponents.UiComponents.UiWebComponents.AdminFormModal
          formId="return-form"
          onClose={() => {
            setShowModal(false);
            setShowEditModal(false);
            setEditingReturn(null);
          }}
          loading={loading}
        >
          <WebComponents.AdminComponents.AdminWebComponents.Forms.PurchaseReturnForm
            onSubmit={showModal ? handleAdd : handleEdit}
            onCancel={() => {
              setShowModal(false);
              setShowEditModal(false);
              setEditingReturn(null);
            }}
            returnData={editingReturn || undefined}
            purchaseOrders={purchaseOrders}
            suppliers={suppliers}
            stores={stores}
          />
        </WebComponents.UiComponents.UiWebComponents.AdminFormModal>
      )}

      {showDetailsModal && selectedReturn && (
        <WebComponents.AdminComponents.AdminWebComponents.Models.PurchaseReturnDetailsModal
          return={selectedReturn}
          onClose={() => setShowDetailsModal(false)}
        />
      )}
    </>
  );
}
