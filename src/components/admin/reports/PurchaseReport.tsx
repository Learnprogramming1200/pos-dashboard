"use client";

import React from "react";
import Image from "next/image";
import { Filter } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Constants } from "@/constant";
import { WebComponents } from "@/components";
import { AdminTypes, FiltersTypes } from "@/types";

interface PurchaseReportProps {
  initialData: AdminTypes.ReportTypes.PurchaseReport[];
  initialPagination: AdminTypes.ReportTypes.PurchaseReportPagination;
  initialStores: { _id: string; name: string }[];
  initialSummary: AdminTypes.ReportTypes.PurchaseReportSummary;
}

export default function PurchaseReportPage({
  initialData,
  initialPagination,
  initialStores,
  initialSummary,
}: PurchaseReportProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get initial values from URL params
  const getInitialValue = (key: string, defaultValue: string) => {
    const value = searchParams.get(key);
    return value !== null && value !== "" ? value : defaultValue;
  };

  const [searchTerm, setSearchTerm] = React.useState(getInitialValue("search", ""));
  const [storeFilter, setStoreFilter] = React.useState(getInitialValue("storeId", "All"));
  const [currentPage, setCurrentPage] = React.useState(initialPagination.page);
  const [rowsPerPage, setRowsPerPage] = React.useState(initialPagination.limit);

  // Filter modal state
  const [isFilterModalOpen, setIsFilterModalOpen] = React.useState(false);
  const [filterValues, setFilterValues] = React.useState({
    store: getInitialValue("storeId", "All"),
    status: getInitialValue("status", "All"),
    dateFrom: getInitialValue("dateFrom", ""),
    dateTo: getInitialValue("dateTo", ""),
    purchaseQtyMin: getInitialValue("minPurchaseQty", ""),
    purchaseQtyMax: getInitialValue("maxPurchaseQty", ""),
    purchaseAmountMin: getInitialValue("minPurchaseAmount", ""),
    purchaseAmountMax: getInitialValue("maxPurchaseAmount", ""),
  });

  // Function to update URL and trigger server-side fetch
  const updateUrlParams = React.useCallback(
    (params: Record<string, string | number | undefined>) => {
      const url = new URL(window.location.href);
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== "" && value !== "All") {
          url.searchParams.set(key, String(value));
        } else {
          url.searchParams.delete(key);
        }
      });
      router.push(url.pathname + url.search);
    },
    [router]
  );

  // Sync store filter with filter values (live update from modal)
  React.useEffect(() => {
    setStoreFilter(filterValues.store);
  }, [filterValues.store]);

  // Handle search with debounce
  React.useEffect(() => {
    const timer = setTimeout(() => {
      const currentSearch = searchParams.get("search") || "";
      if (searchTerm !== currentSearch) {
        updateUrlParams({ search: searchTerm, page: 1 });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, searchParams, updateUrlParams]);

  // Handle store filter change
  const handleStoreFilterChange = (value: string) => {
    setStoreFilter(value);
    setFilterValues((prev) => ({ ...prev, store: value }));
    updateUrlParams({
      storeId: value === "All" ? undefined : value,
      page: 1,
    });
  };

  // Handle pagination changes
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    updateUrlParams({ page });
  };

  const handleRowsPerPageChange = (perPage: number) => {
    setRowsPerPage(perPage);
    setCurrentPage(1);
    updateUrlParams({ limit: perPage, page: 1 });
  };

  // Handle apply filters
  const handleApplyFilters = () => {
    setIsFilterModalOpen(false);
    // setStoreFilter(filterValues.store); // Handled by useEffect
    updateUrlParams({
      storeId: filterValues.store === "All" ? undefined : filterValues.store,
      status: filterValues.status === "All" ? undefined : filterValues.status,
      dateFrom: filterValues.dateFrom || undefined,
      dateTo: filterValues.dateTo || undefined,
      minPurchaseQty: filterValues.purchaseQtyMin || undefined,
      maxPurchaseQty: filterValues.purchaseQtyMax || undefined,
      minPurchaseAmount: filterValues.purchaseAmountMin || undefined,
      maxPurchaseAmount: filterValues.purchaseAmountMax || undefined,
      page: 1,
    });
  };

  const handleResetFilters = () => {
    setFilterValues({
      store: "All",
      status: "All",
      dateFrom: "",
      dateTo: "",
      purchaseQtyMin: "",
      purchaseQtyMax: "",
      purchaseAmountMin: "",
      purchaseAmountMax: "",
    });
    setStoreFilter("All");
    setSearchTerm("");
    router.push(window.location.pathname);
  };

  // Filter configuration for the extended modal
  const filterConfig: FiltersTypes.FilterFieldConfig[] = [
    {
      type: "select",
      label: "Select Store",
      key: "store",
      options: [
        { label: "All Stores", value: "All" },
        ...initialStores.map((s) => ({ label: s.name, value: s._id })),
      ],
    },
    {
      type: "select",
      label: "Select Status",
      key: "status",
      options: [
        { label: "All Status", value: "All" },
        { label: "Approved", value: "Approved" },
        { label: "Billed", value: "Billed" },
      ],
    },
    {
      type: "date",
      label: "Date From",
      key: "dateFrom",
    },
    {
      type: "date",
      label: "Date To",
      key: "dateTo",
    },
    {
      type: "range",
      label: "Purchase Qty Range",
      minKey: "purchaseQtyMin",
      maxKey: "purchaseQtyMax",
      prefix: "",
    },
    {
      type: "range",
      label: "Purchase Amount Range",
      minKey: "purchaseAmountMin",
      maxKey: "purchaseAmountMax",
    },
  ];

  // Table columns
  const tableColumns = React.useMemo(
    () =>
      WebComponents.WebCommonComponents.CommonComponents.createColumns<AdminTypes.ReportTypes.PurchaseReport>(
        {
          fields: [
            {
              name: "PO Number",
              selector: (row: AdminTypes.ReportTypes.PurchaseReport) =>
                row.poNumber,
              sortable: true,
            },
            {
              name: "Purchase Date",
              selector: (row: AdminTypes.ReportTypes.PurchaseReport) =>
                row.purchaseDate,
              cell: (row: AdminTypes.ReportTypes.PurchaseReport) => (
                <span>
                  {new Date(row.purchaseDate).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              ),
              sortable: true,
            },
            {
              name: "Product Name",
              selector: (row: AdminTypes.ReportTypes.PurchaseReport) =>
                row.productName,
              sortable: true,
            },
            {
              name: "Supplier",
              selector: (row: AdminTypes.ReportTypes.PurchaseReport) =>
                row.supplierName,
              sortable: true,
            },
            {
              name: "Store",
              selector: (row: AdminTypes.ReportTypes.PurchaseReport) =>
                row.storeName,
              sortable: true,
            },
            {
              name: "Status",
              selector: (row: AdminTypes.ReportTypes.PurchaseReport) =>
                row.status,
              cell: (row: AdminTypes.ReportTypes.PurchaseReport) => (
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${row.status === "Billed"
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                    : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                    }`}
                >
                  {row.status}
                </span>
              ),
              sortable: true,
            },
            {
              name: "Purchase Qty",
              selector: (row: AdminTypes.ReportTypes.PurchaseReport) =>
                row.purchaseQty,
              sortable: true,
            },
            {
              name: "Unit Price",
              selector: (row: AdminTypes.ReportTypes.PurchaseReport) =>
                row.unitPrice,
              cell: (row: AdminTypes.ReportTypes.PurchaseReport) => (
                <span>₹{row.unitPrice.toLocaleString()}</span>
              ),
              sortable: true,
            },
            {
              name: "Purchase Amount",
              selector: (row: AdminTypes.ReportTypes.PurchaseReport) =>
                row.purchaseAmount,
              cell: (row: AdminTypes.ReportTypes.PurchaseReport) => (
                <span className="font-semibold text-green-600 dark:text-green-400">
                  ₹{row.purchaseAmount.toLocaleString()}
                </span>
              ),
              sortable: true,
            },
          ],
        }
      ),
    []
  );

  // Export columns
  const exportColumns = React.useMemo(() => {
    return WebComponents.WebCommonComponents.CommonComponents.generateExportColumns<AdminTypes.ReportTypes.PurchaseReport>(
      [
        {
          key: "poNumber",
          label: "PO Number",
          accessor: (row) => row.poNumber,
          pdfWidth: 12,
        },
        {
          key: "purchaseDate",
          label: "Purchase Date",
          accessor: (row) =>
            new Date(row.purchaseDate).toLocaleDateString("en-US"),
          pdfWidth: 12,
        },
        {
          key: "productName",
          label: "Product Name",
          accessor: (row) => row.productName,
          pdfWidth: 18,
        },
        {
          key: "supplierName",
          label: "Supplier",
          accessor: (row) => row.supplierName,
          pdfWidth: 12,
        },
        {
          key: "storeName",
          label: "Store",
          accessor: (row) => row.storeName,
          pdfWidth: 10,
        },
        {
          key: "status",
          label: "Status",
          accessor: (row) => row.status,
          pdfWidth: 8,
        },
        {
          key: "purchaseQty",
          label: "Purchase Qty",
          accessor: (row) => row.purchaseQty.toString(),
          pdfWidth: 8,
        },
        {
          key: "unitPrice",
          label: "Unit Price",
          accessor: (row) => row.unitPrice.toFixed(2),
          pdfWidth: 10,
        },
        {
          key: "purchaseAmount",
          label: "Purchase Amount",
          accessor: (row) => row.purchaseAmount.toFixed(2),
          pdfWidth: 10,
        },
      ]
    );
  }, []);

  // Store options for the filter bar
  const storeOptions = React.useMemo(
    () => [
      { label: Constants.adminReportsConstants.allStores, value: "All" },
      ...initialStores.map((store) => ({
        label: store.name,
        value: store._id,
      })),
    ],
    [initialStores]
  );

  // Total row for the table footer
  const totalRow = (
    <div className="flex w-full bg-[#F7F7F7] dark:bg-[#333333] border-t border-[#F4F5F5] dark:border-[#616161]">
      <div style={{ width: "11%" }} className="p-4 font-bold text-sm text-[#171B23] dark:text-white flex items-center">Total</div>
      <div style={{ width: "11%" }} className="p-4 flex items-center"></div>
      <div style={{ width: "11%" }} className="p-4 flex items-center"></div>
      <div style={{ width: "11%" }} className="p-4 flex items-center"></div>
      <div style={{ width: "11%" }} className="p-4 flex items-center"></div>
      <div style={{ width: "11%" }} className="p-4 flex items-center"></div>
      <div style={{ width: "11%" }} className="p-4 flex items-center"></div>
      <div style={{ width: "11%" }} className="p-4 flex items-center"></div>
      <div style={{ width: "12%" }} className="p-4 font-bold text-sm text-green-600 dark:text-green-400 flex items-center">
        ₹{initialSummary.totalPurchaseAmount.toLocaleString()}
      </div>
    </div>
  );

  const handleCloseFilterModal = () => {
    setIsFilterModalOpen(false);
    // Revert filter values to match current URL/Applied state
    setFilterValues({
      store: getInitialValue("storeId", "All"),
      status: getInitialValue("status", "All"),
      dateFrom: getInitialValue("dateFrom", ""),
      dateTo: getInitialValue("dateTo", ""),
      purchaseQtyMin: getInitialValue("minPurchaseQty", ""),
      purchaseQtyMax: getInitialValue("maxPurchaseQty", ""),
      purchaseAmountMin: getInitialValue("minPurchaseAmount", ""),
      purchaseAmountMax: getInitialValue("maxPurchaseAmount", ""),
    });
  };

  return (
    <div className="space-y-6">
      <WebComponents.AdminComponents.AdminWebComponents.Models.ExtendedFiltersModal
        isOpen={isFilterModalOpen}
        onClose={handleCloseFilterModal}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
        filters={filterValues}
        setFilters={setFilterValues}
        filterConfig={filterConfig}
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-2">
        <div>
          <h1 className="text-lg sm:text-lg md:text-xl lg:text-2xl font-medium text-textMain dark:text-white truncate">
            {Constants.adminReportsConstants.purchaseReport}
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-textSmall pt-2">
            {Constants.adminReportsConstants.purchaseReportBio}
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-darkFilterbar rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-textSmall dark:text-gray-400">
            Total Purchase Qty
          </p>
          <p className="text-2xl font-bold text-textMain dark:text-white">
            {initialSummary.totalPurchaseQty.toLocaleString()}
          </p>
        </div>
        <div className="bg-white dark:bg-darkFilterbar rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-textSmall dark:text-gray-400">
            Total Unit Price
          </p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            ₹{initialSummary.totalUnitPrice.toLocaleString()}
          </p>
        </div>
        <div className="bg-white dark:bg-darkFilterbar rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-textSmall dark:text-gray-400">
            Total Purchase Amount
          </p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            ₹{initialSummary.totalPurchaseAmount.toLocaleString()}
          </p>
        </div>
      </div> */}

      {/* Filters and Table */}
      <div className="bg-white dark:bg-darkFilterbar rounded-[4px] h-full w-full mt-4 overflow-hidden">
        <WebComponents.WebCommonComponents.CommonComponents.CommonFilterBar
          actionFilter="All"
          activeStatusFilter="All"
          onActiveStatusFilterChange={() => { }}
          activeStatusOptions={[]}
          selectedCount={0}
          categoryFilter="All"
          onCategoryFilterChange={() => { }}
          categoryOptions={[]}
          showCategoryFilter={false}
          statusFilter={storeFilter}
          onStatusFilterChange={handleStoreFilterChange}
          statusOptions={storeOptions}
          statusPlaceholder={Constants.adminReportsConstants.allStores}
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
          searchPlaceholder={Constants.adminReportsConstants.searchPlaceholder}
          showActionSection={false}
          renderExports={
            <>
              <WebComponents.UiWebComponents.UiWebComponents.DownloadCSV
                data={initialData}
                columns={exportColumns.csvColumns as any}
                filename={`purchase-report-${new Date().toISOString().split("T")[0]
                  }.csv`}
                onExport={async () => {
                  WebComponents.UiWebComponents.UiWebComponents.SwalHelper.success(
                    {
                      text: `${Constants.adminReportsConstants.exportCSV} successfully.`,
                    }
                  );
                  return initialData;
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
              </WebComponents.UiWebComponents.UiWebComponents.DownloadCSV>
              <WebComponents.UiWebComponents.UiWebComponents.DownloadPDF
                data={initialData}
                columns={exportColumns.pdfColumns as any}
                filename={`purchase-report-${new Date().toISOString().split("T")[0]
                  }.pdf`}
                title={Constants.adminReportsConstants.purchaseReport}
                orientation="landscape"
                onExport={async () => {
                  WebComponents.UiWebComponents.UiWebComponents.SwalHelper.success(
                    {
                      text: `${Constants.adminReportsConstants.exportPDF} successfully.`,
                    }
                  );
                  return initialData;
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
              </WebComponents.UiWebComponents.UiWebComponents.DownloadPDF>
            </>
          }
          renderSearchActions={
            <button
              onClick={() => setIsFilterModalOpen(true)}
              className="p-2.5 rounded-md text-gray-900 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex-shrink-0"
              title="Extended Filters"
            >
              <Filter className="w-5 h-5" />
            </button>
          }
        />
        <div>
          <WebComponents.WebCommonComponents.CommonComponents.DataTable
            columns={tableColumns}
            data={initialData}
            useCustomPagination={true}
            totalRecords={initialPagination.totalRecords}
            filteredRecords={initialPagination.totalRecords}
            paginationPerPage={rowsPerPage}
            paginationDefaultPage={currentPage}
            paginationRowsPerPageOptions={[5, 10, 25, 50]}
            onChangePage={handlePageChange}
            onChangeRowsPerPage={handleRowsPerPageChange}
            useUrlParams={false}
            totalReports={true}
            totalRow={totalRow}
          />
        </div>
      </div>
    </div>
  );
}
