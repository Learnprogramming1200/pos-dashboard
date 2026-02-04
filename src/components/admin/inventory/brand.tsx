"use client";
import React from "react";
import Image from 'next/image';
import { useRouter, useSearchParams } from "next/navigation";
import { FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import { HiArrowLeft, HiPlus } from "react-icons/hi";
import { ServerActions } from "@/lib";
import { Constants } from "@/constant";
import { customHooks } from "@/hooks";
import { WebComponents } from "@/components";
import { AdminTypes, PaginationType } from "@/types";

export default function Brand({
  initialBrands,
  initialPagination,
}: {
  readonly initialBrands: AdminTypes.InventoryTypes.BrandTypes.Brand[];
  readonly initialPagination: PaginationType.Pagination;
}) {
  const [brands, setBrands] = React.useState<AdminTypes.InventoryTypes.BrandTypes.Brand[]>(initialBrands);
  const [pagination, setPagination] = React.useState(initialPagination);
  const [loading, setLoading] = React.useState(false);
  const [showModal, setShowModal] = React.useState(false);
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [showDetailsModal, setShowDetailsModal] = React.useState(false);
  const [editingBrand, setEditingBrand] = React.useState<AdminTypes.InventoryTypes.BrandTypes.Brand | null>(null);
  const [selectedBrand, setSelectedBrand] = React.useState<AdminTypes.InventoryTypes.BrandTypes.Brand | null>(null);
  const [actionFilter, setActionFilter] = React.useState("All");
  const [activeStatusFilter, setActiveStatusFilter] = React.useState("All");
  const [selectedRows, setSelectedRows] = React.useState<AdminTypes.InventoryTypes.BrandTypes.Brand[]>([]);
  const [clearSelectedRows, setClearSelectedRows] = React.useState(false);
  const [downloadData, setDownloadData] = React.useState([])
  const router = useRouter();
  const searchParams = useSearchParams();
  const { searchTerm, setSearchTerm, statusFilter, setStatusFilter, filteredData } = customHooks.useListFilters<AdminTypes.InventoryTypes.BrandTypes.Brand>(
    brands,
  )
  const { checkPermission } = customHooks.useUserPermissions();
  // Sync state with props when URL params change (server re-fetches data)
  React.useEffect(() => {
    setBrands(initialBrands);
    setPagination(initialPagination);
  }, [initialBrands]);

  // Reset action filter when no rows are selected
  React.useEffect(() => {
    if (selectedRows.length === 0) {
      setActionFilter('All');
      setActiveStatusFilter('All');
    }
  }, [selectedRows]);
  // CSV and PDF export columns
  const exportColumns = React.useMemo(() => {
    return WebComponents.WebCommonComponents.CommonComponents.generateExportColumns<AdminTypes.InventoryTypes.BrandTypes.Brand>([
      {
        key: 'brand',
        label: 'Brand Name',
        accessor: (row) => row.brand || '-',
        pdfWidth: 45
      },
      {
        key: 'createdAt',
        label: 'Created On',
        accessor: (row) => row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '-',
        pdfWidth: 35
      },
      {
        key: 'updatedAt',
        label: 'Updated On',
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

  // Add
  const handleAdd = async (formData: {
    brand: string;
    brandImage: string | File;
    status: boolean
  }) => {
    await ServerActions.HandleFunction.handleAddCommon({
      formData,
      createAction: ServerActions.ServerActionslib.createBrandAction,
      setLoading,
      setShowModal,
      router,
      successMessage: 'Brand added successfully.',
      errorMessage: 'Failed to add brand.',
      onSuccess: (result) => {
        if (result?.data?.data) {
          setBrands(prev => [...prev, result.data.data]);
        }
      },
    });
  };

  // Edit
  const handleEdit = async (formData: {
    brand: string;
    brandImage: string | File;
    status: boolean
  }) => {
    await ServerActions.HandleFunction.handleEditCommon({
      formData,
      editingItem: editingBrand,
      getId: (item) => item._id,
      updateAction: (id: string | number, data: typeof formData) =>
        ServerActions.ServerActionslib.updateBrandAction(id as string, data),
      setLoading,
      setShowEditModal,
      setEditingItem: setEditingBrand,
      router,
      successMessage: 'Brand updated successfully.',
      errorMessage: 'Failed to update brand.',
      onSuccess: (result) => {
        if (result?.data?.data && editingBrand) {
          setBrands(prev => prev.map(brand =>
            brand._id === editingBrand._id ? result.data.data : brand
          ));
        }
      },
    });
  };

  // Delete
  const handleDelete = React.useCallback(async (id: string) => {
    await ServerActions.HandleFunction.handleDeleteCommon({
      id,
      deleteAction: (id: string | number) =>
        ServerActions.ServerActionslib.deleteBrandAction(id as string),
      setLoading,
      router,
      successMessage: 'The brand has been deleted.',
      errorMessage: 'Failed to delete brand.',
      onSuccess: () => {
        setBrands(prev => prev.filter(brand => brand._id !== id));
      },
    });
  }, [router]);

  // View Details
  const handleViewDetails = React.useCallback((brand: AdminTypes.InventoryTypes.BrandTypes.Brand) => {
    setSelectedBrand(brand);
    setShowDetailsModal(true);
  }, []);

  const handleToggleStatus = React.useCallback(async (row: AdminTypes.InventoryTypes.BrandTypes.Brand, next: boolean) => {
    setBrands(prev => prev.map(brand => (brand._id === row._id ? { ...brand, status: next } : brand)));
    await ServerActions.HandleFunction.handleToggleStatusCommon({
      row, next, getId: (item) => item._id, preparePayload: (row) => ({
        brand: row.brand,
        brandImage: row.brandImage,
        status: next,
      }),
      updateAction: (id: string | number, data: any) =>
        ServerActions.ServerActionslib.updateBrandAction(id as string, data),
      setLoading,
      router,
      successMessage: `Status updated to ${next ? 'Active' : 'Inactive'}.`,
      errorMessage: 'Failed to update status.',
      onSuccess: () => {
        // The router.refresh() in handleToggleStatusCommon will update the data
        // But we can also update optimistically if needed
      },
      onError: () => {
        // Revert optimistic update on error
        setBrands(prev => prev.map(brand => (brand._id === row._id ? { ...brand, status: !next } : brand)));
      },
    });
  }, [router]);

  const handleToggleStatusById = React.useCallback(
    async (id: string, next: boolean) => {
      const row = brands.find(b => b._id === id);
      if (row) {
        await handleToggleStatus(row, next);
      }
    },
    [brands, handleToggleStatus]
  );
  // Open edit modal
  const handleEditModal = React.useCallback((brand: AdminTypes.InventoryTypes.BrandTypes.Brand) => {
    setEditingBrand(brand);
    setShowEditModal(true);
  }, []);
  // clear selected data
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
      items: brands,
      setItems: setBrands,
      bulkDeleteAction: ServerActions.ServerActionslib.bulkDeleteBrandsAction,
      bulkUpdateStatusAction: ServerActions.ServerActionslib.bulkUpdateBrandsStatusAction,
      clearSelectedData,
      idSelector: (r) => r._id,
    });
  }, [selectedRows, actionFilter, activeStatusFilter, brands, clearSelectedData]);

  const downloadPdf = async (): Promise<any[]> => {
    return await ServerActions.HandleFunction.handleDownloadCommon({
      selectedRows,
      searchParams,
      bulkGetSelectedAction: ServerActions.ServerActionslib.bulkGetSelectedBrandAction,
      bulkGetAllAction: ServerActions.ServerActionslib.bulkGetBrandAction,
      setDownloadData,
      idSelector: (item) => item._id,
    });
  };

  const bulkActionOptions = React.useMemo(() => {
    const options = Constants.commonConstants.actionOptions;
    return options.filter(option => {
      if (option.value === 'Status') {
        return checkPermission("inventory.brands", "update");
      }
      if (option.value === 'Delete') {
        return checkPermission("inventory.brands", "delete");
      }
      return true;
    });
  }, [checkPermission]);

  const tableColumns = React.useMemo(() => WebComponents.WebCommonComponents.CommonComponents.createColumns<AdminTypes.InventoryTypes.BrandTypes.Brand>({
    fields: [
      {
        name: "Image",
        selector: (row: AdminTypes.InventoryTypes.BrandTypes.Brand) => row.brandImage || 'No Image',
        cell: (row: AdminTypes.InventoryTypes.BrandTypes.Brand) => (
          <div className="p-2">
            <div className="w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
              {row.brandImage ? (
                <Image
                  src={row.brandImage}
                  alt={row.brand}
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = Constants.assetsIcon.assets.noDataFound.src;
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                  <span className="text-gray-400 text-xs">No Image</span>
                </div>
              )}
            </div>
          </div>
        ),
        sortable: false,
        width: "15%"
      },
      {
        name: "Brand Name",
        selector: (row: AdminTypes.InventoryTypes.BrandTypes.Brand) => row.brand,
        sortable: true,
        width: "25%"
      },
      {
        name: "Created On",
        selector: (row: AdminTypes.InventoryTypes.BrandTypes.Brand) => {
          return row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '-';
        },
        sortable: true
      },
      {
        name: "Updated On",
        selector: (row: AdminTypes.InventoryTypes.BrandTypes.Brand) => {
          return row.updatedAt ? new Date(row.updatedAt).toLocaleDateString() : '-';
        },
        sortable: true
      },
    ],
    status: {
      name: "Status",
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
      ...(checkPermission("inventory.brands", "update") ? [{
        render: (row: any) => (
          <WebComponents.UiComponents.UiWebComponents.Button size="icon" variant="editaction" onClick={() => handleEditModal(row)}>
            <FaEdit className="w-4 h-4" />
          </WebComponents.UiComponents.UiWebComponents.Button>
        ),
      }] : []),
      ...(checkPermission("inventory.brands", "delete") ? [{
        render: (row: any) => (
          <WebComponents.UiComponents.UiWebComponents.Button size="icon" variant="deleteaction" onClick={() => handleDelete(row._id)}>
            <FaTrash className="w-4 h-4" />
          </WebComponents.UiComponents.UiWebComponents.Button>
        ),
      }] : []),
    ],
  }), [handleViewDetails, handleEditModal, handleDelete, handleToggleStatusById, checkPermission]);

  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-lg sm:text-lg md:text-xl lg:text-2xl font-medium text-textMain dark:text-white truncate">
            {Constants.adminConstants.brandheading}
            {(() => {
              if (!showModal && !showEditModal) return "";
              const modalTitle = showModal ? Constants.adminConstants.add : Constants.adminConstants.editBrand;
              return ` > ${modalTitle}`;
            })()}
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-textSmall pt-2">
            {Constants.adminConstants.brandbio}
          </p>
        </div>
        {(showModal || showEditModal || checkPermission("inventory.brands", "create")) && (
          <WebComponents.UiComponents.UiWebComponents.Button
            variant="addBackButton"
            onClick={() => {
              if (showModal || showEditModal) {
                setShowModal(false);
                setShowEditModal(false);
                setEditingBrand(null);
              } else {
                setShowModal(true);
              }
            }}
          >
            {showModal || showEditModal ? <><HiArrowLeft className="w-4 h-4" /> back</> : <><HiPlus className="w-4 h-4" /> {Constants.adminConstants.add}</>}
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
                  filename={`brands-${new Date().toISOString().split('T')[0]}.csv`}
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
                    disabled={brands.length === 0}
                  >
                    <Image src={Constants.assetsIcon.assets.csv} alt="CSV" width={28} height={28} className="w-5 h-5 sm:w-6 sm:h-6 md:w-6 md:h-6 lg:w-7 lg:h-7 xl:w-7 xl:h-7 2xl:w-7 2xl:h-7" />
                  </button>
                </WebComponents.UiComponents.UiWebComponents.DownloadCSV>
                <WebComponents.UiComponents.UiWebComponents.DownloadPDF
                  data={downloadData}
                  columns={exportColumns.pdfColumns}
                  filename={`brands-${new Date().toISOString().split('T')[0]}.pdf`}
                  title="Brands Report"
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
                    disabled={brands.length === 0}
                  >
                    <Image src={Constants.assetsIcon.assets.pdf} alt="PDF" width={28} height={28} className="w-5 h-5 sm:w-6 sm:h-6 md:w-6 md:h-6 lg:w-7 lg:h-7 xl:w-7 xl:h-7 2xl:w-7 2xl:h-7" />
                  </button>
                </WebComponents.UiComponents.UiWebComponents.DownloadPDF>
              </>
            }
          />

          <div>
            <WebComponents.WebCommonComponents.CommonComponents.DataTable
              keyField="_id"
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
        <WebComponents.UiComponents.UiWebComponents.AdminFormModal
          formId="brand-form"
          onClose={() => {
            setShowModal(false);
            setShowEditModal(false);
            setEditingBrand(null);
          }}
          loading={loading}
        >
          <WebComponents.AdminComponents.AdminWebComponents.Forms.BrandForm
            onSubmit={showModal ? handleAdd : handleEdit}
            brand={editingBrand || undefined}
          />
        </WebComponents.UiComponents.UiWebComponents.AdminFormModal>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedBrand && (
        <WebComponents.AdminComponents.AdminWebComponents.Models.BrandDetailsModal
          brand={selectedBrand}
          onClose={() => setShowDetailsModal(false)}
        />
      )}
    </>
  );
}
