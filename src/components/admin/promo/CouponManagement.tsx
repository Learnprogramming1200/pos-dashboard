"use client";
import React from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from 'next/navigation';
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import { HiArrowLeft, HiPlus } from "react-icons/hi";
import { ServerActions } from "@/lib";
import { Constants } from "@/constant";
import { customHooks } from "@/hooks";
import { WebComponents } from "@/components";
import { PaginationType, SearchParamsTypes, AdminTypes } from "@/types";

export default function AdminCouponManagement({
  initialCoupons,
  initialPagination,
  initialCustomers
}: {
  readonly initialCoupons: AdminTypes.adminCouponTypes.AdminCoupon[];
  readonly initialPagination: PaginationType.Pagination;
  readonly initialCustomers?: any[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [coupons, setCoupons] = React.useState<AdminTypes.adminCouponTypes.AdminCoupon[]>(initialCoupons);
  const [pagination, setPagination] = React.useState<PaginationType.Pagination>(initialPagination);
  const [customers, setCustomers] = React.useState<any[]>(initialCustomers || []);
  const [showModal, setShowModal] = React.useState(false);
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [showDetailsModal, setShowDetailsModal] = React.useState(false);
  const [editingCoupon, setEditingCoupon] = React.useState<AdminTypes.adminCouponTypes.AdminCoupon | null>(null);
  const [selectedCoupon, setSelectedCoupon] = React.useState<AdminTypes.adminCouponTypes.AdminCoupon | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [selectedRows, setSelectedRows] = React.useState<AdminTypes.adminCouponTypes.AdminCoupon[]>([]);
  const [actionFilter, setActionFilter] = React.useState<string>("All");
  const [activeStatusFilter, setActiveStatusFilter] = React.useState<string>("All");
  const [downloadData, setDownloadData] = React.useState([]);
  const [clearSelectedRows, setClearSelectedRows] = React.useState(false);
  const { searchTerm, setSearchTerm, statusFilter, setStatusFilter, filteredData } = customHooks.useListFilters<AdminTypes.adminCouponTypes.AdminCoupon>(
    coupons,
  )

  /* Permissions */
  const { checkPermission } = customHooks.useUserPermissions();

  const bulkActionOptions = React.useMemo(() => {
    const options = Constants.commonConstants.actionOptions;
    return options.filter(option => {
      if (option.value === 'Status') {
        return checkPermission("promo.coupons", "update");
      }
      if (option.value === 'Delete') {
        return checkPermission("promo.coupons", "delete");
      }
      return true;
    });
  }, [checkPermission]);

  // Sync state with props when URL params change (server re-fetches data)
  React.useEffect(() => {
    setCoupons(initialCoupons);
    setPagination(initialPagination);
    setCustomers(initialCustomers || []);
  }, [initialCoupons, initialCustomers]);

  // Reset action filter when no rows are selected
  React.useEffect(() => {
    if (selectedRows.length === 0) {
      setActionFilter("All");
      setActiveStatusFilter("All");
    }
  }, [selectedRows]);

  // Add
  const handleAdd = async (formData: AdminTypes.adminCouponTypes.AdminCouponFormData) => {
    await ServerActions.HandleFunction.handleAddCommon({
      formData,
      createAction: ServerActions.ServerActionslib.createAdminCouponAction,
      setLoading,
      setShowModal,
      router,
      successMessage: "Coupon added successfully.",
      errorMessage: "Failed to add coupon.",
      checkExistsError: (errorMessage) => errorMessage.toLowerCase() === "coupon already exists",
    });
  };

  // Edit
  const handleEdit = async (formData: AdminTypes.adminCouponTypes.AdminCouponFormData) => {
    await ServerActions.HandleFunction.handleEditCommon({
      formData,
      editingItem: editingCoupon,
      getId: (item) => item._id,
      updateAction: (id: string | number, data) => ServerActions.ServerActionslib.updateAdminCouponAction(String(id), data),
      setLoading,
      setShowEditModal,
      setEditingItem: setEditingCoupon,
      router,
      successMessage: "Coupon updated successfully.",
      errorMessage: "Failed to update coupon.",
      checkExistsError: (errorMessage) => errorMessage.toLowerCase() === "coupon already exists",
    });
  };

  // Delete
  const handleDelete = React.useCallback(async (id: string) => {
    await ServerActions.HandleFunction.handleDeleteCommon({
      id,
      deleteAction: (id: string | number) => ServerActions.ServerActionslib.deleteAdminCouponAction(String(id)),
      setLoading,
      router,
      successMessage: "Coupon deleted successfully.",
      errorMessage: "Failed to delete coupon.",
    });
  }, [router]);

  const handleEditModal = React.useCallback((coupon: AdminTypes.adminCouponTypes.AdminCoupon) => {
    setEditingCoupon(coupon);
    setShowEditModal(true);
  }, []);

  // View Details
  const handleViewDetails = React.useCallback((coupon: AdminTypes.adminCouponTypes.AdminCoupon) => {
    setSelectedCoupon(coupon);
    setShowDetailsModal(true);
  }, []);

  const handleToggleStatus = React.useCallback(async (row: AdminTypes.adminCouponTypes.AdminCoupon, next: boolean) => {
    await ServerActions.HandleFunction.handleToggleStatusCommon({
      row,
      next,
      getId: (row) => row._id,
      preparePayload: (row, next) => {
        return {
          code: row.code,
          description: row.description,
          start_date: row.start_date,
          end_date: row.end_date,
          type: row.type,
          discount_amount: row.discount_amount,
          limit: row.limit,
          usageCount: row.usageCount,
          maxUsagePerUser: row.maxUsagePerUser,
          status: next,
        };
      },
      updateAction: (id: string | number, data) => ServerActions.ServerActionslib.updateAdminCouponAction(String(id), data),
      setLoading,
      router,
      successMessage: `Status updated to ${next ? "Active" : "Inactive"}.`,
      errorMessage: "Failed to update status.",
    });
  }, [router]);

  // Wrapper function to convert id-based toggle to row-based toggle
  const handleToggleStatusById = React.useCallback(
    async (id: string, next: boolean) => {
      const row = coupons.find(c => c._id === id);
      if (row) {
        await handleToggleStatus(row, next);
      }
    },
    [coupons, handleToggleStatus]
  );

  const tableColumns = React.useMemo(() => WebComponents.WebCommonComponents.CommonComponents.createColumns<AdminTypes.adminCouponTypes.AdminCoupon>({
    fields: [
      {
        name: "Code",
        selector: (row: AdminTypes.adminCouponTypes.AdminCoupon) => row.code,
        sortable: true
      },
      {
        name: "Description",
        selector: (row: AdminTypes.adminCouponTypes.AdminCoupon) => row.description,
        sortable: false
      },
      {
        name: "Type",
        selector: (row: AdminTypes.adminCouponTypes.AdminCoupon) => row.type,
        sortable: true
      },
      {
        name: "Discount",
        selector: (row: AdminTypes.adminCouponTypes.AdminCoupon) => row.discount_amount,
        sortable: true
      },
      {
        name: "Limit",
        selector: (row: AdminTypes.adminCouponTypes.AdminCoupon) => row.limit || '-',
        sortable: true
      },
      {
        name: "Usage",
        selector: (row: AdminTypes.adminCouponTypes.AdminCoupon) => row.usageCount ?? '-',
        sortable: true
      },
      {
        name: "Max Usage",
        selector: (row: AdminTypes.adminCouponTypes.AdminCoupon) => row.maxUsagePerUser ?? '-',
        sortable: true
      },
      {
        name: "Start Date",
        selector: (row: AdminTypes.adminCouponTypes.AdminCoupon) => row.start_date || '-',
        cell: (row: AdminTypes.adminCouponTypes.AdminCoupon) => (
          <span>
            {row.start_date
              ? new Date(row.start_date).toLocaleDateString()
              : ""}
          </span>
        ),
        sortable: true
      },
      {
        name: "End Date",
        selector: (row: AdminTypes.adminCouponTypes.AdminCoupon) => row.end_date || '-',
        cell: (row: AdminTypes.adminCouponTypes.AdminCoupon) => (
          <span>
            {row.end_date
              ? new Date(row.end_date).toLocaleDateString()
              : ""}
          </span>
        ),
        sortable: true
      },
    ],
    status: {
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
          (checkPermission("promo.coupons", "update")) && (
            <WebComponents.UiComponents.UiWebComponents.Button size="icon" variant="editaction" onClick={() => handleEditModal(row)}>
              <FaEdit className="w-4 h-4" />
            </WebComponents.UiComponents.UiWebComponents.Button>
          )
        ),
      },
      {
        render: (row) => (
          (checkPermission("promo.coupons", "delete")) && (
            <WebComponents.UiComponents.UiWebComponents.Button size="icon" variant="deleteaction" onClick={() => handleDelete(row._id)}>
              <FaTrash className="w-4 h-4" />
            </WebComponents.UiComponents.UiWebComponents.Button>
          )
        ),
      },
    ],
  }), [handleToggleStatusById, handleViewDetails, handleEditModal, handleDelete]);

  // CSV and PDF export columns
  const exportColumns = React.useMemo(() => {
    return WebComponents.WebCommonComponents.CommonComponents.generateExportColumns<AdminTypes.adminCouponTypes.AdminCoupon>([
      {
        key: "code",
        label: "Coupon Code",
        accessor: (row) => row.code || '-',
        pdfWidth: 40
      },
      {
        key: "description",
        label: "Description",
        accessor: (row) => row.description || '-',
        pdfWidth: 50
      },
      {
        key: "type",
        label: "Type",
        accessor: (row) => row.type || '-',
        pdfWidth: 25
      },
      {
        key: "discount",
        label: "Discount",
        accessor: (row) => row.discount_amount,
        pdfWidth: 30
      },
      {
        key: "limit",
        label: "Limit",
        accessor: (row) => row.limit || '-',
        pdfWidth: 20
      },
      {
        key: "usage",
        label: "Usage",
        accessor: (row) => row.usageCount ?? '-',
        pdfWidth: 20
      },
      {
        key: "maxUsagePerUser",
        label: "Max Usage Per User",
        accessor: (row) => row.maxUsagePerUser ?? '-',
        pdfWidth: 20
      },
      {
        key: "startDate",
        label: "Start Date",
        accessor: (row) => row.start_date ? new Date(row.start_date).toLocaleDateString() : '-',
        pdfWidth: 20
      },
      {
        key: "endDate",
        label: "End Date",
        accessor: (row) => row.end_date ? new Date(row.end_date).toLocaleDateString() : '-',
        pdfWidth: 20
      },
      {
        key: "status",
        label: "Status",
        accessor: (row) => row.status ? 'Active' : 'Inactive',
        pdfWidth: 25
      }
    ]);
  }, []);

  const downloadPdf = async (): Promise<any[]> => {
    const selectedRowsIds = selectedRows.map(item => item._id);
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
      res = await ServerActions.ServerActionslib.bulkGetSelectedAdminCouponAction({ ids: selectedRowsIds });
    } else {
      res = await ServerActions.ServerActionslib.bulkGetAdminCouponsAction(filterDatas);
    }
    const rows = Array.isArray(res?.data?.data?.data) ? res.data.data.data : [];
    setDownloadData(rows);
    return rows;
  };

  const clearSelectedData = () => {
    setClearSelectedRows(prev => !prev);
    setSelectedRows([]);
    router.refresh();
  }
  const handleBulkApply = React.useCallback(async () => {
    const ids = selectedRows.map(r => r._id);
    if (actionFilter !== 'Status') {
      if (actionFilter === 'Delete') {
        const confirm = await WebComponents.UiComponents.UiWebComponents.SwalHelper.delete();
        if (!confirm.isConfirmed) return;
        try {
          const result = await ServerActions.ServerActionslib.bulkDeleteAdminCouponsAction({ ids });
          if (!result?.success) throw new Error(result?.error || 'Failed to delete selected coupon');
          WebComponents.UiComponents.UiWebComponents.SwalHelper.success({ text: 'Selected coupon deleted.' });
          clearSelectedData();
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to delete selected coupon.';
          WebComponents.UiComponents.UiWebComponents.SwalHelper.error({ text: errorMessage });
        }
      }
      return;
    }
    if (activeStatusFilter === 'All') {
      WebComponents.UiComponents.UiWebComponents.SwalHelper.error({ text: 'Please select a status.' });
      return;
    }
    const isActive = activeStatusFilter === 'Active';
    try {
      const result = await ServerActions.ServerActionslib.bulkUpdateAdminCouponsStatusAction({ ids, status: isActive });
      if (!result?.success) throw new Error(result?.error || 'Failed to apply status');
      WebComponents.UiComponents.UiWebComponents.SwalHelper.success({ text: 'Status updated successfully.' });
      clearSelectedData();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to apply status.';
      WebComponents.UiComponents.UiWebComponents.SwalHelper.error({ text: errorMessage });
    }
  }, [actionFilter, activeStatusFilter, selectedRows]);

  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
            {showModal || showEditModal ? `${Constants.adminConstants.couponManagement} > ${showModal ? Constants.adminConstants.addCoupon : Constants.adminConstants.editCoupon}` : Constants.adminConstants.couponManagement}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-300">{Constants.adminConstants.couponManagementDescription}</p>
        </div>
        {(checkPermission("promo.coupons", "create")) && (
          <WebComponents.UiComponents.UiWebComponents.Button
            variant="addBackButton"
            onClick={() => {
              if (showModal || showEditModal) {
                setShowModal(false);
                setShowEditModal(false);
                setEditingCoupon(null);
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
              statusOptions={Constants.commonConstants.CommonFilterOptions.CommonStatusOptions}
              searchTerm={searchTerm}
              onSearchTermChange={setSearchTerm}
              renderExports={
                <>
                  <WebComponents.UiComponents.UiWebComponents.DownloadCSV
                    data={downloadData}
                    columns={exportColumns.csvColumns}
                    filename={`coupons-${new Date().toISOString().split('T')[0]}.csv`}
                    onExport={async () => {
                      const data = await downloadPdf();
                      WebComponents.UiComponents.UiWebComponents.SwalHelper.success({ text: 'CSV exported successfully.' });
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
                  </WebComponents.UiComponents.UiWebComponents.DownloadCSV>
                  <WebComponents.UiComponents.UiWebComponents.DownloadPDF
                    data={downloadData}
                    columns={exportColumns.pdfColumns}
                    filename={`coupons-${new Date().toISOString().split('T')[0]}.pdf`}
                    title="Coupons Report"
                    orientation="landscape"
                    onExport={async () => {
                      const data = await downloadPdf();
                      WebComponents.UiComponents.UiWebComponents.SwalHelper.success({ text: 'PDF exported successfully.' });
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
      )}
      {/* Add / Edit Modal */}
      {(showModal || showEditModal) && (
        <WebComponents.UiComponents.UiWebComponents.AdminFormModal
          formId="coupon-form"
          onClose={() => {
            setShowModal(false);
            setShowEditModal(false);
            setEditingCoupon(null);
          }}
          loading={loading}
        >
          {editingCoupon ? (
            <WebComponents.AdminComponents.AdminWebComponents.Forms.CouponForm
              onSubmit={handleEdit}
              coupon={editingCoupon}
              customers={customers}
            />
          ) : (
            <WebComponents.AdminComponents.AdminWebComponents.Forms.CouponForm
              onSubmit={handleAdd}
              customers={customers}
            />
          )}
        </WebComponents.UiComponents.UiWebComponents.AdminFormModal>
      )}
      {/* Details Modal */}
      {showDetailsModal && selectedCoupon && (
        <WebComponents.AdminComponents.AdminWebComponents.Models.CouponDetailsModal
          coupon={selectedCoupon}
          onClose={() => setShowDetailsModal(false)}
        />
      )}
    </>
  );
}
