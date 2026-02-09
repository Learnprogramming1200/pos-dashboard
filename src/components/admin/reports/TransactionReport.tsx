"use client";

import React from "react";
import Image from "next/image";
import { Filter } from "lucide-react";
import { Constants } from "@/constant";
import { CommonComponents } from "@/components/common";
import { UiWebComponents } from "@/components/ui";
import { AdminWebComponents } from "@/components/admin";
import { AdminTypes,FiltersTypes } from "@/types";
import { transactionDataDummy } from "@/constant/dummy-data/transaction";

export default function TransactionReportPage() {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [currentPage, setCurrentPage] = React.useState(1);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  // Filter modal state
  const [isFilterModalOpen, setIsFilterModalOpen] = React.useState(false);
  const [filterValues, setFilterValues] = React.useState({
    transactionId: "",
    product: "All",
    paymentMethod: "All",
    soldBy: "All",
    dateFrom: "",
    dateTo: "",
    store: "All", // Kept for filter logic even if not shown in table
    minAmount: "",
    maxAmount: ""
  });

  // Static mock data - replace with actual API call
  const transactionData = React.useMemo<AdminTypes.ReportTypes.TransactionReport[]>(() => transactionDataDummy, []);

  // Get unique values for filters
  const uniqueProducts = React.useMemo(() => {
    return Array.from(new Set(transactionData.map(item => item.productName)));
  }, [transactionData]);

  const uniquePaymentMethods = React.useMemo(() => {
    return Array.from(new Set(transactionData.map(item => item.paymentMethod)));
  }, [transactionData]);

  const uniqueSoldBy = React.useMemo(() => {
    return Array.from(new Set(transactionData.map(item => item.soldBy)));
  }, [transactionData]);


  // Filtered data
  const filteredData = React.useMemo(() => {
    let filtered = transactionData;

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.soldBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.storeName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply advanced filters
    if (filterValues.product !== "All") {
      filtered = filtered.filter(item => item.productName === filterValues.product);
    }
    if (filterValues.paymentMethod !== "All") {
      filtered = filtered.filter(item => item.paymentMethod === filterValues.paymentMethod);
    }
    if (filterValues.soldBy !== "All") {
      filtered = filtered.filter(item => item.soldBy === filterValues.soldBy);
    }
    if (filterValues.store !== "All") {
      filtered = filtered.filter(item => item.storeId === filterValues.store);
    }

    if (filterValues.dateFrom) {
      filtered = filtered.filter(item => item.date >= filterValues.dateFrom);
    }
    if (filterValues.dateTo) {
      filtered = filtered.filter(item => item.date <= filterValues.dateTo);
    }

    if (filterValues.minAmount) {
      filtered = filtered.filter(item => item.totalAmount >= Number.parseFloat(filterValues.minAmount));
    }
    if (filterValues.maxAmount) {
      filtered = filtered.filter(item => item.totalAmount <= Number.parseFloat(filterValues.maxAmount));
    }

    return filtered;
  }, [transactionData, searchTerm, filterValues]);

  // Paginated data for table
  const paginatedData = React.useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, currentPage, rowsPerPage]);

  // Table columns using createColumns
  const tableColumns = React.useMemo(() => CommonComponents.createColumns<AdminTypes.ReportTypes.TransactionReport>({
    fields: [
      { name: "Date", selector: (row: AdminTypes.ReportTypes.TransactionReport) => row.date, sortable: true, width: "7%" },
      { name: "Transaction ID", selector: (row: AdminTypes.ReportTypes.TransactionReport) => row.transactionId, sortable: true, width: "10%" },
      { name: "Product Name", selector: (row: AdminTypes.ReportTypes.TransactionReport) => row.productName, sortable: true, width: "10%" },
      { name: "Sold Qty", selector: (row: AdminTypes.ReportTypes.TransactionReport) => row.soldQty, sortable: true, width: "8%" },
      {
        name: "Amount",
        selector: (row: AdminTypes.ReportTypes.TransactionReport) => row.amount,
        cell: (row: AdminTypes.ReportTypes.TransactionReport) => (
          <span>${row.amount.toFixed(2)}</span>
        ),
        sortable: true,
        width: "8%",
      },
      {
        name: "Discount",
        selector: (row: AdminTypes.ReportTypes.TransactionReport) => row.discount,
        cell: (row: AdminTypes.ReportTypes.TransactionReport) => (
          <span>${row.discount.toFixed(2)}</span>
        ),
        sortable: true,
        width: "8%",
      },
      {
        name: "Loyalty Amount",
        selector: (row: AdminTypes.ReportTypes.TransactionReport) => row.loyaltyAmount,
        cell: (row: AdminTypes.ReportTypes.TransactionReport) => (
          <span>${row.loyaltyAmount.toFixed(2)}</span>
        ),
        sortable: true,
        width: "11%",
      },
      {
        name: "Taxes",
        selector: (row: AdminTypes.ReportTypes.TransactionReport) => row.taxes,
        cell: (row: AdminTypes.ReportTypes.TransactionReport) => (
          <span>${row.taxes.toFixed(2)}</span>
        ),
        sortable: true,
        width: "8%",
      },
      {
        name: "Total",
        selector: (row: AdminTypes.ReportTypes.TransactionReport) => row.totalAmount,
        cell: (row: AdminTypes.ReportTypes.TransactionReport) => (
          <span>${row.totalAmount.toFixed(2)}</span>
        ),
        sortable: true,
        width: "8%",
      },
      { name: "Payment Method", selector: (row: AdminTypes.ReportTypes.TransactionReport) => row.paymentMethod, sortable: true },
      { name: "Sold By", selector: (row: AdminTypes.ReportTypes.TransactionReport) => row.soldBy, sortable: true, width: "10%" },
    ],
  }), []);

  const handleApplyFilters = () => {
    setIsFilterModalOpen(false);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setFilterValues({
      transactionId: "",
      product: "All",
      paymentMethod: "All",
      soldBy: "All",
      dateFrom: "",
      dateTo: "",
      store: "All",
      minAmount: "",
      maxAmount: ""
    });
  };

  const filterConfig: FiltersTypes.FilterFieldConfig[] = [
    {
      type: "select",
      label: "Select Product",
      key: "product",
      options: [
        { label: "All Products", value: "All" },
        ...uniqueProducts.map(p => ({ label: p, value: p }))
      ]
    },
    {
      type: "select",
      label: "Select Payment Method",
      key: "paymentMethod",
      options: [
        { label: "All Payment Methods", value: "All" },
        ...uniquePaymentMethods.map(pm => ({ label: pm, value: pm }))
      ]
    },
    {
      type: "select",
      label: "Sold By",
      key: "soldBy",
      options: [
        { label: "All Staff", value: "All" },
        ...uniqueSoldBy.map(s => ({ label: s, value: s }))
      ]
    },
    {
      type: "select",
      label: "Select Store",
      key: "store",
      options: [
        { label: "All Stores", value: "All" },
        { label: "Gadget World", value: "1" },
        { label: "Fashion Store", value: "2" },
      ]
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
      label: "Total Amount Range",
      minKey: "minAmount",
      maxKey: "maxAmount",
      prefix: "$"
    }
  ];

  // Export columns
  const exportColumns = React.useMemo(() => {
    return CommonComponents.generateExportColumns<AdminTypes.ReportTypes.TransactionReport>([
      { key: "date", label: "Date", accessor: (row) => row.date, pdfWidth: 10 },
      { key: "transactionId", label: "Transaction ID", accessor: (row) => row.transactionId, pdfWidth: 12 },
      { key: "productName", label: "Product Name", accessor: (row) => row.productName, pdfWidth: 15 },
      { key: "soldQty", label: "Sold Qty", accessor: (row) => row.soldQty.toString(), pdfWidth: 6 },
      { key: "amount", label: "Amount", accessor: (row) => row.amount.toFixed(2), pdfWidth: 8 },
      { key: "discount", label: "Discount", accessor: (row) => row.discount.toFixed(2), pdfWidth: 8 },
      { key: "loyaltyAmount", label: "Loyalty Amount", accessor: (row) => row.loyaltyAmount.toFixed(2), pdfWidth: 8 },
      { key: "taxes", label: "Taxes", accessor: (row) => row.taxes.toFixed(2), pdfWidth: 8 },
      { key: "totalAmount", label: "Total Amount", accessor: (row) => row.totalAmount.toFixed(2), pdfWidth: 10 },
      { key: "paymentMethod", label: "Payment Method", accessor: (row) => row.paymentMethod, pdfWidth: 10 },
      { key: "soldBy", label: "Sold By", accessor: (row) => row.soldBy, pdfWidth: 10 },
    ]);
  }, []);

  return (
    <div className="space-y-6">
      <AdminWebComponents.Models.ExtendedFiltersModal
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
            {Constants.adminReportsConstants.transactionReport}
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-textSmall pt-2">
            {Constants.adminReportsConstants.transactionReportBio}
          </p>
        </div>
      </div>

      {/* Filters and Table */}
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
          statusFilter="All"
          onStatusFilterChange={() => {}}
          statusOptions={[]}
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
          searchPlaceholder={Constants.adminReportsConstants.searchPlaceholder}
          showActionSection={false}
          renderExports={
            <>
              <UiWebComponents.DownloadCSV
                data={filteredData}
                columns={exportColumns.csvColumns as any}
                filename={`transaction-report-${new Date().toISOString().split("T")[0]}.csv`}
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
                filename={`transaction-report-${new Date().toISOString().split("T")[0]}.pdf`}
                title={Constants.adminReportsConstants.transactionReport}
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
            totalRecords={filteredData.length}
            filteredRecords={filteredData.length}
            paginationPerPage={rowsPerPage}
            paginationDefaultPage={currentPage}
            paginationRowsPerPageOptions={[5, 10, 25, 50]}
            onChangePage={(page: number) => {
              setCurrentPage(page);
            }}
            onChangeRowsPerPage={(perPage: number) => {
              setRowsPerPage(perPage);
              setCurrentPage(1);
            }}
            useUrlParams={false}
          />
        </div>
      </div>
    </div>
  );
}
