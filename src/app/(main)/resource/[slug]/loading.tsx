import { Skeleton } from "@/components/ui/skeleton";

export default function ResourceLoading() {
  return (
    <div className="bg-background min-h-screen w-full">
      <div className="mx-auto max-w-[1152px] px-5 pt-4 pb-20 md:px-6 md:pt-6">
        {/* Breadcrumb Skeleton */}
        <div className="mb-2">
          <Skeleton className="h-5 w-48" />
        </div>

        {/* Back button Skeleton */}
        <div className="mb-6">
          <Skeleton className="h-8 w-36" />
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px] lg:gap-12">
          {/* Main Content Area */}
          <div className="space-y-8">
            {/* Header */}
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                {/* Logo Skeleton */}
                <Skeleton className="h-16 w-16 shrink-0 rounded-full" />
                <div className="min-w-0 flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-9 w-56" />
                    <Skeleton className="h-6 w-24" />
                  </div>
                  <Skeleton className="h-6 w-80" />
                </div>
              </div>

              {/* Action Buttons Skeleton */}
              <div className="flex flex-wrap gap-3 pt-4">
                <Skeleton className="h-9 w-36" />
                <Skeleton className="h-9 w-40" />
              </div>
            </div>

            {/* Description Skeleton */}
            <div className="space-y-3">
              <Skeleton className="h-7 w-24" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>

            {/* Categories Skeleton */}
            <div className="space-y-3 border-t border-neutral-200 pt-8 dark:border-neutral-800">
              <Skeleton className="h-4 w-28" />
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-7 w-24 rounded-full" />
                <Skeleton className="h-7 w-32 rounded-full" />
                <Skeleton className="h-7 w-20 rounded-full" />
              </div>
            </div>

            {/* Tags Skeleton */}
            <div className="space-y-3">
              <Skeleton className="h-4 w-16" />
              <div className="flex flex-wrap gap-x-3 gap-y-2">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-14" />
                <Skeleton className="h-5 w-18" />
                <Skeleton className="h-5 w-12" />
              </div>
            </div>

            {/* Built with Skeleton */}
            <div className="space-y-3">
              <Skeleton className="h-4 w-24" />
              <div className="flex flex-wrap gap-3">
                <Skeleton className="h-8 w-28 rounded-md" />
                <Skeleton className="h-8 w-24 rounded-md" />
                <Skeleton className="h-8 w-32 rounded-md" />
              </div>
            </div>

            {/* Share Section Skeleton */}
            <div className="pt-2">
              <Skeleton className="h-10 w-full max-w-sm rounded-md" />
            </div>

            {/* Contributor Skeleton */}
            <div className="flex items-center gap-3 border-t border-neutral-200 pt-6 dark:border-neutral-800">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-10 w-40 rounded-full" />
            </div>
          </div>

          {/* Sidebar Skeleton */}
          <aside className="sticky top-24 h-fit space-y-6 self-start">
            <Skeleton className="h-64 w-full rounded-lg" />
          </aside>
        </div>
      </div>
    </div>
  );
}
