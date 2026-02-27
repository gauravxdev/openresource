
import { getAdminResources } from "@/actions/admin/resources";
import { ResourcesTable } from "@/components/admin/resources-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { AdminSearch } from "@/components/admin/admin-search";
import { AdminFilters } from "@/components/admin/admin-filters";
import { AdminPagination } from "@/components/admin/admin-pagination";

export default async function AdminResourcesPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string; status?: string; category?: string; sortBy?: string; page?: string }>;
}) {
    const params = await searchParams;
    const query = params.q || "";
    const status = params.status || "ALL";
    const category = params.category || "ALL";
    const sortBy = params.sortBy || "newest";
    const page = parseInt(params.page || "1");

    const result = await getAdminResources({
        search: query,
        status: status,
        category: category,
        sortBy: sortBy,
        page: page,
        limit: 20,
    });

    const resources = result.success ? result.data : [];
    const metadata = (result.success && result.metadata) ? result.metadata : { total: 0, page: 1, totalPages: 1 };

    return (
        <div className="flex-1 p-4 md:p-8 pt-6 space-y-4 w-full max-w-7xl mx-auto overflow-y-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Resources</h2>
                    <p className="text-muted-foreground">
                        Manage all resources in the database.
                    </p>
                </div>
                <Button asChild>
                    <Link href="/admin/submit">
                        <Plus className="mr-2 h-4 w-4" /> Add Resource
                    </Link>
                </Button>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
                <AdminSearch defaultValue={query} />
                <AdminFilters />
            </div>

            <ResourcesTable resources={resources} />

            {metadata.totalPages > 1 && (
                <div className="mt-8 flex justify-center">
                    <AdminPagination
                        currentPage={metadata.page}
                        totalPages={metadata.totalPages}
                    />
                </div>
            )}
        </div>
    );
}
