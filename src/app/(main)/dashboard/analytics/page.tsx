/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/prefer-nullish-coalescing */
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  getContributorResources,
  getContributorStats,
} from "@/actions/contributor/resources";
import { BarChart3, Eye, CheckCircle2, Clock, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

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

  const stats = statsResult.data ?? {
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
  };
  const resources = resourcesResult.success ? resourcesResult.data : [];

  // Group resources by status for visualization
  const approvedResources = resources.filter(
    (r: any) => r.status === "APPROVED",
  );
  const pendingResources = resources.filter((r: any) => r.status === "PENDING");

  const approvalRate =
    stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground mt-1">
          Insights and performance metrics for your resources.
        </p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="border-border/50 bg-card/50 rounded-xl border p-6 backdrop-blur">
          <div className="text-muted-foreground mb-2 flex items-center gap-2 text-sm">
            <BarChart3 className="h-4 w-4" />
            <span>Approval Rate</span>
          </div>
          <p className="text-4xl font-bold tracking-tight">{approvalRate}%</p>
          <p className="text-muted-foreground mt-1 text-xs">
            {stats.approved} of {stats.total} approved
          </p>
        </div>

        <div className="border-border/50 bg-card/50 rounded-xl border p-6 backdrop-blur">
          <div className="text-muted-foreground mb-2 flex items-center gap-2 text-sm">
            <CheckCircle2 className="h-4 w-4" />
            <span>Live Resources</span>
          </div>
          <p className="text-4xl font-bold tracking-tight text-green-500">
            {stats.approved}
          </p>
          <p className="text-muted-foreground mt-1 text-xs">
            Visible to all users
          </p>
        </div>

        <div className="border-border/50 bg-card/50 rounded-xl border p-6 backdrop-blur">
          <div className="text-muted-foreground mb-2 flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4" />
            <span>Awaiting Review</span>
          </div>
          <p className="text-4xl font-bold tracking-tight text-amber-500">
            {stats.pending}
          </p>
          <p className="text-muted-foreground mt-1 text-xs">
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
            <div className="border-border/50 bg-card/50 rounded-xl border p-6 backdrop-blur">
              <div className="bg-muted/30 flex h-4 gap-1 overflow-hidden rounded-full">
                {stats.approved > 0 && (
                  <div
                    className="rounded-l-full bg-green-500 transition-all duration-500"
                    style={{
                      width: `${(stats.approved / stats.total) * 100}%`,
                    }}
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
                    className="rounded-r-full bg-red-500 transition-all duration-500"
                    style={{
                      width: `${(stats.rejected / stats.total) * 100}%`,
                    }}
                  />
                )}
              </div>
              <div className="mt-4 flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-green-500" />
                  <span className="text-muted-foreground">
                    Approved ({stats.approved})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-amber-500" />
                  <span className="text-muted-foreground">
                    Pending ({stats.pending})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-500" />
                  <span className="text-muted-foreground">
                    Rejected ({stats.rejected})
                  </span>
                </div>
              </div>
            </div>

            {/* Approved Resources List */}
            {approvedResources.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-muted-foreground flex items-center gap-2 text-sm font-medium">
                    <Eye className="h-4 w-4" />
                    Live Resources ({approvedResources.length})
                  </h3>
                  {approvedResources.length > 3 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                      className="text-muted-foreground gap-1.5"
                    >
                      <Link href="/dashboard/resources">
                        View All
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  )}
                </div>
                <div className="grid gap-2">
                  {approvedResources.slice(0, 3).map((resource: any) => (
                    <div
                      key={resource.id}
                      className="border-border/40 bg-card/30 flex flex-col justify-between gap-3 rounded-lg border p-3 sm:flex-row sm:items-center"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {resource.name}
                        </p>
                        <p className="text-muted-foreground truncate text-xs">
                          {resource.oneLiner || resource.slug}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-wrap items-center gap-2">
                        {resource.categories?.map((cat: any) => (
                          <Badge
                            key={cat.slug}
                            variant="outline"
                            className="text-[10px]"
                          >
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
                <div className="flex items-center justify-between">
                  <h3 className="text-muted-foreground flex items-center gap-2 text-sm font-medium">
                    <Clock className="h-4 w-4" />
                    Pending Review ({pendingResources.length})
                  </h3>
                  {pendingResources.length > 3 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                      className="text-muted-foreground gap-1.5"
                    >
                      <Link href="/dashboard/resources">
                        View All
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  )}
                </div>
                <div className="grid gap-2">
                  {pendingResources.slice(0, 3).map((resource: any) => (
                    <div
                      key={resource.id}
                      className="flex flex-col justify-between gap-3 rounded-lg border border-dashed border-amber-500/30 bg-amber-500/5 p-3 sm:flex-row sm:items-center"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {resource.name}
                        </p>
                        <p className="text-muted-foreground truncate text-xs">
                          {resource.oneLiner || resource.slug}
                        </p>
                      </div>
                      <Badge
                        variant="secondary"
                        className="w-fit shrink-0 text-[10px]"
                      >
                        PENDING
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="border-border/50 flex flex-col items-center justify-center rounded-xl border border-dashed p-12 text-center">
            <BarChart3 className="text-muted-foreground/50 mb-4 h-12 w-12" />
            <h3 className="mb-1 text-lg font-semibold">No analytics yet</h3>
            <p className="text-muted-foreground text-sm">
              Submit your first resource to start seeing analytics.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
