import { Skeleton } from "@/components/ui/skeleton";

export default function FeedbackLoading() {
  return (
    <main className="bg-background w-full flex-1 space-y-8 overflow-auto p-4 sm:p-6">
      <div>
        <Skeleton className="h-8 w-64" />
        <Skeleton className="mt-2 h-4 w-96" />
      </div>

      {/* Summary Cards Skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-card rounded-lg border p-6">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="mt-2 h-8 w-20" />
          </div>
        ))}
      </div>

      {/* Charts Skeleton */}
      <div className="grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="bg-card rounded-lg border p-6">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="mt-4 h-64 w-full" />
          </div>
        ))}
      </div>

      {/* Table Skeleton */}
      <div className="bg-card rounded-lg border p-6">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="mt-4 h-64 w-full" />
      </div>
    </main>
  );
}
