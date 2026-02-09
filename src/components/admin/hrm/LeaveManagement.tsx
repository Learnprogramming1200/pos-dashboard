"use client";

import React from "react";
import { Plus, Eye, ArrowLeft, Edit } from "lucide-react";
import { useRouter } from "next/navigation";
import { ServerActions } from "@/lib";
import 'react-date-range/dist/styles.css'; // main css file
import 'react-date-range/dist/theme/default.css'; // theme css file
import { Constants } from "@/constant";
import { WebComponents } from "@/components";
import { AdminTypes, PaginationType } from "@/types";
import { customHooks } from "@/hooks";
// columns are constructed inside the component to access selection handlers
export default function LeaveManagement({
  initialStoresPayload,
  initialLeaveTypesPayload,
  initialLeaveRequestsPayload,
  initialEmployeesPayload,
  initialPagination }:
  {
    readonly initialStoresPayload: AdminTypes.storeTypes.Store[],
    readonly initialLeaveTypesPayload: AdminTypes.hrmTypes.leaveTypes.LeaveType[],
    readonly initialLeaveRequestsPayload: AdminTypes.hrmTypes.leaveTypes.LeaveRequest[],
    readonly initialEmployeesPayload: AdminTypes.hrmTypes.staffTypes.Staff[];
    readonly initialPagination: PaginationType.Pagination
  }) {
  const [leaveRequests, setLeaveRequests] = React.useState<AdminTypes.hrmTypes.leaveTypes.LeaveRequest[]>(initialLeaveRequestsPayload);
  const [pagination, setPagination] = React.useState<PaginationType.Pagination>(initialPagination);
  const [leaveTypes, setLeaveTypes] = React.useState<AdminTypes.hrmTypes.leaveTypes.LeaveType[]>(initialLeaveTypesPayload);
  const [stores, setStores] = React.useState<AdminTypes.storeTypes.Store[]>(initialStoresPayload);
  const [employees, setEmployees] = React.useState<AdminTypes.hrmTypes.staffTypes.Staff[]>(initialEmployeesPayload);
  const [loading, setLoading] = React.useState(true);
  const [showModal, setShowModal] = React.useState(false);
  const [showViewModal, setShowViewModal] = React.useState(false);
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [editLeaveRequest, setEditLeaveRequest] = React.useState<AdminTypes.hrmTypes.leaveTypes.LeaveRequest | null>(null);
  const [selectedLeaveRequest, setSelectedLeaveRequest] = React.useState<AdminTypes.hrmTypes.leaveTypes.LeaveRequest | null>(null);
  const [selectedRows, setSelectedRows] = React.useState<AdminTypes.hrmTypes.leaveTypes.LeaveRequest[]>([]);
  const [actionFilter, setActionFilter] = React.useState("All");
  const [activeStatusFilter, setActiveStatusFilter] = React.useState("All");
  const { searchTerm, setSearchTerm, allStatusFilter, setAllStatusFilter, storeFilter, setStoreFilter, filteredData } = customHooks.useListFilters<AdminTypes.hrmTypes.leaveTypes.LeaveRequest>(
    leaveRequests,
  );
  const { checkPermission } = customHooks.useUserPermissions();

  const router = useRouter();
  React.useEffect(() => {
    setEmployees(initialEmployeesPayload)
    setStores(initialStoresPayload)
    setLeaveTypes(initialLeaveTypesPayload)
    setLeaveRequests(initialLeaveRequestsPayload);
    setPagination(initialPagination)
    setLoading(false);
  }, [initialEmployeesPayload, initialStoresPayload, initialLeaveRequestsPayload]);
  // Helper function to safely extract leave types from payload
  const handleView = (leaveRequest: AdminTypes.hrmTypes.leaveTypes.LeaveRequest) => {
    setSelectedLeaveRequest(leaveRequest);
    setShowViewModal(true);
  };
  const tableColumns = [
    {
      name: "Staff",
      selector: (row: AdminTypes.hrmTypes.leaveTypes.LeaveRequest) => row?.employeeId?.user?.name,
      cell: (row: AdminTypes.hrmTypes.leaveTypes.LeaveRequest) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900 dark:text-white">
            {row?.employeeId?.user?.name?.length > 16 ? `${row?.employeeId?.user?.name?.substring(0, 16)}...` : row?.employeeId?.user?.name}
          </span>
        </div>
      ),
      sortable: true,
      width: "18%"
    },
    {
      name: "From Date To End Date",
      selector: (row: AdminTypes.hrmTypes.leaveTypes.LeaveRequest) => `${row.startDate} to ${row.endDate}`,
      cell: (row: AdminTypes.hrmTypes.leaveTypes.LeaveRequest) => (
        <span>{new Date(row.startDate).toLocaleDateString()} to {new Date(row.endDate).toLocaleDateString()}</span>
      ),
      sortable: true,
      width: "20%"
    },
    {
      name: "Reason",
      selector: (row: AdminTypes.hrmTypes.leaveTypes.LeaveRequest) => row.reason,
      sortable: false,
      width: "20%"
    },

    // {
    //   name: "Leave Type",
    //   selector: (row: AdminTypes.hrmTypes.leaveTypes.LeaveRequest) => row,
    //   sortable: true,
    //   width: "12%"
    // },
    {
      name: "Leave Status",
      selector: (row: AdminTypes.hrmTypes.leaveTypes.LeaveRequest) => row.status,
      cell: (row: AdminTypes.hrmTypes.leaveTypes.LeaveRequest) => {
        if (row.status === 'approved') {
          return (
            <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-300">
              approved
            </span>
          );
        }
        if (row.status === 'rejected') {
          return (
            <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
              rejected
            </span>
          );
        }
        return (
          <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
            pending
          </span>
        );
      },
      width: "12%"
    },
    {
      name: "Reject Reason",
      selector: (row: AdminTypes.hrmTypes.leaveTypes.LeaveRequest) => row.rejectionReason || "-",
      sortable: false,
      width: "15%"
    },
    {
      name: "Action",
      cell: (row: AdminTypes.hrmTypes.leaveTypes.LeaveRequest) => (
        <div className="flex gap-2">
          <WebComponents.UiComponents.UiWebComponents.Button
            size="icon"
            variant="viewaction"
            onClick={() => handleView(row)}
            title="View"
          >
            <Eye className="w-4 h-4" />
          </WebComponents.UiComponents.UiWebComponents.Button>
          {(checkPermission("hrm.leaves", "update")) && (
            <WebComponents.UiComponents.UiWebComponents.Button
              size="icon"
              variant="editaction"
              onClick={() => {
                setEditLeaveRequest(row);
                setShowEditModal(true);
              }}
              title="Edit"
            >
              <Edit className="w-4 h-4" />
            </WebComponents.UiComponents.UiWebComponents.Button>
          )}
        </div>
      ),
      width: "15%"
    }
  ];

  const handleAdd = async (formData: AdminTypes.hrmTypes.leaveTypes.LeaveRequestFormData) => {
    await ServerActions.HandleFunction.handleAddCommon({
      formData,
      createAction: ServerActions.ServerActionslib.createApprovedLeaveAction,
      setLoading,
      setShowModal,
      router,
      successMessage: "Leave assigned successfully!",
      errorMessage: "Failed to assign leave",
      onSuccess: (result) => {
        if (result?.data) {
          const payload = result.data?.data ?? result.data;
          setLeaveRequests(prev => [payload, ...prev]);

        }
      },
    });
  };

  const handleEdit = async (formData: AdminTypes.hrmTypes.leaveTypes.LeaveRequestFormData) => {
    await ServerActions.HandleFunction.handleEditCommon({
      formData,
      editingItem: editLeaveRequest,
      getId: (item: AdminTypes.hrmTypes.leaveTypes.LeaveRequest) => item._id,
      updateAction: (id, data) => ServerActions.ServerActionslib.updateLeaveRequestAction(id as string, data),
      setLoading,
      setShowEditModal,
      setEditingItem: setEditLeaveRequest,
      router,
      successMessage: "Leave updated successfully.",
      errorMessage: "Failed to update leave",
      onSuccess: (result) => {
        if (result?.success && editLeaveRequest) {
          const payload = result.data?.data ?? result.data;
          setLeaveRequests(prev => prev.map(leaveRequest =>
            leaveRequest._id === editLeaveRequest._id ? payload : leaveRequest
          ));
        }
      },
    });
  };

  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-[30px] gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
            {Constants.adminConstants.leaveManagementStrings.title}
            {showModal ? ` > ${Constants.adminConstants.leaveManagementStrings.addModalTitle}` : showEditModal ? ` > ${Constants.adminConstants.leaveManagementStrings.editModalTitle}` : ""}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-300">
            {Constants.adminConstants.leaveManagementStrings.description}
          </p>
        </div>
        {(showModal || showEditModal || checkPermission("hrm.leaves", "create")) && (
          <WebComponents.UiComponents.UiWebComponents.Button
            className="bg-primary text-white hover:bg-primaryHover w-full sm:w-auto"
            onClick={() => {
              if (showModal || showEditModal) {
                setShowModal(false);
                setShowEditModal(false);
                setEditLeaveRequest(null);
              } else {
                setShowModal(true);
              }
            }}
          >
            {showModal || showEditModal ? (
              <>
                <ArrowLeft className="w-4 h-4 mr-0" />
                {Constants.adminConstants.back}
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-0" />
                {Constants.adminConstants.add}
              </>
            )}
          </WebComponents.UiComponents.UiWebComponents.Button>
        )}
      </div>

      {/* Show filters and table only when no form is open */}
      {!showModal && !showEditModal && (
        <>
          {/* Filters */}
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
              // categoryFilter="All"
              // onCategoryFilterChange={() => { }}
              categoryFilter={storeFilter}
              onCategoryFilterChange={setStoreFilter}
              // categoryOptions={[]}
              categoryOptions={[
                { name: 'All Stores', value: 'All' },
                ...stores.map(store => ({ name: store.name, value: store._id }))
              ]}
              categoryPlaceholder="All Stores"

              statusFilter={allStatusFilter}
              onStatusFilterChange={(value: string) => {
                setAllStatusFilter(value);
              }}

              statusOptions={[
                { label: 'All Status', value: 'All' },
                { label: 'Pending', value: 'pending' },
                { label: 'Approved', value: 'approved' },
                { label: 'Rejected', value: 'rejected' },
              ]}

              searchTerm={searchTerm}
              onSearchTermChange={setSearchTerm}
              searchPlaceholder="Search"
              showActionSection={false}
              renderExports={<></>}
            />

          </div>



          {/* Table */}
          <div className="overflow-x-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-b-md">
            {/* {loading ? (
              <div className="flex justify-center items-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-2 text-gray-600 dark:text-gray-300">{Constants.adminConstants.leaveManagementStrings.loadingLabel}</span>
              </div>
            ) : ( */}
            <WebComponents.WebCommonComponents.CommonComponents.DataTable
              columns={tableColumns}
              data={filteredData}
              // selectableRows
              onSelectedRowsChange={({ selectedRows }) => setSelectedRows(selectedRows as AdminTypes.hrmTypes.leaveTypes.LeaveRequest[])}
              useCustomPagination={true}
              totalRecords={pagination.totalItems}
              paginationDefaultPage={pagination.currentPage}
              filteredRecords={pagination.totalItems}
              paginationPerPage={pagination.itemsPerPage}
              paginationRowsPerPageOptions={[5, 10, 25, 50]}
              useUrlParams={true}
            // totalRecords={paginat}
            />
            {/* )} */}
          </div>
        </>
      )}

      {/* View Modal */}
      {showViewModal && selectedLeaveRequest && (
        <WebComponents.AdminComponents.AdminWebComponents.Models.LeaveRequestDetailsModal
          leaveRequest={selectedLeaveRequest}
          onClose={() => {
            setShowViewModal(false);
            setSelectedLeaveRequest(null);
          }}
        />
      )}

      {/* Modal rendering */}
      {(showModal || showEditModal) && (
        <WebComponents.UiComponents.UiWebComponents.AdminFormModal
          formId="leave-form"
          onClose={() => {
            setShowModal(false);
            setShowEditModal(false);
            setEditLeaveRequest(null);
          }}
          loading={loading}
          wrapInForm={false}
        >
          <WebComponents.AdminComponents.AdminWebComponents.Forms.LeaveAssignForm
            onSubmit={showEditModal ? handleEdit : handleAdd}
            leaveRequest={showEditModal && editLeaveRequest ? editLeaveRequest : undefined}
            stores={stores}
            leaveTypes={leaveTypes}
          />
        </WebComponents.UiComponents.UiWebComponents.AdminFormModal>
      )}

    </>
  );
}

