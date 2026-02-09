"use client";

import React from "react";
import Image from "next/image";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { WebComponents } from "@/components";
import { Constants } from "@/constant";
import { AdminTypes } from "@/types";

interface Props {
  initialData: AdminTypes.loyaltyPointHistoryTypes.LoyaltyPointsHistory[];
  initialPagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Format date as "Mon DD, YYYY"
const formatDate = (dateString: string) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = months[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  return `${month} ${day}, ${year}`;
};

export default function LoyaltyPointsHistory({
  initialData,
  initialPagination,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [history, setHistory] = React.useState<AdminTypes.loyaltyPointHistoryTypes.LoyaltyPointsHistory[]>(initialData);
  const [pagination, setPagination] = React.useState(initialPagination);
  const [searchTerm, setSearchTerm] = React.useState(searchParams.get("search") || "");
  const [typeFilter, setTypeFilter] = React.useState(searchParams.get("transactionType") || "All");

  React.useEffect(() => {
    setHistory(initialData);
    setPagination(initialPagination);
  }, [initialData, initialPagination]);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      handleSearch(searchTerm);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const handleSearch = (term: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (term) {
      params.set("search", term);
    } else {
      params.delete("search");
    }
    params.set("page", "1");
    router.push(pathname + "?" + params.toString(), { scroll: false });
  };

  const handleFilterChange = (value: string) => {
    setTypeFilter(value);
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== 'All') {
      params.set("transactionType", value);
    } else {
      params.delete("transactionType");
    }
    params.set("page", "1");
    router.push(pathname + "?" + params.toString(), { scroll: false });
  };


  const historyColumns = React.useMemo(() => [
    {
      name: "Customer name",
      selector: (row: AdminTypes.loyaltyPointHistoryTypes.LoyaltyPointsHistory) => row.customer.customerName,
      sortable: true,
      width: "18%",
      cell: (row: AdminTypes.loyaltyPointHistoryTypes.LoyaltyPointsHistory) => (
        <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
          {row.customer.customerName}
        </span>
      ),
    },
    {
      name: "Email",
      selector: (row: AdminTypes.loyaltyPointHistoryTypes.LoyaltyPointsHistory) => row.customer.customerEmail,
      sortable: true,
      width: "18%",
      cell: (row: AdminTypes.loyaltyPointHistoryTypes.LoyaltyPointsHistory) => (
        <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
          {row.customer.customerEmail || "-"}
        </span>
      ),
    },
    {
      name: "Transaction Date",
      selector: (row: AdminTypes.loyaltyPointHistoryTypes.LoyaltyPointsHistory) => row.transactiondateTime,
      sortable: true,
      width: "18%",
      cell: (row: AdminTypes.loyaltyPointHistoryTypes.LoyaltyPointsHistory) => (
        <span className="text-sm text-gray-900 dark:text-white">
          {formatDate(row.transactiondateTime)}
        </span>
      ),
    },
    {
      name: "Point",
      selector: (row: AdminTypes.loyaltyPointHistoryTypes.LoyaltyPointsHistory) =>
        row.transactionType === 'accrual'
          ? row.earnedPoints.toString()
          : row.redeemedPoints.toString(),
      sortable: true,
      width: "15%",
      cell: (row: AdminTypes.loyaltyPointHistoryTypes.LoyaltyPointsHistory) => {
        const isAccrual = row.transactionType === 'accrual';
        const points = isAccrual ? row.earnedPoints : row.redeemedPoints;
        return (
          <span
            className={`text-sm font-medium ${isAccrual
              ? "text-green-600 dark:text-green-400"
              : "text-red-600 dark:text-red-400"
              }`}
          >
            {isAccrual ? '+' : '-'}{points}
          </span>
        );
      },
    },
    {
      name: "Remaining Point",
      selector: (row: AdminTypes.loyaltyPointHistoryTypes.LoyaltyPointsHistory) => row.balancePoints.toString(),
      sortable: true,
      width: "15%",
      cell: (row: AdminTypes.loyaltyPointHistoryTypes.LoyaltyPointsHistory) => (
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {row.balancePoints}
        </span>
      ),
    },
    {
      name: "Transaction Type",
      selector: (row: AdminTypes.loyaltyPointHistoryTypes.LoyaltyPointsHistory) => row.transactionType,
      sortable: true,
      width: "15%",
      cell: (row: AdminTypes.loyaltyPointHistoryTypes.LoyaltyPointsHistory) => {
        const isRedemption = row.transactionType === "redemption";
        const statusKey = !isRedemption ? 'Earned' : 'Redeemed';

        return (
          <WebComponents.UiComponents.UiWebComponents.Badge className={`w-20 justify-center px-[2px] py-[2px] rounded-full text-sm ${Constants.commonConstants.statusColor[statusKey]}`}>
            {statusKey}
          </WebComponents.UiComponents.UiWebComponents.Badge>
        );
      },
    }
  ], []);

  // Export Columns
  const exportColumns = React.useMemo(() => {
    return {
      csvColumns: [
        {
          key: 'customerName',
          label: 'Customer',
          accessor: (row: AdminTypes.loyaltyPointHistoryTypes.LoyaltyPointsHistory) => row.customer.customerName || '-'
        },
        {
          key: 'customerEmail',
          label: 'Email',
          accessor: (row: AdminTypes.loyaltyPointHistoryTypes.LoyaltyPointsHistory) => row.customer.customerEmail || '-'
        },
        {
          key: 'date',
          label: 'Date',
          accessor: (row: AdminTypes.loyaltyPointHistoryTypes.LoyaltyPointsHistory) => formatDate(row.transactiondateTime)
        },
        {
          key: 'transactionType',
          label: 'Transaction Type',
          accessor: (row: AdminTypes.loyaltyPointHistoryTypes.LoyaltyPointsHistory) => row.transactionType || '-'
        },
        {
          key: 'points',
          label: 'Loyalty Points',
          accessor: (row: AdminTypes.loyaltyPointHistoryTypes.LoyaltyPointsHistory) =>
            row.transactionType === 'accrual'
              ? `+${row.earnedPoints}`
              : `-${row.redeemedPoints}`
        },
        {
          key: 'remainingPoints',
          label: 'Remaining Points',
          accessor: (row: AdminTypes.loyaltyPointHistoryTypes.LoyaltyPointsHistory) => row.balancePoints.toString()
        }
      ],
      pdfColumns: [
        {
          key: 'customerName',
          label: 'Customer',
          accessor: (row: AdminTypes.loyaltyPointHistoryTypes.LoyaltyPointsHistory) => row.customer.customerName || '-',
        },
        {
          key: 'date',
          label: 'Date',
          accessor: (row: AdminTypes.loyaltyPointHistoryTypes.LoyaltyPointsHistory) => formatDate(row.transactiondateTime)
        },
        {
          key: 'transactionType',
          label: 'Type',
          accessor: (row: AdminTypes.loyaltyPointHistoryTypes.LoyaltyPointsHistory) => row.transactionType || '-',
        },
        {
          key: 'points',
          label: 'Points',
          accessor: (row: AdminTypes.loyaltyPointHistoryTypes.LoyaltyPointsHistory) =>
            row.transactionType === 'accrual'
              ? `+${row.earnedPoints}`
              : `-${row.redeemedPoints}`
        },
        {
          key: 'remainingPoints',
          label: 'Remaining',
          accessor: (row: AdminTypes.loyaltyPointHistoryTypes.LoyaltyPointsHistory) => row.balancePoints.toString()
        }
      ]
    };
  }, []);

  // Transaction type options
  const transactionTypeOptions = React.useMemo(
    () => [
      { name: Constants.adminConstants.allTransactionTypes, value: "All" },
      { name: Constants.adminConstants.loyaltyHistoryEarned, value: "accrual" },
      { name: Constants.adminConstants.loyaltyHistoryRedeemed, value: "redemption" },
    ],
    []
  );

  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-lg sm:text-lg md:text-xl lg:text-2xl font-medium text-textMain dark:text-white truncate">
            {Constants.adminConstants.loyaltyHistoryTitle}
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-textSmall pt-2">
            {Constants.adminConstants.loyaltyPointsHistoryBio}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-darkFilterbar rounded-[4px] h-full w-full mt-4 overflow-hidden">
        {/* Filters */}
        <WebComponents.WebCommonComponents.CommonComponents.CommonFilterBar
          actionFilter="All"
          activeStatusFilter="All"
          categoryFilter={typeFilter}
          onCategoryFilterChange={handleFilterChange}
          categoryOptions={transactionTypeOptions}
          // Mapping "transactionType" concept to "Category" filter slot in the component
          statusFilter="All"
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
          showActionSection={false} // Hidden as no bulk actions
          showCategoryFilter={true}
          renderExports={
            <>
              <WebComponents.UiComponents.UiWebComponents.GenerateCSV
                data={history}
                columns={exportColumns.csvColumns}
                filename={`loyalty-points-history-${new Date().toISOString().split('T')[0]}.csv`}
                onExport={() => {
                  WebComponents.UiComponents.UiWebComponents.SwalHelper.success({ text: 'CSV exported successfully.' });
                }}
              >
                <button
                  type="button"
                  className="rounded-[4px] bg-[#ffffff] dark:bg-[#3A3A3A] border border-[#D8D9D9] border-opacity-50 font-interTight font-normal hover:bg-[#e0e0e0] dark:hover:bg-[#4A4A4A] shadow-sm transition-colors duration-200 cursor-pointer flex-shrink-0 sm:px-1 md:px-2 lg:px-2 xl:px-2 2xl:px-2 px-2 py-[6.9px]"
                  aria-label="Download CSV"
                  title="Download CSV"
                  disabled={history.length === 0}
                >
                  <Image src={Constants.assetsIcon.assets.csv} alt="CSV" width={28} height={28} className="w-5 h-5 sm:w-6 sm:h-6 md:w-6 md:h-6 lg:w-7 lg:h-7 xl:w-7 xl:h-7 2xl:w-7 2xl:h-7" />
                </button>
              </WebComponents.UiComponents.UiWebComponents.GenerateCSV>

              <WebComponents.UiComponents.UiWebComponents.GeneratePDF
                data={history}
                columns={exportColumns.pdfColumns}
                filename={`loyalty-points-history-${new Date().toISOString().split('T')[0]}.pdf`}
                title="Loyalty Points History Report"
                orientation="landscape"
                onExport={() => {
                  WebComponents.UiComponents.UiWebComponents.SwalHelper.success({ text: 'PDF exported successfully.' });
                }}
              >
                <button
                  type="button"
                  className="rounded-[4px] bg-[#ffffff] dark:bg-[#3A3A3A] border border-[#D8D9D9] border-opacity-50 font-interTight font-normal hover:bg-[#e0e0e0] dark:hover:bg-[#4A4A4A] shadow-sm transition-colors duration-200 cursor-pointer flex-shrink-0 sm:px-1 md:px-2 lg:px-2 xl:px-2 2xl:px-2 px-2 py-[6.9px]"
                  aria-label="Download PDF"
                  title="Download PDF"
                  disabled={history.length === 0}
                >
                  <Image src={Constants.assetsIcon.assets.pdf} alt="PDF" width={28} height={28} className="w-5 h-5 sm:w-6 sm:h-6 md:w-6 md:h-6 lg:w-7 lg:h-7 xl:w-7 xl:h-7 2xl:w-7 2xl:h-7" />
                </button>
              </WebComponents.UiComponents.UiWebComponents.GeneratePDF>
            </>
          }
        />

        <WebComponents.WebCommonComponents.CommonComponents.DataTable
          columns={historyColumns}
          data={history}
          useCustomPagination={true}
          totalRecords={pagination.totalItems}
          filteredRecords={pagination.totalItems}
          paginationPerPage={pagination.itemsPerPage}
          paginationDefaultPage={pagination.currentPage}
          useUrlParams={true}
        />
      </div>
    </>
  );
}
