"use client";

import React from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { TrendingDown, Filter, DollarSign, ShoppingCart } from "lucide-react";
import { ServerActions } from "@/lib";
import { Constants } from "@/constant";
import { WebComponents } from "@/components";
import { AdminTypes } from "@/types";

interface ProfitLossReportProps {
  initialData: AdminTypes.ReportTypes.ProfitLossReport[];
  initialSummary?: any;
  currency?: string;
}

export default function ProfitLossReport({
  initialData,
  initialSummary,
  currency
}: ProfitLossReportProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchTerm, setSearchTerm] = React.useState(searchParams.get("search") || "");
  const [storeFilter, setStoreFilter] = React.useState(searchParams.get("store") || "All");
  const [currentPage, setCurrentPage] = React.useState(1);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  // Filter modal state
  const [isFilterModalOpen, setIsFilterModalOpen] = React.useState(false);
  const [filterValues, setFilterValues] = React.useState({
    store: searchParams.get("store") || "All",
    year: searchParams.get("year") || "All",
    month: searchParams.get("month") || "All",
    dateFrom: searchParams.get("dateFrom") || "",
    dateTo: searchParams.get("dateTo") || "",
    salesMin: searchParams.get("salesMin") || "",
    salesMax: searchParams.get("salesMax") || "",
    purchaseMin: searchParams.get("purchaseMin") || "",
    purchaseMax: searchParams.get("purchaseMax") || "",
    expensesMin: searchParams.get("expensesMin") || "",
    expensesMax: searchParams.get("expensesMax") || "",
    netProfitMin: searchParams.get("netProfitMin") || "",
    netProfitMax: searchParams.get("netProfitMax") || ""
  });

  const profitLossData = initialData || [];

  // Get years - use getYears() to show a range of years (current year and previous 5 years)
  const availableYears = React.useMemo(() => {
    return ServerActions.DatePretier.getYears();
  }, []);

  // Get unique stores - need to map storeId to storeName
  const storeOptions = React.useMemo(() => {
    const storeMap = new Map<string, string>();
    profitLossData.forEach((item: any) => {
      const sName = item.storeName || item.store;
      if (item.storeId && sName) {
        storeMap.set(item.storeId, sName);
      }
    });
    return Array.from(storeMap.entries()).map(([storeId, storeName]) => ({
      label: storeName,
      value: storeId
    }));
  }, [profitLossData]);

  // Filtered data
  const filteredData = React.useMemo(() => {
    let filtered = profitLossData;

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.storeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.date.includes(searchTerm)
      );
    }

    if (storeFilter !== "All") {
      filtered = filtered.filter(item => item.storeId === storeFilter);
    }

    // Apply advanced filters
    if (filterValues.store !== "All") {
      filtered = filtered.filter(item => item.storeId === filterValues.store);
    }

    // Year filter
    if (filterValues.year !== "All") {
      filtered = filtered.filter(item => {
        const year = new Date(item.date).getFullYear().toString();
        return year === filterValues.year;
      });
    }

    // Month filter
    if (filterValues.month !== "All") {
      filtered = filtered.filter(item => {
        const date = new Date(item.date);
        const monthName = date.toLocaleDateString('en-US', { month: 'long' });
        return monthName === filterValues.month;
      });
    }

    if (filterValues.dateFrom) {
      filtered = filtered.filter(item => item.date >= filterValues.dateFrom);
    }
    if (filterValues.dateTo) {
      filtered = filtered.filter(item => item.date <= filterValues.dateTo);
    }
    if (filterValues.salesMin) {
      filtered = filtered.filter(item => item.sales >= Number.parseFloat(filterValues.salesMin));
    }
    if (filterValues.salesMax) {
      filtered = filtered.filter(item => item.sales <= Number.parseFloat(filterValues.salesMax));
    }
    if (filterValues.purchaseMin) {
      filtered = filtered.filter(item => item.purchase >= Number.parseFloat(filterValues.purchaseMin));
    }
    if (filterValues.purchaseMax) {
      filtered = filtered.filter(item => item.purchase <= Number.parseFloat(filterValues.purchaseMax));
    }
    if (filterValues.expensesMin) {
      filtered = filtered.filter(item => item.expenses >= Number.parseFloat(filterValues.expensesMin));
    }
    if (filterValues.expensesMax) {
      filtered = filtered.filter(item => item.expenses <= Number.parseFloat(filterValues.expensesMax));
    }
    if (filterValues.netProfitMin) {
      filtered = filtered.filter(item => item.netProfit >= Number.parseFloat(filterValues.netProfitMin));
    }
    if (filterValues.netProfitMax) {
      filtered = filtered.filter(item => item.netProfit <= Number.parseFloat(filterValues.netProfitMax));
    }

    return filtered;
  }, [profitLossData, searchTerm, storeFilter, filterValues]);

  // Paginated data for table
  const paginatedData = React.useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, currentPage, rowsPerPage]);

  // Currency symbol from props
  const currencySymbol = currency === "INR" ? "₹" : "$";

  // Calculate summary statistics for card
  const summaryStats = React.useMemo(() => {
    // If no filters are applied and we have initial summary, use it
    const isFiltered = searchTerm || storeFilter !== "All" ||
      Object.entries(filterValues).some(([key, value]) => key !== "store" && value !== "All" && value !== "");

    if (!isFiltered && initialSummary) {
      const s = initialSummary;
      return {
        totalProfit: s.netProfit > 0 ? s.netProfit : 0,
        totalLoss: s.netProfit < 0 ? Math.abs(s.netProfit) : 0,
        totalNetProfit: s.netProfit,
        totalExpenses: s.totalExpense,
        totalSales: s.totalSales,
      };
    }

    let totalProfit = 0;
    let totalLoss = 0;

    const totalNetProfit = filteredData.reduce((sum, item) => {
      if (item.netProfit > 0) {
        totalProfit += item.netProfit;
      } else if (item.netProfit < 0) {
        totalLoss += Math.abs(item.netProfit);
      }
      return sum + item.netProfit;
    }, 0);

    const totalExpenses = filteredData.reduce((sum, item) => {
      return sum + item.expenses;
    }, 0);

    const totalSales = filteredData.reduce((sum, item) => {
      return sum + item.sales;
    }, 0);

    return {
      totalProfit,
      totalLoss,
      totalNetProfit,
      totalExpenses,
      totalSales,
    };
  }, [filteredData, initialSummary, searchTerm, storeFilter, filterValues]);

  const showMonthYear = React.useMemo(() => {
    return filterValues.year !== "All" || filterValues.month !== "All";
  }, [filterValues.year, filterValues.month]);

  // Table columns using createColumns
  const tableColumns = React.useMemo(() => {
    return WebComponents.WebCommonComponents.CommonComponents.createColumns<AdminTypes.ReportTypes.ProfitLossReport>({
      fields: [
        {
          name: "Date",
          selector: (row: AdminTypes.ReportTypes.ProfitLossReport) => row.date,
          cell: (row: AdminTypes.ReportTypes.ProfitLossReport) => {
            if (showMonthYear) {
              const date = new Date(row.date);
              const monthName = date.toLocaleDateString('en-US', { month: 'long' });
              const year = date.getFullYear();
              return (
                <span className="text-gray-900 dark:text-gray-300">{monthName} {year}</span>
              );
            }
            return (
              <span className="text-gray-900 dark:text-gray-300">{row.date}</span>
            );
          },
          sortable: true
        },
        {
          name: "Store",
          selector: (row: any) => row.store,
          cell: (row: any) => (
            <span className="text-gray-900 dark:text-gray-300">{row.store}</span>
          ),
          sortable: true
        },
        {
          name: "Sales",
          selector: (row: AdminTypes.ReportTypes.ProfitLossReport) => row.sales,
          cell: (row: AdminTypes.ReportTypes.ProfitLossReport) => (
            <span className="font-medium text-gray-900 dark:text-gray-300">{currencySymbol}{row.sales.toFixed(2)}</span>
          ),
          sortable: true
        },
        {
          name: "Purchase Return",
          selector: (row: AdminTypes.ReportTypes.ProfitLossReport) => row.purchaseReturn,
          cell: (row: AdminTypes.ReportTypes.ProfitLossReport) => (
            <span className="font-medium text-gray-900 dark:text-gray-300">{currencySymbol}{row.purchaseReturn.toFixed(2)}</span>
          ),
          sortable: true
        },
        {
          name: "Purchase",
          selector: (row: AdminTypes.ReportTypes.ProfitLossReport) => row.purchase,
          cell: (row: AdminTypes.ReportTypes.ProfitLossReport) => (
            <span className="font-medium text-gray-900 dark:text-gray-300">{currencySymbol}{row.purchase.toFixed(2)}</span>
          ),
          sortable: true
        },
        {
          name: "Expenses",
          selector: (row: AdminTypes.ReportTypes.ProfitLossReport) => row.expenses,
          cell: (row: AdminTypes.ReportTypes.ProfitLossReport) => (
            <span className="font-medium text-gray-900 dark:text-gray-300">{currencySymbol}{row.expenses.toFixed(2)}</span>
          ),
          sortable: true
        },
        {
          name: "Sales Return",
          selector: (row: AdminTypes.ReportTypes.ProfitLossReport) => row.salesReturn,
          cell: (row: AdminTypes.ReportTypes.ProfitLossReport) => (
            <span className="font-medium text-gray-900 dark:text-gray-300">{currencySymbol}{row.salesReturn.toFixed(2)}</span>
          ),
          sortable: true
        },
        {
          name: "Net Profit",
          selector: (row: AdminTypes.ReportTypes.ProfitLossReport) => row.netProfit,
          cell: (row: AdminTypes.ReportTypes.ProfitLossReport) => (
            <span className="font-semibold text-gray-900 dark:text-gray-300">
              {currencySymbol}{row.netProfit.toFixed(2)}
            </span>
          ),
          sortable: true
        },
      ],
    });
  }, [showMonthYear]);

  // Export columns using generateExportColumns
  const exportColumns = React.useMemo(() => {
    return WebComponents.WebCommonComponents.CommonComponents.generateExportColumns<AdminTypes.ReportTypes.ProfitLossReport>([
      {
        key: "date",
        label: "Date",
        accessor: (row: AdminTypes.ReportTypes.ProfitLossReport) => row.date,
        pdfWidth: 12
      },
      {
        key: "storeName",
        label: "Store",
        accessor: (row: any) => row.storeName || row.store || "Unknown Store",
        pdfWidth: 15
      },
      {
        key: "sales",
        label: "Sales",
        accessor: (row: AdminTypes.ReportTypes.ProfitLossReport) => row.sales.toFixed(2),
        pdfWidth: 12
      },
      {
        key: "purchaseReturn",
        label: "Purchase Return",
        accessor: (row: AdminTypes.ReportTypes.ProfitLossReport) => row.purchaseReturn.toFixed(2),
        pdfWidth: 15
      },
      {
        key: "purchase",
        label: "Purchase",
        accessor: (row: AdminTypes.ReportTypes.ProfitLossReport) => row.purchase.toFixed(2),
        pdfWidth: 12
      },
      {
        key: "expenses",
        label: "Expenses",
        accessor: (row: AdminTypes.ReportTypes.ProfitLossReport) => row.expenses.toFixed(2),
        pdfWidth: 12
      },
      {
        key: "salesReturn",
        label: "Sales Return",
        accessor: (row: AdminTypes.ReportTypes.ProfitLossReport) => row.salesReturn.toFixed(2),
        pdfWidth: 15
      },
      {
        key: "netProfit",
        label: "Net Profit",
        accessor: (row: AdminTypes.ReportTypes.ProfitLossReport) => row.netProfit.toFixed(2),
        pdfWidth: 12
      },
    ]);
  }, []);

  const handleApplyFilters = () => {
    setIsFilterModalOpen(false);

    const params = new URLSearchParams();
    Object.entries(filterValues).forEach(([key, value]) => {
      if (value && value !== "All") {
        params.append(key, value);
      }
    });

    if (searchTerm) params.append("search", searchTerm);

    router.push(`${window.location.pathname}?${params.toString()}`);
  };

  const handleResetFilters = () => {
    setFilterValues({
      store: "All",
      year: "All",
      month: "All",
      dateFrom: "",
      dateTo: "",
      salesMin: "",
      salesMax: "",
      purchaseMin: "",
      purchaseMax: "",
      expensesMin: "",
      expensesMax: "",
      netProfitMin: "",
      netProfitMax: ""
    });
    router.push(window.location.pathname);
  };

  const handlePageChange = React.useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleRowsPerPageChange = React.useCallback((perPage: number) => {
    setRowsPerPage(perPage);
    setCurrentPage(1);
  }, []);

  const filterConfig = [
    {
      type: "select" as const,
      label: "Select Year",
      key: "year",
      options: [
        { label: "All Years", value: "All" },
        ...availableYears.map((year) => ({ label: year, value: year })),
      ],
    },
    {
      type: "select" as const,
      label: "Select Month",
      key: "month",
      options: [
        { label: "All Months", value: "All" },
        ...ServerActions.DatePretier.MONTHS_LONG.map((month) => ({ label: month, value: month })),
      ],
    },
    {
      type: "date" as const,
      label: "Date From",
      key: "dateFrom",
    },
    {
      type: "date" as const,
      label: "Date To",
      key: "dateTo",
    },
    {
      type: "range" as const,
      label: "Sales Amount Range",
      minKey: "salesMin",
      maxKey: "salesMax",
    },
    {
      type: "range" as const,
      label: "Purchase Amount Range",
      minKey: "purchaseMin",
      maxKey: "purchaseMax",
    },
    {
      type: "range" as const,
      label: "Net Profit Range",
      minKey: "netProfitMin",
      maxKey: "netProfitMax",
    },
  ];

  return (
    <>
      {/* Extended Filters Modal */}
      <WebComponents.AdminComponents.AdminWebComponents.Models.ExtendedFiltersModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
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
            {Constants.adminReportsConstants.profitLossReport}
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-textSmall pt-2">
            {Constants.adminReportsConstants.profitLossReportBio}
          </p>
        </div>
      </div>

      {/* Summary Cards: Sales, Loss, Expenses, Net Profit */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Sales Card */}
        <div className="bg-white dark:bg-[#333333] rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{Constants.adminReportsConstants.totalSales}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {currencySymbol}{summaryStats.totalSales.toFixed(2)}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <ShoppingCart className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        {/* Loss Card */}
        <div className="bg-white dark:bg-[#333333] rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{Constants.adminReportsConstants.loss}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {currencySymbol}{summaryStats.totalLoss.toFixed(2)}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <TrendingDown className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        {/* Expenses Card */}
        <div className="bg-white dark:bg-[#333333] rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{Constants.adminReportsConstants.totalExpenses}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {currencySymbol}{summaryStats.totalExpenses.toFixed(2)}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        {/* Net Profit Card */}
        <div className="bg-white dark:bg-[#333333] rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{Constants.adminReportsConstants.netProfit}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {currencySymbol}{summaryStats.totalNetProfit.toFixed(2)}
              </p>
            </div>
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${summaryStats.totalNetProfit >= 0 ? 'bg-blue-500' : 'bg-orange-500'
              }`}>
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Table */}
      <div className="bg-white dark:bg-darkFilterbar rounded-[4px] h-full w-full mt-4">
        <div className="sm md lg xl 2xl">
          <div className="bg-white dark:bg-darkFilterbar rounded-[4px] h-full w-full">
            <WebComponents.WebCommonComponents.CommonComponents.CommonFilterBar
              actionFilter="All"
              onActionFilterChange={() => { }}
              actionOptions={[]}
              activeStatusFilter="All"
              onActiveStatusFilterChange={() => { }}
              activeStatusOptions={[]}
              selectedCount={0}
              onApply={() => { }}
              categoryFilter="All"
              onCategoryFilterChange={() => { }}
              categoryOptions={[]}
              showCategoryFilter={false}
              statusFilter={storeFilter}
              onStatusFilterChange={(value: string) => {
                setStoreFilter(value);
                const params = new URLSearchParams(searchParams.toString());
                if (value === "All") params.delete("store");
                else params.set("store", value);
                router.push(`${window.location.pathname}?${params.toString()}`);
              }}
              statusOptions={[
                { label: Constants.adminReportsConstants.allStores, value: "All" },
                ...storeOptions
              ]}
              statusPlaceholder={Constants.adminReportsConstants.allStores}
              searchTerm={searchTerm}
              onSearchTermChange={setSearchTerm}
              searchPlaceholder={Constants.adminReportsConstants.searchPlaceholder}
              showActionSection={false}
              renderExports={
                <>
                  <WebComponents.UiWebComponents.UiWebComponents.DownloadCSV
                    data={filteredData as any}
                    columns={exportColumns.csvColumns as any}
                    filename={`profit-loss-report-${new Date().toISOString().split("T")[0]}.csv`}
                    onExport={async () => {
                      WebComponents.UiWebComponents.UiWebComponents.SwalHelper.success({ text: `${Constants.adminReportsConstants.exportCSV} successfully.` });
                      return filteredData as any;
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
                  </WebComponents.UiWebComponents.UiWebComponents.DownloadCSV>
                  <WebComponents.UiWebComponents.UiWebComponents.DownloadPDF
                    data={filteredData as any}
                    columns={exportColumns.pdfColumns as any}
                    filename={`profit-loss-report-${new Date().toISOString().split("T")[0]}.pdf`}
                    title={Constants.adminReportsConstants.profitLossReportBio}
                    orientation="landscape"
                    onExport={async () => {
                      WebComponents.UiWebComponents.UiWebComponents.SwalHelper.success({ text: `${Constants.adminReportsConstants.exportPDF} successfully.` });
                      return filteredData as any;
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
                data={paginatedData}
                useCustomPagination={true}
                totalRecords={filteredData.length}
                filteredRecords={filteredData.length}
                paginationPerPage={rowsPerPage}
                paginationDefaultPage={currentPage}
                paginationRowsPerPageOptions={[5, 10, 25, 50]}
                onChangePage={handlePageChange}
                onChangeRowsPerPage={handleRowsPerPageChange}
                useUrlParams={false}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
