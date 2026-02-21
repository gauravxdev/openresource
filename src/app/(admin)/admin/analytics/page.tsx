import { getTrafficSummary } from "@/actions/admin/posthog-stats";
import { BarChart3, Users, Clock } from "lucide-react";

export default async function AnalyticsPage() {
    const trafficResult = await getTrafficSummary();

    return (
        <main className="flex-1 overflow-auto p-4 sm:p-6 space-y-6 bg-background w-full">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Behavioral Analytics</h1>
                <p className="text-muted-foreground">
                    Track visitor behavior, engagement patterns, and traffic trends powered by PostHog.
                </p>
            </div>

            {!trafficResult.isConfigured ? (
                <div className="flex flex-col items-center justify-center p-12 border rounded-lg border-dashed">
                    <BarChart3 className="size-12 text-muted-foreground mb-4" />
                    <h2 className="text-lg font-semibold mb-2">PostHog Not Configured</h2>
                    <p className="text-muted-foreground text-center max-w-md">
                        To view behavioral analytics, configure your PostHog API keys in the environment variables:
                    </p>
                    <div className="mt-4 rounded-md bg-muted p-4 font-mono text-sm">
                        <p>NEXT_PUBLIC_POSTHOG_KEY=your_key</p>
                        <p>NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com</p>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Summary Cards */}
                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="rounded-lg border bg-card p-6">
                            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                                <Users className="size-4" />
                                <span>Total Visitors</span>
                            </div>
                            <p className="text-3xl font-bold">
                                {trafficResult.data?.totalVisitors ?? 0}
                            </p>
                        </div>

                        <div className="rounded-lg border bg-card p-6">
                            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                                <Clock className="size-4" />
                                <span>Avg. Session</span>
                            </div>
                            <p className="text-3xl font-bold">
                                {trafficResult.data?.averageSessionLength ?? "N/A"}
                            </p>
                        </div>

                        <div className="rounded-lg border bg-card p-6">
                            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                                <BarChart3 className="size-4" />
                                <span>Data Points</span>
                            </div>
                            <p className="text-3xl font-bold">
                                {trafficResult.data?.chartData?.length ?? 0}
                            </p>
                        </div>
                    </div>

                    {/* Chart Placeholder */}
                    <div className="rounded-lg border bg-card p-6">
                        <h3 className="text-lg font-semibold mb-4">Traffic Over Time</h3>
                        {trafficResult.data?.chartData && trafficResult.data.chartData.length > 0 ? (
                            <div className="h-64 flex items-center justify-center text-muted-foreground">
                                {/* Recharts or similar can be plugged in here */}
                                <p>Chart rendering will appear here once data flows in.</p>
                            </div>
                        ) : (
                            <div className="h-64 flex items-center justify-center text-muted-foreground border-dashed border rounded-md">
                                <p>No traffic data available yet. Data will populate as visitors interact with your site.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </main>
    );
}
