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
import { AdminTypes, PaginationType } from "@/types";

export default function TaxManagement({
  initialTaxes,
  initialPagination,
}: {
  readonly initialTaxes: AdminTypes.taxTypes.Tax[];
  readonly initialPagination: PaginationType.Pagination;
}) {
  const [taxes, setTaxes] = React.useState<AdminTypes.taxTypes.Tax[]>(() =>
    (initialTaxes || []).map(t => ({ ...t, taxName: t.taxName || (t as any).name || "" }))
  );
  const [pagination, setPagination] = React.useState<PaginationType.Pagination>(initialPagination);
  const [loading, setLoading] = React.useState(false);
  const [showModal, setShowModal] = React.useState(false);
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [showDetailsModal, setShowDetailsModal] = React.useState(false);
  const [editingTax, setEditingTax] = React.useState<AdminTypes.taxTypes.Tax | null>(null);
  const [selectedTax, setSelectedTax] = React.useState<AdminTypes.taxTypes.Tax | null>(null);
  const [actionFilter, setActionFilter] = React.useState("All");
  const [activeStatusFilter, setActiveStatusFilter] = React.useState("All");
  const [selectedRows, setSelectedRows] = React.useState<AdminTypes.taxTypes.Tax[]>([]);
  const [clearSelectedRows, setClearSelectedRows] = React.useState(false);
  const [downloadData, setDownloadData] = React.useState([])
  const router = useRouter();
  const searchParams = useSearchParams();
  const { searchTerm, setSearchTerm, statusFilter, setStatusFilter, taxTypeFilter, setTaxTypeFilter, filteredData } = customHooks.useListFilters<AdminTypes.taxTypes.Tax>(
    taxes,
  );
  /* Permissions */
  const { checkPermission } = customHooks.useUserPermissions();

  const bulkActionOptions = React.useMemo(() => {
    const options = Constants.commonConstants.actionOptions;
    return options.filter(option => {
      if (option.value === 'Status') {
        return checkPermission("finance.tax", "update");
      }
      if (option.value === 'Delete') {
        return checkPermission("finance.tax", "delete");
      }
      return true;
    });
  }, [checkPermission]);

  const typeOptions = React.useMemo(() => [
    { name: 'All Types', value: 'All' },
    { name: Constants.adminConstants.inclusive as string, value: 'Inclusive' },
    { name: Constants.adminConstants.exclusive as string, value: 'Exclusive' }
  ], []);

  // Sync state with props when URL params change (server re-fetches data)
  React.useEffect(() => {
    const mapped = (initialTaxes || []).map(t => ({
      ...t,
      taxName: t.taxName || (t as any).name || ""
    }));
    setTaxes(mapped);
    setPagination(initialPagination);
  }, [initialTaxes]);

  // Reset action filter when no rows are selected
  React.useEffect(() => {
    if (selectedRows.length === 0) {
      setActionFilter('All');
      setActiveStatusFilter('All');
    }
  }, [selectedRows]);

  // CSV and PDF export columns
  const exportColumns = React.useMemo(() => {
    return WebComponents.WebCommonComponents.CommonComponents.generateExportColumns<AdminTypes.taxTypes.Tax>([
      {
        key: 'taxName',
        label: Constants.adminConstants.taxName,
        accessor: (row) => row.taxName || '-',
        pdfWidth: 45
      },
      {
        key: 'taxType',
        label: Constants.adminConstants.taxType,
        accessor: (row) => row.taxType || '-',
        pdfWidth: 35
      },
      {
        key: 'value',
        label: Constants.adminConstants.value,
        accessor: (row) => `${row.value}${row.valueType === 'Percentage' ? '%' : ''}`,
        pdfWidth: 25
      },
      {
        key: 'status',
        label: Constants.adminConstants.statusLabel,
        accessor: (row) => (typeof row.status === 'boolean' ? (row.status ? 'Active' : 'Inactive') : row.status || 'Inactive'),
        pdfWidth: 25
      },
      {
        key: 'createdAt',
        label: Constants.adminConstants.createdOn,
        accessor: (row) => row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '-',
        pdfWidth: 35
      }
    ]);
  }, []);

  // Add
  const handleAdd = async (formData: any) => {
    await ServerActions.HandleFunction.handleAddCommon({
      formData,
      createAction: ServerActions.ServerActionslib.createAdminTaxAction,
      setLoading,
      setShowModal,
      router,
      successMessage: Constants.adminConstants.createdSuccessfully,
      errorMessage: Constants.adminConstants.addFailed,
      onSuccess: (result) => {
        if (result?.data?.data) {
          const created = result.data.data;
          const mapped: AdminTypes.taxTypes.Tax = {
            _id: created._id,
            taxName: created.taxName || created.name,
            taxType: created.taxType,
            valueType: created.valueType,
            value: created.value,
            status: created.status,
            description: created.description,
            createdAt: created.createdAt,
            updatedAt: created.updatedAt,
          };
          setTaxes(prev => [mapped, ...prev]);
        }
      },
    });
  };

  // Edit
  const handleEdit = async (formData: any) => {
    await ServerActions.HandleFunction.handleEditCommon({
      formData,
      editingItem: editingTax,
      getId: (item) => item._id || "",
      updateAction: (id, data) =>
        ServerActions.ServerActionslib.updateAdminTaxAction(id.toString(), data),
      setLoading,
      setShowEditModal,
      setEditingItem: setEditingTax,
      router,
      successMessage: Constants.adminConstants.updatedSuccessfully,
      errorMessage: Constants.adminConstants.updateFailed,
      onSuccess: (result) => {
        if (result?.data?.data && editingTax) {
          const updated = result.data.data;
          const mapped: AdminTypes.taxTypes.Tax = {
            _id: updated._id,
            taxName: updated.taxName || updated.name,
            taxType: updated.taxType,
            valueType: updated.valueType,
            value: updated.value,
            status: updated.status,
            description: updated.description,
            createdAt: updated.createdAt,
            updatedAt: updated.updatedAt,
          };
          setTaxes(prev => prev.map(tax =>
            tax._id === editingTax._id ? mapped : tax
          ));
        }
      },
    });
  };

  // View Details
  const handleViewDetails = React.useCallback((tax: AdminTypes.taxTypes.Tax) => {
    setSelectedTax(tax);
    setShowDetailsModal(true);
  }, []);

  const handleToggleStatus = React.useCallback(async (row: AdminTypes.taxTypes.Tax, next: boolean) => {
    setTaxes(prev => prev.map(tax => (tax._id === row._id ? { ...tax, status: next } : tax)));
    await ServerActions.HandleFunction.handleToggleStatusCommon({
      row,
      next,
      getId: (item) => item._id || "",
      preparePayload: () => ({
        taxName: row.taxName || "",
        taxType: (row.taxType || "Inclusive") as "Inclusive" | "Exclusive",
        valueType: (row.valueType || "Percentage") as "Fixed" | "Percentage",
        value: row.value,
        status: next
      }),
      updateAction: (id, data) =>
        ServerActions.ServerActionslib.updateAdminTaxAction(id.toString(), data),
      setLoading,
      router,
      successMessage: `Status updated to ${next ? 'Active' : 'Inactive'}.`,
      errorMessage: 'Failed to update status.',
      onError: () => {
        setTaxes(prev => prev.map(tax => (tax._id === row._id ? { ...tax, status: !next } : tax)));
      },
    });
  }, [router]);

  const handleToggleStatusById = React.useCallback(
    async (id: string, next: boolean) => {
      const row = taxes.find(t => t._id === id);
      if (row) {
        await handleToggleStatus(row, next);
      }
    },
    [taxes, handleToggleStatus]
  );

  // Delete
  const handleDelete = async (id: string) => {
    await ServerActions.HandleFunction.handleDeleteCommon({
      id,
      deleteAction: (id: string | number) =>
        ServerActions.ServerActionslib.deleteAdminTaxAction(id.toString()),
      setLoading,
      router,
      successMessage: 'The tax configuration has been deleted.',
      errorMessage: 'Failed to delete tax.',
      onSuccess: () => {
        setTaxes(prev => prev.filter(tax => tax._id !== id));
      },
    });
  };

  // Open edit modal
  const handleEditModal = React.useCallback((tax: AdminTypes.taxTypes.Tax) => {
    setEditingTax(tax);
    setShowEditModal(true);
  }, []);

  const clearSelectedData = () => {
    setClearSelectedRows(prev => !prev);
    setSelectedRows([]);
    router.refresh();
  }

  // Bulk apply
  const handleBulkApply = React.useCallback(async () => {
    await ServerActions.HandleFunction.handleBulkApplyCommon({
      selectedRows,
      actionFilter,
      activeStatusFilter,
      items: taxes,
      setItems: setTaxes,
      bulkDeleteAction: ServerActions.ServerActionslib.bulkDeleteAdminTaxesAction,
      bulkUpdateStatusAction: ServerActions.ServerActionslib.bulkUpdateAdminTaxStatusAction,
      clearSelectedData,
      idSelector: (r) => r._id,
      statusProp: 'status',
    });
  }, [selectedRows, actionFilter, activeStatusFilter, taxes, clearSelectedData]);

  // Download
  const downloadPdf = async (): Promise<any[]> => {
    return await ServerActions.HandleFunction.handleDownloadCommon({
      selectedRows,
      searchParams,
      bulkGetSelectedAction: ServerActions.ServerActionslib.bulkGetSelectedAdminTaxAction,
      bulkGetAllAction: ServerActions.ServerActionslib.bulkGetAdminTaxesAction,
      setDownloadData,
    });
  };

  const tableColumns = React.useMemo(() => WebComponents.WebCommonComponents.CommonComponents.createColumns<AdminTypes.taxTypes.Tax>({
    fields: [
      {
        name: Constants.adminConstants.taxName,
        selector: (row: AdminTypes.taxTypes.Tax) => row.taxName,
        sortable: true,
        width: "25%"
      },
      {
        name: Constants.adminConstants.taxType,
        selector: (row: AdminTypes.taxTypes.Tax) => row.taxType || '-',
        sortable: true
      },
      {
        name: Constants.adminConstants.value,
        selector: (row: AdminTypes.taxTypes.Tax) => `${row.value}${row.valueType === 'Percentage' ? '%' : ''}`,
        sortable: true
      },
      {
        name: Constants.adminConstants.createdOn,
        selector: (row: AdminTypes.taxTypes.Tax) => {
          return row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '-';
        },
        sortable: true
      },
    ],
    status: {
      name: Constants.adminConstants.statusLabel,
      idSelector: (row) => row._id || "",
      valueSelector: (row) => typeof row.status === 'boolean' ? row.status : row.status === 'Active',
      onToggle: handleToggleStatusById,
    },
    actions:
      [
        {
          render: (row) => (
            <WebComponents.UiComponents.UiWebComponents.Button size="icon" variant="viewaction" onClick={() => handleViewDetails(row)}>
              <FaEye className="w-4 h-4" />
            </WebComponents.UiComponents.UiWebComponents.Button>
          ),
        },
        {
          render: (row) => (
            (checkPermission("finance.tax", "update")) && (
              <WebComponents.UiComponents.UiWebComponents.Button size="icon" variant="editaction" onClick={() => handleEditModal(row)}>
                <FaEdit className="w-4 h-4" />
              </WebComponents.UiComponents.UiWebComponents.Button>
            )
          ),
        },
        {
          render: (row) => (
            (checkPermission("finance.tax", "delete")) && (
              <WebComponents.UiComponents.UiWebComponents.Button size="icon" variant="deleteaction" onClick={() => row._id && handleDelete(row._id)}>
                <FaTrash className="w-4 h-4" />
              </WebComponents.UiComponents.UiWebComponents.Button>
            )
          ),
        },
      ],
  }), [handleToggleStatusById, handleViewDetails, handleEditModal, handleDelete]);

  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-lg sm:text-lg md:text-xl lg:text-2xl font-medium text-textMain dark:text-white truncate">
            {Constants.adminConstants.taxManagement}
            {(() => {
              if (!showModal && !showEditModal) return "";
              const modalTitle = showModal ? Constants.adminConstants.addModalTitle : Constants.adminConstants.editModalTitle;
              return ` > ${modalTitle}`;
            })()}
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-textSmall pt-2">
            Manage your tax configurations and rates
          </p>
        </div>
        {(checkPermission("finance.tax", "create")) && (
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
            {showModal || showEditModal ? <><HiArrowLeft className="w-4 h-4" /> {Constants.adminConstants.back}</> : <><HiPlus className="w-4 h-4" /> {Constants.adminConstants.add}</>}
          </WebComponents.UiComponents.UiWebComponents.Button>
        )}
      </div>

      {!showModal && !showEditModal && (
        <div className="bg-white dark:bg-darkFilterbar rounded-[4px] h-full w-full mt-4 overflow-hidden">
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
            onApply={handleBulkApply}
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
            categoryOptions={typeOptions}
            categoryFilter={taxTypeFilter}
            onCategoryFilterChange={(value: string) => {
              setTaxTypeFilter(value);
            }}
            categoryPlaceholder="All Types"
            searchTerm={searchTerm}
            onSearchTermChange={setSearchTerm}
            renderExports={
              <>
                <WebComponents.UiComponents.UiWebComponents.DownloadCSV
                  data={downloadData}
                  columns={exportColumns.csvColumns}
                  filename={`tax-management-${new Date().toISOString().split('T')[0]}.csv`}
                  onExport={async () => {
                    const data = await downloadPdf();
                    WebComponents.UiComponents.UiWebComponents.SwalHelper.success({ text: 'CSV exported successfully.' });
                    clearSelectedData()
                    return data;
                  }}
                >
                  <button
                    type="button"
                    className="rounded-[4px] bg-[#ffffff] dark:bg-[#3A3A3A] border border-[#D8D9D9] border-opacity-50 font-interTight font-normal hover:bg-[#e0e0e0] dark:hover:bg-[#4A4A4A] shadow-sm transition-colors duration-200 cursor-pointer flex-shrink-0 px-2 py-[6.9px]"
                    aria-label="Download CSV"
                    title="Download CSV"
                    disabled={taxes.length === 0}
                  >
                    <Image src={Constants.assetsIcon.assets.csv} alt="CSV" width={28} height={28} className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                </WebComponents.UiComponents.UiWebComponents.DownloadCSV>
                <WebComponents.UiComponents.UiWebComponents.DownloadPDF
                  data={downloadData}
                  columns={exportColumns.pdfColumns}
                  filename={`tax-management-${new Date().toISOString().split('T')[0]}.pdf`}
                  title="Tax Management Report"
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
                    className="rounded-[4px] bg-[#ffffff] dark:bg-[#3A3A3A] border border-[#D8D9D9] border-opacity-50 font-interTight font-normal hover:bg-[#e0e0e0] dark:hover:bg-[#4A4A4A] shadow-sm transition-colors duration-200 cursor-pointer flex-shrink-0 px-2 py-[6.9px]"
                    aria-label="Download PDF"
                    title="Download PDF"
                    disabled={taxes.length === 0}
                  >
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
            <WebComponents.AdminComponents.AdminWebComponents.Forms.TaxForm
              onSubmit={handleEdit}
              tax={editingTax}
            />
          ) : (
            <WebComponents.AdminComponents.AdminWebComponents.Forms.TaxForm onSubmit={handleAdd} />
          )}
        </WebComponents.UiComponents.UiWebComponents.AdminFormModal>
      )}

      {showDetailsModal && selectedTax && (
        <WebComponents.AdminComponents.AdminWebComponents.Models.TaxDetailsModal
          tax={selectedTax}
          onClose={() => setShowDetailsModal(false)}
        />
      )}
    </>
  );
}
