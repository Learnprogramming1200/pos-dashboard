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
import { SuperAdminTypes, PaginationType } from "@/types";

export default function BusinessCategory({
  initialCategories,
  initialPagination,
}: {
  readonly initialCategories: SuperAdminTypes.BusinessCategoryTypes.BusinessCategory[];
  readonly initialPagination: PaginationType.Pagination;
}) {
  const [categories, setCategories] = React.useState<SuperAdminTypes.BusinessCategoryTypes.BusinessCategory[]>(initialCategories);
  const [pagination, setPagination] = React.useState<PaginationType.Pagination>(initialPagination);
  const [loading, setLoading] = React.useState(false);
  const [showModal, setShowModal] = React.useState(false);
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [showDetailsModal, setShowDetailsModal] = React.useState(false);
  const [editingCategory, setEditingCategory] = React.useState<SuperAdminTypes.BusinessCategoryTypes.BusinessCategory | null>(null);
  const [selectedCategory, setSelectedCategory] = React.useState<SuperAdminTypes.BusinessCategoryTypes.BusinessCategory | null>(null);
  const [actionFilter, setActionFilter] = React.useState("All");
  const [activeStatusFilter, setActiveStatusFilter] = React.useState("All");
  const [selectedRows, setSelectedRows] = React.useState<SuperAdminTypes.BusinessCategoryTypes.BusinessCategory[]>([]);
  const [clearSelectedRows, setClearSelectedRows] = React.useState(false);
  const [downloadData, setDownloadData] = React.useState([])
  const router = useRouter();
  const searchParams = useSearchParams();
  const { searchTerm, setSearchTerm, statusFilter, setStatusFilter, filteredData } = customHooks.useListFilters<SuperAdminTypes.BusinessCategoryTypes.BusinessCategory>(
    categories,
  )

  // Sync state with props when URL params change (server re-fetches data)
  React.useEffect(() => {
    setCategories(initialCategories);
    setPagination(initialPagination);
  }, [initialCategories]);

  // Reset action filter when no rows are selected
  React.useEffect(() => {
    if (selectedRows.length === 0) {
      setActionFilter('All');
      setActiveStatusFilter('All');
    }
  }, [selectedRows]);

  // Export columns
  const exportColumns = React.useMemo(() => {
    return WebComponents.WebCommonComponents.CommonComponents.generateExportColumns<SuperAdminTypes.BusinessCategoryTypes.BusinessCategory>([
      {
        key: 'categoryName',
        label: Constants.superadminConstants.categoryname,
        accessor: (row) => row.categoryName || '-',
        pdfWidth: 45
      },
      {
        key: 'description',
        label: Constants.superadminConstants.descriptionlabel,
        accessor: (row) => row.description || '-',
        pdfWidth: 80
      },
      {
        key: 'createdAt',
        label: Constants.superadminConstants.createdonlabel,
        accessor: (row) => row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '-',
        pdfWidth: 35
      },
      {
        key: 'updatedAt',
        label: Constants.superadminConstants.lastmodifiedlabel,
        accessor: (row) => row.updatedAt ? new Date(row.updatedAt).toLocaleDateString() : '-',
        pdfWidth: 35
      },
      {
        key: 'status',
        label: Constants.superadminConstants.statuslabel,
        accessor: (row) => row.isActive ? 'Active' : 'Inactive',
        pdfWidth: 25
      }
    ]);
  }, []);

  // Handlers
  const handleAdd = async (formData: SuperAdminTypes.BusinessCategoryTypes.BusinessCategoryFormData) => {
    await ServerActions.HandleFunction.handleAddCommon({
      formData,
      createAction: ServerActions.ServerActionslib.createBusinessCategoryAction,
      setLoading,
      setShowModal,
      router,
      successMessage: 'Business category added successfully.',
      errorMessage: 'Failed to add business category.',
      onSuccess: (result) => {
        if (result?.data?.data) {
          setCategories(prev => [...prev, result.data.data]);
        }
      },
    });
  };

  const handleEdit = async (formData: SuperAdminTypes.BusinessCategoryTypes.BusinessCategoryFormData) => {
    await ServerActions.HandleFunction.handleEditCommon({
      formData,
      editingItem: editingCategory,
      getId: (item) => item._id,
      updateAction: (id, data) => ServerActions.ServerActionslib.updateBusinessCategoryAction(id as string, data),
      setLoading,
      setShowEditModal,
      setEditingItem: setEditingCategory,
      router,
      successMessage: 'Business category updated successfully.',
      errorMessage: 'Failed to update business category.',
      onSuccess: (result) => {
        if (result?.data?.data && editingCategory) {
          setCategories(prev => prev.map(c => c._id === editingCategory._id ? result.data.data : c));
        }
      },
    });
  };

  const handleDelete = async (id: string) => {
    await ServerActions.HandleFunction.handleDeleteCommon({
      id,
      deleteAction: (id) => ServerActions.ServerActionslib.deleteBusinessCategoryAction(id as string),
      setLoading,
      router,
      successMessage: 'The business category has been deleted.',
      errorMessage: 'Failed to delete business category.',
      onSuccess: () => {
        setCategories(prev => prev.filter(c => c._id !== id));
      },
    });
  };

  const handleToggleStatus = React.useCallback(async (row: SuperAdminTypes.BusinessCategoryTypes.BusinessCategory, next: boolean) => {
    setCategories(prev => prev.map(c => (c._id === row._id ? { ...c, isActive: next } : c)));
    await ServerActions.HandleFunction.handleToggleStatusCommon({
      row,
      next,
      getId: (item) => item._id,
      preparePayload: () => ({ isActive: next }),
      updateAction: (id, data) => ServerActions.ServerActionslib.updateBusinessCategoryAction(id as string, data),
      setLoading,
      router,
      successMessage: `Status updated to ${next ? 'Active' : 'Inactive'}.`,
      errorMessage: 'Failed to update status.',
      onError: () => {
        setCategories(prev => prev.map(c => (c._id === row._id ? { ...c, isActive: !next } : c)));
      },
    });
  }, [router]);

  const handleToggleStatusById = React.useCallback(async (id: string, next: boolean) => {
    const row = categories.find(c => c._id === id);
    if (row) await handleToggleStatus(row, next);
  }, [categories, handleToggleStatus]);

  const handleViewDetails = React.useCallback((category: SuperAdminTypes.BusinessCategoryTypes.BusinessCategory) => {
    setSelectedCategory(category);
    setShowDetailsModal(true);
  }, []);

  const handleEditModal = React.useCallback((category: SuperAdminTypes.BusinessCategoryTypes.BusinessCategory) => {
    setEditingCategory(category);
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
      items: categories,
      setItems: setCategories,
      bulkDeleteAction: ServerActions.ServerActionslib.bulkDeleteBusinessCategoriesAction,
      bulkUpdateStatusAction: ServerActions.ServerActionslib.bulkUpdateBusinessCategoriesStatusAction,
      clearSelectedData,
      idSelector: (r) => r._id,
      statusProp: 'isActive',
    });
  }, [selectedRows, actionFilter, activeStatusFilter, categories]);

  const downloadPdf = async (): Promise<any[]> => {
    return await ServerActions.HandleFunction.handleDownloadCommon({
      selectedRows,
      searchParams,
      bulkGetSelectedAction: ServerActions.ServerActionslib.bulkGetSelectedBusinessCategoriesAction,
      bulkGetAllAction: ServerActions.ServerActionslib.bulkGetBusinessCategoriesAction,
      setDownloadData,
    });
  };

  const tableColumns = React.useMemo(() => WebComponents.WebCommonComponents.CommonComponents.createColumns<SuperAdminTypes.BusinessCategoryTypes.BusinessCategory>({
    fields: [
      {
        name: Constants.superadminConstants.categoryname,
        selector: (row) => row.categoryName,
        sortable: true,
        width: "15%"
      },
      {
        name: Constants.superadminConstants.descriptionlabel,
        selector: (row) => row.description,
        sortable: true,
        width: "25%"
      },
      {
        name: Constants.superadminConstants.createdonlabel,
        selector: (row) => row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '-',
        sortable: true
      },
      {
        name: Constants.superadminConstants.lastmodifiedlabel,
        selector: (row) => row.updatedAt ? new Date(row.updatedAt).toLocaleDateString() : '-',
        sortable: true
      },
    ],
    status: {
      name: Constants.superadminConstants.statuslabel,
      idSelector: (row) => row._id,
      valueSelector: (row) => !!row.isActive,
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
          <WebComponents.UiComponents.UiWebComponents.Button size="icon" variant="deleteaction" onClick={() => handleDelete(row._id)}>
            <FaTrash className="w-4 h-4" />
          </WebComponents.UiComponents.UiWebComponents.Button>
        ),
      },
    ],
  }), [handleToggleStatusById, handleViewDetails, handleEditModal, handleDelete]);

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-lg sm:text-lg md:text-xl lg:text-2xl font-medium text-textMain dark:text-white truncate">
            {Constants.superadminConstants.categoryheading}
            {(() => {
              if (!showModal && !showEditModal) return "";
              const modalTitle = showModal ? Constants.superadminConstants.addCategory : Constants.superadminConstants.editCategory;
              return ` > ${modalTitle}`;
            })()}
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-textSmall pt-2">
            {Constants.superadminConstants.categorybio}
          </p>
        </div>
        <WebComponents.UiComponents.UiWebComponents.Button
          variant="addBackButton"
          onClick={() => {
            if (showModal || showEditModal) {
              setShowModal(false);
              setShowEditModal(false);
              setEditingCategory(null);
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
                  filename={`business-categories-${new Date().toISOString().split('T')[0]}.csv`}
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
                    disabled={categories.length === 0}
                  >
                    <Image src={Constants.assetsIcon.assets.csv} alt="CSV" width={28} height={28} className="w-5 h-5 sm:w-6 sm:h-6 md:w-6 md:h-6 lg:w-7 lg:h-7 xl:w-7 xl:h-7 2xl:w-7 2xl:h-7" />
                  </button>
                </WebComponents.UiComponents.UiWebComponents.DownloadCSV>
                <WebComponents.UiComponents.UiWebComponents.DownloadPDF
                  data={downloadData}
                  columns={exportColumns.pdfColumns}
                  filename={`business-categories-${new Date().toISOString().split('T')[0]}.pdf`}
                  title="Business Categories Report"
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
                    disabled={categories.length === 0}
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
          formId="category-form"
          onClose={() => {
            setShowModal(false);
            setShowEditModal(false);
            setEditingCategory(null);
          }}
          loading={loading}
        >
          {editingCategory ? (
            <WebComponents.SuperAdminComponents.SuperadminWebComponents.SuperAdminForms.BusinessCategoryForm
              onSubmit={handleEdit}
              category={editingCategory}
            />
          ) : (
            <WebComponents.SuperAdminComponents.SuperadminWebComponents.SuperAdminForms.BusinessCategoryForm onSubmit={handleAdd} />
          )}
        </WebComponents.UiComponents.UiWebComponents.AdminFormModal>
      )}

      {showDetailsModal && selectedCategory && (
        <WebComponents.SuperAdminComponents.SuperadminWebComponents.SuperadminModels.BusinessCategoryDetailsModal
          category={selectedCategory}
          onClose={() => setShowDetailsModal(false)}
        />
      )}
    </>
  );
}
