import { Skeleton } from "@/components/ui/skeleton";

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

interface LatestResourcesSkeletonProps {
  cardCount?: number;
}

export function LatestResourcesSkeleton({
  cardCount = 6,
}: LatestResourcesSkeletonProps) {
  return (
    <div className="mx-auto max-w-[1152px] px-4 py-8 md:px-6 md:py-12">
      <div className="mb-8 text-center md:mb-12 md:text-left">
        <Skeleton className="mb-3 h-9 w-56" />
        <Skeleton className="h-6 w-full max-w-3xl" />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: cardCount }).map((_, i) => (
          <div key={i} className="h-full">
            <ResourceCardSkeleton />
          </div>
        ))}
      </div>
    </div>
  );
}
