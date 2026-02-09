"use client";
import React from "react";
import { useRouter, useSearchParams} from "next/navigation";
import Image from 'next/image';
import { FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import { HiArrowLeft, HiPlus } from "react-icons/hi";
import { ServerActions } from "@/lib";
import { Constants } from "@/constant";
import { customHooks } from "@/hooks";
import { WebComponents } from "@/components";
import { SuperAdminTypes, PaginationType } from "@/types";

const getId = (t: SuperAdminTypes.TaxTypes.Tax) => (t._id || t.id || "");
const isActive = (t: SuperAdminTypes.TaxTypes.Tax) => (typeof t.status === 'boolean' ? t.status : t.status === 'Active');
const getType = (t: SuperAdminTypes.TaxTypes.Tax) => (t.type || t.valueType || 'Fixed');

// Helper function to format tax value with currency symbol or percentage
const formatTaxValue = (tax: SuperAdminTypes.TaxTypes.Tax,
  primaryCurrency: {
    symbol?: string;
    position?: string;
  }
) => {
  const type = getType(tax);
  const value = tax.value.toString();

  if (type === "Percentage") {
    return `${value}%`;
  }

  // For Fixed type, use currency symbol
  const symbol = primaryCurrency?.symbol || "";
  const position = primaryCurrency?.position || "Left";

  if (position === "Right") {
    return `${value}${symbol}`;
  } else {
    return `${symbol}${value}`;
  }
};

// Helper function to format tax value for PDF export (normalizes rupee symbol for jsPDF compatibility)
const formatTaxValueForExport = (
  tax: SuperAdminTypes.TaxTypes.Tax,
  primaryCurrency?: {
    symbol?: string;
    position?: string;
  }
) => {
  const type = getType(tax);
  const value = tax.value.toString();

  if (type === "Percentage") {
    return `${value}%`;
  }

  // For Fixed type, normalize currency symbol for PDF compatibility
  let symbol = primaryCurrency?.symbol || "";
  
  // Normalize rupee symbol for PDF compatibility (jsPDF has issues with Unicode ₹)
  // Replace ₹ with Rs. for better PDF rendering
  if (symbol === '₹' || symbol === '\u20B9') {
    symbol = 'Rs.';
  }
  
  const position = primaryCurrency?.position || "Left";

  if (position === "Right") {
    return `${value} ${symbol}`;
  } else {
    return `${symbol}${value}`;
  }
};

export default function Tax({
  initialTaxes,
  initialPagination,
  primaryCurrency
}: {
  readonly initialTaxes: SuperAdminTypes.TaxTypes.Tax[];
  readonly initialPagination: PaginationType.Pagination;
  readonly primaryCurrency: {
    symbol?: string;
    position?: string;
  };
}) {
  const [taxes, setTaxes] = React.useState<SuperAdminTypes.TaxTypes.Tax[]>(initialTaxes);
  const [pagination, setPagination] = React.useState<PaginationType.Pagination>(initialPagination);
  const [loading, setLoading] = React.useState(false);
  const [showModal, setShowModal] = React.useState(false);
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [showDetailsModal, setShowDetailsModal] = React.useState(false);
  const [editingTax, setEditingTax] = React.useState<SuperAdminTypes.TaxTypes.Tax | null>(null);
  const [selectedTax, setSelectedTax] = React.useState<SuperAdminTypes.TaxTypes.Tax | null>(null);
  const [actionFilter, setActionFilter] = React.useState("All");
  const [activeStatusFilter, setActiveStatusFilter] = React.useState("All");
  const [selectedRows, setSelectedRows] = React.useState<SuperAdminTypes.TaxTypes.Tax[]>([]);
  const [clearSelectedRows, setClearSelectedRows] = React.useState(false);
  const [downloadData, setDownloadData] = React.useState([]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { searchTerm, setSearchTerm, statusFilter, setStatusFilter, filteredData } = customHooks.useListFilters<SuperAdminTypes.TaxTypes.Tax>(
    taxes,
  );

  // Sync state with props when URL params change (server re-fetches data)
  React.useEffect(() => {
    setTaxes(initialTaxes);
    setPagination(initialPagination);
  }, [initialTaxes]);

  // Reset action filter when no rows are selected
  React.useEffect(() => {
    if (selectedRows.length === 0) {
      setActionFilter('All');
      setActiveStatusFilter('All');
    }
  }, [selectedRows]);

  // Export columns
  const exportColumns = React.useMemo(() => {
    return WebComponents.WebCommonComponents.CommonComponents.generateExportColumns<SuperAdminTypes.TaxTypes.Tax>([
      {
        key: 'name',
        label: Constants.superadminConstants.taxname,
        accessor: (row) => row.name || '-',
        pdfWidth: 30
      },
      {
        key: 'type',
        label: Constants.superadminConstants.taxtypelabel,
        accessor: (row) => getType(row),
        pdfWidth: 20
      },
      {
        key: 'value',
        label: Constants.superadminConstants.taxvaluelabel,
        accessor: (row) => formatTaxValueForExport(row, primaryCurrency),
        pdfWidth: 25
      },
      {
        key: 'status',
        label: Constants.superadminConstants.statuslabel,
        accessor: (row) => isActive(row) ? 'Active' : 'Inactive',
        pdfWidth: 25
      }
    ]);
  }, [primaryCurrency]);

  // Handlers
  const handleAdd = async (formData: SuperAdminTypes.TaxTypes.TaxFormData) => {
    await ServerActions.HandleFunction.handleAddCommon({
      formData,
      createAction: ServerActions.ServerActionslib.createTaxAction,
      setLoading,
      setShowModal,
      router,
      successMessage: 'Tax added successfully.',
      errorMessage: 'Failed to add tax.',
      onSuccess: (result) => {
        if (result?.data?.data) {
          setTaxes(prev => [...prev, result.data.data]);
        }
      },
    });
  };

  const handleEdit = async (formData: SuperAdminTypes.TaxTypes.TaxFormData) => {
    await ServerActions.HandleFunction.handleEditCommon({
      formData,
      editingItem: editingTax,
      getId: (item) => getId(item),
      updateAction: (id, data) => ServerActions.ServerActionslib.updateTaxAction(id as string, data),
      setLoading,
      setShowEditModal,
      setEditingItem: setEditingTax,
      router,
      successMessage: 'Tax updated successfully.',
      errorMessage: 'Failed to update tax.',
      onSuccess: (result) => {
        if (result?.data?.data && editingTax) {
          setTaxes(prev => prev.map(t => getId(t) === getId(editingTax) ? result.data.data : t));
        }
      },
    });
  };

  const handleDelete = async (id: string) => {
    await ServerActions.HandleFunction.handleDeleteCommon({
      id,
      deleteAction: (id) => ServerActions.ServerActionslib.deleteTaxAction(id as string),
      setLoading,
      router,
      successMessage: 'The tax has been deleted.',
      errorMessage: 'Failed to delete tax.',
      onSuccess: () => {
        setTaxes(prev => prev.filter(t => getId(t) !== id));
      },
    });
  };

  const handleToggleStatus = React.useCallback(async (row: SuperAdminTypes.TaxTypes.Tax, next: boolean) => {
    setTaxes(prev => prev.map(t => (getId(t) === getId(row) ? { ...t, status: next } as SuperAdminTypes.TaxTypes.Tax : t)));
    await ServerActions.HandleFunction.handleToggleStatusCommon({
      row,
      next,
      getId: (item) => getId(item),
      preparePayload: () => ({
        name: row.name,
        type: getType(row),
        value: row.value,
        status: next,
      }),
      updateAction: (id, data) => ServerActions.ServerActionslib.updateTaxAction(id as string, data),
      setLoading,
      router,
      successMessage: `Status updated to ${next ? 'Active' : 'Inactive'}.`,
      errorMessage: 'Failed to update status.',
      onError: () => {
        setTaxes(prev => prev.map(t => (getId(t) === getId(row) ? { ...t, status: !next } as SuperAdminTypes.TaxTypes.Tax : t)));
      },
    });
  }, [router]);

  const handleToggleStatusById = React.useCallback(async (id: string, next: boolean) => {
    const row = taxes.find(t => getId(t) === id);
    if (row) await handleToggleStatus(row, next);
  }, [taxes, handleToggleStatus]);

  const handleViewDetails = React.useCallback((tax: SuperAdminTypes.TaxTypes.Tax) => {
    setSelectedTax(tax);
    setShowDetailsModal(true);
  }, []);

  const handleEditModal = React.useCallback((tax: SuperAdminTypes.TaxTypes.Tax) => {
    setEditingTax(tax);
    setShowEditModal(true);
  }, []);

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
      items: taxes,
      setItems: setTaxes,
      bulkDeleteAction: ServerActions.ServerActionslib.bulkDeleteTaxesAction,
      bulkUpdateStatusAction: ServerActions.ServerActionslib.bulkUpdateTaxesStatusAction,
      clearSelectedData,
      idSelector: (r) => getId(r),
      statusProp: 'status',
    });
  }, [selectedRows, actionFilter, activeStatusFilter, taxes]);

  const downloadPdf = async (): Promise<any[]> => {
    return await ServerActions.HandleFunction.handleDownloadCommon({
      selectedRows,
      searchParams,
      bulkGetSelectedAction: ServerActions.ServerActionslib.bulkGetSelectedTaxesAction,
      bulkGetAllAction: ServerActions.ServerActionslib.bulkGetTaxesAction,
      setDownloadData,
      idSelector: (item) => getId(item),
    });
  };

  const tableColumns = React.useMemo(() => WebComponents.WebCommonComponents.CommonComponents.createColumns<SuperAdminTypes.TaxTypes.Tax>({
    fields: [
      {
        name: Constants.superadminConstants.taxname,
        selector: (row) => row.name,
        sortable: true,
        width: "25%"
      },
      {
        name: Constants.superadminConstants.taxtypelabel,
        selector: (row) => getType(row),
        sortable: true,
        width: "20%"
      },
      {
        name: Constants.superadminConstants.taxvaluelabel,
        selector: (row) => row.value.toString(),
        cell: (row) => (
          <span className="text-textMain dark:text-white">{formatTaxValue(row, primaryCurrency)}</span>
        ),
        sortable: true,
        width: "20%"
      },
    ],
    status: {
      name: Constants.superadminConstants.statuslabel,
      idSelector: (row) => getId(row),
      valueSelector: (row) => isActive(row),
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
          <WebComponents.UiComponents.UiWebComponents.Button size="icon" variant="deleteaction" onClick={() => handleDelete(getId(row))}>
            <FaTrash className="w-4 h-4" />
          </WebComponents.UiComponents.UiWebComponents.Button>
        ),
      },
    ],
  }), [handleToggleStatusById, handleViewDetails, handleEditModal, handleDelete, primaryCurrency]);

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-lg sm:text-lg md:text-xl lg:text-2xl font-medium text-textMain dark:text-white truncate">
            {Constants.superadminConstants.taxheading}
            {(() => {
              if (!showModal && !showEditModal) return "";
              const modalTitle = showModal ? Constants.superadminConstants.addTax : Constants.superadminConstants.editTax;
              return ` > ${modalTitle}`;
            })()}
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-textSmall pt-2">
            {Constants.superadminConstants.taxbio}
          </p>
        </div>
        <WebComponents.UiComponents.UiWebComponents.Button
          variant="addBackButton"
          onClick={() => {
            if (showModal || showEditModal) {
              setShowModal(false);
              setShowEditModal(false);
              setEditingTax(null);
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
            showCategoryFilter={false}
            statusFilter={statusFilter}
            onStatusFilterChange={(value: string) => {
              const validValue = value === "Active" || value === "Inactive" ? value : "All";
              setStatusFilter(validValue);
            }}
            statusOptions={[
              { label: "All Status", value: "All" },
              { label: "Active", value: "Active" },
              { label: "Inactive", value: "Inactive" },
            ]}
            searchTerm={searchTerm}
            onSearchTermChange={setSearchTerm}
            renderExports={
              <>
                <WebComponents.UiComponents.UiWebComponents.DownloadCSV
                  data={downloadData}
                  columns={exportColumns.csvColumns}
                  filename={`taxes-${new Date().toISOString().split('T')[0]}.csv`}
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
                    disabled={taxes.length === 0}
                  >
                    <Image src={Constants.assetsIcon.assets.csv} alt="CSV" width={28} height={28} className="w-5 h-5 sm:w-6 sm:h-6 md:w-6 md:h-6 lg:w-7 lg:h-7 xl:w-7 xl:h-7 2xl:w-7 2xl:h-7" />
                  </button>
                </WebComponents.UiComponents.UiWebComponents.DownloadCSV>
                <WebComponents.UiComponents.UiWebComponents.DownloadPDF
                  data={downloadData}
                  columns={exportColumns.pdfColumns}
                  filename={`taxes-${new Date().toISOString().split('T')[0]}.pdf`}
                  title="Taxes Report"
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
                    disabled={taxes.length === 0}
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
          formId="tax-form"
          onClose={() => {
            setShowModal(false);
            setShowEditModal(false);
            setEditingTax(null);
          }}
          loading={loading}
        >
          {editingTax ? (
            <WebComponents.SuperAdminComponents.SuperadminWebComponents.SuperAdminForms.TaxForm
              onSubmit={handleEdit}
              tax={editingTax}
            />
          ) : (
            <WebComponents.SuperAdminComponents.SuperadminWebComponents.SuperAdminForms.TaxForm onSubmit={handleAdd} />
          )}
        </WebComponents.UiComponents.UiWebComponents.AdminFormModal>
      )}

      {showDetailsModal && selectedTax && (
        <WebComponents.SuperAdminComponents.SuperadminWebComponents.SuperadminModels.TaxDetailsModal
          tax={selectedTax}
          primaryCurrency={primaryCurrency}
          onClose={() => setShowDetailsModal(false)}
        />
      )}
    </>
  );
}
