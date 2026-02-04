"use client";

import React from "react";
import Image from "next/image";
import { Filter } from "lucide-react";
import { Constants } from "@/constant";
import { CommonComponents } from "@/components/common";
import { UiWebComponents } from "@/components/ui";
import { AdminWebComponents } from "@/components/admin";
import { AdminTypes,FiltersTypes } from "@/types"
import { userActivityData } from "@/constant/dummy-data/user-activity";

export default function UserActivityReport() {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [filters, setFilters] = React.useState({store: "All", menu: "All", dateFrom: "", dateTo: ""});
  const [currentPage, setCurrentPage] = React.useState(1);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [isFilterModalOpen, setIsFilterModalOpen] = React.useState(false);
  const uniqueMenus = React.useMemo(
    () => Array.from(new Set(userActivityData.map((item) => item.menuName))),
    []
  );
  
  const filteredData = React.useMemo(() => {
    let data = userActivityData;

    if (searchTerm) {
      data = data.filter((item) =>
        [item.username, item.menuName, item.storeName]
          .join(" ")
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      );
    }

    if (filters.store !== "All") {
      data = data.filter((item) => item.storeId === filters.store);
    }

    if (filters.menu !== "All") {
      data = data.filter((item) => item.menuName === filters.menu);
    }

    if (filters.dateFrom) {
      data = data.filter(
        (item) => new Date(item.loginTime).getTime() >= new Date(filters.dateFrom).getTime()
      );
    }

    if (filters.dateTo) {
      data = data.filter(
        (item) => new Date(item.logoutTime).getTime() <= new Date(filters.dateTo).getTime()
      );
    }

    return data;
  }, [filters, searchTerm]);

  const paginatedData = React.useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, currentPage, rowsPerPage]);

  // Table columns using createColumns
  const tableColumns = React.useMemo(() => CommonComponents.createColumns<AdminTypes.ReportTypes.UserActivityReport>({
    fields: [
      {
        name: Constants.adminReportsConstants.username,
        selector: (row: AdminTypes.ReportTypes.UserActivityReport) => row.username,
        sortable: true,
      },
      {
        name: Constants.adminReportsConstants.menuName,
        selector: (row: AdminTypes.ReportTypes.UserActivityReport) => row.menuName,
        sortable: true,
      },
      {
        name: Constants.adminReportsConstants.loginTime,
        selector: (row: AdminTypes.ReportTypes.UserActivityReport) => row.loginTime,
        sortable: true,
      },
      {
        name: Constants.adminReportsConstants.logoutTime,
        selector: (row: AdminTypes.ReportTypes.UserActivityReport) => row.logoutTime,
        sortable: true,
      },
    ],
  }), []);

  // Export columns
  const exportColumns = React.useMemo(() => {
    return CommonComponents.generateExportColumns<AdminTypes.ReportTypes.UserActivityReport>([
      { key: "username", label: "Username", accessor: (row) => row.username, pdfWidth: 20 },
      { key: "menuName", label: "Menu Name", accessor: (row) => row.menuName, pdfWidth: 25 },
      { key: "loginTime", label: "Login Time", accessor: (row) => row.loginTime, pdfWidth: 20 },
      { key: "logoutTime", label: "Logout Time", accessor: (row) => row.logoutTime, pdfWidth: 20 },
      { key: "storeName", label: "Store", accessor: (row) => row.storeName, pdfWidth: 15 },
    ]);
  }, []);

  const filterConfig: FiltersTypes.FilterFieldConfig[] = [
    {
      type: "select",
      label: "Select Store",
      key: "store",
      options: [
        { label: Constants.adminReportsConstants.allStores, value: "All" },
        { label: "Main Store", value: "1" },
        { label: "Branch Store", value: "2" },
        { label: "HQ Store", value: "3" },
      ],
    },
    { type: "date", label: "Date From", key: "dateFrom" },
    { type: "date", label: "Date To", key: "dateTo" },
  ];

  const handleApplyFilters = () => {
    setIsFilterModalOpen(false);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setFilters({
      store: "All",
      menu: "All",
      dateFrom: "",
      dateTo: "",
    });
    setCurrentPage(1);
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
            {Constants.adminReportsConstants.userActivityReport}
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-textSmall pt-2">
            {Constants.adminReportsConstants.userActivityReportBio}
          </p>
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
          statusFilter={filters.menu}
          onStatusFilterChange={(value: string) => {
            setFilters((prev) => ({ ...prev, menu: value === "All" ? "All" : value }));
          }}
          statusOptions={[
            { label: "All Menus", value: "All" },
            ...uniqueMenus.map((menu) => ({ label: menu, value: menu })),
          ]}
          statusPlaceholder="All Menus"
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
          searchPlaceholder={Constants.adminReportsConstants.searchPlaceholder}
          showActionSection={false}
          renderExports={
            <>
              <UiWebComponents.DownloadCSV
                data={filteredData}
                columns={exportColumns.csvColumns as any}
                filename={`user-activity-report-${new Date().toISOString().split("T")[0]}.csv`}
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
                filename={`user-activity-report-${new Date().toISOString().split("T")[0]}.pdf`}
                title={Constants.adminReportsConstants.userActivityReport}
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
    </>
  );
}
