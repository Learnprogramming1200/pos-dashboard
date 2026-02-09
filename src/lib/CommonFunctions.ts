import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { UiWebComponents } from "@/components/ui";
export async function handleAddCommon<TFormData = any>(options: {
  formData: TFormData;
  createAction: (data: TFormData) => Promise<{ success?: boolean; error?: string; data?: any }>;
  setLoading: (loading: boolean) => void;
  setShowModal: (show: boolean) => void;
  router: AppRouterInstance;
  successMessage?: string;
  errorMessage?: string;
  onSuccess?: (result?: { success?: boolean; error?: string; data?: any }) => void;
  onError?: (error: string) => void;
  checkExistsError?: (errorMessage: string) => boolean;
  existsErrorMessage?: string;
}): Promise<void> {
  const {
    formData,
    createAction,
    setLoading,
    setShowModal,
    router,
    successMessage = "Item added successfully.",
    errorMessage = "Failed to add item.",
    onSuccess,
    onError,
    checkExistsError,
    existsErrorMessage,
  } = options;

  try {
    setLoading(true);
    const result = await createAction(formData);
    if (!result?.success) {
      throw new Error(result?.error || errorMessage);
    }
    setShowModal(false);
    UiWebComponents.SwalHelper.success({
      text: successMessage,
    });
    // Refresh the page to get updated data from server
    router.refresh();
    onSuccess?.(result);
  } catch (error: unknown) {
    console.error("Error adding item:", error);
    const errorMsg = error instanceof Error ? error.message : errorMessage;

    if (checkExistsError && checkExistsError(errorMsg)) {
      UiWebComponents.SwalHelper.warning({
        text: existsErrorMessage || errorMsg,
      });
    } else {
      UiWebComponents.SwalHelper.error({
        text: errorMsg,
      });
    }
    onError?.(errorMsg);
  } finally {
    setLoading(false);
  }
}
// update data

export async function handleEditCommon<TFormData = any, TEditingItem = any>(options: {
  formData: TFormData;
  editingItem: TEditingItem | null;
  getId: (item: TEditingItem) => string | number;
  updateAction: (id: string | number, data: TFormData) => Promise<{ success?: boolean; error?: string; data?: any }>;
  setLoading: (loading: boolean) => void;
  setShowEditModal: (show: boolean) => void;
  setEditingItem: (item: TEditingItem | null) => void;
  router: AppRouterInstance;
  successMessage?: string;
  errorMessage?: string;
  onSuccess?: (result?: { success?: boolean; error?: string; data?: any }) => void;
  onError?: (error: string) => void;
  checkExistsError?: (errorMessage: string) => boolean;
  existsErrorMessage?: string;
}): Promise<void> {
  const {
    formData,
    editingItem,
    getId,
    updateAction,
    setLoading,
    setShowEditModal,
    setEditingItem,
    router,
    successMessage = "Item updated successfully.",
    errorMessage = "Failed to update item.",
    onSuccess,
    onError,
    checkExistsError,
    existsErrorMessage,
  } = options;

  if (!editingItem) return;

  try {
    setLoading(true);
    const id = getId(editingItem);
    const result = await updateAction(id, formData);
    if (!result?.success) {
      throw new Error(result?.error || errorMessage);
    }
    setShowEditModal(false);
    setEditingItem(null);
    UiWebComponents.SwalHelper.success({
      text: successMessage,
    });
    // Refresh the page to get updated data from server
    router.refresh();
    onSuccess?.(result);
  } catch (error: unknown) {
    console.error("Error updating item:", error);
    const errorMsg = error instanceof Error ? error.message : errorMessage;

    if (checkExistsError && checkExistsError(errorMsg)) {
      UiWebComponents.SwalHelper.warning({
        text: existsErrorMessage || errorMsg,
      });
    } else {
      UiWebComponents.SwalHelper.error({
        text: errorMsg,
      });
    }
    onError?.(errorMsg);
  } finally {
    setLoading(false);
  }
}
// delete data
export async function handleDeleteCommon(options: {
  id: string | number;
  deleteAction: (id: string | number) => Promise<{ success?: boolean; error?: string; data?: any }>;
  setLoading: (loading: boolean) => void;
  router: AppRouterInstance;
  successMessage?: string;
  errorMessage?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}): Promise<void> {
  const {
    id,
    deleteAction,
    setLoading,
    router,
    successMessage = "Item deleted successfully.",
    errorMessage = "Failed to delete item.",
    onSuccess,
    onError,
  } = options;

  const result = await UiWebComponents.SwalHelper.delete();
  if (!result.isConfirmed) return;

  try {
    setLoading(true);
    const deleteResult = await deleteAction(id);
    if (!deleteResult?.success) {
      throw new Error(deleteResult?.error || errorMessage);
    }
    UiWebComponents.SwalHelper.success({
      text: successMessage,
    });
    // Refresh the page to get updated data from server
    router.refresh();
    onSuccess?.();
  } catch (error: unknown) {
    console.error("Error deleting item:", error);
    const errorMsg = error instanceof Error ? error.message : errorMessage;
    UiWebComponents.SwalHelper.error({
      text: errorMsg,
    });
    onError?.(errorMsg);
  } finally {
    setLoading(false);
  }
}
// update toggle stataus
export async function handleToggleStatusCommon<TRow = any, TPayload = any>(options: {
  row: TRow;
  next: boolean;
  getId: (row: TRow) => string | number;
  preparePayload: (row: TRow, next: boolean) => TPayload;
  updateAction: (id: string | number, data: TPayload) => Promise<{ success?: boolean; error?: string; data?: any }>;
  setLoading: (loading: boolean) => void;
  router: AppRouterInstance;
  successMessage?: string;
  errorMessage?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}): Promise<void> {
  const {
    row,
    next,
    getId,
    preparePayload,
    updateAction,
    setLoading,
    router,
    successMessage,
    errorMessage = "Failed to update status.",
    onSuccess,
    onError,
  } = options;

  try {
    setLoading(true);
    const id = getId(row);
    const payload = preparePayload(row, next);
    const result = await updateAction(id, payload);
    if (!result?.success) {
      throw new Error(result?.error || errorMessage);
    }
    UiWebComponents.SwalHelper.success({
      text: successMessage || `Status updated to ${next ? "Active" : "Inactive"}.`,
    });
    // Refresh the page to get updated data from server
    router.refresh();
    onSuccess?.();
  } catch (error: unknown) {
    console.error("Failed to update status:", error);
    const errorMsg = error instanceof Error ? error.message : errorMessage;
    UiWebComponents.SwalHelper.error({
      text: errorMsg,
    });
    onError?.(errorMsg);
  } finally {
    setLoading(false);
  }
}

export async function handleDownloadCommon<TRow = any>(options: {
  selectedRows?: any[];
  searchParams: URLSearchParams;
  bulkGetSelectedAction?: (payload: { ids: string[] }) => Promise<{ success?: boolean; error?: string; data?: any }>;
  bulkGetAllAction: (filters: any) => Promise<{ success?: boolean; error?: string; data?: any }>;
  setDownloadData?: (data: TRow[]) => void;
  idSelector?: (item: any) => string | number;
}): Promise<TRow[]> {
  const {
    selectedRows,
    searchParams,
    bulkGetSelectedAction,
    bulkGetAllAction,
    setDownloadData,
    idSelector = (item) => item.id || item._id||item?.subscriptionId,
  } = options;

  const selectedRowsIds = selectedRows?.map(idSelector);
  const isActive = searchParams.get("isActive");
  const isActiveParam = isActive === "true" ? true : isActive === "false" ? false : undefined;
  const search = searchParams.get("search");
  const status = searchParams.get("status");
  const storeId = searchParams.get("storeId");
  const categoryId = searchParams.get("categoryId");
  const designation = searchParams.get("designation");
  const type=searchParams.get("type")
  const filterDatas: any = {
    isActive: undefined,
    search: undefined,
    status: undefined,
    storeId: undefined,
    categoryId: undefined,
  };

  if (isActiveParam !== undefined) filterDatas.isActive = isActiveParam;
  if (search) filterDatas.search = search;
  if (status) filterDatas.status = status;
  if (storeId) filterDatas.storeId = storeId;
  if (categoryId) filterDatas.categoryId = categoryId;
  if (designation) filterDatas.designation = designation;
  if(type) filterDatas.type=type
  let res;
  if (selectedRowsIds && selectedRowsIds.length > 0 && bulkGetSelectedAction) {
    res = await bulkGetSelectedAction({ ids: selectedRowsIds });
       } else {
    res = await bulkGetAllAction(filterDatas);
  }
  let rows = [];
  if (Array.isArray(res?.data?.data?.data)) {
    rows = res.data.data.data;
  } else if (Array.isArray(res?.data?.data?.products)) {
    rows = res.data.data.products;
  } else if (Array.isArray(res?.data?.data?.sales)) {
    rows = res.data.data.sales;
  } else if (Array.isArray(res?.data?.sales)) {
    rows = res.data.sales;
  } else if (Array.isArray(res?.data?.data)) {
    rows = res.data.data;
  } else if (Array.isArray(res?.data)) {
    rows = res.data;
  }

  setDownloadData?.(rows);
  return rows;
}
export async function handleBulkApplyCommon<T = any>(options: {
  selectedRows: T[];
  actionFilter: string;
  activeStatusFilter: string;
  items: T[];
  setItems: (items: T[]) => void;
  bulkDeleteAction: (payload: { ids: any[] }) => Promise<{ success?: boolean; message?: string; error?: string }>;
  bulkUpdateStatusAction: (payload: { ids: any[]; status: any }) => Promise<{ success?: boolean; error?: string }>;
  clearSelectedData: () => void;
  idSelector?: (item: T) => any;
  statusProp?: string;
  successMessageDelete?: string;
  successMessageStatus?: string;
  errorMessageDelete?: string;
  errorMessageStatus?: string;
  statusMap?: Record<string, any>;
}) {
  const {
    selectedRows,
    actionFilter,
    activeStatusFilter,
    items,
    setItems,
    bulkDeleteAction,
    bulkUpdateStatusAction,
    clearSelectedData,
    idSelector = (item: any) => item.id || item._id,
    statusProp = "status",
    successMessageDelete = "Selected items deleted successfully.",
    successMessageStatus = "Status updated successfully.",
    errorMessageDelete = "Failed to delete selected items.",
    errorMessageStatus = "Failed to apply status.",
  } = options;

  const ids = selectedRows.map(idSelector);

  if (actionFilter !== "Status") {
    if (actionFilter === "Delete") {
      const confirm = await UiWebComponents.SwalHelper.delete();
      if (!confirm.isConfirmed) return;
      const previous = [...items];
      // Optimistic remove
      setItems(items.filter((item) => !ids.includes(idSelector(item))))
      try {
        const result = await bulkDeleteAction({ ids });
        const message = result?.message || successMessageDelete
        if (!result?.success) throw new Error(result?.error || errorMessageDelete);
        UiWebComponents.SwalHelper.success({ text: message });
        clearSelectedData();
      } catch (error: any) {
        // Revert on failure
        setItems(previous);
        UiWebComponents.SwalHelper.error({ text: error.message || errorMessageDelete });
      }
    }
    return;
  }

  if (activeStatusFilter === "All") {
    UiWebComponents.SwalHelper.error({ text: "Please select a status." });
    return;
  }

  // Handle both boolean and string statuses
  const statusValue =
    activeStatusFilter.toLowerCase() === "active" ? true :
      activeStatusFilter.toLowerCase() === "inactive" ? false :
        activeStatusFilter;

  const previous = [...items];
  // Optimistic update
  setItems(
    items.map((item) =>
      ids.includes(idSelector(item)) ? { ...item, [statusProp]: statusValue } : item
    )
  );

  try {

    const result = await bulkUpdateStatusAction({ ids, status: statusValue });
    if (!result?.success) throw new Error(result?.error || errorMessageStatus);
    // Create a descriptive status label for the success message
    const statusLabel = typeof statusValue === 'boolean'
      ? (statusValue ? 'Active' : 'Inactive')
      : (typeof statusValue === 'string' ? statusValue.charAt(0).toUpperCase() + statusValue.slice(1) : String(statusValue));

    const displayMessage = options.successMessageStatus || `Status updated to ${statusLabel} successfully.`;
    UiWebComponents.SwalHelper.success({ text: displayMessage });
    clearSelectedData();
  } catch (error: any) {
    // Revert on failure
    setItems(previous);
    UiWebComponents.SwalHelper.error({ text: error.message || errorMessageStatus });
  }
}
export const getPriceRange = (values: number[]) => {
  const nums = values.filter((v) => typeof v === "number" && !isNaN(v));
  if (nums.length === 0) return "N/A";
  const min = Math.min(...nums);
  const max = Math.max(...nums);
  return min === max ? `$${min}` : `$${min} - $${max}`;
};


