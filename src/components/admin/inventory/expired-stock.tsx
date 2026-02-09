"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { FaTrash } from "react-icons/fa";
import { expiredStockData } from "@/constant/dummy-data/expired-stock";
import { ServerActions } from "@/lib";
import { Constants } from "@/constant";
import { customHooks } from "@/hooks";
import { WebComponents } from "@/components";
import { AdminTypes } from "@/types";

export default function ExpiredStock() {
  const [expiredStock, setExpiredStock] = React.useState<AdminTypes.InventoryTypes.ExpiredStockTypes.ExpiredStockType[]>(expiredStockData);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [actionFilter, setActionFilter] = React.useState("All");
  const [activeStatusFilter, setActiveStatusFilter] = React.useState("All");
  const [selectedRows, setSelectedRows] = React.useState<AdminTypes.InventoryTypes.ExpiredStockTypes.ExpiredStockType[]>([]);
  const [statusFilter, setStatusFilter] = React.useState("All");
  const router = useRouter();
  const { checkPermission } = customHooks.useUserPermissions();

  // Filtered data
  const filteredData = React.useMemo(() => {
    let filtered = expiredStock;
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(item => {
        return (
          (item.sku && item.sku.toLowerCase().includes(searchLower)) ||
          (item.productName && item.productName.toLowerCase().includes(searchLower)) ||
          (item.manufacturedDate && new Date(item.manufacturedDate).toLocaleDateString().toLowerCase().includes(searchLower)) ||
          (item.expiredDate && new Date(item.expiredDate).toLocaleDateString().toLowerCase().includes(searchLower))
        );
      });
    }
    return filtered;
  }, [expiredStock, searchTerm]);

  // Delete
  const handleDelete = React.useCallback(async (id: string) => {
    await ServerActions.HandleFunction.handleDeleteCommon({
      id,
      deleteAction: async (id: string | number) => {
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
        return { success: true };
      },
      setLoading,
      router,
      successMessage: 'The expired stock item has been deleted.',
      errorMessage: 'Failed to delete expired stock.',
      onSuccess: () => {
        setExpiredStock(prev => prev.filter(item => item.id !== id));
      },
    });
  }, [router]);

  // Dynamic columns
  const tableColumns = React.useMemo(() => WebComponents.WebCommonComponents.CommonComponents.createColumns<AdminTypes.InventoryTypes.ExpiredStockTypes.ExpiredStockType>({
    fields: [
      {
        name: "SKU",
        selector: (row: AdminTypes.InventoryTypes.ExpiredStockTypes.ExpiredStockType) => row.sku,
        sortable: true,
        width: "20%"
      },
      {
        name: "Product Name",
        selector: (row: AdminTypes.InventoryTypes.ExpiredStockTypes.ExpiredStockType) => row.productName,
        sortable: true,
        width: "30%"
      },
      {
        name: "Manufactured Date",
        selector: (row: AdminTypes.InventoryTypes.ExpiredStockTypes.ExpiredStockType) => {
          return row.manufacturedDate ? new Date(row.manufacturedDate).toLocaleDateString() : 'N/A';
        },
        sortable: true,
        width: "20%"
      },
      {
        name: "Expired Date",
        selector: (row: AdminTypes.InventoryTypes.ExpiredStockTypes.ExpiredStockType) => {
          return row.expiredDate ? new Date(row.expiredDate).toLocaleDateString() : 'N/A';
        },
        sortable: true,
        width: "20%"
      },
    ],
    actions: [
      ...(checkPermission("inventory.expiredstock", "delete") ? [{
        render: (row: any) => (
          <WebComponents.UiComponents.UiWebComponents.Button
            size="icon"
            variant="deleteaction"
            className="p-2 border-danger hover:bg-red-50"
            onClick={() => handleDelete(row.id)}
          >
            <FaTrash className="w-4 h-4" />
          </WebComponents.UiComponents.UiWebComponents.Button>
        ),
      }] : []),
    ],
  }), [handleDelete, checkPermission]);

  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">{Constants.adminConstants.expiredStockManagementLabel}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-300">{Constants.adminConstants.viewAndManageExpiredStockItemsLabel}</p>
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
            actionOptions={Constants.commonConstants.actionOptions}
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
            useCustomPagination={true} />
        </div>
      </div>
    </>
  );
}
