"use client";

import React from "react";
import Image from "next/image";
import { Filter, Users, ShoppingCart, UserPlus } from "lucide-react";
import { Constants } from "@/constant";
import { CommonComponents } from "@/components/common";
import { UiWebComponents } from "@/components/ui";
import { AdminWebComponents } from "@/components/admin";
import { AdminTypes,FiltersTypes } from "@/types";
import { customerDataDummy } from "@/constant/dummy-data/customer";

export default function CustomerReport() {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [isFilterModalOpen, setIsFilterModalOpen] = React.useState(false);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [filterValues, setFilterValues] = React.useState({
    timePeriod: "Daily",
    dateFrom: "",
    dateTo: "",
    year: "All",
    month: "All",
    totalSpentMin: "",
    totalSpentMax: "",
    totalOrdersMin: "",
    totalOrdersMax: "",
    averageOrderValueMin: "",
    averageOrderValueMax: "",
    loyaltyPointsMin: "",
    loyaltyPointsMax: "",
  });

  // Static mock data - replace with API response when available
  const customerData = React.useMemo(() => customerDataDummy, []);

  // Get unique years and months from data
  const uniqueYears = React.useMemo(() => {
    const years = new Set<string>();
    customerData.forEach((item) => {
      const year = new Date(item.lastPurchaseDate).getFullYear().toString();
      years.add(year);
    });
    return Array.from(years).sort((a, b) => Number.parseInt(b) - Number.parseInt(a));
  }, [customerData]);

  const uniqueMonths = React.useMemo(() => {
    const months = new Set<string>();
    customerData.forEach((item) => {
      const date = new Date(item.lastPurchaseDate);
      const monthName = date.toLocaleDateString('en-US', { month: 'long' });
      months.add(monthName);
    });
    return Array.from(months).sort((a, b) => {
      const monthOrder = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      return monthOrder.indexOf(a) - monthOrder.indexOf(b);
    });
  }, [customerData]);

  // Filtered data
  const filteredData = React.useMemo(() => {
    let data = customerData;

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      data = data.filter(
        (item) =>
          item.customerCode.toLowerCase().includes(searchLower) ||
          item.customerName.toLowerCase().includes(searchLower) ||
          item.email.toLowerCase().includes(searchLower) ||
          item.phone.toLowerCase().includes(searchLower)
      );
    }

    // Extended filters
    // Time period filter - filter by last purchase date
    if (filterValues.timePeriod === "Daily") {
      // For Daily, use date range filters (from and to)
      if (filterValues.dateFrom) {
        data = data.filter((item) => {
          const lastPurchaseDate = new Date(item.lastPurchaseDate);
          const fromDate = new Date(filterValues.dateFrom);
          fromDate.setHours(0, 0, 0, 0);
          return lastPurchaseDate >= fromDate;
        });
      }
      if (filterValues.dateTo) {
        data = data.filter((item) => {
          const lastPurchaseDate = new Date(item.lastPurchaseDate);
          const toDate = new Date(filterValues.dateTo);
          toDate.setHours(23, 59, 59, 999);
          return lastPurchaseDate <= toDate;
        });
      }
    } else if (filterValues.timePeriod === "Monthly") {
      // Filter by year and month
      if (filterValues.year !== "All") {
        data = data.filter((item) => {
          const lastPurchaseDate = new Date(item.lastPurchaseDate);
          return lastPurchaseDate.getFullYear().toString() === filterValues.year;
        });
      }
      if (filterValues.month !== "All") {
        data = data.filter((item) => {
          const lastPurchaseDate = new Date(item.lastPurchaseDate);
          const monthName = lastPurchaseDate.toLocaleDateString('en-US', { month: 'long' });
          return monthName === filterValues.month;
        });
      }
    } else if (filterValues.timePeriod === "Annually") {
      // Filter by year
      if (filterValues.year !== "All") {
        data = data.filter((item) => {
          const lastPurchaseDate = new Date(item.lastPurchaseDate);
          return lastPurchaseDate.getFullYear().toString() === filterValues.year;
        });
      }
    }

    if (filterValues.totalSpentMin) {
      const min = Number.parseFloat(filterValues.totalSpentMin);
      if (!Number.isNaN(min)) {
        data = data.filter((item) => item.totalSpent >= min);
      }
    }
    if (filterValues.totalSpentMax) {
      const max = Number.parseFloat(filterValues.totalSpentMax);
      if (!Number.isNaN(max)) {
        data = data.filter((item) => item.totalSpent <= max);
      }
    }

    if (filterValues.totalOrdersMin) {
      const min = Number.parseFloat(filterValues.totalOrdersMin);
      if (!Number.isNaN(min)) {
        data = data.filter((item) => item.totalOrders >= min);
      }
    }
    if (filterValues.totalOrdersMax) {
      const max = Number.parseFloat(filterValues.totalOrdersMax);
      if (!Number.isNaN(max)) {
        data = data.filter((item) => item.totalOrders <= max);
      }
    }

    if (filterValues.averageOrderValueMin) {
      const min = Number.parseFloat(filterValues.averageOrderValueMin);
      if (!Number.isNaN(min)) {
        data = data.filter((item) => item.averageOrderValue >= min);
      }
    }
    if (filterValues.averageOrderValueMax) {
      const max = Number.parseFloat(filterValues.averageOrderValueMax);
      if (!Number.isNaN(max)) {
        data = data.filter((item) => item.averageOrderValue <= max);
      }
    }

    if (filterValues.loyaltyPointsMin) {
      const min = Number.parseFloat(filterValues.loyaltyPointsMin);
      if (!Number.isNaN(min)) {
        data = data.filter((item) => item.loyaltyPoints >= min);
      }
    }
    if (filterValues.loyaltyPointsMax) {
      const max = Number.parseFloat(filterValues.loyaltyPointsMax);
      if (!Number.isNaN(max)) {
        data = data.filter((item) => item.loyaltyPoints <= max);
      }
    }

    return data;
  }, [customerData, searchTerm, filterValues]);

  // Paginated data for table
  const paginatedData = React.useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, currentPage, rowsPerPage]);

  // Calculate summary statistics
  const summaryStats = React.useMemo(() => {
    const totalCustomersCount = filteredData.length;
    const totalSpent = filteredData.reduce((sum, item) => sum + item.totalSpent, 0);
    const averageCartSpendingValue =
      filteredData.length > 0 ? totalSpent / filteredData.reduce((sum, item) => sum + item.totalOrders, 0) : 0;
    
    // New customers (first purchase in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newCustomersCount = filteredData.filter((item) => {
      const firstPurchase = new Date(item.firstPurchaseDate);
      return firstPurchase >= thirtyDaysAgo;
    }).length;

    return {
      totalCustomers: totalCustomersCount,
      averageCartSpending: averageCartSpendingValue,
      newCustomers: newCustomersCount,
    };
  }, [filteredData]);

  // Table columns using createColumns
  const tableColumns = React.useMemo(() => {
    const timePeriod = filterValues.timePeriod || "Daily";
    const dateColumnName = (() => {
      if (timePeriod === "Daily") return "Date";
      if (timePeriod === "Monthly") return "Month";
      if (timePeriod === "Annually") return "Year";
      return "Date";
    })();

    return CommonComponents.createColumns<AdminTypes.ReportTypes.CustomerReport>({
      fields: [
        {
          name: dateColumnName,
          selector: (row: AdminTypes.ReportTypes.CustomerReport) => row.lastPurchaseDate,
          sortable: true,
          cell: (row: AdminTypes.ReportTypes.CustomerReport) => {
            const date = new Date(row.lastPurchaseDate);
            let displayValue: string;
            
            if (timePeriod === "Daily") {
              displayValue = date.toLocaleDateString();
            } else if (timePeriod === "Monthly") {
              displayValue = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
            } else if (timePeriod === "Annually") {
              displayValue = date.getFullYear().toString();
            } else {
              displayValue = date.toLocaleDateString();
            }
            
            return (
              <span className="text-gray-900 dark:text-white">{displayValue}</span>
            );
          },
        },
        {
          name: "Customer Code",
          selector: (row: AdminTypes.ReportTypes.CustomerReport) => row.customerCode,
          sortable: true,
          cell: (row: AdminTypes.ReportTypes.CustomerReport) => (
            <span className="font-medium text-gray-900 dark:text-white">{row.customerCode}</span>
          ),
        },
        {
          name: "Customer Name",
          selector: (row: AdminTypes.ReportTypes.CustomerReport) => row.customerName,
          sortable: true,
        },
        {
          name: "Phone",
          selector: (row: AdminTypes.ReportTypes.CustomerReport) => row.phone,
          sortable: true,
        },
        {
          name: "Total Orders",
          selector: (row: AdminTypes.ReportTypes.CustomerReport) => row.totalOrders,
          sortable: true,
        },
        {
          name: "Total Spent",
          selector: (row: AdminTypes.ReportTypes.CustomerReport) => row.totalSpent,
          sortable: true,
          cell: (row: AdminTypes.ReportTypes.CustomerReport) => (
            <span className="font-medium text-gray-900 dark:text-white">
              ${row.totalSpent.toFixed(2)}
            </span>
          ),
        },
        {
          name: "Average Order Value",
          selector: (row: AdminTypes.ReportTypes.CustomerReport) => row.averageOrderValue,
          sortable: true,
          cell: (row: AdminTypes.ReportTypes.CustomerReport) => (
            <span className="text-gray-900 dark:text-white">
              ${row.averageOrderValue.toFixed(2)}
            </span>
          ),
        },
        {
          name: "Loyalty Points",
          selector: (row: AdminTypes.ReportTypes.CustomerReport) => row.loyaltyPoints,
          sortable: true,
        },
        {
          name: "Total Returns",
          selector: (row: AdminTypes.ReportTypes.CustomerReport) => row.totalReturns,
          sortable: true,
        },
        {
          name: "Return Amount",
          selector: (row: AdminTypes.ReportTypes.CustomerReport) => row.returnAmount,
          sortable: true,
          cell: (row: AdminTypes.ReportTypes.CustomerReport) => (
            <span className="text-gray-900 dark:text-white">
              ${row.returnAmount.toFixed(2)}
            </span>
          ),
        },
      ],
    });
  }, [filterValues.timePeriod]);

  // Export columns
  const exportColumns = React.useMemo(() => {
      return CommonComponents.generateExportColumns<AdminTypes.ReportTypes.CustomerReport>([
      { key: "customerCode", label: "Customer Code", accessor: (row) => row.customerCode, pdfWidth: 12 },
      { key: "customerName", label: "Customer Name", accessor: (row) => row.customerName, pdfWidth: 15 },
      { key: "phone", label: "Phone", accessor: (row) => row.phone, pdfWidth: 12 },
      { key: "totalOrders", label: "Total Orders", accessor: (row) => row.totalOrders.toString(), pdfWidth: 10 },
      { key: "totalSpent", label: "Total Spent", accessor: (row) => row.totalSpent.toFixed(2), pdfWidth: 10 },
      { key: "averageOrderValue", label: "Average Order Value", accessor: (row) => row.averageOrderValue.toFixed(2), pdfWidth: 12 },
      { key: "loyaltyPoints", label: "Loyalty Points", accessor: (row) => row.loyaltyPoints.toString(), pdfWidth: 10 },
      { key: "totalReturns", label: "Total Returns", accessor: (row) => row.totalReturns.toString(), pdfWidth: 10 },
      { key: "returnAmount", label: "Return Amount", accessor: (row) => row.returnAmount.toFixed(2), pdfWidth: 10 },
    ]);
  }, []);

  const filterConfig: FiltersTypes.FilterFieldConfig[] = [
    ...(filterValues.timePeriod === "Daily"
      ? [
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
        ]
      : []),
    ...(filterValues.timePeriod === "Monthly"
      ? [
          {
            type: "select" as const,
            label: "Select Year",
            key: "year",
            options: [
              { label: "All Years", value: "All" },
              ...uniqueYears.map((year) => ({ label: year, value: year })),
            ],
          },
          {
            type: "select" as const,
            label: "Select Month",
            key: "month",
            options: [
              { label: "All Months", value: "All" },
              ...uniqueMonths.map((month) => ({ label: month, value: month })),
            ],
          },
        ]
      : []),
    ...(filterValues.timePeriod === "Annually"
      ? [
          {
            type: "select" as const,
            label: "Select Year",
            key: "year",
            options: [
              { label: "All Years", value: "All" },
              ...uniqueYears.map((year) => ({ label: year, value: year })),
            ],
          },
        ]
      : []),
    {
      type: "range",
      label: "Total Spent Range",
      minKey: "totalSpentMin",
      maxKey: "totalSpentMax",
    },
    {
      type: "range",
      label: "Total Orders Range",
      minKey: "totalOrdersMin",
      maxKey: "totalOrdersMax",
      prefix: "",
    },
    {
      type: "range",
      label: "Average Order Value Range",
      minKey: "averageOrderValueMin",
      maxKey: "averageOrderValueMax",
    },
    {
      type: "range",
      label: "Loyalty Points Range",
      minKey: "loyaltyPointsMin",
      maxKey: "loyaltyPointsMax",
      prefix: "",
    },
  ];

  const handleApplyFilters = () => {
    setIsFilterModalOpen(false);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setFilterValues({
      timePeriod: "Daily",
      dateFrom: "",
      dateTo: "",
      year: "All",
      month: "All",
      totalSpentMin: "",
      totalSpentMax: "",
      totalOrdersMin: "",
      totalOrdersMax: "",
      averageOrderValueMin: "",
      averageOrderValueMax: "",
      loyaltyPointsMin: "",
      loyaltyPointsMax: "",
    });
  };

  const handleTimePeriodChange = (nextPeriod: string = "Daily") => {
    const period = nextPeriod || "Daily";
    setFilterValues((prev) => {
      if (period === "Daily") {
        return { ...prev, timePeriod: period, dateFrom: "", dateTo: "", year: "All", month: "All" };
      }
      if (period === "Monthly") {
        return { ...prev, timePeriod: period, dateFrom: "", dateTo: "" };
      }
      if (period === "Annually") {
        return { ...prev, timePeriod: period, dateFrom: "", dateTo: "", month: "All" };
      }
      return { ...prev, timePeriod: period };
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
            {Constants.adminReportsConstants.customerReport}
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-textSmall pt-2">
            {Constants.adminReportsConstants.customerReportBio}
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {/* Total Customers Card */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                {Constants.adminReportsConstants.totalCustomers}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {summaryStats.totalCustomers}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        {/* Average Cart Spending Card */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                {Constants.adminReportsConstants.averageCartSpending}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${summaryStats.averageCartSpending.toFixed(2)}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <ShoppingCart className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        {/* New Customers Card */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                {Constants.adminReportsConstants.newCustomers}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {summaryStats.newCustomers}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <UserPlus className="w-6 h-6 text-white" />
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
          categoryFilter={filterValues.timePeriod}
          onCategoryFilterChange={(value: string) => {
            handleTimePeriodChange(value);
          }}
          categoryOptions={[
            { name: "Daily", value: "Daily" },
            { name: "Monthly", value: "Monthly" },
            { name: "Annually", value: "Annually" },
          ]}
          categoryPlaceholder="Time Period"
          showCategoryFilter={true}
          statusFilter="All"
          onStatusFilterChange={() => {}}
          statusOptions={[]}
          statusPlaceholder=""
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
          searchPlaceholder={Constants.adminReportsConstants.searchPlaceholder}
          showActionSection={false}
          renderExports={
            <>
              <UiWebComponents.DownloadCSV
                data={filteredData}
                columns={exportColumns.csvColumns as any}
                filename={`customer-report-${new Date().toISOString().split("T")[0]}.csv`}
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
                filename={`customer-report-${new Date().toISOString().split("T")[0]}.pdf`}
                title={Constants.adminReportsConstants.customerReport}
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
            data={paginatedData}
            useCustomPagination={true}
            useUrlParams={false}
            totalRecords={filteredData.length}
            filteredRecords={filteredData.length}
            paginationPerPage={rowsPerPage}
            paginationRowsPerPageOptions={[5, 10, 25, 50]}
            onChangePage={(page: number) => setCurrentPage(page)}
            onChangeRowsPerPage={(perPage: number) => {
              setRowsPerPage(perPage);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>
    </> 
  );
}

