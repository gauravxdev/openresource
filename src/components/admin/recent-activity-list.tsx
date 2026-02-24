"use client";

import { Activity } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export function RecentActivityList({ activities }: { activities: any[] }) {
    return (
        <div className="flex-1 bg-card text-card-foreground rounded-xl border flex flex-col min-h-[400px]">
            <div className="p-4 sm:p-6 border-b flex-none">
                <h3 className="text-lg font-semibold">Recent Activity</h3>
                <p className="text-sm text-muted-foreground mt-1">
                    System logs and notifications.
                </p>
            </div>
            <div className="p-4 sm:p-6 flex-1 overflow-y-auto min-h-0">
                <div className="space-y-6 max-w-[calc(100vw-4rem)]">
                    {activities?.map((activity, index) => (
                        <div key={activity.id || index} className="flex gap-4">
                            <div className="relative mt-1 flex-none">
                                <div className="absolute inset-x-0 -bottom-6 top-6 flex justify-center w-8">
                                    {index !== activities.length - 1 && (
                                        <div className="w-px bg-border h-full" />
                                    )}
                                </div>
                                <div className="relative flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
                                    <Activity className="size-4" />
                                </div>
                            </div>
                            <div className="flex-1 space-y-1 overflow-hidden min-w-0">
                                <p className="text-sm font-medium leading-none shrink-0 break-words line-clamp-2">
                                    {activity.action}
                                </p>
                                <p className="text-sm text-muted-foreground break-words line-clamp-1">
                                    {activity.details && typeof activity.details === 'object'
                                        ? JSON.stringify(activity.details)
                                        : (activity.details || 'System event')}
                                </p>
                                <p className="text-xs text-muted-foreground shrink-0 pt-1">
                                    {formatDistanceToNow(new Date(activity.createdAt), {
                                        addSuffix: true,
                                    })}
                                </p>
                            </div>
                        </div>
                    ))}
                    {(!activities || activities.length === 0) && (
                        <div className="text-center py-6 text-muted-foreground">
                            No recent activity found.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
