"use client";
import React from "react";
import { Plus, Pencil, Trash2, Download, Mail } from "lucide-react";
import { HiArrowLeft } from "react-icons/hi";
import Image from "next/image";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { WebComponents } from "@/components";
import { AdminWebComponents } from "..";
import { ServerActions } from "@/lib";
import { AdminTypes } from "@/types";
import { customHooks } from "@/hooks";
import { PayrollForm } from "./PayrollForms";
import { SalarySlip } from "./SalarySlip";
import { Constants } from "@/constant";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const getPreviousMonthDate = () => {
  const date = new Date();
  date.setMonth(date.getMonth() - 1);
  return date;
};

const getDefaultMonthName = () => MONTH_NAMES[getPreviousMonthDate().getMonth()];
const getDefaultYear = () => getPreviousMonthDate().getFullYear().toString();

// Helper function to extract payrolls from payload
const extractPayrolls = (payload: unknown): AdminTypes.hrmTypes.payrollTypes.Payroll[] => {
  if (Array.isArray(payload)) {
    const extracted = payload
      .filter((payroll: any) => {
        const hasId = payroll && typeof payroll === 'object' && (payroll._id || payroll.id);
        return hasId;
      })
      .map((payroll: any) => {
        const employeeObj = payroll.employee || payroll.employeeId || payroll.staffId;
        const userObj = employeeObj?.user || {};
        const storeObj = employeeObj?.store || payroll.storeId || payroll.branchId;

        const monthNumber = payroll.month;
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December'];
        const monthName = typeof monthNumber === 'number' && monthNumber >= 1 && monthNumber <= 12
          ? monthNames[monthNumber - 1]
          : (payroll.month || '');

        const base = payroll.baseSalary || payroll.basicSalary || payroll.salary || 0;
        const rawDeductions = payroll.deduction || payroll.deductions || 0;
        const rawNetSalary = payroll.netSalary ?? payroll.totalSalary;

        let deductions: number;
        let netSalary: number;

        if (rawNetSalary !== undefined && rawNetSalary !== null && base > 0) {
          const currentSum = rawNetSalary + rawDeductions;
          const swappedNetSalary = rawDeductions;
          const swappedDeductions = rawNetSalary;
          const swappedSum = swappedNetSalary + swappedDeductions;

          const isSwapped =
            rawNetSalary > base ||
            rawDeductions > base ||
            (Math.abs(swappedSum - base) < Math.abs(currentSum - base) && Math.abs(swappedSum - base) < 0.01);

          if (isSwapped) {
            deductions = rawNetSalary;
            netSalary = rawDeductions;
          } else {
            deductions = rawDeductions;
            netSalary = rawNetSalary;
          }
        } else {
          deductions = rawDeductions;
          netSalary = Math.max(0, base - rawDeductions);
        }

        const extractedPayroll: AdminTypes.hrmTypes.payrollTypes.Payroll = {
          id: payroll._id || payroll.id,
          staffId: (employeeObj && (employeeObj._id || employeeObj.id)) || payroll.staffId || payroll.employeeId || '',
          staffName: payroll.staffName || userObj?.name || employeeObj?.fullName || employeeObj?.name || '',
          month: monthName,
          year: String(payroll.year || ''),
          basicSalary: base,
          daysWorked: payroll.daysWorked || payroll.days_worked || payroll.presentDays || payroll.present_days || payroll.paidDays || 0,
          totalDays: payroll.totalDays || payroll.total_days || payroll.totalWorkingDays || payroll.workingDays || 0,
          paidLeaves: payroll.paidLeaves || 0,
          unpaidDays: payroll.unpaidDays || 0,
          deductions: deductions,
          netSalary: netSalary,
          status: (payroll.status || payroll.paymentStatus || payroll.payment_status || 'Pending') as AdminTypes.hrmTypes.payrollTypes.Payroll['status'],
          paidAt: payroll.paidAt,
          branchId: (storeObj && (storeObj._id || storeObj.id)) || payroll.branchId || payroll.storeId || '',
          branchName: payroll.branchName || payroll.storeName || storeObj?.name || '',
          designation: payroll.designation || employeeObj?.designation || '',
          remarks: payroll.remarks || '',
          createdAt: payroll.createdAt || '',
          updatedAt: payroll.updatedAt || ''
        };

        return extractedPayroll;
      });

    return extracted;
  }

  const obj = payload as Record<string, any>;

  if (obj?.data?.data?.payrolls && Array.isArray(obj.data.data.payrolls)) {
    return extractPayrolls(obj.data.data.payrolls);
  }
  if (obj?.data?.payrolls && Array.isArray(obj.data.payrolls)) {
    return extractPayrolls(obj.data.payrolls);
  }
  if (obj?.payrolls && Array.isArray(obj.payrolls)) {
    return extractPayrolls(obj.payrolls);
  }
  if (obj?.data && Array.isArray(obj.data)) {
    return extractPayrolls(obj.data);
  }
  if (obj?.results && Array.isArray(obj.results)) {
    return extractPayrolls(obj.results);
  }

  return [];
};

const extractStaff = (payload: unknown): AdminTypes.hrmTypes.staffTypes.Staff[] => {
  if (Array.isArray(payload)) {
    return payload
      .filter((staff: any) => staff && typeof staff === 'object' && (staff._id || staff.id))
      .map((staff: any) => {
        const storeObj = staff.storeId;
        return {
          _id: staff._id || staff.id || '',
          id: staff._id || staff.id,
          name: staff.name || staff.fullName || staff.user?.name || '',
          email: staff.email || staff.user?.email || '',
          phone: staff.phone || staff.user?.phone || '',
          designation: staff.designation || '',
          storeId: (storeObj && (storeObj._id || storeObj.id)) || staff.storeId,
          storeName: staff.storeName || storeObj?.name || '',
          salary: staff.salary || 0,
          joinDate: staff.joiningDate || staff.joinDate || '',
          isActive: (staff.status || 'Active') === 'Active',
          status: staff.status || 'Active',
          createdAt: staff.createdAt || '',
          updatedAt: staff.updatedAt || ''
        };
      });
  }

  const obj = payload as Record<string, any>;
  if (obj?.data && Array.isArray(obj.data)) {
    return extractStaff(obj.data);
  }
  if (obj?.data?.employees && Array.isArray(obj.data.employees)) {
    return extractStaff(obj.data.employees);
  }
  return [];
};

export default function PayrollManagement({
  initialPayrollsPayload,
  initialStaffPayload
}: {
  readonly initialPayrollsPayload?: unknown;
  readonly initialStaffPayload?: unknown;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { checkPermission } = customHooks.useUserPermissions();

  // Initialize state from URL params or defaults
  // Default to Previous Month and Year
  const initialMonth = searchParams.get('month') || getDefaultMonthName();
  const initialYear = searchParams.get('year') || getDefaultYear();

  const [payrolls, setPayrolls] = React.useState<AdminTypes.hrmTypes.payrollTypes.Payroll[]>([]);
  const [staff, setStaff] = React.useState<AdminTypes.hrmTypes.staffTypes.Staff[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showModal, setShowModal] = React.useState(false);
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [showSalarySlip, setShowSalarySlip] = React.useState(false);
  const [editingPayroll, setEditingPayroll] = React.useState<AdminTypes.hrmTypes.payrollTypes.Payroll | null>(null);
  const [selectedPayroll, setSelectedPayroll] = React.useState<AdminTypes.hrmTypes.payrollTypes.Payroll | null>(null);

  // Custom filters
  const [monthFilter, setMonthFilterState] = React.useState(initialMonth);
  const [yearFilter, setYearFilterState] = React.useState(initialYear);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = React.useState(Number(searchParams.get('page')) || 1);
  const [itemsPerPage, setItemsPerPage] = React.useState(Number(searchParams.get('limit')) || 10);

  // Local state for actions
  const [actionFilter, setActionFilter] = React.useState("All");
  const [localActiveStatusFilter, setLocalActiveStatusFilter] = React.useState("All");

  const [downloadData, setDownloadData] = React.useState<any[]>([]);

  const createQueryString = React.useCallback(
    (params: Record<string, string | number | null>) => {
      const newSearchParams = new URLSearchParams(searchParams.toString());

      Object.entries(params).forEach(([key, value]) => {
        if (value === null || value === 'All' || value === '') {
          newSearchParams.delete(key);
        } else {
          newSearchParams.set(key, String(value));
        }
      });

      return newSearchParams.toString();
    },
    [searchParams]
  );

  const updateUrl = (params: Record<string, string | number | null>) => {
    const queryString = createQueryString(params);
    router.replace(`${pathname}?${queryString}`, { scroll: false });
  };

  React.useEffect(() => {
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 10;
    setCurrentPage(page);
    setItemsPerPage(limit);
  }, [searchParams]);

  const setMonthFilter = (value: string) => {
    setMonthFilterState(value);
    updateUrl({ month: value, page: 1 });
  };

  const setYearFilter = (value: string) => {
    setYearFilterState(value);
    updateUrl({ year: value, page: 1 });
  };

  // Filter Logic
  // Filter Logic & Data Merging
  const mergedPayrolls = React.useMemo(() => {
    // If filters are set to "All", just show the existing payroll records (History view)
    // Otherwise, we merge Staff list to show "Pending" rows for missing records
    const isSpecificPeriod = monthFilter !== "All" && yearFilter !== "All";

    if (!isSpecificPeriod) {
      return payrolls.filter(payroll => {
        const matchesMonth = monthFilter === "All" || payroll.month === monthFilter;
        const matchesYear = yearFilter === "All" || payroll.year === yearFilter;
        return matchesMonth && matchesYear;
      });
    }

    // specific period: merge staff
    const merged = staff.map(employee => {
      const existing = payrolls.find(p =>
        p.staffId === employee.id &&
        p.month === monthFilter &&
        p.year === yearFilter
      );

      if (existing) return existing;

      // Return "Pending" ghost record
      return {
        id: `temp_${employee.id}`,
        staffId: employee.id,
        staffName: employee.name,
        month: monthFilter,
        year: yearFilter,
        basicSalary: employee.salary,
        daysWorked: 0,
        totalDays: 0,
        paidLeaves: 0,
        unpaidDays: 0,
        deductions: 0,
        netSalary: 0,
        status: 'Pending',
        branchId: employee.storeId,
        branchName: employee.storeName,
        designation: employee.designation,
        remarks: '',
        createdAt: '',
        updatedAt: ''
      } as AdminTypes.hrmTypes.payrollTypes.Payroll;
    });

    return merged;
  }, [payrolls, staff, monthFilter, yearFilter]);

  const preFilteredPayrolls = React.useMemo(() => {
    // Apply mergedPayrolls
    return mergedPayrolls;
  }, [mergedPayrolls]);

  const {
    searchTerm,
    setSearchTerm,
    allStatusFilter,
    setAllStatusFilter,
    filteredData
  } = customHooks.useListFilters<AdminTypes.hrmTypes.payrollTypes.Payroll>(
    preFilteredPayrolls,
    {
      statusAllSelector: (row) => row.status,
      searchKeys: ["staffName", "designation", "branchName"]
    }
  );

  const [selectedRows, setSelectedRows] = React.useState<AdminTypes.hrmTypes.payrollTypes.Payroll[]>([]);
  const [clearSelectedRows, setClearSelectedRows] = React.useState(false);

  // Calculate paginated data
  const paginatedData = React.useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  const clearSelectedData = () => {
    setClearSelectedRows(prev => !prev);
    setSelectedRows([]);
    router.refresh();
  }

  // Fetch Payrolls on mount or when filters change
  const fetchPayrolls = async () => {
    setLoading(true);
    try {
      const result = await ServerActions.ServerActionslib.getAllPayrollsAction();
      if (result?.success && result.data) {
        const extracted = extractPayrolls(result.data);
        setPayrolls(extracted);
      }
    } catch (error) {
      console.error("Failed to fetch payrolls:", error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchPayrolls();
  }, []); // Initial load

  // Re-fetch on filter changes to ensure data consistency
  React.useEffect(() => {
    fetchPayrolls();
  }, [monthFilter, yearFilter, allStatusFilter]);

  React.useEffect(() => {
    const init = async () => {
      try {
        if (initialPayrollsPayload) {
          const extractedPayrolls = extractPayrolls(initialPayrollsPayload);
          if (extractedPayrolls.length > 0) {
            setPayrolls(extractedPayrolls);
            setLoading(false);
          }
        }

        await fetchPayrolls();

        if (initialStaffPayload) {
          const extractedStaff = extractStaff(initialStaffPayload);
          setStaff(extractedStaff);
        }
      } catch (err) {
        setLoading(false);
      }
    };
    init();
  }, []);

  const handleEdit = React.useCallback((payroll: AdminTypes.hrmTypes.payrollTypes.Payroll) => {
    setEditingPayroll(payroll);
    setShowEditModal(true);
  }, []);

  const handleBulkApply = async () => {
    if (actionFilter === 'Delete' && selectedRows.length > 0) {
      const result = await AdminWebComponents.SwalHelper.delete({
        text: `Are you sure you want to delete ${selectedRows.length} records?`
      });
      if (result.isConfirmed) {
        setLoading(true);
        try {
          const ids = selectedRows.map(row => row.id);
          const response = await ServerActions.ServerActionslib.bulkDeletePayrollAction({ ids });

          if (response?.success) {
            await fetchPayrolls();
            setSelectedRows([]);
            setClearSelectedRows(prev => !prev);
            AdminWebComponents.SwalHelper.success({ title: "Success", text: "Selected records deleted successfully!" });
          } else {
            AdminWebComponents.SwalHelper.error({ title: "Error", text: response?.error || "Failed to delete selected records" });
          }
        } catch (err) {
          console.error("Bulk delete error:", err);
          AdminWebComponents.SwalHelper.error({ title: "Error", text: "An error occurred while deleting records" });
        } finally {
          setLoading(false);
          setActionFilter('All');
        }
      }
    } else if (actionFilter !== 'All' && selectedRows.length === 0) {
      AdminWebComponents.SwalHelper.warning({ text: "Please select rows to apply action." });
    }
  };

  const handleDelete = React.useCallback(async (id: string) => {
    const result = await AdminWebComponents.SwalHelper.delete();
    if (result.isConfirmed) {
      try {
        setDeletingId(id);
        const deleteResult = await ServerActions.ServerActionslib.deletePayrollAction(id);
        if (deleteResult?.success) {
          await fetchPayrolls();
          AdminWebComponents.SwalHelper.success({ title: "Success", text: "Payroll record deleted successfully!" });
        } else {
          AdminWebComponents.SwalHelper.error({ title: "Error", text: deleteResult?.error || "Failed to delete payroll record" });
        }
      } catch (error) {
        AdminWebComponents.SwalHelper.error({ title: "Error", text: "Failed to delete payroll record" });
      } finally {
        setDeletingId(null);
      }
    }
  }, [fetchPayrolls]);

  const handleDownloadSlip = React.useCallback((id: string) => {
    const payroll = payrolls.find(p => p.id === id);
    if (payroll) {
      setSelectedPayroll(payroll);
      setShowSalarySlip(true);
    }
  }, [payrolls]);

  const handleEmailSlip = React.useCallback((id: string) => {
    const payroll = payrolls.find(p => p.id === id);
    if (payroll) {
      setSelectedPayroll(payroll);
      setShowSalarySlip(true);
    }
  }, [payrolls]);

  const handleAddNew = React.useCallback(() => {
    // This is now "Send Email to All" functionality
    handleSendEmailToAll();
  }, []);

  const handleSendEmailToAll = async () => {
    if (filteredData.length === 0) {
      AdminWebComponents.SwalHelper.warning({ text: "No records to send emails to." });
      return;
    }

    const result = await AdminWebComponents.SwalHelper.confirm({
      title: `Send Pay Slips to ${filteredData.length} employees?`,
      text: "This will send email notifications to all listed employees.",
      icon: "info",
      confirmButtonText: "Yes, send emails"
    });

    if (result.isConfirmed) {
      setLoading(true);
      try {
        // Mocking the email sending for now, or use a new action
        // const response = await ServerActions.ServerActionslib.sendPayrollEmailAction({ ids: filteredData.map(d => d.id) });

        // Simulate delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        AdminWebComponents.SwalHelper.success({
          title: "Success",
          text: "Emails sent successfully!"
        });
      } catch (error) {
        console.error("Email send error", error);
        AdminWebComponents.SwalHelper.error({ title: "Error", text: "Failed to send emails." });
      } finally {
        setLoading(false);
      }
    }
  };

  // CSV and PDF export columns
  const exportColumns = React.useMemo(() => {
    return WebComponents.WebCommonComponents.CommonComponents.generateExportColumns<AdminTypes.hrmTypes.payrollTypes.Payroll>([
      {
        key: 'staffName',
        label: "Employee Name",
        accessor: (row) => row.staffName || '-',
        pdfWidth: 40
      },
      {
        key: 'designation',
        label: "Designation",
        accessor: (row) => row.designation || '-',
        pdfWidth: 30
      },
      {
        key: 'month',
        label: "Month/Year",
        accessor: (row) => `${row.month} ${row.year}`,
        pdfWidth: 30
      },
      {
        key: 'basicSalary',
        label: "Basic Salary",
        accessor: (row) => `₹${row.basicSalary?.toLocaleString()}`,
        pdfWidth: 30
      },
      {
        key: 'daysWorked',
        label: "Days Worked",
        accessor: (row) => `${row.daysWorked}/${row.totalDays}`,
        pdfWidth: 25
      },
      {
        key: 'netSalary',
        label: "Net Salary",
        accessor: (row) => `₹${row.netSalary?.toLocaleString()}`,
        pdfWidth: 30
      },
      {
        key: 'status',
        label: "Status",
        accessor: (row) => row.status || 'Pending',
        pdfWidth: 25
      }
    ]);
  }, []);

  // Helper for Year Options (Past & Current only)
  const yearOptions = React.useMemo(() => {
    const currentYear = new Date().getFullYear();
    const startYear = 2024; // Base year
    const years = [{ name: 'All Years', value: 'All' }];

    // Only add years up to current year
    for (let y = startYear; y <= currentYear; y++) {
      years.push({ name: String(y), value: String(y) });
    }
    // Sort descending
    return years.sort((a, b) => b.value === 'All' ? -1 : Number(b.value) - Number(a.value));
  }, []);

  // download pdf or csv
  const downloadPdf = async (): Promise<any[]> => {
    const data = await ServerActions.HandleFunction.handleDownloadCommon({
      selectedRows,
      searchParams,
      bulkGetSelectedAction: ServerActions.ServerActionslib.bulkGetSelectedPayrollAction,
      bulkGetAllAction: ServerActions.ServerActionslib.bulkGetPayrollAction,
      // Don't set download data here, we need to extract it first
    });
    const extracted = extractPayrolls(data);
    setDownloadData(extracted);
    return extracted;
  };

  const tableColumns = React.useMemo(() => WebComponents.WebCommonComponents.CommonComponents.createColumns<AdminTypes.hrmTypes.payrollTypes.Payroll>({
    fields: [
      {
        name: "Name",
        selector: (row) => row.staffName || 'N/A',
        sortable: true
      },
      {
        name: "Position",
        selector: (row) => row.designation || 'N/A',
        sortable: true
      },
      {
        name: "Store",
        selector: (row) => row.branchName || 'N/A',
        sortable: true
      },
      {
        name: "Present Days",
        selector: (row) => row.daysWorked,
        sortable: true
      },
      {
        name: "Salary",
        selector: (row) => row.basicSalary,
        cell: (row) => `₹${row.basicSalary.toLocaleString()}`,
        sortable: true
      },
      {
        name: "Payable Amount",
        selector: (row) => row.netSalary,
        cell: (row) => `₹${row.netSalary.toLocaleString()}`,
        sortable: true
      },
      {
        name: "Month",
        selector: (row) => `${row.month} ${row.year}`,
        sortable: true
      },
      {
        name: "Status",
        selector: (row) => row.status,
        cell: (row) => {
          const statusClass = row.status?.toLowerCase() || 'pending';
          const statusColors: any = {
            paid: 'bg-green-100 text-green-800',
            pending: 'bg-yellow-100 text-yellow-800',
            processing: 'bg-red-100 text-red-800'
          };
          return (
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColors[statusClass] || 'bg-gray-100 text-gray-800'}`}>
              {row.status || 'Pending'}
            </span>
          );
        },
        sortable: true
      }
    ],
    actions: [
      {
        render: (row) => {
          // Hide Edit button if status is NOT Pending
          if (row.status?.toLowerCase() !== 'pending') return null;
          if (!checkPermission("hrm.payroll", "update")) return null;

          return (
            <WebComponents.UiComponents.UiWebComponents.Button size="icon" variant="editaction" onClick={() => handleEdit(row)} title="Edit">
              <Pencil className="w-4 h-4" />
            </WebComponents.UiComponents.UiWebComponents.Button>
          );
        }
      },
      {
        render: (row) => (
          <WebComponents.UiComponents.UiWebComponents.Button size="icon" variant="downloadaction" onClick={() => handleDownloadSlip(row.id)} title="Download Slip">
            <Download className="w-4 h-4" />
          </WebComponents.UiComponents.UiWebComponents.Button>
        )
      },
      {
        render: (row) => (
          <WebComponents.UiComponents.UiWebComponents.Button size="icon" variant="mailaction" onClick={() => handleEmailSlip(row.id)} title="Email Slip">
            <Mail className="w-4 h-4" />
          </WebComponents.UiComponents.UiWebComponents.Button>
        )
      },
      ...(checkPermission("hrm.payroll", "delete") ? [{
        render: (row: any) => (
          <WebComponents.UiComponents.UiWebComponents.Button size="icon" variant="deleteaction" onClick={() => handleDelete(row.id)} title="Delete">
            {deletingId === row.id ? (
              <div className="w-4 h-4 border-2 border-[#DE4B37] border-t-transparent rounded-full animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </WebComponents.UiComponents.UiWebComponents.Button>
        )
      }] : [])
    ]
  }), [handleEdit, handleDownloadSlip, handleEmailSlip, handleDelete, deletingId, checkPermission]);

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-lg sm:text-lg md:text-xl lg:text-2xl font-medium text-textMain dark:text-white truncate">
            {Constants.adminConstants.payrollManagementStrings.title}
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-textSmall pt-2">
            {Constants.adminConstants.payrollManagementStrings.description}
          </p>
        </div>
        <WebComponents.UiComponents.UiWebComponents.Button
          variant="addBackButton"
          onClick={() => {
            if (showModal || showEditModal) {
              setShowModal(false);
              setShowEditModal(false);
              setEditingPayroll(null);
            } else {
              handleSendEmailToAll();
            }
          }}
          className="w-auto h-auto px-6 py-2.5"
        >
          {showModal || showEditModal ? (
            <><HiArrowLeft className="w-4 h-4" /> Back</>
          ) : (
            <><Mail className="w-4 h-4" /> Send Email to All</>
          )}
        </WebComponents.UiComponents.UiWebComponents.Button>
      </div>

      {!showModal && !showEditModal && (
        <div className="bg-white dark:bg-darkFilterbar rounded-[4px] h-full w-full mt-4 overflow-hidden">

          <WebComponents.WebCommonComponents.CommonComponents.CommonFilterBar
            actionFilter={actionFilter}
            onActionFilterChange={setActionFilter}
            actionOptions={[{ name: 'Delete', value: 'Delete' }]}
            activeStatusFilter={localActiveStatusFilter}
            onActiveStatusFilterChange={setLocalActiveStatusFilter}
            activeStatusOptions={[
              { name: 'All Status', value: 'All' },
              { name: 'Pending', value: 'Pending' },
              { name: 'Paid', value: 'Paid' },
              { name: 'Processing', value: 'Processing' }
            ]}
            selectedCount={selectedRows.length}
            onApply={handleBulkApply}
            categoryFilter="All"
            onCategoryFilterChange={() => { }}
            showCategoryFilter={false}
            statusFilter={allStatusFilter}
            onStatusFilterChange={setAllStatusFilter}
            statusOptions={[
              { label: 'All Status', value: 'All' },
              { label: 'Pending', value: 'Pending' },
              { label: 'Paid', value: 'Paid' },
              { label: 'Processing', value: 'Processing' }
            ]}
            searchTerm={searchTerm}
            onSearchTermChange={setSearchTerm}
            renderExports={
              <div className="flex items-center gap-2">
                <AdminWebComponents.FilterDropdown
                  value={monthFilter === 'All' ? null : monthFilter}
                  onChange={(e) => setMonthFilter(e.value ?? 'All')}
                  options={[{ name: 'All Months', value: 'All' }, ...MONTH_NAMES].map((m: any) => typeof m === 'string' ? ({ name: m, value: m }) : m)}
                  optionLabel="name"
                  optionValue="value"
                  placeholder="All Months"
                  filter={false}
                  showClear={false}
                  className="w-32 sm:w-40"
                />
                <AdminWebComponents.FilterDropdown
                  value={yearFilter === 'All' ? null : yearFilter}
                  onChange={(e) => setYearFilter(e.value ?? 'All')}
                  options={yearOptions}
                  optionLabel="name"
                  optionValue="value"
                  placeholder="All Years"
                  filter={false}
                  showClear={false}
                  className="w-24 sm:w-32"
                />
                <AdminWebComponents.FilterDropdown
                  value={allStatusFilter === 'All' ? null : allStatusFilter}
                  onChange={(e) => setAllStatusFilter(e.value ?? 'All')}
                  options={[
                    { name: 'All Status', value: 'All' },
                    { name: 'Pending', value: 'Pending' },
                    { name: 'Paid', value: 'Paid' },
                    { name: 'Processing', value: 'Processing' }
                  ]}
                  optionLabel="name"
                  optionValue="value"
                  placeholder="Status"
                  filter={false}
                  showClear={true}
                  className="w-32 sm:w-40"
                />
                <WebComponents.UiComponents.UiWebComponents.DownloadCSV
                  data={downloadData}
                  columns={exportColumns.csvColumns}
                  filename={`payroll-report-${new Date().toISOString().split('T')[0]}.csv`}
                  onExport={async () => {
                    const data = await downloadPdf();
                    WebComponents.UiComponents.UiWebComponents.SwalHelper.success({ text: 'CSV exported successfully.' });
                    clearSelectedData()
                    return data;
                  }}
                >
                  <button
                    type="button"
                    className="rounded-[4px] bg-[#ffffff] dark:bg-[#3A3A3A] border border-[#D8D9D9] border-opacity-50 font-interTight font-normal hover:bg-[#e0e0e0] dark:hover:bg-[#4A4A4A] shadow-sm transition-colors duration-200 cursor-pointer flex-shrink-0 sm:px-1 md:px-2 lg:px-2 xl:px-2 2xl:px-2 px-2 py-[6.9px]"
                    aria-label="Download CSV"
                    title="Download CSV"
                    disabled={filteredData.length === 0}
                  >
                    <Image src={Constants.assetsIcon.assets.csv} alt="CSV" width={28} height={28} className="w-5 h-5 sm:w-6 sm:h-6 md:w-6 md:h-6 lg:w-7 lg:h-7 xl:w-7 xl:h-7 2xl:w-7 2xl:h-7" />
                  </button>
                </WebComponents.UiComponents.UiWebComponents.DownloadCSV>
                <WebComponents.UiComponents.UiWebComponents.DownloadPDF
                  data={downloadData}
                  columns={exportColumns.pdfColumns}
                  filename={`payroll-report-${new Date().toISOString().split('T')[0]}.pdf`}
                  title="Payroll Report"
                  orientation="landscape"
                  onExport={async () => {
                    const data = await downloadPdf();
                    WebComponents.UiComponents.UiWebComponents.SwalHelper.success({ text: 'PDF exported successfully.' });
                    clearSelectedData()
                    return data;
                  }}
                >
                  <button
                    type="button"
                    className="rounded-[4px] bg-[#ffffff] dark:bg-[#3A3A3A] border border-[#D8D9D9] border-opacity-50 font-interTight font-normal hover:bg-[#e0e0e0] dark:hover:bg-[#4A4A4A] shadow-sm transition-colors duration-200 cursor-pointer flex-shrink-0 sm:px-1 md:px-2 lg:px-2 xl:px-2 2xl:px-2 px-2 py-[6.9px]"
                    aria-label="Download PDF"
                    title="Download PDF"
                    disabled={filteredData.length === 0}
                  >
                    <Image src={Constants.assetsIcon.assets.pdf} alt="PDF" width={28} height={28} className="w-5 h-5 sm:w-6 sm:h-6 md:w-6 md:h-6 lg:w-7 lg:h-7 xl:w-7 xl:h-7 2xl:w-7 2xl:h-7" />
                  </button>
                </WebComponents.UiComponents.UiWebComponents.DownloadPDF>
              </div>
            }
          />

          <WebComponents.WebCommonComponents.CommonComponents.DataTable
            columns={tableColumns}
            data={paginatedData}
            selectableRows
            clearSelectedRows={clearSelectedRows}
            onSelectedRowsChange={({ selectedRows }) => setSelectedRows(selectedRows)}
            useCustomPagination={true}
            totalRecords={filteredData.length}
            filteredRecords={filteredData.length}
            paginationPerPage={itemsPerPage}
            paginationDefaultPage={currentPage}
            paginationRowsPerPageOptions={[5, 10, 25, 50]}
            onChangePage={(page) => {
              updateUrl({ page: page });
            }}
            onChangeRowsPerPage={(newPerPage) => {
              updateUrl({ limit: newPerPage, page: 1 });
            }}
            useUrlParams={true}
          />
        </div>
      )}

      {(showModal || showEditModal) && (
        <WebComponents.UiComponents.UiWebComponents.AdminFormModal
          formId="payroll-form"
          onClose={() => {
            setShowModal(false);
            setShowEditModal(false);
            setEditingPayroll(null);
          }}
          loading={loading}
        >
          {showEditModal && editingPayroll ? (
            <PayrollForm
              title="Edit Payroll"
              payroll={editingPayroll}
              staff={staff}
              onClose={() => {
                setShowEditModal(false);
                setEditingPayroll(null);
              }}
              onSubmit={async (data) => {
                try {
                  // If ID starts with 'temp_', it's a ghost record, so we CREATE instead of UPDATE
                  const isGhostRecord = editingPayroll.id.startsWith('temp_');

                  if (isGhostRecord) {
                    // Create logic (same as Generate Payroll)
                    const result = await ServerActions.ServerActionslib.generatePayrollForEmployeeAction(data.staffId, {
                      month: data.month,
                      year: data.year,
                      basicSalary: data.basicSalary,
                      baseSalary: data.basicSalary, // Variant
                      deductions: data.deductions,
                      deduction: data.deductions, // Variant
                      daysWorked: data.daysWorked,
                      days_worked: data.daysWorked,
                      presentDays: data.daysWorked,
                      present_days: data.daysWorked,
                      totalDays: data.totalDays,
                      total_days: data.totalDays,
                      totalWorkingDays: data.totalDays,
                      paidLeaves: data.paidLeaves,
                      paid_leaves: data.paidLeaves,
                      unpaidDays: data.unpaidDays,
                      unpaid_days: data.unpaidDays,
                      netSalary: data.totalSalary || 0,
                      net_salary: data.totalSalary || 0, // Variant
                      totalSalary: data.totalSalary || 0,
                      remarks: data.remarks,
                      status: (data as any).status,
                      paymentStatus: (data as any).status,
                      payment_status: (data as any).status
                    });

                    if (result?.success) {
                      await fetchPayrolls();
                      AdminWebComponents.SwalHelper.success({ title: "Success", text: "Payroll generated successfully!" });
                      setShowEditModal(false);
                      setEditingPayroll(null);
                    } else {
                      AdminWebComponents.SwalHelper.error({ title: "Error", text: result?.error || "Failed to generate payroll" });
                    }
                  } else {
                    // Existing Update Logic
                    const result = await ServerActions.ServerActionslib.updatePayrollDeductionAction(editingPayroll.id, {
                      deductions: data.deductions,
                      deduction: data.deductions, // Variant
                      basicSalary: data.basicSalary,
                      baseSalary: data.basicSalary, // Variant
                      daysWorked: data.daysWorked,
                      days_worked: data.daysWorked,
                      presentDays: data.daysWorked,
                      present_days: data.daysWorked,
                      totalDays: data.totalDays,
                      total_days: data.totalDays,
                      totalWorkingDays: data.totalDays,
                      paidLeaves: data.paidLeaves,
                      paid_leaves: data.paidLeaves,
                      unpaidDays: data.unpaidDays,
                      unpaid_days: data.unpaidDays,
                      netSalary: data.totalSalary || 0,
                      net_salary: data.totalSalary || 0, // Variant
                      totalSalary: data.totalSalary || 0,
                      remarks: data.remarks,
                      status: (data as any).status,
                      paymentStatus: (data as any).status,
                      payment_status: (data as any).status
                    });

                    if (result?.success) {
                      await fetchPayrolls();
                      AdminWebComponents.SwalHelper.success({ title: "Success", text: "Payroll updated successfully!" });
                      setShowEditModal(false);
                      setEditingPayroll(null);
                    } else {
                      AdminWebComponents.SwalHelper.error({ title: "Error", text: result?.error || "Failed to update payroll" });
                    }
                  }
                } catch (error) {
                  AdminWebComponents.SwalHelper.error({ title: "Error", text: "Failed to update payroll" });
                }
              }}
            />
          ) : (
            <PayrollForm
              title="Generate Payroll"
              staff={staff}
              onClose={() => setShowModal(false)}
              onSubmit={async (data) => {
                try {
                  const result = await ServerActions.ServerActionslib.generatePayrollForEmployeeAction(data.staffId, {
                    month: data.month,
                    year: data.year,
                    basicSalary: data.basicSalary,
                    deductions: data.deductions,
                    daysWorked: data.daysWorked,
                    days_worked: data.daysWorked,
                    presentDays: data.daysWorked,
                    totalDays: data.totalDays,
                    total_days: data.totalDays,
                    totalWorkingDays: data.totalDays,
                    paidLeaves: data.paidLeaves,
                    paid_leaves: data.paidLeaves,
                    unpaidDays: data.unpaidDays,
                    unpaid_days: data.unpaidDays,
                    netSalary: data.totalSalary || 0,
                    totalSalary: data.totalSalary || 0,
                    remarks: data.remarks
                  });

                  if (result?.success) {
                    await fetchPayrolls();
                    AdminWebComponents.SwalHelper.success({ title: "Success", text: "Payroll generated successfully!" });
                    setShowModal(false);
                  } else {
                    AdminWebComponents.SwalHelper.error({ title: "Error", text: result?.error || "Failed to generate payroll" });
                  }
                } catch (error: any) {
                  AdminWebComponents.SwalHelper.error({ title: "Error", text: error?.response?.data?.message || "Failed to generate payroll" });
                }
              }}
            />
          )}
        </WebComponents.UiComponents.UiWebComponents.AdminFormModal>
      )}

      {showSalarySlip && selectedPayroll && (
        <SalarySlip
          payroll={selectedPayroll}
          onClose={() => {
            setShowSalarySlip(false);
            setSelectedPayroll(null);
          }}
        />
      )}
    </>
  );
}
