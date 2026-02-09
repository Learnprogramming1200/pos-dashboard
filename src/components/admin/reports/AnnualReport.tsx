"use client";

import React from "react";
import Image from "next/image";
import { Filter, DollarSign, TrendingUp, ShoppingBag } from "lucide-react";
import { ServerActions } from "@/lib";
import { Constants } from "@/constant";
import { CommonComponents } from "@/components/common";
import { UiWebComponents } from "@/components/ui";
import { AdminWebComponents } from "@/components/admin";
import { AdminTypes, FiltersTypes } from "@/types";
import { annualData } from "@/constant/dummy-data/annual";
// Get current year as default

export default function AnnualReport() {
  const currentYearDefault = ServerActions.DatePretier.getCurrentYear();
  const [searchTerm, setSearchTerm] = React.useState("");
  const [filters, setFilters] = React.useState({
    store: "All",
    year: currentYearDefault,
  });
  const [isFilterModalOpen, setIsFilterModalOpen] = React.useState(false);
  const [filterValues, setFilterValues] = React.useState({
    store: "All",
    year: currentYearDefault,
    month: "All",
    salesMin: "",
    salesMax: "",
    purchasesMin: "",
    purchasesMax: "",
    expensesMin: "",
    expensesMax: "",
    netProfitMin: "",
    netProfitMax: "",
    growthMin: "",
    growthMax: "",
  });

  const uniqueStores = React.useMemo(
    () => Array.from(new Set(annualData.data.map((item) => item.storeName))),
    []
  );

  const effectiveStoreFilter = React.useMemo(
    () => (filterValues.store !== "All" ? filterValues.store : filters.store),
    [filterValues.store, filters.store]
  );

  const columns: any = React.useMemo(() => {
    return CommonComponents.createColumns<AdminTypes.ReportTypes.AnnualReport>({
      fields: [
        {
          name: Constants.adminReportsConstants.month,
          selector: (row: AdminTypes.ReportTypes.AnnualReport) => row.month,
          cell: (row: AdminTypes.ReportTypes.AnnualReport) => (
            <span className="text-gray-900 dark:text-gray-300">{row.month}</span>
          ),
          sortable: true,
        },
        {
          name: Constants.adminReportsConstants.storeName,
          selector: (row: AdminTypes.ReportTypes.AnnualReport) => row.storeName,
          cell: (row: AdminTypes.ReportTypes.AnnualReport) => (
            <span className="text-gray-900 dark:text-gray-300">
              {effectiveStoreFilter === "All"
                ? Constants.adminReportsConstants.allStores
                : row.storeName}
            </span>
          ),
          sortable: true,
        },
        {
          name: Constants.adminReportsConstants.totalSales,
          selector: (row: AdminTypes.ReportTypes.AnnualReport) => row.totalSales,
          cell: (row: AdminTypes.ReportTypes.AnnualReport) => (
            <span className="font-medium text-gray-900 dark:text-gray-300">
              ${row.totalSales.toFixed(2)}
            </span>
          ),
          sortable: true,
        },
        {
          name: Constants.adminReportsConstants.totalPurchases,
          selector: (row: AdminTypes.ReportTypes.AnnualReport) => row.totalPurchases,
          cell: (row: AdminTypes.ReportTypes.AnnualReport) => (
            <span className="font-medium text-gray-900 dark:text-gray-300">
              ${row.totalPurchases.toFixed(2)}
            </span>
          ),
          sortable: true,
        },
        {
          name: Constants.adminReportsConstants.totalExpenses,
          selector: (row: AdminTypes.ReportTypes.AnnualReport) => row.totalExpenses,
          cell: (row: AdminTypes.ReportTypes.AnnualReport) => (
            <span className="font-medium text-gray-900 dark:text-gray-300">
              ${row.totalExpenses.toFixed(2)}
            </span>
          ),
          sortable: true,
        },
        {
          name: Constants.adminReportsConstants.netProfit,
          selector: (row: AdminTypes.ReportTypes.AnnualReport) => row.netProfit,
          cell: (row: AdminTypes.ReportTypes.AnnualReport) => (
            <span className="font-semibold text-gray-900 dark:text-gray-300">
              ${row.netProfit.toFixed(2)}
            </span>
          ),
          sortable: true,
        },
        {
          name: Constants.adminReportsConstants.growthPercentage,
          selector: (row: AdminTypes.ReportTypes.AnnualReport) => row.growthPercentage,
          cell: (row: AdminTypes.ReportTypes.AnnualReport) => (
            <span
              className={`font-medium ${row.growthPercentage >= 0
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
                }`}
            >
              {row.growthPercentage >= 0 ? "+" : ""}
              {row.growthPercentage.toFixed(1)}%
            </span>
          ),
          sortable: true,
        },
      ],
    });
  }, [effectiveStoreFilter]);
  // Calculate growth percentage (Month-over-Month)
  const calculateGrowthPercentage = (
    currentValue: number,
    previousValue: number | null
  ): number => {
    if (!previousValue || previousValue === 0) {
      return 0; // No growth if no previous value
    }
    return ((currentValue - previousValue) / previousValue) * 100;
  };

  // Enrich data with calculated growth percentages
  const enrichedData = React.useMemo(() => {
    const sortedData = [...annualData.data].sort((a: any, b: any) => {
      if (a.storeId !== b.storeId) return a.storeId.localeCompare(b.storeId);
      if (a.year !== b.year) return a.year - b.year;
      const monthOrder = ServerActions.DatePretier.MONTHS_LONG.indexOf(a.month) - ServerActions.DatePretier.MONTHS_LONG.indexOf(b.month);
      return monthOrder;
    });

    return sortedData.map((item, index) => {
      // Find previous month's data for the same store and year
      const previousMonthIndex = ServerActions.DatePretier.MONTHS_LONG.indexOf(item.month) - 1;
      const previousMonthName = previousMonthIndex >= 0 ? ServerActions.DatePretier.MONTHS_LONG[previousMonthIndex] : null;

      let previousValue: number | null = null;

      if (previousMonthName) {
        // Find previous month's data for same store and year
        const previousMonthData = sortedData.find(
          (d) =>
            d.storeId === item.storeId &&
            d.year === item.year &&
            d.month === previousMonthName
        );
        previousValue = previousMonthData?.totalSales || null;
      }

      // Calculate growth based on totalSales (you can change this to netProfit or any other metric)
      const growthPercentage = calculateGrowthPercentage(item.totalSales, previousValue);

      return {
        ...item,
        growthPercentage,
      };
    });
  }, []);

  const filteredData = React.useMemo(() => {
    const yearFilter = filters.year || filterValues.year || currentYearDefault;

    const ranges = {
      salesMin: parseFloat(filterValues.salesMin),
      salesMax: parseFloat(filterValues.salesMax),
      purchasesMin: parseFloat(filterValues.purchasesMin),
      purchasesMax: parseFloat(filterValues.purchasesMax),
      expensesMin: parseFloat(filterValues.expensesMin),
      expensesMax: parseFloat(filterValues.expensesMax),
      netProfitMin: parseFloat(filterValues.netProfitMin),
      netProfitMax: parseFloat(filterValues.netProfitMax),
      growthMin: parseFloat(filterValues.growthMin),
      growthMax: parseFloat(filterValues.growthMax),
    };

    const storeFilter = effectiveStoreFilter;
    const monthFilter = filterValues.month;

    if (storeFilter === "All") {
      const monthsList = monthFilter === "All" ? ServerActions.DatePretier.MONTHS_LONG : [monthFilter];
      const yearNum = Number(yearFilter) || currentYearDefault;
      return monthsList.map((month, idx) => ({
        id: `all-${yearNum}-${idx}`,
        month,
        year: yearNum,
        storeId: "all",
        storeName: Constants.adminReportsConstants.allStores,
        totalSales: 0,
        totalPurchases: 0,
        totalExpenses: 0,
        netProfit: 0,
        growthPercentage: 0,
      }));
    }

    const baseData = enrichedData.filter((item) => item.year.toString() === yearFilter);

    const result = baseData.filter((item) => {
      if (
        searchTerm &&
        !`${item.storeName} ${item.month}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      )
        return false;

      if (storeFilter !== "All" && item.storeName !== storeFilter) return false;
      if (monthFilter !== "All" && item.month !== monthFilter) return false;

      if (Number.isFinite(ranges.salesMin) && item.totalSales < ranges.salesMin)
        return false;
      if (Number.isFinite(ranges.salesMax) && item.totalSales > ranges.salesMax)
        return false;

      if (Number.isFinite(ranges.purchasesMin) && item.totalPurchases < ranges.purchasesMin)
        return false;
      if (Number.isFinite(ranges.purchasesMax) && item.totalPurchases > ranges.purchasesMax)
        return false;

      if (Number.isFinite(ranges.expensesMin) && item.totalExpenses < ranges.expensesMin)
        return false;
      if (Number.isFinite(ranges.expensesMax) && item.totalExpenses > ranges.expensesMax)
        return false;

      if (Number.isFinite(ranges.netProfitMin) && item.netProfit < ranges.netProfitMin)
        return false;
      if (Number.isFinite(ranges.netProfitMax) && item.netProfit > ranges.netProfitMax)
        return false;

      if (Number.isFinite(ranges.growthMin) && item.growthPercentage < ranges.growthMin)
        return false;
      if (Number.isFinite(ranges.growthMax) && item.growthPercentage > ranges.growthMax)
        return false;

      return true;
    });

    return result;
  }, [enrichedData, filters, filterValues, searchTerm, currentYearDefault, effectiveStoreFilter]);

  // Calculate totals for bottom row
  const totals = React.useMemo(() => {
    return {
      totalSales: filteredData.reduce((sum, item) => sum + item.totalSales, 0),
      totalPurchases: filteredData.reduce((sum, item) => sum + item.totalPurchases, 0),
      totalExpenses: filteredData.reduce((sum, item) => sum + item.totalExpenses, 0),
      totalNetProfit: filteredData.reduce((sum, item) => sum + item.netProfit, 0),
    };
  }, [filteredData]);

  // Total Row Component
  const totalRow = React.useMemo(() => (
    <div className="bg-white dark:bg-[#1F1F1F] border-t border-gray-200 dark:border-[#616161] px-4 py-3">
      <div className="grid grid-cols-7 gap-4 text-sm font-semibold">
        <div className="col-span-2 text-gray-900 dark:text-white">Total</div>
        <div className="text-gray-900 dark:text-white font-bold">
          ${totals.totalSales.toFixed(2)}
        </div>
        <div className="text-gray-900 dark:text-white font-bold">
          ${totals.totalPurchases.toFixed(2)}
        </div>
        <div className="text-gray-900 dark:text-white font-bold">
          ${totals.totalExpenses.toFixed(2)}
        </div>
        <div className="text-gray-900 dark:text-white font-bold">
          ${totals.totalNetProfit.toFixed(2)}
        </div>
        <div className="text-gray-900 dark:text-white">-</div>
      </div>
    </div>
  ), [totals]);

  // CSV and PDF export columns
  const exportColumns = React.useMemo(() => {
    return CommonComponents.generateExportColumns<AdminTypes.ReportTypes.AnnualReport>([
      {
        key: 'month',
        label: Constants.adminReportsConstants.month,
        accessor: (row: AdminTypes.ReportTypes.AnnualReport) => row.month || '-',
        pdfWidth: 20
      },
      {
        key: 'storeName',
        label: Constants.adminReportsConstants.storeName,
        accessor: (row: AdminTypes.ReportTypes.AnnualReport) => row.storeName || '-',
        pdfWidth: 25
      },
      {
        key: 'totalSales',
        label: Constants.adminReportsConstants.totalSales,
        accessor: (row: AdminTypes.ReportTypes.AnnualReport) => `$${row.totalSales.toFixed(2)}`,
        pdfWidth: 20
      },
      {
        key: 'totalPurchases',
        label: Constants.adminReportsConstants.totalPurchases,
        accessor: (row: AdminTypes.ReportTypes.AnnualReport) => `$${row.totalPurchases.toFixed(2)}`,
        pdfWidth: 20
      },
      {
        key: 'totalExpenses',
        label: Constants.adminReportsConstants.totalExpenses,
        accessor: (row: AdminTypes.ReportTypes.AnnualReport) => `$${row.totalExpenses.toFixed(2)}`,
        pdfWidth: 20
      },
      {
        key: 'netProfit',
        label: Constants.adminReportsConstants.netProfit,
        accessor: (row: AdminTypes.ReportTypes.AnnualReport) => `$${row.netProfit.toFixed(2)}`,
        pdfWidth: 20
      },
      {
        key: 'growthPercentage',
        label: Constants.adminReportsConstants.growthPercentage,
        accessor: (row: AdminTypes.ReportTypes.AnnualReport) => `${row.growthPercentage >= 0 ? '+' : ''}${row.growthPercentage.toFixed(1)}%`,
        pdfWidth: 15
      },
      {
        key: 'year',
        label: Constants.adminReportsConstants.year,
        accessor: (row: AdminTypes.ReportTypes.AnnualReport) => row.year.toString() || '-',
        pdfWidth: 15
      },
    ]);
  }, []);

  const filterConfig: FiltersTypes.FilterFieldConfig[] = [
    {
      type: "select",
      label: "Select Year",
      key: "year",
      options: ServerActions.DatePretier.getYears().map((year) => ({ label: year, value: year })),
    },
    {
      type: "select",
      label: "Select Month",
      key: "month",
      options: [
        { label: "All Months", value: "All" },
        ...ServerActions.DatePretier.MONTHS_LONG.map((month) => ({ label: month, value: month })),
      ],
    },
    {
      type: "range",
      label: "Total Sales Range",
      minKey: "salesMin",
      maxKey: "salesMax",
    },
    {
      type: "range",
      label: "Total Purchases Range",
      minKey: "purchasesMin",
      maxKey: "purchasesMax",
    },
    {
      type: "range",
      label: "Total Expenses Range",
      minKey: "expensesMin",
      maxKey: "expensesMax",
    },
    {
      type: "range",
      label: "Net Profit Range",
      minKey: "netProfitMin",
      maxKey: "netProfitMax",
    },
  ];

  const handleApplyFilters = () => {
    setIsFilterModalOpen(false);
    // Sync main filters with extended filters
    setFilters({
      store: filterValues.store,
      year: filterValues.year || currentYearDefault,
    });
  };

  const handleResetFilters = () => {
    setFilterValues({
      store: "All",
      year: currentYearDefault,
      month: "All",
      salesMin: "",
      salesMax: "",
      purchasesMin: "",
      purchasesMax: "",
      expensesMin: "",
      expensesMax: "",
      netProfitMin: "",
      netProfitMax: "",
      growthMin: "",
      growthMax: "",
    });
    setFilters({
      store: "All",
      year: currentYearDefault,
    });
  };

  return (
    <>
      <AdminWebComponents.Models.ExtendedFiltersModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
        filters={filterValues}
        setFilters={setFilterValues}
        filterConfig={filterConfig}
      />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-2">
        <div>
          <h1 className="text-lg sm:text-lg md:text-xl lg:text-2xl font-medium text-textMain dark:text-white truncate">
            {Constants.adminReportsConstants.annualReport}
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-textSmall pt-2">
            {Constants.adminReportsConstants.annualReportBio}
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {/* Total Sales Card */}
        <div className="bg-white dark:bg-[#333333] rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                Total Sales
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${totals.totalSales.toFixed(2)}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        {/* Total Net Profit Card */}
        <div className="bg-white dark:bg-[#333333] rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                Net Profit
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${totals.totalNetProfit.toFixed(2)}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        {/* Average Monthly Sales Card */}
        <div className="bg-white dark:bg-[#333333] rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                Avg Monthly Sales
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${totals.totalSales.toFixed(2)}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-darkFilterbar rounded-[4px] h-full w-full mt-4">
        <CommonComponents.CommonFilterBar
          actionFilter="All"
          onActionFilterChange={() => { }}
          actionOptions={[]}
          activeStatusFilter="All"
          onActiveStatusFilterChange={() => { }}
          activeStatusOptions={[]}
          selectedCount={0}
          onApply={() => { }}
          categoryFilter={filters.store}
          onCategoryFilterChange={(value: string) =>
            setFilters((prev) => ({ ...prev, store: value }))
          }
          categoryOptions={[
            { name: Constants.adminReportsConstants.allStores, value: "All" },
            ...uniqueStores.map((store) => ({ name: store, value: store })),
          ]}
          categoryPlaceholder={Constants.adminReportsConstants.allStores}
          statusFilter={filters.year}
          onStatusFilterChange={(value: string) => {
            const selectedYear = value || currentYearDefault;
            setFilters((prev) => ({ ...prev, year: selectedYear }));
            setFilterValues((prev) => ({ ...prev, year: selectedYear }));
          }}
          statusOptions={ServerActions.DatePretier.getYears().map((year) => ({ label: year, value: year }))}
          statusPlaceholder={Constants.adminReportsConstants.year}
          searchTerm={searchTerm}
          onSearchTermChange={(value: string) => setSearchTerm(value)}
          searchPlaceholder="Search"
          renderSearchActions={
            <button
              onClick={() => setIsFilterModalOpen(true)}
              className="p-2.5 rounded-md text-gray-900 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex-shrink-0"
              title="Extended Filters"
            >
              <Filter className="w-5 h-5" />
            </button>
          }
          renderExports={
            <>
              <UiWebComponents.DownloadCSV
                data={filteredData as any}
                columns={exportColumns.csvColumns as any}
                filename={`annual-report-${new Date().toISOString().split('T')[0]}.csv`}
                onExport={async () => {
                  UiWebComponents.SwalHelper.success({ text: `${Constants.adminReportsConstants.exportCSV} successfully.` });
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
              </UiWebComponents.DownloadCSV>
              <UiWebComponents.DownloadPDF
                data={filteredData as any}
                columns={exportColumns.pdfColumns as any}
                filename={`annual-report-${new Date().toISOString().split('T')[0]}.pdf`}
                title={Constants.adminReportsConstants.annualReport}
                orientation="landscape"
                onExport={async () => {
                  UiWebComponents.SwalHelper.success({ text: `${Constants.adminReportsConstants.exportPDF} successfully.` });
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
              </UiWebComponents.DownloadPDF>
            </>
          }
          showActionSection={false}
          showCategoryFilter={true}
        />

        <div>
          <CommonComponents.DataTable
            columns={columns}
            data={filteredData}
            pagination={false}
            useCustomPagination={false}
            totalRecords={filteredData.length}
            filteredRecords={filteredData.length}
            useUrlParams={false}
            totalReports={true}
            totalRow={totalRow}
          />
        </div>
      </div>
    </>
  );
}

