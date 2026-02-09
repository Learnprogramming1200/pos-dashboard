"use client";
import React from "react";
import Image from "next/image";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import { HiArrowLeft, HiPlus } from "react-icons/hi";
import { ServerActions } from "@/lib";
import { Constants } from "@/constant";
import { customHooks } from "@/hooks";
import { CommonComponents } from "@/components/common";
import { UiWebComponents } from "@/components/ui";
import { AdminTypes, PaginationType } from "@/types";
import { WebComponents } from "@/components";

export default function SalesManagement({
  initialSales,
  initialStores,
  initialPagination,
}: {
  readonly initialSales: AdminTypes.SalesTypes.Sales.Sales[];
  readonly initialStores: any[];
  readonly initialPagination: PaginationType.Pagination;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [sales, setSales] = React.useState<AdminTypes.SalesTypes.Sales.Sales[]>(initialSales);
  const [pagination, setPagination] = React.useState<PaginationType.Pagination>(initialPagination);
  const [showModal, setShowModal] = React.useState(false);
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [showDetailsModal, setShowDetailsModal] = React.useState(false);
  const [editingSale, setEditingSale] = React.useState<AdminTypes.SalesTypes.Sales.Sales | null>(null);
  const [selectedSale, setSelectedSale] = React.useState<AdminTypes.SalesTypes.Sales.Sales | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [selectedRows, setSelectedRows] = React.useState<AdminTypes.SalesTypes.Sales.Sales[]>([]);
  const [downloadData, setDownloadData] = React.useState<any[]>([])
  const [clearSelectedRows, setClearSelectedRows] = React.useState(false);
  const { searchTerm, setSearchTerm, storeFilter, setStoreFilter, allStatusFilter, setAllStatusFilter, filteredData } = customHooks.useListFilters<AdminTypes.SalesTypes.Sales.Sales>(
    sales
  )

  /* Permissions */
  const { checkPermission } = customHooks.useUserPermissions();

  // Memoize store options
  const stores = React.useMemo(() => {
    if (!Array.isArray(initialStores)) return [];
    return initialStores.map((store: any) => ({
      id: store._id || store.id || '',
      name: store.name || '',
    })).filter(s => s.id && s.name);
  }, [initialStores]);

  // Sync state with props when URL params change (server re-fetches data)
  React.useEffect(() => {
    setSales(initialSales);
    setPagination(initialPagination);
  }, [initialSales, initialPagination]);



  //Add
  const handleAdd = async (formData: AdminTypes.SalesTypes.Sales.SalesFormData) => {
    await ServerActions.HandleFunction.handleAddCommon({
      formData,
      createAction: ServerActions.ServerActionslib.createSaleAction,
      setLoading,
      setShowModal,
      router,
      successMessage: "Sale added successfully.",
      errorMessage: "Failed to add sale.",
      checkExistsError: (errorMessage) => errorMessage.toLowerCase() === "sale already exists",
    });
  }

  // Edit
  const handleEdit = async (formData: AdminTypes.SalesTypes.Sales.SalesFormData) => {
    await ServerActions.HandleFunction.handleEditCommon({
      formData,
      editingItem: editingSale,
      getId: (item) => item._id,
      updateAction: (id: string | number, data) => ServerActions.ServerActionslib.updateSaleAction(String(id), data),
      setLoading,
      setShowEditModal,
      setEditingItem: setEditingSale,
      router,
      successMessage: "Sale updated successfully.",
      errorMessage: "Failed to update sale.",
      checkExistsError: (errorMessage) => errorMessage.toLowerCase() === "sale already exists",
    });
  };

  // Delete
  const handleDelete = React.useCallback(async (id: string) => {
    await ServerActions.HandleFunction.handleDeleteCommon({
      id,
      deleteAction: (id: string | number) => ServerActions.ServerActionslib.deleteSaleAction(String(id)),
      setLoading,
      router,
      successMessage: "Sale deleted successfully.",
      errorMessage: "Failed to delete sale.",
    });
  }, [router]);

  const handleEditModal = React.useCallback((item: AdminTypes.SalesTypes.Sales.Sales) => {
    setEditingSale(item);
    setShowEditModal(true);
  }, []);

  // View Details
  const handleViewDetails = React.useCallback((sale: AdminTypes.SalesTypes.Sales.Sales) => {
    setSelectedSale(sale);
    setShowDetailsModal(true);
  }, []);


  // Table Columns
  const tableColumns = React.useMemo(() => CommonComponents.createColumns<AdminTypes.SalesTypes.Sales.Sales>({
    fields: [
      {
        name: "Invoice Number",
        selector: (row: AdminTypes.SalesTypes.Sales.Sales) => row.invoiceNumber,
        sortable: true
      },
      {
        name: "Customer Name",
        selector: (row: AdminTypes.SalesTypes.Sales.Sales) => row.customerSnapshot?.customerName || '-',
        sortable: false
      },
      {
        name: "Store Name",
        selector: (row: AdminTypes.SalesTypes.Sales.Sales) => row.storeSnapshot?.name || '-',
        sortable: true
      },
      {
        name: "Total Items",
        selector: (row: AdminTypes.SalesTypes.Sales.Sales) => row.products?.length || 0,
        sortable: true
      },
      {
        name: "Grand Total",
        selector: (row: AdminTypes.SalesTypes.Sales.Sales) => row.billingSummary?.roundedGrandTotal || '-',
        sortable: true
      },
      {
        name: "Amount Paid",
        selector: (row: AdminTypes.SalesTypes.Sales.Sales) => row.billingSummary?.amountPaid || 0,
        sortable: true
      },
      {
        name: "Sale Date",
        selector: (row: AdminTypes.SalesTypes.Sales.Sales) => row.saleDate,
        cell: (row: AdminTypes.SalesTypes.Sales.Sales) => (
          <span>
            {row.saleDate
              ? new Date(row.saleDate).toLocaleDateString()
              : "-"}
          </span>
        ),
        sortable: true
      },
      {
        name: "Payment Status",
        selector: (row: AdminTypes.SalesTypes.Sales.Sales) => row.paymentStatus,
        cell: (row: AdminTypes.SalesTypes.Sales.Sales) => (
          <span className={`px-2 py-1 rounded text-xs font-medium ${row.paymentStatus === 'completed' ? 'bg-green-100 text-green-800' :
            row.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              'bg-gray-100 text-gray-800'
            }`}>
            {row.paymentStatus}
          </span>
        ),
        sortable: true
      },
      {
        name: "Sale Status",
        selector: (row: AdminTypes.SalesTypes.Sales.Sales) => row.saleStatus,
        cell: (row: AdminTypes.SalesTypes.Sales.Sales) => (
          <span className={`px-2 py-1 rounded text-xs font-medium ${row.saleStatus === 'completed' ? 'bg-blue-100 text-blue-800' :
            'bg-gray-100 text-gray-800'
            }`}>
            {row.saleStatus}
          </span>
        ),
        sortable: true
      }
    ],
    actions: [
      {
        render: (row) => (
          <UiWebComponents.Button size="icon" variant="viewaction" onClick={() => handleViewDetails(row)}>
            <FaEye className="w-4 h-4" />
          </UiWebComponents.Button>
        ),
      },
      {
        render: (row) => (
          (checkPermission("sales.sales", "update")) && (
            <UiWebComponents.Button size="icon" variant="editaction" onClick={() => handleEditModal(row)}>
              <FaEdit className="w-4 h-4" />
            </UiWebComponents.Button>
          )
        ),
      },
      {
        render: (row) => (
          (checkPermission("sales.sales", "delete")) && (
            <UiWebComponents.Button size="icon" variant="deleteaction" onClick={() => handleDelete(row._id)}>
              <FaTrash className="w-4 h-4" />
            </UiWebComponents.Button>
          )
        ),
      },
    ],
  }), [handleViewDetails, handleEditModal, handleDelete, checkPermission]);

  // CSV and PDF export columns
  const exportColumns = React.useMemo(() => {
    return CommonComponents.generateExportColumns<AdminTypes.SalesTypes.Sales.Sales>([
      {
        key: "invoiceNumber",
        label: "Invoice Number",
        accessor: (row) => row.invoiceNumber || '-',
        pdfWidth: 40
      },
      {
        key: "customerName",
        label: "Customer Name",
        accessor: (row) => row.customerSnapshot?.customerName || '-',
        pdfWidth: 50
      },
      {
        key: "storeName",
        label: "Store Name",
        accessor: (row) => row.storeSnapshot?.name || '-',
        pdfWidth: 25
      },
      {
        key: "totalItems",
        label: "Total Items",
        accessor: (row) => row.products?.length || 0,
        pdfWidth: 30
      },
      {
        key: "grandTotal",
        label: "Grand Total",
        accessor: (row) => row.billingSummary?.roundedGrandTotal || '-',
        pdfWidth: 20
      },
      {
        key: "amountPaid",
        label: "Amount Paid",
        accessor: (row) => row.billingSummary?.amountPaid ?? 0,
        pdfWidth: 20
      },
      {
        key: "saleDate",
        label: "Sale Date",
        accessor: (row) => row.saleDate ? new Date(row.saleDate).toLocaleDateString() : '-',
        pdfWidth: 40
      },
      {
        key: "paymentStatus",
        label: "Payment Status",
        accessor: (row) => row.paymentStatus || '-',
        pdfWidth: 25
      },
      {
        key: "saleStatus",
        label: "Sale Status",
        accessor: (row) => row.saleStatus || '-',
        pdfWidth: 25
      }
    ]);
  }, []);

  const downloadPdf = async (): Promise<any[]> => {
    return await ServerActions.HandleFunction.handleDownloadCommon({
      selectedRows,
      searchParams,
      bulkGetSelectedAction: ServerActions.ServerActionslib.bulkGetSelectedSalesAction,
      bulkGetAllAction: ServerActions.ServerActionslib.bulkGetSalesAction,
      setDownloadData,
      idSelector: (item) => item._id,
    });
  };

  const clearSelectedData = () => {
    setClearSelectedRows(prev => !prev);
    setSelectedRows([]);
    router.refresh();
  }



  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
            {showModal || showEditModal ? `${Constants.adminConstants.salesManagement} > ${showModal ? Constants.adminConstants.addSales : Constants.adminConstants.editSales}` : Constants.adminConstants.salesManagement}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-300">{Constants.adminConstants.salesManagementDescription}</p>
        </div>
        {(checkPermission("sales.sales", "create")) && (
          <UiWebComponents.Button
            variant="addBackButton"
            onClick={() => {
              if (showModal || showEditModal) {
                setShowModal(false);
                setShowEditModal(false);
                setEditingSale(null);
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
          </UiWebComponents.Button>
        )}
      </div>
      {/* Show filters and table only when modal is not open */}
      {!showModal && !showEditModal && (
        <>
          {/* Filters */}
          <div className="bg-white dark:bg-darkFilterbar rounded-[4px] h-full w-full mt-4 overflow-hidden">
            <CommonComponents.CommonFilterBar
              showActionSection={false}
              actionFilter=""
              activeStatusFilter=""
              selectedCount={selectedRows.length}
              categoryFilter={storeFilter}
              onCategoryFilterChange={setStoreFilter}
              categoryOptions={[
                { name: 'All Stores', value: 'All' },
                ...stores.map(store => ({ name: store.name, value: store.id }))
              ]}
              categoryPlaceholder="All Stores"
              showCategoryFilter={true}
              statusFilter={allStatusFilter}
              onStatusFilterChange={setAllStatusFilter}
              statusOptions={Constants.commonConstants.SalesStatusOptions}
              searchTerm={searchTerm}
              onSearchTermChange={setSearchTerm}
              showSearch={true}
              renderExports={
                <>
                  <UiWebComponents.DownloadCSV
                    data={downloadData}
                    columns={exportColumns.csvColumns}
                    filename={`sales-${new Date().toISOString().split('T')[0]}.csv`}
                    onExport={async () => {
                      const data = await downloadPdf();
                      UiWebComponents.SwalHelper.success({ text: 'CSV exported successfully.' });
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
                  </UiWebComponents.DownloadCSV>
                  <UiWebComponents.DownloadPDF
                    data={downloadData}
                    columns={exportColumns.pdfColumns}
                    filename={`sales-${new Date().toISOString().split('T')[0]}.pdf`}
                    title="Sales Report"
                    orientation="landscape"
                    onExport={async () => {
                      const data = await downloadPdf();
                      UiWebComponents.SwalHelper.success({ text: 'PDF exported successfully.' });
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
                  </UiWebComponents.DownloadPDF>
                </>
              }
            />
            <CommonComponents.DataTable
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
          formId="sales-form"
          onClose={() => {
            setShowModal(false);
            setShowEditModal(false);
            setEditingSale(null);
          }}
          loading={loading}
        >
          {editingSale ? (
            <WebComponents.AdminComponents.AdminWebComponents.Forms.SalesForm
              onSubmit={handleEdit}
              sale={editingSale}
              onCancel={() => {
                setShowEditModal(false);
                setEditingSale(null);
              }}
            />
          ) : (
            <WebComponents.AdminComponents.AdminWebComponents.Forms.SalesForm
              onSubmit={handleAdd}
              onCancel={() => setShowModal(false)}
            />
          )}
        </WebComponents.UiComponents.UiWebComponents.AdminFormModal>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedSale && (
        <WebComponents.AdminComponents.AdminWebComponents.Models.SalesDetailsModal
          sale={selectedSale}
          onClose={() => setShowDetailsModal(false)}
        />
      )}
    </>
  );
}
