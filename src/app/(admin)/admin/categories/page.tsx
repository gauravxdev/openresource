import { getAdminCategories } from "@/actions/categories";
import { CategoriesTable } from "@/components/admin/categories-table";
import { AdminSearch } from "@/components/admin/admin-search";
import { AdminPagination } from "@/components/admin/admin-pagination";

export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}) {
  const params = await searchParams;
  const query = params.q ?? "";
  const status = params.status ?? "ALL";
  const page = parseInt(params.page ?? "1");

  const result = await getAdminCategories({
    search: query,
    status: status,
    page: page,
    limit: 20,
  });

  const categories = result.success ? result.data : [];
  const metadata =
    result.success && result.metadata
      ? result.metadata
      : { total: 0, page: 1, totalPages: 1 };

  return (
    <div className="mx-auto w-full max-w-7xl flex-1 space-y-4 overflow-y-auto p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Categories</h2>
          <p className="text-muted-foreground">
            Review and manage category submissions.
          </p>
        </div>
      </div>

      <div className="mb-4 flex flex-col items-center gap-4 sm:flex-row">
        <AdminSearch defaultValue={query} />
        <div className="flex gap-2">
          {["ALL", "PENDING", "APPROVED", "REJECTED"].map((s) => (
            <a
              key={s}
              href={`/admin/categories?status=${s}${query ? `&q=${query}` : ""}`}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                status === s
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {s}
            </a>
          ))}
        </div>
      </div>

      <CategoriesTable categories={categories} />

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
