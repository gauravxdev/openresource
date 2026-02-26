
import { getAdminResources } from "@/actions/admin/resources";
import { ResourcesTable } from "@/components/admin/resources-table";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";

export default async function AdminResourcesPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}) {
    const params = await searchParams;
    const query = params.q || "";
    const status = params.status || "ALL";
    const page = parseInt(params.page || "1");

    const result = await getAdminResources({
        search: query,
        status: status,
        page: page,
        limit: 20,
    });

    const resources = result.success ? result.data : [];
    const metadata = result.success ? result.metadata : { total: 0, page: 1, totalPages: 1 };

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

            <div className="flex items-center justify-between gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search resources..."
                        className="pl-8"
                        defaultValue={query}
                    />
                </div>
                {/* Filter logic could be added here */}
            </div>

            <ResourcesTable resources={resources} />

            {/* Pagination could be added here */}
        </div>
    );
}
