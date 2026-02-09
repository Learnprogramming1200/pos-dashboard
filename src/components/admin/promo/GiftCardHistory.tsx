"use client";

import React from "react";
import Image from "next/image";
import { UiWebComponents } from "@/components/ui";
import { CommonComponents } from "@/components/common";
import { GenerateCSV } from "@/components/ui/GenerateCSV";
import { GeneratePDF } from "@/components/ui/GeneratePDF";
import { BusinessOwnerReportTypes } from "@/types/superadmin";
import { Mail, MessageSquare } from "lucide-react";
import type { GiftCardHistory } from "@/types/gift-card-history";
import { Constants } from "@/constant";

type CSVColumn<T> = BusinessOwnerReportTypes.CSVColumn<T>;
type PDFColumn<T> = BusinessOwnerReportTypes.PDFColumn<T>;
import {
  giftCardHistoryTitle,
  giftCardIdLabel,
  giftCardNumberHistoryLabel,
  assignedCustomerLabel,
  issuedDateLabel,
  expiryDateLabel,
  giftCardValueHistoryLabel,
  usedAmountLabel,
  remainingBalanceLabel,
  redemptionDatesLabel,
  sentViaLabel,
  giftCardHistoryStatusLabel,
  handledByGiftCardLabel,
  remarksGiftCardLabel,
  activeGiftCardStatus,
  usedGiftCardStatus,
  expiredGiftCardStatus,
  allGiftCardStatuses,
  giftCardSearchPlaceholder,
  exportButton,
} from "@/constant/admin";

const historyColumns = () => [
  { name: giftCardIdLabel, selector: (row: GiftCardHistory) => row.giftCardId, sortable: true, width: "10%" },
  { name: giftCardNumberHistoryLabel, selector: (row: GiftCardHistory) => row.giftCardNumber, sortable: true, width: "10%" },
  { name: assignedCustomerLabel, selector: (row: GiftCardHistory) => row.assignedCustomerName, sortable: true, width: "12%" },
  { 
    name: issuedDateLabel, 
    selector: (row: GiftCardHistory) => new Date(row.issuedDate).toLocaleDateString(), 
    cell: (row: GiftCardHistory) => (
      <span className="text-sm text-textMain dark:text-white">
        {new Date(row.issuedDate).toLocaleDateString()}
      </span>
    ),
    sortable: true, 
    width: "10%" 
  },
  { 
    name: expiryDateLabel, 
    selector: (row: GiftCardHistory) => new Date(row.expiryDate).toLocaleDateString(), 
    cell: (row: GiftCardHistory) => (
      <span className="text-sm text-textMain dark:text-white">
        {new Date(row.expiryDate).toLocaleDateString()}
      </span>
    ),
    sortable: true, 
    width: "10%" 
  },
  { 
    name: giftCardValueHistoryLabel, 
    selector: (row: GiftCardHistory) => row.giftCardValue.toFixed(2), 
    cell: (row: GiftCardHistory) => (
      <span className="text-sm text-textMain dark:text-white">
        {row.giftCardValue.toFixed(2)}
      </span>
    ),
    sortable: true, 
    width: "10%" 
  },
  { 
    name: usedAmountLabel, 
    selector: (row: GiftCardHistory) => row.usedAmount.toFixed(2), 
    cell: (row: GiftCardHistory) => (
      <span className="text-sm text-textMain dark:text-white">
        {row.usedAmount.toFixed(2)}
      </span>
    ),
    sortable: true, 
    width: "10%" 
  },
  { 
    name: remainingBalanceLabel, 
    selector: (row: GiftCardHistory) => row.remainingBalance.toFixed(2), 
    cell: (row: GiftCardHistory) => (
      <span className="text-sm text-textMain dark:text-white">
        {row.remainingBalance.toFixed(2)}
      </span>
    ),
    sortable: true, 
    width: "10%" 
  },
  {
    name: redemptionDatesLabel,
    selector: (row: GiftCardHistory) => row.redemptionDates?.length ? row.redemptionDates.map(d => new Date(d).toLocaleDateString()).join(", ") : "-",
    cell: (row: GiftCardHistory) => (
      <span className="text-sm text-textMain dark:text-white">
        {row.redemptionDates?.length ? row.redemptionDates.map(d => new Date(d).toLocaleDateString()).join(", ") : "-"}
      </span>
    ),
    sortable: false,
    width: "10%",
  },
  {
    name: sentViaLabel,
    selector: (row: GiftCardHistory) => row.sentVia?.join(", ") || "-",
    cell: (row: GiftCardHistory) => (
      <div className="flex gap-1">
        {row.sentVia?.includes("Email") && <Mail className="w-4 h-4 text-blue-500" />}
        {row.sentVia?.includes("WhatsApp") && <MessageSquare className="w-4 h-4 text-green-500" />}
        {!row.sentVia?.length && <span className="text-sm text-textMain dark:text-white">-</span>}
      </div>
    ),
    sortable: false,
    width: "8%",
  },
  {
    name: giftCardHistoryStatusLabel,
    selector: (row: GiftCardHistory) => row.status,
    cell: (row: GiftCardHistory) => (
      <UiWebComponents.Badge 
        className={
          row.status === "Active" 
            ? "bg-success text-white" 
            : row.status === "Used" 
            ? "bg-info text-white" 
            : "bg-warning text-white"
        }
      >
        {row.status}
      </UiWebComponents.Badge>
    ),
    sortable: true,
    width: "8%",
  },
  { 
    name: handledByGiftCardLabel, 
    selector: (row: GiftCardHistory) => row.handledBy, 
    cell: (row: GiftCardHistory) => (
      <span className="text-sm text-textMain dark:text-white">
        {row.handledBy}
      </span>
    ),
    sortable: true, 
    width: "10%" 
  },
  { 
    name: remarksGiftCardLabel, 
    selector: (row: GiftCardHistory) => row.remarks || "-", 
    cell: (row: GiftCardHistory) => (
      <span className="text-sm text-textMain dark:text-white">
        {row.remarks || "-"}
      </span>
    ),
    sortable: false, 
    width: "12%" 
  },
];

export default function GiftCardHistory() {
  // Static empty data - page is static as requested
  const [history] = React.useState<GiftCardHistory[]>([]);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusHistoryFilter, setStatusHistoryFilter] = React.useState("All");

  // Status history options
  const statusHistoryOptions = React.useMemo(
    () => [
      { name: allGiftCardStatuses, value: "All" },
      { name: activeGiftCardStatus, value: "Active" },
      { name: usedGiftCardStatus, value: "Used" },
      { name: expiredGiftCardStatus, value: "Expired" },
    ],
    []
  );

  // Filtered history data
  const filteredHistory = React.useMemo(() => {
    if (!history || !Array.isArray(history)) {
      return [];
    }

    let filtered = history;
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase().trim();
      filtered = filtered.filter((item) => {
        return (
          (item.giftCardNumber && item.giftCardNumber.toLowerCase().includes(searchLower)) ||
          (item.assignedCustomerName && item.assignedCustomerName.toLowerCase().includes(searchLower)) ||
          (item.giftCardId && item.giftCardId.toLowerCase().includes(searchLower))
        );
      });
    }
    if (statusHistoryFilter !== "All") {
      filtered = filtered.filter((item) => item.status === statusHistoryFilter);
    }
    return filtered;
  }, [history, searchTerm, statusHistoryFilter]);

  // CSV and PDF export columns
  const exportColumns = React.useMemo(() => {
    const csvColumns: CSVColumn<GiftCardHistory>[] = [
      {
        key: 'giftCardId',
        label: giftCardIdLabel,
        accessor: (row) => row.giftCardId || '-'
      },
      {
        key: 'giftCardNumber',
        label: giftCardNumberHistoryLabel,
        accessor: (row) => row.giftCardNumber || '-'
      },
      {
        key: 'assignedCustomerName',
        label: assignedCustomerLabel,
        accessor: (row) => row.assignedCustomerName || '-'
      },
      {
        key: 'issuedDate',
        label: issuedDateLabel,
        accessor: (row) => new Date(row.issuedDate).toLocaleDateString()
      },
      {
        key: 'expiryDate',
        label: expiryDateLabel,
        accessor: (row) => new Date(row.expiryDate).toLocaleDateString()
      },
      {
        key: 'giftCardValue',
        label: giftCardValueHistoryLabel,
        accessor: (row) => row.giftCardValue.toFixed(2)
      },
      {
        key: 'usedAmount',
        label: usedAmountLabel,
        accessor: (row) => row.usedAmount.toFixed(2)
      },
      {
        key: 'remainingBalance',
        label: remainingBalanceLabel,
        accessor: (row) => row.remainingBalance.toFixed(2)
      },
      {
        key: 'redemptionDates',
        label: redemptionDatesLabel,
        accessor: (row) => row.redemptionDates?.length ? row.redemptionDates.map(d => new Date(d).toLocaleDateString()).join(", ") : "-"
      },
      {
        key: 'sentVia',
        label: sentViaLabel,
        accessor: (row) => row.sentVia?.join(", ") || "-"
      },
      {
        key: 'status',
        label: giftCardHistoryStatusLabel,
        accessor: (row) => row.status || '-'
      },
      {
        key: 'handledBy',
        label: handledByGiftCardLabel,
        accessor: (row) => row.handledBy || '-'
      },
      {
        key: 'remarks',
        label: remarksGiftCardLabel,
        accessor: (row) => row.remarks || "-"
      }
    ];

    const pdfColumns: PDFColumn<GiftCardHistory>[] = [
      {
        key: 'giftCardId',
        label: giftCardIdLabel,
        accessor: (row) => row.giftCardId || '-',
        width: 20
      },
      {
        key: 'giftCardNumber',
        label: giftCardNumberHistoryLabel,
        accessor: (row) => row.giftCardNumber || '-',
        width: 25
      },
      {
        key: 'assignedCustomerName',
        label: assignedCustomerLabel,
        accessor: (row) => row.assignedCustomerName || '-',
        width: 30
      },
      {
        key: 'issuedDate',
        label: issuedDateLabel,
        accessor: (row) => new Date(row.issuedDate).toLocaleDateString(),
        width: 25
      },
      {
        key: 'expiryDate',
        label: expiryDateLabel,
        accessor: (row) => new Date(row.expiryDate).toLocaleDateString(),
        width: 25
      },
      {
        key: 'giftCardValue',
        label: giftCardValueHistoryLabel,
        accessor: (row) => row.giftCardValue.toFixed(2),
        width: 20
      },
      {
        key: 'usedAmount',
        label: usedAmountLabel,
        accessor: (row) => row.usedAmount.toFixed(2),
        width: 20
      },
      {
        key: 'remainingBalance',
        label: remainingBalanceLabel,
        accessor: (row) => row.remainingBalance.toFixed(2),
        width: 25
      },
      {
        key: 'redemptionDates',
        label: redemptionDatesLabel,
        accessor: (row) => row.redemptionDates?.length ? row.redemptionDates.map(d => new Date(d).toLocaleDateString()).join(", ") : "-",
        width: 30
      },
      {
        key: 'sentVia',
        label: sentViaLabel,
        accessor: (row) => row.sentVia?.join(", ") || "-",
        width: 20
      },
      {
        key: 'status',
        label: giftCardHistoryStatusLabel,
        accessor: (row) => row.status || '-',
        width: 20
      },
      {
        key: 'handledBy',
        label: handledByGiftCardLabel,
        accessor: (row) => row.handledBy || '-',
        width: 25
      },
      {
        key: 'remarks',
        label: remarksGiftCardLabel,
        accessor: (row) => row.remarks || "-",
        width: 30
      }
    ];

    return { csvColumns, pdfColumns };
  }, []);

  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-lg sm:text-lg md:text-xl lg:text-2xl font-medium text-textMain dark:text-white truncate">
            {giftCardHistoryTitle}
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-textSmall pt-2">
            View and manage gift card transaction history
          </p>
        </div>
      </div>

      {/* History Section */}
      <div className="bg-white dark:bg-darkFilterbar rounded-[4px] h-full w-full mt-4 overflow-hidden">
        {/* Filters */}
        <CommonComponents.CommonFilterBar
          actionFilter="All"
          onActionFilterChange={() => {}}
          actionOptions={[]}
          activeStatusFilter="All"
          onActiveStatusFilterChange={() => {}}
          activeStatusOptions={[]}
          selectedCount={0}
          onApply={() => {}}
          categoryFilter={statusHistoryFilter}
          onCategoryFilterChange={(value: string) => setStatusHistoryFilter(value)}
          categoryOptions={statusHistoryOptions}
          statusFilter="All"
          onStatusFilterChange={() => {}}
          statusOptions={[]}
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
          showActionSection={false}
          renderExports={
            <>
              <GenerateCSV
                data={filteredHistory}
                columns={exportColumns.csvColumns}
                filename={`gift-card-history-${new Date().toISOString().split('T')[0]}.csv`}
                onExport={() => {
                  UiWebComponents.SwalHelper.success({ text: 'CSV exported successfully.' });
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
              </GenerateCSV>
              <GeneratePDF
                data={filteredHistory}
                columns={exportColumns.pdfColumns}
                filename={`gift-card-history-${new Date().toISOString().split('T')[0]}.pdf`}
                title="Gift Card History Report"
                orientation="landscape"
                onExport={() => {
                  UiWebComponents.SwalHelper.success({ text: 'PDF exported successfully.' });
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
              </GeneratePDF>
            </>
          }
        />

        <div>
          <CommonComponents.DataTable
            columns={historyColumns()}
            data={filteredHistory}
            useCustomPagination={true}
            totalRecords={history.length}
            filteredRecords={filteredHistory.length}
            paginationPerPage={10}
            paginationRowsPerPageOptions={[5, 10, 25, 50]}
          />
        </div>
      </div>
    </>
  );
}

