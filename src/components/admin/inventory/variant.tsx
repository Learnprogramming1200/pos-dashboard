"use client";
import React from "react";
import Image from 'next/image';
import { useRouter, useSearchParams } from "next/navigation";
import { FaEye, FaEdit, FaTrash } from 'react-icons/fa';
import { HiArrowLeft, HiPlus } from "react-icons/hi";
import { ServerActions } from "@/lib";
import { Constants } from "@/constant";
import { customHooks } from "@/hooks";
import { WebComponents } from "@/components";
import { PaginationType, AdminTypes } from "@/types";
export default function Variant({
  initialVariants,
  initialPagination,
}: {
  readonly initialVariants: AdminTypes.InventoryTypes.VariantTypes.Variant[];
  readonly initialPagination: PaginationType.Pagination;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [variants, setVariants] = React.useState<AdminTypes.InventoryTypes.VariantTypes.Variant[]>(initialVariants);
  const [pagination, setPagination] = React.useState<PaginationType.Pagination>(initialPagination);
  const [showModal, setShowModal] = React.useState(false);
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [showDetailsModal, setShowDetailsModal] = React.useState(false);
  const [editingVariant, setEditingVariant] = React.useState<AdminTypes.InventoryTypes.VariantTypes.Variant | null>(null);
  const [selectedVariant, setSelectedVariant] = React.useState<AdminTypes.InventoryTypes.VariantTypes.Variant | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [selectedRows, setSelectedRows] = React.useState<AdminTypes.InventoryTypes.VariantTypes.Variant[]>([]);
  const [actionFilter, setActionFilter] = React.useState<string>("All");
  const [activeStatusFilter, setActiveStatusFilter] = React.useState<string>("All");
  const [downloadData, setDownloadData] = React.useState([])
  const [clearSelectedRows, setClearSelectedRows] = React.useState(false);
  const { searchTerm, setSearchTerm, statusFilter, setStatusFilter, filteredData } = customHooks.useListFilters<AdminTypes.InventoryTypes.VariantTypes.Variant>(
    variants,
  )
  const { checkPermission } = customHooks.useUserPermissions();
  // Sync state with props when URL params change (server re-fetches data)
  React.useEffect(() => {
    setVariants(initialVariants);
    setPagination(initialPagination);
  }, [initialVariants]);

  // Reset action filter when no rows are selected
  React.useEffect(() => {
    if (selectedRows.length === 0) {
      setActionFilter("All");
      setActiveStatusFilter("All");
    }
  }, [selectedRows]);

  // Add
  const handleAdd = async (formData: {
    variant: string; values: string; status: boolean;
  }) => {
    await ServerActions.HandleFunction.handleAddCommon({
      formData,
      createAction: ServerActions.ServerActionslib.createVariantsAction,
      setLoading,
      setShowModal,
      router,
      successMessage: "Variant added successfully.",
      errorMessage: "Failed to add variant.",
      checkExistsError: (errorMessage) => errorMessage.toLowerCase() === "variant already exists",
    });
  };
  // Edit
  const handleEdit = async (formData: { variant: string; values: string; status: boolean; }) => {
    await ServerActions.HandleFunction.handleEditCommon({
      formData,
      editingItem: editingVariant,
      getId: (item) => item.id,
      updateAction: (id: string | number, data) => ServerActions.ServerActionslib.updateVariantsAction(String(id), data),
      setLoading,
      setShowEditModal,
      setEditingItem: setEditingVariant,
      router,
      successMessage: "Variant updated successfully.",
      errorMessage: "Failed to update variant.",
      checkExistsError: (errorMessage) => errorMessage.toLowerCase() === "variant already exists",
    });
  };
  // Delete
  const handleDelete = React.useCallback(
    async (id: string) => {
      await ServerActions.HandleFunction.handleDeleteCommon({
        id,
        deleteAction: (id: string | number) => ServerActions.ServerActionslib.deleteVariantsAction(String(id)),
        setLoading,
        router,
        successMessage: "The variant has been deleted.",
        errorMessage: "Failed to delete variant.",
      });
    },
    [router]
  );

  const handleEditModal = React.useCallback((variant: AdminTypes.InventoryTypes.VariantTypes.Variant) => {
    setEditingVariant(variant);
    setShowEditModal(true);
  }, []);

  // View Details
  const handleViewDetails = React.useCallback((variant: AdminTypes.InventoryTypes.VariantTypes.Variant) => {
    setSelectedVariant(variant);
    setShowDetailsModal(true);
  }, []);

  // Handle status toggle
  const handleToggleStatus = React.useCallback(
    async (row: AdminTypes.InventoryTypes.VariantTypes.Variant, next: boolean) => {
      await ServerActions.HandleFunction.handleToggleStatusCommon({
        row,
        next,
        getId: (row) => row.id,
        preparePayload: (row, next) => {
          const valuesString = row.values
            .map((value) => (typeof value === "string" ? value : value.value || String(value)))
            .join(", ");
          return {
            variant: row.variant,
            values: valuesString,
            status: next,
          };
        },
        updateAction: (id: string | number, data) => ServerActions.ServerActionslib.updateVariantsAction(String(id), data),
        setLoading,
        router,
        successMessage: `Status updated to ${next ? "Active" : "Inactive"}.`,
        errorMessage: "Failed to update status.",
      });
    },
    [router]
  );

  // Wrapper function to convert id-based toggle to row-based toggle
  const handleToggleStatusById = React.useCallback(
    async (id: string, next: boolean) => {
      const row = variants.find(v => v._id === id || v.id === id);
      if (row) {
        await handleToggleStatus(row, next);
      }
    },
    [variants, handleToggleStatus]
  );

  const bulkActionOptions = React.useMemo(() => {
    const options = Constants.commonConstants.actionOptions;
    return options.filter(option => {
      if (option.value === 'Status') {
        return checkPermission("inventory.variations", "update");
      }
      if (option.value === 'Delete') {
        return checkPermission("inventory.variations", "delete");
      }
      return true;
    });
  }, [checkPermission]);

  const tableColumns = React.useMemo(() => WebComponents.WebCommonComponents.CommonComponents.createColumns<AdminTypes.InventoryTypes.VariantTypes.Variant>({
    fields: [
      {
        name: "Variant",
        selector: (row: AdminTypes.InventoryTypes.VariantTypes.Variant) => row.variant,
        sortable: true
      },
      {
        name: "Values",
        selector: (row: AdminTypes.InventoryTypes.VariantTypes.Variant) => row.values.map(value => typeof value === 'string' ? value : value.value || String(value)).join(', '),
        cell: (row: AdminTypes.InventoryTypes.VariantTypes.Variant) => (
          <div className="flex flex-wrap gap-1 py-1">
            {row.values && row.values.length > 0 ? (
              row.values.map((value, index) => (
                // <Badge key={index} variant="secondary" className="text-xs">
                <WebComponents.UiComponents.UiWebComponents.Badge key={index} className="bg-primary text-white text-xs">
                  {typeof value === 'string' ? value.trim() : value.value?.trim() || String(value)}
                </WebComponents.UiComponents.UiWebComponents.Badge>
              ))
            ) : (
              <span className="text-gray-500 text-sm">No values</span>
            )}
          </div>
        ),
      },
      {
        name: "Created Date",
        selector: (row: AdminTypes.InventoryTypes.VariantTypes.Variant) => {
          return row.createdAt ? new Date(row.createdAt).toLocaleDateString() : 'N/A';
        },
        sortable: true,
      },
      {
        name: "Updated Date",
        selector: (row: AdminTypes.InventoryTypes.VariantTypes.Variant) => {
          return row.updatedAt ? new Date(row.updatedAt).toLocaleDateString() : 'N/A';
        },
        sortable: true,
      },

    ],
    status: {
      idSelector: (row) => row.id,
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
      ...(checkPermission("inventory.variations", "update") ? [{
        render: (row: any) => (
          <WebComponents.UiComponents.UiWebComponents.Button size="icon" variant="editaction" onClick={() => handleEditModal(row)}>
            <FaEdit className="w-4 h-4" />
          </WebComponents.UiComponents.UiWebComponents.Button>
        ),
      }] : []),
      ...(checkPermission("inventory.variations", "delete") ? [{
        render: (row: any) => (
          <WebComponents.UiComponents.UiWebComponents.Button size="icon" variant="deleteaction" onClick={() => handleDelete(row.id)}>
            <FaTrash className="w-4 h-4" />
          </WebComponents.UiComponents.UiWebComponents.Button>
        ),
      }] : []),
    ],
  }), [handleToggleStatusById, handleViewDetails, handleEditModal, handleDelete, checkPermission]);

  // CSV and PDF export columns
  const exportColumns = React.useMemo(() => {
    return WebComponents.WebCommonComponents.CommonComponents.generateExportColumns<AdminTypes.InventoryTypes.VariantTypes.Variant>([
      {
        key: 'variant',
        label: 'Variant',
        accessor: (row) => row.variant || '-',
        pdfWidth: 40
      },
      {
        key: 'values',
        label: 'Values',
        accessor: (row) => row.values.map(value => typeof value === 'string' ? value : value.value || String(value)).join(', ') || '-',
        pdfWidth: 60
      },
      {
        key: 'createdAt',
        label: 'Created Date',
        accessor: (row) => row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '-',
        pdfWidth: 35
      },
      {
        key: 'updatedAt',
        label: 'Updated Date',
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
  // Download PDF or csv
  const downloadPdf = async (): Promise<any[]> => {
    return await ServerActions.HandleFunction.handleDownloadCommon({
      selectedRows,
      searchParams,
      bulkGetSelectedAction: ServerActions.ServerActionslib.bulkGetSelectedAction,
      bulkGetAllAction: ServerActions.ServerActionslib.bulkGetVariantsAction,
      setDownloadData,
    });
  };
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
      items: variants,
      setItems: setVariants,
      bulkDeleteAction: ServerActions.ServerActionslib.bulkDeleteVariantAction,
      bulkUpdateStatusAction: ServerActions.ServerActionslib.bulkUpdateVariantStatusAction,
      clearSelectedData,
      idSelector: (r) => r.id,
    });
  }, [selectedRows, actionFilter, activeStatusFilter, variants, clearSelectedData]);

  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
            {showModal || showEditModal ? `${Constants.adminConstants.variantStrings.title} > ${showModal ? "Add Variant" : "Edit Variant"}` : Constants.adminConstants.variantStrings.title}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-300">{Constants.adminConstants.variantStrings.description}</p>
        </div>
        {(showModal || showEditModal || checkPermission("inventory.variations", "create")) && (
          <WebComponents.UiComponents.UiWebComponents.Button
            variant="addBackButton"
            onClick={() => {
              if (showModal || showEditModal) {
                setShowModal(false);
                setShowEditModal(false);
                setEditingVariant(null);
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
              statusOptions={
                Constants.commonConstants.CommonFilterOptions.CommonStatusOptions
              }
              searchTerm={searchTerm}
              onSearchTermChange={setSearchTerm}
              renderExports={
                <>
                  <WebComponents.UiComponents.UiWebComponents.DownloadCSV
                    data={downloadData}
                    columns={exportColumns.csvColumns}
                    filename={`variants-${new Date().toISOString().split('T')[0]}.csv`}
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
                    >
                      <Image src={Constants.assetsIcon.assets.csv} alt="CSV" width={28} height={28} className="w-5 h-5 sm:w-6 sm:h-6 md:w-6 md:h-6 lg:w-7 lg:h-7 xl:w-7 xl:h-7 2xl:w-7 2xl:h-7" />
                    </button>
                  </WebComponents.UiComponents.UiWebComponents.DownloadCSV>
                  <WebComponents.UiComponents.UiWebComponents.DownloadPDF
                    data={downloadData}
                    columns={exportColumns.pdfColumns}
                    filename={`variants-${new Date().toISOString().split('T')[0]}.pdf`}
                    title="Variants Report"
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
          formId="variant-form"
          onClose={() => {
            setShowModal(false);
            setShowEditModal(false);
            setEditingVariant(null);
          }}
          loading={loading}
        >
          {editingVariant ? (
            <WebComponents.AdminComponents.AdminWebComponents.Forms.VariantForm
              onSubmit={handleEdit}
              variant={editingVariant}
            />
          ) : (
            <WebComponents.AdminComponents.AdminWebComponents.Forms.VariantForm onSubmit={handleAdd} />
          )}
        </WebComponents.UiComponents.UiWebComponents.AdminFormModal>
      )}
      {/* Details Modal */}
      {showDetailsModal && selectedVariant && (
        <WebComponents.AdminComponents.AdminWebComponents.Models.VariantDetailsModal
          variant={selectedVariant}
          onClose={() => setShowDetailsModal(false)}
        />
      )}
    </>
  );
}
