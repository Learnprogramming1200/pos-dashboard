"use client";

import React from "react";
import Image from "next/image";
import { Filter, Package, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { Constants } from "@/constant";
import { CommonComponents } from "@/components/common";
import { UiWebComponents } from "@/components/ui";
import { AdminWebComponents } from "@/components/admin";
import { AdminTypes,FiltersTypes } from "@/types";
import { stockHistoryData } from "@/constant/dummy-data/stock-history";

// Get today's date as default
const getToday = () => {
  return new Date().toISOString().split("T")[0];
};

const methods = ["Add Stock", "Adjustment", "Transfer", "Return", "Expiry"];

export default function StockHistoryReport() {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [filters, setFilters] = React.useState({
    store: "All",
    method: "All",
  });
  const [isFilterModalOpen, setIsFilterModalOpen] = React.useState(false);
  const [filterValues, setFilterValues] = React.useState({
    store: "All",
    method: "All",
    category: "All",
    subCategory: "All",
    dateFrom: "",
    dateTo: "",
  });

  const uniqueStores = React.useMemo(
    () => Array.from(new Set(stockHistoryData.map((item) => item.storeName))),
    []
  );

  const uniqueCategories = React.useMemo(
    () => Array.from(new Set(stockHistoryData.map((item) => item.category))),
    []
  );

  // Get subcategories for selected category
  const availableSubCategories = React.useMemo(() => {
    const selectedCategory = filterValues.category;
    if (selectedCategory === "All") {
      return [];
    }
    const subCategories = stockHistoryData
      .filter((item) => item.category === selectedCategory && item.subCategory)
      .map((item) => item.subCategory!)
      .filter((subCat, index, self) => self.indexOf(subCat) === index);
    return subCategories;
  }, [filterValues.category]);

  const filteredData = React.useMemo(() => {
    let data = stockHistoryData;

    // Apply store filter
    const selectedStore = filterValues.store !== "All" ? filterValues.store : filters.store;
    if (selectedStore !== "All") {
      data = data.filter((item) => item.storeName === selectedStore);
    }

    // Apply method filter
    const selectedMethod = filterValues.method !== "All" ? filterValues.method : filters.method;
    if (selectedMethod !== "All") {
      data = data.filter((item) => item.method === selectedMethod);
    }

    // Apply category filter
    if (filterValues.category !== "All") {
      data = data.filter((item) => item.category === filterValues.category);
    }

    // Apply subcategory filter (only if category is selected)
    if (filterValues.category !== "All" && filterValues.subCategory !== "All") {
      data = data.filter((item) => item.subCategory === filterValues.subCategory);
    }

    // Apply date range filter
    if (filterValues.dateFrom) {
      data = data.filter((item) => item.date >= filterValues.dateFrom);
    }
    if (filterValues.dateTo) {
      data = data.filter((item) => item.date <= filterValues.dateTo);
    }

    if (searchTerm) {
      data = data.filter((item) => {
        const searchText = [
          item.productName,
          item.handledBy,
          item.storeName,
          item.variantName || "",
        ]
          .join(" ")
          .toLowerCase();
        return searchText.includes(searchTerm.toLowerCase());
      });
    }

    return data;
  }, [filters, filterValues, searchTerm]);

  // Calculate summary statistics
  const summaryStats = React.useMemo(() => {
    const totalTransactions = filteredData.length;
    const totalStockIn = filteredData.filter((item) => item.method === "Add Stock" || item.method === "Return").length;
    const totalStockOut = filteredData.filter((item) => item.method === "Transfer" || item.method === "Expiry").length;
    
    // Current Stock Value: Sum of latest stockAfter for each unique product+variant+store combination
    const currentStockValue = (() => {
      // Create a map to track the latest stock for each product+variant+store combination
      const stockMap = new Map<string, { date: string; stockAfter: number }>();
      
      filteredData.forEach((item) => {
        // Create a unique key for product+variant+store combination
        const key = `${item.productName}|${item.variantName || ''}|${item.storeName}`;
        const existing = stockMap.get(key);
        
        // Keep the most recent transaction for each combination
        if (!existing || item.date > existing.date) {
          stockMap.set(key, { date: item.date, stockAfter: item.stockAfter });
        }
      });
      
      // Sum all the latest stockAfter values
      return Array.from(stockMap.values()).reduce((sum, item) => sum + item.stockAfter, 0);
    })();

    return {
      totalTransactions,
      totalStockIn,
      totalStockOut,
      currentStockValue,
    };
  }, [filteredData]);

  // Table columns using createColumns
  const tableColumns = React.useMemo(() => CommonComponents.createColumns<AdminTypes.ReportTypes.StockHistoryReport>({
    fields: [
      {
        name: Constants.adminReportsConstants.date,
        selector: (row: AdminTypes.ReportTypes.StockHistoryReport) => row.date,
        sortable: true,
      },
      {
        name: Constants.adminReportsConstants.storeName,
        selector: (row: AdminTypes.ReportTypes.StockHistoryReport) => row.storeName,
        sortable: true,
      },
      {
        name: Constants.adminReportsConstants.productName,
        selector: (row: AdminTypes.ReportTypes.StockHistoryReport) => row.productName,
        cell: (row: AdminTypes.ReportTypes.StockHistoryReport) => (
          <div className="flex flex-col">
            <span className="text-gray-900 dark:text-gray-300 font-medium">{row.productName}</span>
            {row.variantName && (
              <span className="text-gray-600 dark:text-gray-400 text-xs mt-0.5 italic">
                {row.variantName}
              </span>
            )}
          </div>
        ),
        sortable: true,
      },
      {
        name: Constants.adminReportsConstants.method,
        selector: (row: AdminTypes.ReportTypes.StockHistoryReport) => row.method,
        cell: (row: AdminTypes.ReportTypes.StockHistoryReport) => {
          const typeColors: Record<string, string> = {
            "Add Stock": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
            Adjustment: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
            Transfer: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
            Return: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
            Expiry: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
          };
          return (
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${typeColors[row.method] || "bg-gray-100 text-gray-800"}`}
            >
              {row.method}
            </span>
          );
        },
        sortable: true,
      },
      {
        name: Constants.adminReportsConstants.stockBefore,
        selector: (row: AdminTypes.ReportTypes.StockHistoryReport) => row.stockBefore,
        sortable: true,
      },
      {
        name: Constants.adminReportsConstants.stockAfter,
        selector: (row: AdminTypes.ReportTypes.StockHistoryReport) => row.stockAfter,
        cell: (row: AdminTypes.ReportTypes.StockHistoryReport) => (
          <span className="font-semibold text-gray-900 dark:text-white">{row.stockAfter}</span>
        ),
        sortable: true,
      },
      {
        name: Constants.adminReportsConstants.handledBy,
        selector: (row: AdminTypes.ReportTypes.StockHistoryReport) => row.handledBy,
        sortable: true,
      },
    ],
  }), []);

  // Export columns
  const exportColumns = React.useMemo(() => {
    return CommonComponents.generateExportColumns<AdminTypes.ReportTypes.StockHistoryReport>([
      { key: "date", label: "Date", accessor: (row) => row.date, pdfWidth: 12 },
      { key: "storeName", label: "Store", accessor: (row) => row.storeName, pdfWidth: 12 },
      { key: "productName", label: "Product Name", accessor: (row) => row.variantName ? `${row.productName} - ${row.variantName}` : row.productName, pdfWidth: 20 },
      { key: "method", label: "Method", accessor: (row) => row.method, pdfWidth: 12 },
      { key: "stockBefore", label: "Stock Before", accessor: (row) => row.stockBefore.toString(), pdfWidth: 10 },
      { key: "stockAfter", label: "Stock After", accessor: (row) => row.stockAfter.toString(), pdfWidth: 10 },
      { key: "handledBy", label: "Handled By", accessor: (row) => row.handledBy, pdfWidth: 12 },
    ]);
  }, []);

  // Build filter config dynamically - include subcategory only if category is selected and has subcategories
  const filterConfig: FiltersTypes.FilterFieldConfig[] = React.useMemo(() => {
    const config: FiltersTypes.FilterFieldConfig[] = [
      {
        type: "select",
        label: "Category",
        key: "category",
        options: [
          { label: "All Categories", value: "All" },
          ...uniqueCategories.map((cat) => ({ label: cat, value: cat })),
        ],
      },
    ];

    // Add subcategory filter only if a category is selected and it has subcategories
    if (filterValues.category !== "All" && availableSubCategories.length > 0) {
      config.push({
        type: "select",
        label: "Subcategory",
        key: "subCategory",
        options: [
          { label: "All Subcategories", value: "All" },
          ...availableSubCategories.map((subCat) => ({ label: subCat, value: subCat })),
        ],
      });
    }

    config.push(
      {
        type: "date",
        label: "Date From",
        key: "dateFrom",
      },
      {
        type: "date",
        label: "Date To",
        key: "dateTo",
      }
    );

    return config;
  }, [uniqueStores, uniqueCategories, filterValues.category, availableSubCategories]);

  const handleApplyFilters = () => {
    setIsFilterModalOpen(false);
    setFilters({
      store: filterValues.store,
      method: filterValues.method,
    });
  };

  const handleResetFilters = () => {
    setFilterValues({
      store: "All",
      method: "All",
      category: "All",
      subCategory: "All",
      dateFrom: "",
      dateTo: "",
    });
    setFilters({
      store: "All",
      method: "All",
    });
  };

  // Reset subcategory when category changes
  React.useEffect(() => {
    if (filterValues.category === "All") {
      setFilterValues((prev) => ({ ...prev, subCategory: "All" }));
    }
  }, [filterValues.category]);

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
            {Constants.adminReportsConstants.stockHistoryReport}
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-textSmall pt-2">
            {Constants.adminReportsConstants.stockHistoryReportBio}
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Transactions Card */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                Total Transactions
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {summaryStats.totalTransactions}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <Package className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        {/* Total Stock In Card */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                Stock In Transactions
              </p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {summaryStats.totalStockIn}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        {/* Total Stock Out Card */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                Stock Out Transactions
              </p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {summaryStats.totalStockOut}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <TrendingDown className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        {/* Current Stock Value Card */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                Current Stock Value
              </p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {summaryStats.currentStockValue.toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-darkFilterbar rounded-[4px] h-full w-full mt-4 overflow-hidden">
        <CommonComponents.CommonFilterBar
          actionFilter="All"
          onActionFilterChange={() => {}}
          actionOptions={[]}
          activeStatusFilter="All"
          onActiveStatusFilterChange={() => {}}
          activeStatusOptions={[]}
          selectedCount={0}
          onApply={() => {}}
          categoryFilter={filters.method}
          onCategoryFilterChange={(value: string) => {
            setFilters((prev) => ({ ...prev, method: value === "All" ? "All" : value }));
          }}
          categoryOptions={[
            { name: "All Methods", value: "All" },
            ...methods.map((method) => ({ name: method, value: method })),
          ]}
          showCategoryFilter={true}
          statusFilter={filters.store}
          onStatusFilterChange={(value: string) => {
            setFilters((prev) => ({ ...prev, store: value === "All" ? "All" : value }));
          }}
          statusOptions={[
            { label: Constants.adminReportsConstants.allStores, value: "All" },
            ...uniqueStores.map((store) => ({ label: store, value: store })),
          ]}
          statusPlaceholder={Constants.adminReportsConstants.allStores}
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
          searchPlaceholder="Search by product name, handler, store, or variant"
          showActionSection={false}
          renderExports={
            <>
              <UiWebComponents.DownloadCSV
                data={filteredData}
                columns={exportColumns.csvColumns as any}
                filename={`stock-history-report-${new Date().toISOString().split("T")[0]}.csv`}
                onExport={async () => {
                  UiWebComponents.SwalHelper.success({ text: `${Constants.adminReportsConstants.exportCSV} successfully.` });
                  return filteredData;
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
                data={filteredData}
                columns={exportColumns.pdfColumns as any}
                filename={`stock-history-report-${new Date().toISOString().split("T")[0]}.pdf`}
                title={Constants.adminReportsConstants.stockHistoryReport}
                orientation="landscape"
                onExport={async () => {
                  UiWebComponents.SwalHelper.success({ text: `${Constants.adminReportsConstants.exportPDF} successfully.` });
                  return filteredData;
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
          <CommonComponents.DataTable
            columns={tableColumns}
            data={filteredData}
            useCustomPagination={true}
            pagination={false}
            useUrlParams={false}
          />
        </div>
      </div>
    </>
  );
}

