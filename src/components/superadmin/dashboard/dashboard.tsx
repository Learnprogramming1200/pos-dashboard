"use client";
import React from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { BarChart3 } from "lucide-react";
import { Constants } from "@/constant";
import { env } from "@/lib/env";
import { tokenUtils } from "@/lib/utils";
import { WebComponents } from "@/components";
import { SuperAdminTypes } from "@/types";
// Dynamically import ApexCharts to avoid SSR issues
const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });
interface DashboardPageProps {
  readonly initialData: SuperAdminTypes.DashboardTypes.DashboardStats;
  readonly initialPlanWiseSubscriptionsData?: SuperAdminTypes.DashboardTypes.PlanWiseSubscriptionsData;
  readonly initialRevenueOverviewData?: SuperAdminTypes.DashboardTypes.RevenueOverviewData;
}

export default function DashboardPage({ initialData, initialPlanWiseSubscriptionsData, initialRevenueOverviewData }: DashboardPageProps) {
  const [stats, setStats] = React.useState<SuperAdminTypes.DashboardTypes.DashboardStats>(initialData);
  const [planWiseSubscriptionsData, setPlanWiseSubscriptionsData] = React.useState<SuperAdminTypes.DashboardTypes.PlanWiseSubscriptionsData | undefined>(initialPlanWiseSubscriptionsData);
  const [revenueOverviewData, setRevenueOverviewData] = React.useState<SuperAdminTypes.DashboardTypes.RevenueOverviewData | undefined>(initialRevenueOverviewData);
  const [revenueTimeRange, setRevenueTimeRange] = React.useState<string>("Last 3 Months");
  const [planTimeRange, setPlanTimeRange] = React.useState<string>("Last 3 Months");
  const [recentActivityFilter, setRecentActivityFilter] = React.useState<string>("All");
  const [isLoadingRevenue, setIsLoadingRevenue] = React.useState(false);
  const [isLoadingPlan, setIsLoadingPlan] = React.useState(false);
  const dateRangeInputRef = React.useRef<HTMLDivElement>(null);

  // Date range state - default to last 30 days
  const getDefaultStartDate = () => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    const dd = `${date.getDate()}`.padStart(2, "0");
    const mm = `${date.getMonth() + 1}`.padStart(2, "0");
    const yyyy = date.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  };

  const getDefaultEndDate = () => {
    const date = new Date();
    const dd = `${date.getDate()}`.padStart(2, "0");
    const mm = `${date.getMonth() + 1}`.padStart(2, "0");
    const yyyy = date.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  };

  const [dateRange, setDateRange] = React.useState({
    start: getDefaultStartDate(),
    end: getDefaultEndDate()
  });

  // Theme detection for charts
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === 'dark';

  // Format date from DD-MM-YYYY to YYYY-MM-DD for display
  const formatDateForDisplay = (dateStr: string) => {
    const [dd, mm, yyyy] = dateStr.split("-");
    return `${yyyy}-${mm}-${dd}`;
  };

  const handleDisplayBoxClick = () => {
    // Trigger click on the first input to open the date picker
    const firstInput = dateRangeInputRef.current?.querySelector('input') as HTMLInputElement;
    if (firstInput) {
      firstInput.focus();
      firstInput.click();
    }
  };

  // Convert DD-MM-YYYY to YYYY-MM-DD
  const convertDateToISO = (dateStr: string) => {
    const [dd, mm, yyyy] = dateStr.split("-");
    return `${yyyy}-${mm}-${dd}`;
  };

  const handleGenerateReport = async () => {
    try {
      const startDate = convertDateToISO(dateRange.start);
      // const endDate = convertDateToISO(dateRange.end); // Backend currently only supports startDate for filtering from that date onwards or similar logic

      const queryParams = new URLSearchParams();
      if (startDate) {
        queryParams.append('startDate', startDate);
      }

      const endpoint = `/super-admin/dashboard?${queryParams.toString()}`;
      const response = await fetchDashboardData<{ data?: SuperAdminTypes.DashboardTypes.DashboardStats }>(endpoint);

      const newStats = response?.data || response;
      if (newStats) {
        setStats(newStats as SuperAdminTypes.DashboardTypes.DashboardStats);
      }
    } catch (error) {
      console.error("Error generating report:", error);
    }
  };

// Helper function to create headers for API requests (similar to ssr-api)
  const createHeaders = (): HeadersInit => {
    const headers: HeadersInit = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };

    // Add auth token if available
    const token = tokenUtils.getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  };

  // Client-side API fetch function (similar to ssr-api pattern)
  const cache = React.useRef<Map<string, { ts: number; data: any }>>(new Map());
  const fetchDashboardData = async <T,>(endpoint: string): Promise<T> => {
    const baseURL = env.BACKEND_URL;
    const url = `${baseURL}${endpoint}`;
    const headers = createHeaders();
    const now = Date.now();
    const cached = cache.current.get(url);
    if (cached && now - cached.ts <= 60000) {
      return cached.data as T;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    cache.current.set(url, { ts: Date.now(), data });
    return data;
  };

  React.useEffect(() => {
    const startDate = getStartDateFromTimeRange("Last 3 Months");
    const qp = new URLSearchParams();
    if (startDate) qp.append('startDate', startDate);
    const planEndpoint = `/super-admin/dashboard/plan-wise-subscriptions${qp.toString() ? `?${qp.toString()}` : ''}`;
    const revenueEndpoint = `/super-admin/dashboard/revenue-overview${qp.toString() ? `?${qp.toString()}` : ''}`;
    const statsEndpoint = `/super-admin/dashboard${qp.toString() ? `?${qp.toString()}` : ''}`;
    (async () => {
      try {
        setIsLoadingRevenue(true);
        setIsLoadingPlan(true);
        const settled = await Promise.allSettled([
          fetchDashboardData<{ data?: SuperAdminTypes.DashboardTypes.DashboardStats }>(statsEndpoint),
          fetchDashboardData<{ data?: SuperAdminTypes.DashboardTypes.PlanWiseSubscriptionsData }>(planEndpoint),
          fetchDashboardData<{ data?: SuperAdminTypes.DashboardTypes.RevenueOverviewData }>(revenueEndpoint),
        ]);
        const statsRes = settled[0].status === 'fulfilled' ? settled[0].value : { data: initialData };
        const planRes = settled[1].status === 'fulfilled' ? settled[1].value : { data: initialPlanWiseSubscriptionsData || [] };
        const revenueRes = settled[2].status === 'fulfilled' ? settled[2].value : { data: initialRevenueOverviewData || {} };
        const newStats = (statsRes)?.data || statsRes || initialData;
        const newPlans = (planRes)?.data || planRes || initialPlanWiseSubscriptionsData || [];
        const newRevenue = (revenueRes)?.data || revenueRes || initialRevenueOverviewData || {};
        setStats(newStats as SuperAdminTypes.DashboardTypes.DashboardStats);
        setPlanWiseSubscriptionsData(newPlans as SuperAdminTypes.DashboardTypes.PlanWiseSubscriptionsData);
        setRevenueOverviewData(newRevenue as SuperAdminTypes.DashboardTypes.RevenueOverviewData);
      } finally {
        setIsLoadingRevenue(false);
        setIsLoadingPlan(false);
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Helper function to convert time range to months and calculate start date
  const getStartDateFromTimeRange = (timeRange: string): string | undefined => {
    if (timeRange === "All Time") {
      return undefined; // Don't send startDate for "All Time"
    }

    let monthsBack = 1; // Default to "Last Months"
    if (timeRange === "Last 3 Months") {
      monthsBack = 3;
    } else if (timeRange === "Last 6 Months") {
      monthsBack = 6;
    } else if (timeRange === "Last Year") {
      monthsBack = 12;
    }

    const date = new Date();
    date.setMonth(date.getMonth() - monthsBack);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Handle revenue overview time range change
  const handleRevenueTimeRangeChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedRange = e.target.value;
    setRevenueTimeRange(selectedRange);
    setIsLoadingRevenue(true);

    try {
      const startDate = getStartDateFromTimeRange(selectedRange);
      const queryParams = new URLSearchParams();
      if (startDate) {
        queryParams.append('startDate', startDate);
      }
      const query = queryParams.toString();
      const endpoint = `/super-admin/dashboard/revenue-overview${query ? `?${query}` : ''}`;
      const response = await fetchDashboardData<{ data?: SuperAdminTypes.DashboardTypes.RevenueOverviewData; status?: number }>(endpoint);
      const data = response?.data || response || {};
      setRevenueOverviewData(data as SuperAdminTypes.DashboardTypes.RevenueOverviewData);
    } catch (error) {
      console.error("Error fetching revenue overview:", error);
    } finally {
      setIsLoadingRevenue(false);
    }
  };

  // Handle plan-wise subscriptions time range change
  const handlePlanTimeRangeChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedRange = e.target.value;
    setPlanTimeRange(selectedRange);
    setIsLoadingPlan(true);

    try {
      const startDate = getStartDateFromTimeRange(selectedRange);
      const queryParams = new URLSearchParams();
      if (startDate) {
        queryParams.append('startDate', startDate);
      }
      const query = queryParams.toString();
      const endpoint = `/super-admin/dashboard/plan-wise-subscriptions${query ? `?${query}` : ''}`;
      const response = await fetchDashboardData<{ data?: SuperAdminTypes.DashboardTypes.PlanWiseSubscriptionsData; status?: number }>(endpoint);
      const data = response?.data || response || [];
      setPlanWiseSubscriptionsData(data as SuperAdminTypes.DashboardTypes.PlanWiseSubscriptionsData);
    } catch (error) {
      console.error("Error fetching plan-wise subscriptions:", error);
    } finally {
      setIsLoadingPlan(false);
    }
  };

  // Handle recent activity filter change
  const handleRecentActivityFilterChange = (filter: string) => {
    setRecentActivityFilter(filter);
    // For now, just update the filter state. In a real implementation, you might filter the data here.
  };

  // Helper function to format percentage change for display
  const formatPercentageChange = (percentageChange: number | null): string => {
    if (percentageChange === null || percentageChange === undefined) {
      return "-";
    }
    const sign = percentageChange >= 0 ? "+" : "";
    return `${sign}${percentageChange}% From Last Month`;
  };

  // Ensure all required properties exist with fallback values
  const safeStats = {
    totalUsers: stats?.totalUsers || 0,
    activeUsers: Number(stats?.activeUsers) || 0,
    inactiveUsers: Number(stats?.inactiveUsers) || 0,
    totalPlans: Number(stats?.totalPlans) || 0,
    activePlans: Number(stats?.activePlans) || 0,
    inactivePlans: Number(stats?.inactivePlans) || 0,
    totalSubscriptions: stats?.totalSubscriptions || 0,
    activeSubscriptions: stats?.activeSubscriptions || 0,
    inactiveSubscriptions: Number(stats?.inactiveSubscriptions) || 0,
    expiringSoon: stats?.expiringSoon || 0,
    monthlyRevenue: stats?.monthlyRevenue || {
      currentMonth: 0,
      previousMonth: 0,
      currentMonthlyRevenue: { value: 0, percentageChange: 0 }
    },
    planWiseSubscriptions: Array.isArray(stats?.planWiseSubscriptions) ? stats.planWiseSubscriptions : [],
    subscriptionTrends: Array.isArray(stats?.subscriptionTrends) ? stats.subscriptionTrends : [],
    recentActivity: Array.isArray(stats?.recentActivity) ? stats.recentActivity : [],
    renewalsThisMonth: Number(stats?.renewalsThisMonth) || 0,
    newSubscriptionsThisMonth: Number(stats?.newSubscriptionsThisMonth) || 0,
    totalRevenue: Number(stats?.totalRevenue) || 0,
    totalRevenueThisYearAgg: Array.isArray(stats?.totalRevenueThisYearAgg) ? stats.totalRevenueThisYearAgg : [],
    newUsersThisWeek: Number(stats?.newUsersThisWeek) || 0,
    newSubscriptionsThisWeek: Number(stats?.newSubscriptionsThisWeek) || 0
  };

  // Use totalRevenue from response, or calculate from plan-wise subscriptions as fallback
  const totalRevenue = safeStats.totalRevenue > 0
    ? safeStats.totalRevenue
    : safeStats.planWiseSubscriptions.reduce((sum: number, plan: { revenue: number }) => sum + plan.revenue, 0);


  // Check if we have any data to display
  const hasData = SuperAdminTypes.DashboardTypes.getStatValue(safeStats.totalUsers) > 0 ||
    safeStats.totalPlans > 0 ||
    SuperAdminTypes.DashboardTypes.getStatValue(safeStats.totalSubscriptions) > 0 ||
    (safeStats.planWiseSubscriptions && safeStats.planWiseSubscriptions.length > 0);

  if (!hasData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <BarChart3 className="w-8 h-8 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">No dashboard data available yet</p>
          <p className="text-sm text-gray-500 mb-4">Start by adding business owners, plans, and subscriptions</p>
          <button
            onClick={() => {
              if (typeof globalThis !== "undefined" && "location" in globalThis && typeof globalThis.location.reload === "function") {
                globalThis.location.reload();
              }
            }}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
          >
            Refresh Data
          </button>
        </div>
      </div>
    );
  }

  // Transform revenueOverviewData for chart
  const getRevenueChartData = () => {
    if (revenueOverviewData?.revenueByMonth && revenueOverviewData.revenueByMonth.length > 0) {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const categories = revenueOverviewData.revenueByMonth.map((item) => {
        return `${monthNames[item.month - 1]} ${item.year}`;
      });
      const data = revenueOverviewData.revenueByMonth.map((item) => item.revenue);
      return { categories, data };
    }
    // Fallback to original data structure
    return {
      categories: ['Previous Month', 'Current Month'],
      data: [safeStats.monthlyRevenue.previousMonth, safeStats.monthlyRevenue.currentMonthlyRevenue.value]
    };
  };

  const revenueChartData = getRevenueChartData();

  // Revenue Chart Options - Using revenueOverviewData
  const revenueChartOptions = {
    chart: {
      type: 'area' as const,
      height: 300,
      toolbar: {
        show: false
      },
      background: 'transparent'
    },
    theme: {
      mode: (isDarkMode ? 'dark' : 'light') as 'dark' | 'light'
    },
    stroke: {
      curve: 'smooth' as const,
      width: 3,
      colors: ['#1E90FF']
    },
    fill: {
      type: 'gradient' as const,
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0,
        stops: [0, 100]
      }
    },
    markers: {
      size: 4,
      colors: ['#fff'],
      strokeColors: '#1E90FF',
      strokeWidth: 2,
      hover: {
        size: 5
      }
    },
    grid: {
      borderColor: isDarkMode ? '#374151' : '#eee',
      strokeDashArray: 5,
      xaxis: {
        lines: {
          show: false
        }
      },
      yaxis: {
        lines: {
          show: true
        }
      }
    },
    yaxis: {
      labels: {
        show: true,
        formatter: function (value: number) {
          if (value >= 1000000) {
            return (value / 1000000).toFixed(1) + 'M';
          } else if (value >= 1000) {
            return (value / 1000).toFixed(0) + 'k';
          }
          return value.toString();
        },
        style: {
          colors: isDarkMode ? '#9CA3AF' : '#6B7280',
          fontSize: '12px'
        }
      }
    },
    xaxis: {
      categories: revenueChartData.categories,
      labels: {
        show: true,
        style: {
          colors: isDarkMode ? '#9CA3AF' : '#6B7280',
          fontSize: '12px'
        }
      },
      axisBorder: {
        show: false
      },
      axisTicks: {
        show: false
      }
    },
    annotations: {
      xaxis: [
        {
          x: revenueChartData.categories.length > 0 ? revenueChartData.categories[revenueChartData.categories.length - 1] : 'Current Month',
          borderColor: '#1E90FF',
          strokeDashArray: 0,
          borderWidth: 1
        }
      ]
    },
    tooltip: {
      enabled: true,
      theme: isDarkMode ? 'dark' : 'light',
      y: {
        formatter: function (value: number) {
          return '$' + value.toLocaleString();
        }
      }
    }
  };

  const revenueChartSeries = [{
    name: 'Revenue',
    data: revenueChartData.data
  }];

  // Plan-wise Subscription Chart Options (Stacked Bar Chart)
  // Use planWiseSubscriptionsData if available, otherwise fallback to safeStats.planWiseSubscriptions
  const planWiseData = planWiseSubscriptionsData && planWiseSubscriptionsData.length > 0
    ? planWiseSubscriptionsData
    : safeStats.planWiseSubscriptions;

  // Transform subscription trends to get months for x-axis
  const planChartMonths = safeStats.subscriptionTrends?.length > 0
    ? safeStats.subscriptionTrends.map((item: { month: string }) => {
      // Convert month names to uppercase 3-letter format (e.g., "January" -> "JAN")
      const monthMap: { [key: string]: string } = {
        'january': 'JAN', 'jan': 'JAN',
        'february': 'FEB', 'feb': 'FEB',
        'march': 'MAR', 'mar': 'MAR',
        'april': 'APR', 'apr': 'APR',
        'may': 'MAY',
        'june': 'JUN', 'jun': 'JUN',
        'july': 'JUL', 'jul': 'JUL',
        'august': 'AUG', 'aug': 'AUG',
        'september': 'SEP', 'sep': 'SEP',
        'october': 'OCT', 'oct': 'OCT',
        'november': 'NOV', 'nov': 'NOV',
        'december': 'DEC', 'dec': 'DEC'
      };
      const monthKey = item.month.toLowerCase();
      return monthMap[monthKey] || item.month.toUpperCase().substring(0, 3);
    })
    : ['JAN', 'FEB', 'MAR']; // Default months if no data

  // Create plan series data - map plans to series format
  // Use planWiseSubscriptionsData if available
  const planNames = ['Free', 'Basic', 'Pro', 'Enterprise'];
  const planChartSeries = planNames.map((planName) => {
    const planData = planWiseData?.find(
      (item: { planName: string }) => item.planName.toLowerCase() === planName.toLowerCase()
    );

    // If we have subscription trends, use them to distribute data
    // Otherwise, create data based on planWiseSubscriptions
    if (safeStats.subscriptionTrends?.length > 0) {
      // Distribute active subscriptions across months proportionally
      const totalSubs = planData?.activeSubscriptions || 0;
      const monthCount = safeStats.subscriptionTrends.length;
      const avgPerMonth = Math.floor(totalSubs / monthCount);
      const remainder = totalSubs % monthCount;

      return {
        name: planName,
        data: safeStats.subscriptionTrends.map((_, index) => {
          return avgPerMonth + (index < remainder ? 1 : 0);
        })
      };
    } else {
      // Fallback: distribute evenly or use a single value
      const value = planData?.activeSubscriptions || 0;
      return {
        name: planName,
        data: planChartMonths.map(() => Math.floor(value / planChartMonths.length) || 0)
      };
    }
  });

  const planChartOptions = {
    chart: {
      type: 'bar' as const,
      stacked: true,
      height: 300,
      toolbar: {
        show: false
      },
      background: 'transparent'
    },
    theme: {
      mode: (isDarkMode ? 'dark' : 'light') as 'dark' | 'light'
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '45%',
        borderRadius: 8,
        borderRadiusApplication: 'end' as const
      }
    },
    dataLabels: {
      enabled: false
    },
    colors: ['#007BFF', '#6DB6FF', '#A9D5FF', '#DCEEFF'], // Free, Basic, Pro, Enterprise
    xaxis: {
      categories: planChartMonths,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        style: {
          fontSize: '14px',
          colors: isDarkMode ? '#9CA3AF' : '#6B7280'
        }
      }
    },
    yaxis: {
      labels: {
        formatter: function (val: number) {
          if (val >= 1000000) {
            return (val / 1000000).toFixed(1) + 'M';
          } else if (val >= 1000) {
            return (val / 1000).toFixed(0) + 'k';
          }
          return val.toString();
        },
        style: {
          colors: isDarkMode ? '#9CA3AF' : '#6B7280',
          fontSize: '12px'
        }
      }
    },
    grid: {
      borderColor: isDarkMode ? '#374151' : '#eee',
      strokeDashArray: 5,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
      padding: { top: 0, right: 0, bottom: 0, left: 10 }
    },
    legend: {
      position: 'top' as const,
      horizontalAlign: 'right' as const,
      markers: {
        size: 6,
        shape: 'circle' as const
      },
      labels: {
        colors: isDarkMode ? '#D1D5DB' : '#6B7280',
        useSeriesColors: false
      }
    },
    tooltip: {
      theme: isDarkMode ? 'dark' : 'light',
      y: {
        formatter: function (value: number) {
          return value.toLocaleString() + ' subscriptions';
        }
      }
    }
  };

  // Subscription Trends Chart Options (Column Chart)
  const trendsChartOptions = {
    chart: {
      type: 'bar' as const,
      height: 300,
      stacked: false,
      toolbar: {
        show: false
      },
      background: 'transparent'
    },
    theme: {
      mode: (isDarkMode ? 'dark' : 'light') as 'dark' | 'light'
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%',
        borderRadius: 4
      }
    },
    dataLabels: {
      enabled: false
    },
    colors: ['#3B82F6', '#10B981'],
    xaxis: {
      categories: safeStats.subscriptionTrends?.map((item: { month: string }) => item.month) || [],
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        style: {
          colors: isDarkMode ? '#9CA3AF' : '#6B7280',
          fontSize: '12px'
        }
      }
    },
    yaxis: {
      title: {
        text: 'Subscriptions',
        style: {
          color: isDarkMode ? '#9CA3AF' : '#6B7280',
          fontSize: '12px'
        }
      },
      labels: {
        style: {
          colors: isDarkMode ? '#9CA3AF' : '#6B7280',
          fontSize: '12px'
        }
      }
    },
    grid: {
      borderColor: isDarkMode ? '#374151' : '#E5E7EB',
      strokeDashArray: 5,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
      padding: { top: 0, right: 0, bottom: 0, left: 10 }
    },
    legend: {
      position: 'top' as const,
      horizontalAlign: 'right' as const,
      labels: {
        colors: isDarkMode ? '#D1D5DB' : '#6B7280'
      }
    },
    tooltip: {
      theme: isDarkMode ? 'dark' : 'light',
      y: {
        formatter: function (value: number) {
          return value + ' subscriptions';
        }
      }
    }
  };

  const trendsChartSeries = [
    {
      name: 'New Subscriptions',
      data: safeStats.subscriptionTrends?.map((item: { newSubscriptions: number }) => item.newSubscriptions) || []
    },
    {
      name: 'Renewals',
      data: safeStats.subscriptionTrends?.map((item: { renewals: number }) => item.renewals) || []
    }
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h4 className="text-textMain dark:text-white font-poppins font-semibold text-[28px] leading-9">{Constants.superadminConstants.bannerheading}</h4>
          <p className="text-textSmall dark:text-textSmall font-interTight font-regular text-sm leading-6 pt-1">{Constants.superadminConstants.bannerbio}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-5">
          <Link href="/superadmin/business-owner" className="bg-primary hover:bg-primaryHover text-white font-poppins font-semibold text-base leading-5 rounded-[4px] px-6 py-[14px]">
            {Constants.superadminConstants.ownerheading}
          </Link>
          <Link href="/superadmin/plans" className="bg-dark hover:bg-gray-700 dark:bg-[#333333] dark:hover:bg-[#444444] text-white font-poppins font-semibold text-base leading-5 rounded-[4px] px-6 py-[14px]">
            {Constants.superadminConstants.allplans}
          </Link>
        </div>
      </div>

      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-[30px]">
        <div>
          <h6 className="text-[#1C1F34] dark:text-white font-poppins font-semibold text-[20px] leading-[30px] tracking-[1%]">{Constants.superadminConstants.insights}</h6>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative">
            <div ref={dateRangeInputRef} className="absolute inset-0 opacity-0 pointer-events-auto">
              <WebComponents.UiComponents.UiWebComponents.DateRangePicker
                start={dateRange.start}
                end={dateRange.end}
                onChange={(next) => setDateRange({ start: next.start, end: next.end })}
                placeholders={{ start: "DD-MM-YYYY", end: "DD-MM-YYYY" }}
              />
            </div>
            <button
              type="button"
              onClick={handleDisplayBoxClick}
              className="bg-[#F2F2F2] text-textSmall font-interTight font-regular text-[12px] leading-[22px] rounded-[6px] px-6 py-2 text-left"
              aria-label="Select date range"
            >
              {formatDateForDisplay(dateRange.start)} to {formatDateForDisplay(dateRange.end)}
            </button>
          </div>
          <button
            onClick={handleGenerateReport}
            className="bg-primary text-white font-poppins font-semibold text-[14px] leading-[18px] capitalize rounded-[6px] px-6 py-[10px]"
          >
            {Constants.superadminConstants.generatereport}
          </button>
        </div>
      </div>

      {/* Summary & Revenue Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 mt-3">
        <SummaryCard
          title="Total Users"
          value={SuperAdminTypes.DashboardTypes.getStatValue(safeStats.totalUsers).toLocaleString()}
          iconSrc={Constants.assetsIcon.assets.users}
          iconBg="bg-[#FFF7ED]"
          change={formatPercentageChange(SuperAdminTypes.DashboardTypes.getStatPercentageChange(safeStats.totalUsers))}
        />
        <SummaryCard
          title="Total Plans"
          value={safeStats.totalPlans.toString()}
          iconSrc={Constants.assetsIcon.assets.listChecks}
          iconBg="bg-[#F0FDF4]"
          change="-"
        />
        <SummaryCard
          title="Total Subscriptions"
          value={SuperAdminTypes.DashboardTypes.getStatValue(safeStats.totalSubscriptions).toLocaleString()}
          iconSrc={Constants.assetsIcon.assets.crown1}
          iconBg="bg-[#FAF5FF]"
          change={formatPercentageChange(SuperAdminTypes.DashboardTypes.getStatPercentageChange(safeStats.totalSubscriptions))}
        />
        <SummaryCard
          title="Active Subscriptions"
          value={SuperAdminTypes.DashboardTypes.getStatValue(safeStats.activeSubscriptions).toLocaleString()}
          iconSrc={Constants.assetsIcon.assets.crown2}
          iconBg="bg-[#EFF6FE]"
          change={formatPercentageChange(SuperAdminTypes.DashboardTypes.getStatPercentageChange(safeStats.activeSubscriptions))}
        />
        <SummaryCard
          title="Expiring Soon"
          value={SuperAdminTypes.DashboardTypes.getStatValue(safeStats.expiringSoon).toString()}
          iconSrc={Constants.assetsIcon.assets.expiringSoon}
          iconBg="bg-[#FDF0F4]"
          change={formatPercentageChange(SuperAdminTypes.DashboardTypes.getStatPercentageChange(safeStats.expiringSoon))}
        />
        <SummaryCard
          title="Total Revenue"
          value={`$${totalRevenue.toLocaleString()}`}
          iconSrc={Constants.assetsIcon.assets.totalRevenue}
          iconBg="bg-[#EFF6FE]"
          change="-"
        />
        <SummaryCard
          title="Current Month Revenue"
          value={`$${safeStats.monthlyRevenue.currentMonthlyRevenue.value.toLocaleString()}`}
          iconSrc={Constants.assetsIcon.assets.monthlyRevenue}
          iconBg="bg-[#F0FDF4]"
          change={formatPercentageChange(safeStats.monthlyRevenue.currentMonthlyRevenue.percentageChange)}
        />
        <SummaryCard
          title="Renewal this month"
          value={safeStats.renewalsThisMonth.toString()}
          iconSrc={Constants.assetsIcon.assets.calender}
          iconBg="bg-[#FFF7ED]"
          change="-"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mt-[30px]">
        {/* Revenue Graph */}
        <div className="h-full px-10 py-10 bg-white dark:bg-[#333333] rounded-lg border-[0.5px] border-[#EBEBEB] dark:border-[#444444]">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Statistics</p>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">{Constants.superadminConstants.revenueoverview}</h3>
            </div>
            <div className="relative group">
              <button className="flex items-center gap-2 px-3 py-1.5 bg-[#F2F9FF] text-base text-textSmall font-interTight font-regular rounded-[25px] hover:bg-gray-50 transition-colors">
                <span>{revenueTimeRange}</span>
                <svg className="w-4 h-4 text-textSmall" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="absolute top-full right-0 mt-1 w-32 bg-white border border-gray-200 shadow-lg rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="py-1">
                  <button
                    onClick={() => handleRevenueTimeRangeChange({ target: { value: "Last Months" } } as any)}
                    className="w-full text-left px-3 py-2 text-textSmall font-interTight font-regular hover:bg-gray-100 transition-colors"
                    disabled={isLoadingRevenue}
                  >
                    Last Months
                  </button>
                  <button
                    onClick={() => handleRevenueTimeRangeChange({ target: { value: "Last 3 Months" } } as any)}
                    className="w-full text-left px-3 py-2 text-textSmall font-interTight font-regular hover:bg-gray-100 transition-colors"
                    disabled={isLoadingRevenue}
                  >
                    Last 3 Months
                  </button>
                  <button
                    onClick={() => handleRevenueTimeRangeChange({ target: { value: "Last 6 Months" } } as any)}
                    className="w-full text-left px-3 py-2 text-textSmall font-interTight font-regular hover:bg-gray-100 transition-colors"
                    disabled={isLoadingRevenue}
                  >
                    Last 6 Months
                  </button>
                  <button
                    onClick={() => handleRevenueTimeRangeChange({ target: { value: "Last Year" } } as any)}
                    className="w-full text-left px-3 py-2 text-textSmall font-interTight font-regular hover:bg-gray-100 transition-colors"
                    disabled={isLoadingRevenue}
                  >
                    Last Year
                  </button>
                </div>
              </div>
            </div>
          </div>
          {isLoadingRevenue ? (
            <div className="flex items-center justify-center h-80 text-gray-500">
              <p>Loading revenue data...</p>
            </div>
          ) : (revenueOverviewData?.revenueByMonth && revenueOverviewData.revenueByMonth.length > 0) ||
            (safeStats.monthlyRevenue.currentMonthlyRevenue.value > 0 || safeStats.monthlyRevenue.previousMonth > 0) ? (
            <ReactApexChart
              options={revenueChartOptions}
              series={revenueChartSeries}
              type="area"
              height={300}
            />
          ) : (
            <div className="flex items-center justify-center h-80 text-gray-500">
              <p>No revenue data available</p>
            </div>
          )}
        </div>

        {/* Plan-wise Subscriptions */}
        <div className="h-full px-10 py-10 bg-white dark:bg-[#333333] rounded-lg border-[0.5px] border-[#EBEBEB] dark:border-[#444444]">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Statistics</p>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">{Constants.superadminConstants.planwisesubscriptions}</h3>
            </div>
            <div className="relative group">
              <button className="flex items-center gap-2 px-3 py-1.5 bg-[#F2F9FF] text-base text-textSmall font-interTight font-regular rounded-[25px] hover:bg-gray-50 transition-colors">
                <span>{planTimeRange}</span>
                <svg className="w-4 h-4 text-textSmall" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="absolute top-full right-0 mt-1 w-32 bg-white border border-gray-200 shadow-lg rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="py-1">
                  <button
                    onClick={() => handlePlanTimeRangeChange({ target: { value: "Last 3 Months" } } as any)}
                    className="w-full text-left px-3 py-2 text-textSmall font-interTight font-regular hover:bg-gray-100 transition-colors"
                    disabled={isLoadingPlan}
                  >
                    Last 3 Months
                  </button>
                  <button
                    onClick={() => handlePlanTimeRangeChange({ target: { value: "Last 6 Months" } } as any)}
                    className="w-full text-left px-3 py-2 text-textSmall font-interTight font-regular hover:bg-gray-100 transition-colors"
                    disabled={isLoadingPlan}
                  >
                    Last 6 Months
                  </button>
                  <button
                    onClick={() => handlePlanTimeRangeChange({ target: { value: "Last Year" } } as any)}
                    className="w-full text-left px-3 py-2 text-textSmall font-interTight font-regular hover:bg-gray-100 transition-colors"
                    disabled={isLoadingPlan}
                  >
                    Last Year
                  </button>
                  <button
                    onClick={() => handlePlanTimeRangeChange({ target: { value: "All Time" } } as any)}
                    className="w-full text-left px-3 py-2 text-textSmall font-interTight font-regular hover:bg-gray-100 transition-colors"
                    disabled={isLoadingPlan}
                  >
                    All Time
                  </button>
                </div>
              </div>
            </div>
          </div>
          {isLoadingPlan ? (
            <div className="flex items-center justify-center h-80 text-gray-500">
              <p>Loading subscription data...</p>
            </div>
          ) : (planWiseSubscriptionsData && planWiseSubscriptionsData.length > 0) ||
            (safeStats.planWiseSubscriptions && safeStats.planWiseSubscriptions.length > 0) ? (
            <ReactApexChart
              options={planChartOptions}
              series={planChartSeries}
              type="bar"
              height={300}
            />
          ) : (
            <div className="flex items-center justify-center h-80 text-gray-500">
              <p>No subscription data available</p>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="h-full px-10 py-10 bg-white dark:bg-[#333333] rounded-lg border-[0.5px] border-[#EBEBEB] dark:border-[#444444]">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Details</p>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
            </div>
            <div className="relative group">
              <button className="flex items-center gap-2 px-3 py-1.5 bg-[#F2F9FF] text-base text-textSmall font-interTight font-regular rounded-[25px] hover:bg-gray-50 transition-colors">
                <span>{recentActivityFilter}</span>
                <svg className="w-4 h-4 text-textSmall" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="absolute top-full right-0 mt-1 w-24 bg-white border border-gray-200 shadow-lg rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="py-1">
                  <button
                    onClick={() => handleRecentActivityFilterChange("Active")}
                    className="w-full text-left px-3 py-2 text-textSmall font-interTight font-regular hover:bg-gray-100 transition-colors"
                  >
                    Active
                  </button>
                  <button
                    onClick={() => handleRecentActivityFilterChange("Inactive")}
                    className="w-full text-left px-3 py-2 text-textSmall font-interTight font-regular hover:bg-gray-100 transition-colors"
                  >
                    Inactive
                  </button>
                  <button
                    onClick={() => handleRecentActivityFilterChange("All")}
                    className="w-full text-left px-3 py-2 text-textSmall font-interTight font-regular hover:bg-gray-100 transition-colors"
                  >
                    All
                  </button>
                </div>
              </div>
            </div>
          </div>
          {safeStats.recentActivity && safeStats.recentActivity.length > 0 ? (
            <div
              className="space-y-3 max-h-64 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            >
              {safeStats.recentActivity
                .filter((activity) => {
                  if (recentActivityFilter === "All") return true;
                  return activity.status === recentActivityFilter;
                })
                .slice(0, 5)
                .map((activity: { user: string; plan: string; amount: number; status: string; date: string }) => {
                const activityKey = `${activity.user ?? "unknown"}-${activity.plan ?? "unknown"}-${activity.status ?? "unknown"}-${activity.date ?? "unknown"}`;
                // Generate user initials for avatar
                const initials = activity.user
                  ? activity.user
                    .split(' ')
                    .map((n: string) => n[0])
                    .join('')
                    .toUpperCase()
                    .substring(0, 2)
                  : 'U';

                // Format date as MM/DD/YYYY
                const formatDate = (dateStr: string) => {
                  const date = new Date(dateStr);
                  const month = (date.getMonth() + 1).toString().padStart(2, '0');
                  const day = date.getDate().toString().padStart(2, '0');
                  const year = date.getFullYear();
                  return `${month}/${day}/${year}`;
                };

                return (
                  <div key={activityKey} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#444444] rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                        {initials}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-gray-900 dark:text-white">{activity.user}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{activity.plan} - ${typeof activity.amount === 'number' ? activity.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : activity.amount}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs px-3 py-1 rounded-md font-medium w-16 flex items-center justify-center ${activity.status === 'Active' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                        {activity.status}
                      </span>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {formatDate(activity.date)}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center h-80 text-gray-500 dark:text-gray-400">
              <p>No recent activity</p>
            </div>
          )}
        </div>

        {/* Subscription Trends */}
        <div className="h-full px-10 py-10 bg-white dark:bg-[#333333] rounded-lg border-[0.5px] border-[#EBEBEB] dark:border-[#444444]">
          <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-4">{Constants.superadminConstants.subscriptiontrends}</h3>
          {safeStats.subscriptionTrends && safeStats.subscriptionTrends.length > 0 ? (
            <ReactApexChart
              options={trendsChartOptions}
              series={trendsChartSeries}
              type="bar"
              height={300}
            />
          ) : (
            <div className="flex items-center justify-center h-80 text-gray-500">
              <p>No trend data available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Summary Card Component
type SummaryCardProps = Readonly<{
  title: string;
  value: string;
  iconSrc: string;
  iconBg: string;
  change?: string;
  iconAlt?: string;
}>;

function SummaryCard({
  title,
  value,
  iconSrc,
  iconBg,
  change,
  iconAlt,
}: SummaryCardProps) {
  return (
    <div className="bg-white dark:bg-[#333333] rounded-[6px] border-[#EBEBEB] dark:border-[#444444] mt-[12px]">
      <div className="flex flex-col px-4 py-4 sm:px-5 sm:py-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col">
            <p className="text-sm font-medium text-[#6C757D] dark:text-gray-300">{title}</p>
            <p className="text-[20px] font-bold text-[#1C1F34] dark:text-white leading-9">{value}</p>
          </div>
          <div className={`${iconBg} rounded-[6px] p-3`}>
            <Image src={iconSrc} alt={iconAlt ?? title} width={20} height={20} />
          </div>
        </div>
        {change && (
          <div className="pt-3">
            {change === "-" ? (
              <p className="text-sm font-regular text-[#6C757D] dark:text-gray-400">{change}</p>
            ) : (
              <p className="text-sm font-regular">
                <span className={
                  change.startsWith("+")
                    ? "text-[#1AC769] dark:text-green-400"
                    : change.startsWith("-")
                      ? "text-red-500 dark:text-red-400"
                      : "text-[#1AC769] dark:text-green-400"
                }>
                  {change.split(" From Last Month")[0]}
                </span>
                <span className="text-[#6C757D] dark:text-gray-400">
                  {change.includes("From Last Month") ? " From Last Month" : ""}
                </span>
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
