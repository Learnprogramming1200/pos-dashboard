"use client";

import React from "react";
import Image from 'next/image';
import { useRouter, useSearchParams } from "next/navigation";
import { FaEye } from 'react-icons/fa';
import { HiArrowLeft, HiPlus } from "react-icons/hi";
import { ServerActions } from "@/lib";
import { Constants } from "@/constant";
import { customHooks } from "@/hooks";
import { WebComponents } from "@/components";
import { SuperAdminTypes, PaginationType } from "@/types";
import SubscriptionSummaryCard from "./SubscriptionSummaryCard";
// Currency formatting utility function
const formatCurrency = (amount: number | undefined | null, currency: any) => {
  const safeAmount = amount ?? 0;
  const numAmount = typeof safeAmount === 'number' && !isNaN(safeAmount) ? safeAmount : 0;

  if (!currency) {
    return numAmount.toFixed(2);
  }

  const formattedAmount = numAmount.toFixed(2);
  const symbol = currency.symbol || currency.currencySymbol || '';
  const position = String(currency.position || currency.currencyPosition || 'Left').trim();
  const isRight = position.toLowerCase() === 'right';

  if (isRight) {
    return `${formattedAmount}${symbol}`;
  } else {
    return `${symbol}${formattedAmount}`;
  }
};

// Currency formatting for PDF export (normalizes rupee symbol for jsPDF compatibility)
const formatCurrencyForExport = (amount: number | undefined | null, currency: any) => {
  const safeAmount = amount ?? 0;
  const numAmount = typeof safeAmount === 'number' && !isNaN(safeAmount) ? safeAmount : 0;

  if (!currency) {
    return numAmount.toFixed(2);
  }

  const formattedAmount = numAmount.toFixed(2);
  let symbol = currency.symbol || currency.currencySymbol || '';
  
  // Normalize rupee symbol for PDF compatibility (jsPDF has issues with Unicode ₹)
  // Replace ₹ with Rs. for better PDF rendering
  if (symbol === '₹' || symbol === '\u20B9') {
    symbol = 'Rs.';
  }
  
  const position = String(currency.position || currency.currencyPosition || 'Left').trim();
  const isRight = position.toLowerCase() === 'right';

  if (isRight) {
    return `${formattedAmount} ${symbol}`;
  } else {
    return `${symbol}${formattedAmount}`;
  }
};

// Helper function to get display value or "-"
const getDisplayValue = (value: any, formatter?: (val: any) => string): string => {
  if (value === null || value === undefined || value === '') {
    return '-';
  }
  return formatter ? formatter(value) : String(value);
};

export default function Subscription({initialSubscriptions,initialPagination,summary}: {
readonly initialSubscriptions: SuperAdminTypes.SubscriptionTypes.SubscriptionData[];
 readonly initialPagination: PaginationType.Pagination;
 readonly summary:SuperAdminTypes.SubscriptionTypes.Summary

}) {
  const [subscriptions, setSubscriptions] = React.useState<SuperAdminTypes.SubscriptionTypes.SubscriptionData[]>(initialSubscriptions);
  const [pagination, setPagination] = React.useState<PaginationType.Pagination>(initialPagination);
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [showDetailsModal, setShowDetailsModal] = React.useState(false);
  const [selectedSubscription, setSelectedSubscription] = React.useState<SuperAdminTypes.SubscriptionTypes.SubscriptionData | null>(null);
  const [selectedRows, setSelectedRows] = React.useState<SuperAdminTypes.SubscriptionTypes.SubscriptionData[]>([]);
  const [downloadData, setDownloadData] = React.useState([]);
  const [clearSelectedRows, setClearSelectedRows] = React.useState(false);
  const [summaryData,setSummaryData]=React.useState<SuperAdminTypes.SubscriptionTypes.Summary>(summary)
  const router = useRouter();
  const searchParams = useSearchParams();
  const { searchTerm, setSearchTerm, allStatusFilter, setAllStatusFilter, filteredData } = customHooks.useListFilters<SuperAdminTypes.SubscriptionTypes.SubscriptionData>(
    subscriptions,
  );
  // Sync state with props when URL params change (server re-fetches data)
  React.useEffect(() => {
    setSubscriptions(initialSubscriptions);
    setPagination(initialPagination);
    setSummaryData(summary)
  }, [initialSubscriptions]);

  // Export columns
  const exportColumns = React.useMemo(() => {
    return WebComponents.WebCommonComponents.CommonComponents.generateExportColumns<SuperAdminTypes.SubscriptionTypes.SubscriptionData>([
      {
        key: 'businessOwnerName',
        label: 'Business Owner Name',
        accessor: (row) => {
          if (row.activeSubscription?.user?.name) {
            return row.activeSubscription.user.name;
          }
          return row.user?.name || '-';
        },
        pdfWidth: 50
      },
      {
        key: 'planName',
        label: 'Plan Name',
        accessor: (row) => {
          if (row.activeSubscription?.planName?.name) {
            return row.activeSubscription.planName.name;
          }
          if (row.activePlans && row.activePlans.length > 0) {
            return row.activePlans.map((plan: any) => plan.name).join(', ');
          }
          return '-';
        },
        pdfWidth: 50
      },
      {
        key: 'totalAmount',
        label: 'Total Amount',
        accessor: (row) => {
          if (row.activeSubscription) {
            const totalAmount = row.activeSubscription.totalAmount;
            if (totalAmount === null || totalAmount === undefined) {
              return '-';
            }
            const currency = row.activeSubscription.currency || row.activeSubscription.currencyId;
            return formatCurrencyForExport(totalAmount, currency);
          }
          if (row.activeSubscriptions && row.activeSubscriptions.length > 0) {
            const totalAmount = row.activeSubscriptions.reduce((acc, sub) => acc + (sub.totalAmount || 0), 0);
            if (totalAmount === 0) {
              return '-';
            }
            const currency = row.activeSubscriptions[0].currencyId;
            return formatCurrencyForExport(totalAmount, currency);
          }
          return '-';
        },
        pdfWidth: 40
      },
      {
        key: 'duration',
        label: 'Duration',
        accessor: (row) => {
          if (row.activeSubscription?.duration !== undefined && row.activeSubscription.duration !== null) {
            const duration = row.activeSubscription.duration;
            return `${duration} ${duration === 1 ? 'month' : 'months'}`;
          }
          if (row.activePlans && row.activePlans.length > 0) {
            return row.activePlans[0].duration || '-';
          }
          return '-';
        },
        pdfWidth: 30
      },
      {
        key: 'purchaseDate',
        label: 'Purchase Date',
        accessor: (row) => {
          if (row.activeSubscription?.purchaseDate) {
            return new Date(row.activeSubscription.purchaseDate).toLocaleDateString();
          }
          if (row.activeSubscriptions && row.activeSubscriptions.length > 0) {
            const latestDate = Math.max(...row.activeSubscriptions.map(sub => new Date(sub.purchaseDate).getTime()));
            return new Date(latestDate).toLocaleDateString();
          }
          return '-';
        },
        pdfWidth: 35
      },
      {
        key: 'expiryDate',
        label: 'Expiry Date',
        accessor: (row) => {
          if (row.activeSubscription?.expiryDate) {
            return new Date(row.activeSubscription.expiryDate).toLocaleDateString();
          }
          return '-';
        },
        pdfWidth: 35
      },
      {
        key: 'status',
        label: 'Status',
        accessor: (row) => {
          if (row.activeSubscription) {
            return row.activeSubscription.status ? 'Active' : 'Inactive';
          }
          return row.user?.status || 'Active';
        },
        pdfWidth: 25
      }
    ]);
  }, []);

  // Handlers
  const handleAddSubscription = async (formData: SuperAdminTypes.SubscriptionTypes.SubscriptionFormData) => {
    try {
      const duration = (formData as any).duration || '';

      const apiData = {
        purchaseDate: formData.purchaseDate,
        planName: formData.planName,
        duration: typeof duration === 'string' ? duration : String(duration),
        amount: parseFloat(formData.amount) || 0,
        discount: parseFloat(formData.discount) || 0,
        taxes: formData.taxAmount || 0,
        totalAmount: formData.totalAmount || 0,
        userId: formData.userId,
        status: formData.status === 'Active',
        selectTax: formData.selectTax,
        discountType: formData.discountType,
      };

      const result = await ServerActions.ServerActionslib.createSubscriptionAction(apiData);
      if (!result?.success) {
        throw new Error(result?.error || 'Failed to add subscription.');
      }
      const created = (result as any)?.data?.data ?? (result as any)?.data;
      setSubscriptions(prev => [...prev, created as SuperAdminTypes.SubscriptionTypes.SubscriptionData]);
      setShowAddModal(false);

      WebComponents.UiComponents.UiWebComponents.SwalHelper.success({
        text: 'Subscription added successfully.'
      });
    } catch (error: unknown) {
      console.error('Error adding subscription:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to add subscription.';
      WebComponents.UiComponents.UiWebComponents.SwalHelper.error({
        text: errorMessage
      });
    }
  };

  const handleViewDetails = React.useCallback((subscription: SuperAdminTypes.SubscriptionTypes.SubscriptionData) => {
    setSelectedSubscription(subscription);
    setShowDetailsModal(true);
  }, []);

  const downloadPdf = async (): Promise<any[]> => {
    return await ServerActions.HandleFunction.handleDownloadCommon({
      selectedRows,
      searchParams,
      bulkGetSelectedAction: ServerActions.ServerActionslib.bulkGetSelectedSubscriptionsAction,
      bulkGetAllAction: ServerActions.ServerActionslib.bulkGetSubscriptionsAction,
      setDownloadData,
    });
  };

  const clearSelectedData = () => {
    setClearSelectedRows(prev => !prev);
    setSelectedRows([]);
    router.refresh();
  };

  // Table columns using createColumns
  const tableColumns = React.useMemo(() => WebComponents.WebCommonComponents.CommonComponents.createColumns<SuperAdminTypes.SubscriptionTypes.SubscriptionData>({
    fields: [
      {
        name: "Business Owner Name",
        selector: (row) => {
          if (row.activeSubscription?.user?.name) {
            return row.activeSubscription.user.name;
          }
          return row.user?.name || '-';
        },
        sortable: true,
        cell: (row) => {
          const name = row.activeSubscription?.user?.name || row.user?.name;
          return (
            <span className="text-sm text-gray-900 dark:text-white">
              {getDisplayValue(name)}
            </span>
          );
        },
      },
      {
        name: "Plan Name",
        selector: (row) => {
          if (row.activeSubscription?.planName?.name) {
            return row.activeSubscription.planName.name;
          }
          if (row.activePlans && row.activePlans.length > 0) {
            return row.activePlans.map((plan: any) => plan.name).join(', ');
          }
          return '-';
        },
        sortable: true,
        cell: (row) => {
          if (row.activeSubscription?.planName?.name) {
            return (
              <WebComponents.UiComponents.UiWebComponents.Badge className="bg-primary text-white text-xs">
                {row.activeSubscription.planName.name}
              </WebComponents.UiComponents.UiWebComponents.Badge>
            );
          }
          if (row.activePlans && row.activePlans.length > 0) {
            return (
              <div className="flex flex-wrap gap-1">
                {row.activePlans.map((plan: any) => (
                  <WebComponents.UiComponents.UiWebComponents.Badge key={plan._id} className="bg-primary text-white text-xs">
                    {plan.name}
                  </WebComponents.UiComponents.UiWebComponents.Badge>
                ))}
              </div>
            );
          }
          return <span className="text-gray-500 dark:text-gray-400 text-sm">-</span>;
        },
      },
      {
        name: "Total Amount",
        selector: (row) => {
          if (row.activeSubscription?.totalAmount !== undefined) {
            return row.activeSubscription.totalAmount;
          }
          if (row.activeSubscriptions && row.activeSubscriptions.length > 0) {
            return row.activeSubscriptions.reduce((acc, sub) => acc + (sub.totalAmount || 0), 0);
          }
          return 0;
        },
        sortable: true,
        cell: (row) => {
          if (row.activeSubscription) {
            const totalAmount = row.activeSubscription.totalAmount;
            if (totalAmount === null || totalAmount === undefined) {
              return <span className="text-sm text-gray-500 dark:text-gray-400">-</span>;
            }
            const currency = row.activeSubscription.currency || row.activeSubscription.currencyId;
            return (
              <span className="text-sm text-gray-900 dark:text-white font-medium">
                {formatCurrency(totalAmount, currency)}
              </span>
            );
          }
          const totalAmount: number = row.activeSubscriptions && row.activeSubscriptions.length > 0
            ? row.activeSubscriptions.reduce((acc, sub) => acc + (sub.totalAmount || 0), 0)
            : 0;
          const currency = row.activeSubscriptions && row.activeSubscriptions.length > 0
            ? row.activeSubscriptions[0].currencyId
            : null;
          return (
            <span className="text-sm text-gray-900 dark:text-white font-medium">
              {totalAmount > 0 ? formatCurrency(totalAmount, currency) : '-'}
            </span>
          );
        },
      },
      {
        name: "Duration",
        selector: (row) => {
          if (row.activeSubscription?.duration !== undefined) {
            return row.activeSubscription.duration;
          }
          if (row.activePlans && row.activePlans.length > 0) {
            return row.activePlans[0].duration || '-';
          }
          return '-';
        },
        sortable: true,
        cell: (row) => {
          if (row.activeSubscription?.duration !== undefined && row.activeSubscription.duration !== null) {
            const duration = row.activeSubscription.duration;
            const durationType = row.activeSubscription.planName?.type;
            return (
              <span className="text-sm text-gray-900 dark:text-white">
                {duration} {durationType === 'monthly' ? 'Months' : durationType === 'yearly' ? 'Years' : 'Days'}
              </span>
            );
          }
          const duration = row.activePlans && row.activePlans.length > 0
            ? row.activePlans[0].duration
            : null;
          return (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {getDisplayValue(duration)}
            </span>
          );
        },
      },
      {
        name: "Purchase Date",
        selector: (row) => {
          if (row.activeSubscription?.purchaseDate) {
            return new Date(row.activeSubscription.purchaseDate).getTime();
          }
          if (row.activeSubscriptions && row.activeSubscriptions.length > 0) {
            const latestDate = Math.max(...row.activeSubscriptions.map(sub => new Date(sub.purchaseDate).getTime()));
            return latestDate;
          }
          return 0;
        },
        sortable: true,
        cell: (row) => {
          if (row.activeSubscription?.purchaseDate) {
            return (
              <span className="text-sm text-gray-900 dark:text-white">
                {new Date(row.activeSubscription.purchaseDate).toLocaleDateString()}
              </span>
            );
          }
          if (row.activeSubscriptions && row.activeSubscriptions.length > 0) {
            const latestDate = Math.max(...row.activeSubscriptions.map(sub => new Date(sub.purchaseDate).getTime()));
            return (
              <span className="text-sm text-gray-900 dark:text-white">
                {new Date(latestDate).toLocaleDateString()}
              </span>
            );
          }
          return <span className="text-sm text-gray-500 dark:text-gray-400">-</span>;
        },
      },
      {
        name: "Expiry Date",
        selector: (row) => {
          if (row.activeSubscription?.expiryDate) {
            return new Date(row.activeSubscription.expiryDate).getTime();
          }
          return 0;
        },
        sortable: true,
        cell: (row) => {
          if (row.activeSubscription?.expiryDate) {
            return (
              <span className="text-sm text-gray-900 dark:text-white">
                {new Date(row.activeSubscription.expiryDate).toLocaleDateString()}
              </span>
            );
          }
          return <span className="text-sm text-gray-500 dark:text-gray-400">-</span>;
        },
      },
      {
        name: "Status",
        selector: (row) => {
          if (row.activeSubscription) {
            return row.activeSubscription.status ? 'Active' : 'Inactive';
          }
          return row.user?.status || "-";
        },
        sortable: true,
        cell: (row) => {
          let status: string;
          if (row.activeSubscription) {
            status = row.activeSubscription.status ? 'Active' : 'Inactive';
          } else {
            status = row.user?.status || "-";
          }
          return (
            <WebComponents.UiComponents.UiWebComponents.Badge className={`px-2 sm:px-2.5 py-1 rounded-full text-xs sm:text-sm ${Constants.commonConstants.statusColor[status as keyof typeof Constants.commonConstants.statusColor] ||Constants.commonConstants.statusColor.Active}`}>
              {status}
            </WebComponents.UiComponents.UiWebComponents.Badge>
          );
        },
      },
    ],
    actions: [
      {
        render: (row) => (
          <WebComponents.UiComponents.UiWebComponents.Button size="icon" variant="viewaction" onClick={() => handleViewDetails(row)}>
            <FaEye className="w-4 h-4" />
          </WebComponents.UiComponents.UiWebComponents.Button>
        ),
      },
    ],
  }), [handleViewDetails]);

  // Prepare summary cards data dynamically from summaryData
  const summaryCards = React.useMemo(
    () => [
      {
        variant: "total" as const,
        value: summaryData.totalSubscription.toString(),
      },
      {
        variant: "active" as const,
        value: summaryData.activeSubscription.toString(),
      },
      {
        variant: "expired" as const,
        value: summaryData.expiredSubscription.toString(),
      },
      {
        variant: "expiringSoon" as const,
        value: summaryData.expiringSoon.toString(),
      },
    ],
    [summaryData]
  );

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-lg sm:text-lg md:text-xl lg:text-2xl font-medium text-textMain dark:text-white truncate">
            {Constants.superadminConstants.subscriptionheading}
            {(() => {
              if (!showAddModal) return "";
              return ` > ${Constants.superadminConstants.addSubscription}`;
            })()}
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-textSmall pt-2">
            {Constants.superadminConstants.subscriptionbio}
          </p>
        </div>
        <WebComponents.UiComponents.UiWebComponents.Button
          variant="addBackButton"
          onClick={() => {
            if (showAddModal) {
              setShowAddModal(false);
            } else {
              setShowAddModal(true);
            }
          }}
        >
          {showAddModal ? <><HiArrowLeft className="w-4 h-4" /> {Constants.superadminConstants.back}</> : <><HiPlus className="w-4 h-4" /> {Constants.superadminConstants.add}</>}
        </WebComponents.UiComponents.UiWebComponents.Button>
      </div>

      {!showAddModal && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-4">
            {summaryCards.map((card) => (
              <SubscriptionSummaryCard
                key={card.variant}
                variant={card.variant}
                value={card.value}
              />
            ))}
          </div>

          <div className="bg-white dark:bg-darkFilterbar rounded-[4px] h-full w-full mt-4 overflow-hidden">
          <WebComponents.WebCommonComponents.CommonComponents.CommonFilterBar
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
            statusFilter={allStatusFilter}
            onStatusFilterChange={(value: string) => {
              const validValue = value === "Active" || value === "Pending" || value === "Inactive" ? value : "All";
              setAllStatusFilter(validValue);
            }}
            statusOptions={[
              { label: "All Status", value: "All" },
              { label: "Active", value: "Active" },
              { label: "Pending", value: "Pending" },
              { label: "Inactive", value: "Inactive" },
            ]}
            searchTerm={searchTerm}
            onSearchTermChange={setSearchTerm}
            renderExports={
              <>
                <WebComponents.UiComponents.UiWebComponents.DownloadCSV
                  data={downloadData}
                  columns={exportColumns.csvColumns}
                  filename={`subscriptions-${new Date().toISOString().split('T')[0]}.csv`}
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
                    disabled={subscriptions.length === 0}
                  >
                    <Image src={Constants.assetsIcon.assets.csv} alt="CSV" width={28} height={28} className="w-5 h-5 sm:w-6 sm:h-6 md:w-6 md:h-6 lg:w-7 lg:h-7 xl:w-7 xl:h-7 2xl:w-7 2xl:h-7" />
                  </button>
                </WebComponents.UiComponents.UiWebComponents.DownloadCSV>
                <WebComponents.UiComponents.UiWebComponents.DownloadPDF
                  data={downloadData}
                  columns={exportColumns.pdfColumns}
                  filename={`subscriptions-${new Date().toISOString().split('T')[0]}.pdf`}
                  title="Subscriptions Report"
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
                    disabled={subscriptions.length === 0}
                  >
                    <Image src={Constants.assetsIcon.assets.pdf} alt="PDF" width={28} height={28} className="w-5 h-5 sm:w-6 sm:h-6 md:w-6 md:h-6 lg:w-7 lg:h-7 xl:w-7 xl:h-7 2xl:w-7 2xl:h-7" />
                  </button>
                </WebComponents.UiComponents.UiWebComponents.DownloadPDF>
              </>
            }
            showActionSection={false}
            showCategoryFilter={false}
          />
          <WebComponents.WebCommonComponents.CommonComponents.DataTable
            columns={tableColumns}
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
        </>
      )}

      {showAddModal && (
        <WebComponents.SuperAdminComponents.SuperadminWebComponents.SuperAdminForms.SubscriptionForm
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddSubscription}
        />
      )}

      {showDetailsModal && selectedSubscription && (
        <WebComponents.SuperAdminComponents.SuperadminWebComponents.SuperadminModels.SubscriptionDetailsModal
          subscription={selectedSubscription}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedSubscription(null);
          }}
        />
      )}
    </>
  );
}
