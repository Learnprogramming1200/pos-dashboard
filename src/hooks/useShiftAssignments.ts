"use client";
import { useState, useEffect } from 'react';
import { getAllShiftAssignmentsAction } from '@/lib/server-actions';
import { ShiftAssignmentData } from '@/types/admin/hrm/ShiftAssignment';


export const useShiftAssignments = (initialData?: any[]) => {
  const [shiftAssignments, setShiftAssignments] = useState<ShiftAssignmentData[]>([]);
  const [loading, setLoading] = useState(!initialData || initialData.length === 0);
  const [error, setError] = useState<string | null>(null);

  // Normalizer to map API records to ShiftAssignment type
  const normalizeShiftAssignment = (assignmentData: any): ShiftAssignmentData => {
    // Get date from various possible field names
    let assignmentDate = assignmentData.assignmentDate ||
      assignmentData.date ||
      assignmentData.assignment_date || '';

    // Normalize date to YYYY-MM-DD format
    if (assignmentDate) {
      try {
        const date = new Date(assignmentDate);
        if (!isNaN(date.getTime())) {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          assignmentDate = `${year}-${month}-${day}`;
        }
      } catch (e) {
        console.warn('Could not parse date:', assignmentDate);
      }
    }

    // Calculate dayOfWeek from date
    let dayOfWeek = assignmentData.dayOfWeek || assignmentData.day_of_week || '';
    if (!dayOfWeek && assignmentDate) {
      try {
        const date = new Date(assignmentDate);
        if (!isNaN(date.getTime())) {
          const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
          dayOfWeek = dayNames[date.getDay()];
        }
      } catch (e) {
        // Ignore
      }
    }

    // Build shiftTime display
    let shiftTime = assignmentData.shiftTime || assignmentData.shift_time || '';
    if (!shiftTime) {
      // Check for shift title from various sources (including shiftTypeId as object)
      const shiftTitle = assignmentData.shiftTitle ||
        assignmentData.shift_title ||
        assignmentData.shiftType?.title ||
        assignmentData.shift?.title ||
        (typeof assignmentData.shiftTypeId === 'object' ? assignmentData.shiftTypeId?.title : '') || '';

      // Check for startTime from various sources (including shiftTypeId as object)
      const startTime = assignmentData.startTime ||
        assignmentData.start_time ||
        assignmentData.shiftType?.startTime ||
        assignmentData.shift?.startTime ||
        (typeof assignmentData.shiftTypeId === 'object' ? assignmentData.shiftTypeId?.startTime : '') || '';

      // Check for endTime from various sources (including shiftTypeId as object)
      const endTime = assignmentData.endTime ||
        assignmentData.end_time ||
        assignmentData.shiftType?.endTime ||
        assignmentData.shift?.endTime ||
        (typeof assignmentData.shiftTypeId === 'object' ? assignmentData.shiftTypeId?.endTime : '') || '';

      if (shiftTitle && startTime) {
        const prefix = shiftTitle.charAt(0).toUpperCase();
        shiftTime = endTime ? `${prefix} ${startTime} - ${endTime}` : `${prefix} ${startTime}`;
      } else if (startTime) {
        shiftTime = endTime ? `${startTime} - ${endTime}` : startTime;
      }
    }

    // Get employee ID - try all possible field names (including nested structures)
    const employeeId = assignmentData.employeeId?._id ||
      assignmentData.employeeId?.id ||
      assignmentData.employee?._id ||
      assignmentData.employee?.id ||
      assignmentData.employeeId ||
      assignmentData.employee_id ||
      assignmentData.staffId ||
      assignmentData.staff_id ||
      String(assignmentData.employee) || // In case it's just an ID string
      '';

    // Get employee name - try nested structures first
    const employeeName = assignmentData.employeeId?.user?.name ||
      assignmentData.employee?.fullName ||
      assignmentData.employee?.name ||
      assignmentData.employeeName ||
      assignmentData.employee_name ||
      assignmentData.staffName ||
      assignmentData.staff_name ||
      '';

    return {
      id: assignmentData.id || assignmentData._id || String(Date.now()),
      employeeId: String(employeeId), // Ensure it's a string for comparison
      employeeName: employeeName,
      storeId: assignmentData.storeId?._id ||
        assignmentData.storeId?.id ||
        assignmentData.store?._id ||
        assignmentData.store?.id ||
        assignmentData.storeId ||
        assignmentData.store_id ||
        assignmentData.branchId ||
        assignmentData.branch_id ||
        '',
      shiftTypeId: String(assignmentData.shiftTypeId?._id ||
        assignmentData.shiftTypeId ||
        assignmentData.shift_type_id ||
        assignmentData.shiftId ||
        assignmentData.shift_id ||
        assignmentData.shiftType?._id ||
        assignmentData.shiftType?.id ||
        ''),
      assignmentDate: assignmentDate,
      dayOfWeek: dayOfWeek,
      status: assignmentData.status || 'scheduled',
      shiftTime: shiftTime,
      endDate: assignmentData.endDate || assignmentData.end_date || undefined,
      customWeekOff: assignmentData.customWeekOff || assignmentData.customweekoff || assignmentData.custom_weekoff || assignmentData.weekOff || assignmentData.weekoff || [],
      // Handle applicableDates - normalize each date to YYYY-MM-DD format
      applicableDates: Array.isArray(assignmentData.applicableDates)
        ? assignmentData.applicableDates.map((dateStr: string) => {
          try {
            const d = new Date(dateStr);
            if (!isNaN(d.getTime())) {
              const year = d.getFullYear();
              const month = String(d.getMonth() + 1).padStart(2, '0');
              const day = String(d.getDate()).padStart(2, '0');
              return `${year}-${month}-${day}`;
            }
            return dateStr;
          } catch {
            return dateStr;
          }
        })
        : undefined,
      createdAt: assignmentData.createdAt || assignmentData.created_at || new Date().toISOString(),
      updatedAt: assignmentData.updatedAt || assignmentData.updated_at || new Date().toISOString()
    };
  };

  const fetchShiftAssignments = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await getAllShiftAssignmentsAction();

      if (result.success && result.data) {
        // Try multiple possible response structures
        let assignmentsData = null;

        // Try different nested structures (most common API response patterns)
        if (result.data?.data?.data && Array.isArray(result.data.data.data)) {
          assignmentsData = result.data.data.data;
        } else if (result.data?.data && Array.isArray(result.data.data)) {
          assignmentsData = result.data.data;
        } else if (Array.isArray(result.data)) {
          assignmentsData = result.data;
        } else if (result.data?.assignments && Array.isArray(result.data.assignments)) {
          assignmentsData = result.data.assignments;
        } else if (result.data?.shifts && Array.isArray(result.data.shifts)) {
          assignmentsData = result.data.shifts;
        } else if (result.data?.result && Array.isArray(result.data.result)) {
          assignmentsData = result.data.result;
        } else {
          assignmentsData = [];
        }

        const normalizedAssignments = Array.isArray(assignmentsData)
          ? assignmentsData.map((assignment: any) => normalizeShiftAssignment(assignment))
          : [];

        setShiftAssignments(normalizedAssignments);
      } else {
        console.error('Failed to fetch shift assignments:', result.error);
        setError(result.error || 'Failed to fetch shift assignments');
        setShiftAssignments([]);
      }
    } catch (err: unknown) {
      console.error('❌ Error fetching shift assignments:', err);
      const errorMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to fetch shift assignments';
      setError(errorMessage);
      setShiftAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  // Initialize with SSR data if provided, and sync when initialData changes (like CouponManagement.tsx pattern)
  useEffect(() => {
    if (initialData && initialData.length > 0) {
      try {
        const normalizedAssignments = Array.isArray(initialData)
          ? initialData.map((assignment: any) => normalizeShiftAssignment(assignment))
          : [];

        setShiftAssignments(normalizedAssignments);
        setLoading(false);
      } catch (err) {
        console.error('Error normalizing initial data:', err);
        setError('Failed to process initial shift assignments');
        setLoading(false);
      }
    } else if (!initialData || initialData.length === 0) {
      // Fetch from API if no initial data
      fetchShiftAssignments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData]);

  const refreshShiftAssignments = () => {
    fetchShiftAssignments();
  };

  // Get assignments by employee ID - handle both string and number comparisons
  const getAssignmentsByEmployee = (employeeId: string) => {
    return shiftAssignments.filter(assignment => {
      // Compare as strings to handle type mismatches
      return String(assignment.employeeId) === String(employeeId);
    });
  };

  // Get assignments by date
  const getAssignmentsByDate = (date: string) => {
    return shiftAssignments.filter(assignment => assignment.assignmentDate === date);
  };

  // Get assignments by date range
  const getAssignmentsByDateRange = (startDate: string, endDate: string) => {
    return shiftAssignments.filter(assignment => {
      const assignmentDate = new Date(assignment.assignmentDate);
      const start = new Date(startDate);
      const end = new Date(endDate);
      return assignmentDate >= start && assignmentDate <= end;
    });
  };

  // Get assignments by store ID
  const getAssignmentsByStore = (storeId: string) => {
    return shiftAssignments.filter(assignment => assignment.storeId === storeId);
  };

  // Get assignments by day of week
  const getAssignmentsByDayOfWeek = (dayOfWeek: string) => {
    return shiftAssignments.filter(assignment => assignment.dayOfWeek === dayOfWeek);
  };

  // Convert assignments to calendar format for display
  const getAssignmentsForCalendar = (employeeId: string, weekDates: Date[], shifts?: any[]) => {
    const employeeAssignments = getAssignmentsByEmployee(employeeId);

    const calendarData: { [key: string]: { status: string, shift: string | null, id?: string, shiftTypeId?: string, customWeekOff?: any } } = {};

    // Initialize all days as empty
    const dayKeys = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    dayKeys.forEach(dayKey => {
      calendarData[dayKey] = { status: 'empty', shift: null };
    });

    // Helper function to normalize dates for comparison
    const normalizeDate = (date: Date | string): string => {
      const d = typeof date === 'string' ? new Date(date) : date;
      if (isNaN(d.getTime())) return '';
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    // Helper function to get shift time display from shiftTypeId
    const getShiftTimeDisplay = (assignment: ShiftAssignmentData): string | null => {
      // Always prioritize looking up shift details from shifts array using shiftTypeId
      if (shifts && shifts.length > 0 && assignment.shiftTypeId) {
        const shiftDetails = shifts.find(shift => {
          const shiftId = shift.id || shift._id;
          return shiftId === assignment.shiftTypeId || String(shiftId) === String(assignment.shiftTypeId);
        });

        if (shiftDetails) {
          const prefix = shiftDetails.title ? shiftDetails.title.charAt(0).toUpperCase() : 'S';
          if (shiftDetails.startTime) {
            return shiftDetails.endTime
              ? `${prefix} ${shiftDetails.startTime} - ${shiftDetails.endTime}`
              : `${prefix} ${shiftDetails.startTime}`;
          }
        }
      }

      // Fallback to stored shiftTime if shift lookup fails
      if (assignment.shiftTime) {
        return assignment.shiftTime;
      }

      return null;
    };

    // Map assignments to calendar days
    employeeAssignments.forEach((assignment) => {
      if (!assignment.assignmentDate) {
        return;
      }

      try {
        // Helper function to apply shift to a specific day
        const applyShiftToDay = (weekDate: Date) => {
          const dayOfWeek = weekDate.getDay();
          const dayKey = dayKeys[dayOfWeek];

          // Check for custom week off
          let isOff = false;
          if (assignment.customWeekOff && Array.isArray(assignment.customWeekOff)) {
            isOff = assignment.customWeekOff.some((offDay: string) =>
              offDay.toLowerCase() === dayKey.toLowerCase()
            );
          }

          if (!isOff && dayKey) {
            const shiftTimeDisplay = getShiftTimeDisplay(assignment);
            calendarData[dayKey] = {
              status: 'shift',
              shift: shiftTimeDisplay,
              id: assignment.id,
              shiftTypeId: assignment.shiftTypeId,
              customWeekOff: assignment.customWeekOff
            };
          }
        };

        // Priority 1: Use applicableDates if available (new API format)
        if (assignment.applicableDates && Array.isArray(assignment.applicableDates) && assignment.applicableDates.length > 0) {
          weekDates.forEach((weekDate) => {
            const currentStr = normalizeDate(weekDate);

            // Check if this week date is in the applicableDates array
            if (assignment.applicableDates!.includes(currentStr)) {
              applyShiftToDay(weekDate);
            }
          });
        } else {
          // Priority 2: Fall back to date range logic (legacy format)
          const startDate = new Date(assignment.assignmentDate);
          if (isNaN(startDate.getTime())) {
            return;
          }

          // Determine end date: use assignment.endDate if valid, otherwise startDate
          let endDate = startDate;
          if (assignment.endDate) {
            const parsedEnd = new Date(assignment.endDate);
            if (!isNaN(parsedEnd.getTime())) {
              endDate = parsedEnd;
            }
          }

          const startStr = normalizeDate(startDate);
          const endStr = normalizeDate(endDate);

          // Iterate through each day of the current week to see if it falls within the assignment range
          weekDates.forEach((weekDate) => {
            const currentStr = normalizeDate(weekDate);

            if (currentStr >= startStr && currentStr <= endStr) {
              applyShiftToDay(weekDate);
            }
          });
        }
      } catch (error) {
        console.error(`Error processing assignment:`, error);
      }
    });

    return calendarData;
  };

  // Get assignments for a specific date (useful for single day view)
  const getAssignmentsForDate = (employeeId: string, date: Date) => {
    const employeeAssignments = getAssignmentsByEmployee(employeeId);
    const dateString = date.toISOString().split('T')[0];

    return employeeAssignments.filter(assignment =>
      assignment.assignmentDate === dateString
    );
  };

  // Get all assignments for display in calendar (with date-based mapping)
  const getAllAssignmentsForCalendar = (weekDates: Date[], shifts?: any[]) => {
    const allAssignments: { [employeeId: string]: { [dayKey: string]: { status: string, shift: string | null } } } = {};

    // Get all unique employee IDs from assignments (as strings for consistent comparison)
    const employeeIds = [...new Set(shiftAssignments.map(assignment => String(assignment.employeeId)))];

    employeeIds.forEach(employeeId => {
      allAssignments[employeeId] = getAssignmentsForCalendar(employeeId, weekDates, shifts);
    });

    return allAssignments;
  };

  return {
    shiftAssignments,
    loading,
    error,
    refreshShiftAssignments,
    getAssignmentsByEmployee,
    getAssignmentsByDate,
    getAssignmentsByDateRange,
    getAssignmentsByStore,
    getAssignmentsByDayOfWeek,
    getAssignmentsForCalendar,
    getAssignmentsForDate,
    getAllAssignmentsForCalendar
  };
};
