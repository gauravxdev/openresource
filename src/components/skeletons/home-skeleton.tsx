import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

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

function HeroSectionSkeleton() {
  return (
    <section className="flex flex-col items-center px-4 pt-12 text-center md:pt-16">
      {/* NotificationButton skeleton - matches pill with sparkles icon + text + arrow */}
      <div className="mb-4 flex justify-center">
        <div className="flex items-center gap-1.5 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-4 py-1.5 backdrop-blur-sm">
          <Skeleton className="h-4 w-4 shrink-0 rounded-full bg-yellow-500/20" />
          <Skeleton className="h-4 w-36 bg-yellow-500/20" />
          <Skeleton className="h-4 w-4 shrink-0 rounded-full bg-yellow-500/20" />
        </div>
      </div>

      {/* Title & subtitle - title uses text-balance and spans full width */}
      <div className="max-w-4xl space-y-4">
        <div className="mx-auto flex w-full flex-col items-center gap-1 sm:gap-2">
          <Skeleton className="h-8 w-full sm:h-12 md:h-[4.5rem]" />
          <Skeleton className="h-8 w-[80%] sm:h-12 md:h-[4.5rem]" />
        </div>
        <Skeleton className="mx-auto h-5 w-[90%] max-w-lg sm:h-6" />
      </div>

      {/* NewsletterSubscribe skeleton - matches pill with input + button */}
      <div className="mt-12 flex w-full max-w-2xl flex-col items-center gap-4">
        <div className="border-input bg-background flex w-full items-center gap-2 rounded-full border px-2 py-1">
          <Skeleton className="h-10 flex-1 rounded-full" />
          <Skeleton className="h-10 w-[150px] shrink-0 rounded-full sm:w-[170px]" />
        </div>
        <Skeleton className="mb-12 h-4 w-64" />
      </div>
    </section>
  );
}

interface HomeSkeletonProps {
  cardCount?: number;
}

export function HomeSkeleton({ cardCount = 12 }: HomeSkeletonProps) {
  return (
    <div>
      <HeroSectionSkeleton />
      <div className="bg-background min-h-screen w-full">
        <Separator />
        <div className="mx-auto max-w-[1152px] px-5 pt-8 pb-20 md:px-6 md:pt-12">
          {/* Search & Sort Filters */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row">
            <Skeleton className="h-10 flex-1 rounded-md" />
            <Skeleton className="h-10 w-[200px] rounded-md" />
          </div>

          {/* Results Summary */}
          <div className="mb-4 flex items-center justify-between">
            <Skeleton className="h-5 w-52" />
          </div>

          {/* Card Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: cardCount }).map((_, i) => (
              <ResourceCardSkeleton key={i} />
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-8 flex items-center justify-center gap-2">
            <Skeleton className="h-9 w-9 rounded-md" />
            <Skeleton className="h-9 w-9 rounded-md" />
            <Skeleton className="h-9 w-9 rounded-md" />
            <Skeleton className="h-9 w-9 rounded-md" />
            <Skeleton className="h-9 w-9 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}
