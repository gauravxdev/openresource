import { Skeleton } from "@/components/ui/skeleton";

function TagCardSkeleton() {
  return (
    <div className="border-border/50 bg-background/60 flex items-center justify-between rounded-2xl border px-5 py-4">
      <Skeleton className="h-5 w-24 rounded-md" />
      <Skeleton className="h-6 w-10 rounded-full" />
    </div>
  );
}

export function TagsSkeleton() {
  return (
    <div className="bg-background min-h-screen w-full">
      <div className="mx-auto max-w-[1152px] px-4 pt-6 pb-20 md:px-6">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2">
          <Skeleton className="h-5 w-12" />
          <Skeleton className="h-5 w-1" />
          <Skeleton className="h-5 w-10" />
        </div>

        {/* Title Section */}
        <div className="mb-10 space-y-3">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-10 w-80 md:h-12 md:w-[420px]" />
          <Skeleton className="h-6 w-full max-w-2xl md:h-7" />
        </div>

        {/* Search & Sort Filters */}
        <div className="space-y-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <Skeleton className="h-11 w-full rounded-full md:max-w-md" />
            <div className="flex items-center gap-3">
              <Skeleton className="h-11 w-20 rounded-full" />
              <Skeleton className="h-11 w-[180px] rounded-full" />
            </div>
          </div>

          {/* A-Z Letter Filter Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:justify-between">
            {Array.from({ length: 28 }).map((_, i) => (
              <Skeleton key={i} className="h-7 w-8 rounded-full" />
            ))}
          </div>
        </div>

        {/* Tag Card Grid */}
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 20 }).map((_, i) => (
            <TagCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function TagResourcesSkeleton() {
  return (
    <div className="bg-background min-h-screen w-full">
      <div className="mx-auto max-w-[1152px] px-4 pt-6 pb-20 md:px-6">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2">
          <Skeleton className="h-5 w-12" />
          <Skeleton className="h-5 w-1" />
          <Skeleton className="h-5 w-10" />
          <Skeleton className="h-5 w-1" />
          <Skeleton className="h-5 w-20" />
        </div>

        {/* Title Section */}
        <div className="mb-10 space-y-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded-sm" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
          </div>
          <Skeleton className="h-10 w-64 md:h-12 md:w-80" />
          <Skeleton className="h-6 w-full max-w-2xl md:h-7" />
        </div>

        {/* Back Button */}
        <div className="mb-6">
          <Skeleton className="h-10 w-28 rounded-full" />
        </div>

        {/* Resource Cards Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <ResourceCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

function ResourceCardSkeleton() {
  return (
    <div className="border-neutral-150 relative flex h-full flex-col gap-0 overflow-hidden rounded-[12px] border bg-transparent p-0 dark:border-neutral-800">
      <div className="pointer-events-none absolute inset-[2px] rounded-[10px] bg-neutral-50 dark:bg-[#141414]" />
      <div className="relative flex h-full flex-col p-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 shrink-0 rounded-[8px]" />
          <div className="flex flex-1 items-center">
            <Skeleton className="h-5 w-32" />
          </div>
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>

        <div className="relative mt-2 flex-1">
          <div className="flex h-full flex-col">
            <div className="flex-1">
              <Skeleton className="h-[1.4rem] w-full" />
              <Skeleton className="mt-1 h-[1.4rem] w-3/4" />
            </div>

            <div className="mt-4 flex flex-col gap-1.5 border-t border-neutral-100 pt-3 dark:border-neutral-800/50">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="flex flex-1 items-center gap-2">
                    <Skeleton className="h-3.5 w-3.5 rounded-sm" />
                    <Skeleton className="h-3 w-12" />
                    <div className="mx-1 h-px min-w-[20px] flex-1" />
                  </div>
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
