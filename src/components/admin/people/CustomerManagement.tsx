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
import { PaginationType, SearchParamsTypes,AdminTypes } from "@/types";
// import { PeopleTypes } from "@/types/admin";

export default function CustomerManagement({
  initialCustomers,
  initialPagination,
}: {
  readonly initialCustomers: AdminTypes.customerTypes.Customer[];
  readonly initialPagination: PaginationType.Pagination;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [customers, setCustomers] = React.useState<AdminTypes.customerTypes.Customer[]>(initialCustomers);
  const [pagination, setPagination] = React.useState<PaginationType.Pagination>(initialPagination);
  const [showModal, setShowModal] = React.useState(false);
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [showDetailsModal, setShowDetailsModal] = React.useState(false);
  const [editingCustomer, setEditingCustomer] = React.useState<AdminTypes.customerTypes.Customer | null>(null);
  const [selectedCustomer, setSelectedCustomer] = React.useState<AdminTypes.customerTypes.Customer | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [selectedRows, setSelectedRows] = React.useState<AdminTypes.customerTypes.Customer[]>([]);
  const [actionFilter, setActionFilter] = React.useState("All");
  const [activeStatusFilter, setActiveStatusFilter] = React.useState("All");
  const [downloadData, setDownloadData] = React.useState<AdminTypes.customerTypes.Customer[]>([]);
  const [clearSelectedRows, setClearSelectedRows] = React.useState(false);
  const { searchTerm, setSearchTerm, statusFilter, setStatusFilter, filteredData } =
    customHooks.useListFilters<AdminTypes.customerTypes.Customer>(customers);

  /* Permissions */
  const { checkPermission } = customHooks.useUserPermissions();

  const bulkActionOptions = React.useMemo(() => {
    const options = Constants.commonConstants.actionOptions;
    return options.filter(option => {
      if (option.value === 'Status') {
        return checkPermission("people.customers", "update");
      }
      if (option.value === 'Delete') {
        return checkPermission("people.customers", "delete");
      }
      return true;
    });
  }, [checkPermission]);

  // Sync state with props when URL params change (server re-fetches data)
  React.useEffect(() => {
    setCustomers(initialCustomers);
    setPagination(initialPagination);
  }, [initialCustomers]);

  // Reset action filter when no rows are selected
  React.useEffect(() => {
    if (selectedRows.length === 0) {
      setActionFilter("All");
      setActiveStatusFilter("All");
    }
  }, [selectedRows]);

  // Add
  const handleAdd = async (formData: AdminTypes.customerTypes.CustomerFormData) => {
    await ServerActions.HandleFunction.handleAddCommon({
      formData,
      createAction: ServerActions.ServerActionslib.createCustomerAction,
      setLoading,
      setShowModal,
      router,
      successMessage: "Customer saved successfully.",
      errorMessage: "Failed to save customer.",
      checkExistsError: (errorMessage: string) => errorMessage.includes("Customer code already exists"),
    });
  };

  // Edit
  const handleEdit = async (formData: AdminTypes.customerTypes.CustomerFormData) => {
    await ServerActions.HandleFunction.handleEditCommon({
      formData,
      editingItem: editingCustomer,
      getId: (item) => item._id,
      updateAction: (id: string | number, data: any) => ServerActions.ServerActionslib.updateCustomerAction(String(id), data),
      setLoading,
      setShowEditModal,
      setEditingItem: setEditingCustomer,
      router,
      successMessage: "Customer updated successfully.",
      errorMessage: "Failed to update customer.",
      checkExistsError: (errorMessage: string) => errorMessage.includes("Customer code already exists"),
    });
  };
  // Delete
  const handleDelete = React.useCallback(
    async (id: string) => {
      await ServerActions.HandleFunction.handleDeleteCommon({
        id,
        deleteAction: (id: string | number) => ServerActions.ServerActionslib.deleteCustomerAction(String(id)),
        setLoading,
        router,
        successMessage: "The customer has been deleted.",
        errorMessage: "Failed to delete customer.",
      });
    }, [router]);

  const handleEditModal = React.useCallback((customer: AdminTypes.customerTypes.Customer) => {
    setEditingCustomer(customer);
    setShowEditModal(true);
  }, []);

  // View Details
  const handleViewDetails = React.useCallback((customer: AdminTypes.customerTypes.Customer) => {
    setSelectedCustomer(customer);
    setShowDetailsModal(true);
  }, []);

  // Handle status toggle
  const handleToggleStatus = React.useCallback(
    async (row: AdminTypes.customerTypes.Customer, next: boolean) => {
      await ServerActions.HandleFunction.handleToggleStatusCommon({
        row,
        next,
        getId: (row) => row._id,
        preparePayload: (row, next) => {
          return {
            customerName: row.customerName || row.fullName || `${row.firstName || ''} ${row.lastName || ''}`.trim(),
            gender: row.gender || "",
            phone: row.phone || "",
            email: row.email || "",
            address: row.address || "",
            isActive: next,
          };
        },
        updateAction: (id: string | number, data: any) => ServerActions.ServerActionslib.updateCustomerAction(String(id), data),
        setLoading,
        router,
        successMessage: `Status updated to ${next ? "Active" : "Inactive"}.`,
        errorMessage: "Failed to update status.",
      });
    }, [router]);

  // Wrapper function to convert id-based toggle to row-based toggle
  const handleToggleStatusById = React.useCallback(
    async (id: string, next: boolean) => {
      const row = customers.find((c) => c._id === id);
      if (row) {
        await handleToggleStatus(row, next);
      }
    }, [customers, handleToggleStatus]);

  // Table columns using CommonComponents.createColumns
  const tableColumns = React.useMemo(() => WebComponents.WebCommonComponents.CommonComponents.createColumns<AdminTypes.customerTypes.Customer>({
    fields: [
      {
        name: "Customer Code",
        selector: (row: AdminTypes.customerTypes.Customer) => row.customerCode || row.code || "",
        sortable: true,
      },
      {
        name: "Customer Name",
        selector: (row: AdminTypes.customerTypes.Customer) => (row as any).customerName || row.fullName || `${(row as any).firstName || ''} ${(row as any).lastName || ''}`.trim(),
        sortable: true,
      },
      {
        name: "Gender",
        selector: (row: AdminTypes.customerTypes.Customer) => row.gender || "-",
        sortable: true,
      },
      {
        name: "Email",
        selector: (row: AdminTypes.customerTypes.Customer) => row.email || "-",
        sortable: true,
      },
      {
        name: "Phone",
        selector: (row: AdminTypes.customerTypes.Customer) => row.phone || "-",
        sortable: true,
      },
      {
        name: "Created Date",
        selector: (row: AdminTypes.customerTypes.Customer) =>
          row.createdAt ? new Date(row.createdAt).toLocaleDateString() : 'N/A',
        sortable: true,
      },
      {
        name: "Updated Date",
        selector: (row: AdminTypes.customerTypes.Customer) =>
          row.updatedAt ? new Date(row.updatedAt).toLocaleDateString() : 'N/A',
        sortable: true,
      },
    ],
    status: {
      idSelector: (row) => row._id,
      valueSelector: (row) => !!row.isActive,
      onToggle: handleToggleStatusById,
    },
    actions: [
      {
        render: (row) => (
          <WebComponents.UiComponents.UiWebComponents.Button
            size="icon"
            variant="viewaction"
            onClick={() => handleViewDetails(row)}
          >
            <FaEye className="w-4 h-4" />
          </WebComponents.UiComponents.UiWebComponents.Button>
        ),
      },
      {
        render: (row) => (
          (checkPermission("people.customers", "update")) && (
            <WebComponents.UiComponents.UiWebComponents.Button
              size="icon"
              variant="editaction"
              onClick={() => handleEditModal(row)}
            >
              <FaEdit className="w-4 h-4" />
            </WebComponents.UiComponents.UiWebComponents.Button>
          )
        ),
      },
      {
        render: (row) => (
          (checkPermission("people.customers", "delete")) && (
            <WebComponents.UiComponents.UiWebComponents.Button
              size="icon"
              variant="deleteaction"
              onClick={() => handleDelete(row._id)}
            >
              <FaTrash className="w-4 h-4" />
            </WebComponents.UiComponents.UiWebComponents.Button>
          )
        ),
      },
    ],
  }),
    [handleToggleStatusById, handleViewDetails, handleEditModal, handleDelete]
  );

  // CSV and PDF export columns
  const exportColumns = React.useMemo(() => {
    return WebComponents.WebCommonComponents.CommonComponents.generateExportColumns<AdminTypes.customerTypes.Customer>([
      {
        key: 'customerName',
        label: 'Customer Name',
        accessor: (row) => row.customerName || row.fullName || `${row.firstName || ''} ${row.lastName || ''}`.trim() || '-',
        pdfWidth: 40
      },
      {
        key: 'gender',
        label: 'Gender',
        accessor: (row) => row.gender || '-',
        pdfWidth: 20
      },
      {
        key: 'email',
        label: 'Email',
        accessor: (row) => row.email || '-',
        pdfWidth: 40
      },
      {
        key: 'phone',
        label: 'Phone',
        accessor: (row) => row.phone || '-',
        pdfWidth: 30
      },
      {
        key: 'createdAt',
        label: 'Created Date',
        accessor: (row) => row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '-',
        pdfWidth: 35
      },
      {
        key: 'updatedAt',
        label: 'Updated Date',
        accessor: (row) => row.updatedAt ? new Date(row.updatedAt).toLocaleDateString() : '-',
        pdfWidth: 35
      },
      {
        key: 'isActive',
        label: 'Status',
        accessor: (row) => (row as any).isActive ? 'Active' : 'Inactive',
        pdfWidth: 25
      }
    ]);
  }, []);


  const downloadPdf = async (): Promise<AdminTypes.customerTypes.Customer[]> => {
    const selectedRowsIds = selectedRows
      .map(item => item._id)
      .filter((id): id is string => Boolean(id && id.trim() !== ""));
    const filterDatas: SearchParamsTypes.DownloadSearchParams = {
      isActive: undefined,
      search: undefined
    };
    let res;
    if (selectedRowsIds.length > 0) {
      res = await ServerActions.ServerActionslib.bulkGetSelectedCustomersAction({ ids: selectedRowsIds });
    } else {
      res = await ServerActions.ServerActionslib.bulkGetCustomersAction(filterDatas);
    }
    const rows = Array.isArray(res?.data?.data?.data) ? res.data.data.data : [];
    setDownloadData(rows);
    return rows;
  };

  const clearSelectedData = React.useCallback(() => {
    setClearSelectedRows((prev) => !prev);
    setSelectedRows([]);
    router.refresh();
  }, [router]);

  // Bulk apply handler (status update / delete)
  const handleBulkApply = React.useCallback(async () => {
    const ids = selectedRows.map((r) => r._id).filter((id): id is string => Boolean(id));
    if (actionFilter !== "Status") {
      if (actionFilter === "Delete") {
        const confirm = await WebComponents.UiComponents.UiWebComponents.SwalHelper.delete();
        if (!confirm.isConfirmed) return;
        try {
          const result = await ServerActions.ServerActionslib.bulkSoftDeleteCustomersAction({ ids });
          if (!result?.success) throw new Error(result?.error || "Failed to delete selected customers");
          WebComponents.UiComponents.UiWebComponents.SwalHelper.success({ text: "Selected customers deleted." });
          clearSelectedData();
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Failed to delete selected customers.";
          WebComponents.UiComponents.UiWebComponents.SwalHelper.error({ text: errorMessage });
        }
      }
      return;
    }
    if (activeStatusFilter === "All") {
      WebComponents.UiComponents.UiWebComponents.SwalHelper.error({ text: "Please select a status." });
      return;
    }
    const isActive = activeStatusFilter === "Active";
    try {
      const result = await ServerActions.ServerActionslib.bulkUpdateCustomersStatusAction({ ids, isActive });
      if (!result?.success) throw new Error(result?.error || "Failed to apply status");
      WebComponents.UiComponents.UiWebComponents.SwalHelper.success({ text: "Status updated successfully." });
      clearSelectedData();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to apply status.";
      WebComponents.UiComponents.UiWebComponents.SwalHelper.error({ text: errorMessage });
    }
  }, [actionFilter, activeStatusFilter, selectedRows]);

  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
            {showModal || showEditModal ? `Customers > ${showModal ? "Add Customer" : "Edit Customer"}` : "Customers"}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-300">
            {showModal || showEditModal ? Constants.adminConstants.configureCustomerDetailsAndInformation : Constants.adminConstants.manageCustomerInformationAndRelationships}
          </p>
        </div>
        {(checkPermission("people.customers", "create")) && (
          <WebComponents.UiComponents.UiWebComponents.Button
            variant="addBackButton"
            onClick={() => {
              if (showModal || showEditModal) {
                setShowModal(false);
                setShowEditModal(false);
                setEditingCustomer(null);
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
              actionFilter={actionFilter}
              onActionFilterChange={(value: string) => {
                setActionFilter(value);
                if (value !== "Status") {
                  setActiveStatusFilter("All");
                }
              }}
              actionOptions={bulkActionOptions}
              activeStatusFilter={activeStatusFilter}
              onActiveStatusFilterChange={setActiveStatusFilter}
              activeStatusOptions={Constants.commonConstants.activeStatusOptions}
              selectedCount={selectedRows.length}
              onApply={handleBulkApply}
              categoryFilter="All"
              onCategoryFilterChange={() => { }}
              categoryOptions={[]}
              showCategoryFilter={false}
              statusFilter={statusFilter}
              onStatusFilterChange={(value: string) => {
                const validValue = value === "Active" || value === "Inactive" ? value : "All";
                setStatusFilter(validValue);
              }}
              statusOptions={
                Constants.commonConstants.CommonFilterOptions.CommonStatusOptions
              }
              searchTerm={searchTerm}
              onSearchTermChange={setSearchTerm}
              renderExports={
                <>
                  <WebComponents.UiComponents.UiWebComponents.DownloadCSV
                    data={downloadData}
                    columns={exportColumns.csvColumns}
                    filename={`customers-${new Date().toISOString().split('T')[0]}.csv`}
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
                    >
                      <Image src={Constants.assetsIcon.assets.csv} alt="CSV" width={28} height={28} className="w-5 h-5 sm:w-6 sm:h-6 md:w-6 md:h-6 lg:w-7 lg:h-7 xl:w-7 xl:h-7 2xl:w-7 2xl:h-7" />
                    </button>
                  </WebComponents.UiComponents.UiWebComponents.DownloadCSV>
                  <WebComponents.UiComponents.UiWebComponents.DownloadPDF
                    data={downloadData}
                    columns={exportColumns.pdfColumns}
                    filename={`customers-${new Date().toISOString().split('T')[0]}.pdf`}
                    title="Customers Report"
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
              totalRecords={pagination.totalItems || customers.length}
              filteredRecords={pagination.totalItems || filteredData.length}
              paginationPerPage={pagination.itemsPerPage || 10}
              paginationDefaultPage={pagination.currentPage || 1}
              paginationRowsPerPageOptions={[5, 10, 25, 50]}
              useUrlParams={true}
            />
          </div>
        </>
      )}

      {/* Add / Edit Modal */}
      {(showModal || showEditModal) && (
        <WebComponents.UiComponents.UiWebComponents.AdminFormModal
          formId="customer-form"
          onClose={() => {
            setShowModal(false);
            setShowEditModal(false);
            setEditingCustomer(null);
          }}
          loading={loading}
        >
          {editingCustomer ? (
            <WebComponents.AdminComponents.AdminWebComponents.Forms.CustomerForm
              onSubmit={handleEdit}
              customer={editingCustomer}
            />
          ) : (
            <WebComponents.AdminComponents.AdminWebComponents.Forms.CustomerForm
              onSubmit={handleAdd}
              existingCustomers={customers}
            />
          )}
        </WebComponents.UiComponents.UiWebComponents.AdminFormModal>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedCustomer && (
        <WebComponents.AdminComponents.AdminWebComponents.Models.CustomerDetailsModal
          customer={selectedCustomer}
          onClose={() => setShowDetailsModal(false)}
        />
      )}
    </>
  );

}
