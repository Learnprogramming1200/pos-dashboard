"use client";
import React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Image from "next/image";
import { FaTrash, FaEdit, FaUser } from "react-icons/fa";
import { HiArrowLeft, HiPlus } from "react-icons/hi";
import { ServerActions } from "@/lib";
import { Constants } from "@/constant";
import { customHooks } from "@/hooks";
import { WebComponents } from "@/components";
import { AdminTypes, PaginationType } from "@/types";

export default function StaffManagement({
  initialStaffPayload,
  initialStoresPayload,
  initialPagination,
}: {
  readonly initialStaffPayload: AdminTypes.hrmTypes.staffTypes.Staff[];
  readonly initialStoresPayload: AdminTypes.hrmTypes.staffTypes.StoreOption[];
  readonly initialPagination: PaginationType.Pagination;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [staff, setStaff] = React.useState<AdminTypes.hrmTypes.staffTypes.Staff[]>(initialStaffPayload);
  const [stores, setStores] = React.useState<AdminTypes.hrmTypes.staffTypes.StoreOption[]>(initialStoresPayload);
  const [pagination, setPagination] = React.useState<PaginationType.Pagination>(initialPagination);
  const [loading, setLoading] = React.useState(false);
  const [showModal, setShowModal] = React.useState(false);
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [editingStaff, setEditingStaff] = React.useState<AdminTypes.hrmTypes.staffTypes.Staff | null>(null);
  const [actionFilter, setActionFilter] = React.useState("All");
  const [activeStatusFilter, setActiveStatusFilter] = React.useState("All");
  const [selectedRows, setSelectedRows] = React.useState<AdminTypes.hrmTypes.staffTypes.Staff[]>([]);
  const [clearSelectedRows, setClearSelectedRows] = React.useState(false);
  const [downloadData, setDownloadData] = React.useState([]);
  // const [designationFilter, setDesignationFilter] = React.useState("All");
  const { searchTerm, setSearchTerm, storeFilter, setStoreFilter, statusFilter, setStatusFilter, designationFilter, setDesignationFilter, filteredData } = customHooks.useListFilters<AdminTypes.hrmTypes.staffTypes.Staff>(
    staff,
  );
  const { checkPermission } = customHooks.useUserPermissions();

  React.useEffect(() => {
    setStaff(initialStaffPayload);
    setStores(initialStoresPayload);
    setPagination(initialPagination);
  }, [initialStaffPayload, initialStoresPayload]);

  React.useEffect(() => {
    if (selectedRows.length === 0) {
      setActionFilter('All');
      setActiveStatusFilter('All');
    }
  }, [selectedRows]);

  const exportColumns = React.useMemo(() => {
    return WebComponents.WebCommonComponents.CommonComponents.generateExportColumns<AdminTypes.hrmTypes.staffTypes.Staff>([
      { key: 'name', label: 'Name', accessor: (row) => row.user?.name || '-', pdfWidth: 40 },
      { key: 'email', label: 'Email', accessor: (row) => row.user?.email || '-', pdfWidth: 50 },
      { key: 'phone', label: 'Phone', accessor: (row) => row.user?.phone || '-', pdfWidth: 35 },
      { key: 'designation', label: 'Designation', accessor: (row) => row.designation || '-', pdfWidth: 35 },
      { key: 'storeName', label: 'Store', accessor: (row) => row.store?.name || '-', pdfWidth: 35 },
      { key: 'status', label: 'Status', accessor: (row) => row.isActive ? 'Active' : 'Inactive', pdfWidth: 25 }
    ]);
  }, []);

  const handleAdd = async (formData: AdminTypes.hrmTypes.staffTypes.StaffFormData) => {
    await ServerActions.HandleFunction.handleAddCommon({
      formData,
      createAction: ServerActions.ServerActionslib.createEmployeeAction,
      setLoading,
      setShowModal,
      router,
      successMessage: 'Staff member added successfully!',
      errorMessage: 'Failed to add staff.',
      onSuccess: (result) => {
        if (result?.data) {
          setStaff(prev => [...prev, result.data]);
        }
      },
    });
  };

  const handleEdit = async (formData: AdminTypes.hrmTypes.staffTypes.StaffFormData) => {
    await ServerActions.HandleFunction.handleEditCommon({
      formData,
      editingItem: editingStaff,
      getId: (item) => item._id,
      updateAction: (id, data) => ServerActions.ServerActionslib.updateEmployeeAction(id as string, data),
      setLoading,
      setShowEditModal,
      setEditingItem: setEditingStaff,
      router,
      successMessage: 'Staff member updated successfully!',
      errorMessage: 'Failed to update staff.',
      onSuccess: (result) => {
        if (result?.data && editingStaff) {
          setStaff(prev => prev.map(s => s._id === editingStaff._id ? result.data : s));
        }
      },
    });
  };

  const handleToggleStatus = React.useCallback(async (row: AdminTypes.hrmTypes.staffTypes.Staff, next: boolean) => {
    setStaff(prev => prev.map(s => (s._id === row._id ? { ...s, isActive: next } : s)));
    await ServerActions.HandleFunction.handleToggleStatusCommon({
      row,
      next,
      getId: (item) => item._id,
      preparePayload: () => next,
      updateAction: (id, nextStatus) => ServerActions.ServerActionslib.updateEmployeeStatusAction(id as string, nextStatus as boolean),
      setLoading,
      router,
      successMessage: `Status updated to ${next ? 'Active' : 'Inactive'}.`,
      errorMessage: 'Failed to update status.',
      onError: () => {
        setStaff(prev => prev.map(s => (s._id === row._id ? { ...s, isActive: !next } : s)));
      },
    });
  }, [router]);

  const handleToggleStatusById = React.useCallback(async (id: string | number, next: boolean) => {
    const row = staff.find(s => s._id === id.toString());
    if (row) await handleToggleStatus(row, next);
  }, [staff, handleToggleStatus]);

  const handleDelete = async (id: string) => {
    await ServerActions.HandleFunction.handleDeleteCommon({
      id,
      deleteAction: (idToDelete: string | number) => ServerActions.ServerActionslib.deleteEmployeeAction(idToDelete.toString()),
      setLoading,
      router,
      successMessage: 'Staff member deleted successfully.',
      errorMessage: 'Failed to delete staff.',
      onSuccess: () => {
        setStaff(prev => prev.filter(s => s._id !== id));
      },
    });
  };

  const handleEditModal = (staff: AdminTypes.hrmTypes.staffTypes.Staff) => {
    setEditingStaff(staff);
    setShowEditModal(true);
  };

  const clearSelectedData = () => {
    setClearSelectedRows(prev => !prev);
    setSelectedRows([]);
    router.refresh()
  };

  // Bulk apply handler (status update / delete)
  const handleBulkApply = React.useCallback(async () => {
    await ServerActions.HandleFunction.handleBulkApplyCommon({
      selectedRows,
      actionFilter,
      activeStatusFilter,
      items: staff,
      setItems: setStaff,
      bulkDeleteAction: ServerActions.ServerActionslib.bulkDeleteEmployeesAction,
      bulkUpdateStatusAction: ServerActions.ServerActionslib.bulkUpdateEmployeesStatusAction,
      clearSelectedData,
      idSelector: (r: AdminTypes.hrmTypes.staffTypes.Staff) => r._id,
      statusProp: 'isActive',
    });
  }, [selectedRows, actionFilter, activeStatusFilter, staff, clearSelectedData]);

  const downloadPdf = async (): Promise<any[]> => {
    return await ServerActions.HandleFunction.handleDownloadCommon({
      selectedRows,
      searchParams,
      bulkGetSelectedAction: ServerActions.ServerActionslib.bulkGetSelectedEmployeesAction,
      bulkGetAllAction: ServerActions.ServerActionslib.bulkGetEmployeesAction,
      setDownloadData,
    });
  };

  const tableColumns = React.useMemo(() => WebComponents.WebCommonComponents.CommonComponents.createColumns<AdminTypes.hrmTypes.staffTypes.Staff>({
    fields: [
      {
        name: "",
        selector: (row) => row.user?.profilePicture,
        cell: (row: AdminTypes.hrmTypes.staffTypes.Staff) => (
          <div className="flex items-center justify-center">
            <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
              {row.user?.profilePicture ? <Image src={row.user?.profilePicture} alt={row?.user.name} className="w-full h-full object-cover" width={32} height={32} /> : <FaUser className="w-4 h-4 text-gray-500" />}
            </div>
          </div>
        ),
        width: "4%"
      },
      { name: "Name", selector: (row) => row.user?.name, sortable: true, width: "15%" },
      { name: "Email", selector: (row) => row.user?.email, sortable: true, width: "18%" },
      { name: "Phone", selector: (row) => row.user?.phone, sortable: true, width: "12%" },
      { name: "Designation", selector: (row) => row.designation, sortable: true, width: "12%" },
      { name: "Store", selector: (row) => row?.store?.name, sortable: true, width: "10%" },
      { name: "Joining Date", selector: (row) => row.joinDate ? new Date(row.joinDate).toLocaleDateString() : 'N/A', sortable: true, width: "10%" },
    ],
    status: {
      name: "Status",
      idSelector: (row) => row._id,
      valueSelector: (row) => row.isActive,
      onToggle: handleToggleStatusById,
    },
    actions: [
      ...(checkPermission("hrm.staff", "update") ? [{ render: (row: any) => <WebComponents.UiComponents.UiWebComponents.Button size="icon" variant="editaction" onClick={() => handleEditModal(row)}><FaEdit className="w-4 h-4" /></WebComponents.UiComponents.UiWebComponents.Button> }] : []),
      ...(checkPermission("hrm.staff", "delete") ? [{ render: (row: any) => <WebComponents.UiComponents.UiWebComponents.Button size="icon" variant="deleteaction" onClick={() => handleDelete(row._id)}><FaTrash className="w-4 h-4" /></WebComponents.UiComponents.UiWebComponents.Button> }] : []),
    ],
  }), [handleToggleStatusById, handleEditModal, handleDelete, checkPermission]);

  return (
    <>
      {!showModal && !showEditModal ? (
        <>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                Staff Management
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Manage your staff members
              </p>
            </div>
            {(
              (showModal || showEditModal || checkPermission("hrm.staff", "create")) && (
                <div className="flex items-center gap-3">
                  <WebComponents.UiComponents.UiWebComponents.Button
                    className="flex items-center gap-2 bg-primary hover:bg-primaryHover text-white px-4 py-2 rounded-md transition-colors shadow-sm"
                    onClick={() => setShowModal(true)}
                  >
                    <HiPlus className="w-4 h-4" />
                    <span>{Constants.adminConstants.add}</span>
                  </WebComponents.UiComponents.UiWebComponents.Button>
                </div>
              )
            )}
          </div>

          <div className="bg-white dark:bg-darkFilterbar rounded-[4px] h-full w-full overflow-hidden mt-4">
            <WebComponents.WebCommonComponents.CommonComponents.CommonFilterBar
              actionFilter={actionFilter}
              onActionFilterChange={(value) => {
                setActionFilter(value);
                if (value !== 'Status') setActiveStatusFilter('All');
              }}
              actionOptions={Constants.commonConstants.actionOptions}
              activeStatusFilter={activeStatusFilter}
              onActiveStatusFilterChange={setActiveStatusFilter}
              activeStatusOptions={Constants.commonConstants.activeStatusOptions}
              selectedCount={selectedRows.length}
              onApply={handleBulkApply}
              categoryFilter={storeFilter}
              onCategoryFilterChange={(value) => setStoreFilter(value || "All")}
              categoryOptions={stores.map(s => ({ name: s.name, value: s.id }))}
              categoryPlaceholder="All Categories"
              statusPlaceholder="All Status"
              searchPlaceholder="Search"
              showActionSection={true}
              showCategoryFilter={true}
              categoryLabel="Store"
              statusLabel="Status"
              statusFilter={statusFilter}
              onStatusFilterChange={(value) => setStatusFilter(value as any)}
              statusOptions={[
                { label: 'All Status', value: 'All' },
                { label: 'Active', value: 'Active' },
                { label: 'Inactive', value: 'Inactive' }
              ]}
              searchTerm={searchTerm}
              onSearchTermChange={setSearchTerm}
              customStatusFilter={designationFilter}
              onCustomStatusFilterChange={setDesignationFilter}
              customStatusOptions={[
                { name: 'All Designations', value: 'All' },
                ...Constants.adminConstants.designations.map(d => ({ name: d, value: d }))
              ]}
              customStatusLabel="Designation"
              renderExports={
                <>
                  <WebComponents.UiComponents.UiWebComponents.DownloadCSV
                    data={downloadData}
                    columns={exportColumns.csvColumns}
                    filename={`staff-${new Date().toISOString().split('T')[0]}.csv`}
                    onExport={async () => {
                      const data = await downloadPdf();
                      WebComponents.UiComponents.UiWebComponents.SwalHelper.success({ text: 'CSV exported successfully.' });
                      clearSelectedData();
                      return data;
                    }}
                  >
                    <button type="button" className="rounded-[4px] bg-[#ffffff] dark:bg-[#3A3A3A] border border-[#D8D9D9] border-opacity-50 hover:bg-[#e0e0e0] dark:hover:bg-[#4A4A4A] shadow-sm transition-colors duration-200 cursor-pointer p-2" aria-label="Download CSV" title="Download CSV" disabled={staff.length === 0}>
                      <Image src={Constants.assetsIcon.assets.csv} alt="CSV" width={28} height={28} className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                  </WebComponents.UiComponents.UiWebComponents.DownloadCSV>
                  <WebComponents.UiComponents.UiWebComponents.DownloadPDF
                    data={downloadData}
                    columns={exportColumns.pdfColumns}
                    filename={`staff-${new Date().toISOString().split('T')[0]}.pdf`}
                    title="Staff Report"
                    orientation="landscape"
                    onExport={async () => {
                      const data = await downloadPdf();
                      WebComponents.UiComponents.UiWebComponents.SwalHelper.success({ text: 'PDF exported successfully.' });
                      clearSelectedData();
                      return data;
                    }}
                  >
                    <button type="button" className="rounded-[4px] bg-[#ffffff] dark:bg-[#3A3A3A] border border-[#D8D9D9] border-opacity-50 hover:bg-[#e0e0e0] dark:hover:bg-[#4A4A4A] shadow-sm transition-colors duration-200 cursor-pointer p-2" aria-label="Download PDF" title="Download PDF" disabled={staff.length === 0}>
                      <Image src={Constants.assetsIcon.assets.pdf} alt="PDF" width={28} height={28} className="w-5 h-5 sm:w-6 sm:h-6" />
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
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between px-1">
            <div>
              <div className="flex items-center gap-1.5 text-xl font-bold text-[#1B1B1B] dark:text-white">
                <span>Staff Management</span>
                <span className="text-gray-400 font-normal">&gt;</span>
                <span className="text-[#1B1B1B] dark:text-white">{showModal ? "Add Staff" : "Edit Staff"}</span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                Manage your staff members
              </p>
            </div>
            <div>
              <button
                onClick={() => { setShowModal(false); setShowEditModal(false); setEditingStaff(null); }}
                className="flex items-center gap-2 bg-primary hover:bg-primaryHover text-white px-5 py-2.5 rounded-[6px] transition-all text-sm font-bold shadow-sm"
                title="Back"
              >
                <HiArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-darkFilterbar rounded-[4px] shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
            <WebComponents.AdminComponents.AdminWebComponents.Forms.StaffForm
              onSubmit={showModal ? handleAdd : handleEdit}
              staff={editingStaff || undefined}
              stores={stores}
            />
            <div className="pt-[60px] pb-6 px-6 flex justify-end items-center gap-3">
              <button
                type="button"
                onClick={() => { setShowModal(false); setShowEditModal(false); setEditingStaff(null); }}
                className="px-8 py-2.5 rounded-[6px] border border-gray-200 dark:border-gray-700 text-gray-400 font-bold text-sm bg-white dark:bg-darkFilterbar hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="staff-form"
                disabled={loading}
                className="bg-primary hover:bg-primaryHover text-white px-10 py-2.5 rounded-[6px] transition-all text-sm font-bold shadow-sm disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
