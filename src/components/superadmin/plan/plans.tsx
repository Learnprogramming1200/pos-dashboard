"use client";

import React from "react";
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FaEdit, FaEye, FaFileAlt, FaTrash } from "react-icons/fa";
import { HiArrowLeft, HiPlus } from "react-icons/hi";
import { Constants } from "@/constant";
import { ServerActions } from "@/lib";
import { WebComponents } from "@/components";
import { SuperAdminTypes,PaginationType } from "@/types";
import { customHooks } from "@/hooks";

// Helper function to format price with currency symbol and position
const formatPrice = (
  price: number | string | undefined | null,
  currency?:SuperAdminTypes.SettingTypes.CurrencySettingsTypes.CurrencyData,
  formattedPrice?: string
) => {
  if (price === null || price === undefined || price === '') {
    return '-';
  }
  const priceValue = formattedPrice || (typeof price === 'number' ? price.toFixed(2) : String(price));
  if (!currency || typeof currency !== 'object' || !currency.symbol) {
    return `$${priceValue}`;
  }
  const symbol = currency.symbol || '';
  // Handle position dynamically - case insensitive check
  const position = String(currency.position || 'Left').trim();
  const isRight = position.toLowerCase() === 'right';
  if (isRight) {
    return `${priceValue}${symbol}`;
  } else {
    return `${symbol}${priceValue}`;
  }
};

// Helper function to format discount with currency symbol for fixed type or % for percentage type
const formatDiscount = (
  discount: number | string | undefined | null,
  discountType: string | undefined | null,
  currency?: SuperAdminTypes.SettingTypes.CurrencySettingsTypes.CurrencyData
) => {
  if (discount === null || discount === undefined || !discountType) {
    return '-';
  }

  const discountValue = typeof discount === 'number' ? discount : parseFloat(String(discount));
  if (isNaN(discountValue)) {
    return '-';
  }

  const typeLower = String(discountType).toLowerCase();

  if (typeLower === 'percentage') {
    return `${discountValue}%`;
  } else if (typeLower === 'fixed') {
    // Format fixed discount with currency symbol
    if (!currency || typeof currency !== 'object' || !currency.symbol) {
      return `${discountValue}`;
    }
    const symbol = currency.symbol || '';
    // Handle position dynamically - case insensitive check
    const position = String(currency.position || 'Left').trim();
    const isRight = position.toLowerCase() === 'right';

    if (isRight) {
      return `${discountValue}${symbol}`;
    } else {
      return `${symbol}${discountValue}`;
    }
  }

  return '-';
};

// Helper function to format tax value with currency symbol for fixed type or % for percentage type
const formatTaxValue = (
  taxValue: number | string | undefined | null,
  taxType: string | undefined | null,
  currency?: {
    symbol?: string;
    position?: string;
  }
) => {
  if (taxValue === null || taxValue === undefined || !taxType) {
    return '';
  }

  const value = typeof taxValue === 'number' ? taxValue : parseFloat(String(taxValue));
  if (isNaN(value)) {
    return '';
  }

  const type = String(taxType);

  if (type === 'Percentage') {
    return `${value}%`;
  } else {
    // Format fixed tax with currency symbol
    if (!currency || typeof currency !== 'object' || !currency.symbol) {
      return `${value}`;
    }
    const symbol = currency.symbol || '';
    // Handle position dynamically - case insensitive check
    const position = String(currency.position || 'Left').trim();
    const isRight = position.toLowerCase() === 'right';

    if (isRight) {
      return `${value}${symbol}`;
    } else {
      return `${symbol}${value}`;
    }
  }
};

// (Table columns are built below using the shared createColumns helper)
export default function Plan({initialPlans,initialTaxes,initialPagination}: {
  readonly initialPlans: SuperAdminTypes.PlanTypes.Plan[];
  readonly initialTaxes: SuperAdminTypes.TaxTypes.Tax[];
  readonly initialPagination: PaginationType.Pagination
}) {
  const router = useRouter();
  const [plans, setPlans] = React.useState<SuperAdminTypes.PlanTypes.Plan[]>(initialPlans);
  const [taxes, setTaxes] = React.useState<SuperAdminTypes.TaxTypes.Tax[]>(initialTaxes);
  const [pagination, setPagination] = React.useState<PaginationType.Pagination>(initialPagination);
  const [loading, setLoading] = React.useState(false);
  const [showModal, setShowModal] = React.useState(false);
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [showDetailsModal, setShowDetailsModal] = React.useState(false);
  const [editingPlan, setEditingPlan] = React.useState<SuperAdminTypes.PlanTypes.Plan | null>(null);
  const [selectedPlan, setSelectedPlan] = React.useState<SuperAdminTypes.PlanTypes.Plan | null>(null);
  const [actionFilter, setActionFilter] = React.useState("All");
  const [activeStatusFilter, setActiveStatusFilter] = React.useState("All");
  const [selectedRows, setSelectedRows] = React.useState<SuperAdminTypes.PlanTypes.Plan[]>([]);
  const [clearSelectedRows, setClearSelectedRows] = React.useState(false);

  const { searchTerm, setSearchTerm, statusFilter, setStatusFilter, filteredData } =
    customHooks.useListFilters<SuperAdminTypes.PlanTypes.Plan>(plans);

  // Sync state with props when URL params change (server re-fetches data)
  React.useEffect(() => {
    setPlans(initialPlans);
    if (initialPagination) {
      setPagination(initialPagination);
    }
  }, [initialPlans]);

  // Reset action filter when no rows are selected
  React.useEffect(() => {
    if (selectedRows.length === 0) {
      setActionFilter('All');
      setActiveStatusFilter('All');
    }
  }, [selectedRows]);

  // clear selected data
  const clearSelectedData = () => {
    setClearSelectedRows(prev => !prev);
    setSelectedRows([]);
    router.refresh();
  }

  // Open edit modal
  const handleEditModal = React.useCallback((plan: SuperAdminTypes.PlanTypes.Plan) => {
    setEditingPlan(plan);
    setShowEditModal(true);
  }, []);

  // Toggle status handler
  const handleToggleStatusRow = React.useCallback(async (row: SuperAdminTypes.PlanTypes.Plan, next: boolean) => {
    // Optimistic update
    setPlans(prev => prev.map(p => (p._id === row._id ? { ...p, status: next } : p)));
    await ServerActions.HandleFunction.handleToggleStatusCommon({
      row,
      next,
      getId: (item) => item._id,
      preparePayload: () => ({ status: next }),
      updateAction: (id, data) => ServerActions.ServerActionslib.updatePlanAction(id as string, data as any),
      setLoading,
      router,
      successMessage: `Status updated to ${next ? 'Active' : 'Inactive'}.`,
      errorMessage: 'Failed to update status.',
      onError: () => {
        setPlans(prev => prev.map(p => (p._id === row._id ? { ...p, status: !next } : p)));
      },
    });
  }, [router]);

  const handleToggleStatus = React.useCallback(async (id: string, next: boolean) => {
    const row = plans.find(p => p._id === id);
    if (row) await handleToggleStatusRow(row, next);
  }, [plans, handleToggleStatusRow]);

  // CSV and PDF export columns
  const exportColumns = React.useMemo(() => {
    return WebComponents.WebCommonComponents.CommonComponents.generateExportColumns<SuperAdminTypes.PlanTypes.Plan>([
      {
        key: 'name',
        label: 'Plan Name',
        accessor: (row) => row.name || '-',
        pdfWidth: 45,
      },
      {
        key: 'duration',
        label: 'Duration',
        accessor: (row) => (row as any).duration || '-',
        pdfWidth: 30,
      },
      {
        key: 'price',
        label: 'Price',
        accessor: (row) => {
          const price = (row as any).price;
          const formattedPrice = (row as any).formattedPrice;
          const currency = (row as any).currency;
          return formatPrice(price, currency, formattedPrice);
        },
        pdfWidth: 35,
      },
      {
        key: 'discount',
        label: 'Discount',
        accessor: (row) => {
          const discount = (row as any).discount;
          const discountType = (row as any).discountType;
          const currency = (row as any).currency;
          return formatDiscount(discount, discountType, currency);
        },
        pdfWidth: 30,
      },
      {
        key: 'taxes',
        label: 'Taxes',
        accessor: (row) => {
          const planTaxes = (row as any).taxes;
          const currency = (row as any).currency;
          if (!planTaxes || !Array.isArray(planTaxes) || planTaxes.length === 0) return "-";

          return planTaxes.map((tax: any) => {
            if (typeof tax === 'object' && tax !== null) {
              const taxName = tax.name || "Unnamed Tax";
              const taxValue = formatTaxValue(tax.value, tax.type, currency);
              return `${taxName} (${taxValue})`;
            }
            const taxId = typeof tax === 'string' ? tax : tax?._id;
            if (!taxId) return "";
            const foundTax = taxes.find(t => (t as any)._id === taxId);
            if (foundTax) {
              const taxName = (foundTax as any).name || "Unnamed Tax";
              const taxValue = formatTaxValue((foundTax as any).value, (foundTax as any).type, currency);
              return `${taxName} (${taxValue})`;
            }
            return "Tax Selected";
          }).filter(Boolean).join(", ");
        },
        pdfWidth: 40,
      },
      {
        key: 'totalPrice',
        label: 'Total Price',
        accessor: (row) => {
          const totalPrice = (row as any).totalPrice;
          const currency = (row as any).currency;
          return formatPrice(totalPrice, currency);
        },
        pdfWidth: 35,
      },
      {
        key: 'status',
        label: 'Status',
        accessor: (row) => row.status ? 'Active' : 'Inactive',
        pdfWidth: 25,
      }
    ]);
  }, [taxes]);
  // Add Plan handler
  const handleAdd = async (formData: SuperAdminTypes.PlanTypes.PlanFormData) => {
    await ServerActions.HandleFunction.handleAddCommon({
      formData,
      createAction: ServerActions.ServerActionslib.createPlanAction,
      setLoading,
      setShowModal,
      router,
      successMessage: 'Plan created successfully.',
      errorMessage: 'Failed to add plan.',
      onSuccess: (result) => {
        const newPlan = (result as any)?.data?.data || (result as any)?.data;
        if (newPlan) {
          // Some APIs don't echo tab fields back; keep UI consistent with submitted tab
          const merged = {
            ...newPlan,
            planCategory: (formData as any).planCategory,
            isTrial: (formData as any).isTrial,
          };
          setPlans(prev => [...prev, merged]);
        }
      },
    });
  };
  // Edit Plan handler
  const handleEdit = async (formData: SuperAdminTypes.PlanTypes.PlanFormData) => {
    await ServerActions.HandleFunction.handleEditCommon({
      formData,
      editingItem: editingPlan,
      getId: (item) => item._id,
      updateAction: (id, data) => ServerActions.ServerActionslib.updatePlanAction(id as string, data as any),
      setLoading,
      setShowEditModal,
      setEditingItem: setEditingPlan,
      router,
      successMessage: 'Plan updated successfully.',
      errorMessage: 'Failed to update plan.',
      onSuccess: (result) => {
        const updatedPlan = (result as any)?.data?.data || (result as any)?.data;
        if (updatedPlan && editingPlan) {
          // Some APIs don't echo tab fields back; keep UI consistent with submitted tab
          const merged = {
            ...updatedPlan,
            planCategory: (formData as any).planCategory,
            isTrial: (formData as any).isTrial,
          };
          setPlans(prev => prev.map(p => (p._id === editingPlan._id ? merged : p)));
        }
      },
    });
  };
  // View Details handler
  const handleViewDetails = React.useCallback((plan: SuperAdminTypes.PlanTypes.Plan) => {
    setSelectedPlan(plan);
    setShowDetailsModal(true);
  }, []);

  // Delete Plan handler
  const handleDelete = async (id: string) => {
    await ServerActions.HandleFunction.handleDeleteCommon({
      id,
      deleteAction: (id) => ServerActions.ServerActionslib.deletePlanAction(id as string),
      setLoading,
      router,
      successMessage: 'The plan has been deleted.',
      errorMessage: 'Failed to delete plan.',
      onSuccess: () => {
        setPlans(prev => prev.filter(p => p._id !== id));
      },
    });
  };
  const tableColumns = React.useMemo(
    () =>
      WebComponents.WebCommonComponents.CommonComponents.createColumns<SuperAdminTypes.PlanTypes.Plan>({
        fields: [
          {
            name: Constants.superadminConstants.plannamelabel,
            selector: (row) => row.name || "-",
            sortable: true,
            width: "16%",
          },
          {
            name: Constants.superadminConstants.durationlabel,
            selector: (row) => (row as any).duration || "-",
            sortable: true,
            // width: "10%",
          },
          {
            name: Constants.superadminConstants.planpricelabel,
            selector: (row) => {
              const price = (row as any).price;
              const formattedPrice = (row as any).formattedPrice;
              const currency = (row as any).currency;
              return formatPrice(price, currency, formattedPrice);
            },
            sortable: true,
            // width: "12%",
          },
          {
            name: Constants.superadminConstants.discountlabel,
            selector: (row) => {
              const discount = (row as any).discount;
              const discountType = (row as any).discountType;
              const currency = (row as any).currency;
              return formatDiscount(discount, discountType, currency);
            },
            sortable: true,
            // width: "12%",
          },
          {
            name: Constants.superadminConstants.taxlabel,
            selector: (row) => {
              const planTaxes = (row as any).taxes;
              const currency = (row as any).currency;
              if (!planTaxes || !Array.isArray(planTaxes) || planTaxes.length === 0) return "-";

              return planTaxes
                .map((tax: any) => {
                  if (typeof tax === "object" && tax !== null) {
                    const taxName = tax.name || "Unnamed Tax";
                    const taxValue = formatTaxValue(tax.value, tax.type, currency);
                    return `${taxName} (${taxValue})`;
                  }

                  const taxId = typeof tax === "string" ? tax : tax?._id;
                  if (!taxId) return "";

                  const foundTax = taxes.find((t) => (t as any)._id === taxId);
                  if (foundTax) {
                    const taxName = (foundTax as any).name || "Unnamed Tax";
                    const taxValue = formatTaxValue(
                      (foundTax as any).value,
                      (foundTax as any).type,
                      currency,
                    );
                    return `${taxName} (${taxValue})`;
                  }
                  return "Tax Selected";
                })
                .filter(Boolean)
                .join(", ");
            },
            sortable: true,
            // width: "22%",
          },
          {
            name: Constants.superadminConstants.totalpricelabel,
            selector: (row) => {
              const totalPrice = (row as any).totalPrice;
              const currency = (row as any).currency;
              return formatPrice(totalPrice, currency);
            },
            sortable: true,
            // width: "12%",
          },
        ],
        status: {
          name: Constants.superadminConstants.statuslabel,
          idSelector: (row) => row._id,
          valueSelector: (row) => !!row.status,
          onToggle: handleToggleStatus,
        },
        actions: [
          {
            render: (row) => (
              <WebComponents.UiComponents.UiWebComponents.Button
                size="icon"
                variant="viewaction"
                onClick={() => handleViewDetails(row)}
              >
                <FaEye className="w-4 h-4" />
              </WebComponents.UiComponents.UiWebComponents.Button>
            ),
          },
          {
            render: (row) => (
              <WebComponents.UiComponents.UiWebComponents.Button
                size="icon"
                variant="editaction"
                onClick={() => handleEditModal(row)}
              >
                <FaEdit className="w-4 h-4" />
              </WebComponents.UiComponents.UiWebComponents.Button>
            ),
          },
          {
            render: (row) => (
              <WebComponents.UiComponents.UiWebComponents.Button
                size="icon"
                variant="deleteaction"
                onClick={() => handleDelete(row._id)}
              >
                <FaTrash className="w-4 h-4" />
              </WebComponents.UiComponents.UiWebComponents.Button>
            ),
          },
        ],
      }),
    [taxes, handleToggleStatus, handleViewDetails, handleEditModal, handleDelete],
  );
  // Bulk apply handler (status update / delete)
  const handleBulkApply = React.useCallback(async () => {
    await ServerActions.HandleFunction.handleBulkApplyCommon({
      selectedRows,
      actionFilter,
      activeStatusFilter,
      items: plans,
      setItems: setPlans,
      bulkDeleteAction: ServerActions.ServerActionslib.bulkDeletePlansAction,
      bulkUpdateStatusAction: ServerActions.ServerActionslib.bulkUpdatePlansStatusAction,
      clearSelectedData,
      idSelector: (r) => r._id,
      statusProp: 'status',
    });
  }, [selectedRows, actionFilter, activeStatusFilter, plans, clearSelectedData]);
  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-lg sm:text-lg md:text-xl lg:text-2xl font-medium text-textMain dark:text-white truncate">
            {Constants.superadminConstants.planheading}
            {(() => {
              if (!showModal && !showEditModal) return "";
              const modalTitle = showModal ? Constants.superadminConstants.addplan : Constants.superadminConstants.editplan;
              return ` > ${modalTitle}`;
            })()}
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-textSmall pt-2">
            {Constants.superadminConstants.planbio}
          </p>
        </div>
        <WebComponents.UiComponents.UiWebComponents.Button
          variant="addBackButton"
          onClick={() => {
            if (showModal || showEditModal) {
              setShowModal(false);
              setShowEditModal(false);
              setEditingPlan(null);
            } else {
              setShowModal(true);
            }
          }}
        >
          {showModal || showEditModal
            ? <><HiArrowLeft className="w-4 h-4" /> {Constants.superadminConstants.back}</>
            : <><HiPlus className="w-4 h-4" /> {Constants.superadminConstants.add}</>}
        </WebComponents.UiComponents.UiWebComponents.Button>
      </div>

      {/* Show filters and table only when modal is not open */}
      {!showModal && !showEditModal && (
        <div className="bg-white dark:bg-darkFilterbar rounded-[4px] h-full w-full mt-4 overflow-hidden">
          <WebComponents.WebCommonComponents.CommonComponents.CommonFilterBar
            actionFilter={actionFilter}
            onActionFilterChange={(value) => {
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
            categoryFilter="All"
            onCategoryFilterChange={() => {}}
            categoryOptions={[]}
            statusFilter={statusFilter}
            onStatusFilterChange={(value) => setStatusFilter(value as any)}
            statusOptions={Constants.commonConstants.CommonFilterOptions.CommonStatusOptions}
            searchTerm={searchTerm}
            onSearchTermChange={setSearchTerm}
            renderExports={
              <>
                <WebComponents.UiComponents.UiWebComponents.DownloadCSV 
                  data={filteredData}
                  columns={exportColumns.csvColumns}
                  filename={`plans-${new Date().toISOString().split('T')[0]}.csv`}
                  onExport={() => {
                    WebComponents.UiComponents.UiWebComponents.SwalHelper.success({ text: 'CSV exported successfully.' });
                  }}
                >
                  <button
                    type="button"
                    className="rounded-[4px] bg-[#ffffff] dark:bg-[#3A3A3A] border border-[#D8D9D9] border-opacity-50 font-interTight font-normal hover:bg-[#e0e0e0] dark:hover:bg-[#4A4A4A] shadow-sm transition-colors duration-200 cursor-pointer flex-shrink-0 sm:px-1 md:px-2 lg:px-2 xl:px-2 2xl:px-2 px-2 py-[6.9px]"
                    aria-label="Download CSV"
                    title="Download CSV"
                    disabled={plans?.length === 0}
                  >
                    <Image src={Constants.assetsIcon.assets.csv} alt="CSV" width={28} height={28} className="w-5 h-5 sm:w-6 sm:h-6 md:w-6 md:h-6 lg:w-7 lg:h-7 xl:w-7 xl:h-7 2xl:w-7 2xl:h-7" />
                  </button>
                </WebComponents.UiComponents.UiWebComponents.DownloadCSV>
                <WebComponents.UiComponents.UiWebComponents.DownloadPDF
                  data={filteredData}
                  columns={exportColumns.pdfColumns}
                  filename={`plans-${new Date().toISOString().split('T')[0]}.pdf`}
                  title="Plans Report"
                  orientation="landscape"
                  onExport={() => {
                    WebComponents.UiComponents.UiWebComponents.SwalHelper.success({ text: 'PDF exported successfully.' });
                  }}
                >
                  <button
                    type="button"
                    className="rounded-[4px] bg-[#ffffff] dark:bg-[#3A3A3A] border border-[#D8D9D9] border-opacity-50 font-interTight font-normal hover:bg-[#e0e0e0] dark:hover:bg-[#4A4A4A] shadow-sm transition-colors duration-200 cursor-pointer flex-shrink-0 sm:px-1 md:px-2 lg:px-2 xl:px-2 2xl:px-2 px-2 py-[6.9px]"
                    aria-label="Download PDF"
                    title="Download PDF"
                    disabled={plans?.length === 0}
                  >
                    <Image src={Constants.assetsIcon.assets.pdf} alt="PDF" width={28} height={28} className="w-5 h-5 sm:w-6 sm:h-6 md:w-6 md:h-6 lg:w-7 lg:h-7 xl:w-7 xl:h-7 2xl:w-7 2xl:h-7" />
                  </button>
                </WebComponents.UiComponents.UiWebComponents.DownloadPDF>
              </>
            }
            showCategoryFilter={false}
          />
          <div>
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
        </div>
      )}

      {/* Show modal when open */}
      {(showModal || showEditModal) && (
        <WebComponents.SuperAdminComponents.SuperadminWebComponents.SuperAdminForms.PlanForm
          title={showModal ? "Add Plan" : "Edit Plan"}
          onClose={() => {
            setShowModal(false);
            setShowEditModal(false);
            setEditingPlan(null);
          }}
          onSubmit={showModal ? handleAdd : handleEdit}
          plan={editingPlan || undefined}
          taxes={taxes}
        />
      )}
      {/* Details Modal */}
      {showDetailsModal && selectedPlan && (
        <WebComponents.SuperAdminComponents.SuperadminWebComponents.SuperadminModels.PlanDetailsModal
          plan={selectedPlan}
          taxes={taxes}
          onClose={() => setShowDetailsModal(false)}
        />
      )}

    </>
  );
}

