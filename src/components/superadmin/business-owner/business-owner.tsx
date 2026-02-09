"use client";

import React from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams} from 'next/navigation';
import { FaEye, FaEdit, FaPlus, FaArrowLeft } from 'react-icons/fa';
import { ServerActions } from "@/lib";
import { customHooks } from "@/hooks";
import { Constants } from "@/constant";
import { WebComponents } from "@/components";
import { SuperAdminTypes } from '@/types'
export default function BusinessOwner({ initialBusinessOwners, initialCategories, initialPagination }: {
  readonly initialBusinessOwners: SuperAdminTypes.BusinessOwnerTypes.BusinessOwner[];
  readonly initialCategories: SuperAdminTypes.BusinessCategoryTypes.BusinessCategory[];
  readonly initialPagination: SuperAdminTypes.BusinessOwnerTypes.PaginationInfo;
}) {
  const [businessOwners, setBusinessOwners] = React.useState(initialBusinessOwners);
  const [businessCategories] = React.useState(initialCategories);
  const [pagination, setPagination] = React.useState<SuperAdminTypes.BusinessOwnerTypes.PaginationInfo>(initialPagination);
  const [showModal, setShowModal] = React.useState(false);
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [showDetailsModal, setShowDetailsModal] = React.useState(false);
  const [editingOwner, setEditingOwner] = React.useState<SuperAdminTypes.BusinessOwnerTypes.BusinessOwner | null>(null);
  const [selectedOwner, setSelectedOwner] = React.useState<SuperAdminTypes.BusinessOwnerTypes.BusinessOwner | null>(null);
  const [actionFilter, setActionFilter] = React.useState("All");
  const [activeStatusFilter, setActiveStatusFilter] = React.useState("All");
  const [selectedRows, setSelectedRows] = React.useState<SuperAdminTypes.BusinessOwnerTypes.BusinessOwner[]>([]);
  const [downloadData, setDownloadData] = React.useState<SuperAdminTypes.BusinessOwnerTypes.BusinessOwner[]>([]);
  const [clearSelectedRows, setClearSelectedRows] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { searchTerm, setSearchTerm, statusFilter, setStatusFilter, selectedCategoryFilter, setSelectedCategoryFilter, filteredData } = customHooks.useListFilters<SuperAdminTypes.BusinessOwnerTypes.BusinessOwner>(businessOwners);
  // Sync state with props when data re-fetches
  React.useEffect(() => {
    setBusinessOwners(initialBusinessOwners);
    setPagination(initialPagination);
  }, [initialBusinessOwners]);

  // Reset action filter when no rows are selected
  React.useEffect(() => {
    if (selectedRows.length === 0) {
      setActionFilter('All');
      setActiveStatusFilter('All');
    }
  }, [selectedRows]);

  const categoryOptions = React.useMemo(() => {
    const base = [{ name: 'All Categories', value: 'All' }];
    if (!businessCategories || !Array.isArray(businessCategories)) return base;
    return base.concat(
      businessCategories.map(cat => ({ name: cat.categoryName, value: cat._id }))
    );
  }, [businessCategories]);

  const actionOptions = React.useMemo(() => [
    { name: 'Status', value: 'Status' }
  ], []);

  const exportColumns = React.useMemo(() => {
    return WebComponents.WebCommonComponents.CommonComponents.generateExportColumns<SuperAdminTypes.BusinessOwnerTypes.BusinessOwner>([
      {
        key: 'name',
        label: Constants.superadminConstants.ownername,
        accessor: (row) => row.name || '-',
        pdfWidth: 40
      },
      {
        key: 'email',
        label: Constants.superadminConstants.emaillabel,
        accessor: (row) => row.email || '-',
        pdfWidth: 50
      },
      {
        key: 'phone',
        label: Constants.superadminConstants.phonelabel,
        accessor: (row) => row.phone || '-',
        pdfWidth: 35
      },
      {
        key: 'businessName',
        label: Constants.superadminConstants.businessnamelabel,
        accessor: (row) => {
          if (row.businesses && row.businesses.length > 0) {
            return row.businesses[0].businessName || '-';
          }
          return row.businessName || '-';
        },
        pdfWidth: 40
      },
      {
        key: 'businessCategory',
        label: Constants.superadminConstants.businesscategorylabel,
        accessor: (row) => {
          if (row.businesses && row.businesses.length > 0) {
            return row.businesses[0].businessCategoryId?.categoryName || '-';
          }
          if (!row.businessCategory) return '-';
          if (typeof row.businessCategory === 'string') {
            return row.businessCategory;
          }
          return row.businessCategory?.categoryName || '-';
        },
        pdfWidth: 40
      },
      {
        key: 'createdAt',
        label: Constants.adminConstants.createdOn,
        accessor: (row) => row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '-',
        pdfWidth: 25
      },
      {
        key: 'updatedAt',
        label: Constants.adminConstants.updatedOn,
        accessor: (row) => row.updatedAt ? new Date(row.updatedAt).toLocaleDateString() : '-',
        pdfWidth: 25
      },
      {
        key: 'status',
        label: Constants.superadminConstants.statuslabel,
        accessor: (row) => row.isActive ? Constants.superadminConstants.activestatus : Constants.superadminConstants.inactivestatus,
        pdfWidth: 25
      }
    ]);
  }, []);

  const handleAdd = async (formData: SuperAdminTypes.BusinessOwnerTypes.BusinessOwnerFormData) => {
    await ServerActions.HandleFunction.handleAddCommon({
      formData,
      createAction: ServerActions.ServerActionslib.createBusinessOwnerAction,
      setLoading,
      setShowModal,
      router,
      successMessage: 'Business owner added successfully.',
      onSuccess: (result) => {
        if (result?.data?.data) {
          setBusinessOwners(prev => [...prev, result.data.data]);
        }
      }
    });
  };

  const handleEdit = async (formData: SuperAdminTypes.BusinessOwnerTypes.BusinessOwnerFormData) => {
    if (!editingOwner) return;
    await ServerActions.HandleFunction.handleEditCommon({
      formData,
      editingItem: editingOwner,
      getId: (item) => item._id,
      updateAction: (id, data) => ServerActions.ServerActionslib.updateBusinessOwnerAction(id as string, data),
      setLoading,
      setShowEditModal,
      setEditingItem: setEditingOwner,
      router,
      successMessage: 'Business owner updated successfully.',
      onSuccess: (result) => {
        if (result?.data?.data && editingOwner) {
          setBusinessOwners(prev => prev.map(o => (o._id === editingOwner._id ? result.data.data : o)));
        }
      }
    });
  };

  const handleToggleStatus = React.useCallback(async (id: string, value: boolean) => {
    const row = businessOwners.find(o => o._id === id);
    if (!row) return;
    setBusinessOwners(prev => prev.map(o => (o._id === id ? { ...o, isActive: value } : o)));
    await ServerActions.HandleFunction.handleToggleStatusCommon({
      row,
      next: value,
      getId: (item) => item._id,
      preparePayload: (row, next) => ({
        name: row.name,
        email: row.email,
        phone: row.phone,
        businessName: (row.businesses && row.businesses.length > 0) ? row.businesses[0].businessName : (row.businessName || ""),
        businessCategory: (row.businesses && row.businesses.length > 0) ? row.businesses[0].businessCategoryId?._id : (typeof row.businessCategory === 'object' ? row.businessCategory?._id : row.businessCategory),
        isActive: next
      }),
      updateAction: (id, data) => ServerActions.ServerActionslib.updateBusinessOwnerAction(id as string, data),
      setLoading,
      router,
      onError: () => {
        setBusinessOwners(prev => prev.map(o => (o._id === id ? { ...o, isActive: !value } : o)));
      }
    });
  }, [businessOwners, router]);

  // clear selected data
  const clearSelectedData = () => {
    setClearSelectedRows(prev => !prev);
    setSelectedRows([]);
    router.refresh();
  }

  const handleBulkApply = React.useCallback(async () => {
    await ServerActions.HandleFunction.handleBulkApplyCommon({
      selectedRows,
      actionFilter,
      activeStatusFilter,
      items: businessOwners,
      setItems: setBusinessOwners,
      bulkDeleteAction: async () => ({ success: false, error: "Bulk delete not implemented" }),
      bulkUpdateStatusAction: (payload) => ServerActions.ServerActionslib.bulkToggleBusinessOwnersStatusAction({
        userIds: payload.ids,
        isActive: !!payload.status
      }),
      idSelector: (r) => r._id,
      statusProp: "isActive",
      clearSelectedData
    });
  }, [selectedRows, actionFilter, activeStatusFilter, businessOwners, clearSelectedData]);

  const downloadPdf = async (): Promise<SuperAdminTypes.BusinessOwnerTypes.BusinessOwner[]> => {
    return await ServerActions.HandleFunction.handleDownloadCommon({
      selectedRows,
      searchParams,
      bulkGetSelectedAction: ServerActions.ServerActionslib.bulkGetSelectedBusinessOwnersAction,
      bulkGetAllAction: ServerActions.ServerActionslib.bulkGetBusinessOwnersAction,
      setDownloadData,
      idSelector: (item) => item._id,
    });
  };

  const handleEditModal = React.useCallback((owner: SuperAdminTypes.BusinessOwnerTypes.BusinessOwner) => {
    setEditingOwner(owner);
    setShowEditModal(true);
  }, []);

  const handleViewDetails = React.useCallback((owner: SuperAdminTypes.BusinessOwnerTypes.BusinessOwner) => {
    setSelectedOwner(owner);
    setShowDetailsModal(true);
  }, []);

  const tableColumns = React.useMemo(() => WebComponents.WebCommonComponents.CommonComponents.createColumns<SuperAdminTypes.BusinessOwnerTypes.BusinessOwner>({
    fields: [
      {
        name: Constants.superadminConstants.ownername,
        selector: (row: SuperAdminTypes.BusinessOwnerTypes.BusinessOwner) => row.name,
        sortable: true,
        width: "16%"
      },
      {
        name: Constants.superadminConstants.emaillabel,
        selector: (row: SuperAdminTypes.BusinessOwnerTypes.BusinessOwner) => row.email,
        sortable: true,
        width: "16%"
      },
      {
        name: Constants.superadminConstants.phonelabel,
        selector: (row: SuperAdminTypes.BusinessOwnerTypes.BusinessOwner) => row.phone,
        sortable: true,
        width: "15%"
      },
      {
        name: Constants.superadminConstants.businessnamelabel,
        selector: (row: SuperAdminTypes.BusinessOwnerTypes.BusinessOwner) => {
          if (row.businesses && row.businesses.length > 0) {
            return row.businesses[0].businessName || '-';
          }
          return row.businessName || '-';
        },
        sortable: true,
        width: "15%"
      },
      {
        name: Constants.superadminConstants.businesscategorylabel,
        selector: (row: SuperAdminTypes.BusinessOwnerTypes.BusinessOwner) => {
          if (row.businesses && row.businesses.length > 0) {
            return row.businesses[0].businessCategoryId?.categoryName || '-';
          }
          if (!row.businessCategory) return '-';
          if (typeof row.businessCategory === 'string') {
            return row.businessCategory;
          }
          return row.businessCategory?.categoryName || '-';
        },
        sortable: true,
        width: "15%"
      },
    ],
    status: {
      name: Constants.superadminConstants.statuslabel,
      idSelector: (row) => row._id,
      valueSelector: (row) => !!row.isActive,
      onToggle: (id, next) => handleToggleStatus(id, next),
    },
    actions: [
      {
        render: (row) => (
          <WebComponents.UiComponents.UiWebComponents.Button size="icon" variant="viewaction" onClick={() => handleViewDetails(row)}>
            <FaEye className="w-4 h-4" />
          </WebComponents.UiComponents.UiWebComponents.Button>
        )
      },
      {
        render: (row) => (
          <WebComponents.UiComponents.UiWebComponents.Button size="icon" variant="editaction" onClick={() => handleEditModal(row)}>
            <FaEdit className="w-4 h-4" />
          </WebComponents.UiComponents.UiWebComponents.Button>
        )
      }
    ]
  }), [handleEditModal, handleViewDetails, handleToggleStatus]);

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-lg sm:text-lg md:text-xl lg:text-2xl font-medium text-textMain dark:text-white truncate">
            {Constants.superadminConstants.ownerheading}
            {showModal && ` > ${Constants.superadminConstants.addOwner}`}
            {showEditModal && ` > ${Constants.superadminConstants.editOwner}`}
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-textSmall pt-2">
            {Constants.superadminConstants.ownerbio}
          </p>
        </div>
        <WebComponents.UiComponents.UiWebComponents.Button
          variant="addBackButton"
          onClick={() => {
            if (showModal || showEditModal) {
              setShowModal(false);
              setShowEditModal(false);
              setEditingOwner(null);
            } else {
              setShowModal(true);
            }
          }}
        >
          {showModal || showEditModal ? <><FaArrowLeft className="w-4 h-4" /> {Constants.superadminConstants.back}</> : <><FaPlus className="w-4 h-4" /> {Constants.superadminConstants.add}</>}
        </WebComponents.UiComponents.UiWebComponents.Button>
      </div>

      {!showModal && !showEditModal && (
        <div className="bg-white dark:bg-darkFilterbar rounded-[4px] h-full w-full mt-4 overflow-hidden">
          <WebComponents.WebCommonComponents.CommonComponents.CommonFilterBar
            actionFilter={actionFilter}
            onActionFilterChange={setActionFilter}
            actionOptions={actionOptions as any}
            activeStatusFilter={activeStatusFilter}
            onActiveStatusFilterChange={setActiveStatusFilter}
            activeStatusOptions={Constants.commonConstants.activeStatusOptions as any}
            selectedCount={selectedRows.length}
            onApply={handleBulkApply}
            categoryFilter={selectedCategoryFilter}
            onCategoryFilterChange={setSelectedCategoryFilter}
            categoryOptions={categoryOptions as any}
            statusFilter={statusFilter}
            onStatusFilterChange={(v) => setStatusFilter(v as any)}
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
                  filename={`owners-${new Date().toISOString().split('T')[0]}.csv`}
                  onExport={async () => {
                    const data = await downloadPdf();
                    WebComponents.UiComponents.UiWebComponents.SwalHelper.success({ text: 'CSV exported successfully.' });
                    clearSelectedData()
                    return data;
                  }}

                >
                  <button type="button" className="rounded-[4px] bg-[#ffffff] dark:bg-[#3A3A3A] border border-[#D8D9D9] border-opacity-50 font-interTight font-normal hover:bg-[#e0e0e0] dark:hover:bg-[#4A4A4A] shadow-sm transition-colors duration-200 cursor-pointer flex-shrink-0 sm:px-1 md:px-2 lg:px-2 xl:px-2 2xl:px-2 px-2 py-[6.9px]">
                    <Image src={Constants.assetsIcon.assets.csv} alt="CSV" width={24} height={24} className="w-5 h-5 sm:w-6 sm:h-6 md:w-6 md:h-6 lg:w-7 lg:h-7 xl:w-7 xl:h-7 2xl:w-7 2xl:h-7" />
                  </button>
                </WebComponents.UiComponents.UiWebComponents.DownloadCSV>
                <WebComponents.UiComponents.UiWebComponents.DownloadPDF
                  data={downloadData}
                  columns={exportColumns.pdfColumns}
                  filename={`owners-${new Date().toISOString().split('T')[0]}.pdf`}
                  title="Business Owners"
                  onExport={async () => {
                    const data = await downloadPdf();
                    WebComponents.UiComponents.UiWebComponents.SwalHelper.success({ text: 'PDF exported successfully.' });
                    clearSelectedData()
                    return data;
                  }}
                >
                  <button type="button" className="rounded-[4px] bg-[#ffffff] dark:bg-[#3A3A3A] border border-[#D8D9D9] border-opacity-50 font-interTight font-normal hover:bg-[#e0e0e0] dark:hover:bg-[#4A4A4A] shadow-sm transition-colors duration-200 cursor-pointer flex-shrink-0 sm:px-1 md:px-2 lg:px-2 xl:px-2 2xl:px-2 px-2 py-[6.9px]">
                    <Image src={Constants.assetsIcon.assets.pdf} alt="PDF" width={24} height={24} className="w-5 h-5 sm:w-6 sm:h-6 md:w-6 md:h-6 lg:w-7 lg:h-7 xl:w-7 xl:h-7 2xl:w-7 2xl:h-7" />
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
        <WebComponents.SuperAdminComponents.SuperadminWebComponents.SuperAdminForms.BusinessOwnerForm
          onClose={() => {
            setShowModal(false);
            setShowEditModal(false);
            setEditingOwner(null);
          }}
          onSubmit={showModal ? handleAdd : handleEdit}
          owner={editingOwner || undefined}
          businessCategories={businessCategories}
        />
      )}

      {showDetailsModal && selectedOwner && (
        <WebComponents.SuperAdminComponents.SuperadminWebComponents.SuperadminModels.BusinessOwnerDetailsModal
          owner={selectedOwner}
          onClose={() => setShowDetailsModal(false)}
        />
      )}
    </>
  );
}

