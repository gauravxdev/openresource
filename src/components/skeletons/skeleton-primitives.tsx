import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function StatCardSkeleton({ showIcon = true }: { showIcon?: boolean }) {
  return (
    <div className="bg-card text-card-foreground rounded-xl border p-4">
      <div className="mb-3 flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        {showIcon && <Skeleton className="size-4 rounded-sm" />}
      </div>
      <div className="bg-muted/50 rounded-lg border p-4 dark:bg-neutral-800/50">
        <Skeleton className="h-8 w-16" />
      </div>
    </div>
  );
}

export function ContributorStatCardSkeleton() {
  return (
    <div className="border-border/50 bg-card/50 rounded-xl border p-5 backdrop-blur">
      <div className="mb-3 flex items-center gap-3">
        <Skeleton className="size-9 rounded-lg" />
      </div>
      <Skeleton className="h-9 w-14" />
      <Skeleton className="mt-1 h-3.5 w-20" />
    </div>
  );
}

export function TableRowSkeleton({ columns = 4 }: { columns?: number }) {
  return (
    <TableRow>
      {Array.from({ length: columns }).map((_, i) => (
        <TableCell key={i}>
          <Skeleton className="h-4 w-full" />
        </TableCell>
      ))}
    </TableRow>
  );
}

export function TableSkeleton({
  columns,
  columnLabels,
  rows = 5,
  showHeader = true,
}: {
  columns: number;
  columnLabels?: string[];
  rows?: number;
  showHeader?: boolean;
}) {
  return (
    <Table>
      {showHeader && (
        <TableHeader>
          <TableRow>
            {Array.from({ length: columns }).map((_, i) => (
              <TableHead key={i}>
                {columnLabels?.[i] ?? <Skeleton className="h-4 w-16" />}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
      )}
      <TableBody>
        {Array.from({ length: rows }).map((_, i) => (
          <TableRowSkeleton key={i} columns={columns} />
        ))}
      </TableBody>
    </Table>
  );
}

export function SearchBarSkeleton() {
  return <Skeleton className="h-10 flex-1 rounded-md" />;
}

export function FilterButtonSkeleton() {
  return <Skeleton className="h-10 w-[130px] rounded-md" />;
}

export function PaginationSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-9 w-9 rounded-md" />
      ))}
    </div>
  );
}

export function ActivityItemSkeleton() {
  return (
    <div className="flex gap-4">
      <div className="relative mt-1 flex-none">
        <div className="absolute inset-x-0 top-6 -bottom-6 flex w-8 justify-center">
          <div className="bg-border h-full w-px" />
        </div>
        <Skeleton className="size-8 rounded-full" />
      </div>
      <div className="flex-1 space-y-1">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-3.5 w-32" />
        <Skeleton className="h-3 w-20 pt-1" />
      </div>
    </div>
  );
}

export function RecentResourceItemSkeleton() {
  return (
    <div className="border-border/50 bg-card/50 flex flex-col justify-between gap-3 rounded-xl border p-4 backdrop-blur sm:flex-row sm:items-center">
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <Skeleton className="h-3.5 w-56" />
      </div>
      <Skeleton className="h-8 w-8 rounded-md" />
    </div>
  );
}

export function SectionHeaderSkeleton({
  titleWidth = "w-32",
  descWidth = "w-48",
}: {
  titleWidth?: string;
  descWidth?: string;
}) {
  return (
    <div>
      <Skeleton className={`h-8 ${titleWidth} mb-2`} />
      <Skeleton className={`h-4 ${descWidth}`} />
    </div>
  );
}

export function TabsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="bg-muted inline-flex h-10 items-center justify-center gap-1 rounded-md p-1">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-8 w-24 rounded-sm" />
      ))}
    </div>
  );
}

export function BadgeSkeleton({ width = "w-16" }: { width?: string }) {
  return <Skeleton className={`h-5 ${width} rounded-full`} />;
}

export function MetricCardSkeleton() {
  return (
    <div className="border-border/50 bg-card/50 rounded-xl border p-6 backdrop-blur">
      <div className="mb-2 flex items-center gap-2">
        <Skeleton className="size-4 rounded-sm" />
        <Skeleton className="h-4 w-24" />
      </div>
      <Skeleton className="h-10 w-16" />
      <Skeleton className="mt-1 h-3 w-32" />
    </div>
  );
}

export function ProgressBarSkeleton() {
  return (
    <div className="border-border/50 bg-card/50 rounded-xl border p-6 backdrop-blur">
      <Skeleton className="mb-4 h-4 w-full rounded-full" />
      <div className="flex items-center gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <Skeleton className="size-3 rounded-full" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ResourceListItemSkeleton() {
  return (
    <div className="border-border/40 bg-card/30 flex flex-col justify-between gap-3 rounded-lg border p-3 sm:flex-row sm:items-center">
      <div className="min-w-0 flex-1 space-y-1">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-3 w-56" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-5 w-14 rounded-full" />
        <Skeleton className="h-5 w-14 rounded-full" />
      </div>
    </div>
  );
}
