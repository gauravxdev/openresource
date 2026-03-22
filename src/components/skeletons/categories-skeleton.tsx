import { Skeleton } from "@/components/ui/skeleton";

export function CategoriesSkeleton() {
  return (
    <div className="bg-background min-h-screen w-full">
      <div className="mx-auto max-w-6xl px-5 pt-12 pb-20 md:px-6">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2">
          <Skeleton className="h-5 w-12" />
          <Skeleton className="h-5 w-1" />
          <Skeleton className="h-5 w-24" />
        </div>

        {/* Title Section */}
        <div className="mb-12 space-y-3">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-9 w-80" />
          <Skeleton className="h-6 w-96" />
        </div>

        {/* Category Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className="border-border bg-card flex items-center justify-between rounded-xl border p-4"
            >
              <div className="flex flex-col gap-2">
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-4 w-4 rounded-sm" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
