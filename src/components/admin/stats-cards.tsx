/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
"use client";

import {
    FileText,
    Users,
    Clock,
    Mail,
} from "lucide-react";

export function StatsCards({ data }: { data: any }) {
    const stats = [
        {
            title: "Total Resources",
            value: data?.totalResources ?? 0,
            icon: FileText,
        },
        {
            title: "Total Users",
            value: data?.totalUsers ?? 0,
            icon: Users,
        },
        {
            title: "Pending Approvals",
            value: data?.pendingSubmissions ?? 0,
            icon: Clock,
        },
        {
            title: "Subscribers",
            value: data?.totalSubscribers ?? 0,
            icon: Mail,
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
                <div
                    key={index}
                    className="bg-card text-card-foreground rounded-xl border p-4"
                >
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium">{stat.title}</span>
                        <stat.icon className="size-4 text-muted-foreground" />
                    </div>

                    <div className="bg-muted/50 dark:bg-neutral-800/50 border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <span className="text-2xl sm:text-3xl font-medium tracking-tight">
                                {stat.value}
                            </span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
