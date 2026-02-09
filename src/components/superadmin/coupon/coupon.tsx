"use client";
import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from 'next/image';
import { FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import { HiArrowLeft, HiPlus } from "react-icons/hi";
import { ServerActions } from "@/lib";
import { Constants } from "@/constant";
import { customHooks } from "@/hooks";
import { WebComponents } from "@/components";
import { SuperAdminTypes, PaginationType} from "@/types";
import { formatFunctionsUtils } from "@/utils";

// Helper function to get plan names
const getPlanNames = (planIds: string[], plans: Array<{ _id: string; name: string }>): string => {
  if (!Array.isArray(planIds)) return '-';
  return planIds.map(planId => {
    if (typeof planId === 'string') {
      const plan = plans.find(p => p._id === planId);
      return plan ? plan.name : 'Unknown';
    } else {
      return (planId as { name: string } | undefined)?.name || 'Unknown';
    }
  }).join(', ');
};

// Helper function to format discount amount for PDF export (normalizes currency symbol)
const formatDiscountAmountForExport = (
  coupon: SuperAdminTypes.CouponTypes.Coupon,
  primaryCurrency:SuperAdminTypes.SettingTypes.CurrencySettingsTypes.CurrencyData
) => {
  const type = coupon?.type || "Percentage";
  const value = (coupon?.discount_amount ?? coupon?.discountAmount)?.toString() || "0";
  if (type === "Percentage") {
    return `${value}%`;
  }
  let symbol = primaryCurrency?.symbol || "";
  // Replace ₹ with Rs. for better PDF rendering
  if (symbol === '₹' || symbol === '\u20B9') {
    symbol = 'Rs.';
  }
  const position = primaryCurrency?.position || "Left";
  if (position === "Right") {
    return `${value}${symbol}`;
  } else {
    return `${symbol}${value}`;
  }
};

export default function Coupon({initialCoupons,initialPlans,initialPagination,primaryCurrency}: {
  readonly initialCoupons: SuperAdminTypes.CouponTypes.Coupon[];
  readonly initialPlans: SuperAdminTypes.PlanTypes.Plan[];
  readonly initialPagination: PaginationType.Pagination;
  readonly primaryCurrency:SuperAdminTypes.SettingTypes.CurrencySettingsTypes.CurrencyData
}) {
  const [coupons, setCoupons] = React.useState<SuperAdminTypes.CouponTypes.Coupon[]>(initialCoupons);
  const [plans] = React.useState<SuperAdminTypes.PlanTypes.Plan[]>(initialPlans);
  const [pagination, setPagination] = React.useState<PaginationType.Pagination>(initialPagination);
  const [showModal, setShowModal] = React.useState(false);
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [showDetailsModal, setShowDetailsModal] = React.useState(false);
  const [editingCoupon, setEditingCoupon] = React.useState<SuperAdminTypes.CouponTypes.Coupon | null>(null);
  const [selectedCoupon, setSelectedCoupon] = React.useState<SuperAdminTypes.CouponTypes.Coupon | null>(null);
  const [actionFilter, setActionFilter] = React.useState("All");
  const [activeStatusFilter, setActiveStatusFilter] = React.useState("All");
  const [selectedRows, setSelectedRows] = React.useState<SuperAdminTypes.CouponTypes.Coupon[]>([]);
  const [downloadData, setDownloadData] = React.useState([])
  const [clearSelectedRows, setClearSelectedRows] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { searchTerm, setSearchTerm, statusFilter, setStatusFilter,taxTypeFilter,setTaxTypeFilter, filteredData } = customHooks.useListFilters<SuperAdminTypes.CouponTypes.Coupon>(
    coupons,
  )

  // Sync state with props when URL params change (server re-fetches data)
  React.useEffect(() => {
    setCoupons(initialCoupons);
    setPagination(initialPagination);
  }, [initialCoupons]);

  // Reset action filter when no rows are selected
  React.useEffect(() => {
    if (selectedRows.length === 0) {
      setActionFilter('All');
      setActiveStatusFilter('All');
    }
  }, [selectedRows]);

  const typeOptions = React.useMemo(() => {
    const base = [{ name: 'All Types', value: 'All' }];
    return base.concat([
      { name: 'Percentage', value: 'percentage' },
      { name: 'Fixed', value: 'fixed' },
    ]);
  }, []);

  // Export columns
  const exportColumns = React.useMemo(() => {
    return WebComponents.WebCommonComponents.CommonComponents.generateExportColumns<SuperAdminTypes.CouponTypes.Coupon>([
      {
        key: 'code',
        label: Constants.superadminConstants.couponcodelabel,
        accessor: (row) => row.code || '-',
        pdfWidth: 30
      },
      {
        key: 'description',
        label: Constants.superadminConstants.descriptionlabel,
        accessor: (row) => row.description || '-',
        pdfWidth: 50
      },
      {
        key: 'type',
        label: Constants.superadminConstants.typelabel,
        accessor: (row) => row.type || '-',
        pdfWidth: 20
      },
      {
        key: 'discount',
        label: Constants.superadminConstants.discountamountlabel,
        accessor: (row) => formatDiscountAmountForExport(row, primaryCurrency),
        pdfWidth: 30
      },
      {
        key: 'limit',
        label: Constants.superadminConstants.limitlabel,
        accessor: (row) => row.limit?.toString() || '-',
        pdfWidth: 20
      },
      {
        key: 'status',
        label: Constants.superadminConstants.statuslabel,
        accessor: (row) => row.status ? Constants.superadminConstants.activestatus : Constants.superadminConstants.inactivestatus,
        pdfWidth: 25
      }
    ]);
  }, [primaryCurrency]);

  // Handlers
  const handleAdd = async (formData: SuperAdminTypes.CouponTypes.CouponFormData) => {
    await ServerActions.HandleFunction.handleAddCommon({
      formData,
      createAction: ServerActions.ServerActionslib.createCouponAction,
      setLoading,
      setShowModal,
      router,
      successMessage: 'Coupon added successfully.',
      errorMessage: 'Failed to add coupon.',
      onSuccess: (result) => {
        if (result?.data?.data) {
          setCoupons(prev => [...prev, result.data.data]);
        }
      },
    });
  };

  const handleEdit = async (formData: SuperAdminTypes.CouponTypes.CouponFormData) => {
    if (!editingCoupon) return;
    await ServerActions.HandleFunction.handleEditCommon({
      formData,
      editingItem: editingCoupon,
      getId: (item) => item._id || item.id,
      updateAction: (id, data) => ServerActions.ServerActionslib.updateCouponAction(id as string, data),
      setLoading,
      setShowEditModal,
      setEditingItem: setEditingCoupon,
      router,
      successMessage: 'Coupon updated successfully.',
      errorMessage: 'Failed to update coupon.',
      onSuccess: (result) => {
        if (result?.data?.data && editingCoupon) {
          setCoupons(prev => prev.map(c => ((c._id || c.id) === (editingCoupon._id || editingCoupon.id) ? result.data.data : c)));
        }
      },
    });
  };

  const handleDelete = async (id: string) => {
    await ServerActions.HandleFunction.handleDeleteCommon({
      id,
      deleteAction: (id) => ServerActions.ServerActionslib.deleteCouponAction(id as string),
      setLoading,
      router,
      successMessage: 'The coupon has been deleted.',
      errorMessage: 'Failed to delete coupon.',
      onSuccess: () => {
        setCoupons(prev => prev.filter(c => (c._id || c.id) !== id));
      },
    });
  };

  const handleToggleStatus = React.useCallback(async (row: SuperAdminTypes.CouponTypes.Coupon, next: boolean) => {
    setCoupons(prev => prev.map(c => ((c._id || c.id) === (row._id || row.id) ? { ...c, status: next } : c)));
    await ServerActions.HandleFunction.handleToggleStatusCommon({
      row,
      next,
      getId: (item) => item._id || item.id,
      preparePayload: () => ({
        code: row.code,
        description: row.description,
        start_date: row.start_date || row.startDate,
        end_date: row.end_date || row.endDate,
        type: row.type,
        discount_amount: row.discount_amount || row.discountAmount,
        limit: row.limit,
        plans: Array.isArray(row.plans) ? (typeof row.plans[0] === 'string' ? (row.plans as string[]) : (row.plans as any).map((p: any) => p._id)) : [],
        status: next,
      }),
      updateAction: (id, data) => ServerActions.ServerActionslib.updateCouponAction(id as string, data),
      setLoading,
      router,
      successMessage: `Status updated to ${next ? 'Active' : 'Inactive'}.`,
      errorMessage: 'Failed to update status.',
      onError: () => {
        setCoupons(prev => prev.map(c => ((c._id || c.id) === (row._id || row.id) ? { ...c, status: !next } : c)));
      },
    });
  }, [router]);

  const handleToggleStatusById = React.useCallback(async (id: string, value: boolean) => {
    const row = coupons.find(c => (c._id || c.id) === id);
    if (row) await handleToggleStatus(row, value);
  }, [coupons, handleToggleStatus]);

  const clearSelectedData = () => {
    setClearSelectedRows(prev => !prev);
    setSelectedRows([]);
    router.refresh();
  };

  const handleBulkApply = React.useCallback(async () => {
    await ServerActions.HandleFunction.handleBulkApplyCommon({
      selectedRows,
      actionFilter,
      activeStatusFilter,
      items: coupons,
      setItems: setCoupons,
      bulkDeleteAction: ServerActions.ServerActionslib.bulkDeleteCouponsAction,
      bulkUpdateStatusAction: ServerActions.ServerActionslib.bulkUpdateCouponsStatusAction,
      idSelector: (r) => r._id || r.id,
      statusProp: 'status',
      clearSelectedData
    });
  }, [selectedRows, actionFilter, activeStatusFilter, coupons, clearSelectedData]);

  const downloadPdf = async (): Promise<any[]> => {
    return await ServerActions.HandleFunction.handleDownloadCommon({
      selectedRows,
      searchParams,
      bulkGetSelectedAction: ServerActions.ServerActionslib.bulkGetSelectedCouponsAction,
      bulkGetAllAction: ServerActions.ServerActionslib.bulkGetCouponsAction,
      setDownloadData,
    });
  };

  const handleEditModal = React.useCallback((coupon: SuperAdminTypes.CouponTypes.Coupon) => {
    setEditingCoupon(coupon);
    setShowEditModal(true);
  }, []);

  const handleViewDetails = React.useCallback((coupon: SuperAdminTypes.CouponTypes.Coupon) => {
    setSelectedCoupon(coupon);
    setShowDetailsModal(true);
  }, []);

  const tableColumns = React.useMemo(() => WebComponents.WebCommonComponents.CommonComponents.createColumns<SuperAdminTypes.CouponTypes.Coupon>({
    fields: [
      {
        name: Constants.superadminConstants.couponcodelabel,
        selector: (row) => row.code || '-',
        sortable: true,
        // width: "12%"
      },
      {
        name: Constants.superadminConstants.descriptionlabel,
        selector: (row) => row.description || '-',
        sortable: true,
        width: "18%"
      },
      {
        name: "Used",
        selector: (row) => (row.usageCount ?? 0).toString(),
        sortable: true,
        // width: "8%"
      },
      {
        name: "Max/User",
        selector: (row) => (row.maxUsagePerUser ?? 1).toString(),
        sortable: true,
        // width: "8%"
      },
      {
        name: Constants.superadminConstants.startdatelabel,
        selector: (row) => {
          const dateStr = row.start_date || row.startDate;
          if (!dateStr) return '-';
          try {
            return new Date(dateStr).toLocaleDateString();
          } catch {
            return '-';
          }
        },
        sortable: true,
        // width: "10%"
      },
      {
        name: Constants.superadminConstants.enddatelabel,
        selector: (row) => {
          const dateStr = row.end_date || row.endDate;
          if (!dateStr) return '-';
          try {
            return new Date(dateStr).toLocaleDateString();
          } catch {
            return '-';
          }
        },
        sortable: true,
        // width: "10%"
      },
      {
        name: Constants.superadminConstants.typelabel,
        selector: (row) => row.type || '-',
        sortable: true,
        // width: "10%"
      },
      {
        name: Constants.superadminConstants.discountamountlabel,
        selector: (row) => row.discount_amount?.toString() || '-',
        cell: (row) => (
          <span className="text-textMain dark:text-white">{formatFunctionsUtils.formatDiscountAmount(row, primaryCurrency)}</span>
        ),
        sortable: true,
        // width: "12%"
      },
      {
        name: Constants.superadminConstants.limitlabel,
        selector: (row) => row.limit?.toString() || '-',
        sortable: true,
        // width: "8%"
      },
      {
        name: "Plans",
        selector: (row) => {
          if (!row.plans || !Array.isArray(row.plans)) return "-";
          return getPlanNames(row.plans, plans);
        },
        cell: (row) => {
          if (!row.plans || !Array.isArray(row.plans) || row.plans.length === 0) {
            return <span className="text-sm text-gray-500 dark:text-gray-400">-</span>;
          }
          return (
            <div className="flex flex-wrap gap-1 py-1">
              {row.plans.map((plan: any, index: number) => {
                let planName = 'Unknown';
                if (typeof plan === 'string') {
                  const planData = plans.find(p => p._id === plan);
                  planName = planData ? planData.name : 'Unknown';
                } else {
                  planName = (plan as { _id: string; name: string })?.name || 'Unknown';
                }
                return (
                  <WebComponents.UiComponents.UiWebComponents.Badge key={index} className="bg-primary text-white text-xs whitespace-nowrap w-fit">
                    {planName}
                  </WebComponents.UiComponents.UiWebComponents.Badge>
                );
              })}
            </div>
          );
        },
        sortable: true,
        // width: "12%"
      },
    ],
    status: {
      name: Constants.superadminConstants.statuslabel,
      idSelector: (row) => row._id || row.id,
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
          <WebComponents.UiComponents.UiWebComponents.Button size="icon" variant="deleteaction" onClick={() => handleDelete(row._id || row.id)}>
            <FaTrash className="w-4 h-4" />
          </WebComponents.UiComponents.UiWebComponents.Button>
        ),
      },
    ],
  }), [handleToggleStatusById, handleViewDetails, handleEditModal, handleDelete, primaryCurrency, plans]);

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-lg sm:text-lg md:text-xl lg:text-2xl font-medium text-textMain dark:text-white truncate">
            {Constants.superadminConstants.couponheading}
            {(() => {
              if (!showModal && !showEditModal) return "";
              const modalTitle = showModal ? Constants.superadminConstants.addcoupon : Constants.superadminConstants.editcoupon;
              return ` > ${modalTitle}`;
            })()}
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-textSmall pt-2">
            {Constants.superadminConstants.couponbio}
          </p>
        </div>
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
          {showModal || showEditModal ? <><HiArrowLeft className="w-4 h-4" /> {Constants.superadminConstants.back}</> : <><HiPlus className="w-4 h-4" /> {Constants.superadminConstants.add}</>}
        </WebComponents.UiComponents.UiWebComponents.Button>
      </div>

      {!showModal && !showEditModal && (
        <div className="bg-white dark:bg-darkFilterbar rounded-[4px] h-full w-full mt-4 overflow-hidden">
          <WebComponents.WebCommonComponents.CommonComponents.CommonFilterBar
            actionFilter={actionFilter}
            onActionFilterChange={(value: string) => {
              setActionFilter(value);
              if (value !== "Status") {
                setActiveStatusFilter("All");
              }
            }}
            actionOptions={Constants.commonConstants.actionOptions}
            activeStatusFilter={activeStatusFilter}
            onActiveStatusFilterChange={setActiveStatusFilter}
            activeStatusOptions={Constants.commonConstants.activeStatusOptions}
            selectedCount={selectedRows.length}
            onApply={handleBulkApply}
            categoryFilter={taxTypeFilter}
            onCategoryFilterChange={setTaxTypeFilter}
            categoryOptions={typeOptions as any}
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
                    disabled={coupons.length === 0}
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
                    disabled={coupons.length === 0}
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
      )}

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
            <WebComponents.SuperAdminComponents.SuperadminWebComponents.SuperAdminForms.CouponForm
              onSubmit={handleEdit}
              coupon={editingCoupon}
              plans={plans}
            />
          ) : (
            <WebComponents.SuperAdminComponents.SuperadminWebComponents.SuperAdminForms.CouponForm
              onSubmit={handleAdd}
              plans={plans}
            />
          )}
        </WebComponents.UiComponents.UiWebComponents.AdminFormModal>
      )}

      {showDetailsModal && selectedCoupon && (
        <WebComponents.SuperAdminComponents.SuperadminWebComponents.SuperadminModels.CouponDetailsModal
          coupon={selectedCoupon}
          plans={plans}
          onClose={() => setShowDetailsModal(false)}
          primaryCurrency={primaryCurrency}
        />
      )}
    </>
  );
}
