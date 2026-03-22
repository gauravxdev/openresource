import { Skeleton } from "@/components/ui/skeleton";
import {
  MetricCardSkeleton,
  ProgressBarSkeleton,
  ResourceListItemSkeleton,
} from "./skeleton-primitives";

export function ContributorAnalyticsSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Skeleton className="mb-1 h-8 w-28" />
        <Skeleton className="h-4 w-72" />
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <MetricCardSkeleton key={i} />
        ))}
      </div>

      {/* Status Breakdown */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-36" />

        <div className="space-y-6">
          {/* Visual Bar */}
          <ProgressBarSkeleton />

          {/* Resource Lists */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Skeleton className="size-4 rounded-sm" />
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="grid gap-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <ResourceListItemSkeleton key={i} />
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Skeleton className="size-4 rounded-sm" />
              <Skeleton className="h-4 w-28" />
            </div>
            <div className="grid gap-2">
              {Array.from({ length: 2 }).map((_, i) => (
                <ResourceListItemSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
