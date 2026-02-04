"use client";

import React from "react";
import Image from 'next/image';
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import { HiArrowLeft, HiPlus } from "react-icons/hi";
import { ServerActions } from "@/lib";
import { Constants } from "@/constant";
import { customHooks } from "@/hooks";
import { WebComponents } from "@/components";
import { AdminTypes, PaginationType } from "@/types";

export default function Unit({
  initialUnits,
  initialPagination,
}: {
  readonly initialUnits: AdminTypes.InventoryTypes.UnitTypes.UnitType[];
  readonly initialPagination: PaginationType.Pagination
}) {

  const [units, setUnits] = React.useState<AdminTypes.InventoryTypes.UnitTypes.UnitType[]>(initialUnits);
  const [pagination, setPagination] = React.useState<PaginationType.Pagination>(initialPagination);
  const [loading, setLoading] = React.useState(false);
  const [showModal, setShowModal] = React.useState(false);
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [showDetailsModal, setShowDetailsModal] = React.useState(false);
  const [editingUnit, setEditingUnit] = React.useState<AdminTypes.InventoryTypes.UnitTypes.UnitType | null>(null);
  const [selectedUnit, setSelectedUnit] = React.useState<AdminTypes.InventoryTypes.UnitTypes.UnitType | null>(null);
  const [actionFilter, setActionFilter] = React.useState("All");
  const [activeStatusFilter, setActiveStatusFilter] = React.useState("All");
  const [selectedRows, setSelectedRows] = React.useState<AdminTypes.InventoryTypes.UnitTypes.UnitType[]>([]);
  const [clearSelectedRows, setClearSelectedRows] = React.useState(false);
  const [downloadData, setDownloadData] = React.useState([])
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { searchTerm, setSearchTerm, statusFilter, setStatusFilter, filteredData } = customHooks.useListFilters<AdminTypes.InventoryTypes.UnitTypes.UnitType>(
    units,
  )
  const { checkPermission } = customHooks.useUserPermissions();

  // Sync state with props when URL params change (server re-fetches data)
  React.useEffect(() => {
    setUnits(initialUnits);
    setPagination(initialPagination);
  }, [initialUnits]);


  // Reset action filter when no rows are selected
  React.useEffect(() => {
    if (selectedRows.length === 0) {
      setActionFilter('All');
      setActiveStatusFilter('All');
    }
  }, [selectedRows]);

  // CSV and PDF export columns
  const exportColumns = React.useMemo(() => {
    return WebComponents.WebCommonComponents.CommonComponents.generateExportColumns<AdminTypes.InventoryTypes.UnitTypes.UnitType>([
      {
        key: 'unit',
        label: 'Unit',
        accessor: (row) => row.unit || '-',
        pdfWidth: 45
      },
      {
        key: 'shortName',
        label: 'Short Name',
        accessor: (row) => row.shortName || '-',
        pdfWidth: 45
      },
      {
        key: 'createdAt',
        label: 'Created On',
        accessor: (row) => row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '-',
        pdfWidth: 35
      },
      {
        key: 'updatedAt',
        label: 'Updated On',
        accessor: (row) => row.updatedAt ? new Date(row.updatedAt).toLocaleDateString() : '-',
        pdfWidth: 35
      },
      {
        key: 'status',
        label: 'Status',
        accessor: (row) => row.status ? 'Active' : 'Inactive',
        pdfWidth: 25
      }
    ]);
  }, []);

  // Add
  const handleAdd = async (formData: {
    unit: string;
    shortName: string;
    status: boolean
  }) => {
    await ServerActions.HandleFunction.handleAddCommon({
      formData,
      createAction: ServerActions.ServerActionslib.createUnitAction,
      setLoading,
      setShowModal,
      router,
      successMessage: 'Unit added successfully.',
      errorMessage: 'Failed to add unit.',
      onSuccess: (result) => {
        if (result?.data?.data) {
          setUnits(prev => [...prev, result.data.data]);
        }
      },
    });
  };

  // Edit
  const handleEdit = async (formData: {
    unit: string;
    shortName: string;
    status: boolean
  }) => {
    await ServerActions.HandleFunction.handleEditCommon({
      formData,
      editingItem: editingUnit,
      getId: (item) => item._id,
      updateAction: (id: string | number, data: typeof formData) =>
        ServerActions.ServerActionslib.updateUnitAction(id as string, data),
      setLoading,
      setShowEditModal,
      setEditingItem: setEditingUnit,
      router,
      successMessage: 'Unit updated successfully.',
      errorMessage: 'Failed to update unit.',
      onSuccess: (result) => {
        if (result?.data?.data && editingUnit) {
          setUnits(prev => prev.map(unit =>
            unit._id === editingUnit._id ? result.data.data : unit
          ));
        }
      },
    });
  };

  // Delete
  const handleDelete = React.useCallback(async (id: string) => {
    await ServerActions.HandleFunction.handleDeleteCommon({
      id,
      deleteAction: (id: string | number) =>
        ServerActions.ServerActionslib.deleteUnitAction(id as string),
      setLoading,
      router,
      successMessage: 'The unit has been deleted.',
      errorMessage: 'Failed to delete unit.',
      onSuccess: () => {
        setUnits(prev => prev.filter(unit => unit._id !== id));
      },
    });
  }, [router]);

  // View Details
  const handleViewDetails = React.useCallback((unit: AdminTypes.InventoryTypes.UnitTypes.UnitType) => {
    setSelectedUnit(unit);
    setShowDetailsModal(true);
  }, []);


  const handleToggleStatus = React.useCallback(async (row: AdminTypes.InventoryTypes.UnitTypes.UnitType, next: boolean) => {
    setUnits(prev => prev.map(unit => (unit._id === row._id ? { ...unit, status: next } : unit)));
    await ServerActions.HandleFunction.handleToggleStatusCommon({
      row,
      next,
      getId: (item) => item._id,
      preparePayload: (row) => ({
        unit: row.unit,
        shortName: row.shortName,
        status: next,
      }),
      updateAction: (id: string | number, data: any) =>
        ServerActions.ServerActionslib.updateUnitAction(id as string, data),
      setLoading,
      router,
      successMessage: `Status updated to ${next ? 'Active' : 'Inactive'}.`,
      errorMessage: 'Failed to update status.',
      onSuccess: () => {
        // The router.refresh() in handleToggleStatusCommon will update the data
        // But we can also update optimistically if needed
      },
      onError: () => {
        // Revert optimistic update on error
        setUnits(prev => prev.map(unit => (unit._id === row._id ? { ...unit, status: !next } : unit)));
      },
    });
  }, [router]);

  const handleToggleStatusById = React.useCallback(
    async (id: string, next: boolean) => {
      const row = units.find(u => u._id === id);
      if (row) {
        await handleToggleStatus(row, next);
      }
    },
    [units, handleToggleStatus]
  );

  // Open edit modal
  const handleEditModal = React.useCallback((unit: AdminTypes.InventoryTypes.UnitTypes.UnitType) => {
    setEditingUnit(unit);
    setShowEditModal(true);
  }, []);
  // clear selected data
  const clearSelectedData = () => {
    setClearSelectedRows(prev => !prev);
    setSelectedRows([]);
    router.refresh();
  }

  // Bulk apply handler (status update / delete)
  const handleBulkApply = React.useCallback(async () => {
    await ServerActions.HandleFunction.handleBulkApplyCommon({
      selectedRows,
      actionFilter,
      activeStatusFilter,
      items: units,
      setItems: setUnits,
      bulkDeleteAction: ServerActions.ServerActionslib.bulkDeleteUnitsAction,
      bulkUpdateStatusAction: ServerActions.ServerActionslib.bulkUpdateUnitStatusAction,
      clearSelectedData,
      idSelector: (r) => r._id,
    });
  }, [selectedRows, actionFilter, activeStatusFilter, units, clearSelectedData]);

  const downloadPdf = async (): Promise<any[]> => {
    return await ServerActions.HandleFunction.handleDownloadCommon({
      selectedRows,
      searchParams,
      bulkGetSelectedAction: ServerActions.ServerActionslib.bulkGetSelectedUnitAction,
      bulkGetAllAction: ServerActions.ServerActionslib.bulkGetUnitAction,
      setDownloadData,
      idSelector: (item) => item._id,
    });
  };

  const bulkActionOptions = React.useMemo(() => {
    const options = Constants.commonConstants.actionOptions;
    return options.filter(option => {
      if (option.value === 'Status') {
        return checkPermission("inventory.units", "update");
      }
      if (option.value === 'Delete') {
        return checkPermission("inventory.units", "delete");
      }
      return true;
    });
  }, [checkPermission]);

  // Table columns
  const tableColumns = React.useMemo(() => WebComponents.WebCommonComponents.CommonComponents.createColumns<AdminTypes.InventoryTypes.UnitTypes.UnitType>({
    fields: [
      {
        name: "Unit",
        selector: (row: AdminTypes.InventoryTypes.UnitTypes.UnitType) => row.unit,
        sortable: true,
        width: "15%"
      },
      {
        name: "Short Name",
        selector: (row: AdminTypes.InventoryTypes.UnitTypes.UnitType) => row.shortName,
        sortable: true,
        width: "15%"
      },
      {
        name: "Created On",
        selector: (row: AdminTypes.InventoryTypes.UnitTypes.UnitType) => {
          return row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '-';
        },
        sortable: true
      },
      {
        name: "Updated On",
        selector: (row: AdminTypes.InventoryTypes.UnitTypes.UnitType) => {
          return row.updatedAt ? new Date(row.updatedAt).toLocaleDateString() : '-';
        },
        sortable: true
      },
    ],
    status: {
      name: "Status",
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
      ...(checkPermission("inventory.units", "update") ? [{
        render: (row: any) => (
          <WebComponents.UiComponents.UiWebComponents.Button size="icon" variant="editaction" onClick={() => handleEditModal(row)}>
            <FaEdit className="w-4 h-4" />
          </WebComponents.UiComponents.UiWebComponents.Button>
        ),
      }] : []),
      ...(checkPermission("inventory.units", "delete") ? [{
        render: (row: any) => (
          <WebComponents.UiComponents.UiWebComponents.Button size="icon" variant="deleteaction" onClick={() => handleDelete(row._id)}>
            <FaTrash className="w-4 h-4" />
          </WebComponents.UiComponents.UiWebComponents.Button>
        ),
      }] : []),
    ],
  }), [handleViewDetails, handleEditModal, handleDelete, handleToggleStatusById, checkPermission]);

  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-lg sm:text-lg md:text-xl lg:text-2xl font-medium text-textMain dark:text-white truncate">
            {Constants.adminConstants.unitStrings.title}
            {(() => {
              if (!showModal && !showEditModal) return "";
              const modalTitle = showModal ? "Add Unit" : "Edit Unit";
              return ` > ${modalTitle}`;
            })()}
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-textSmall pt-2">
            {Constants.adminConstants.unitStrings.description}
          </p>
        </div>
        {(showModal || showEditModal || checkPermission("inventory.units", "create")) && (
          <WebComponents.UiComponents.UiWebComponents.Button
            variant="addBackButton"
            onClick={() => {
              if (showModal || showEditModal) {
                setShowModal(false);
                setShowEditModal(false);
                setEditingUnit(null);
              } else {
                setShowModal(true);
              }
            }}
          >
            {showModal || showEditModal ? <><HiArrowLeft className="w-4 h-4" /> {Constants.adminConstants.back}</> : <><HiPlus className="w-4 h-4" /> {Constants.adminConstants.add}</>}
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
              if (value !== 'Status') {
                setActiveStatusFilter('All');
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
            statusOptions={[
              { label: 'All Status', value: 'All' },
              { label: 'Active', value: 'Active' },
              { label: 'Inactive', value: 'Inactive' },
            ]}
            searchTerm={searchTerm}
            onSearchTermChange={setSearchTerm}
            renderExports={
              <>
                <WebComponents.UiComponents.UiWebComponents.DownloadCSV
                  data={downloadData}
                  columns={exportColumns.csvColumns}
                  filename={`units-${new Date().toISOString().split('T')[0]}.csv`}
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
                    disabled={units.length === 0}
                  >
                    <Image src={Constants.assetsIcon.assets.csv} alt="CSV" width={28} height={28} className="w-5 h-5 sm:w-6 sm:h-6 md:w-6 md:h-6 lg:w-7 lg:h-7 xl:w-7 xl:h-7 2xl:w-7 2xl:h-7" />
                  </button>
                </WebComponents.UiComponents.UiWebComponents.DownloadCSV>
                <WebComponents.UiComponents.UiWebComponents.DownloadPDF
                  data={downloadData}
                  columns={exportColumns.pdfColumns}
                  filename={`units-${new Date().toISOString().split('T')[0]}.pdf`}
                  title="Units Report"
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
                    disabled={units.length === 0}
                  >
                    <Image src={Constants.assetsIcon.assets.pdf} alt="PDF" width={28} height={28} className="w-5 h-5 sm:w-6 sm:h-6 md:w-6 md:h-6 lg:w-7 lg:h-7 xl:w-7 xl:h-7 2xl:w-7 2xl:h-7" />
                  </button>
                </WebComponents.UiComponents.UiWebComponents.DownloadPDF>
              </>
            }
          />

          <div>
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
          </div>
        </div>
      )}

      {/* Show modal when open */}
      {(showModal || showEditModal) && (
        <WebComponents.UiComponents.UiWebComponents.AdminFormModal
          formId="unit-form"
          onClose={() => {
            setShowModal(false);
            setShowEditModal(false);
            setEditingUnit(null);
          }}
          loading={loading}
        >
          {editingUnit ? (
            <WebComponents.AdminComponents.AdminWebComponents.Forms.UnitForm
              onSubmit={handleEdit}
              unit={editingUnit}
            />
          ) : (
            <WebComponents.AdminComponents.AdminWebComponents.Forms.UnitForm
              onSubmit={handleAdd}
            />
          )}
        </WebComponents.UiComponents.UiWebComponents.AdminFormModal>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedUnit && (
        <WebComponents.AdminComponents.AdminWebComponents.Models.UnitDetailsModal
          unit={selectedUnit}
          onClose={() => setShowDetailsModal(false)}
        />
      )}
    </>
  );
}
