/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/prefer-nullish-coalescing */
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getContributorResources, getContributorStats } from "@/actions/contributor/resources";
import { BarChart3, Eye, CheckCircle2, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default async function DashboardAnalyticsPage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        redirect("/sign-in");
    }

    const [statsResult, resourcesResult] = await Promise.all([
        getContributorStats(),
        getContributorResources({ limit: 100, sortBy: "newest" }),
    ]);

    const stats = statsResult.data ?? { total: 0, approved: 0, pending: 0, rejected: 0 };
    const resources = resourcesResult.success ? resourcesResult.data : [];

    // Group resources by status for visualization
    const approvedResources = resources.filter((r: any) => r.status === "APPROVED");
    const pendingResources = resources.filter((r: any) => r.status === "PENDING");

    const approvalRate = stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
                <p className="text-muted-foreground mt-1">
                    Insights and performance metrics for your resources.
                </p>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur p-6">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <BarChart3 className="h-4 w-4" />
                        <span>Approval Rate</span>
                    </div>
                    <p className="text-4xl font-bold tracking-tight">{approvalRate}%</p>
                    <p className="text-xs text-muted-foreground mt-1">
                        {stats.approved} of {stats.total} approved
                    </p>
                </div>

                <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur p-6">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Live Resources</span>
                    </div>
                    <p className="text-4xl font-bold tracking-tight text-green-500">{stats.approved}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                        Visible to all users
                    </p>
                </div>

                <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur p-6">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <Clock className="h-4 w-4" />
                        <span>Awaiting Review</span>
                    </div>
                    <p className="text-4xl font-bold tracking-tight text-amber-500">{stats.pending}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                        Under admin review
                    </p>
                </div>
            </div>

            {/* Resource Status Breakdown */}
            <div className="space-y-4">
                <h2 className="text-lg font-semibold">Status Breakdown</h2>

                {stats.total > 0 ? (
                    <div className="space-y-6">
                        {/* Visual Bar */}
                        <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur p-6">
                            <div className="flex gap-1 h-4 rounded-full overflow-hidden bg-muted/30">
                                {stats.approved > 0 && (
                                    <div
                                        className="bg-green-500 rounded-l-full transition-all duration-500"
                                        style={{ width: `${(stats.approved / stats.total) * 100}%` }}
                                    />
                                )}
                                {stats.pending > 0 && (
                                    <div
                                        className="bg-amber-500 transition-all duration-500"
                                        style={{ width: `${(stats.pending / stats.total) * 100}%` }}
                                    />
                                )}
                                {stats.rejected > 0 && (
                                    <div
                                        className="bg-red-500 rounded-r-full transition-all duration-500"
                                        style={{ width: `${(stats.rejected / stats.total) * 100}%` }}
                                    />
                                )}
                            </div>
                            <div className="flex items-center gap-6 mt-4 text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-green-500" />
                                    <span className="text-muted-foreground">Approved ({stats.approved})</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                                    <span className="text-muted-foreground">Pending ({stats.pending})</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-red-500" />
                                    <span className="text-muted-foreground">Rejected ({stats.rejected})</span>
                                </div>
                            </div>
                        </div>

                        {/* Approved Resources List */}
                        {approvedResources.length > 0 && (
                            <div className="space-y-3">
                                <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                    <Eye className="h-4 w-4" />
                                    Live Resources ({approvedResources.length})
                                </h3>
                                <div className="grid gap-2">
                                    {approvedResources.map((resource: any) => (
                                        <div
                                            key={resource.id}
                                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-border/40 bg-card/30 p-3"
                                        >
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-sm truncate">{resource.name}</p>
                                                <p className="text-xs text-muted-foreground truncate">
                                                    {resource.oneLiner || resource.slug}
                                                </p>
                                            </div>
                                            <div className="flex items-center flex-wrap gap-2 shrink-0">
                                                {resource.categories?.map((cat: any) => (
                                                    <Badge key={cat.slug} variant="outline" className="text-[10px]">
                                                        {cat.name}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Pending Resources List */}
                        {pendingResources.length > 0 && (
                            <div className="space-y-3">
                                <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    Pending Review ({pendingResources.length})
                                </h3>
                                <div className="grid gap-2">
                                    {pendingResources.map((resource: any) => (
                                        <div
                                            key={resource.id}
                                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-dashed border-amber-500/30 bg-amber-500/5 p-3"
                                        >
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-sm truncate">{resource.name}</p>
                                                <p className="text-xs text-muted-foreground truncate">
                                                    {resource.oneLiner || resource.slug}
                                                </p>
                                            </div>
                                            <Badge variant="secondary" className="text-[10px] shrink-0 w-fit">
                                                PENDING
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/50 p-12 text-center">
                        <BarChart3 className="h-12 w-12 text-muted-foreground/50 mb-4" />
                        <h3 className="text-lg font-semibold mb-1">No analytics yet</h3>
                        <p className="text-muted-foreground text-sm">
                            Submit your first resource to start seeing analytics.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
