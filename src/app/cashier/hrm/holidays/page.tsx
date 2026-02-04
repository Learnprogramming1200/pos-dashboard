import { ServerActions } from "@/lib/server-lib";
import { WebComponents } from "@/components";

export default async function HolidaysPage({
  searchParams,
}: {
  readonly searchParams: Promise<{ page?: string; limit?: string; search?: string; status?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const page = Number(resolvedSearchParams?.page) || 1;
  const limit = Number(resolvedSearchParams?.limit) || 10;
  const search = resolvedSearchParams?.search || "";
  const statusParam = resolvedSearchParams?.status;

  // Convert string status to boolean for server API
  let statusBoolean: boolean | undefined;
  if (statusParam === 'Active') {
    statusBoolean = true;
  } else if (statusParam === 'Inactive') {
    statusBoolean = false;
  }

  // Fetch records with proper pagination parameters
  const response = await ServerActions.ServerApilib.ssrHolidayAPI.getAll(page, limit, search, statusBoolean as any);
  const responseData = response?.data?.data || {};
  
  // Handle different response structures and transform data
  const rawHolidays = Array.isArray(responseData.holidays) ? responseData.holidays : [];

  // Transform the data to match our interface (same transformation logic that was in client comp)
  const holidays: any[] = rawHolidays.map((holiday: any) => {
    let statusValue = 'Inactive';
    if (typeof holiday.status === 'boolean') {
      statusValue = holiday.status ? 'Active' : 'Inactive';
    } else if (typeof holiday.status === 'string') {
      const s = holiday.status.trim().toLowerCase();
      if (s === 'active') statusValue = 'Active';
      else if (s === 'inactive') statusValue = 'Inactive';
      else statusValue = holiday.status; // Keep original if unknown
    } else if (holiday.status) {
      statusValue = String(holiday.status);
    }

    return {
      id: holiday._id || holiday.id,
      name: holiday.name,
      date: holiday.date || holiday.startDate || '', // Legacy field for backward compatibility
      startDate: holiday.startDate,
      endDate: holiday.endDate,
      description: holiday.description,
      isRecurring: holiday.isRecurring,
      status: statusValue,
      createdAt: holiday.createdAt,
      updatedAt: holiday.updatedAt,
      // Include additional fields from API
      statusDisplay: holiday.statusDisplay,
      recurringDisplay: holiday.recurringDisplay,
      __v: holiday.__v
    };
  });

  const total = responseData.total || responseData.totalDocs || responseData.count || responseData.totalItems || 0;

  const pagination = response.data?.data?.pagination ||{
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: limit,
  };

  return (
    <WebComponents.AdminComponents.AdminWebComponents.AdminHRMWebComponents.HolidayManagement
      initialHolidayPayload={holidays}
      initialPagination={pagination}
    />
  );
}
