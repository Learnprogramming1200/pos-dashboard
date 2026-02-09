"use client";
import React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Constants } from "@/constant";
import { WebComponents } from "@/components";
import { PaginationType, AdminTypes } from "@/types";
import { customHooks } from "@/hooks";

export default function LowStock({
  initialLowStockItems,
  initialPagination,
}: {
  readonly initialLowStockItems: AdminTypes.InventoryTypes.LowStocksTypes.LowStockType[];
  readonly initialPagination: PaginationType.Pagination;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [lowStockItems, setLowStockItems] = React.useState<AdminTypes.InventoryTypes.LowStocksTypes.LowStockType[]>(initialLowStockItems);
  const [pagination, setPagination] = React.useState<PaginationType.Pagination>(initialPagination);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [actionFilter, setActionFilter] = React.useState("All");
  const [activeStatusFilter, setActiveStatusFilter] = React.useState("All");
  const [selectedRows, setSelectedRows] = React.useState<AdminTypes.InventoryTypes.LowStocksTypes.LowStockType[]>([]);
  const [statusFilter, setStatusFilter] = React.useState("All");
  const { checkPermission } = customHooks.useUserPermissions();

  // Sync state with props when URL params change (server re-fetches data)
  React.useEffect(() => {
    setLowStockItems(initialLowStockItems);
    setPagination(initialPagination);
  }, [initialLowStockItems]);

  // Filtered data
  const filteredData = React.useMemo(() => {
    let filtered = lowStockItems;
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(item => {
        return (
          (item.Store && item.Store.toLowerCase().includes(searchLower)) ||
          (item.Product && item.Product.toLowerCase().includes(searchLower)) ||
          (item.Category && item.Category.toLowerCase().includes(searchLower)) ||
          (item.SKU && item.SKU.toLowerCase().includes(searchLower)) ||
          (item["Current Qty"] && item["Current Qty"].toString().includes(searchLower)) ||
          (item["Qty Alert"] && item["Qty Alert"].toString().includes(searchLower))
        );
      });
    }
    return filtered;
  }, [lowStockItems, searchTerm]);

  const bulkActionOptions = React.useMemo(() => {
    const options = Constants.commonConstants.actionOptions;
    return options.filter(option => {
      if (option.value === 'Status') {
        return checkPermission("inventory.lowstock", "update");
      }
      if (option.value === 'Delete') {
        return checkPermission("inventory.lowstock", "delete");
      }
      return true;
    });
  }, [checkPermission]);

  // Dynamic columns
  const tableColumns = React.useMemo(() => WebComponents.WebCommonComponents.CommonComponents.createColumns<AdminTypes.InventoryTypes.LowStocksTypes.LowStockType>({
    fields: [
      {
        name: "Store",
        selector: (row: AdminTypes.InventoryTypes.LowStocksTypes.LowStockType) => row.Store,
        sortable: true,
      },
      {
        name: "Product",
        selector: (row: AdminTypes.InventoryTypes.LowStocksTypes.LowStockType) => row.Product,
        sortable: true,
      },
      {
        name: "Category",
        selector: (row: AdminTypes.InventoryTypes.LowStocksTypes.LowStockType) => row.Category,
        sortable: true,
      },
      {
        name: "SKU",
        selector: (row: AdminTypes.InventoryTypes.LowStocksTypes.LowStockType) => row.SKU,
        sortable: true,
      },
      {
        name: "Current Qty",
        selector: (row: AdminTypes.InventoryTypes.LowStocksTypes.LowStockType) => row["Current Qty"],
        sortable: true,
      },
      {
        name: "Qty Alert",
        selector: (row: AdminTypes.InventoryTypes.LowStocksTypes.LowStockType) => row["Qty Alert"],
        sortable: true,
      },
    ],
  }), []);

  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">{Constants.adminConstants.lowStockManagementLabel}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-300">{Constants.adminConstants.viewAndManageLowStockItemsLabel}</p>
        </div>
      </div>

      {/* Filters and Table */}
      <div className="bg-white dark:bg-darkFilterbar rounded-[4px] h-full w-full mt-4 overflow-hidden">
        {/* Filters - Only Search on Right */}
        <div className="[&>div>div>div:first-child]:hidden [&>div>div>div:last-child>div:first-of-type]:hidden [&>div>div]:justify-end">
          <WebComponents.WebCommonComponents.CommonComponents.CommonFilterBar
            actionFilter={actionFilter}
            onActionFilterChange={(value: string) => {
              setActionFilter(value);
              if (value !== 'Status') {
                setActiveStatusFilter('All');
              }
            }}
            actionOptions={bulkActionOptions}
            activeStatusFilter={activeStatusFilter}
            onActiveStatusFilterChange={setActiveStatusFilter}
            activeStatusOptions={Constants.commonConstants.activeStatusOptions}
            selectedCount={selectedRows.length}
            onApply={() => { }}
            categoryFilter="All"
            onCategoryFilterChange={() => { }}
            categoryOptions={[]}
            showCategoryFilter={false}
            statusFilter={statusFilter}
            onStatusFilterChange={(value: string) => {
              const validValue = value === "Active" || value === "Inactive" ? value : "All";
              setStatusFilter(validValue);
            }}
            statusOptions={[
              { label: 'All Status', value: 'All' },
              { label: 'Active', value: 'Active' },
              { label: 'Inactive', value: 'Inactive' },
            ]}
            searchTerm={searchTerm}
            onSearchTermChange={setSearchTerm}
            searchPlaceholder="Search"
            showActionSection={false}
            renderExports={null}
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-b-md">
          <WebComponents.WebCommonComponents.CommonComponents.DataTable
            keyField="id"
            columns={tableColumns}
            data={filteredData}
            selectableRows
            onSelectedRowsChange={({ selectedRows }) => setSelectedRows(selectedRows)}
            useCustomPagination={true}
            totalRecords={pagination.totalItems}
            filteredRecords={pagination.totalItems}
            paginationPerPage={pagination.itemsPerPage}
            paginationDefaultPage={pagination.currentPage}
            paginationRowsPerPageOptions={[5, 10, 25, 50]}
            onChangePage={(page) => {
              const params = new URLSearchParams(searchParams.toString());
              params.set("page", page.toString());
              router.push(`${pathname}?${params.toString()}`, { scroll: false });
            }}
            onChangeRowsPerPage={(perPage) => {
              const params = new URLSearchParams(searchParams.toString());
              params.set("limit", perPage.toString());
              params.set("page", "1");
              router.push(`${pathname}?${params.toString()}`, { scroll: false });
            }}
            useUrlParams={true}
          />
        </div>
      </div>
    </>
  );
}
