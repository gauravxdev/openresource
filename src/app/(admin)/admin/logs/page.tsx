import { getAuditLogs } from "@/actions/admin/db-stats";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDistanceToNow } from "date-fns";
import { ActionBadge } from "@/components/admin/ActionBadge";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default async function AuditLogsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page ?? "1", 10);
  const result = await getAuditLogs(page, 20);

  if (!result.success || !result.data) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center p-8 text-center">
        <h1 className="mb-2 text-2xl font-bold">Audit Logs</h1>
        <p className="text-muted-foreground">Status: Failed to fetch logs</p>
        <p className="mt-2 text-sm text-red-500">{result.error}</p>
      </div>
    );
  }

  const { logs, metadata } = result.data;

  const PaginationControls = ({ className }: { className?: string }) => (
    <div className={cn("flex items-center justify-between gap-4", className)}>
      <div className="flex items-center gap-2">
        <Link
          href={`/admin/logs?page=${page - 1}`}
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-md border bg-background transition-colors hover:bg-muted",
            page <= 1 && "pointer-events-none opacity-50"
          )}
          aria-disabled={page <= 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Link>
        <div className="text-xs font-medium">
          Page {metadata.page} of {metadata.totalPages}
        </div>
        <Link
          href={`/admin/logs?page=${page + 1}`}
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-md border bg-background transition-colors hover:bg-muted",
            page >= metadata.totalPages && "pointer-events-none opacity-50"
          )}
          aria-disabled={page >= metadata.totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="text-muted-foreground text-[10px] hidden sm:block">
        Total {metadata.total} logs
      </div>
    </div>
  );

  return (
    <main className="bg-background w-full flex-1 space-y-4 overflow-auto p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Audit Logs</h1>
          <p className="text-muted-foreground text-sm">
            Trail of administrative and user actions.
          </p>
        </div>
        <PaginationControls />
      </div>

      <div className="rounded-md border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 border-b">
                <TableHead className="w-[150px] whitespace-nowrap">Date</TableHead>
                <TableHead className="w-[80px] text-center">Action</TableHead>
                <TableHead className="min-w-[180px]">User</TableHead>
                <TableHead className="min-w-[120px]">IP Address</TableHead>
                <TableHead className="min-w-[120px]">Resource ID</TableHead>
                <TableHead className="min-w-[300px]">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No audit logs found.
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id} className="hover:bg-muted/30 transition-colors border-b last:border-0 h-14">
                    <TableCell className="font-medium whitespace-nowrap text-[10px] text-muted-foreground">
                      {formatDistanceToNow(new Date(log.createdAt), {
                        addSuffix: true,
                      })}
                    </TableCell>
                    <TableCell className="text-center py-2">
                      <ActionBadge action={log.action} />
                    </TableCell>
                    <TableCell className="py-2">
                      {log.user ? (
                        <div className="flex items-center gap-2">
                          <Avatar className="h-7 w-7 border">
                            {log.user.image && (
                              <AvatarImage
                                src={log.user.image}
                                alt={log.user.name ?? ""}
                              />
                            )}
                            <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-bold">
                              {log.user.name?.slice(0, 2).toUpperCase() ?? "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="text-xs font-semibold leading-none">
                              {log.user.name ?? "Anonymous"}
                            </span>
                            <span className="text-[10px] text-muted-foreground truncate max-w-[120px]">
                              {log.user.email}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 opacity-70">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted border border-border/50">
                            <span className="text-[10px] font-bold">S</span>
                          </div>
                          <span className="text-xs font-semibold italic text-muted-foreground">
                            System
                          </span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="py-2">
                      {log.ipAddress ? (
                        <span className="font-mono text-[9px] text-muted-foreground">
                          {log.ipAddress}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="py-2">
                      {log.resourceId ? (
                        <span className="font-mono text-[9px] bg-muted/50 px-1.5 py-0.5 rounded select-all border border-border/30">
                          {log.resourceId}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="max-w-[400px] py-2">
                      {log.details ? (
                        <div className="group relative">
                          <pre className="truncate text-[9px] font-mono bg-muted/30 p-1 rounded border border-border/30 max-h-[60px] overflow-hidden group-hover:overflow-auto transition-all">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex items-center justify-between pb-8">
        <p className="text-muted-foreground text-xs">
          Showing {logs.length} logs
        </p>
        <PaginationControls />
      </div>
    </main>
  );
}
