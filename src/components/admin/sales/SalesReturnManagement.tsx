"use client";
import React from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import { HiArrowLeft, HiPlus } from "react-icons/hi";
import { Constants } from "@/constant";
import { customHooks } from "@/hooks";
import { WebComponents } from "@/components";
import { AdminTypes, PaginationType } from "@/types";

export default function SalesReturnManagement({
  initialSalesReturns,
  initialPagination,
}: {
  readonly initialSalesReturns?: AdminTypes.SalesTypes.Sales.SalesReturn[];
  readonly initialPagination?: PaginationType.Pagination;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State
  const [salesReturns, setSalesReturns] = React.useState<AdminTypes.SalesTypes.Sales.SalesReturn[]>(initialSalesReturns || []);
  const [pagination, setPagination] = React.useState<PaginationType.Pagination>(initialPagination || {
    currentPage: 1,
    totalPages: 1,
    totalItems: initialSalesReturns?.length || 0,
    itemsPerPage: 10,
    hasNext: false,
    hasPrev: false
  });
  const [showModal, setShowModal] = React.useState(false);
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [showDetailsModal, setShowDetailsModal] = React.useState(false);
  const [editingReturn, setEditingReturn] = React.useState<AdminTypes.SalesTypes.Sales.SalesReturn | null>(null);
  const [selectedReturn, setSelectedReturn] = React.useState<AdminTypes.SalesTypes.Sales.SalesReturn | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [selectedRows, setSelectedRows] = React.useState<AdminTypes.SalesTypes.Sales.SalesReturn[]>([]);
  const [downloadData, setDownloadData] = React.useState<any[]>([])
  const [clearSelectedRows, setClearSelectedRows] = React.useState(false);

  // Filters
  const {
    searchTerm,
    setSearchTerm,
    allStatusFilter,
    setAllStatusFilter,
    filteredData
  } = customHooks.useListFilters<AdminTypes.SalesTypes.Sales.SalesReturn>(
    salesReturns,
    {
      searchKeys: ["returnNumber", "invoiceNumber", "customerName", "storeName", "status", "reason"],
      statusAllSelector: (row) => row.status
    }
  );

  /* Permissions */
  const { checkPermission } = customHooks.useUserPermissions();

  // Sync state with props
  React.useEffect(() => {
    if (initialSalesReturns) setSalesReturns(initialSalesReturns);
    if (initialPagination) setPagination(initialPagination);
  }, [initialSalesReturns]);

  // Handlers (Mock logic preserved from original file, but structured cleanly)
  const handleAdd = async (data: any) => {
    setLoading(true);
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Process items from form data
    const items = (data.items && data.items.length > 0) ? data.items.map((item: any, idx: number) => ({
      id: 'tmp-' + Date.now() + '-' + idx,
      productId: item.productId || '',
      productName: item.productName || "Custom Item",
      sku: '',
      quantity: item.quantity || 1,
      unitPrice: item.unitPrice || 0,
      subtotal: (item.quantity || 1) * (item.unitPrice || 0),
      discount: 0,
      returnCharges: 0,
      total: (item.quantity || 1) * (item.unitPrice || 0)
    })) : [{
      id: 'tmp-' + Date.now(),
      productId: '',
      productName: data.productName || "Custom Item",
      sku: '',
      quantity: data.quantity || 1,
      unitPrice: data.unitPrice || 0,
      subtotal: (data.quantity || 1) * (data.unitPrice || 0),
      discount: 0,
      returnCharges: 0,
      total: (data.quantity || 1) * (data.unitPrice || 0)
    }];

    const newReturn: AdminTypes.SalesTypes.Sales.SalesReturn = {
      id: Date.now().toString(),
      returnNumber: `RTN-${Date.now()}`,
      invoiceNumber: data.invoiceNumber,
      saleId: "", // Logic to link to sale would be here
      customerId: data.customerId,
      customerName: data.customerName,
      storeId: "",
      storeName: "Main Store", // Placeholder
      returnDate: data.returnDate || new Date().toISOString().split('T')[0],
      reason: "Return Request",
      status: (data.status as any) || "Pending",
      totalReturnAmount: parseFloat(String(data.totalReturnAmount || 0)) || 0,
      returnCharges: data.returnCharges || 0,
      notes: data.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      items: items
    };

    setSalesReturns(prev => [newReturn, ...prev]);
    setLoading(false);
    setShowModal(false);
    WebComponents.UiComponents.UiWebComponents.SwalHelper.success({ text: "Return created successfully." });
  };

  const handleEdit = async (data: any) => {
    if (!editingReturn) return;
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    // Process items for edit
    const items = (data.items && data.items.length > 0) ? data.items.map((item: any, idx: number) => ({
      id: item.id || 'tmp-' + Date.now() + '-' + idx,
      productId: item.productId || '',
      productName: item.productName || "Custom Item",
      sku: '',
      quantity: item.quantity || 1,
      unitPrice: item.unitPrice || 0,
      subtotal: (item.quantity || 1) * (item.unitPrice || 0),
      discount: 0,
      returnCharges: 0,
      total: (item.quantity || 1) * (item.unitPrice || 0)
    })) : [{
      ...editingReturn.items[0],
      productName: data.productName || editingReturn.items[0]?.productName || "Custom Item",
      quantity: data.quantity || 1,
      unitPrice: data.unitPrice || 0,
      total: (data.quantity || 1) * (data.unitPrice || 0)
    }];

    const updatedReturn: AdminTypes.SalesTypes.Sales.SalesReturn = {
      ...editingReturn,
      invoiceNumber: data.invoiceNumber,
      customerId: data.customerId,
      customerName: data.customerName,
      returnDate: data.returnDate,
      status: data.status,
      totalReturnAmount: parseFloat(String(data.totalReturnAmount || 0)) || 0,
      notes: data.notes,
      updatedAt: new Date().toISOString(),
      items: items
    };

    setSalesReturns(prev => prev.map(item => item.id === updatedReturn.id ? updatedReturn : item));
    setLoading(false);
    setShowEditModal(false);
    setEditingReturn(null);
    WebComponents.UiComponents.UiWebComponents.SwalHelper.success({ text: "Return updated successfully." });
  };

  const handleDelete = React.useCallback(async (id: string) => {
    const result = await WebComponents.UiComponents.UiWebComponents.SwalHelper.delete();
    if (result.isConfirmed) {
      setSalesReturns(prev => prev.filter(item => item.id !== id));
      WebComponents.UiComponents.UiWebComponents.SwalHelper.success({ text: "Return deleted successfully." });
    }
  }, []);

  const handleEditModal = React.useCallback((item: AdminTypes.SalesTypes.Sales.SalesReturn) => {
    setEditingReturn(item);
    setShowEditModal(true);
  }, []);

  const handleViewDetails = React.useCallback((item: AdminTypes.SalesTypes.Sales.SalesReturn) => {
    setSelectedReturn(item);
    setShowDetailsModal(true);
  }, []);

  // Table Columns
  const tableColumns = React.useMemo(() => WebComponents.WebCommonComponents.CommonComponents.createColumns<AdminTypes.SalesTypes.Sales.SalesReturn>({
    fields: [
      {
        name: "Return #",
        selector: (row) => row.returnNumber,
        sortable: true
      },
      {
        name: "Invoice #",
        selector: (row) => row.invoiceNumber,
        sortable: true
      },
      {
        name: "Customer",
        selector: (row) => row.customerName,
        sortable: true
      },
      {
        name: "Store",
        selector: (row) => row.storeName,
        sortable: true
      },
      {
        name: "Date",
        selector: (row) => row.returnDate,
        cell: (row) => <span>{new Date(row.returnDate).toLocaleDateString()}</span>,
        sortable: true
      },
      {
        name: "Amount",
        selector: (row) => row.totalReturnAmount,
        cell: (row) => <span>${row.totalReturnAmount.toFixed(2)}</span>,
        sortable: true
      },
      {
        name: "Status",
        selector: (row) => row.status,
        cell: (row) => (
          <span className={`px-2 py-1 rounded text-xs font-medium ${row.status === 'Completed' || row.status === 'Approved' ? 'bg-green-100 text-green-800' :
            row.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
              row.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
            }`}>
            {row.status}
          </span>
        ),
        sortable: true
      }
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
          (checkPermission("sales.returns", "update")) && (
            <WebComponents.UiComponents.UiWebComponents.Button size="icon" variant="editaction" onClick={() => handleEditModal(row)}>
              <FaEdit className="w-4 h-4" />
            </WebComponents.UiComponents.UiWebComponents.Button>
          )
        ),
      },
      {
        render: (row) => (
          (checkPermission("sales.returns", "delete")) && (
            <WebComponents.UiComponents.UiWebComponents.Button size="icon" variant="deleteaction" onClick={() => handleDelete(row.id)}>
              <FaTrash className="w-4 h-4" />
            </WebComponents.UiComponents.UiWebComponents.Button>
          )
        ),
      },
    ],
  }), [handleViewDetails, handleEditModal, handleDelete, checkPermission]);

  // CSV and PDF export columns (Placeholder similar to SalesManagement)
  const exportColumns = React.useMemo(() => {
    return WebComponents.WebCommonComponents.CommonComponents.generateExportColumns<AdminTypes.SalesTypes.Sales.SalesReturn>([
      { key: "returnNumber", label: "Return #", accessor: (row) => row.returnNumber, pdfWidth: 20 },
      { key: "invoiceNumber", label: "Invoice #", accessor: (row) => row.invoiceNumber, pdfWidth: 20 },
      { key: "customerName", label: "Customer", accessor: (row) => row.customerName, pdfWidth: 25 },
      { key: "storeName", label: "Store", accessor: (row) => row.storeName, pdfWidth: 15 },
      { key: "totalReturnAmount", label: "Amount", accessor: (row) => row.totalReturnAmount.toFixed(2), pdfWidth: 15 },
      { key: "status", label: "Status", accessor: (row) => row.status, pdfWidth: 15 },
    ]);
  }, []);

  const downloadPdf = async (): Promise<any[]> => {
    // Mock download logic or reuse common one if endpoint existed
    setDownloadData(salesReturns); // Just use current data for now
    return salesReturns;
  };

  const clearSelectedData = () => {
    setClearSelectedRows(prev => !prev);
    setSelectedRows([]);
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
            {showModal || showEditModal ? `Sales Return Management > ${showModal ? 'Add Return' : 'Edit Return'}` : 'Sales Return Management'}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-300">Manage sales returns and refunds</p>
        </div>
        {(checkPermission("sales.returns", "create")) && (
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
            showActionSection={false}
            actionFilter=""
            activeStatusFilter=""
            selectedCount={selectedRows.length}
            showCategoryFilter={false} // No store filter for now to keep it simple unless needed
            statusFilter={allStatusFilter}
            onStatusFilterChange={setAllStatusFilter}
            statusOptions={[
              { label: 'All Status', value: 'All' },
              { label: 'Pending', value: 'Pending' },
              { label: 'Completed', value: 'Completed' },
              { label: 'Rejected', value: 'Rejected' },
            ]}
            searchTerm={searchTerm}
            onSearchTermChange={setSearchTerm}
            showSearch={true}
            renderExports={
              <>
                <WebComponents.UiComponents.UiWebComponents.DownloadCSV
                  data={downloadData}
                  columns={exportColumns.csvColumns}
                  filename={`sales-returns-${new Date().toISOString().split('T')[0]}.csv`}
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
                  >
                    <Image src={Constants.assetsIcon.assets.csv} alt="CSV" width={28} height={28} className="w-5 h-5 sm:w-6 sm:h-6 md:w-6 md:h-6 lg:w-7 lg:h-7 xl:w-7 xl:h-7 2xl:w-7 2xl:h-7" />
                  </button>
                </WebComponents.UiComponents.UiWebComponents.DownloadCSV>
                <WebComponents.UiComponents.UiWebComponents.DownloadPDF
                  data={downloadData}
                  columns={exportColumns.pdfColumns}
                  filename={`sales-returns-${new Date().toISOString().split('T')[0]}.pdf`}
                  title="Sales Return Report"
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
                  >
                    <Image src={Constants.assetsIcon.assets.pdf} alt="PDF" width={28} height={28} className="w-5 h-5 sm:w-6 sm:h-6 md:w-6 md:h-6 lg:w-7 lg:h-7 xl:w-7 xl:h-7 2xl:w-7 2xl:h-7" />
                  </button>
                </WebComponents.UiComponents.UiWebComponents.DownloadPDF>
              </>
            }
          />
          <WebComponents.WebCommonComponents.CommonComponents.DataTable
            columns={tableColumns}
            data={filteredData}
            selectableRows
            clearSelectedRows={clearSelectedRows}
            onSelectedRowsChange={({ selectedRows }: any) => setSelectedRows(selectedRows)}
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

      {/* Add / Edit Modal */}
      {(showModal || showEditModal) && (
        <WebComponents.UiComponents.UiWebComponents.AdminFormModal
          formId="sales-return-form"
          onClose={() => {
            setShowModal(false);
            setShowEditModal(false);
            setEditingReturn(null);
          }}
          loading={loading}
        >
          <WebComponents.AdminComponents.AdminWebComponents.Forms.SalesReturnForm
            onSubmit={editingReturn ? handleEdit : handleAdd}
            initialData={editingReturn || undefined}
            onClose={() => {
              setShowModal(false);
              setShowEditModal(false);
              setEditingReturn(null);
            }}
          />
        </WebComponents.UiComponents.UiWebComponents.AdminFormModal>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedReturn && (
        <WebComponents.AdminComponents.AdminWebComponents.Models.SalesReturnDetailsModal
          salesReturn={selectedReturn}
          onClose={() => setShowDetailsModal(false)}
        />
      )}
    </>
  );
}
