"use client";
import React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import { ServerActions } from "@/lib";
import { Constants } from "@/constant";
import { customHooks } from "@/hooks";
import { WebComponents } from "@/components";
import { AdminTypes, PaginationType } from "@/types";

export default function ExpenseManagement({ initialCategories, initialStores, initialExpenses, initialPagination }: {
  readonly initialCategories: AdminTypes.ExpenseTypes.Expense.ExpenseCategory[],
  readonly initialStores: AdminTypes.storeTypes.Store[],
  readonly initialExpenses: AdminTypes.ExpenseTypes.Expense.Expense[],
  readonly initialPagination: PaginationType.Pagination;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [expenses, setExpenses] = React.useState<AdminTypes.ExpenseTypes.Expense.Expense[]>(initialExpenses as unknown as AdminTypes.ExpenseTypes.Expense.Expense[]);
  const [categories, setCategories] = React.useState<AdminTypes.ExpenseTypes.Expense.ExpenseCategory[]>(initialCategories);
  const [stores, setStores] = React.useState<AdminTypes.storeTypes.Store[]>(initialStores);
  const [pagination, setPagination] = React.useState<PaginationType.Pagination>(initialPagination);
  const [showModal, setShowModal] = React.useState(false);
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [showDetailsModal, setShowDetailsModal] = React.useState(false);
  const [editingExpense, setEditingExpense] = React.useState<AdminTypes.ExpenseTypes.Expense.Expense | null>(null);
  const [selectedExpense, setSelectedExpense] = React.useState<AdminTypes.ExpenseTypes.Expense.Expense | null>(null);
  const [actionFilter, setActionFilter] = React.useState<string>("All");
  const [activeStatusFilter, setActiveStatusFilter] = React.useState<string>("All");
  const [selectedRows, setSelectedRows] = React.useState<AdminTypes.ExpenseTypes.Expense.Expense[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [clearSelectedRows, setClearSelectedRows] = React.useState(false);
  const [downloadData, setDownloadData] = React.useState<AdminTypes.ExpenseTypes.Expense.Expense[]>([]);
  const { searchTerm, setSearchTerm, allStatusFilter, setAllStatusFilter, selectedCategoryFilter, setSelectedCategoryFilter, filteredData } = customHooks.useListFilters<AdminTypes.ExpenseTypes.Expense.Expense>(
    expenses,
  )
  /* Permissions */
  const { checkPermission } = customHooks.useUserPermissions();

  const bulkActionOptions = React.useMemo(() => {
    const options = Constants.commonConstants.actionOptions;
    return options.filter(option => {
      if (option.value === 'Status') {
        return checkPermission("finance.expense", "update");
      }
      if (option.value === 'Delete') {
        return checkPermission("finance.expense", "delete");
      }
      return true;
    });
  }, [checkPermission]);

  React.useEffect(() => {
    setCategories(initialCategories);
    setStores(initialStores);
    setPagination(initialPagination);
    setExpenses(initialExpenses);
  }, [initialExpenses]);

  React.useEffect(() => {
    if (selectedRows.length === 0) {
      setActionFilter('All');
      setActiveStatusFilter('All');
    }
  }, [selectedRows]);

  const activeStatusOptions = React.useMemo(() => [
    { name: 'Approved', value: 'approved' },
    { name: 'Rejected', value: 'rejected' },
    // { name: 'Pending', value: 'pending' }
  ], []);

  const categoryOptions = React.useMemo(() => [
    { name: 'All Category', value: 'All' },
    ...categories.map(c => ({ name: c.name, value: c._id }))
  ], [categories]);

  const clearSelectedData = () => {
    setClearSelectedRows(prev => !prev);
    setSelectedRows([]);
    router.refresh();
  };
  const statusOptions = React.useMemo(() => [
    { label: 'All Status', value: 'All' },
    { label: 'Pending', value: 'pending' },
    { label: 'Approved', value: 'approved' },
    { label: 'Rejected', value: 'rejected' },
  ], []);

  const handleEditClick = (expense: AdminTypes.ExpenseTypes.Expense.Expense) => {
    setEditingExpense(expense);
    setShowEditModal(true);
  };

  // View Details
  const handleViewDetails = (expense: AdminTypes.ExpenseTypes.Expense.Expense) => {
    setSelectedExpense(expense);
    setShowDetailsModal(true);
  };

  // Bulk apply handler (status update / delete)
  const handleBulkApply = async () => {
    await ServerActions.HandleFunction.handleBulkApplyCommon({
      selectedRows,
      actionFilter,
      activeStatusFilter,
      items: expenses,
      setItems: setExpenses,
      bulkDeleteAction: ServerActions.ServerActionslib.bulkDeleteExpensesAction,
      bulkUpdateStatusAction: ServerActions.ServerActionslib.bulkUpdateExpensesStatusAction,
      clearSelectedData,
      idSelector: (r) => r._id,
    });
  };

  // handle download 
  const downloadPdf = async (): Promise<any[]> => {
    return await ServerActions.HandleFunction.handleDownloadCommon({
      selectedRows,
      searchParams: new URLSearchParams(searchParams.toString()),
      bulkGetSelectedAction: ServerActions.ServerActionslib.bulkGetSelectedExpensesAction,
      bulkGetAllAction: ServerActions.ServerActionslib.bulkGetExpensesAction,
      setDownloadData,
      idSelector: (item) => item._id,
    });
  };

  const exportColumns = React.useMemo(() => {
    return WebComponents.WebCommonComponents.CommonComponents.generateExportColumns<AdminTypes.ExpenseTypes.Expense.Expense>([
      { key: 'storeName', label: 'Store', accessor: (row) => row.store?.name || '-', pdfWidth: 40 },
      { key: 'categoryName', label: 'Category', accessor: (row) => row.category.name, pdfWidth: 30 },
      { key: 'amount', label: 'Amount', accessor: (row) => `Rs. ${row.amount.toLocaleString()}`, pdfWidth: 20 },
      { key: 'description', label: 'Description', accessor: (row) => row.description || '-', pdfWidth: 50 },
      {
        key: 'expenseDate', label: 'Date', accessor: (row) => {
          const date = row.expenseDate;
          if (!date) return "-";
          const [y, m, d] = date.split("T")[0].split("-");
          return `${d}-${m}-${y}`;
        }, pdfWidth: 30
      },
      { key: 'paymentMethod', label: 'Payment', accessor: (row) => row.paymentMethod, pdfWidth: 30 },
      { key: 'status', label: 'Status', accessor: (row) => row.status, pdfWidth: 25 },
      { key: 'rejectionReason', label: 'Rejected Reason', accessor: (row) => row?.rejectionReason || '-', pdfWidth: 40 },
    ]);
  }, []);

  const handleDelete = async (id: string) => {
    await ServerActions.HandleFunction.handleDeleteCommon({
      id,
      deleteAction: (id: string | number) =>
        ServerActions.ServerActionslib.deleteExpenseAction(id as string),
      setLoading,
      router,
      successMessage: "Expense deleted successfully",
      errorMessage: "Failed to delete expense",
      onSuccess: () => {
        setExpenses((prev) => prev.filter((e) => e._id !== id));
      },
    });
  };

  const handleStatusChange = async (row: AdminTypes.ExpenseTypes.Expense.Expense, newStatus: 'approved' | 'pending' | 'rejected') => {
    if (!checkPermission("finance.expense", "update")) {
      WebComponents.UiComponents.UiWebComponents.SwalHelper.error({ text: "You do not have permission to update status." });
      return;
    }
    if (newStatus === row.status) return;
    let reason = '';
    // If rejecting, show popup to get reason (Pattern from StockTransfers.tsx)
    if (newStatus === 'rejected') {
      const result = await WebComponents.UiComponents.UiWebComponents.SwalHelper.custom({
        title: 'Reject Expense',
        text: 'Please provide a reason for rejection:',
        input: 'textarea',
        inputPlaceholder: 'Enter rejection reason...',
        showCancelButton: true,
        confirmButtonText: 'Reject Expense',
        cancelButtonText: 'Go Back',
        confirmButtonColor: '#ef4444',
        inputValidator: (value: string) => {
          if (!value || value.trim() === '') {
            return 'Rejection reason is required!';
          }
          return null;
        }
      } as any);

      if (!result.isConfirmed || !result.value) {
        return; // User cancelled or didn't provide reason
      }
      reason = result.value.trim();
    }

    // Optimistic update
    const previous = expenses;
    setExpenses(prev => prev.map(expense =>
      expense._id === row._id
        ? { ...expense, status: newStatus, rejectionReason: newStatus === 'rejected' ? reason : expense.rejectionReason, updatedAt: new Date().toISOString() }
        : expense
    ));

    try {
      let result;
      // Call appropriate action based on status (StockTransfer pattern)
      switch (newStatus) {
        case 'approved':
          result = await ServerActions.ServerActionslib.approveExpenseAction(row._id);
          break;
        case 'rejected':
          result = await ServerActions.ServerActionslib.rejectExpenseAction(row._id, reason);
          break;
        default:
          result = await ServerActions.ServerActionslib.updateExpenseAction(row._id, { status: newStatus });
      }

      if (result && result.success) {
        // Refresh financial metrics if approved
        WebComponents.UiComponents.UiWebComponents.SwalHelper.success({
          text: `Expense status updated to ${newStatus} successfully.`
        });
        // Sync with server
        router.refresh();
        // Update local state with returned data if available
        if (result.data) {
          const updatedItem = result.data.data || result.data;
          setExpenses(prev => prev.map(e => e._id === row._id ? { ...e, ...updatedItem } : e));
        }
      } else {
        throw new Error(result?.error || 'Failed to update status');
      }
    } catch (error) {
      // Revert on error
      console.error('Failed to change expense status:', error);
      setExpenses(previous);
      const msg = error instanceof Error ? error.message : 'Failed to update expense status.';
      WebComponents.UiComponents.UiWebComponents.SwalHelper.error({ text: msg });
    }
  };

  const tableColumns = React.useMemo(() => WebComponents.WebCommonComponents.CommonComponents.createColumns<AdminTypes.ExpenseTypes.Expense.Expense>({
    fields: [
      { name: "Store", selector: (row: AdminTypes.ExpenseTypes.Expense.Expense) => row.store?.name, sortable: true, width: "8%" },
      { name: "Expense Category", selector: (row: AdminTypes.ExpenseTypes.Expense.Expense) => row.category.name, sortable: true },
      {
        name: "Amount",
        selector: (row: AdminTypes.ExpenseTypes.Expense.Expense) => row.amount.toString(),
        cell: (row: AdminTypes.ExpenseTypes.Expense.Expense) => (
          <span className="font-medium">₹{row.amount.toLocaleString()}</span>
        ),
        sortable: true,
        width: "10%"
      },
      { name: "Description", selector: (row: AdminTypes.ExpenseTypes.Expense.Expense) => row.description, sortable: false },
      {
        name: "Expense Date",
        selector: (row: AdminTypes.ExpenseTypes.Expense.Expense) => row.expenseDate,
        cell: (row: AdminTypes.ExpenseTypes.Expense.Expense) => {
          const date = row.expenseDate;
          if (!date) return "";
          // Expecting ISO yyyy-mm-dd or full ISO string; format to dd-mm-yyyy
          const [y, m, d] = date.split("T")[0].split("-");
          return `${d}-${m}-${y}`;
        },
        sortable: true
      },
      { name: "Payment Method", selector: (row: AdminTypes.ExpenseTypes.Expense.Expense) => row.paymentMethod, sortable: true },
      {
        name: "Status",
        selector: (row: AdminTypes.ExpenseTypes.Expense.Expense) => row.status,
        cell: (row: AdminTypes.ExpenseTypes.Expense.Expense) => (
          <div className="flex justify-center">
            <WebComponents.AdminComponents.AdminWebComponents.FinanceAdminWebComponents.ExpenseStatusSelect
              currentStatus={row.status}
              onStatusChange={(newStatus) => handleStatusChange(row, newStatus)}
            />
          </div>
        ),
      },
      {
        name: "Rejection reson",
        selector: (row) => row.rejectionReason || "-",
        cell: (row: AdminTypes.ExpenseTypes.Expense.Expense) => (
          <div className="w-full">
            {row.rejectionReason ? (
              <span className="text-sm text-gray-600 dark:text-gray-300 truncate block w-full" title={row.rejectionReason}>
                {row.rejectionReason}
              </span>
            ) : (
              <span className="text-gray-400 dark:text-gray-500">-</span>
            )}
          </div>
        )
      },
    ],
    actions: [
      {
        render: (row) => (
          <WebComponents.UiComponents.UiWebComponents.Button size="icon" variant="viewaction" onClick={() => handleViewDetails(row)}>
            <FaEye className="w-4 h-4" />
          </WebComponents.UiComponents.UiWebComponents.Button>
        )
      },
      {
        render: (row) => (
          row.status === "pending" && (checkPermission("finance.expense", "update")) &&
          <WebComponents.UiComponents.UiWebComponents.Button size="icon" variant="editaction" onClick={() => handleEditClick(row)}>
            <FaEdit className="w-4 h-4" />
          </WebComponents.UiComponents.UiWebComponents.Button>
        )
      },
      {
        render: (row) => (
          row.status === "pending" && (checkPermission("finance.expense", "delete")) &&
          <WebComponents.UiComponents.UiWebComponents.Button size="icon" variant="deleteaction" onClick={() => handleDelete(row._id)}>
            <FaTrash className="w-4 h-4" />
          </WebComponents.UiComponents.UiWebComponents.Button>
        )
      }
    ]
  }), [handleStatusChange, handleViewDetails, handleEditClick, handleDelete]);

  // Add
  const handleAdd = async (formData: any) => {
    const selectedStore = stores.find(s => s.name === formData.store || s._id === formData.store || (s as any).id === formData.store);
    const storeIdForApi = selectedStore?._id || (selectedStore as any)?.id || formData.store;
    const apiPayload: Record<string, unknown> = {
      expenseDate: formData.expenseDate,
      category: formData.categoryId,
      store: storeIdForApi,
      description: formData.description,
      amount: formData.amount,
      paymentMethod: formData.paymentMethod,
      status: 'pending',
      notes: formData.notes,
      attachments: formData.attachments || [],
      // Payment specific fields
      cardNumber: formData.cardNumber,
      cardHolderName: formData.cardHolderName,
      cardType: formData.cardType,
      expiryMonth: formData.expiryMonth,
      expiryYear: formData.expiryYear,
      bankName: formData.bankName,
      branchName: formData.branchName,
      accountNumber: formData.accountNumber,
      ifscCode: formData.ifscCode,
      chequeNumber: formData.chequeNumber,
    };
    await ServerActions.HandleFunction.handleAddCommon({
      formData: apiPayload,
      createAction: ServerActions.ServerActionslib.createExpenseAction,
      setLoading,
      setShowModal,
      router,
      successMessage: "Expense created successfully",
      errorMessage: "Failed to create expense",
      onSuccess: (resultData) => {
        const created = (resultData?.data ?? resultData) as any;
        const newExpense: AdminTypes.ExpenseTypes.Expense.Expense = {
          _id: created?.id ?? created?._id ?? Date.now().toString(),
          store: selectedStore ? { _id: selectedStore._id, name: selectedStore.name } : { _id: storeIdForApi, name: formData.store },
          categoryId: formData.categoryId,
          categoryName: categories.find(c => c._id === formData.categoryId)?.name || "",
          amount: Number(formData.amount),
          description: formData.description,
          expenseDate: formData.expenseDate,
          paymentMethod: formData.paymentMethod,
          reference: created?.reference ?? "",
          notes: formData.notes,
          status: "pending",
          category: {
            _id: formData.categoryId,
            name: categories.find(c => c._id === formData.categoryId)?.name || "",
          },
          createdBy: "Admin",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          attachments: formData.attachments || [],
          // Payment specific fields
          cardNumber: formData.cardNumber,
          cardHolderName: formData.cardHolderName,
          cardType: formData.cardType,
          expiryMonth: formData.expiryMonth,
          expiryYear: formData.expiryYear,
          bankName: formData.bankName,
          branchName: formData.branchName,
          accountNumber: formData.accountNumber,
          ifscCode: formData.ifscCode,
          chequeNumber: formData.chequeNumber,
        };
        setExpenses(prev => [newExpense, ...prev]);
      },
    });
  };

  // Edit
  const handleEdit = async (formData: any) => {
    if (!editingExpense) return;
    const selectedStore = stores.find(s => s.name === formData.store || s._id === formData.store || (s as any).id === formData.store);
    const storeIdForApi = selectedStore?._id || (selectedStore as any)?.id || formData.store;
    const apiPayload: Record<string, unknown> = {
      expenseDate: formData.expenseDate,
      category: formData.categoryId,
      store: storeIdForApi,
      description: formData.description,
      amount: formData.amount,
      paymentMethod: formData.paymentMethod,
      status: editingExpense.status,
      attachments: formData.attachments || editingExpense.attachments || [],
      // Payment specific fields
      cardNumber: formData.cardNumber,
      cardHolderName: formData.cardHolderName,
      cardType: formData.cardType,
      expiryMonth: formData.expiryMonth,
      expiryYear: formData.expiryYear,
      bankName: formData.bankName,
      branchName: formData.branchName,
      accountNumber: formData.accountNumber,
      ifscCode: formData.ifscCode,
      chequeNumber: formData.chequeNumber,
    };
    await ServerActions.HandleFunction.handleEditCommon({
      editingItem: editingExpense,
      getId: (item) => item._id,
      formData: apiPayload,
      updateAction: (id, data) => ServerActions.ServerActionslib.updateExpenseAction(id as string, data),
      setLoading,
      setShowEditModal,
      setEditingItem: setEditingExpense,
      router,
      successMessage: "Expense updated successfully",
      errorMessage: "Failed to update expense",
      onSuccess: (resultData) => {
        setExpenses(prev => prev.map(expense =>
          expense._id === editingExpense._id
            ? {
              ...expense,
              store: selectedStore ? { _id: selectedStore._id, name: selectedStore.name } : { _id: storeIdForApi, name: formData.store },
              categoryId: formData.categoryId,
              categoryName: categories.find(c => c._id === formData.categoryId)?.name || expense.categoryName,
              amount: Number(formData.amount),
              description: formData.description,
              expenseDate: formData.expenseDate,
              paymentMethod: formData.paymentMethod,
              updatedAt: new Date().toISOString(),
              // Payment specific fields
              cardNumber: formData.cardNumber,
              cardHolderName: formData.cardHolderName,
              cardType: formData.cardType,
              expiryMonth: formData.expiryMonth,
              expiryYear: formData.expiryYear,
              bankName: formData.bankName,
              branchName: formData.branchName,
              accountNumber: formData.accountNumber,
              ifscCode: formData.ifscCode,
              chequeNumber: formData.chequeNumber,
            }
            : expense
        ));
        setEditingExpense(null);
      },
    });
  };

  return (
    <>
      <div id="portal-root" />
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-lg sm:text-lg md:text-xl lg:text-2xl font-medium text-textMain dark:text-white truncate">
            {showModal || showEditModal
              ? `Expenses > ${showModal ? "Add Expense" : "Edit Expense"}`
              : "Expenses"}
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-textSmall pt-2">
            {showModal || showEditModal
              ? "Configure expense details and information"
              : "Track and manage business expenses"}
          </p>
        </div>
        {(checkPermission("finance.expense", "create")) && (
          <WebComponents.AdminComponents.AdminWebComponents.Button
            variant="addBackButton"
            className="w-full sm:w-auto"
            onClick={async () => {
              if (showModal || showEditModal) {
                setShowModal(false);
                setShowEditModal(false);
                setEditingExpense(null);
              } else {
                setShowModal(true);
              }
            }}
          >
            {showModal || showEditModal ? (
              <>
                <ArrowLeft className="w-4 h-4" />
                {Constants.adminConstants.back}
              </>
            ) : (
              <>
                <WebComponents.AdminComponents.AdminWebComponents.Plus className="w-4 h-4" />
                {Constants.adminConstants.add}
              </>
            )}
          </WebComponents.AdminComponents.AdminWebComponents.Button>
        )}
      </div>

      {/* Show stats and table only when modal is not open */}
      {!showModal && !showEditModal && (
        <div className="bg-white dark:bg-darkFilterbar rounded-[4px] h-full w-full mt-4 overflow-hidden">
          <WebComponents.WebCommonComponents.CommonComponents.CommonFilterBar
            actionFilter={actionFilter}
            onActionFilterChange={setActionFilter}
            actionOptions={bulkActionOptions}
            activeStatusFilter={activeStatusFilter}
            onActiveStatusFilterChange={setActiveStatusFilter}
            activeStatusOptions={activeStatusOptions}
            selectedCount={selectedRows.length}
            onApply={handleBulkApply}
            searchTerm={searchTerm}
            onSearchTermChange={setSearchTerm}
            statusFilter={allStatusFilter}
            onStatusFilterChange={(value: string) => {
              setAllStatusFilter(value || "All")
            }}
            statusOptions={statusOptions}
            categoryFilter={selectedCategoryFilter}
            onCategoryFilterChange={setSelectedCategoryFilter}
            categoryOptions={categoryOptions}
            categoryPlaceholder="All Categories"
            statusPlaceholder="All Status"
            searchPlaceholder="Search"
            renderExports={
              <>
                <WebComponents.UiComponents.UiWebComponents.DownloadCSV
                  data={downloadData}
                  columns={exportColumns.csvColumns}
                  filename={`expenses-${new Date().toISOString().split('T')[0]}.csv`}
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
                    disabled={expenses.length === 0}
                  >
                    <Image src={Constants.assetsIcon.assets.csv} alt="CSV" width={28} height={28} className="w-5 h-5 sm:w-6 sm:h-6 md:w-6 md:h-6 lg:w-7 lg:h-7 xl:w-7 xl:h-7 2xl:w-7 2xl:h-7" />
                  </button>
                </WebComponents.UiComponents.UiWebComponents.DownloadCSV>
                <WebComponents.UiComponents.UiWebComponents.DownloadPDF
                  data={downloadData}
                  columns={exportColumns.pdfColumns}
                  filename={`expenses-${new Date().toISOString().split('T')[0]}.pdf`}
                  title="Expenses Report"
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
                    disabled={expenses.length === 0}
                  >
                    <Image src={Constants.assetsIcon.assets.pdf} alt="PDF" width={28} height={28} className="w-5 h-5 sm:w-6 sm:h-6 md:w-6 md:h-6 lg:w-7 lg:h-7 xl:w-7 xl:h-7 2xl:w-7 2xl:h-7" />
                  </button>
                </WebComponents.UiComponents.UiWebComponents.DownloadPDF>
              </>
            }
          />
          <div className='pb-1 overflow-x-auto'>
            <WebComponents.WebCommonComponents.CommonComponents.DataTable
              keyField="_id"
              columns={tableColumns}
              data={filteredData}
              selectableRows
              onSelectedRowsChange={({ selectedRows }) => setSelectedRows(selectedRows)}
              clearSelectedRows={clearSelectedRows}
              totalRecords={pagination.totalItems}
              filteredRecords={pagination.totalItems}
              paginationPerPage={pagination.itemsPerPage}
              paginationDefaultPage={pagination.currentPage}
              paginationRowsPerPageOptions={[5, 10, 25, 50]}
              useUrlParams={true}
              useCustomPagination={true}
            />
          </div>
        </div>
      )}

      {/* Show modal when open */}
      {(showModal || showEditModal) && (
        <WebComponents.UiComponents.UiWebComponents.AdminFormModal
          formId="expense-form"
          onClose={() => {
            setShowModal(false);
            setShowEditModal(false);
            setEditingExpense(null);
          }}
          loading={loading}
        >
          {editingExpense ? (
            <WebComponents.AdminComponents.AdminWebComponents.Forms.ExpenseForm
              onSubmit={handleEdit}
              expense={editingExpense}
              categories={categories}
              stores={stores}
            />
          ) : (
            <WebComponents.AdminComponents.AdminWebComponents.Forms.ExpenseForm
              onSubmit={handleAdd}
              categories={categories}
              stores={stores}
            />
          )}
        </WebComponents.UiComponents.UiWebComponents.AdminFormModal>
      )}
      {/* Details Modal */}
      {showDetailsModal && selectedExpense && (
        <WebComponents.AdminComponents.AdminWebComponents.Models.ExpenseDetailsModal
          expense={selectedExpense}
          onClose={() => setShowDetailsModal(false)}
        />

      )}
    </>
  );
}
