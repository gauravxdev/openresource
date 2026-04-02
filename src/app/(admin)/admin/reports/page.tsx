import { getAdminReports } from "@/actions/admin/reports";
import { ReportsTable } from "@/components/admin/reports-table";
import { AdminPagination } from "@/components/admin/admin-pagination";

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  const params = await searchParams;
  const status = params.status ?? "ALL";
  const page = parseInt(params.page ?? "1");

  const result = await getAdminReports({
    status,
    page,
    limit: 20,
  });

  const reports = result.success ? result.data : [];
  const metadata =
    result.success && result.metadata
      ? result.metadata
      : { total: 0, page: 1, totalPages: 1 };

  return (
    <div className="mx-auto w-full max-w-7xl flex-1 space-y-4 overflow-y-auto p-4 pt-6 md:p-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Reports</h2>
        <p className="text-muted-foreground">
          User-submitted issues and feedback on resources.
        </p>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-sm font-medium">Status:</span>
        <div className="flex gap-2">
          {["ALL", "PENDING", "RESOLVED", "DISMISSED"].map((s) => (
            <a
              key={s}
              href={`/admin/reports?status=${s}`}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                status === s
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {s.charAt(0) + s.slice(1).toLowerCase()}
            </a>
          ))}
        </div>
      </div>

      <ReportsTable reports={reports} />

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
