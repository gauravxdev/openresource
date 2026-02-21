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

export default async function AuditLogsPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string }>;
}) {
    const params = await searchParams;
    const page = parseInt(params.page ?? "1", 10);
    const result = await getAuditLogs(page, 50);

    if (!result.success || !result.data) {
        return (
            <div className="flex flex-col items-center justify-center p-8 w-full h-full text-center">
                <h1 className="text-2xl font-bold mb-2">Audit Logs</h1>
                <p className="text-muted-foreground">Status: Failed to fetch logs</p>
                <p className="text-sm text-red-500 mt-2">{result.error}</p>
            </div>
        );
    }

    const { logs, metadata } = result.data;

    return (
        <main className="flex-1 overflow-auto p-4 sm:p-6 space-y-6 bg-background w-full">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Audit Logs</h1>
                <p className="text-muted-foreground">
                    A comprehensive trail of all critical administrative and user actions across the platform.
                </p>
            </div>

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
                        {logs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    No audit logs found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            logs.map((log) => (
                                <TableRow key={log.id}>
                                    <TableCell className="font-medium">
                                        {formatDistanceToNow(new Date(log.createdAt), {
                                            addSuffix: true,
                                        })}
                                    </TableCell>
                                    <TableCell>
                                        <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                                            {log.action}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {log.userId ? (
                                            <span className="font-mono text-xs">{log.userId}</span>
                                        ) : (
                                            <span className="text-muted-foreground italic">System</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {log.resourceId ? (
                                            <span className="font-mono text-xs">{log.resourceId}</span>
                                        ) : (
                                            <span className="text-muted-foreground">-</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="max-w-[300px] truncate">
                                        {log.details ? (
                                            <pre className="text-xs truncate">{JSON.stringify(log.details)}</pre>
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

            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                    Showing {logs.length} of {metadata.total} logs (Page {metadata.page} of {metadata.totalPages})
                </p>
                {/* Basic pagination controls could go here */}
            </div>
        </main>
    );
}
