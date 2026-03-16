"use client";

import { Eye } from "lucide-react";

interface TopResource {
    name: string;
    views: number;
}

interface TopResourcesTableProps {
    resources: TopResource[];
    isConfigured: boolean;
}

export function TopResourcesTable({ resources, isConfigured }: TopResourcesTableProps) {
    if (!isConfigured) {
        return null;
    }

    return (
        <div className="rounded-lg border bg-card">
            <div className="p-6 border-b">
                <h3 className="text-lg font-semibold">Top Viewed Resources</h3>
                <p className="text-sm text-muted-foreground">Most popular posts in the last 30 days</p>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs uppercase bg-muted/50 text-muted-foreground">
                        <tr>
                            <th className="px-6 py-3 font-medium">Resource Name</th>
                            <th className="px-6 py-3 font-medium text-right">Views</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {resources.length > 0 ? (
                            resources.map((resource, index) => (
                                <tr key={index} className="hover:bg-muted/30 transition-colors">
                                    <td className="px-6 py-4 font-medium">{resource.name}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 text-primary font-bold">
                                            <Eye className="size-3" />
                                            {resource.views.toLocaleString()}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={2} className="px-6 py-12 text-center text-muted-foreground">
                                    No data available. Visitors need to view resources first.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
