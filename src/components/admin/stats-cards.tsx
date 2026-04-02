/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
"use client";

import { FileText, Users, Clock, Flag } from "lucide-react";

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
      title: "Pending Reports",
      value: data?.totalPendingReports ?? 0,
      icon: Flag,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-card text-card-foreground rounded-xl border p-4"
        >
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-medium">{stat.title}</span>
            <stat.icon className="text-muted-foreground size-4" />
          </div>

          <div className="bg-muted/50 rounded-lg border p-4 dark:bg-neutral-800/50">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-medium tracking-tight sm:text-3xl">
                {stat.value}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
