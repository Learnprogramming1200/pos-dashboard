"use client";
import React from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import { HiArrowLeft, HiPlus } from "react-icons/hi";
import { ServerActions } from "@/lib";
import { Constants } from "@/constant";
import { customHooks } from "@/hooks";
import { WebComponents } from "@/components";
import { PaginationType } from "@/types";
import { SalesReturn, SalesReturnFormData } from "@/types/admin/sales/sales-return";

export default function SalesReturnManagement({
  initialSalesReturns,
  initialPagination,
}: {
  readonly initialSalesReturns: SalesReturn[];
  readonly initialPagination: PaginationType.Pagination;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [salesReturns, setSalesReturns] = React.useState<SalesReturn[]>(initialSalesReturns);
  const [pagination, setPagination] = React.useState<PaginationType.Pagination>(initialPagination);
  const [showModal, setShowModal] = React.useState(false);
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [showDetailsModal, setShowDetailsModal] = React.useState(false);
  const [editingReturn, setEditingReturn] = React.useState<SalesReturn | null>(null);
  const [selectedReturn, setSelectedReturn] = React.useState<SalesReturn | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [selectedRows, setSelectedRows] = React.useState<SalesReturn[]>([]);
  const [actionFilter, setActionFilter] = React.useState<string>("All");
  const [activeStatusFilter, setActiveStatusFilter] = React.useState<string>("All");
  const [downloadData, setDownloadData] = React.useState<any[]>([]);
  const [clearSelectedRows, setClearSelectedRows] = React.useState(false);
  const { searchTerm, setSearchTerm, allStatusFilter, setAllStatusFilter, filteredData } = customHooks.useListFilters<SalesReturn>(salesReturns, {
    searchKeys: ["status"],
    statusAllSelector: (row) => row.status
  });

  const { checkPermission } = customHooks.useUserPermissions();

  // Sync state with props when URL params change (server re-fetches data)
  React.useEffect(() => {
    setSalesReturns(initialSalesReturns);
    setPagination(initialPagination);
  }, [initialSalesReturns, initialPagination]);

  // Reset action filter when no rows are selected
  React.useEffect(() => {
    if (selectedRows.length === 0) {
      setActionFilter("All");
      setActiveStatusFilter("All");
    }
  }, [selectedRows]);

  // Add
  const handleAdd = async (formData: SalesReturnFormData) => {
    await ServerActions.HandleFunction.handleAddCommon({
      formData,
      createAction: ServerActions.ServerActionslib.createSalesReturnAction,
      setLoading,
      setShowModal,
      router,
      successMessage: "Return created successfully.",
      errorMessage: "Failed to create return.",
      checkExistsError: (errorMessage) => errorMessage.toLowerCase() === "return already exists",
    });
  };

  // Edit
  const handleEdit = async (formData: SalesReturnFormData) => {
    await ServerActions.HandleFunction.handleEditCommon({
      formData,
      editingItem: editingReturn,
      getId: (item) => item._id,
      updateAction: (id: string | number, data) => ServerActions.ServerActionslib.updateSalesReturnAction(String(id), data as any),
      setLoading,
      setShowEditModal,
      setEditingItem: setEditingReturn,
      router,
      successMessage: "Return updated successfully.",
      errorMessage: "Failed to update return.",
      checkExistsError: (errorMessage) => errorMessage.toLowerCase() === "return already exists",
    });
  };

  // Delete
  const handleDelete = React.useCallback(
    async (id: string) => {
      await ServerActions.HandleFunction.handleDeleteCommon({
        id,
        deleteAction: (id: string | number) => ServerActions.ServerActionslib.deleteSalesReturnAction(String(id)),
        setLoading,
        router,
        successMessage: "The return has been deleted.",
        errorMessage: "Failed to delete return.",
      });
    },
    [router]
  );

  const handleEditModal = React.useCallback((item: SalesReturn) => {
    setEditingReturn(item);
    setShowEditModal(true);
  }, []);

  // View Details
  const handleViewDetails = React.useCallback((item: SalesReturn) => {
    setSelectedReturn(item);
    setShowDetailsModal(true);
  }, []);

  // Status Change
  const handleStatusChange = async (row: SalesReturn, newStatus: string) => {
    const targetId = String(row._id || '');
    if (!targetId || !newStatus || newStatus.toLowerCase() === row.status?.toLowerCase()) return;
    try {
      setLoading(true);
      // Map display status to API status: "Completed" -> "complete", "Pending" -> "pending"
      const apiStatus = newStatus.toLowerCase() === 'completed' ? 'complete' : newStatus.toLowerCase();
      const result = await ServerActions.ServerActionslib.changeSalesReturnStatusAction(targetId, { status: apiStatus });
      if (!result.success) {
        throw new Error(result.error || 'Failed to update sales return status');
      }
      WebComponents.UiComponents.UiWebComponents.SwalHelper.success({
        text: `Sales return status updated to ${newStatus}.`,
      });
      router.refresh();
    } catch (err: any) {
      WebComponents.UiComponents.UiWebComponents.SwalHelper.error({
        text: err?.message || 'Failed to update sales return status',
      });
    } finally {
      setLoading(false);
    }
  };

  const tableColumns = React.useMemo(() => WebComponents.WebCommonComponents.CommonComponents.createColumns<SalesReturn>({
    fields: [
      {
        name: "Return #",
        selector: (row: SalesReturn) => row._id,
        cell: (row: SalesReturn) => <span>{row._id.slice(-8).toUpperCase()}</span>,
        sortable: true
      },
      {
        name: "Invoice #",
        selector: (row: SalesReturn) => row.invoiceNumber,
        sortable: true
      },
      {
        name: "Customer",
        selector: (row: SalesReturn) => row.customerId?.customerName || row.customerId?.fullName || '-',
        cell: (row: SalesReturn) => <span>{row.customerId?.customerName || row.customerId?.fullName || '-'}</span>,
        sortable: true
      },
      {
        name: "Date",
        selector: (row: SalesReturn) => row.returnDate,
        cell: (row: SalesReturn) => <span>{new Date(row.returnDate).toLocaleDateString()}</span>,
        sortable: true
      },
      {
        name: "Amount",
        selector: (row: SalesReturn) => row.totalRefundAmount,
        cell: (row: SalesReturn) => <span>${row.totalRefundAmount?.toFixed(2) || '0.00'}</span>,
        sortable: true
      },
      {
        name: "Status",
        selector: (row: SalesReturn) => row.status,
        cell: (row: SalesReturn) => (
          <div className="flex justify-center">
            {row.status === 'complete' ? (
              <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                Completed
              </span>
            ) : (
              <WebComponents.UiComponents.UiWebComponents.StatusSelectReturn
                currentStatus={row.status === 'pending' ? 'Pending' : row.status?.charAt(0).toUpperCase() + row.status?.slice(1)}
                onStatusChange={(newStatus: string) => handleStatusChange(row, newStatus)}
              />
            )}
          </div>
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
      ...(checkPermission("sales.returns", "update") ? [{
        render: (row: any) => (
          <WebComponents.UiComponents.UiWebComponents.Button size="icon" variant="editaction" onClick={() => handleEditModal(row)}>
            <FaEdit className="w-4 h-4" />
          </WebComponents.UiComponents.UiWebComponents.Button>
        ),
      }] : []),
      ...(checkPermission("sales.returns", "delete") ? [{
        render: (row: any) => (
          <WebComponents.UiComponents.UiWebComponents.Button size="icon" variant="deleteaction" onClick={() => handleDelete(row._id)}>
            <FaTrash className="w-4 h-4" />
          </WebComponents.UiComponents.UiWebComponents.Button>
        ),
      }] : []),
    ],
  }), [handleViewDetails, handleEditModal, handleDelete, handleStatusChange, checkPermission]);

  // CSV and PDF export columns
  const exportColumns = React.useMemo(() => {
    return WebComponents.WebCommonComponents.CommonComponents.generateExportColumns<SalesReturn>([
      { key: "_id", label: "Return #", accessor: (row) => row._id.slice(-8).toUpperCase(), pdfWidth: 20 },
      { key: "invoiceNumber", label: "Invoice #", accessor: (row) => row.invoiceNumber, pdfWidth: 25 },
      { key: "customerName", label: "Customer", accessor: (row) => row.customerId?.customerName || row.customerId?.fullName || '-', pdfWidth: 25 },
      { key: "returnDate", label: "Date", accessor: (row) => new Date(row.returnDate).toLocaleDateString(), pdfWidth: 20 },
      { key: "totalRefundAmount", label: "Amount", accessor: (row) => row.totalRefundAmount?.toFixed(2) || '0.00', pdfWidth: 20 },
      { key: "status", label: "Status", accessor: (row) => row.status, pdfWidth: 15 },
    ]);
  }, []);

  // Download PDF or csv
  const downloadPdf = async (): Promise<any[]> => {
    return await ServerActions.HandleFunction.handleDownloadCommon({
      selectedRows,
      searchParams,
      bulkGetSelectedAction: ServerActions.ServerActionslib.bulkGetSelectedSalesReturnsAction,
      bulkGetAllAction: ServerActions.ServerActionslib.bulkGetSalesReturnsAction,
      setDownloadData,
    });
  };

  const clearSelectedData = () => {
    setClearSelectedRows(prev => !prev);
    setSelectedRows([]);
    router.refresh();
  };

  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
            {showModal || showEditModal ? `Sales Return Management > ${showModal ? 'Add Return' : 'Edit Return'}` : 'Sales Return Management'}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-300">Manage sales returns and refunds</p>
        </div>
        {(showModal || showEditModal || checkPermission("sales.returns", "create")) && (
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
      {/* Show filters and table only when modal is not open */}
      {!showModal && !showEditModal && (
        <>
          {/* Filters */}
          <div className="bg-white dark:bg-darkFilterbar rounded-[4px] h-full w-full mt-4 overflow-hidden">
            <WebComponents.WebCommonComponents.CommonComponents.CommonFilterBar
              showActionSection={false}
              actionFilter={actionFilter}
              onActionFilterChange={(value: string) => {
                setActionFilter(value);
                if (value !== "Status") {
                  setActiveStatusFilter("All");
                }
              }}
              activeStatusFilter={activeStatusFilter}
              onActiveStatusFilterChange={setActiveStatusFilter}
              selectedCount={selectedRows.length}
              showCategoryFilter={false}
              statusFilter={allStatusFilter}
              onStatusFilterChange={setAllStatusFilter}
              statusOptions={[
                { label: 'All Status', value: 'All' },
                { label: 'Pending', value: 'pending' },
                { label: 'Complete', value: 'complete' }
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
        </>
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
          {editingReturn ? (
            <WebComponents.AdminComponents.AdminWebComponents.Forms.SalesReturnForm
              onSubmit={handleEdit}
              initialData={editingReturn}
              onClose={() => {
                setShowModal(false);
                setShowEditModal(false);
                setEditingReturn(null);
              }}
            />
          ) : (
            <WebComponents.AdminComponents.AdminWebComponents.Forms.SalesReturnForm
              onSubmit={handleAdd}
              onClose={() => {
                setShowModal(false);
                setShowEditModal(false);
                setEditingReturn(null);
              }}
            />
          )}
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
