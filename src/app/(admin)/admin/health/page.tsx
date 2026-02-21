import { getHealthStatus } from "@/actions/admin/sentry-stats";
import { Activity, AlertTriangle, CheckCircle2, Clock } from "lucide-react";

export default async function HealthPage() {
    const healthResult = await getHealthStatus();

    const statusColor = healthResult.data?.status === "healthy"
        ? "text-green-500"
        : healthResult.data?.status === "degraded"
            ? "text-yellow-500"
            : "text-red-500";

    const StatusIcon = healthResult.data?.status === "healthy"
        ? CheckCircle2
        : healthResult.data?.status === "degraded"
            ? AlertTriangle
            : AlertTriangle;

    return (
        <main className="flex-1 overflow-auto p-4 sm:p-6 space-y-6 bg-background w-full">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">System Health</h1>
                <p className="text-muted-foreground">
                    Monitor system status, error rates, and performance metrics via Sentry.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                {/* System Status */}
                <div className="rounded-lg border bg-card p-6">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                        <Activity className="size-4" />
                        <span>System Status</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <StatusIcon className={`size-6 ${statusColor}`} />
                        <p className={`text-2xl font-bold capitalize ${statusColor}`}>
                            {healthResult.data?.status ?? "Unknown"}
                        </p>
                    </div>
                </div>

                {/* Active Issues */}
                <div className="rounded-lg border bg-card p-6">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                        <AlertTriangle className="size-4" />
                        <span>Active Issues</span>
                    </div>
                    <p className="text-3xl font-bold">
                        {healthResult.data?.activeIssuesCount ?? 0}
                    </p>
                </div>

                {/* Last Checked */}
                <div className="rounded-lg border bg-card p-6">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                        <Clock className="size-4" />
                        <span>Last Checked</span>
                    </div>
                    <p className="text-sm font-medium">
                        {healthResult.data?.lastChecked
                            ? new Date(healthResult.data.lastChecked).toLocaleString()
                            : "Never"}
                    </p>
                </div>
            </div>

            {/* Sentry Integration Info */}
            <div className="rounded-lg border bg-card p-6">
                <h3 className="text-lg font-semibold mb-4">Sentry Integration</h3>
                <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                        This page displays system health data from Sentry. To enable full error tracking and performance monitoring:
                    </p>
                    <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1">
                        <li>Install the Sentry SDK: <code className="bg-muted px-1 rounded">npx @sentry/wizard@latest -i nextjs</code></li>
                        <li>Configure your Sentry DSN in environment variables</li>
                        <li>Update <code className="bg-muted px-1 rounded">sentry-stats.ts</code> to fetch real data from the Sentry API</li>
                    </ol>
                </div>
            </div>

            {/* Recent Errors Placeholder */}
            <div className="rounded-lg border bg-card p-6">
                <h3 className="text-lg font-semibold mb-4">Recent Errors</h3>
                <div className="h-48 flex items-center justify-center text-muted-foreground border-dashed border rounded-md">
                    <p>Error feed will appear here once Sentry is fully integrated.</p>
                </div>
            </div>
        </main>
    );
}
