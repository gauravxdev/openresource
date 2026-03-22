import { Skeleton } from "@/components/ui/skeleton";

interface AppListSkeletonProps {
  pageName?: string;
  cardCount?: number;
}

export function AppListSkeleton({
  pageName: _pageName = "Apps",
  cardCount = 6,
}: AppListSkeletonProps) {
  return (
    <div className="bg-background min-h-screen w-full">
      <div className="mx-auto max-w-[1152px] px-5 pt-8 pb-20 md:px-6 md:pt-12">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2">
          <Skeleton className="h-5 w-12" />
          <Skeleton className="h-5 w-1" />
          <Skeleton className="h-5 w-24" />
        </div>

        {/* Title & Description */}
        <div className="mb-8 space-y-2">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-5 w-80" />
        </div>

        {/* Search & Sort Filters */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row">
          <Skeleton className="h-10 flex-1 rounded-md" />
          <Skeleton className="h-10 w-[180px] rounded-md" />
        </div>

        {/* Results Summary */}
        <div className="mb-4 flex items-center justify-between">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>

        {/* Card Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: cardCount }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-lg" />
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
  );
}
