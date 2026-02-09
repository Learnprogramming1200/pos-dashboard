"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { FaEdit, FaTrash } from 'react-icons/fa';
import { ServerActions } from "@/lib";
import { Constants } from "@/constant";
import { customHooks } from "@/hooks";
import { WebComponents } from "@/components";
import { AdminTypes, PaginationType } from "@/types";
import HolidayManagementUI from "./HolidayManagementUI";

export default function HolidayManagement({
  initialHolidayPayload,
  initialPagination,
}: {
  readonly initialHolidayPayload: AdminTypes.hrmTypes.holidayTypes.Holiday[];
  readonly initialPagination: PaginationType.Pagination;
}) {
  const router = useRouter();
  const [holidays, setHolidays] = React.useState<AdminTypes.hrmTypes.holidayTypes.Holiday[]>(initialHolidayPayload);
  const [pagination, setPagination] = React.useState<PaginationType.Pagination>(initialPagination);
  const [loading, setLoading] = React.useState(false);
  const [showModal, setShowModal] = React.useState(false);
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [editingHoliday, setEditingHoliday] = React.useState<AdminTypes.hrmTypes.holidayTypes.Holiday | null>(null);
  const [viewMode, setViewMode] = React.useState<"list" | "calendar">("list");
  const [currentMonth, setCurrentMonth] = React.useState<Date>(new Date());
  const [selectedRows, setSelectedRows] = React.useState<AdminTypes.hrmTypes.holidayTypes.Holiday[]>([]);
  const [clearSelectedRows, setClearSelectedRows] = React.useState(false);
  const { searchTerm, setSearchTerm, allStatusFilter, setAllStatusFilter, filteredData } = customHooks.useListFilters<AdminTypes.hrmTypes.holidayTypes.Holiday>(
    holidays,
    {
      statusAllSelector: (row) => row.status,
      searchKeys: ['name', 'description'],
    }
  );
  // Calendar helpers
  const validCurrentMonth = isNaN(currentMonth.getTime()) ? new Date() : currentMonth;
  const startOfMonth = new Date(validCurrentMonth.getFullYear(), validCurrentMonth.getMonth(), 1);
  const endOfMonth = new Date(validCurrentMonth.getFullYear(), validCurrentMonth.getMonth() + 1, 0);
  const startDay = startOfMonth.getDay();
  const daysInMonth = endOfMonth.getDate();


  const yearOptions = React.useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 21 }, (_, i) => {
      const y = currentYear - 10 + i;
      return { name: y.toString(), value: y.toString() };
    });
  }, []);


  // Sync state with props when URL params change
  React.useEffect(() => {
    setHolidays(initialHolidayPayload);
    setPagination(initialPagination);
  }, [initialHolidayPayload]);

  // Reset selected rows when none are selected
  React.useEffect(() => {
    if (selectedRows.length === 0) {
      setClearSelectedRows(prev => !prev);
    }
  }, [selectedRows]);

  // Auto-repair invalid date state
  React.useEffect(() => {
    if (isNaN(currentMonth.getTime())) {
      setCurrentMonth(new Date());
    }
  }, [currentMonth]);

  // Add handler
  const handleAdd = async (formData: AdminTypes.hrmTypes.holidayTypes.HolidayFormSubmitData) => {
    await ServerActions.HandleFunction.handleAddCommon({
      formData,
      createAction: async (data: AdminTypes.hrmTypes.holidayTypes.HolidayFormSubmitData) => {
        const { startDate, endDate, error } = Constants.dateUtils.parseDateRange(data.date);

        if (error || !startDate || !endDate) {
          return { success: false, error: error || "Please select a valid date range" };
        }

        return await ServerActions.ServerActionslib.createHolidayAction({
          name: data.name,
          startDate,
          endDate,
          description: data.description,
          isRecurring: data.isRecurring,
          status: data.status === 'Active'
        });
      },
      setLoading,
      setShowModal,
      router,
      successMessage: "Holiday added successfully.",
      onSuccess: (result: any) => {
        if (result?.success && result.data) {
          const { startDate, endDate } = Constants.dateUtils.parseDateRange(formData.date);

          const newHoliday: AdminTypes.hrmTypes.holidayTypes.Holiday = {
            id: result.data?.id || result.data?._id || Date.now().toString(),
            ...formData,
            date: startDate === endDate ? startDate : `${startDate} - ${endDate}`,
            startDate,
            endDate,
            status: formData.status as AdminTypes.hrmTypes.commonTypes.StaffStatus,
            statusDisplay: formData.status,
            recurringDisplay: formData.isRecurring ? 'Yes' : 'No',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          setHolidays(prev => [...prev, newHoliday]);
        }
      }
    });
  };

  // Edit handler
  const handleEdit = async (formData: AdminTypes.hrmTypes.holidayTypes.HolidayFormSubmitData) => {
    await ServerActions.HandleFunction.handleEditCommon({
      formData,
      editingItem: editingHoliday,
      getId: (item) => item.id,
      updateAction: async (id: string | number, data: AdminTypes.hrmTypes.holidayTypes.HolidayFormSubmitData) => {
        const { startDate, endDate, error } = Constants.dateUtils.parseDateRange(data.date);

        if (error || !startDate || !endDate) {
          return { success: false, error: error || "Please select a valid date range" };
        }

        return await ServerActions.ServerActionslib.updateHolidayAction(id as string, {
          name: data.name,
          startDate,
          endDate,
          description: data.description,
          isRecurring: data.isRecurring,
          status: data.status === 'Active'
        });
      },
      setLoading,
      setShowEditModal,
      setEditingItem: setEditingHoliday,
      router,
      successMessage: `Holiday updated successfully.`,
      onSuccess: () => {
        const { startDate, endDate } = Constants.dateUtils.parseDateRange(formData.date);

        if (editingHoliday) {
          const updatedHoliday: AdminTypes.hrmTypes.holidayTypes.Holiday = {
            ...editingHoliday,
            ...formData,
            date: startDate === endDate ? startDate : `${startDate} - ${endDate}`,
            startDate,
            endDate,
            status: formData.status as AdminTypes.hrmTypes.commonTypes.StaffStatus,
            statusDisplay: formData.status,
            recurringDisplay: formData.isRecurring ? 'Yes' : 'No',
            updatedAt: new Date().toISOString()
          };
          setHolidays(prev => prev.map(h => h.id === editingHoliday.id ? updatedHoliday : h));
        }
      }
    });
  };

  // Delete handler
  const handleDelete = async (id: string) => {
    await ServerActions.HandleFunction.handleDeleteCommon({
      id,
      deleteAction: (id: string | number) =>
        ServerActions.ServerActionslib.deleteHolidayAction(id as string),
      setLoading,
      router,
      successMessage: 'The holiday has been deleted.',
      errorMessage: 'Failed to delete holiday.',
      onSuccess: () => {
        setHolidays(prev => prev.filter(holiday => holiday.id !== id));
      },
    });
  };

  // Open edit modal
  const handleEditModal = React.useCallback((holiday: AdminTypes.hrmTypes.holidayTypes.Holiday) => {
    setEditingHoliday(holiday);
    setShowEditModal(true);
  }, []);

  // Toggle status handler
  const handleToggleStatus = React.useCallback(async (row: AdminTypes.hrmTypes.holidayTypes.Holiday, next: boolean) => {
    setHolidays(prev => prev.map(holiday => (holiday.id === row.id ? { ...holiday, status: next ? 'Active' : 'Inactive' } : holiday)));
    await ServerActions.HandleFunction.handleToggleStatusCommon({
      row,
      next,
      getId: (item) => item.id,
      preparePayload: () => ({ status: next }),
      updateAction: (id: string | number, data: { status: boolean }) =>
        ServerActions.ServerActionslib.toggleHolidayStatusAction(id as string),
      setLoading,
      router,
      successMessage: `Status updated to ${next ? 'Active' : 'Inactive'}.`,
      errorMessage: 'Failed to update status.',
      onError: () => {
        setHolidays(prev => prev.map(holiday => (holiday.id === row.id ? { ...holiday, status: !next ? 'Active' : 'Inactive' } : holiday)));
      },
    });
  }, [router]);

  /* Permissions */
  const { checkPermission } = customHooks.useUserPermissions();

  const handleToggleStatusById = React.useCallback(
    async (id: string, next: boolean) => {
      const row = holidays.find(h => h.id === id);
      if (row) {
        await handleToggleStatus(row, next);
      }
    },
    [holidays, handleToggleStatus]
  );

  // Table columns using createColumns helper
  const tableColumns = React.useMemo(() => WebComponents.WebCommonComponents.CommonComponents.createColumns<AdminTypes.hrmTypes.holidayTypes.Holiday>({
    fields: [
      {
        name: "Holiday Name",
        selector: (row: AdminTypes.hrmTypes.holidayTypes.Holiday) => row.name,
        sortable: true,
        width: "15%",
        cell: (row: AdminTypes.hrmTypes.holidayTypes.Holiday) => (
          <span className="font-medium text-gray-900 dark:text-white">{row.name}</span>
        )
      },
      {
        name: "Start Date",
        selector: (row: AdminTypes.hrmTypes.holidayTypes.Holiday) => row.startDate || row.date,
        cell: (row: AdminTypes.hrmTypes.holidayTypes.Holiday) => {
          const startDate = row.startDate || row.date;
          return (
            <div className="flex items-center gap-2">
              <span className="text-gray-700 dark:text-gray-300">
                {WebComponents.UiComponents.UiWebComponents.formatDate(startDate)}
              </span>
            </div>
          );
        },
        sortable: true,
        width: "12%"
      },
      {
        name: "End Date",
        selector: (row: AdminTypes.hrmTypes.holidayTypes.Holiday) => row.endDate || row.date,
        cell: (row: AdminTypes.hrmTypes.holidayTypes.Holiday) => {
          const endDate = row.endDate || row.date;
          return (
            <div className="flex items-center gap-2">
              <span className="text-gray-700 dark:text-gray-300">
                {WebComponents.UiComponents.UiWebComponents.formatDate(endDate)}
              </span>
            </div>
          );
        },
        sortable: true,
        width: "12%"
      },
      {
        name: "Description",
        selector: (row: AdminTypes.hrmTypes.holidayTypes.Holiday) => row.description || "N/A",
        sortable: false,
        width: "25%",
        cell: (row: AdminTypes.hrmTypes.holidayTypes.Holiday) => (
          <span className="text-gray-600 dark:text-gray-300">{row.description || "N/A"}</span>
        )
      },
      {
        name: "Recurring",
        selector: (row: AdminTypes.hrmTypes.holidayTypes.Holiday) => row.isRecurring,
        cell: (row: AdminTypes.hrmTypes.holidayTypes.Holiday) => (
          row.isRecurring ? (
            <span className="px-2 py-1 rounded-full text-xs border bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800">
              {row.recurringDisplay || "Yes"}
            </span>
          ) : (
            <span className="px-2 py-1 rounded-full text-xs border bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800/40 dark:text-gray-300 dark:border-gray-700">
              {row.recurringDisplay || "No"}
            </span>
          )
        ),
        width: "10%"
      },
    ],
    status: {
      name: Constants.adminConstants.statusLabel,
      idSelector: (row) => row.id,
      valueSelector: (row) => row.status === 'Active',
      onToggle: handleToggleStatusById,
    },
    actions: [
      ...(checkPermission("hrm.holidays", "update") ? [{
        render: (row: any) => (
          <WebComponents.UiComponents.UiWebComponents.Button
            size="icon"
            variant="editaction"
            onClick={() => handleEditModal(row)}
            title="Edit"
          >
            <FaEdit className="w-4 h-4" />
          </WebComponents.UiComponents.UiWebComponents.Button>
        ),
      }] : []),
      ...(checkPermission("hrm.holidays", "delete") ? [{
        render: (row: any) => (
          <WebComponents.UiComponents.UiWebComponents.Button
            size="icon"
            variant="deleteaction"
            onClick={() => handleDelete(row.id)}
            title="Delete"
          >
            <FaTrash className="w-4 h-4" />
          </WebComponents.UiComponents.UiWebComponents.Button>
        ),
      }] : []),
    ],
  }), [handleToggleStatusById, handleEditModal, handleDelete, checkPermission]);
  const prevMonth = () => setCurrentMonth(new Date(validCurrentMonth.getFullYear(), validCurrentMonth.getMonth() - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(validCurrentMonth.getFullYear(), validCurrentMonth.getMonth() + 1, 1));

  const formatISO = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  const monthCells: Array<{ date: Date; iso: string; items: AdminTypes.hrmTypes.holidayTypes.Holiday[] } | null> = [];
  for (let i = 0; i < startDay; i++) monthCells.push(null);
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(validCurrentMonth.getFullYear(), validCurrentMonth.getMonth(), day);
    const iso = formatISO(date);
    const items = filteredData.filter(h => {
      const startDate = h.startDate || h.date;
      const endDate = h.endDate || h.date;
      if (!startDate || !endDate) return false;

      try {
        const holidayStart = new Date(startDate);
        const holidayEnd = new Date(endDate);
        const currentDate = new Date(date);

        holidayStart.setHours(0, 0, 0, 0);
        holidayEnd.setHours(0, 0, 0, 0);
        currentDate.setHours(0, 0, 0, 0);

        return currentDate >= holidayStart && currentDate <= holidayEnd;
      } catch {
        return h.date && new Date(h.date).toDateString() === date.toDateString();
      }
    });
    monthCells.push({ date, iso, items });
  }

  const handleMonthChange = (e: any) => {
    try {
      if (e.value === undefined || e.value === null) return;
      const val = Number.parseInt(e.value, 10);
      if (!isNaN(val)) {
        setCurrentMonth(new Date(currentMonth.getFullYear(), val, 1));
      }
    } catch (err) {
      console.error("Error changing month:", err);
    }
  };

  const handleYearChange = (e: any) => {
    try {
      if (e.value === undefined || e.value === null) return;
      const val = Number.parseInt(e.value, 10);
      if (!isNaN(val)) {
        setCurrentMonth(new Date(val, currentMonth.getMonth(), 1));
      }
    } catch (err) {
      console.error("Error changing year:", err);
    }
  };

  return (
    <HolidayManagementUI
      loading={loading}
      showModal={showModal}
      showEditModal={showEditModal}
      editingHoliday={editingHoliday}
      viewMode={viewMode}
      searchTerm={searchTerm}
      statusFilter={allStatusFilter}
      filteredData={filteredData}
      pagination={pagination}
      clearSelectedRows={clearSelectedRows}
      currentMonth={currentMonth}
      yearOptions={yearOptions}
      monthCells={monthCells}
      tableColumns={tableColumns}
      setShowModal={setShowModal}
      setShowEditModal={setShowEditModal}
      setEditingHoliday={setEditingHoliday}
      setSearchTerm={setSearchTerm}
      setStatusFilter={setAllStatusFilter}
      setViewMode={setViewMode}
      setSelectedRows={setSelectedRows}
      prevMonth={prevMonth}
      nextMonth={nextMonth}
      handleMonthChange={handleMonthChange}
      handleYearChange={handleYearChange}
      handleAdd={handleAdd}
      handleEdit={handleEdit}
    />
  );
}
