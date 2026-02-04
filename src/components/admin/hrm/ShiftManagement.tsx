"use client";
import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import NextImage from 'next/image';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { HiArrowLeft, HiPlus } from "react-icons/hi";
import { ServerActions } from "@/lib";
import { Constants } from "@/constant";
import { customHooks } from "@/hooks";
import { WebComponents } from "@/components";
import { AdminTypes, PaginationType } from "@/types";

export default function ShiftManagement({
  initialShiftData,
  initialPagination,
}: {
  readonly initialShiftData: AdminTypes.hrmTypes.shiftTypes.Shift[];
  readonly initialPagination: PaginationType.Pagination;
}) {
  const [shifts, setShifts] = React.useState<AdminTypes.hrmTypes.shiftTypes.Shift[]>(initialShiftData);
  const [pagination, setPagination] = React.useState<PaginationType.Pagination>(initialPagination);
  const [loading, setLoading] = React.useState(false);
  const [showModal, setShowModal] = React.useState(false);
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [editingShift, setEditingShift] = React.useState<AdminTypes.hrmTypes.shiftTypes.Shift | null>(null);
  const [actionFilter, setActionFilter] = React.useState("All");
  const [activeStatusFilter, setActiveStatusFilter] = React.useState("All");
  const [selectedRows, setSelectedRows] = React.useState<AdminTypes.hrmTypes.shiftTypes.Shift[]>([]);
  const [clearSelectedRows, setClearSelectedRows] = React.useState(false);
  const [downloadData, setDownloadData] = React.useState<any[]>([]);
  const router = useRouter();
  const { searchTerm, setSearchTerm, statusFilter, setStatusFilter, filteredData } = customHooks.useListFilters<AdminTypes.hrmTypes.shiftTypes.Shift>(
    shifts,
    {
      statusSelector: (row) => row.status === 'Active' || (row.status as any) === true,
      searchKeys: ['title'],
    }
  );
  const { checkPermission } = customHooks.useUserPermissions();

  const searchParams = useSearchParams();
  // Sync state with props when data changes
  React.useEffect(() => {
    setShifts(initialShiftData);
    setPagination(initialPagination);
  }, [initialShiftData]);

  // Reset action filter when no rows are selected
  React.useEffect(() => {
    if (selectedRows.length === 0) {
      setActionFilter('All');
      setActiveStatusFilter('All');
    }
  }, [selectedRows]);

  // CSV and PDF export columns
  const exportColumns = React.useMemo(() => {
    return WebComponents.WebCommonComponents.CommonComponents.generateExportColumns<AdminTypes.hrmTypes.shiftTypes.Shift>([
      {
        key: 'title',
        label: Constants.adminConstants.shiftManagementStrings.shiftTitle,
        accessor: (row) => row.title || '-',
        pdfWidth: 45
      },
      {
        key: 'startTime',
        label: Constants.adminConstants.shiftManagementStrings.startTime,
        accessor: (row) => row.startTime || '-',
        pdfWidth: 35
      },
      {
        key: 'endTime',
        label: Constants.adminConstants.shiftManagementStrings.endTime,
        accessor: (row) => row.endTime || '-',
        pdfWidth: 35
      },
      {
        key: 'breakDuration',
        label: Constants.adminConstants.shiftManagementStrings.breakDuration,
        accessor: (row) => row.breakDuration ? `${row.breakDuration} mins` : '0 mins',
        pdfWidth: 35
      },
      {
        key: 'status',
        label: Constants.adminConstants.statuslabel,
        accessor: (row) => row.status ? 'Active' : 'Inactive',
        pdfWidth: 25
      }
    ]);
  }, []);

  const handleToggleStatus = React.useCallback(async (row: AdminTypes.hrmTypes.shiftTypes.Shift, next: boolean) => {
    setShifts(prev => prev.map(s => (s._id === row._id ? { ...s, status: next ? "Active" : "Inactive" } : s)));
    await ServerActions.HandleFunction.handleToggleStatusCommon({
      row,
      next,
      getId: (item) => item._id,
      preparePayload: () => ({ status: next }),
      // updateAction: (id, payload) => ServerActions.ServerActionslib.bulkUpdateShiftsStatusAction(payload as any),
      updateAction: (id: string | number, data: { status: boolean }) =>
        ServerActions.ServerActionslib.updateShiftAction(id as string, data),
      setLoading,
      router,
      successMessage: `Status updated to ${next ? 'Active' : 'Inactive'}.`,
      errorMessage: 'Failed to update status.',
      onError: () => {
        setShifts(prev => prev.map(s => (s._id === row._id ? { ...s, status: !next ? "Active" : "Inactive" } : s)));
      },
    });
  }, [router]);

  const handleToggleStatusById = React.useCallback(
    async (id: string, next: boolean) => {
      const row = shifts.find(s => s._id === id);
      if (row) {
        await handleToggleStatus(row, next);
      }
    },
    [shifts, handleToggleStatus]
  );

  const handleDelete = async (id: string) => {
    await ServerActions.HandleFunction.handleDeleteCommon({
      id,
      deleteAction: (idToDelete: string | number) => ServerActions.ServerActionslib.deleteShiftAction(idToDelete.toString()),
      setLoading,
      router,
      successMessage: 'Shift deleted successfully.',
      errorMessage: 'Failed to delete shift.',
      onSuccess: () => {
        setShifts(prev => prev.filter(s => s._id !== id));
      },
    });
  }
  const handleEditModal = React.useCallback((shift: AdminTypes.hrmTypes.shiftTypes.Shift) => {
    setEditingShift(shift);
    setShowEditModal(true);
  }, []);

  const tableColumns = React.useMemo(() => WebComponents.WebCommonComponents.CommonComponents.createColumns<AdminTypes.hrmTypes.shiftTypes.Shift>({
    fields: [
      {
        name: Constants.adminConstants.shiftManagementStrings.shiftTitle,
        selector: (row) => row.title,
        sortable: true,
        width: "25%"
      },
      {
        name: Constants.adminConstants.shiftManagementStrings.startTime,
        selector: (row) => row.startTime,
        sortable: true,
      },
      {
        name: Constants.adminConstants.shiftManagementStrings.endTime,
        selector: (row) => row.endTime,
        sortable: true,
      },
      {
        name: Constants.adminConstants.shiftManagementStrings.breakDuration,
        selector: (row) => `${row.breakDuration || 0} mins`,
        sortable: true,
      },
    ],
    status: {
      name: Constants.adminConstants.statuslabel,
      idSelector: (row) => row._id,
      valueSelector: (row) => !!row.status,
      onToggle: handleToggleStatusById,
    },
    actions: [
      ...(checkPermission("hrm.shifts", "update") ? [{
        render: (row: any) => (
          <WebComponents.UiComponents.UiWebComponents.Button size="icon" variant="editaction" onClick={() => handleEditModal(row)}>
            <FaEdit className="w-4 h-4" />
          </WebComponents.UiComponents.UiWebComponents.Button>
        ),
      }] : []),
      ...(checkPermission("hrm.shifts", "delete") ? [{
        render: (row: any) => (
          <WebComponents.UiComponents.UiWebComponents.Button size="icon" variant="deleteaction" onClick={() => handleDelete(row._id)}>
            <FaTrash className="w-4 h-4" />
          </WebComponents.UiComponents.UiWebComponents.Button>
        ),
      }] : []),
    ],
  }), [handleToggleStatusById, handleEditModal, handleDelete, checkPermission]);


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
      items: shifts,
      setItems: setShifts,
      bulkDeleteAction: ServerActions.ServerActionslib.bulkDeleteShiftsAction,
      bulkUpdateStatusAction: ServerActions.ServerActionslib.bulkUpdateShiftsStatusAction,
      clearSelectedData,
      idSelector: (r: AdminTypes.hrmTypes.shiftTypes.Shift) => r._id,
      statusProp: 'status',
    });
  }, [selectedRows, actionFilter, activeStatusFilter, shifts, clearSelectedData]);

  const downloadPdf = async (): Promise<any[]> => {
    return await ServerActions.HandleFunction.handleDownloadCommon({
      selectedRows,
      searchParams,
      bulkGetSelectedAction: ServerActions.ServerActionslib.bulkGetSelectedShiftsAction,
      bulkGetAllAction: ServerActions.ServerActionslib.bulkGetAllShiftsAction,
      setDownloadData,
    });
  };
  const handleAdd = async (formData: AdminTypes.hrmTypes.shiftTypes.ShiftFormData) => {
    await ServerActions.HandleFunction.handleAddCommon({
      formData,
      createAction: ServerActions.ServerActionslib.createShiftAction,
      setLoading,
      setShowModal,
      router,
      successMessage: 'Shift added successfully!',
      errorMessage: 'Failed to add shift.',
      onSuccess: (result) => {
        if (result?.data) {
          const shiftData = result.data?.data || result.data;
          setShifts(prev => [...prev, shiftData]);
        }
      },
    });
  };

  const handleEdit = async (formData: AdminTypes.hrmTypes.shiftTypes.ShiftFormData) => {
    await ServerActions.HandleFunction.handleEditCommon({
      formData,
      editingItem: editingShift,
      getId: (item) => item._id,
      updateAction: (id, data: any) => ServerActions.ServerActionslib.updateShiftAction(id as string, data),
      setLoading,
      setShowEditModal,
      setEditingItem: setEditingShift,
      router,
      successMessage: 'Shift updated successfully!',
      errorMessage: 'Failed to update shift.',
      onSuccess: (result) => {
        if (result?.data && editingShift) {
          const shiftData = result.data?.data || result.data;
          setShifts(prev => prev.map(s => s._id === editingShift._id ? shiftData : s));
        }
      },
    });
  };

  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-lg sm:text-lg md:text-xl lg:text-2xl font-medium text-textMain dark:text-white truncate">
            {Constants.adminConstants.shiftManagementStrings.title}
            {(() => {
              if (!showModal && !showEditModal) return "";
              const modalTitle = showModal ? Constants.adminConstants.shiftManagementStrings.addShift : Constants.adminConstants.shiftManagementStrings.editShift;
              return ` > ${modalTitle}`;
            })()}
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-textSmall pt-2">
            {Constants.adminConstants.shiftManagementStrings.description}
          </p>
        </div>
        {(showModal || showEditModal || checkPermission("hrm.shifts", "create")) && (
          <WebComponents.UiComponents.UiWebComponents.Button
            variant="addBackButton"
            onClick={() => {
              if (showModal || showEditModal) {
                setShowModal(false);
                setShowEditModal(false);
                setEditingShift(null);
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
            actionOptions={Constants.commonConstants.actionOptions}
            activeStatusFilter={activeStatusFilter}
            onActiveStatusFilterChange={setActiveStatusFilter}
            activeStatusOptions={Constants.commonConstants.activeStatusOptions}
            selectedCount={selectedRows.length}
            onApply={handleBulkApply}
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
                  filename={`shifts-${new Date().toISOString().split('T')[0]}.csv`}
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
                    disabled={shifts.length === 0}
                  >
                    <NextImage src={Constants.assetsIcon.assets.csv} alt="CSV" width={28} height={28} className="w-5 h-5 sm:w-6 sm:h-6 md:w-6 md:h-6 lg:w-7 lg:h-7 xl:w-7 xl:h-7 2xl:w-7 2xl:h-7" />
                  </button>
                </WebComponents.UiComponents.UiWebComponents.DownloadCSV>
                <WebComponents.UiComponents.UiWebComponents.DownloadPDF
                  data={downloadData}
                  columns={exportColumns.pdfColumns}
                  filename={`shifts-${new Date().toISOString().split('T')[0]}.pdf`}
                  title="Shifts Report"
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
                    disabled={shifts.length === 0}
                  >
                    <NextImage src={Constants.assetsIcon.assets.pdf} alt="PDF" width={28} height={28} className="w-5 h-5 sm:w-6 sm:h-6 md:w-6 md:h-6 lg:w-7 lg:h-7 xl:w-7 xl:h-7 2xl:w-7 2xl:h-7" />
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
            onSelectedRowsChange={({ selectedRows }) => setSelectedRows(selectedRows as AdminTypes.hrmTypes.shiftTypes.Shift[])}
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

      {/* Show modal when open */}
      {(showModal || showEditModal) && (
        editingShift ? (
          <WebComponents.AdminComponents.AdminWebComponents.Forms.ShiftForm
            onSubmit={handleEdit}
            shift={editingShift}
            title={Constants.adminConstants.shiftManagementStrings.editShift}
            onClose={() => {
              setShowModal(false);
              setShowEditModal(false);
              setEditingShift(null);
            }}
          />
        ) : (
          <WebComponents.AdminComponents.AdminWebComponents.Forms.ShiftForm
            onSubmit={handleAdd}
            title={Constants.adminConstants.shiftManagementStrings.addShift}
            onClose={() => {
              setShowModal(false);
              setShowEditModal(false);
              setEditingShift(null);
            }}
          />
        )
      )}
    </>
  );
}

