"use client";

import React from "react";
import Image from 'next/image';
import { WebComponents } from "@/components";
import { Constants } from "@/constant";
import { SuperAdminTypes } from "@/types";
export default function CommissionReportsPage() {
  const [commissions] = React.useState<SuperAdminTypes.CommissionTypes.Commission[]>([]);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [planFilter, setPlanFilter] = React.useState("All");
  const [commissionRangeFilter, setCommissionRangeFilter] = React.useState("All");
  // Table columns using common helper
  const columns = React.useMemo(
    () =>
      WebComponents.WebCommonComponents.CommonComponents.createColumns<
        SuperAdminTypes.CommissionTypes.Commission
      >({
        fields: [
          {
            name: "Transaction ID",
            selector: (row) => row.transaction_id,
            sortable: true,
          },
          {
            name: "Business Owner",
            selector: (row) => row.business_owner,
            sortable: true,
          },
          {
            name: "Plan Name",
            selector: (row) => row.plan_name,
            sortable: true,
          },
          {
            name: "Transaction Amount",
            selector: (row) => row.transaction_amount,
            cell: (row) => (
              <span className="font-medium">${row.transaction_amount}</span>
            ),
            sortable: true,
          },
          {
            name: "Commission %",
            selector: (row) => row.commission_percentage,
            cell: (row) => (
              <WebComponents.UiComponents.UiWebComponents.Badge
                variant="outline"
                className="text-green-600 border-green-600"
              >
                {row.commission_percentage}%
              </WebComponents.UiComponents.UiWebComponents.Badge>
            ),
            sortable: true,
          },
          {
            name: "Commission Amount",
            selector: (row) => row.commission_amount,
            cell: (row) => (
              <span className="font-semibold text-green-600">
                ${row.commission_amount}
              </span>
            ),
            sortable: true,
          },
          {
            name: "Date",
            selector: (row) => row.created_at,
            sortable: true,
          },
        ],
      }),
    []
  );

  // Filtered data
  const filteredData = React.useMemo(() => {
    let filtered = commissions;
    if (searchTerm) {
      filtered = filtered.filter(commission =>
        commission.transaction_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        commission.business_owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
        commission.plan_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (planFilter !== "All") {
      filtered = filtered.filter(commission => commission.plan_name === planFilter);
    }
    if (commissionRangeFilter !== "All") {
      const [min, max] = commissionRangeFilter.split("-").map(Number);
      filtered = filtered.filter(commission => {
        const amount = parseFloat(commission.commission_amount);
        if (max) {
          return amount >= min && amount <= max;
        } else {
          return amount >= min;
        }
      });
    }
    return filtered;
  }, [commissions, searchTerm, planFilter, commissionRangeFilter]);

  // Export columns configuration using common generator
  const exportColumns = React.useMemo(() => {
    return WebComponents.WebCommonComponents.CommonComponents.generateExportColumns<SuperAdminTypes.CommissionTypes.Commission>([
      {
        key: 'transaction_id',
        label: 'Transaction ID',
        accessor: (row) => row.transaction_id,
        pdfWidth: 15,
      },
      {
        key: 'business_owner',
        label: 'Business Owner',
        accessor: (row) => row.business_owner,
        pdfWidth: 20,
      },
      {
        key: 'plan_name',
        label: 'Plan Name',
        accessor: (row) => row.plan_name,
        pdfWidth: 15,
      },
      {
        key: 'transaction_amount',
        label: 'Transaction Amount',
        accessor: (row) => `$${row.transaction_amount}`,
        pdfWidth: 15,
      },
      {
        key: 'commission_percentage',
        label: 'Commission %',
        accessor: (row) => `${row.commission_percentage}%`,
        pdfWidth: 10,
      },
      {
        key: 'commission_amount',
        label: 'Commission Amount',
        accessor: (row) => `$${row.commission_amount}`,
        pdfWidth: 15,
      },
      {
        key: 'created_at',
        label: 'Date',
        accessor: (row) => row.created_at,
        pdfWidth: 10,
      },
    ]);
  }, []);

  // Plan options
  const planOptions = React.useMemo(() => {
    const plans = Array.from(new Set(commissions.map(c => c.plan_name)));
    return [
      { name: "All Plans", value: "All" },
      ...plans.map(plan => ({ name: plan, value: plan }))
    ];
  }, [commissions]);

  // Range options
  const rangeOptions = [
    { name: "All Commission Amounts", value: "All" },
    { name: "$0 - $50", value: "0-50" },
    { name: "$51 - $100", value: "51-100" },
    { name: "$101 - $200", value: "101-200" },
    { name: "$201 - $500", value: "201-500" },
    { name: "$500+", value: "500-" }
  ];

  // Calculate summary statistics
  const summaryStats = React.useMemo(() => {
    const totalTransactions = filteredData.length;
    const totalTransactionAmount = filteredData.reduce((sum, commission) =>
      sum + parseFloat(commission.transaction_amount), 0
    );
    const totalCommissionAmount = filteredData.reduce((sum, commission) =>
      sum + parseFloat(commission.commission_amount), 0
    );
    const averageCommissionPercentage = filteredData.length > 0
      ? (filteredData.reduce((sum, commission) =>
        sum + parseFloat(commission.commission_percentage), 0
      ) / filteredData.length).toFixed(1)
      : "0";

    return {
      totalTransactions,
      totalTransactionAmount: totalTransactionAmount.toFixed(2),
      totalCommissionAmount: totalCommissionAmount.toFixed(2),
      averageCommissionPercentage
    };
  }, [filteredData]);

  return (
    <>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-2">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">{Constants.superadminConstants.commissionreportheading}</h1>
          <p className="text-sm text-gray-500">{Constants.superadminConstants.commissionreportbio}</p>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-6 bg-white dark:bg-darkFilterbar rounded-[4px] p-4 mb-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{Constants.superadminConstants.summary}</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{summaryStats.totalTransactions}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">{Constants.superadminConstants.totaltransactions}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">${summaryStats.totalTransactionAmount}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">{Constants.superadminConstants.totaltransactionamount}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">${summaryStats.totalCommissionAmount}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">{Constants.superadminConstants.totalcommissionamount}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{summaryStats.averageCommissionPercentage}%</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">{Constants.superadminConstants.averagecommissionpercentage}</div>
          </div>
        </div>
      </div>

      {/* Filters and Table */}
      <div className="bg-white dark:bg-darkFilterbar rounded-[4px] h-full w-full mt-4">
        <WebComponents.WebCommonComponents.CommonComponents.CommonFilterBar
          actionFilter="All"
          onActionFilterChange={() => {}}
          actionOptions={[]}
          activeStatusFilter="All"
          onActiveStatusFilterChange={() => {}}
          activeStatusOptions={[]}
          selectedCount={0}
          onApply={() => {}}
          /* Use category filter for Plan */
          categoryFilter={planFilter}
          onCategoryFilterChange={(value: string) => setPlanFilter(value ?? "All")}
          categoryOptions={planOptions as any}
          showActionSection={false}
          showCategoryFilter={true}
          /* Use status filter for Commission Amount range */
          statusFilter={commissionRangeFilter}
          onStatusFilterChange={(value: string) => setCommissionRangeFilter(value ?? "All")}
          statusOptions={rangeOptions.map(option => ({ label: option.name, value: option.value }))}
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
          renderExports={
            <>
              <WebComponents.UiComponents.UiWebComponents.DownloadCSV
                data={filteredData}
                columns={exportColumns.csvColumns}
                filename={`commission-report-${new Date().toISOString().split('T')[0]}.csv`}
                onExport={() => {
                  WebComponents.UiComponents.UiWebComponents.SwalHelper.success({ text: 'CSV exported successfully.' });
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
              </WebComponents.UiComponents.UiWebComponents.DownloadCSV>
              <WebComponents.UiComponents.UiWebComponents.DownloadPDF
                data={filteredData}
                columns={exportColumns.pdfColumns}
                filename={`commission-report-${new Date().toISOString().split('T')[0]}.pdf`}
                title="Commission Report"
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
                >
                  <Image src={Constants.assetsIcon.assets.pdf} alt="PDF" width={28} height={28} className="w-5 h-5 sm:w-6 sm:h-6 md:w-6 md:h-6 lg:w-7 lg:h-7 xl:w-7 xl:h-7 2xl:w-7 2xl:h-7" />
                </button>
              </WebComponents.UiComponents.UiWebComponents.DownloadPDF>
            </>
          }
        />
        <div className=''>
          <WebComponents.WebCommonComponents.CommonComponents.DataTable 
          columns={columns} 
          data={filteredData} />
        </div>
      </div>

    </>
  );
}