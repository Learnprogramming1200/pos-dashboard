"use client";
import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from 'next/image';
import { FaDownload } from 'react-icons/fa';
import { ServerActions } from "@/lib";
import { Constants } from "@/constant";
import { customHooks } from "@/hooks";
import { WebComponents } from "@/components";
import { SuperAdminTypes, PaginationType } from "@/types";
// Helper function to format currency with symbol and position
const formatCurrency = (
  amount: number | undefined | null,
  currency: SuperAdminTypes.SettingTypes.CurrencySettingsTypes.CurrencyData
): string => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return "-";
  }
  const formattedAmount = amount.toFixed(2);
  const symbol = currency?.symbol || "";
  if (!symbol) {
    return formattedAmount;
  }
  // Handle position dynamically - default to left if not specified
  const position = currency?.position?.trim() || "Left";
  const isRight = position.toLowerCase() === "right";
  return isRight ? `${formattedAmount}${symbol}` : `${symbol}${formattedAmount}`;
};
// Helper function to format discount
const formatDiscount = (
  discount: { value: number; type: string; amount: number } | null,
  currency: SuperAdminTypes.SettingTypes.CurrencySettingsTypes.CurrencyData
): string => {
  if (!discount) return "-";

  if (discount.type?.toLowerCase() === "percentage") {
    return `${discount.value}%`;
  } else {
    return formatCurrency(discount.amount, currency);
  }
};

// Helper function to format duration
const formatDuration = (duration: number | null | undefined, durationUnit: string | null | undefined): string => {
  if (duration === null || duration === undefined) return "-";
  const unit = durationUnit || "month";
  return `${duration} ${unit === "monthly" ? "Months" : unit === "yearly" ? "Years" : "Days"}`;
};

// Helper function to get invoice number
const getInvoiceNumber = (invoice: { paymentId?: string; providerOrderId?: string; providerPaymentId?: string } | null): string => {
  if (!invoice) return "-";
  if (invoice.paymentId) return `INV-${invoice.paymentId}`;
  if (invoice.providerOrderId) return `INV-${invoice.providerOrderId}`;
  if (invoice.providerPaymentId) return `INV-${invoice.providerPaymentId}`;
  return "-";
};
export default function BusinessOwnerReportsPage({ initialBusinessOwnerReports, initialPagination }: {
  readonly initialBusinessOwnerReports: SuperAdminTypes.BusinessOwnerReportTypes.BusinessOwnerReport[];
  readonly initialPagination: PaginationType.Pagination;
}) {
  const [businessOwnerReports, setBusinessOwnerReports] = React.useState<SuperAdminTypes.BusinessOwnerReportTypes.BusinessOwnerReport[]>(initialBusinessOwnerReports);
  const [pagination, setPagination] = React.useState<PaginationType.Pagination>(initialPagination);
  const [downloadData, setDownloadData] = React.useState<SuperAdminTypes.BusinessOwnerReportTypes.BusinessOwnerReport[]>([]);
  const [selectedRows, setSelectedRows] = React.useState<SuperAdminTypes.BusinessOwnerReportTypes.BusinessOwnerReport[]>([]);
  const [clearSelectedRows, setClearSelectedRows] = React.useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { searchTerm, setSearchTerm, statusFilter, setStatusFilter, filteredData } = customHooks.useListFilters<SuperAdminTypes.BusinessOwnerReportTypes.BusinessOwnerReport>(
    businessOwnerReports,
  );
  // Sync state with props when URL params change (server re-fetches data)
  React.useEffect(() => {
    setBusinessOwnerReports(initialBusinessOwnerReports);
    if (initialPagination) {
      setPagination(initialPagination);
    }
  }, [initialBusinessOwnerReports]);

  // Define columns for DataTable using createColumns
  const columns = React.useMemo(() => WebComponents.WebCommonComponents.CommonComponents.createColumns<SuperAdminTypes.BusinessOwnerReportTypes.BusinessOwnerReport>({
    fields: [
      {
        name: "Business Owner",
        selector: (row) => row.businessOwner?.name || "-",
        sortable: true
      },
      {
        name: "Plan",
        selector: (row) => row.plan?.name || "-",
        sortable: true
      },
      {
        name: "Payment Method",
        selector: (row) => row.paymentMethod || "-",
        sortable: true
      },
      {
        name: "Duration",
        selector: (row) => formatDuration(row.duration, row.durationUnit),
        sortable: true
      },
      {
        name: "Discount",
        selector: (row) => formatDiscount(row.discount, row?.currency as SuperAdminTypes.SettingTypes.CurrencySettingsTypes.CurrencyData),
        sortable: true
      },
      {
        name: "Tax Amount",
        selector: (row) => row.tax ? formatCurrency(row.tax.amount, row.currency as SuperAdminTypes.SettingTypes.CurrencySettingsTypes.CurrencyData) : "-",
        sortable: true
      },
      {
        name: "Subscribe Date",
        selector: (row) => ServerActions.DatePretier.formatDateStringToLocale(row.subscribeDate),
        sortable: true
      },
      {
        name: "Expiry Date",
        selector: (row) => ServerActions.DatePretier.formatDateStringToLocale(row.expiryDate),
        sortable: true
      },
      {
        name: "Status",
        selector: (row) => row.status || "-",
        sortable: true
      },
      {
        name: "Invoice",
        selector: (row) => getInvoiceNumber(row.invoice),
        cell: (row) => {
          if (!row.invoice || getInvoiceNumber(row.invoice) === "-") {
            return <span className="text-gray-500 dark:text-gray-400">-</span>;
          }
          return (
            <WebComponents.UiComponents.UiWebComponents.Button
              size="icon"
              variant="ghost"
              onClick={() => {
                // Handle invoice download here
                WebComponents.UiComponents.UiWebComponents.SwalHelper.info({ text: 'Invoice download functionality to be implemented.' });
              }}
              className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/20"
              title={`Download ${getInvoiceNumber(row.invoice)}`}
            >
              <FaDownload className="w-4 h-4" />
            </WebComponents.UiComponents.UiWebComponents.Button>
          );
        },
        sortable: true
      },
    ],
  }), []);

  // Export columns configuration
  const exportColumns = React.useMemo(() => {
    return WebComponents.WebCommonComponents.CommonComponents.generateExportColumns<SuperAdminTypes.BusinessOwnerReportTypes.BusinessOwnerReport>([
      { key: 'businessOwner', label: 'Business Owner', accessor: (row) => row.businessOwner?.name || "-", pdfWidth: 15 },
      { key: 'plan', label: 'Plan', accessor: (row) => row.plan?.name || "-", pdfWidth: 10 },
      { key: 'paymentMethod', label: 'Payment Method', accessor: (row) => row.paymentMethod || "-", pdfWidth: 10 },
      { key: 'duration', label: 'Duration', accessor: (row) => formatDuration(row.duration, row.durationUnit), pdfWidth: 10 },
      { key: 'discount', label: 'Discount', accessor: (row) => formatDiscount(row.discount, row.currency as SuperAdminTypes.SettingTypes.CurrencySettingsTypes.CurrencyData), pdfWidth: 10 },
      { key: 'tax', label: 'Tax Amount', accessor: (row) => row.tax ? formatCurrency(row.tax.amount, row.currency as SuperAdminTypes.SettingTypes.CurrencySettingsTypes.CurrencyData) : "-", pdfWidth: 10 },
      { key: 'subscribeDate', label: 'Subscribe Date', accessor: (row) => ServerActions.DatePretier.formatDateStringToLocale(row.subscribeDate), pdfWidth: 10 },
      { key: 'expiryDate', label: 'Expiry Date', accessor: (row) => ServerActions.DatePretier.formatDateStringToLocale(row.expiryDate), pdfWidth: 10 },
      { key: 'status', label: 'Status', accessor: (row) => row.status || "-", pdfWidth: 10 },
      { key: 'invoice', label: 'Invoice', accessor: (row) => getInvoiceNumber(row.invoice), pdfWidth: 15 }
    ]);
  }, []);

  const clearSelectedData = () => {
    setClearSelectedRows(prev => !prev);
    setSelectedRows([]);
    router.refresh();
  };

  const downloadPdf = async (): Promise<any[]> => {
    return await ServerActions.HandleFunction.handleDownloadCommon({
      selectedRows,
      searchParams,
      bulkGetSelectedAction: ServerActions.ServerActionslib.bulkGetSelectedBusinessOwnerReportsAction,
      bulkGetAllAction: ServerActions.ServerActionslib.bulkGetBusinessOwnerReportsAction,
      setDownloadData,
    });
  };
  return (
    <>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-2">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">{Constants.superadminConstants.businessownerreportheading}</h1>
          <p className="text-sm text-gray-500">{Constants.superadminConstants.businessownerreportbio}</p>
        </div>
      </div>
      {/* Filters and Table */}
      <div className="bg-white dark:bg-darkFilterbar rounded-[4px] h-full w-full mt-4">
        {/* Common Filter Bar */}
        <WebComponents.WebCommonComponents.CommonComponents.CommonFilterBar
          actionFilter="All"
          onActionFilterChange={() => { }}
          actionOptions={[]}
          activeStatusFilter="All"
          onActiveStatusFilterChange={() => { }}
          activeStatusOptions={[]}
          selectedCount={0}
          onApply={() => { }}
          /* Category filter not needed here */
          categoryFilter="All"
          onCategoryFilterChange={() => { }}
          categoryOptions={[]}
          showActionSection={false}
          showCategoryFilter={false}
          /* Status + Search tied to URL-driven state */
          statusFilter={statusFilter === "Active" ? Constants.superadminConstants.activeStatusFilter : statusFilter === "Inactive" ? Constants.superadminConstants.inactiveStatusFilter : Constants.superadminConstants.allStatusFilter}
          onStatusFilterChange={(value: string) => {
            const validValue = value === Constants.superadminConstants.activeStatusFilter ? "Active" :
              value === Constants.superadminConstants.inactiveStatusFilter ? "Inactive" : "All";
            setStatusFilter(validValue as "All" | "Active" | "Inactive");
          }}
          statusOptions={Constants.commonConstants.CommonFilterOptions.CommonStatusOptions}
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
          /* Reuse existing CSV/PDF export buttons */
          renderExports={
            <>
              <WebComponents.UiComponents.UiWebComponents.DownloadCSV
                data={downloadData}
                columns={exportColumns.csvColumns}
                filename={`business-owner-reports-${new Date().toISOString().split('T')[0]}.csv`}
                onExport={async () => {
                  const data = await downloadPdf();
                  WebComponents.UiComponents.UiWebComponents.SwalHelper.success({ text: 'CSV exported successfully.' });
                  clearSelectedData();
                  return data;
                }}
              >
                <button
                  type="button"
                  className="rounded-[4px] bg-[#ffffff] dark:bg-[#3A3A3A] border border-[#D8D9D9] border-opacity-50 font-interTight font-normal hover:bg-[#e0e0e0] dark:hover:bg-[#4A4A4A] shadow-sm transition-colors duration-200 cursor-pointer flex-shrink-0 sm:px-1 md:px-2 lg:px-2 xl:px-2 2xl:px-2 px-2 py-[6.9px]"
                  aria-label="Download CSV"
                  title="Download CSV"
                  disabled={businessOwnerReports.length === 0}
                >
                  <Image src={Constants.assetsIcon.assets.csv} alt="CSV" width={28} height={28} className="w-5 h-5 sm:w-6 sm:h-6 md:w-6 md:h-6 lg:w-7 lg:h-7 xl:w-7 xl:h-7 2xl:w-7 2xl:h-7" />
                </button>
              </WebComponents.UiComponents.UiWebComponents.DownloadCSV>
              <WebComponents.UiComponents.UiWebComponents.DownloadPDF
                data={downloadData}
                columns={exportColumns.pdfColumns}
                filename={`business-owner-reports-${new Date().toISOString().split('T')[0]}.pdf`}
                title="Business Owner Reports"
                orientation="landscape"
                onExport={async () => {
                  const data = await downloadPdf();
                  WebComponents.UiComponents.UiWebComponents.SwalHelper.success({ text: 'PDF exported successfully.' });
                  clearSelectedData();
                  return data;
                }}
              >
                <button
                  type="button"
                  className="rounded-[4px] bg-[#ffffff] dark:bg-[#3A3A3A] border border-[#D8D9D9] border-opacity-50 font-interTight font-normal hover:bg-[#e0e0e0] dark:hover:bg-[#4A4A4A] shadow-sm transition-colors duration-200 cursor-pointer flex-shrink-0 sm:px-1 md:px-2 lg:px-2 xl:px-2 2xl:px-2 px-2 py-[6.9px]"
                  aria-label="Download PDF"
                  title="Download PDF"
                  disabled={businessOwnerReports.length === 0}
                >
                  <Image src={Constants.assetsIcon.assets.pdf} alt="PDF" width={28} height={28} className="w-5 h-5 sm:w-6 sm:h-6 md:w-6 md:h-6 lg:w-7 lg:h-7 xl:w-7 xl:h-7 2xl:w-7 2xl:h-7" />
                </button>
              </WebComponents.UiComponents.UiWebComponents.DownloadPDF>
            </>
          }pbusiness-owner
        />
        <div className=''>
          <WebComponents.WebCommonComponents.CommonComponents.DataTable
            columns={columns}
            data={filteredData}
            selectableRows
            clearSelectedRows={clearSelectedRows}
            onSelectedRowsChange={({ selectedRows }) => setSelectedRows(selectedRows)}
            useCustomPagination={true}
            totalRecords={pagination.totalItems}
            filteredRecords={pagination.totalItems}
            paginationPerPage={pagination.itemsPerPage}
            paginationDefaultPage={pagination.currentPage}
            paginationRowsPerPageOptions={[5, 10, 25, 50]}
            useUrlParams={true}
          />
        </div>
      </div>
    </>
  );
}
