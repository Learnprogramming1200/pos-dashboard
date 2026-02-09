"use client";

import React from "react";
import Image from "next/image";
import { Filter, DollarSign, Receipt, CreditCard } from "lucide-react";
import { CommonComponents } from "@/components/common";
import { UiWebComponents } from "@/components/ui";
import { AdminWebComponents } from "@/components/admin";
import { AdminTypes,FiltersTypes } from "@/types";
import { Constants } from "@/constant";
import { dailyCashierData } from "@/constant/dummy-data/daily-cashier";

// Get today's date as default
const getToday = () => {
  return new Date().toISOString().split("T")[0];
};

export default function DailyCashierReport() {
  const todayDefault = getToday();
  const [searchTerm, setSearchTerm] = React.useState("");
  const [filters, setFilters] = React.useState({
    store: "All",
    date: todayDefault,
  });
  const [filterValues, setFilterValues] = React.useState({
    date: todayDefault,
    posId: "All",
    netSalesMin: "",
    netSalesMax: "",
    amountReceivedMin: "",
    amountReceivedMax: "",
    cashInHandMin: "",
    cashInHandMax: "",
  });
  const [isFilterModalOpen, setIsFilterModalOpen] = React.useState(false);

  const uniqueStores = React.useMemo(
    () => Array.from(new Set(dailyCashierData.map((item) => item.storeName))),
    []
  );

  const uniquePosIds = React.useMemo(
    () => Array.from(new Set(dailyCashierData.map((item) => item.posId || item.counterId || "").filter(Boolean))),
    []
  );

  const filteredData = React.useMemo(() => {
    let data = dailyCashierData;

    // Default filter: show today's data
    const filterDate = filterValues.date || filters.date || getToday();
    data = data.filter((item) => item.date === filterDate);

    if (searchTerm) {
      data = data.filter((item) =>
        [item.staffName, item.posId || item.counterId || "", item.storeName]
          .join(" ")
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      );
    }

    if (filters.store !== "All") {
      data = data.filter((item) => item.storeName === filters.store);
    }

    // POS ID filter
    if (filterValues.posId !== "All") {
      data = data.filter((item) => (item.posId || item.counterId || "") === filterValues.posId);
    }

    // Range filters
    const ranges = {
      netSalesMin: Number.parseFloat(filterValues.netSalesMin),
      netSalesMax: Number.parseFloat(filterValues.netSalesMax),
      amountReceivedMin: Number.parseFloat(filterValues.amountReceivedMin),
      amountReceivedMax: Number.parseFloat(filterValues.amountReceivedMax),
      cashInHandMin: Number.parseFloat(filterValues.cashInHandMin),
      cashInHandMax: Number.parseFloat(filterValues.cashInHandMax),
    };

    data = data.filter((item) => {
      if (Number.isFinite(ranges.netSalesMin) && item.netSales < ranges.netSalesMin) return false;
      if (Number.isFinite(ranges.netSalesMax) && item.netSales > ranges.netSalesMax) return false;

      if (Number.isFinite(ranges.amountReceivedMin) && item.amountReceived < ranges.amountReceivedMin) return false;
      if (Number.isFinite(ranges.amountReceivedMax) && item.amountReceived > ranges.amountReceivedMax) return false;

      if (Number.isFinite(ranges.cashInHandMin) && item.cashInHand < ranges.cashInHandMin) return false;
      if (Number.isFinite(ranges.cashInHandMax) && item.cashInHand > ranges.cashInHandMax) return false;

      return true;
    });

    return data;
  }, [filters, filterValues, searchTerm]);


  // Calculate summary statistics
  const summaryStats = React.useMemo(() => {
    const totalNetSales = filteredData.reduce((sum, item) => sum + item.netSales, 0);
    const totalAmountReceived = filteredData.reduce((sum, item) => sum + item.amountReceived, 0);
    const totalChangeGiven = filteredData.reduce((sum, item) => sum + item.changeGiven, 0);
    const totalCashInHand = filteredData.reduce((sum, item) => sum + item.cashInHand, 0);
    const totalBills = filteredData.reduce((sum, item) => sum + item.totalBills, 0);
    const uniqueCashiers = new Set(filteredData.map((item) => item.staffName)).size;

    return {
      totalNetSales,
      totalAmountReceived,
      totalChangeGiven,
      totalCashInHand,
      totalBills,
      uniqueCashiers,
    };
  }, [filteredData]);


  // Calculate totals for bottom row (amounts only) - based on filtered data, not paginated
  const totals = React.useMemo(() => {
    return {
      totalNetSales: filteredData.reduce((sum, item) => sum + item.netSales, 0),
      totalAmountReceived: filteredData.reduce((sum, item) => sum + item.amountReceived, 0),
      totalChangeGiven: filteredData.reduce((sum, item) => sum + item.changeGiven, 0),
      totalCashInHand: filteredData.reduce((sum, item) => sum + item.cashInHand, 0),
    };
  }, [filteredData]);

  // Total Row Component
  const totalRow = React.useMemo(() => (
    <div className="bg-white dark:bg-[#1F1F1F] border-t border-gray-200 dark:border-[#616161] px-4 py-3">
      <div className="grid grid-cols-8 gap-4 text-sm font-semibold">
        <div className="col-span-4 text-gray-900 dark:text-white">Total</div>
        <div className="text-gray-900 dark:text-white font-bold">
          ${totals.totalNetSales.toFixed(2)}
        </div>
        <div className="text-gray-900 dark:text-white font-bold">
          ${totals.totalAmountReceived.toFixed(2)}
        </div>
        <div className="text-gray-900 dark:text-white font-bold">
          ${totals.totalChangeGiven.toFixed(2)}
        </div>
        <div className="text-gray-900 dark:text-white font-bold">
          ${totals.totalCashInHand.toFixed(2)}
        </div>
      </div>
    </div>
  ), [totals]);

  // Table columns using createColumns
  const tableColumns = React.useMemo(() => CommonComponents.createColumns<AdminTypes.ReportTypes.DailyCashierReport>({
    fields: [
      { name: Constants.adminReportsConstants.date, selector: (row: AdminTypes.ReportTypes.DailyCashierReport) => row.date, sortable: true },
      { name: Constants.adminReportsConstants.staffName, selector: (row: AdminTypes.ReportTypes.DailyCashierReport) => row.staffName, sortable: true },
      { name: Constants.adminReportsConstants.posId, selector: (row: AdminTypes.ReportTypes.DailyCashierReport) => row.posId || row.counterId || "", sortable: true },
      { name: Constants.adminReportsConstants.totalBills, selector: (row: AdminTypes.ReportTypes.DailyCashierReport) => row.totalBills, sortable: true, width: "9%" },
      {
        name: Constants.adminReportsConstants.cashInHand,
        selector: (row: AdminTypes.ReportTypes.DailyCashierReport) => row.cashInHand,
        cell: (row: AdminTypes.ReportTypes.DailyCashierReport) => (
          <span className="text-gray-900 dark:text-gray-300">${row.cashInHand.toFixed(2)}</span>
        ),
        sortable: true,
      },
      {
        name: Constants.adminReportsConstants.netSales,
        selector: (row: AdminTypes.ReportTypes.DailyCashierReport) => row.netSales,
        cell: (row: AdminTypes.ReportTypes.DailyCashierReport) => (
          <span className="text-gray-900 dark:text-gray-300">${row.netSales.toFixed(2)}</span>
        ),
        sortable: true,
      },
      {
        name: Constants.adminReportsConstants.amountReceived,
        selector: (row: AdminTypes.ReportTypes.DailyCashierReport) => row.amountReceived,
        cell: (row: AdminTypes.ReportTypes.DailyCashierReport) => (
          <span className="text-gray-900 dark:text-gray-300">${row.amountReceived.toFixed(2)}</span>
        ),
        sortable: true,
      },
      {
        name: Constants.adminReportsConstants.changeGiven,
        selector: (row: AdminTypes.ReportTypes.DailyCashierReport) => row.changeGiven,
        cell: (row: AdminTypes.ReportTypes.DailyCashierReport) => (
          <span className="text-gray-900 dark:text-gray-300">${row.changeGiven.toFixed(2)}</span>
        ),
        sortable: true,
      },
    ],
  }), []);

  // Export columns
  const exportColumns = React.useMemo(() => {
    return CommonComponents.generateExportColumns<AdminTypes.ReportTypes.DailyCashierReport>([
      { key: "date", label: "Date", accessor: (row) => row.date, pdfWidth: 12 },
      { key: "staffName", label: "Staff Name", accessor: (row) => row.staffName, pdfWidth: 15 },
      { key: "posId", label: "POS ID", accessor: (row) => row.posId || row.counterId || "", pdfWidth: 12 },
      { key: "totalBills", label: "Total Bills", accessor: (row) => row.totalBills.toString(), pdfWidth: 10 },
      { key: "netSales", label: "Net Sales", accessor: (row) => row.netSales.toFixed(2), pdfWidth: 12 },
      { key: "amountReceived", label: "Amount Received", accessor: (row) => row.amountReceived.toFixed(2), pdfWidth: 15 },
      { key: "changeGiven", label: "Change Given", accessor: (row) => row.changeGiven.toFixed(2), pdfWidth: 12 },
      { key: "cashInHand", label: "Cash in Hand", accessor: (row) => row.cashInHand.toFixed(2), pdfWidth: 12 },
      { key: "storeName", label: "Store", accessor: (row) => row.storeName, pdfWidth: 10 },
    ]);
  }, []);

  const filterConfig: FiltersTypes.FilterFieldConfig[] = [
    {
      type: "date",
      label: "Select Date",
      key: "date",
    },
    {
      type: "select",
      label: "Select POS ID",
      key: "posId",
      options: [
        { label: "All POS", value: "All" },
        ...uniquePosIds.map((posId) => ({ label: posId, value: posId })),
      ],
    },
    {
      type: "range",
      label: "Net Sales Range",
      minKey: "netSalesMin",
      maxKey: "netSalesMax",
      prefix: "$",
    },
    {
      type: "range",
      label: "Amount Received Range",
      minKey: "amountReceivedMin",
      maxKey: "amountReceivedMax",
      prefix: "$",
    },
    {
      type: "range",
      label: "Cash in Hand Range",
      minKey: "cashInHandMin",
      maxKey: "cashInHandMax",
      prefix: "$",
    },
  ];

  const handleApplyFilters = () => {
    setIsFilterModalOpen(false);
    // Sync main filters with extended filters
    setFilters({
      store: filters.store,
      date: filterValues.date || todayDefault,
    });
  };

  const handleResetFilters = () => {
    const today = getToday();
    setFilterValues({
      date: today,
      posId: "All",
      netSalesMin: "",
      netSalesMax: "",
      amountReceivedMin: "",
      amountReceivedMax: "",
      cashInHandMin: "",
      cashInHandMax: "",
    });
    setFilters({
      store: "All",
      date: today,
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
            {Constants.adminReportsConstants.dailyCashierReport}
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-textSmall pt-2">
            {Constants.adminReportsConstants.dailyCashierReportBio}
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {/* Total Net Sales Card */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                Total Net Sales
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${summaryStats.totalNetSales.toFixed(2)}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        {/* Total Bills Card */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                Total Bills
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {summaryStats.totalBills}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <Receipt className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        {/* Total Cashiers Card */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                Total Cashiers
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {summaryStats.uniqueCashiers}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <CreditCard className="w-6 h-6 text-white" />
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
          categoryFilter="All"
          onCategoryFilterChange={() => {}}
          categoryOptions={[]}
          showCategoryFilter={false}
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
          searchPlaceholder={Constants.adminReportsConstants.searchPlaceholder}
          showActionSection={false}
          renderExports={
            <>
              <UiWebComponents.DownloadCSV
                data={filteredData}
                columns={exportColumns.csvColumns as any}
                filename={`daily-cashier-report-${new Date().toISOString().split("T")[0]}.csv`}
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
                filename={`daily-cashier-report-${new Date().toISOString().split("T")[0]}.pdf`}
                title={Constants.adminReportsConstants.dailyCashierReport}
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

