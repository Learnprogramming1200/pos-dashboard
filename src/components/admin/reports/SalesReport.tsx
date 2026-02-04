"use client";

import React from "react";
import Image from "next/image";
import { Filter } from "lucide-react";
import { Constants } from "@/constant";
import { CommonComponents } from "@/components/common";
import { UiWebComponents } from "@/components/ui";
import { AdminWebComponents } from "@/components/admin";
import { AdminTypes, FiltersTypes } from "@/types";

interface SalesReportProps {
  initialData?: AdminTypes.ReportTypes.SalesReport[];
}

export default function SalesReportPage({ initialData = [] }: SalesReportProps) {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [storeFilter, setStoreFilter] = React.useState("All");
  const [currentPage, setCurrentPage] = React.useState(1);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  // Filter modal state
  const [isFilterModalOpen, setIsFilterModalOpen] = React.useState(false);
  const [filterValues, setFilterValues] = React.useState({
    store: "All",
    product: "All",
    category: "All",
    paymentMethod: "All",
    dateFrom: "",
    dateTo: "",
    soldQtyMin: "",
    soldQtyMax: "",
    salesAmountMin: "",
    salesAmountMax: ""
  });

  // Static mock data - replace with actual API call
  const salesData = React.useMemo<AdminTypes.ReportTypes.SalesReport[]>(() => initialData, [initialData]);

  // Get unique values for filters
  const uniqueProducts = React.useMemo(() => {
    return Array.from(new Set(salesData.map(item => item.productName)));
  }, [salesData]);

  const uniqueCategories = React.useMemo(() => {
    return Array.from(new Set(salesData.map(item => item.category)));
  }, [salesData]);

  const uniquePaymentMethods = React.useMemo(() => {
    return Array.from(new Set(salesData.map(item => item.paymentMethod)));
  }, [salesData]);


  // Filtered data
  const filteredData = React.useMemo(() => {
    let filtered = salesData;

    if (searchTerm) {
      filtered = filtered.filter(item =>
        (item.code || item.sku || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.storeName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (storeFilter !== "All") {
      filtered = filtered.filter(item => item.storeId === storeFilter);
    }

    // Apply advanced filters
    if (filterValues.store !== "All") {
      filtered = filtered.filter(item => item.storeId === filterValues.store);
    }
    if (filterValues.product !== "All") {
      filtered = filtered.filter(item => item.productName === filterValues.product);
    }
    if (filterValues.category !== "All") {
      filtered = filtered.filter(item => item.category === filterValues.category);
    }
    if (filterValues.paymentMethod !== "All") {
      filtered = filtered.filter(item => item.paymentMethod === filterValues.paymentMethod);
    }

    if (filterValues.dateFrom) {
      filtered = filtered.filter(item => item.date >= filterValues.dateFrom);
    }
    if (filterValues.dateTo) {
      filtered = filtered.filter(item => item.date <= filterValues.dateTo);
    }

    if (filterValues.soldQtyMin) {
      filtered = filtered.filter(item => (item.soldQty || item.qty || 0) >= Number.parseFloat(filterValues.soldQtyMin));
    }
    if (filterValues.soldQtyMax) {
      filtered = filtered.filter(item => (item.soldQty || item.qty || 0) <= Number.parseFloat(filterValues.soldQtyMax));
    }

    if (filterValues.salesAmountMin) {
      filtered = filtered.filter(item => (item.salesAmount || item.netAmount || 0) >= Number.parseFloat(filterValues.salesAmountMin));
    }
    if (filterValues.salesAmountMax) {
      filtered = filtered.filter(item => (item.salesAmount || item.netAmount || 0) <= Number.parseFloat(filterValues.salesAmountMax));
    }

    return filtered;
  }, [salesData, searchTerm, storeFilter, filterValues]);

  // Paginated data for table
  const paginatedData = React.useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, currentPage, rowsPerPage]);

  // Table columns using createColumns
  const tableColumns = React.useMemo(() => CommonComponents.createColumns<AdminTypes.ReportTypes.SalesReport>({
    fields: [
      {
        name: "Code",
        selector: (row: AdminTypes.ReportTypes.SalesReport) => row.code || row.sku || "-",
        sortable: true
      },
      { name: "Product Name", selector: (row: AdminTypes.ReportTypes.SalesReport) => row.productName, sortable: true },
      { name: "Category", selector: (row: AdminTypes.ReportTypes.SalesReport) => row.category, sortable: true },
      {
        name: "Sold Qty",
        selector: (row: AdminTypes.ReportTypes.SalesReport) => row.soldQty || row.qty || 0,
        sortable: true
      },
      {
        name: "Sales Amount",
        selector: (row: AdminTypes.ReportTypes.SalesReport) => row.salesAmount || row.netAmount || 0,
        cell: (row: AdminTypes.ReportTypes.SalesReport) => (
          <span>${(row.salesAmount || row.netAmount || 0).toFixed(2)}</span>
        ),
        sortable: true,
      },
      {
        name: "Available Stock Qty",
        selector: (row: AdminTypes.ReportTypes.SalesReport) => row.availableStockQty || row.availableQty || 0,
        sortable: true
      },
      { name: "Payment Method", selector: (row: AdminTypes.ReportTypes.SalesReport) => row.paymentMethod, sortable: true },
    ],
  }), []);


  const handleApplyFilters = () => {
    setIsFilterModalOpen(false);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setFilterValues({
      store: "All",
      product: "All",
      category: "All",
      paymentMethod: "All",
      dateFrom: "",
      dateTo: "",
      soldQtyMin: "",
      soldQtyMax: "",
      salesAmountMin: "",
      salesAmountMax: ""
    });
  };

  const filterConfig: FiltersTypes.FilterFieldConfig[] = [
    {
      type: "select",
      label: "Select Category",
      key: "category",
      options: [
        { label: "All Categories", value: "All" },
        ...uniqueCategories.map(c => ({ label: c, value: c }))
      ]
    },
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
      label: "Sold Qty Range",
      minKey: "soldQtyMin",
      maxKey: "soldQtyMax",
      prefix: ""
    },
    {
      type: "range",
      label: "Sales Amount Range",
      minKey: "salesAmountMin",
      maxKey: "salesAmountMax"
    }
  ];

  // Export columns
  const exportColumns = React.useMemo(() => {
    return CommonComponents.generateExportColumns<AdminTypes.ReportTypes.SalesReport>([
      { key: "code", label: "Code", accessor: (row) => row.code || row.sku || "-", pdfWidth: 10 },
      { key: "productName", label: "Product Name", accessor: (row) => row.productName, pdfWidth: 20 },
      { key: "category", label: "Category", accessor: (row) => row.category, pdfWidth: 15 },
      { key: "soldQty", label: "Sold Qty", accessor: (row) => (row.soldQty || row.qty || 0).toString(), pdfWidth: 10 },
      { key: "salesAmount", label: "Sales Amount", accessor: (row) => (row.salesAmount || row.netAmount || 0).toFixed(2), pdfWidth: 15 },
      { key: "availableStockQty", label: "Available Stock Qty", accessor: (row) => (row.availableStockQty || row.availableQty || 0).toString(), pdfWidth: 10 },
      { key: "paymentMethod", label: "Payment Method", accessor: (row) => row.paymentMethod, pdfWidth: 10 },
      { key: "storeName", label: "Store", accessor: (row) => row.storeName, pdfWidth: 10 },
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
            {Constants.adminReportsConstants.salesReport}
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-textSmall pt-2">
            {Constants.adminReportsConstants.salesReportBio}
          </p>
        </div>
      </div>

      {/* Filters and Table */}
      <div className="bg-white dark:bg-darkFilterbar rounded-[4px] h-full w-full mt-4 overflow-hidden">
        <CommonComponents.CommonFilterBar
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
            setStoreFilter(value === "All" ? "All" : value);
          }}
          statusOptions={[
            { label: Constants.adminReportsConstants.allStores, value: "All" },
            { label: "Gadget World", value: "1" },
            { label: "Fashion Store", value: "2" },
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
                filename={`sales-report-${new Date().toISOString().split("T")[0]}.csv`}
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
                filename={`sales-report-${new Date().toISOString().split("T")[0]}.pdf`}
                title={Constants.adminReportsConstants.salesReport}
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
