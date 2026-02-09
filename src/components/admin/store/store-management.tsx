"use client";
import React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { FaEdit, FaEye, FaTrash } from "react-icons/fa";
import { Plus, ArrowLeft } from "lucide-react";
import { useSession } from "next-auth/react";
import { getUserRole } from "@/lib/utils";
import "react-country-state-city/dist/react-country-state-city.css";
import { ServerActions } from "@/lib";
import { Constants } from "@/constant";
import { customHooks } from "@/hooks";
import { WebComponents } from "@/components";
import { AdminTypes, PaginationType } from "@/types";
export default function StoreManagement({
  initialStores,
  initialPagination
}: Readonly<{
  readonly initialStores: AdminTypes.storeTypes.Store[];
  readonly initialPagination: PaginationType.Pagination;
}>) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [stores, setStores] = React.useState<AdminTypes.storeTypes.Store[]>(initialStores);
  const [pagination, setPagination] = React.useState<PaginationType.Pagination>(initialPagination);
  const [loading, setLoading] = React.useState(false);
  const [showModal, setShowModal] = React.useState(false);
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [showDetailsModal, setShowDetailsModal] = React.useState(false);
  const [editingStore, setEditingStore] = React.useState<AdminTypes.storeTypes.Store | null>(null);
  const [selectedStore, setSelectedStore] = React.useState<AdminTypes.storeTypes.Store | null>(null);
  const [selectedRows, setSelectedRows] = React.useState<AdminTypes.storeTypes.Store[]>([]);
  const [actionFilter, setActionFilter] = React.useState<string>("All");
  const [activeStatusFilter, setActiveStatusFilter] = React.useState<string>("All");
  const { searchTerm, setSearchTerm, statusFilter, setStatusFilter, filteredData } = customHooks.useListFilters<AdminTypes.storeTypes.Store>(
    stores,
  )
  const [clearSelectedRows, setClearSelectedRows] = React.useState(false);
  const [downloadData, setDownloadData] = React.useState<AdminTypes.storeTypes.Store[]>([])
  const { data: session } = useSession();
  const userRole = getUserRole(session?.user);
  const [permissions, setPermissions] = React.useState<any>(null);

  React.useEffect(() => {
    if (userRole && userRole !== "superadmin" && userRole !== "admin") {
      const fetchPermissions = async () => {
        try {
          const response = await ServerActions.ServerActionslib.getRolePermissionsMeAction();
          if (response?.success && response?.data) {
            const data = response.data.data || response.data;
            setPermissions(data.tabs || {});
          }
        } catch (error) {
          console.error("Failed to fetch permissions", error);
        }
      };

      fetchPermissions();
    }
  }, [userRole]);

  const checkPermission = React.useCallback((key: string, action: string) => {
    if (userRole === "superadmin" || userRole === "admin") return true;
    if (!permissions) return false;

    const perm = permissions[key];
    if (perm) {
      if (action === 'create' && (perm.create || perm.add)) return true;
      if (action === 'update' && (perm.update || perm.edit)) return true;
      if (action === 'delete' && (perm.delete || perm.remove)) return true;
      if (action === 'read' && (perm.read || perm.view)) return true;
      return !!perm[action];
    }
    return false;
  }, [permissions, userRole]);

  // Sync state with props when URL params change (server re-fetches data)
  React.useEffect(() => {
    setStores(initialStores);
    setPagination(initialPagination);
  }, [initialStores]);

  // Reset action filter when no rows are selected
  React.useEffect(() => {
    if (selectedRows.length === 0) {
      setActionFilter('All');
      setActiveStatusFilter('All');
    }
  }, [selectedRows]);

  const clearSelectedData = () => {
    setClearSelectedRows(prev => !prev);
    setSelectedRows([]);
    router.refresh();
  }

  // Handle bulk apply actions
  const handleBulkApply = React.useCallback(async () => {
    await ServerActions.HandleFunction.handleBulkApplyCommon({
      selectedRows,
      actionFilter,
      activeStatusFilter,
      items: stores,
      setItems: setStores,
      bulkDeleteAction: ServerActions.ServerActionslib.bulkDeleteStoresAction,
      bulkUpdateStatusAction: ServerActions.ServerActionslib.bulkUpdateStoresStatusAction,
      clearSelectedData,
      idSelector: (r) => r._id || (r as any)._id,
      statusProp: 'status',
    });
  }, [selectedRows, actionFilter, activeStatusFilter, stores, clearSelectedData]);

  const handleAdd = async (formData: AdminTypes.storeTypes.storeManagementForm) => {
    const payload = {
      name: formData.name,
      description: formData.description,
      email: formData.email,
      contactNumber: formData.contactNumber,
      location: {
        address: formData.address,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        postalCode: formData.postalCode,
      },
      geoLocation: {
        type: "Point" as const,
        coordinates: [
          isNaN(parseFloat(formData.longitude))
            ? 0
            : parseFloat(formData.longitude),
          isNaN(parseFloat(formData.latitude))
            ? 0
            : parseFloat(formData.latitude),
        ] as [number, number],
      },
      status: formData.status === "Active",
    };

    await ServerActions.HandleFunction.handleAddCommon({
      formData: payload as any,
      createAction: ServerActions.ServerActionslib.createStoreAction,
      setLoading,
      setShowModal,
      router,
      successMessage: "Store added successfully.",
      errorMessage: "Failed to add store.",
    });
  };

  // Edit store
  const handleEdit = async (formData: AdminTypes.storeTypes.storeManagementForm) => {
    const payload = {
      name: formData.name,
      description: formData.description,
      email: formData.email,
      contactNumber: formData.contactNumber,
      location: {
        address: formData.address,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        postalCode: formData.postalCode,
      },
      geoLocation: {
        type: "Point" as const,
        coordinates: [
          isNaN(parseFloat(formData.longitude))
            ? 0
            : parseFloat(formData.longitude),
          isNaN(parseFloat(formData.latitude))
            ? 0
            : parseFloat(formData.latitude),
        ] as [number, number],
      },
      status: formData.status === "Active",
    };
    await ServerActions.HandleFunction.handleEditCommon({
      formData: payload as any,
      editingItem: editingStore,
      getId: (item) => (item as any).id || (item as any)._id,
      updateAction: (id: string | number, data) => {
        const storeId = String(id);
        return ServerActions.ServerActionslib.updateStoreAction(storeId, { ...data, store: storeId });
      },
      setLoading,
      setShowEditModal,
      setEditingItem: setEditingStore,
      router,
      successMessage: "Store updated successfully.",
      errorMessage: "Failed to update store.",
    });
  };

  // Delete store
  const handleDelete = async (id: string) => {
    await ServerActions.HandleFunction.handleDeleteCommon({
      id,
      deleteAction: (id: string | number) => ServerActions.ServerActionslib.deleteStoreAction(String(id)),
      setLoading,
      router,
      successMessage: "Store deleted successfully.",
      errorMessage: "Failed to delete store.",
    });
  };

  const handleEditModal = (store: AdminTypes.storeTypes.Store) => {
    setEditingStore(store);
    setShowEditModal(true);
  };
  // View Details
  const handleViewDetails = (store: AdminTypes.storeTypes.Store) => {
    setSelectedStore(store);
    setShowDetailsModal(true);
  };
  // Handle status toggle (no confirmation)
  const handleStatusToggle = async (store: AdminTypes.storeTypes.Store, newStatus: boolean) => {
    await ServerActions.HandleFunction.handleToggleStatusCommon({
      row: store,
      next: newStatus,
      getId: (row) => (row as any).id || (row as any)._id,
      preparePayload: (row, next) => {
        const storeId = (row as any).id || (row as any)._id;
        return {
          name: row.name,
          description: row.description || "",
          email: row.email,
          contactNumber: row.contactNumber,
          location: row.location,
          geoLocation: row.geoLocation,
          status: next,
          store: storeId,
        };
      },
      updateAction: (id: string | number, data) => {
        const storeId = String(id);
        return ServerActions.ServerActionslib.updateStoreAction(storeId, data);
      },
      setLoading,
      router,
      successMessage: `Status updated to ${newStatus ? "Active" : "Inactive"}.`,
      errorMessage: "Failed to update store status",
    });
  };

  // Wrapper function to convert id-based toggle to row-based toggle
  const handleToggleStatusById = React.useCallback(
    async (id: string, next: boolean) => {
      const store = stores.find(s => (s._id || (s as any)._id) === id);
      if (store) {
        await handleStatusToggle(store, next);
      }
    },
    [stores, handleStatusToggle]
  );

  const tableColumns = React.useMemo(() => WebComponents.WebCommonComponents.CommonComponents.createColumns<AdminTypes.storeTypes.Store>({
    fields: [
      {
        name: "Store Name",
        selector: (row: AdminTypes.storeTypes.Store) => row.name,
        sortable: true,
      },
      {
        name: "Location",
        selector: (row: AdminTypes.storeTypes.Store) =>
          `${row.location?.address ?? ""}${row.location?.city ? ", " + row.location.city : ""}`,
        sortable: true,
      },
      {
        name: "Email",
        selector: (row: AdminTypes.storeTypes.Store) => row.email,
        sortable: true,
      },
      {
        name: "Contact",
        selector: (row: AdminTypes.storeTypes.Store) => row.contactNumber,
        sortable: true,
      },
      {
        name: "Created Date",
        selector: (row: AdminTypes.storeTypes.Store) => {
          return row.createdAt
            ? new Date(row.createdAt).toLocaleDateString()
            : "N/A";
        },
        sortable: true,
      },
      {
        name: "Updated Date",
        selector: (row: AdminTypes.storeTypes.Store) => {
          return row.updatedAt
            ? new Date(row.updatedAt).toLocaleDateString()
            : "N/A";
        },
        sortable: true,
      },
    ],
    status: {
      idSelector: (row) => row._id || (row as any)._id || "",
      valueSelector: (row) => {
        const isActive = typeof row.status === "boolean" ? row.status : row.status === "Active";
        return isActive;
      },
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
      ...(checkPermission("store", "update") ? [{
        render: (row: any) => (
          <WebComponents.UiComponents.UiWebComponents.Button size="icon" variant="editaction" onClick={() => handleEditModal(row)}>
            <FaEdit className="w-4 h-4" />
          </WebComponents.UiComponents.UiWebComponents.Button>
        ),
      }] : []),
      ...(checkPermission("store", "delete") ? [{
        render: (row: any) => (
          <WebComponents.UiComponents.UiWebComponents.Button size="icon" variant="deleteaction" onClick={() => handleDelete(row._id || (row as any)._id || "")}>
            <FaTrash className="w-4 h-4" />
          </WebComponents.UiComponents.UiWebComponents.Button>
        ),
      }] : []),
    ],
  }), [handleToggleStatusById, handleViewDetails, handleEditModal, handleDelete, checkPermission]);

  // CSV and PDF export columns
  const exportColumns = React.useMemo(() => {
    return WebComponents.WebCommonComponents.CommonComponents.generateExportColumns<AdminTypes.storeTypes.Store>([
      {
        key: 'name',
        label: 'Store Name',
        accessor: (row) => row.name || '-',
        pdfWidth: 40
      },
      {
        key: 'location',
        label: 'Location',
        accessor: (row) => `${row.location?.address ?? ""}${row.location?.city ? ", " + row.location.city : ""}` || '-',
        pdfWidth: 50
      },
      {
        key: 'email',
        label: 'Email',
        accessor: (row) => row.email || '-',
        pdfWidth: 40
      },
      {
        key: 'contactNumber',
        label: 'Contact',
        accessor: (row) => row.contactNumber || '-',
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
        key: 'status',
        label: 'Status',
        accessor: (row) => {
          const isActive = typeof row.status === "boolean" ? row.status : row.status === "Active";
          return isActive ? 'Active' : 'Inactive';
        },
        pdfWidth: 25
      }
    ]);
  }, []);

  const downloadPdf = async (): Promise<any[]> => {
    return await ServerActions.HandleFunction.handleDownloadCommon({
      selectedRows,
      searchParams,
      bulkGetSelectedAction: ServerActions.ServerActionslib.bulkGetSelectedStoreAction,
      bulkGetAllAction: ServerActions.ServerActionslib.bulkGetStoresAction,
      setDownloadData,
    });
  };

  const bulkActionOptions = React.useMemo(() => {
    const options = Constants.commonConstants.actionOptions;
    return options.filter(option => {
      if (option.value === 'Status') {
        return checkPermission("store", "update");
      }
      if (option.value === 'Delete') {
        return checkPermission("store", "delete");
      }
      return true;
    });
  }, [checkPermission]);

  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
            {showModal || showEditModal ? `Store Management > ${showModal ? Constants.adminConstants.addStore : Constants.adminConstants.editStore}` : Constants.adminConstants.storeManagement}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-300">
            {showModal || showEditModal ? Constants.adminConstants.configureStoreDetails : Constants.adminConstants.manageStoreLocationsAndInformation}
          </p>
        </div>
        {(showModal || showEditModal || checkPermission("store", "create")) && (
          <WebComponents.UiComponents.UiWebComponents.Button
            className="bg-primary text-white hover:bg-primaryHover w-full sm:w-auto"
            onClick={() => {
              if (showModal || showEditModal) {
                setShowModal(false);
                setShowEditModal(false);
                setEditingStore(null);
              } else {
                setShowModal(true);
              }
            }}
          >
            {showModal || showEditModal ? (
              <>
                <ArrowLeft className="w-4 h-4" />
                {Constants.adminConstants.back}
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
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
              onActionFilterChange={(value: any) => {
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
              onApply={bulkActionOptions.length > 0 ? handleBulkApply : undefined}
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
                  <WebComponents.UiComponents.UiWebComponents.DownloadCSV
                    data={downloadData}
                    columns={exportColumns.csvColumns}
                    filename={`stores-${new Date().toISOString().split('T')[0]}.csv`}
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
                      disabled={stores.length === 0}
                    >
                      <Image src={Constants.assetsIcon.assets.csv} alt="CSV" width={28} height={28} className="w-5 h-5 sm:w-6 sm:h-6 md:w-6 md:h-6 lg:w-7 lg:h-7 xl:w-7 xl:h-7 2xl:w-7 2xl:h-7" />
                    </button>
                  </WebComponents.UiComponents.UiWebComponents.DownloadCSV>
                  <WebComponents.UiComponents.UiWebComponents.DownloadPDF
                    data={downloadData}
                    columns={exportColumns.pdfColumns}
                    filename={`stores-${new Date().toISOString().split('T')[0]}.pdf`}
                    title="Stores Report"
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
                      disabled={stores.length === 0}
                    >
                      <Image src={Constants.assetsIcon.assets.pdf} alt="PDF" width={28} height={28} className="w-5 h-5 sm:w-6 sm:h-6 md:w-6 md:h-6 lg:w-7 lg:h-7 xl:w-7 xl:h-7 2xl:w-7 2xl:h-7" />
                    </button>
                  </WebComponents.UiComponents.UiWebComponents.DownloadPDF>
                </>
              }
            />
            {loading ? (
              <div className="flex justify-center items-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-2 text-gray-600 dark:text-gray-300">{Constants.adminConstants.loadingStoresLabel}</span>
              </div>

            ) : (
              <WebComponents.WebCommonComponents.CommonComponents.DataTable
                columns={tableColumns}
                data={filteredData}
                selectableRows
                clearSelectedRows={clearSelectedRows}
                onSelectedRowsChange={({ selectedRows }) => setSelectedRows(selectedRows)}
                useCustomPagination={true}
                totalRecords={pagination?.totalItems}
                filteredRecords={pagination.totalItems}
                paginationPerPage={pagination.itemsPerPage}
                paginationDefaultPage={pagination.currentPage}
                paginationRowsPerPageOptions={[5, 10, 25, 50]}
              />
            )}
          </div>
          {/* Table */}
        </>
      )}

      {/* Show modal when open */}
      {(showModal || showEditModal) && (
        <WebComponents.UiComponents.UiWebComponents.AdminFormModal
          formId="store-form"
          onClose={() => {
            setShowModal(false);
            setShowEditModal(false);
            setEditingStore(null);
          }}
          loading={loading}
        >
          {editingStore ? (
            <WebComponents.AdminComponents.AdminWebComponents.Forms.StoreManagementForm
              onSubmit={handleEdit}
              store={editingStore}
            />
          ) : (
            <WebComponents.AdminComponents.AdminWebComponents.Forms.StoreManagementForm onSubmit={handleAdd} />
          )}
        </WebComponents.UiComponents.UiWebComponents.AdminFormModal>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedStore && (
        <WebComponents.AdminComponents.AdminWebComponents.Models.StoreManagementDetailsModal
          store={selectedStore}
          onClose={() => setShowDetailsModal(false)}
        />
      )}
    </>
  );
}

