"use client";

import React from "react";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import type { TableColumn } from "react-data-table-component";
import { createTheme } from "react-data-table-component";
import { Constants } from "@/constant";
import CustomPagination from "@/components/ui/CustomPagination";

const ReactDataTable = dynamic(() => import("react-data-table-component"), {
  ssr: false,
});

type DataTableProps<T> = {
  keyField?: string;
  columns: TableColumn<T>[];
  data: T[];
  paginationServer?: boolean;
  paginationTotalRows?: number;
  paginationPerPage?: number;
  paginationDefaultPage?: number;
  onChangePage?: (page: number, totalRows: number) => void;
  onChangeRowsPerPage?: (perPage: number, page: number) => void;
  paginationRowsPerPageOptions?: number[];
  selectableRows?: boolean;
  clearSelectedRows?: boolean;
  persistTableHead?: boolean;
  onSelectedRowsChange?: (selected: { allSelected: boolean; selectedCount: number; selectedRows: T[] }) => void;
  customPaginationComponent?: React.ReactNode;
  useCustomPagination?: boolean;
  totalRecords?: number;
  filteredRecords?: number;
  useUrlParams?: boolean;
  onRowClicked?: (row: T, event: React.MouseEvent) => void;
  highlightOnHover?: boolean;
  pagination?: boolean;
  totalReports?: boolean;
  totalRow?: React.ReactNode;
};

const POS_LIGHT_THEME = "posDashboardLight";
const POS_DARK_THEME = "posDashboardDark";

createTheme(
  POS_LIGHT_THEME,
  {
    divider: {
      default: "#F4F5F5",
    },
  },
  "light"
);

createTheme(
  POS_DARK_THEME,
  {
    divider: {
      default: "#616161",
    },
  },
  "dark"
);

const CommonDataTable = <T,>({ keyField, columns, data, paginationServer, paginationTotalRows, paginationPerPage, paginationDefaultPage, onChangePage, onChangeRowsPerPage, paginationRowsPerPageOptions, selectableRows = false, clearSelectedRows = false, persistTableHead = true, onSelectedRowsChange, customPaginationComponent, useCustomPagination = false, totalRecords, filteredRecords, useUrlParams = false, onRowClicked, highlightOnHover, pagination, totalReports = false, totalRow }: DataTableProps<T>) => {
  const { resolvedTheme } = useTheme();
  const [currentPage, setCurrentPage] = React.useState(paginationDefaultPage || 1);
  const [currentPerPage, setCurrentPerPage] = React.useState(paginationPerPage || 10);

  const safeData = Array.isArray(data) ? data : [];


  // Get paginated data for custom pagination
  // If useUrlParams is true, data is already paginated from server, so don't slice
  const paginatedData = React.useMemo(() => {
    if (!useCustomPagination) return safeData;
    if (useUrlParams) return safeData; // Server-side pagination, data is already paginated

    const startIndex = (currentPage - 1) * currentPerPage;
    const endIndex = startIndex + currentPerPage;
    return safeData.slice(startIndex, endIndex);
  }, [safeData, currentPage, currentPerPage, useCustomPagination, useUrlParams]);

  // Handle page changes
  const handlePageChange = (page: number, totalRows?: number) => {
    setCurrentPage(page);
    if (onChangePage && totalRows) {
      onChangePage(page, totalRows);
    }
  };

  // Handle rows per page changes
  const handleRowsPerPageChange = (perPage: number, page?: number) => {
    setCurrentPerPage(perPage);
    setCurrentPage(1); // Reset to first page when changing rows per page
    if (onChangeRowsPerPage && page) {
      onChangeRowsPerPage(perPage, page);
    }
  };

  // Custom pagination handlers
  const handleCustomPageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleCustomRowsPerPageChange = (perPage: number) => {
    setCurrentPerPage(perPage);
    setCurrentPage(1);
  };

  // Reset page when data changes (only for client-side pagination)
  React.useEffect(() => {
    if (!useUrlParams) {
      setCurrentPage(1);
    }
  }, [safeData.length, useUrlParams]);

  // Sync with pagination props when using server-side pagination
  React.useEffect(() => {
    if (useUrlParams && paginationDefaultPage) {
      setCurrentPage(paginationDefaultPage);
    }
    if (useUrlParams && paginationPerPage) {
      setCurrentPerPage(paginationPerPage);
    }
  }, [useUrlParams, paginationDefaultPage, paginationPerPage]);

  const customStyles = {
    table: {
      style: {
        backgroundColor: resolvedTheme === "dark" ? "#1e293b" : "#ffffff",
        color: resolvedTheme === "dark" ? "#ffffff" : "#000000",
      },
    },
    headRow: {
      style: {
        backgroundColor: resolvedTheme === "dark" ? "#333333" : "#F7F7F7",
        color: resolvedTheme === "dark" ? "#ffffff" : "#171B23",
        borderBottomColor: resolvedTheme === "dark" ? "#616161" : "#F4F5F5",
      },
    },
    headCells: {
      style: {
        color: resolvedTheme === "dark" ? "#ffffff" : "#171B23",
        fontWeight: 500,
        fontSize: "14px",
        lineHeight: "20px",
        fontFamily: "var(--font-inter-tight)",
      },
    },
    rows: {
      style: {
        backgroundColor: resolvedTheme === "dark" ? "#1F1F1F" : "#ffffff",
        color: resolvedTheme === "dark" ? "#EEEEEE" : "#31394D",
        fontSize: "13px",
        fontFamily: "var(--font-inter-tight)",
        fontWeight: 400,
        lineHeight: "100%",
        letterSpacing: "-0.02em",
      },
      highlightOnHoverStyle: {
        backgroundColor: resolvedTheme === "dark" ? "#2d3748" : "#f3f4f6", // dark: bg-gray-700 approx, light: bg-gray-100
        color: resolvedTheme === "dark" ? "#ffffff" : "#000000",
        transitionDuration: '0.1s',
        borderBottomColor: resolvedTheme === "dark" ? "#616161" : "#F4F5F5",
        outline: 'none',
        cursor: 'pointer',
      },
    },
    // cells: {
    //   style: {
    //     color: resolvedTheme === "dark" ? "#e2e8f0" : "#353535",
    //     fontSize: "13px",
    //     fontFamily: "var(--font-inter-tight)",
    //     fontWeight: 400,
    //     lineHeight: "100%",
    //     letterSpacing: "-0.02em",
    //     borderBottomColor: resolvedTheme === "dark" ? "#616161" : "#F4F5F5",
    //   },
    // },
    pagination: {
      style: {
        backgroundColor: resolvedTheme === "dark" ? "#1e293b" : "#ffffff",
        color: resolvedTheme === "dark" ? "#ffffff" : "#000000",
        borderTopColor: resolvedTheme === "dark" ? "#334155" : "#e2e8f0",
      },
    },
    noData: {
      style: {
        backgroundColor: resolvedTheme === "dark" ? "#1F1F1F" : "#ffffff",
        color: resolvedTheme === "dark" ? "#EEEEEE" : "#31394D",
      },
    },
  };

  const NoDataComponent = () => (
    <div
      style={{
        paddingTop: "20px",
        paddingBottom: "20px",
        textAlign: "center",
        backgroundColor: resolvedTheme === "dark" ? "#1F1F1F" : "#ffffff",
        color: resolvedTheme === "dark" ? "#EEEEEE" : "#31394D",
        fontSize: "14px",
        fontFamily: "var(--font-poppins)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "4px",
      }}
    >
      <img
        src={Constants.assetsIcon.assets.noDataFound.src}
        alt="No data found"
        style={{
          width: "120px",
          height: "120px",
          objectFit: "contain",
        }}
      />
      <h2 className="text-[20px] font-semibold">No Data Found!.</h2>
    </div>
  );

  return (
    <React.Suspense
      fallback={
        <div className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
            <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      }
    >
      <div>
        <ReactDataTable
          keyField={keyField ? keyField : "id"}
          columns={columns as TableColumn<unknown>[]}
          data={useCustomPagination ? (paginatedData as unknown[]) : (safeData as unknown[])}
          pagination={pagination !== undefined ? pagination : !useCustomPagination}
          paginationServer={paginationServer}
          paginationTotalRows={paginationTotalRows}
          paginationPerPage={currentPerPage}
          paginationDefaultPage={paginationDefaultPage}
          paginationRowsPerPageOptions={paginationRowsPerPageOptions || [5, 10, 25, 50]}
          onChangePage={handlePageChange}
          onChangeRowsPerPage={handleRowsPerPageChange}
          selectableRows={selectableRows}
          clearSelectedRows={clearSelectedRows}
          persistTableHead={persistTableHead}
          onSelectedRowsChange={onSelectedRowsChange ? (selected) => onSelectedRowsChange({
            allSelected: selected.allSelected,
            selectedCount: selected.selectedCount,
            selectedRows: selected.selectedRows as T[]
          }) : undefined}
          onRowClicked={onRowClicked ? (row, e) => onRowClicked(row as T, e) : undefined}
          pointerOnHover={!!onRowClicked}
          highlightOnHover={highlightOnHover}
          className="rounded-md"
          customStyles={customStyles}
          theme={resolvedTheme === "dark" ? POS_DARK_THEME : POS_LIGHT_THEME}
          noDataComponent={<NoDataComponent />}
        />
        {totalReports && totalRow}
        {useCustomPagination && (
          <CustomPagination
            totalRecords={totalRecords || safeData.length}
            filteredRecords={filteredRecords || safeData.length}
            currentPage={currentPage}
            rowsPerPage={currentPerPage}
            onPageChange={handleCustomPageChange}
            onRowsPerPageChange={handleCustomRowsPerPageChange}
            rowsPerPageOptions={paginationRowsPerPageOptions || [5, 10, 25, 50]}
            useUrlParams={useUrlParams}
          />
        )}
        {customPaginationComponent && !useCustomPagination && (
          <div className="p-4">
            {customPaginationComponent}
          </div>
        )}
      </div>
    </React.Suspense>

  );
};

export default CommonDataTable;
