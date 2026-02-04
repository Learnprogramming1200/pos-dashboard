"use client";
import React from "react";
import Image from "next/image";
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useSession } from "next-auth/react";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import { HiArrowLeft, HiPlus } from "react-icons/hi";
import { ServerActions } from "@/lib";
import { Constants } from "@/constant";
import { customHooks } from "@/hooks";
import { WebComponents } from "@/components";
import { PaginationType, SearchParamsTypes } from "@/types";
import { AdminTypes } from "@/types";
export default function SupplierManagement({
  initialSuppliers,
  initialPagination
}: {
  readonly initialSuppliers: AdminTypes.supplierTypes.Supplier[];
  readonly initialPagination: PaginationType.Pagination;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [suppliers, setSuppliers] = React.useState<AdminTypes.supplierTypes.Supplier[]>([]);
  const [pagination, setPagination] = React.useState<PaginationType.Pagination>(initialPagination);
  const [showModal, setShowModal] = React.useState(false);
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [showDetailsModal, setShowDetailsModal] = React.useState(false);
  const [editingSupplier, setEditingSupplier] = React.useState<AdminTypes.supplierTypes.Supplier | null>(null);
  const [selectedSupplier, setSelectedSupplier] = React.useState<AdminTypes.supplierTypes.Supplier | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [selectedRows, setSelectedRows] = React.useState<AdminTypes.supplierTypes.Supplier[]>([]);
  const [actionFilter, setActionFilter] = React.useState<string>("All");
  const [activeStatusFilter, setActiveStatusFilter] = React.useState<string>("All");
  const [downloadData, setDownloadData] = React.useState([]);
  const [clearSelectedRows, setClearSelectedRows] = React.useState(false);
  const { searchTerm, setSearchTerm, statusFilter, setStatusFilter, filteredData } = customHooks.useListFilters<AdminTypes.supplierTypes.Supplier>(
    suppliers,
  );

  /* Permissions */
  const { checkPermission } = customHooks.useUserPermissions();

  const bulkActionOptions = React.useMemo(() => {
    const options = Constants.commonConstants.actionOptions;
    return options.filter(option => {
      if (option.value === 'Status') {
        return checkPermission("suppliers", "update");
      }
      if (option.value === 'Delete') {
        return checkPermission("suppliers", "delete");
      }
      return true;
    });
  }, [checkPermission]);

  // Map initial data
  React.useEffect(() => {
    setSuppliers(initialSuppliers);
    setPagination(initialPagination);
  }, [initialSuppliers]);


  // Reset action filter when no rows are selected

  React.useEffect(() => {
    if (selectedRows.length === 0) {
      setActionFilter("All");
      setActiveStatusFilter("All");
    }
  }, [selectedRows]);


  // auth
  const { data: session } = useSession();
  const userId = session?.user?.id;

  // Add
  const handleAdd = async (formData: AdminTypes.supplierTypes.SupplierFormData) => {
    await ServerActions.HandleFunction.handleAddCommon({
      formData: {
        ...formData,
        createdBy: userId,
        updatedBy: userId
      },
      createAction: ServerActions.ServerActionslib.createSupplierAction,
      setLoading,
      setShowModal,
      router,
      successMessage: "Supplier added successfully.",
      errorMessage: "Failed to add supplier.",
      checkExistsError: (errorMessage) => errorMessage.toLowerCase().includes("already exists"),
    });
  };

  // Edit
  const handleEdit = async (formData: AdminTypes.supplierTypes.SupplierFormData) => {
    await ServerActions.HandleFunction.handleEditCommon({
      formData: {
        ...formData,
        updatedBy: userId
      },
      editingItem: editingSupplier,
      getId: (item) => item.id,
      updateAction: (id: string | number, data) => ServerActions.ServerActionslib.updateSupplierAction(String(id), data),
      setLoading,
      setShowEditModal,
      setEditingItem: setEditingSupplier,
      router,
      successMessage: "Supplier updated successfully.",
      errorMessage: "Failed to update supplier.",
    });
  };

  // Delete
  const handleDelete = React.useCallback(async (id: string) => {
    await ServerActions.HandleFunction.handleDeleteCommon({
      id,
      deleteAction: (id: string | number) => ServerActions.ServerActionslib.deleteSupplierAction(String(id)),
      setLoading,
      router,
      successMessage: "Supplier deleted successfully.",
      errorMessage: "Failed to delete supplier.",
    });
  }, [router]);

  const handleEditModal = React.useCallback((supplier: AdminTypes.supplierTypes.Supplier) => {
    setEditingSupplier(supplier);
    setShowEditModal(true);
  }, []);

  // View Details
  const handleViewDetails = React.useCallback((supplier: AdminTypes.supplierTypes.Supplier) => {
    setSelectedSupplier(supplier);
    setShowDetailsModal(true);
  }, []);

  const handleToggleStatus = React.useCallback(async (row: AdminTypes.supplierTypes.Supplier, next: boolean) => {
    await ServerActions.HandleFunction.handleToggleStatusCommon({
      row,
      next,
      getId: (row) => row.id,
      preparePayload: (row, next) => next,
      updateAction: (id: string | number) => ServerActions.ServerActionslib.toggleSupplierStatusAction(String(id)),
      setLoading,
      router,
      successMessage: `Status updated to ${next ? "Active" : "Inactive"}.`,
      errorMessage: "Failed to update status.",
    });
  }, [router]);

  // Wrapper function to convert id-based toggle to row-based toggle
  const handleToggleStatusById = React.useCallback(
    async (id: string, next: boolean) => {
      const row = suppliers.find(s => s.id === id);
      if (row) {
        await handleToggleStatus(row, next);
      }
    },
    [suppliers, handleToggleStatus]
  );

  const tableColumns = React.useMemo(() => WebComponents.WebCommonComponents.CommonComponents.createColumns<AdminTypes.supplierTypes.Supplier>({
    fields: [
      {
        name: "",
        cell: (row: AdminTypes.supplierTypes.Supplier) => (
          <div className="w-10 h-10 rounded overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            {row.supplierImage ? (
              <Image src={row.supplierImage} alt={row.name} className="w-full h-full object-cover" width={40} height={40} />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">N/A</div>
            )}
          </div>
        ),
        selector: (row: AdminTypes.supplierTypes.Supplier) => row.supplierImage,
        sortable: false,
        width: "60px"
      },
      {
        name: "Supplier Name",
        selector: (row: AdminTypes.supplierTypes.Supplier) => row.name,
        sortable: true
      },
      {
        name: "Email",
        selector: (row: AdminTypes.supplierTypes.Supplier) => row.email,
        sortable: true
      },
      {
        name: "Phone No",
        selector: (row: AdminTypes.supplierTypes.Supplier) => row.phone,
        sortable: true
      },
      {
        name: "Code",
        selector: (row: AdminTypes.supplierTypes.Supplier) => row.supplierCode || "",
        sortable: true
      },
      {
        name: "City",
        selector: (row: AdminTypes.supplierTypes.Supplier) => row.address.city,
        sortable: true
      },
      {
        name: "Pincode",
        selector: (row: AdminTypes.supplierTypes.Supplier) => row.address.pincode,
        sortable: true
      },
    ],
    status: {
      idSelector: (row) => row.id,
      valueSelector: (row) => !!row.status,
      onToggle: handleToggleStatusById,
    },
    actions: [
      {
        render: (row) => (
          <WebComponents.UiWebComponents.UiWebComponents.Button size="icon" variant="viewaction" onClick={() => handleViewDetails(row)}>
            <FaEye className="w-4 h-4" />
          </WebComponents.UiWebComponents.UiWebComponents.Button>
        ),
      },
      {
        render: (row) => (
          (checkPermission("suppliers", "update")) && (
            <WebComponents.UiWebComponents.UiWebComponents.Button size="icon" variant="editaction" onClick={() => handleEditModal(row)}>
              <FaEdit className="w-4 h-4" />
            </WebComponents.UiWebComponents.UiWebComponents.Button>
          )
        ),
      },
      {
        render: (row) => (
          (checkPermission("suppliers", "delete")) && (
            <WebComponents.UiWebComponents.UiWebComponents.Button size="icon" variant="deleteaction" onClick={() => handleDelete(row.id)}>
              <FaTrash className="w-4 h-4" />
            </WebComponents.UiWebComponents.UiWebComponents.Button>
          )
        ),
      },
    ],
  }), [handleToggleStatusById, handleViewDetails, handleEditModal, handleDelete]);

  // CSV and PDF export columns
  const exportColumns = React.useMemo(() => {
    return WebComponents.WebCommonComponents.CommonComponents.generateExportColumns<AdminTypes.supplierTypes.Supplier>([
      {
        key: "name",
        label: "Supplier Name",
        accessor: (row) => row.name,
        pdfWidth: 30
      },
      {
        key: "email",
        label: "Email",
        accessor: (row) => row.email,
        pdfWidth: 30
      },
      {
        key: "phone",
        label: "Phone",
        accessor: (row) => row.phone,
        pdfWidth: 20
      },
      {
        key: "code",
        label: "Code",
        accessor: (row) => row.supplierCode || '-',
        pdfWidth: 15
      },
      {
        key: "city",
        label: "City",
        accessor: (row) => row.address.city,
        pdfWidth: 15
      },
      {
        key: "status",
        label: "Status",
        accessor: (row) => row.status ? 'Active' : 'Inactive',
        pdfWidth: 15
      }
    ]);
  }, []);

  const downloadPdf = async (): Promise<any[]> => {
    const selectedRowsIds = selectedRows.map(item => item.id);
    const isActive = searchParams.get("isActive")
    const search = searchParams.get("search")
    const filterDatas: SearchParamsTypes.DownloadSearchParams = {
      isActive: undefined,
      search: undefined
    };
    if (isActive) {
      filterDatas.isActive = isActive ? true : false
    }
    if (search) {
      filterDatas.search = search
    }
    let res;
    if (selectedRowsIds.length > 0) {
      res = await ServerActions.ServerActionslib.bulkGetSelectedSupplierAction({ ids: selectedRowsIds });
    } else {
      res = await ServerActions.ServerActionslib.bulkGetSuppliersAction(filterDatas);
    }
    const rows = Array.isArray(res?.data?.data?.data) ? res.data.data.data : (res?.data?.data || []);

    setDownloadData(rows);
    return rows;
  };

  const clearSelectedData = () => {
    setClearSelectedRows(prev => !prev);
    setSelectedRows([]);
    router.refresh();
  }

  const handleBulkApply = React.useCallback(async () => {
    const ids = selectedRows.map(r => r.id);
    if (actionFilter !== 'Status') {
      if (actionFilter === 'Delete') {
        const confirm = await WebComponents.UiWebComponents.UiWebComponents.SwalHelper.delete();
        if (!confirm.isConfirmed) return;
        try {
          const result = await ServerActions.ServerActionslib.bulkDeleteSupplierAction({ ids });
          if (!result?.success) throw new Error(result?.error || 'Failed to delete selected suppliers');
          WebComponents.UiWebComponents.UiWebComponents.SwalHelper.success({ text: 'Selected suppliers deleted.' });
          clearSelectedData();
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to delete selected suppliers.';
          WebComponents.UiWebComponents.UiWebComponents.SwalHelper.error({ text: errorMessage });
        }
      }
      return;
    }
    if (activeStatusFilter === 'All') {
      WebComponents.UiWebComponents.UiWebComponents.SwalHelper.error({ text: 'Please select a status.' });
      return;
    }
    const isActive = activeStatusFilter === 'Active';
    try {
      const result = await ServerActions.ServerActionslib.bulkUpdateSupplierStatusAction({ ids, status: isActive });
      if (!result?.success) throw new Error(result?.error || 'Failed to apply status');
      WebComponents.UiWebComponents.UiWebComponents.SwalHelper.success({ text: 'Status updated successfully.' });
      clearSelectedData();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to apply status.';
      WebComponents.UiWebComponents.UiWebComponents.SwalHelper.error({ text: errorMessage });
    }
  }, [actionFilter, activeStatusFilter, selectedRows]);

  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
            {showModal || showEditModal ? `Suppliers > ${showModal ? "Add Supplier" : "Edit Supplier"}` : "Suppliers"}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-300">
            {showModal || showEditModal ? "Configure supplier details and information" : "Manage supplier information and relationships"}
          </p>
        </div>
        {(checkPermission("suppliers", "create")) && (
          <WebComponents.UiWebComponents.UiWebComponents.Button
            variant="addBackButton"
            onClick={() => {
              if (showModal || showEditModal) {
                setShowModal(false);
                setShowEditModal(false);
                setEditingSupplier(null);
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
          </WebComponents.UiWebComponents.UiWebComponents.Button>
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
              statusOptions={Constants.commonConstants.CommonFilterOptions.CommonStatusOptions}
              searchTerm={searchTerm}
              onSearchTermChange={setSearchTerm}
              renderExports={
                <>
                  <WebComponents.UiWebComponents.UiWebComponents.DownloadCSV
                    data={downloadData}
                    columns={exportColumns.csvColumns}
                    filename={`suppliers-${new Date().toISOString().split('T')[0]}.csv`}
                    onExport={async () => {
                      const data = await downloadPdf();
                      WebComponents.UiWebComponents.UiWebComponents.SwalHelper.success({ text: 'CSV exported successfully.' });
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
                  </WebComponents.UiWebComponents.UiWebComponents.DownloadCSV>
                  <WebComponents.UiWebComponents.UiWebComponents.DownloadPDF
                    data={downloadData}
                    columns={exportColumns.pdfColumns}
                    filename={`suppliers-${new Date().toISOString().split('T')[0]}.pdf`}
                    title="Suppliers Report"
                    orientation="landscape"
                    onExport={async () => {
                      const data = await downloadPdf();
                      WebComponents.UiWebComponents.UiWebComponents.SwalHelper.success({ text: 'PDF exported successfully.' });
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
                  </WebComponents.UiWebComponents.UiWebComponents.DownloadPDF>
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
        <WebComponents.UiWebComponents.UiWebComponents.AdminFormModal
          formId="supplier-form"
          onClose={() => {
            setShowModal(false);
            setShowEditModal(false);
            setEditingSupplier(null);
          }}
          loading={loading}
        >
          <WebComponents.AdminComponents.Forms.SupplierForm
            onSubmit={showModal ? handleAdd : handleEdit}
            supplier={editingSupplier || undefined}
          />
        </WebComponents.UiWebComponents.UiWebComponents.AdminFormModal>
      )}
      {/* Details Modal */}
      {showDetailsModal && selectedSupplier && (
        <WebComponents.AdminComponents.AdminWebComponents.Models.SupplierDetailsModal
          supplier={selectedSupplier}
          onClose={() => setShowDetailsModal(false)}
        />
      )}
    </>
  );
}