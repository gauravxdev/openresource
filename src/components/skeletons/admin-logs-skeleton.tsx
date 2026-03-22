import { Skeleton } from "@/components/ui/skeleton";
import { PaginationSkeleton } from "./skeleton-primitives";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function AdminLogsSkeleton() {
  return (
    <main className="bg-background w-full flex-1 space-y-6 overflow-auto p-4 sm:p-6">
      {/* Header */}
      <div>
        <Skeleton className="mb-2 h-8 w-32" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Logs Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[150px]">Date</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>User ID</TableHead>
              <TableHead>Resource ID</TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 10 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-20 rounded-full" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-3.5 w-28" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-3.5 w-28" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-3.5 w-40" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-48" />
      </div>
    </main>
  );
}
