"use client";

import React from "react";
import Image from "next/image";
import { Filter } from "lucide-react";
import { ServerActions } from "@/lib";
import { Constants } from "@/constant";
import { CommonComponents } from "@/components/common";
import { UiWebComponents } from "@/components/ui";
import { AdminWebComponents } from "@/components/admin";
import { AdminTypes,FiltersTypes } from "@/types";
import { salesTaxData } from "@/constant/dummy-data/sales-tax";
import { purchaseTaxData } from "@/constant/dummy-data/purchase-tax";
import { monthlyTaxSummaryData, annualTaxSummaryData } from "@/constant/dummy-data/tax-summary";

// Helper function to safely format numbers
const formatCurrency = (value: number | undefined | null): string => {
  if (value === undefined || value === null || Number.isNaN(value)) {
    return "$0.00";
  }
  return `$${value.toFixed(2)}`;
};

// Helper function to safely format numbers for export (without $ sign)
const formatNumber = (value: number | undefined | null): string => {
  if (value === undefined || value === null || Number.isNaN(value)) {
    return "0.00";
  }
  return value.toFixed(2);
};

export default function TaxReportPage() {
  const [activeTab, setActiveTab] = React.useState<"sales" | "purchase" | "summary">("sales");
  const [summaryView, setSummaryView] = React.useState<"monthly" | "yearly">("monthly");
  const [searchTerm, setSearchTerm] = React.useState("");
  const [storeFilter, setStoreFilter] = React.useState("All");
  const [currentPage, setCurrentPage] = React.useState(1);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  // Filter modal state
  const [isFilterModalOpen, setIsFilterModalOpen] = React.useState(false);
  const [filterValues, setFilterValues] = React.useState({
    store: "All",
    taxType: "All",
    dateFrom: "",
    dateTo: "",
    taxAmountMin: "",
    taxAmountMax: "",
    month: "All",
    year: new Date().getFullYear().toString(),
  });

  // Get current data based on active tab
  const currentData = React.useMemo(() => {
    if (activeTab === "sales") return salesTaxData;
    if (activeTab === "purchase") return purchaseTaxData;
    if (activeTab === "summary") {
      return summaryView === "monthly" ? monthlyTaxSummaryData : annualTaxSummaryData;
    }
    return [];
  }, [activeTab, summaryView]);

  // Get unique values for filters
  const uniqueStores = React.useMemo(() => {
    return Array.from(new Set(currentData.map((item) => item.storeName)));
  }, [currentData]);

  const uniqueTaxTypes = React.useMemo(() => {
    if (activeTab === "summary") return [];
    return Array.from(new Set(
      (currentData as (AdminTypes.ReportTypes.SalesTaxReport | AdminTypes.ReportTypes.PurchaseTaxReport)[]).map((item) => item.taxType)
    ));
  }, [currentData, activeTab]);

  // Table columns using createColumns
  const tableColumns = React.useMemo(() => {
    if (activeTab === "sales") {
      return CommonComponents.createColumns<AdminTypes.ReportTypes.SalesTaxReport>({
        fields: [
          { name: "Date", selector: (row: AdminTypes.ReportTypes.SalesTaxReport) => row.date, sortable: true },
          { name: "Invoice No.", selector: (row: AdminTypes.ReportTypes.SalesTaxReport) => row.invoiceNo, sortable: true },
          { name: "Items", selector: (row: AdminTypes.ReportTypes.SalesTaxReport) => row.items, sortable: true },
          {
            name: "Total Amount",
            selector: (row: AdminTypes.ReportTypes.SalesTaxReport) => row.totalAmount ?? 0,
            cell: (row: AdminTypes.ReportTypes.SalesTaxReport) => (
              <span className="text-gray-900 dark:text-gray-300">{formatCurrency(row.totalAmount)}</span>
            ),
            sortable: true
          },
          {
            name: "Non Taxable Value",
            selector: (row: AdminTypes.ReportTypes.SalesTaxReport) => row.taxableValue ?? 0,
            cell: (row: AdminTypes.ReportTypes.SalesTaxReport) => (
              <span className="text-gray-900 dark:text-gray-300">{formatCurrency(row.taxableValue)}</span>
            ),
            sortable: true
          },
          {
            name: "Tax Type",
            selector: (row: AdminTypes.ReportTypes.SalesTaxReport) => row.taxType,
            sortable: true
          },
          {
            name: "Tax Rate",
            selector: (row: AdminTypes.ReportTypes.SalesTaxReport) => row.taxRate,
            cell: (row: AdminTypes.ReportTypes.SalesTaxReport) => (
              <span className="text-gray-900 dark:text-gray-300">{row.taxRate}%</span>
            ),
            sortable: true
          },
          {
            name: "Tax Amount",
            selector: (row: AdminTypes.ReportTypes.SalesTaxReport) => row.taxAmount ?? 0,
            cell: (row: AdminTypes.ReportTypes.SalesTaxReport) => (
              <span className="text-gray-900 dark:text-gray-300">{formatCurrency(row.taxAmount)}</span>
            ),
            sortable: true
          },
        ],
      });
    } else if (activeTab === "purchase") {
      return CommonComponents.createColumns<AdminTypes.ReportTypes.PurchaseTaxReport>({
        fields: [
          { name: "Date", selector: (row: AdminTypes.ReportTypes.PurchaseTaxReport) => row.date, sortable: true },
          { name: "Supplier", selector: (row: AdminTypes.ReportTypes.PurchaseTaxReport) => row.supplier, sortable: true },
          { name: "Supplier No.", selector: (row: AdminTypes.ReportTypes.PurchaseTaxReport) => row.supplierNo, sortable: true },
          { name: "Invoice No.", selector: (row: AdminTypes.ReportTypes.PurchaseTaxReport) => row.invoiceNo, sortable: true },
          { name: "Items", selector: (row: AdminTypes.ReportTypes.PurchaseTaxReport) => row.items, sortable: true },
          {
            name: "Total Amount",
            selector: (row: AdminTypes.ReportTypes.PurchaseTaxReport) => row.totalAmount ?? 0,
            cell: (row: AdminTypes.ReportTypes.PurchaseTaxReport) => (
              <span className="text-gray-900 dark:text-gray-300">{formatCurrency(row.totalAmount)}</span>
            ),
            sortable: true
          },
          {
            name: "non taxable value",
            selector: (row: AdminTypes.ReportTypes.PurchaseTaxReport) => row.taxableValue ?? 0,
            cell: (row: AdminTypes.ReportTypes.PurchaseTaxReport) => (
              <span className="text-gray-900 dark:text-gray-300">{formatCurrency(row.taxableValue)}</span>
            ),
            sortable: true
          },
          {
            name: "Tax Type",
            selector: (row: AdminTypes.ReportTypes.PurchaseTaxReport) => row.taxType,
            sortable: true
          },
          {
            name: "Tax Rate",
            selector: (row: AdminTypes.ReportTypes.PurchaseTaxReport) => row.taxRate,
            cell: (row: AdminTypes.ReportTypes.PurchaseTaxReport) => (
              <span className="text-gray-900 dark:text-gray-300">{row.taxRate}%</span>
            ),
            sortable: true
          },
          {
            name: "Tax Amount",
            selector: (row: AdminTypes.ReportTypes.PurchaseTaxReport) => row.taxAmount ?? 0,
            cell: (row: AdminTypes.ReportTypes.PurchaseTaxReport) => (
              <span className="text-gray-900 dark:text-gray-300">{formatCurrency(row.taxAmount)}</span>
            ),
            sortable: true
          },
        ],
      });
    } else if (activeTab === "summary" && summaryView === "monthly") {
      return CommonComponents.createColumns<AdminTypes.ReportTypes.MonthlyTaxSummary>({
        fields: [
          { name: "Period", selector: (row: AdminTypes.ReportTypes.MonthlyTaxSummary) => row.period, sortable: true },
          {
            name: "Total Sales Value",
            selector: (row: AdminTypes.ReportTypes.MonthlyTaxSummary) => row.totalSalesValue ?? 0,
            cell: (row: AdminTypes.ReportTypes.MonthlyTaxSummary) => (
              <span className="text-gray-900 dark:text-gray-300">{formatCurrency(row.totalSalesValue)}</span>
            ),
            sortable: true
          },
          {
            name: "Output Tax Collected",
            selector: (row: AdminTypes.ReportTypes.MonthlyTaxSummary) => row.outputTaxCollected ?? 0,
            cell: (row: AdminTypes.ReportTypes.MonthlyTaxSummary) => (
              <span className="text-gray-900 dark:text-gray-300">{formatCurrency(row.outputTaxCollected)}</span>
            ),
            sortable: true
          },
          {
            name: "Total Purchase Value",
            selector: (row: AdminTypes.ReportTypes.MonthlyTaxSummary) => row.totalPurchaseValue ?? 0,
            cell: (row: AdminTypes.ReportTypes.MonthlyTaxSummary) => (
              <span className="text-gray-900 dark:text-gray-300">{formatCurrency(row.totalPurchaseValue)}</span>
            ),
            sortable: true
          },
          {
            name: "Input Tax Paid",
            selector: (row: AdminTypes.ReportTypes.MonthlyTaxSummary) => row.inputTaxPaid ?? 0,
            cell: (row: AdminTypes.ReportTypes.MonthlyTaxSummary) => (
              <span className="text-gray-900 dark:text-gray-300">{formatCurrency(row.inputTaxPaid)}</span>
            ),
            sortable: true
          },
          {
            name: "Net Tax Payable",
            selector: (row: AdminTypes.ReportTypes.MonthlyTaxSummary) => row.netTaxPayable ?? 0,
            cell: (row: AdminTypes.ReportTypes.MonthlyTaxSummary) => {
              const value = row.netTaxPayable ?? 0;
              return (
                <span className={value >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
                  {formatCurrency(value)}
                </span>
              );
            },
            sortable: true
          },
          {
            name: "Tax Status",
            selector: (row: AdminTypes.ReportTypes.MonthlyTaxSummary) => row.taxStatus,
            cell: (row: AdminTypes.ReportTypes.MonthlyTaxSummary) => (
              <span className={row.taxStatus === "Payable" ? "text-orange-600 dark:text-orange-400" : "text-green-600 dark:text-green-400"}>
                {row.taxStatus}
              </span>
            ),
            sortable: true
          },
          { name: "Generated On", selector: (row: AdminTypes.ReportTypes.MonthlyTaxSummary) => row.generatedOn, sortable: true },
        ],
      });
    } else {
      return CommonComponents.createColumns<AdminTypes.ReportTypes.AnnualTaxSummary>({
        fields: [
          { name: "Financial Year", selector: (row: AdminTypes.ReportTypes.AnnualTaxSummary) => row.financialYear, sortable: true },
          {
            name: "Total Output Tax",
            selector: (row: AdminTypes.ReportTypes.AnnualTaxSummary) => row.totalOutputTax ?? 0,
            cell: (row: AdminTypes.ReportTypes.AnnualTaxSummary) => (
              <span className="text-gray-900 dark:text-gray-300">{formatCurrency(row.totalOutputTax)}</span>
            ),
            sortable: true
          },
          {
            name: "Total Input Tax",
            selector: (row: AdminTypes.ReportTypes.AnnualTaxSummary) => row.totalInputTax ?? 0,
            cell: (row: AdminTypes.ReportTypes.AnnualTaxSummary) => (
              <span className="text-gray-900 dark:text-gray-300">{formatCurrency(row.totalInputTax)}</span>
            ),
            sortable: true
          },
          {
            name: "Net Tax Paid",
            selector: (row: AdminTypes.ReportTypes.AnnualTaxSummary) => row.netTaxPaid ?? 0,
            cell: (row: AdminTypes.ReportTypes.AnnualTaxSummary) => {
              const value = row.netTaxPaid ?? 0;
              return (
                <span className={value >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
                  {formatCurrency(value)}
                </span>
              );
            },
            sortable: true
          },
          {
            name: "Avg Monthly Tax",
            selector: (row: AdminTypes.ReportTypes.AnnualTaxSummary) => row.avgMonthlyTax ?? 0,
            cell: (row: AdminTypes.ReportTypes.AnnualTaxSummary) => (
              <span className="text-gray-900 dark:text-gray-300">{formatCurrency(row.avgMonthlyTax)}</span>
            ),
            sortable: true
          },
        ],
      });
    }
  }, [activeTab, summaryView]);

  // Helper functions for filtering
  const matchesSearchTerm = (item: unknown, term: string): boolean => {
    const searchLower = term.toLowerCase();
    if (activeTab === "sales") {
      const salesItem = item as AdminTypes.ReportTypes.SalesTaxReport;
      return (
        salesItem.invoiceNo.toLowerCase().includes(searchLower) ||
        salesItem.items.toLowerCase().includes(searchLower) ||
        salesItem.taxType.toLowerCase().includes(searchLower)
      );
    }
    if (activeTab === "purchase") {
      const purchaseItem = item as AdminTypes.ReportTypes.PurchaseTaxReport;
      return (
        purchaseItem.invoiceNo.toLowerCase().includes(searchLower) ||
        purchaseItem.supplier.toLowerCase().includes(searchLower) ||
        purchaseItem.supplierNo.toLowerCase().includes(searchLower) ||
        purchaseItem.items.toLowerCase().includes(searchLower) ||
        purchaseItem.taxType.toLowerCase().includes(searchLower)
      );
    }
    if (activeTab === "summary") {
      if (summaryView === "monthly") {
        const monthlyItem = item as AdminTypes.ReportTypes.MonthlyTaxSummary;
        return (
          monthlyItem.period.toLowerCase().includes(searchLower) ||
          monthlyItem.taxStatus.toLowerCase().includes(searchLower) ||
          monthlyItem.month.toLowerCase().includes(searchLower)
        );
      }
      const annualItem = item as AdminTypes.ReportTypes.AnnualTaxSummary;
      return annualItem.financialYear.toLowerCase().includes(searchLower);
    }
    return false;
  };

  const applySummaryFilters = (
    filtered: AdminTypes.ReportTypes.TaxReportData[]
  ): AdminTypes.ReportTypes.TaxReportData[] => {
    let result = filtered;
    if (summaryView === "monthly") {
      if (filterValues.month !== "All") {
        result = result.filter(item => (item as AdminTypes.ReportTypes.MonthlyTaxSummary).month === filterValues.month);
      }
      if (filterValues.year && filterValues.year !== "All") {
        result = result.filter(item => (item as AdminTypes.ReportTypes.MonthlyTaxSummary).year.toString() === filterValues.year);
      }
    } else if (filterValues.year && filterValues.year !== "All") {
      result = result.filter(item => (item as AdminTypes.ReportTypes.AnnualTaxSummary).year.toString() === filterValues.year);
    }
    return result;
  };

  const applyTransactionFilters = (
    filtered: AdminTypes.ReportTypes.TaxReportData[]
  ): AdminTypes.ReportTypes.TaxReportData[] => {
    let result = filtered;
    if (filterValues.taxType !== "All") {
      result = result.filter(item => {
        const taxItem = item as AdminTypes.ReportTypes.SalesTaxReport | AdminTypes.ReportTypes.PurchaseTaxReport;
        return taxItem.taxType === filterValues.taxType;
      });
    }
    if (filterValues.dateFrom) {
      result = result.filter(item => {
        const dateItem = item as AdminTypes.ReportTypes.SalesTaxReport | AdminTypes.ReportTypes.PurchaseTaxReport;
        return dateItem.date >= filterValues.dateFrom;
      });
    }
    if (filterValues.dateTo) {
      result = result.filter(item => {
        const dateItem = item as AdminTypes.ReportTypes.SalesTaxReport | AdminTypes.ReportTypes.PurchaseTaxReport;
        return dateItem.date <= filterValues.dateTo;
      });
    }
    if (filterValues.taxAmountMin) {
      result = result.filter(item => {
        const taxItem = item as AdminTypes.ReportTypes.SalesTaxReport | AdminTypes.ReportTypes.PurchaseTaxReport;
        return taxItem.taxAmount >= Number.parseFloat(filterValues.taxAmountMin);
      });
    }
    if (filterValues.taxAmountMax) {
      result = result.filter(item => {
        const taxItem = item as AdminTypes.ReportTypes.SalesTaxReport | AdminTypes.ReportTypes.PurchaseTaxReport;
        return taxItem.taxAmount <= Number.parseFloat(filterValues.taxAmountMax);
      });
    }
    return result;
  };

  // Filtered data
  const filteredData = React.useMemo(() => {
    let filtered: AdminTypes.ReportTypes.TaxReportData[] = [...currentData];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(item => matchesSearchTerm(item, searchTerm));
    }

    // Store filter
    if (storeFilter !== "All") {
      filtered = filtered.filter(item => item.storeName === storeFilter);
    }

    // Extended filters
    if (filterValues.store !== "All") {
      filtered = filtered.filter(item => item.storeName === filterValues.store);
    }

    if (activeTab === "summary") {
      filtered = applySummaryFilters(filtered);
    } else {
      filtered = applyTransactionFilters(filtered);
    }

    return filtered;
  }, [currentData, searchTerm, storeFilter, filterValues, activeTab, summaryView]);

  // Pagination handlers
  const handlePageChange = React.useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleRowsPerPageChange = React.useCallback((perPage: number) => {
    setRowsPerPage(perPage);
    setCurrentPage(1);
  }, []);

  // Get current table data based on active tab
  const tableData = React.useMemo(() => {
    if (activeTab === "sales") return filteredData as AdminTypes.ReportTypes.SalesTaxReport[];
    if (activeTab === "purchase") return filteredData as AdminTypes.ReportTypes.PurchaseTaxReport[];
    if (summaryView === "monthly") return filteredData as AdminTypes.ReportTypes.MonthlyTaxSummary[];
    return filteredData as AdminTypes.ReportTypes.AnnualTaxSummary[];
  }, [activeTab, summaryView, filteredData]);

  // Get export configuration
  const exportConfig = React.useMemo(() => {
    if (activeTab === "sales") {
      return {
        data: filteredData as AdminTypes.ReportTypes.SalesTaxReport[],
        csvFilename: `sales-tax-report-${new Date().toISOString().split("T")[0]}.csv`,
        pdfFilename: `sales-tax-report-${new Date().toISOString().split("T")[0]}.pdf`,
        pdfTitle: Constants.adminReportsConstants.salesTaxReport,
      };
    }
    if (activeTab === "purchase") {
      return {
        data: filteredData as AdminTypes.ReportTypes.PurchaseTaxReport[],
        csvFilename: `purchase-tax-report-${new Date().toISOString().split("T")[0]}.csv`,
        pdfFilename: `purchase-tax-report-${new Date().toISOString().split("T")[0]}.pdf`,
        pdfTitle: Constants.adminReportsConstants.purchaseTaxReport,
      };
    }
    const summaryData = summaryView === "monthly" 
      ? (filteredData as AdminTypes.ReportTypes.MonthlyTaxSummary[])
      : (filteredData as AdminTypes.ReportTypes.AnnualTaxSummary[]);
    const summaryTitle = summaryView === "monthly" ? Constants.adminReportsConstants.month : Constants.adminReportsConstants.year;
    return {
      data: summaryData,
      csvFilename: `tax-summary-${summaryView}-${new Date().toISOString().split("T")[0]}.csv`,
      pdfFilename: `tax-summary-${summaryView}-${new Date().toISOString().split("T")[0]}.pdf`,
      pdfTitle: `${Constants.adminReportsConstants.taxSummaryReport} - ${summaryTitle}`,
    };
  }, [activeTab, summaryView, filteredData, Constants.adminReportsConstants.salesTaxReport, Constants.adminReportsConstants.purchaseTaxReport, Constants.adminReportsConstants.taxSummaryReport, Constants.adminReportsConstants.month, Constants.adminReportsConstants.year]);


  const handleApplyFilters = () => {
    setIsFilterModalOpen(false);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setFilterValues({
      store: "All",
      taxType: "All",
      dateFrom: "",
      dateTo: "",
      taxAmountMin: "",
      taxAmountMax: "",
      month: "All",
      year: new Date().getFullYear().toString(),
    });
  };

  const filterConfig: FiltersTypes.FilterFieldConfig[] = React.useMemo(() => {
    const baseConfig: FiltersTypes.FilterFieldConfig[] = [
      {
        type: "select",
        label: Constants.adminReportsConstants.selectStore,
        key: "store",
        options: [
          { label: Constants.adminReportsConstants.allStores, value: "All" },
          ...uniqueStores.map((s: string) => ({ label: s, value: s }))
        ]
      },
    ];

    if (activeTab === "summary") {
      return [
        ...baseConfig,
        {
          type: "select" as const,
          label: Constants.adminReportsConstants.selectYear,
          key: "year",
          options: [
            { label: "All Years", value: "All" },
            ...ServerActions.DatePretier.getYears().map((y: string) => ({ label: y, value: y }))
          ]
        },
        ...(summaryView === "monthly" ? [{
          type: "select" as const,
          label: "Select Month",
          key: "month",
          options: [
            { label: "All Months", value: "All" },
            ...ServerActions.DatePretier.MONTHS_LONG.map((m) => ({ label: m, value: m }))
          ]
        }] : [])
      ];
    } else {
      return [
        ...baseConfig,
        {
          type: "select",
          label: Constants.adminReportsConstants.taxType,
          key: "taxType",
          options: [
            { label: `All ${Constants.adminReportsConstants.taxType}s`, value: "All" },
            ...uniqueTaxTypes.map((t: string) => ({ label: t, value: t }))
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
          label: "Tax Amount Range",
          minKey: "taxAmountMin",
          maxKey: "taxAmountMax"
        }
      ];
    }
  }, [activeTab, summaryView, uniqueStores, uniqueTaxTypes, Constants.adminReportsConstants.taxType]);

  // Export columns
  const exportColumns = React.useMemo(() => {
    if (activeTab === "sales") {
      return CommonComponents.generateExportColumns<AdminTypes.ReportTypes.SalesTaxReport>([
        { key: "date", label: "Date", accessor: (row: AdminTypes.ReportTypes.SalesTaxReport) => row.date, pdfWidth: 10 },
        { key: "invoiceNo", label: "Invoice No.", accessor: (row: AdminTypes.ReportTypes.SalesTaxReport) => row.invoiceNo, pdfWidth: 12 },
        { key: "items", label: "Items", accessor: (row: AdminTypes.ReportTypes.SalesTaxReport) => row.items, pdfWidth: 20 },
        { key: "totalAmount", label: "Total Amount", accessor: (row: AdminTypes.ReportTypes.SalesTaxReport) => formatNumber(row.totalAmount), pdfWidth: 12 },
        { key: "taxableValue", label: "non taxable value", accessor: (row: AdminTypes.ReportTypes.SalesTaxReport) => formatNumber(row.taxableValue), pdfWidth: 12 },
        { key: "taxType", label: "Tax Type", accessor: (row: AdminTypes.ReportTypes.SalesTaxReport) => row.taxType, pdfWidth: 10 },
        { key: "taxRate", label: "Tax Rate", accessor: (row: AdminTypes.ReportTypes.SalesTaxReport) => `${row.taxRate}%`, pdfWidth: 10 },
        { key: "taxAmount", label: "Tax Amount", accessor: (row: AdminTypes.ReportTypes.SalesTaxReport) => formatNumber(row.taxAmount), pdfWidth: 10 },
        { key: "storeName", label: "Store", accessor: (row: AdminTypes.ReportTypes.SalesTaxReport) => row.storeName, pdfWidth: 10 },
      ]);
    } else if (activeTab === "purchase") {
      return CommonComponents.generateExportColumns<AdminTypes.ReportTypes.PurchaseTaxReport>([
        { key: "date", label: "Date", accessor: (row: AdminTypes.ReportTypes.PurchaseTaxReport) => row.date, pdfWidth: 10 },
        { key: "supplier", label: "Supplier", accessor: (row: AdminTypes.ReportTypes.PurchaseTaxReport) => row.supplier, pdfWidth: 15 },
        { key: "supplierNo", label: "Supplier No.", accessor: (row: AdminTypes.ReportTypes.PurchaseTaxReport) => row.supplierNo, pdfWidth: 15 },
        { key: "invoiceNo", label: "Invoice No.", accessor: (row: AdminTypes.ReportTypes.PurchaseTaxReport) => row.invoiceNo, pdfWidth: 12 },
        { key: "items", label: "Items", accessor: (row: AdminTypes.ReportTypes.PurchaseTaxReport) => row.items, pdfWidth: 20 },
        { key: "totalAmount", label: "Total Amount", accessor: (row: AdminTypes.ReportTypes.PurchaseTaxReport) => formatNumber(row.totalAmount), pdfWidth: 12 },
        { key: "taxableValue", label: "non taxable value", accessor: (row: AdminTypes.ReportTypes.PurchaseTaxReport) => formatNumber(row.taxableValue), pdfWidth: 12 },
        { key: "taxType", label: "Tax Type", accessor: (row: AdminTypes.ReportTypes.PurchaseTaxReport) => row.taxType, pdfWidth: 10 },
        { key: "taxRate", label: "Tax Rate", accessor: (row: AdminTypes.ReportTypes.PurchaseTaxReport) => `${row.taxRate}%`, pdfWidth: 10 },
        { key: "taxAmount", label: "Tax Amount", accessor: (row: AdminTypes.ReportTypes.PurchaseTaxReport) => formatNumber(row.taxAmount), pdfWidth: 10 },
        { key: "storeName", label: "Store", accessor: (row: AdminTypes.ReportTypes.PurchaseTaxReport) => row.storeName, pdfWidth: 10 },
      ]);
    }
    // Summary export columns
    if (summaryView === "monthly") {
      return CommonComponents.generateExportColumns<AdminTypes.ReportTypes.MonthlyTaxSummary>([
        { key: "period", label: Constants.adminReportsConstants.period, accessor: (row: AdminTypes.ReportTypes.MonthlyTaxSummary) => row.period, pdfWidth: 12 },
        { key: "totalSalesValue", label: Constants.adminReportsConstants.totalSalesValue, accessor: (row: AdminTypes.ReportTypes.MonthlyTaxSummary) => formatNumber(row.totalSalesValue), pdfWidth: 12 },
        { key: "outputTaxCollected", label: Constants.adminReportsConstants.outputTaxCollected, accessor: (row: AdminTypes.ReportTypes.MonthlyTaxSummary) => formatNumber(row.outputTaxCollected), pdfWidth: 12 },
        { key: "totalPurchaseValue", label: Constants.adminReportsConstants.totalPurchaseValue, accessor: (row: AdminTypes.ReportTypes.MonthlyTaxSummary) => formatNumber(row.totalPurchaseValue), pdfWidth: 12 },
        { key: "inputTaxPaid", label: Constants.adminReportsConstants.inputTaxPaid, accessor: (row: AdminTypes.ReportTypes.MonthlyTaxSummary) => formatNumber(row.inputTaxPaid), pdfWidth: 12 },
        { key: "netTaxPayable", label: Constants.adminReportsConstants.netTaxPayable, accessor: (row: AdminTypes.ReportTypes.MonthlyTaxSummary) => formatNumber(row.netTaxPayable), pdfWidth: 12 },
        { key: "taxStatus", label: Constants.adminReportsConstants.taxStatus, accessor: (row: AdminTypes.ReportTypes.MonthlyTaxSummary) => row.taxStatus, pdfWidth: 10 },
        { key: "generatedOn", label: Constants.adminReportsConstants. generatedOn, accessor: (row: AdminTypes.ReportTypes.MonthlyTaxSummary) => row.generatedOn, pdfWidth: 12 },
        { key: "storeName", label: "Store", accessor: (row: AdminTypes.ReportTypes.MonthlyTaxSummary) => row.storeName, pdfWidth: 10 },
      ]);
    }
    return CommonComponents.generateExportColumns<AdminTypes.ReportTypes.AnnualTaxSummary>([
      { key: "financialYear", label: Constants.adminReportsConstants.financialYear, accessor: (row: AdminTypes.ReportTypes.AnnualTaxSummary) => row.financialYear, pdfWidth: 15 },
      { key: "totalOutputTax", label: Constants.adminReportsConstants.totalOutputTax, accessor: (row: AdminTypes.ReportTypes.AnnualTaxSummary) => formatNumber(row.totalOutputTax), pdfWidth: 15 },
      { key: "totalInputTax", label: Constants.adminReportsConstants.totalInputTax, accessor: (row: AdminTypes.ReportTypes.AnnualTaxSummary) => formatNumber(row.totalInputTax), pdfWidth: 15 },
      { key: "netTaxPaid", label: Constants.adminReportsConstants.netTaxPaid, accessor: (row: AdminTypes.ReportTypes.AnnualTaxSummary) => formatNumber(row.netTaxPaid), pdfWidth: 15 },
      { key: "avgMonthlyTax", label: Constants.adminReportsConstants.avgMonthlyTax, accessor: (row: AdminTypes.ReportTypes.AnnualTaxSummary) => formatNumber(row.avgMonthlyTax), pdfWidth: 15 },
      { key: "storeName", label: "Store", accessor: (row: AdminTypes.ReportTypes.AnnualTaxSummary) => row.storeName, pdfWidth: 10 },
    ]);
  }, [activeTab, summaryView, Constants.adminReportsConstants.period, Constants.adminReportsConstants.totalSalesValue, Constants.adminReportsConstants.outputTaxCollected, Constants.adminReportsConstants.totalPurchaseValue, Constants.adminReportsConstants.inputTaxPaid, Constants.adminReportsConstants.netTaxPayable, Constants.adminReportsConstants.taxStatus, Constants.adminReportsConstants.generatedOn, Constants.adminReportsConstants.financialYear, Constants.adminReportsConstants.totalOutputTax, Constants.adminReportsConstants.totalInputTax, Constants.adminReportsConstants.netTaxPaid, Constants.adminReportsConstants.avgMonthlyTax]);

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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-lg sm:text-lg md:text-xl lg:text-2xl font-medium text-textMain dark:text-white truncate">
            {Constants.adminReportsConstants.taxReport}
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-textSmall pt-2">
            {Constants.adminReportsConstants.taxReportBio}
          </p>
        </div>
        {/* Tabs */}
        <div className="flex items-center bg-gray-100 dark:bg-[#1B1B1B] rounded-lg overflow-hidden">
          <button
            type="button"
            onClick={() => {
              setActiveTab("sales");
              setCurrentPage(1);
              setSearchTerm("");
              setStoreFilter("All");
            }}
            className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-all ${
              activeTab === "sales"
                ? "bg-blue-500 dark:bg-blue-600 text-white rounded-l-lg"
                : "bg-white dark:bg-[#3A3A3A] text-gray-600 dark:text-gray-400"
            }`}
          >
            {Constants.adminReportsConstants.salesTaxReport}
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("purchase");
              setCurrentPage(1);
              setSearchTerm("");
              setStoreFilter("All");
            }}
            className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-all ${
              activeTab === "purchase"
                ? "bg-blue-500 dark:bg-blue-600 text-white"
                : "bg-white dark:bg-[#3A3A3A] text-gray-600 dark:text-gray-400"
            }`}
          >
            {Constants.adminReportsConstants.purchaseTaxReport}
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("summary");
              setCurrentPage(1);
              setSearchTerm("");
              setStoreFilter("All");
            }}
            className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-all ${
              activeTab === "summary"
                ? "bg-blue-500 dark:bg-blue-600 text-white rounded-r-lg"
                : "bg-white dark:bg-[#3A3A3A] text-gray-600 dark:text-gray-400"
            }`}
          >
            {Constants.adminReportsConstants.taxSummaryReport}
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white dark:bg-darkFilterbar rounded-[4px]">
        <div className="sm md lg xl 2xl">
          {/* Filters and Table */}
          <div className="bg-white dark:bg-darkFilterbar rounded-[4px] h-full w-full">
            <CommonComponents.CommonFilterBar
              actionFilter="All"
              onActionFilterChange={() => {}}
              actionOptions={[]}
              activeStatusFilter="All"
              onActiveStatusFilterChange={() => {}}
              activeStatusOptions={[]}
              selectedCount={0}
              onApply={() => {}}
              categoryFilter={activeTab === "summary" ? summaryView : "All"}
              onCategoryFilterChange={(value: string) => {
                if (activeTab === "summary") {
                  setSummaryView(value === "monthly" ? "monthly" : "yearly");
                  setCurrentPage(1);
                }
              }}
              categoryOptions={activeTab === "summary" ? [
                { name: Constants.adminReportsConstants.month, value: "monthly" },
                { name: Constants.adminReportsConstants.year, value: "yearly" }
              ] : []}
              showCategoryFilter={activeTab === "summary"}
              statusFilter={storeFilter}
              onStatusFilterChange={(value: string) => setStoreFilter(value === "All" ? "All" : value)}
              statusOptions={[
                { label: Constants.adminReportsConstants.allStores, value: "All" },
                ...uniqueStores.map((s: string) => ({ label: s, value: s }))
              ]}
              statusPlaceholder={Constants.adminReportsConstants.allStores}
              searchTerm={searchTerm}
              onSearchTermChange={setSearchTerm}
              searchPlaceholder={Constants.adminReportsConstants.searchPlaceholder}
              showActionSection={false}
              renderExports={React.useMemo(() => {
                const ExportButton = ({ type, children }: { type: "csv" | "pdf"; children: React.ReactNode }) => (
                  <button
                    type="button"
                    className="rounded-[4px] bg-[#ffffff] dark:bg-[#3A3A3A] border border-[#D8D9D9] border-opacity-50 font-interTight font-normal hover:bg-[#e0e0e0] dark:hover:bg-[#4A4A4A] shadow-sm transition-colors duration-200 cursor-pointer flex-shrink-0 sm:px-1 md:px-2 lg:px-2 xl:px-2 2xl:px-2 px-2 py-[6.9px]"
                    aria-label={`Download ${type.toUpperCase()}`}
                    title={`Download ${type.toUpperCase()}`}
                  >
                    {children}
                  </button>
                );

                return (
                  <>
                    <UiWebComponents.DownloadCSV
                      data={exportConfig.data as any}
                      columns={exportColumns.csvColumns as any}
                      filename={exportConfig.csvFilename}
                      onExport={async () => {
                        UiWebComponents.SwalHelper.success({ text: `${Constants.adminReportsConstants.exportCSV} successfully.` });
                        return exportConfig.data as any;
                      }}
                    >
                      <ExportButton type="csv">
                        <Image src={Constants.assetsIcon.assets.csv} alt="CSV" width={28} height={28} className="w-5 h-5 sm:w-6 sm:h-6 md:w-6 md:h-6 lg:w-7 lg:h-7 xl:w-7 xl:h-7 2xl:w-7 2xl:h-7" />
                      </ExportButton>
                    </UiWebComponents.DownloadCSV>
                    <UiWebComponents.DownloadPDF
                      data={exportConfig.data as any}
                      columns={exportColumns.pdfColumns as any}
                      filename={exportConfig.pdfFilename}
                      title={exportConfig.pdfTitle}
                      orientation="landscape"
                      onExport={async () => {
                        UiWebComponents.SwalHelper.success({ text: `${Constants.adminReportsConstants.exportPDF} successfully.` });
                        return exportConfig.data as any;
                      }}
                    >
                      <ExportButton type="pdf">
                        <Image src={Constants.assetsIcon.assets.pdf} alt="PDF" width={28} height={28} className="w-5 h-5 sm:w-6 sm:h-6 md:w-6 md:h-6 lg:w-7 lg:h-7 xl:w-7 xl:h-7 2xl:w-7 2xl:h-7" />
                      </ExportButton>
                    </UiWebComponents.DownloadPDF>
                  </>
                );
              }, [exportConfig, exportColumns, Constants.adminReportsConstants.exportCSV, Constants.adminReportsConstants.exportPDF])}
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
                data={tableData as any}
                useCustomPagination={true}
                totalRecords={filteredData.length}
                filteredRecords={filteredData.length}
                paginationPerPage={rowsPerPage}
                paginationDefaultPage={currentPage}
                paginationRowsPerPageOptions={[5, 10, 25, 50]}
                onChangePage={handlePageChange}
                onChangeRowsPerPage={handleRowsPerPageChange}
                useUrlParams={false}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

