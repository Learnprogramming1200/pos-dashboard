"use client"
import React from "react";
import { useRouter } from "next/navigation";
import { FaEdit, FaTrash } from 'react-icons/fa';
import { HiArrowLeft, HiPlus } from "react-icons/hi";
import { ServerActions } from "@/lib";
import { Constants } from "@/constant";
import { customHooks } from "@/hooks";
import { WebComponents } from "@/components";
import { AdminTypes, PaginationType } from "@/types";
import { formatFunctionsUtils } from "@/utils";

export default function LeaveTypeManagement({ initialLeaveTypePayload, initialPagination }: {
  readonly initialLeaveTypePayload: AdminTypes.hrmTypes.leaveTypes.LeaveType[],
  readonly initialPagination: PaginationType.Pagination
}) {

  // Predefined palette for distinct colors
  const pickUniqueColor = (existing: string[]): string => {
    const used = new Set((existing || []).filter(Boolean).map(c => c.toLowerCase()));
    const candidate = Constants.commonConstants.colorPalette.find(c => !used.has(c.toLowerCase()));
    if (candidate) return candidate;
    const idx = existing.length;
    const hue = (idx * 137.508) % 360;
    const sat = 70;
    const light = 48;
    return formatFunctionsUtils.hslToHex(hue, sat, light);
  };

  const [leaveTypes, setLeaveTypes] = React.useState<AdminTypes.hrmTypes.leaveTypes.LeaveType[]>(initialLeaveTypePayload);
  const [pagination, setPagination] = React.useState<PaginationType.Pagination>(initialPagination);
  const [loading, setLoading] = React.useState(false);
  const [showModal, setShowModal] = React.useState(false);
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [editingLeaveType, setEditingLeaveType] = React.useState<AdminTypes.hrmTypes.leaveTypes.LeaveType | null>(null);
  const [selectedRows, setSelectedRows] = React.useState<AdminTypes.hrmTypes.leaveTypes.LeaveType[]>([]);
  const [actionFilter, setActionFilter] = React.useState("All");
  const [activeStatusFilter, setActiveStatusFilter] = React.useState("All");
  const router = useRouter();
  const { searchTerm, setSearchTerm, statusFilter, setStatusFilter, filteredData } = customHooks.useListFilters<AdminTypes.hrmTypes.leaveTypes.LeaveType>(
    leaveTypes,
  );
  const { checkPermission } = customHooks.useUserPermissions();

  React.useEffect(() => {
    setPagination(initialPagination)
    setLeaveTypes(initialLeaveTypePayload)
  }, [initialLeaveTypePayload]);

  const handleAdd = async (formData: AdminTypes.hrmTypes.leaveTypes.LeaveTypeFormData) => {
    const existingColors = (leaveTypes || []).map((lt: any) => lt.color).filter(Boolean) as string[];
    const color = pickUniqueColor(existingColors);
    const payload = {
      name: formData.name,
      type: formData.isPaid ? 'Paid' as const : 'Unpaid' as const,
      paidCount: formData.paidCount ?? 0,
      description: formData.description ?? "",
      status: formData.status === 'Active',
      color
    };

    await ServerActions.HandleFunction.handleAddCommon({
      formData: payload,
      createAction: ServerActions.ServerActionslib.createLeaveTypeAction,
      setLoading,
      setShowModal,
      router,
      successMessage: "Leave type added successfully!",
      errorMessage: Constants.adminConstants.leaveTypeStrings.addFailed,
      onSuccess: (result) => {
        if (result?.data?.data) {
          alert(true)
          setLeaveTypes(prev => [...prev, result.data.data]);
        }
      },
    });
  };


  const handleEdit = async (formData: AdminTypes.hrmTypes.leaveTypes.LeaveTypeFormData) => {
    const payload = {
      name: formData.name,
      type: formData.isPaid ? 'Paid' as const : 'Unpaid' as const,
      paidCount: formData.paidCount ?? 0,
      description: formData.description ?? "",
      status: formData.status === 'Active',
      color: editingLeaveType?.color
    };

    await ServerActions.HandleFunction.handleEditCommon({
      formData: payload,
      editingItem: editingLeaveType,
      getId: (item) => item._id,
      updateAction: (id: string | number, data: any) =>
        ServerActions.ServerActionslib.updateLeaveTypeAction(id as string, data),
      setLoading,
      setShowEditModal,
      setEditingItem: setEditingLeaveType,
      router,
      successMessage: Constants.adminConstants.leaveTypeStrings.updatedSuccessfully,
      errorMessage: Constants.adminConstants.leaveTypeStrings.updateFailed,
      onSuccess: (result) => {
        if (result?.data?.data && editingLeaveType) {
          setLeaveTypes(prev => prev.map(lt =>
            lt._id === editingLeaveType._id ? result.data.data : lt
          ));
        }
      },
    });
  };

  const handleDelete = async (id: string) => {
    await ServerActions.HandleFunction.handleDeleteCommon({
      id,
      deleteAction: (id: string | number) =>
        ServerActions.ServerActionslib.deleteLeaveTypeAction(id as string),
      setLoading,
      router,
      successMessage: 'Leave type deleted successfully!',
      errorMessage: 'Failed to delete leave type',
      onSuccess: () => {
        setLeaveTypes(prev => prev.filter(lt => lt._id !== id));
      },
    });
  };

  const handleToggleStatus = async (row: AdminTypes.hrmTypes.leaveTypes.LeaveType, next: boolean) => {
    await ServerActions.HandleFunction.handleToggleStatusCommon({
      row,
      next,
      getId: (item: AdminTypes.hrmTypes.leaveTypes.LeaveType) => item._id,
      preparePayload: () => ({ status: next }),
      updateAction: (id: string | number, data: any) =>
        ServerActions.ServerActionslib.updateLeaveTypeAction(id as string, data).then(res => res || { success: false, error: "Operation failed" }),
      setLoading,
      router,
      successMessage: `Status updated to ${next ? 'Active' : 'Inactive'}.`,
      errorMessage: 'Failed to update status',
      onSuccess: () => {
        setLeaveTypes((prev) => prev.map((lt) =>
          (lt._id === row._id) ? {
            ...lt,
            status: next ? 'Active' : 'Inactive',
            updatedAt: new Date().toISOString()
          } : lt
        ));
      }
    });
  };
  const handleToggleStatusById = React.useCallback(
    async (id: string, next: boolean) => {
      const row = leaveTypes.find(lt => lt._id === id);
      if (row) {
        await handleToggleStatus(row, next);
      }
    },
    [leaveTypes, handleToggleStatus]
  );
  const tableColumns = React.useMemo(() => WebComponents.WebCommonComponents.CommonComponents.createColumns<AdminTypes.hrmTypes.leaveTypes.LeaveType>({
    fields: [
      {
        name: "Name",
        selector: (row: AdminTypes.hrmTypes.leaveTypes.LeaveType) => row.name,
        sortable: true,
        width: "14%",
        cell: (row: AdminTypes.hrmTypes.leaveTypes.LeaveType, index: number) => {
          const color = row.color || Constants.commonConstants.colorPalette[index % Constants.commonConstants.colorPalette.length];
          const isHex = typeof color === 'string' && /^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/.test(color);
          return (
            <div className="flex items-center gap-2 min-w-0 py-0.5">
              <span
                className="inline-block w-3.5 h-3.5 rounded-full ring-2 ring-white dark:ring-gray-900 border"
                style={{ backgroundColor: color, borderColor: isHex ? color + "33" : color }}
              />
              <span className="font-medium text-gray-900 dark:text-white truncate leading-5" title={row.name}>{row.name}</span>
            </div>
          );
        }
      },
      {
        name: "Description",
        selector: (row: AdminTypes.hrmTypes.leaveTypes.LeaveType) => row.description || "N/A",
        sortable: false,
        width: "25%",
        cell: (row: AdminTypes.hrmTypes.leaveTypes.LeaveType) => (
          <span className="text-gray-600 dark:text-gray-300 truncate block max-w-full leading-5 py-0.5" title={row.description || "N/A"}>{row.description || "N/A"}</span>
        )
      },
      {
        name: "Days",
        selector: (row: AdminTypes.hrmTypes.leaveTypes.LeaveType) => row.paidCount || 0,
        sortable: true,
        width: "12%",
        cell: (row: AdminTypes.hrmTypes.leaveTypes.LeaveType) => (
          <div className="flex justify-center">
            <span className="text-gray-700 dark:text-gray-300">{row.paidCount || '-'}</span>
          </div>
        )
      },
      {
        name: "Type",
        selector: (row: AdminTypes.hrmTypes.leaveTypes.LeaveType) => (row.type ?? (row.isPaid ? 'Paid' : 'Unpaid')) as string,
        sortable: true,
        width: "10%",
        cell: (row: AdminTypes.hrmTypes.leaveTypes.LeaveType) => {
          const raw = row.type ?? (row.isPaid ? 'Paid' : 'Unpaid');
          const isPaid = String(raw).toLowerCase() === 'paid';
          return (
            <span
              className={
                `inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ` +
                (isPaid
                  ? 'border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-300'
                  : 'border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300')
              }
            >
              {isPaid ? 'paid' : 'unpaid'}
            </span>
          );
        }
      },
      {
        name: "Created At",
        selector: (row: AdminTypes.hrmTypes.leaveTypes.LeaveType) => row.createdAt || '',
        sortable: true,
        width: "11%",
        cell: (row: AdminTypes.hrmTypes.leaveTypes.LeaveType) => {
          const createdAt = row.createdAt;
          if (!createdAt) return <span className="text-gray-500 dark:text-gray-400">-</span>;
          try {
            const date = new Date(createdAt);
            if (Number.isNaN(date.getTime())) return <span className="text-gray-500 dark:text-gray-400">-</span>;
            return (
              <span className="text-gray-700 dark:text-gray-300">
                {ServerActions.DatePretier.formatDate(date, 'dd MMM yyyy')}
              </span>
            );
          } catch {
            return <span className="text-gray-500 dark:text-gray-400">-</span>;
          }
        }
      },
    ],
    status: {
      name: "Status",
      idSelector: (row: AdminTypes.hrmTypes.leaveTypes.LeaveType) => row._id,
      valueSelector: (row: AdminTypes.hrmTypes.leaveTypes.LeaveType) => {
        return typeof row.status === 'boolean' ? row.status : row.status === 'Active';
      },
      onToggle: handleToggleStatusById
      // onToggle: (id, next) => {
      //   const row = leaveTypes.find(lt => lt.id === id);
      //   if (row) handleToggleStatus(row, next);
      //     onToggle: handleToggleStatusById
      // }
    },

    actions: [
      ...(checkPermission("hrm.leaves", "update") ? [{
        render: (row: any) => (
          <WebComponents.UiComponents.UiWebComponents.Button size="icon" variant="editaction" onClick={() => {
            setEditingLeaveType(row);
            setShowEditModal(true);
          }}>
            <FaEdit className="w-4 h-4" />
          </WebComponents.UiComponents.UiWebComponents.Button>
        )
      }] : []),
      ...(checkPermission("hrm.leaves", "delete") ? [{
        render: (row: any) => (
          <WebComponents.UiComponents.UiWebComponents.Button size="icon" variant="deleteaction" onClick={() => handleDelete(row._id)}>
            <FaTrash className="w-4 h-4" />
          </WebComponents.UiComponents.UiWebComponents.Button>
        )
      }] : [])
    ]
  }), [leaveTypes, handleToggleStatus, handleDelete, checkPermission]);

  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-[30px] gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
            {Constants.adminConstants.leaveTypeStrings.title}{showModal || showEditModal ? ` > ${showModal ? Constants.adminConstants.leaveTypeStrings.addModalTitle : Constants.adminConstants.leaveTypeStrings.editModalTitle}` : ""}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-300">
            {Constants.adminConstants.leaveTypeStrings.description}
          </p>
        </div>
        {(showModal || showEditModal || checkPermission("hrm.leaves", "create")) && (
          <WebComponents.UiComponents.UiWebComponents.Button
            className="bg-primary text-white hover:bg-primaryHover w-full sm:w-auto"
            onClick={() => {
              if (showModal || showEditModal) {
                setShowModal(false);
                setShowEditModal(false);
                setEditingLeaveType(null);
              } else {
                setEditingLeaveType(null);
                setShowModal(true);
              }
            }}
          >
            {showModal || showEditModal ? (<><HiArrowLeft className="w-4 h-4" /> {Constants.adminConstants.back}</>) : (<><HiPlus className="w-4 h-4" /> {Constants.adminConstants.add}</>)}
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
            actionOptions={Constants.commonConstants.actionOptions}
            activeStatusFilter={activeStatusFilter}
            onActiveStatusFilterChange={setActiveStatusFilter}
            activeStatusOptions={Constants.commonConstants.activeStatusOptions}
            selectedCount={selectedRows.length}
            onApply={() => { }}
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
            searchPlaceholder="Search"
            showActionSection={false}
            renderExports={<></>}
          />

          <WebComponents.WebCommonComponents.CommonComponents.DataTable
            columns={tableColumns}
            data={filteredData}
            selectableRows={false}
            onSelectedRowsChange={({ selectedRows }) => setSelectedRows(selectedRows as AdminTypes.hrmTypes.leaveTypes.LeaveType[])}
            useCustomPagination={true}
            totalRecords={pagination.totalItems}
            paginationDefaultPage={pagination.currentPage}
            filteredRecords={pagination.totalItems}
            paginationPerPage={pagination.itemsPerPage}
            paginationRowsPerPageOptions={[5, 10, 25, 50]}
            useUrlParams={true}

          />
        </div>
      )}

      {showModal && (
        <WebComponents.AdminComponents.AdminWebComponents.Forms.LeaveTypeForm
          title="Add"
          onClose={() => setShowModal(false)}
          onSubmit={handleAdd}
        />
      )}

      {showEditModal && editingLeaveType && (
        <WebComponents.AdminComponents.AdminWebComponents.Forms.LeaveTypeForm
          title="Edit"
          leaveType={editingLeaveType}
          onClose={() => {
            setShowEditModal(false);
            setEditingLeaveType(null);
          }}
          onSubmit={handleEdit}
        />
      )}
    </>
  );
}
