/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */
export const dynamic = "force-dynamic";
import {
  getTrafficSummary,
  getTopResources,
  getUserActivityStats,
} from "@/actions/admin/posthog-stats";
import {
  BarChart3,
  Users,
  Clock,
  ExternalLink,
  TrendingUp,
  Calendar,
} from "lucide-react";
import { TopResourcesTable } from "@/components/admin/TopResourcesTable";
import dynamicImport from "next/dynamic";

const UserActivityCharts = dynamicImport(() =>
  import("@/components/admin/UserActivityCharts").then(
    (m) => m.UserActivityCharts,
  ),
);

const TrafficIntensityChart = dynamicImport(() =>
  import("@/components/admin/UserActivityCharts").then(
    (m) => m.TrafficIntensityChart,
  ),
);

export default async function AnalyticsPage() {
  const [trafficResult, topResourcesResult, userActivity] = await Promise.all([
    getTrafficSummary(),
    getTopResources(),
    getUserActivityStats(),
  ]);

  const isFullyConfigured = trafficResult.isConfigured;

  return (
    <main className="bg-background w-full flex-1 space-y-8 overflow-auto p-4 sm:p-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            PostHog Analytics
          </h1>
          <p className="text-muted-foreground">
            Advanced visitor behavior tracking and engagement patterns.
          </p>
        </div>
        {isFullyConfigured && (
          <a
            href="https://app.posthog.com"
            target="_blank"
            rel="noreferrer"
            className="text-primary inline-flex items-center gap-2 text-sm font-medium hover:underline"
          >
            View Full PostHog Dashboard
            <ExternalLink className="size-3" />
          </a>
        )}
      </div>

      {!isFullyConfigured ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12">
          <BarChart3 className="text-muted-foreground mb-4 size-12" />
          <h2 className="mb-2 text-lg font-semibold">
            PostHog API Not Fully Configured
          </h2>
          <p className="text-muted-foreground max-w-md text-center">
            To fetch data on this page, you need both public and private PostHog
            keys in your environment:
          </p>
          <div className="bg-muted mt-4 w-full max-w-lg space-y-2 rounded-md p-4 font-mono text-sm">
            <p className="text-primary font-bold">
              # Public Keys (Client-side tracking)
            </p>
            <p>NEXT_PUBLIC_POSTHOG_KEY=phc_...</p>
            <p>NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com</p>
            <p className="text-primary mt-2 font-bold">
              # Private Keys (Server-side fetching)
            </p>
            <p>POSTHOG_PERSONAL_API_KEY=ph_personal_...</p>
            <p>POSTHOG_PROJECT_ID=12345</p>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Summary Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-card rounded-lg border p-6">
              <div className="text-muted-foreground mb-2 flex items-center gap-2 text-sm font-medium">
                <Users className="size-4" />
                <span>Total Pageviews (30d)</span>
              </div>
              <p className="text-3xl font-bold">
                {trafficResult.data?.totalVisitors?.toLocaleString() ?? 0}
              </p>
            </div>

            <div className="bg-card rounded-lg border p-6">
              <div className="text-muted-foreground mb-2 flex items-center gap-2 text-sm font-medium">
                <TrendingUp className="size-4" />
                <span>Active Users Today (DAU)</span>
              </div>
              <p className="text-3xl font-bold">
                {userActivity.data?.dau.current?.toLocaleString() ?? 0}
              </p>
            </div>

            <div className="bg-card rounded-lg border p-6">
              <div className="text-muted-foreground mb-2 flex items-center gap-2 text-sm font-medium">
                <Calendar className="size-4" />
                <span>Weekly Users (WAU)</span>
              </div>
              <p className="text-3xl font-bold">
                {userActivity.data?.wau.current?.toLocaleString() ?? 0}
              </p>
            </div>

            <div className="bg-card rounded-lg border p-6">
              <div className="text-muted-foreground mb-2 flex items-center gap-2 text-sm font-medium">
                <Clock className="size-4" />
                <span>Data Points</span>
              </div>
              <p className="text-3xl font-bold">
                {trafficResult.data?.chartData?.length ?? 0}
              </p>
            </div>
          </div>

          {/* Advanced Charts Section */}
          {userActivity.data && (
            <UserActivityCharts
              dauData={userActivity.data.dau.chartData}
              wauData={userActivity.data.wau.chartData}
            />
          )}

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Traffic Overview */}
            <TrafficIntensityChart data={trafficResult.data?.chartData ?? []} />

            {/* Top Resources Table */}
            <TopResourcesTable
              resources={topResourcesResult.data}
              isConfigured={topResourcesResult.isConfigured}
            />
          </div>
        </div>
      )}
    </main>
  );
}
