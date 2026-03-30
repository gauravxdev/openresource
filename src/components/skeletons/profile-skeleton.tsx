import { Skeleton } from "@/components/ui/skeleton";

export function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col items-stretch gap-6 lg:flex-row">
        {/* Left Side: Profile & Streak (Takes 60%) */}
        <div className="flex w-full shrink-0 flex-col gap-6 lg:w-3/5">
          {/* Main Profile Card */}
          <div className="border-border/50 bg-card/50 w-full overflow-hidden rounded-xl border backdrop-blur">
            <div className="relative w-full">
              {/* Background Pattern */}
              <div className="from-primary/30 via-primary/5 pointer-events-none absolute inset-x-0 top-0 h-48 rounded-t-xl bg-gradient-to-b to-transparent sm:h-56" />
              <div className="pointer-events-none absolute inset-x-0 top-0 h-48 rounded-t-xl bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.3),transparent_70%)] sm:h-56" />

              <div className="relative px-6 pt-8 pb-6">
                <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:items-center sm:text-left md:flex-col md:items-center md:text-center xl:flex-row xl:items-center xl:text-left">
                  {/* Profile Image */}
                  <Skeleton className="h-24 w-24 shrink-0 rounded-full sm:h-28 sm:w-28" />

                  {/* Name and Email */}
                  <div className="flex w-full min-w-0 flex-1 flex-col items-center space-y-3 text-center sm:items-start sm:text-left md:items-center md:text-center xl:items-start xl:text-left">
                    <div className="flex w-full flex-col items-center space-y-1.5 sm:items-start md:items-center xl:items-start">
                      <Skeleton className="h-8 w-48" />
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-4 rounded-sm" />
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-5 w-16 rounded-full" />
                      </div>
                    </div>

                    {/* Quick Stats Row */}
                    <div className="flex flex-wrap items-center justify-center gap-3 pt-2 sm:justify-start md:justify-center xl:justify-start">
                      <Skeleton className="h-7 w-32 rounded-full" />
                      <Skeleton className="h-7 w-20 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Streak Section */}
            <div className="px-6 pb-6">
              <div className="from-background to-muted/30 border-border/50 relative overflow-hidden rounded-2xl border bg-gradient-to-r p-5">
                <div className="from-primary/5 absolute top-0 right-0 h-32 w-32 rounded-bl-full bg-gradient-to-bl to-transparent" />

                <div className="relative flex flex-col items-center gap-6 sm:flex-row sm:justify-between sm:gap-4">
                  <div className="flex w-full flex-col items-center justify-center gap-4 text-center sm:w-auto sm:flex-row sm:justify-start sm:text-left md:flex-col md:text-center xl:flex-row xl:text-left">
                    {/* Flame icon */}
                    <Skeleton className="h-14 w-14 shrink-0 rounded-2xl" />

                    <div className="flex flex-col items-center text-center sm:items-start sm:text-left md:items-center md:text-center xl:items-start xl:text-left">
                      <div className="flex items-baseline gap-2">
                        <Skeleton className="h-10 w-12" />
                        <Skeleton className="h-5 w-20" />
                      </div>
                      <Skeleton className="mt-1 h-4 w-52" />
                    </div>
                  </div>

                  {/* Longest Streak Badge */}
                  <Skeleton className="hidden h-16 w-20 rounded-xl sm:flex sm:flex-col" />
                </div>

                {/* Streak Progress Bar */}
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between">
                    <Skeleton className="h-3 w-12" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                  <Skeleton className="h-2 w-full rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Profile Details (Takes remaining 40%) */}
        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <div className="border-border/50 bg-card/50 flex h-full flex-col rounded-xl border backdrop-blur">
            {/* Card Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-3">
              <div className="space-y-1">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-28" />
              </div>
              <Skeleton className="h-9 w-28 rounded-md" />
            </div>

            {/* Card Content - 3 Fields */}
            <div className="space-y-4 px-6 pb-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="border-border/40 bg-muted/20 flex items-center gap-4 rounded-xl border p-4"
                >
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Contributor Dashboard + Activity Calendar */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Contributor Dashboard */}
        <div className="border-border/50 bg-card/50 rounded-xl border backdrop-blur">
          {/* Card Header */}
          <div className="flex items-center justify-between px-6 pt-6 pb-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-lg" />
              <div className="space-y-1">
                <Skeleton className="h-6 w-44" />
                <Skeleton className="h-3 w-28" />
              </div>
            </div>
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>

          {/* Card Content */}
          <div className="space-y-4 px-6 pb-6">
            {/* Resource Stats */}
            <div className="grid grid-cols-3 gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="border-border/40 bg-muted/10 rounded-xl border p-4 text-center"
                >
                  <Skeleton className="mx-auto h-8 w-10" />
                  <Skeleton className="mx-auto mt-1 h-3 w-12" />
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {Array.from({ length: 2 }).map((_, i) => (
                <div
                  key={i}
                  className="border-border/40 bg-muted/20 flex items-center justify-between rounded-xl border p-3"
                >
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded-sm" />
                    <Skeleton className="h-4 w-28" />
                  </div>
                  <Skeleton className="h-3 w-3 rounded-sm" />
                </div>
              ))}
            </div>

            {/* AI Chat Action */}
            <div className="flex items-center justify-between rounded-xl border border-purple-500/20 bg-purple-500/5 p-3">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded-sm" />
                <Skeleton className="h-4 w-28" />
              </div>
              <Skeleton className="h-3 w-3 rounded-sm" />
            </div>
          </div>
        </div>

        {/* Activity Calendar */}
        <div className="border-border/50 bg-card/50 rounded-xl border backdrop-blur">
          {/* Card Header */}
          <div className="flex items-center justify-between px-6 pt-6 pb-3">
            <div>
              <Skeleton className="h-6 w-36" />
              <Skeleton className="mt-1 h-4 w-48" />
            </div>
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>

          {/* Card Content - Calendar Grid */}
          <div className="px-6 pb-6">
            <div className="flex flex-col gap-2 pt-2">
              <div className="flex items-start gap-4 overflow-hidden">
                {/* Day labels */}
                <div className="mt-6 grid grid-rows-7 gap-1.5 py-0.5">
                  {Array.from({ length: 7 }).map((_, i) => (
                    <Skeleton key={i} className="h-3 w-6" />
                  ))}
                </div>

                {/* Calendar grid */}
                <div className="flex-1">
                  {/* Month labels */}
                  <div className="mb-2 flex gap-2">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <Skeleton key={i} className="h-3 w-6" />
                    ))}
                  </div>

                  {/* Cells grid */}
                  <div className="grid grid-flow-col grid-rows-7 gap-1.5">
                    {Array.from({ length: 182 }).map((_, i) => (
                      <Skeleton key={i} className="h-3 w-3 rounded-[2px]" />
                    ))}
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="mt-1 flex items-center gap-2">
                <Skeleton className="h-2 w-6" />
                <div className="flex gap-1">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-2 w-2 rounded-[1px]" />
                  ))}
                </div>
                <Skeleton className="h-2 w-6" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
