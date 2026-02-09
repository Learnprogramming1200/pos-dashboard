"use client";

import React from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Filter, Users, Clock, Activity } from "lucide-react";
import { Constants } from "@/constant";
import { WebComponents } from "@/components";
import { AdminTypes, FiltersTypes, PaginationType } from "@/types"

interface UserLoginReportProps {
  readonly initialData: AdminTypes.ReportTypes.UserLoginReport[];
  readonly initialPagination: PaginationType.Pagination;
  readonly initialStores: AdminTypes.storeTypes.Store[];
  readonly initialSummary: AdminTypes.ReportTypes.UserLoginReportSummary;
}

export default function UserLoginReport({
  initialData,
  initialPagination,
  initialStores,
  initialSummary,
}: UserLoginReportProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchTerm, setSearchTerm] = React.useState(searchParams.get("search") || "");
  const [filters, setFilters] = React.useState({
    store: searchParams.get("store") || "All",
    role: searchParams.get("role") || "All",
    dateFrom: searchParams.get("dateFrom") || "",
    dateTo: searchParams.get("dateTo") || "",
  });
  const [currentPage, setCurrentPage] = React.useState(1);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [isFilterModalOpen, setIsFilterModalOpen] = React.useState(false);

  const updateUrlWithFilters = React.useCallback((overrides: Record<string, string> = {}) => {
    const params = new URLSearchParams();
    params.set("page", "1");
    params.set("limit", rowsPerPage.toString());

    const currentFilters = { ...filters, ...overrides };
    if (currentFilters.store && currentFilters.store !== "All") params.set("store", currentFilters.store);
    if (currentFilters.role && currentFilters.role !== "All") params.set("role", currentFilters.role);
    if (currentFilters.dateFrom) params.set("dateFrom", currentFilters.dateFrom);
    if (currentFilters.dateTo) params.set("dateTo", currentFilters.dateTo);

    const searchValue = overrides.search !== undefined ? overrides.search : searchTerm;
    if (searchValue) params.set("search", searchValue);

    router.push(`?${params.toString()}`);
  }, [filters, searchTerm, rowsPerPage, router]);

  const filteredData = initialData;
  const paginatedData = initialData;

  React.useEffect(() => {
    const urlSearch = searchParams.get("search") || "";
    if (searchTerm === urlSearch) return;

    const timeoutId = setTimeout(() => {
      updateUrlWithFilters({ search: searchTerm });
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, searchParams, updateUrlWithFilters]);

  const summaryStats = React.useMemo(() => {
    return {
      totalLogins: initialSummary?.totalLogins || 0,
      activeLogins: initialSummary?.activeLogins || 0,
      averageDuration: initialSummary?.averageSessionDuration || "0h 0m",
    };
  }, [initialSummary]);

  const tableColumns = React.useMemo(() => WebComponents.WebCommonComponents.CommonComponents.createColumns<AdminTypes.ReportTypes.UserLoginReport>({
    fields: [
      {
        name: "Store",
        selector: (row: AdminTypes.ReportTypes.UserLoginReport) => row.store,
        sortable: true,
      },
      {
        name: Constants.adminReportsConstants.username,
        selector: (row: AdminTypes.ReportTypes.UserLoginReport) => row.user,
        sortable: true,
      },
      {
        name: Constants.adminReportsConstants.role, // "Role"
        selector: (row: AdminTypes.ReportTypes.UserLoginReport) => row.role,
        sortable: true,
      },
      {
        name: Constants.adminReportsConstants.loginTime,
        selector: (row: AdminTypes.ReportTypes.UserLoginReport) => new Date(row.loginTime).toLocaleString('en-GB', { day: 'numeric', month: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true }).toUpperCase(),
        sortable: true,
      },
      {
        name: Constants.adminReportsConstants.logoutTime,
        selector: (row: AdminTypes.ReportTypes.UserLoginReport) => row.logoutTime ? new Date(row.logoutTime).toLocaleString('en-GB', { day: 'numeric', month: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true }).toUpperCase() : "-",
        sortable: true,
      },
      {
        name: Constants.adminReportsConstants.duration,
        selector: (row: AdminTypes.ReportTypes.UserLoginReport) => row.duration,
        sortable: true,
      },
      {
        name: Constants.adminReportsConstants.ipAddress,
        selector: (row: AdminTypes.ReportTypes.UserLoginReport) => row.ipAddress ? row.ipAddress.replace(/^::ffff:/, '') : "N/A",
        sortable: true,
      },
      {
        name: Constants.adminReportsConstants.device,
        selector: (row: AdminTypes.ReportTypes.UserLoginReport) => row.device,
        sortable: true,
      },
    ],
  }), [initialStores]);

  const exportColumns = React.useMemo(() => {
    return WebComponents.WebCommonComponents.CommonComponents.generateExportColumns<AdminTypes.ReportTypes.UserLoginReport>([
      { key: "username", label: "Username", accessor: (row) => row.user, pdfWidth: 15 },
      { key: "role", label: "Role", accessor: (row) => row.role, pdfWidth: 12 },
      { key: "loginTime", label: "Login Time", accessor: (row) => new Date(row.loginTime).toLocaleString('en-GB', { day: 'numeric', month: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true }).toUpperCase(), pdfWidth: 15 },
      { key: "logoutTime", label: "Logout Time", accessor: (row) => row.logoutTime ? new Date(row.logoutTime).toLocaleString('en-GB', { day: 'numeric', month: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true }).toUpperCase() : "-", pdfWidth: 15 },
      { key: "duration", label: "Duration", accessor: (row) => row.duration, pdfWidth: 12 },
      { key: "ipAddress", label: "IP Address", accessor: (row) => row.ipAddress ? row.ipAddress.replace(/^::ffff:/, '') : "-", pdfWidth: 15 },
      { key: "macAddress", label: "MAC Address", accessor: (row) => row.macAddress, pdfWidth: 15 },
      { key: "storeName", label: "Store", accessor: (row) => row.store, pdfWidth: 10 },
    ]);
  }, []);

  const filterConfig: FiltersTypes.FilterFieldConfig[] = [
    {
      type: "select",
      label: "Select Store",
      key: "store",
      options: [
        { label: Constants.adminReportsConstants.allStores, value: "All" },
        ...(initialStores?.map((store) => ({
          label: store.name,
          value: store._id,
        })) || []),
      ],
    },
    { type: "date", label: Constants.adminReportsConstants.fromDate, key: "dateFrom" },
    { type: "date", label: Constants.adminReportsConstants.toDate, key: "dateTo" },
  ];

  const handleApplyFilters = () => {
    setIsFilterModalOpen(false);
    setCurrentPage(1);

    const params = new URLSearchParams();
    params.set("page", "1");
    params.set("limit", rowsPerPage.toString());
    if (filters.store && filters.store !== "All") params.set("store", filters.store);
    if (filters.role && filters.role !== "All") params.set("role", filters.role);
    if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
    if (filters.dateTo) params.set("dateTo", filters.dateTo);
    if (searchTerm) params.set("search", searchTerm);

    router.push(`?${params.toString()}`);
  };

  const handleResetFilters = () => {
    setFilters({
      store: "All",
      role: "All",
      dateFrom: "",
      dateTo: "",
    });
    setCurrentPage(1);
    router.push("?");
  };

  return (
    <>
      <WebComponents.AdminComponents.AdminWebComponents.Models.ExtendedFiltersModal
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
            {Constants.adminReportsConstants.userLoginReport}
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-textSmall pt-2">
            {Constants.adminReportsConstants.userLoginReportBio}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-[#333333] rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{Constants.adminReportsConstants.totalLogins}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {summaryStats.totalLogins}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#333333] rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Active Logins</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {summaryStats.activeLogins}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <Activity className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#333333] rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                {Constants.adminReportsConstants.averageSessionDuration}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {summaryStats.averageDuration}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <Clock className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-darkFilterbar rounded-[4px] h-full w-full mt-4 overflow-hidden">
        <WebComponents.WebCommonComponents.CommonComponents.CommonFilterBar
          actionFilter="All"
          activeStatusFilter="All"
          selectedCount={0}
          categoryFilter="All"
          showCategoryFilter={false}
          statusFilter={filters.role}
          onStatusFilterChange={(value: string) => {
            const newRole = value === "All" ? "All" : value;
            setFilters((prev) => ({ ...prev, role: newRole }));
            updateUrlWithFilters({ role: newRole });
          }}
          statusOptions={[
            { label: "All Roles", value: "All" },
            ...Array.from(new Set(initialData.map((item) => item.role))).map((role) => ({ label: role, value: role })),
          ]}
          statusPlaceholder="All Roles"
          searchTerm={searchTerm}
          onSearchTermChange={(value: string) => {
            setSearchTerm(value);
          }}
          searchPlaceholder={Constants.adminReportsConstants.searchPlaceholder}
          showActionSection={false}
          renderExports={
            <>
              <WebComponents.UiWebComponents.UiWebComponents.DownloadCSV
                data={filteredData}
                columns={exportColumns.csvColumns as any}
                filename={`user-login-report-${new Date().toISOString().split("T")[0]}.csv`}
                onExport={async () => {
                  WebComponents.UiWebComponents.UiWebComponents.SwalHelper.success({ text: `${Constants.adminReportsConstants.exportCSV} successfully.` });
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
              </WebComponents.UiWebComponents.UiWebComponents.DownloadCSV>
              <WebComponents.UiWebComponents.UiWebComponents.DownloadPDF
                data={filteredData}
                columns={exportColumns.pdfColumns as any}
                filename={`user-login-report-${new Date().toISOString().split("T")[0]}.pdf`}
                title={Constants.adminReportsConstants.userLoginReport}
                orientation="landscape"
                onExport={async () => {
                  WebComponents.UiWebComponents.UiWebComponents.SwalHelper.success({ text: `${Constants.adminReportsConstants.exportPDF} successfully.` });
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
            totalRecords={initialPagination.totalItems}
            filteredRecords={initialPagination.totalItems}
            paginationPerPage={initialPagination.itemsPerPage}
            paginationDefaultPage={initialPagination.currentPage}
            paginationRowsPerPageOptions={[5, 10, 25, 50]}
            onChangePage={(page: number) => {
              setCurrentPage(page);
            }}
            onChangeRowsPerPage={(perPage: number) => {
              setRowsPerPage(perPage);
              setCurrentPage(1);
            }}
            useUrlParams={true}
          />
        </div>
      </div>
    </>
  );
}

