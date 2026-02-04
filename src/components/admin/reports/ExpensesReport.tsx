"use client";
import React from "react";
import { Filter } from "lucide-react";
import Image from "next/image";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Constants } from "@/constant";
import { WebComponents } from "@/components";
import { AdminTypes, FiltersTypes, PaginationType } from "@/types";

interface ExpensesReportProps {
    initialData: AdminTypes.ReportTypes.ExpensesReport[];
    initialSummary: AdminTypes.ReportTypes.ExpensesReportSummary | null;
    initialCategoryBreakdown?: AdminTypes.ReportTypes.ExpensesCategoryBreakdown[];
    initialStores: AdminTypes.storeTypes.Store[];
    initialPagination: PaginationType.Pagination;
}

export default function ExpensesReportPage({ initialData, initialSummary, initialCategoryBreakdown, initialStores, initialPagination }: ExpensesReportProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [expensesReport, setExpensesReport] = React.useState<AdminTypes.ReportTypes.ExpensesReport[]>(initialData);
    const [pagination, setPagination] = React.useState<PaginationType.Pagination>(initialPagination);
    const [searchTerm, setSearchTerm] = React.useState(searchParams.get("search") || "");
    const [storeFilter, setStoreFilter] = React.useState(searchParams.get("store") || "All");

    // Filter modal state
    const [isFilterModalOpen, setIsFilterModalOpen] = React.useState(false);
    const [filterValues, setFilterValues] = React.useState({
        store: searchParams.get("store") || "All",
        status: searchParams.get("status") || "All",
        category: searchParams.get("category") || "All",
        dateFrom: searchParams.get("dateFrom") || "",
        dateTo: searchParams.get("dateTo") || "",
        amountMin: searchParams.get("amountMin") || "",
        amountMax: searchParams.get("amountMax") || ""
    });

    // Reset filter values to defaults when modal opens
    const handleOpenFilterModal = () => {
        setFilterValues({
            store: "All",
            status: "All",
            category: "All",
            dateFrom: "",
            dateTo: "",
            amountMin: "",
            amountMax: ""
        });
        setIsFilterModalOpen(true);
    };

    // Debounce Search
    React.useEffect(() => {
        const timer = setTimeout(() => {
            const params = new URLSearchParams(searchParams.toString());
            if (searchTerm) {
                params.set("search", searchTerm);
            } else {
                params.delete("search");
            }

            // Only push if changed
            if (params.toString() !== searchParams.toString()) {
                params.set("page", "1");
                router.push(`${pathname}?${params.toString()}`);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm, pathname, router, searchParams]);

    React.useEffect(() => {
        setExpensesReport(initialData);
        setPagination(initialPagination);
    }, [initialData]);

    // Update Store Filter URL
    const handleStoreFilterChange = (value: string) => {
        setStoreFilter(value);
        const params = new URLSearchParams(searchParams.toString());
        if (value !== "All") {
            params.set("store", value);
        } else {
            params.delete("store");
        }
        params.set("page", "1");
        router.push(`${pathname}?${params.toString()}`);
    };

    // Get unique values for filters (from current page data)
    const uniqueCategories = React.useMemo(() => {
        if (initialCategoryBreakdown && initialCategoryBreakdown.length > 0) {
            return initialCategoryBreakdown.map(item => item.categoryName);
        }
        return Array.from(new Set(initialData.map(item => item.expenseCategory)));
    }, [initialData, initialCategoryBreakdown]);

    const handleApplyFilters = () => {
        const params = new URLSearchParams(searchParams.toString());

        if (filterValues.store !== "All") params.set("store", filterValues.store); else params.delete("store");
        if (filterValues.category !== "All") params.set("category", filterValues.category); else params.delete("category");
        if (filterValues.status !== "All") params.set("status", filterValues.status); else params.delete("status");
        if (filterValues.dateFrom) params.set("dateFrom", filterValues.dateFrom); else params.delete("dateFrom");
        if (filterValues.dateTo) params.set("dateTo", filterValues.dateTo); else params.delete("dateTo");
        if (filterValues.amountMin) params.set("amountMin", filterValues.amountMin); else params.delete("amountMin");
        if (filterValues.amountMax) params.set("amountMax", filterValues.amountMax); else params.delete("amountMax");

        params.set("page", "1");
        router.push(`${pathname}?${params.toString()}`);
        setIsFilterModalOpen(false);
    };

    const handleResetFilters = () => {
        setFilterValues({
            store: "All",
            status: "All",
            category: "All",
            dateFrom: "",
            dateTo: "",
            amountMin: "",
            amountMax: ""
        });
        setStoreFilter("All");
        setSearchTerm("");
        router.push(pathname); // Clear all params
    };

    const filterConfig: FiltersTypes.FilterFieldConfig[] = [
        {
            type: "select",
            label: "Select Store",
            key: "store",
            options: [
                { label: "All Stores", value: "All" },
                ...(initialStores || []).map(store => ({ label: store.name, value: store.name })),
            ]
        },
        {
            type: "select",
            label: "Select Category",
            key: "category",
            options: [
                { label: "All Categories", value: "All" },
                ...uniqueCategories.map(cat => ({ label: cat, value: cat }))
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
            label: "Amount Range",
            minKey: "amountMin",
            maxKey: "amountMax"
        }
    ];

    // Table columns
    const tableColumns = React.useMemo(() => WebComponents.WebCommonComponents.CommonComponents.createColumns<AdminTypes.ReportTypes.ExpensesReport>({
        fields: [
            { name: "Expense Name", selector: (row: AdminTypes.ReportTypes.ExpensesReport) => row.expenseName, sortable: true, width: "16%" },
            { name: "Category", selector: (row: AdminTypes.ReportTypes.ExpensesReport) => row.expenseCategory, sortable: true, width: "12%" },
            {
                name: "Description",
                selector: (row: AdminTypes.ReportTypes.ExpensesReport) => row.description,
                cell: (row: AdminTypes.ReportTypes.ExpensesReport) => (
                    <span className="truncate max-w-xs" title={row.description}>
                        {row.description}
                    </span>
                ),
                sortable: true,
                width: "20%"
            },
            { name: "Store", selector: (row: AdminTypes.ReportTypes.ExpensesReport) => row.store, sortable: true, width: "10%" },
            {
                name: "Amount",
                selector: (row: AdminTypes.ReportTypes.ExpensesReport) => row.amount,
                cell: (row: AdminTypes.ReportTypes.ExpensesReport) => (
                    <span>${row.amount.toFixed(2)}</span>
                ),
                sortable: true,
                width: "12%"
            },
            {
                name: "Date",
                selector: (row: AdminTypes.ReportTypes.ExpensesReport) => row.approvedDate ? new Date(row.approvedDate).toLocaleDateString() : "-",
                sortable: true,
                width: "10%"
            },
            {
                name: "Status",
                selector: (row: AdminTypes.ReportTypes.ExpensesReport) => row.status,
                sortable: true,
                cell: (row: AdminTypes.ReportTypes.ExpensesReport) => (
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold`}>
                        {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                    </span>
                ),
                width: "10%"
            },
            { name: "Expense By", selector: (row: AdminTypes.ReportTypes.ExpensesReport) => row.expenseBy, sortable: true, width: "10%" },
        ],
    }), []);

    // Export columns
    const exportColumns = React.useMemo(() => {
        return WebComponents.WebCommonComponents.CommonComponents.generateExportColumns<AdminTypes.ReportTypes.ExpensesReport>([
            { key: "expenseName", label: "Expense Name", accessor: (row) => row.expenseName, pdfWidth: 18 },
            { key: "expenseCategory", label: "Category", accessor: (row) => row.expenseCategory, pdfWidth: 12 },
            { key: "description", label: "Description", accessor: (row) => row.description, pdfWidth: 22 },
            { key: "store", label: "Store", accessor: (row) => row.store, pdfWidth: 10 },
            { key: "amount", label: "Amount", accessor: (row) => row.amount.toFixed(2), pdfWidth: 10 },
            { key: "approvedDate", label: "Date", accessor: (row) => new Date(row.approvedDate).toLocaleDateString(), pdfWidth: 10 },
            { key: "status", label: "Status", accessor: (row) => row.status, pdfWidth: 10 },
            { key: "expenseBy", label: "Expense By", accessor: (row) => row.expenseBy, pdfWidth: 12 },
        ]);
    }, []);


    const totalRow = (
        <div className="flex w-full bg-[#F7F7F7] dark:bg-[#333333] border-t border-[#F4F5F5] dark:border-[#616161]">
            <div style={{ width: "16%" }} className="p-4 font-bold text-sm text-[#171B23] dark:text-white flex items-center">Total</div>
            <div style={{ width: "12%" }} className="p-4 flex items-center"></div>
            <div style={{ width: "20%" }} className="p-4 flex items-center"></div>
            <div style={{ width: "10%" }} className="p-4 flex items-center"></div>
            <div style={{ width: "12%" }} className="p-4 font-bold text-sm text-[#171B23] dark:text-white flex items-center">
                ${initialSummary?.totalAmount.toFixed(2) ?? "0.00"}
            </div>
            <div style={{ width: "10%" }} className="p-4 flex items-center"></div>
            <div style={{ width: "10%" }} className="p-4 flex items-center"></div>
            <div style={{ width: "10%" }} className="p-4 flex items-center"></div>
        </div>
    );

    return (
        <>
            <WebComponents.AdminComponents.AdminWebComponents.Models.ExtendedFiltersModal
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
                        {Constants.adminReportsConstants.expensesReport}
                    </h1>
                    <p className="text-xs sm:text-sm md:text-base text-textSmall pt-2">
                        {Constants.adminReportsConstants.expensesReportBio}
                    </p>
                </div>
            </div>

            {/* Filters and Table */}
            <div className="bg-white dark:bg-darkFilterbar rounded-[4px] h-full w-full mt-4 overflow-hidden">
                <WebComponents.WebCommonComponents.CommonComponents.CommonFilterBar
                    actionFilter="All"
                    activeStatusFilter="All"
                    selectedCount={0}
                    categoryFilter="All"
                    showCategoryFilter={false}
                    statusFilter={storeFilter}
                    onStatusFilterChange={handleStoreFilterChange}
                    statusOptions={[
                        { label: Constants.adminReportsConstants.allStores, value: "All" },
                        ...(initialStores || []).map(store => ({ label: store.name, value: store.name })),
                    ]}
                    statusPlaceholder={Constants.adminReportsConstants.allStores}
                    searchTerm={searchTerm}
                    onSearchTermChange={setSearchTerm}
                    searchPlaceholder={Constants.adminReportsConstants.searchPlaceholder}
                    showActionSection={false}
                    renderExports={
                        <>
                            <WebComponents.UiWebComponents.UiWebComponents.DownloadCSV
                                data={initialData}
                                columns={exportColumns.csvColumns as any}
                                filename={`expenses-report-${new Date().toISOString().split("T")[0]}.csv`}
                                onExport={async () => {
                                    WebComponents.UiWebComponents.UiWebComponents.SwalHelper.success({ text: `${Constants.adminReportsConstants.exportCSV} successfully.` });
                                    return initialData;
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
                                data={initialData}
                                columns={exportColumns.pdfColumns as any}
                                filename={`expenses-report-${new Date().toISOString().split("T")[0]}.pdf`}
                                title={Constants.adminReportsConstants.expensesReport}
                                orientation="landscape"
                                onExport={async () => {
                                    WebComponents.UiWebComponents.UiWebComponents.SwalHelper.success({ text: `${Constants.adminReportsConstants.exportPDF} successfully.` });
                                    return initialData;
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
                            onClick={handleOpenFilterModal}
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
                        data={expensesReport}
                        useCustomPagination={true}
                        totalRecords={pagination.totalItems}
                        filteredRecords={pagination.totalItems}
                        paginationPerPage={pagination.itemsPerPage}
                        paginationDefaultPage={pagination.currentPage}
                        paginationRowsPerPageOptions={[5, 10, 25, 50]}
                        useUrlParams={true}
                        totalReports={true}
                        totalRow={totalRow}
                    />
                </div>
            </div>
        </>
    );
}
