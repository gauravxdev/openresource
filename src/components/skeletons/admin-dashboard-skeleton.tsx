import { Skeleton } from "@/components/ui/skeleton";
import { StatCardSkeleton, ActivityItemSkeleton } from "./skeleton-primitives";

export function AdminDashboardSkeleton() {
  return (
    <main className="bg-background w-full flex-1 space-y-6 overflow-auto p-4 sm:p-6">
      {/* Welcome Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Skeleton className="mb-1 h-8 w-52" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-28 rounded-md" />
          <Skeleton className="h-9 w-28 rounded-md" />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      {/* Recent Resources + Activity */}
      <div className="flex flex-col gap-4 sm:gap-6 lg:flex-row">
        {/* Recent Resources Table */}
        <div className="bg-card text-card-foreground flex-1 overflow-hidden rounded-xl border">
          <div className="border-b p-4 sm:p-6">
            <Skeleton className="mb-1 h-6 w-36" />
            <Skeleton className="h-4 w-52" />
          </div>
          <div className="space-y-4 p-4 sm:p-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between gap-4">
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-card text-card-foreground flex min-h-[400px] flex-1 flex-col rounded-xl border">
          <div className="flex-none border-b p-4 sm:p-6">
            <Skeleton className="mb-1 h-6 w-32" />
            <Skeleton className="h-4 w-44" />
          </div>
          <div className="flex-1 space-y-6 p-4 sm:p-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <ActivityItemSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
