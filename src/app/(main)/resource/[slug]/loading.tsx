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
            {/* Stats Card Skeleton */}
            <div className="rounded-lg border border-neutral-200 bg-white/80 p-6 backdrop-blur-sm dark:border-neutral-800 dark:bg-neutral-900/80">
              <Skeleton className="mb-4 h-5 w-32" />
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Skeleton className="h-4 w-4 rounded-sm" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                    <Skeleton className="h-4 w-12" />
                  </div>
                ))}
                <Skeleton className="mt-4 h-8 w-full rounded-md" />
              </div>
            </div>

            {/* Contributors Card Skeleton */}
            <div className="rounded-lg border border-neutral-200 bg-white/80 p-6 backdrop-blur-sm dark:border-neutral-800 dark:bg-neutral-900/80">
              <Skeleton className="mb-4 h-5 w-28" />
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="ml-auto h-3 w-8" />
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>

        {/* Similar Resources Skeleton */}
        <section className="mt-12 border-t border-neutral-200 pt-12 dark:border-neutral-800">
          <div className="mb-8">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="mt-2 h-5 w-64" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
              >
                <div className="flex items-start gap-3">
                  <Skeleton className="h-10 w-10 shrink-0 rounded-lg" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
