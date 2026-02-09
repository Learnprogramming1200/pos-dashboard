"use client";
import React from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import { HiArrowLeft, HiPlus } from "react-icons/hi";
import { ServerActions } from "@/lib";
import { Constants } from "@/constant";
import { customHooks } from "@/hooks";
import { WebComponents } from "@/components";
import { PaginationType, SearchParamsTypes, AdminTypes } from "@/types";

export default function GiftCardConfig({
  initialGiftCards,
  initialPagination,
}: {
  readonly initialGiftCards: AdminTypes.giftCardTypes.GiftCard[];
  readonly initialPagination: PaginationType.Pagination;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [giftCards, setGiftCards] = React.useState<AdminTypes.giftCardTypes.GiftCard[]>(initialGiftCards);
  const [pagination, setPagination] = React.useState<PaginationType.Pagination>(initialPagination);
  const [showModal, setShowModal] = React.useState(false);
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [showDetailsModal, setShowDetailsModal] = React.useState(false);
  const [editingGiftCard, setEditingGiftCard] = React.useState<AdminTypes.giftCardTypes.GiftCard | null>(null);
  const [selectedGiftCard, setSelectedGiftCard] = React.useState<AdminTypes.giftCardTypes.GiftCard | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [selectedRows, setSelectedRows] = React.useState<AdminTypes.giftCardTypes.GiftCard[]>([]);
  const [actionFilter, setActionFilter] = React.useState("All");
  const [activeStatusFilter, setActiveStatusFilter] = React.useState("All");
  const [downloadData, setDownloadData] = React.useState([])
  const [clearSelectedRows, setClearSelectedRows] = React.useState(false);
  const { searchTerm, setSearchTerm, statusFilter, setStatusFilter, filteredData } =
    customHooks.useListFilters<AdminTypes.giftCardTypes.GiftCard>(
      giftCards
    );
  /* Permissions */
  const { checkPermission } = customHooks.useUserPermissions();

  const bulkActionOptions = React.useMemo(() => {
    const options = Constants.commonConstants.actionOptions;
    return options.filter(option => {
      if (option.value === 'Status') {
        return checkPermission("promo.giftcards", "update");
      }
      if (option.value === 'Delete') {
        return checkPermission("promo.giftcards", "delete");
      }
      return true;
    });
  }, [checkPermission]);

  // Sync state with props when URL params change (server re-fetches data)
  React.useEffect(() => {
    setGiftCards(initialGiftCards);
    setPagination(initialPagination);
  }, [initialGiftCards]);

  // Reset action filter when no rows are selected
  React.useEffect(() => {
    if (selectedRows.length === 0) {
      setActionFilter("All");
      setActiveStatusFilter("All");
    }
  }, [selectedRows]);

  //Add
  const handleAdd = async (
    formData: AdminTypes.giftCardTypes.GiftCardFormData) => {
    await ServerActions.HandleFunction.handleAddCommon({
      formData,
      createAction: ServerActions.ServerActionslib.createGiftCardAction,
      setLoading,
      setShowModal: setShowModal,
      router,
      successMessage: "Gift card added successfully.",
      errorMessage: "Failed to add gift card.",
      checkExistsError: (errorMessage) => errorMessage.toLowerCase() === "gift card already exists",
    });
  };

  //Edit
  const handleEdit = async (
    formData: AdminTypes.giftCardTypes.GiftCardFormData) => {
    await ServerActions.HandleFunction.handleEditCommon({
      formData,
      editingItem: editingGiftCard,
      getId: (item) => item._id,
      updateAction: (id: string | number, data) => ServerActions.ServerActionslib.updateGiftCardAction(String(id), data),
      setLoading,
      setShowEditModal: setShowEditModal,
      setEditingItem: setEditingGiftCard,
      router,
      successMessage: "Gift card updated successfully.",
      errorMessage: "Failed to update gift card.",
      checkExistsError: (errorMessage) => errorMessage.toLowerCase() === "gift card already exists",
    });
  };

  //Delete
  const handleDelete = React.useCallback(
    async (id: string) => {
      await ServerActions.HandleFunction.handleDeleteCommon({
        id,
        deleteAction: (id: string | number) => ServerActions.ServerActionslib.deleteGiftCardAction(String(id)),
        setLoading,
        router,
        successMessage: "The gift card has been deleted.",
        errorMessage: "Failed to delete gift card.",
      });
    }, [router]);

  //Edit Modal
  const handleEditModal = React.useCallback((giftCard: AdminTypes.giftCardTypes.GiftCard) => {
    setEditingGiftCard(giftCard);
    setShowEditModal(true);
  }, []);

  // View Details
  const handleViewDetails = React.useCallback((giftCard: AdminTypes.giftCardTypes.GiftCard) => {
    setSelectedGiftCard(giftCard);
    setShowDetailsModal(true);
  }, []);

  // Handle status toggle (row-based)
  const handleToggleStatus = React.useCallback(
    async (row: AdminTypes.giftCardTypes.GiftCard, next: boolean) => {
      await ServerActions.HandleFunction.handleToggleStatusCommon({
        row,
        next,
        getId: (row) => row._id,
        preparePayload: (row, next) => {
          return {
            name: row.name,
            number: row.number,
            numberGenerationType: row.numberGenerationType,
            value: row.value,
            thresholdAmount: row.thresholdAmount,
            validity: row.validity,
            customerScope: row.customerScope,
            assignedCustomerIds: row.assignedCustomerIds,
            terms: row.terms,
            giftCardImage: row.giftCardImage,
            status: next ? "Active" : "Inactive",
          };
        },
        updateAction: (id: string | number, data) => ServerActions.ServerActionslib.updateGiftCardAction(String(id), data),
        setLoading,
        router,
        successMessage: `Status updated to ${next ? "Active" : "Inactive"}.`,
        errorMessage: "Failed to update status.",
      });
    }, [router]);

  const handleToggleStatusById = React.useCallback(
    async (id: string, next: boolean) => {
      const row = giftCards.find((c) => c._id === id);
      if (row) {
        await handleToggleStatus(row, next);
      }
    }, [giftCards, handleToggleStatus]);

  // Table columns using CommonComponents.createColumns
  const tableColumns = React.useMemo(() => WebComponents.WebCommonComponents.CommonComponents.createColumns<AdminTypes.giftCardTypes.GiftCard>({
    fields: [
      {
        name: "Gift Card Name",
        selector: (row: AdminTypes.giftCardTypes.GiftCard) => row.name,
        sortable: true,
      },
      {
        name: "Gift Card Number",
        selector: (row: AdminTypes.giftCardTypes.GiftCard) => row.number,
        sortable: true,
      },
      {
        name: "Value",
        selector: (row: AdminTypes.giftCardTypes.GiftCard) =>
          row.value.toFixed(2),
        sortable: true,
      },
      {
        name: "Threshold Amount",
        selector: (row: AdminTypes.giftCardTypes.GiftCard) =>
          (row.thresholdAmount ?? 0).toFixed(2),
        sortable: true,
      },
      {
        name: "Validity",
        selector: (row: AdminTypes.giftCardTypes.GiftCard) =>
          new Date(row.validity).toLocaleDateString(),
        sortable: true,
      },
      {
        name: "Customers",
        selector: (row: AdminTypes.giftCardTypes.GiftCard) =>
          row.customerScope === "All"
            ? "All"
            : `${row.assignedCustomerIds?.length || 0} selected`,
        cell: (row: AdminTypes.giftCardTypes.GiftCard) => (
          <WebComponents.UiComponents.UiWebComponents.Badge className="bg-primary text-white text-xs whitespace-nowrap w-fit">
            {row.customerScope === "All"
              ? "All"
              : row.assignedCustomerIds?.length
                ? `${row.assignedCustomerIds.length} selected`
                : "-"}
          </WebComponents.UiComponents.UiWebComponents.Badge>
        ),
        sortable: true,
      },
    ],
    status: {
      idSelector: (row) => row._id,
      valueSelector: (row) => row.status === "Active",
      onToggle: handleToggleStatusById,
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
      ...(checkPermission("promo.giftcards", "update") ? [{
        render: (row: any) => (
          <WebComponents.UiComponents.UiWebComponents.Button
            size="icon"
            variant="editaction"
            onClick={() => handleEditModal(row)}
          >
            <FaEdit className="w-4 h-4" />
          </WebComponents.UiComponents.UiWebComponents.Button>
        ),
      }] : []),
      ...(checkPermission("promo.giftcards", "delete") ? [{
        render: (row: any) => (
          <WebComponents.UiComponents.UiWebComponents.Button
            size="icon"
            variant="deleteaction"
            onClick={() => handleDelete(row._id)}
          >
            <FaTrash className="w-4 h-4" />
          </WebComponents.UiComponents.UiWebComponents.Button>
        ),
      }] : []),
    ],
  }),
    [handleToggleStatusById, handleViewDetails, handleEditModal, handleDelete]
  );

  // CSV and PDF export columns
  const exportColumns = React.useMemo(() => {
    return WebComponents.WebCommonComponents.CommonComponents.generateExportColumns<AdminTypes.giftCardTypes.GiftCard>([
      {
        key: "name",
        label: "Gift Card Name",
        accessor: (row) => row.name || "-",
        pdfWidth: 30,
      },
      {
        key: "number",
        label: "Gift Card Number",
        accessor: (row) => row.number || "-",
        pdfWidth: 25,
      },
      {
        key: "value",
        label: "Value",
        accessor: (row) => row.value.toFixed(2),
        pdfWidth: 20,
      },
      {
        key: "thresholdAmount",
        label: "Threshold Amount",
        accessor: (row) => (row.thresholdAmount ?? 0).toFixed(2),
        pdfWidth: 25,
      },
      {
        key: "validity",
        label: "Validity",
        accessor: (row) =>
          row.validity ? new Date(row.validity).toLocaleDateString() : "-",
        pdfWidth: 25,
      },
      {
        key: "customerScope",
        label: "Customer Scope",
        accessor: (row) =>
          row.customerScope === "All"
            ? "All"
            : `${row.assignedCustomerIds?.length || 0} selected`,
        pdfWidth: 30,
      },
      {
        key: "status",
        label: "Status",
        accessor: (row) => (row.status === "Active" ? "Active" : "Inactive"),
        pdfWidth: 20,
      },
    ]);
  }, []);

  // Download PDF function
  const downloadPdf = async (): Promise<AdminTypes.giftCardTypes.GiftCard[]> => {
    const selectedRowsIds = selectedRows.map(item => item._id)
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
      res = await ServerActions.ServerActionslib.bulkGetSelectedGiftCardAction({ ids: selectedRowsIds });
    } else {
      res = await ServerActions.ServerActionslib.bulkGetGiftCardAction(filterDatas);
    }
    const rows = Array.isArray(res?.data?.data?.data) ? res.data.data.data : [];
    setDownloadData(rows);
    return rows;
  };

  // Clear selected data
  const clearSelectedData = React.useCallback(() => {
    setClearSelectedRows((prev) => !prev);
    setSelectedRows([]);
    router.refresh();
  }, [router]);

  // Bulk apply handler (status update / delete)
  const handleBulkApply = React.useCallback(async () => {
    const ids = selectedRows.map((r) => r._id);

    if (actionFilter !== "Status") {
      if (actionFilter === "Delete") {
        const confirm = await WebComponents.UiComponents.UiWebComponents.SwalHelper.delete();
        if (!confirm.isConfirmed) return;
        try {
          const result = await ServerActions.ServerActionslib.bulkDeleteGiftCardsAction({ ids, });
          if (!result?.success)
            throw new Error(
              result?.error || "Failed to delete selected gift cards"
            );
          WebComponents.UiComponents.UiWebComponents.SwalHelper.success({
            text: "Selected gift cards deleted.",
          });
          clearSelectedData();
        } catch (error: unknown) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to delete selected gift cards.";
          WebComponents.UiComponents.UiWebComponents.SwalHelper.error({ text: errorMessage });
        }
      }
      return;
    }

    if (activeStatusFilter === "All") {
      WebComponents.UiComponents.UiWebComponents.SwalHelper.error({ text: "Please select a status." });
      return;
    }

    const isActive = activeStatusFilter === "Active";
    try {
      const result = await ServerActions.ServerActionslib.bulkUpdateGiftCardsStatusAction({
        ids,
        status: isActive ? "Active" : "Inactive",
      });
      if (!result?.success)
        throw new Error(result?.error || "Failed to apply status");
      WebComponents.UiComponents.UiWebComponents.SwalHelper.success({ text: "Status updated successfully." });
      clearSelectedData();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to apply status.";
      WebComponents.UiComponents.UiWebComponents.SwalHelper.error({ text: errorMessage });
    }
  }, [actionFilter, activeStatusFilter, selectedRows]);


  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-lg sm:text-lg md:text-xl lg:text-2xl font-medium text-textMain dark:text-white truncate">
            {showModal || showEditModal ? `${Constants.adminConstants.giftCardHeading} > ${showModal ? Constants.adminConstants.addGiftCard : "Edit Gift Card"}` : Constants.adminConstants.giftCardHeading}
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-textSmall pt-2">
            {Constants.adminConstants.giftCardBio}
          </p>
        </div>
        {(checkPermission("promo.giftcards", "create")) && (
          <WebComponents.UiComponents.UiWebComponents.Button
            variant="addBackButton"
            onClick={() => {
              if (showModal || showEditModal) {
                setShowModal(false);
                setShowEditModal(false);
                setEditingGiftCard(null);
              } else {
                setEditingGiftCard(null);
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
                <HiPlus className="w-4 h-4" />{" "}
                {Constants.adminConstants.add}
              </>
            )}
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
            statusFilter={statusFilter}
            onStatusFilterChange={(value: string) => {
              const validValue =
                value === "Active" || value === "Inactive" ? value : "All";
              setStatusFilter(validValue);
            }}
            statusOptions={
              Constants.commonConstants.CommonFilterOptions.CommonStatusOptions
            }
            searchTerm={searchTerm}
            onSearchTermChange={setSearchTerm}
            showCategoryFilter={false}
            renderExports={
              <>
                <WebComponents.UiComponents.UiWebComponents.DownloadCSV
                  data={downloadData}
                  columns={exportColumns.csvColumns}
                  filename={`gift-cards-${new Date().toISOString().split("T")[0]}.csv`}
                  onExport={async () => {
                    const data = await downloadPdf();
                    WebComponents.UiComponents.UiWebComponents.SwalHelper.success({
                      text: "CSV exported successfully.",
                    });
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
                    <Image
                      src={Constants.assetsIcon.assets.csv}
                      alt="CSV"
                      width={28}
                      height={28}
                      className="w-5 h-5 sm:w-6 sm:h-6 md:w-6 md:h-6 lg:w-7 lg:h-7 xl:w-7 xl:h-7 2xl:w-7 2xl:h-7"
                    />
                  </button>
                </WebComponents.UiComponents.UiWebComponents.DownloadCSV>
                <WebComponents.UiComponents.UiWebComponents.DownloadPDF
                  data={downloadData}
                  columns={exportColumns.pdfColumns}
                  filename={`gift-cards-${new Date().toISOString().split("T")[0]
                    }.pdf`}
                  title="Gift Cards Report"
                  orientation="landscape"
                  onExport={async () => {
                    const data = await downloadPdf();
                    WebComponents.UiComponents.UiWebComponents.SwalHelper.success({
                      text: "PDF exported successfully.",
                    });
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
                    <Image
                      src={Constants.assetsIcon.assets.pdf}
                      alt="PDF"
                      width={28}
                      height={28}
                      className="w-5 h-5 sm:w-6 sm:h-6 md:w-6 md:h-6 lg:w-7 lg:h-7 xl:w-7 xl:h-7 2xl:w-7 2xl:h-7"
                    />
                  </button>
                </WebComponents.UiComponents.UiWebComponents.DownloadPDF>
              </>
            }
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

      {/* Add / Edit Modal */}
      {(showModal || showEditModal) && (
        <WebComponents.UiComponents.UiWebComponents.AdminFormModal
          formId="gift-card-form"
          onClose={() => {
            setShowModal(false);
            setShowEditModal(false);
            setEditingGiftCard(null);
          }}
          loading={loading}
        >
          {editingGiftCard ? (
            <WebComponents.AdminComponents.AdminWebComponents.Forms.GiftCardForm
              onSubmit={handleEdit}
              giftCard={editingGiftCard}
            />
          ) : (
            <WebComponents.AdminComponents.AdminWebComponents.Forms.GiftCardForm onSubmit={handleAdd} />
          )}
        </WebComponents.UiComponents.UiWebComponents.AdminFormModal>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedGiftCard && (
        <WebComponents.AdminComponents.AdminWebComponents.Models.GiftCardDetailsModal
          giftCard={selectedGiftCard}
          onClose={() => setShowDetailsModal(false)}
        />
      )}
    </>
  );
}

