import { Skeleton } from "@/components/ui/skeleton";


export function AdminAnalyticsSkeleton() {
  return (
    <main className="bg-background w-full flex-1 space-y-8 overflow-auto p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <Skeleton className="mb-2 h-8 w-52" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-5 w-44" />
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-card rounded-lg border p-6">
            <div className="mb-2 flex items-center gap-2">
              <Skeleton className="size-4 rounded-sm" />
              <Skeleton className="h-4 w-28" />
            </div>
            <Skeleton className="h-9 w-20" />
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="space-y-6">
        <div className="bg-card rounded-lg border p-6">
          <Skeleton className="mb-4 h-6 w-40" />
          <Skeleton className="h-[300px] w-full rounded-md" />
        </div>
      </div>

      {/* Traffic + Top Resources */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="bg-card rounded-lg border p-6">
          <Skeleton className="mb-4 h-6 w-36" />
          <Skeleton className="h-[250px] w-full rounded-md" />
        </div>
        <div className="bg-card rounded-lg border p-6">
          <Skeleton className="mb-4 h-6 w-36" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
