import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getContributorStats, getContributorResources } from "@/actions/contributor/resources";
import { FolderOpen, CheckCircle2, Clock, XCircle, TrendingUp, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";

export default async function DashboardOverviewPage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        redirect("/sign-in");
    }

    const [statsResult, recentResult] = await Promise.all([
        getContributorStats(),
        getContributorResources({ page: 1, limit: 5, sortBy: "newest" }),
    ]);

    const stats = statsResult.data ?? { total: 0, approved: 0, pending: 0, rejected: 0 };
    const recentResources = recentResult.success ? recentResult.data : [];

    const statCards = [
        {
            label: "Total Resources",
            value: stats.total,
            icon: FolderOpen,
            color: "text-blue-500",
            bgColor: "bg-blue-500/10",
        },
        {
            label: "Approved",
            value: stats.approved,
            icon: CheckCircle2,
            color: "text-green-500",
            bgColor: "bg-green-500/10",
        },
        {
            label: "Pending Review",
            value: stats.pending,
            icon: Clock,
            color: "text-amber-500",
            bgColor: "bg-amber-500/10",
        },
        {
            label: "Rejected",
            value: stats.rejected,
            icon: XCircle,
            color: "text-red-500",
            bgColor: "bg-red-500/10",
        },
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Dashboard Overview</h1>
                <p className="text-muted-foreground mt-1">
                    Welcome back, {session.user.name || "Contributor"}! Here&apos;s a summary of your resources.
                </p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((stat) => (
                    <div
                        key={stat.label}
                        className="rounded-xl border border-border/50 bg-card/50 backdrop-blur p-5 hover:shadow-md transition-all duration-200"
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                            </div>
                        </div>
                        <p className="text-3xl font-bold tracking-tight">{stat.value}</p>
                        <p className="text-xs text-muted-foreground mt-1 font-medium">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Recent Resources */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Recent Resources</h2>
                    <Button variant="ghost" size="sm" asChild className="gap-1.5 text-muted-foreground">
                        <Link href="/dashboard/resources">
                            View All
                            <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                    </Button>
                </div>

                {recentResources.length > 0 ? (
                    <div className="space-y-2">
                        {recentResources.map((resource: any) => (
                            <div
                                key={resource.id}
                                className="flex items-center justify-between rounded-xl border border-border/50 bg-card/50 backdrop-blur p-4 hover:bg-muted/30 transition-all duration-200"
                            >
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3">
                                        <p className="font-medium truncate">{resource.name}</p>
                                        <Badge
                                            variant={
                                                resource.status === "APPROVED"
                                                    ? "default"
                                                    : resource.status === "PENDING"
                                                        ? "secondary"
                                                        : "destructive"
                                            }
                                            className="shrink-0 text-[10px]"
                                        >
                                            {resource.status}
                                        </Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {resource.oneLiner || resource.slug} •{" "}
                                        {formatDistanceToNow(new Date(resource.createdAt), { addSuffix: true })}
                                    </p>
                                </div>
                                <Button variant="ghost" size="sm" asChild>
                                    <Link href={`/resource/${resource.slug}`}>
                                        <TrendingUp className="h-4 w-4" />
                                    </Link>
                                </Button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/50 p-12 text-center">
                        <FolderOpen className="h-12 w-12 text-muted-foreground/50 mb-4" />
                        <h3 className="text-lg font-semibold mb-1">No resources yet</h3>
                        <p className="text-muted-foreground text-sm mb-4">
                            Submit your first open-source resource to get started.
                        </p>
                        <Button asChild>
                            <Link href="/submit">Submit Resource</Link>
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
