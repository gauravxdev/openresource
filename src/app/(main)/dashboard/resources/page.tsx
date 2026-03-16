import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getContributorResources } from "@/actions/contributor/resources";
import { ContributorResourcesTable } from "@/components/dashboard/contributor-resources-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default async function DashboardResourcesPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string; status?: string; sortBy?: string; page?: string }>;
}) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        redirect("/sign-in");
    }

    const params = await searchParams;
    const query = params.q || "";
    const status = params.status || "ALL";
    const sortBy = params.sortBy || "newest";
    const page = parseInt(params.page || "1");

    const result = await getContributorResources({
        search: query,
        status,
        sortBy,
        page,
        limit: 20,
    });

    const resources = result.success ? result.data : [];
    const metadata = result.success && result.metadata
        ? result.metadata
        : { total: 0, page: 1, totalPages: 1 };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">My Resources</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage your submitted resources. Total: {metadata.total}
                    </p>
                </div>
                <Button asChild className="gap-2">
                    <Link href="/submit">
                        <Plus className="h-4 w-4" />
                        Submit New
                    </Link>
                </Button>
            </div>

            <ContributorResourcesTable resources={resources} />

            {metadata.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-4">
                    {Array.from({ length: metadata.totalPages }, (_, i) => i + 1).map((p) => (
                        <Button
                            key={p}
                            variant={p === metadata.page ? "default" : "outline"}
                            size="sm"
                            asChild
                        >
                            <Link
                                href={`/dashboard/resources?${new URLSearchParams({
                                    ...(query ? { q: query } : {}),
                                    ...(status !== "ALL" ? { status } : {}),
                                    ...(sortBy !== "newest" ? { sortBy } : {}),
                                    page: String(p),
                                }).toString()}`}
                            >
                                {p}
                            </Link>
                        </Button>
                    ))}
                </div>
            )}
        </div>
    );
}
