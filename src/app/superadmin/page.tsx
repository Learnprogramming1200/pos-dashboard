import { WebComponents } from "@/components";
import { ServerActions } from "@/lib/server-lib";

// Helper function to calculate start date based on months back
function getStartDate(monthsBack: number): string {
  const date = new Date();
  date.setMonth(date.getMonth() - monthsBack);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default async function SuperadminDashboard() {
  // Default to last 3 months for initial load
  const defaultStartDate = getStartDate(3);

  let statsDataRes: any = { data: {} };
  let planDataRes: any = { data: [] };
  let revenueDataRes: any = { data: {} };
  try {
    const [statsRes, planRes, revenueRes] = await Promise.all([
      ServerActions.ServerApilib.ssrDashboardAPI.getStats(),
      ServerActions.ServerApilib.ssrDashboardAPI.getPlanWiseSubscription(defaultStartDate),
      ServerActions.ServerApilib.ssrDashboardAPI.getRevenueOverview(defaultStartDate),
    ]);
    statsDataRes = statsRes;
    planDataRes = planRes;
    revenueDataRes = revenueRes;
  } catch {
  }
  const data = statsDataRes?.data?.data || statsDataRes?.data || {};
  const planWiseSubscriptionsData = planDataRes?.data?.data || planDataRes?.data || [];
  const revenueOverviewData = revenueDataRes?.data?.data || revenueDataRes?.data || {};
  return (
    <WebComponents.SuperAdminComponents.SuperadminWebComponents.SuperadminDashboardWebComponents.DashboardComponent
      initialData={data} initialPlanWiseSubscriptionsData={planWiseSubscriptionsData} initialRevenueOverviewData={revenueOverviewData} />
  );
}
