import { DashboardContent } from "@/components/admin/content";
import { getDashboardStats } from "@/actions/admin/db-stats";

export default async function AdminPage() {
  const statsResult = await getDashboardStats();

  const dashboardData =
    statsResult.success && statsResult.data
      ? statsResult.data
      : {
          totalUsers: 0,
          totalResources: 0,
          pendingSubmissions: 0,
          totalPendingReports: 0,
          recentResources: [],
          recentActivity: [],
        };

  return <DashboardContent data={dashboardData} />;
}
