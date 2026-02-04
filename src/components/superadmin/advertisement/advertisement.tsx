"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { HiArrowLeft, HiPlus } from "react-icons/hi";
import { FaEdit, FaEye, FaTrash } from "react-icons/fa";
import { ServerActions } from "@/lib";
import { Constants } from "@/constant";
import { customHooks } from "@/hooks";
import { WebComponents } from "@/components";
import { SuperAdminTypes } from "@/types";
export default function Advertisement({ initialAdvertisements,initialPagination}: {
  readonly initialAdvertisements: SuperAdminTypes.AdvertisementTypes.Advertisement[];
  readonly initialPagination: SuperAdminTypes.AdvertisementTypes.PaginationInfo;
}) {
  const [advertisements, setAdvertisements] = React.useState<SuperAdminTypes.AdvertisementTypes.Advertisement[]>(initialAdvertisements);
  const [pagination, setPagination] = React.useState<SuperAdminTypes.AdvertisementTypes.PaginationInfo>(initialPagination);
  const [loading, setLoading] = React.useState(false);
  const [showModal, setShowModal] = React.useState(false);
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [showDetailsModal, setShowDetailsModal] = React.useState(false);
  const [editingAdvertisement, setEditingAdvertisement] = React.useState<SuperAdminTypes.AdvertisementTypes.Advertisement | null>(null);
  const [selectedAdvertisement, setSelectedAdvertisement] = React.useState<SuperAdminTypes.AdvertisementTypes.Advertisement | null>(null);
  const [actionFilter, setActionFilter] = React.useState("All");
  const [activeStatusFilter, setActiveStatusFilter] = React.useState("All");
  const [selectedRows, setSelectedRows] = React.useState<SuperAdminTypes.AdvertisementTypes.Advertisement[]>([]);
  const [clearSelectedRows, setClearSelectedRows] = React.useState(false);
  const isFormOpen = showModal || showEditModal;
  const router = useRouter();
  const { searchTerm, setSearchTerm, statusFilter, setStatusFilter, filteredData } = customHooks.useListFilters<SuperAdminTypes.AdvertisementTypes.Advertisement>(
    advertisements
  );

  // Sync state with props when URL params change (server re-fetches data)
  React.useEffect(() => {
    setAdvertisements(initialAdvertisements);
    setPagination(initialPagination);
  }, [initialAdvertisements]);

  // Reset action filter when no rows are selected
  React.useEffect(() => {
    if (selectedRows.length === 0) {
      setActionFilter('All');
      setActiveStatusFilter('All');
    }
  }, [selectedRows]);

  // Handle view details
  const handleViewDetails = React.useCallback((advertisement: SuperAdminTypes.AdvertisementTypes.Advertisement) => {
    setSelectedAdvertisement(advertisement);
    setShowDetailsModal(true);
  }, []);

 
  // clear selected data
  const clearSelectedData = () => {
    setClearSelectedRows(prev => !prev);
    setSelectedRows([]);
    router.refresh();
  }

  // Add
  const handleAdd = async (formData: SuperAdminTypes.AdvertisementTypes.AdvertisementFormInput) => {
    await ServerActions.HandleFunction.handleAddCommon({
      formData,
      // Server action expects a narrower selectType union than the UI type currently allows.
      createAction: (data) => ServerActions.ServerActionslib.createAdvertisementAction(data as any),
      setLoading,
      setShowModal,
      router,
      successMessage: 'Advertisement added successfully.',
      errorMessage: 'Failed to add advertisement.',
      onSuccess: (result) => {
        if (result?.data) {
          setAdvertisements(prev => [...prev, result.data]);
        }
      },
    });
  };

  // Edit
  const handleEdit = async (formData: SuperAdminTypes.AdvertisementTypes.AdvertisementFormInput) => {
    await ServerActions.HandleFunction.handleEditCommon({
      formData,
      editingItem: editingAdvertisement,
      getId: (item) => item._id,
      // Server action expects a narrower selectType union than the UI type currently allows.
      updateAction: (id, data) => ServerActions.ServerActionslib.updateAdvertisementAction(id as string, data as any),
      setLoading,
      setShowEditModal,
      setEditingItem: setEditingAdvertisement,
      router,
      successMessage: 'Advertisement updated successfully.',
      errorMessage: 'Failed to update advertisement.',
      onSuccess: (result) => {
        if (result?.data && editingAdvertisement) {
          setAdvertisements(prev => prev.map(ad => ad._id === editingAdvertisement._id ? result.data : ad));
        }
      },
    });
  };

  // Delete
  const handleDelete = async (id: string) => {
    await ServerActions.HandleFunction.handleDeleteCommon({
      id,
      deleteAction: (id) => ServerActions.ServerActionslib.deleteAdvertisementAction(id as string),
      setLoading,
      router,
      successMessage: 'The advertisement has been deleted.',
      errorMessage: 'Failed to delete advertisement.',
      onSuccess: () => {
        setAdvertisements(prev => prev.filter(ad => ad._id !== id));
      },
    });
  };

  const handleToggleStatus = React.useCallback(async (row: SuperAdminTypes.AdvertisementTypes.Advertisement, next: boolean) => {
    setAdvertisements(prev => prev.map(ad => (ad._id === row._id ? { ...ad, status: next } : ad)));
    await ServerActions.HandleFunction.handleToggleStatusCommon({
      row,
      next,
      getId: (item) => item._id,
      preparePayload: () => ({ status: next }),
      updateAction: (id, data) => ServerActions.ServerActionslib.updateAdvertisementAction(id as string, data as any),
      setLoading,
      router,
      successMessage: `Status updated to ${next ? 'Active' : 'Inactive'}.`,
      errorMessage: 'Failed to update status.',
      onError: () => {
        setAdvertisements(prev => prev.map(ad => (ad._id === row._id ? { ...ad, status: !next } : ad)));
      },
    });
  }, [router]);

  const handleToggleStatusById = React.useCallback(async (id: string, next: boolean) => {
    const row = advertisements.find(ad => ad._id === id);
    if (row) await handleToggleStatus(row, next);
  }, [advertisements, handleToggleStatus]);

  const handleBulkAction = React.useCallback(async () => {
    await ServerActions.HandleFunction.handleBulkApplyCommon({
      selectedRows,
      actionFilter,
      activeStatusFilter,
      items: advertisements,
      setItems: setAdvertisements,
      bulkDeleteAction: ServerActions.ServerActionslib.bulkDeleteAdvertisementsAction,
      bulkUpdateStatusAction: ServerActions.ServerActionslib.bulkUpdateAdvertisementsStatusAction,
      clearSelectedData,
      idSelector: (r) => r._id,
      statusProp: 'status',
    });
  }, [selectedRows, actionFilter, activeStatusFilter, advertisements, clearSelectedData]);

  const handleEditModal = React.useCallback((advertisement: SuperAdminTypes.AdvertisementTypes.Advertisement) => {
    setEditingAdvertisement(advertisement);
    setShowEditModal(true);
  }, []);

  const tableColumns = React.useMemo(() => WebComponents.WebCommonComponents.CommonComponents.createColumns<SuperAdminTypes.AdvertisementTypes.Advertisement>({
    fields: [
      {
        name: Constants.superadminConstants.adnamelabel,
        selector: (row) => row.adName || '-',
        sortable: true,
        width: "15%",
      },
      {
        name: Constants.superadminConstants.typelabel,
        selector: (row) => row.selectType || '-',
        sortable: true,
      },
      {
        name: Constants.superadminConstants.urltypelabel,
        selector: (row) => row.urlType || '-',
        sortable: true,
      },
      {
        name: Constants.superadminConstants.placementlabel,
        selector: (row) => row.placement || '-',
        sortable: true,
      },
      {
        name: Constants.superadminConstants.positionlabel,
        selector: (row) => row.position || '-',
        sortable: true,
      },
      {
        name: Constants.superadminConstants.redirecturllabel,
        selector: (row) => row.redirectUrl || '-',
        sortable: true,
      },
      {
        name: Constants.superadminConstants.startdatelabel,
        selector: (row) => {
          try {
            return row.startDate ? new Date(row.startDate).toLocaleDateString() : '-';
          } catch {
            return '-';
          }
        },
        sortable: true,
      },
      {
        name: Constants.superadminConstants.enddatelabel,
        selector: (row) => {
          try {
            return row.endDate ? new Date(row.endDate).toLocaleDateString() : '-';
          } catch {
            return '-';
          }
        },
        sortable: true,
      },
    ],
    status: {
      name: Constants.superadminConstants.statuslabel,
      idSelector: (row) => row._id,
      valueSelector: (row) => !!row.status,
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
      {
        render: (row) => (
          <WebComponents.UiComponents.UiWebComponents.Button size="icon" variant="editaction" onClick={() => handleEditModal(row)}>
           <FaEdit className="w-4 h-4" />
          </WebComponents.UiComponents.UiWebComponents.Button>
        ),
      },
      {
        render: (row) => (
          <WebComponents.UiComponents.UiWebComponents.Button size="icon" variant="deleteaction" onClick={() => handleDelete(row._id)}>
            <FaTrash className="w-4 h-4" />
          </WebComponents.UiComponents.UiWebComponents.Button>
        ),
      },
    ],
  }), [handleToggleStatusById, handleViewDetails, handleDelete, handleEditModal]);

  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-lg sm:text-lg md:text-xl lg:text-2xl font-medium text-textMain dark:text-white truncate">
            {Constants.superadminConstants.advertisementheading}
            {(() => {
              if (!isFormOpen) return "";
              const modalTitle = showModal ? Constants.superadminConstants.addAdvertisement : Constants.superadminConstants.editAdvertisement;
              return ` > ${modalTitle}`;
            })()}
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-textSmall pt-2">
            {Constants.superadminConstants.advertisementbio}
          </p>
        </div>
        <WebComponents.UiComponents.UiWebComponents.Button
          variant="addBackButton"
          onClick={() => {
            if (isFormOpen) {
              setShowModal(false);
              setShowEditModal(false);
              setEditingAdvertisement(null);
            } else {
              setShowModal(true);
            }
          }}
          className="w-full sm:w-auto"
        >
          {isFormOpen ? <><HiArrowLeft className="w-4 h-4" /> {Constants.superadminConstants.back}</> : <><HiPlus className="w-4 h-4" /> {Constants.superadminConstants.add}</>}
        </WebComponents.UiComponents.UiWebComponents.Button>
      </div>

      {/* Show filters and table only when modal is not open */}
      {!isFormOpen && (
        <div className="bg-white dark:bg-darkFilterbar rounded-[4px] h-full w-full mt-4 overflow-hidden">
          <WebComponents.WebCommonComponents.CommonComponents.CommonFilterBar
            actionFilter={actionFilter}
            onActionFilterChange={(value: string) => {
              setActionFilter(value);
              if (value !== "Status") setActiveStatusFilter("All");
            }}
            actionOptions={Constants.commonConstants.actionOptions}
            activeStatusFilter={activeStatusFilter}
            onActiveStatusFilterChange={setActiveStatusFilter}
            activeStatusOptions={Constants.commonConstants.activeStatusOptions}
            selectedCount={selectedRows.length}
            onApply={handleBulkAction}
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
              </>
            }
          />

          {loading ? (
            <div className="flex justify-center items-center p-8 sm:p-10 md:p-12">
              <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 border-b-2 border-primary dark:border-primary"></div>
              <span className="ml-2 sm:ml-3 text-sm sm:text-base text-gray-600 dark:text-gray-300">Loading advertisements...</span>
            </div>
          ) : (
            <div className=''>
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
          )}
        </div>
      )}

      {/* Show modal when open */}
      {isFormOpen && (
        <WebComponents.UiComponents.UiWebComponents.AdminFormModal
          formId="advertisement-form"
          submitText={showEditModal ? Constants.superadminConstants.save : Constants.superadminConstants.save}
          onClose={() => {
            setShowModal(false);
            setShowEditModal(false);
            setEditingAdvertisement(null);
          }}
          loading={loading}
          loadingText={Constants.superadminConstants.saving}
          wrapInForm={false}
        >
          {editingAdvertisement ? (
            <WebComponents.SuperAdminComponents.SuperadminWebComponents.SuperAdminForms.AdvertisementForm onSubmit={handleEdit} advertisement={editingAdvertisement} />
          ) : (
            <WebComponents.SuperAdminComponents.SuperadminWebComponents.SuperAdminForms.AdvertisementForm onSubmit={handleAdd} />
          )}
        </WebComponents.UiComponents.UiWebComponents.AdminFormModal>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedAdvertisement && (
        <WebComponents.SuperAdminComponents.SuperadminWebComponents.SuperadminModels.AdvertisementDetailsModal
          advertisement={selectedAdvertisement}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedAdvertisement(null);
          }}
        />
      )}
    </>
  );

 
}
