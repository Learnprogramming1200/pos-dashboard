"use client";

import React from "react";
import Image from "next/image";
import { Filter, DollarSign, Users, Clock, CheckCircle } from "lucide-react";
import { ServerActions } from "@/lib";
import { Constants } from "@/constant";
import { CommonComponents } from "@/components/common";
import { UiWebComponents } from "@/components/ui";
import { AdminWebComponents } from "@/components/admin";
import { AdminTypes,FiltersTypes } from "@/types";
import { payrollData } from "@/constant/dummy-data/payroll";


// Get last month as default
const getLastMonth = () => {
  const now = new Date();
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  return {
    month: lastMonth.toLocaleString("default", { month: "long" }),
    year: lastMonth.getFullYear().toString(),
  };
};

export default function PayrollReport() {
  const lastMonthDefault = getLastMonth();
  const [searchTerm, setSearchTerm] = React.useState("");
  const [filters, setFilters] = React.useState({
    store: "All",
    payout: "All",
    month: lastMonthDefault.month,
    year: lastMonthDefault.year,
  });
  const [isFilterModalOpen, setIsFilterModalOpen] = React.useState(false);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const uniqueStores = React.useMemo(
    () => Array.from(new Set(payrollData.map((item) => item.storeName))),
    []
  );

  const filteredData = React.useMemo(() => {
    let data = payrollData;

    // Default filter: show last month
    if (!filters.month || !filters.year) {
      const defaultMonth = getLastMonth();
      data = data.filter(
        (item) => item.month === defaultMonth.month && item.year.toString() === defaultMonth.year
      );
    } else {
      data = data.filter(
        (item) =>
          item.month === filters.month && item.year.toString() === filters.year
      );
    }

    if (searchTerm) {
      data = data.filter((item) =>
        [item.staffName, item.storeName, item.bankAccount]
          .join(" ")
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      );
    }

    if (filters.store !== "All") {
      data = data.filter((item) => item.storeName === filters.store);
    }

    if (filters.payout !== "All") {
      data = data.filter((item) => item.payout === filters.payout);
    }

    return data;
  }, [filters, searchTerm]);


  // Calculate summary statistics
  const summaryStats = React.useMemo(() => {
    const totalPayroll = filteredData.reduce((sum, item) => sum + item.totalPayableAmount, 0);
    const pendingCount = filteredData.filter((item) => item.payout === "Pending").length;
    const paidCount = filteredData.filter((item) => item.payout === "Paid").length;
    const totalStaff = new Set(filteredData.map((item) => item.staffName)).size;

    return {
      totalPayroll,
      pendingCount,
      paidCount,
      totalStaff,
    };
  }, [filteredData]);

  // Calculate totals for bottom row (amounts only)
  const totals = React.useMemo(() => {
    return {
      totalFixedSalary: filteredData.reduce((sum, item) => sum + item.fixedSalary, 0),
      totalPayableAmount: filteredData.reduce((sum, item) => sum + item.totalPayableAmount, 0),
    };
  }, [filteredData]);

  // Total Row Component
  const totalRow = React.useMemo(() => (
    <div className="bg-white dark:bg-[#1F1F1F] border-t border-gray-200 dark:border-[#616161] px-4 py-3">
      <div className="grid grid-cols-7 gap-4 text-sm font-semibold">
        <div className="col-span-2 text-gray-900 dark:text-white">Total</div>
        <div className="text-gray-900 dark:text-white">${totals.totalFixedSalary.toFixed(2)}</div>
        <div></div>
        <div></div>
        <div className="text-gray-900 dark:text-white font-bold">
          ${totals.totalPayableAmount.toFixed(2)}
        </div>
        <div></div>
      </div>
    </div>
  ), [totals]);

  // Table columns using createColumns
  const tableColumns = React.useMemo(() => CommonComponents.createColumns<AdminTypes.ReportTypes.PayrollReport>({
    fields: [
      {
        name: Constants.adminReportsConstants.staffName,
        selector: (row: AdminTypes.ReportTypes.PayrollReport) => row.staffName,
        sortable: true,
      },
      {
        name: Constants.adminReportsConstants.storeName,
        selector: (row: AdminTypes.ReportTypes.PayrollReport) => row.storeName,
        sortable: true,
      },
      {
        name: Constants.adminReportsConstants.fixedSalary,
        selector: (row: AdminTypes.ReportTypes.PayrollReport) => row.fixedSalary,
        cell: (row: AdminTypes.ReportTypes.PayrollReport) => (
          <span className="text-gray-900 dark:text-gray-300">${row.fixedSalary.toFixed(2)}</span>
        ),
        width: "12%",
        sortable: true,
      },
      {
        name: Constants.adminReportsConstants.totalWorkingDays,
        selector: (row: AdminTypes.ReportTypes.PayrollReport) => row.totalWorkingDays,
        sortable: true,
      },
      {
        name: Constants.adminReportsConstants.presentDays,
        selector: (row: AdminTypes.ReportTypes.PayrollReport) => row.presentDays,
        width: "12%",
        sortable: true,
      },
      {
        name: Constants.adminReportsConstants.totalPayableAmount,
        selector: (row: AdminTypes.ReportTypes.PayrollReport) => row.totalPayableAmount,
        cell: (row: AdminTypes.ReportTypes.PayrollReport) => (
          <span className="font-medium text-gray-900 dark:text-gray-300">
            ${row.totalPayableAmount.toFixed(2)}
          </span>
        ),
        sortable: true,
      },
      {
        name: Constants.adminReportsConstants.payout,
        selector: (row: AdminTypes.ReportTypes.PayrollReport) => row.payout,
        cell: (row: AdminTypes.ReportTypes.PayrollReport) => {
          const statusColors = {
            Paid: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
            Pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
            Failed: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
          };
          return (
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[row.payout] || ""}`}
            >
              {row.payout}
            </span>
          );
        },
        sortable: true,
      },
    ],
  }), []);

  // Export columns
  const exportColumns = React.useMemo(() => {
    return CommonComponents.generateExportColumns<AdminTypes.ReportTypes.PayrollReport>([
      { key: "staffName", label: "Staff Name", accessor: (row) => row.staffName, pdfWidth: 15 },
      { key: "storeName", label: "Store Name", accessor: (row) => row.storeName, pdfWidth: 12 },
      { key: "fixedSalary", label: "Fixed Salary", accessor: (row) => row.fixedSalary.toFixed(2), pdfWidth: 10 },
      { key: "totalWorkingDays", label: "Total Working Days", accessor: (row) => row.totalWorkingDays.toString(), pdfWidth: 10 },
      { key: "presentDays", label: "Present Days", accessor: (row) => row.presentDays.toString(), pdfWidth: 10 },
      { key: "totalPayableAmount", label: "Total Payable Amount", accessor: (row) => row.totalPayableAmount.toFixed(2), pdfWidth: 12 },
      { key: "payout", label: "Payout", accessor: (row) => row.payout, pdfWidth: 10 },
      { key: "month", label: "Month", accessor: (row) => row.month, pdfWidth: 10 },
      { key: "year", label: "Year", accessor: (row) => row.year.toString(), pdfWidth: 8 },
      { key: "bankAccount", label: "Bank Account", accessor: (row) => row.bankAccount, pdfWidth: 13 },
    ]);
  }, []);

  const filterConfig: FiltersTypes.FilterFieldConfig[] = [
    {
      type: "select",
      label: "Select Store",
      key: "store",
      options: [
        { label: Constants.adminReportsConstants.allStores, value: "All" },
        ...uniqueStores.map((store) => ({ label: store, value: store })),
      ],
    },
    {
      type: "select",
      label: "Select Payout Status",
      key: "payout",
      options: [
        { label: "All", value: "All" },
        { label: "Paid", value: "Paid" },
        { label: "Pending", value: "Pending" },
        { label: "Failed", value: "Failed" },
      ],
    },
    {
      type: "select",
      label: Constants.adminReportsConstants.month,
      key: "month",
      options: ServerActions.DatePretier.MONTHS_LONG.map((m) => ({ label: m, value: m })),
    },
    {
      type: "select",
      label: Constants.adminReportsConstants.year,
      key: "year",
      options: ServerActions.DatePretier.MONTHS_LONG.map((y) => ({ label: y, value: y })),
    },
  ];

  const handleApplyFilters = () => {
    setIsFilterModalOpen(false);
  };

  const handleResetFilters = () => {
    const defaultMonth = getLastMonth();
    setFilters({
      store: "All",
      payout: "All",
      month: defaultMonth.month,
      year: defaultMonth.year,
    });
  };

  return (
    <>
      <AdminWebComponents.Models.ExtendedFiltersModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
        filters={filters}
        setFilters={setFilters}
        filterConfig={filterConfig}
      />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-2">
        <div>
          <h1 className="text-lg sm:text-lg md:text-xl lg:text-2xl font-medium text-textMain dark:text-white truncate">
            {Constants.adminReportsConstants.payrollReport}
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-textSmall pt-2">
            {Constants.adminReportsConstants.payrollReportBio}
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Payroll Amount Card */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                {Constants.adminReportsConstants.totalPayrollAmount}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${summaryStats.totalPayroll.toFixed(2)}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        {/* Pending Payouts Card */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                {Constants.adminReportsConstants.pendingPayouts}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {summaryStats.pendingCount}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <Clock className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        {/* Paid Payouts Card */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                {Constants.adminReportsConstants.paidPayouts}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {summaryStats.paidCount}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        {/* Total Staff Card */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Total Staff</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {summaryStats.totalStaff}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <Users className="w-6 h-6 text-white" />
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
          categoryFilter={filters.month}
          onCategoryFilterChange={(value: string) => {
            setFilters((prev) => ({ ...prev, month: value || "" }));
          }}
          categoryOptions={ServerActions.DatePretier.MONTHS_LONG.map((m) => ({ name: m, value: m }))}
          categoryPlaceholder={Constants.adminReportsConstants.month}
          showCategoryFilter={true}
          statusFilter={filters.year}
          onStatusFilterChange={(value: string) => {
            setFilters((prev) => ({ ...prev, year: value || "" }));
          }}
          statusOptions={ServerActions.DatePretier.MONTHS_LONG.map((y) => ({ label: y, value: y }))}
          statusPlaceholder={Constants.adminReportsConstants.year}
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
          searchPlaceholder="Search by staff name, store, or bank account"
          showActionSection={false}
          renderExports={
            <>
              <UiWebComponents.DownloadCSV
                data={filteredData}
                columns={exportColumns.csvColumns as any}
                filename={`payroll-report-${new Date().toISOString().split("T")[0]}.csv`}
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
                filename={`payroll-report-${new Date().toISOString().split("T")[0]}.pdf`}
                title={Constants.adminReportsConstants.payrollReport}
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

