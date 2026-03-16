import { getTrafficSummary, getTopResources, getUserActivityStats } from "@/actions/admin/posthog-stats";
import { BarChart3, Users, Clock, ExternalLink, TrendingUp, Calendar } from "lucide-react";
import { TopResourcesTable } from "@/components/admin/TopResourcesTable";
import { UserActivityCharts, TrafficIntensityChart } from "@/components/admin/UserActivityCharts";

export default async function AnalyticsPage() {
    const [trafficResult, topResourcesResult, userActivity] = await Promise.all([
        getTrafficSummary(),
        getTopResources(),
        getUserActivityStats()
    ]);

    const isFullyConfigured = trafficResult.isConfigured;

    return (
        <main className="flex-1 overflow-auto p-4 sm:p-6 space-y-8 bg-background w-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">PostHog Analytics</h1>
                    <p className="text-muted-foreground">
                        Advanced visitor behavior tracking and engagement patterns.
                    </p>
                </div>
                {isFullyConfigured && (
                    <a 
                        href="https://app.posthog.com" 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                    >
                        View Full PostHog Dashboard
                        <ExternalLink className="size-3" />
                    </a>
                )}
            </div>

            {!isFullyConfigured ? (
                <div className="flex flex-col items-center justify-center p-12 border rounded-lg border-dashed">
                    <BarChart3 className="size-12 text-muted-foreground mb-4" />
                    <h2 className="text-lg font-semibold mb-2">PostHog API Not Fully Configured</h2>
                    <p className="text-muted-foreground text-center max-w-md">
                        To fetch data on this page, you need both public and private PostHog keys in your environment:
                    </p>
                    <div className="mt-4 rounded-md bg-muted p-4 font-mono text-sm space-y-2 w-full max-w-lg">
                        <p className="text-primary font-bold"># Public Keys (Client-side tracking)</p>
                        <p>NEXT_PUBLIC_POSTHOG_KEY=phc_...</p>
                        <p>NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com</p>
                        <p className="text-primary font-bold mt-2"># Private Keys (Server-side fetching)</p>
                        <p>POSTHOG_PERSONAL_API_KEY=ph_personal_...</p>
                        <p>POSTHOG_PROJECT_ID=12345</p>
                    </div>
                </div>
            ) : (
                <div className="space-y-8">
                    {/* Summary Cards */}
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="rounded-lg border bg-card p-6">
                            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                                <Users className="size-4" />
                                <span>Total Pageviews (30d)</span>
                            </div>
                            <p className="text-3xl font-bold">
                                {trafficResult.data?.totalVisitors?.toLocaleString() ?? 0}
                            </p>
                        </div>

                        <div className="rounded-lg border bg-card p-6">
                            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                                <TrendingUp className="size-4" />
                                <span>Active Users Today (DAU)</span>
                            </div>
                            <p className="text-3xl font-bold">
                                {userActivity.data?.dau.current?.toLocaleString() ?? 0}
                            </p>
                        </div>

                        <div className="rounded-lg border bg-card p-6">
                            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                                <Calendar className="size-4" />
                                <span>Weekly Users (WAU)</span>
                            </div>
                            <p className="text-3xl font-bold">
                                {userActivity.data?.wau.current?.toLocaleString() ?? 0}
                            </p>
                        </div>

                        <div className="rounded-lg border bg-card p-6">
                            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
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
