/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument */
"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

export function RecentResourcesTable({ resources }: { resources: any[] }) {
    return (
        <div className="flex-1 bg-card text-card-foreground rounded-xl border overflow-hidden">
            <div className="p-4 sm:p-6 border-b">
                <h3 className="text-lg font-semibold">Recent Resources</h3>
                <p className="text-sm text-muted-foreground mt-1">
                    Most recently submitted resources.
                </p>
            </div>
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Added</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {resources?.map((resource) => (
                            <TableRow key={resource.id}>
                                <TableCell className="font-medium">
                                    {resource.name}
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant={
                                            resource.status === "APPROVED"
                                                ? "default"
                                                : "secondary"
                                        }
                                    >
                                        {resource.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                    {formatDistanceToNow(new Date(resource.createdAt), {
                                        addSuffix: true,
                                    })}
                                </TableCell>
                            </TableRow>
                        ))}
                        {(!resources || resources.length === 0) && (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center py-6 text-muted-foreground">
                                    No recent resources found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
