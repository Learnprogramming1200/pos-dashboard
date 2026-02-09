"use client";

import React from "react";
import { HiArrowLeft, HiPlus } from "react-icons/hi";
import { ChevronLeft, ChevronRight, List, Calendar as CalendarIcon } from "lucide-react";
import { Constants } from "@/constant";
import { WebComponents } from "@/components";
import { customHooks } from "@/hooks";
import { AdminTypes } from "@/types";

export default function HolidayManagementUI(props: AdminTypes.hrmTypes.holidayTypes.HolidayManagementUIProps) {
    const { checkPermission } = customHooks.useUserPermissions();
    const {
        loading,
        showModal,
        showEditModal,
        editingHoliday,
        viewMode,
        searchTerm,
        statusFilter,
        filteredData,
        pagination,
        clearSelectedRows,
        currentMonth,
        yearOptions,
        monthCells,
        tableColumns,
        setShowModal,
        setShowEditModal,
        setEditingHoliday,
        setSearchTerm,
        setStatusFilter,
        setViewMode,
        setSelectedRows,
        prevMonth,
        nextMonth,
        handleMonthChange,
        handleYearChange,
        handleAdd,
        handleEdit,
    } = props;

    return (
        <>
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
                <div className="flex-1 min-w-0">
                    <h1 className="text-lg sm:text-lg md:text-xl lg:text-2xl font-medium text-textMain dark:text-white truncate">
                        {Constants.adminConstants.holidayManagementStrings.title}
                        {(showModal || showEditModal)
                            ? ` > ${showModal
                                ? Constants.adminConstants.holidayManagementStrings.addHolidayLabel
                                : Constants.adminConstants.holidayManagementStrings.editHolidayLabel
                            }`
                            : ""}
                    </h1>
                    <p className="text-xs sm:text-sm md:text-base text-textSmall pt-2">
                        {Constants.adminConstants.holidayManagementStrings.description}
                    </p>
                </div>
                {(showModal || showEditModal || checkPermission("hrm.holidays", "create")) && (
                    <WebComponents.UiComponents.UiWebComponents.Button
                        variant="addBackButton"
                        onClick={() => {
                            if (showModal || showEditModal) {
                                setShowModal(false);
                                setShowEditModal(false);
                                setEditingHoliday(null);
                            } else {
                                setShowModal(true);
                            }
                        }}
                    >
                        {showModal || showEditModal ? (
                            <>
                                <HiArrowLeft className="w-4 h-4" />
                                {Constants.adminConstants.back}
                            </>
                        ) : (
                            <>
                                <HiPlus className="w-4 h-4" />
                                {Constants.adminConstants.add}
                            </>
                        )}
                    </WebComponents.UiComponents.UiWebComponents.Button>
                )}
            </div>
            <div className="bg-white dark:bg-darkFilterbar rounded-[4px] h-full w-full mt-4 overflow-hidden">
                {/* Filters */}
                <WebComponents.WebCommonComponents.CommonComponents.CommonFilterBar
                    showActionSection={false}
                    categoryFilter="All"
                    onCategoryFilterChange={() => { }}
                    categoryOptions={[]}
                    showCategoryFilter={false}
                    statusFilter={statusFilter === "All" ? "All" : statusFilter}
                    onStatusFilterChange={(value: string) => {
                        const validValue =
                            value === "Active" || value === "Inactive" ? value : "All";
                        setStatusFilter(validValue);
                    }}
                    statusOptions={Constants.commonConstants.CommonFilterOptions.CommonStatusOptions}
                    searchTerm={searchTerm}
                    onSearchTermChange={setSearchTerm}
                    renderExports={
                        <div className="flex gap-2">
                            <WebComponents.UiComponents.UiWebComponents.Button
                                variant={viewMode === "list" ? "default" : "outline"}
                                onClick={() => setViewMode("list")}
                                size="icon"
                                className="w-10 h-10"
                            >
                                <List className="w-4 h-4" />
                            </WebComponents.UiComponents.UiWebComponents.Button>
                            <WebComponents.UiComponents.UiWebComponents.Button
                                variant={viewMode === "calendar" ? "default" : "outline"}
                                onClick={() => setViewMode("calendar")}
                                size="icon"
                                className="w-10 h-10"
                            >
                                <CalendarIcon className="w-4 h-4" />
                            </WebComponents.UiComponents.UiWebComponents.Button>
                        </div>
                    }
                />

                {/* List or Calendar */}
                {viewMode === "list" ? (
                    <div className="overflow-x-auto bg-white dark:bg-darkFilterbar border-t border-gray-200 dark:border-darkBorder rounded-b-[4px]">
                        {loading ? (
                            <div className="flex justify-center items-center p-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                <span className="ml-2 text-gray-600 dark:text-gray-300">
                                    {Constants.adminConstants.holidayManagementStrings.loadingLabel}
                                </span>
                            </div>
                        ) : (
                            <WebComponents.WebCommonComponents.CommonComponents.DataTable
                                columns={tableColumns}
                                data={filteredData}
                                selectableRows
                                clearSelectedRows={clearSelectedRows}
                                onSelectedRowsChange={({ selectedRows }) =>
                                    setSelectedRows(selectedRows)
                                }
                                useCustomPagination={true}
                                totalRecords={pagination.totalItems}
                                filteredRecords={pagination.totalItems}
                                paginationPerPage={pagination.itemsPerPage}
                                paginationDefaultPage={pagination.currentPage}
                                paginationRowsPerPageOptions={[5, 10, 25, 50]}
                                useUrlParams={true}
                            />
                        )}
                    </div>
                ) : (
                    <div className="bg-white dark:bg-darkFilterbar border-t border-gray-200 dark:border-darkBorder rounded-b-[4px] p-4">
                        {/* Month header with dropdowns */}
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <WebComponents.UiComponents.UiWebComponents.Button
                                    variant="outline"
                                    size="icon"
                                    onClick={prevMonth}
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </WebComponents.UiComponents.UiWebComponents.Button>

                                <div className="flex gap-2">
                                    <WebComponents.UiComponents.UiWebComponents.FilterDropdown
                                        value={currentMonth.getMonth().toString()}
                                        onChange={handleMonthChange}
                                        options={Constants.commonConstants.CommonFilterOptions.MonthOptions}
                                        optionLabel="name"
                                        optionValue="value"
                                        className="w-[130px]"
                                        placeholder="Month"
                                        showClear={false}
                                    />
                                    <WebComponents.UiComponents.UiWebComponents.FilterDropdown
                                        value={currentMonth.getFullYear().toString()}
                                        onChange={handleYearChange}
                                        options={yearOptions}
                                        optionLabel="name"
                                        optionValue="value"
                                        className="w-[100px]"
                                        placeholder="Year"
                                        showClear={false}
                                    />
                                </div>

                                <WebComponents.UiComponents.UiWebComponents.Button
                                    variant="outline"
                                    size="icon"
                                    onClick={nextMonth}
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </WebComponents.UiComponents.UiWebComponents.Button>
                            </div>
                        </div>
                        {/* Weekdays */}
                        <div className="grid grid-cols-7 text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                                <div key={d} className="px-2 py-1">
                                    {d}
                                </div>
                            ))}
                        </div>
                        {/* Grid */}
                        <div className="grid grid-cols-7 gap-[6px]">
                            {monthCells.map((cell, idx) => {
                                const isToday =
                                    cell &&
                                    cell.date.toDateString() === new Date().toDateString();
                                const isCurrentMonth =
                                    cell && cell.date.getMonth() === currentMonth.getMonth();

                                const handleDateClick = () => {
                                    if (cell && isCurrentMonth) {
                                        const selectedDate = cell.date
                                            .toISOString()
                                            .split("T")[0];

                                        if (cell.items.length > 0) {
                                            const existingHoliday = cell.items[0];
                                            setEditingHoliday(existingHoliday);
                                            setShowEditModal(true);
                                        } else {
                                            setEditingHoliday({
                                                id: "",
                                                name: "",
                                                date: selectedDate,
                                                description: "",
                                                isRecurring: false,
                                                status: "Active",
                                                createdAt: new Date().toISOString(),
                                                updatedAt: new Date().toISOString(),
                                            });
                                            setShowModal(true);
                                        }
                                    }
                                };

                                return (
                                    <div
                                        key={idx}
                                        className={`min-h-[110px] border rounded-md p-2 ${isToday
                                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                                            : "border-gray-200 dark:border-darkBorder"
                                            } ${cell && isCurrentMonth
                                                ? "cursor-pointer hover:bg-gray-50 dark:hover:bg-grayLight transition-colors"
                                                : ""
                                            }`}
                                        onClick={handleDateClick}
                                    >
                                        {cell ? (
                                            <>
                                                <div
                                                    className={`text-xs font-semibold mb-1 ${isToday
                                                        ? "text-blue-700 dark:text-blue-300"
                                                        : isCurrentMonth
                                                            ? "text-gray-700 dark:text-gray-200"
                                                            : "text-gray-400 dark:text-gray-500"
                                                        }`}
                                                >
                                                    {cell.date.getDate()}
                                                    {isToday && (
                                                        <span className="ml-1 text-[10px]">
                                                            ({" "}
                                                            {
                                                                Constants.adminConstants.holidayManagementStrings
                                                                    .todayLabel
                                                            }{" "}
                                                            )
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="space-y-1">
                                                    {cell.items.length === 0 && isCurrentMonth && (
                                                        <div className="text-[11px] text-gray-400">
                                                            {
                                                                Constants.adminConstants.holidayManagementStrings
                                                                    .noHolidaysLabel
                                                            }
                                                        </div>
                                                    )}
                                                    {cell.items.map((it) => (
                                                        <div
                                                            key={it.id}
                                                            className="text-[11px] px-2 py-1 rounded bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-100 dark:border-red-800 cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                                                        >
                                                            {it.name}
                                                        </div>
                                                    ))}
                                                </div>
                                            </>
                                        ) : null}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
            

            {/* Show modal when open */}
            {(showModal || showEditModal) && (
                    <WebComponents.UiComponents.UiWebComponents.AdminFormModal
                        formId="holiday-form"
                        onClose={() => {
                            setShowModal(false);
                            setShowEditModal(false);
                            setEditingHoliday(null);
                        }}
                        loading={loading}
                    >
                        {editingHoliday ? (
                            <WebComponents.AdminComponents.AdminWebComponents.Forms.HolidayForm
                                onSubmit={handleEdit}
                                holiday={editingHoliday}
                            />
                        ) : (
                            <WebComponents.AdminComponents.AdminWebComponents.Forms.HolidayForm
                                onSubmit={handleAdd}
                            />
                        )}
                    </WebComponents.UiComponents.UiWebComponents.AdminFormModal>
            )}
        </>
    );
}
